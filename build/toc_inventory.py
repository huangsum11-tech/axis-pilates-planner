import re, json, opencc
cc = opencc.OpenCC('s2twp')
MANUALS = {
  'mat': 'notes-ocr/STOTT__垫上.txt', 'reformer1': 'notes-ocr/STOTT__a塑身机初级扫描.txt', 'reformer2': 'notes-ocr/STOTT__a_普拉提塑身机中级.txt',
  'cadillac1': 'notes-ocr/STOTT__凯迪拉克初级.txt', 'cadillac2': 'notes-ocr/STOTT__凯迪拉克中高级.txt', 'chair': 'notes-ocr/STOTT__平衡椅最终版.txt',
  'arc': 'notes-ocr/STOTT__弧形桶-扫描件(铜版纸).txt', 'ladder': 'notes-ocr/STOTT__梯桶最终版本.txt', 'corrector': 'notes-ocr/STOTT__脊柱矫正器最终版.txt',
}
inv = []
for key, f in MANUALS.items():
    t = open(f).read()
    pages = re.split(r'=== PAGE (\d+) ===', t)
    toc = ''
    for i in range(1, min(len(pages), 14), 2):
        if re.search(r'CONTENTS|CONIENTS|目录', pages[i+1]): toc += pages[i+1]
    lines = [l.strip() for l in toc.split('\n') if re.search(r'[A-Z]{3,}', l)]
    try:
        s = next(i for i, l in enumerate(lines) if re.search(r'练习\s*EXERCISES|^EXERCISES', l))
        e = next(i for i, l in enumerate(lines) if 'WORKOUT' in l)
    except StopIteration:
        print('TOC parse fail', key); continue
    for l in lines[s + 1:e]:
        m = re.match(r'^(.*?)\s*([A-Z][A-Z0-9 ,&\'’\-｜|/.()]+?)\s*(\d+)?$', l)
        if not m: continue
        zh = cc.convert(m.group(1)).strip(' ｜|'); en = m.group(2).strip()
        inv.append({'manual': key, 'zh': zh, 'en': en})
json.dump(inv, open('docs/stott-toc.json', 'w'), ensure_ascii=False, indent=1)
from collections import Counter
print(len(inv), Counter(i['manual'] for i in inv))
for i in inv: print(i['manual'], '|', i['zh'], '|', i['en'])
