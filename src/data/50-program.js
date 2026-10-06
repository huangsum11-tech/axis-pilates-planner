/* ============================== 根因導向的私教課程規劃 ==============================
   1) 由每個體態問題的「根因計畫」（拉長縮短肌→喚醒控制→強化無力肌→整合）組合出訓練目標
   2) 目標依性質分配到三個階段：鬆開與喚醒 → 強化與控制 → 整合與功能
   3) 每個目標以「訓練效果」配對動作，筆記推薦的動作（Polestar 推薦表、STOTT 體態課程）優先
   4) 每個被選中的動作都附上「為什麼選它」，可直接向客人解釋 */
const PHASE1_FX = ['C_breath', 'C_pelvis', 'C_scap', 'C_head', 'S_core', 'S_neck'];
const PHASE3_FX = ['C_integ', 'C_balance', 'C_align', 'C_uni', 'C_wb'];
function fxPhase(fx) {
  const k = FX[fx] ? FX[fx].kind : 'S';
  if (k === 'L' || k === 'M' || PHASE1_FX.includes(fx)) return 1;
  if (PHASE3_FX.includes(fx)) return 3;
  return 2;
}
const PHASE_META = {
  1: { name: '鬆開與喚醒期', goal: '先拉長縮短的肌肉、恢復活動度，同時喚醒呼吸、骨盆與肩胛的基本控制——沒有這一步，強化只會強化代償。' },
  2: { name: '強化與控制期', goal: '針對被拉長、無力的肌肉漸進加負荷，並在動作中維持新的排列；持續保留最關鍵的伸展。' },
  3: { name: '整合與功能期', goal: '把新的排列帶進全身、單側、站姿與平衡動作，讓改變延續到日常生活。' },
};
function shortName(e) { return e.name.replace(/\s+[A-Za-z].*$/, ''); }
function firstSentence(t) { return (t || '').split(/[。；]/)[0]; }

function generateRootProgram({ issueIds, weeks, sessions, equipmentSel, level, conditions, system }) {
  const { resolved, clusterNotes } = resolveIssueSelection(issueIds);
  const { ordered, framework } = prioritizeIssues(resolved);
  const rationale = ordered.map(rationaleFor);
  const levelMax = levelRank(level);
  const all = [...ordered.map(o => o.issue), ...framework];

  // 1) 合併所有問題的根因計畫成訓練目標
  const goals = [];
  all.forEach((issue, rank) => {
    const plan = (issue.root && issue.root.plan) || [];
    plan.forEach(([fx, why], idx) => {
      if (!FX[fx]) return;
      let g = goals.find(x => x.fx === fx);
      if (!g) { g = { fx, whys: [], issues: [], order: rank * 100 + idx }; goals.push(g); }
      g.whys.push({ issue: issue.name.replace(/\s+[A-Za-z].*$/, ''), why });
      if (!g.issues.includes(issue.id)) g.issues.push(issue.id);
      g.order = Math.min(g.order, rank * 100 + idx);
    });
  });
  // 多個問題共同需要的目標往前排（共通根因先處理，可帶來連鎖改善）
  goals.forEach(g => { g.order -= (g.issues.length - 1) * 40; g.phase = fxPhase(g.fx); });
  goals.sort((a, b) => a.order - b.order);

  // 筆記推薦動作
  const prefer = new Set(all.flatMap(i => (i.root && i.root.prefer) || []));
  const stottByPhase = { 1: new Set(), 2: new Set(), 3: new Set() };
  all.forEach(i => { const sp = i.root && i.root.stott; if (sp) [1, 2, 3].forEach(n => (sp[n] || []).forEach(id => stottByPhase[n].add(id))); });

  const phases = buildPhases(weeks);
  const n = phases.length;
  const safe = EXERCISES.filter(e => onEquip(e, equipmentSel) && isSafeFor(e, conditions));
  const usedAll = new Set();
  const sysBias = (e) => (system === 'stott' && e.sys.includes('STOTT')) || (system === 'polestar' && e.sys.includes('Polestar')) ? 3 : 0;

  const phaseResults = phases.map((ph, pIdx) => {
    const stage = n === 2 ? (pIdx === 0 ? 1 : 2.5) : pIdx + 1; // 兩階段時，第二階段合併強化與整合
    const cap = Math.min(ph.levelCap, levelMax);
    let phaseGoals;
    if (stage === 1) phaseGoals = goals.filter(g => g.phase === 1);
    else if (stage === 2) phaseGoals = [...goals.filter(g => g.phase === 2), ...goals.filter(g => g.phase === 1 && FX[g.fx].kind === 'L').slice(0, 2)];
    else if (stage === 3) phaseGoals = [...goals.filter(g => g.phase === 3), ...goals.filter(g => g.phase === 2).slice(0, 3), ...goals.filter(g => FX[g.fx].kind === 'L').slice(0, 1)];
    else phaseGoals = [...goals.filter(g => g.phase === 2), ...goals.filter(g => g.phase === 3), ...goals.filter(g => FX[g.fx].kind === 'L').slice(0, 1)];
    const slots = Math.max(5, Math.min(8, phaseGoals.length));
    phaseGoals = phaseGoals.slice(0, slots);
    const stottSet = stage === 1 ? stottByPhase[1] : stage === 2 ? stottByPhase[2] : stage === 3 ? stottByPhase[3] : new Set([...stottByPhase[2], ...stottByPhase[3]]);
    const picked = [];
    const pickedIds = new Set();
    const unmet = [];
    phaseGoals.forEach(goal => {
      let pool = safe.filter(e => e.fx.includes(goal.fx) && levelRank(e.level) <= cap && !pickedIds.has(e.id));
      if (!pool.length) pool = safe.filter(e => e.fx.includes(goal.fx) && levelRank(e.level) <= levelMax && !pickedIds.has(e.id));
      if (!pool.length) { unmet.push(goal); return; }
      const others = phaseGoals.filter(g => g !== goal).map(g => g.fx);
      const scored = pool.map(e => {
        let s = (e.fx[0] === goal.fx ? 4 : 2) + 2 * e.fx.filter(f => others.includes(f)).length;
        // 筆記推薦只在該效果是這個動作的主要目的（前兩項）時才加重，避免為了推薦而選錯目的
        const primary = e.fx.indexOf(goal.fx) <= 1;
        if (prefer.has(e.id)) s += primary ? 6 : 1;
        if (stottSet.has(e.id)) s += primary ? 6 : 2;
        s += sysBias(e);
        if (levelRank(e.level) === cap) s += 1;
        if (usedAll.has(e.id)) s -= 4;
        return { e, s: s + Math.random() * 1.5 };
      }).sort((a, b) => b.s - a.s);
      const e = scored[0].e;
      pickedIds.add(e.id); usedAll.add(e.id);
      const covers = e.fx.filter(f => f !== goal.fx && others.includes(f));
      const whyText = goal.whys.slice(0, 2).map(w => (goal.whys.length > 1 || all.length > 1 ? `${w.issue}：` : '') + w.why).join('；');
      const source = prefer.has(e.id) || stottSet.has(e.id) ? (stottSet.has(e.id) ? 'STOTT 體態課程範例' : '筆記推薦') : null;
      picked.push({ e, fx: goal.fx, issues: goal.issues, covers, source,
        reason: { goal: FX[goal.fx].label, why: whyText, pick: firstSentence(e.benefits), covers: covers.map(f => FX[f].label), source } });
    });
    return { ...ph, name: n === 2 && pIdx === 1 ? '強化與整合期' : PHASE_META[Math.min(3, Math.round(stage))].name,
      goal: n === 2 && pIdx === 1 ? PHASE_META[2].goal + PHASE_META[3].goal : PHASE_META[Math.min(3, Math.round(stage))].goal,
      picks: picked, exercises: picked.map(p => p.e), unmet };
  });

  const releaseIds = [];
  all.forEach(i => (i.releaseIds || []).forEach(id => { if (!releaseIds.includes(id)) releaseIds.push(id); }));
  return {
    rationale, framework, clusterNotes, phases: phaseResults, sessions, conditions: conditions || [], system: system || null,
    releaseItems: releaseIds.map(id => RELEASE_MAP[id]).filter(Boolean),
    cautions: resolved.filter(i => i.caution).map(i => ({ name: i.name, text: i.caution })),
    roots: all.filter(i => i.root).map(i => ({ id: i.id, name: i.name, short: i.root.short, long: i.root.long, explain: i.root.explain, mods: i.root.mods, sys: i.root.sys })),
    goals: goals.map(g => ({ fx: g.fx, label: FX[g.fx].label, kind: FX[g.fx].kind, phase: g.phase, issues: g.issues })),
  };
}

/* 給客人看的白話說明：根因＋三步策略 */
function clientExplanation(result) {
  const lines = [];
  result.roots.forEach(r => { if (r.explain) lines.push(r.explain); });
  const L = result.goals.filter(g => g.kind === 'L' || g.kind === 'M').slice(0, 3).map(g => FX[g.fx].plain);
  const S = result.goals.filter(g => g.kind === 'S').slice(0, 3).map(g => FX[g.fx].plain);
  const C = result.goals.filter(g => g.kind === 'C').slice(0, 2).map(g => FX[g.fx].plain);
  lines.push(`我們的三步策略：第一步，${L.join('、') || '放鬆與活動'}；第二步，${S.join('、') || '強化'}；第三步，${C.join('、') || '整合'}，把新的姿勢帶進日常生活。`);
  return lines.join('\n');
}
