# Extract per-exercise blocks from STOTT manuals (OCR) into docs/stott-exercises.json
import re, json, opencc
cc = opencc.OpenCC('s2twp')
FIX = [(r'[肯胥督音臂得鲁管貴營份備冒脅]盆', '骨盆'), (r'肩胛[肯胥督音臂哥脅胃份]', '肩胛骨'), (r'肩舺[骨肯胥]', '肩胛骨'),
       (r'股[肯胥督臂胃]', '股骨'), (r'肋[肯胥督音臂管胃脅]', '肋骨'), (r'坐[肯胥督音臂]', '坐骨'), (r'尾[肯胥督音臂胥]', '尾骨'),
       (r'胫[肯胥督音臂胃]', '脛骨'), (r'[胸锁锁][肯胥督音]', lambda m: m.group(0)[0] + '骨'), (r'弹[簧簣貸竇货寶賛]', '弹簧'),
       (r'滕', '膝'), (r'胭绳', '腘绳'), (r'膕绳', '腘绳')]
def fix(t):
    for a, b in FIX: t = re.sub(a, b, t)
    return t
MANUALS = {
  'mat': 'notes-ocr/STOTT__垫上.txt', 'reformer1': 'notes-ocr/STOTT__a塑身机初级扫描.txt', 'reformer2': 'notes-ocr/STOTT__a_普拉提塑身机中级.txt',
  'cadillac1': 'notes-ocr/STOTT__凯迪拉克初级.txt', 'cadillac2': 'notes-ocr/STOTT__凯迪拉克中高级.txt', 'chair': 'notes-ocr/STOTT__平衡椅最终版.txt',
  'arc': 'notes-ocr/STOTT__弧形桶-扫描件(铜版纸).txt', 'ladder': 'notes-ocr/STOTT__梯桶最终版本.txt', 'corrector': 'notes-ocr/STOTT__脊柱矫正器最终版.txt',
}
SKIP = re.compile(r'TABLE|CONTENT|SAFETY|ESSENCE|FEATURE|PRINCIPLE|BREATHING$|PLACEMENT|MODIFICATION|STARTING POSITION|WORKOUT|INTRODUCTION|EDUCATION|CONTRIBUTOR|PUBLISHING|APPROACH|ANATOMY|MERRITHEW|STOTT|CHINESE|SCAPULAR MOVEMENT')
TITLE = re.compile(r'^(?:(\d+)\s*[\.．、]\s*)?([一-鿿｜|\-—（）()0-9 ]{1,22}?)\s*([A-Z][A-Z0-9 ,&\'’\-｜|/.]{2,}[A-Z.)])\s*(续)?$')
out = []
for key, f in MANUALS.items():
    t = open(f).read()
    pages = re.split(r'=== PAGE (\d+) ===', t)
    for i in range(1, len(pages), 2):
        pno = int(pages[i]); c = pages[i + 1]
        if '练习' not in c[:200] and 'EXERCISE' not in c[:300]:
            pass
        lines = [l.strip() for l in c.split('\n') if l.strip()]
        for li, l in enumerate(lines[:14]):
            m = TITLE.match(l)
            if not m or SKIP.search(m.group(3)): continue
            if len(m.group(2).strip()) == 0: continue
            body = '\n'.join(lines[li + 1:])
            def sect(name, stop):
                r = re.search(name + r'(.*?)(?=' + stop + r'|$)', body, re.S)
                return re.sub(r'\s+', '', r.group(1)) if r else ''
            out.append({'manual': key, 'page': pno, 'num': m.group(1), 'zh': fix(cc.convert(m.group(2).strip(' ｜|'))), 'en': m.group(3).strip(),
                        'cont': bool(m.group(4)) or '续' in l,
                        'setup': fix(cc.convert((re.search(r'((?:脚踏杆|弹簧|挂|踏板|推拉框|下卷木杆|秋千|滑垫固定栓)[^\n]{0,60})', body) or [''])[0])) if re.search(r'(脚踏杆|挂\d|挂.根)', body) else '',
                        'start': fix(cc.convert(sect('起始姿[势勢婆]', '练习|准备'))[:260]),
                        'steps': fix(cc.convert(sect('练习', '要点|原理|动作调整|重复练习'))[:420]),
                        'reps': (re.search(r'(?:每侧)?重复练习\s*[\d\-–～~至]+\s*[次组]?', body) or [''])[0],
                        'keys': fix(cc.convert(sect('要点', '原理|动作调整|练习|merrithew'))[:260]),
                        'muscles': fix(cc.convert(sect('目标肌肉', '稳定性|灵活性|顺序|要点|merrithew'))[:300]),
                        'mods': fix(cc.convert(sect('动作调整', '要点|原理|merrithew'))[:200])})
            break
json.dump(out, open('docs/stott-exercises-raw.json', 'w'), ensure_ascii=False, indent=1)
print(len(out))
from collections import Counter
print(Counter(o['manual'] for o in out))
