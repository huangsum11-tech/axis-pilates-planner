import re, json, opencc
cc = opencc.OpenCC('s2twp')
exec(open('build/extract_manuals.py').read().split("MANUALS = {")[0].split("cc = opencc")[1].join(['cc = opencc','']) if False else '')
FIX = [(r'[肯胥督音臂得鲁管貴營份備冒脅]盆', '骨盆'), (r'肩胛[肯胥督音臂哥脅胃份]', '肩胛骨'), (r'股[肯胥督臂胃]', '股骨'), (r'肋[肯胥督音臂管胃脅]', '肋骨'),
       (r'坐[肯胥督音臂]', '坐骨'), (r'尾[肯胥督音臂]', '尾骨'), (r'胫[肯胥督音臂胃]', '胫骨'), (r'弹[簧簣貸竇货寶賛]', '弹簧'), (r'滕', '膝'), (r'胭绳', '腘绳')]
def fix(t):
    for a, b in FIX: t = re.sub(a, b, t)
    return t
MANUALS = {
  'mat': 'notes-ocr/STOTT__垫上.txt', 'reformer1': 'notes-ocr/STOTT__a塑身机初级扫描.txt', 'reformer2': 'notes-ocr/STOTT__a_普拉提塑身机中级.txt',
  'cadillac1': 'notes-ocr/STOTT__凯迪拉克初级.txt', 'cadillac2': 'notes-ocr/STOTT__凯迪拉克中高级.txt', 'chair': 'notes-ocr/STOTT__平衡椅最终版.txt',
  'arc': 'notes-ocr/STOTT__弧形桶-扫描件(铜版纸).txt', 'ladder': 'notes-ocr/STOTT__梯桶最终版本.txt', 'corrector': 'notes-ocr/STOTT__脊柱矫正器最终版.txt',
}
inv = json.load(open('docs/stott-toc.json'))
digest = {}
for key, f in MANUALS.items():
    t = open(f).read()
    pages = re.split(r'=== PAGE (\d+) ===', t)
    P = [(int(pages[i]), pages[i+1]) for i in range(1, len(pages), 2)]
    body_pages = [(n, c) for n, c in P if n > 8 and not re.search(r'WORKOUT CHART|练习动作列表', c[:400])]
    items = [i for i in inv if i['manual'] == key]
    prev_n = 0
    out = []
    def head(c): return re.sub(r'\s+', ' ', ' '.join([l for l in c.split('\n') if l.strip()][:16])).upper()
    for it in items:
        en = it['en'].replace('TVVIST', 'TWIST').replace('EXTENSICN', 'EXTENSION').upper()
        key_en = re.sub(r'[^A-Z0-9 &]', ' ', en.split(',')[0]).split()
        cands = [idx for idx, (n, c) in enumerate(body_pages) if all(w in re.sub(r'[^A-Z0-9 &]', ' ', head(c)).split() for w in key_en)]
        exact = [idx for idx in cands if re.search(r'(^| )' + r'\W*'.join(map(re.escape, key_en)) + r'( |$)', re.sub(r'[^A-Z0-9 &]', ' ', head(body_pages[idx][1])))]
        pool = exact or cands
        after = [idx for idx in pool if body_pages[idx][0] >= prev_n]
        hit = (after or pool or [None])[0]
        if hit is None:
            out.append({**it, 'page': None}); continue
        prev_n = body_pages[hit][0]
        n, c = body_pages[hit]
        nxt = body_pages[hit + 1][1] if hit + 1 < len(body_pages) else ''
        text = c + ('\n' + nxt if '续' in nxt[:300] or len(c) < 900 else '')
        flat = re.sub(r'\s+', '', text)
        def sect(name, stop, n=300):
            r = re.search(name + r'(.*?)(?=' + stop + r'|$)', flat)
            return fix(cc.convert(r.group(1)))[:n] if r else ''
        setup = re.search(r'((?:脚踏杆|弹簧|挂[0-9一二三四½¼]|调节|推拉框|木杆|秋千|毛绒)[^。]{0,70})', flat)
        out.append({**it, 'page': n,
            'setup': fix(cc.convert(setup.group(1)))[:90] if setup else '',
            'start': sect('起始姿[势勢婆安]', '练习|准备，吸气|准备，', 220),
            'steps': sect('练习', '要点|原理|动作调整|注意事项', 380),
            'reps': (re.search(r'(?:每侧)?重复练习\s*[\d\-–～~至]+\s*[次组]?', flat) or [''])[0],
            'keys': sect('要点', '原理|动作调整|merrithew|练习', 240),
            'muscles': sect('目标肌肉[：:]?', '稳定性|灵活性|顺序|要点|merrithew', 260),
            'flex': sect('灵活性[：:]?', '顺序|要点|merrithew|稳定性', 120),
            'mods': sect('动作调整', '要点|原理|merrithew', 160)})
    digest[key] = out
    print(key, len(out), 'missing pages:', [o['en'] for o in out if o['page'] is None])
json.dump(digest, open('docs/stott-digest.json', 'w'), ensure_ascii=False, indent=1)
