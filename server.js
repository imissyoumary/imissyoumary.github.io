import { createServer } from 'http';
import { readFile } from 'fs';
import path from 'path';

const PORT = 3000;
const STATIC_PATH = './dist';
const MIME_TYPES = {
  html: 'text/html; charset=UTF-8',
  js: 'text/javascript; charset=UTF-8',
  css: 'text/css',
  png: 'image/png',
  ico: 'image/x-icon',
  svg: 'image/svg+xml',
}

const server = createServer();
server.on('request', (req, res) => {
  const { url } = req;
  const name = url === '/' ? '/index.html' : url;
  const fileExt = path.extname(name).substring(1);
  const mimeType = MIME_TYPES[fileExt] || MIME_TYPES.html;

  res.writeHead(200, { 'Content-Type': mimeType});
  readFile(STATIC_PATH + name, (err, data) => {
    res.end(data);
  });
});
server.listen(PORT);
