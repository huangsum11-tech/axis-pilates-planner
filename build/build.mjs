// Rebuild standalone pilates-planner.html from src/pilates-planner.jsx + src/data/*.js
// Usage: node build/build.mjs
import { transformSync } from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '..');
let src = fs.readFileSync(path.join(root, 'src/pilates-planner.jsx'), 'utf8');
// STOTT setups (generated from the OCR'd manuals) + data files, spliced in at the /*@@DATA@@*/ marker
const setups = JSON.parse(fs.readFileSync(path.join(dir, 'stott-setups.json'), 'utf8'));
const setupJs = `const STOTT_SETUPS = ${JSON.stringify(setups)};\nconst USED_SETUP_KEYS = new Set();\nlet LAST_SETUP_KEY = null;\nfunction S_(k) { USED_SETUP_KEYS.add(k); LAST_SETUP_KEY = k; return STOTT_SETUPS[k]; }\n`;
const dataDir = path.join(root, 'src/data');
// 1x/2x 檔（動作庫）插在 /*@@DATA@@*/；3x 以上（體態問題、評估）需在 ISSUES 定義之後，插在 /*@@DATA2@@*/
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.js')).sort();
const load = list => list.map(f => `/* ---- ${f} ---- */\n` + fs.readFileSync(path.join(dataDir, f), 'utf8')).join('\n');
const early = files.filter(f => /^[12]/.test(f)), late = files.filter(f => !/^[12]/.test(f));
for (const m of ['/*@@DATA@@*/', '/*@@DATA2@@*/']) if (!src.includes(m)) throw new Error('missing ' + m + ' marker');
src = src.replace('/*@@DATA@@*/', setupJs + load(early)).replace('/*@@DATA2@@*/', load(late));
src = src.replace(/^import .*?;\s*$/gm, '').replace(/^export default function App/m, 'function App');
const { code } = transformSync(src, { loader: 'jsx', jsx: 'transform', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment', target: 'es2018', charset: 'utf8' });
const head = fs.readFileSync(path.join(dir, 'shell-head.html'), 'utf8');
const tail = fs.readFileSync(path.join(dir, 'shell-tail.html'), 'utf8');
const out = head + '\n' + code + '\n\n' + tail;
fs.writeFileSync(path.join(root, 'pilates-planner.html'), out);
fs.writeFileSync(path.join(root, 'index.html'), out); // GitHub Pages 入口
console.log('built pilates-planner.html', (out.length / 1024).toFixed(0) + 'KB');
