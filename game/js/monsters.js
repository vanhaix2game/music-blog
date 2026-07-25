const MONSTER_TEMPLATES = [
  { tier: 1, minLvl: 1, maxLvl: 10, list: [
    { id: 'slime', name: 'Slime', emoji: '🟢', type: 'slime', element: 'water',
      hpMul: 1.0, atkMul: 0.8, defMul: 0.5, spdMul: 0.5, skill: null, scale: 0.7 },
    { id: 'chicken', name: 'Gà điên', emoji: '🐔', type: 'beast', element: 'fire',
      hpMul: 0.8, atkMul: 1.0, defMul: 0.4, spdMul: 1.2, skill: null, scale: 0.7 },
    { id: 'rat', name: 'Chuột lớn', emoji: '🐀', type: 'beast', element: 'poison',
      hpMul: 0.7, atkMul: 0.9, defMul: 0.3, spdMul: 1.5, skill: null, scale: 0.6 },
  ]},
  { tier: 2, minLvl: 10, maxLvl: 20, list: [
    { id: 'wolf', name: 'Sói xám', emoji: '🐺', type: 'beast', element: 'fire',
      hpMul: 1.2, atkMul: 1.2, defMul: 0.8, spdMul: 1.3, skill: 'howl', scale: 0.8 },
    { id: 'bearcub', name: 'Gấu nhỏ', emoji: '🐻', type: 'beast', element: 'earth',
      hpMul: 1.8, atkMul: 1.0, defMul: 1.2, spdMul: 0.6, skill: null, scale: 0.8 },
    { id: 'plant', name: 'Cây ăn thịt', emoji: '🌿', type: 'plant', element: 'wood',
      hpMul: 1.5, atkMul: 1.1, defMul: 0.9, spdMul: 0.4, skill: 'vine', scale: 0.8 },
  ]},
  { tier: 3, minLvl: 20, maxLvl: 30, list: [
    { id: 'werewolf', name: 'Ma sói', emoji: '🐾', type: 'beast', element: 'fire',
      hpMul: 1.5, atkMul: 1.4, defMul: 1.0, spdMul: 1.3, skill: 'claw', scale: 0.85 },
    { id: 'brownbear', name: 'Gấu lớn', emoji: '🧸', type: 'beast', element: 'earth',
      hpMul: 2.2, atkMul: 1.2, defMul: 1.4, spdMul: 0.5, skill: 'slam', scale: 0.9 },
    { id: 'icesnake', name: 'Rắn băng', emoji: '🐍', type: 'reptile', element: 'ice',
      hpMul: 1.1, atkMul: 1.4, defMul: 0.7, spdMul: 1.3, skill: 'freeze', scale: 0.8 },
  ]},
  { tier: 4, minLvl: 30, maxLvl: 40, list: [
    { id: 'dwarf', name: 'Quỷ lùn', emoji: '👺', type: 'demon', element: 'fire',
      hpMul: 1.6, atkMul: 1.4, defMul: 1.3, spdMul: 0.9, skill: 'axe', scale: 0.8 },
    { id: 'orc', name: 'Orc', emoji: '👹', type: 'demon', element: 'earth',
      hpMul: 2.0, atkMul: 1.5, defMul: 1.2, spdMul: 0.7, skill: 'smash', scale: 0.9 },
    { id: 'icemaiden', name: 'Tiên băng', emoji: '🧊', type: 'mystic', element: 'ice',
      hpMul: 1.2, atkMul: 1.6, defMul: 0.8, spdMul: 1.3, skill: 'blizzard', scale: 0.8 },
  ]},
  { tier: 5, minLvl: 40, maxLvl: 50, list: [
    { id: 'demon', name: 'Quỷ dữ', emoji: '😈', type: 'demon', element: 'fire',
      hpMul: 1.8, atkMul: 1.7, defMul: 1.2, spdMul: 1.0, skill: 'darkfire', scale: 0.9 },
    { id: 'drake', name: 'Rồng con', emoji: '🐲', type: 'dragon', element: 'fire',
      hpMul: 2.2, atkMul: 1.8, defMul: 1.4, spdMul: 0.9, skill: 'flame', scale: 0.9 },
    { id: 'frostguard', name: 'Vệ binh băng', emoji: '❄️', type: 'elemental', element: 'ice',
      hpMul: 2.0, atkMul: 1.5, defMul: 1.6, spdMul: 0.7, skill: 'freezing_blast', scale: 0.9 },
  ]},
  { tier: 6, minLvl: 50, maxLvl: 60, list: [
    { id: 'icegolem', name: 'Rồng băng', emoji: '❄️', type: 'dragon', element: 'ice',
      hpMul: 2.8, atkMul: 1.8, defMul: 1.7, spdMul: 0.7, skill: 'freeze', scale: 1.0 },
    { id: 'woodgiant', name: 'Người cây khổng lồ', emoji: '🌳', type: 'giant', element: 'wood',
      hpMul: 3.2, atkMul: 1.6, defMul: 1.8, spdMul: 0.4, skill: 'earthquake', scale: 1.0 },
    { id: 'lesserdemon', name: 'Quỷ sứ', emoji: '👿', type: 'demon', element: 'fire',
      hpMul: 2.0, atkMul: 2.0, defMul: 1.3, spdMul: 1.1, skill: 'hellfire', scale: 0.9 },
  ]},
  { tier: 7, minLvl: 60, maxLvl: 70, list: [
    { id: 'firegolem', name: 'Rồng lửa', emoji: '🔥', type: 'dragon', element: 'fire',
      hpMul: 2.8, atkMul: 2.0, defMul: 1.7, spdMul: 0.8, skill: 'inferno', scale: 1.0 },
    { id: 'frostdragon', name: 'Rồng băng cổ', emoji: '🐉', type: 'dragon', element: 'ice',
      hpMul: 3.0, atkMul: 2.0, defMul: 1.8, spdMul: 0.8, skill: 'blizzard', scale: 1.1 },
    { id: 'woodwyrm', name: 'Rồng cây', emoji: '🐲', type: 'dragon', element: 'wood',
      hpMul: 3.0, atkMul: 2.0, defMul: 1.7, spdMul: 0.7, skill: 'ancientpower', scale: 1.0 },
  ]},
  { tier: 8, minLvl: 70, maxLvl: 80, list: [
    { id: 'dragonlord', name: 'Rồng thần', emoji: '🐲', type: 'dragon', element: 'fire',
      hpMul: 3.2, atkMul: 2.2, defMul: 1.8, spdMul: 0.9, skill: 'dragonbreath', scale: 1.1 },
    { id: 'iceking', name: 'Vua băng', emoji: '👑', type: 'elemental', element: 'ice',
      hpMul: 3.0, atkMul: 2.1, defMul: 2.0, spdMul: 0.8, skill: 'permafrost', scale: 1.1 },
    { id: 'woodlord', name: 'Chúa tể rừng', emoji: '🌿', type: 'plant', element: 'wood',
      hpMul: 3.2, atkMul: 2.0, defMul: 1.9, spdMul: 0.7, skill: 'forestwrath', scale: 1.1 },
  ]},
  { tier: 9, minLvl: 80, maxLvl: 90, list: [
    { id: 'celestial', name: 'Thiên long', emoji: '🐉', type: 'dragon', element: 'thunder',
      hpMul: 3.5, atkMul: 2.4, defMul: 2.0, spdMul: 1.0, skill: 'celestialblast', scale: 1.1 },
    { id: 'eternalice', name: 'Băng vĩnh cửu', emoji: '❄️', type: 'elemental', element: 'ice',
      hpMul: 3.8, atkMul: 2.2, defMul: 2.2, spdMul: 0.7, skill: 'absolutezero', scale: 1.1 },
    { id: 'worldtree', name: 'Thế giới thụ', emoji: '🌳', type: 'plant', element: 'wood',
      hpMul: 4.0, atkMul: 2.0, defMul: 2.4, spdMul: 0.5, skill: 'overgrowth', scale: 1.2 },
  ]},
  { tier: 10, minLvl: 90, maxLvl: 999, list: [
    { id: 'overgod', name: 'Thượng thần', emoji: '✨', type: 'god', element: 'thunder',
      hpMul: 4.0, atkMul: 2.8, defMul: 2.2, spdMul: 1.3, skill: 'divinejudge', scale: 1.2 },
    { id: 'frostgod', name: 'Băng thần', emoji: '❄️', type: 'god', element: 'ice',
      hpMul: 4.2, atkMul: 2.6, defMul: 2.4, spdMul: 1.0, skill: 'eternalwinter', scale: 1.2 },
    { id: 'forestgod', name: 'Mộc thần', emoji: '🌿', type: 'god', element: 'wood',
      hpMul: 4.5, atkMul: 2.5, defMul: 2.3, spdMul: 0.9, skill: 'gaiarage', scale: 1.2 },
  ]},
];

// ===== BOSS TIER SYSTEM =====
const BOSS_TIERS = [
  { id: 'normal',   name: 'Trùm',      scaleMul: 1.0, statMul: 1.0, hpMul: 1.0, killsRequired: 0,  title: '👤' },
  { id: 'leader',   name: 'Thủ lĩnh',  scaleMul: 2.0, statMul: 1.8, hpMul: 2.5, killsRequired: 10, title: '👑' },
  { id: 'chief',    name: 'Tộc trưởng',scaleMul: 4.0, statMul: 3.0, hpMul: 5.0, killsRequired: 20, title: '🗡️' },
  { id: 'super',    name: 'Siêu boss', scaleMul: 8.0, statMul: 5.0, hpMul: 10,  killsRequired: 30, title: '💀' },
];

// ===== PER-MAP BOSS TEMPLATES =====
const MAP_BOSSES = [
  { id: 'fire_drake',    name: 'Hỏa Long',    emoji: '🔥', type: 'dragon',    element: 'fire',   skill: 'volcanoblast',   scale: 1.4, rangeType: 1 },
  { id: 'frost_king',    name: 'Băng Vương',  emoji: '❄️', type: 'elemental', element: 'ice',    skill: 'icenova',        scale: 1.4, rangeType: 2 },
  { id: 'wild_ancients', name: 'Mộc Thần',    emoji: '🌳', type: 'plant',     element: 'wood',   skill: 'natureswrath',   scale: 1.4, rangeType: 1 },
  { id: 'shadow_wolf',   name: 'Huyền Lang',  emoji: '🐺', type: 'beast',     element: 'poison', skill: 'nightmare',      scale: 1.3, rangeType: 1 },
  { id: 'thunder_bird',  name: 'Lôi Điểu',   emoji: '🦅', type: 'mystic',    element: 'thunder',skill: 'thunderstorm',   scale: 1.3, rangeType: 3 },
  { id: 'venom_lord',    name: 'Độc Vương',  emoji: '☠️', type: 'demon',     element: 'poison', skill: 'plague',         scale: 1.3, rangeType: 2 },
  { id: 'crystal_queen', name: 'Pha Lê Hậu', emoji: '💎', type: 'elemental', element: 'ice',    skill: 'absolutezero',   scale: 1.4, rangeType: 3 },
  { id: 'lava_giant',    name: 'Nham Thạch', emoji: '🌋', type: 'giant',     element: 'fire',   skill: 'meteorstorm',    scale: 1.5, rangeType: 2 },
  { id: 'storm_dragon',  name: 'Phong Long', emoji: '🐉', type: 'dragon',    element: 'storm',  skill: 'hurricane',      scale: 1.5, rangeType: 3 },
  { id: 'abyss_kraken',  name: 'Hải Quái',   emoji: '🐙', type: 'mystic',    element: 'water',  skill: 'chaoswave',      scale: 1.4, rangeType: 2 },
  { id: 'void_entity',   name: 'Hư Vô Thể',  emoji: '🌀', type: 'chaos',     element: 'poison', skill: 'voidtear',       scale: 1.5, rangeType: 3 },
  { id: 'ice_drake',     name: 'Băng Long',  emoji: '❄️', type: 'dragon',    element: 'ice',    skill: 'frostbite',      scale: 1.3, rangeType: 1 },
  { id: 'flame_lord',    name: 'Viêm Vương', emoji: '🔥', type: 'demon',     element: 'fire',   skill: 'inferno',         scale: 1.4, rangeType: 1 },
  { id: 'earth_titan',   name: 'Địa Titan',  emoji: '🗿', type: 'giant',     element: 'earth',  skill: 'fissure',         scale: 1.5, rangeType: 1 },
  { id: 'frost_wyrm',    name: 'Băng Trùng', emoji: '🐍', type: 'dragon',    element: 'ice',    skill: 'icenova',         scale: 1.3, rangeType: 2 },
  { id: 'holy_seraph',   name: 'Thiên Sứ',   emoji: '👼', type: 'god',       element: 'thunder',skill: 'chainlightning',  scale: 1.5, rangeType: 3 },
  { id: 'chaos_demon',   name: 'Hỗn Mang Quỷ',emoji:'👿', type: 'chaos',     element: 'poison', skill: 'darkpulse',       scale: 1.5, rangeType: 2 },
  { id: 'elder_dragon',  name: 'Cổ Long',    emoji: '🐲', type: 'dragon',    element: 'fire',   skill: 'meteorstorm',    scale: 1.6, rangeType: 1 },
  { id: 'frost_titan',   name: 'Băng Titan', emoji: '❄️', type: 'giant',     element: 'ice',    skill: 'eternalwinter',  scale: 1.6, rangeType: 2 },
  { id: 'wood_colossus', name: 'Mộc Cự Nhân',emoji: '🌳', type: 'giant',     element: 'wood',   skill: 'thornwave',      scale: 1.6, rangeType: 1 },
  { id: 'star_guardian', name: 'Thủ Hộ Tinh',emoji: '⭐', type: 'elemental', element: 'thunder',skill: 'celestialblast',  scale: 1.6, rangeType: 3 },
  { id: 'nether_dragon', name: 'Minh Long',  emoji: '🐉', type: 'dragon',    element: 'poison', skill: 'voidtear',        scale: 1.6, rangeType: 3 },
  { id: 'tornado_giant', name: 'Bão Nhân',   emoji: '🌪️', type: 'giant',     element: 'storm',  skill: 'tornado',         scale: 1.6, rangeType: 2 },
  { id: 'supreme_god',   name: 'Tối Thượng Thần',emoji:'✨', type:'god',     element: 'thunder',skill: 'divinejudge',     scale: 1.8, rangeType: 3 },
  { id: 'eternal_void',  name: 'Hư Vô Vĩnh Hằng',emoji:'🌀', type:'chaos',    element:'poison',  skill: 'nightmare',       scale: 1.8, rangeType: 3 },
  { id: 'world_devourer',name: 'Thôn Thiên Thú',emoji: '🌑', type:'chaos',    element:'fire',    skill: 'volcanoblast',    scale: 1.8, rangeType: 1 },
  { id: 'cosmic_dragon', name: 'Vũ Trụ Long', emoji: '🐲', type: 'dragon',   element: 'thunder',skill: 'celestialblast',  scale: 2.0, rangeType: 3 },
  { id: 'primordial_ice',name: 'Hồng Hoang Băng',emoji:'❄️', type:'elemental',element:'ice',    skill: 'absolutezero',    scale: 2.0, rangeType: 2 },
  { id: 'life_tree',     name: 'Sinh Mệnh Thụ',emoji:'🌳', type:'plant',     element:'wood',    skill: 'overgrowth',      scale: 2.0, rangeType: 1 },
  { id: 'omega_storm',   name: 'Omega Bão',  emoji: '🌀', type: 'mystic',    element: 'storm',  skill: 'hurricane',       scale: 2.0, rangeType: 3 },
];

// Map boss assignments: each map gets 3 boss IDs
const MAP_BOSS_IDS = [
  [0,  1,  2],   // map 1  — fire/frost/plant
  [3,  4,  5],   // map 2  — shadow/thunder/venom
  [6,  7,  8],   // map 3  — crystal/lava/storm
  [9,  10, 11],  // map 4  — kraken/void/ice
  [12, 13, 14],  // map 5  — flame/earth/frostwyrm
  [15, 16, 17],  // map 6  — seraph/chaos/elder
  [18, 19, 20],  // map 7  — frosttitan/woodcolossus/star
  [21, 22, 23],  // map 8  — nether/tornado/supreme
  [24, 25, 26],  // map 9  — eternal/world/cosmic
  [27, 28, 29],  // map 10 — primordial/life/omega
  [27, 28, 29],  // map 11 — reuse top bosses
];

function getMapBossTemplate(mapId) {
  const ids = MAP_BOSS_IDS[mapId - 1] || MAP_BOSS_IDS[0];
  return MAP_BOSSES[ids[Math.floor(Math.random() * ids.length)]];
}

function getBossTier(killCount) {
  let tier = BOSS_TIERS[0];
  for (const bt of BOSS_TIERS) {
    if (killCount >= bt.killsRequired) tier = bt;
  }
  return tier;
}

function getRarityFactor(killCount) {
  const tier = getBossTier(killCount);
  const idx = BOSS_TIERS.indexOf(tier);
  // Each tier above normal adds difficulty: lower spawn chance for higher tiers
  const rarity = 1 / (idx + 1);
  return rarity;
}

const MONSTER_SKILLS = {
  howl: { name: 'Hú', dmgMul: 1.3, element: 'fire', anim: 'howl', effect: null },
  vine: { name: 'Dây leo', dmgMul: 1.2, element: 'wood', anim: 'vine', effect: 'root', effectChance: 0.5 },
  iceshard: { name: 'Mảnh băng', dmgMul: 1.1, element: 'ice', anim: 'ice_shard', effect: 'slow', effectChance: 0.4 },
  claw: { name: 'Vút', dmgMul: 1.5, element: 'fire', anim: 'claw', effect: 'burn', effectChance: 0.3 },
  slam: { name: 'Đập', dmgMul: 1.6, element: 'earth', anim: 'slam', effect: 'stun', effectChance: 0.2 },
  freeze: { name: 'Đóng băng', dmgMul: 0.8, element: 'ice', anim: 'freeze', effect: 'freeze', effectChance: 0.4 },
  root: { name: 'Bó rễ', dmgMul: 0.9, element: 'wood', anim: 'root', effect: 'root', effectChance: 0.5 },
  axe: { name: 'Búa', dmgMul: 1.6, element: 'earth', anim: 'axe', effect: null },
  smash: { name: 'Nghiền', dmgMul: 1.8, element: 'earth', anim: 'smash', effect: 'stun', effectChance: 0.25 },
  blizzard: { name: 'Bão tuyết', dmgMul: 1.5, element: 'ice', anim: 'blizzard', effect: 'freeze', effectChance: 0.3, aoe: true },
  vine_whip: { name: 'Roi mây', dmgMul: 1.4, element: 'wood', anim: 'vine', effect: 'root', effectChance: 0.4 },
  darkfire: { name: 'Lửa tối', dmgMul: 1.9, element: 'fire', anim: 'darkfire', effect: 'burn', effectChance: 0.5 },
  flame: { name: 'Phun lửa', dmgMul: 1.8, element: 'fire', anim: 'flame', effect: 'burn', effectChance: 0.4 },
  freezing_blast: { name: 'Bùng nổ băng', dmgMul: 1.6, element: 'ice', anim: 'freeze', effect: 'freeze', effectChance: 0.5, aoe: true },
  summon_sapling: { name: 'Triệu hồi cây', dmgMul: 0.3, element: 'wood', anim: 'summon', effect: 'summon', effectChance: 1 },
  hellfire: { name: 'Địa ngục', dmgMul: 2.0, element: 'fire', anim: 'hellfire', effect: 'burn', effectChance: 0.6 },
  inferno: { name: 'Hỏa ngục', dmgMul: 2.2, element: 'fire', anim: 'inferno', effect: 'burn', effectChance: 0.8 },
  dragonbreath: { name: 'Long tức', dmgMul: 2.3, element: 'fire', anim: 'breath', effect: 'burn', effectChance: 0.6, aoe: true },
  permafrost: { name: 'Băng vĩnh cửu', dmgMul: 2.0, element: 'ice', anim: 'blizzard', effect: 'freeze', effectChance: 0.7, aoe: true },
  forestwrath: { name: 'Cuồng nộ rừng', dmgMul: 2.0, element: 'wood', anim: 'ancientpower', effect: 'root', effectChance: 0.6, aoe: true },
  demonrage: { name: 'Ma nộ', dmgMul: 2.4, element: 'fire', anim: 'rage', effect: 'burn', effectChance: 0.5 },
  earthquake: { name: 'Động đất', dmgMul: 2.0, element: 'earth', anim: 'quake', effect: 'stun', effectChance: 0.3, aoe: true },
  celestialblast: { name: 'Thiên thạch', dmgMul: 2.6, element: 'thunder', anim: 'celestial', effect: 'stun', effectChance: 0.3, aoe: true },
  absolutezero: { name: 'Âm độ tuyệt đối', dmgMul: 2.4, element: 'ice', anim: 'blizzard', effect: 'freeze', effectChance: 0.8, aoe: true },
  overgrowth: { name: 'Mọc rừng', dmgMul: 2.2, element: 'wood', anim: 'ancientpower', effect: 'root', effectChance: 0.7, aoe: true },
  annihilate: { name: 'Hủy diệt', dmgMul: 2.8, element: 'poison', anim: 'annihilate', effect: 'poison', effectChance: 0.5 },
  divinejudge: { name: 'Thần phạt', dmgMul: 3.0, element: 'thunder', anim: 'divine', effect: 'stun', effectChance: 0.4 },
  eternalwinter: { name: 'Đông vĩnh cửu', dmgMul: 2.8, element: 'ice', anim: 'blizzard', effect: 'freeze', effectChance: 0.9, aoe: true },
  gaiarage: { name: 'Thịnh nộ địa cầu', dmgMul: 2.8, element: 'wood', anim: 'ancientpower', effect: 'root', effectChance: 0.8, aoe: true },
  chaoswave: { name: 'Hỗn mang', dmgMul: 3.0, element: 'poison', anim: 'chaos', effect: 'poison', effectChance: 0.6, aoe: true },
  // === ADDED BOSS-UNIQUE SKILLS ===
  // Fire/Volcano
  volcanoblast: { name: 'Núi lửa phun', dmgMul: 3.2, element: 'fire', anim: 'inferno', effect: 'burn', effectChance: 0.9, aoe: true },
  meteorstorm: { name: 'Mưa sao băng', dmgMul: 2.8, element: 'fire', anim: 'meteor_storm', effect: 'burn', effectChance: 0.7, aoe: true },
  // Ice/Frost
  icenova: { name: 'Băng nổ', dmgMul: 2.6, element: 'ice', anim: 'blizzard', effect: 'freeze', effectChance: 0.7, aoe: true },
  frostbite: { name: 'Cắn rét', dmgMul: 2.0, element: 'ice', anim: 'freeze', effect: 'freeze', effectChance: 0.5 },
  // Wood/Nature
  natureswrath: { name: 'Thịnh nộ tự nhiên', dmgMul: 2.6, element: 'wood', anim: 'ancientpower', effect: 'poison', effectChance: 0.6, aoe: true },
  thornwave: { name: 'Sóng gai', dmgMul: 2.2, element: 'wood', anim: 'vine', effect: 'root', effectChance: 0.6 },
  // Thunder/Storm
  thunderstorm: { name: 'Giông bão', dmgMul: 2.8, element: 'thunder', anim: 'thunder', effect: 'stun', effectChance: 0.5, aoe: true },
  chainlightning: { name: 'Sét chuỗi', dmgMul: 2.4, element: 'thunder', anim: 'thunder', effect: 'stun', effectChance: 0.4 },
  // Poison/Chaos
  plague: { name: 'Dịch hạch', dmgMul: 2.0, element: 'poison', anim: 'curse', effect: 'poison', effectChance: 0.8, aoe: true },
  voidtear: { name: 'Xé không gian', dmgMul: 3.2, element: 'poison', anim: 'void', effect: 'vortex', effectChance: 0.5 },
  // Storm (new)
  tornado: { name: 'Lốc xoáy', dmgMul: 2.4, element: 'storm', anim: 'tornado', effect: 'vortex', effectChance: 0.6 },
  hurricane: { name: 'Siêu bão', dmgMul: 3.0, element: 'storm', anim: 'sandstorm', effect: 'knockback', effectChance: 0.7, aoe: true, special: 'hurricane', category: 'control', energyCost: 60, cooldownTurns: 3 },
  // Earth
  rockslide: { name: 'Đá lở', dmgMul: 2.2, element: 'earth', anim: 'quake', effect: 'stun', effectChance: 0.3 },
  fissure: { name: 'Địa liệt', dmgMul: 2.6, element: 'earth', anim: 'earthquake', effect: 'knockback', effectChance: 0.4, aoe: true },
  // Dark
  darkpulse: { name: 'Sóng tối', dmgMul: 2.4, element: 'poison', anim: 'void', effect: 'poison', effectChance: 0.5, aoe: true },
  nightmare: { name: 'Ác mộng', dmgMul: 2.8, element: 'poison', anim: 'curse', effect: 'stun', effectChance: 0.5 },
  // ===== NEW BOSS-ONLY SKILLS =====
  ember_wave: { name: 'Sóng hỏa vi', dmgMul: 2.6, element: 'fire', anim: 'inferno', effect: 'burn', effectChance: 0.65, aoe: true, special: 'volcano_wave', category: 'attack', energyCost: 56, cooldownTurns: 2 },
  molten_lance: { name: 'Thương dung nham', dmgMul: 2.7, element: 'fire', anim: 'hellfire', effect: 'burn', effectChance: 0.7, special: 'volcano_wave', category: 'attack', energyCost: 54, cooldownTurns: 2 },
  hellfire_rain: { name: 'Mưa hỏa ngục', dmgMul: 2.8, element: 'fire', anim: 'meteor_storm', effect: 'burn', effectChance: 0.75, aoe: true, special: 'meteor', category: 'attack', energyCost: 58, cooldownTurns: 3 },
  solar_fall: { name: 'Mặt trời rơi', dmgMul: 3.1, element: 'fire', anim: 'inferno', effect: 'burn', effectChance: 0.8, aoe: true, special: 'meteor', category: 'attack', energyCost: 60, cooldownTurns: 3 },
  crystal_spike: { name: 'Mũi băng tinh', dmgMul: 2.9, element: 'ice', anim: 'blizzard', effect: 'freeze', effectChance: 0.7, special: 'crystal_spike', category: 'attack', energyCost: 56, cooldownTurns: 2 },
  glacier_spear: { name: 'Thương băng hà', dmgMul: 2.5, element: 'ice', anim: 'freeze', effect: 'freeze', effectChance: 0.6, special: 'crystal_spike', category: 'attack', energyCost: 52, cooldownTurns: 2 },
  frostnova: { name: 'Băng bùng nổ', dmgMul: 2.6, element: 'ice', anim: 'blizzard', effect: 'freeze', effectChance: 0.65, aoe: true, special: 'crystal_spike', category: 'attack', energyCost: 58, cooldownTurns: 2 },
  frost_wreath: { name: 'Vòng hoa đóng băng', dmgMul: 2.4, element: 'ice', anim: 'freeze', effect: 'freeze', effectChance: 0.6, aoe: true, special: 'ice_rain', category: 'attack', energyCost: 54, cooldownTurns: 2 },
  vine_barrage: { name: 'Mưa dây leo', dmgMul: 2.4, element: 'wood', anim: 'vine', effect: 'root', effectChance: 0.6, special: 'vine_barrage', category: 'control', energyCost: 54, cooldownTurns: 2 },
  root_maelstrom: { name: 'Lốc rễ', dmgMul: 2.7, element: 'wood', anim: 'ancientpower', effect: 'root', effectChance: 0.7, aoe: true, special: 'vine_barrage', category: 'control', energyCost: 56, cooldownTurns: 2 },
  ancient_bloom: { name: 'Hoa cổ thụ', dmgMul: 2.8, element: 'wood', anim: 'ancientpower', effect: 'poison', effectChance: 0.7, aoe: true, special: 'vine_barrage', category: 'attack', energyCost: 58, cooldownTurns: 3 },
  jungle_devour: { name: 'Rừng nuốt chửng', dmgMul: 2.6, element: 'wood', anim: 'root', effect: 'root', effectChance: 0.7, special: 'vine_barrage', category: 'control', energyCost: 55, cooldownTurns: 2 },
  thunder_arc: { name: 'Lôi đâm xé', dmgMul: 2.7, element: 'thunder', anim: 'thunder', effect: 'stun', effectChance: 0.6, special: 'thunder_arc', category: 'control', energyCost: 56, cooldownTurns: 2 },
  storm_impact: { name: 'Đòn đánh sấm', dmgMul: 2.6, element: 'thunder', anim: 'celestial', effect: 'stun', effectChance: 0.55, aoe: true, special: 'thunder_arc', category: 'attack', energyCost: 58, cooldownTurns: 2 },
  divine_bolt: { name: 'Sét thần phạt', dmgMul: 2.9, element: 'thunder', anim: 'celestial', effect: 'stun', effectChance: 0.7, special: 'thunder_arc', category: 'control', energyCost: 60, cooldownTurns: 3 },
  lightning_spear: { name: 'Thương lôi kéo', dmgMul: 2.5, element: 'thunder', anim: 'thunder', effect: 'stun', effectChance: 0.5, special: 'flash', category: 'control', energyCost: 52, cooldownTurns: 2 },
  shadow_burst: { name: 'Nổ bóng đêm', dmgMul: 2.7, element: 'poison', anim: 'curse', effect: 'poison', effectChance: 0.75, aoe: true, special: 'shadow_burst', category: 'attack', energyCost: 58, cooldownTurns: 2 },
  venom_tornado: { name: 'Lốc độc', dmgMul: 2.6, element: 'poison', anim: 'void', effect: 'poison', effectChance: 0.7, special: 'tornado', category: 'control', energyCost: 56, cooldownTurns: 2 },
  plague_bloom: { name: 'Hoa dịch hạch', dmgMul: 2.5, element: 'poison', anim: 'curse', effect: 'poison', effectChance: 0.8, aoe: true, special: 'poison_spider', category: 'attack', energyCost: 58, cooldownTurns: 3 },
  void_harvest: { name: 'Thu hoạch hư vô', dmgMul: 2.8, element: 'poison', anim: 'void', effect: 'poison', effectChance: 0.75, special: 'shadow_burst', category: 'attack', energyCost: 60, cooldownTurns: 3 },
  aurora_surge: { name: 'Dồn sáng bắc cực', dmgMul: 2.6, element: 'storm', anim: 'aurora_surge', effect: 'slow', effectChance: 0.7, aoe: true, special: 'aurora_surge', category: 'control', energyCost: 58, cooldownTurns: 2 },
  cyclone_rend: { name: 'Xé lốc xoáy', dmgMul: 2.7, element: 'storm', anim: 'tornado', effect: 'vortex', effectChance: 0.65, special: 'tornado', category: 'control', energyCost: 56, cooldownTurns: 2 },
  sky_breaker: { name: 'Phá trời', dmgMul: 2.8, element: 'storm', anim: 'sandstorm', effect: 'knockback', effectChance: 0.7, aoe: true, special: 'tornado', category: 'control', energyCost: 60, cooldownTurns: 3 },
  cosmic_wind: { name: 'Gió vũ trụ', dmgMul: 2.9, element: 'storm', anim: 'tornado', effect: 'vortex', effectChance: 0.75, aoe: true, special: 'aurora_surge', category: 'attack', energyCost: 60, cooldownTurns: 3 },
  earth_split: { name: 'Địa vỡ', dmgMul: 2.7, element: 'earth', anim: 'earthquake', effect: 'stun', effectChance: 0.65, aoe: true, special: 'earth_split', category: 'control', energyCost: 58, cooldownTurns: 2 },
  mountain_crush: { name: 'Núi đè', dmgMul: 2.8, element: 'earth', anim: 'earthquake', effect: 'stun', effectChance: 0.6, special: 'earth_split', category: 'attack', energyCost: 56, cooldownTurns: 2 },
  stone_rain: { name: 'Mưa đá', dmgMul: 2.5, element: 'earth', anim: 'quake', effect: 'stun', effectChance: 0.55, aoe: true, special: 'stomp', category: 'control', energyCost: 54, cooldownTurns: 2 },
  tidal_rush: { name: 'Sóng nước xô', dmgMul: 2.6, element: 'water', anim: 'water', effect: 'slow', effectChance: 0.65, aoe: true, special: 'tidal_rush', category: 'attack', energyCost: 56, cooldownTurns: 2 },
  abyss_surge: { name: 'Dâng vực sâu', dmgMul: 2.7, element: 'water', anim: 'water', effect: 'slow', effectChance: 0.6, special: 'tidal_rush', category: 'control', energyCost: 55, cooldownTurns: 2 },
  sea_curse: { name: 'Nguyền biển sâu', dmgMul: 2.8, element: 'water', anim: 'water', effect: 'slow', effectChance: 0.7, aoe: true, special: 'tidal_rush', category: 'attack', energyCost: 58, cooldownTurns: 3 },
  // === BOSS-EXCLUSIVE SKILLS (có hiệu ứng đặc biệt trong monsterUseSkill) ===
  flash_strike: { name: 'Chớp nhoáng', dmgMul: 2.5, element: 'thunder', anim: 'flash_strike', effect: 'stun', effectChance: 0.3, special: 'flash', category: 'control', energyCost: 48, cooldownTurns: 2 },
  thunder_bolt: { name: 'Sét đánh', dmgMul: 3.0, element: 'thunder', anim: 'thunder_bolt', effect: 'stun', effectChance: 0.4, aoe: true, category: 'attack', energyCost: 52, cooldownTurns: 2 },
  knockback_blast: { name: 'Đẩy lùi', dmgMul: 1.8, element: 'storm', anim: 'knockback', effect: 'knockback', effectChance: 0.8, special: 'knockback', category: 'control', energyCost: 50, cooldownTurns: 2 },
  ground_stomp: { name: 'Giậm đất', dmgMul: 2.6, element: 'earth', anim: 'ground_stomp', effect: 'stun', effectChance: 0.3, aoe: true, special: 'stomp', category: 'control', energyCost: 60, cooldownTurns: 3 },
  fire_breath: { name: 'Phun lửa', dmgMul: 2.8, element: 'fire', anim: 'fire_breath', effect: 'burn', effectChance: 0.6, aoe: true, category: 'attack', energyCost: 52, cooldownTurns: 2 },
  meteor_storm: { name: 'Mưa sao băng', dmgMul: 3.2, element: 'fire', anim: 'meteor_storm', effect: 'burn', effectChance: 0.5, aoe: true, special: 'meteor', category: 'attack', energyCost: 60, cooldownTurns: 3 },
  giant_storm: { name: 'Đại bão', dmgMul: 3.4, element: 'storm', anim: 'giant_storm', effect: 'vortex', effectChance: 0.6, aoe: true, category: 'attack', energyCost: 60, cooldownTurns: 3 },
  dash_strike: { name: 'Tốc biến', dmgMul: 2.4, element: 'thunder', anim: 'dash_strike', effect: 'stun', effectChance: 0.35, special: 'dash', category: 'control', energyCost: 48, cooldownTurns: 2 },
  fire_eruption: { name: 'Cầu lửa khổng lồ', dmgMul: 3.0, element: 'fire', anim: 'fire_eruption', effect: 'burn', effectChance: 0.7, aoe: true, special: 'meteor', category: 'attack', energyCost: 60, cooldownTurns: 3 },
  ice_rain: { name: 'Mưa băng', dmgMul: 2.4, element: 'ice', anim: 'ice_rain', effect: 'freeze', effectChance: 0.75, aoe: true, special: 'ice_rain', category: 'attack', energyCost: 60, cooldownTurns: 3 },
  whirlwind: { name: 'Siêu lốc', dmgMul: 2.6, element: 'storm', anim: 'whirlwind', effect: 'vortex', effectChance: 0.6, aoe: true, special: 'tornado', category: 'control', energyCost: 60, cooldownTurns: 3 },
  poison_web: { name: 'Nhện độc', dmgMul: 2.3, element: 'poison', anim: 'poison_web', effect: 'poison', effectChance: 0.8, aoe: true, special: 'poison_spider', category: 'attack', energyCost: 60, cooldownTurns: 3 },
  // === NEW BOSS SKILLS (pet ultimate equivalents) ===
  triple_true_fire: { name: 'Tam Muội Chân Hỏa', dmgMul: 3.5, element: 'fire', anim: 'hellfire', effect: 'searing_flame', effectChance: 0.9, aoe: true, special: 'volcano_wave', category: 'attack', energyCost: 60, cooldownTurns: 3 },
  storm_fury: { name: 'Phong Bão Tố', dmgMul: 3.4, element: 'storm', anim: 'tornado', effect: 'vortex', effectChance: 0.8, aoe: true, special: 'tornado', category: 'attack', energyCost: 60, cooldownTurns: 3 },
  thunder_vanguard: { name: 'Sấm Sét Tiên Phong', dmgMul: 3.2, element: 'thunder', anim: 'celestial', effect: 'stun', effectChance: 0.7, aoe: true, special: 'thunder_arc', category: 'control', energyCost: 58, cooldownTurns: 3 },
  dragon_18_palm: { name: 'Hàng Long Thập Bát Chưởng', dmgMul: 3.0, element: 'earth', anim: 'dragon_palm', effect: 'stun', effectChance: 0.6, aoe: true, special: 'earth_split', category: 'attack', energyCost: 58, cooldownTurns: 3 },
  poison_trap: { name: 'Bẫy Độc', dmgMul: 2.8, element: 'poison', anim: 'poison_web', effect: 'poison', effectChance: 0.9, aoe: true, special: 'poison_spider', category: 'attack', energyCost: 60, cooldownTurns: 3 },
  chibaku_tensei: { name: 'Chibaku Tensei', dmgMul: 3.8, element: 'earth', anim: 'chibaku_tensei', effect: 'gravity', effectChance: 0.8, aoe: true, special: 'stomp', category: 'attack', energyCost: 65, cooldownTurns: 4 },
  // === BEAUTIFUL NEW AOE SKILLS ===
  diamond_dust: { name: 'Bụi Kim Cương', dmgMul: 2.8, element: 'ice', anim: 'blizzard', effect: 'freeze', effectChance: 0.7, aoe: true, special: 'ice_rain', category: 'attack', energyCost: 58, cooldownTurns: 2 },
  flame_orb: { name: 'Hỏa Cầu Diệt Thế', dmgMul: 3.0, element: 'fire', anim: 'inferno', effect: 'burn', effectChance: 0.8, aoe: true, special: 'volcano_wave', category: 'attack', energyCost: 60, cooldownTurns: 3 },
  cosmic_cleave: { name: 'Trảm Tinh Hà', dmgMul: 3.2, element: 'thunder', anim: 'celestial', effect: 'stun', effectChance: 0.6, aoe: true, special: 'thunder_arc', category: 'attack', energyCost: 62, cooldownTurns: 3 },
  abyssal_bubble: { name: 'Vực Sâu Sủi Bọt', dmgMul: 2.6, element: 'water', anim: 'water', effect: 'slow', effectChance: 0.8, aoe: true, special: 'tidal_rush', category: 'attack', energyCost: 56, cooldownTurns: 2 },
  blood_moon: { name: 'Trăng Máu', dmgMul: 3.4, element: 'poison', anim: 'void', effect: 'poison', effectChance: 0.9, aoe: true, special: 'shadow_burst', category: 'attack', energyCost: 64, cooldownTurns: 3 },
  petrifying_gaze: { name: 'Ánh Mắt Hóa Đá', dmgMul: 2.4, element: 'earth', anim: 'earthquake', effect: 'stun', effectChance: 0.5, aoe: true, special: 'stomp', category: 'control', energyCost: 54, cooldownTurns: 2 },
};

let _monsterIdCounter = 0;

function getElementSkillCandidates(element) {
  const pools = {
    fire: ['flame', 'inferno', 'darkfire', 'dragonbreath', 'hellfire', 'ember_wave', 'flame_orb'],
    ice: ['freeze', 'blizzard', 'permafrost', 'frostbite', 'iceshard', 'diamond_dust', 'frostnova'],
    wood: ['vine', 'root', 'forestwrath', 'overgrowth', 'ancientpower', 'vine_barrage'],
    thunder: ['thunderstorm', 'chainlightning', 'flash_strike', 'dash_strike', 'thunder_bolt', 'cosmic_cleave', 'thunder_arc'],
    poison: ['plague', 'darkpulse', 'nightmare', 'voidtear', 'chaoswave', 'blood_moon', 'shadow_burst'],
    storm: ['tornado', 'hurricane', 'whirlwind', 'knockback_blast', 'giant_storm', 'aurora_surge'],
    earth: ['earthquake', 'smash', 'ground_stomp', 'fissure', 'rockslide', 'earth_split', 'petrifying_gaze'],
    water: ['chaoswave', 'freeze', 'blizzard', 'frostbite', 'ice_rain', 'tidal_rush', 'abyssal_bubble']
  };
  return (pools[element] || pools.fire).map(id => MONSTER_SKILLS[id]).filter(Boolean);
}

function getRandomMonsterSkills(monster, desiredCount = 1) {
  const base = monster.monsterSkill ? [monster.monsterSkill] : [];
  const candidates = getElementSkillCandidates(monster.element || 'fire').filter(skill => !base.some(item => item.name === skill.name));
  const picked = [...base];
  while (picked.length < desiredCount && candidates.length > 0) {
    const idx = Math.floor(Math.random() * candidates.length);
    picked.push(candidates.splice(idx, 1)[0]);
  }
  return picked.filter(Boolean);
}

function getMonsterCombatStyle(template) {
  const id = template.id;
  const tankIds = ['bearcub', 'brownbear', 'orc', 'icegolem', 'woodgiant', 'frostguard', 'frostgod', 'forestgod'];
  const rangedIds = ['rat', 'plant', 'icesnake', 'icemaiden', 'lesserdemon', 'celestial', 'eternalice', 'overgod'];
  if (tankIds.includes(id)) return 'tank';
  if (rangedIds.includes(id)) return 'ranged';
  return 'melee';
}

function spawnMonster(playerLevel, playerPets) {
  const avgPetLvl = playerPets.length > 0
    ? Math.floor(playerPets.reduce((s, p) => s + p.level, 0) / playerPets.length)
    : playerLevel;

  const totalPower = playerPets.reduce((s, p) => s + p.getPower(), 0);

  let tierIdx = Math.min(Math.floor(Math.max(1, avgPetLvl) / 10), MONSTER_TEMPLATES.length - 1);
  const tierData = MONSTER_TEMPLATES[tierIdx];
  const tmpl = tierData.list[Math.floor(Math.random() * tierData.list.length)];

  const lvl = Math.max(tmpl.minLvl || 1, avgPetLvl + Math.floor(Math.random() * 5) - 1);
  const scale = 1 + (lvl - 1) * 0.06;
  const isMutant = Math.random() < 0.15 + Math.min(0.3, avgPetLvl * 0.003);

  const combatStyle = getMonsterCombatStyle(tmpl);
  let hp = Math.floor((90 + lvl * 5) * tmpl.hpMul * scale * (isMutant ? 1.6 : 1) * 10);
  let atk = Math.floor((15 + lvl * 2) * tmpl.atkMul * scale * (isMutant ? 1.3 : 1));
  let def = Math.floor((12 + lvl * 1.5) * tmpl.defMul * scale * (isMutant ? 1.3 : 1));
  const spd = Math.floor((12 + lvl * 1.2) * tmpl.spdMul * scale * (isMutant ? 1.1 : 1));

  if (combatStyle === 'tank') {
    hp = Math.floor(hp * 1.25);
    atk = Math.floor(atk * 0.9);
    def = Math.floor(def * 1.3);
  } else if (combatStyle === 'ranged') {
    hp = Math.floor(hp * 0.9);
    atk = Math.floor(atk * 1.15);
    def = Math.floor(def * 0.85);
  }

  const mon = new Pet({
    baseId: tmpl.id,
    name: isMutant ? `${tmpl.name} biến dị` : tmpl.name,
    type: tmpl.type,
    emoji: tmpl.emoji,
    desc: isMutant ? `Biến dị cấp ${lvl}` : `Cấp ${lvl}`,
    level: lvl,
    atk, def, spd, hp, maxHp: hp,
    energy: 999,
    owner: 'monster'
  });
  mon.isMonster = true;
  mon.isMutant = isMutant;
  mon.tier = tierIdx + 1;
  mon.element = tmpl.element || 'fire';
  mon.combatStyle = combatStyle;
  mon.monsterSkill = null;
  mon.monsterSkills = [];
  mon.monsterSkillCd = 0;
  mon.monsterSkillCooldowns = {};
  mon.bossScale = tmpl.scale || 0.7; // Scale dùng cho pixel art
  // Damage resistance from battle.js
  // Melee vs ranged
  const rangedTypes = ['mystic', 'dragon', 'elemental', 'god', 'divine', 'chaos', 'void', 'creator', 'destroyer', 'ancient', 'ghost', 'mythic', 'bird', 'plant', 'elemental'];
  mon.attackRange = combatStyle === 'ranged' ? 2 : (rangedTypes.includes(tmpl.type) ? 2 : 1);
  mon.gridCol = mon.attackRange === 1 ? 5 : 6;
  mon.gridRow = 1 + Math.floor(Math.random() * 3);
  mon.id = 'mon_' + (++_monsterIdCounter) + '_' + Date.now();

  return mon;
}

function spawnMonsterPack(playerLevel, playerPets, count = 1) {
  const pack = [];
  for (let i = 0; i < count; i++) {
    pack.push(spawnMonster(playerLevel, playerPets));
  }
  return pack;
}

// Tạo boss cho world map với hệ thống cấp bậc
function spawnWorldBoss(playerLevel, playerPets, mapId, killCount) {
  const avgPetLvl = playerPets.length > 0
    ? Math.floor(playerPets.reduce((s, p) => s + p.level, 0) / playerPets.length)
    : playerLevel;

  const bossLvl = avgPetLvl + 3 + Math.floor(Math.random() * 3);
  const tmpl = getMapBossTemplate(mapId || 1);
  const bossTier = getBossTier(killCount || 0);
  const tierIdx = BOSS_TIERS.indexOf(bossTier);

  const rangeType = tmpl.rangeType || 1;
  const roleMap = {
    1: { role: 'melee',  hp: 1.15, atk: 1.15, def: 1.30, spd: 1.00, range: 1 },
    2: { role: 'ranged', hp: 1.08, atk: 1.20, def: 1.15, spd: 1.10, range: 2 },
    3: { role: 'magic',  hp: 1.02, atk: 1.30, def: 1.05, spd: 1.15, range: 3 }
  };
  const roleProfile = roleMap[rangeType];
  const role = roleProfile.role;

  // Base stats
  let hp = Math.floor((120 + bossLvl * 30) * 10 * bossTier.hpMul * roleProfile.hp);
  let atk = Math.floor((12 + bossLvl * 4) * bossTier.statMul * roleProfile.atk);
  let def = Math.floor((8 + bossLvl * 2.5) * bossTier.statMul * roleProfile.def);
  let spd = Math.floor((10 + bossLvl * 1.5) * bossTier.statMul * roleProfile.spd);

  // Global boss stat multiplier requested: x10 to HP, DEF, and SPD
  if (true) {
    hp = Math.floor(hp * 10);
    def = Math.floor(def * 10);
    spd = Math.floor(spd * 10);
  }
  // Boss type scale with tier multiplier, capped for rendering sanity
  const visualScale = Math.min(tmpl.scale * bossTier.scaleMul, 8);

  const bossTitle = tierIdx > 0 ? `${bossTier.title} ${bossTier.name}` : bossTier.name;
  const boss = new Pet({
    baseId: `${tmpl.id}_${bossTier.id}`,
    name: `${bossTier.title} ${tmpl.name}`,
    type: tmpl.type,
    emoji: tmpl.emoji,
    desc: `${bossTitle} cấp ${bossLvl}`,
    level: bossLvl,
    atk, def, spd, hp, maxHp: hp,
    energy: 999,
    owner: 'monster'
  });
  boss.isMonster = true;
  boss.isMutant = false;
  boss.isBoss = true;
  boss._bossTier = bossTier.id;
  boss._bossTierIdx = tierIdx;
  boss.tier = Math.floor(bossLvl / 10) + 1;
  boss.element = tmpl.element || 'fire';
  const signatureSkill = MONSTER_SKILLS[tmpl.skill] || { name: 'Tấn công', dmgMul: 1.5, element: tmpl.element || 'fire', anim: 'slam', effect: null };
  boss.monsterSkill = signatureSkill;
  const bossSkillCount = bossTier.id === 'normal' ? 2 : bossTier.id === 'leader' ? 3 : 5;
  boss.monsterSkills = getRandomMonsterSkills({ ...boss, monsterSkill: signatureSkill }, bossSkillCount);
  // Shuffle skills để mỗi lần spawn boss có primary skill khác nhau, tránh lặp cycle
  for (let i = boss.monsterSkills.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [boss.monsterSkills[i], boss.monsterSkills[j]] = [boss.monsterSkills[j], boss.monsterSkills[i]];
  }
  boss.monsterSkill = boss.monsterSkills[0] || signatureSkill;
  boss.monsterSkillCd = 0;
  boss.monsterSkillCooldowns = {};
  boss._bossSkillDelay = 0;
  boss.bossScale = visualScale;
  boss.bossRole = role;
  boss.rangeType = rangeType;
  boss.bossRoleProfile = roleProfile;
  // Increase boss energy pool x10 and starting energy accordingly
  boss.maxBattleEnergy = 120 * 10;
  boss.battleEnergy = Math.min(400, Math.floor(boss.maxBattleEnergy * 0.35));
  boss.attackRange = roleProfile.range;
  boss.gridCol = 6;
  boss.gridRow = 2;
  boss.id = 'wb_' + (++_monsterIdCounter) + '_' + Date.now();

  return boss;
}
