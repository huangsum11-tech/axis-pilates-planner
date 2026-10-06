import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, AlertTriangle, Save, Trash2, Loader2, Sparkles, FileDown, ClipboardList, Shuffle, ArrowUp, ArrowDown, ListChecks } from 'lucide-react';

/* ============================== DESIGN TOKENS ============================== */
const C = {
  // Plumbline 配色：深雲杉綠（軸線）＋銅色（鉛錘）＋暖紙色
  bg: '#F2EEE7', surface: '#FFFDF9', surface2: '#F7F3EC',
  ink: '#1C2B2E', inkSoft: '#4D5A5C', inkFaint: '#879091',
  pine: '#1F4E4A', pineSoft: '#3E6B66',
  brass: '#B4673A', brassSoft: '#F2DCCB', brassDeep: '#8A4A24',
  rose: '#B0585E', roseSoft: '#F5DEDF',
  sage: '#5F7F63', sageSoft: '#DCE8DA',
  slate: '#4A6687', slateSoft: '#DEE6F0',
  brown: '#7D6553', brownSoft: '#EDE3DA',
  line: '#E3DBCE', lineSoft: '#EEE8DE',
};
const FONT_DISPLAY = "'Archivo','PingFang TC','Noto Sans TC',sans-serif";
const FONT_BODY = "'IBM Plex Sans','PingFang TC','Noto Sans TC',sans-serif";
const FONT_MONO = "'IBM Plex Mono',monospace";

const TAG_LABEL = { upper: '上肢/肩胛', lower: '下肢', booty: '臀部', core: '核心', relax: '舒緩放鬆', flexibility: '柔軟度', posture: '體態矯正', full: '全身' };
const TAG_COLOR = {
  upper: C.brass, lower: C.pine, booty: C.rose, core: C.slate,
  relax: C.sage, flexibility: C.sage, posture: C.brown, full: C.inkSoft,
};
const LEVEL_LABEL = { '初': '初階', '中': '中階', '高': '高階' };
const levelRank = (l) => ({ '初': 1, '中': 2, '高': 3 }[l] || 1);

/* ============================== ICONS ============================== */
function IconBase({ children, size = 26 }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
const MatIcon = (p) => (
  <IconBase {...p}><rect x="5" y="15" width="30" height="10" rx="5" /><line x1="13" y1="15" x2="13" y2="25" /><line x1="20" y1="15" x2="20" y2="25" /><line x1="27" y1="15" x2="27" y2="25" /></IconBase>
);
const ReformerIcon = (p) => (
  <IconBase {...p}><line x1="4" y1="14" x2="36" y2="14" /><line x1="4" y1="26" x2="36" y2="26" /><rect x="17" y="16" width="10" height="8" /><path d="M4 20 L7 17 L10 23 L13 17 L16 20" /></IconBase>
);
const TowerIcon = (p) => (
  <IconBase {...p}><line x1="8" y1="6" x2="8" y2="32" /><line x1="32" y1="6" x2="32" y2="32" /><line x1="8" y1="6" x2="32" y2="6" /><line x1="14" y1="6" x2="14" y2="18" /><line x1="26" y1="6" x2="26" y2="18" /><line x1="6" y1="32" x2="34" y2="32" /></IconBase>
);
const LadderIcon = (p) => (
  <IconBase {...p}><path d="M6 18 C6 8 34 8 34 18" /><line x1="10" y1="18" x2="10" y2="32" /><line x1="30" y1="18" x2="30" y2="32" /><line x1="10" y1="23" x2="30" y2="23" /><line x1="10" y1="28" x2="30" y2="28" /></IconBase>
);
const ChairIcon = (p) => (
  <IconBase {...p}><rect x="10" y="7" width="14" height="6" /><line x1="12" y1="13" x2="12" y2="26" /><line x1="22" y1="13" x2="22" y2="26" /><path d="M17 13 L17 26" /><rect x="7" y="26" width="18" height="5" /></IconBase>
);
const HalfCadIcon = (p) => (
  <IconBase {...p}><rect x="6" y="20" width="28" height="8" /><path d="M10 20 L13 15 L16 22 L19 15 L22 20" /></IconBase>
);
const CorrectorIcon = (p) => (
  <IconBase {...p}><path d="M6 24 C6 15 12 12 16 16 C19 19 21 19 24 16 C28 12 34 15 34 24" /><line x1="6" y1="27" x2="34" y2="27" /></IconBase>
);

/* ============================== EQUIPMENT ============================== */
const EQUIPMENT = [
  { key: 'mat', name: '墊上 Mat', icon: MatIcon },
  { key: 'reformer', name: '塑身機 Reformer', icon: ReformerIcon },
  { key: 'tower', name: '凱迪拉克 Cadillac', icon: TowerIcon },
  { key: 'ladder', name: '梯桶 Ladder Barrel', icon: LadderIcon },
  { key: 'chair', name: '平衡椅 Chair', icon: ChairIcon },
  { key: 'halfcad', name: '半凱迪拉克 Half Cadillac', icon: HalfCadIcon },
  { key: 'corrector', name: '脊柱矯正器/弧形桶', icon: CorrectorIcon },
];
const EQUIP_LABEL = Object.fromEntries(EQUIPMENT.map(e => [e.key, e.name]));
// 主題課堂生成只用 Mat／Reformer／Half Cadillac（Tower Mix限定）；其餘器械（Cadillac全機、梯桶、平衡椅、脊柱矯正器）留給「特色課堂」處理
const CLASS_GEN_EQUIPMENT = EQUIPMENT.filter(e => ['mat', 'reformer', 'halfcad'].includes(e.key));

/* ============================== EXERCISES ============================== */
const EXERCISES = [
  /* ---------- MAT 墊上 (熱身/核心/脊柱靈活/下肢/整合) ---------- */
  { id: 'e1', name: '呼吸熱身 Breathing', equipment: 'mat', tags: ['relax', 'core'], level: '初', category: '熱身', instructions: '①仰臥屈膝，雙手輕放肋骨兩側；②吸氣感受肋骨向外擴張，呼氣感受肋骨向內向下收；③重複5-6次，建立立體呼吸感覺。', benefits: '啟動深層核心與呼吸協調，為整堂課建立呼吸節奏基礎。', mistakes: '只用胸口上部淺呼吸，或呼氣時聳肩、頸部用力。' },
  { id: 'e2', name: '骨盆時鐘 Pelvic Clock', equipment: 'mat', tags: ['core', 'posture'], level: '初', category: '熱身', instructions: '①仰臥屈膝，想像骨盆上有時鐘錶面；②緩慢將骨盆前傾、後傾、左右微移，畫出時鐘刻度；③每方向重複3-4次，找出中立位置。', benefits: '喚醒骨盆周圍肌群覺察力，幫助找到骨盆中立位。', mistakes: '動作幅度過大牽動整條腰椎，或用力屏氣完成。' },
  { id: 'e3', name: '肩胛骨滑動 Scapular Glides', equipment: 'mat', tags: ['upper', 'posture'], level: '初', category: '熱身', instructions: '①仰臥或坐姿，雙臂向天花板伸直；②吸氣肩胛骨上提近耳，呼氣下沉遠離耳朵；③重複5-6次，感受肩胛在肋骨架上滑動。', benefits: '喚醒肩胛穩定肌群，為上肢動作做準備，改善聳肩習慣。', mistakes: '只用手臂晃動而肩胛沒有真正滑動，或下沉時過度用力夾背。' },
  { id: 'e4', name: '脊柱扭轉熱身 Spine Twist Warm-up', equipment: 'mat', tags: ['flexibility', 'posture'], level: '初', category: '熱身', instructions: '①盤坐或屈膝坐，雙手交叉扶肩；②吐氣轉動上半身向一側，吸氣回正；③左右各重複3-4次，動作由胸椎帶動。', benefits: '提升胸椎旋轉活動度，熱身脊椎周圍肌肉。', mistakes: '骨盆隨之旋轉、坐骨離地，或轉動幅度勉強超出舒適範圍。' },
  { id: 'e5', name: '百次 The Hundred', equipment: 'mat', tags: ['core', 'full'], level: '初', category: '核心', instructions: '①仰臥屈膝，肋骨下沉、骨盆中立；②抬頭捲肩離墊，雙腿依程度屈膝或伸直，雙臂平行離地上下泵動；③吸氣5下、呼氣5下為一組，重複8-10組。', benefits: '強化核心耐力，建立呼吸與腹橫肌協調啟動的基礎模式。', mistakes: '頸部過度用力前伸、肋骨外凸未收，或呼吸與動作節奏脫節。', teacherTip: '跪或坐於學員頭側，觀察頸部是否過度用力；可用雙手輕托後腦提示捲肩幅度，或輕觸肋骨提示下沉。', regression: '雙腿屈膝呈桌面姿降低核心負荷，或頭頸放回墊上只做手臂泵動。', progression: '雙腿伸直放低角度增加槓桿臂，動作节奏加快考驗耐力。', },
  { id: 'e6', name: '捲上 Roll-Up', equipment: 'mat', tags: ['core', 'flexibility'], level: '中', category: '核心', instructions: '①仰臥雙臂過頭，吸氣雙臂畫弧向上；②呼氣依序捲動頸、胸、腰離墊向前彎；③吸氣延展脊椎，呼氣逐節捲回墊上，重複4-6次。', benefits: '訓練腹部離心/向心控制力，同時提升脊椎逐節活動度。', mistakes: '用腰部力量猛然坐起而非逐節捲動，或雙腳離地失去骨盆穩定。', teacherTip: '坐於學員腳側，一手可輕放於下腹提示啟動順序，觀察是否逐節捲動而非整段脊椎同時抬起。', regression: '雙膝微彎、雙手可扶大腿輔助捲起，減少脊椎逐節控制的難度。', progression: '雙腿夾緊不使用雙手輔助，或加入停留在C形曲線2秒的控制練習。', },
  { id: 'e7', name: '捲球 Rolling Like a Ball', equipment: 'mat', tags: ['core', 'relax'], level: '初', category: '核心', instructions: '①坐姿抱膝成球狀，脊椎呈均勻C形；②吸氣向後滾動至肩胛（不過頸），呼氣捲腹回坐姿平衡；③重複6-8次，節奏平穩。', benefits: '按摩脊椎兩側肌肉，同時訓練核心捲曲控制與平衡感，兼具舒緩效果。', mistakes: '滾動過頭壓到頸椎，或靠慣性甩動而非核心控制完成。' },
  { id: 'e8', name: '單腿伸展 Single Leg Stretch', equipment: 'mat', tags: ['core'], level: '中', category: '核心', instructions: '①仰臥捲肩離墊，一腿屈膝抱住、一腿伸直離地45度；②雙手換手換腿交替拉動，呼吸配合節奏；③重複8-10次每側。', benefits: '訓練核心穩定同時四肢協調，是經典的核心耐力動作。', mistakes: '下背拱起離墊、骨盆左右晃動，或伸直腿放太低失去控制。' },
  { id: 'e9', name: '雙腿伸展 Double Leg Stretch', equipment: 'mat', tags: ['core', 'full'], level: '中', category: '核心', instructions: '①捲肩離墊，雙膝抱胸；②吸氣雙臂雙腿同時向外伸展延長，呼氣畫大圈收回抱膝；③重複6-8次，全程保持肋骨下沉。', benefits: '加大槓桿臂長度考驗核心穩定，同時訓練四肢協調與延展。', mistakes: '伸展時下背離墊拱起，或頭頸下墜失去捲曲支撐。' },
  { id: 'e10', name: '剪刀式 Scissors', equipment: 'mat', tags: ['core', 'flexibility'], level: '中', category: '核心', instructions: '①仰臥捲肩，雙腿向天花板伸直；②雙手扶其中一腿小腿後側，雙腿如剪刀般前後交換擺動；③重複8-10次每側，骨盆保持穩定。', benefits: '訓練核心抗旋轉穩定力，同時伸展腿後肌群。', mistakes: '骨盆隨腿部擺動而晃動，或下背過度離墊代償。' },
  { id: 'e11', name: '反向卷腹 Reverse Curl', equipment: 'mat', tags: ['core'], level: '中', category: '核心', instructions: '①仰臥屈膝雙腳離地成桌面姿；②呼氣捲尾骨、骨盆離墊向胸口靠近，吸氣緩慢放回；③重複8-10次，動作幅度小但控制精準。', benefits: '訓練下腹與骨盆後傾控制力，強化核心下段。', mistakes: '借用腿部擺盪的慣性完成，而非腹部主動捲動骨盆。' },
  { id: 'e12', name: '脊柱前伸展 Spine Stretch Forward', equipment: 'mat', tags: ['flexibility', 'relax', 'posture'], level: '初', category: '脊柱靈活', instructions: '①坐姿雙腿略寬於髖，脊椎延長；②吐氣逐節向前捲曲，雙臂向前延伸；③吸氣逐節捲回坐直，重複4-6次。', benefits: '逐節伸展脊椎後側鏈，改善坐姿體態與胸椎活動度。', mistakes: '整條脊椎一起往前倒而非逐節捲動，或雙腿內夾失去坐姿穩定。' },
  { id: 'e13', name: '美人魚 Mermaid', equipment: 'mat', tags: ['flexibility', 'posture', 'upper'], level: '中', category: '脊柱靈活', instructions: '①側坐屈膝，一手撐地、一手向上延伸；②吐氣身體向支撐手側側屈伸展，感受對側肋廓延長；③吸氣回正，換邊重複3-4次。', benefits: '側向伸展肋廓與腰方肌，改善左右體態不對稱。', mistakes: '身體前傾或後仰偏離側屈平面，或支撐肩聳起失去穩定。' },
  { id: 'e14', name: '鋸式 Saw', equipment: 'mat', tags: ['flexibility', 'upper', 'posture'], level: '中', category: '脊柱靈活', instructions: '①坐姿雙腿略寬於肩，雙臂側平舉；②吐氣旋轉軀幹並向前伸手觸對側腳外側，吸氣旋轉回正；③左右交替重複3-4次。', benefits: '結合旋轉與前彎，伸展背闊肌並提升胸椎旋轉活動度。', mistakes: '骨盆隨軀幹轉動而偏移，或旋轉主要來自腰椎而非胸椎。' },
  { id: 'e15', name: '天鵝 Swan', equipment: 'mat', tags: ['upper', 'posture'], level: '中', category: '脊柱靈活', instructions: '①俯臥雙手置於胸側，肩胛下沉後縮；②吸氣延展脊椎，胸口離墊呈伸展弧線；③呼氣緩慢下降，重複4-6次。', benefits: '胸椎伸展並強化背伸肌群，有效改善圓肩駝背。', mistakes: '靠手臂猛力撐起而非背肌主動伸展，或聳肩導致頸椎過伸。', teacherTip: '蹲於學員側邊，觀察是否用手臂猛力撐起而非背肌延展；可輕觸中背提示「從這裡開始伸展」。', regression: '雙手保持撐地提供更多支撐，胸口離墊幅度縮小。', progression: '雙手離開墊面平舉於身側（Swan Dive準備），加大背伸肌群負荷。', },
  { id: 'e16', name: '單腿畫圈 Single Leg Circle', equipment: 'mat', tags: ['lower', 'core'], level: '初', category: '下肢', instructions: '①仰臥一腿伸直朝天花板，另一腿放鬆平放；②骨盆穩定下畫圈，方向由小逐漸加大；③每方向5-6圈，換邊重複。', benefits: '訓練髖關節活動度同時挑戰核心抗旋轉穩定。', mistakes: '骨盆隨畫圈晃動偏移，或圈畫得過大失去控制。' },
  { id: 'e17', name: '側抬腿系列 Side Leg Series', equipment: 'mat', tags: ['lower', 'booty'], level: '中', category: '下肢', instructions: '①側臥身體成一直線，下方手枕頭、上方手撐地穩定；②上腿依次做前後擺動、畫圈、上抬等變化；③每個變化8-10次，換邊重複。', benefits: '全面訓練髖外展與臀中肌，雕塑臀腿線條並提升髖側穩定。', mistakes: '身體向後倒失去一直線，或借用腰部擺動代替髖關節發力。' },
  { id: 'e18', name: '雙腿踢式 Double Leg Kick', equipment: 'mat', tags: ['lower', 'booty', 'upper'], level: '中', category: '下肢', instructions: '①俯臥雙手交扣置於下背，額頭側向一邊；②雙膝彎曲腳踢向臀部3下，接著伸展雙腿、雙臂向後延伸並抬胸；③重複3-4組，換邊臉頰方向。', benefits: '同時訓練腿後肌群、臀肌與背伸肌群，強化後側動力鏈。', mistakes: '抬胸時聳肩壓迫頸椎，或下背過度伸展造成腰椎壓力。' },
  { id: 'e19', name: '側彎 Side Bend', equipment: 'mat', tags: ['flexibility', 'upper', 'core'], level: '高', category: '整合', instructions: '①側坐一手撐地一腿屈膝、一腿伸直，臀部離地成側支撐；②吐氣髖部上頂延伸成一直線，上方手臂畫弧過頭；③吸氣回落，重複3-4次每側。', benefits: '訓練側鏈核心力量與肩帶穩定，同時提升協調與柔軟度。', mistakes: '髖部下沉塌陷失去直線，或支撐肩聳肩代償。' },
  { id: 'e20', name: '提斯 Teaser', equipment: 'mat', tags: ['core', 'full'], level: '高', category: '整合', instructions: '①仰臥屈膝，雙臂過頭；②吐氣同時捲起上身與抬起雙腿，成V字平衡，雙臂與腿平行；③吸氣緩慢捲回，重複4-6次。', benefits: '全身協調與核心力量的綜合考驗，是核心進階指標動作。', mistakes: '用甩動借力坐起，或下背拱起失去脊椎中立控制。', teacherTip: '蹲於學員腳側略偏一邊，方便觀察下背是否拱起；初學者可提供雙手輔助拉起作為進階前的橋接練習。', regression: '雙手輔助扶住大腿後側協助平衡，或先由屈膝版本開始練習。', progression: '雙手交叉胸前不藉助手臂平衡，或加入V字停留後緩慢下降1組。', },
  { id: 'e21', name: '海豹 Seal', equipment: 'mat', tags: ['core', 'relax', 'full'], level: '中', category: '整合', instructions: '①坐姿抱膝，雙手從膝下穿過扶住腳踝外側；②吸氣向後滾動至肩胛，呼氣坐起時腳掌互拍3下；③重複6-8次，動作輕快流暢。', benefits: '按摩脊椎並訓練核心捲曲控制，也是活潑有趣的收操動作。', mistakes: '滾動過猛壓迫頸椎，或拍腳時失去平衡後倒。' },
  { id: 'e22', name: '游泳 Swimming', equipment: 'mat', tags: ['full', 'posture'], level: '中', category: '整合', instructions: '①俯臥雙臂雙腿伸展離地成飛翔姿；②對側手腳交替小幅度上下擺動，如游泳打水；③持續20-30拍，過程保持呼吸順暢。', benefits: '訓練背伸肌群耐力與四肢協調，強化整條後側動力鏈。', mistakes: '擺動幅度過大導致腰椎代償晃動，或憋氣完成動作。' },
  { id: 'e133', name: '頸部牽引 Neck Pull', equipment: 'mat', tags: ['core', 'flexibility', 'full'], level: '高', category: '整合', instructions: '①仰臥雙手交扣置於腦後，雙腿伸直併攏；②吐氣捲肩離墊、逐節坐起前彎，吸氣延伸回正並逐節躺下；③重複4-6次，動作由脊椎分節帶動而非用手拉頸。', benefits: '進階版捲上動作，加強核心離心控制與脊椎分節力量。', mistakes: '用雙手猛力拉扯頸部代償，或坐起時借助甩動慣性。' },
  { id: 'e134', name: '雙直腿伸展 Double Straight Leg Stretch', equipment: 'mat', tags: ['core'], level: '高', category: '核心', instructions: '①仰臥捲肩離墊，雙手枕於後腦，雙腿伸直朝上；②吐氣雙腿下放至可控範圍，吸氣還原；③重複8-10次，全程下背貼墊不拱起。', benefits: '高階核心離心控制訓練，考驗深層腹肌穩定骨盆與腰椎的能力。', mistakes: '雙腿下放過低導致下背拱起離墊，或頸部過度用力前伸。' },
  { id: 'e135', name: '天鵝跳水 Swan Dive', equipment: 'mat', tags: ['upper', 'posture', 'full'], level: '高', category: '脊柱靈活', instructions: '①俯臥雙手置於胸側，延展脊椎進入天鵝姿；②吐氣鬆開雙手，身體如搖籃般前後擺動延伸，吸氣控制回穩；③重複4-6次，需良好背肌力量與核心控制。', benefits: '天鵝動作的動態進階版本，訓練背伸肌群力量與全身協調控制。', mistakes: '擺動失去控制過猛，或核心不足導致下背過度承壓。' },
  { id: 'e136', name: '剪刀式／單車式 Scissors / Bicycle', equipment: 'mat', tags: ['core', 'flexibility', 'full'], level: '高', category: '核心', instructions: '①仰臥捲肩離墊，雙腿朝上，雙手扶其中一腿小腿後側；②雙腿如踩單車般交替屈伸畫圈，配合呼吸節奏；③每方向重複8-10次。', benefits: '在剪刀式基礎上加入畫圈變化，全面訓練核心穩定與髖關節控制。', mistakes: '骨盆隨腿部動作大幅晃動，或節奏過快失去控制。' },
  { id: 'e137', name: '扭轉 The Twist', equipment: 'mat', tags: ['core', 'flexibility', 'full'], level: '高', category: '整合', instructions: '①側坐支撐成側板式，雙腿伸直疊放；②吐氣髖部上頂延伸，上方手臂穿過身體下方旋轉，吸氣打開回正；③重複4-5次，換邊。', benefits: '高階側鏈核心與旋轉控制訓練，同時考驗肩帶穩定與協調。', mistakes: '髖部下沉失去側板穩定，或旋轉時肩胛聳起代償。' },
  { id: 'e138', name: '腿部牽引—前撐 Leg Pull Front', equipment: 'mat', tags: ['core', 'upper', 'full'], level: '高', category: '整合', instructions: '①俯臥雙手撐地成平板式，身體成一直線；②吐氣單腿向上抬起，保持骨盆水平不旋轉，吸氣放下換邊；③每側重複4-6次。', benefits: '平板式基礎上加入抬腿變化，訓練核心抗旋轉與上肢支撐力量。', mistakes: '抬腿時骨盆旋轉或下沉，肩胛聳起失去穩定支撐。' },
  { id: 'e139', name: '摺刀式 Jackknife', equipment: 'mat', tags: ['core', 'full'], level: '高', category: '整合', instructions: '①仰臥雙腿伸直朝上預備；②吐氣捲動骨盆、雙腿向頭頂方向延伸至肩倒立姿，吸氣以核心控制逐節捲下；③重複3-4次，需良好脊椎分節與核心力量。', benefits: '高階核心捲動與脊椎逐節控制的整合動作，是進階指標動作之一。', mistakes: '用甩腿慣性完成而非核心主動捲動，或頸椎過度承重。' },
  { id: 'e140', name: '控制平衡 Control Balance', equipment: 'mat', tags: ['core', 'flexibility', 'full'], level: '高', category: '整合', instructions: '①仰臥捲動至肩倒立姿，雙手扶其中一腳踝；②吐氣雙腿交替上下交換位置，維持軀幹穩定不晃動；③每側重複3-4次，需良好柔軟度與核心控制。', benefits: '高階核心控制與柔軟度整合動作，考驗全身協調穩定能力。', mistakes: '軀幹隨換腿動作晃動，或頸椎承重過度。' },
  { id: 'e141', name: '回力棒 Boomerang', equipment: 'mat', tags: ['core', 'full', 'flexibility'], level: '高', category: '整合', instructions: '①坐姿雙腿交叉伸直，雙手置於體側；②吐氣捲動翻滾至肩倒立再捲回坐姿平衡，雙手向後畫弧延伸；③重複3-4次，動作流暢連貫。', benefits: '結合翻滾、平衡與延展的高階整合動作，是核心控制的綜合考驗。', mistakes: '翻滾速度過快失去控制，或坐姿平衡時軀幹晃動。' },
  { id: 'e142', name: '搖擺 Rocking', equipment: 'mat', tags: ['upper', 'flexibility', 'full'], level: '高', category: '整合', instructions: '①俯臥屈膝，雙手抓住腳踝外側；②吐氣延展脊椎、胸口與大腿離墊，前後搖擺，吸氣控制節奏；③持續4-6次搖擺，需良好背側柔軟度。', benefits: '高階脊椎伸展與前後動態平衡訓練，同時提升背側柔軟度。', mistakes: '頸部過度後仰用力，或搖擺幅度失控撞擊地面。' },
  { id: 'e143', name: '撐體 Push Up', equipment: 'mat', tags: ['upper', 'core', 'full'], level: '高', category: '整合', instructions: '①站姿脊椎前彎雙手著地，走至平板式；②屈肘下壓做伏地挺身，伸直手臂撐起；③走手回站姿並捲身站直，重複4-6次。', benefits: '結合脊椎關節化、平板支撐與上肢推力的經典整合收尾動作。', mistakes: '平板式時髖部下沉或過高，或下壓幅度不足未達訓練效果。' },

  /* ---------- REFORMER 塑身機 (下肢/核心/整合/脊柱靈活/中背/上肢/協調) ---------- */
  { id: 'e23', name: '腳部工作—平行 Footwork Parallel', equipment: 'reformer', tags: ['lower', 'full'], level: '初', category: '下肢', position: 'supine', instructions: '①仰臥雙腳平行踩踏板與髖同寬，脊椎中立；②吐氣蹬直雙腿（膝蓋不鎖死），吸氣屈膝回位；③重複8-10次，力量從腳掌均勻蹬出。', benefits: '熱身並訓練下肢肌力與骨盆穩定，是每堂課的固定開場動作。', mistakes: '雙腳踏出速度不一、膝蓋內夾外八，或大腿骨隨動作內外旋轉。', springs: '2-3條重彈簧（提供穩定支撐，讓學員先建立對位感覺）', teacherTip: '站於床尾正對學員雙腳，觀察腳掌均勻承重與膝蓋方向；可輕觸膝蓋外側提示對齊第二、三腳趾方向。', regression: '降低彈簧至更輕、雙腿蹬出幅度縮小，或允許膝蓋維持微屈不完全蹬直。', progression: '加重彈簧至僅1條、加入單腳交替蹬出，或蹬直時停留2秒再回位。', },
  { id: 'e24', name: '腳部工作—V字位 Footwork V-Position', equipment: 'reformer', tags: ['lower', 'full'], level: '初', category: '下肢', position: 'supine', instructions: '①雙腳跟併攏、腳掌打開呈V字，腳跟置於踏板邊緣；②吐氣蹬直雙腿並啟動大腿內側，吸氣屈膝回位；③重複8-10次，大腿內側全程收緊。', benefits: '加強大腿內側與臀部深層肌群啟動，改善腿型對位。', mistakes: '膝蓋往兩側過度打開超出腳尖方向，或腳跟分離失去併攏。', springs: '2-3條重彈簧' },
  { id: 'e25', name: '腳部工作—腳尖點桿 Toes on Bar', equipment: 'reformer', tags: ['lower'], level: '初', category: '下肢', position: 'supine', instructions: '①雙腳前腳掌踩踏板，腳跟懸空，雙腿與髖同寬；②吐氣蹬直雙腿並啟動大腿四頭肌，吸氣小幅度屈膝；③重複8-10次，避免猛力彈跳。', benefits: '加強足踝控制與小腿力量，同時減低對頭頸、中背的壓力。', mistakes: '用力踩蹬造成彈跳式回彈，或腳跟過度上下抖動失去穩定。', springs: '2條中至重彈簧' },
  { id: 'e26', name: '腳部工作—落踵與提踵 Lower & Lift', equipment: 'reformer', tags: ['lower', 'posture'], level: '初', category: '下肢', position: 'supine', instructions: '①仰臥，前腳掌踩腳踏桿，雙腿平行併攏，腳跟上提；②吸氣保持腳跟上提蹬直雙腿，呼氣腳跟落至腳踏桿下方（背屈），吸氣再上提（蹠屈）；③呼氣保持腳跟上提屈膝回位，每次增加一組落踵提踵，最多重複6次。', benefits: '訓練足踝穩定與小腿離心控制，改善提踵落地時的下肢對位。', mistakes: '落踵與提踵時大腿骨內旋或外旋代償，或腳趾代替蹠球部承重。', springs: '2-3條重彈簧', teacherTip: '站於床尾觀察雙踵是否保持併攏、所有腳趾蹠球部是否均勻承重；可輕觸腳跟引導下壓幅度。' },
  { id: 'e27', name: '百次 Hundred on Reformer', equipment: 'reformer', tags: ['core', 'full'], level: '初', category: '核心', position: 'supine', instructions: '①仰臥雙手持彈簧把手，屈膝或伸直腿依程度調整；②捲肩離床，雙臂平行地面上下泵動；③吸氣5下、呼氣5下，重複8-10組。', benefits: '加入彈簧阻力，強化核心耐力與呼吸節奏的協調控制。', mistakes: '肩頸過度緊繃聳起，或彈簧阻力太重令肋骨外凸代償。', springs: '1條輕彈簧（阻力太重會令肩頸代償）', teacherTip: '站於床頭側邊，視線與學員頭部同高，觀察肋骨是否隨手臂泵動而外凸；可用口令「肋骨往下沉」配合輕觸胸骨下緣提示。', regression: '雙腿屈膝呈桌面姿降低核心負荷，或頭頸放回墊上只做手臂泵動。', progression: '雙腿伸直放低角度增加槓桿臂，或加重彈簧考驗肩胛穩定。', },
  { id: 'e28', name: '短箱—前彎 Short Box Round Back', equipment: 'reformer', tags: ['core', 'flexibility', 'posture'], level: '中', category: '核心', position: 'seated', instructions: '①坐於短箱上，雙腳固定於踏杆下，脊椎延長；②吐氣捲尾骨向後圓背至極限再緩慢捲回坐直；③重複4-6次，動作由骨盆帶動。', benefits: '訓練脊椎逐節控制與深層腹肌，同時改善坐姿體態。', mistakes: '用上背猛力後仰而非骨盆先啟動，或雙腳離開固定位置。', springs: '2條中彈簧（固定箱體，非承重用途）', teacherTip: '蹲於學員側邊與骨盆同高，一手可輕放於薦骨提示捲動起始點，觀察是否逐節捲動而非整段脊椎同時傾倒。', regression: '屈膝幅度增加、減少後傾角度，或雙手抱胸降低上肢負荷。', progression: '雙手過頭持桿增加槓桿臂，或加入斜向旋轉挑戰抗旋轉控制。', },
  { id: 'e29', name: '短箱—側彎 Short Box Side Bend', equipment: 'reformer', tags: ['core', 'flexibility'], level: '中', category: '核心', position: 'seated', instructions: '①坐於短箱，雙手交扣置於腦後，脊椎延長；②吐氣向一側側屈，感受對側腰際延展，吸氣回正；③左右交替重複4-5次。', benefits: '訓練側腹肌群力量並提升脊椎側向活動度。', mistakes: '身體前後傾斜偏離側屈平面，或借用手臂拉扯代替腰腹發力。', springs: '2條中彈簧' },
  { id: 'e30', name: '協調 Coordination', equipment: 'reformer', tags: ['core', 'full'], level: '中', category: '核心', position: 'supine', instructions: '①仰臥捲肩離床，雙手持把手雙臂前伸，雙腿伸直併攏；②吐氣雙腿屈膝再蹬直畫圈打開再併攏，同時雙臂向外打開再合攏；③重複4-6次，四肢與核心同步協調。', benefits: '上下肢同步協調配合核心穩定，是考驗控制力的整合動作。', mistakes: '上下肢節奏不同步，或核心失去捲曲支撐令頭頸下墜。', springs: '1條輕至中彈簧', teacherTip: '站於床尾，觀察雙腿畫圈與雙臂開合是否同步完成；口令可用「腿開、臂開，一起收」統一節奏。', regression: '雙腿保持屈膝不完全蹬直，雙臂動作幅度縮小。', progression: '加大雙腿蹬直畫圈的幅度，或加重彈簧增加控制難度。', },
  { id: 'e31', name: '星形姿 Star', equipment: 'reformer', tags: ['full', 'core', 'upper'], level: '高', category: '整合', position: 'kneeling', instructions: '①側身跪姿於床上，一手撐把手，身體成一直線；②吐氣同時外側手腳向外延伸抬起成星形，吸氣收回；③重複4-5次，換邊，全程肩胛骨穩定不聳肩。', benefits: '全身協調與側鏈核心力量的高階整合動作，同時訓練平衡感。', mistakes: '支撐肩聳肩或肘超伸鎖死，或髖部下沉失去一直線。', springs: '1條輕彈簧（支撐力太強會降低平衡挑戰）' },
  { id: 'e32', name: '美人魚 Mermaid on Reformer', equipment: 'reformer', tags: ['flexibility', 'posture', 'upper'], level: '中', category: '脊柱靈活', position: 'seated', instructions: '①側坐於床邊，一手扶把手、一腿屈膝、一腿向後伸展；②吐氣身體側屈伸展，遠側手臂畫弧過頭；③吸氣回正，換邊重複3-4次。', benefits: '側向伸展肋廓活動度，改善左右體態不對稱。', mistakes: '身體前傾偏離側屈平面，或利用彈簧回彈猛力甩動。', springs: '1條輕彈簧' },
  { id: 'e33', name: '大象 Elephant', equipment: 'reformer', tags: ['lower', 'core', 'flexibility'], level: '中', category: '下肢', position: 'standing', instructions: '①站姿雙手扶橫桿，雙腳踩踏板，臀部後推成類倒V字；②吐氣推床遠離，吸氣屈膝拉近，脊椎維持中立延長；③重複6-8次。', benefits: '伸展腿後肌群同時訓練核心穩定與肩帶控制力。', mistakes: '背部圓拱失去脊椎中立，或膝蓋鎖死伸展過度。', springs: '2條中彈簧', teacherTip: '蹲於床邊側面，視線與學員背部同高，檢查脊椎是否維持一直線；可輕觸下背提示「背部保持長而平」。', regression: '雙腳距離拉近床頭、減少推床幅度，膝蓋可微屈。', progression: '單腳版本進行、或加入停留2-3秒的離心控制。', },
  { id: 'e34', name: '膝伸展系列 Knee Stretches', equipment: 'reformer', tags: ['core', 'lower'], level: '中', category: '核心', position: 'kneeling', instructions: '①跪姿於床上，雙手扶橫桿，膝蓋在肩膀正下方；②吐氣推床遠離（圓背或平背依變化），吸氣拉回；③重複6-8次，核心全程穩定。', benefits: '跪姿訓練核心與肩帶穩定，同時強化髖屈肌控制力。', mistakes: '下背塌陷或過度拱起，或推床時失去肩胛穩定。', springs: '2條中彈簧', regression: '減少推床距離，或改為雙膝跪穩不移動只做上肢動作熱身。', progression: '加入單腳離開踏板的單腿版本，或加大推床幅度。', },
  { id: 'e35', name: '跑步 Running', equipment: 'reformer', tags: ['lower', 'full'], level: '初', category: '下肢', position: 'supine', instructions: '①仰臥雙腳前腳掌踩踏板，雙腿伸直；②吐氣蹬直交替提踵落踵，如跑步般節奏；③持續8-10次每側。', benefits: '訓練小腿與踝關節活動度，模擬跑步動作提升踝關節控制。', mistakes: '節奏過快失去落地控制，或大腿骨隨動作內外旋轉。', springs: '2-3條中重彈簧' },
  { id: 'e36', name: '骨盆提升 Pelvic Lift', equipment: 'reformer', tags: ['booty', 'lower', 'core'], level: '中', category: '下肢', position: 'supine', instructions: '①仰臥雙腳踩踏板與髖同寬，屈膝；②吐氣依序捲尾骨、腰、背離床成橋式，吸氣逐節放回；③重複8-10次，全程啟動臀部與腿後肌群。', benefits: '針對臀大肌與後側鏈的橋式進階動作，強化臀腿力量。', mistakes: '用腰部過度伸展代替臀肌發力，或膝蓋內夾失去對位。', springs: '1-2條中彈簧' },
  { id: 'e37', name: '側劈腿 Side Splits', equipment: 'reformer', tags: ['lower', 'booty', 'full'], level: '高', category: '下肢', position: 'standing', instructions: '①站於床邊踏板上，一腳踩床、一腳踩地面，身體側對床頭；②吐氣推床遠離做側向劈腿延展，吸氣拉回；③重複6-8次，換邊。', benefits: '訓練髖內收/外展肌群，加強下肢力量與動態側向穩定。', mistakes: '推床速度過快失去控制，或骨盆隨動作旋轉偏移。', springs: '1條輕彈簧（務必先確認學員熟悉煞車與安全機制）' },
  { id: 'e38', name: '長延展系列 Long Stretch Series', equipment: 'reformer', tags: ['full', 'core', 'upper'], level: '高', category: '整合', position: 'plank', instructions: '①平板式雙手扶橫桿，肩膀在手腕正上方，身體成一直線；②吐氣推床遠離，吸氣拉回，全程核心與肩胛穩定；③重複6-8次。', benefits: '平板式系列強化全身肌動鏈與肩胛穩定，是進階整合訓練。', mistakes: '髖部下沉塌腰或過高翹臀，或肩胛聳起失去穩定。', springs: '1條輕彈簧（彈簧越輕、平板穩定挑戰越大）', teacherTip: '蹲於床側與髖部同高，觀察身體是否維持一直線；口令「拉長成一塊板」配合輕觸腰部提示避免塌陷。', regression: '雙膝跪於踏板上進行（Kneeling Long Stretch），縮短槓桿臂降低核心負荷。', progression: '單手版本、或加入推床時單腳離開踏板增加不穩定挑戰。', },
  { id: 'e39', name: '中背部系列 Mid-Back Series', equipment: 'reformer', tags: ['upper', 'posture', 'core'], level: '中', category: '上肢', position: 'supine', instructions: '①仰臥中立位，雙手持拉環，雙腿抬至桌面位或斜上方伸直；②吐氣雙臂由天花板方向下壓至身側，依次做肱三頭肌下壓、直臂下壓、45度、側展、畫圈等變化；③吸氣控制回位，每個變化5次，全程肩胛與骨盆穩定。', benefits: '強化背闊肌、肱三頭肌與肩胛穩定肌群，同時考驗四肢移動時的核心穩定。', mistakes: '手臂下壓時肋骨外翻、下背拱起，或聳肩借力。', springs: '1條輕至中彈簧', regression: '雙腳踩於床面或腳踏桿，降低核心負荷。', progression: '雙腿伸直放低角度，或配合胸椎捲起進行。' },
  { id: 'e40', name: '划船系列 Rowing Series', equipment: 'reformer', tags: ['upper', 'core'], level: '中', category: '上肢', position: 'seated', instructions: '①坐姿雙手持彈簧把手，脊椎延長；②依序做前彎、後仰、側轉等划船變化，配合呼吸節奏；③每個變化重複4-6次。', benefits: '結合背部力量與脊椎活動度，全面訓練上肢與核心協調。', mistakes: '划船時聳肩或圓背，失去脊椎延長的姿態。', springs: '1條輕彈簧', teacherTip: '坐或蹲於學員正前方，方便觀察脊椎是否維持延長；示範時可強調「先延伸、後動作」的順序。', regression: '減少划船幅度，或先以雙手扶膝取代持彈簧把手練習動作模式。', progression: '加重彈簧、或加入軀幹旋轉版本的划船變化。', },
  { id: 'e41', name: '手臂彈簧—二頭肌捲曲 Biceps Curl', equipment: 'reformer', tags: ['upper'], level: '初', category: '上肢', position: 'seated', instructions: '①坐姿或站姿，雙手持彈簧把手，手肘貼近身側；②吐氣彎曲手肘捲曲彈簧，吸氣緩慢伸直；③重複8-10次，肩胛保持穩定。', benefits: '訓練二頭肌力量，同時維持肩胛骨中立不聳肩。', mistakes: '借用肩膀前後晃動代替手肘發力，或手肘遠離身體。', springs: '1條輕彈簧' },
  { id: 'e42', name: '手臂彈簧—飛翔動作 Chest Expansion', equipment: 'reformer', tags: ['upper', 'posture'], level: '初', category: '上肢', position: 'kneeling', instructions: '①跪姿或站姿，雙手向後持彈簧把手；②吐氣手臂向後延伸同時胸口微微擴張、頭轉向一側，吸氣回正；③重複6-8次，換轉頭方向。', benefits: '訓練肩胛後側穩定肌群，改善圓肩並強化背部力量。', mistakes: '聳肩或腰部過度後仰代償，而非胸椎與肩胛主動伸展。', springs: '1條輕彈簧' },
  { id: 'e43', name: '側躺手臂畫圈 Side Lying Arm Circles', equipment: 'reformer', tags: ['upper', 'posture'], level: '中', category: '協調', position: 'sidelying', instructions: '①側臥於床上，下方手臂支撐頭部，上方手臂持彈簧把手；②手臂向前、向上、向後畫大圈，配合呼吸節奏；③每方向5-6圈，換邊。', benefits: '訓練肩關節活動度與肩胛穩定肌群協調控制。', mistakes: '軀幹隨手臂畫圈晃動，或畫圈幅度不均勻。', springs: '1條輕彈簧' },
  { id: 'e44', name: '蛙泳式 Frog on Reformer', equipment: 'reformer', tags: ['lower', 'booty', 'core'], level: '中', category: '下肢', position: 'supine', instructions: '①仰臥雙腳踩踏板，膝蓋外展如蛙式預備；②吐氣蹬直雙腿並內收併攏，吸氣屈膝外展回位；③重複8-10次。', benefits: '訓練髖關節屈伸控制配合核心穩定，雕塑大腿內側線條。', mistakes: '骨盆隨腿部動作晃動，或膝蓋外展幅度左右不對稱。', springs: '1-2條中彈簧' },
  { id: 'e45', name: '仰泳準備動作 Backstroke Prep', equipment: 'reformer', tags: ['core', 'upper', 'flexibility'], level: '高', category: '整合', position: 'supine', instructions: '①仰臥持彈簧把手，雙腿伸直併攏；②吐氣捲肩離床同時雙臂畫大圈向前延伸，雙腿微微抬起；③吸氣回落，重複4-6次。', benefits: '脊椎伸展與肩帶活動度的高階整合訓練，考驗全身協調。', mistakes: '頸部過度前伸用力，或雙腿抬得過高造成下背代償。', springs: '1條輕彈簧' },
  { id: 'e46', name: '胃部按摩系列 Stomach Massage Series', equipment: 'reformer', tags: ['core', 'lower', 'posture'], level: '中', category: '核心', position: 'seated', instructions: '①坐姿雙腳踩踏板，雙手輕扶大腿或床邊，脊椎中立或圓背；②吐氣蹬直雙腿，吸氣屈膝回位，全程骨盆穩定不晃動；③重複8-10次。', benefits: '坐姿下訓練骨盆與脊椎控制，同時改善日常坐姿體態。', mistakes: '蹬腿時骨盆後傾塌陷，或聳肩失去坐姿延長。', springs: '2條中彈簧', regression: '減少蹬腿幅度，或先以雙手扶大腿取得額外支撐。', progression: '雙手放開床邊改為交叉胸前，加大核心控制難度。', },
  { id: 'e111', name: '半圓 Semi Circle', equipment: 'reformer', tags: ['core', 'flexibility', 'full'], level: '高', category: '整合', position: 'supine', instructions: '①肩靠床頭肩靠架，雙腳踩踏板呈橋式預備；②吐氣推床同時髖部上頂延伸成反向弧線，吸氣拉床回位並逐節捲下；③重複4-6次，全程核心與肩橋穩定控制。', benefits: '高階脊椎伸展與髖伸展整合訓練，同時考驗核心離心控制。', mistakes: '頸部過度承重代償，或推床速度過快失去脊椎逐節控制。', springs: '1條輕彈簧' },
  { id: 'e112', name: '划船系列—圓背 Rowing Back I (Round Back)', equipment: 'reformer', tags: ['core', 'upper', 'flexibility'], level: '中', category: '上肢', position: 'seated', instructions: '①坐姿面向床尾，雙手持彈簧繩，脊椎圓背捲曲；②吐氣手臂向前伸展同時軀幹前彎，吸氣手肘彎曲拉回；③重複6-8次。', benefits: '結合脊椎屈曲與背部力量，訓練核心與上肢協調控制。', mistakes: '圓背幅度不足或聳肩，未能真正啟動深層腹肌。', springs: '1條輕彈簧', regression: '圓背幅度減小，動作放慢並縮短活動範圍。', progression: '加重彈簧，或加入停留延展再捲回的離心控制。', },
  { id: 'e113', name: '划船系列—平背 Rowing Back II (Flat Back)', equipment: 'reformer', tags: ['upper', 'posture', 'core'], level: '中', category: '上肢', position: 'seated', instructions: '①坐姿脊椎延長呈平背，雙手持彈簧繩；②吐氣手臂向前推展同時保持脊椎中立，吸氣拉回；③重複6-8次。', benefits: '在脊椎中立位訓練背部與核心協調控制力，改善坐姿穩定度。', mistakes: '軀幹隨手臂動作前後晃動，失去脊椎中立。', springs: '1條輕彈簧' },
  { id: 'e114', name: '足跟伸展與體操前彎 Tendon Stretch & Gymnast', equipment: 'reformer', tags: ['lower', 'full', 'flexibility'], level: '高', category: '下肢', position: 'standing', instructions: '①站姿前腳掌踩踏板，雙手扶橫桿；②吐氣蹬直雙腿提踵並延伸至體操前彎姿，吸氣屈膝回位；③重複4-6次，需良好足踝與核心控制。', benefits: '進階足踝力量與全身延展控制的整合訓練。', mistakes: '提踵時膝蓋鎖死，或前彎時失去核心支撐令腰椎代償。', springs: '2條中彈簧' },
  { id: 'e115', name: '踏板滑行 Scooter', equipment: 'reformer', tags: ['lower', 'core', 'full'], level: '中', category: '下肢', position: 'standing', instructions: '①單腳站於踏板，另一腳踩地面推動，雙手扶橫桿；②吐氣推床滑行延伸，吸氣屈膝拉回；③重複8-10次，換邊。', benefits: '訓練單腳下肢力量、平衡感與核心穩定的動態控制。', mistakes: '站立腿膝蓋內夾，或推床節奏過快失去控制。', springs: '1條中彈簧' },
  { id: 'e116', name: '腳套繩系列 Feet in Straps Series', equipment: 'reformer', tags: ['lower', 'core', 'booty'], level: '中', category: '下肢', position: 'supine', instructions: '①仰臥雙腳套入繩環，雙腿朝上伸直；②依序做開合、畫圈、上下擺動等變化，骨盆穩定不晃動；③每個變化8-10次。', benefits: '髖關節多方向控制訓練，同時強化核心與骨盆穩定。', mistakes: '骨盆隨腿部動作晃動，或雙腿高度左右不一致。', springs: '1-2條中彈簧' },

  /* ---------- TOWER 凱迪拉克 ---------- */
  { id: 'e47', name: '捲桿系列 Roll Back Bar', equipment: 'tower', tags: ['core', 'posture', 'flexibility'], level: '初', category: '核心', instructions: '①坐姿雙手持橫桿，雙腳固定，脊椎延長；②吐氣捲尾骨向後逐節躺下至極限，吸氣逐節捲回坐直；③重複4-6次，配合彈簧回饋控制速度。', benefits: '脊椎逐節控制配合彈簧回饋，建立核心與體態覺察。', mistakes: '用手臂拉桿借力躺下，而非脊椎逐節主動控制。', springs: '2條輕彈簧（提供適度回饋阻力）', teacherTip: '坐或蹲於學員側邊，視線與脊椎同高，觀察是否逐節捲動；可用手指沿脊椎輕點示意捲動順序。' },
  { id: 'e48', name: '仰臥腿部彈簧 Supine Leg Springs', equipment: 'tower', tags: ['lower', 'booty', 'core'], level: '初', category: '下肢', instructions: '①仰臥雙腳掛於彈簧繩，雙腿伸直朝上；②依序做開合、畫圈、上下擺動等變化，骨盆保持穩定；③每個變化8-10次。', benefits: '髖關節多方向活動同時穩定骨盆，適合各程度學員入門。', mistakes: '骨盆隨腿部動作左右晃動，或動作幅度過大失去控制。', springs: '1條輕彈簧（左右各一）' },
  { id: 'e49', name: '呼吸/手臂彈簧 Breathing & Arm Springs', equipment: 'tower', tags: ['upper', 'relax', 'posture'], level: '初', category: '上肢', instructions: '①仰臥或坐姿，雙手持彈簧把手向上；②吐氣手臂下壓延伸，同時感受胸廓呼吸擴張，吸氣回正；③重複6-8次。', benefits: '肩胛穩定與呼吸調節訓練，有效改善圓肩並降低肩頸張力。', mistakes: '手臂下壓時聳肩，或呼吸與動作節奏不同步。', springs: '1條輕彈簧' },
  { id: 'e50', name: '猴子 Monkey', equipment: 'tower', tags: ['core', 'full', 'booty'], level: '中', category: '整合', instructions: '①站於床上呈深蹲姿，雙手扶懸吊桿；②吐氣延伸脊椎微微站高，吸氣屈膝深蹲回位；③重複6-8次，全程核心穩定。', benefits: '懸吊深蹲姿訓練下肢力量與核心整合，同時提升平衡感。', mistakes: '膝蓋內夾或超過腳尖，或脊椎圓拱失去中立。', springs: '依懸吊桿設定，通常1條中彈簧輔助' },
  { id: 'e51', name: '推桿系列 Push Through Bar', equipment: 'tower', tags: ['upper', 'core', 'full'], level: '中', category: '上肢', instructions: '①坐姿或站姿雙手持推桿，脊椎延長；②吐氣手臂下推延伸同時核心穩定，吸氣緩慢回正；③重複8-10次。', benefits: '上肢推拉力量與核心穩定的整合訓練，強化肩帶控制力。', mistakes: '借用軀幹前後晃動代替手臂與核心發力。', springs: '1-2條中彈簧', teacherTip: '站於學員側前方，觀察推桿時軀幹是否維持中立不晃動；可輕觸肋骨架提示「肋骨不要跟著手推出去」。' },
  { id: 'e52', name: '側臥腿部彈簧 Side Lying Leg Springs', equipment: 'tower', tags: ['lower', 'booty'], level: '中', category: '下肢', instructions: '①側臥於床邊，上方腳掛彈簧繩；②吐氣腿向外展延伸，吸氣內收回位；③重複8-10次，換邊，軀幹保持穩定不晃動。', benefits: '側向髖外展訓練，雕塑臀線並強化髖側穩定肌群。', mistakes: '借用髖部翻轉代替腿部發力，或上身跟著晃動。', springs: '1條輕彈簧' },
  { id: 'e53', name: '站姿懸吊伸展 Standing Tower Stretch', equipment: 'tower', tags: ['flexibility', 'relax', 'posture'], level: '初', category: '脊柱靈活', instructions: '①站於床邊，雙手扶懸吊桿或框架；②吐氣身體向下向前延伸伸展脊椎與髖後側，吸氣緩慢回正；③停留3-4個呼吸，適合作收操舒緩。', benefits: '站姿下同時伸展脊椎與髖側，是理想的收操舒緩動作。', mistakes: '膝蓋鎖死伸展過度，或下背過度圓拱失去控制。', springs: '免彈簧（純支撐伸展）' },
  { id: 'e54', name: '懸吊系列 Hanging Series', equipment: 'tower', tags: ['full', 'upper', 'core'], level: '高', category: '整合', instructions: '①雙手抓握懸吊桿，雙腳固定或懸空；②核心穩定下緩慢做脊椎減壓伸展或抬腿動作；③依程度停留或重複3-4次，需有經驗導師從旁指導。', benefits: '進階倒懸吊訓練，減壓脊椎並考驗核心與握力控制。', mistakes: '握力不足時勉強嘗試，或肩胛失去穩定導致聳肩代償。', springs: '免彈簧或視乎懸吊裝置設定', teacherTip: '全程站於學員身側隨時準備扶助，特別留意血壓、頭暈等禁忌症，第一次嘗試務必從低幅度開始。' },
  { id: 'e55', name: '站姿蹬腿 Standing Footwork', equipment: 'tower', tags: ['lower', 'full'], level: '初', category: '下肢', instructions: '①站姿一腳踩床踏板，一腳站地面，雙手扶框架；②吐氣蹬直踩踏腿，吸氣屈膝回位；③重複8-10次，換邊。', benefits: '訓練單腳下肢力量與站姿平衡穩定。', mistakes: '站立腿膝蓋鎖死，或身體重心偏移失去平衡。', springs: '1條重彈簧' },
  { id: 'e56', name: '仰臥手臂彈簧劃圈 Supine Arm Circles', equipment: 'tower', tags: ['upper', 'posture'], level: '初', category: '上肢', instructions: '①仰臥雙手持彈簧把手向兩側平舉；②手臂緩慢向上、向內畫大圈至體側，配合呼吸；③每方向5-6圈。', benefits: '訓練肩關節活動度同時強化肩胛穩定肌群。', mistakes: '畫圈時聳肩，或軀幹隨手臂晃動失去穩定。', springs: '1條輕彈簧' },
  { id: 'e57', name: '跪姿臀部彈簧 Kneeling Hip Springs', equipment: 'tower', tags: ['booty', 'lower'], level: '中', category: '下肢', instructions: '①四足跪姿，一腳掛彈簧繩向後伸直；②吐氣腿向後上方伸展延伸，吸氣緩慢回位；③重複8-10次，換邊，骨盆保持水平不晃動。', benefits: '針對臀大肌的跪姿伸展訓練，強化臀腿力量與骨盆穩定。', mistakes: '借用腰部過度伸展代替臀肌發力，骨盆左右晃動。', springs: '1條輕至中彈簧' },
  { id: 'e58', name: '坐姿划船 Seated Rowing on Tower', equipment: 'tower', tags: ['upper', 'core'], level: '中', category: '上肢', instructions: '①坐姿雙手持彈簧把手，脊椎延長；②吐氣手臂向後划船同時夾背，吸氣緩慢回正；③重複8-10次。', benefits: '強化背部與肩胛後側肌群，改善圓肩並提升坐姿穩定。', mistakes: '划船時圓背或聳肩，未能真正啟動背部肌群。', springs: '1條中彈簧' },
  { id: 'e59', name: '反向撐體 Reverse Push Through', equipment: 'tower', tags: ['upper', 'core', 'full'], level: '高', category: '整合', instructions: '①背對床坐姿雙手反握推桿；②吐氣手臂下壓同時身體向前延伸抬高，吸氣緩慢回正；③重複4-6次，需良好核心與肩帶控制。', benefits: '高階整合動作，同時訓練上肢推力、核心與柔軟度。', mistakes: '肩胛失去穩定聳起，或核心不足導致腰椎代償。', springs: '1條中彈簧' },
  { id: 'e60', name: '站姿懸吊胸椎伸展 Standing Chest Expansion', equipment: 'tower', tags: ['upper', 'posture', 'relax'], level: '初', category: '上肢', instructions: '①站姿雙手向後持彈簧把手；②吐氣手臂向後延伸，胸口微微擴張抬頭延伸頸椎，吸氣回正；③重複6-8次，適合作為舒緩動作。', benefits: '站姿下伸展胸椎並降低肩頸張力，適合久坐人士。', mistakes: '腰部過度後仰代償，而非胸椎主動伸展。', springs: '1條輕彈簧' },
  { id: 'e117', name: '站姿手臂訓練—面向內 Standing Arm Work Facing In', equipment: 'tower', tags: ['upper', 'core'], level: '中', category: '上肢', instructions: '①站姿面向床架，雙手持彈簧把手，脊椎延長；②吐氣手臂下壓或向後延伸同時核心穩定，吸氣回正；③重複8-10次。', benefits: '站姿下訓練上肢力量同時考驗核心抗代償穩定。', mistakes: '身體隨手臂動作前後晃動，失去站姿穩定。', springs: '1條輕彈簧' },
  { id: 'e118', name: '展翅式 Spread Eagle', equipment: 'tower', tags: ['upper', 'core', 'flexibility'], level: '高', category: '整合', instructions: '①側坐床邊，雙腳固定，雙手持彈簧把手向外展開；②吐氣身體向側後方延伸展開如展翅，吸氣回正；③重複4-6次，換邊。', benefits: '高階側鏈延展與肩帶力量整合訓練，同時提升柔軟度。', mistakes: '髖部失去固定滑動，或肩胛聳起代償。', springs: '1條輕彈簧' },
  { id: 'e119', name: '鸚鵡式 Parakeet', equipment: 'tower', tags: ['core', 'flexibility', 'upper'], level: '高', category: '整合', instructions: '①仰臥懸吊姿，雙腳套入繩環，雙手持彈簧把手；②核心穩定下同步協調上下肢動作，維持脊椎延長；③依動作變化重複4-6次，需良好核心控制。', benefits: '高階全身協調與核心穩定整合動作，訓練難度較高。', mistakes: '核心不足時腰椎代償拱起，動作節奏過快失去控制。', springs: '1條輕彈簧' },
  { id: 'e120', name: '魔術師 Magician', equipment: 'tower', tags: ['core', 'lower', 'full'], level: '高', category: '整合', instructions: '①仰臥或坐姿，雙腳套入繩環，雙手扶穩定點；②核心穩定下雙腿伸展畫弧至不同高度與角度，維持骨盆中立；③重複4-6次。', benefits: '高階髖關節活動度與核心穩定的整合訓練。', mistakes: '骨盆隨腿部動作晃動，或動作幅度超出控制範圍。', springs: '1條輕彈簧' },
  { id: 'e121', name: '坐姿拉下 Seated Pull Down', equipment: 'tower', tags: ['upper', 'core'], level: '中', category: '上肢', instructions: '①坐姿雙手向上持彈簧把手，脊椎延長；②吐氣手臂向下拉至體側同時夾背，吸氣緩慢回正；③重複8-10次。', benefits: '訓練背闊肌與肩胛下沉控制力，改善圓肩與提升坐姿穩定。', mistakes: '拉下時聳肩或圓背，未能真正啟動背闊肌。', springs: '1條中彈簧' },
  { id: 'e122', name: '坐姿前推 Seated Push Through Front', equipment: 'tower', tags: ['upper', 'core', 'posture'], level: '中', category: '上肢', instructions: '①坐姿面向床架，雙手持推桿，脊椎延長；②吐氣手臂向前下推展同時核心穩定，吸氣緩慢回正；③重複8-10次。', benefits: '訓練上肢推力與核心穩定的協調控制，改善坐姿體態。', mistakes: '推桿時軀幹前後晃動，或聳肩代償。', springs: '1條中彈簧' },
  { id: 'e123', name: '上肢神經滑動 Upper Quadrant Neural Mobilization', equipment: 'tower', tags: ['upper', 'relax', 'flexibility'], level: '初', category: '上肢', instructions: '①坐姿或站姿，手持彈簧把手輕度阻力；②緩慢配合頸部與手臂角度變化做溫和神經滑動動作，避免牽拉過度；③每方向重複5-6次，動作宜輕柔緩慢。', benefits: '溫和活動上肢神經滑動度，適合手臂麻痺感或肩頸緊繃人士。', mistakes: '動作幅度過大或速度過快，造成神經過度牽拉不適。', springs: '免彈簧或極輕彈簧' },

  /* ---------- LADDER BARREL 梯桶 ---------- */
  { id: 'e61', name: '天鵝式（桶上）Swan on Barrel', equipment: 'ladder', tags: ['upper', 'posture', 'flexibility'], level: '中', category: '脊柱靈活', instructions: '①俯臥於梯桶上，雙手扶梯級，骨盆貼合桶面；②吐氣延展脊椎、胸口離桶伸展，吸氣緩慢下降；③重複4-6次。', benefits: '胸椎伸展加強版，強化背伸肌群並改善駝背體態。', mistakes: '靠手臂猛力撐起而非背肌主動延展，聳肩代償。' },
  { id: 'e62', name: '側伸展 Side Stretch on Barrel', equipment: 'ladder', tags: ['flexibility', 'posture', 'relax'], level: '初', category: '脊柱靈活', instructions: '①側坐於梯桶旁，一手扶梯級，脊椎延長；②吐氣身體側向延伸伸展，吸氣回正；③換邊重複3-4次。', benefits: '肋廓側向伸展，改善高低肩與左右體態不對稱。', mistakes: '身體前後傾斜偏離側屈平面，或用力甩動而非緩慢延伸。' },
  { id: 'e63', name: '爬梯 Ladder Climb', equipment: 'ladder', tags: ['lower', 'core', 'full'], level: '中', category: '整合', instructions: '①站姿面對梯級，雙手扶高處梯級；②依序踩踏不同高度梯級如爬梯，核心穩定軀幹；③上下重複6-8次。', benefits: '功能性下肢力量與核心協調訓練，提升日常爬樓梯能力。', mistakes: '軀幹過度前傾失去脊椎延長，或踩踏節奏過快失去控制。' },
  { id: 'e64', name: '桶上腿部畫圈 Leg Circles on Barrel', equipment: 'ladder', tags: ['lower', 'booty'], level: '中', category: '下肢', instructions: '①仰臥於梯桶上，一腿伸直朝天花板，另一腿踩地穩定；②骨盆穩定下畫圈，方向漸大；③每方向5-6圈，換邊。', benefits: '髖關節活動度訓練，配合桶面弧度增加脊椎伸展感受。', mistakes: '骨盆隨畫圈晃動，或桶上支撐不穩定導致身體滑動。' },
  { id: 'e65', name: '背泳預備 Backstroke Prep on Barrel', equipment: 'ladder', tags: ['core', 'upper', 'flexibility'], level: '高', category: '整合', instructions: '①坐於梯桶前緣，身體向後懸空延伸，雙腿伸直；②雙臂畫大圈配合核心穩定，維持懸空姿勢；③重複4-6次，需良好核心控制。', benefits: '脊椎伸展與肩帶活動度整合訓練，屬進階挑戰動作。', mistakes: '核心不足時腰椎代償拱起，或頸部過度用力。' },
  { id: 'e66', name: '桶上伸展放鬆 Barrel Stretch & Release', equipment: 'ladder', tags: ['relax', 'flexibility', 'posture'], level: '初', category: '整合', instructions: '①仰臥或俯臥於梯桶上，讓脊椎自然貼合桶面弧度；②雙手雙腳放鬆下垂，深呼吸停留；③停留4-6個呼吸，是收操舒緩的首選。', benefits: '被動式脊椎伸展，有效釋放全天累積的脊椎壓力。', mistakes: '身體僵硬抗拒下沉，未能真正放鬆交給桶面支撐。' },
  { id: 'e67', name: '側坐伸展 Side Sitting Stretch', equipment: 'ladder', tags: ['flexibility', 'posture'], level: '初', category: '脊柱靈活', instructions: '①側坐於梯桶旁，雙腿屈膝疊放一側；②吐氣上半身向前向側延伸，吸氣回正；③停留3-4個呼吸，換邊。', benefits: '溫和伸展側腰與髖部，改善坐姿引致的側向緊繃。', mistakes: '肩膀聳起緊張，或勉強伸展超出舒適範圍。' },
  { id: 'e68', name: '站姿髖外展 Standing Hip Abduction', equipment: 'ladder', tags: ['lower', 'booty'], level: '中', category: '下肢', instructions: '①站姿側對梯桶，一手扶梯級穩定；②外側腿向外側抬起至舒適高度，緩慢放下；③重複8-10次，換邊，骨盆保持水平。', benefits: '訓練臀中肌側向穩定力量，改善髖側對位。', mistakes: '借用髖部側傾代替腿部發力，或抬腿過高導致骨盆傾斜。' },
  { id: 'e69', name: '桶上捲腹 Barrel Curl', equipment: 'ladder', tags: ['core'], level: '中', category: '核心', instructions: '①仰臥於梯桶上，脊椎貼合桶面，雙手輕扶頭側；②吐氣捲腹離桶，吸氣緩慢下降貼回桶面；③重複8-10次。', benefits: '在延展的起始位置訓練腹部力量，加深核心訓練幅度。', mistakes: '用頸部力量拉起上身，而非腹肌主動捲曲。' },
  { id: 'e70', name: '跨坐平衡 Straddle Balance', equipment: 'ladder', tags: ['core', 'full'], level: '高', category: '整合', instructions: '①跨坐於梯桶上，雙腿打開伸直，雙手側平舉；②核心穩定下緩慢後傾至平衡點，停留呼吸；③停留3-4個呼吸，緩慢回正。', benefits: '高階核心平衡訓練，同時提升髖部柔軟度與專注力。', mistakes: '後傾過度失去控制，或髖部緊繃導致腿部無法伸直。' },
  { id: 'e124', name: '翻滾/肩倒立 Rollover / Shoulder Stand', equipment: 'ladder', tags: ['core', 'flexibility', 'full'], level: '高', category: '整合', instructions: '①仰臥於梯桶前地面，雙腿伸直朝上；②核心捲動將雙腿翻越頭頂至肩倒立姿，脊椎逐節支撐；③吸氣停留，呼氣逐節捲回，重複3-4次，需良好頸椎與核心控制。', benefits: '高階脊椎逐節控制與核心力量的整合訓練，提升柔軟度。', mistakes: '頸椎過度承重代償，或翻滾速度過快失去逐節控制。' },
  { id: 'e125', name: '前彎後仰 Back to Forward Bend', equipment: 'ladder', tags: ['flexibility', 'core', 'posture'], level: '中', category: '脊柱靈活', instructions: '①站姿或坐姿於梯桶前，脊椎延長；②吐氣身體前彎伸展背側鏈，吸氣延伸回正並可加入後仰伸展；③重複4-6次，動作流暢連貫。', benefits: '結合前彎與後仰的脊椎全方向活動度訓練。', mistakes: '前彎時膝蓋鎖死，或後仰幅度過大造成腰椎壓力。' },
  { id: 'e126', name: '腿部伸展系列 Leg Stretch Series', equipment: 'ladder', tags: ['lower', 'flexibility', 'booty'], level: '中', category: '下肢', instructions: '①側坐或仰臥於梯桶邊，一腿固定，另一腿伸直向不同方向伸展；②吐氣伸展延長，吸氣回位；③每方向重複4-6次，換邊。', benefits: '多角度伸展腿後肌群與髖關節活動度，改善下肢柔軟度。', mistakes: '骨盆隨腿部伸展方向晃動，失去軀幹穩定。' },
  { id: 'e127', name: '側向引體 Side Pull Up', equipment: 'ladder', tags: ['upper', 'core', 'full'], level: '高', category: '整合', instructions: '①側身跪或站於梯桶旁，雙手扶梯級；②吐氣以核心與手臂力量將身體向上引拉延伸，吸氣緩慢下降；③重複4-6次，換邊。', benefits: '高階側向核心與上肢拉力整合訓練，考驗全身協調。', mistakes: '聳肩借力，或身體旋轉偏離側向平面。' },
  { id: 'e128', name: '扶手撐起 Press Up with Handles', equipment: 'ladder', tags: ['upper', 'core'], level: '中', category: '上肢', instructions: '①雙手扶梯桶把手，雙腳踩地或懸空，身體呈斜板式；②吐氣手臂撐直延伸，吸氣屈肘下降；③重複8-10次，肩胛保持穩定。', benefits: '訓練上肢推力與核心穩定的整合控制力。', mistakes: '肩胛聳起或塌陷，下背過度拱起失去中立。' },

  /* ---------- CHAIR 平衡椅 ---------- */
  { id: 'e71', name: '腳部工作（椅上）Footwork on Chair', equipment: 'chair', tags: ['lower', 'full'], level: '初', category: '下肢', instructions: '①坐姿或站姿雙腳踩踏板，扶手把手穩定；②吐氣踩下踏板伸直腿，吸氣控制回位；③重複8-10次。', benefits: '訓練下肢力量與踏板控制下的平衡感。', mistakes: '踏板回彈過快失去控制，或膝蓋內夾外八。', springs: '1條重彈簧（初學建議先用較重彈簧提供穩定支撐）', teacherTip: '蹲於學員正前方觀察踏板下踩速度與膝蓋方向，特別留意踏板回彈階段是否失控。' },
  { id: 'e72', name: '尖塔 Pike', equipment: 'chair', tags: ['core', 'full', 'upper'], level: '高', category: '整合', instructions: '①雙手撐椅面，雙腳踩踏板，身體成一直線平板式；②吐氣踩踏板同時臀部向上抬高成尖塔狀，吸氣回平板；③重複4-6次。', benefits: '全身協調與核心穩定的高難度整合動作。', mistakes: '肩胛聳起失去穩定，或下背拱起代償核心不足。', springs: '1條輕彈簧（彈簧越輕挑戰越大）' },
  { id: 'e73', name: '天鵝（椅上）Swan on Chair', equipment: 'chair', tags: ['upper', 'posture', 'booty'], level: '高', category: '整合', instructions: '①俯臥於椅面，雙腳踩踏板，雙手扶椅邊；②吐氣踩下踏板同時胸口延展抬起，吸氣回正；③重複4-6次，需良好背肌與臀肌力量。', benefits: '後鏈力量整合訓練，同時提升背肌與臀肌協調控制。', mistakes: '靠手臂撐起代替背肌與臀肌發力，聳肩代償。', springs: '1條中彈簧' },
  { id: 'e74', name: '登山者 Mountain Climb', equipment: 'chair', tags: ['lower', 'core', 'full'], level: '中', category: '整合', instructions: '①站姿雙手扶椅背，一腳踩踏板；②交替快速踩踏雙腳，如登山跑步節奏；③持續20-30秒，核心保持穩定。', benefits: '動態下肢訓練提升心肺與協調能力，是活力訓練的選擇。', mistakes: '軀幹過度晃動，或節奏過快失去踏板控制。', springs: '1條中彈簧' },
  { id: 'e75', name: '側伸展（椅上）Side Stretch on Chair', equipment: 'chair', tags: ['flexibility', 'posture'], level: '初', category: '脊柱靈活', instructions: '①站姿側對椅子，一手扶椅背；②吐氣身體側向延伸伸展，吸氣回正；③換邊重複3-4次。', benefits: '站姿下伸展體側，改善體態不對稱與日常站姿。', mistakes: '身體前後傾偏離側屈平面，或聳肩緊張。', springs: '免彈簧' },
  { id: 'e76', name: '三頭肌按壓 Tricep Press', equipment: 'chair', tags: ['upper'], level: '初', category: '上肢', instructions: '①坐姿或跪姿，雙手撐椅面手肘微彎；②吐氣手臂下壓踏板伸直手肘，吸氣緩慢回正；③重複8-10次。', benefits: '訓練上臂後側肌群力量，同時穩定肩胛骨。', mistakes: '聳肩借力，或手肘過度鎖死伸展。', springs: '1條輕彈簧' },
  { id: 'e77', name: '站姿抬腿 Standing Leg Pump', equipment: 'chair', tags: ['lower', 'booty', 'core'], level: '中', category: '下肢', instructions: '①單腳站立於地面，另一腳踩踏板，扶椅背保持平衡；②吐氣踩下踏板伸直腿，吸氣控制回位；③重複8-10次，換邊。', benefits: '單腳站立訓練臀腿力量與平衡控制，提升下肢穩定度。', mistakes: '站立腿膝蓋鎖死或內夾，骨盆左右晃動失去水平。', springs: '1條中彈簧' },
  { id: 'e78', name: '提通 Going Up Front', equipment: 'chair', tags: ['lower', 'booty', 'core'], level: '高', category: '下肢', instructions: '①單腳踩踏板站立，另一腳懸空，扶椅背或無扶手依程度調整；②吐氣蹬直踏板腿站高，吸氣屈膝控制下降；③重複6-8次，換邊。', benefits: '訓練單腳臀腿力量與踝關節穩定，是高階平衡挑戰動作。', mistakes: '膝蓋左右晃動失去對位，或速度過快失去踏板控制。', springs: '1條輕至中彈簧', teacherTip: '站於學員側邊隨時準備扶助，此動作平衡難度高，初次嘗試建議扶椅背輔助。' },
  { id: 'e79', name: '坐姿划船（椅上）Seated Rowing on Chair', equipment: 'chair', tags: ['upper', 'core'], level: '中', category: '上肢', instructions: '①坐於椅面，雙腳踩地穩定，脊椎延長；②雙手扶椅邊或彈簧配件，吐氣夾背延伸，吸氣回正；③重複8-10次。', benefits: '強化背部與肩胛穩定肌群，改善坐姿圓肩習慣。', mistakes: '划船時聳肩或圓背，未能啟動背部肌群。', springs: '1條輕彈簧' },
  { id: 'e80', name: '側踏上椅 Lateral Step Up', equipment: 'chair', tags: ['lower', 'booty', 'core'], level: '中', category: '下肢', instructions: '①側對椅子站立，一腳踩上踏板；②吐氣蹬直踩踏腿側向踏上，吸氣控制下降回地面；③重複8-10次，換邊。', benefits: '訓練單側臀腿力量與側向穩定控制。', mistakes: '踩上時膝蓋內夾，或借用擺動慣性完成而非肌肉主動控制。', springs: '1條中彈簧' },
  { id: 'e81', name: '平衡跪姿抬腿 Kneeling Balance Leg Lift', equipment: 'chair', tags: ['core', 'booty', 'full'], level: '高', category: '整合', instructions: '①單膝跪於椅面，雙手扶椅邊，另一腿向後伸展；②吐氣後腿向上抬起延伸，吸氣緩慢回位；③重複6-8次，換邊，核心全程穩定。', benefits: '高階平衡與核心穩定訓練，同時強化臀部與背部力量。', mistakes: '骨盆隨抬腿旋轉偏移，或核心不足導致腰椎代償。', springs: '免彈簧' },
  { id: 'e82', name: '站姿深蹲推踏板 Standing Squat Press', equipment: 'chair', tags: ['lower', 'booty'], level: '中', category: '下肢', instructions: '①雙腳與髖同寬站於踏板前，扶椅背保持平衡；②吐氣屈髖屈膝深蹲同時踩下踏板，吸氣蹬直站起；③重複8-10次。', benefits: '結合深蹲與踏板阻力，全面訓練臀腿力量。', mistakes: '膝蓋超過腳尖過多，或深蹲時脊椎圓拱失去中立。', springs: '1條中至重彈簧' },
  { id: 'e129', name: '美人魚（坐姿與跪姿）Mermaid — Seated and Kneeling', equipment: 'chair', tags: ['flexibility', 'posture', 'upper'], level: '中', category: '脊柱靈活', instructions: '①坐姿或跪姿側對椅子，一手扶踏板；②吐氣身體側屈伸展，遠側手臂畫弧過頭，吸氣回正；③換邊重複3-4次。', benefits: '側向伸展肋廓活動度，改善左右體態不對稱。', mistakes: '身體前傾偏離側屈平面，或用力甩動而非緩慢延伸。', springs: '免彈簧' },
  { id: 'e130', name: '俯臥肩胛系列 Prone Scapular Series', equipment: 'chair', tags: ['upper', 'posture'], level: '初', category: '上肢', instructions: '①俯臥於椅面或墊上，雙手輕扶踏板，肩胛下沉後縮；②吐氣手臂微微上抬同時肩胛穩定，吸氣回正；③重複8-10次。', benefits: '訓練肩胛穩定肌群協調控制，改善圓肩與提升背部耐力。', mistakes: '聳肩代償，或手臂上抬幅度過大失去肩胛穩定。', springs: '免彈簧或極輕彈簧' },
  { id: 'e131', name: '反向天鵝與提斯 Reverse Swan & Teaser', equipment: 'chair', tags: ['core', 'upper', 'full'], level: '高', category: '整合', instructions: '①坐於椅面，雙腳踩踏板，脊椎延長；②吐氣身體後仰延伸成反向天鵝姿，再捲腹回正銜接提斯平衡；③重複4-6次，需良好核心與背部控制。', benefits: '高階核心與背部力量的整合動作，訓練難度較高。', mistakes: '後仰時腰椎過度伸展代償，或核心不足失去平衡控制。', springs: '1條中彈簧' },
  { id: 'e132', name: '側弓步與側踏落地 Side Lunge & Sideward Stepdown', equipment: 'chair', tags: ['lower', 'booty', 'core'], level: '中', category: '下肢', instructions: '①站姿側對踏板，一腳踩踏板呈弓步預備；②吐氣屈膝下沉呈側弓步，吸氣蹬直回位；③重複8-10次，換邊，膝蓋對齊腳尖方向。', benefits: '訓練單側臀腿力量與側向動態穩定控制。', mistakes: '膝蓋內夾超出腳尖方向，或身體重心過度前傾。', springs: '1條中彈簧' },

  /* ---------- HALF CADILLAC 半凱迪拉克 ---------- */
  { id: 'e83', name: '仰臥腿部彈簧 Supine Leg Springs', equipment: 'halfcad', tags: ['lower', 'booty', 'core'], level: '初', category: '下肢', position: 'supine', instructions: '①仰臥雙腳掛彈簧繩，雙腿伸直朝上，貼近地面操作；②依序做開合、上下擺動等變化，骨盆穩定；③每個變化8-10次。', benefits: '貼近地面操作，適合初學者建立髖關節控制與安全感。', mistakes: '骨盆隨腿部動作晃動，或彈簧阻力過重失去控制。', springs: '1條輕彈簧（左右各一）' },
  { id: 'e84', name: '捲桿 Roll-Down Bar', equipment: 'halfcad', tags: ['core', 'posture', 'flexibility'], level: '初', category: '核心', position: 'seated', instructions: '①坐姿雙手持橫桿，雙腳固定；②吐氣捲尾骨逐節向後躺下，吸氣逐節捲回坐直；③重複4-6次。', benefits: '脊椎控制配合彈簧輔助或阻力，訓練體態覺察與核心力量。', mistakes: '用手臂拉桿借力，而非脊椎逐節主動控制。', springs: '2條輕彈簧' },
  { id: 'e85', name: '坐姿手臂彈簧 Seated Arm Springs', equipment: 'halfcad', tags: ['upper', 'posture'], level: '初', category: '上肢', position: 'seated', instructions: '①坐姿雙手持彈簧把手，脊椎延長；②吐氣手臂向前或向下延伸，吸氣緩慢回正；③重複8-10次。', benefits: '肩胛穩定與姿態訓練，動作幅度小容易掌握，適合初學。', mistakes: '聳肩代償，或脊椎隨手臂動作圓拱塌陷。', springs: '1條輕彈簧' },
  { id: 'e86', name: '仰臥呼吸系列 Supine Breathing Series', equipment: 'halfcad', tags: ['relax', 'core'], level: '初', category: '熱身', position: 'supine', instructions: '①仰臥屈膝，雙手輕放於腹部或肋骨兩側；②吸氣感受腹部與肋骨擴張，呼氣感受腹橫肌收縮；③重複6-8次，適合作熱身或舒緩。', benefits: '呼吸與深層核心啟動，適合用於熱身或課末舒緩降頻。', mistakes: '只用胸口淺呼吸，未能感受肋骨與腹部的立體擴張。', springs: '免彈簧' },
  { id: 'e87', name: '橋式加彈簧 Bridging with Springs', equipment: 'halfcad', tags: ['booty', 'core', 'lower'], level: '中', category: '下肢', position: 'supine', instructions: '①仰臥雙腳踩踏板或固定點，屈膝，加入彈簧阻力；②吐氣依序捲起臀、腰、背成橋式，吸氣逐節放回；③重複8-10次。', benefits: '臀橋動作的進階版本，加入彈簧阻力挑戰臀肌與核心穩定。', mistakes: '用下背過度伸展代替臀肌發力，或膝蓋內夾失去對位。', springs: '1-2條中彈簧' },
  { id: 'e88', name: '青蛙式 Frog', equipment: 'halfcad', tags: ['lower', 'booty', 'core'], level: '中', category: '下肢', position: 'supine', instructions: '①仰臥雙腳掛彈簧繩，膝蓋外展如蛙式預備姿；②吐氣蹬直雙腿併攏，吸氣屈膝外展回位；③重複8-10次。', benefits: '髖關節屈伸控制訓練，配合核心穩定雕塑大腿內側線條。', mistakes: '骨盆隨動作晃動，或雙腿外展幅度左右不對稱。', springs: '1條輕至中彈簧' },
  { id: 'e89', name: '坐姿手臂划船 Seated Arm Rowing', equipment: 'halfcad', tags: ['upper', 'core'], level: '初', category: '上肢', position: 'seated', instructions: '①坐姿雙手持彈簧把手，脊椎延長；②吐氣手臂向後划船夾背，吸氣緩慢回正；③重複8-10次。', benefits: '強化背部與肩胛後側肌群，改善坐姿圓肩習慣。', mistakes: '划船時圓背或聳肩，未能真正啟動背部肌群。', springs: '1條輕彈簧' },
  { id: 'e90', name: '側躺髖外展彈簧 Side Lying Hip Springs', equipment: 'halfcad', tags: ['lower', 'booty'], level: '中', category: '下肢', position: 'sidelying', instructions: '①側臥，上方腳掛彈簧繩，身體成一直線；②吐氣腿向外展延伸，吸氣內收回位；③重複8-10次，換邊。', benefits: '側向髖外展訓練，強化臀中肌與髖側穩定。', mistakes: '軀幹隨腿部動作晃動，或髖部翻轉代償。', springs: '1條輕彈簧' },
  { id: 'e91', name: '天鵝準備動作 Swan Prep', equipment: 'halfcad', tags: ['upper', 'posture'], level: '中', category: '脊柱靈活', position: 'prone', instructions: '①俯臥雙手置於胸側，肩胛下沉後縮；②吐氣延展脊椎，胸口微微離地，吸氣緩慢下降；③重複4-6次。', benefits: '天鵝動作的準備版本，適合建立胸椎伸展的基礎控制。', mistakes: '靠手臂猛力撐起，而非背肌主動延展。', springs: '免彈簧' },
  { id: 'e92', name: '仰臥脊柱扭轉 Supine Spine Twist', equipment: 'halfcad', tags: ['flexibility', 'relax', 'posture'], level: '初', category: '脊柱靈活', position: 'supine', instructions: '①仰臥屈膝雙臂側平舉；②吐氣雙膝緩慢倒向一側，肩膀保持貼地，吸氣回正；③換邊重複3-4次。', benefits: '溫和伸展脊椎旋轉活動度，同時降低腰背張力，適合舒緩收操。', mistakes: '肩膀隨膝蓋動作離地，或膝蓋倒得過低造成腰部不適。', springs: '免彈簧' },

  /* ---------- SPINE CORRECTOR / ARC BARREL 脊柱矯正器 / 弧形桶 ---------- */
  { id: 'e93', name: '進入弧桶起始姿 Getting Into the Barrel', equipment: 'corrector', tags: ['relax', 'posture'], level: '初', category: '熱身', instructions: '①面向桶跪坐，雙手扶桶頂緩慢向後躺下，讓脊椎逐節貼合桶面弧度；②雙手放置頭側或體側，深呼吸感受脊椎自然伸展；③停留3-4個呼吸熟悉桶面支撐感。', benefits: '建立學員對弧桶弧度的信任與空間感，是後續動作的安全基礎。', mistakes: '躺下速度過快失去控制，或身體僵硬抗拒交給桶面支撐。' },
  { id: 'e94', name: '呼吸伸展 Breathing Extension', equipment: 'corrector', tags: ['relax', 'flexibility'], level: '初', category: '熱身', instructions: '①仰臥於桶上，脊椎貼合弧度，雙手輕放腹部；②吸氣感受肋骨與胸廓向外擴張，呼氣感受身體更貼合桶面；③重複5-6次。', benefits: '在支撐下體驗立體呼吸，同時被動伸展胸椎，降低肩頸張力。', mistakes: '刻意用力挺胸，而非讓呼吸自然帶動胸廓擴張。' },
  { id: 'e95', name: '手臂剪動式 Arm Scissors', equipment: 'corrector', tags: ['upper', 'full'], level: '初', category: '熱身', instructions: '①仰臥於桶上，雙臂向上伸直；②吐氣雙臂前後交叉如剪刀擺動，吸氣還原；③重複8-10次，肩胛保持穩定不聳肩。', benefits: '熱身肩關節活動度，同時訓練肩胛骨在穩定中活動的控制力。', mistakes: '擺動幅度過大導致聳肩，或軀幹隨手臂晃動。' },
  { id: 'e96', name: '手臂畫圈 Arm Circles on Corrector', equipment: 'corrector', tags: ['upper', 'posture'], level: '初', category: '熱身', instructions: '①仰臥於桶上，雙臂側平舉；②手臂緩慢向上、向內畫圈，配合呼吸節奏；③每方向5-6圈。', benefits: '訓練肩關節活動度與肩胛穩定肌群協調。', mistakes: '畫圈時聳肩，或軀幹隨手臂晃動失去穩定。' },
  { id: 'e97', name: '肩胛骨孤立練習 Scapula Isolation', equipment: 'corrector', tags: ['upper', 'posture'], level: '初', category: '上肢', instructions: '①仰臥於桶上，雙臂向天花板伸直；②吸氣肩胛上提，呼氣下沉遠離耳朵，僅肩胛移動、手臂不動；③重複6-8次。', benefits: '孤立訓練肩胛穩定肌群，建立肩帶動作與軀幹分離的控制力。', mistakes: '手臂角度隨肩胛動作偏移，或用手臂晃動代替肩胛滑動。' },
  { id: 'e98', name: '天鵝潛水 Swan Dive', equipment: 'corrector', tags: ['upper', 'posture'], level: '中', category: '上肢', instructions: '①俯臥於桶上，雙手置於桶前地面，骨盆貼合桶頂；②吐氣延展脊椎、胸口離地伸展，吸氣緩慢下降；③重複4-6次。', benefits: '利用桶面弧度加深胸椎伸展，強化背伸肌群並改善駝背。', mistakes: '靠手臂撐起而非背肌延展，或下背過度伸展失去控制。' },
  { id: 'e99', name: '脊柱伸展 Spinal Extension', equipment: 'corrector', tags: ['flexibility', 'posture', 'upper'], level: '中', category: '脊柱靈活', instructions: '①俯臥於桶上，雙手交扣置於下背；②吐氣胸椎延展抬起，吸氣緩慢下降回桶面；③重複4-6次。', benefits: '加深胸椎伸展活動度，強化背伸肌群力量。', mistakes: '頸部過度後仰用力，而非胸椎主動延展。' },
  { id: 'e100', name: '髖部畫圈 Hip Rolls', equipment: 'corrector', tags: ['core', 'flexibility'], level: '中', category: '核心', instructions: '①仰臥於桶前地面，雙腿屈膝抬起，雙手扶桶邊穩定；②吐氣雙膝緩慢倒向一側畫弧，吸氣經中間至另一側；③每方向重複4-5次。', benefits: '訓練核心抗旋轉控制與脊椎側向活動度。', mistakes: '肩膀隨動作離地，或膝蓋倒得過低造成下背不適。' },
  { id: 'e101', name: '青蛙式 Frog on Corrector', equipment: 'corrector', tags: ['lower', 'booty', 'core'], level: '初', category: '下肢', instructions: '①仰臥於桶前地面，雙腿屈膝外展如蛙式；②吐氣蹬直雙腿併攏向上，吸氣屈膝外展回位；③重複8-10次。', benefits: '訓練髖關節屈伸控制配合核心穩定，雕塑大腿內側線條。', mistakes: '骨盆隨動作晃動，或雙腿外展幅度左右不對稱。' },
  { id: 'e102', name: '腿部畫圈 Leg Circles on Corrector', equipment: 'corrector', tags: ['lower'], level: '中', category: '下肢', instructions: '①仰臥於桶前地面，一腿伸直朝上，另一腿放鬆平放；②骨盆穩定下畫圈，方向漸大；③每方向5-6圈，換邊。', benefits: '訓練髖關節活動度同時挑戰核心抗旋轉穩定。', mistakes: '骨盆隨畫圈晃動，或圈畫得過大失去控制。' },
  { id: 'e103', name: '剪刀式 Scissors on Corrector', equipment: 'corrector', tags: ['core', 'lower'], level: '中', category: '核心', instructions: '①仰臥於桶上，雙腿向天花板伸直；②雙腿如剪刀般前後交換擺動，骨盆保持穩定；③重複8-10次每側。', benefits: '訓練核心抗旋轉穩定力，同時利用桶面弧度伸展腿後肌群。', mistakes: '骨盆隨腿部擺動晃動，或下背過度離桶代償。' },
  { id: 'e104', name: '單腿伸展 Single Leg Extensions', equipment: 'corrector', tags: ['core', 'lower'], level: '中', category: '核心', instructions: '①仰臥於桶前地面，捲肩離地，一腿屈膝抱住、一腿伸直離地；②雙手換手換腿交替拉動，配合呼吸節奏；③重複8-10次每側。', benefits: '訓練核心穩定同時四肢協調，是經典核心耐力動作的桶前變化。', mistakes: '下背拱起離地、骨盆晃動，或伸直腿放太低失去控制。' },
  { id: 'e105', name: '肩橋 Shoulder Bridge', equipment: 'corrector', tags: ['booty', 'core', 'lower'], level: '高', category: '整合', instructions: '①仰臥於桶前地面，肩膀靠於桶邊，雙腳踩地屈膝；②吐氣捲臀、腰、背離地成橋式，吸氣逐節放回；③重複6-8次。', benefits: '利用桶面支撐上背，加深臀肌與後側鏈訓練幅度。', mistakes: '用下背過度伸展代替臀肌發力，或膝蓋內夾失去對位。' },
  { id: 'e106', name: '螺旋捲動 Corkscrew', equipment: 'corrector', tags: ['core', 'flexibility'], level: '高', category: '整合', instructions: '①仰臥於桶上，雙腿向天花板伸直併攏；②吐氣雙腿畫大圈螺旋式繞動一圈，核心全程穩定，吸氣回正；③每方向3-4圈。', benefits: '高階核心控制訓練，同時提升脊椎與髖部柔軟度。', mistakes: '骨盆隨畫圈大幅晃動，或核心不足導致下背代償。' },
  { id: 'e107', name: '側踢腿系列 Side Leg Lifts', equipment: 'corrector', tags: ['lower', 'booty'], level: '中', category: '下肢', instructions: '①側臥於桶前地面，身體成一直線，下方手枕頭；②上腿向上抬起再放下，配合呼吸節奏；③重複8-10次，換邊。', benefits: '訓練髖外展與臀中肌力量，改善髖側穩定。', mistakes: '身體向後倒失去一直線，或借用腰部擺動代替髖關節發力。' },
  { id: 'e108', name: '俯臥單臂支撐 One Arm Press', equipment: 'corrector', tags: ['upper', 'core'], level: '高', category: '上肢', instructions: '①俯臥於桶上，一手置於胸側準備支撐，另一手向前伸展；②吐氣單手撐起上身延展脊椎，吸氣緩慢下降；③重複4-5次，換邊。', benefits: '訓練單側上肢力量與核心抗旋轉穩定，屬進階挑戰動作。', mistakes: '肩胛聳起失去穩定，或身體隨單手撐起而旋轉偏移。' },
  { id: 'e109', name: '游泳式 Swimming on Corrector', equipment: 'corrector', tags: ['full', 'posture'], level: '中', category: '整合', instructions: '①俯臥於桶上，雙臂雙腿伸展離地成飛翔姿；②對側手腳交替小幅度上下擺動，如游泳打水；③持續15-20拍。', benefits: '利用桶面弧度加深背伸肌群訓練，強化整條後側動力鏈。', mistakes: '擺動幅度過大導致腰椎代償晃動，或憋氣完成動作。' },
  { id: 'e110', name: '髖部扭轉 Hip Twist', equipment: 'corrector', tags: ['core', 'flexibility'], level: '高', category: '核心', instructions: '①坐於桶前地面，雙手撐於後方地面，雙腿伸直併攏抬起；②核心穩定下雙腿畫大圈扭轉，如時鐘般繞行；③每方向3-4圈。', benefits: '高階核心與髖部控制訓練，同時提升協調與柔軟度。', mistakes: '手臂支撐失去穩定，或雙腿畫圈時速度過快失去控制。' },
  { id: 'e144', name: '蚱蜢式 Grasshopper', equipment: 'corrector', tags: ['upper', 'core', 'full'], level: '高', category: '整合', instructions: '①俯臥於桶上，雙手交扣置於下背，雙腿伸直離地夾緊；②吐氣胸椎延展抬起同時雙膝彎曲腳踢向臀部，吸氣伸直放下；③重複4-6次。', benefits: '高階背伸肌群與腿後肌群整合訓練，考驗全身協調與力量。', mistakes: '踢腿節奏過快失去控制，或下背過度伸展代償。' },
  { id: 'e145', name: '提斯平衡 Teaser Balance', equipment: 'corrector', tags: ['core', 'full'], level: '高', category: '整合', instructions: '①坐於桶前地面，雙腿屈膝離地，雙手側平舉或向前延伸；②核心穩定下雙腿伸直延展成V字平衡，停留呼吸；③停留2-3個呼吸，緩慢回收，重複3-4次。', benefits: '結合桶面弧度的高階提斯平衡訓練，加深核心與髖屈肌控制。', mistakes: '下背拱起失去脊椎中立，或核心不足導致後倒失去平衡。' },
  { id: 'e146', name: '風車式 Windmill', equipment: 'corrector', tags: ['core', 'flexibility', 'full'], level: '高', category: '整合', instructions: '①坐於桶前地面，雙腿伸直打開，雙手側平舉；②吐氣軀幹向一側旋轉延伸觸碰對側腳，吸氣旋轉回正；③換邊重複4-6次，動作如風車般流暢。', benefits: '高階軀幹旋轉與柔軟度整合訓練，同時挑戰核心抗側傾穩定。', mistakes: '旋轉時骨盆隨之偏移，或膝蓋彎曲失去腿部伸展。' },
  { id: 'e147', name: '蛙泳準備動作 Breast Stroke Prep', equipment: 'corrector', tags: ['upper', 'posture'], level: '中', category: '上肢', instructions: '①俯臥於桶上，雙手向前伸直，肩胛下沉；②吐氣雙手畫弧向外向後延伸同時胸口伸展，吸氣向前回位；③重複6-8次。', benefits: '蛙泳動作的準備版本，訓練肩胛穩定肌群協調並強化背部力量。', mistakes: '聳肩代償，或手臂畫弧幅度過大失去肩胛控制。' },
  { id: 'e148', name: '腿部牽引—前撐 Leg Pull Front on Corrector', equipment: 'corrector', tags: ['core', 'upper', 'full'], level: '高', category: '整合', instructions: '①雙手撐於桶前地面成平板式，桶面支撐下腹或大腿；②吐氣單腿向上抬起，保持骨盆水平，吸氣放下換邊；③每側重複4-6次。', benefits: '利用桶面支撐調整平板式難度，訓練核心抗旋轉與上肢力量。', mistakes: '抬腿時骨盆旋轉，或肩胛聳起失去支撐穩定。' },
  { id: 'e149', name: '手臂旋轉配合芭蕾手位 Rotation with Port de Bras', equipment: 'corrector', tags: ['upper', 'flexibility', 'posture'], level: '中', category: '上肢', instructions: '①坐姿跨坐或側坐於桶前，脊椎延長；②吐氣軀幹旋轉同時手臂畫弧至芭蕾手位，吸氣回正；③換邊重複4-5次，動作優雅流暢。', benefits: '結合軀幹旋轉與手臂協調的訓練，提升上肢動作的優雅度與控制力。', mistakes: '旋轉時聳肩，或手臂動作與軀幹旋轉節奏不同步。' },
  { id: 'e150', name: '交錯腿 Staggered Legs', equipment: 'corrector', tags: ['lower', 'core'], level: '中', category: '下肢', instructions: '①仰臥於桶前地面，雙腿一前一後交錯離地預備；②吐氣雙腿交換前後位置，骨盆保持穩定，吸氣停頓；③重複8-10次，如同懸空的剪刀步。', benefits: '訓練髖屈肌與核心協調控制力，同時強化雙腿不對稱的穩定挑戰。', mistakes: '骨盆隨換腿動作晃動，或雙腳高度不一致。' },
  { id: 'e151', name: '上腿外展 Top Leg Abduction', equipment: 'corrector', tags: ['lower', 'booty'], level: '中', category: '下肢', instructions: '①側臥於桶前地面，身體成一直線，下方腿微彎穩定；②吐氣上方腿向上外展抬起，吸氣緩慢放下；③重複8-10次，換邊，髖部不向後翻轉。', benefits: '針對性訓練臀中肌與髖外展力量，改善髖側穩定與對位。', mistakes: '髖部向後翻轉借力，或抬腿速度過快失去控制。' },
];

/* ============================== POLESTAR 基礎動作補充（來源：北極星普拉提筆記 初／中／高級、Polestar Mat 動作索引；STOTT 基礎塑身機手冊）============================== */
/* 原動作庫缺少 Polestar 墊上預備動作（Pre-Pilates）及部分 STOTT 基礎塑身機動作；這些動作負荷低、禁忌少，是初階客人、產後及痛症客人最常用的起點 */
const NOTES_EXERCISES = [
  /* ---------- MAT 墊上：Polestar Pre-Pilates 基礎 ---------- */
  { id: 'p1', name: '胸部捲起 Chest Lift', equipment: 'mat', tags: ['core'], level: '初', category: '核心', position: 'supine', source: 'Polestar',
    instructions: '①仰臥中立位，雙腳雙膝相距一拳，雙手如枕頭般托住後腦，下巴與鎖骨間像夾著一顆雞蛋；②吸氣頭頂延伸，吐氣保持下巴與鎖骨距離，胸椎逐節捲起至內衣帶位置，感覺肋骨向肚臍滑下；③吸氣停留讓氣息進入背後，吐氣逐節放回，重複8-10次。',
    benefits: '建立胸椎屈曲與腹肌啟動的基本模式，是 Hundred、Double Leg Stretch 等捲腹類動作的前置練習。',
    mistakes: '用手拉頭令頸部過度屈曲，或捲起時骨盆、雙腿跟著晃動。',
    teacherTip: '跪於學員頭側，觀察下巴與鎖骨距離是否維持；頸部不適者可改為雙手拉住墊邊捲上捲下。',
    regression: '雙手拉住墊邊或毛巾托頭，減少頸部負擔，只捲至肩胛下角離墊。',
    progression: '捲起後雙臂沿體側延伸、雙腿抬至桌面位，再過渡到 Hundred。' },
  { id: 'p2', name: '死蟲式 Dead Bug', equipment: 'mat', tags: ['core'], level: '初', category: '核心', position: 'supine', source: 'Polestar',
    instructions: '①仰臥中立位，雙腿依次抬至桌面位，雙臂指向天花板；②吐氣一側手臂向頭頂、對側腿向遠端延伸，骨盆與肋骨保持不動；③吸氣回位換邊，每側6-8次。',
    benefits: '訓練四肢移動時的腰骨盆穩定與對側協調，是抗伸展核心控制的入門動作。',
    mistakes: '腿伸出時下背拱起離墊、肋骨外翻，或速度過快失去控制。',
    regression: '只動腿不動手，或腳跟輕點地面（Toe Taps）代替伸直。',
    progression: '手腳同時伸至更低角度，或加入小球夾於手膝之間做對抗。' },
  { id: 'p3', name: '股骨畫弧 Femur Arcs', equipment: 'mat', tags: ['core', 'lower'], level: '初', category: '熱身', position: 'supine', source: 'Polestar',
    instructions: '①仰臥中立位屈膝，雙手可輕放髂前上棘；②吐氣保持膝蓋角度不變，以髖關節為軸心將一腿抬至桌面位；③吸氣以同樣弧線放回，左右交替各6-8次。',
    benefits: '學習髖關節屈曲與骨盆分離（髖腰分離），喚醒深層腹肌，是所有仰臥下肢動作的基礎。',
    mistakes: '抬腿時骨盆後傾或側傾、下背壓地，或膝蓋角度在過程中改變。',
    regression: '動作幅度減半，只把腳跟提離地面一點點。',
    progression: '雙腿同時抬至桌面位再交替放下（Double Femur Arcs）。' },
  { id: 'p4', name: '屈膝開合 Bent Knee Opening', equipment: 'mat', tags: ['lower', 'core'], level: '初', category: '熱身', position: 'supine', source: 'Polestar',
    instructions: '①仰臥中立位屈膝，雙腳與髖同寬；②吐氣一側膝蓋向外打開，骨盆保持水平不跟隨轉動；③吸氣收回，左右交替各6-8次。',
    benefits: '訓練股骨外旋時骨盆在水平面的穩定，喚醒髖外旋肌群與腹斜肌的協同控制。',
    mistakes: '膝蓋打開時對側骨盆跟著翻起，或用腳掌外緣推地代償。',
    regression: '減小打開幅度，或雙手放在髂前上棘感受骨盆是否移動。',
    progression: '單腿桌面位進行，或加入彈力帶繞膝增加阻力。' },
  { id: 'p5', name: '左右擺動 Side to Side', equipment: 'mat', tags: ['core', 'flexibility', 'relax'], level: '初', category: '脊柱靈活', position: 'supine', source: 'Polestar',
    instructions: '①仰臥屈膝，雙膝併攏，雙臂於身側成T字；②吐氣雙膝倒向一側，帶動骨盆與下段脊椎旋轉，對側肩膀保持貼墊；③吸氣由腹斜肌帶回中間，左右各4-6次。',
    benefits: '溫和的脊椎水平面旋轉，放鬆腰背並訓練腹斜肌離心控制。',
    mistakes: '雙膝倒下後失控墜落，或對側肩膀離墊。',
    regression: '縮小旋轉幅度，雙腳保持貼地。',
    progression: '雙腿抬至桌面位進行，增加槓桿與腹斜肌負荷。' },
  { id: 'p6', name: '手臂畫弧 Arm Arcs', equipment: 'mat', tags: ['upper', 'posture'], level: '初', category: '熱身', position: 'supine', source: 'Polestar',
    instructions: '①仰臥中立位，雙臂指向天花板；②吸氣雙臂向頭頂畫弧，肋骨保持下沉不外翻；③吐氣畫回起始位，重複6-8次。',
    benefits: '訓練肩關節屈曲時肋骨架與胸椎的穩定，對應 Polestar 頭頸肩組織原則。',
    mistakes: '手臂過頭時肋骨外翻、下背拱起，或聳肩。',
    regression: '縮小畫弧幅度至手臂與耳朵同一直線前停止。',
    progression: '手持小啞鈴，或配合 Dead Bug 下肢動作。' },
  { id: 'p7', name: '橋式 Bridging', equipment: 'mat', tags: ['booty', 'lower', 'core'], level: '初', category: '下肢', position: 'supine', source: 'Polestar',
    instructions: '①仰臥中立位屈膝，雙腳與髖同寬，第二三腳趾、膝、髖成一線；②吐氣由尾骨開始逐節捲起骨盆與脊椎，至膝、髖、肩成一直線；③吸氣停留，吐氣由胸椎逐節放回，重複6-8次。',
    benefits: '訓練臀肌與腿後肌群，同時練習脊椎矢狀面逐節活動。',
    mistakes: '用腰椎過度伸展頂高、肋骨外翻，或膝蓋向內夾。',
    regression: '只做骨盆後傾小幅度捲起（Pelvic Curl）。',
    progression: '頂端停留做單腿伸直（Single Leg Bridge），或雙腳踩在小球上。' },
  { id: 'p8', name: '四足跪姿系列 Quadruped Series', equipment: 'mat', tags: ['core', 'upper', 'full'], level: '初', category: '核心', position: 'plank', source: 'Polestar',
    instructions: '①四足跪姿，雙手在肩正下方、雙膝在髖正下方，脊椎中立延伸；②吐氣一手向前、對側腿向後延伸，骨盆保持水平；③吸氣回位換邊，每側6-8次。',
    benefits: '訓練上肢負重時的肩帶穩定與脊椎中立控制，改善全身協調與覺知。',
    mistakes: '伸腿時骨盆旋轉或下背塌陷，支撐肩聳起或手肘超伸。',
    regression: '只伸手或只伸腿，分開練習。',
    progression: '伸展後手肘碰膝蓋做屈伸，或支撐手換成拳頭／前臂。' },
  { id: 'p9', name: '開書式 Book Opening', equipment: 'mat', tags: ['flexibility', 'upper', 'posture'], level: '初', category: '脊柱靈活', position: 'sidelying', source: 'Polestar',
    instructions: '①側臥，雙膝屈曲疊放，雙臂向前伸直合掌；②吸氣上方手臂向天花板畫弧打開，視線跟隨手指，胸椎旋轉；③吐氣畫回合攏，每側4-6次。',
    benefits: '改善胸椎旋轉活動度並伸展胸肌，適合久坐、圓肩人士。',
    mistakes: '旋轉來自腰椎、上方膝蓋跟著翻開，或強行把手壓地。',
    regression: '上方手放在胸口，只做胸椎旋轉不帶手臂。',
    progression: '打開後停留做深呼吸，或加入頸椎旋轉。' },
  { id: 'p10', name: '飛鏢式 Dart', equipment: 'mat', tags: ['upper', 'posture'], level: '初', category: '脊柱靈活', position: 'prone', source: 'Polestar',
    instructions: '①俯臥額頭著墊，雙臂放於身側掌心向內；②吐氣肩胛後縮下沉、胸骨微微離墊，雙手向腳跟延伸；③吸氣停留，吐氣放回，重複6-8次。',
    benefits: '啟動中下斜方肌與胸椎伸肌，改善圓肩駝背，是背部伸展的入門動作。',
    mistakes: '頸部過度後仰、用腰椎頂起，或肩膀聳起。',
    regression: '只做肩胛下沉後縮，胸口不離墊。',
    progression: '胸口離墊後加入頭部左右旋轉，或過渡到 Swan。' },
  { id: 'p11', name: '俯臥撐起 Prone Press Up', equipment: 'mat', tags: ['posture', 'flexibility'], level: '初', category: '脊柱靈活', position: 'prone', source: 'Polestar',
    instructions: '①俯臥，雙手放在胸口兩側，手肘朝天花板；②吐氣由頭部帶領，頸椎、胸椎、腰椎依序伸展撐起，腹肌保持支撐；③吸氣停留，吐氣逐節放回，重複5-6次。',
    benefits: '檢查並訓練脊椎伸展的分布，令伸展平均分配到胸椎而非集中在腰椎。',
    mistakes: '伸展只發生在腰椎、肋骨前突，或頸椎過度後仰。',
    regression: '撐至前臂著地（Sphinx）為止。',
    progression: '維持長C弧線撐至恥骨位置，過渡到 Swan。' },
  { id: 'p12', name: '稻草人 Scarecrow', equipment: 'mat', tags: ['upper', 'posture'], level: '初', category: '上肢', position: 'prone', source: 'Polestar',
    instructions: '①俯臥，雙臂外展90度、手肘屈曲90度（球門柱位）；②吐氣肩胛後縮下沉，前臂與手掌離地，肩關節外旋；③吸氣放回，重複6-8次。',
    benefits: '強化肩關節外旋肌與中下斜方肌，對應圓肩與 Goal Post 測試的弱項。',
    mistakes: '聳肩或腰椎過度伸展代償，前臂抬起時手腕下垂。',
    regression: '單手進行，或額頭下墊毛巾減少頸部壓力。',
    progression: '前臂抬起後加入手臂伸直過頭（Y字）。' },
  { id: 'p13', name: '站姿捲下 Standing Roll Down', equipment: 'mat', tags: ['flexibility', 'relax', 'posture'], level: '初', category: '脊柱靈活', position: 'standing', source: 'Polestar',
    instructions: '①站立，雙腳與髖同寬，膝蓋微屈；②吐氣由頭部帶領，頸椎、胸椎、腰椎逐節向前捲下，雙臂自然垂下；③吸氣停留，吐氣由尾骨開始逐節捲回站立，重複3-4次。',
    benefits: '站姿下練習脊椎逐節屈曲，放鬆背部與腿後側，適合作課堂開場或收操。',
    mistakes: '整段脊椎一起前傾、膝蓋鎖死，或捲回時頭先抬起。',
    regression: '背靠牆進行，感受脊椎逐節離開牆面。',
    progression: '捲到底後雙手走出成平板，接 Push Up。' },
  { id: 'p14', name: '脊柱扭轉 Spine Twist', equipment: 'mat', tags: ['flexibility', 'posture'], level: '中', category: '脊柱靈活', position: 'seated', source: 'Polestar',
    instructions: '①長坐姿，雙腿併攏或與肩同寬，雙臂側平舉；②吸氣脊椎延伸，吐氣以胸椎為軸向一側旋轉兩下，骨盆保持正對前方；③吸氣回正換邊，每側4-5次。',
    benefits: '改善胸椎旋轉、放鬆頸部肌群並提升坐姿體態。',
    mistakes: '骨盆跟著旋轉、坐骨離地，或旋轉時脊椎塌陷。',
    regression: '臀部墊高約5厘米、膝蓋微屈，雙手交叉扶肩。',
    progression: '加快節奏並配合脈衝式呼吸，或加入 Saw 的前彎。' },
  { id: 'p15', name: '單腿踢 Single Leg Kick', equipment: 'mat', tags: ['lower', 'upper', 'posture'], level: '中', category: '下肢', position: 'prone', source: 'Polestar',
    instructions: '①俯臥，前臂撐地於胸下，胸椎伸展，腹部微收像下方有一塊小冰；②吐氣一側腳跟向臀部快速踢兩下；③吸氣放下換邊，每側6-8次。',
    benefits: '在胸椎伸展姿勢下訓練腿後肌，同時伸展股四頭肌與髖屈肌。',
    mistakes: '下背塌陷、骨盆離墊，或支撐肩聳起。',
    regression: '額頭放在交疊的手背上，不撐起胸口。',
    progression: '過渡到 Double Leg Kick。' },
  { id: 'p16', name: '交叉捲腹 Criss Cross', equipment: 'mat', tags: ['core'], level: '高', category: '核心', position: 'supine', source: 'Polestar',
    instructions: '①仰臥捲肩離墊，雙手扶後腦，雙腿桌面位；②吐氣上身轉向一側，同側腿伸直、對側膝蓋靠近；③吸氣經中間換邊，每側6-8次。',
    benefits: '在捲腹姿勢下加入旋轉，強化腹斜肌與核心抗旋轉控制。',
    mistakes: '用手肘帶動而非胸椎旋轉、骨盆跟著晃動。',
    regression: '雙腳踩地只做上身旋轉。',
    progression: '每側停留3秒或放慢離心節奏。' },
  { id: 'p17', name: '背撐抬腿 Leg Pull (Back)', equipment: 'mat', tags: ['booty', 'upper', 'full'], level: '高', category: '整合', position: 'plank', source: 'Polestar',
    instructions: '①長坐姿，雙手放在臀部後方指尖朝前，髖部上推成反向平板；②吐氣一腿向上踢起，骨盆保持水平；③吸氣放下換邊，每側3-5次。',
    benefits: '強化後側動力鏈、肩伸肌與臀肌，訓練肩帶在伸展位置的穩定。',
    mistakes: '髖部下沉、手肘超伸或聳肩。',
    regression: '屈膝成桌面式反撐（Reverse Tabletop）。',
    progression: '踢腿時配合腳背繃勾。' },
  { id: 'p18', name: '側撐抬腿 Side Lift', equipment: 'mat', tags: ['core', 'upper', 'booty'], level: '高', category: '整合', position: 'sidelying', source: 'Polestar',
    instructions: '①側臥，前臂支撐於肩正下方，雙腿伸直；②吐氣髖部抬離地面成一直線，上方腿外展停留3秒；③吸氣放回，每側3-5次。',
    benefits: '強化軀幹側鏈與肩帶穩定，訓練髖外展肌力，對應 Polestar Side Lift 測試。',
    mistakes: '髖部下沉或向後轉、支撐肩聳起。',
    regression: '下方膝蓋屈曲著地支撐。',
    progression: '手掌支撐並加入上方手臂畫弧（Side Bend）。' },
  { id: 'p19', name: '螺旋捲動 Corkscrew', equipment: 'mat', tags: ['core', 'flexibility'], level: '高', category: '核心', position: 'supine', source: 'Polestar',
    instructions: '①仰臥，雙腿併攏指向天花板，雙臂放身側；②吐氣雙腿向一側、向下、向另一側畫圓，骨盆可隨之輕微滾動；③吸氣回到中間，每方向3-4次。',
    benefits: '訓練腹斜肌離心控制與骨盆在多平面的穩定。',
    mistakes: '畫圓過大令下背拱起，或肩膀離墊。',
    regression: '雙腿屈膝畫小圓。',
    progression: '捲至肩胛支撐位畫圓（完整版本）。' },

  /* ---------- REFORMER 塑身機：Polestar／STOTT 基礎 ---------- */
  { id: 'p21', name: '短脊椎按摩 Short Spine Massage', equipment: 'reformer', tags: ['core', 'flexibility'], level: '中', category: '脊柱靈活', position: 'supine', source: 'Polestar / STOTT', springs: '2條中彈簧',
    instructions: '①仰臥，雙腳套在腳套繩內，雙腿伸直向斜上方；②吐氣由尾骨開始逐節捲起脊椎，雙腿越過頭頂平行床面；③吸氣屈膝，吐氣逐節把脊椎放回，雙腿再伸直回到起始位，重複4-5次。',
    benefits: '以彈簧輔助進行脊椎矢狀面逐節活動，強化腹肌離心控制並伸展背部。',
    mistakes: '重量壓在頸椎、用甩腿慣性捲起，或放回時整段脊椎一起落下。',
    regression: '只捲到骨盆離床（Short Spine Prep）。',
    progression: '過渡到 Long Spine Massage。' },
  { id: 'p22', name: '大腿伸展 Thigh Stretch', equipment: 'reformer', tags: ['lower', 'core', 'posture'], level: '中', category: '整合', position: 'kneeling', source: 'Polestar', springs: '2條輕彈簧',
    instructions: '①高跪姿中立位，雙手握拉環或拉桿，膝蓋與拉桿約一臂距離；②吸氣準備，以膝關節為軸心，身體如木板般整體向後傾；③吐氣回到直立，重複5-6次。',
    benefits: '強化股四頭肌離心控制與軀幹穩定，同時伸展髖屈肌。',
    mistakes: '後傾時髖部屈曲、下背塌陷或肋骨外翻。',
    regression: '縮小後傾幅度。',
    progression: '後傾停留時加入胸椎伸展或手臂屈伸。' },
  { id: 'p23', name: '反向腹肌 Reverse Abdominals', equipment: 'reformer', tags: ['core', 'upper'], level: '中', category: '核心', position: 'plank', source: 'Polestar', springs: '1條中彈簧',
    instructions: '①四足跪姿，雙手扶腳踏桿，膝蓋離肩靠約2厘米，重心移至上肢；②吐氣髖屈，把膝蓋拉向胸口，脊椎屈曲；③吸氣髖伸，讓滑車回位，重複8-10次。',
    benefits: '在上肢負重下強化腹肌與肩帶穩定，提升全身協調。',
    mistakes: '聳肩、手肘超伸，或用腿而非腹部拉回滑車。',
    regression: '彈簧調重、動作幅度縮小。',
    progression: '單腿進行，或雙手放同側加入旋轉。' },
  { id: 'p24', name: '跪姿手臂系列—面向前 Kneeling Arm Series Facing Front', equipment: 'reformer', tags: ['upper', 'core'], level: '中', category: '上肢', position: 'kneeling', source: 'Polestar / STOTT', springs: '1條輕至中彈簧',
    instructions: '①面向腳踏桿高跪姿，雙手握短拉繩，脊椎中立延伸；②吐氣雙臂向前伸直（如獻哈達），或向斜上方45度推出；③吸氣回位，每個變化5-6次。',
    benefits: '強化胸肌、三角肌前束與肱三頭肌，同時訓練跪姿下的軀幹穩定。',
    mistakes: '身體被彈簧拉動前後晃動，或推出時聳肩、腰椎塌陷。',
    regression: '改為坐姿進行，彈簧調輕。',
    progression: '單膝跪或雙手交替進行。' },
  { id: 'p25', name: '髖部起伏 Hip Rolls', equipment: 'reformer', tags: ['booty', 'core', 'flexibility'], level: '初', category: '下肢', position: 'supine', source: 'STOTT', springs: '2-3條中至重彈簧',
    instructions: '①仰臥，雙腳前腳掌踩腳踏桿，雙腿平行與髖同寬；②吐氣由尾骨逐節捲起骨盆與脊椎成橋式；③吸氣停留，吐氣由胸椎逐節捲回，重複5-10次。',
    benefits: '訓練脊椎逐節活動、臀肌與腿後肌群，是 STOTT 基礎課程的收尾動作之一。',
    mistakes: '捲起時滑車移動、腰椎過度伸展，或膝蓋外開。',
    regression: '只捲至骨盆離床。',
    progression: '頂端停留做屈伸（推開滑車）或單腿進行。' },
  { id: 'p26', name: '單側大腿伸展 Single Thigh Stretch', equipment: 'reformer', tags: ['flexibility', 'lower'], level: '初', category: '下肢', position: 'standing', source: 'STOTT', springs: '1-2條中彈簧',
    instructions: '①一腳踩在床側地面，另一腳屈膝把腳跟／膝蓋抵住肩靠，雙手扶腳踏桿；②吸氣準備，吐氣伸展後腿推開滑車，髖部向前伸展；③吸氣控制回位，每側5次。',
    benefits: '伸展髖屈肌與股四頭肌，改善久坐造成的髖前側緊繃。',
    mistakes: '骨盆前傾、腰椎過度伸展代替髖伸展。',
    regression: '腳踏桿調低一格，減小幅度。',
    progression: '加入軀幹側屈或手臂過頭延伸。' },
  { id: 'p27', name: '埃及豔后 Cleopatra', equipment: 'reformer', tags: ['flexibility', 'posture', 'upper'], level: '中', category: '脊柱靈活', position: 'seated', source: 'Polestar', springs: '1條中彈簧',
    instructions: '①腳踏桿調高，側坐，雙膝交疊，近側手扶腳踏桿、手肘伸直，對側手扶滑車；②吸氣把滑車推出，脊椎側屈；③吐氣想像腋下夾著氣球，把滑車拉回，每側3-5次。',
    benefits: '改善脊椎側屈與旋轉活動度，拉長腰方肌與腹斜肌，並強化肩帶。',
    mistakes: '支撐肩聳起、身體前傾偏離側屈平面。',
    regression: '彈簧調重、減小側屈幅度。',
    progression: '加入頸椎旋轉以伸展胸鎖乳突肌。' },
  { id: 'p28', name: '站姿髖伸展 Standing Hip Stretch', equipment: 'reformer', tags: ['lower', 'booty', 'flexibility'], level: '中', category: '下肢', position: 'standing', source: 'Polestar', springs: '1條中彈簧',
    instructions: '①面向腳踏桿站於床側，雙手扶腳踏桿，床上腳抵住肩靠，地面腳微屈膝；②吐氣床上腿向後推開滑車至雙膝伸直；③吸氣站立腿屈膝，吐氣拉回，每側6-8次。',
    benefits: '增強臀大肌與股四頭肌力量，改善髖關節靈活性與下肢排列。',
    mistakes: '骨盆旋轉、站立腿膝蓋內扣。',
    regression: '彈簧調重、縮小推開距離。',
    progression: '加快節奏，或把手離開腳踏桿挑戰平衡。' },
];
EXERCISES.push(...NOTES_EXERCISES);

/* ============================== 禁忌症 CONTRAINDICATIONS（來源：北極星普拉提筆記每個動作的「禁忌症」欄）============================== */
/* Polestar 的禁忌症按「動作家族」出現：屈曲類、伸展類、側屈／旋轉類、上肢負重類、髖／骨盆類、倒置類 */
const CONTRA = [
  { key: 'disc', label: '椎間盤突出', family: '屈曲類' },
  { key: 'discacute', label: '急性椎間盤突出（急性期）', family: '屈曲類＋仰臥下肢負荷' },
  { key: 'osteo', label: '骨質疏鬆', family: '屈曲／側屈旋轉類' },
  { key: 'preg', label: '懷孕中後期', family: '屈曲／仰臥／倒置類' },
  { key: 'stenosis', label: '椎管狹窄', family: '伸展／側屈類' },
  { key: 'spondy', label: '脊椎滑脫', family: '伸展類' },
  { key: 'facet', label: '小面關節症候群', family: '伸展／側屈類' },
  { key: 'scoliosis', label: '脊柱側彎（旋轉需評估）', family: '旋轉類' },
  { key: 'impinge', label: '肩關節夾擠', family: '上肢負重類' },
  { key: 'carpal', label: '腕隧道症候群', family: '上肢負重類' },
  { key: 'tos', label: '胸廓出口症候群', family: '上肢負重類' },
  { key: 'pubic', label: '恥骨炎', family: '髖／骨盆類' },
  { key: 'hiprep', label: '髖關節置換', family: '髖／骨盆類' },
  { key: 'pelvic', label: '骨盆不穩定', family: '髖／骨盆類' },
  { key: 'htn', label: '高血壓', family: '倒置類' },
  { key: 'glaucoma', label: '青光眼', family: '倒置類' },
  { key: 'reflux', label: '胃食道逆流', family: '倒置類' },
];
const CONTRA_LABEL = Object.fromEntries(CONTRA.map(c => [c.key, c.label]));
const CF = {
  flex: ['disc', 'osteo', 'preg'],
  ext: ['stenosis', 'spondy', 'facet'],
  lat: ['stenosis', 'facet', 'osteo'],
  ulwb: ['tos', 'carpal', 'impinge'],
  hip: ['pubic', 'hiprep', 'pelvic'],
  inv: ['htn', 'glaucoma', 'reflux', 'preg'],
};

/* ============================== POLESTAR 體適能篩查 FITNESS SCREENING（來源：Polestar Mat Intermediate 附件5）============================== */
/* 15項測試，每項 0-3 分（0=無法完成 1=初級 2=中級 3=進階），總分 ÷ 15 四捨五入 = 體適能程度 */
const SCREENING_TESTS = [
  { key: 'halfsquat', name: '半蹲 Half Squat', purpose: '腳的肌力、髖關節與骨盆／腰椎分離的能力，以及維持脊椎中立的能力。',
    how: '雙手前舉至肩膀高度蹲下；髖、膝、踝排列對齊，胸腰椎伸直，身體只稍微前傾。', watch: '胸腰椎無法伸直、肩胛上提、踮腳尖。',
    s3: '屈膝大於45度，脊椎伸直，肩胛下沉維持30秒', s2: '比3分少一項指標', s1: '比3分少兩項指標' },
  { key: 'fullsquat', name: '全蹲 Full Squat', purpose: '腳的肌力及膝蓋完全彎曲時的控制。',
    how: '雙手前舉至肩膀高度蹲到底；膝、踝與髖對齊，腳跟可抬起，骨盆可稍後傾。', watch: '無法平順蹲下站起、下肢關節排列跑掉。',
    s3: '可平順地完全蹲下和站起', s2: '可完成但不平順或下肢排列跑掉', s1: '無法完全蹲下或需要協助' },
  { key: 'heelraise', name: '單腳提踵 Heel Raise', purpose: '小腿肌力與平衡。',
    how: '可扶著導師手指，單腳踮腳尖再平順放下。', watch: '踝關節未完全蹠屈、未以第二蹠骨頭承重。',
    s3: '不扶手完成5次', s2: '扶手指完成5次', s1: '需更多協助或少於5次' },
  { key: 'goalpost', name: '靠牆手臂上滑 Goal Post on Wall', purpose: '身體排列、肩外展／外旋與脊椎控制。',
    how: '頭、肩、臀貼牆，腳離牆約6-8吋；肩外展90度、屈肘90度，前臂貼牆往上滑。', watch: '脊椎無法維持中立、頭或前臂離牆（亦可能誘發胸廓出口症狀）。',
    s3: '脊椎中立下手臂貼牆滑至完全外展', s2: '脊椎中立下手臂只能上滑約5吋', s1: '手臂無法貼牆或無法維持脊椎中立' },
  { key: 'longsit', name: '長坐姿 Long Sit', purpose: '膕旁肌柔軟度與脊椎穩定。',
    how: '雙腿伸直與肩同寬坐著，脊椎中立。', watch: '腰椎變平（無法中立）、膝蓋旋轉。',
    s3: '脊椎中立並能由髖關節前彎', s2: '脊椎中立且膝蓋伸直', s1: '無法同時維持脊椎中立與膝蓋伸直' },
  { key: 'hipabd', name: '坐姿髖外展 Seated Hip Abduction', purpose: '內收肌長度、關節囊限制與核心穩定。',
    how: '靠牆坐，脊椎中立，雙腿盡量外展。', watch: '失去脊椎中立。',
    s3: '單側外展 >65 度', s2: '單側外展 45-65 度', s1: '外展不到45度或無法維持脊椎中立' },
  { key: 'zsit', name: 'Z 坐姿 Z-Sitting', purpose: '髖關節內旋與外旋。',
    how: '坐姿脊椎中立，雙腿成Z字，一腿內旋一腿外旋。', watch: '失去脊椎中立。',
    s3: '兩側坐骨貼地或離地1吋內', s2: '坐骨離地2-3吋內並維持脊椎中立', s1: '坐骨無法維持在2吋內或失去脊椎排列' },
  { key: 'rollup', name: '捲起 Roll Up', purpose: '脊椎屈肌肌力及屈曲時的分節活動。',
    how: '仰臥雙手在頭側，逐節捲起至坐直，再逐節躺回。', watch: '雙腳離地、甩手借力、髖屈肌先發力令腰椎沒有分節。',
    s3: '完全逐節完成', s2: '無法完全逐節', s1: '需要改變方式才能完成' },
  { key: 'hundred', name: '百次姿勢 Hundred Position', purpose: '脊椎屈曲時深層腹肌的控制。',
    how: '仰臥手在身側，抬起頭肩，雙腳離地約2吋停在半空。', watch: '無法維持腰椎屈曲、腹直肌鼓起。',
    s3: '腹直肌不鼓起且維持腰椎屈曲', s2: '腹直肌鼓起但能維持腰椎屈曲', s1: '無法抬腳或維持脊椎屈曲' },
  { key: 'sidelift', name: '側撐抬腿 Side Lift', purpose: '軀幹與肩帶穩定及髖外展肌力。',
    how: '側臥前臂支撐，髖部抬離地面，上方腿抬起停留3秒。', watch: '需要多於一隻腳或手觸地平衡、肩胛不穩。',
    s3: '肩胛穩定、核心控制良好，上腿外展停留3秒', s2: '肩胛與核心穩定，但無法抬腿停留3秒', s1: '可抬起髖部但肩胛／核心不穩' },
  { key: 'pushup', name: '伏地挺身 Push Up', purpose: '胸肌、三頭肌、核心肌力與肩胛穩定。',
    how: '平板支撐，脊椎中立，屈肘下降至離地約2吋再推回。', watch: '腰椎或頸椎失去中立、手肘外張。',
    s3: '脊椎中立且上肢排列正確', s2: '脊椎中立但手臂外張', s1: '無法維持中立、無法完全下降或需改變方式' },
  { key: 'superman', name: '超人式 Superman', purpose: '伸展姿勢下脊椎與髖的肌力和柔軟度。',
    how: '俯臥雙手向兩側伸展，軀幹和四肢抬離地面。', watch: '胸骨未能完全離地、大腿抬不高、肩胛上提。',
    s3: '胸骨和大腿完全離地且肩胛不上提', s2: '胸骨與大腿無法同時離地，或肩胛上提', s1: '胸骨和大腿都無法離地' },
  { key: 'proneflex', name: '俯臥肩屈曲 Prone Shoulder Flexion', purpose: '肩屈曲時的肌力與關節角度。',
    how: '俯臥雙手舉過頭，腹肌收縮。', watch: '上斜方肌代償令肩胛上提、頸椎或腰椎過度伸展。',
    s3: '雙手可抬離地面超過1吋', s2: '雙手可舉過頭但無法抬離地面', s1: '雙手無法完整舉過頭' },
  { key: 'pressup', name: '俯臥撐起 Prone Press Up', purpose: '頸、胸、腰椎之間伸展的分布。',
    how: '俯臥雙手放胸口兩側，撐起上身。', watch: '動作只發生在腰椎、頸椎過伸、胸椎僵硬、肋骨前突。',
    s3: '撐至恥骨位置並維持長C弧線、腹肌支撐', s2: '可完成但無法維持長C弧線或腹肌支撐', s1: '無法撐至恥骨位置' },
  { key: 'kneebend', name: '俯臥屈膝 Prone Knee Bend', purpose: '髖屈肌柔軟度（股直肌、髂腰肌）。',
    how: '俯臥，手抓同側腳背，雙膝靠攏。', watch: '髂前上棘離地、髖部翹起（脊椎側彎）。',
    s3: '抓到腳、維持骨盆後傾並能抬起大腿', s2: '抓到腳並維持骨盆後傾', s1: '抓不到腳或無法後傾骨盆' },
];
const SCREENING_MAP = Object.fromEntries(SCREENING_TESTS.map(t => [t.key, t]));

/*@@DATA@@*/

/* ============================== 每個動作的筆記註解：禁忌症／Polestar意象／運動鏈／相關評估／STOTT設定 ============================== */
/* c=禁忌症  cue=Polestar意象口令  chain=運動鏈  as=相關體適能篩查測試  st=STOTT 手冊設定（彈簧為曼麗丘 100% 彈簧根數） */
const EXERCISE_NOTES = {
  /* MAT */
  e1: { c: ['preg'], cue: '吸氣時揚起背上的帆，讓肋骨像微笑般向兩側展開；呼氣時讓重力軟化胸骨四周。' },
  e2: { c: ['preg'], cue: '想像骨盆是一個時鐘錶面、一碗水或一個蹺蹺板，水沿碗邊均勻地灑下。', chain: '閉鏈' },
  e3: { c: [] },
  e4: { c: ['impinge', 'scoliosis'], cue: '想像身體像螺旋槳一樣，以胸椎為軸左右旋轉。', chain: '開鏈', as: ['longsit'] },
  e5: { c: CF.flex, cue: '想像頭、頸、肩是一個長長的字母C。', chain: '開鏈', as: ['hundred', 'rollup'] },
  e6: { c: CF.flex, cue: '想像脊椎像珍珠項鍊，一節一節地捲起和放下。', chain: '開鏈', as: ['rollup', 'hundred'] },
  e7: { c: [...CF.flex, 'hiprep'], chain: '開鏈', as: ['hundred', 'rollup'] },
  e8: { c: CF.flex, chain: '開鏈', as: ['hundred', 'rollup'] },
  e9: { c: CF.flex, chain: '開鏈', as: ['sidelift', 'rollup', 'hundred', 'longsit'] },
  e10: { c: CF.flex, chain: '開鏈', as: ['hundred', 'longsit'] },
  e11: { c: CF.flex, chain: '開鏈', as: ['hundred'] },
  e12: { c: CF.flex, cue: '想像脊椎像珍珠項鍊，一節一節地向下滑落。', chain: '開鏈', as: ['rollup', 'hundred', 'longsit'] },
  e13: { c: CF.lat, chain: '開鏈', as: ['zsit'] },
  e14: { c: CF.flex, cue: '想像身體像螺旋槳一樣，胸椎向左右旋轉。', chain: '開鏈', as: ['longsit'] },
  e15: { c: CF.ext, cue: '想像自己像天鵝浮出水面，鼻尖向前向上畫弧線。', chain: '閉鏈', as: ['superman', 'pressup'] },
  e16: { c: ['pubic', 'hiprep', 'preg'], cue: '想像腿像咖啡攪拌器，在髖臼內畫圓而骨盆不動。', chain: '開鏈', as: ['longsit', 'hipabd', 'sidelift'] },
  e17: { c: CF.hip, cue: '想像上方的腿外側端著一杯咖啡，保持不要灑出來。', chain: '開鏈', as: ['longsit', 'hipabd', 'sidelift'] },
  e18: { c: CF.ext, chain: '開鏈', as: ['superman', 'pressup'] },
  e19: { c: ['impinge', 'tos', 'carpal'], chain: '閉鏈', as: ['sidelift'] },
  e20: { c: CF.flex, chain: '開鏈', as: ['hundred', 'rollup'] },
  e21: { c: [...CF.flex, 'hiprep'], chain: '開鏈', as: ['hundred', 'rollup'] },
  e22: { c: CF.ext, cue: '想像自己在水中游泳，手臂和腳遠離墊子。', chain: '開鏈', as: ['superman', 'pressup'] },
  e133: { c: CF.flex, chain: '開鏈', as: ['rollup', 'hundred'] },
  e134: { c: CF.flex, chain: '開鏈', as: ['hundred', 'rollup'] },
  e135: { c: CF.ext, chain: '開鏈', as: ['superman', 'pressup'] },
  e136: { c: CF.flex, chain: '開鏈', as: ['hundred', 'longsit'] },
  e137: { c: [...CF.lat, 'impinge', 'carpal'], chain: '閉鏈', as: ['sidelift', 'rollup'] },
  e138: { c: CF.ulwb, chain: '閉鏈', as: ['pushup', 'kneebend'] },
  e139: { c: [...CF.flex, 'htn', 'glaucoma', 'reflux'], chain: '開鏈', as: ['longsit', 'rollup', 'hundred'] },
  e140: { c: [...CF.flex, 'htn', 'glaucoma', 'reflux'], chain: '開鏈', as: ['longsit', 'rollup'] },
  e141: { c: [...CF.flex, 'htn', 'glaucoma', 'reflux'], chain: '開鏈', as: ['longsit', 'rollup', 'hundred'] },
  e142: { c: CF.ext, chain: '開鏈', as: ['superman', 'kneebend'] },
  e143: { c: ['tos', 'carpal', 'impinge', 'disc', 'osteo'], chain: '閉鏈', as: ['pushup', 'goalpost'] },
  p1: { c: CF.flex, cue: '想像頭、頸、肩是長長的字母C，胸口有一滴水珠流到肚臍。', chain: '開鏈', as: ['hundred', 'rollup'] },
  p2: { c: ['preg', 'discacute'], chain: '開鏈', as: ['hundred'] },
  p3: { c: ['preg', 'discacute'], chain: '開鏈', as: ['hundred'] },
  p4: { c: ['preg', 'pelvic', 'discacute'], chain: '開鏈', as: ['hipabd'] },
  p5: { c: ['preg', 'hiprep', 'discacute'], chain: '開鏈', as: ['hundred'] },
  p6: { c: ['tos', 'carpal', 'impinge'], chain: '開鏈', as: ['goalpost', 'proneflex'] },
  p7: { c: [...CF.flex, 'htn', 'glaucoma', 'reflux'], cue: '想像身體像一塊平板，膝蓋像兩盞射燈照向遠方。', chain: '閉鏈', as: ['hundred', 'kneebend'] },
  p8: { c: CF.ulwb, cue: '想像肚臍向後找脊椎，有一根繩子把你向天花板拎高。', chain: '閉鏈', as: ['pushup', 'kneebend'] },
  p9: { c: CF.ulwb, chain: '開鏈', as: ['goalpost'] },
  p10: { c: CF.ext, chain: '開鏈', as: ['superman', 'proneflex'] },
  p11: { c: CF.ext, chain: '閉鏈', as: ['pressup'] },
  p12: { c: CF.ext, chain: '開鏈', as: ['superman', 'pressup', 'goalpost'] },
  p13: { c: CF.flex, cue: '想像脊椎像珍珠項鍊，一節一節地向下滑落。', chain: '閉鏈', as: ['rollup'] },
  p14: { c: ['impinge', 'scoliosis'], cue: '想像身體像螺旋槳一樣，胸椎向左右旋轉。', chain: '開鏈', as: ['longsit'] },
  p15: { c: CF.ext, cue: '想像小腿像彈簧一樣，彈起來彈下去。', chain: '開鏈', as: ['superman', 'pressup', 'kneebend'] },
  p16: { c: CF.flex, chain: '開鏈', as: ['hundred', 'rollup'] },
  p17: { c: ['impinge', 'carpal'], chain: '閉鏈', as: ['pushup'] },
  p18: { c: ['impinge', 'tos'], chain: '閉鏈', as: ['sidelift'] },
  p19: { c: CF.ext, chain: '開鏈', as: ['longsit', 'rollup', 'hundred'] },

  /* REFORMER */
  e23: { c: ['preg', 'hiprep', 'discacute'], chain: '閉鏈', as: ['halfsquat', 'fullsquat', 'heelraise'], st: '腳踏桿1號位，3-4根彈簧，10-12次' },
  e24: { c: ['preg', 'hiprep', 'discacute'], chain: '閉鏈', as: ['halfsquat', 'fullsquat', 'heelraise'], st: '腳踏桿1號位，3-4根彈簧，10-12次（Toes Apart Heels Together）' },
  e25: { c: ['preg', 'hiprep', 'discacute'], chain: '閉鏈', as: ['heelraise', 'halfsquat'], st: '腳踏桿1號位，3-4根彈簧，10-12次（Wrap Toes／High Half Toe）' },
  e26: { c: ['preg', 'hiprep', 'discacute'], chain: '閉鏈', as: ['heelraise'], st: '腳踏桿1號位，3-4根彈簧，每次增加一組落踵提踵，最多6次（Lower & Lift）' },
  e27: { c: CF.flex, chain: '開鏈', as: ['hundred', 'rollup'], st: '腳踏桿1號位，2-3根彈簧，10組（掌握技巧後骨盆可改為中立位）' },
  e28: { c: CF.flex, cue: '想像肚臍被勺子挖空，把腹部氣體全部吐出。', chain: '開鏈', as: ['sidelift', 'rollup', 'hundred', 'longsit'], st: '腳踏桿4號位，2根彈簧（固定盒子），5次' },
  e29: { c: CF.lat, chain: '開鏈', as: ['sidelift'], st: '腳踏桿4號位，2根彈簧，每側3-5次（中級 Side Bend）' },
  e30: { c: CF.flex, chain: '開鏈', as: ['hundred'], st: '腳踏桿4號位，2根彈簧，5次（中級）' },
  e31: { c: ['impinge', 'tos', 'carpal'], chain: '閉鏈', as: ['sidelift'], st: '腳踏桿1號位，1-2根彈簧，每側5次（Star Prep）' },
  e32: { c: CF.lat, cue: '想像脊椎像珍珠項鍊，一節一節地滑落。', chain: '開鏈', as: ['zsit'], st: '腳踏桿1號位，1根彈簧，每側3-5次' },
  e33: { c: CF.ulwb, chain: '閉鏈', as: ['longsit', 'pushup'], st: '腳踏桿1號位，1-2根彈簧，弓背／直背各10次' },
  e34: { c: CF.ulwb, chain: '閉鏈', as: ['pushup', 'kneebend'], st: '腳踏桿1號位，2根彈簧，10次' },
  e35: { c: ['preg', 'hiprep'], chain: '閉鏈', as: ['heelraise'], st: '腳踏桿1號位，2-3根彈簧，20-60次' },
  e36: { c: [...CF.flex, 'htn', 'glaucoma', 'reflux'], cue: '想像身體像一塊平板，膝蓋像兩盞射燈照向遠方。', chain: '閉鏈', as: ['hundred', 'kneebend'], st: '腳踏桿1號位，2-3根彈簧，10次（Hip Lift）' },
  e37: { c: CF.hip, cue: '想像雙腿像穿了溜冰鞋，一起或單側地移動。', chain: '閉鏈', as: ['hipabd', 'halfsquat', 'heelraise'], st: '腳踏桿4號位，外展1-2根／內收½-1根彈簧，每側8-10次' },
  e38: { c: CF.ulwb, cue: '想像身體像倒置的字母V（Up Stretch）或一塊木板（Long Stretch）。', chain: '閉鏈', as: ['pushup', 'kneebend', 'longsit', 'rollup'], st: '腳踏桿1號位，1-2根彈簧，3次（中級）' },
  e39: { c: CF.ulwb, chain: '開鏈', as: ['goalpost', 'proneflex'], st: '腳踏桿1號位，1-2根彈簧，每個變化5次' },
  e40: { c: CF.ulwb, chain: '開鏈', as: ['pushup', 'proneflex'], st: '腳踏桿1號位，1-2根彈簧，5-10次（Back Rowing Preps）' },
  e41: { c: CF.ulwb, chain: '開鏈', as: ['pushup'], st: '腳踏桿1號位，1-2根彈簧，5-10次' },
  e42: { c: CF.ulwb, cue: '想像雙手臂照鏡子、向後滑動船槳、夾住背部的檸檬。', chain: '開鏈', as: ['pushup', 'proneflex'], st: '腳踏桿3或4號位，1-2根彈簧，6次（中級 Chest Expansion）' },
  e43: { c: ['impinge', 'tos'], chain: '開鏈', as: ['goalpost'] },
  e44: { c: CF.hip, cue: '想像髖關節像開關一樣，往下按。', chain: '開鏈', as: ['halfsquat', 'fullsquat', 'heelraise'] },
  e45: { c: CF.flex, chain: '開鏈', as: ['hundred', 'rollup'] },
  e46: { c: ['hiprep', 'pelvic', 'disc', 'osteo'], chain: '閉鏈', as: ['longsit', 'heelraise'], st: '腳踏桿1號位（髖部緊可調2號位），2-3根彈簧，10次' },
  e111: { c: ['impinge', 'carpal', 'preg'], chain: '閉鏈', as: ['pushup'], st: '腳踏桿3號位，外側2根彈簧，3次（中級）' },
  e112: { c: CF.flex, chain: '開鏈', as: ['sidelift', 'rollup', 'hundred', 'longsit'], st: '腳踏桿1號位，1-2根彈簧，5-10次（Roll-Down 系列）' },
  e113: { c: CF.flex, chain: '開鏈', as: ['pushup', 'proneflex'] },
  e114: { c: CF.ulwb, chain: '閉鏈', as: ['pushup', 'kneebend', 'longsit', 'rollup'] },
  e115: { c: CF.hip, chain: '閉鏈', as: ['halfsquat', 'fullsquat', 'heelraise'] },
  e116: { c: CF.hip, chain: '開鏈', as: ['hipabd', 'halfsquat', 'longsit'], st: '腳踏桿1號位，2根彈簧，畫弧10次（Leg Circles）' },
  p21: { c: CF.flex, cue: '想像身體像月牙，脊椎捲動向上來到鐮刀一樣的形狀。', chain: '開鏈', as: ['longsit', 'rollup', 'hundred'], st: '腳踏桿1號位，2根彈簧，5次（Short Spine）' },
  p22: { c: CF.ext, cue: '想像身體後側有雲朵，直直地躺下去。', chain: '開鏈', as: ['superman', 'pressup'] },
  p23: { c: ['impinge', 'carpal'], cue: '想像大腿前側與腹部之間有一顆檸檬，用力擠破它。', chain: '閉鏈', as: ['pushup', 'kneebend'] },
  p24: { c: CF.ulwb, cue: '想像雙手臂抱大樹、向前獻哈達、向斜上方推重物。', chain: '開鏈', as: ['pushup', 'proneflex'], st: '腳踏桿3或4號位，1-2根彈簧，4-6次（中級 Reverse Expansion／Reaching Forward）' },
  p25: { c: [...CF.flex, 'htn', 'glaucoma', 'reflux'], chain: '閉鏈', as: ['hundred', 'kneebend'], st: '腳踏桿1號位，2-3根彈簧，5-10次' },
  p26: { c: CF.hip, chain: '閉鏈', as: ['kneebend'], st: '腳踏桿1號位（髖部緊可調2號位），1-2根彈簧，每側5次' },
  p27: { c: CF.lat, cue: '想像脊椎像珍珠項鍊，一節一節地向下滑落。', chain: '開鏈', as: ['zsit'] },
  p28: { c: ['pubic', 'hiprep'], cue: '想像雙腿外旋一點點，雙腳紮根在肩靠和地面上。', chain: '閉鏈', as: ['halfsquat', 'fullsquat', 'heelraise'] },

  /* TOWER / CADILLAC */
  e47: { c: CF.flex, cue: '想像脊椎像珍珠項鍊，一節一節地放下。', chain: '開鏈', as: ['rollup', 'hundred', 'longsit'] },
  e48: { c: CF.hip, chain: '開鏈', as: ['hipabd', 'longsit'] },
  e49: { c: CF.ulwb, chain: '開鏈', as: ['goalpost', 'proneflex'] },
  e50: { c: [...CF.flex, 'hiprep'], chain: '開鏈', as: ['longsit', 'rollup', 'hundred'] },
  e51: { c: CF.flex, chain: '開鏈', as: ['longsit'] },
  e52: { c: ['pubic', 'hiprep'], cue: '想像上方的腿外側端著一杯咖啡，保持不要灑出來。', chain: '開鏈', as: ['longsit', 'hipabd', 'sidelift'] },
  e53: { c: [] },
  e54: { c: ['impinge', 'carpal', 'htn', 'glaucoma', 'reflux', 'preg'], chain: '開鏈', as: ['pushup', 'kneebend', 'longsit', 'rollup'] },
  e55: { c: CF.hip, chain: '閉鏈', as: ['halfsquat', 'fullsquat', 'heelraise'] },
  e56: { c: CF.ulwb, chain: '開鏈', as: ['goalpost', 'proneflex'] },
  e57: { c: CF.hip, chain: '開鏈', as: ['kneebend'] },
  e58: { c: CF.ulwb, chain: '開鏈', as: ['pushup', 'proneflex'] },
  e59: { c: [...CF.ext, 'impinge'], chain: '開鏈', as: ['superman', 'pushup'] },
  e60: { c: ['tos', 'impinge'], chain: '開鏈', as: ['proneflex'] },
  e117: { c: CF.ulwb, chain: '開鏈', as: ['pushup', 'proneflex'] },
  e118: { c: CF.ext, chain: '開鏈', as: ['superman'] },
  e119: { c: CF.inv, chain: '開鏈', as: ['hundred', 'rollup'] },
  e120: { c: ['pubic', 'hiprep', 'preg', 'discacute'], chain: '開鏈', as: ['hundred'] },
  e121: { c: CF.ulwb, chain: '開鏈', as: ['pushup', 'proneflex'] },
  e122: { c: CF.flex, chain: '開鏈', as: ['longsit'] },
  e123: { c: [] },

  /* LADDER BARREL */
  e61: { c: CF.ext, chain: '開鏈', as: ['superman', 'pressup'] },
  e62: { c: CF.lat, chain: '開鏈', as: ['sidelift'] },
  e63: { c: ['pubic', 'hiprep'], chain: '閉鏈', as: ['halfsquat', 'heelraise'] },
  e64: { c: CF.hip, chain: '開鏈', as: ['hipabd', 'longsit'] },
  e65: { c: CF.flex, chain: '開鏈', as: ['hundred', 'rollup'] },
  e66: { c: CF.ext, chain: '開鏈', as: ['pressup'] },
  e67: { c: CF.lat, chain: '開鏈', as: ['sidelift'] },
  e68: { c: CF.hip, chain: '開鏈', as: ['hipabd', 'sidelift'] },
  e69: { c: CF.flex, cue: '想像身體像蹺蹺板一樣，腹部收緊，前後輕輕擺動。', chain: '開鏈', as: ['sidelift', 'rollup', 'hundred', 'longsit'] },
  e70: { c: [...CF.flex, 'pubic', 'hiprep'], cue: '想像雙腿像騎馬一樣，夾住圓桶。', chain: '開鏈', as: ['hipabd', 'hundred'] },
  e124: { c: [...CF.flex, 'htn', 'glaucoma', 'reflux'], cue: '想像脊椎像字母L一樣，捲動向上平行於地面。', chain: '開鏈', as: ['longsit', 'rollup', 'hundred'] },
  e125: { c: CF.flex, chain: '開鏈', as: ['rollup'] },
  e126: { c: CF.hip, chain: '開鏈', as: ['longsit', 'hipabd'] },
  e127: { c: CF.hip, chain: '開鏈', as: ['sidelift', 'rollup', 'hundred', 'longsit'] },
  e128: { c: CF.ulwb, chain: '閉鏈', as: ['pushup', 'kneebend', 'longsit', 'rollup'] },

  /* CHAIR */
  e71: { c: CF.hip, chain: '閉鏈', as: ['halfsquat', 'fullsquat', 'heelraise'] },
  e72: { c: [...CF.flex, ...CF.ulwb], chain: '閉鏈', as: ['pushup', 'longsit'] },
  e73: { c: CF.ext, chain: '開鏈', as: ['superman', 'pressup'] },
  e74: { c: CF.hip, cue: '想像髖關節像開關一樣，按下去的感覺去壓下踏板。', chain: '閉鏈', as: ['halfsquat', 'fullsquat', 'heelraise'] },
  e75: { c: CF.lat, chain: '開鏈', as: ['zsit'] },
  e76: { c: CF.ulwb, cue: '想像自己的手臂像尺子一樣，彎曲伸直。', chain: '閉鏈', as: ['pushup', 'goalpost'] },
  e77: { c: CF.hip, chain: '閉鏈', as: ['halfsquat', 'heelraise'] },
  e78: { c: CF.hip, chain: '閉鏈', as: ['halfsquat', 'fullsquat', 'heelraise'] },
  e79: { c: CF.ulwb, chain: '開鏈', as: ['pushup', 'proneflex'] },
  e80: { c: CF.hip, chain: '閉鏈', as: ['halfsquat', 'hipabd'] },
  e81: { c: ['impinge', 'carpal', 'pubic'], chain: '開鏈', as: ['pushup', 'kneebend'] },
  e82: { c: CF.hip, chain: '閉鏈', as: ['halfsquat', 'fullsquat'] },
  e129: { c: CF.lat, chain: '開鏈', as: ['zsit'] },
  e130: { c: CF.ext, chain: '開鏈', as: ['superman', 'pressup'] },
  e131: { c: CF.flex, chain: '開鏈', as: ['hundred', 'rollup'] },
  e132: { c: CF.hip, chain: '閉鏈', as: ['halfsquat', 'hipabd'] },

  /* HALF CADILLAC */
  e83: { c: CF.hip, chain: '開鏈', as: ['hipabd', 'longsit'] },
  e84: { c: CF.flex, cue: '想像脊椎像珍珠項鍊，一節一節地放下。', chain: '開鏈', as: ['rollup', 'hundred', 'longsit'] },
  e85: { c: CF.ulwb, chain: '開鏈', as: ['pushup', 'proneflex'] },
  e86: { c: ['preg'], cue: '吸氣時想像一股泉水從骨盆底湧至頭頂；呼氣時泉水灑遍全身，讓臉、肩、胸都放鬆。' },
  e87: { c: [...CF.flex, 'htn', 'glaucoma', 'reflux'], cue: '想像身體像一塊平板，膝蓋像兩盞射燈照向遠方。', chain: '閉鏈', as: ['hundred', 'kneebend'] },
  e88: { c: CF.hip, cue: '想像髖關節像開關一樣，往下按壓。', chain: '開鏈', as: ['halfsquat', 'fullsquat', 'heelraise'] },
  e89: { c: CF.ulwb, chain: '開鏈', as: ['pushup', 'proneflex'] },
  e90: { c: ['pubic', 'hiprep'], chain: '開鏈', as: ['hipabd', 'sidelift'] },
  e91: { c: CF.ext, chain: '閉鏈', as: ['superman', 'pressup'] },
  e92: { c: ['preg', 'hiprep', 'discacute'], chain: '開鏈', as: ['hundred'] },

  /* SPINE CORRECTOR / ARC */
  e93: { c: [] },
  e94: { c: CF.ext, chain: '開鏈', as: ['pressup'] },
  e95: { c: ['tos', 'impinge'], chain: '開鏈', as: ['goalpost', 'proneflex'] },
  e96: { c: ['tos', 'impinge'], chain: '開鏈', as: ['goalpost', 'proneflex'] },
  e97: { c: [], chain: '開鏈', as: ['goalpost'] },
  e98: { c: CF.ext, chain: '開鏈', as: ['superman'] },
  e99: { c: CF.ext, chain: '開鏈', as: ['pressup'] },
  e100: { c: [...CF.flex, 'htn'], chain: '開鏈', as: ['hundred'] },
  e101: { c: CF.hip, chain: '開鏈', as: ['hipabd'] },
  e102: { c: CF.inv, cue: '想像雙腿像咖啡攪拌器一樣，上下、踩單車、向兩邊畫圓。', chain: '開鏈', as: ['hipabd', 'hundred', 'zsit'] },
  e103: { c: CF.inv, chain: '開鏈', as: ['hipabd', 'hundred'] },
  e104: { c: CF.inv, chain: '開鏈', as: ['hundred'] },
  e105: { c: [...CF.flex, 'htn', 'glaucoma', 'reflux'], chain: '閉鏈', as: ['hundred', 'kneebend'] },
  e106: { c: CF.ext, chain: '開鏈', as: ['longsit', 'rollup', 'hundred'] },
  e107: { c: CF.hip, chain: '開鏈', as: ['hipabd', 'sidelift'] },
  e108: { c: CF.ulwb, chain: '閉鏈', as: ['pushup'] },
  e109: { c: CF.ext, chain: '開鏈', as: ['superman', 'pressup'] },
  e110: { c: [...CF.lat, 'carpal'], chain: '開鏈', as: ['hundred'] },
  e144: { c: CF.ext, chain: '開鏈', as: ['superman', 'pressup'] },
  e145: { c: CF.flex, chain: '開鏈', as: ['hundred', 'rollup'] },
  e146: { c: [...CF.flex, 'htn', 'glaucoma', 'reflux'], chain: '開鏈', as: ['longsit', 'rollup'] },
  e147: { c: CF.ext, chain: '開鏈', as: ['superman', 'proneflex'] },
  e148: { c: CF.ulwb, chain: '閉鏈', as: ['pushup'] },
  e149: { c: ['facet', 'osteo', 'impinge'], chain: '開鏈', as: ['goalpost'] },
  e150: { c: CF.inv, chain: '開鏈', as: ['hipabd', 'hundred'] },
  e151: { c: ['pubic', 'hiprep'], chain: '開鏈', as: ['hipabd', 'sidelift'] },
};
// 合併筆記註解：既有動作以 EXERCISE_NOTES／FX_EXISTING 等表補上；新增動作已在建構器內帶齊欄位，不會被覆寫
const STOTT_BY_ID = {};
Object.entries(STOTT_MAP).forEach(([k, id]) => { if (id !== 'series' && STOTT_SETUPS[k] && !STOTT_BY_ID[id]) STOTT_BY_ID[id] = STOTT_SETUPS[k]; });
EXERCISES.forEach(e => {
  const n = EXERCISE_NOTES[e.id];
  if (n) {
    e.contra = [...new Set(n.c || [])];
    if (n.cue) e.cue = n.cue;
    if (n.chain) e.chain = n.chain;
    if (n.as) e.assess = n.as;
    if (n.st) e.stott = n.st;
  }
  if (!e.contra) e.contra = [];
  if (!e.fx || !e.fx.length) e.fx = FX_EXISTING[e.id] ? FX_EXISTING[e.id].split(' ') : [];
  if (!e.sys) e.sys = SYS_EXISTING[e.id] || (e.source ? e.source.replace(' / ', '+') : '工作室');
  if (!e.also && ALSO_EXISTING[e.id]) e.also = ALSO_EXISTING[e.id].split(' ');
  if (!e.stott && STOTT_BY_ID[e.id]) e.stott = STOTT_BY_ID[e.id];
});
// 動作可在哪些器械上進行（含 also，例如凱迪拉克的推拉桿動作在半凱迪拉克上同樣可做）
function onEquip(e, equipmentSel) { return equipmentSel.includes(e.equipment) || (e.also || []).some(q => equipmentSel.includes(q)); }
const EXERCISE_MAP = Object.fromEntries(EXERCISES.map(e => [e.id, e]));
// 客人有任何一項禁忌症就排除該動作（Polestar：禁忌症屬「不建議做」，而非「小心做」）
function isSafeFor(e, conditions) {
  if (!conditions || conditions.length === 0) return true;
  // 急性期同時涵蓋一般椎間盤突出的所有禁忌
  const conds = conditions.includes('discacute') ? [...conditions, 'disc'] : conditions;
  return !(e.contra || []).some(c => conds.includes(c));
}
// STOTT 骨盆原則：閉鏈動作通常用中立位；開鏈動作若無法穩定中立位，改用腰椎下沉位（Imprint）
function pelvicHint(e) {
  if (e.chain === '閉鏈') return '骨盆通常用中立位';
  const supine = e.position === 'supine' || (e.equipment === 'mat' && e.category === '核心');
  if (e.chain === '開鏈' && supine) return '未能穩定中立位時改用腰椎下沉位 Imprint';
  return null;
}

/* ============================== FIVE PRINCIPLES ============================== */
const FIVE_PRINCIPLES = [
  { key: 'breathing', name: '呼吸原則 Breathing', points: ['以鼻吸氣、噘唇吐氣，強調立體呼吸——尤其是肋骨架後側與兩側較少被利用到的區域', '吸氣時肋骨向外擴張、脊椎自然伸展；呼氣時肋骨兩側內收、脊椎微屈，避免頸部不必要的緊張', '深層呼吸能啟動橫膈膜與骨盆底肌協同運作，是穩定腰骨盆區域的基礎'] },
  { key: 'pelvic', name: '骨盆原則 Pelvic Placement', points: ['中立位：仰臥時髂前上棘與恥骨聯合形成水平面，是最有效率動力鏈的起始位置', '腰椎下沉位：以腹斜肌微收骨盆使腰椎輕微後傾，而非靠臀肌或腿後肌硬壓，適合用於需要額外腰椎穩定的動作', '選擇規則（STOTT手冊）：中立位通常用於閉鏈動作；開鏈動作若無法穩定保持中立位，改用腰椎下沉位——動作卡片上的「運動鏈」標示可作快速參考', '測試順序：先試由中立位到下沉位；未能穩定中立位時，依次練習腿部滑動 → 抬腿 → 足尖輕點，再回到動作本身'] },
  { key: 'ribcage', name: '肋骨架體位 Rib Cage Placement', points: ['肋骨、胸骨與胸椎之間有直接的關節連接，排列良好能讓核心肌群正確募集', '核心肌群（腹肌、豎脊肌）起止點都在肋骨與骨盆之間，兩者排列會互相影響，牽一髮動全身'] },
  { key: 'scapular', name: '肩胛骨動作與穩定 Scapular Movement & Stabilization', points: ['肩胛骨只透過鎖骨與胸廓相連，穩定性主要靠肌肉動態調節而非骨骼支撐，因此周圍肌群的控制力尤其重要', '理想的肩胛活動範圍包括前引、後縮、上提、下沉、上迴旋、下迴旋，且應全程平貼肋骨架滑動，不可聳肩代償'] },
  { key: 'headneck', name: '頭頸部體位 Head & Cervical Placement', points: ['可利用眼球運動與頸部肌群的反射關係募集深層頸屈肌——先以視線帶動，再做點頭動作', '頭部很重，將頭頸重量適當地架在下頸椎上，能為深層頸屈肌提供生物力學優勢，避免過度使用胸鎖乳突肌', '仰臥屈曲動作應由顱頸關節（點頭動作）啟動，而非硬拉下巴貼胸口，頸椎需與胸椎維持同一條延續的曲線'] },
];

const POLESTAR_PRINCIPLES = [
  { key: 'ps_breath', name: '原則一：呼吸 Breathing', points: ['與STOTT呼吸原則同樣強調立體呼吸，但Polestar更著重呼吸作為動作節奏的引導者——先建立呼吸模式，動作才配合呼吸置入', '教學上常用於幫助客人建立身心連結，是每堂課第一個介紹的原則', '方向性呼吸（運動原則手冊）：前方吸氣有助胸椎伸展；用力呼氣有助脊椎屈曲；單邊呼吸有助側屈；綜合呼吸有助旋轉', '呼吸促進穩定：吸氣有助「髖屈曲或肩伸展」時穩定脊椎（抵消脊椎屈曲傾向）；呼氣有助「髖伸展或肩屈曲」時穩定脊椎（抵消脊椎伸展傾向）', '呼吸與肩胛：吸氣有助肩胛上提及肱骨內旋，呼氣有助肩胛下壓及肱骨外旋；也可刻意反轉呼吸來增加動作挑戰', '沒有最好的呼吸方式，只有最適合的呼吸方式——輔助式呼吸（斜角肌、胸鎖乳突肌、上斜方肌主導）是需要留意的代償模式'] },
  { key: 'ps_axial', name: '原則二：中軸延伸與核心控制 Axial Elongation & Core Control', points: ['強調脊椎在動作全程保持延伸感（不塌縮），同時核心深層肌群提供動態穩定，而非靜態鎖死', '中軸延伸是所有動作的「預備姿勢」概念，先建立延伸感，核心控制才有效率地介入'] },
  { key: 'ps_spinal', name: '原則三：脊柱分節 Spinal Articulation', points: ['脊椎應能逐節屈曲、伸展與旋轉，而非整段脊椎當作一塊硬板移動', '訓練脊椎分節能力有助分散負荷、提升柔軟度，也是捲上、脊柱前伸展等動作的核心技巧'] },
  { key: 'ps_headneck', name: '原則四：頭、頸、肩的組織 Organization of Head, Neck & Shoulders', points: ['與STOTT頭頸體位及肩胛穩定原則呼應，強調頭頸應與胸椎維持連續曲線，肩胛則平貼肋骨架動態滑動', '許多動作失誤源於頭頸肩過早或過度介入代償軀幹力量不足'] },
  { key: 'ps_limb', name: '原則五：上下肢的負重與排列 Weight-Bearing & Alignment of Limbs', points: ['四肢在支撐體重時（如四足跪姿、平板式）需維持正確關節對位，避免肘、膝、腕、踝過度鎖死或塌陷', '負重排列不良是許多重複性關節壓力問題的根源，教學時應優先檢查'] },
  { key: 'ps_integration', name: '原則六：動作組合 Movement Integration', points: ['將前五個原則整合到連貫、有效率的動作序列中，強調動作與動作之間的過渡（transition）同樣是訓練的一部分', '這是進階教學的目標：客人不再逐一思考單一原則，而是身體自然地整合所有原則完成流暢動作'] },
];

/* ============================== SELF-RELEASE TOOL GUIDE ============================== */
/* ============================== 輔助小道具 SMALL PROPS ============================== */
const PROPS = [
  { key: 'magiccircle', name: 'Magic Circle 魔力圈', themes: ['booty', 'core', 'upper'], tip: '置於大腿內側、腳踝之間或掌心之間加壓，適合強化內收肌、胸肌與臀肌的等長收縮訓練，同時提升本體感覺回饋。' },
  { key: 'ball', name: 'Pilates Ball 小球', themes: ['core', 'booty', 'full'], tip: '置於腰下增加不穩定平面挑戰核心，或夾於雙膝／雙踝之間強化內收肌群協調與動作精準度。' },
  { key: 'band', name: 'Theraband 彈力帶', themes: ['upper', 'flexibility', 'lower'], tip: '適合上肢與肩胛穩定訓練的額外阻力，或作足部與腿後肌伸展輔助，阻力可依纏繞圈數調整。' },
  { key: 'weights', name: 'Hand Weights 小啞鈴', themes: ['upper', 'full'], tip: '適合手臂彈簧動作加入額外負重，或站姿動作增加上肢阻力挑戰，團課建議從1-2磅開始。' },
  { key: 'foamroller', name: 'Foam Roller 泡沫軸', themes: ['relax', 'posture', 'core'], tip: '除放鬆用途外，亦可作為不穩定支撐平面增加平衡挑戰，或於仰臥姿態下加強脊椎中立感知。' },
];

/* ============================== 彈簧色卡對照（各品牌彈簧顏色不通用，僅供參考，請以機器原廠手冊為準）============================== */
const SPRING_BRANDS = [
  { key: 'balancedbody', name: 'Balanced Body', light: '藍 Blue', medium: '紅 Red', heavy: '綠 Green', note: '另有黃色 Yellow 為更輕的「極輕」彈簧；紅色在此品牌屬中等阻力而非最重，換機時容易與其他品牌混淆。' },
  { key: 'merrithew', name: 'Merrithew／STOTT', light: '白 White（25%）', medium: '藍 Blue（50%）', heavy: '紅 Red（100%）', note: '另以百分比標示彈簧強度；部分機型有黑色 Black（125%）作為加重選項。' },
  { key: 'align', name: 'Align-Pilates', light: '藍 Blue', medium: '紅 Red', heavy: '綠 Green', note: '另有黃色 Yellow 為更輕的「極輕」彈簧；色系與 Balanced Body 相近，仍建議對照原廠手冊。' },
  { key: 'peak', name: 'Peak Pilates', light: '藍 Blue', medium: '黃 Yellow', heavy: '紅 Red', note: '只有三種彈簧顏色；黃色在此品牌屬中等，與 Balanced Body 的極輕黃色不同。' },
  { key: 'basi', name: 'BASI', light: '黃 Yellow', medium: '藍 Blue', heavy: '紅 Red', note: '同一機型會另有齒輪比調整整體阻力感受。' },
  { key: 'fonv', name: '.fonv（韓國品牌）', light: '白 White', medium: '黃 Yellow／藍 Blue', heavy: '紅 Red', note: '根據官方 Reformer Pro 配置（白1、黃1、藍2、紅1條），依業界慣例以白色最輕、紅色最重排序；.fonv 未公開官方阻力對照表，實際使用時建議以彈簧上標示或原廠說明為準。' },
];
const SPRING_BRANDS_MAP = Object.fromEntries(SPRING_BRANDS.map(b => [b.key, b]));
function springColorForBrand(springsText, brandKey) {
  if (!brandKey || !springsText) return null;
  const brand = SPRING_BRANDS_MAP[brandKey];
  if (!brand) return null;
  const w = springWeight(springsText);
  if (w === 0) return '免彈簧';
  if (w === 1) return brand.light;
  if (w === 2) return brand.medium;
  return brand.heavy;
}

const RELEASE = [
  { id: 'rel1', area: '肩頸 / 上斜方肌', tool: '按摩球', technique: '靠牆或仰臥，將按摩球置於上斜方肌（頸肩交界處），緩慢左右滾動或停留深呼吸放鬆，避免直接壓迫頸椎。' },
  { id: 'rel2', area: '胸椎 / 中背', tool: '泡沫軸 / Spine Corrector', technique: '泡沫軸橫放於中背下方，雙手抱頭輕輕做上背伸展；或仰臥於 Spine Corrector 上，讓胸椎自然貼合曲線深呼吸伸展。' },
  { id: 'rel3', area: '髖屈肌前側', tool: '按摩球', technique: '俯臥，將按摩球置於髖前側（避開骨盆骨突處），輕柔按壓配合緩慢呼吸放鬆，力度需比其他部位更輕。' },
  { id: 'rel4', area: '臀部 / 梨狀肌', tool: '按摩球', technique: '坐姿將按摩球置於臀部下方，做出「4字型」姿勢加深按壓，尋找緊繃點停留深呼吸放鬆。' },
  { id: 'rel5', area: '大腿外側（髂脛束）', tool: '泡沫軸', technique: '側臥，泡沫軸置於大腿外側緩慢前後滾動；如張力過高可先從大腿前後側著手，避免長時間停留單一痛點。' },
  { id: 'rel6', area: '下背 / 腰方肌', tool: '泡沫軸 / Spine Corrector', technique: '泡沫軸置於脊椎兩側（避免直壓脊椎正中）輕微擺動放鬆；或仰臥於 Spine Corrector 上做支撐性伸展減壓。' },
  { id: 'rel7', area: '小腿 / 足底', tool: '按摩球 / 泡沫軸', technique: '站立或坐姿將按摩球置於足弓下方緩慢滾動；小腿則用泡沫軸由下往上滾動放鬆比目魚肌與腓腸肌。' },
  { id: 'rel8', area: '內收肌 / 鼠蹊部', tool: '按摩球 / 泡沫軸', technique: '側臥或俯臥，將泡沫軸或按摩球置於大腿內側鼠蹊下方位置，緩慢滾動放鬆，力度需輕柔並避開淋巴與血管密集區域。' },
];
const RELEASE_MAP = Object.fromEntries(RELEASE.map(r => [r.id, r]));

/* ============================== THEMES ============================== */
const THEMES = [
  { key: 'upper', label: '上肢 / 肩胛穩定' },
  { key: 'lower', label: '下肢 / 腿部' },
  { key: 'booty', label: '臀部雕塑 Booty' },
  { key: 'core', label: '核心強化' },
  { key: 'relax', label: '舒壓放鬆 Work Relief' },
  { key: 'flexibility', label: '柔軟度 / 伸展' },
  { key: 'posture', label: '體態矯正' },
  { key: 'full', label: '全身綜合' },
];
const THEME_LABEL = Object.fromEntries(THEMES.map(t => [t.key, t.label]));
const THEME_TAGS = {
  upper: ['upper'], lower: ['lower'], booty: ['booty'], core: ['core'],
  relax: ['relax'], flexibility: ['flexibility'], posture: ['posture'],
  full: ['full', 'upper', 'lower', 'core'],
};
const THEME_RELEASE = {
  upper: ['rel1', 'rel2'], lower: ['rel5', 'rel7'], booty: ['rel4', 'rel5'],
  core: ['rel6', 'rel3'], relax: ['rel1', 'rel6'], flexibility: ['rel2', 'rel5'],
  posture: ['rel1', 'rel3'], full: ['rel2', 'rel6'],
};
const DURATIONS = [
  { v: 30, label: '30分鐘（快閃課）' }, { v: 45, label: '45分鐘' },
  { v: 60, label: '60分鐘（標準課堂）' },
];
const DURATION_COUNT = { 30: 4, 45: 6, 60: 9 };  // 預設課堂時長為 60 分鐘

/* ============================== STUDIO CLASS-TYPE PRESETS（融合 Reformer 主題）============================== */
const CLASS_TYPE_PRESETS = [
  { key: 'beginner', brand: 'BEGINNER', label: '初級', equipment: ['reformer'], themes: [{ key: 'full', weight: 1 }], level: '初', duration: 60,
    desc: '適合初次接觸普拉提的學員，重點教授核心床基礎技巧、正確姿勢與呼吸方法，為後續訓練打好根基。' },
  { key: 'allinone', brand: 'ALL-IN-ONE', label: '全身訓練', equipment: ['reformer'], themes: [{ key: 'full', weight: 1 }], level: '中', duration: 60,
    desc: '適合任何程度，結合力量、柔韌性、協調性、平衡與體態調整練習，全面提升整體健康與身體意識。' },
  { key: 'towermix', brand: 'TOWER MIX', label: '混合半高架床', equipment: ['reformer', 'halfcad'], themes: [{ key: 'full', weight: 0.6 }, { key: 'upper', weight: 0.4 }], level: '中', duration: 60,
    desc: '加入 Half Cadillac 提供的阻力與支撐，融合 Reformer 動作，全面訓練力量、柔韌性與協調性；建議學員已掌握核心床基礎技巧再上課。' },
  { key: 'bootysculpt', brand: 'BOOTY SCULPT', label: '美臀塑形', equipment: ['reformer'], themes: [{ key: 'booty', weight: 0.7 }, { key: 'lower', weight: 0.3 }], level: '中', duration: 60,
    desc: '著重下肢腳部及臀部訓練，透過力量訓練有效雕塑臀部線條並強化下肢肌肉。' },
  { key: 'workrelief', brand: 'WORK RELIEF', label: '辦公室舒緩', equipment: ['reformer'], themes: [{ key: 'relax', weight: 0.6 }, { key: 'posture', weight: 0.4 }], level: '初', duration: 60,
    desc: '針對久坐引致的腰背痛、肩頸僵硬與下肢疲勞，以核心訓練改善姿勢、減輕脊椎壓力，並促進血液循環，讓工作更輕鬆有力。' },
  { key: 'core', brand: 'CORE', label: '核心強化', equipment: ['reformer'], themes: [{ key: 'core', weight: 1 }], level: '高', duration: 60,
    desc: '強度較高的課堂，旨在加強及穩定深層核心肌群，訓練動作著重挑戰核心力量，有效改善姿勢並提升整體力量。' },
  { key: 'cardioburn', brand: 'CARDIO BURN', label: '有氧消脂', equipment: ['reformer'], themes: [{ key: 'full', weight: 0.7 }, { key: 'lower', weight: 0.3 }], level: '中', duration: 60,
    desc: '結合有氧間歇訓練與核心床練習，有效提升心率並加強核心力量，是節奏明快又充滿活力的一課；如有彈跳板可加入跳躍間歇加強效果。', jumpboard: true },
];

/* ============================== POSTURE / PAIN ISSUES ============================== */
/* tier: 0=評估框架(不佔訓練節數) 1=基礎層(核心/骨盆/呼吸) 2=軸心層(脊椎/肩胛帶) 3=周邊層(下肢/末端對位) */
const GROUP_LABEL = { upperneck: '上半身 / 頭頸', spine: '脊椎', pelvis: '骨盆 / 核心', lowerlimb: '下肢 / 足部', framework: '評估框架與概念' };
const TIER_LABEL = { 0: '評估框架', 1: '基礎層（核心／骨盆）', 2: '軸心層（脊椎／肩胛帶）', 3: '周邊層（下肢／末端）' };

const ISSUES = [
  { id: 'ucs', name: '上交叉症候群 Upper Crossed Syndrome', group: 'upperneck', tier: 2, clusterChildren: ['roundshoulder', 'kyphosis', 'fhp', 'highshoulder', 'staticscapwing'],
    cause: '胸肌、上斜方肌、提肩胛肌等張力性肌群長期過度緊繃，深頸屈肌與中下斜方肌、菱形肌等相性肌群相對無力，形成頭前移、圓肩、胸椎後凸的交叉代償型態。',
    symptoms: '頭部前移、圓肩、上背駝，斜方肌與提肩胛肌常感繃緊痠痛，可能伴隨頭痛（尤其後枕部）及肩頸活動度下降。', howToConfirm: '側面觀察耳垂是否落於肩峰前方，同時觀察肩胛骨是否外展、胸椎後凸增加；可配合「體態評估」中『頭部位置』及『胸椎後凸程度』兩項測試，若同時命中多項即可初步判斷。',
    releaseIds: ['rel1', 'rel2'], tags: ['upper', 'posture'],
    trainingNote: '先放鬆緊繃的胸肌與上斜方肌，再針對性強化深頸屈肌、中下斜方肌與菱形肌，重建肩胛與頭頸的平衡張力，而非只顧伸展胸口。', caution: null },
  { id: 'lcs', name: '下交叉症候群 Lower Crossed Syndrome', group: 'pelvis', tier: 1, clusterChildren: ['apt', 'lordosis', 'swayback'],
    cause: '髖屈肌與腰部豎脊肌等張力性肌群過度緊繃，腹肌（尤其下腹）與臀大肌等相性肌群相對無力，形成骨盆前傾、腰椎過度前凸的交叉代償型態。',
    symptoms: '下背緊繃痠痛、腹部力量感覺不足，久站久坐後腰部不適加劇。', howToConfirm: '側面觀察骨盆前傾程度及腰椎前凸曲度，配合觸診髖屈肌張力；可綜合「體態評估」中『骨盆傾斜（側面）』與『腰椎曲度』兩項測試判斷。',
    releaseIds: ['rel3', 'rel6'], tags: ['core', 'lower', 'posture'],
    trainingNote: '與骨盆前傾處理邏輯相近——先放鬆髖屈肌與下背，再強化深層腹肌與臀大肌協同控制骨盆中立位。', caution: null },
  { id: 'apt', name: '骨盆前傾 Anterior Pelvic Tilt (APT)', group: 'pelvis', tier: 1, clusterParent: 'lcs',
    cause: '髖屈肌（腰大肌）長期緊繃，加上深層腹肌及臀大肌力量不足，令骨盆向前傾斜、腰椎過度前凸。',
    symptoms: '下背容易緊繃痠痛，腹部可能有前凸的視覺印象，久站後腰部不適感明顯。', howToConfirm: '側面觀察髂前上棘是否明顯低於髂後上棘；可配合「體態評估」中『骨盆傾斜（側面）』測試選擇「前傾」選項。',
    releaseIds: ['rel3'], tags: ['core', 'lower', 'posture'],
    trainingNote: '先放鬆緊繃的髖屈肌，再加強深層核心與臀大肌協同啟動，重新建立骨盆中立位的控制能力。', caution: null },
  { id: 'ppt', name: '骨盆後傾 Posterior Pelvic Tilt (PPT)', group: 'pelvis', tier: 1,
    cause: '久坐加上核心過度代償收緊、臀肌緊繃，令腰椎自然曲線減少，常伴隨圓背坐姿。',
    symptoms: '下背在坐姿時容易痠痛，站姿常見圓背，臀部視覺上較扁平。', howToConfirm: '側面觀察髂前上棘是否明顯高於髂後上棘；可配合「體態評估」中『骨盆傾斜（側面）』測試選擇「後傾」選項。',
    releaseIds: ['rel4', 'rel6'], tags: ['posture', 'flexibility'],
    trainingNote: '放鬆過度緊繃的臀肌，配合脊椎伸展與髖屈肌力量訓練，協助恢復腰椎自然前凸曲線。', caution: null },
  { id: 'lumbarflatback', name: '腰椎平背 Lumbar Flat Back', group: 'spine', tier: 1,
    cause: '腰椎生理前凸減少甚至消失，常見於過度收緊腹肌、骨盆後傾使用習慣，或核心訓練時長期過度捲尾骨，令腰椎失去自然緩衝曲度。',
    symptoms: '下背在久坐或彎腰後容易痠痛，因為腰椎失去自然緩衝曲度，重量傳遞較不均勻。', howToConfirm: '側面觸診腰椎前凸曲度是否明顯減少或消失（手掌平放腰椎與骨盆上方感受曲度深淺）；可配合「體態評估」中『腰椎曲度』測試選擇「平直」選項。',
    releaseIds: ['rel6'], tags: ['flexibility', 'posture', 'core'],
    trainingNote: '訓練上避免過度強調「腰椎貼地」的核心指令，改以骨盆中立位為主，並加入腰椎伸展活動度練習，恢復自然前凸曲線的彈性。', caution: null },
  { id: 'thoracicflatback', name: '胸椎平背 Thoracic Flat Back', group: 'spine', tier: 2,
    cause: '胸椎生理後凸過度減少，脊椎失去自然S型曲線的緩衝能力，常伴隨胸椎活動度僵硬與肩胛穩定不足，較常見於過度軍姿式挺胸站姿人士。',
    symptoms: '上背僵硬、胸椎旋轉活動度受限，深呼吸時肋骨擴張感覺較不明顯。', howToConfirm: '中指沿胸椎棘突滑動，觸診後凸弧度是否過小；可配合「體態評估」中『胸椎後凸程度』測試選擇「後凸減小」選項。',
    releaseIds: ['rel2'], tags: ['flexibility', 'posture', 'upper'],
    trainingNote: '著重恢復胸椎多方向活動度（伸展、旋轉、側屈），避免長期固定挺胸姿勢，並強化肩胛周圍肌群的動態控制而非靜態夾緊。', caution: null },
  { id: 'lpt', name: '骨盆側傾 Lateral Pelvic Tilt (LPT)', group: 'pelvis', tier: 1,
    cause: '單側髖外展肌群（尤其臀中肌）力量不足或長期單腳站立習慣，令骨盆在額狀面上一高一低傾斜，常伴隨功能性腿長差異的錯覺。',
    symptoms: '單側髖部或下背容易痠痛，可能伴隨步態輕微不對稱或視覺上雙腳長度不一致的錯覺。', howToConfirm: '從正面觀察兩側髂前上棘連線是否水平；可配合「體態評估」中『骨盆高度（正面）』測試。',
    releaseIds: ['rel5', 'rel4'], tags: ['lower', 'booty', 'posture'],
    trainingNote: '針對較低一側加強臀中肌側向穩定訓練，並留意日常站姿是否習慣性重心偏向一側。', caution: null },
  { id: 'lateralshift', name: '骨盆橫向移位 Lateral Pelvic Shift', group: 'pelvis', tier: 1,
    cause: '骨盆在水平面上整體向一側平移，軀幹為代償重心會反方向側彎，常見於脊椎側彎代償或單側疼痛迴避姿勢。',
    symptoms: '軀幹視覺上偏向一側，可能伴隨該側疼痛或緊繃，常見於受傷後的迴避性姿勢。', howToConfirm: '從背後俯視觀察兩側髂脊是否等距，並留意軀幹重心是否偏移；可配合「體態評估」中『骨盆旋轉（後面）』測試，若由明顯疼痛引起應先轉介評估。',
    releaseIds: ['rel5', 'rel6'], tags: ['posture', 'flexibility', 'core'],
    trainingNote: '優先以對稱性核心訓練重建軀幹置中感，避免單側過度訓練加深不對稱；若由疼痛引起需先處理疼痛來源。',
    caution: '如骨盆橫向移位由明顯疼痛或受傷引起，應先轉介醫生或物理治療師評估根本原因。' },
  { id: 'fhp', name: '頭前移 Forward Head Posture (FHP)', group: 'upperneck', tier: 2, clusterParent: 'ucs',
    cause: '長期使用手機、電腦螢幕過低或過遠，令頭部重心前移，深頸屈肌無力、上頸伸肌與胸鎖乳突肌代償過度緊繃。',
    symptoms: '頸後肌群長期繃緊、易感疲勞，嚴重者可能出現緊張性頭痛或上肢放射性不適。', howToConfirm: '請客人自然站立，從側面觀察耳垂與肩峰是否在同一垂直線；若耳垂明顯落於肩峰前方即為陽性，可配合「體態評估」中『頭部位置』測試。',
    releaseIds: ['rel1'], tags: ['upper', 'posture'],
    trainingNote: '強化深頸屈肌（點頭動作訓練）並放鬆上頸伸肌群，同時改善胸椎伸展活動度，因為頭頸位置與胸椎體位互相影響。', caution: null },
  { id: 'roundshoulder', name: '圓肩 / 肩胛前引 Rounded Shoulders', group: 'upperneck', tier: 2, clusterParent: 'ucs',
    cause: '胸小肌與前三角肌緊繃，將肩胛骨往前往外拉，加上中下斜方肌、菱形肌力量不足，令肩胛骨失去貼於肋骨架的穩定位置。',
    symptoms: '肩膀往內捲、胸口有壓迫感，長時間維持姿勢後肩胛間（菱形肌區域）痠痛。', howToConfirm: '從背後觀察肩胛骨內側緣與脊柱的距離是否超過4指寬（前引徵象）；可配合「體態評估」中『肩胛骨內側緣至脊柱距離』測試。',
    releaseIds: ['rel1', 'rel2'], tags: ['upper', 'posture'],
    trainingNote: '先放鬆胸小肌降低對肩胛骨的牽拉，再強化中下斜方肌與菱形肌重建肩胛後縮下沉的控制力。', caution: null },
  { id: 'kyphosis', name: '胸椎後凸（駝背）Thoracic Kyphosis', group: 'upperneck', tier: 2, clusterParent: 'ucs',
    cause: '胸椎生理後凸角度過大，常伴隨圓肩與頭前移，多由長期屈曲姿勢（如久坐辦公、揹重物）與背伸肌群耐力不足所致。',
    symptoms: '上背明顯圓拱、站立時難以挺胸，長時間站立或坐姿後上背痠痛僵硬。', howToConfirm: '從側面觀察胸椎弧度是否明顯增大（可用中指沿棘突滑動感受弧度），並比對是否伴隨頭前移與圓肩；可配合「體態評估」中『胸椎後凸程度』測試。',
    releaseIds: ['rel2', 'rel1'], tags: ['upper', 'posture', 'flexibility'],
    trainingNote: '著重胸椎伸展活動度與背伸肌群耐力訓練，並教育客人減少長時間固定屈曲姿勢。', caution: null },
  { id: 'lordosis', name: '腰椎過度前凸 Lumbar Hyperlordosis', group: 'spine', tier: 1, clusterParent: 'lcs',
    cause: '髖屈肌與豎脊肌緊繃，腹肌與臀大肌相對無力，令腰椎前凸角度過大，常與骨盆前傾同時出現。',
    symptoms: '下背在站立或行走後容易痠痛，腹部可能有前凸的視覺印象，久站後不適感加劇。', howToConfirm: '側面觀察腰椎前凸弧度是否明顯過大，配合骨盆是否前傾；可配合「體態評估」中『腰椎曲度』測試選擇「過度前凸」選項。',
    releaseIds: ['rel3', 'rel6'], tags: ['core', 'lower', 'posture'],
    trainingNote: '與骨盆前傾處理方向一致——放鬆髖屈肌，強化深層核心與臀肌協同控制腰椎骨盆對位。', caution: null },
  { id: 'scoliosis', name: '脊椎側彎 Scoliosis', group: 'spine', tier: 2,
    cause: '脊椎在冠狀面上呈現側向彎曲，可為結構性（脊椎本身旋轉變形）或功能性（肌肉張力不對稱代償），常伴隨肋廓與肩胛不對稱。',
    symptoms: '兩側腰線或肩線不對稱，久站或久坐後單側背部容易痠痛，嚴重者可能有肋骨隆起感。', howToConfirm: '從背後觀察脊柱是否偏離中線，兩側腋摺是否等長；可配合「體態評估」中『脊柱居中度』測試，惟結構性側彎需由醫生以X光確診，此處評估僅供功能性參考。',
    releaseIds: ['rel5', 'rel2'], tags: ['posture', 'flexibility', 'core'],
    trainingNote: '訓練以不對稱、單側加強較弱凹側肌群為原則，強調延伸與呼吸進入受限側肋廓；結構性側彎需配合醫療團隊監察，避免自行判斷嚴重程度。',
    caution: '結構性脊椎側彎（尤其角度較大或持續進展者）應由醫生或物理治療師定期評估及監察，Pilates訓練屬輔助性質，不能取代醫療跟進。' },
  { id: 'highshoulder', name: '高低肩 Shoulder Height Asymmetry', group: 'upperneck', tier: 2, clusterParent: 'ucs',
    cause: '慣用側使用過多、單肩背包習慣、上斜方肌張力不對稱，或脊椎側彎代償，令兩側肩峰高度不一致。',
    symptoms: '兩側肩頸緊繃程度不一，較高一側常感痠痛，可能伴隨輕微脊椎側彎的視覺印象。', howToConfirm: '從背後觀察兩側鎖骨與肩峰連線是否水平；可配合「體態評估」中『肩部高度』測試，並留意是否與慣用手或背包習慣有關。',
    releaseIds: ['rel1', 'rel5'], tags: ['posture', 'flexibility', 'upper'],
    trainingNote: '優先以對稱性動作訓練為主，並針對較高（緊繃）一側加強放鬆、較低（無力）一側加強穩定訓練。', caution: null },
  { id: 'recurvatum', name: '膝超伸 Genu Recurvatum', group: 'lowerlimb', tier: 3,
    cause: '膝關節在站立時過度向後鎖死超出正常伸直範圍，常見於韌帶鬆弛體質，或長期依賴被動骨骼結構站立而非肌肉主動支撐。',
    symptoms: '站立時膝關節有過度伸直的視覺印象，長時間站立後膝關節後側可能感到壓迫或不適。', howToConfirm: '側面觀察站立時膝關節是否明顯超出大轉子與外踝的連線之後；可配合「體態評估」中『膝關節（側面）』測試選擇「過度伸展」選項。',
    releaseIds: ['rel5', 'rel7'], tags: ['lower', 'posture'],
    trainingNote: '訓練站姿與動作中膝關節「微屈」的主動控制感，強化股四頭肌與腿後肌群共同穩定膝關節，避免鎖死站立的習慣。', caution: null },
  { id: 'valgum', name: '膝內扣 Knee Valgus / Genu Valgum', group: 'lowerlimb', tier: 3,
    cause: '臀中肌與髖外旋肌群力量不足，加上足踝穩定度不佳，令膝蓋在負重動作中向內塌陷，增加膝關節內側壓力。',
    symptoms: '深蹲或下樓梯時膝蓋容易向內塌陷，可能伴隨膝關節內側不適感。', howToConfirm: '請客人雙腳與髖同寬微蹲，觀察膝蓋是否向內夾、偏離腳尖方向；可配合「體態評估」中『膝蓋對位』測試並目測深蹲時膝蓋軌跡。',
    releaseIds: ['rel5', 'rel7'], tags: ['lower', 'booty'],
    trainingNote: '加強臀中肌側向穩定與髖外旋控制，配合足踝與腳掌對位訓練，重建下肢負重時的正確排列。', caution: null },
  { id: 'flatfoot', name: '扁平足 Flat Foot 對比 高足弓 Pes Cavus', group: 'lowerlimb', tier: 3,
    cause: '扁平足足弓塌陷、足部過度旋前；高足弓則足弓過高、旋後不足、避震能力較差。兩者皆會影響下肢對位與力線傳導，成因可以是結構性或肌肉控制性。',
    symptoms: '扁平足常見足弓塌陷、久站後足底痠痛；高足弓則足部避震能力較差，容易感覺足底或足踝外側緊繃。', howToConfirm: '請客人赤腳站立，觀察足弓高度及足印形狀（濕腳印測試可輔助判斷）；可配合「體態評估」中『足部承重』測試。',
    releaseIds: ['rel7'], tags: ['lower', 'posture'],
    trainingNote: '扁平足著重足底內在肌群與脛後肌訓練以主動支撐足弓；高足弓則著重足踝周圍柔軟度與緩衝控制，兩者都應從腳部工作的多種腳位變化中細心觀察並調整。', caution: null },
  { id: 'fld', name: '功能性腿長差異 FLLD', group: 'pelvis', tier: 1,
    cause: '並非骨骼結構性長度不同，而是因骨盆傾斜、旋轉或髖關節周圍肌肉張力不對稱，令雙腳站立時「看起來」長度不一致。',
    symptoms: '站立或行走時可能感覺重心不對稱，觀察者常誤以為雙腳長度不同，但仰臥測量骨骼標記通常對稱。', howToConfirm: '仰臥比較兩側內踝位置是否等高（骨骼性差異會呈現不等長）；若仰臥測量對稱但站立時骨盆不平，則傾向功能性而非結構性，需配合骨盆評估判斷。',
    releaseIds: ['rel3', 'rel4'], tags: ['posture', 'lower', 'core'],
    trainingNote: '訓練重點在恢復骨盆對稱排列而非拉長某一側腿部，需先分辨是功能性還是結構性差異，前者才適合以訓練介入。',
    caution: '若懷疑為結構性腿長差異（骨骼本身長度不同），應轉介醫生評估，不屬於訓練可以改變的範疇。' },
  { id: 'zoa', name: 'ZOA 橫膈膜附著區 Zone of Apposition', group: 'framework', tier: 0,
    cause: 'ZOA是橫膈膜直接貼附於下肋骨內側的區域，理想的ZOA需要肋骨架處於中立、輕微下沉的位置；肋骨架過度上提外擴（常見於頭前移、腰椎過度前凸人士）會縮小ZOA，削弱橫膈膜的力學效率與核心穩定能力。',
    symptoms: '肋骨架過度上提外擴、呼吸表淺（多用胸口上部呼吸），深層核心啟動感覺較弱。', howToConfirm: '觀察客人仰臥呼吸時肋骨架是否過度上提，觸診下位肋骨是否能隨呼氣下沉；這是評估呼吸效率的輔助概念而非單一疾病，重點在觀察呼吸模式是否理想，毋須「確診」。',
    releaseIds: ['rel2', 'rel6'], tags: ['core', 'posture', 'relax'],
    trainingNote: '透過肋骨架下沉與三維呼吸訓練重建理想ZOA，是深層核心啟動的基礎，建議在每堂課熱身呼吸環節就融入這個概念，而非單獨編排訓練節數。', caution: null },
  { id: 'gait', name: '步態生物力學 Gait Biomechanics', group: 'lowerlimb', tier: 3,
    cause: '步態異常（如過度旋前、髖部代償搖擺、拖步）多源於下肢力量不對稱、關節活動度受限或神經肌肉控制不良，是體態評估中觀察日常功能表現的重要一環。',
    symptoms: '行走時可能出現不對稱擺盪、拖步或過度旋前/旋後，長期可能伴隨髖膝關節代償性不適。', howToConfirm: '觀察客人自然行走6-8步的步態，留意足部落地方式、髖部擺動幅度及左右對稱性；建議配合錄影慢動作回放輔助判斷。',
    releaseIds: ['rel5', 'rel7'], tags: ['lower', 'full', 'posture'],
    trainingNote: '從腳部工作的多種變化、單腳站立控制與髖部側向穩定訓練切入，並建議配合觀察客人實際步行影片作評估參考。', caution: null },
  { id: 'janda', name: 'Janda 肌肉分類 Janda\u2019s Muscle Classification', group: 'framework', tier: 0,
    cause: 'Janda提出肌肉可分為「張力性/姿勢性肌群」（傾向縮短緊繃，如髖屈肌、胸肌、上斜方肌）與「相性肌群」（傾向抑制無力，如臀肌、深頸屈肌、下斜方肌），這個傾向是上/下交叉症候群等體態代償型態的理論基礎。',
    symptoms: '此為理論框架而非單一症狀，實務上會觀察到特定肌群（如髖屈肌、胸肌、上斜方肌）緊繃，同時對應的相性肌群（臀肌、深頸屈肌）力量不足。', howToConfirm: '透過觸診比較張力性肌群與相性肌群的相對緊繃/無力程度，並結合上/下交叉症候群等具體體態評估作交叉驗證，而非獨立確診項目。',
    releaseIds: ['rel1', 'rel3'], tags: ['posture', 'core'],
    trainingNote: '這是理解體態代償型態的框架而非單一問題：實務上先放鬆容易縮短的張力性肌群，再針對性喚醒容易抑制的相性肌群，是貫穿整個知識庫「先放鬆、後訓練」的核心邏輯。', caution: null },
  { id: 'varum', name: 'O型腿 Genu Varum', group: 'lowerlimb', tier: 3,
    cause: '髖內收肌群相對緊繃、髖外旋肌群主導，加上足踝旋後習慣，令雙膝在站立時向外側偏離中軸線。',
    symptoms: '雙腳併攏站立時膝蓋之間有明顯空隙，可能伴隨足部旋後或外側膝關節壓力感。', howToConfirm: '請客人雙腳踝併攏站立，觀察膝蓋是否能同時併攏；可配合「體態評估」中『膝蓋對位』測試選擇「膝蓋無法併攏（O型腿）」選項。',
    releaseIds: ['rel5', 'rel3'], tags: ['lower', 'booty'],
    trainingNote: '訓練上加強髖內收肌群與足弓內側支撐，並留意站姿與步態中膝蓋是否習慣性外推。', caution: null },
  { id: 'hallux', name: '拇指外翻 Hallux Valgus', group: 'lowerlimb', tier: 3,
    cause: '大腳趾長期受狹窄鞋頭擠壓、足弓穩定度不足或足部內在肌力量不足，令大腳趾關節向外偏移、關節內側突出。',
    symptoms: '大腳趾關節內側突出、可能紅腫疼痛，穿窄頭鞋時症狀加劇，嚴重者影響步態。', howToConfirm: '目測大腳趾是否明顯向外偏移、關節內側是否突出；若伴隨紅腫熱痛應建議先由足踝專科評估。',
    releaseIds: ['rel7'], tags: ['lower', 'posture'],
    trainingNote: '強化足部內在肌群與大腳趾外展控制（如腳趾分開練習），配合腳部工作時觀察腳掌是否均勻承重，避免大腳趾過度內側代償發力。',
    caution: '如有明顯關節腫痛變形或影響步行，應建議先由足踝專科或物理治療師評估。' },
  { id: 'swayback', name: '懶人站姿 Sway Back Posture', group: 'pelvis', tier: 1, clusterParent: 'lcs',
    cause: '骨盆過度前移、胸廓後移代償，身體重心落在腳跟後方，看似放鬆但其實是髖伸肌與腹肌長期低張力下的懶散站姿，常伴隨骨盆後傾與胸椎後凸。',
    symptoms: '站立時看似放鬆但久站後下背及髖部痠痛，重心明顯落在腳跟後方。', howToConfirm: '側面觀察骨盆是否明顯前移、胸廓是否後移代償，肩線是否落在髖線之後；可配合「體態評估」中『骨盆傾斜』與『腰椎曲度』測試綜合判斷。',
    releaseIds: ['rel3', 'rel6'], tags: ['core', 'posture', 'lower'],
    trainingNote: '訓練重點在喚醒核心與髖部周圍肌群的主動支撐能力，重建骨盆與肋骨架垂直對齊的站姿習慣，而非單純「站直」的指令。', caution: null },
  { id: 'militaryneck', name: '頸椎曲度變直 Military Neck', group: 'upperneck', tier: 2,
    cause: '頸椎生理前凸曲度減少甚至變直或反弓，常見於長期低頭使用電子產品，或過度矯枉過正的「用力挺胸收下巴」站姿習慣。',
    symptoms: '頸部活動度下降、低頭後仰時容易卡卡或緊繃，長期可能伴隨頭痛或手部麻痺感。', howToConfirm: '觸診頸椎後側曲度是否平直甚至反弓（正常應有輕微前凸）；可配合「體態評估」中『頸椎曲度』測試選擇「過直」選項。',
    releaseIds: ['rel1', 'rel2'], tags: ['upper', 'posture', 'flexibility'],
    trainingNote: '著重頸椎與胸椎多方向溫和活動度練習，避免長期固定單一「軍姿」式頸部位置，並強化深頸屈肌的動態控制而非靜態鎖緊。', caution: null },
  { id: 'staticscapwing', name: '靜態翼狀肩胛 Static Scapular Winging', group: 'upperneck', tier: 2, clusterParent: 'ucs',
    cause: '前鋸肌無力，令肩胛骨內側緣在靜態站立或俯臥撐等動作中翹起偏離肋骨架，無法平貼胸廓。',
    symptoms: '俯臥撐或平板支撐時肩胛骨明顯凸起，可能伴隨肩部力量不足或耐力下降。', howToConfirm: '請客人四足跪姿或平板支撐，從後方觀察肩胛骨內側緣是否翹離肋骨架；可配合「體態評估」中『肩胛骨貼合度』測試。',
    releaseIds: ['rel2'], tags: ['upper', 'posture'],
    trainingNote: '針對性強化前鋸肌（如平板支撐、推類動作中加入「肩胛骨主動下壓貼肋」的指令），並留意是否合併神經性因素導致，需要時轉介評估。',
    caution: '如翼狀肩胛伴隨明顯肌肉萎縮或單側突然出現，建議轉介醫生排除神經性病因（如長胸神經受損）。' },
  { id: 'falsehipwidth', name: '假胯寬 False Hip Width', group: 'pelvis', tier: 1,
    cause: '並非骨盆骨骼真正變寬，而是股骨頭因髖外旋肌群緊繃、站姿習慣性外八或臀中肌無力，令大轉子向外側突出，視覺上令胯部顯得寬闊。',
    symptoms: '大腿外側視覺上突出、胯部看似寬闊，可能伴隨髖外側緊繃感。', howToConfirm: '從正面或背後觀察大轉子是否明顯外突，觸診髖外旋肌群是否緊繃；並留意日常站姿是否習慣外八。',
    releaseIds: ['rel5', 'rel4'], tags: ['lower', 'booty', 'posture'],
    trainingNote: '訓練上調整為髖內外旋肌群的平衡（放鬆過緊的外旋肌群、強化臀中肌側向穩定），並留意日常站姿是否習慣性外八或重心外移，而非單純「瘦大腿」的訓練思維。', caution: null },
  { id: 'lowback', name: '非特定性下背痛', group: 'spine', tier: 1,
    cause: '核心深層肌群（腹橫肌、多裂肌）啟動不足，加上長期姿勢不良或久坐，令下背在日常動作中承受過多負荷。',
    symptoms: '下背隱隱痠痛或緊繃，久坐、彎腰或提重物後加劇，通常無明確放射至下肢的症狀。', howToConfirm: '詢問疼痛是否侷限於下背、有無放射至臀腿或麻痺感；若純屬局部痠痛且無神經症狀，較符合非特定性下背痛，可配合核心與骨盆穩定度測試觀察。',
    releaseIds: ['rel6', 'rel3'], tags: ['core', 'relax'],
    trainingNote: '從低負荷的核心啟動與呼吸開始，避免早期深度脊椎屈曲動作，待控制能力提升後才漸進增加負荷與活動度。',
    caution: '如出現放射性疼痛、麻痺或劇烈疼痛，應先轉介醫生或物理治療師評估，切勿貿然開始訓練。' },
  { id: 'sciatica', name: '坐骨神經痛樣症狀 / 梨狀肌緊繃', group: 'lowerlimb', tier: 3,
    cause: '梨狀肌過度緊繃壓迫坐骨神經路徑，常見於久坐或臀肌力量失衡人士。',
    symptoms: '臀部深層緊繃或痠痛，可能沿大腿後側放射至小腿，久坐後症狀加劇，梨狀肌測試時疼痛重現。', howToConfirm: '詢問疼痛是否沿特定神經路徑放射至下肢，並觀察是否有麻痺或無力感；若有明顯放射痛或神經症狀，應先轉介醫護人員評估以排除神經根壓迫。',
    releaseIds: ['rel4'], tags: ['booty', 'relax'],
    trainingNote: '先以按摩球放鬆梨狀肌降低壓迫感，再漸進強化臀肌整體力量以分散負荷，訓練初期避免深度髖屈曲動作。',
    caution: '若有明顯下肢麻痺、放射痛或無力感，應先轉介醫護人員評估，排除神經壓迫等結構性問題。' },
  { id: 'postpartum', name: '產後核心修復 / 腹直肌分離', group: 'pelvis', tier: 1,
    cause: '懷孕期間腹壁結締組織延展，產後腹直肌左右兩側可能出現分離，核心深層力量與腹內壓管理能力下降。',
    symptoms: '腹部中線可能出現凹陷或膨隆、核心力量感覺不足，咳嗽或用力時腹部或骨盆底可能有漏尿或下墜感。', howToConfirm: '仰臥屈膝，捲腹時用手指觸診肚臍上下腹直肌間距是否超過2指寬（腹直肌分離初步自測），惟正式確診建議由醫護人員或物理治療師評估分離程度及骨盆底狀況。',
    releaseIds: ['rel6'], tags: ['core', 'relax'],
    trainingNote: '由深層核心呼吸（橫膈膜與骨盆底協同啟動）開始，避免早期完全屈曲類動作，待分離改善及控制力提升後才漸進增加核心負荷。順產一般建議產後約2個月、剖腹產約4個月經醫生評估後才恢復運動，並須留意惡露量、傷口癒合及哺乳期乳房保護。',
    caution: '建議先由醫護人員評估腹直肌分離程度及骨盆底狀況，再決定訓練起始強度。' },
  { id: 'deskstiff', name: '久坐辦公室綜合症 / 肩頸僵硬', group: 'upperneck', tier: 2,
    cause: '長時間靜態坐姿，肩頸及胸椎活動度下降，全身肌肉張力偏高，容易伴隨疲勞與淺呼吸。',
    symptoms: '肩頸長期緊繃、下背悶痛、下肢容易水腫疲勞，可能伴隨淺呼吸與能量低落感。', howToConfirm: '詢問每日久坐時數及螢幕使用習慣，配合觀察肩頸活動度與胸椎旋轉幅度是否受限；並非單一測試可確診，建議綜合『頭部位置』『胸椎後凸程度』等多項評估。',
    releaseIds: ['rel1', 'rel2'], tags: ['relax', 'flexibility'],
    trainingNote: '以高頻率、低強度的活動度與呼吸訓練為主，重點在恢復胸椎旋轉/伸展活動度及降低肩頸張力，密集短課效果優於單次長課。', caution: null },
];
const ISSUES_MAP = Object.fromEntries(ISSUES.map(i => [i.id, i]));
const ISSUE_GROUPS = ['upperneck', 'spine', 'pelvis', 'lowerlimb', 'framework'];

/* ============================== 靜態體態評估（側/正/後視圖）============================== */
/* 參考鉛垂線／關節中立位標準，每項測試提供可觀察或觸診的合格條件，選擇非中立選項會計入相應體態問題 */
const ASSESSMENT_TESTS = [
  // 側視圖 Side View
  { id: 'side_head', view: '側視圖', name: '頭部位置', criteria: '理想鉛垂線：耳垂應與肩峰對齊在同一垂直線上。', options: [
    { label: '中立（耳垂對準肩峰）', issueIds: [] },
    { label: '前伸（耳垂落在肩峰前方）', issueIds: ['fhp'] },
  ] },
  { id: 'side_cervical', view: '側視圖', name: '頸椎曲度', criteria: '正常頸椎應有輕微前凸曲度；用四指指尖測量曲度深淺。', options: [
    { label: '正常曲度', issueIds: [] },
    { label: '過直（曲度過小）', issueIds: ['militaryneck'] },
    { label: '過度前凸（曲度過大）', issueIds: [] },
  ] },
  { id: 'side_thoracic', view: '側視圖', name: '胸椎後凸程度', criteria: '中指沿胸椎棘突滑動，觀察後凸弧度是否正常。', options: [
    { label: '正常後凸', issueIds: [] },
    { label: '後凸增大（駝背）', issueIds: ['kyphosis', 'ucs'] },
    { label: '後凸減小（胸椎平直）', issueIds: ['thoracicflatback'] },
  ] },
  { id: 'side_lumbar', view: '側視圖', name: '腰椎曲度', criteria: '手掌平放腰椎與骨盆上方，感受前凸曲度深淺。', options: [
    { label: '正常前凸', issueIds: [] },
    { label: '平直（前凸曲度過小）', issueIds: ['lumbarflatback'] },
    { label: '過度前凸（曲度過大）', issueIds: ['lordosis'] },
  ] },
  { id: 'side_pelvis', view: '側視圖', name: '骨盆傾斜（側面）', criteria: '髂前上棘與髂後上棘水平對比，並比對是否滿足骨盆中立的兩項條件。', options: [
    { label: '中立位', issueIds: [] },
    { label: '前傾（髂前上棘明顯低於髂後上棘）', issueIds: ['apt'] },
    { label: '後傾（髂前上棘明顯高於髂後上棘）', issueIds: ['ppt'] },
  ] },
  { id: 'side_knee', view: '側視圖', name: '膝關節（側面）', criteria: '股骨大轉子與外踝連線，觀察是否穿過膝關節中心點。', options: [
    { label: '中立位（點在線上）', issueIds: [] },
    { label: '過度伸展／超伸（點在線後）', issueIds: ['recurvatum'] },
    { label: '微屈（點在線前）', issueIds: [] },
  ] },
  { id: 'side_ankle', view: '側視圖', name: '踝關節', criteria: '小腿中線與地面夾角，中立位約為90度。', options: [
    { label: '中立位（約90度）', issueIds: [] },
    { label: '蹠屈為主（大於90度）', issueIds: ['gait'] },
    { label: '背屈為主（小於90度）', issueIds: ['gait'] },
  ] },
  // 正視圖 Front View
  { id: 'front_shoulder', view: '正視圖', name: '肩部高度', criteria: '兩側鎖骨與肩峰連線是否水平。', options: [
    { label: '兩側等高', issueIds: [] },
    { label: '不等高（高低肩）', issueIds: ['highshoulder'] },
  ] },
  { id: 'front_pelvis', view: '正視圖', name: '骨盆高度（正面）', criteria: '兩側髂前上棘連線是否水平。', options: [
    { label: '兩側等高', issueIds: [] },
    { label: '不等高（一高一低）', issueIds: ['lpt'] },
  ] },
  { id: 'front_knee', view: '正視圖', name: '膝蓋對位（O／X型腿測試）', criteria: '雙腳併攏自然站立，觀察膝蓋與腳踝能否同時併攏。', options: [
    { label: '正常（膝、踝可同時併攏）', issueIds: [] },
    { label: '膝蓋無法併攏（O型腿）', issueIds: ['varum'] },
    { label: '腳踝無法併攏（X型腿）', issueIds: ['valgum'] },
  ] },
  { id: 'front_foot', view: '正視圖', name: '足部承重', criteria: '觀察雙腳內外側承重是否均勻。', options: [
    { label: '均勻承重', issueIds: [] },
    { label: '內側承重偏多（足弓塌陷傾向）', issueIds: ['flatfoot'] },
    { label: '外側承重偏多（足弓過高傾向）', issueIds: ['flatfoot'] },
  ] },
  { id: 'front_ribcage', view: '正視圖', name: '肋骨架高低／旋轉', criteria: '雙手平放肋骨架兩側，比較高度與旋轉方向是否對稱。', options: [
    { label: '對稱', issueIds: [] },
    { label: '不對稱（一側旋轉或外擴）', issueIds: ['scoliosis'] },
  ] },
  { id: 'front_head', view: '正視圖', name: '頭部／臉部對稱', criteria: '鼻尖、下巴對準胸骨，觀察是否居中不偏轉。', options: [
    { label: '對稱居中', issueIds: [] },
    { label: '旋轉或偏移一側', issueIds: ['fhp'] },
  ] },
  // 後視圖 Back View
  { id: 'back_achilles', view: '後視圖', name: '跟腱／足部旋前旋後', criteria: '跟腱應垂直於地面；觀察是否往內或往外偏。', options: [
    { label: '垂直中立', issueIds: [] },
    { label: '內旋（旋前）', issueIds: ['flatfoot'] },
    { label: '外旋（旋後）', issueIds: ['flatfoot'] },
  ] },
  { id: 'back_pelvis', view: '後視圖', name: '骨盆旋轉（後面）', criteria: '俯視觀察兩側髂脊是否等距，判斷有否順／逆時針旋轉。', options: [
    { label: '中立（無旋轉）', issueIds: [] },
    { label: '有旋轉（順時針或逆時針）', issueIds: ['lateralshift'] },
  ] },
  { id: 'back_scap_distance', view: '後視圖', name: '肩胛骨內側緣至脊柱距離', criteria: '肩胛骨內側緣與棘突之間，正常約為3-4指寬。', options: [
    { label: '正常（約3-4指）', issueIds: [] },
    { label: '過寬／前引（大於4指）', issueIds: ['roundshoulder', 'ucs'] },
    { label: '過窄／後縮（小於3指）', issueIds: [] },
  ] },
  { id: 'back_scap_wing', view: '後視圖', name: '肩胛骨貼合度', criteria: '觀察肩胛骨內側緣是否平貼肋骨架，有否翹起或縫隙。', options: [
    { label: '平貼肋骨架', issueIds: [] },
    { label: '翹起／有縫隙（翼狀肩胛）', issueIds: ['staticscapwing'] },
  ] },
  { id: 'back_scap_tilt', view: '後視圖', name: '肩胛骨前傾', criteria: '肩胛下角與肋骨架之間是否能塞入約一指空隙。', options: [
    { label: '正常', issueIds: [] },
    { label: '前傾（下角明顯翹離）', issueIds: ['roundshoulder', 'ucs'] },
  ] },
  { id: 'back_spine', view: '後視圖', name: '脊柱居中度', criteria: '從C7沿棘突垂直向下觀察是否成一直線。', options: [
    { label: '居中一直線', issueIds: [] },
    { label: '側彎偏移', issueIds: ['scoliosis'] },
  ] },
  { id: 'back_glutefold', view: '後視圖', name: '臀紋線高度', criteria: '兩側臀紋線水平位置是否等高。', options: [
    { label: '兩側等高', issueIds: [] },
    { label: '不等高', issueIds: ['lpt', 'falsehipwidth'] },
  ] },
];
const ASSESSMENT_VIEWS = ['側視圖', '正視圖', '後視圖'];

/*@@DATA2@@*/

function analyzeAssessment(answers) {
  const tally = {};
  ASSESSMENT_TESTS.forEach(t => {
    const idx = answers[t.id];
    if (idx === undefined || idx === null) return;
    const opt = t.options[idx];
    if (!opt) return;
    (opt.issueIds || []).forEach(id => { tally[id] = (tally[id] || 0) + 1; });
  });
  const detected = Object.entries(tally)
    .map(([id, count]) => ({ id, count, issue: ISSUES_MAP[id] }))
    .filter(d => d.issue)
    .sort((a, b) => b.count - a.count || a.issue.tier - b.issue.tier);
  const answeredCount = Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== null).length;
  return { tally, detected, answeredCount, totalCount: ASSESSMENT_TESTS.length };
}

/* ============================== GENERATION LOGIC ============================== */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function roundRobinPick(list, count, usedIds) {
  const byEquip = {};
  shuffle(list).forEach(e => { if (usedIds.has(e.id)) return; (byEquip[e.equipment] = byEquip[e.equipment] || []).push(e); });
  const keys = shuffle(Object.keys(byEquip));
  const picked = []; let idx = 0; let guard = 0;
  while (picked.length < count && keys.some(k => byEquip[k].length > 0) && guard < 500) {
    const k = keys[idx % keys.length];
    if (byEquip[k].length > 0) { const item = byEquip[k].shift(); picked.push(item); usedIds.add(item.id); }
    idx++; guard++;
  }
  return picked;
}

function normalizeWeights(themes) {
  const sum = themes.reduce((s, t) => s + t.weight, 0) || 1;
  return themes.map(t => ({ key: t.key, weight: t.weight / sum }));
}

function themesLabel(themes) {
  if (!themes || themes.length === 0) return '';
  return themes.map(t => `${THEME_LABEL[t.key] || t.key}${themes.length > 1 ? ` ${Math.round(t.weight * 100)}%` : ''}`).join(' + ');
}

const POSITION_LABEL = { supine: '仰臥', prone: '俯臥', sidelying: '側臥', plank: '平板/跪撐', kneeling: '跪姿', seated: '坐姿', standing: '站姿' };
const POSITION_ORDER = { supine: 0, prone: 1, sidelying: 2, plank: 3, kneeling: 4, seated: 5, standing: 6 };
function positionRank(e) { return POSITION_ORDER[e.position] !== undefined ? POSITION_ORDER[e.position] : 5; }
function springWeight(text) {
  if (!text) return 1;
  const spec = text.split(/[（(]/)[0]; // only classify the spec portion, ignore parenthetical notes (which may contain unrelated words like "太重")
  if (spec.includes('免彈簧')) return 0;
  if (spec.includes('重')) return 3;
  if (spec.includes('中')) return 2;
  if (spec.includes('輕')) return 1;
  return 1;
}
// 依身體姿勢分組排序，再依彈簧輕重排序，減少換彈簧、上下床或反覆拆裝配件的次數
function sortForTransitions(list) {
  return list.map((e, i) => ({ e, i })).sort((a, b) => {
    const pa = positionRank(a.e), pb = positionRank(b.e);
    if (pa !== pb) return pa - pb;
    const sa = springWeight(a.e.springs), sb = springWeight(b.e.springs);
    if (sa !== sb) return sb - sa;
    return a.i - b.i;
  }).map(x => x.e);
}
function buildTransitionHints(main) {
  const hints = [];
  for (let i = 1; i < main.length; i++) {
    const prev = main[i - 1], curr = main[i];
    const parts = [];
    if (prev.position && curr.position && prev.position !== curr.position) parts.push(`轉換為${POSITION_LABEL[curr.position]}`);
    const sw1 = springWeight(prev.springs), sw2 = springWeight(curr.springs);
    if (prev.springs && curr.springs && sw1 !== sw2) parts.push(`彈簧調整為「${curr.springs.split('（')[0]}」`);
    if (parts.length) hints.push({ afterIndex: i, text: parts.join('，') });
  }
  return hints;
}
const PROP_KEYWORDS = [
  { match: /短箱|Short Box/i, label: '短箱 Short Box' },
  { match: /長箱|Long Box/i, label: '長箱 Long Box' },
  { match: /腳套繩|Feet in Straps/i, label: '腳套繩 Foot Straps' },
  { match: /跳板|Jumpboard|Jump Board/i, label: '跳板 Jump Board' },
];
function equipmentChecklist(result, selectedProps, extraFlags) {
  const items = new Set();
  const all = [...(result.warmup || []), ...(result.main || []), ...(result.cool || [])];
  all.forEach(e => PROP_KEYWORDS.forEach(k => { if (k.match.test(e.name)) items.add(k.label); }));
  (selectedProps || []).forEach(key => { const p = PROPS.find(x => x.key === key); if (p) items.add(p.name); });
  if (extraFlags && extraFlags.jumpboard) items.add('跳板 Jump Board');
  return Array.from(items);
}

const FOOTWORK_IDS = ['e23', 'e24', 'e25', 'e26'];
function generateClass({ equipmentSel, themes, duration, level, avoidIds, conditions }) {
  const levelMax = levelRank(level);
  const fullPool = EXERCISES.filter(e => onEquip(e, equipmentSel) && levelRank(e.level) <= levelMax && isSafeFor(e, conditions));
  const totalMain = DURATION_COUNT[duration] || 6;
  const neededHeadroom = totalMain + 3; // warmup(1) + cool(2) + a little slack
  const avoid = avoidIds && avoidIds.length ? new Set(avoidIds) : null;
  // Prefer excluding exercises used in the previous generation, but only when enough alternatives remain —
  // this is what lets "生成課堂" be pressed again for a genuinely different flow instead of repeats.
  const basePool = (avoid && fullPool.filter(e => !avoid.has(e.id)).length >= neededHeadroom)
    ? fullPool.filter(e => !avoid.has(e.id))
    : fullPool;
  const used = new Set();
  // STOTT「以五大原則熱身」：熱身以呼吸、骨盆、肋骨架、肩胛、頭頸的預備動作為主；墊上熱身動作亦可直接在床上進行，所以即使未選Mat也納入
  const warmupCount = duration >= 45 ? 2 : 1;
  let warmupCandidates = EXERCISES.filter(e => e.category === '熱身' && (onEquip(e, equipmentSel) || e.equipment === 'mat') && levelRank(e.level) <= levelMax && isSafeFor(e, conditions) && !(avoid && avoid.has(e.id)));
  if (warmupCandidates.length < warmupCount) warmupCandidates = basePool.filter(e => e.category === '熱身' || e.tags.includes('relax'));
  const warmup = roundRobinPick(warmupCandidates, warmupCount, used);
  // STOTT／Polestar 慣例：Reformer 課以腳部練習 Footwork 開場（熱身下肢、建立對位，並讓導師觀察學員當日狀態）
  let opener = [];
  if (equipmentSel.includes('reformer')) {
    const fw = basePool.filter(e => FOOTWORK_IDS.includes(e.id) && !used.has(e.id));
    if (fw.length) { opener = [shuffle(fw)[0]]; used.add(opener[0].id); }
  }

  const normWeights = normalizeWeights(themes);
  const mainSlots = totalMain - opener.length;
  let main = [];
  normWeights.forEach((t, idx) => {
    const isLast = idx === normWeights.length - 1;
    const remain = mainSlots - main.length;
    const count = isLast ? remain : Math.max(1, Math.round(mainSlots * t.weight));
    const tagList = THEME_TAGS[t.key] || [t.key];
    const candidates = basePool.filter(e => e.tags.some(tag => tagList.includes(tag)));
    const picks = roundRobinPick(candidates, count, used);
    main = main.concat(picks);
  });
  if (main.length < mainSlots) {
    const fill = roundRobinPick(basePool, mainSlots - main.length, used);
    main = main.concat(fill);
  }
  main = [...opener, ...sortForTransitions(main)];
  // 收操以低強度的伸展／放鬆動作為主，排除整合類及高階動作；墊上伸展亦可在床邊完成
  let coolCandidates = EXERCISES.filter(e => (onEquip(e, equipmentSel) || e.equipment === 'mat') && isSafeFor(e, conditions) && levelRank(e.level) <= Math.min(levelMax, 2) && e.category !== '整合' && (e.tags.includes('flexibility') || e.tags.includes('relax')));
  if (coolCandidates.filter(e => !used.has(e.id)).length < 2) coolCandidates = basePool.filter(e => e.tags.includes('flexibility') || e.tags.includes('relax'));
  const cool = roundRobinPick(coolCandidates, 2, used);

  const releaseIdSet = [];
  themes.forEach(t => (THEME_RELEASE[t.key] || []).forEach(id => { if (!releaseIdSet.includes(id)) releaseIdSet.push(id); }));
  const releaseSuggestion = releaseIdSet.slice(0, 2).map(id => RELEASE_MAP[id]).filter(Boolean);
  const transitionHints = buildTransitionHints(main);

  return { warmup, main, cool, releaseSuggestion, transitionHints };
}

function buildPhases(weeks) {
  if (weeks <= 4) {
    const mid = Math.max(1, Math.round(weeks * 0.5));
    return [
      { name: '基礎啟動期', startWeek: 1, endWeek: mid, goal: '建立身體覺察與正確啟動模式，避免代償動作。', levelCap: 1 },
      { name: '鞏固與進階期', startWeek: mid + 1, endWeek: weeks, goal: '漸進增加負荷，鞏固動作品質與控制力。', levelCap: 2 },
    ];
  }
  const p1 = Math.max(1, Math.round(weeks * 0.3));
  const p2 = Math.max(p1 + 1, Math.round(weeks * 0.7));
  return [
    { name: '基礎評估與啟動期', startWeek: 1, endWeek: p1, goal: '建立身體覺察、啟動目標肌群、學習正確呼吸與對位。', levelCap: 1 },
    { name: '肌力建立與控制期', startWeek: p1 + 1, endWeek: p2, goal: '漸進負荷，強化目標肌群力量與動作控制。', levelCap: 2 },
    { name: '整合與進階期', startWeek: p2 + 1, endWeek: weeks, goal: '功能性整合、動作模式鞏固，準備自主延續訓練。', levelCap: 3 },
  ];
}

function generateProgram({ issueId, weeks, sessions, equipmentSel, level, conditions }) {
  const issue = ISSUES.find(i => i.id === issueId);
  const levelMax = levelRank(level);
  const pool = EXERCISES.filter(e => onEquip(e, equipmentSel) && e.tags.some(t => issue.tags.includes(t)) && isSafeFor(e, conditions));
  const phases = buildPhases(weeks);
  const used = new Set();
  const phaseResults = phases.map(ph => {
    const cap = Math.min(ph.levelCap, levelMax);
    let phasePool = pool.filter(e => levelRank(e.level) <= cap);
    if (phasePool.length < 4) phasePool = pool.filter(e => levelRank(e.level) <= levelMax);
    let picks = roundRobinPick(phasePool, 5, used);
    if (picks.length < 3) { const fallback = phasePool.filter(e => !picks.includes(e)).slice(0, 3 - picks.length); picks = picks.concat(fallback); }
    return { ...ph, exercises: picks };
  });
  const releaseItems = issue.releaseIds.map(id => RELEASE_MAP[id]).filter(Boolean);
  return { issue, phases: phaseResults, sessions, releaseItems, conditions: conditions || [] };
}

/* ---------- 多重體態問題：優先順序判斷 + 綜合訓練規劃 ---------- */
function resolveIssueSelection(issueIds) {
  const selectedSet = new Set(issueIds);
  const consumedChildren = new Set();
  const clusterNotes = [];
  issueIds.forEach(id => {
    const issue = ISSUES_MAP[id];
    if (issue && issue.clusterChildren) {
      const present = issue.clusterChildren.filter(c => selectedSet.has(c));
      if (present.length) {
        present.forEach(c => consumedChildren.add(c));
        clusterNotes.push({ parentId: id, parentName: issue.name, children: present.map(c => ISSUES_MAP[c].name) });
      }
    }
  });
  const resolved = issueIds.filter(id => !consumedChildren.has(id)).map(id => ISSUES_MAP[id]).filter(Boolean);
  return { resolved, clusterNotes };
}

function prioritizeIssues(resolved) {
  const trainable = resolved.filter(i => i.tier !== 0);
  const framework = resolved.filter(i => i.tier === 0);
  const scored = trainable.map(i => {
    const overlap = trainable.filter(j => j.id !== i.id && j.tags.some(t => i.tags.includes(t))).length;
    const score = i.tier * 100 - overlap * 5 + (i.caution ? -1000 : 0);
    return { issue: i, overlap, score };
  });
  scored.sort((a, b) => a.score - b.score);
  scored.forEach((entry, idx) => { entry.rank = idx + 1; });
  return { ordered: scored, framework };
}

function rationaleFor(entry) {
  const { issue, overlap, rank } = entry;
  const reasons = [];
  if (issue.caution) reasons.push('屬於需要優先留意安全的問題，會先以溫和放鬆與基礎控制介入，並建議配合醫療評估');
  if (issue.tier === 1) reasons.push('屬於核心／骨盆穩定的根基，其他問題的訓練效果都建立在這個基礎之上');
  if (issue.tier === 2) reasons.push('涉及脊椎與肩胛帶排列，建議在骨盆穩定後再處理，避免代償轉移到下肢');
  if (issue.tier === 3) reasons.push('屬於周邊對位問題，建議在軀幹穩定度提升後再精準介入，效果會更持久');
  if (overlap > 0) reasons.push(`與你選擇的其他 ${overlap} 個問題有共通的訓練元素，優先處理可帶來連鎖改善`);
  return { rank, name: issue.name, tierLabel: TIER_LABEL[issue.tier], reason: reasons.join('；') };
}

function generateMultiIssueProgram({ issueIds, weeks, sessions, equipmentSel, level, conditions }) {
  const safeEx = EXERCISES.filter(e => isSafeFor(e, conditions));
  const { resolved, clusterNotes } = resolveIssueSelection(issueIds);
  const { ordered, framework } = prioritizeIssues(resolved);
  const rationale = ordered.map(rationaleFor);
  const levelMax = levelRank(level);
  const phases = buildPhases(weeks);
  const totalTrainable = ordered.length || 1;
  const used = new Set();

  const phaseResults = phases.map((ph, pIdx) => {
    const cap = Math.min(ph.levelCap, levelMax);
    const t = phases.length > 1 ? pIdx / (phases.length - 1) : 1;
    const slotCount = Math.min(9, 5 + Math.min(ordered.length, 4));
    const weights = ordered.map((entry, idx) => {
      const frontLoaded = (totalTrainable - idx);
      const even = 1;
      return frontLoaded * (1 - t) + even * t;
    });
    const weightSum = weights.reduce((s, w) => s + w, 0) || 1;
    let picks = [];
    ordered.forEach((entry, idx) => {
      const remain = slotCount - picks.length;
      const isLast = idx === ordered.length - 1;
      const count = isLast ? Math.max(0, remain) : Math.max(1, Math.round(slotCount * (weights[idx] / weightSum)));
      let phasePool = safeEx.filter(e => onEquip(e, equipmentSel) && levelRank(e.level) <= cap && e.tags.some(t2 => entry.issue.tags.includes(t2)));
      if (phasePool.length < count) phasePool = safeEx.filter(e => onEquip(e, equipmentSel) && levelRank(e.level) <= levelMax && e.tags.some(t2 => entry.issue.tags.includes(t2)));
      const got = roundRobinPick(phasePool, count, used);
      picks = picks.concat(got);
    });
    if (picks.length < 3) {
      const allTags = ordered.length ? ordered.flatMap(e => e.issue.tags) : (framework.length ? framework.flatMap(f => f.tags) : ['core', 'posture']);
      const fallbackPool = safeEx.filter(e => onEquip(e, equipmentSel) && levelRank(e.level) <= levelMax && e.tags.some(t2 => allTags.includes(t2)));
      const fallback = roundRobinPick(fallbackPool, Math.max(3, slotCount) - picks.length, used);
      picks = picks.concat(fallback);
    }
    if (picks.length === 0) {
      const allTags = ordered.length ? ordered.flatMap(e => e.issue.tags) : (framework.length ? framework.flatMap(f => f.tags) : []);
      let lastResort = safeEx.filter(e => onEquip(e, equipmentSel) && levelRank(e.level) <= levelMax && (allTags.length === 0 || e.tags.some(t2 => allTags.includes(t2))));
      if (lastResort.length === 0) lastResort = safeEx.filter(e => onEquip(e, equipmentSel) && levelRank(e.level) <= levelMax);
      picks = lastResort.slice(0, 4);
    }
    return { ...ph, exercises: picks };
  });

  const releaseIdSet = [];
  resolved.forEach(i => i.releaseIds.forEach(id => { if (!releaseIdSet.includes(id)) releaseIdSet.push(id); }));
  const releaseItems = releaseIdSet.map(id => RELEASE_MAP[id]).filter(Boolean);
  const cautions = resolved.filter(i => i.caution).map(i => ({ name: i.name, text: i.caution }));

  return { rationale, framework, clusterNotes, phases: phaseResults, sessions, releaseItems, cautions, conditions: conditions || [] };
}

const CIRCUIT_STATIONS = ['reformer', 'halfcad', 'ladder', 'chair'];

function distributeStudents(n, parts) {
  const base = Math.floor(n / parts); const rem = n % parts;
  return Array.from({ length: parts }, (_, i) => base + (i < rem ? 1 : 0));
}

function generateCircuit({ themeKey, duration, level, students }) {
  const levelMax = levelRank(level);
  const perStationCount = duration <= 45 ? 2 : 3;
  const used = new Set();
  const tagList = THEME_TAGS[themeKey] || [themeKey];

  const warmupPool = EXERCISES.filter(e => e.equipment === 'mat' && (e.category === '熱身' || e.tags.includes('relax')) && levelRank(e.level) <= levelMax);
  const warmup = roundRobinPick(warmupPool, 2, used);
  const cooldownPool = EXERCISES.filter(e => e.equipment === 'mat' && (e.tags.includes('flexibility') || e.tags.includes('relax')) && levelRank(e.level) <= levelMax);
  const cooldown = roundRobinPick(cooldownPool, 2, used);

  const stations = CIRCUIT_STATIONS.map(eq => {
    let pool = EXERCISES.filter(e => e.equipment === eq && levelRank(e.level) <= levelMax && e.tags.some(t => tagList.includes(t)));
    if (pool.length < perStationCount) pool = EXERCISES.filter(e => e.equipment === eq && levelRank(e.level) <= levelMax);
    const picks = roundRobinPick(pool, perStationCount, used);
    return { equipment: eq, exercises: picks };
  });

  const groupSizes = distributeStudents(students, 4);
  const rotation = [0, 1, 2, 3].map(round => [0, 1, 2, 3].map(g => CIRCUIT_STATIONS[(g + round) % 4]));
  const remainMinutes = Math.max(20, duration - 13);
  const stationTime = Math.round(remainMinutes / 4);

  return { warmup, cooldown, stations, groupSizes, rotation, stationTime };
}

function chairSafetyNote(size, level) {
  if (size <= 4) return `${size}人小班，可個別調整彈簧阻力與踏板高度，站姿動作可直接於椅上練習並逐一糾正。`;
  if (size <= 8) return `${size}人課堂，建議先以地面/Mat示範站姿動作要領，確認學員理解膝關節與骨盆對位後才上椅，並保持椅與椅之間至少1米距離方便你巡場觀察。`;
  return `${size}人大班，建議分批上椅練習跳躍/單腳平衡類動作，其餘學員先以Mat動作候位，確保每次上椅人數都在你視線範圍內。`;
}

/* ============================== 回家作業小卡 HOME EXERCISE PROGRAM (HEP) ============================== */
function generateHEP({ tags, clientName, conditions }) {
  const used = new Set();
  const pool = EXERCISES.filter(e => e.equipment === 'mat' && levelRank(e.level) <= 1 && e.tags.some(t => tags.includes(t)) && isSafeFor(e, conditions));
  let picks = roundRobinPick(pool, 3, used);
  if (picks.length < 3) {
    const fallback = EXERCISES.filter(e => e.equipment === 'mat' && levelRank(e.level) <= 1 && (e.tags.includes('relax') || e.tags.includes('core')) && isSafeFor(e, conditions));
    const fill = roundRobinPick(fallback, 3 - picks.length, used);
    picks = picks.concat(fill);
  }
  const releaseIds = [];
  tags.forEach(tag => (THEME_RELEASE[tag] || []).forEach(id => { if (!releaseIds.includes(id)) releaseIds.push(id); }));
  const release = releaseIds.slice(0, 2).map(id => RELEASE_MAP[id]).filter(Boolean);
  return { exercises: picks, release, clientName };
}

/* ============================== STORAGE HELPERS ============================== */
async function loadSavedIndex() {
  try {
    const res = await window.storage.get('saved-index', false);
    return res && res.value ? JSON.parse(res.value) : [];
  } catch (err) { return []; }
}
async function persistIndex(list) {
  try { await window.storage.set('saved-index', JSON.stringify(list), false); return true; } catch (err) { return false; }
}
async function saveFlowItem({ type, title, meta, payload }) {
  const id = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const savedAt = new Date().toISOString();
  try {
    await window.storage.set(`saved-item:${id}`, JSON.stringify(payload), false);
    const idx = await loadSavedIndex();
    const next = [{ id, type, title, meta, savedAt }, ...idx];
    await persistIndex(next);
    return { ok: true, id };
  } catch (err) { return { ok: false }; }
}
async function loadFlowPayload(id) {
  try {
    const res = await window.storage.get(`saved-item:${id}`, false);
    return res && res.value ? JSON.parse(res.value) : null;
  } catch (err) { return null; }
}
async function deleteFlowItem(id) {
  try { await window.storage.delete(`saved-item:${id}`, false); } catch (err) { /* best effort */ }
  const idx = await loadSavedIndex();
  const next = idx.filter(i => i.id !== id);
  await persistIndex(next);
  return next;
}
async function addSessionLogEntry(id, entry) {
  const payload = await loadFlowPayload(id);
  if (!payload) return null;
  const sessionLog = Array.isArray(payload.sessionLog) ? payload.sessionLog : [];
  const nextPayload = { ...payload, sessionLog: [{ ...entry, id: `${Date.now()}` }, ...sessionLog] };
  try { await window.storage.set(`saved-item:${id}`, JSON.stringify(nextPayload), false); return nextPayload; } catch (err) { return null; }
}

/* ============================== SMALL UI PIECES ============================== */
function CoilBar({ color, colorSoft, width, children }) {
  return (
    <div style={{
      width, minWidth: 64, borderRadius: 8, padding: '10px 12px',
      background: `repeating-linear-gradient(58deg, ${color}, ${color} 3px, ${colorSoft} 3px, ${colorSoft} 7px)`,
      color: C.surface, fontFamily: FONT_MONO, fontSize: 12, fontWeight: 600,
      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
    }}>{children}</div>
  );
}

function Chip({ active, onClick, children, color }) {
  return (
    <button onClick={onClick} type="button" style={{
      padding: '6px 13px', borderRadius: 999, fontSize: 13, fontFamily: FONT_BODY, cursor: 'pointer',
      border: `1.5px solid ${active ? (color || C.pine) : C.line}`,
      background: active ? (color || C.pine) : C.surface,
      color: active ? C.surface : C.inkSoft, fontWeight: active ? 600 : 500,
      transition: 'all .15s',
    }}>{children}</button>
  );
}

function Badge({ children, color, soft }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 9px', borderRadius: 6, fontSize: 11.5,
      fontFamily: FONT_MONO, fontWeight: 600, letterSpacing: 0.2,
      background: soft || C.surface2, color: color || C.inkSoft,
    }}>{children}</span>
  );
}

function SectionTitle({ eyebrow, title, sub }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {eyebrow && <div style={{ fontFamily: FONT_MONO, fontSize: 12, letterSpacing: 2, color: C.brass, textTransform: 'uppercase', marginBottom: 6 }}>{eyebrow}</div>}
      <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 800, color: C.pine, margin: 0 }}>{title}</h2>
      {sub && <p style={{ color: C.inkSoft, fontSize: 14, marginTop: 6, maxWidth: 660, lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );
}

function splitSteps(text) {
  if (!text) return [];
  return text.split(/(?=[①②③④⑤⑥⑦⑧⑨])/).map(s => s.trim()).filter(Boolean);
}

function StepList({ text, size = 12.5 }) {
  const steps = splitSteps(text);
  if (steps.length <= 1) return <span>{text}</span>;
  return (
    <div style={{ display: 'grid', gap: 3 }}>
      {steps.map((s, i) => <div key={i} style={{ fontSize: size }}>{s}</div>)}
    </div>
  );
}

function ExerciseCard({ e, springBrand, conditions }) {
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState('standard');
  // 筆記註解以動作ID讀取，舊的收藏紀錄（未包含新欄位）也能顯示
  const ann = EXERCISE_MAP[e.id] || e;
  const flagged = conditions && conditions.length > 0 && !isSafeFor(ann, conditions);
  const hitContra = flagged ? ann.contra.filter(c => conditions.includes(c) || (c === 'disc' && conditions.includes('discacute'))) : [];
  const pHint = pelvicHint(ann);
  const Icon = EQUIPMENT.find(q => q.key === e.equipment)?.icon;
  const hasVariants = e.regression && e.progression;
  const brandColor = springBrand && e.springs ? springColorForBrand(e.springs, springBrand) : null;
  return (
    <div style={{ background: C.surface, border: `1px solid ${flagged ? C.rose : C.line}`, borderRadius: 12, overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} type="button" style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', padding: 14, display: 'flex', gap: 12 }}>
        <div style={{ color: C.pine, flexShrink: 0, opacity: 0.85 }}>{Icon && <Icon size={28} />}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15, color: C.ink }}>{e.name}</span>
            <Badge color={C.pineSoft}>{LEVEL_LABEL[e.level]}</Badge>
            {e.category && <Badge color={C.inkFaint}>{e.category}</Badge>}
            {ann.sys && ann.sys !== '工作室' && <Badge color={C.slate} soft={C.slateSoft}>{ann.sys.replace('+', ' · ')}</Badge>}
            {flagged && <Badge color={C.surface} soft={C.rose}>⚠ 禁忌：{hitContra.map(c => CONTRA_LABEL[c]).join('、')}</Badge>}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {e.tags.map(t => <Badge key={t} color={TAG_COLOR[t]} soft={TAG_COLOR[t] + '22'}>{TAG_LABEL[t]}</Badge>)}
          </div>
          {e.springs && (
            <div style={{ marginTop: 6, fontSize: 11.5, color: C.brassDeep, fontFamily: FONT_MONO }}>
              ⚙ {e.springs}
              {brandColor && <span style={{ color: C.pine, fontWeight: 700 }}> → {brandColor}</span>}
            </div>
          )}
        </div>
        {open ? <ChevronUp size={17} color={C.inkFaint} style={{ flexShrink: 0, marginTop: 4 }} /> : <ChevronDown size={17} color={C.inkFaint} style={{ flexShrink: 0, marginTop: 4 }} />}
      </button>
      {open && (
        <div style={{ padding: '0 14px 14px' }}>
          {hasVariants && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }} onClick={ev => ev.stopPropagation()}>
              {[['regression', '降階'], ['standard', '標準'], ['progression', '進階']].map(([key, label]) => (
                <button key={key} type="button" onClick={() => setVariant(key)} style={{
                  padding: '4px 11px', borderRadius: 999, fontSize: 11.5, cursor: 'pointer', fontFamily: FONT_BODY,
                  border: `1.5px solid ${variant === key ? C.brass : C.line}`,
                  background: variant === key ? C.brass : 'transparent',
                  color: variant === key ? C.surface : C.inkSoft, fontWeight: variant === key ? 700 : 500,
                }}>{label}</button>
              ))}
            </div>
          )}
          {hasVariants && variant !== 'standard' && (
            <div style={{ fontSize: 12.5, lineHeight: 1.6, color: C.ink, background: variant === 'regression' ? C.sageSoft : C.brassSoft, borderRadius: 8, padding: 9, marginBottom: 10 }}>
              <strong style={{ fontFamily: FONT_MONO, fontSize: 11.5, display: 'block', marginBottom: 2, color: variant === 'regression' ? C.sage : C.brassDeep }}>
                {variant === 'regression' ? '降階 Regression（做不到時）' : '進階 Progression（太簡單時）'}
              </strong>
              {variant === 'regression' ? e.regression : e.progression}
            </div>
          )}
          <div style={{ fontSize: 12.5, lineHeight: 1.6, color: C.ink, marginBottom: 8 }}>
            <strong style={{ color: C.pine, fontFamily: FONT_MONO, fontSize: 11.5, display: 'block', marginBottom: 3 }}>操作步驟</strong>
            <StepList text={e.instructions} />
          </div>
          <div style={{ fontSize: 12.5, lineHeight: 1.6, color: C.ink, marginBottom: 8 }}><strong style={{ color: C.sage, fontFamily: FONT_MONO, fontSize: 11.5 }}>好處　</strong>{e.benefits}</div>
          <div style={{ fontSize: 12.5, lineHeight: 1.6, color: C.ink, marginBottom: e.teacherTip ? 8 : 0 }}><strong style={{ color: C.rose, fontFamily: FONT_MONO, fontSize: 11.5 }}>常見錯誤　</strong>{e.mistakes}</div>
          {e.teacherTip && (
            <div style={{ fontSize: 12.5, lineHeight: 1.6, color: C.ink, background: C.slateSoft, borderRadius: 8, padding: 9, marginTop: 4 }}>
              <strong style={{ color: C.slate, fontFamily: FONT_MONO, fontSize: 11.5, display: 'block', marginBottom: 2 }}>導師觀察與觸覺口令</strong>
              {e.teacherTip}
            </div>
          )}
          {ann.cue && (
            <div style={{ fontSize: 12.5, lineHeight: 1.6, color: C.ink, background: C.brassSoft + '66', borderRadius: 8, padding: 9, marginTop: 8 }}>
              <strong style={{ color: C.brassDeep, fontFamily: FONT_MONO, fontSize: 11.5, display: 'block', marginBottom: 2 }}>Polestar 意象口令</strong>
              {ann.cue}
            </div>
          )}
          {(ann.chain || ann.stott || (ann.assess && ann.assess.length) || (ann.contra && ann.contra.length)) && (
            <div style={{ display: 'grid', gap: 4, marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${C.line}`, fontSize: 11.5, lineHeight: 1.55, color: C.inkSoft }}>
              {ann.chain && <div><strong style={{ color: C.pine, fontFamily: FONT_MONO }}>運動鏈　</strong>{ann.chain}{pHint ? `　·　${pHint}` : ''}</div>}
              {ann.stott && <div><strong style={{ color: C.pine, fontFamily: FONT_MONO }}>STOTT 設定　</strong>{ann.stott}<span style={{ color: C.inkFaint }}>（曼麗丘彈簧根數，紅=100%）</span></div>}
              {ann.assess && ann.assess.length > 0 && <div><strong style={{ color: C.pine, fontFamily: FONT_MONO }}>相關評估　</strong>{ann.assess.map(k => SCREENING_MAP[k] ? SCREENING_MAP[k].name : k).join('、')}</div>}
              {ann.contra && ann.contra.length > 0 && <div><strong style={{ color: C.rose, fontFamily: FONT_MONO }}>禁忌症　</strong>{ann.contra.map(c => CONTRA_LABEL[c]).join('、')}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ConditionPicker({ value, onChange }) {
  const toggle = (k) => onChange(value.includes(k) ? value.filter(x => x !== k) : [...value, k]);
  const excluded = value.length ? EXERCISES.filter(e => !isSafeFor(e, value)).length : 0;
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {CONTRA.map(c => <Chip key={c.key} active={value.includes(c.key)} color={C.rose} onClick={() => toggle(c.key)}>{c.label}</Chip>)}
      </div>
      <div style={{ fontSize: 11.5, color: C.inkFaint, marginTop: 6, lineHeight: 1.5 }}>
        依北極星普拉提筆記每個動作的「禁忌症」自動排除不適合的動作（屈曲類、伸展類、側屈／旋轉類、上肢負重類、髖／骨盆類、倒置類）。
        {value.length > 0 && <strong style={{ color: C.rose }}>　已排除 {excluded} 個動作。</strong>}
        禁忌篩選只是第一道防線，客人有未確診或持續的痛症仍應先轉介醫療評估。
      </div>
    </div>
  );
}

function MultiEquipPicker({ value, onChange, options }) {
  const opts = options || EQUIPMENT;
  const toggle = (k) => onChange(value.includes(k) ? value.filter(v => v !== k) : [...value, k]);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: 8 }}>
      {opts.map(eq => {
        const active = value.includes(eq.key); const Icon = eq.icon;
        return (
          <button key={eq.key} type="button" onClick={() => toggle(eq.key)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 10, cursor: 'pointer',
            border: `1.5px solid ${active ? C.pine : C.line}`, background: active ? C.pine : C.surface,
            color: active ? C.surface : C.ink, textAlign: 'left',
          }}>
            <Icon size={22} />
            <span style={{ fontSize: 12.5, fontWeight: 600, fontFamily: FONT_BODY }}>{eq.name}</span>
          </button>
        );
      })}
    </div>
  );
}

function CopyButton({ getText }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" onClick={async () => {
      try { await navigator.clipboard.writeText(getText()); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch (err) { /* clipboard unavailable */ }
    }} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
      background: copied ? C.sage : C.brass, color: C.surface, border: 'none', cursor: 'pointer',
      fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600,
    }}>
      {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? '已複製' : '複製內容'}
    </button>
  );
}

function ExportPdfButton({ buildDoc, onPrint }) {
  return (
    <button type="button" onClick={() => { onPrint(buildDoc()); setTimeout(() => window.print(), 150); }} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
      background: C.pineSoft, color: C.surface, border: 'none', cursor: 'pointer',
      fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600,
    }}>
      <FileDown size={15} /> 匯出 PDF
    </button>
  );
}

function SaveButton({ onSave, defaultTitle }) {
  const [state, setState] = useState('idle');
  const [title, setTitle] = useState(defaultTitle || '');
  if (state === 'editing') {
    return (
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <input autoFocus value={title} onChange={ev => setTitle(ev.target.value)} placeholder="為此組合命名…" style={{
          padding: '7px 10px', borderRadius: 7, border: `1.5px solid ${C.line}`, fontSize: 12.5, fontFamily: FONT_BODY, width: 180,
        }} />
        <button type="button" onClick={async () => { setState('saving'); const ok = await onSave(title || '未命名組合'); setState(ok ? 'saved' : 'idle'); if (ok) setTimeout(() => setState('idle'), 2200); }} style={{
          padding: '7px 12px', borderRadius: 7, border: 'none', background: C.pine, color: C.surface, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: FONT_BODY,
        }}>確認儲存</button>
        <button type="button" onClick={() => setState('idle')} style={{ padding: '7px 10px', borderRadius: 7, border: `1.5px solid ${C.line}`, background: 'transparent', fontSize: 12.5, cursor: 'pointer', fontFamily: FONT_BODY, color: C.inkSoft }}>取消</button>
      </div>
    );
  }
  return (
    <button type="button" onClick={() => { setState('editing'); if (!title && defaultTitle) setTitle(defaultTitle); }} disabled={state === 'saving'} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
      background: state === 'saved' ? C.sage : C.surface, color: state === 'saved' ? C.surface : C.pine, border: `1.5px solid ${state === 'saved' ? C.sage : C.pine}`, cursor: 'pointer',
      fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600,
    }}>
      {state === 'saving' ? <Loader2 size={15} className="spin" /> : state === 'saved' ? <Check size={15} /> : <Save size={15} />}
      {state === 'saving' ? '儲存中…' : state === 'saved' ? '已加入收藏' : '儲存此組合'}
    </button>
  );
}

/* ============================== SHARED RESULT VIEWS ============================== */
function ClassBlock({ label, items, color, editable, onReorder, onSwapAt, springBrand, conditions }) {
  if (!items || items.length === 0) return null;
  const move = (from, to) => {
    if (to < 0 || to >= items.length || from === to) return;
    const arr = [...items];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    onReorder(arr);
  };
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: 99, background: color }} />
        <span style={{ fontFamily: FONT_MONO, fontSize: 12.5, fontWeight: 700, color, letterSpacing: 0.5 }}>{label}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 10 }}>
        {items.map((e, i) => editable ? (
          <div key={e.id + '-' + i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <button onClick={() => move(i, i - 1)} disabled={i === 0} type="button" title="上移" style={{
                padding: '6px 9px', borderRadius: 6, border: `1px solid ${C.line}`, background: C.surface,
                color: i === 0 ? C.line : C.inkSoft, cursor: i === 0 ? 'not-allowed' : 'pointer', minHeight: 30,
              }}><ArrowUp size={13} /></button>
              <button onClick={() => move(i, i + 1)} disabled={i === items.length - 1} type="button" title="下移" style={{
                padding: '6px 9px', borderRadius: 6, border: `1px solid ${C.line}`, background: C.surface,
                color: i === items.length - 1 ? C.line : C.inkSoft, cursor: i === items.length - 1 ? 'not-allowed' : 'pointer', minHeight: 30,
              }}><ArrowDown size={13} /></button>
              <button onClick={() => onSwapAt(i)} type="button" title="換一個同類動作" style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 11px', borderRadius: 6,
                border: `1px solid ${C.brass}`, background: 'transparent', color: C.brassDeep, cursor: 'pointer',
                fontSize: 11.5, fontFamily: FONT_BODY, marginLeft: 'auto', minHeight: 30,
              }}><Shuffle size={12} /> 換一個</button>
            </div>
            <ExerciseCard e={e} springBrand={springBrand} conditions={conditions} />
          </div>
        ) : <ExerciseCard key={e.id + '-' + i} e={e} springBrand={springBrand} conditions={conditions} />)}
      </div>
    </div>
  );
}

function ReleaseGrid({ items, title }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginTop: 8, paddingTop: 16, borderTop: `1px dashed ${C.line}` }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.brown, marginBottom: 8, fontFamily: FONT_MONO }}>{title || '建議課前 / 課後放鬆（按摩球・泡沫軸・Spine Corrector）'}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 10 }}>
        {items.map(r => (
          <div key={r.id} style={{ background: C.brownSoft, borderRadius: 10, padding: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.brown, marginBottom: 4 }}>{r.area} <span style={{ fontFamily: FONT_MONO, fontSize: 11, opacity: 0.8 }}>· {r.tool}</span></div>
            <div style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.55 }}>{r.technique}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================== PDF EXPORT (print-based) ============================== */
function sectionsFromClassResult(result) {
  const s = [];
  if (result.warmup && result.warmup.length) s.push({ label: '熱身 Warm-up', items: result.warmup });
  if (result.main && result.main.length) s.push({ label: '主要訓練 Main Work', items: result.main });
  if (result.cool && result.cool.length) s.push({ label: '收操伸展 Cool-down', items: result.cool });
  return s;
}
function sectionsFromPhases(phases) {
  return phases.map(ph => ({ label: `${ph.name}（第${ph.startWeek}-${ph.endWeek}週）`, note: ph.goal, items: ph.exercises }));
}
function sectionsFromCircuit(result) {
  const s = [{ label: '熱身（全體一起）', items: result.warmup }];
  result.stations.forEach(st => s.push({ label: `站點：${EQUIP_LABEL[st.equipment]}`, items: st.exercises }));
  s.push({ label: '收操（全體一起）', items: result.cooldown });
  return s;
}

function PrintableDocument({ doc }) {
  if (!doc) return null;
  return (
    <div style={{ fontFamily: FONT_BODY, color: '#161512', padding: 30, fontSize: 12, background: '#fff' }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: 21, marginBottom: 3 }}>{doc.title}</div>
      {doc.subtitle && <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>{doc.subtitle}</div>}
      {doc.meta && <div style={{ fontSize: 11.5, color: '#555', marginBottom: 12, lineHeight: 1.55 }}>{doc.meta}</div>}

      {doc.cautions && doc.cautions.length > 0 && (
        <div style={{ marginBottom: 14, padding: 9, border: '1px solid #d9a9a2', background: '#fbefec' }}>
          {doc.cautions.map((c, i) => <div key={i} style={{ fontSize: 11, marginBottom: 2 }}><strong>⚠ {c.name}：</strong>{c.text}</div>)}
        </div>
      )}

      {doc.rationale && doc.rationale.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, borderBottom: '1.5px solid #333', paddingBottom: 3 }}>優先順序與邏輯</div>
          {doc.rationale.map((r, i) => <div key={i} style={{ fontSize: 11, marginBottom: 3 }}>{r.rank}. <strong>{r.name}</strong>（{r.tierLabel}）— {r.reason}</div>)}
        </div>
      )}

      {doc.sections.map((sec, i) => (
        <div key={i} style={{ marginBottom: 16, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, borderBottom: '1.5px solid #333', paddingBottom: 3, marginBottom: 6 }}>{sec.label}</div>
          {sec.note && <div style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>{sec.note}</div>}
          {sec.items.map((e, j) => (
            <div key={j} style={{ marginBottom: 9, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
              <div style={{ fontWeight: 700, fontSize: 12 }}>{j + 1}. {e.name} <span style={{ fontWeight: 400, color: '#666' }}>（{EQUIP_LABEL[e.equipment]}）</span>{e.springs && <span style={{ fontWeight: 400, color: '#96751f' }}> ・ 彈簧：{e.springs}</span>}</div>
              {splitSteps(e.instructions).map((s, k) => <div key={k} style={{ fontSize: 11, marginLeft: 14, color: '#222' }}>{s}</div>)}
              {e.benefits && <div style={{ fontSize: 10.5, marginLeft: 14, color: '#2f6b45', marginTop: 2 }}>好處：{e.benefits}</div>}
              {e.mistakes && <div style={{ fontSize: 10.5, marginLeft: 14, color: '#a5473c' }}>常見錯誤：{e.mistakes}</div>}
              {sec.reasons && sec.reasons[j] && <div style={{ fontSize: 10.5, marginLeft: 14, color: '#1F4E4A', marginTop: 2 }}>選擇原因：{sec.reasons[j]}</div>}
            </div>
          ))}
        </div>
      ))}

      {doc.releaseItems && doc.releaseItems.length > 0 && (
        <div style={{ marginBottom: 10, breakInside: 'avoid', pageBreakInside: 'avoid' }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, borderBottom: '1.5px solid #333', paddingBottom: 3, marginBottom: 6 }}>建議放鬆部位</div>
          {doc.releaseItems.map((r, i) => <div key={i} style={{ fontSize: 11, marginBottom: 3 }}>{r.area}（{r.tool}）：{r.technique}</div>)}
        </div>
      )}

      <div style={{ fontSize: 9.5, color: '#888', marginTop: 18, borderTop: '1px solid #ccc', paddingTop: 6 }}>
        {doc.footnote || '本課表由普拉提課程規劃工作台生成，僅供教學參考，並非醫療建議。'} ・ 生成日期：{new Date().toLocaleDateString('zh-HK')}
      </div>
    </div>
  );
}

function ClassResultView({ result: resultProp, headerLabel, extraNote, saveMeta, onSaved, onPrint, level, selectedProps, extraFlags, springBrand, conditions }) {
  const [result, setResult] = useState(resultProp);
  useEffect(() => { setResult(resultProp); }, [resultProp]);
  const levelMax = levelRank(level || '高');

  const swapAt = (section, index) => {
    const current = result[section][index];
    const allUsedIds = [...result.warmup, ...result.main, ...result.cool].map(x => x.id);
    const safe = EXERCISES.filter(x => isSafeFor(x, conditions));
    let candidates = safe.filter(x => x.equipment === current.equipment && x.id !== current.id && !allUsedIds.includes(x.id) && levelRank(x.level) <= levelMax && x.tags.some(t => current.tags.includes(t)));
    if (candidates.length === 0) candidates = safe.filter(x => x.equipment === current.equipment && x.id !== current.id && !allUsedIds.includes(x.id) && levelRank(x.level) <= levelMax);
    if (candidates.length === 0) return;
    const replacement = candidates[Math.floor(Math.random() * candidates.length)];
    const newSection = [...result[section]];
    newSection[index] = replacement;
    setResult({ ...result, [section]: newSection });
  };
  const reorderSection = (section, items) => setResult({ ...result, [section]: items });

  const checklist = equipmentChecklist(result, selectedProps, extraFlags);
  const transitionHints = buildTransitionHints(result.main);

  const springLine = (e) => {
    if (!e.springs) return '';
    const color = springBrand ? springColorForBrand(e.springs, springBrand) : null;
    return `　⚙${e.springs}${color ? ` → ${color}` : ''}`;
  };
  const exportText = () => {
    const lines = [];
    lines.push(headerLabel);
    if (extraNote) { lines.push(''); lines.push(extraNote); }
    if (conditions && conditions.length) { lines.push('', `已排除禁忌：${conditions.map(c => CONTRA_LABEL[c]).join('、')}`); }
    if (checklist.length) { lines.push('', `本節課需準備配件：${checklist.join('、')}`); }
    if (springBrand) { lines.push(`機器品牌：${SPRING_BRANDS_MAP[springBrand].name}`); }
    lines.push('');
    lines.push('熱身 Warm-up');
    result.warmup.forEach(e => lines.push(`- ${e.name}（${EQUIP_LABEL[e.equipment]}）：${e.instructions}${springLine(e)}`));
    lines.push('');
    lines.push('主要訓練 Main Work');
    result.main.forEach((e, i) => {
      lines.push(`- ${e.name}（${EQUIP_LABEL[e.equipment]}）：${e.instructions}${springLine(e)}`);
      const hint = transitionHints.find(h => h.afterIndex === i + 1);
      if (hint) lines.push(`  → ${hint.text}`);
    });
    lines.push('');
    lines.push('收操伸展 Cool-down');
    result.cool.forEach(e => lines.push(`- ${e.name}（${EQUIP_LABEL[e.equipment]}）：${e.instructions}${springLine(e)}`));
    if (result.releaseSuggestion && result.releaseSuggestion.length) {
      lines.push('');
      lines.push('建議課前/課後放鬆');
      result.releaseSuggestion.forEach(r => lines.push(`- ${r.area}（${r.tool}）：${r.technique}`));
    }
    return lines.join('\n');
  };
  const buildDoc = () => ({
    title: '普拉提課堂流程', subtitle: headerLabel,
    meta: [extraNote, checklist.length ? `本節課需準備配件：${checklist.join('、')}` : null].filter(Boolean).join('\n'),
    sections: sectionsFromClassResult(result), releaseItems: result.releaseSuggestion,
  });
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.brass, letterSpacing: 1, textTransform: 'uppercase' }}>{headerLabel}</div>
          {extraNote && <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 6, maxWidth: 560, lineHeight: 1.55 }}>{extraNote}</div>}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <CopyButton getText={exportText} />
          {onPrint && <ExportPdfButton buildDoc={buildDoc} onPrint={onPrint} />}
          {saveMeta && <SaveButton onSave={async (title) => {
            const r = await saveFlowItem({ type: 'class', title, meta: saveMeta, payload: { result, headerLabel, extraNote, conditions: conditions || [] } });
            if (r.ok && onSaved) onSaved();
            return r.ok;
          }} />}
        </div>
      </div>

      {checklist.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: C.brownSoft, borderRadius: 10, padding: 11, marginBottom: 16 }}>
          <ListChecks size={16} color={C.brown} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.5 }}><strong>本節課需準備配件清單：</strong>{checklist.join('、')}　<span style={{ color: C.inkFaint, fontSize: 11.5 }}>（建議課前5分鐘一次擺放完畢）</span></div>
        </div>
      )}

      {conditions && conditions.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: C.roseSoft, borderRadius: 10, padding: 11, marginBottom: 16 }}>
          <AlertTriangle size={16} color={C.rose} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.5 }}><strong>已按客人狀況排除禁忌動作：</strong>{conditions.map(c => CONTRA_LABEL[c]).join('、')}　<span style={{ color: C.inkFaint, fontSize: 11.5 }}>（手動調整順序或「換一個」時亦會避開）</span></div>
        </div>
      )}

      <ClassBlock label="熱身 Warm-up" items={result.warmup} color={C.sage} editable onReorder={items => reorderSection('warmup', items)} onSwapAt={i => swapAt('warmup', i)} springBrand={springBrand} conditions={conditions} />

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: C.pine }} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 12.5, fontWeight: 700, color: C.pine, letterSpacing: 0.5 }}>主要訓練 Main Work</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 10 }}>
          {result.main.map((e, i) => {
            const move = (from, to) => {
              if (to < 0 || to >= result.main.length || from === to) return;
              const arr = [...result.main]; const [m] = arr.splice(from, 1); arr.splice(to, 0, m);
              reorderSection('main', arr);
            };
            return (
              <div key={e.id + '-' + i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                  <button onClick={() => move(i, i - 1)} disabled={i === 0} type="button" title="上移" style={{ padding: '6px 9px', borderRadius: 6, border: `1px solid ${C.line}`, background: C.surface, color: i === 0 ? C.line : C.inkSoft, cursor: i === 0 ? 'not-allowed' : 'pointer', minHeight: 30 }}><ArrowUp size={13} /></button>
                  <button onClick={() => move(i, i + 1)} disabled={i === result.main.length - 1} type="button" title="下移" style={{ padding: '6px 9px', borderRadius: 6, border: `1px solid ${C.line}`, background: C.surface, color: i === result.main.length - 1 ? C.line : C.inkSoft, cursor: i === result.main.length - 1 ? 'not-allowed' : 'pointer', minHeight: 30 }}><ArrowDown size={13} /></button>
                  <button onClick={() => swapAt('main', i)} type="button" title="換一個同類動作" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 11px', borderRadius: 6, border: `1px solid ${C.brass}`, background: 'transparent', color: C.brassDeep, cursor: 'pointer', fontSize: 11.5, fontFamily: FONT_BODY, marginLeft: 'auto', minHeight: 30 }}><Shuffle size={12} /> 換一個</button>
                </div>
                <ExerciseCard e={e} springBrand={springBrand} conditions={conditions} />
                {transitionHints.find(h => h.afterIndex === i + 1) && (
                  <div style={{ fontSize: 11, color: C.slate, marginTop: 4, paddingLeft: 4 }}>↓ {transitionHints.find(h => h.afterIndex === i + 1).text}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <ClassBlock label="收操伸展 Cool-down" items={result.cool} color={C.rose} editable onReorder={items => reorderSection('cool', items)} onSwapAt={i => swapAt('cool', i)} springBrand={springBrand} conditions={conditions} />
      <ReleaseGrid items={result.releaseSuggestion} />
    </div>
  );
}

/* ============================== TABS — placeholders wired up next step ============================== */
function SpringChartToggle() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 14, marginBottom: 20, overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} type="button" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: 12, letterSpacing: 0.5, color: C.brass, textTransform: 'uppercase' }}>⚙ 彈簧色卡對照表（不同品牌彈簧顏色不通用）</span>
        {open ? <ChevronUp size={16} color={C.inkFaint} /> : <ChevronDown size={16} color={C.inkFaint} />}
      </button>
      {open && (
        <div style={{ padding: '0 16px 16px' }}>
          <p style={{ fontSize: 12, color: C.inkSoft, lineHeight: 1.6, marginBottom: 10 }}>
            動作庫內的「彈簧」建議統一使用「輕／中／重」的中性描述，因為同一顏色在不同品牌代表的阻力並不相同（例如紅色在Balanced Body是中等阻力，在Merrithew／STOTT卻是最重）。請對照下表換算成你所使用機器的實際顏色，並以原廠手冊為準。
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '6px 10px', color: C.inkFaint, fontFamily: FONT_MONO, fontWeight: 600 }}>品牌</th>
                  <th style={{ textAlign: 'left', padding: '6px 10px', color: C.inkFaint, fontFamily: FONT_MONO, fontWeight: 600 }}>輕</th>
                  <th style={{ textAlign: 'left', padding: '6px 10px', color: C.inkFaint, fontFamily: FONT_MONO, fontWeight: 600 }}>中</th>
                  <th style={{ textAlign: 'left', padding: '6px 10px', color: C.inkFaint, fontFamily: FONT_MONO, fontWeight: 600 }}>重</th>
                </tr>
              </thead>
              <tbody>
                {SPRING_BRANDS.map(b => (
                  <tr key={b.key} style={{ borderTop: `1px solid ${C.line}` }}>
                    <td style={{ padding: '8px 10px', fontWeight: 700, color: C.ink }}>{b.name}</td>
                    <td style={{ padding: '8px 10px', color: C.inkSoft }}>{b.light}</td>
                    <td style={{ padding: '8px 10px', color: C.inkSoft }}>{b.medium}</td>
                    <td style={{ padding: '8px 10px', color: C.inkSoft }}>{b.heavy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'grid', gap: 4, marginTop: 10 }}>
            {SPRING_BRANDS.map(b => <div key={b.key} style={{ fontSize: 11, color: C.inkFaint }}>· {b.name}：{b.note}</div>)}
          </div>
        </div>
      )}
    </div>
  );
}

function EquipmentLibrary() {
  const [equip, setEquip] = useState(EQUIPMENT.map(e => e.key));
  const [theme, setTheme] = useState('all');
  const [level, setLevel] = useState('all');
  const [conditions, setConditions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sysF, setSysF] = useState('all');
  const [q, setQ] = useState('');
  const list = useMemo(() => EXERCISES.filter(e =>
    onEquip(e, equip) &&
    (sysF === 'all' || e.sys.includes(sysF)) &&
    (!q || (e.name + (e.cue || '') + e.benefits).toLowerCase().includes(q.toLowerCase())) &&
    (theme === 'all' || e.tags.includes(theme)) &&
    (level === 'all' || e.level === level) &&
    isSafeFor(e, conditions)
  ), [equip, theme, level, conditions, sysF, q]);
  return (
    <div>
      <SectionTitle eyebrow="Exercise Library" title="器械動作庫" sub="按器械、訓練主題與程度篩選；點擊動作卡片可展開操作步驟、好處、常見錯誤與導師觀察提示；彈簧設備類動作亦附建議彈簧阻力。" />
      <SpringChartToggle />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        {EQUIPMENT.map(eq => (
          <Chip key={eq.key} active={equip.includes(eq.key)} color={C.pine}
            onClick={() => setEquip(equip.includes(eq.key) ? equip.filter(k => k !== eq.key) : [...equip, eq.key])}>
            {eq.name}
          </Chip>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        <Chip active={theme === 'all'} color={C.brass} onClick={() => setTheme('all')}>全部主題</Chip>
        {THEMES.map(t => <Chip key={t.key} active={theme === t.key} color={C.brass} onClick={() => setTheme(t.key)}>{t.label}</Chip>)}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        <Chip active={level === 'all'} color={C.rose} onClick={() => setLevel('all')}>全部程度</Chip>
        {['初', '中', '高'].map(l => <Chip key={l} active={level === l} color={C.rose} onClick={() => setLevel(l)}>{LEVEL_LABEL[l]}</Chip>)}
        <Chip active={showFilters || conditions.length > 0} color={C.rose} onClick={() => setShowFilters(!showFilters)}>排除客人禁忌{conditions.length ? `（${conditions.length}）` : ''}</Chip>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20, alignItems: 'center' }}>
        {[['all', '全部體系'], ['STOTT', 'STOTT'], ['Polestar', 'Polestar']].map(([k, l]) => <Chip key={k} active={sysF === k} color={C.slate} onClick={() => setSysF(k)}>{l}</Chip>)}
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="搜尋動作名稱（中／英）" className="pl-input" style={{ maxWidth: 260, marginLeft: 'auto' }} />
      </div>
      {showFilters && <div style={{ marginTop: -10, marginBottom: 20 }}><ConditionPicker value={conditions} onChange={setConditions} /></div>}
      <div style={{ fontSize: 12.5, color: C.inkFaint, marginBottom: 10, fontFamily: FONT_MONO }}>共 {list.length} 個動作</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 12 }}>
        {list.map(e => <ExerciseCard key={e.id} e={e} />)}
      </div>
      {list.length === 0 && <p style={{ color: C.inkFaint, fontSize: 14 }}>沒有符合篩選條件的動作，試試放寬篩選。</p>}
    </div>
  );
}

/* ============================== TAB 2: CLASS GENERATOR（單一主題／融合主題／課室品牌）============================== */
function ClassGenerator({ onSaved, onPrint }) {
  const [mode, setMode] = useState('preset');
  const [equip, setEquip] = useState(['reformer', 'mat']);
  const [themeA, setThemeA] = useState('full');
  const [themeB, setThemeB] = useState('booty');
  const [ratio, setRatio] = useState(0.7);
  const [presetKey, setPresetKey] = useState('allinone');
  const [duration, setDuration] = useState(60);
  const [level, setLevel] = useState('中');
  const [result, setResult] = useState(null);
  const [activePreset, setActivePreset] = useState(CLASS_TYPE_PRESETS[1]);
  const [regenCount, setRegenCount] = useState(0);
  const [selectedProps, setSelectedProps] = useState([]);
  const [springBrandKey, setSpringBrandKey] = useState(null);
  const [conditions, setConditions] = useState([]);
  const toggleProp = (key) => setSelectedProps(selectedProps.includes(key) ? selectedProps.filter(k => k !== key) : [...selectedProps, key]);

  const getThemes = () => {
    if (mode === 'single') return [{ key: themeA, weight: 1 }];
    if (mode === 'fuse') return [{ key: themeA, weight: ratio }, { key: themeB, weight: 1 - ratio }];
    const p = CLASS_TYPE_PRESETS.find(x => x.key === presetKey);
    return p ? p.themes : [{ key: 'full', weight: 1 }];
  };

  const applyPreset = (p) => {
    setPresetKey(p.key); setActivePreset(p);
    setEquip(p.equipment); setLevel(p.level); setDuration(p.duration);
  };

  const handleGenerate = () => {
    if (equip.length === 0) return;
    const themes = getThemes();
    const prevIds = result ? [...result.warmup, ...result.main, ...result.cool].map(e => e.id) : [];
    setResult(generateClass({ equipmentSel: equip, themes, duration, level, avoidIds: prevIds, conditions }));
    setRegenCount(c => c + 1);
  };

  const themes = getThemes();
  const headerLabel = mode === 'preset'
    ? `${activePreset.brand} · ${activePreset.label} · ${duration}分鐘 · ${LEVEL_LABEL[level]}`
    : `${themesLabel(themes)} · ${duration}分鐘 · ${LEVEL_LABEL[level]}`;
  const extraNote = mode === 'preset' ? activePreset.desc + (activePreset.jumpboard ? '（如場地有彈跳板可自行加入間歇跳躍）' : '') : null;

  return (
    <div>
      <SectionTitle eyebrow="Class Generator" title="主題課堂生成" sub="可套用工作室既有的品牌課型，或自訂融合（Fuse）兩個主題的比例，自動編排完整課堂流程。" />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <Chip active={mode === 'preset'} color={C.brassDeep} onClick={() => setMode('preset')}>課室品牌課型</Chip>
        <Chip active={mode === 'single'} color={C.brassDeep} onClick={() => setMode('single')}>單一主題</Chip>
        <Chip active={mode === 'fuse'} color={C.brassDeep} onClick={() => setMode('fuse')}>融合 Fuse 兩個主題</Chip>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18, marginBottom: 20 }}>
        {mode === 'preset' && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.pine, marginBottom: 8, fontFamily: FONT_MONO, letterSpacing: 0.5 }}>選擇課型（參考工作室八月課表）</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 8 }}>
              {CLASS_TYPE_PRESETS.map(p => (
                <button key={p.key} type="button" onClick={() => applyPreset(p)} style={{
                  textAlign: 'left', padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                  border: `1.5px solid ${presetKey === p.key ? C.pine : C.line}`, background: presetKey === p.key ? C.pine : C.surface,
                  color: presetKey === p.key ? C.surface : C.ink,
                }}>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1, opacity: 0.85 }}>{p.brand}</div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 14 }}>{p.label}</div>
                </button>
              ))}
            </div>
            <p style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.55, marginTop: 10 }}>{activePreset.desc}</p>
          </div>
        )}

        {mode === 'single' && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.pine, marginBottom: 8, fontFamily: FONT_MONO, letterSpacing: 0.5 }}>今日主題</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {THEMES.map(t => <Chip key={t.key} active={themeA === t.key} color={C.brass} onClick={() => setThemeA(t.key)}>{t.label}</Chip>)}
            </div>
          </div>
        )}

        {mode === 'fuse' && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.pine, marginBottom: 8, fontFamily: FONT_MONO, letterSpacing: 0.5 }}>主題 A</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {THEMES.map(t => <Chip key={t.key} active={themeA === t.key} color={C.brass} onClick={() => setThemeA(t.key)}>{t.label}</Chip>)}
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.pine, marginBottom: 8, fontFamily: FONT_MONO, letterSpacing: 0.5 }}>主題 B</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {THEMES.map(t => <Chip key={t.key} active={themeB === t.key} color={C.rose} onClick={() => setThemeB(t.key)}>{t.label}</Chip>)}
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.pine, marginBottom: 8, fontFamily: FONT_MONO, letterSpacing: 0.5 }}>比例 A : B</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[0.7, 0.6, 0.5].map(r => <Chip key={r} active={ratio === r} color={C.slate} onClick={() => setRatio(r)}>{Math.round(r * 100)}% : {Math.round((1 - r) * 100)}%</Chip>)}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.pine, marginBottom: 8, fontFamily: FONT_MONO, letterSpacing: 0.5 }}>可用器械</div>
          <MultiEquipPicker value={equip} onChange={setEquip} options={CLASS_GEN_EQUIPMENT} />
          <div style={{ fontSize: 11.5, color: C.inkFaint, marginTop: 6 }}>課室品牌課型預設為純Reformer，只有Tower Mix課型會加入Half Cadillac；如想加入Mat可於上方自行勾選。需要梯桶、平衡椅或脊柱矯正器的課堂請到「特色課堂」安排。</div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.pine, marginBottom: 8, fontFamily: FONT_MONO, letterSpacing: 0.5 }}>學員特殊狀況／禁忌（選填）</div>
          <ConditionPicker value={conditions} onChange={setConditions} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.pine, marginBottom: 8, fontFamily: FONT_MONO, letterSpacing: 0.5 }}>輔助小道具（選填）</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {PROPS.map(p => <Chip key={p.key} active={selectedProps.includes(p.key)} color={C.brown} onClick={() => toggleProp(p.key)}>{p.name}</Chip>)}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.pine, marginBottom: 8, fontFamily: FONT_MONO, letterSpacing: 0.5 }}>工作室機器品牌（選填，套用彈簧顏色）</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <Chip active={!springBrandKey} color={C.slate} onClick={() => setSpringBrandKey(null)}>通用（不指定）</Chip>
            {SPRING_BRANDS.map(b => <Chip key={b.key} active={springBrandKey === b.key} color={C.slate} onClick={() => setSpringBrandKey(b.key)}>{b.name}</Chip>)}
          </div>
          {springBrandKey && (
            <div style={{ fontSize: 11.5, color: C.inkFaint, marginTop: 6, lineHeight: 1.5 }}>
              已套用 {SPRING_BRANDS_MAP[springBrandKey].name}：輕={SPRING_BRANDS_MAP[springBrandKey].light}　中={SPRING_BRANDS_MAP[springBrandKey].medium}　重={SPRING_BRANDS_MAP[springBrandKey].heavy}。{SPRING_BRANDS_MAP[springBrandKey].note}
            </div>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.pine, marginBottom: 8, fontFamily: FONT_MONO, letterSpacing: 0.5 }}>課堂時長</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {DURATIONS.map(d => <Chip key={d.v} active={duration === d.v} color={C.slate} onClick={() => setDuration(d.v)}>{d.label}</Chip>)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.pine, marginBottom: 8, fontFamily: FONT_MONO, letterSpacing: 0.5 }}>學員程度</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['初', '中', '高'].map(l => <Chip key={l} active={level === l} color={C.rose} onClick={() => setLevel(l)}>{LEVEL_LABEL[l]}</Chip>)}
            </div>
          </div>
        </div>
        <button onClick={handleGenerate} disabled={equip.length === 0} style={{
          marginTop: 18, padding: '11px 22px', borderRadius: 9, border: 'none', cursor: equip.length ? 'pointer' : 'not-allowed',
          background: equip.length ? C.pine : C.inkFaint, color: C.surface, fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 14.5,
        }}>{result ? '再生成一套' : '生成課堂'}</button>
        {equip.length === 0 && <div style={{ color: C.rose, fontSize: 12.5, marginTop: 8 }}>請至少選擇一種器械。</div>}
        {result && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 12, color: C.inkFaint }}>
            <Sparkles size={13} color={C.brass} />
            {regenCount > 1
              ? `已生成第 ${regenCount} 套不同組合，適合一天內連續教授兩堂同主題課程的情況。`
              : '一天內需要教授多於一堂同主題課程？可以再按一次，系統會盡量避開剛才那一套動作，避免內容重複。'}
          </div>
        )}
      </div>

      {selectedProps.length > 0 && (
        <div style={{ background: C.brownSoft, borderRadius: 12, padding: 14, marginBottom: 16 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: C.brown, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>已選小道具使用建議</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {selectedProps.map(key => {
              const p = PROPS.find(x => x.key === key);
              const matches = p && themes.some(t => p.themes.includes(t.key));
              return p ? (
                <div key={key} style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.55 }}>
                  <strong>{p.name}</strong>{matches && <span style={{ color: C.sage, fontSize: 11 }}>　✓ 與今日主題搭配</span>}：{p.tip}
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {result && <ClassResultView result={result} headerLabel={headerLabel} extraNote={extraNote}
        saveMeta={{ duration, level, equip, mode, conditions }} onSaved={onSaved} onPrint={onPrint}
        level={level} selectedProps={selectedProps} extraFlags={{ jumpboard: mode === 'preset' && !!activePreset.jumpboard }} springBrand={springBrandKey} conditions={conditions} />}
    </div>
  );
}

/* ============================== TAB 3: SPECIALTY PROGRAMS（Circuit Class + Chair Group Class）============================== */
function CircuitProgram({ onSaved, onPrint }) {
  const [themeKey, setThemeKey] = useState('full');
  const [duration, setDuration] = useState(60);
  const [level, setLevel] = useState('中');
  const [students, setStudents] = useState(5);
  const [result, setResult] = useState(null);

  const handleGenerate = () => setResult(generateCircuit({ themeKey, duration, level, students }));

  const exportText = () => {
    if (!result) return '';
    const lines = [`Circuit Class 分站課 · ${THEME_LABEL[themeKey]} · ${duration}分鐘 · ${students}人 · ${LEVEL_LABEL[level]}`, ''];
    lines.push('熱身（全體一起，Mat）');
    result.warmup.forEach(e => lines.push(`- ${e.name}：${e.instructions}`));
    lines.push('');
    lines.push(`各站練習（每站約${result.stationTime}分鐘）`);
    result.stations.forEach(s => { lines.push(`【${EQUIP_LABEL[s.equipment]}】`); s.exercises.forEach(e => lines.push(`- ${e.name}：${e.instructions}`)); });
    lines.push('');
    lines.push('輪換表（每輪各組所在站）');
    result.rotation.forEach((row, i) => lines.push(`第${i + 1}輪：${row.map((st, g) => `組${String.fromCharCode(65 + g)}→${EQUIP_LABEL[st]}`).join('　')}`));
    lines.push('');
    lines.push('收操（全體一起，Mat）');
    result.cooldown.forEach(e => lines.push(`- ${e.name}：${e.instructions}`));
    return lines.join('\n');
  };

  return (
    <div>
      <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.pine, marginBottom: 8, fontFamily: FONT_MONO, letterSpacing: 0.5 }}>主題</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {THEMES.map(t => <Chip key={t.key} active={themeKey === t.key} color={C.brass} onClick={() => setThemeKey(t.key)}>{t.label}</Chip>)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.pine, marginBottom: 8, fontFamily: FONT_MONO, letterSpacing: 0.5 }}>學員人數</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[4, 5, 6].map(n => <Chip key={n} active={students === n} color={C.slate} onClick={() => setStudents(n)}>{n}人</Chip>)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.pine, marginBottom: 8, fontFamily: FONT_MONO, letterSpacing: 0.5 }}>課堂時長</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[45, 60].map(d => <Chip key={d} active={duration === d} color={C.slate} onClick={() => setDuration(d)}>{d}分鐘</Chip>)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.pine, marginBottom: 8, fontFamily: FONT_MONO, letterSpacing: 0.5 }}>程度</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['初', '中', '高'].map(l => <Chip key={l} active={level === l} color={C.rose} onClick={() => setLevel(l)}>{LEVEL_LABEL[l]}</Chip>)}
            </div>
          </div>
        </div>
        <p style={{ fontSize: 12, color: C.inkFaint, marginBottom: 12 }}>固定4個站：Reformer → Half Cadillac → Ladder Barrel → Chair，{students}人平均分成4組，每輪換一站。</p>
        <button onClick={handleGenerate} style={{
          padding: '11px 22px', borderRadius: 9, border: 'none', cursor: 'pointer',
          background: C.pine, color: C.surface, fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 14.5,
        }}>生成 Circuit 分站課</button>
      </div>

      {result && (
        <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.brass, letterSpacing: 1, textTransform: 'uppercase' }}>Circuit Class · {THEME_LABEL[themeKey]} · {students}人 · {duration}分鐘</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <CopyButton getText={exportText} />
              {onPrint && <ExportPdfButton buildDoc={() => ({
                title: 'Circuit Class 分站課', subtitle: `${THEME_LABEL[themeKey]} · ${students}人 · ${duration}分鐘`,
                meta: `輪換表：每站約${result.stationTime}分鐘，共4站（Reformer → Half Cadillac → Ladder Barrel → Chair）`,
                sections: sectionsFromCircuit(result),
              })} onPrint={onPrint} />}
              <SaveButton onSave={async (title) => {
                const r = await saveFlowItem({ type: 'circuit', title, meta: { themeKey, duration, level, students }, payload: { result, themeKey, duration, level, students } });
                if (r.ok && onSaved) onSaved(); return r.ok;
              }} />
            </div>
          </div>

          <ClassBlock label="熱身（全體一起）" items={result.warmup} color={C.sage} />

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 12.5, fontWeight: 700, color: C.pine, letterSpacing: 0.5, marginBottom: 8 }}>輪換表　每站約{result.stationTime}分鐘</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12.5 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '6px 10px', color: C.inkFaint, fontFamily: FONT_MONO, fontWeight: 600 }}>輪次</th>
                    {result.groupSizes.map((sz, g) => <th key={g} style={{ textAlign: 'left', padding: '6px 10px', color: C.inkFaint, fontFamily: FONT_MONO, fontWeight: 600 }}>組{String.fromCharCode(65 + g)}（{sz}人）</th>)}
                  </tr>
                </thead>
                <tbody>
                  {result.rotation.map((row, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${C.line}` }}>
                      <td style={{ padding: '8px 10px', fontFamily: FONT_MONO, color: C.inkSoft }}>第{i + 1}輪</td>
                      {row.map((st, g) => <td key={g} style={{ padding: '8px 10px' }}><Badge color={C.pineSoft}>{EQUIP_LABEL[st]}</Badge></td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {result.stations.map(s => (
            <ClassBlock key={s.equipment} label={`【站】${EQUIP_LABEL[s.equipment]}`} items={s.exercises} color={C.brass} />
          ))}
          <ClassBlock label="收操（全體一起）" items={result.cooldown} color={C.rose} />
        </div>
      )}
    </div>
  );
}

function ChairGroupProgram({ onSaved, onPrint }) {
  const [themeKey, setThemeKey] = useState('full');
  const [duration, setDuration] = useState(60);
  const [level, setLevel] = useState('中');
  const [size, setSize] = useState(6);
  const [result, setResult] = useState(null);

  const handleGenerate = () => {
    setResult(generateClass({ equipmentSel: ['mat', 'chair'], themes: [{ key: themeKey, weight: 1 }], duration, level }));
  };
  const note = result ? chairSafetyNote(size, level) : null;

  return (
    <div>
      <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.pine, marginBottom: 8, fontFamily: FONT_MONO, letterSpacing: 0.5 }}>主題</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {THEMES.map(t => <Chip key={t.key} active={themeKey === t.key} color={C.brass} onClick={() => setThemeKey(t.key)}>{t.label}</Chip>)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.pine, marginBottom: 8, fontFamily: FONT_MONO, letterSpacing: 0.5 }}>班級人數</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[4, 6, 8, 10, 12].map(n => <Chip key={n} active={size === n} color={C.slate} onClick={() => setSize(n)}>{n}人</Chip>)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.pine, marginBottom: 8, fontFamily: FONT_MONO, letterSpacing: 0.5 }}>課堂時長</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {DURATIONS.map(d => <Chip key={d.v} active={duration === d.v} color={C.slate} onClick={() => setDuration(d.v)}>{d.label}</Chip>)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.pine, marginBottom: 8, fontFamily: FONT_MONO, letterSpacing: 0.5 }}>程度</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['初', '中', '高'].map(l => <Chip key={l} active={level === l} color={C.rose} onClick={() => setLevel(l)}>{LEVEL_LABEL[l]}</Chip>)}
            </div>
          </div>
        </div>
        <button onClick={handleGenerate} style={{
          padding: '11px 22px', borderRadius: 9, border: 'none', cursor: 'pointer',
          background: C.pine, color: C.surface, fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 14.5,
        }}>生成 Chair 團課</button>
      </div>
      {result && <ClassResultView result={result} headerLabel={`Chair 平衡椅團課 · ${THEME_LABEL[themeKey]} · ${size}人 · ${duration}分鐘`}
        extraNote={note} saveMeta={{ themeKey, duration, level, size }} onSaved={onSaved} onPrint={onPrint} level={level} />}
    </div>
  );
}

function SpecialtyPrograms({ onSaved, onPrint }) {
  const [sub, setSub] = useState('circuit');
  return (
    <div>
      <SectionTitle eyebrow="Specialty Programs" title="特色課堂" sub="Circuit分站課適合Reformer、Half Cadillac、Ladder Barrel、Chair輪流練習；Chair團課專為平衡椅小組課設計，附帶班級人數安全提示。" />

      <div style={{ background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginBottom: 20 }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: C.brass, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>團體課教學要點參考</div>
        <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.6 }}>
          官方教材建議團體課班級規模以6人為上限，確保每位學員都能獲得足夠的個別糾正與關注；人數越多，糾正機會越少，學員也較容易因缺乏關注而失去信心。輪流換站的分站課模式（即Circuit分站課）較適合喜歡獨立練習、能自行完成一系列練習的學員，教師的角色是巡場糾正動作、解答問題並提醒訓練時間。收操時可以用一套簡單一致的動作作結尾提示，例如脊椎緩緩捲起至站姿、提踵尋找平衡，讓學員清楚知道課堂已經結束。
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <Chip active={sub === 'circuit'} color={C.pine} onClick={() => setSub('circuit')}>Circuit 分站課</Chip>
        <Chip active={sub === 'chair'} color={C.pine} onClick={() => setSub('chair')}>Chair 平衡椅團課</Chip>
      </div>
      {sub === 'circuit' ? <CircuitProgram onSaved={onSaved} onPrint={onPrint} /> : <ChairGroupProgram onSaved={onSaved} onPrint={onPrint} />}
    </div>
  );
}

/* ============================== TAB 4: PROGRAM BUILDER ============================== */
function IssuePickerGrouped({ selected, onToggle }) {
  return (
    <div>
      {ISSUE_GROUPS.map(g => (
        <div key={g} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: C.inkFaint, marginBottom: 6, fontFamily: FONT_MONO, letterSpacing: 0.5 }}>{GROUP_LABEL[g]}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ISSUES.filter(i => i.group === g).map(i => (
              <Chip key={i.id} active={selected.includes(i.id)} color={i.caution ? C.rose : C.pine} onClick={() => onToggle(i.id)}>{i.name}</Chip>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function RationaleCard({ multi }) {
  return (
    <div style={{ background: C.surface2, borderRadius: 12, padding: 16, marginBottom: 18 }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: 12, letterSpacing: 1, color: C.brass, textTransform: 'uppercase', marginBottom: 10 }}>優先順序與邏輯</div>
      <div style={{ display: 'grid', gap: 8, marginBottom: multi.clusterNotes.length || multi.framework.length ? 12 : 0 }}>
        {multi.rationale.map(r => (
          <div key={r.rank} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{
              flexShrink: 0, width: 22, height: 22, borderRadius: 99, background: C.pine, color: C.surface,
              fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
            }}>{r.rank}</span>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{r.name} <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.inkFaint, fontWeight: 500 }}>· {r.tierLabel}</span></div>
              <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.55 }}>{r.reason}</div>
            </div>
          </div>
        ))}
      </div>
      {multi.clusterNotes.length > 0 && (
        <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.6, marginBottom: 8 }}>
          {multi.clusterNotes.map((c, i) => <div key={i}>🔗 {c.children.join('、')}已合併歸入「{c.parentName}」一併處理，避免重複編排。</div>)}
        </div>
      )}
      {multi.framework.length > 0 && (
        <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.6 }}>
          {multi.framework.map(f => <div key={f.id}>💡 {f.name}：{f.trainingNote}</div>)}
        </div>
      )}
    </div>
  );
}

function HEPCard({ hep, onPrint }) {
  const exportText = () => {
    const lines = [`回家自主練習小卡${hep.clientName ? ' · ' + hep.clientName : ''}`, '每天10分鐘，動作宜緩慢、配合呼吸，如有不適請立即停止。', ''];
    hep.exercises.forEach((e, i) => lines.push(`${i + 1}. ${e.name}：${e.instructions}`));
    if (hep.release.length) {
      lines.push('', '放鬆建議：');
      hep.release.forEach(r => lines.push(`- ${r.area}（${r.tool}）：${r.technique}`));
    }
    return lines.join('\n');
  };
  return (
    <div style={{ background: C.sageSoft, borderRadius: 14, padding: 18, marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: C.sage, textTransform: 'uppercase', letterSpacing: 0.5 }}>回家自主練習小卡</div>
          <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 4 }}>每天約10分鐘，動作宜緩慢配合呼吸，適合WhatsApp直接發送給客人。</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <CopyButton getText={exportText} />
          {onPrint && <ExportPdfButton buildDoc={() => ({
            title: '回家自主練習小卡', subtitle: hep.clientName || undefined,
            meta: '每天約10分鐘，動作宜緩慢並配合呼吸；如有不適請立即停止並聯絡導師。',
            sections: [{ label: '練習動作', items: hep.exercises }], releaseItems: hep.release,
            footnote: '本小卡由普拉提課程規劃工作台生成，僅供一般自主練習參考，並非醫療建議。',
          })} onPrint={onPrint} />}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 10 }}>
        {hep.exercises.map((e, i) => <ExerciseCard key={e.id + i} e={e} />)}
      </div>
      <ReleaseGrid items={hep.release} title="建議配合放鬆" />
    </div>
  );
}

/* ============================== TAB 5: POSTURE / PAIN REFERENCE ============================== */
function IssueCard({ issue }) {
  const [open, setOpen] = useState(false);
  const releaseItems = issue.releaseIds.map(id => RELEASE_MAP[id]).filter(Boolean);
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 18px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 15.5, color: C.pine }}>{issue.name}</span>
          {issue.caution && <AlertTriangle size={15} color={C.rose} />}
        </div>
        {open ? <ChevronUp size={18} color={C.inkFaint} /> : <ChevronDown size={18} color={C.inkFaint} />}
      </button>
      {open && (
        <div style={{ padding: '0 18px 18px' }}>
          <div style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.inkFaint, fontFamily: FONT_MONO, letterSpacing: 0.5 }}>成因 CAUSE</div>
              <p style={{ fontSize: 13.5, color: C.inkSoft, lineHeight: 1.6, margin: '3px 0 0' }}>{issue.cause}</p>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.rose, fontFamily: FONT_MONO, letterSpacing: 0.5 }}>症狀 SYMPTOM</div>
              <p style={{ fontSize: 13.5, color: C.inkSoft, lineHeight: 1.6, margin: '3px 0 0' }}>{issue.symptoms}</p>
            </div>
            <div style={{ background: C.slateSoft, borderRadius: 9, padding: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.slate, fontFamily: FONT_MONO, letterSpacing: 0.5 }}>如何確診 HOW TO CONFIRM</div>
              <p style={{ fontSize: 13, color: C.ink, lineHeight: 1.6, margin: '3px 0 0' }}>{issue.howToConfirm}</p>
            </div>
          </div>

          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.brown, margin: '12px 0 6px', fontFamily: FONT_MONO, letterSpacing: 0.3 }}>STEP 1 · 先放鬆</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 8, marginBottom: 12 }}>
            {releaseItems.map(r => (
              <div key={r.id} style={{ background: C.brownSoft, borderRadius: 9, padding: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 12.5, color: C.brown }}>{r.area} · {r.tool}</div>
                <div style={{ fontSize: 12, color: C.ink, lineHeight: 1.5, marginTop: 2 }}>{r.technique}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.pine, margin: '12px 0 6px', fontFamily: FONT_MONO, letterSpacing: 0.3 }}>STEP 2 · 精準訓練</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            {issue.tags.map(t => <Badge key={t} color={TAG_COLOR[t]} soft={TAG_COLOR[t] + '22'}>{TAG_LABEL[t]}</Badge>)}
          </div>
          <p style={{ fontSize: 13.5, color: C.inkSoft, lineHeight: 1.6 }}>{issue.trainingNote}</p>

          {issue.caution && (
            <div style={{ display: 'flex', gap: 8, background: C.roseSoft, borderRadius: 9, padding: 11, marginTop: 10 }}>
              <AlertTriangle size={16} color={C.rose} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.55 }}>{issue.caution}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PrincipleCard({ p }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: C.surface2, borderRadius: 10, overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 13.5, color: C.pine }}>{p.name}</span>
        {open ? <ChevronUp size={15} color={C.inkFaint} /> : <ChevronDown size={15} color={C.inkFaint} />}
      </button>
      {open && (
        <div style={{ padding: '0 14px 12px' }}>
          {p.points.map((pt, i) => <div key={i} style={{ fontSize: 12, color: C.inkSoft, lineHeight: 1.55, marginBottom: 4 }}>· {pt}</div>)}
        </div>
      )}
    </div>
  );
}

function PostureLibrary() {
  return (
    <div>
      <SectionTitle eyebrow="Posture & Pain Reference" title="體態痛症知識庫" sub="每個問題均以「先放鬆、後訓練」的邏輯編排，方便向客人解釋成因與對策。" />

      <div style={{ background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18, marginBottom: 16 }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 12, letterSpacing: 1, color: C.brass, textTransform: 'uppercase', marginBottom: 10 }}>放鬆器材速查</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: C.ink, marginBottom: 4 }}>按摩球 Massage Ball</div>
            <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.55 }}>接觸面小，適合針對深層、局部緊繃點（如肩頸、臀部、足底），以身體重量緩慢下壓並停留呼吸，避免快速滾動。</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: C.ink, marginBottom: 4 }}>泡沫軸 Foam Roller</div>
            <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.55 }}>接觸面大，適合大肌群（大腿、背部兩側），以緩慢滾動方式全面降低肌肉張力，避免直接滾壓關節或脊椎正中。</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: C.ink, marginBottom: 4 }}>Spine Corrector / 弧形桶</div>
            <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.55 }}>弧形支撐脊椎自然曲線，適合被動式伸展及呼吸練習，也是一套完整的訓練器械，詳見「器械動作庫」。</div>
          </div>
        </div>
      </div>

      <div style={{ background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18, marginBottom: 16 }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 12, letterSpacing: 1, color: C.brass, textTransform: 'uppercase', marginBottom: 10 }}>斯多特普拉提 · 五大基本原則</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 8 }}>
          {FIVE_PRINCIPLES.map(p => <PrincipleCard key={p.key} p={p} />)}
        </div>
      </div>

      <div style={{ background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18, marginBottom: 22 }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 12, letterSpacing: 1, color: C.brass, textTransform: 'uppercase', marginBottom: 10 }}>北極星普拉提 · 六大運動原則 Polestar Principles</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 8 }}>
          {POLESTAR_PRINCIPLES.map(p => <PrincipleCard key={p.key} p={p} />)}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 28 }}>
        {ISSUE_GROUPS.map(g => (
          <div key={g}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 16, color: C.brassDeep, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 20, height: 3, background: C.brass, borderRadius: 2, display: 'inline-block' }} />
              {GROUP_LABEL[g]}
              <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.inkFaint, fontWeight: 500 }}>（{ISSUES.filter(i => i.group === g).length}）</span>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {ISSUES.filter(i => i.group === g).map(issue => <IssueCard key={issue.id} issue={issue} />)}
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 12, color: C.inkFaint, marginTop: 20, lineHeight: 1.6 }}>
        以上內容為普拉提教學參考架構，並非醫療診斷。若客人有持續、劇烈或伴隨麻痺/放射性的痛症，請建議先諮詢醫生或物理治療師評估。
      </p>
    </div>
  );
}

/* ============================== TAB 6: SAVED FLOWS ============================== */
function SavedResultRenderer({ item, payload }) {
  if (!payload) return <p style={{ fontSize: 13, color: C.inkFaint }}>載入中…</p>;
  if (item.type === 'class') return <ClassResultView result={payload.result} headerLabel={payload.headerLabel} extraNote={payload.extraNote} conditions={payload.conditions} />;
  if (item.type === 'program' && payload.root) return <RootProgramView result={payload.result} weeks={payload.weeks} sessions={payload.sessions} title={payload.title || item.title} />;
  if (item.type === 'program') {
    const phaseColors = [C.pine, C.brass, C.rose];
    if (payload.multi) {
      return (
        <div>
          {payload.assessment && (
            <div style={{ background: C.surface2, borderRadius: 10, padding: 12, marginBottom: 14 }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: C.brass, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                隨附體態評估結果{payload.assessment.clientName ? `　·　${payload.assessment.clientName}` : ''}
              </div>
              <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: payload.assessment.notes ? 4 : 8 }}>
                已完成 {payload.assessment.assessmentResult.answeredCount}/{payload.assessment.assessmentResult.totalCount} 項測試
              </div>
              {payload.assessment.notes && <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 8 }}>備註：{payload.assessment.notes}</div>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {payload.assessment.assessmentResult.detected.map(d => (
                  <Badge key={d.id} color={C.brownSoft ? C.brown : C.inkFaint} soft={C.brownSoft}>{d.issue.name}（{d.count}）</Badge>
                ))}
              </div>
            </div>
          )}
          {payload.result.cautions.length > 0 && (
            <div style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
              {payload.result.cautions.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, background: C.roseSoft, borderRadius: 9, padding: 10 }}>
                  <AlertTriangle size={15} color={C.rose} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 12, color: C.ink, lineHeight: 1.5 }}><strong>{c.name}：</strong>{c.text}</span>
                </div>
              ))}
            </div>
          )}
          <RationaleCard multi={payload.result} />
          {payload.result.phases.map((ph, i) => (
            <div key={i} style={{ marginBottom: 14, paddingLeft: 14, borderLeft: `3px solid ${phaseColors[i % phaseColors.length]}` }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 14.5, color: phaseColors[i % phaseColors.length] }}>{ph.name}　<span style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: C.inkFaint }}>第{ph.startWeek}-{ph.endWeek}週</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 8, marginTop: 8 }}>
                {ph.exercises.map((e, j) => <ExerciseCard key={e.id + i + j} e={e} />)}
              </div>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div>
        <p style={{ fontSize: 13.5, color: C.inkSoft, lineHeight: 1.6 }}><strong style={{ color: C.ink }}>成因：</strong>{payload.result.issue.cause}</p>
        <p style={{ fontSize: 13.5, color: C.inkSoft, lineHeight: 1.6 }}><strong style={{ color: C.ink }}>訓練邏輯：</strong>{payload.result.issue.trainingNote}</p>
        {payload.result.phases.map((ph, i) => (
          <div key={i} style={{ marginBottom: 14, paddingLeft: 14, borderLeft: `3px solid ${phaseColors[i % phaseColors.length]}` }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 14.5, color: phaseColors[i % phaseColors.length] }}>{ph.name}　<span style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: C.inkFaint }}>第{ph.startWeek}-{ph.endWeek}週</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 8, marginTop: 8 }}>
              {ph.exercises.map((e, j) => <ExerciseCard key={e.id + i + j} e={e} />)}
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (item.type === 'circuit') {
    return (
      <div>
        <ClassBlock label="熱身" items={payload.result.warmup} color={C.sage} />
        {payload.result.stations.map(s => <ClassBlock key={s.equipment} label={`【站】${EQUIP_LABEL[s.equipment]}`} items={s.exercises} color={C.brass} />)}
        <ClassBlock label="收操" items={payload.result.cooldown} color={C.rose} />
      </div>
    );
  }
  if (item.type === 'assessment') {
    const { result, notes } = payload;
    return (
      <div>
        {notes && <p style={{ fontSize: 13, color: C.inkSoft, marginBottom: 10 }}><strong style={{ color: C.ink }}>備註：</strong>{notes}</p>}
        <div style={{ fontSize: 12, color: C.inkFaint, marginBottom: 10, fontFamily: FONT_MONO }}>已完成 {result.answeredCount}/{result.totalCount} 項測試</div>
        {result.detected.length === 0 ? (
          <div style={{ fontSize: 13, color: C.inkFaint }}>未偵測到明顯體態問題。</div>
        ) : (
          <div style={{ display: 'grid', gap: 6 }}>
            {result.detected.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.surface2, borderRadius: 9, padding: 9 }}>
                <Badge color={C.surface} soft={d.count >= 2 ? C.brassDeep : C.inkFaint}>{d.count}</Badge>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.ink }}>{d.issue.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  return null;
}

function SessionLogPanel({ item, payload, onPayloadUpdate }) {
  const [week, setWeek] = useState(1);
  const [pain, setPain] = useState(5);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const log = (payload && payload.sessionLog) || [];

  const handleAdd = async () => {
    setSaving(true);
    const entry = { date: new Date().toISOString(), week, pain, notes };
    const updated = await addSessionLogEntry(item.id, entry);
    if (updated && onPayloadUpdate) onPayloadUpdate(updated);
    setNotes('');
    setSaving(false);
  };

  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px dashed ${C.line}` }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: C.brass, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>課堂簽到與反饋紀錄</div>
      {log.length > 0 && (
        <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
          {log.map(entry => (
            <div key={entry.id} style={{ background: C.surface2, borderRadius: 9, padding: 10 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3, flexWrap: 'wrap' }}>
                <Badge color={C.pineSoft}>第{entry.week}週</Badge>
                <Badge color={C.surface} soft={entry.pain >= 7 ? C.rose : entry.pain >= 4 ? C.brassDeep : C.sage}>疼痛指數 {entry.pain}/10</Badge>
                <span style={{ fontFamily: FONT_MONO, fontSize: 10.5, color: C.inkFaint }}>{new Date(entry.date).toLocaleDateString('zh-HK')}</span>
              </div>
              {entry.notes && <div style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.5 }}>{entry.notes}</div>}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 8, marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 11, color: C.inkFaint, marginBottom: 4 }}>完成第幾週</div>
          <input type="number" min={1} max={12} value={week} onChange={e => setWeek(Number(e.target.value))} style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: `1.5px solid ${C.line}`, fontSize: 12.5, fontFamily: FONT_BODY }} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.inkFaint, marginBottom: 4 }}>疼痛指數 VAS（0-10）</div>
          <input type="number" min={0} max={10} value={pain} onChange={e => setPain(Number(e.target.value))} style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: `1.5px solid ${C.line}`, fontSize: 12.5, fontFamily: FONT_BODY }} />
        </div>
      </div>
      <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="今天的表現、代償情況或反饋，例如：右下背不適感從6分降至2分" style={{
        width: '100%', padding: '8px 10px', borderRadius: 7, border: `1.5px solid ${C.line}`, fontSize: 12.5, fontFamily: FONT_BODY, marginBottom: 8,
      }} />
      <button onClick={handleAdd} disabled={saving} type="button" style={{
        padding: '8px 14px', borderRadius: 8, border: 'none', background: C.pine, color: C.surface, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: FONT_BODY,
      }}>{saving ? '儲存中…' : '新增紀錄'}</button>
    </div>
  );
}

function SavedFlowRow({ item, onDeleted }) {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const toggle = async () => {
    if (!open && !payload) { setLoading(true); const p = await loadFlowPayload(item.id); setPayload(p); setLoading(false); }
    setOpen(!open);
  };
  const typeLabelMap = { class: '課堂組合', program: '私教計劃', circuit: 'Circuit 分站課', assessment: '體態評估' };
  const hasBundledAssessment = item.type === 'program' && item.meta && item.meta.clientName;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={toggle} type="button" style={{ background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', flex: 1, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Badge color={C.slate} soft={C.slateSoft}>{typeLabelMap[item.type] || item.type}</Badge>
          {hasBundledAssessment && <Badge color={C.brown} soft={C.brownSoft}>含評估結果</Badge>}
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15, color: C.ink }}>{item.title}</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.inkFaint }}>{new Date(item.savedAt).toLocaleDateString('zh-HK')}</span>
        </button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={toggle} type="button" style={{ padding: '6px 12px', borderRadius: 7, border: `1.5px solid ${C.line}`, background: 'transparent', cursor: 'pointer', fontSize: 12.5, color: C.pine, fontFamily: FONT_BODY }}>
            {loading ? '載入中…' : open ? '收合' : '查看'}
          </button>
          <button onClick={async () => { await deleteFlowItem(item.id); onDeleted(); }} type="button" style={{ padding: '6px 8px', borderRadius: 7, border: `1.5px solid ${C.roseSoft}`, background: 'transparent', cursor: 'pointer', color: C.rose }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {open && (
        <div style={{ padding: '0 18px 18px' }}>
          <SavedResultRenderer item={item} payload={payload} />
          {item.type === 'program' && payload && <SessionLogPanel item={item} payload={payload} onPayloadUpdate={setPayload} />}
        </div>
      )}
    </div>
  );
}

function SavedFlows({ savedIndex, loaded, onRefresh }) {
  return (
    <div>
      <SectionTitle eyebrow="Saved Flows" title="我的收藏" sub="所有儲存在此裝置的課堂組合與私教計劃，可以隨時查看、複製或刪除。" />
      {!loaded && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.inkFaint, fontSize: 13.5 }}><Loader2 size={16} className="spin" /> 載入收藏中…</div>
      )}
      {loaded && savedIndex.length === 0 && (
        <div style={{ background: C.surface2, borderRadius: 14, padding: 28, textAlign: 'center', color: C.inkFaint, fontSize: 13.5 }}>
          <Sparkles size={22} style={{ marginBottom: 8, opacity: 0.6 }} />
          <div>目前尚未儲存任何組合。在「主題課堂生成」、「特色課堂」或「私教課程規劃」生成內容後，可以按「儲存此組合」加入收藏。</div>
        </div>
      )}
      {loaded && savedIndex.length > 0 && (
        <div style={{ display: 'grid', gap: 10 }}>
          {savedIndex.map(item => <SavedFlowRow key={item.id} item={item} onDeleted={onRefresh} />)}
        </div>
      )}
    </div>
  );
}

/* ============================== TAB: 體態評估 POSTURE ASSESSMENT ============================== */
function TestRow({ test, value, onAnswer }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10, padding: 12 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 2 }}>{test.name}</div>
      <div style={{ fontSize: 11.5, color: C.inkFaint, marginBottom: 8, lineHeight: 1.5 }}>{test.criteria}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {test.options.map((opt, idx) => (
          <Chip key={idx} active={value === idx} color={idx === 0 ? C.sage : C.rose} onClick={() => onAnswer(test.id, idx)}>{opt.label}</Chip>
        ))}
      </div>
    </div>
  );
}


/* ============================== POLESTAR 體適能篩查（動態評估）============================== */
function screeningLevel(scores) {
  const vals = SCREENING_TESTS.map(t => scores[t.key]).filter(v => v !== undefined);
  if (vals.length === 0) return null;
  // Polestar 表格：總分 ÷ 15，取整數得出程度（1=初級 2=中級 3=進階）；未完成的測試不計入分母
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const n = Math.min(3, Math.max(1, Math.round(avg)));
  return { avg, level: ({ 1: '初', 2: '中', 3: '高' })[n], answered: vals.length };
}

/* ============================== 私教課程規劃（根因導向）============================== */
const SYSTEM_OPTS = [{ key: null, label: '綜合（不偏好）' }, { key: 'stott', label: 'STOTT 優先' }, { key: 'polestar', label: 'Polestar 優先' }];

function ReasonBox({ pick }) {
  const r = pick.reason;
  return (
    <div style={{ marginTop: 6, background: C.surface2, border: `1px solid ${C.lineSoft}`, borderRadius: 10, padding: '9px 11px', fontSize: 12, lineHeight: 1.6, color: C.ink }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: 10.5, letterSpacing: 0.5, color: C.surface, background: KIND_COLOR[FX[pick.fx].kind], borderRadius: 5, padding: '1px 6px' }}>{FX_KINDS[FX[pick.fx].kind]}</span>
        <strong style={{ color: C.pine }}>{r.goal}</strong>
        {r.source && <Badge color={C.brassDeep} soft={C.brassSoft}>{r.source}</Badge>}
      </div>
      <div><span style={{ color: C.inkFaint }}>為什麼：</span>{r.why}</div>
      <div><span style={{ color: C.inkFaint }}>選這個動作：</span>{r.pick}</div>
      {r.covers.length > 0 && <div style={{ color: C.sage }}>同時兼顧：{r.covers.join('、')}</div>}
    </div>
  );
}
const KIND_COLOR = { L: '#5F7F63', M: '#4A6687', S: '#B4673A', C: '#1F4E4A' };

function RootCauseCards({ roots }) {
  if (!roots || !roots.length) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 10, marginBottom: 18 }}>
      {roots.map(r => (
        <div key={r.id} style={{ background: C.surface2, border: `1px solid ${C.lineSoft}`, borderRadius: 12, padding: 13 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, color: C.ink, marginBottom: 6 }}>{r.name} <span style={{ fontFamily: FONT_MONO, fontSize: 10.5, color: C.inkFaint, fontWeight: 500 }}>· {r.sys}</span></div>
          {r.short && <div style={{ fontSize: 12, lineHeight: 1.55, marginBottom: 3 }}><span style={{ color: KIND_COLOR.L, fontWeight: 700 }}>縮短／緊張：</span>{r.short}</div>}
          {r.long && <div style={{ fontSize: 12, lineHeight: 1.55, marginBottom: 3 }}><span style={{ color: KIND_COLOR.S, fontWeight: 700 }}>拉長／無力：</span>{r.long}</div>}
          {r.mods && <div style={{ fontSize: 11.5, lineHeight: 1.55, color: C.inkSoft, marginTop: 5 }}>動作調整：{r.mods}</div>}
        </div>
      ))}
    </div>
  );
}

function programExportText(result, { title, weeks, sessions }) {
  const L = [title, `${weeks}週 · 每週${sessions}次`, ''];
  result.roots.forEach(r => { L.push(`【${r.name}】`); if (r.short) L.push(`縮短／緊張：${r.short}`); if (r.long) L.push(`拉長／無力：${r.long}`); if (r.mods) L.push(`動作調整：${r.mods}`); L.push(''); });
  if (result.cautions.length) { result.cautions.forEach(c => L.push(`⚠ ${c.name}：${c.text}`)); L.push(''); }
  if (result.conditions.length) L.push(`已排除禁忌：${result.conditions.map(c => CONTRA_LABEL[c]).join('、')}`, '');
  L.push('向客人解釋：', clientExplanation(result), '');
  result.phases.forEach(ph => {
    L.push(`【第${ph.startWeek}-${ph.endWeek}週】${ph.name}`, ph.goal);
    ph.picks.forEach((p, i) => L.push(`${i + 1}. ${p.e.name}（${EQUIP_LABEL[p.e.equipment]}）`, `   目標：${p.reason.goal}｜為什麼：${p.reason.why}`, `   選它：${p.reason.pick}${p.reason.covers.length ? '；同時兼顧' + p.reason.covers.join('、') : ''}`));
    L.push('');
  });
  if (result.releaseItems.length) { L.push('建議放鬆部位：'); result.releaseItems.forEach(r => L.push(`- ${r.area}（${r.tool}）：${r.technique}`)); }
  return L.join('\n');
}

function RootProgramView({ result, weeks, sessions, title, onPrint, onSave, onHEP, saveTitle }) {
  const phaseColors = [C.pine, C.brass, C.rose];
  const explain = clientExplanation(result);
  return (
    <div className="pl-card" style={{ padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 11.5, letterSpacing: 1, color: C.brass, textTransform: 'uppercase' }}>Root-cause Program</div>
          <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 21, color: C.pine, margin: '2px 0 0' }}>{title}</h3>
          <div style={{ fontSize: 12, color: C.inkFaint, fontFamily: FONT_MONO, marginTop: 3 }}>{weeks}週 · 每週{sessions}次{result.system ? ` · ${result.system === 'stott' ? 'STOTT' : 'Polestar'} 優先` : ''}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <CopyButton getText={() => programExportText(result, { title, weeks, sessions })} />
          {onPrint && <ExportPdfButton buildDoc={() => ({
            title: '私教課程規劃', subtitle: `${title} · ${weeks}週 · 每週${sessions}次`,
            meta: '根因：' + result.roots.map(r => `${r.name}（縮短：${r.short || '—'}；無力：${r.long || '—'}）`).join('；') + '\n向客人解釋：' + explain,
            rationale: result.rationale, cautions: result.cautions,
            sections: result.phases.map(ph => ({ label: `${ph.name}（第${ph.startWeek}-${ph.endWeek}週）`, note: ph.goal, items: ph.exercises, reasons: ph.picks.map(p => `${p.reason.goal}：${p.reason.why}`) })),
            releaseItems: result.releaseItems,
          })} onPrint={onPrint} />}
          {onSave && <SaveButton defaultTitle={saveTitle || ''} onSave={onSave} />}
        </div>
      </div>

      {result.cautions.length > 0 && (
        <div style={{ display: 'grid', gap: 6, marginBottom: 14 }}>
          {result.cautions.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, background: C.roseSoft, borderRadius: 10, padding: 11 }}>
              <AlertTriangle size={16} color={C.rose} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 12.5, lineHeight: 1.55 }}><strong>{c.name}：</strong>{c.text}</span>
            </div>
          ))}
        </div>
      )}

      <div className="pl-eyebrow">根因分析（筆記依據）</div>
      <RootCauseCards roots={result.roots} />

      <div style={{ background: C.pine, color: C.surface, borderRadius: 14, padding: 16, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 11.5, letterSpacing: 1, color: C.brassSoft, textTransform: 'uppercase' }}>向客人解釋</div>
          <CopyButton getText={() => explain} />
        </div>
        {explain.split('\n').map((l, i) => <p key={i} style={{ margin: '0 0 6px', fontSize: 13.5, lineHeight: 1.7 }}>{l}</p>)}
      </div>

      {result.rationale.length > 1 && <RationaleCard multi={result} />}

      <div style={{ display: 'flex', gap: 6, margin: '4px 0 18px', flexWrap: 'nowrap' }}>
        {result.phases.map((ph, i) => (
          <CoilBar key={i} color={phaseColors[i % 3]} colorSoft={phaseColors[i % 3] + 'AA'} width={`${((ph.endWeek - ph.startWeek + 1) / weeks) * 100}%`}>第{ph.startWeek}-{ph.endWeek}週</CoilBar>
        ))}
      </div>

      {result.phases.map((ph, i) => (
        <div key={i} style={{ marginBottom: 22, paddingLeft: 14, borderLeft: `3px solid ${phaseColors[i % 3]}` }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 16, color: phaseColors[i % 3] }}>{ph.name}　<span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.inkFaint }}>第{ph.startWeek}-{ph.endWeek}週</span></div>
          <div style={{ fontSize: 12.5, color: C.inkSoft, margin: '4px 0 12px', lineHeight: 1.6 }}>{ph.goal}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 12 }}>
            {ph.picks.map((p, j) => (
              <div key={p.e.id + j}>
                <ExerciseCard e={p.e} conditions={result.conditions} />
                <ReasonBox pick={p} />
              </div>
            ))}
          </div>
          {ph.unmet && ph.unmet.length > 0 && (
            <div style={{ fontSize: 11.5, color: C.inkFaint, marginTop: 8 }}>目前器械／程度／禁忌下沒有合適動作的目標：{ph.unmet.map(g => FX[g.fx].label).join('、')}（可增加器械或放寬程度）</div>
          )}
        </div>
      ))}

      <div style={{ fontSize: 12, color: C.inkFaint, lineHeight: 1.6, marginBottom: 16, fontStyle: 'italic' }}>
        進階原則：同一動作可透過彈簧、節奏、槓桿長度、支撐面或單側化加深難度（Polestar 閉鏈進階：部分負重→全負重、寬→窄支撐、雙側→單側、穩定→不穩定）。
      </div>
      <ReleaseGrid items={result.releaseItems} title="建議配合放鬆部位" />
      {onHEP && (
        <button type="button" onClick={onHEP} className="pl-btn-ghost" style={{ marginTop: 16, borderColor: C.sage, color: C.sage }}>生成回家自主練習小卡</button>
      )}
    </div>
  );
}

function ProgramBuilder({ onSaved, onPrint, pendingDiagnosis, onConsumePending }) {
  const [issueIds, setIssueIds] = useState(['apt']);
  const [weeks, setWeeks] = useState(8);
  const [sessions, setSessions] = useState(2);
  const [equip, setEquip] = useState(['mat', 'reformer', 'tower', 'chair']);
  const [level, setLevel] = useState('中');
  const [conditions, setConditions] = useState([]);
  const [system, setSystem] = useState(null);
  const [source, setSource] = useState(null);
  const [result, setResult] = useState(null);
  const [hepResult, setHepResult] = useState(null);

  useEffect(() => {
    if (!pendingDiagnosis) return;
    const d = pendingDiagnosis;
    if (d.issueIds && d.issueIds.length) setIssueIds(d.issueIds);
    if (d.level) setLevel(d.level);
    if (d.system !== undefined) setSystem(d.system);
    if (d.conditions) setConditions(d.conditions);
    setSource(d); setResult(null);
    if (onConsumePending) onConsumePending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingDiagnosis]);

  const toggle = (id) => { setIssueIds(issueIds.includes(id) ? issueIds.filter(x => x !== id) : [...issueIds, id]); };
  const generate = () => { if (!equip.length || !issueIds.length) return; setHepResult(null); setResult(generateRootProgram({ issueIds, weeks, sessions, equipmentSel: equip, level, conditions, system })); };
  const clientName = source && source.clientName;
  const title = `${clientName ? clientName + '・' : ''}${issueIds.map(id => ISSUES_MAP[id] ? ISSUES_MAP[id].name.replace(/\s+[A-Za-z].*$/, '') : id).join('＋')}`;
  const label = (t) => <div className="pl-label">{t}</div>;

  return (
    <div>
      <SectionTitle eyebrow="1-on-1 Program · Root Cause" title="私教課程規劃" sub="依體態問題的根因（哪些肌肉縮短、哪些被拉長無力）排出「鬆開與喚醒 → 強化與控制 → 整合與功能」三階段；每個動作都附上選擇原因，方便向客人解釋。" />
      {source && (
        <div style={{ display: 'flex', gap: 8, background: C.sageSoft, borderRadius: 12, padding: 12, marginBottom: 14 }}>
          <Sparkles size={16} color={C.sage} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 12.5, lineHeight: 1.6 }}>
            已帶入{clientName ? `「${clientName}」的` : ''}{source.systemLabel || ''}評估結果：{issueIds.length} 個問題{source.level ? `，程度上限「${LEVEL_LABEL[source.level]}」` : ''}{source.postureType ? `，STOTT 體態類型：${ISSUES_MAP[source.postureType].name}` : ''}。可自行增減後再生成。
          </div>
        </div>
      )}
      <div className="pl-card" style={{ padding: 18, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          {label(`客人的體態／功能問題（已選 ${issueIds.length}）`)}
          {issueIds.length > 0 && <button type="button" onClick={() => { setIssueIds([]); setResult(null); setSource(null); }} className="pl-btn-ghost" style={{ fontSize: 12, padding: '4px 10px', color: C.rose, borderColor: C.roseSoft }}><Trash2 size={12} /> 清除（下一位客人）</button>}
        </div>
        <IssuePickerGrouped selected={issueIds} onToggle={toggle} />
        <div className="pl-grid3" style={{ marginTop: 6 }}>
          <div>{label('訓練週數')}<div className="pl-chips">{[4, 6, 8, 10, 12].map(w => <Chip key={w} active={weeks === w} color={C.slate} onClick={() => setWeeks(w)}>{w}週</Chip>)}</div></div>
          <div>{label('每週堂數')}<div className="pl-chips">{[1, 2, 3].map(s => <Chip key={s} active={sessions === s} color={C.slate} onClick={() => setSessions(s)}>每週{s}次</Chip>)}</div></div>
          <div>{label('程度上限')}<div className="pl-chips">{['初', '中', '高'].map(l => <Chip key={l} active={level === l} color={C.rose} onClick={() => setLevel(l)}>{LEVEL_LABEL[l]}</Chip>)}</div></div>
        </div>
        <div style={{ marginTop: 14 }}>{label('體系偏好（選動作時優先該體系）')}<div className="pl-chips">{SYSTEM_OPTS.map(o => <Chip key={String(o.key)} active={system === o.key} color={C.brassDeep} onClick={() => setSystem(o.key)}>{o.label}</Chip>)}</div></div>
        <div style={{ marginTop: 14 }}>{label('可用器械')}<MultiEquipPicker value={equip} onChange={setEquip} /></div>
        <div style={{ marginTop: 14 }}>{label('客人特殊狀況／禁忌')}<ConditionPicker value={conditions} onChange={setConditions} /></div>
        <button onClick={generate} disabled={!equip.length || !issueIds.length} className="pl-btn-primary" style={{ marginTop: 18 }}>生成根因訓練規劃</button>
      </div>
      {result && (
        <RootProgramView result={result} weeks={weeks} sessions={sessions} title={title} onPrint={onPrint} saveTitle={clientName ? `${clientName}的訓練規劃` : ''}
          onSave={async (t) => {
            const r = await saveFlowItem({ type: 'program', title: t, meta: { issueIds, weeks, sessions, level, conditions, system, clientName: clientName || null }, payload: { root: true, result, weeks, sessions, title, assessment: source || null } });
            if (r.ok && onSaved) onSaved(); return r.ok;
          }}
          onHEP={() => setHepResult(generateHEP({ tags: [...new Set(issueIds.flatMap(id => (ISSUES_MAP[id] && ISSUES_MAP[id].tags) || []))], clientName, conditions }))} />
      )}
      {hepResult && <HEPCard hep={hepResult} onPrint={onPrint} />}
    </div>
  );
}

/* ============================== 評估：綜合／STOTT／Polestar × 靜態／動態 ============================== */
function AssessmentTab({ onSendToProgram, onSaved }) {
  const [system, setSystem] = useState('integrated');
  const [mode, setMode] = useState('static');
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState({});
  const [intake, setIntake] = useState({ name: '', goals: '', injury: '', health: '', other: '', exercise: '', pilates: '', job: '' });
  const [complaints, setComplaints] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [result, setResult] = useState(null);
  const sys = ASSESSMENT_SYSTEMS[system];
  const key = `${system}:${mode}`;
  const tests = mode === 'static' ? sys.static : sys.dynamic;
  const isScreening = system === 'polestar' && mode === 'dynamic';
  const ans = answers[key] || {};
  const setAns = (id, idx) => setAnswers(prev => ({ ...prev, [key]: { ...(prev[key] || {}), [id]: idx } }));
  const views = mode === 'static' ? sys.staticViews : [...new Set((tests || []).map(t => t.view))];
  const notes = () => [['損傷／病痛病史', intake.injury], ['其他健康狀況', intake.health], ['其他治療', intake.other], ['運動背景', intake.exercise], ['普拉提經驗', intake.pilates], ['職業與工作姿勢', intake.job], ['訓練目標', intake.goals]].filter(([, v]) => v).map(([k, v]) => `${k}：${v}`).join('\n');

  const analyze = () => {
    let detected = [], answered = 0, total = 0, postureType = null, level = null, weak = [];
    if (isScreening) {
      const sum = screeningLevel(scores);
      level = sum ? sum.level : null; answered = sum ? sum.answered : 0; total = 15;
      weak = SCREENING_TESTS.filter(t => scores[t.key] !== undefined && scores[t.key] <= 1).map(t => t.key);
      const ids = [...new Set(weak.map(k => SCREENING_ISSUE[k]))];
      detected = ids.map(id => ({ id, count: weak.filter(k => SCREENING_ISSUE[k] === id).length, issue: ISSUES_MAP[id] }));
    } else {
      const r = analyzeTests(tests, ans); detected = r.detected; answered = r.answeredCount; total = r.totalCount;
      if (system === 'stott' && mode === 'static') postureType = classifyStottType(ans);
    }
    if (postureType && !detected.find(d => d.id === postureType)) detected.unshift({ id: postureType, count: 0, issue: ISSUES_MAP[postureType], type: true });
    complaints.forEach(id => { if (!detected.find(d => d.id === id)) detected.push({ id, count: 0, issue: ISSUES_MAP[id], complaint: true }); });
    setResult({ detected, answered, total, postureType, level, weak, system, mode, avg: isScreening ? (screeningLevel(scores) || {}).avg : null });
  };
  const send = () => onSendToProgram({
    issueIds: result.detected.map(d => d.id), clientName: intake.name, notes: notes(), level: result.level || undefined,
    system: system === 'integrated' ? null : system, systemLabel: `${sys.label}${result.mode === 'static' ? '靜態' : '動態'}`, conditions, postureType: result.postureType,
    assessmentResult: { detected: result.detected, answeredCount: result.answered, totalCount: result.total },
  });
  const field = (k, label, ph) => (
    <div><div className="pl-label">{label}</div><input value={intake[k]} onChange={e => setIntake({ ...intake, [k]: e.target.value })} placeholder={ph} className="pl-input" /></div>
  );
  const answeredNow = isScreening ? Object.keys(scores).length : Object.keys(ans).length;

  return (
    <div>
      <SectionTitle eyebrow="Assessment · 3 Systems" title="體態評估" sub="選擇評估體系與靜態／動態模式；每個非中立的觀察都會對應到知識庫中的問題，並可一鍵帶入根因訓練規劃。" />
      <div className="pl-seg" style={{ marginBottom: 10 }}>
        {Object.entries(ASSESSMENT_SYSTEMS).map(([k, s]) => (
          <button key={k} type="button" className={system === k ? 'on' : ''} onClick={() => { setSystem(k); setResult(null); }}>{s.label}</button>
        ))}
      </div>
      <p style={{ fontSize: 12.5, color: C.inkSoft, margin: '0 0 12px', lineHeight: 1.6 }}>{sys.sub}</p>
      <div className="pl-seg small" style={{ marginBottom: 18 }}>
        <button type="button" className={mode === 'static' ? 'on' : ''} onClick={() => { setMode('static'); setResult(null); }}>靜態評估</button>
        <button type="button" className={mode === 'dynamic' ? 'on' : ''} onClick={() => { setMode('dynamic'); setResult(null); }}>動態評估</button>
      </div>

      <details className="pl-card" style={{ padding: '14px 18px', marginBottom: 18 }} open={typeof window === 'undefined' || window.innerWidth > 640}>
        <summary style={{ cursor: 'pointer', fontFamily: FONT_MONO, fontSize: 11.5, letterSpacing: 1, color: C.brass, textTransform: 'uppercase' }}>客戶諮詢資料（STOTT 入門問卷）</summary>
        <div className="pl-grid3" style={{ marginTop: 12 }}>
          {field('name', '客人姓名', '例如：陳小姐')}{field('goals', '訓練目標', '例如：改善下背痛')}{field('injury', '損傷或病痛（新傷／舊疾）', '例如：半年前右膝手術')}
          {field('health', '其他健康狀況／用藥', '例如：高血壓')}{field('other', '目前其他治療', '例如：物理治療')}{field('exercise', '運動背景', '例如：跑步每週2次')}
          {field('pilates', '普拉提經驗', '例如：初學者')}{field('job', '職業與工作姿勢', '例如：長時間坐電腦前')}
        </div>
        <div style={{ marginTop: 12 }}><div className="pl-label">主訴（無法由觀察測試得出的問題）</div>
          <div className="pl-chips">{COMPLAINTS.map(c => <Chip key={c.key} active={complaints.includes(c.key)} color={C.rose} onClick={() => setComplaints(complaints.includes(c.key) ? complaints.filter(x => x !== c.key) : [...complaints, c.key])}>{c.label}</Chip>)}</div></div>
        <div style={{ marginTop: 12 }}><div className="pl-label">特殊狀況／禁忌（會一併帶入規劃）</div><ConditionPicker value={conditions} onChange={setConditions} /></div>
        <div style={{ fontSize: 11.5, color: C.inkFaint, marginTop: 10, lineHeight: 1.55 }}>STOTT 小綠本：嚴重關節疼痛、陣發性眩暈、灼痛刺痛、氣短、未確診慢性疼痛、胸悶、懷孕或產後、嚴重骨質疏鬆、高血壓、心臟病、一年內大手術——需醫生證明可練習普拉提。</div>
      </details>

      {mode === 'dynamic' && <div style={{ fontSize: 12.5, color: C.inkSoft, background: C.slateSoft, borderRadius: 10, padding: 11, marginBottom: 16, lineHeight: 1.6 }}>{sys.dynamicNote}</div>}

      {isScreening ? <ScreeningGrid scores={scores} setScores={setScores} /> : views.map(view => (
        <div key={view} style={{ marginBottom: 22 }}>
          <div className="pl-view-head">{view}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 10 }}>
            {tests.filter(t => t.view === view).map(t => <TestRow key={t.id} test={t} value={ans[t.id]} onAnswer={setAns} />)}
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', margin: '6px 0 20px' }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.inkFaint }}>已完成 {answeredNow}/{isScreening ? 15 : tests.length} 項</span>
        <button type="button" className="pl-btn-primary" disabled={!answeredNow && !complaints.length} onClick={analyze}>分析</button>
        <button type="button" className="pl-btn-ghost" onClick={() => { setAnswers(p => ({ ...p, [key]: {} })); if (isScreening) setScores({}); setResult(null); }}>清空此表</button>
      </div>

      {result && (
        <div className="pl-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
            <div>
              <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 19, color: C.pine, margin: 0 }}>分析結果{intake.name ? `　·　${intake.name}` : ''}</h3>
              <div style={{ fontSize: 12, color: C.inkFaint, fontFamily: FONT_MONO, marginTop: 4 }}>{sys.label} · {result.mode === 'static' ? '靜態' : '動態'} · 已完成 {result.answered}/{result.total}{result.level ? ` · 體適能程度 ${LEVEL_LABEL[result.level]}（平均 ${result.avg.toFixed(2)}）` : ''}</div>
            </div>
            <SaveButton defaultTitle={intake.name ? `${intake.name}的${sys.label}評估` : ''} onSave={async (t) => {
              const r = await saveFlowItem({ type: 'assessment', title: t, meta: { clientName: intake.name, system }, payload: { clientName: intake.name, notes: notes(), answers: ans, result: { detected: result.detected, answeredCount: result.answered, totalCount: result.total } } });
              if (r.ok && onSaved) onSaved(); return r.ok;
            }} />
          </div>
          {result.postureType && <div style={{ background: C.brassSoft, borderRadius: 10, padding: 11, fontSize: 13, marginBottom: 12 }}><strong>STOTT 體態類型：</strong>{ISSUES_MAP[result.postureType].name}——規劃會套用小綠本對應的課程設計建議與分層動作。</div>}
          {result.detected.length === 0 ? <div style={{ fontSize: 13, color: C.inkFaint }}>未偵測到明顯問題。</div> : (
            <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
              {result.detected.map(d => (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.surface2, borderRadius: 10, padding: 10 }}>
                  <Badge color={C.surface} soft={d.type ? C.brass : d.complaint ? C.rose : d.count >= 2 ? C.brassDeep : C.inkFaint}>{d.type ? '類型' : d.complaint ? '主訴' : d.count}</Badge>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{d.issue.name}</div>
                    <div style={{ fontSize: 11.5, color: C.inkFaint }}>{GROUP_LABEL[d.issue.group]}{d.issue.root && d.issue.root.short ? ` · 縮短：${d.issue.root.short.slice(0, 40)}${d.issue.root.short.length > 40 ? '…' : ''}` : ''}</div>
                  </div>
                  {d.issue.caution && <AlertTriangle size={15} color={C.rose} />}
                </div>
              ))}
            </div>
          )}
          {result.detected.length > 0 && <button type="button" className="pl-btn-primary" style={{ background: C.brassDeep }} onClick={send}><ClipboardList size={16} /> 帶入根因訓練規劃</button>}
        </div>
      )}
    </div>
  );
}

function ScreeningGrid({ scores, setScores }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 10, marginBottom: 12 }}>
      {SCREENING_TESTS.map(t => (
        <div key={t.key} className="pl-card" style={{ padding: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{t.name} <span style={{ fontSize: 11, color: C.inkFaint, fontWeight: 500 }}>→ {ISSUES_MAP[SCREENING_ISSUE[t.key]].name.replace(/\s+[A-Za-z].*$/, '')}</span></div>
          <div style={{ fontSize: 11.5, color: C.inkSoft, lineHeight: 1.5 }}><strong>目的：</strong>{t.purpose}</div>
          <div style={{ fontSize: 11.5, color: C.inkSoft, lineHeight: 1.5 }}><strong>執行：</strong>{t.how}</div>
          <div style={{ fontSize: 11.5, color: C.rose, lineHeight: 1.5, marginBottom: 8 }}><strong>留意：</strong>{t.watch}</div>
          <div style={{ display: 'grid', gap: 5 }}>
            {[[3, t.s3], [2, t.s2], [1, t.s1], [0, '無法完成']].map(([v, l]) => (
              <button key={v} type="button" onClick={() => setScores(p => ({ ...p, [t.key]: v }))} className={'pl-opt' + (scores[t.key] === v ? (v >= 2 ? ' good' : ' bad') : '')}><strong style={{ fontFamily: FONT_MONO }}>{v}</strong>　{l}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================== APP SHELL ============================== */
const TABS = [
  { key: 'assessment', short: '評估', label: '體態評估', en: 'Assess', icon: '◎' },
  { key: 'program', short: '規劃', label: '私教規劃', en: 'Program', icon: '⇣' },
  { key: 'class', short: '課堂', label: '主題課堂', en: 'Class', icon: '▤' },
  { key: 'specialty', short: '特色', label: '特色課堂', en: 'Circuit', icon: '◇' },
  { key: 'library', short: '動作庫', label: '動作庫', en: 'Library', icon: '≡' },
  { key: 'posture', short: '知識庫', label: '知識庫', en: 'Knowledge', icon: '✦' },
  { key: 'saved', short: '收藏', label: '我的收藏', en: 'Saved', icon: '♡' },
];

/* Plumbline 標誌：鉛垂線＋銅色鉛錘＋環繞軸線的脊柱曲線 */
function BrandMark({ size = 44 }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <rect x="1" y="1" width="46" height="46" rx="14" fill={C.pine} />
      <line x1="24" y1="7" x2="24" y2="31" stroke={C.brassSoft} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M28.5 9.5 C 18 13, 30 19, 19.5 23.5 C 15.5 25.2, 18.5 28.6, 22.4 29.6" fill="none" stroke={C.surface} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M24 31 C 20.6 34.2, 20.6 37.4, 24 40.8 C 27.4 37.4, 27.4 34.2, 24 31 Z" fill={C.brass} />
    </svg>
  );
}

const APP_CSS = `
  * { box-sizing: border-box; }
  body { background: ${C.bg}; }
  select { outline: none; }
  button:focus-visible, select:focus-visible, input:focus-visible, summary:focus-visible { outline: 2px solid ${C.brass}; outline-offset: 2px; }
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
  .pl-shell { display: grid; grid-template-columns: 220px minmax(0,1fr); gap: 32px; max-width: 1240px; margin: 0 auto; padding: 24px 24px 64px; }
  .pl-side { position: sticky; top: 20px; align-self: start; }
  .pl-brand { display: flex; align-items: center; gap: 11px; margin-bottom: 26px; }
  .pl-brand-name { font-family: ${FONT_DISPLAY}; font-weight: 900; font-size: 21px; color: ${C.pine}; letter-spacing: -0.3px; line-height: 1.05; }
  .pl-brand-sub { font-family: ${FONT_MONO}; font-size: 10.5px; color: ${C.brass}; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 3px; }
  .pl-nav { display: flex; flex-direction: column; gap: 3px; }
  .pl-nav button { display: flex; align-items: center; gap: 10px; width: 100%; text-align: left; border: none; background: transparent; padding: 10px 12px; border-radius: 11px; cursor: pointer; color: ${C.inkSoft}; font-family: ${FONT_BODY}; font-size: 14px; font-weight: 600; }
  .pl-nav button .ic { width: 26px; height: 26px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; background: ${C.surface2}; color: ${C.pineSoft}; font-size: 13px; flex-shrink: 0; }
  .pl-nav button .en { margin-left: auto; font-family: ${FONT_MONO}; font-size: 10px; color: ${C.inkFaint}; letter-spacing: 0.5px; }
  .pl-nav button:hover { background: ${C.surface2}; }
  .pl-nav button.on { background: ${C.pine}; color: ${C.surface}; }
  .pl-nav button.on .ic { background: ${C.brass}; color: ${C.surface}; }
  .pl-nav button.on .en { color: ${C.brassSoft}; }
  .pl-side-note { margin-top: 22px; font-size: 11.5px; color: ${C.inkFaint}; line-height: 1.6; border-top: 1px solid ${C.line}; padding-top: 14px; }
  .pl-card { background: ${C.surface}; border: 1px solid ${C.line}; border-radius: 16px; box-shadow: 0 1px 2px rgba(28,43,46,.04), 0 8px 24px -18px rgba(28,43,46,.25); }
  .pl-label { font-size: 12.5px; font-weight: 700; color: ${C.pine}; margin-bottom: 8px; font-family: ${FONT_MONO}; letter-spacing: 0.4px; }
  .pl-eyebrow { font-family: ${FONT_MONO}; font-size: 11.5px; letter-spacing: 1px; color: ${C.brass}; text-transform: uppercase; margin-bottom: 8px; }
  .pl-chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .pl-grid3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; }
  .pl-input { width: 100%; padding: 9px 12px; border-radius: 10px; border: 1.5px solid ${C.line}; background: ${C.surface}; font-family: ${FONT_BODY}; font-size: 13.5px; color: ${C.ink}; }
  .pl-btn-primary { display: inline-flex; align-items: center; gap: 7px; padding: 11px 22px; border-radius: 11px; border: none; cursor: pointer; background: ${C.pine}; color: ${C.surface}; font-family: ${FONT_DISPLAY}; font-weight: 800; font-size: 14.5px; }
  .pl-btn-primary:disabled { background: ${C.inkFaint}; cursor: not-allowed; }
  .pl-btn-ghost { display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: 10px; border: 1.5px solid ${C.line}; background: transparent; cursor: pointer; color: ${C.inkSoft}; font-family: ${FONT_BODY}; font-size: 13px; font-weight: 600; }
  .pl-seg { display: inline-flex; background: ${C.surface2}; border: 1px solid ${C.line}; border-radius: 12px; padding: 4px; gap: 4px; flex-wrap: wrap; }
  .pl-seg button { border: none; background: transparent; padding: 9px 18px; border-radius: 9px; cursor: pointer; font-family: ${FONT_DISPLAY}; font-weight: 700; font-size: 14px; color: ${C.inkSoft}; }
  .pl-seg.small button { padding: 7px 14px; font-size: 13px; }
  .pl-seg button.on { background: ${C.surface}; color: ${C.pine}; box-shadow: 0 1px 3px rgba(28,43,46,.12); }
  .pl-view-head { font-family: ${FONT_DISPLAY}; font-weight: 800; font-size: 16px; color: ${C.brassDeep}; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
  .pl-view-head::before { content: ''; width: 20px; height: 3px; background: ${C.brass}; border-radius: 2px; }
  .pl-opt { text-align: left; padding: 6px 9px; border-radius: 8px; cursor: pointer; font-size: 11.5px; line-height: 1.4; font-family: ${FONT_BODY}; border: 1.5px solid ${C.line}; background: transparent; color: ${C.ink}; }
  .pl-opt.good { border-color: ${C.sage}; background: ${C.sageSoft}; }
  .pl-opt.bad { border-color: ${C.rose}; background: ${C.roseSoft}; }
  #print-root { position: fixed; left: -9999px; top: 0; width: 800px; background: #fff; }
  .pl-nav button .sh { display: none; }
  html { -webkit-text-size-adjust: 100%; }
  button { -webkit-tap-highlight-color: transparent; }
  @media (pointer: coarse) {
    .pl-chips button, .pl-nav button, .pl-opt { min-height: 40px; }
    .pl-input, select { font-size: 16px !important; } /* iOS 不會自動放大 */
  }
  /* iPad 直向／小筆電：上方橫向分頁 */
  @media (max-width: 1000px) {
    .pl-shell { grid-template-columns: minmax(0,1fr); gap: 14px; padding: calc(14px + env(safe-area-inset-top)) 18px 56px; }
    .pl-grid3 { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
    .pl-side { position: sticky; top: 0; z-index: 20; background: ${C.bg}; padding-top: 4px; }
    .pl-brand { margin-bottom: 10px; }
    .pl-nav { flex-direction: row; overflow-x: auto; gap: 6px; padding-bottom: 8px; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
    .pl-nav::-webkit-scrollbar { display: none; }
    .pl-nav button { width: auto; flex-shrink: 0; padding: 8px 12px; font-size: 13.5px; }
    .pl-nav button .en, .pl-side-note { display: none; }
  }
  /* 手機：底部分頁列（拇指可及），頂部只留品牌 */
  @media (max-width: 640px) {
    .pl-shell { padding: calc(10px + env(safe-area-inset-top)) 14px calc(86px + env(safe-area-inset-bottom)); }
    .pl-grid3 { grid-template-columns: minmax(0,1fr); }
    .pl-side { position: static; background: transparent; }
    .pl-brand { margin-bottom: 4px; }
    .pl-brand svg { width: 36px; height: 36px; }
    .pl-brand-name { font-size: 18px; }
    .pl-nav { position: fixed; left: 0; right: 0; bottom: 0; z-index: 50; display: grid; grid-template-columns: repeat(7, 1fr); gap: 0; padding: 6px 4px calc(6px + env(safe-area-inset-bottom)); overflow: visible;
      background: rgba(255,253,249,.96); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-top: 1px solid ${C.line}; box-shadow: 0 -6px 20px -14px rgba(28,43,46,.35); }
    .pl-nav button { flex-direction: column; gap: 3px; padding: 5px 0; border-radius: 10px; font-size: 10.5px; min-height: 50px; justify-content: center; align-items: center; }
    .pl-nav button .lb { display: none; }
    .pl-nav button .sh { display: block; }
    .pl-nav button .ic { width: 30px; height: 26px; }
    .pl-nav button.on { background: transparent; color: ${C.pine}; }
    .pl-nav button.on .ic { background: ${C.pine}; color: ${C.surface}; }
    .pl-card { border-radius: 14px; }
    h2 { font-size: 21px !important; }
  }
  @media print {
    body * { visibility: hidden; }
    #print-root, #print-root * { visibility: visible; }
    #print-root { position: absolute; left: 0; top: 0; width: 100%; }
  }
`;

export default function App() {
  const [tab, setTab] = useState('class');
  const [savedIndex, setSavedIndex] = useState([]);
  const [savedLoaded, setSavedLoaded] = useState(false);
  const [printDoc, setPrintDoc] = useState(null);
  const [pendingDiagnosis, setPendingDiagnosis] = useState(null);

  const refreshSaved = async () => { const idx = await loadSavedIndex(); setSavedIndex(idx); setSavedLoaded(true); };
  useEffect(() => { refreshSaved(); }, []);

  const sendToProgramBuilder = (assessmentHandoff) => { setPendingDiagnosis(assessmentHandoff); setTab('program'); };

  return (
    <div style={{ minHeight: '100%', background: C.bg, fontFamily: FONT_BODY, color: C.ink }}>
      <style>{APP_CSS}</style>
      <div className="pl-shell no-print">
        <aside className="pl-side">
          <div className="pl-brand">
            <BrandMark />
            <div>
              <div className="pl-brand-name">Plumbline<br /><span style={{ fontSize: 15, fontWeight: 800, color: C.brassDeep }}>鉛垂線</span></div>
              <div className="pl-brand-sub">Pilates Planner</div>
            </div>
          </div>
          <nav className="pl-nav">
            {TABS.map(t => (
              <button key={t.key} type="button" className={tab === t.key ? 'on' : ''} onClick={() => { setTab(t.key); window.scrollTo(0, 0); }} aria-label={t.label}>
                <span className="ic">{t.icon}</span><span className="lb">{t.label}</span><span className="sh">{t.short}</span>
                {t.key === 'saved' && savedIndex.length > 0 ? <span className="en">{savedIndex.length}</span> : <span className="en">{t.en}</span>}
              </button>
            ))}
          </nav>
          <div className="pl-side-note">從評估、根因到課堂。<br />依據 STOTT 與 Polestar 筆記：{EXERCISES.length} 個動作、{ISSUES.length} 個體態／功能問題。</div>
        </aside>
        <div style={{ minWidth: 0 }}>
        <main>
          {tab === 'library' && <EquipmentLibrary />}
          {tab === 'class' && <ClassGenerator onSaved={refreshSaved} onPrint={setPrintDoc} />}
          {tab === 'specialty' && <SpecialtyPrograms onSaved={refreshSaved} onPrint={setPrintDoc} />}
          {tab === 'assessment' && <AssessmentTab onSendToProgram={sendToProgramBuilder} onSaved={refreshSaved} />}
          {tab === 'program' && <ProgramBuilder onSaved={refreshSaved} onPrint={setPrintDoc} pendingDiagnosis={pendingDiagnosis} onConsumePending={() => setPendingDiagnosis(null)} />}
          {tab === 'posture' && <PostureLibrary />}
          {tab === 'saved' && <SavedFlows savedIndex={savedIndex} loaded={savedLoaded} onRefresh={refreshSaved} />}
        </main>

        <footer style={{ marginTop: 50, paddingTop: 18, borderTop: `1px solid ${C.line}` }}>
          <p style={{ fontSize: 11.5, color: C.inkFaint, lineHeight: 1.6 }}>
            本工具內容為普拉提專業教學參考架構，動作編排邏輯僅供導師備課使用，並非醫療建議；如客人有持續或劇烈痛症，請先轉介專業醫療人員評估。儲存功能只會將資料存放在此裝置的瀏覽器內，不會與其他人分享。Plumbline 鉛垂線 · 動作與評估內容整理自 STOTT PILATES® 與 Polestar Pilates 課程筆記。
          </p>
        </footer>
        </div>
      </div>

      <div id="print-root">
        <PrintableDocument doc={printDoc} />
      </div>
    </div>
  );
}
