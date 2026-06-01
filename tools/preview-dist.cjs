const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../dist");
const port = Number(process.env.PORT || 4174);
const host = "127.0.0.1";
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${host}`).pathname);
  let filePath = path.join(root, pathname === "/" ? "index.html" : pathname);

  if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(root, "index.html");
  }

  response.writeHead(200, { "content-type": types[path.extname(filePath)] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(response);
}).listen(port, host);
