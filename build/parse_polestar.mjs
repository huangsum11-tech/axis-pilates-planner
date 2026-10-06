import fs from 'fs';
const files = { '初': 'notes-ocr/Polestar_自學筆記__北极星普拉提笔记（初级）.txt', '中': 'notes-ocr/Polestar_自學筆記__北极星普拉提笔记（中级）.txt', '高': 'notes-ocr/Polestar_自學筆記__北极星普拉提笔记（高级）.txt' };
const out = [];
for (const [lvl, f] of Object.entries(files)) {
  const pages = fs.readFileSync(f, 'utf8').split(/=== PAGE \d+ ===/);
  for (const p of pages) {
    const m = p.match(/[动力助]作名称\s*[：:]\s*(.+)/);
    if (!m) continue;
    const t = p.replace(/\n/g, '¶');
    const grab = (re) => { const r = t.match(re); return r ? r[1].replace(/¶/g, '').replace(/^[：:\s]+/, '').trim() : ''; };
    out.push({
      level: lvl,
      name: m[1].trim(),
      category: grab(/分类\s*[：:](.*?)(?=¶|$)/),
      chain: grab(/运动链\s*[：:](.*?)(?=¶|$)/),
      pattern: grab(/动作模式\s*[：:]?(.*?)(?=[•，,]?\s*目标|¶•|$)/),
      contra: grab(/禁忌症\s*[：:]?(.*?)(?=¶|$)/),
      assess: grab(/相关联评估动作\s*[：:](.*?)(?=[•，]\s*相关联动作|¶•|$)/),
      related: grab(/相关联动作\s*[：:](.*?)(?=[•．]\s*动作作用|¶•|$)/),
      benefit: grab(/动作作用\s*[：:](.*?)(?=¶[•想禁]|$)/),
      image: grab(/(想[象像].*?)(?=¶|$)/),
      springs: grab(/(\d+\s*根[^，。；¶]*弹[簧簣貸竇货寶]?[^，。；¶]*)/),
    });
  }
}
fs.writeFileSync('docs/polestar-exercise-notes.json', JSON.stringify(out, null, 1));
console.log(out.length);
for (const e of out) console.log(`${e.level} | ${e.name} | ${e.category} | ${e.chain} | 禁:${e.contra} | 評:${e.assess} | ${e.springs}`);
