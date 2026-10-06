/* ============================== 既有動作：訓練效果、所屬體系、可共用器械 ============================== */
const FX_EXISTING = {
  e1: 'C_breath S_core', e2: 'C_pelvis S_core M_hip', e3: 'C_scap S_scap L_neck', e4: 'M_throt S_obl',
  e5: 'S_flex S_core C_breath C_scap', e6: 'M_artic S_flex L_ham', e7: 'M_artic S_flex C_balance L_back', e8: 'S_flex S_obl C_pelvis',
  e9: 'S_flex C_integ C_pelvis', e10: 'S_flex L_ham S_obl C_pelvis', e11: 'S_flex C_pelvis', e12: 'M_artic L_back L_ham C_head',
  e13: 'M_lat L_ql L_lat', e14: 'M_throt L_ham L_back S_obl', e15: 'S_ext M_thext L_pec S_scap', e16: 'M_hip C_pelvis S_obl',
  e17: 'S_glmed M_hip C_pelvis S_side', e18: 'S_ext S_ham S_glmax L_pec', e19: 'S_side S_obl M_lat C_wb', e20: 'S_flex C_balance C_integ M_artic',
  e21: 'M_artic S_flex C_balance', e22: 'S_ext S_glmax C_pelvis C_integ', e133: 'S_flex M_artic L_ham', e134: 'S_flex C_pelvis',
  e135: 'S_ext M_thext S_glmax C_integ', e136: 'S_flex M_hip C_pelvis', e137: 'S_obl S_side M_throt C_wb', e138: 'S_serr S_core C_wb S_glmax',
  e139: 'S_flex M_artic C_integ', e140: 'S_flex L_ham C_balance', e141: 'S_flex M_artic C_integ C_balance', e142: 'S_ext L_hipflex L_quad M_thext L_pec',
  e143: 'S_arms S_serr C_wb M_artic S_core',
  p1: 'S_flex C_head S_neck', p2: 'S_core C_pelvis M_hip', p3: 'S_core C_pelvis M_hip S_iliop', p4: 'C_pelvis S_obl M_hip S_hipER',
  p5: 'S_obl M_throt L_back', p6: 'C_scap C_breath M_shoulder L_lat', p7: 'S_glmax S_ham M_artic C_pelvis', p8: 'S_core C_wb S_serr S_glmax C_integ',
  p9: 'M_throt L_pec C_head', p10: 'S_scap S_ext S_neck', p11: 'M_thext S_ext M_lumbext', p12: 'S_rc S_scap', p13: 'M_artic L_ham L_back',
  p14: 'M_throt S_obl', p15: 'S_ham S_ext L_quad L_hipflex', p16: 'S_obl S_flex', p17: 'S_glmax S_ham S_scap C_wb L_pec', p18: 'S_side S_glmed C_wb',
  p19: 'S_obl S_flex C_pelvis',
  e23: 'S_quad S_glmax C_align C_pelvis', e24: 'S_add S_hipER C_align', e25: 'S_calf S_foot S_quad C_align', e26: 'S_calf S_foot L_calf C_align',
  e27: 'S_flex S_core C_scap', e28: 'S_flex M_artic L_back', e29: 'S_obl M_lat S_side', e30: 'S_flex C_integ S_arms', e31: 'S_side S_glmed C_wb C_balance',
  e32: 'M_lat L_ql L_lat', e33: 'L_ham L_calf S_core C_wb', e34: 'S_core S_glmax C_wb S_flex', e35: 'S_calf L_calf S_foot C_align',
  e36: 'S_glmax S_ham C_pelvis', e37: 'S_add S_glmed C_balance C_align', e38: 'S_core S_serr C_wb S_arms', e39: 'S_arms C_scap S_core C_pelvis',
  e40: 'S_scap S_arms S_ext C_scap', e41: 'S_arms C_scap', e42: 'S_scap S_ext S_neck C_head', e43: 'C_scap S_rc M_shoulder', e44: 'S_add S_hipER S_glmax',
  e45: 'S_flex C_integ', e46: 'S_flex M_artic S_calf C_align', e111: 'M_thext M_artic S_glmax L_hipflex', e112: 'M_artic S_flex S_arms',
  e113: 'S_ext S_scap S_arms', e114: 'S_core L_ham L_calf C_wb', e115: 'S_glmax C_balance C_align S_quad', e116: 'M_hip S_add L_ham C_pelvis',
  p21: 'M_artic S_flex L_back L_ham', p22: 'L_hipflex L_quad S_core C_pelvis', p23: 'S_flex S_serr C_wb', p24: 'S_arms S_serr C_pelvis',
  p25: 'S_glmax M_artic S_ham', p26: 'L_hipflex L_quad C_pelvis', p27: 'M_lat L_ql S_obl', p28: 'S_glmax L_hipflex C_balance C_align',
  e47: 'M_artic S_flex L_back', e48: 'M_hip S_glmax S_add C_pelvis', e49: 'C_breath S_arms C_scap', e50: 'L_ham L_calf M_artic',
  e51: 'M_artic L_ham S_serr L_lat', e52: 'S_glmed S_add M_hip', e53: 'L_ham L_back L_lat', e54: 'S_flex S_arms M_artic',
  e55: 'S_quad S_glmax C_align', e56: 'M_shoulder C_scap S_arms', e57: 'S_glmax S_ham C_pelvis', e58: 'S_scap S_arms C_scap',
  e59: 'S_ext M_thext L_pec', e60: 'S_scap S_ext L_pec', e117: 'S_arms C_scap C_pelvis', e118: 'M_thext L_pec S_ext',
  e119: 'S_glmax S_ham M_artic S_flex', e120: 'S_flex S_glmax C_integ', e121: 'S_scap S_arms C_scap', e122: 'M_artic L_ham S_serr L_lat', e123: 'L_neck M_shoulder',
  e61: 'S_ext M_thext L_pec', e62: 'M_lat L_ql L_lat L_tfl', e63: 'S_glmax S_quad C_align C_balance', e64: 'M_hip C_pelvis S_obl', e65: 'S_flex C_integ',
  e66: 'M_thext L_pec L_abs', e67: 'M_lat L_ql', e68: 'S_glmed C_balance', e69: 'S_flex M_artic', e70: 'S_add S_glmax S_ext C_balance',
  e124: 'S_flex M_artic C_integ', e125: 'M_artic M_thext L_ham', e126: 'L_ham L_hipflex L_add M_hip', e127: 'S_side S_obl S_arms', e128: 'S_arms S_serr S_flex C_wb',
  e71: 'S_quad S_glmax S_calf C_align', e72: 'S_flex S_serr C_wb L_ham', e73: 'S_ext S_scap M_thext', e74: 'S_glmax S_quad C_balance C_align',
  e75: 'M_lat L_ql', e76: 'S_arms C_scap', e77: 'S_glmax S_quad C_balance C_align', e78: 'S_glmax S_quad C_balance C_align', e79: 'S_scap S_arms',
  e80: 'S_glmed C_balance C_align', e81: 'S_glmax C_balance C_wb', e82: 'S_quad S_glmax C_align', e129: 'M_lat L_ql S_side', e130: 'S_scap S_serr C_scap',
  e131: 'S_flex M_thext C_integ', e132: 'S_glmed S_add C_balance C_align',
  e83: 'M_hip S_glmax S_add C_pelvis', e84: 'M_artic S_flex L_back', e85: 'S_arms C_scap', e86: 'C_breath S_core', e87: 'S_glmax S_ham M_artic',
  e88: 'S_add S_hipER S_glmax', e89: 'S_scap S_arms', e90: 'S_glmed M_hip', e91: 'S_ext S_scap M_thext', e92: 'M_throt S_obl',
  e93: 'M_thext C_breath', e94: 'M_thext C_breath L_abs', e95: 'M_shoulder C_scap L_lat', e96: 'M_shoulder L_pec C_scap', e97: 'C_scap S_serr',
  e98: 'S_ext M_thext', e99: 'S_ext M_thext', e100: 'M_artic S_flex', e101: 'S_add S_hipER', e102: 'M_hip C_pelvis', e103: 'S_flex L_ham L_hipflex',
  e104: 'S_glmax S_ham S_ext', e105: 'S_glmax S_ham C_pelvis', e106: 'S_obl S_flex', e107: 'S_glmed S_add', e108: 'S_arms S_serr C_wb S_side',
  e109: 'S_ext S_glmax C_integ', e110: 'S_obl C_pelvis', e144: 'S_glmax S_ham S_ext', e145: 'S_flex C_balance', e146: 'S_flex M_artic L_ham',
  e147: 'S_ext S_scap S_neck', e148: 'S_serr C_wb S_core', e149: 'M_throt L_pec M_shoulder', e150: 'L_hipflex L_ham M_hip', e151: 'S_glmed',
};
const SYS_EXISTING = (() => {
  const both = 'e1 e5 e6 e7 e8 e9 e12 e13 e14 e15 e16 e17 e18 e20 e21 e22 e133 e135 e137 e138 e143 p1 p6 p7 p9 p14 p15 p17 p19 e23 e24 e25 e26 e27 e28 e29 e32 e33 e34 e35 e36 e37 e38 e39 e42 e45 e46 e111 e112 e113 e116 p21 p25 p24 e47 e48 e51 e52 e54 e118 e120 e122 e61 e62 e69 e70 e124 e125 e126 e127 e128 e71 e72 e73 e129 e130 e131 e132';
  const ps = 'e2 p2 p3 p4 p5 p8 p10 p11 p12 p13 p16 p18 p22 p23 p27 p28 e114 e115 e119 e121 e123 e50 e117 e57 e74 e77 e78 e76 e80';
  const stott = 'e3 e4 e10 e19 e30 e31 e40 e41 e44 e134 e136 e139 e140 e141 e142 p26 e49 e55 e56 e58 e59 e60 e64 e65 e66 e67 e68 e75 e79 e93 e94 e95 e96 e97 e98 e99 e100 e101 e102 e103 e104 e105 e106 e107 e108 e109 e110 e144 e145 e146 e147 e148 e149 e150 e151';
  const m = {};
  both.split(' ').forEach(id => { m[id] = 'STOTT+Polestar'; });
  ps.split(' ').forEach(id => { m[id] = 'Polestar'; });
  stott.split(' ').forEach(id => { m[id] = 'STOTT'; });
  return m;
})();
// 凱迪拉克的下捲木桿、推拉桿、手臂／腿部彈簧動作在半凱迪拉克（Tower）上同樣可以進行
const ALSO_EXISTING = {
  e47: 'halfcad', e48: 'halfcad', e49: 'halfcad', e51: 'halfcad', e52: 'halfcad', e56: 'halfcad', e57: 'halfcad', e58: 'halfcad', e117: 'halfcad', e121: 'halfcad', e122: 'halfcad',
  e83: 'tower', e84: 'tower', e85: 'tower', e86: 'tower', e87: 'tower', e88: 'tower', e89: 'tower', e90: 'tower', e91: 'tower', e92: 'tower',
};
