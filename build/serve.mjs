// Static preview server for the planner: node build/serve.mjs [port]
import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.argv[2] || 8970);
http.createServer((req, res) => {
  // POST /save-doc?name=X.md → 寫入 docs/（只供本機產生文件用）
  if (req.method === 'POST' && req.url.startsWith('/save-doc')) {
    const name = new URL(req.url, 'http://x').searchParams.get('name') || '';
    if (!/^[\w-]+\.md$/.test(name)) { res.writeHead(400); return res.end('bad name'); }
    let body = ''; req.on('data', c => { body += c; }); req.on('end', () => { fs.writeFileSync(path.join(root, 'docs', name), body); res.end('ok'); });
    return;
  }
  let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f)) { res.writeHead(404); return res.end('not found'); }
  const ext = path.extname(f); const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.md': 'text/plain; charset=utf-8' };
  res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain; charset=utf-8' });
  fs.createReadStream(f).pipe(res);
}).listen(port, () => console.log('serving on', port));
