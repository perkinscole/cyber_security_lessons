// A small local server for trying the course on its own: node tools/serve.mjs [port]
// It sends the same browser rule (content security policy) the course is given on Ready4AI, so
// what works here works there: pages may load only from this site, and the sandbox frame is
// the only thing allowed to start a worker.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
// answers/ is served here so practice mode can mark quick checks in the browser. Ready4AI never serves it.
const SERVED = ['index.html', 'sandbox.html', 'js', 'css', 'answers'];
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
export const CSP = "default-src 'self'; script-src 'self' blob:; worker-src blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; frame-src 'self'; base-uri 'none'; object-src 'none'; form-action 'self'; frame-ancestors 'self'";

export function serve(port = 8080) {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    const full = path.join(ROOT, rel);
    const head = { 'Content-Security-Policy': CSP, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Cache-Control': 'no-cache' };
    if (!full.startsWith(ROOT + path.sep) || !SERVED.includes(rel.split('/')[0])) { res.writeHead(404, head).end('Not found'); return; }
    try {
      res.writeHead(200, { ...head, 'Content-Type': TYPES[path.extname(full)] || 'application/octet-stream' }).end(await readFile(full));
    } catch (_) { res.writeHead(404, head).end('Not found'); }
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const port = Number(process.argv[2] || process.env.PORT || 8080);
  await serve(port);
  console.log(`Cipher City is at http://localhost:${port}  (class codes DEMO6, DEMO7, DEMO8)`);
}
