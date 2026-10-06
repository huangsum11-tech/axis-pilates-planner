/* ============================== 三套評估體系：綜合／STOTT／Polestar，各分靜態與動態 ==============================
   每個「非中立」選項都對應到知識庫中的體態問題，評估結果可直接帶入私教規劃 */
const T = (id, view, name, criteria, options) => ({ id, view, name, criteria, options: options.map(([label, ids]) => ({ label, issueIds: ids ? ids.split(' ') : [] })) });

/* ---------- STOTT 靜態：體態分析指南檢查表（小綠本 p18-19、體態評估口令） ---------- */
const STOTT_STATIC = [
  T('ss_plumb', '鉛垂線', '鉛垂線（參照點：外踝略前）', '側面觀察頭、上身、肩、骨盆、膝與鉛垂線的關係；偏差以輕／中／重描述，不必量度英吋。', [
    ['全身大致與鉛垂線重合'], ['頭部在線前', 'fhp'], ['骨盆在線前、上身在線後（凹背傾向）', 'swayback'], ['整體重心在線前', 'gait'], ['整體重心在線後', 'swayback']]),
  T('ss_ankle', '側視圖', '踝關節', '小腿脛骨下1/3與足底的夾角：90°＝中立。', [['中立（約90°）'], ['蹠屈（>90°，常伴膝過伸）', 'recurvatum'], ['背屈（<90°，常伴膝屈曲）', 'kneeflex']]),
  T('ss_knee', '側視圖', '膝部', '大轉子與外踝略前的連線，比較膝關節中心點。', [['中立（穿過膝中心）'], ['過度伸展（膝在線後）', 'recurvatum'], ['屈曲（膝在線前）', 'kneeflex']]),
  T('ss_hip', '側視圖', '髖關節', '髂前上棘與髂後上棘連線中點垂直向下，比較大轉子。', [['中立（垂直對準大轉子）'], ['屈曲（中點在大轉子前）', 'apt'], ['伸展（中點在大轉子後）', 'swayback ppt']]),
  T('ss_pelvis', '側視圖', '骨盆', '觸碰髂前上棘與髂後上棘並比較；滿足中立三要素中的兩項即為中立。', [['中立位'], ['前傾', 'apt'], ['後傾', 'ppt']]),
  T('ss_lumbar', '側視圖', '腰椎', '由髂嵴最高點水平對準 L4，觸摸 L1-5 曲度；手指無壓力微伸為中立。', [['中立'], ['平直（前凸減小）', 'lumbarflatback'], ['過度伸展（前凸增大）', 'lordosis']]),
  T('ss_lthor', '側視圖', '下胸椎（T6-T12）', '由肩胛下角水平對應 T7，觸摸 T6-12 曲度。', [['中立'], ['平直（後凸減小）', 'thoracicflatback'], ['過度屈曲（後凸增大）', 'kyphosis']]),
  T('ss_uthor', '側視圖', '上胸椎（T1-T6）', '觸摸 T1-6 曲度（亞洲人上胸椎多偏平直）。', [['中立'], ['平直（後凸減小）', 'thoracicflatback'], ['過度屈曲（後凸增大）', 'kyphosis']]),
  T('ss_cerv', '側視圖', '頸椎', '由 C7 往上逐節觸摸曲度。', [['中立'], ['平直（前凸減小）', 'militaryneck'], ['過度伸展（前凸增大）', 'cervlordosis']]),
  T('ss_head', '側視圖', '頭部', '耳垂（外耳道）與肩峰是否在同一垂直線。', [['中立'], ['前伸', 'fhp'], ['後縮', 'militaryneck']]),
  T('sf_foot', '正視圖', '足部', '辨別雙腳內外側承重。', [['均勻承重'], ['外側承重偏多（內翻／旋後）', 'cavus'], ['內側承重偏多（外翻／旋前）', 'flatfoot']]),
  T('sf_knee', '正視圖', '膝部', '雙腳併攏，屈膝後慢慢伸直觀察股骨與脛骨排列。', [['中立'], ['X 型腿（膝外翻）', 'valgum'], ['O 型腿（膝內翻）', 'varum']]),
  T('sf_pelvis', '正視圖', '骨盆', '觸碰兩側髂前上棘與髂嵴頂部比較；俯視看哪側更靠近你。', [['水平'], ['一側上提', 'lpt'], ['順時針偏轉（右側更靠近）', 'pelvicrot'], ['逆時針偏轉（左側更靠近）', 'pelvicrot']]),
  T('sf_rib', '正視圖', '肋骨架', '比較兩側肋骨下角高度、肋骨下角與髂嵴之間空間、俯視胸骨確認旋轉。', [['中立'], ['上提（肋骨外翻／外擴）', 'ribflare'], ['平移（一側空間較多）', 'lateralshift'], ['旋轉', 'thoracicrot']]),
  T('sf_shoulder', '正視圖', '肩部', '沿鎖骨觸碰至肩峰並比較。', [['水平'], ['一側上提', 'highshoulder'], ['雙側上提（聳肩）', 'scapelev'], ['下沉', 'scapdep']]),
  T('sf_head', '正視圖', '頭部', '眉心、鼻尖、下巴是否對準胸骨；兩耳大小；兩側頸肩空間。', [['中立'], ['傾斜', 'headtilt'], ['旋轉', 'headrot'], ['平移', 'headtilt']]),
  T('sb_foot', '後視圖', '足部（跟腱）', '比目魚肌下方至地面的跟腱是否垂直。', [['中立（垂直）'], ['內翻（旋後）', 'cavus'], ['外翻（旋前）', 'flatfoot']]),
  T('sb_femur', '後視圖', '股骨', '觸碰股骨內外髁：內髁靠近你＝內旋。', [['中立'], ['內旋', 'femir'], ['外旋', 'femer']]),
  T('sb_pelvis', '後視圖', '骨盆', '觸碰兩側髂後上棘與髂嵴頂部比較。', [['水平'], ['一側上提', 'lpt'], ['旋轉', 'pelvicrot']]),
  T('sb_scap1', '後視圖', '肩胛骨：前引／後縮', '肩胛內緣與脊柱距離約本人3-4指（>4 前引、<3 後縮）。', [['中立'], ['前引', 'roundshoulder'], ['後縮', 'scapret']]),
  T('sb_scap2', '後視圖', '肩胛骨：上提／下沉', '肩胛岡內側緣與 T3 比較高低。', [['中立'], ['上提', 'scapelev'], ['下沉', 'scapdep']]),
  T('sb_scap3', '後視圖', '肩胛骨：上旋／下旋', '肩胛岡內側緣走向：八字＝上旋，上寬下窄＝下旋。', [['中立'], ['上旋', 'scapuprot'], ['下旋', 'scapdownrot']]),
  T('sb_scap4', '後視圖', '肩胛骨：外翻／前傾', '內緣空隙超過半個指節＝外翻（翼狀）；下角空隙超過半個指節＝前傾。', [['平貼胸廓'], ['外翻（翼狀）', 'staticscapwing'], ['前傾', 'scaptilt']]),
  T('sb_hum', '後視圖', '肱骨', '伸直手肘，鷹嘴突朝向後方為中立。', [['中立'], ['內旋（鷹嘴突向外）', 'humir']]),
  T('sb_spine', '後視圖', '循序檢查脊椎', '逐節觸碰脊椎兩側，判斷異常彎曲、旋轉或失衡；觀察逐節活動時是否有平直段。', [['無明顯失衡'], ['側彎／兩側張力失衡', 'scoliosis'], ['某段平直、活動不分節', 'thoracicflatback flexcontrol']]),
];

/* ---------- STOTT 動態：五大原則功能檢查（熱身即評估；五大原則匯總、基礎手冊） ---------- */
const STOTT_DYNAMIC = [
  T('sd_breath', '呼吸原則', '三維呼吸', '手放肋骨架兩側與後下方：吸氣時肋骨架後部與兩側是否擴張，有無頸肩緊張。', [['三維擴張，肩頸放鬆'], ['胸口上部呼吸、吸氣聳肩（輔助式呼吸）', 'breathpattern zoa'], ['只有腹部鼓起，肋骨架不動', 'breathpattern']]),
  T('sd_pelvis', '骨盆原則', '骨盆穩定測試', 'STOTT 順序：中立位→下沉位→腿部滑動→抬腿→足尖輕點，記錄第一個無法穩定中立位的層級。', [['全部能穩定中立位'], ['足尖輕點時失穩', 'corecontrol'], ['抬腿時失穩', 'corecontrol'], ['腿部滑動即失穩', 'corecontrol lowback']]),
  T('sd_imprint', '骨盆原則', '腰椎下沉方式', '請客人做腰椎下沉：是否以腹斜肌完成。', [['以腹斜肌完成'], ['用臀肌或膕繩肌硬壓（假下沉）', 'corecontrol']]),
  T('sd_rib', '肋骨架原則', '手臂上舉時的肋骨架', '仰臥做手臂畫弧：手臂過頭時下肋是否保持貼墊、腹肌是否保持收緊。', [['肋骨架穩定'], ['肋骨外翻、下背離墊', 'ribflare overhead']]),
  T('sd_scap', '肩胛原則', '肩胛滑動', '仰臥做肩胛前引／後縮、上提／下沉：動作是否平穩順滑、全方位。', [['平穩順滑'], ['以聳肩代償', 'scapelev'], ['無法平貼胸廓（翼狀）', 'staticscapwing scapstab'], ['前引受限', 'scapret']]),
  T('sd_head', '頭頸原則', '點頭動作', '仰臥做顱椎屈曲：是否由深層頸屈肌啟動、後腦保持貼墊。', [['深層頸屈肌啟動'], ['胸鎖乳突肌突起、下巴前推', 'fhp'], ['下巴硬壓胸口、頭離墊', 'cervlordosis']]),
  T('sd_cat', '脊柱活動', '貓背伸展（逐節屈伸）', '四足跪姿逐節捲曲與伸展：整條脊椎是否均勻參與。', [['均勻逐節'], ['胸椎段平直不參與', 'thoracicflatback'], ['只在腰椎活動', 'flexcontrol thoracicstiff']]),
  T('sd_rot', '脊柱活動', '脊椎旋轉', '側躺脊椎旋轉（開書式）左右比較。', [['兩側對稱'], ['一側明顯受限', 'thoracicrot']]),
];

/* ---------- Polestar 靜態：動力鏈5檢查點＋節段排列＋肌肉長度測試（普拉提體態原理） ---------- */
const POLESTAR_STATIC = [
  T('ps_f_foot', '前面觀', '足踝', '朝前方且平行，沒有扁平足或外旋。', [['朝前且平行'], ['扁平足（足弓塌陷）', 'flatfoot'], ['外八', 'femer tibtorsion'], ['內八', 'femir tibtorsion'], ['拇指外翻', 'hallux']]),
  T('ps_f_knee', '前面觀', '膝', '與腳尖在同一直線，沒有內收或外展。', [['與腳尖同線'], ['內收（膝內扣）', 'valgum'], ['外展（O 型）', 'varum']]),
  T('ps_f_lphc', '前面觀', '腰椎-骨盆-髖複合體（LPHC）', '骨盆水平，雙側髂前上棘同高。', [['水平'], ['不水平', 'lpt fld']]),
  T('ps_f_sh', '前面觀', '肩', '水平，沒有聳肩或圓肩。', [['水平'], ['聳肩', 'scapelev'], ['圓肩', 'roundshoulder'], ['高低肩', 'highshoulder']]),
  T('ps_f_head', '前面觀', '頭', '中立，沒有傾斜或旋轉；比較兩耳與兩側腮幫。', [['中立'], ['傾斜', 'headtilt'], ['旋轉', 'headrot']]),
  T('ps_s_ankle', '側面觀', '足踝', '中立，腿與足底垂直。', [['中立'], ['蹠屈', 'recurvatum'], ['背屈', 'kneeflex']]),
  T('ps_s_knee', '側面觀', '膝', '中立，沒有屈曲或過伸。', [['中立'], ['過伸', 'recurvatum'], ['屈曲', 'kneeflex']]),
  T('ps_s_lphc', '側面觀', 'LPHC', '骨盆中立，沒有前傾（腰椎伸展）或後傾（腰椎屈曲）。', [['中立'], ['前傾', 'apt lordosis lcs'], ['後傾', 'ppt lumbarflatback']]),
  T('ps_s_thor', '側面觀', '胸椎與肩', '正常的背部曲線，沒有過度圓肩；中指貼胸椎滑動感受弧度。', [['正常'], ['駝背／過度後凸', 'kyphosis'], ['平背（胸椎過直）', 'thoracicflatback']]),
  T('ps_s_head', '側面觀', '頭與頸椎', '中立，沒有過度伸展（向前伸出）。', [['中立'], ['頭前伸', 'fhp'], ['頸椎曲度變直／反弓', 'militaryneck'], ['頸椎過度前凸（頸後橫紋）', 'cervlordosis']]),
  T('ps_b_ankle', '後面觀', '足踝（跟腱）', '雙腳跟豎直且平行，沒有過度旋前。', [['豎直平行'], ['過度旋前（足外翻）', 'flatfoot'], ['旋後（足內翻）', 'cavus']]),
  T('ps_b_lphc', '後面觀', 'LPHC', '骨盆水平，雙側髂後上棘同高；觀察腰部皺褶與臀紋、膕窩線。', [['水平'], ['一側抬高', 'lpt'], ['旋轉（一側較近）', 'pelvicrot'], ['橫向移位', 'lateralshift']]),
  T('ps_b_scap', '後面觀', '肩／肩胛', '肩胛內緣應基本平行，距脊柱約3-4指；下角較上角遠離脊柱約1cm。', [['平行且距離正常'], ['外展（>4指）', 'roundshoulder'], ['翼狀（手指易插入內緣）', 'staticscapwing'], ['下角差距 <1cm（下迴旋）', 'scapdownrot'], ['下角差距 >1cm（上迴旋）', 'scapuprot']]),
  T('ps_x_adam', '節段排列', 'Adam 前彎測試', '彎腰時觀察背部兩側是否有一側隆起（靈敏度極高）。', [['兩側對稱'], ['一側隆起', 'scoliosis thoracicrot']]),
  T('ps_x_lld', '節段排列', '長短腿', '仰臥比較內踝高度，再坐起比較：不變＝非骨盆引起；長腿更長＝長側骨盆後傾；長腿變短＝該側骨盆前傾。', [['等長'], ['功能性差異（坐起後改變）', 'fld pelvicrot'], ['坐起後不變（疑結構性，轉介）', 'fld']]),
  T('ps_x_hum', '節段排列', '上肢位置', '觀察手掌方向（掌心朝後＝內旋）、兩側尺骨鷹嘴是否一側外旋。', [['中立'], ['肱骨內旋', 'humir']]),
  T('ps_m_thomas', '肌肉長度', '托馬斯測試 Thomas Test', '仰臥抱一膝，另一腿是否能平放床面且膝屈約90°。', [['正常'], ['大腿抬離床面（髖屈肌緊）', 'tighthipflex'], ['膝伸直（股直肌緊）', 'tighthipflex']]),
  T('ps_m_slr', '肌肉長度', '被動直腿抬高 SLR', '仰臥被動抬直腿至約80°。', [['正常'], ['受限（膕繩肌緊）', 'tightham']]),
  T('ps_m_calf', '肌肉長度', '腓腸肌／比目魚肌長度', '膝伸直與屈膝下的踝背屈幅度。', [['正常'], ['受限', 'squatpattern']]),
  T('ps_m_shflex', '肌肉長度', '肩關節屈曲測試', '仰臥屈膝，手臂過頭是否能平放而腰不拱起。', [['正常'], ['受限（背闊肌／胸肌緊）', 'overhead']]),
  T('ps_m_shrot', '肌肉長度', '肩關節內旋／外旋測試', '仰臥肩外展90°，比較內外旋幅度。', [['正常'], ['外旋受限（前側緊）', 'humir roundshoulder'], ['內旋受限（後側緊）', 'overhead']]),
  T('ps_m_apley', '肌肉長度', 'Apley 摸背測試', '比較兩側手背摸背（下觸）與手過肩摸背（上觸）的距離。', [['正常且對稱'], ['受限或不對稱', 'overhead humir']]),
];
/* Polestar 動態＝15項體適能篩查（SCREENING_TESTS）；弱項（≤1分）對應以下問題 */
const SCREENING_ISSUE = {
  halfsquat: 'squatpattern', fullsquat: 'squatpattern', heelraise: 'anklecontrol', goalpost: 'overhead', longsit: 'tightham', hipabd: 'tightadd', zsit: 'hiprotation',
  rollup: 'flexcontrol', hundred: 'corecontrol', sidelift: 'lateralweak', pushup: 'scapstab', superman: 'extweak', proneflex: 'overhead', pressup: 'thoracicstiff', kneebend: 'tighthipflex',
};

/* ---------- 綜合：工作室實用版（靜態沿用原有側／正／後視圖並擴充；動態取兩體系最有代表性的測試） ---------- */
const INTEGRATED_STATIC = (() => {
  const extra = {
    side_head: [['中立（耳垂對準肩峰）'], ['前伸（耳垂落在肩峰前方）', 'fhp']],
    side_cervical: [['正常曲度'], ['過直（曲度過小）', 'militaryneck'], ['過度前凸（曲度過大）', 'cervlordosis']],
    side_knee: [['中立位（點在線上）'], ['過度伸展／超伸（點在線後）', 'recurvatum'], ['微屈（點在線前）', 'kneeflex']],
    side_ankle: [['中立位（約90度）'], ['蹠屈為主（大於90度）', 'recurvatum gait'], ['背屈為主（小於90度）', 'kneeflex gait']],
    front_foot: [['均勻承重'], ['內側承重偏多（足弓塌陷傾向）', 'flatfoot'], ['外側承重偏多（足弓過高傾向）', 'cavus']],
    front_ribcage: [['對稱'], ['肋骨外翻／外擴', 'ribflare'], ['一側旋轉', 'thoracicrot'], ['平移', 'lateralshift']],
  };
  const base = ASSESSMENT_TESTS.map(t => extra[t.id] ? { ...t, options: extra[t.id].map(([label, ids]) => ({ label, issueIds: ids ? ids.split(' ') : [] })) } : t);
  return [...base,
    T('ig_pelvicrot', '後視圖', '骨盆旋轉', '俯視比較兩側髂後上棘遠近。', [['無旋轉'], ['一側較近（旋轉）', 'pelvicrot']]),
    T('ig_femur', '正視圖', '股骨旋轉（髕骨方向）', '雙腳自然站立，髕骨是否朝正前方。', [['朝前'], ['髕骨朝內（股骨內旋）', 'femir'], ['髕骨朝外（股骨外旋）', 'femer']]),
    T('ig_scapelev', '後視圖', '肩胛高度', '肩胛岡內側緣與 T3 比較。', [['中立'], ['雙側上提（聳肩）', 'scapelev'], ['下沉', 'scapdep']]),
    T('ig_hum', '後視圖', '肱骨旋轉', '伸直手肘，鷹嘴突是否朝後。', [['中立'], ['內旋', 'humir']]),
  ];
})();
const INTEGRATED_DYNAMIC = [
  T('id_breath', '原則檢查', '三維呼吸（STOTT）', '手放肋骨兩側與後下方。', [['三維擴張'], ['胸式／聳肩呼吸', 'breathpattern']]),
  T('id_pelvis', '原則檢查', '骨盆穩定（STOTT：腿部滑動→抬腿→足尖輕點）', '記錄第一個失去中立位的層級。', [['全部穩定'], ['抬腿或足尖輕點失穩', 'corecontrol'], ['腿部滑動即失穩', 'corecontrol lowback']]),
  T('id_hundred', 'Polestar 篩查', '百次姿勢 Hundred Position', '抬頭肩與雙腳離地約2吋，腹直肌是否鼓起、腰椎能否保持屈曲。', [['良好'], ['腹直肌鼓起', 'corecontrol'], ['無法維持', 'corecontrol flexcontrol']]),
  T('id_rollup', 'Polestar 篩查', '捲起 Roll Up', '能否逐節捲起與放下。', [['完全逐節'], ['無法完全逐節', 'flexcontrol'], ['需改變方式', 'flexcontrol tightham']]),
  T('id_squat', 'Polestar 篩查', '半蹲 Half Squat', '髖膝踝排列、胸腰椎伸直、肩胛下沉。', [['良好'], ['膝蓋內扣', 'squatpattern valgum'], ['腰椎屈曲／腳跟離地', 'squatpattern']]),
  T('id_heel', 'Polestar 篩查', '單腳提踵 Heel Raise', '不扶手完成5次完整動作。', [['良好'], ['需扶手或少於5次', 'anklecontrol']]),
  T('id_arm', '原則檢查', '手臂上舉／Goal Post', '手臂過頭時肋骨架與脊椎是否保持中立。', [['良好'], ['肋骨外翻、腰拱', 'overhead ribflare'], ['手臂無法上舉到位', 'overhead']]),
  T('id_quad', 'Polestar 篩查', '四足跪姿／Push Up', '上肢負重時肩胛是否貼合、脊椎是否中立。', [['良好'], ['肩胛翹起或聳肩', 'scapstab staticscapwing'], ['腰塌', 'scapstab corecontrol']]),
  T('id_superman', 'Polestar 篩查', '超人式 Superman', '胸骨與大腿能否離地，肩胛不上提。', [['良好'], ['無法同時離地或肩胛上提', 'extweak']]),
  T('id_kneebend', 'Polestar 篩查', '俯臥屈膝 Prone Knee Bend', '能否抓腳並保持骨盆後傾。', [['良好'], ['抓不到腳或骨盆前傾', 'tighthipflex']]),
  T('id_longsit', 'Polestar 篩查', '長坐姿 Long Sit', '脊椎中立下能否伸直膝蓋。', [['良好'], ['腰椎變圓或膝蓋無法伸直', 'tightham']]),
  T('id_side', 'Polestar 篩查', '側撐抬腿 Side Lift', '肩胛穩定、髖部抬起並外展上腿3秒。', [['良好'], ['無法維持', 'lateralweak']]),
];

const ASSESSMENT_SYSTEMS = {
  integrated: { label: '綜合', sub: '工作室實用版：結合兩個體系最常用的觀察與測試', static: INTEGRATED_STATIC, dynamic: INTEGRATED_DYNAMIC,
    staticViews: ['側視圖', '正視圖', '後視圖'], dynamicNote: '動態部分取 STOTT 五大原則檢查與 Polestar 篩查中最具代表性的測試，適合首堂評估快速完成。' },
  stott: { label: 'STOTT', sub: '斯多特：體態分析指南檢查表（鉛垂線＋側／正／後視圖＋循序檢查脊椎）與五大原則功能檢查', static: STOTT_STATIC, dynamic: STOTT_DYNAMIC,
    staticViews: ['鉛垂線', '側視圖', '正視圖', '後視圖'], dynamicNote: 'STOTT 的「動態評估」在熱身中完成：以五大原則熱身時同步觀察呼吸、骨盆、肋骨架、肩胛與頭頸的控制。' },
  polestar: { label: 'Polestar', sub: '北極星：動力鏈5檢查點（足踝、膝、LPHC、肩、頭）＋節段排列＋肌肉長度測試，與15項體適能篩查', static: POLESTAR_STATIC, dynamic: null,
    staticViews: ['前面觀', '側面觀', '後面觀', '節段排列', '肌肉長度'], dynamicNote: 'Polestar 動態評估＝15項體適能篩查，每項0-3分，平均分決定程度，弱項對應功能問題。' },
};

/* STOTT 四種體態類型自動判斷（Kendall）：依側視圖結果 */
function classifyStottType(answers) {
  const opt = (id) => { const t = STOTT_STATIC.find(x => x.id === id); const i = answers[id]; return t && i !== undefined ? t.options[i].label : ''; };
  const pel = opt('ss_pelvis'), lum = opt('ss_lumbar'), lt = opt('ss_lthor'), ut = opt('ss_uthor'), plumb = opt('ss_plumb'), hip = opt('ss_hip');
  const kyph = lt.includes('過度屈曲') || ut.includes('過度屈曲');
  if (pel.includes('前傾') && lum.includes('過度伸展')) return kyph ? 'kl' : 'military';
  if (pel.includes('後傾') && (plumb.includes('凹背') || hip.includes('伸展')) && kyph) return 'swayback';
  if (pel.includes('後傾') && lum.includes('平直')) return 'flatbacktype';
  return null;
}
function analyzeTests(tests, answers) {
  const counts = {};
  tests.forEach(t => { const idx = answers[t.id]; if (idx === undefined || idx === null) return; (t.options[idx].issueIds || []).forEach(id => { counts[id] = (counts[id] || 0) + 1; }); });
  const detected = Object.entries(counts).filter(([id]) => ISSUES_MAP[id]).map(([id, count]) => ({ id, count, issue: ISSUES_MAP[id] })).sort((a, b) => b.count - a.count || a.issue.tier - b.issue.tier);
  return { detected, answeredCount: Object.keys(answers).filter(k => answers[k] !== undefined && answers[k] !== null).length, totalCount: tests.length };
}

/* 客人主訴（諮詢時勾選）：無法由靜態／動態測試觀察、但需納入規劃的問題 */
const COMPLAINTS = [
  { key: 'lowback', label: '下背痛（無放射）' }, { key: 'sciatica', label: '臀腿放射痛／梨狀肌緊' }, { key: 'postpartum', label: '產後修復／腹直肌分離' },
  { key: 'deskstiff', label: '久坐肩頸僵硬' }, { key: 'hallux', label: '拇指外翻' }, { key: 'zoa', label: '呼吸淺短' },
];
