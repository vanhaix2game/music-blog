// ===== HỆ THỐNG NGUYÊN TỐ =====
const ELEMENTS = {
  fire:    { name: 'Hỏa', icon: '🔥', color: '#FF4400', desc: 'Sát thương cao, thiêu đốt kẻ địch' },
  ice:     { name: 'Băng', icon: '❄️', color: '#80DEEA', desc: 'Đóng băng, làm chậm, sát thương giảm' },
  wood:    { name: 'Mộc', icon: '🌿', color: '#66BB6A', desc: 'Bó chặt, triệu hồi cây tấn công' },
  water:   { name: 'Thủy', icon: '💧', color: '#00AAFF', desc: 'Hồi phục, buff đồng đội' },
  earth:   { name: 'Thổ', icon: '🪨', color: '#8B6914', desc: 'Phòng thủ cao, khống chế' },
  thunder: { name: 'Lôi', icon: '⚡', color: '#FFD700', desc: 'Choáng, sát thương diện rộng' },
  poison:  { name: 'Độc', icon: '☠️', color: '#9B59B6', desc: 'Trúng độc, giảm sát thương địch' },
  storm:   { name: 'Bão', icon: '🌪️', color: '#4DD0E1', desc: 'Lốc xoáy cuốn phăng, hút mục tiêu, sát thương diện rộng' }
};

// Tương quan nguyên tố: mạnh (1.5x), yếu (0.75x)
const ELEMENT_CHART = {
  fire:    { strong: ['ice', 'wood'], weak: ['water'] },
  ice:     { strong: ['wood', 'water', 'earth'], weak: ['fire'] },
  wood:    { strong: ['water', 'earth'], weak: ['fire', 'ice'] },
  water:   { strong: ['fire', 'earth'], weak: ['wood', 'ice'] },
  earth:   { strong: ['fire', 'thunder'], weak: ['wood', 'water'] },
  thunder: { strong: ['water', 'poison'], weak: ['earth'] },
  poison:  { strong: ['wood', 'water'], weak: ['thunder'] },
  storm:   { strong: ['fire', 'water'], weak: ['earth', 'ice'] }
};

function getElementAdvantage(atkElem, defElem) {
  const chart = ELEMENT_CHART[atkElem];
  if (!chart) return 1;
  if (chart.strong.includes(defElem)) return 1.5;
  if (chart.weak.includes(defElem)) return 0.75;
  return 1;
}

// ===== HIỆU ỨNG TRẠNG THÁI =====
const EFFECTS = {
  burn: {
    name: 'Thiêu đốt', icon: '🔥',
    dotPct: 0.08, atkReduction: 0, duration: 3, maxStacks: 3,
    desc: 'Mất 8% máu mỗi lượt'
  },
  freeze: {
    name: 'Đóng băng', icon: '❄️',
    canAct: false, duration: 1, maxStacks: 1,
    desc: 'Không thể hành động'
  },
  slow: {
    name: 'Làm chậm', icon: '🐢',
    spdMul: 0.5, atkReduction: 0.3, duration: 3, maxStacks: 1,
    desc: 'Tốc độ giảm 50%, sát thương giảm 30%'
  },
  poison: {
    name: 'Trúng độc', icon: '☠️',
    dotPct: 0.06, atkReduction: 0.15, duration: 4, maxStacks: 2,
    desc: 'Mất 6% máu mỗi lượt, sát thương giảm 15%'
  },
  stun: {
    name: 'Choáng', icon: '⚡',
    canAct: false, duration: 1, maxStacks: 1,
    desc: 'Mất lượt hoàn toàn'
  },
  root: {
    name: 'Bó chặt', icon: '🌿',
    spdMul: 0, duration: 2, maxStacks: 1,
    desc: 'Không thể di chuyển'
  },
  summon: {
    name: 'Triệu hồi', icon: '🌱',
    duration: 3, maxStacks: 1,
    dmgMul: 0.6,
    desc: 'Cây triệu hồi tấn công mỗi lượt'
  },
  knockback: {
    name: 'Đẩy lùi', icon: '💨',
    canAct: false, duration: 1, maxStacks: 1,
    desc: 'Bị đẩy lùi, không thể hành động'
  },
  shield: {
    name: 'Khiên băng', icon: '🛡️',
    dmgReduction: 0.4, duration: 3, maxStacks: 1,
    desc: 'Giảm 40% sát thương nhận vào'
  },
  vortex: {
    name: 'Lốc xoáy', icon: '🌪️',
    dotPct: 0.05, atkReduction: 0.2, spdMul: 0.3, duration: 3, maxStacks: 2,
    desc: 'Cuốn phăng mục tiêu, mất 5% máu mỗi lượt, giảm 20% sát thương, giảm 70% tốc độ'
  },
  searing_flame: {
    name: 'Tam Muội Chân Hỏa', icon: '🔥',
    dotPct: 0.12, atkReduction: 0.25, duration: 4, maxStacks: 3,
    desc: 'Ngọn lửa thần thánh thiêu rụi linh hồn, mất 12% máu mỗi lượt'
  },
  gravity: {
    name: 'Thiên hấp', icon: '🌀',
    spdMul: 0, atkReduction: 0.4, duration: 2, maxStacks: 1,
    desc: 'Bị hút vào lực hấp dẫn, không thể di chuyển, giảm 40% sát thương'
  },
  dragon_palm: {
    name: 'Hàng Long Thập Bát Chưởng', icon: '🐉',
    atkReduction: 0.1, duration: 1, maxStacks: 1,
    desc: 'Bị 18 chưởng đánh xuyên thủng, giảm phòng thủ'
  }
};

// ===== SKILL SHOP DATA =====
const SKILL_TIERS = [
  { id: 1, minLvl: 10, priceMul: 1 },
  { id: 2, minLvl: 30, priceMul: 2.5 },
  { id: 3, minLvl: 50, priceMul: 6 },
  { id: 4, minLvl: 70, priceMul: 15 }
];

function getSkillPrice(tier) { return Math.floor(200 * (SKILL_TIERS[tier - 1]?.priceMul || 1)); }
function getSkillReqLevel(tier) { return SKILL_TIERS[tier - 1]?.minLvl || 10; }

// ===== 30 KỸ NĂNG MỖI NGUYÊN TỐ =====
const ELEMENT_SKILLS = {
  // 🔥 HỎA — thiêu đốt, sát thương lớn
  fire: [
    { id:'f01', name:'Ném lửa',     cd:1, dmgMul:1.1,  effect:'burn', effectChance:0.3, type:'single', anim:'fireball',   desc:'Ném cầu lửa thiêu đốt mục tiêu' },
    { id:'f02', name:'Bốc cháy',    cd:2, dmgMul:0.8,  effect:'burn', effectChance:0.6, type:'single', anim:'flame',      desc:'Thiêu cháy da thịt kẻ thù' },
    { id:'f03', name:'Hỏa lao',     cd:1, dmgMul:1.3,  effect:'burn', effectChance:0.2, type:'single', anim:'fireball',   desc:'Phóng lao lửa xuyên thủng' },
    { id:'f04', name:'Lửa thiêu',   cd:2, dmgMul:1.4,  effect:'burn', effectChance:0.4, type:'single', anim:'flame',      desc:'Ngọn lửa dữ dội thiêu rụi' },
    { id:'f05', name:'Sóng nhiệt',  cd:2, dmgMul:1.0,  effect:'burn', effectChance:0.7, type:'aoe',    anim:'inferno',    desc:'Sóng nhiệt lan tỏa đốt cháy tất cả' },
    { id:'f06', name:'Vòng xoáy lửa',cd:3,dmgMul:1.6,  effect:'burn', effectChance:0.5, type:'aoe',    anim:'inferno',    desc:'Xoáy lửa cuốn phăng kẻ địch' },
    { id:'f07', name:'Đạn lửa',     cd:1, dmgMul:0.9,  effect:'burn', effectChance:0.25, type:'single', anim:'fireball',   desc:'Đạn lửa bắn nhanh liên tục' },
    { id:'f08', name:'Hỏa trụ',     cd:3, dmgMul:1.8,  effect:'burn', effectChance:0.5, type:'single', anim:'hellfire',   desc:'Cột lửa từ lòng đất phun trào' },
    { id:'f09', name:'Lửa xanh',    cd:2, dmgMul:1.2,  effect:'burn', effectChance:0.8, type:'single', anim:'flame',      desc:'Ngọn lửa xanh thiêu đốt tâm can' },
    { id:'f10', name:'Bùng cháy',   cd:3, dmgMul:0.7,  effect:'burn', effectChance:0.9, type:'aoe',    anim:'inferno',    desc:'Thiêu đốt toàn bộ chiến trường' },
    { id:'f11', name:'Hỏa cầu',     cd:2, dmgMul:1.5,  effect:'burn', effectChance:0.3, type:'single', anim:'fireball',   desc:'Quả cầu lửa khổng lồ nghiền nát' },
    { id:'f12', name:'Nham thạch',  cd:3, dmgMul:1.7,  effect:'burn', effectChance:0.4, type:'aoe',    anim:'hellfire',   desc:'Nham thạch nóng chảy bắn ra' },
    { id:'f13', name:'Hỏa diễm',    cd:2, dmgMul:1.1,  effect:'burn', effectChance:0.5, type:'single', anim:'flame',      desc:'Lưỡi lửa bỏng rát' },
    { id:'f14', name:'Dung nham',   cd:4, dmgMul:2.0,  effect:'burn', effectChance:0.6, type:'aoe',    anim:'hellfire',   desc:'Dung nham phủ kín chiến trường' },
    { id:'f15', name:'Phun lửa',    cd:1, dmgMul:0.8,  effect:'burn', effectChance:0.4, type:'aoe',    anim:'inferno',    desc:'Phun lửa vào tất cả kẻ địch' },
    { id:'f16', name:'Lửa ma trơi', cd:2, dmgMul:1.3,  effect:'burn', effectChance:0.35, type:'single', anim:'flame',      desc:'Ma trơi lửa đeo bám mục tiêu' },
    { id:'f17', name:'Hỏa hoàng',   cd:3, dmgMul:1.9,  effect:'burn', effectChance:0.7, type:'single', anim:'hellfire',   desc:'Hoàng hỏa thiêu đốt tất cả' },
    { id:'f18', name:'Choáy mạnh',  cd:2, dmgMul:1.6,  effect:'burn', effectChance:0.3, type:'single', anim:'flame',      desc:'Ngọn lửa mãnh liệt' },
    { id:'f19', name:'Bão lửa',     cd:4, dmgMul:0.9,  effect:'burn', effectChance:0.8, type:'aoe',    anim:'inferno',    desc:'Bão lửa quét sạch mọi thứ' },
    { id:'f20', name:'Thiên hỏa',   cd:4, dmgMul:2.4,  effect:'burn', effectChance:0.9, type:'aoe',    anim:'hellfire',   desc:'Thiên thạch lửa từ trời giáng xuống' },
    { id:'f21', name:'Hỏa xà',      cd:2, dmgMul:1.0,  effect:'burn', effectChance:0.5, type:'single', anim:'fireball',   desc:'Rắn lửa lao vào mục tiêu' },
    { id:'f22', name:'Mặt trời',    cd:5, dmgMul:2.8,  effect:'burn', effectChance:0.8, type:'aoe',    anim:'hellfire',   desc:'Sức nóng mặt trời thiêu rụi tất cả' },
    { id:'f23', name:'Hỏa khí',     cd:1, dmgMul:0.7,  effect:'burn', effectChance:0.45, type:'aoe',    anim:'flame',      desc:'Luồng khí nóng làm bỏng' },
    { id:'f24', name:'Lưỡi lửa',    cd:1, dmgMul:1.2,  effect:'burn', effectChance:0.2, type:'single', anim:'fireball',   desc:'Lưỡi kiếm lửa chém xé' },
    { id:'f25', name:'Hỏa vũ',      cd:3, dmgMul:0.6,  effect:'burn', effectChance:0.7, type:'aoe',    anim:'inferno',    desc:'Mưa lửa trút xuống đầu thù' },
    { id:'f26', name:'Cuồng hỏa',   cd:4, dmgMul:2.2,  effect:'burn', effectChance:0.6, type:'single', anim:'hellfire',   desc:'Cơn thịnh nộ của lửa' },
    { id:'f27', name:'Hỏa lao kép', cd:3, dmgMul:1.5,  effect:'burn', effectChance:0.4, type:'single', anim:'fireball',   desc:'Ba lao lửa bắn liên tiếp' },
    { id:'f28', name:'Thiêu đốt',   cd:2, dmgMul:0.6,  effect:'burn', effectChance:1.0, type:'single', anim:'flame',      desc:'Thiêu đốt chắc chắn gây bỏng' },
    { id:'f29', name:'Hỏa thần',    cd:5, dmgMul:3.0,  effect:'burn', effectChance:0.9, type:'aoe',    anim:'hellfire',   desc:'Thần lửa trỗi dậy hủy diệt muôn loài' },
    { id:'f30', name:'Địa ngục',    cd:6, dmgMul:3.5,  effect:'burn', effectChance:1.0, type:'aoe',    anim:'hellfire',   desc:'Địa ngục lửa nuốt chửng tất cả' },
    { id:'f31', name:'Cầu hỏa',     cd:4, dmgMul:1.8,  effect:'burn', effectChance:0.6, type:'aoe',    anim:'flame',      desc:'Triệu hồi cầu lửa xoay quanh pet, thiêu rụi kẻ địch xung quanh' },
    { id:'f32', name:'Tam Muội Chân Hỏa', cd:5, dmgMul:3.5, effect:'searing_flame', effectChance:0.9, type:'single', anim:'hellfire', desc:'Ngọn lửa thần thánh thiêu rụi linh hồn, 12% máu/turn' },
  ],

  // ❄️ BĂNG — đóng băng, làm chậm
  ice: [
    { id:'i01', name:'Băng phiến', cd:1, dmgMul:0.8,  effect:'slow',  effectChance:0.5, type:'single', anim:'ice_shard', desc:'Phiến băng làm chậm địch' },
    { id:'i02', name:'Đá băng',    cd:2, dmgMul:1.1,  effect:'freeze',effectChance:0.3, type:'single', anim:'ice_shard', desc:'Đá băng đóng băng mục tiêu' },
    { id:'i03', name:'Tuyết rơi',  cd:2, dmgMul:0.7,  effect:'slow',  effectChance:0.7, type:'aoe',    anim:'blizzard',  desc:'Tuyết rơi làm chậm tất cả' },
    { id:'i04', name:'Giá băng',   cd:1, dmgMul:0.9,  effect:'slow',  effectChance:0.4, type:'single', anim:'ice_shard', desc:'Mũi giáo băng đâm thủng' },
    { id:'i05', name:'Băng trần',  cd:3, dmgMul:1.3,  effect:'freeze',effectChance:0.5, type:'single', anim:'freeze',    desc:'Đóng băng hoàn toàn mục tiêu' },
    { id:'i06', name:'Phong hàn',  cd:1, dmgMul:0.6,  effect:'slow',  effectChance:0.6, type:'aoe',    anim:'blizzard',  desc:'Gió lạnh thấu xương' },
    { id:'i07', name:'Băng vũ',    cd:3, dmgMul:1.5,  effect:'freeze',effectChance:0.4, type:'aoe',    anim:'blizzard',  desc:'Mưa băng giá đóng băng tất cả' },
    { id:'i08', name:'Cột băng',   cd:2, dmgMul:1.2,  effect:'freeze',effectChance:0.3, type:'single', anim:'freeze',    desc:'Trụ băng lao lên từ đất' },
    { id:'i09', name:'Lạnh thấu',  cd:2, dmgMul:0.5,  effect:'slow',  effectChance:0.8, type:'single', anim:'ice_shard', desc:'Lạnh thấu xương, giảm mọi chỉ số' },
    { id:'i10', name:'Sương mù',   cd:2, dmgMul:0.4,  effect:'slow',  effectChance:0.9, type:'aoe',    anim:'blizzard',  desc:'Sương mù lạnh giá bao phủ' },
    { id:'i11', name:'Băng nhọn',  cd:1, dmgMul:1.0,  effect:'slow',  effectChance:0.3, type:'single', anim:'ice_shard', desc:'Những mũi băng nhọn hoắt' },
    { id:'i12', name:'Hàn băng',   cd:3, dmgMul:1.7,  effect:'freeze',effectChance:0.6, type:'single', anim:'freeze',    desc:'Hơi thở hàn băng đóng băng' },
    { id:'i13', name:'Tường băng', cd:2, dmgMul:0.3,  effect:'slow',  effectChance:0.5, type:'aoe',    anim:'defend',    desc:'Tường băng bảo vệ và cản địch' },
    { id:'i14', name:'Băng hà',    cd:4, dmgMul:2.0,  effect:'freeze',effectChance:0.7, type:'aoe',    anim:'blizzard',  desc:'Băng hà tràn về vùi lấp tất cả' },
    { id:'i15', name:'Băng tinh',  cd:1, dmgMul:1.1,  effect:'slow',  effectChance:0.3, type:'single', anim:'ice_shard', desc:'Tinh thể băng sắc nhọn' },
    { id:'i16', name:'Đài băng',   cd:3, dmgMul:1.8,  effect:'freeze',effectChance:0.5, type:'single', anim:'freeze',    desc:'Băng tích tụ lao vào mục tiêu' },
    { id:'i17', name:'Gió lạnh',   cd:1, dmgMul:0.5,  effect:'slow',  effectChance:0.7, type:'aoe',    anim:'blizzard',  desc:'Luồng gió bắc lạnh buốt' },
    { id:'i18', name:'Vụn băng',   cd:2, dmgMul:1.3,  effect:'slow',  effectChance:0.4, type:'aoe',    anim:'ice_shard', desc:'Vụn băng bắn xé không khí' },
    { id:'i19', name:'Đóng bức',   cd:2, dmgMul:0.6,  effect:'freeze',effectChance:0.35, type:'single', anim:'freeze',    desc:'Đóng băng mục tiêu tại chỗ' },
    { id:'i20', name:'Băng vĩnh',  cd:5, dmgMul:2.3,  effect:'freeze',effectChance:0.8, type:'aoe',    anim:'blizzard',  desc:'Băng vĩnh cửu đóng băng toàn bộ' },
    { id:'i21', name:'Tuyết lở',   cd:4, dmgMul:1.5,  effect:'freeze',effectChance:0.6, type:'aoe',    anim:'blizzard',  desc:'Tuyết lở chôn vùi kẻ thù' },
    { id:'i22', name:'Lưỡi băng',  cd:2, dmgMul:1.4,  effect:'slow',  effectChance:0.3, type:'single', anim:'ice_shard', desc:'Lưỡi kiếm băng cắt phá' },
    { id:'i23', name:'Sương muối', cd:1, dmgMul:0.3,  effect:'slow',  effectChance:0.8, type:'aoe',    anim:'blizzard',  desc:'Sương muối phủ chiến trường' },
    { id:'i24', name:'Băng trùng', cd:3, dmgMul:1.6,  effect:'freeze',effectChance:0.4, type:'single', anim:'freeze',    desc:'Băng trùng xâm nhập đóng băng' },
    { id:'i25', name:'Bắc cực',    cd:5, dmgMul:2.5,  effect:'freeze',effectChance:0.9, type:'aoe',    anim:'blizzard',  desc:'Sức mạnh bắc cực hủy diệt' },
    { id:'i26', name:'Tuyết nhọn', cd:2, dmgMul:0.8,  effect:'slow',  effectChance:0.6, type:'aoe',    anim:'ice_shard', desc:'Vô số tuyết nhọn bắn ra' },
    { id:'i27', name:'Băng địa',   cd:3, dmgMul:1.2,  effect:'freeze',effectChance:0.5, type:'aoe',    anim:'freeze',    desc:'Mặt đất đóng băng, cản trở địch' },
    { id:'i28', name:'Lạnh giá',   cd:1, dmgMul:0.4,  effect:'slow',  effectChance:1.0, type:'single', anim:'ice_shard', desc:'Luồng lạnh chắc chắn làm chậm' },
    { id:'i29', name:'Đại hồng',   cd:6, dmgMul:2.8,  effect:'freeze',effectChance:0.9, type:'aoe',    anim:'blizzard',  desc:'Đại hồng thủy băng giá' },
    { id:'i31', name:'Khiên băng',  cd:3, dmgMul:1.2,  effect:'shield',effectChance:1.0, type:'single', anim:'shield',    desc:'Đánh gần tạo khiên băng giảm 40% sát thương nhận vào trong 3 lượt' },
  ],

  // 🌿 MỘC — bó chặt, triệu hồi, độc
  wood: [
    { id:'w01', name:'Dây leo',      cd:1, dmgMul:0.9,  effect:'root',  effectChance:0.4, type:'single', anim:'vine',      desc:'Dây leo bó chặt mục tiêu' },
    { id:'w02', name:'Nảy mầm',      cd:2, dmgMul:0.5,  effect:'summon',effectChance:0.6, type:'single', anim:'summon',    desc:'Nảy mầm cây tấn công' },
    { id:'w03', name:'Gai nhọn',     cd:1, dmgMul:1.0,  effect:'root',  effectChance:0.3, type:'single', anim:'vine',      desc:'Gai mọc chặn đường địch' },
    { id:'w04', name:'Mọc rễ',       cd:2, dmgMul:0.4,  effect:'root',  effectChance:0.5, type:'aoe',    anim:'root',      desc:'Rễ cây lan ra bó chặt tất cả' },
    { id:'w05', name:'Chồi non',     cd:1, dmgMul:0.6,  healMul:0.2,   effect:'summon',effectChance:0.3, type:'heal',     anim:'heal',      desc:'Chồi non hồi phục và hỗ trợ' },
    { id:'w06', name:'Cây nấm',      cd:2, dmgMul:1.2,  effect:'poison',effectChance:0.4, type:'single', anim:'summon',    desc:'Bào tử nấm độc gây hại' },
    { id:'w07', name:'Lá sắc',       cd:1, dmgMul:0.8,  effect:'root',  effectChance:0.3, type:'aoe',    anim:'vine',      desc:'Lá cây sắc bén cắt địch' },
    { id:'w08', name:'Thân leo',     cd:2, dmgMul:1.1,  effect:'root',  effectChance:0.5, type:'single', anim:'root',      desc:'Dây thân leo trói buộc' },
    { id:'w09', name:'Hoa ăn thịt',  cd:3, dmgMul:1.5,  effect:'root',  effectChance:0.6, type:'single', anim:'summon',    desc:'Hoa ăn thịt nuốt chửng địch' },
    { id:'w10', name:'Bụi mật',      cd:2, dmgMul:0.3,  healMul:0.25,  effect:'summon',effectChance:0.4, type:'heal',     anim:'heal',      desc:'Phấn hoa hồi phục đồng đội' },
    { id:'w11', name:'Rêu phủ',      cd:1, dmgMul:0.5,  effect:'slow',  effectChance:0.6, type:'aoe',    anim:'root',      desc:'Rêu phủ làm chậm bước địch' },
    { id:'w12', name:'Thân gỗ',      cd:3, dmgMul:1.8,  effect:'root',  effectChance:0.5, type:'single', anim:'root',      desc:'Cây thân gỗ đập nát mục tiêu' },
    { id:'w13', name:'Quả nổ',       cd:2, dmgMul:1.3,  effect:'poison',effectChance:0.3, type:'aoe',    anim:'summon',    desc:'Quả cây phát nổ gây độc' },
    { id:'w14', name:'Rừng già',     cd:4, dmgMul:2.0,  effect:'root',  effectChance:0.7, type:'aoe',    anim:'ancientpower', desc:'Cây cổ thụ đổ xuống nghiền nát' },
    { id:'w15', name:'Dây tơ',       cd:1, dmgMul:0.4,  effect:'root',  effectChance:0.5, type:'single', anim:'vine',      desc:'Tơ cây bó chặt địch' },
    { id:'w16', name:'Hoa độc',      cd:2, dmgMul:1.1,  effect:'poison',effectChance:0.5, type:'single', anim:'poison',    desc:'Hoa độc phát tán khí độc' },
    { id:'w17', name:'Lá chắn',      cd:2, dmgMul:0.2,  defSelf:1.3,   effect:'root',  effectChance:0.3, type:'selfbuff', anim:'defend',    desc:'Lá cây tạo thành khiên' },
    { id:'w18', name:'Măng mọc',     cd:2, dmgMul:0.7,  healMul:0.15,  type:'heal',    anim:'heal',      desc:'Măng non mọc lên hồi máu' },
    { id:'w19', name:'Rừng tre',     cd:3, dmgMul:1.6,  effect:'root',  effectChance:0.5, type:'aoe',    anim:'ancientpower', desc:'Tre khổng lồ đâm thủng địch' },
    { id:'w20', name:'Mục nát',      cd:3, dmgMul:0.5,  effect:'poison',effectChance:0.9, type:'aoe',    anim:'curse',     desc:'Nấm mục phát tán độc khắp trận' },
    { id:'w21', name:'Bụi gai',      cd:1, dmgMul:0.6,  effect:'root',  effectChance:0.4, type:'aoe',    anim:'vine',      desc:'Bụi gai mọc làm đau địch' },
    { id:'w22', name:'Cây khổng lồ', cd:4, dmgMul:2.3,  effect:'root',  effectChance:0.6, type:'single', anim:'ancientpower', desc:'Cây khổng lồ đập bẹp mục tiêu' },
    { id:'w23', name:'Khí độc rừng', cd:2, dmgMul:0.8,  effect:'poison',effectChance:0.6, type:'aoe',    anim:'curse',     desc:'Khí độc rừng già bao phủ' },
    { id:'w24', name:'Nhựa cây',     cd:1, dmgMul:0.7,  healMul:0.1,   effect:'slow',  effectChance:0.4, type:'heal',     anim:'heal',      desc:'Nhựa cây hồi phục vết thương' },
    { id:'w25', name:'Hạt nảy',      cd:2, dmgMul:0.9,  effect:'summon',effectChance:0.5, type:'single', anim:'summon',    desc:'Hạt giống nảy mầm tấn công' },
    { id:'w26', name:'Thung lũng',   cd:4, dmgMul:2.5,  effect:'root',  effectChance:0.8, type:'aoe',    anim:'ancientpower', desc:'Cả thung lũng trỗi dậy' },
    { id:'w27', name:'Rễ hút máu',   cd:3, dmgMul:1.2,  healMul:0.2,   effect:'root',  effectChance:0.4, type:'single', anim:'drain',     desc:'Rễ hút máu hồi cho người dùng' },
    { id:'w28', name:'Lá độc',       cd:1, dmgMul:0.8,  effect:'poison',effectChance:0.5, type:'single', anim:'poison',    desc:'Lá tẩm độc ném vào địch' },
    { id:'w29', name:'Sinh sôi',     cd:5, dmgMul:0.4,  healMul:0.35,  effect:'summon',effectChance:0.7, type:'heal_all', anim:'holy',      desc:'Sức sống mãnh liệt hồi toàn đội' },
    { id:'w31', name:'Đẩy lùi',      cd:2, dmgMul:1.5,  effect:'knockback',effectChance:0.8, type:'single', anim:'vine',      desc:'Tấn công đẩy lùi kẻ địch ra xa, khiến chúng mất lượt' },
  ],

  // 💧 THỦY — hồi phục, buff, sát thương nước
  water: [
    { id:'a01', name:'Phun nước',    cd:1, dmgMul:0.8,  type:'single', anim:'water',     desc:'Tia nước áp lực cao' },
    { id:'a02', name:'Sóng vỗ',      cd:2, dmgMul:1.1,  type:'single', anim:'water',     desc:'Sóng biển vỗ vào mục tiêu' },
    { id:'a03', name:'Hồi thủy',     cd:2, healMul:0.2,  type:'heal',   anim:'heal',      desc:'Dòng nước hồi phục vết thương' },
    { id:'a04', name:'Sương mai',    cd:1, healMul:0.1,  type:'heal_all',anim:'heal',     desc:'Sương mai hồi nhẹ toàn đội' },
    { id:'a05', name:'Thủy quyển',   cd:3, dmgMul:0.5,  defUp:0.4,    type:'buff',     anim:'shield',    desc:'Màng nước bảo vệ toàn đội' },
    { id:'a06', name:'Sóng thần',    cd:3, dmgMul:1.3,  type:'aoe',    anim:'water',     desc:'Sóng thần cuốn trôi kẻ địch' },
    { id:'a07', name:'Mưa nhẹ',      cd:1, healMul:0.05, type:'heal_all',anim:'heal',     desc:'Mưa nhẹ hồi phục nhẹ' },
    { id:'a08', name:'Suối nguồn',   cd:3, healMul:0.35, type:'heal',   anim:'holy',      desc:'Nước suối hồi phục mạnh' },
    { id:'a09', name:'Băng nước',    cd:2, dmgMul:1.0,  effect:'slow', effectChance:0.4, type:'single', anim:'water',     desc:'Nước đóng băng làm chậm' },
    { id:'a10', name:'Thác đổ',      cd:3, dmgMul:1.5,  type:'single', anim:'water',     desc:'Thác nước đổ ập xuống đầu' },
    { id:'a11', name:'Giọt nước',    cd:1, dmgMul:0.5,  healMul:0.15, type:'heal',       anim:'heal',      desc:'Giọt nước hồi máu đồng đội' },
    { id:'a12', name:'Lốc nước',     cd:3, dmgMul:1.4,  type:'aoe',    anim:'water',     desc:'Vòng xoáy nước cuốn phăng' },
    { id:'a13', name:'Nước tăng lực',cd:2, healMul:0.15, defUp:0.2,   type:'buff',     anim:'shield',    desc:'Nước tăng lực, tăng phòng thủ' },
    { id:'a14', name:'Lụt',          cd:4, dmgMul:1.8,  type:'aoe',    anim:'water',     desc:'Lũ lụt quét sạch chiến trường' },
    { id:'a15', name:'Ao lành',      cd:2, healMul:0.25, type:'heal',   anim:'heal',      desc:'Ao nước lành hồi phục' },
    { id:'a16', name:'Sương giá',    cd:2, dmgMul:0.6,  effect:'slow', effectChance:0.5, type:'aoe',    anim:'blizzard',  desc:'Sương giá làm chậm toàn bộ' },
    { id:'a17', name:'Tắm mát',      cd:1, healMul:0.08, type:'heal',   anim:'heal',      desc:'Dòng nước mát xoa dịu' },
    { id:'a18', name:'Phong ba',     cd:4, dmgMul:2.0,  type:'single', anim:'water',     desc:'Bão biển giận dữ' },
    { id:'a19', name:'Dòng chảy',    cd:2, dmgMul:0.7,  healMul:0.1,  type:'single',    anim:'water',     desc:'Dòng chảy vừa tấn công vừa hồi' },
    { id:'a20', name:'Đại dương',    cd:5, dmgMul:2.5,  type:'aoe',    anim:'water',     desc:'Sức mạnh đại dương nhấn chìm' },
    { id:'a21', name:'Cơn mưa',      cd:2, dmgMul:0.3,  healMul:0.15, type:'heal_all', anim:'heal',     desc:'Cơn mưa hồi máu toàn đội' },
    { id:'a22', name:'Thủy tinh',    cd:3, dmgMul:1.6,  type:'single', anim:'water',     desc:'Thủy tinh thể bắn xuyên thủng' },
    { id:'a23', name:'Bọt biển',     cd:1, dmgMul:0.4,  healMul:0.06, type:'aoe',       anim:'water',     desc:'Bọt biển nhẹ nhàng tấn công' },
    { id:'a24', name:'Suối trường',  cd:4, healMul:0.5,  type:'heal',   anim:'holy',      desc:'Dòng suối trường sinh' },
    { id:'a25', name:'Sóng dội',     cd:2, dmgMul:1.2,  defUp:0.15,   type:'single',    anim:'water',     desc:'Sóng dội tăng phòng thủ' },
    { id:'a26', name:'Bình nguyên',  cd:4, dmgMul:0.4,  healMul:0.3,  type:'heal_all',  anim:'holy',      desc:'Bình nguyên nước hồi toàn đội' },
    { id:'a27', name:'Rạn nước',     cd:2, dmgMul:0.9,  type:'aoe',    anim:'water',     desc:'Các tia nước bắn ra xung quanh' },
    { id:'a28', name:'Biển sâu',     cd:5, dmgMul:2.2,  effect:'slow', effectChance:0.6, type:'aoe',    anim:'water',     desc:'Áp lực biển sâu nghiền nát' },
    { id:'a29', name:'Bão tố',       cd:6, dmgMul:3.0,  type:'aoe',    anim:'water',     desc:'Cơn bão hủy diệt tràn qua' },
    { id:'a30', name:'Thủy thần',    cd:7, dmgMul:3.5,  healMul:0.4,  type:'aoe',       anim:'holy',      desc:'Thủy thần nổi giận vừa hồi vừa đánh' },
  ],

  // 🪨 THỔ — phòng thủ, đất đá, khống chế
  earth: [
    { id:'e01', name:'Ném đá',       cd:1, dmgMul:1.0,  type:'single', anim:'slam',      desc:'Tảng đá ném vỡ mặt địch' },
    { id:'e02', name:'Đất sét',      cd:2, dmgMul:0.6,  defSelf:1.2,  type:'selfbuff', anim:'defend',    desc:'Lớp đất sét bảo vệ cơ thể' },
    { id:'e03', name:'Địa chấn',     cd:3, dmgMul:1.4,  type:'aoe',    anim:'earthquake', desc:'Rung chuyển mặt đất' },
    { id:'e04', name:'Đá lở',        cd:2, dmgMul:1.2,  type:'single', anim:'slam',      desc:'Đá lở chôn vùi mục tiêu' },
    { id:'e05', name:'Tường đất',    cd:2, defSelf:1.6,  type:'selfbuff', anim:'defend', desc:'Tường đất bảo vệ bản thân' },
    { id:'e06', name:'Núi đá',       cd:3, dmgMul:1.7,  type:'single', anim:'slam',      desc:'Cả ngọn núi đè lên địch' },
    { id:'e07', name:'Cát lún',      cd:2, dmgMul:0.5,  effect:'root', effectChance:0.5, type:'aoe',    anim:'slam',      desc:'Cát lún bó chặt kẻ thù' },
    { id:'e08', name:'Kiên cố',      cd:1, defSelf:1.1,  type:'selfbuff', anim:'defend', desc:'Da hóa đá kiên cố' },
    { id:'e09', name:'Đá mưa',       cd:3, dmgMul:1.3,  type:'aoe',    anim:'earthquake', desc:'Đá rơi như mưa xuống đầu thù' },
    { id:'e10', name:'Hang tối',     cd:2, dmgMul:0.8,  effect:'stun', effectChance:0.3, type:'single', anim:'slam',      desc:'Bóng tối từ hang nuốt chửng' },
    { id:'e11', name:'Bàn thạch',    cd:1, dmgMul:1.1,  type:'single', anim:'slam',      desc:'Khối thạch bản cứng như đá' },
    { id:'e12', name:'Phòng thủ',    cd:1, defSelf:0.8,  taunt:true,   type:'taunt',    anim:'defend',    desc:'Khiêu khích hút đòn cho đồng đội' },
    { id:'e13', name:'Động đất',     cd:4, dmgMul:2.0,  effect:'root', effectChance:0.5, type:'aoe',    anim:'earthquake', desc:'Động đất dữ dội' },
    { id:'e14', name:'Mỏm đá',       cd:2, dmgMul:1.3,  type:'single', anim:'slam',      desc:'Mỏm đá sắc nhọn bắn ra' },
    { id:'e15', name:'Vách đá',      cd:3, defUp:0.5,   type:'buff',   anim:'shield',    desc:'Vách đá bảo vệ đồng đội' },
    { id:'e16', name:'Sa mạc',       cd:3, dmgMul:1.6,  effect:'slow', effectChance:0.6, type:'aoe',    anim:'earthquake', desc:'Bão cát mù mịt làm chậm địch' },
    { id:'e17', name:'Đá quý',       cd:1, dmgMul:0.7,  healMul:0.1,  type:'single',    anim:'slam',      desc:'Đá quý vừa đánh vừa hồi phục' },
    { id:'e18', name:'Rạn nứt',      cd:3, dmgMul:1.8,  type:'single', anim:'earthquake', desc:'Mặt đất nứt ra nuốt địch' },
    { id:'e19', name:'Lở đất',       cd:4, dmgMul:2.2,  effect:'root', effectChance:0.6, type:'aoe',    anim:'earthquake', desc:'Lở đất vùi lấp tất cả' },
    { id:'e20', name:'Sỏi nhọn',     cd:1, dmgMul:0.9,  type:'aoe',    anim:'slam',      desc:'Sỏi nhọn bắn ra xung quanh' },
    { id:'e21', name:'Núi lửa',      cd:5, dmgMul:2.5,  effect:'burn', effectChance:0.5, type:'aoe',    anim:'hellfire',   desc:'Núi lửa thổ phun trào' },
    { id:'e22', name:'Đá tảng',      cd:2, dmgMul:1.5,  type:'single', anim:'slam',      desc:'Đá tảng khổng lồ ném vào địch' },
    { id:'e23', name:'Hố sâu',       cd:2, dmgMul:0.4,  effect:'root', effectChance:0.6, type:'aoe',    anim:'earthquake', desc:'Hố sâu nuốt chửng bước chân địch' },
    { id:'e24', name:'Khiên kiên',   cd:1, defSelf:0.6,  type:'selfbuff', anim:'defend', desc:'Khiên đá bảo vệ bản thân' },
    { id:'e25', name:'Địa mạch',     cd:4, dmgMul:2.3,  effect:'stun', effectChance:0.4, type:'aoe',    anim:'earthquake', desc:'Năng lượng lòng đất gây choáng' },
    { id:'e26', name:'Cồn cát',      cd:2, dmgMul:0.5,  defUp:0.3,    type:'buff',     anim:'shield',    desc:'Cát tạo khiên bảo vệ toàn đội' },
    { id:'e27', name:'Đá muối',      cd:2, dmgMul:0.6,  healMul:0.2,  type:'heal',     anim:'heal',      desc:'Khoáng chất từ đá hồi phục' },
    { id:'e28', name:'Kết tinh',     cd:3, dmgMul:0.3,  defSelf:2.0,  type:'selfbuff', anim:'defend',    desc:'Kết tinh đá tăng gấp đôi phòng thủ' },
    { id:'e29', name:'Địa huyệt',    cd:5, dmgMul:2.8,  effect:'root', effectChance:0.7, type:'aoe',    anim:'earthquake', desc:'Địa huyệt nuốt gọn tất cả' },
    { id:'e30', name:'Thổ thần',     cd:7, dmgMul:3.5,  defSelf:1.5,  effect:'stun', effectChance:0.5, type:'aoe',    anim:'earthquake', desc:'Thổ thần nổi dậy vừa đánh vừa thủ' },
    { id:'e31', name:'Hàng Long Thập Bát Chưởng', cd:5, dmgMul:2.8,  effect:'dragon_palm',effectChance:0.7, type:'single', anim:'dragon_palm', multiHit:3, desc:'18 chưởng đánh xuyên thủng phòng thủ, sát thương cực mạnh' },
    { id:'e32', name:'Chibaku Tensei', cd:6, dmgMul:3.8,  effect:'gravity',effectChance:0.8, type:'aoe',    anim:'void',      desc:'Thiên hấp hủy diệt - nghiền nát tất cả kẻ địch trong lực hấp dẫn' },
  ],

  // ⚡ LÔI — choáng, sát thương diện rộng, tốc độ
  thunder: [
    { id:'l01', name:'Tia sét',      cd:1, dmgMul:1.1,  effect:'stun', effectChance:0.15, type:'single', anim:'thunder',   desc:'Sét đánh gây choáng' },
    { id:'l02', name:'Sấm dậy',      cd:2, dmgMul:1.3,  effect:'stun', effectChance:0.2,  type:'single', anim:'thunder',   desc:'Tiếng sấm làm chóa mắt' },
    { id:'l03', name:'Sét đánh',     cd:2, dmgMul:1.4,  effect:'stun', effectChance:0.2,  type:'aoe',    anim:'thunder',   desc:'Sét đánh xuống toàn bộ khu vực' },
    { id:'l04', name:'Điện giật',    cd:1, dmgMul:0.9,  effect:'stun', effectChance:0.1,  type:'single', anim:'thunder',   desc:'Dòng điện giật tê liệt' },
    { id:'l05', name:'Sét đôi',      cd:3, dmgMul:1.6,  effect:'stun', effectChance:0.25, type:'single', anim:'thunder',   desc:'Hai luồng sét đánh liên tiếp' },
    { id:'l06', name:'Bão sấm',      cd:3, dmgMul:0.8,  effect:'stun', effectChance:0.35, type:'aoe',    anim:'thunder',   desc:'Bão sấm sét bao phủ chiến trường' },
    { id:'l07', name:'Dòng điện',    cd:1, dmgMul:1.2,  effect:'stun', effectChance:0.1,  type:'single', anim:'thunder',   desc:'Dòng điện mạnh xuyên thủng' },
    { id:'l08', name:'Chớp giật',    cd:2, dmgMul:1.5,  effect:'stun', effectChance:0.2,  type:'single', anim:'celestial', desc:'Tia chớp từ trên trời giáng xuống' },
    { id:'l09', name:'Giông bão',    cd:4, dmgMul:1.0,  effect:'stun', effectChance:0.4,  type:'aoe',    anim:'thunder',   desc:'Giông bão sấm chớp dữ dội' },
    { id:'l10', name:'Điện trường',  cd:2, defUp:0.3,   effect:'stun', effectChance:0.2,  type:'buff',   anim:'shield',    desc:'Trường điện bảo vệ đồng đội' },
    { id:'l11', name:'Tốc độ',       cd:1, dmgMul:0.3,  defUp:0.5,    type:'buff',       anim:'shield',    desc:'Năng lượng sét kích thích phòng thủ' },
    { id:'l12', name:'Sét đánh dồn', cd:3, dmgMul:1.8,  effect:'stun', effectChance:0.3,  type:'single', anim:'celestial', desc:'Sét đánh liên hồi vào mục tiêu' },
    { id:'l13', name:'Lôi hồi',      cd:2, dmgMul:0.5,  healMul:0.15, type:'heal',        anim:'heal',      desc:'Lôi quang làm hồi phục đồng đội' },
    { id:'l14', name:'Tĩnh điện',    cd:2, dmgMul:0.7,  effect:'stun', effectChance:0.4,  type:'aoe',    anim:'thunder',   desc:'Tĩnh điện gây tê tất cả' },
    { id:'l15', name:'Sét xiên',     cd:2, dmgMul:1.6,  effect:'stun', effectChance:0.2,  type:'single', anim:'celestial', desc:'Sét xuyên thủng mọi phòng thủ' },
    { id:'l16', name:'Lôi vũ',       cd:3, dmgMul:0.6,  effect:'stun', effectChance:0.5,  type:'aoe',    anim:'thunder',   desc:'Mưa sét giáng xuống khắp nơi' },
    { id:'l17', name:'Phóng điện',   cd:1, dmgMul:1.0,  effect:'stun', effectChance:0.12, type:'single', anim:'thunder',   desc:'Phóng điện gây tê nhẹ' },
    { id:'l18', name:'Sấm chớp',     cd:3, dmgMul:2.0,  effect:'stun', effectChance:0.3,  type:'single', anim:'celestial', desc:'Sấm chớp gây sát thương lớn' },
    { id:'l19', name:'Lôi vương',    cd:4, dmgMul:2.3,  effect:'stun', effectChance:0.35, type:'aoe',    anim:'celestial', desc:'Vua sét giáng trần' },
    { id:'l20', name:'Điện xoáy',    cd:2, dmgMul:1.2,  effect:'stun', effectChance:0.25, type:'aoe',    anim:'thunder',   desc:'Xoáy điện cuốn phăng' },
    { id:'l21', name:'Sét ấm',       cd:2, dmgMul:0.4,  healMul:0.2,  type:'heal_all',   anim:'holy',      desc:'Dòng điện ấm hồi máu toàn đội' },
    { id:'l22', name:'Lôi thần',     cd:5, dmgMul:2.8,  effect:'stun', effectChance:0.5,  type:'aoe',    anim:'celestial', desc:'Sức mạnh lôi thần quét sạch' },
    { id:'l23', name:'Nháy mắt',     cd:1, dmgMul:0.6,  effect:'stun', effectChance:0.3,  type:'single', anim:'thunder',   desc:'Chớp nhoáng gây choáng nhanh' },
    { id:'l24', name:'Trường từ',    cd:3, dmgMul:0.4,  defUp:0.6,    type:'buff',       anim:'shield',    desc:'Trường điện từ bảo vệ toàn đội' },
    { id:'l25', name:'Hồ quang',     cd:3, dmgMul:1.9,  effect:'stun', effectChance:0.3,  type:'single', anim:'celestial', desc:'Hồ quang điện cháy xuyên' },
    { id:'l26', name:'Sét lan',      cd:2, dmgMul:1.1,  effect:'stun', effectChance:0.3,  type:'aoe',    anim:'thunder',   desc:'Sét lan truyền qua nước' },
    { id:'l27', name:'Sấm động',     cd:3, dmgMul:0.5,  effect:'stun', effectChance:0.6,  type:'aoe',    anim:'thunder',   desc:'Tiếng sấm động làm ai cũng choáng' },
    { id:'l28', name:'Thiên lôi',    cd:5, dmgMul:3.0,  effect:'stun', effectChance:0.6,  type:'single', anim:'celestial', desc:'Thiên lôi giáng xuống mục tiêu' },
    { id:'l29', name:'Lôi đình',     cd:6, dmgMul:2.5,  effect:'stun', effectChance:0.7,  type:'aoe',    anim:'celestial', desc:'Lôi đình nổ tung trên chiến trường' },
    { id:'l31', name:'Tốc biến',     cd:3, dmgMul:2.2,  effect:'stun', effectChance:0.9,  type:'single', anim:'celestial', desc:'Phóng điện với tốc độ cực nhanh đến mục tiêu, gây choáng chắc chắn' },
    { id:'l32', name:'Sấm Sét Tiên Phong', cd:5, dmgMul:3.0,  effect:'stun', effectChance:0.8, type:'single', anim:'thunder',   desc:'Tiên phong sấm sét giáng xuống mục tiêu, choáng 80%, sát thương cực lớn' },
    // === 10 skill tấn công thuần, hiệu ứng độc đáo ===
    { id:'l33', name:'Lôi trảm',      cd:2, dmgMul:1.8,  type:'single', anim:'thunder_slash',     desc:'Lưỡi kiếm sét chém xuyên kẻ địch' },
    { id:'l34', name:'Sét nổ tung',   cd:3, dmgMul:1.6,  type:'aoe',    anim:'thunder_burst',     desc:'Quả cầu điện nổ tung gây sát thương diện rộng' },
    { id:'l35', name:'Lôi quang pháo', cd:3, dmgMul:2.4,  type:'single', anim:'thunder_beam',      desc:'Chùm tia lôi quang công phá mục tiêu' },
    { id:'l36', name:'Sóng điện từ',  cd:2, dmgMul:1.2,  type:'aoe',    anim:'electric_wave',     desc:'Sóng điện từ quét ngang chiến trường' },
    { id:'l37', name:'Dao lôi',       cd:1, dmgMul:1.4,  type:'single', anim:'lightning_blade',   desc:'Dao găm sét đâm thủng phòng thủ' },
    { id:'l38', name:'Song tia chớp', cd:2, dmgMul:1.0,  multiHit:2,    type:'single', anim:'twin_sparks',      desc:'Hai tia chớp đánh liên tiếp' },
    { id:'l39', name:'Lôi chuỳ đập',  cd:4, dmgMul:2.6,  type:'single', anim:'thunder_hammer',    desc:'Cây chuỳ lôi đập nát kẻ địch' },
    { id:'l40', name:'Xích điện',     cd:3, dmgMul:1.3,  type:'aoe',    anim:'lightning_chain',   desc:'Dây xích điện lan truyền giữa kẻ địch' },
    { id:'l41', name:'Trụ lôi giáng', cd:5, dmgMul:3.2,  type:'single', anim:'lightning_pillar',  desc:'Trụ sét từ trời giáng xuống thiêu rụi mục tiêu' },
    { id:'l42', name:'Bão điện cuồng', cd:6, dmgMul:2.0,  type:'aoe',    anim:'electric_storm',    desc:'Cơn bão điện quét sạch toàn bộ kẻ địch' },
  ],

  // ☠️ ĐỘC — trúng độc, giảm sức mạnh, debuff
  poison: [
    { id:'p01', name:'Nọc độc',      cd:1, dmgMul:0.8,  effect:'poison',effectChance:0.5, type:'single', anim:'poison',    desc:'Tiêm nọc độc vào địch' },
    { id:'p02', name:'Khí độc',      cd:2, dmgMul:0.6,  effect:'poison',effectChance:0.7, type:'aoe',    anim:'curse',     desc:'Phát tán khí độc ra xung quanh' },
    { id:'p03', name:'Vết thương',   cd:1, dmgMul:0.9,  effect:'poison',effectChance:0.4, type:'single', anim:'poison',    desc:'Vết cắn gây nhiễm độc' },
    { id:'p04', name:'Độc địa',      cd:2, dmgMul:0.5,  effect:'poison',effectChance:0.8, type:'aoe',    anim:'curse',     desc:'Mặt đất nhiễm độc' },
    { id:'p05', name:'Giảm sức',     cd:2, dmgMul:0.4,  effect:'poison',effectChance:0.6, type:'single', anim:'curse',     desc:'Độc tố làm suy yếu' },
    { id:'p06', name:'Bào tử',       cd:2, dmgMul:0.7,  effect:'poison',effectChance:0.6, type:'aoe',    anim:'curse',     desc:'Bào tử nấm độc bay khắp trận' },
    { id:'p07', name:'Nọc rắn',      cd:1, dmgMul:1.0,  effect:'poison',effectChance:0.4, type:'single', anim:'poison',    desc:'Nọc rắn hổ chết người' },
    { id:'p08', name:'Phân hủy',     cd:3, dmgMul:1.2,  effect:'poison',effectChance:0.7, type:'single', anim:'poison',    desc:'A xít phân hủy địch' },
    { id:'p09', name:'Tê liệt',      cd:2, dmgMul:0.3,  effect:'stun',  effectChance:0.3, type:'single', anim:'poison',    desc:'Độc thần kinh tê liệt' },
    { id:'p10', name:'Khói mù',      cd:2, dmgMul:0.4,  effect:'poison',effectChance:0.8, type:'aoe',    anim:'curse',     desc:'Khói độc bao phủ' },
    { id:'p11', name:'Dao độc',      cd:1, dmgMul:1.1,  effect:'poison',effectChance:0.3, type:'single', anim:'poison',    desc:'Lưỡi dao tẩm độc' },
    { id:'p12', name:'Mưa độc',      cd:3, dmgMul:0.8,  effect:'poison',effectChance:0.8, type:'aoe',    anim:'curse',     desc:'Cơn mưa a xít' },
    { id:'p13', name:'Bùa chú',      cd:3, dmgMul:1.3,  effect:'poison',effectChance:0.5, type:'single', anim:'poison',    desc:'Lời nguyền độc' },
    { id:'p14', name:'Hút máu',       cd:2, dmgMul:0.8,  healMul:0.2,  effect:'poison',effectChance:0.3, type:'single', anim:'drain',     desc:'Hút máu gây độc hồi lại' },
    { id:'p15', name:'Tối tăm',      cd:2, dmgMul:0.5,  effect:'stun',  effectChance:0.25, type:'single', anim:'curse',     desc:'Bóng tối độc hại làm mù' },
    { id:'p16', name:'Độc tố',       cd:1, dmgMul:0.6,  effect:'poison',effectChance:0.6, type:'single', anim:'poison',    desc:'Chất độc tấn công' },
    { id:'p17', name:'Lũ độc',       cd:4, dmgMul:1.5,  effect:'poison',effectChance:0.8, type:'aoe',    anim:'curse',     desc:'Lũ độc tràn ngập chiến trường' },
    { id:'p18', name:'Cắn rứt',      cd:2, dmgMul:1.0,  effect:'poison',effectChance:0.5, type:'single', anim:'poison',    desc:'Độc ăn da thịt địch' },
    { id:'p19', name:'Tuyến độc',    cd:3, dmgMul:1.4,  effect:'poison',effectChance:0.6, type:'single', anim:'poison',    desc:'Nọc từ tuyến độc đặc biệt' },
    { id:'p20', name:'Dịch hại',     cd:3, dmgMul:0.6,  effect:'poison',effectChance:0.9, type:'aoe',    anim:'curse',     desc:'Dịch bệnh lây lan' },
    { id:'p21', name:'Vũ khí độc',   cd:1, dmgMul:1.2,  effect:'poison',effectChance:0.3, type:'single', anim:'poison',    desc:'Vũ khí tẩm độc gây sát thương cao' },
    { id:'p22', name:'Hỗn độn',      cd:3, dmgMul:0.9,  effect:'poison',effectChance:0.7, type:'aoe',    anim:'curse',     desc:'Hỗn loạn, độc dược phát tán' },
    { id:'p23', name:'Lưỡi độc',     cd:2, dmgMul:1.1,  effect:'poison',effectChance:0.5, type:'single', anim:'poison',    desc:'Lưỡi kiếm tẩm độc' },
    { id:'p24', name:'Độc mờ',       cd:1, dmgMul:0.3,  effect:'poison',effectChance:0.7, type:'single', anim:'poison',    desc:'Độc mờ ảo khó tránh' },
    { id:'p25', name:'Sương độc',    cd:2, dmgMul:0.4,  effect:'poison',effectChance:0.8, type:'aoe',    anim:'curse',     desc:'Sương độc phủ trắng trận' },
    { id:'p26', name:'Độc mạnh',     cd:3, dmgMul:1.6,  effect:'poison',effectChance:0.5, type:'single', anim:'poison',    desc:'Nọc độc cô đặc cực mạnh' },
    { id:'p27', name:'Truyền độc',   cd:2, dmgMul:0.5,  effect:'poison',effectChance:0.6, type:'aoe',    anim:'curse',     desc:'Lây độc sang kẻ lân cận' },
    { id:'p28', name:'Cơn ác mộng',  cd:4, dmgMul:2.0,  effect:'poison',effectChance:0.7, type:'single', anim:'void',      desc:'Acid dữ dội ăn mòn mục tiêu' },
    { id:'p29', name:'Đại dịch',     cd:5, dmgMul:1.8,  effect:'poison',effectChance:0.9, type:'aoe',    anim:'void',      desc:'Đại dịch quét sạch toàn bộ' },
    { id:'p30', name:'Độc vương',    cd:7, dmgMul:3.0,  effect:'poison',effectChance:1.0, type:'aoe',    anim:'void',      desc:'Độc vương hủy diệt mọi sinh vật' },
    { id:'p31', name:'Bẫy Độc',      cd:4, dmgMul:2.2,  effect:'poison',effectChance:0.9, type:'aoe',    anim:'poison_web',desc:'Đặt bẫy độc khắp chiến trường, gây độc 90%, mỗi lượt mất thêm 6% máu' },
  ],

  // 🌪️ BÃO — lốc xoáy, hút, đẩy lùi, sát thương gió
  storm: [
    { id:'s01', name:'Gió thổi',     cd:1, dmgMul:0.9,  effect:'vortex',effectChance:0.3, type:'single', anim:'storm',     desc:'Luồng gió mạnh hất văng địch' },
    { id:'s02', name:'Lốc nhỏ',      cd:2, dmgMul:1.1,  effect:'vortex',effectChance:0.4, type:'single', anim:'tornado',   desc:'Vòi rồng nhỏ cuốn mục tiêu' },
    { id:'s03', name:'Bão cát',      cd:2, dmgMul:0.7,  effect:'vortex',effectChance:0.5, type:'aoe',    anim:'sandstorm', desc:'Bão cát làm mù toàn bộ kẻ địch' },
    { id:'s04', name:'Xoáy hút',     cd:1, dmgMul:0.8,  effect:'vortex',effectChance:0.35, type:'single', anim:'storm',     desc:'Xoáy hút kẻ địch vào tâm bão' },
    { id:'s05', name:'Gió lốc',      cd:2, dmgMul:1.3,  effect:'knockback',effectChance:0.5, type:'single', anim:'tornado',   desc:'Gió lốc đẩy lui kẻ địch' },
    { id:'s06', name:'Mây đen',      cd:1, dmgMul:0.5,  effect:'vortex',effectChance:0.6, type:'single', anim:'cloud',     desc:'Mây đen kéo đến bao phủ mục tiêu' },
    { id:'s07', name:'Bão tuyết',    cd:3, dmgMul:1.4,  effect:'vortex',effectChance:0.5, type:'aoe',    anim:'blizzard',  desc:'Bão tuyết lạnh thấu xương cuốn phăng tất cả' },
    { id:'s08', name:'Xoáy nước',    cd:2, dmgMul:1.2,  effect:'vortex',effectChance:0.4, type:'single', anim:'storm',     desc:'Xoáy nước khổng lồ nhấn chìm địch' },
    { id:'s09', name:'Cuồng phong',  cd:3, dmgMul:1.6,  effect:'knockback',effectChance:0.6, type:'single', anim:'tornado',   desc:'Cuồng phong dữ dội quật ngã mục tiêu' },
    { id:'s10', name:'Gió mùa',      cd:2, dmgMul:0.6,  effect:'vortex',effectChance:0.6, type:'aoe',    anim:'sandstorm', desc:'Gió mùa mang theo mưa bão' },
    { id:'s11', name:'Siêu bão',     cd:4, dmgMul:2.0,  effect:'vortex',effectChance:0.6, type:'aoe',    anim:'tornado',   desc:'Siêu bão đổ bộ hủy diệt toàn trận' },
    { id:'s12', name:'Lốc kép',      cd:3, dmgMul:1.5,  effect:'vortex',effectChance:0.5, type:'single', anim:'tornado',   desc:'Hai vòi rồng song công' },
    { id:'s13', name:'Bão từ',       cd:3, dmgMul:0.8,  effect:'stun',  effectChance:0.4, type:'aoe',    anim:'storm',     desc:'Bão từ gây nhiễu loạn, choáng địch' },
    { id:'s14', name:'Phong ba',     cd:2, dmgMul:1.0,  effect:'vortex',effectChance:0.45, type:'single', anim:'storm',     desc:'Phong ba bão táp, cuốn trôi' },
    { id:'s15', name:'Vòi rồng',     cd:3, dmgMul:1.7,  effect:'knockback',effectChance:0.5, type:'single', anim:'tornado',   desc:'Vòi rồng khổng lồ nuốt chửng' },
    { id:'s16', name:'Mưa bão',      cd:2, dmgMul:0.5,  effect:'vortex',effectChance:0.7, type:'aoe',    anim:'rain',      desc:'Mưa bão tạt vào mặt địch' },
    { id:'s17', name:'Gió đông',     cd:1, dmgMul:0.7,  effect:'slow',  effectChance:0.5, type:'single', anim:'cloud',     desc:'Gió đông lạnh buốt làm chậm' },
    { id:'s18', name:'Bão cấp 12',   cd:4, dmgMul:2.2,  effect:'vortex',effectChance:0.7, type:'aoe',    anim:'tornado',   desc:'Bão cấp 12 quét sạch chiến trường' },
    { id:'s19', name:'Xoáy chân không',cd:3, dmgMul:1.8, effect:'vortex',effectChance:0.5, type:'single', anim:'storm',     desc:'Chân không hút và nghiền nát' },
    { id:'s20', name:'Sóng thần gió',cd:3, dmgMul:1.3,  effect:'knockback',effectChance:0.7, type:'aoe',    anim:'sandstorm', desc:'Sóng thần cuốn trôi mọi thứ' },
    { id:'s21', name:'Lồng gió',     cd:2, dmgMul:0.6,  effect:'vortex',effectChance:0.6, type:'single', anim:'cloud',     desc:'Lồng gió nhốt mục tiêu bên trong' },
    { id:'s22', name:'Đại cuồng phong',cd:5, dmgMul:2.5, effect:'knockback',effectChance:0.8, type:'aoe',    anim:'tornado',   desc:'Cuồng phong càn quét hủy diệt' },
    { id:'s23', name:'Bão nhiệt',    cd:3, dmgMul:1.9,  effect:'vortex',effectChance:0.4, type:'single', anim:'storm',     desc:'Bão nhiệt đốt nóng và cuốn bay' },
    { id:'s24', name:'Gió x Air Blade',cd:2, dmgMul:1.4, effect:'vortex',effectChance:0.35, type:'single', anim:'storm',     desc:'Lưỡi dao gió sắc bén' },
    { id:'s25', name:'Bão sét',      cd:4, dmgMul:2.3,  effect:'stun',  effectChance:0.5, type:'aoe',    anim:'thunder',   desc:'Sét kết hợp với giông bão' },
    { id:'s26', name:'Tốc hành',     cd:2, dmgMul:1.1,  effect:'vortex',effectChance:0.3, type:'single', anim:'storm',     desc:'Gió tốc hành xé toạc không gian' },
    { id:'s27', name:'Lốc x air',    cd:1, dmgMul:0.4,  effect:'vortex',effectChance:0.5, type:'aoe',    anim:'cloud',     desc:'Luồng khí xoáy nhẹ nhưng liên tục' },
    { id:'s28', name:'Mắt bão',      cd:4, dmgMul:1.0,  effect:'vortex',effectChance:0.8, type:'aoe',    anim:'sandstorm', desc:'Mắt bão chứa sức công phá khủng khiếp' },
    { id:'s29', name:'Bão vũ trụ',   cd:6, dmgMul:3.0,  effect:'vortex',effectChance:0.9, type:'aoe',    anim:'tornado',   desc:'Bão vũ trụ hủy diệt mọi thứ trên đường đi' },
    { id:'s31', name:'Hố đen',       cd:5, dmgMul:2.8,  effect:'knockback',effectChance:1.0, type:'single', anim:'void',      desc:'Xoáy chân không hút mục tiêu vào hố đen, đẩy mất 2 lượt' },
    { id:'s32', name:'Phong Bão Tố', cd:5, dmgMul:3.2,  effect:'vortex',effectChance:0.8, type:'aoe',    anim:'tornado',   desc:'Cuồng phong bão tố quét sạch chiến trường, gây lốc xoáy' },
  ]
};

// Map tier thresholds for auto-learn and shop
const SKILL_LEARN = {
  auto: [
    { minLvl: 1, slots: 1 },
    { minLvl: 10, slots: 2 },
    { minLvl: 20, slots: 3 },
    { minLvl: 40, slots: 4 },
    { minLvl: 70, slots: 5 }
  ],
  maxSlots: 10
};

function getElementSkills(element) {
  return ELEMENT_SKILLS[element] || [];
}

function buildElementSkillTree(element) {
  const pool = ELEMENT_SKILLS[element] || [];
  if (!pool.length) return [];

  const attackPool = pool.filter(skill =>
    (skill.type === 'single' || skill.type === 'aoe') &&
    !skill.healMul && !skill.defUp && !skill.defSelf && !skill.taunt && !skill.effect
  );
  const effectPool = pool.filter(skill =>
    skill.effect || skill.healMul || skill.defUp || skill.defSelf || skill.taunt ||
    skill.type === 'buff' || skill.type === 'selfbuff'
  );

  const makeSkill = (skill, tier, minLevel, cooldownOffset = 0) => {
    const baseCooldown = Math.max(2, (skill.cd || 3) + cooldownOffset + (skill.type === 'aoe' ? 1 : 0));
    return {
      ...skill,
      tier,
      minLevel,
      cooldownMax: baseCooldown,
      damageScale: 1 + (tier - 1) * 0.16 + (skill.healMul ? 0.05 : 0),
      baseCooldown,
      treeCategory: skill.effect || skill.healMul || skill.defUp || skill.defSelf || skill.taunt ? 'effect' : 'attack'
    };
  };

  const tree = [];
  const attack1 = attackPool[0] || pool[0];
  const attack2 = attackPool[1] || attackPool[0] || pool[0];
  const attack3 = attackPool[2] || attackPool[1] || attackPool[0] || pool[0];
  const effect1 = effectPool[0] || pool[0];
  const effect2 = effectPool[1] || effectPool[0] || pool[0];

  tree.push(makeSkill(attack1, 1, 1, 0));
  tree.push(makeSkill(attack2, 2, 10, 1));
  tree.push(makeSkill(attack3, 3, 20, 2));
  tree.push(makeSkill(effect1, 3, 40, 2));
  tree.push(makeSkill(effect2, 4, 70, 3));

  return tree;
}

function getSkillProgressionCatalog(element) {
  return buildElementSkillTree(element);
}

function getShopSkillCatalog(element) {
  const pool = ELEMENT_SKILLS[element] || [];
  const systemIds = new Set(getSkillProgressionCatalog(element).map(skill => skill.id));
  return pool.filter(skill => !systemIds.has(skill.id));
}

function getSkillProgressionForElement(element, level) {
  return getSkillProgressionCatalog(element).filter(skill => skill.minLevel <= level);
}

function getAutoLearnSlots(petLevel) {
  for (const tier of SKILL_LEARN.auto) {
    if (petLevel >= tier.minLvl) return tier.slots;
  }
  return 1;
}

function getMaxSkillSlots() {
  return SKILL_LEARN.maxSlots;
}

// ===== VAI TRÒ PET =====
const ROLES = {
  melee: {
    id: 'melee',
    name: 'Chiến binh gần',
    icon: '⚔️',
    desc: 'Tấn công trực diện, cân bằng',
    statBonus: { atk: 1.2, def: 1.0, spd: 0.9, hp: 1.1 },
    skills: [
      { name: 'Chém mạnh', cd: 1, dmgMul: 1.25, type: 'single', anim: 'slash', desc: 'Chém nhanh gây sát thương' },
      { name: 'Đòn xoáy', cd: 2, dmgMul: 1.15, type: 'aoe', anim: 'spin', desc: 'Xoáy đánh tất cả kẻ địch' }
    ],
    ultimate: { name: 'Bạo phát cuồng nộ', cd: 4, dmgMul: 2.2, type: 'single', anim: 'inferno', desc: 'Đòn kết liễu mạnh mẽ' }
  },
  ranged: {
    id: 'ranged',
    name: 'Vật lý xa',
    icon: '🏹',
    desc: 'Bắn từ xa, sát thương cực mạnh, thủ yếu',
    statBonus: { atk: 1.5, def: 0.4, spd: 1.4, hp: 0.7 },
    skills: [
      { name: 'Bắn chính xác', cd: 1, dmgMul: 1.3, type: 'single', anim: 'shot', desc: 'Bắn tỉa chính xác' },
      { name: 'Mưa tên', cd: 2, dmgMul: 1.1, type: 'aoe', anim: 'rainshot', desc: 'Bắn loạt tên vào kẻ địch' }
    ],
    ultimate: { name: 'Xuyên thủng', cd: 4, dmgMul: 2.5, type: 'single', anim: 'celestial', desc: 'Mũi tên xuyên không gian' }
  },
  magic: {
    id: 'magic',
    name: 'Phép tầm xa',
    icon: '🔮',
    desc: 'Tấn công phép thuật, đa dạng hiệu ứng',
    statBonus: { atk: 1.2, def: 0.7, spd: 1.0, hp: 0.9 },
    skills: [
      { name: 'Cầu lửa', cd: 1, dmgMul: 1.2, type: 'single', anim: 'fireball', desc: 'Thiêu đốt kẻ địch' },
      { name: 'Sấm sét', cd: 2, dmgMul: 1.3, type: 'aoe', anim: 'thunder', desc: 'Giáng sấm sét xuống tất cả' }
    ],
    ultimate: { name: 'Hỏa diệm', cd: 5, dmgMul: 2.4, type: 'aoe', anim: 'inferno', desc: 'Thiêu rụi toàn bộ kẻ thù' }
  },
  support: {
    id: 'support',
    name: 'Hỗ trợ',
    icon: '💚',
    desc: 'Hồi máu và buff cho đồng đội',
    statBonus: { atk: 0.7, def: 1.0, spd: 1.1, hp: 1.2 },
    skills: [
      { name: 'Hồi phục', cd: 2, healMul: 0.3, type: 'heal', anim: 'heal', desc: 'Hồi máu đồng đội' },
      { name: 'Lá chắn', cd: 3, defUp: 0.4, type: 'buff', anim: 'shield', desc: 'Tăng phòng thủ toàn đội' }
    ],
    ultimate: { name: 'Phục sinh', cd: 5, healMul: 0.6, type: 'heal_all', anim: 'holy', desc: 'Hồi máu toàn bộ đồng đội' }
  },
  tank: {
    id: 'tank',
    name: 'Phòng thủ',
    icon: '🛡️',
    desc: 'Phòng thủ cực cao, tấn công yếu, hút sát thương',
    statBonus: { atk: 0.5, def: 1.9, spd: 0.6, hp: 1.5 },
    skills: [
      { name: 'Phòng thủ', cd: 2, defSelf: 1.5, type: 'selfbuff', anim: 'defend', desc: 'Tăng phòng thủ bản thân' },
      { name: 'Khiêu khích', cd: 3, taunt: true, type: 'taunt', anim: 'taunt', desc: 'Hút tấn công về mình' }
    ],
    ultimate: { name: 'Địa chấn', cd: 5, dmgMul: 2.0, type: 'aoe', anim: 'earthquake', desc: 'Giậm chân rung chuyển đất' }
  }
};

const PET_ELEMENT = {
  tho: 'fire', meo: 'fire', cho: 'earth', gautruc: 'earth', cuu: 'water',
  rong: 'fire', kylan: 'water', phuonghoang: 'fire', kynhong: 'thunder', macarong: 'thunder',
  robotchienthan: 'thunder', robothiemhiem: 'poison', robotvutru: 'fire', ninjarobot: 'poison', robotkhonglo: 'earth',
  bangtinh: 'ice', tuyetnhan: 'ice', haicau: 'ice', kylanbang: 'ice', rongbang: 'ice',
  caynon: 'wood', hoathit: 'wood', tinhlam: 'wood', nguoicay: 'wood', rongcay: 'wood',
  baobien: 'storm', locsay: 'storm', gioloc: 'storm', maybao: 'storm', sieubao: 'storm'
};

function getPetElement(baseId) {
  return PET_ELEMENT[baseId] || 'fire';
}

const PET_ROLE_ASSIGN = {
  tho: 'ranged', meo: 'melee', cho: 'tank', gautruc: 'melee', cuu: 'support',
  rong: 'magic', kylan: 'support', phuonghoang: 'magic', kynhong: 'magic', macarong: 'melee',
  robotchienthan: 'tank', robothiemhiem: 'ranged', robotvutru: 'magic', ninjarobot: 'melee', robotkhonglo: 'tank',
  bangtinh: 'magic', tuyetnhan: 'tank', haicau: 'melee', kylanbang: 'support', rongbang: 'magic',
  caynon: 'ranged', hoathit: 'melee', tinhlam: 'support', nguoicay: 'tank', rongcay: 'magic',
  baobien: 'ranged', locsay: 'magic', gioloc: 'melee', maybao: 'support', sieubao: 'tank'
};

function getPetRole(petBaseId) {
  const roleId = PET_ROLE_ASSIGN[petBaseId] || 'melee';
  return ROLES[roleId] || ROLES.melee;
}

// ===== CLASS SKILL =====
class Skill {
  constructor(def) {
    this.id = def.id || def.name;
    this.name = def.name;
    this.cooldownMax = def.cooldownMax || def.cd || 3;
    this.cooldown = 0;
    this.dmgMul = def.dmgMul || 0;
    this.healMul = def.healMul || 0;
    this.defUp = def.defUp || 0;
    this.defSelf = def.defSelf || 0;
    this.taunt = def.taunt || false;
    this.type = def.type || 'single';
    this.anim = def.anim || 'slash';
    this.desc = def.desc || '';
    this.isUltimate = def.isUltimate || false;
    this.effect = def.effect || null;
    this.effectChance = def.effectChance || 0;
    this.tier = def.tier || 1;
    this.minLevel = def.minLevel || 1;
    this.damageScale = def.damageScale || 1;
  }

  isReady() { return this.cooldown <= 0; }

  getCooldownFor(level = 1) {
    const tierBonus = Math.max(0, this.tier - 1) * 1.2;
    const levelBonus = Math.max(0, level - this.minLevel) * 0.05;
    return Math.max(1, Math.round(this.cooldownMax + tierBonus + levelBonus) - 1);
  }

  use(level = 1) { this.cooldown = this.getCooldownFor(level); }

  tick() { if (this.cooldown > 0) this.cooldown--; }

  getScaledDamage(baseDamage, level = 1, masteryBonus = 0) {
    const levelMul = 1 + Math.max(0, level - this.minLevel) * 0.01;
    const tierMul = 1 + (this.tier - 1) * 0.16;
    const masteryMul = 1 + masteryBonus * 0.05;
    return Math.max(1, Math.floor(baseDamage * (this.dmgMul || 0.8) * this.damageScale * tierMul * levelMul * masteryMul));
  }
}

function getRoleUltimate(role) {
  if (role.ultimate) return new Skill({ ...role.ultimate, isUltimate: true });
  return null;
}

function getElementSkill(petElement, isUltimate) {
  const elemSkills = ELEMENT_SKILLS[petElement];
  if (!elemSkills || elemSkills.length === 0) return null;
  const skillDef = elemSkills[Math.floor(Math.random() * elemSkills.length)];
  const skill = new Skill(skillDef);
  if (isUltimate) skill.isUltimate = true;
  return skill;
}

function getElementBasicSkill(petElement) {
  const elemSkills = ELEMENT_SKILLS[petElement];
  if (!elemSkills || elemSkills.length === 0) return null;
  const half = Math.ceil(elemSkills.length / 2);
  const idx = Math.floor(Math.random() * half);
  return new Skill(elemSkills[idx]);
}

function getElementAdvancedSkill(petElement) {
  const elemSkills = ELEMENT_SKILLS[petElement];
  if (!elemSkills || elemSkills.length === 0) return null;
  const half = Math.ceil(elemSkills.length / 2);
  const idx = half + Math.floor(Math.random() * (elemSkills.length - half));
  return new Skill(elemSkills[idx]);
}

// ===== CLASS STATUS EFFECT =====
class StatusEffect {
  constructor(type, duration, stacks = 1) {
    this.type = type;
    this.def = EFFECTS[type];
    this.duration = duration;
    this.stacks = Math.min(stacks, this.def.maxStacks || 99);
  }

  applyDot(maxHp) {
    if (!this.def.dotPct) return 0;
    return Math.floor(maxHp * this.def.dotPct * this.stacks);
  }

  canAct() {
    return this.def.canAct !== false;
  }

  getSpdMul() {
    return this.def.spdMul || 1;
  }

  getAtkReduction() {
    return this.def.atkReduction || 0;
  }

  tick() {
    this.duration--;
    return this.duration > 0;
  }
}
