import AppKit
import WebKit
let surface = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "main"
let zoom = CommandLine.arguments.count > 2 ? CommandLine.arguments[2] : "1.25"
let theme = CommandLine.arguments.count > 3 ? CommandLine.arguments[3] : "theme-dark"
let app = NSApplication.shared
app.setActivationPolicy(.accessory)
final class Runner: NSObject, WKNavigationDelegate {
 let view = WKWebView(frame: NSRect(x: 0, y: 0, width: 420, height: 360))
 var window: NSWindow!
 func start() {
  window = NSWindow(contentRect: view.frame, styleMask: [.titled, .closable], backing: .buffered, defer: false)
  window.contentView = view
  window.title = "Devie local WebKit regression"
  window.orderFront(nil)
  view.navigationDelegate = self
  view.load(URLRequest(url: URL(string: "http://localhost:3002/?surface=\(surface)")!))
 }
 func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
  DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
   self.view.evaluateJavaScript("document.documentElement.style.setProperty('--devie__zoom','\(zoom)');document.documentElement.dataset.devieTheme='\(theme)';" + (surface == "main" ? "document.querySelector('button[aria-label=Alerts]').click();" : "")) { _, err in
    if let err = err { print("ERROR \(err)"); exit(1) }
    DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
     self.view.evaluateJavaScript("JSON.stringify((()=>{let d=document.querySelector('[role=dialog]')||document.querySelector('.appRoot'),r=d.getBoundingClientRect(),b=d.querySelector('[data-app-dialog-body]')||d;return {userAgent:navigator.userAgent,zoom:getComputedStyle(document.querySelector('.appRoot')).zoom,viewport:[innerWidth,innerHeight],dialog:[r.x,r.y,r.width,r.height],scrollHeight:b.scrollHeight,clientHeight:b.clientHeight}})())") { result, error in
      print(result ?? "no result", error ?? "")
      self.view.takeSnapshot(with: nil) { image, error in
       if let image = image, let tiff=image.tiffRepresentation, let rep=NSBitmapImageRep(data:tiff), let png=rep.representation(using:.png,properties:[:]) {
        try? png.write(to: URL(fileURLWithPath: FileManager.default.currentDirectoryPath + "/.local-evidence/webkit-\(surface)-\(theme)-\(zoom).png"))
       }
       if let error=error { print(error) }
       exit(error == nil ? 0 : 1)
      }
     }
    }
   }
  }
 }
}
let runner = Runner()
runner.start()
app.run()
