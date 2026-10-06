/* ============================== 訓練效果詞彙 FX（根因選動作的核心）============================== */
/* 每個動作標記它「拉長／活動／強化／控制」了什麼；每個體態問題列出它需要的效果。
   選動作時以效果配對，所以每個被選中的動作都能說出「為什麼是它」。
   L=拉長縮短的肌肉  M=恢復活動度  S=強化被拉長／無力的肌肉  C=重建控制與排列 */
const FX = {
  // 拉長 Lengthen
  L_hipflex: { label: '拉長髖屈肌（髂腰肌、股直肌）', kind: 'L', plain: '把大腿前側和腰前深處縮緊的肌肉拉長' },
  L_quad: { label: '拉長股四頭肌', kind: 'L', plain: '放鬆大腿前側' },
  L_ham: { label: '拉長膕繩肌（大腿後側）', kind: 'L', plain: '把大腿後側拉長' },
  L_add: { label: '拉長髖內收肌', kind: 'L', plain: '把大腿內側拉長' },
  L_hiprot: { label: '拉長髖旋轉肌／梨狀肌與臀部', kind: 'L', plain: '放鬆臀部深層旋轉肌' },
  L_tfl: { label: '拉長闊筋膜張肌／大腿外側', kind: 'L', plain: '放鬆大腿外側' },
  L_calf: { label: '拉長小腿（腓腸肌、比目魚肌）', kind: 'L', plain: '把小腿後側拉長' },
  L_pec: { label: '拉長胸大肌／胸小肌（打開前胸）', kind: 'L', plain: '打開縮緊的前胸' },
  L_lat: { label: '拉長背闊肌／大圓肌（過頭活動）', kind: 'L', plain: '放鬆腋下到背側的肌肉，讓手能舉高' },
  L_neck: { label: '放鬆頸後／上斜方肌／提肩胛肌', kind: 'L', plain: '放鬆肩頸緊繃' },
  L_ql: { label: '拉長側腰（腰方肌、腹斜肌）', kind: 'L', plain: '把縮短的一側腰拉長' },
  L_back: { label: '放鬆／拉長下背伸肌', kind: 'L', plain: '放鬆緊繃的下背' },
  L_abs: { label: '拉長前側腹肌（伸展前側鏈）', kind: 'L', plain: '把前側縮緊的腹部延展' },
  // 活動度 Mobility
  M_thext: { label: '恢復胸椎伸展活動度', kind: 'M', plain: '讓上背能挺起來' },
  M_throt: { label: '恢復胸椎旋轉活動度', kind: 'M', plain: '讓上背能自然轉動' },
  M_lat: { label: '恢復脊柱側屈活動度', kind: 'M', plain: '讓脊柱能左右側彎' },
  M_artic: { label: '脊柱逐節分節活動', kind: 'M', plain: '讓每一節脊椎都能分開動' },
  M_lumbext: { label: '恢復腰椎伸展曲度', kind: 'M', plain: '找回腰部自然弧度' },
  M_hip: { label: '髖關節活動度／髖腰分離', kind: 'M', plain: '讓大腿可以獨立於骨盆活動' },
  M_shoulder: { label: '肩關節活動度（過頭／旋轉）', kind: 'M', plain: '讓肩膀活動範圍回來' },
  M_ankle: { label: '踝關節活動度', kind: 'M', plain: '讓腳踝活動順暢' },
  // 強化 Strengthen
  S_core: { label: '深層核心（腹橫肌、骨盆底、多裂肌）', kind: 'S', plain: '喚醒身體深處的穩定肌' },
  S_flex: { label: '腹肌屈曲力量／耐力（腹直肌）', kind: 'S', plain: '強化腹部力量' },
  S_obl: { label: '腹斜肌（旋轉／抗旋轉／側屈）', kind: 'S', plain: '強化腰部兩側的腹斜肌' },
  S_ext: { label: '背伸肌（胸椎／上背伸肌）', kind: 'S', plain: '強化上背把身體撐直的肌肉' },
  S_glmax: { label: '臀大肌／髖伸展', kind: 'S', plain: '強化臀部' },
  S_glmed: { label: '臀中肌／髖外展（側向穩定）', kind: 'S', plain: '強化臀部側面' },
  S_hipER: { label: '髖外旋肌', kind: 'S', plain: '強化讓膝蓋不內扣的臀部旋轉肌' },
  S_add: { label: '髖內收肌', kind: 'S', plain: '強化大腿內側' },
  S_ham: { label: '膕繩肌力量', kind: 'S', plain: '強化大腿後側' },
  S_quad: { label: '股四頭肌（含股內側肌）', kind: 'S', plain: '強化大腿前側與膝蓋穩定' },
  S_iliop: { label: '單關節髖屈肌（髂腰肌）', kind: 'S', plain: '強化腰前深處把骨盆扶正的肌肉' },
  S_scap: { label: '中下斜方肌／菱形肌（肩胛後收下沉）', kind: 'S', plain: '強化把肩膀往後下帶的肌肉' },
  S_serr: { label: '前鋸肌（肩胛貼合胸廓）', kind: 'S', plain: '強化讓肩胛骨貼住背的肌肉' },
  S_rc: { label: '肩外旋肌／旋轉肌袖', kind: 'S', plain: '強化肩膀外旋，改善圓肩' },
  S_neck: { label: '深層頸屈肌', kind: 'S', plain: '強化把頭扶正的深層頸部肌肉' },
  S_foot: { label: '足部內在肌／足弓／脛後肌', kind: 'S', plain: '強化腳底撐起足弓的肌肉' },
  S_calf: { label: '小腿／踝關節蹠屈控制', kind: 'S', plain: '強化小腿與腳踝控制' },
  S_arms: { label: '上肢推拉力量', kind: 'S', plain: '強化手臂與肩膀' },
  S_side: { label: '側鏈穩定（側向支撐）', kind: 'S', plain: '強化身體側面的支撐力' },
  // 控制 Control
  C_breath: { label: '呼吸模式／肋骨架位置（ZOA）', kind: 'C', plain: '學會用橫膈膜立體呼吸' },
  C_pelvis: { label: '腰骨盆穩定（中立位／下沉位控制）', kind: 'C', plain: '學會控制骨盆位置' },
  C_scap: { label: '肩胛穩定與動作控制', kind: 'C', plain: '學會控制肩胛骨' },
  C_head: { label: '頭頸排列', kind: 'C', plain: '學會讓頭頸回到身體正上方' },
  C_wb: { label: '上肢負重排列', kind: 'C', plain: '手撐地時關節排列正確' },
  C_align: { label: '下肢對位（髖膝踝）', kind: 'C', plain: '讓髖、膝、腳踝排成一直線' },
  C_balance: { label: '平衡與本體感覺', kind: 'C', plain: '提升平衡與身體感知' },
  C_uni: { label: '單側訓練／矯正不對稱', kind: 'C', plain: '左右分開練，處理不對稱' },
  C_integ: { label: '全身整合協調', kind: 'C', plain: '把各部位的控制串連起來' },
};
const FX_KINDS = { L: '拉長', M: '活動度', S: '強化', C: '控制' };

/* 動作家族 → 禁忌症（北極星筆記規律）與相關 Polestar 篩查測試 */
const FAM = {
  flex: { c: ['disc', 'osteo', 'preg'], as: ['rollup', 'hundred'] },
  ext: { c: ['stenosis', 'spondy', 'facet'], as: ['superman', 'pressup'] },
  lat: { c: ['stenosis', 'facet', 'osteo'], as: ['sidelift', 'zsit'] },
  rot: { c: ['osteo', 'facet', 'scoliosis'], as: ['zsit', 'longsit'] },
  ulwb: { c: ['tos', 'carpal', 'impinge'], as: ['pushup'] },
  arm: { c: ['tos', 'impinge'], as: ['goalpost', 'proneflex'] },
  hip: { c: ['pubic', 'hiprep', 'pelvic'], as: ['halfsquat', 'hipabd'] },
  leg: { c: ['preg', 'hiprep', 'discacute'], as: ['halfsquat', 'heelraise'] },
  inv: { c: ['htn', 'glaucoma', 'reflux', 'preg'], as: ['rollup', 'longsit'] },
  supine: { c: ['preg'], as: [] },
  none: { c: [], as: [] },
};

/* 新增動作的建構器：
   X(id, '中文 English', 器械, 程度, 類別, 姿勢, '標籤', 彈簧, 步驟, 好處, 常見錯誤, { sys, fx, fam, c, as, cue, chain, st, also, reg, prog, tip }) */
function X(id, name, equipment, level, category, position, tags, springs, instructions, benefits, mistakes, o) {
  o = o || {};
  const fams = (o.fam || 'none').split(' ');
  const contra = new Set();
  const assess = [];
  fams.forEach(f => { const F = FAM[f]; if (F) { F.c.forEach(c => contra.add(c)); F.as.forEach(a => { if (!assess.includes(a)) assess.push(a); }); } });
  (o.c ? o.c.split(' ') : []).forEach(c => contra.add(c));
  (o.noc ? o.noc.split(' ') : []).forEach(c => contra.delete(c));
  const e = {
    id, name, equipment, level, category, tags: tags.split(' '), instructions, benefits, mistakes,
    sys: o.sys || 'STOTT', fx: o.fx ? o.fx.split(' ') : [], contra: [...contra],
    assess: o.as ? o.as.split(' ') : assess,
  };
  if (position) e.position = position;
  if (springs) e.springs = springs;
  if (o.cue) e.cue = o.cue;
  if (o.chain) e.chain = o.chain;
  if (o.st) e.stott = o.st;
  if (o.also) e.also = o.also.split(' ');
  if (o.reg) e.regression = o.reg;
  if (o.prog) e.progression = o.prog;
  if (o.tip) e.teacherTip = o.tip;
  if (o.ps) e.ps = o.ps;
  if (LAST_SETUP_KEY) { e.stottKey = LAST_SETUP_KEY; LAST_SETUP_KEY = null; }
  return e;
}
