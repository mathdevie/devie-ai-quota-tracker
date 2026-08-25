use std::{
    io::{Read, Write},
    path::Path,
    sync::mpsc,
    thread,
    time::{Duration, Instant},
};

use portable_pty::{native_pty_system, CommandBuilder, PtySize};

pub fn run_slash_command(
    binary: &str,
    args: &[&str],
    environment: &[(&str, &str)],
    working_directory: &Path,
    slash_command: &str,
    expected_labels: &[&str],
    timeout: Duration,
) -> Result<String, String> {
    let pty = native_pty_system();
    let pair = pty
        .openpty(PtySize {
            rows: 60,
            cols: 180,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|_| "The provider terminal could not start.".to_string())?;

    let mut command = CommandBuilder::new(binary);
    command.args(args);
    command.cwd(working_directory);
    for (key, value) in environment {
        command.env(key, value);
    }

    let mut child = pair
        .slave
        .spawn_command(command)
        .map_err(|_| format!("The {binary} command is not available."))?;
    drop(pair.slave);
    let mut reader = pair
        .master
        .try_clone_reader()
        .map_err(|_| "The provider terminal output is unavailable.".to_string())?;
    let mut writer = pair
        .master
        .take_writer()
        .map_err(|_| "The provider terminal input is unavailable.".to_string())?;
    let (sender, receiver) = mpsc::channel::<Vec<u8>>();
    thread::spawn(move || {
        let mut buffer = [0_u8; 8192];
        loop {
            match reader.read(&mut buffer) {
                Ok(0) | Err(_) => break,
                Ok(length) => {
                    if sender.send(buffer[..length].to_vec()).is_err() {
                        break;
                    }
                }
            }
        }
    });

    let started = Instant::now();
    let mut sent_command = false;
    let mut last_output = Instant::now();
    let mut output = Vec::new();
    let mut sent_prompt_enter = false;

    while started.elapsed() < timeout {
        if !sent_command && started.elapsed() >= Duration::from_millis(1700) {
            writer
                .write_all(format!("{slash_command}\r").as_bytes())
                .and_then(|_| writer.flush())
                .map_err(|_| "The provider terminal rejected the quota command.".to_string())?;
            sent_command = true;
        }

        if let Ok(chunk) = receiver.recv_timeout(Duration::from_millis(100)) {
            last_output = Instant::now();
            if output.len() < 1_048_576 {
                let remaining = 1_048_576 - output.len();
                output.extend_from_slice(&chunk[..chunk.len().min(remaining)]);
            }
        }

        let clean = String::from_utf8_lossy(&strip_ansi_escapes::strip(&output)).to_string();
        let lower = clean.to_lowercase();
        if sent_command
            && !sent_prompt_enter
            && (lower.contains("show plan usage limits") || lower.contains("yes, i trust"))
        {
            let _ = writer.write_all(b"\r");
            let _ = writer.flush();
            sent_prompt_enter = true;
        }

        let has_expected_output = expected_labels
            .iter()
            .any(|label| lower.contains(&label.to_lowercase()));
        if has_expected_output && last_output.elapsed() >= Duration::from_millis(900) {
            break;
        }
        if child.try_wait().ok().flatten().is_some() {
            break;
        }
    }

    let _ = child.kill();
    let _ = child.wait();
    let clean = String::from_utf8_lossy(&strip_ansi_escapes::strip(&output)).to_string();
    if clean.trim().is_empty() {
        return Err("The provider terminal did not return quota data.".to_string());
    }
    Ok(clean)
}
