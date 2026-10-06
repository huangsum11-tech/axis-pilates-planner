import re, json, glob
out=[]
files={'reformer-essential':'notes-ocr/STOTT__a塑身机初级扫描.txt','reformer-intermediate':'notes-ocr/STOTT__a_普拉提塑身机中级.txt'}
for key,f in files.items():
    t=open(f).read()
    pages=re.split(r'=== PAGE (\d+) ===',t)
    for i in range(1,len(pages),2):
        c=pages[i+1]
        for m in re.finditer(r'([^\n]*?[A-Z][A-Z ,&\-｜\'/]{3,}[^\n]*)\n(脚踏杆[^\n]*)',c):
            title=m.group(1).strip(); setup=m.group(2).strip()
            if '弹簧' not in setup and '弾簧' not in setup: 
                setup2=setup
            reps=re.search(r'(?:每侧)?重复练习\s*([\d\-–～~]+\s*[次组]?)',c[m.end():m.end()+1500])
            out.append({'src':key,'page':int(pages[i]),'title':title,'setup':setup,'reps':reps.group(0) if reps else ''})
json.dump(out,open('docs/stott-reformer-setups.json','w'),ensure_ascii=False,indent=1)
for o in out: print(o['src'][9:12],o['page'],'|',o['title'],'|',o['setup'],'|',o['reps'])
