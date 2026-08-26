//! A tiny loopback HTTP server that receives one OAuth redirect.

use std::{
    collections::HashMap,
    io::{Read, Write},
    net::{Ipv4Addr, SocketAddrV4, TcpListener},
    sync::{
        atomic::{AtomicBool, Ordering},
        mpsc, Arc,
    },
    thread,
    time::{Duration, Instant},
};

#[derive(Clone, Debug, Default, PartialEq)]
pub struct CallbackParams {
    pub code: Option<String>,
    pub state: Option<String>,
    pub error: Option<String>,
}

pub struct CallbackServer {
    receiver: mpsc::Receiver<CallbackParams>,
    stop: Arc<AtomicBool>,
    port: u16,
}

impl CallbackServer {
    /// Listens on `127.0.0.1:port` and answers the first request on `path`.
    pub fn start(port: u16, path: &'static str) -> Result<Self, String> {
        let listener =
            TcpListener::bind(SocketAddrV4::new(Ipv4Addr::LOCALHOST, port)).map_err(|_| {
                if port == 0 {
                    "The app could not start a local sign-in callback. Try again.".to_string()
                } else {
                    format!(
                        "Port {port} is busy. Close the other program that uses it, then try again."
                    )
                }
            })?;
        let port = listener
            .local_addr()
            .map_err(|error| error.to_string())?
            .port();
        listener
            .set_nonblocking(true)
            .map_err(|error| error.to_string())?;
        let (sender, receiver) = mpsc::channel();
        let stop = Arc::new(AtomicBool::new(false));
        let stop_flag = stop.clone();
        thread::spawn(move || serve(listener, path, sender, stop_flag));
        Ok(Self {
            receiver,
            stop,
            port,
        })
    }

    /// Returns the selected loopback port.
    pub fn port(&self) -> u16 {
        self.port
    }

    /// Waits for the redirect. Returns `None` on timeout.
    pub fn wait(&self, timeout: Duration) -> Option<CallbackParams> {
        self.receiver.recv_timeout(timeout).ok()
    }
}

impl Drop for CallbackServer {
    fn drop(&mut self) {
        self.stop.store(true, Ordering::Relaxed);
    }
}

fn serve(
    listener: TcpListener,
    path: &str,
    sender: mpsc::Sender<CallbackParams>,
    stop: Arc<AtomicBool>,
) {
    let started = Instant::now();
    while !stop.load(Ordering::Relaxed)
        && started.elapsed() < super::LOGIN_TIMEOUT + Duration::from_secs(30)
    {
        let Ok((mut stream, _)) = listener.accept() else {
            thread::sleep(Duration::from_millis(50));
            continue;
        };
        // Accepted sockets can inherit the listener's non-blocking mode.
        let _ = stream.set_nonblocking(false);
        let _ = stream.set_read_timeout(Some(Duration::from_secs(5)));
        let mut buffer = [0u8; 8192];
        let read = stream.read(&mut buffer).unwrap_or(0);
        let request = String::from_utf8_lossy(&buffer[..read]);
        let Some((request_path, query)) = parse_request_target(&request) else {
            respond(
                &mut stream,
                400,
                "Bad request",
                "The request was not understood.",
            );
            continue;
        };
        if request_path != path {
            respond(
                &mut stream,
                404,
                "Not found",
                "This address is not used by Devie Quota.",
            );
            continue;
        }
        let params = parse_params(query);
        if params.error.is_some() {
            respond(
                &mut stream,
                200,
                "Sign-in cancelled",
                "The provider reported an error. You can close this tab.",
            );
        } else {
            respond(
                &mut stream,
                200,
                "Signed in",
                "You can close this tab and return to Devie Quota.",
            );
        }
        let _ = sender.send(params);
        break;
    }
}

fn parse_request_target(request: &str) -> Option<(&str, &str)> {
    let line = request.lines().next()?;
    let mut parts = line.split(' ');
    let method = parts.next()?;
    if method != "GET" {
        return None;
    }
    let target = parts.next()?;
    Some(target.split_once('?').unwrap_or((target, "")))
}

fn parse_params(query: &str) -> CallbackParams {
    let map = query
        .split('&')
        .filter(|pair| !pair.is_empty())
        .filter_map(|pair| {
            let (key, value) = pair.split_once('=').unwrap_or((pair, ""));
            Some((percent_decode(key)?, percent_decode(value)?))
        })
        .collect::<HashMap<_, _>>();
    CallbackParams {
        code: map.get("code").cloned(),
        state: map.get("state").cloned(),
        error: map
            .get("error_description")
            .or_else(|| map.get("error"))
            .cloned(),
    }
}

fn percent_decode(value: &str) -> Option<String> {
    let bytes = value.as_bytes();
    let mut output = Vec::with_capacity(bytes.len());
    let mut index = 0;
    while index < bytes.len() {
        match bytes[index] {
            b'%' => {
                let hex = bytes.get(index + 1..index + 3)?;
                let text = std::str::from_utf8(hex).ok()?;
                output.push(u8::from_str_radix(text, 16).ok()?);
                index += 3;
            }
            b'+' => {
                output.push(b' ');
                index += 1;
            }
            byte => {
                output.push(byte);
                index += 1;
            }
        }
    }
    String::from_utf8(output).ok()
}

fn respond(stream: &mut std::net::TcpStream, status: u16, title: &str, message: &str) {
    let reason = match status {
        200 => "OK",
        400 => "Bad Request",
        _ => "Not Found",
    };
    let body = format!(
        "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>{title}</title>\
         <style>body{{font-family:-apple-system,system-ui,sans-serif;display:grid;place-items:center;\
         min-height:100vh;margin:0;background:#f5f5f7;color:#1d1d1f}}main{{text-align:center;padding:2rem}}\
         h1{{font-size:1.25rem;font-weight:600}}p{{color:#6e6e73}}</style></head>\
         <body><main><h1>{title}</h1><p>{message}</p></main>\
         <script>setTimeout(()=>window.close(),1500)</script></body></html>"
    );
    let response = format!(
        "HTTP/1.1 {status} {reason}\r\nContent-Type: text/html; charset=utf-8\r\n\
         Content-Length: {}\r\nConnection: close\r\n\r\n{body}",
        body.len()
    );
    let _ = stream.write_all(response.as_bytes());
    let _ = stream.flush();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_code_and_state() {
        let params = parse_params("code=abc%23def&state=xyz&other=1");
        assert_eq!(params.code.as_deref(), Some("abc#def"));
        assert_eq!(params.state.as_deref(), Some("xyz"));
        assert!(params.error.is_none());
    }

    #[test]
    fn reports_provider_errors() {
        let params = parse_params("error=access_denied&error_description=User+said+no");
        assert_eq!(params.error.as_deref(), Some("User said no"));
    }

    #[test]
    fn receives_one_redirect() {
        let server = CallbackServer::start(0, "/callback").expect("server");
        let port = server.port();
        let mut client = std::net::TcpStream::connect(("127.0.0.1", port)).expect("client");
        client
            .write_all(b"GET /callback?code=one&state=two HTTP/1.1\r\nHost: x\r\n\r\n")
            .expect("request");
        let mut response = String::new();
        client.read_to_string(&mut response).expect("response");
        assert!(response.starts_with("HTTP/1.1 200"));
        let params = server.wait(Duration::from_secs(2)).expect("params");
        assert_eq!(params.code.as_deref(), Some("one"));
    }
}
