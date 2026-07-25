const DATA = {
  PET_TYPES: {
    animal: {
      name: 'Động vật dễ thương',
      emoji: '🐾',
      color: '#FF9E9E',
      list: [
        { id: 'tho', name: 'Thỏ', emoji: '🐰', desc: 'Nhanh nhẹn và đáng yêu' },
        { id: 'meo', name: 'Mèo', emoji: '🐱', desc: 'Tinh nghịch và thông minh' },
        { id: 'cho', name: 'Chó', emoji: '🐶', desc: 'Trung thành và dũng cảm' },
        { id: 'gautruc', name: 'Gấu trúc', emoji: '🐼', desc: 'Đáng yêu và mạnh mẽ' },
        { id: 'cuu', name: 'Cừu', emoji: '🐑', desc: 'Hiền lành và bền bỉ' }
      ]
    },
    mystical: {
      name: 'Sinh vật huyền bí',
      emoji: '✨',
      color: '#B388FF',
      list: [
        { id: 'rong', name: 'Rồng', emoji: '🐉', desc: 'Uy lực và huyền thoại' },
        { id: 'kylan', name: 'Kỳ lân', emoji: '🦄', desc: 'Thuần khiết và ma thuật' },
        { id: 'phuonghoang', name: 'Phượng hoàng', emoji: '🔥', desc: 'Bất tử và rực lửa' },
        { id: 'kynhong', name: 'Kỳ nhông', emoji: '🦎', desc: 'Huyền bí và linh hoạt' },
        { id: 'macarong', name: 'Ma cà rồng', emoji: '🧛', desc: 'Bóng tối và quyền năng' }
      ]
    },
    robot: {
      name: 'Robot',
      emoji: '🤖',
      color: '#82B1FF',
      list: [
        { id: 'robotchienthan', name: 'Robot chiến đấu', emoji: '⚔️', desc: 'Mạnh mẽ và chính xác' },
        { id: 'robothiemhiem', name: 'Robot thám hiểm', emoji: '🔍', desc: 'Khám phá và thích nghi' },
        { id: 'robotvutru', name: 'Robot vũ trụ', emoji: '🚀', desc: 'Công nghệ cao và tốc độ' },
        { id: 'ninjarobot', name: 'Ninja robot', emoji: '🥷', desc: 'Nhanh nhẹn và tàng hình' },
        { id: 'robotkhonglo', name: 'Robot khổng lồ', emoji: '🏗️', desc: 'Khổng lồ và sức mạnh' }
      ]
    },
    ice: {
      name: 'Băng',
      emoji: '❄️',
      color: '#80DEEA',
      list: [
        { id: 'bangtinh', name: 'Băng tinh', emoji: '❄️', desc: 'Tinh thể băng giá thuần khiết' },
        { id: 'tuyetnhan', name: 'Tuyết nhân', emoji: '⛄', desc: 'Người tuyết khổng lồ' },
        { id: 'haicau', name: 'Hải cẩu băng', emoji: '🦭', desc: 'Hải cẩu vùng cực' },
        { id: 'kylanbang', name: 'Kỳ lân băng', emoji: '🦄', desc: 'Kỳ lân với sừng băng vĩnh cửu' },
        { id: 'rongbang', name: 'Rồng băng', emoji: '🐉', desc: 'Rồng thở hơi lạnh đóng băng mọi thứ' }
      ]
    },
    wood: {
      name: 'Mộc',
      emoji: '🌿',
      color: '#66BB6A',
      list: [
        { id: 'caynon', name: 'Cây non', emoji: '🌱', desc: 'Mầm cây nhỏ nhưng đầy sức sống' },
        { id: 'hoathit', name: 'Hoa ăn thịt', emoji: '🌺', desc: 'Hoa khổng lồ săn mồi' },
        { id: 'tinhlam', name: 'Tinh lâm', emoji: '🧚', desc: 'Tinh linh canh giữ rừng già' },
        { id: 'nguoicay', name: 'Người cây', emoji: '🌳', desc: 'Cây cổ thụ biết đi' },
        { id: 'rongcay', name: 'Rồng cây', emoji: '🐲', desc: 'Rồng từ rừng nguyên sinh' }
      ]
    },
    storm: {
      name: 'Bão',
      emoji: '🌪️',
      color: '#4DD0E1',
      list: [
        { id: 'baobien', name: 'Bão biển', emoji: '🌊', desc: 'Bão khổng lồ đến từ đại dương' },
        { id: 'locsay', name: 'Lốc xoáy', emoji: '🌪️', desc: 'Vòi rồng hủy diệt mọi thứ' },
        { id: 'gioloc', name: 'Gió lốc', emoji: '💨', desc: 'Cơn lốc nhanh như cắt' },
        { id: 'maybao', name: 'Mây bão', emoji: '⛈️', desc: 'Mây đen mang theo giông tố' },
        { id: 'sieubao', name: 'Siêu bão', emoji: '🌀', desc: 'Sức mạnh thiên nhiên hủy diệt' }
      ]
    }
  },

  STAT_NAMES: {
    atk: 'Tấn công',
    def: 'Phòng thủ',
    spd: 'Tốc độ',
    hp: 'Máu',
    energy: 'Năng lượng',
    affinity: 'Thân thiết'
  },

  MAX_LEVEL: 500,
  BREED_INTERVAL: 50,
  BREED_START_LEVEL: 100,

  ITEMS: {
    food: [
      { id: 'thucan1', name: '🥩 Thịt tươi', price: 100, stat: 'atk', value: 5, exp: 20 },
      { id: 'thucan2', name: '🥗 Rau xanh', price: 80, stat: 'def', value: 5, exp: 20 },
      { id: 'thucan3', name: '🍎 Trái cây', price: 60, stat: 'spd', value: 3, exp: 15 },
      { id: 'thucan4', name: '🍖 Xương', price: 120, stat: 'atk', value: 8, exp: 30 },
      { id: 'thucan5', name: '🥛 Sữa', price: 50, stat: 'hp', value: 10, exp: 10 }
    ],
    bath: [
      { id: 'tam1', name: '🛁 Sữa tắm', price: 80, energy: 30 },
      { id: 'tam2', name: '🧴 Dầu gội', price: 120, energy: 50 },
      { id: 'tam3', name: '🌸 Nước hoa', price: 200, energy: 80 }
    ],
    buff: [
      { id: 'buff1', name: '⚡ Tăng sát thương', price: 150, type: 'atk', value: 1.5, turns: 3 },
      { id: 'buff2', name: '❤️ Hồi máu', price: 100, type: 'heal', value: 30, turns: 1 },
      { id: 'buff3', name: '🛡️ Tăng phòng thủ', price: 120, type: 'def', value: 2.0, turns: 3 }
    ]
  },

  SHOP_PETS: [
    { id: 'tho', name: 'Thỏ', type: 'animal', price: 500, emoji: '🐰' },
    { id: 'meo', name: 'Mèo', type: 'animal', price: 800, emoji: '🐱' },
    { id: 'cho', name: 'Chó', type: 'animal', price: 1000, emoji: '🐶' },
    { id: 'gautruc', name: 'Gấu trúc', type: 'animal', price: 2000, emoji: '🐼' },
    { id: 'cuu', name: 'Cừu', type: 'animal', price: 600, emoji: '🐑' },
    { id: 'rong', name: 'Rồng', type: 'mystical', price: 5000, emoji: '🐉' },
    { id: 'kylan', name: 'Kỳ lân', type: 'mystical', price: 4000, emoji: '🦄' },
    { id: 'phuonghoang', name: 'Phượng hoàng', type: 'mystical', price: 6000, emoji: '🔥' },
    { id: 'kynhong', name: 'Kỳ nhông', type: 'mystical', price: 3000, emoji: '🦎' },
    { id: 'macarong', name: 'Ma cà rồng', type: 'mystical', price: 5500, emoji: '🧛' },
    { id: 'robotchienthan', name: 'Robot chiến đấu', type: 'robot', price: 3500, emoji: '⚔️' },
    { id: 'robothiemhiem', name: 'Robot thám hiểm', type: 'robot', price: 2800, emoji: '🔍' },
    { id: 'robotvutru', name: 'Robot vũ trụ', type: 'robot', price: 4500, emoji: '🚀' },
    { id: 'ninjarobot', name: 'Ninja robot', type: 'robot', price: 3800, emoji: '🥷' },
    { id: 'robotkhonglo', name: 'Robot khổng lồ', type: 'robot', price: 5000, emoji: '🏗️' },
    { id: 'bangtinh', name: 'Băng tinh', type: 'ice', price: 1800, emoji: '❄️' },
    { id: 'tuyetnhan', name: 'Tuyết nhân', type: 'ice', price: 2500, emoji: '⛄' },
    { id: 'haicau', name: 'Hải cẩu băng', type: 'ice', price: 2200, emoji: '🦭' },
    { id: 'kylanbang', name: 'Kỳ lân băng', type: 'ice', price: 4500, emoji: '🦄' },
    { id: 'rongbang', name: 'Rồng băng', type: 'ice', price: 5800, emoji: '🐉' },
    { id: 'caynon', name: 'Cây non', type: 'wood', price: 400, emoji: '🌱' },
    { id: 'hoathit', name: 'Hoa ăn thịt', type: 'wood', price: 1200, emoji: '🌺' },
    { id: 'tinhlam', name: 'Tinh lâm', type: 'wood', price: 2800, emoji: '🧚' },
    { id: 'nguoicay', name: 'Người cây', type: 'wood', price: 3500, emoji: '🌳' },
    { id: 'rongcay', name: 'Rồng cây', type: 'wood', price: 5200, emoji: '🐲' },
    { id: 'baobien', name: 'Bão biển', type: 'storm', price: 3200, emoji: '🌊' },
    { id: 'locsay', name: 'Lốc xoáy', type: 'storm', price: 3500, emoji: '🌪️' },
    { id: 'gioloc', name: 'Gió lốc', type: 'storm', price: 2800, emoji: '💨' },
    { id: 'maybao', name: 'Mây bão', type: 'storm', price: 4000, emoji: '⛈️' },
    { id: 'sieubao', name: 'Siêu bão', type: 'storm', price: 5500, emoji: '🌀' }
  ],

  EQUIPMENT: {
    weapons: [
      { id: 'dagger', name: '🔪 Dao găm', tier: 1, atkMin: 5, atkMax: 15, element: null, price: 300 },
      { id: 'sword', name: '⚔️ Kiếm sắt', tier: 2, atkMin: 10, atkMax: 25, element: null, price: 600 },
      { id: 'axe', name: '🪓 Rìu chiến', tier: 2, atkMin: 15, atkMax: 35, element: null, price: 800 },
      { id: 'spear', name: '🔱 Thương', tier: 2, atkMin: 12, atkMax: 28, element: null, price: 700 },
      { id: 'bow', name: '🏹 Cung', tier: 3, atkMin: 18, atkMax: 40, element: null, price: 1200 },
      { id: 'staff', name: '🪄 Pháp trượng', tier: 3, atkMin: 20, atkMax: 38, element: 'magic', price: 1300 },
      { id: 'fire_sword', name: '🔥 Kiếm lửa', tier: 3, atkMin: 22, atkMax: 42, element: 'fire', price: 1500 },
      { id: 'ice_blade', name: '❄️ Kiếm băng', tier: 3, atkMin: 22, atkMax: 42, element: 'ice', price: 1500 },
      { id: 'hammer', name: '🔨 Búa chiến', tier: 3, atkMin: 25, atkMax: 45, element: 'earth', price: 1600 },
      { id: 'laser_gun', name: '🔫 Súng laser', tier: 4, atkMin: 30, atkMax: 60, element: 'thunder', price: 2500 },
      { id: 'poison_dagger', name: '☠️ Dao độc', tier: 4, atkMin: 28, atkMax: 55, element: 'poison', price: 2200 },
      { id: 'crystal_staff', name: '💎 Trượng pha lê', tier: 4, atkMin: 32, atkMax: 58, element: 'magic', price: 2600 },
      { id: 'thunder_axe', name: '⛈️ Rìu sấm', tier: 4, atkMin: 35, atkMax: 62, element: 'thunder', price: 2800 },
      { id: 'void_blade', name: '🌀 Kiếm hư vô', tier: 5, atkMin: 45, atkMax: 80, element: 'poison', price: 4000 },
      { id: 'dragon_sword', name: '🐉 Kiếm rồng', tier: 5, atkMin: 50, atkMax: 85, element: 'fire', price: 4500 },
      { id: 'cannon', name: '💥 Đại bác', tier: 5, atkMin: 55, atkMax: 100, element: null, price: 5000 },
      { id: 'heavenly_blade', name: '✨ Kiếm thánh', tier: 5, atkMin: 48, atkMax: 90, element: 'magic', price: 4800 },
      { id: 'star_hammer', name: '⭐ Búa sao', tier: 5, atkMin: 52, atkMax: 95, element: 'thunder', price: 5200 },
      { id: 'frost_spear', name: '🧊 Thương băng', tier: 5, atkMin: 46, atkMax: 82, element: 'ice', price: 4200 },
      { id: 'nature_bow', name: '🌿 Cung thiên nhiên', tier: 5, atkMin: 44, atkMax: 78, element: 'wood', price: 4000 },
    ],
    armors: [
      { id: 'cloth_armor', name: '🛡️ Áo vải', tier: 1, defMin: 5, defMax: 12, dodge: 0.01, price: 200 },
      { id: 'leather_armor', name: '🛡️ Áo da', tier: 1, defMin: 8, defMax: 15, dodge: 0.02, price: 300 },
      { id: 'iron_armor', name: '🪖 Giáp sắt', tier: 2, defMin: 12, defMax: 25, dodge: 0.01, price: 600 },
      { id: 'chainmail', name: '⛓️ Giáp xích', tier: 2, defMin: 15, defMax: 28, dodge: 0.02, price: 800 },
      { id: 'gold_armor', name: '🛡️ Giáp vàng', tier: 3, defMin: 20, defMax: 38, dodge: 0.02, price: 1200 },
      { id: 'diamond_armor', name: '💎 Giáp kim cương', tier: 3, defMin: 25, defMax: 45, dodge: 0.03, price: 2000 },
      { id: 'dragon_armor', name: '🐉 Giáp rồng', tier: 4, defMin: 35, defMax: 60, dodge: 0.04, price: 3500 },
      { id: 'shadow_armor', name: '🌑 Giáp bóng tối', tier: 4, defMin: 30, defMax: 55, dodge: 0.05, price: 3200 },
      { id: 'mythic_armor', name: '🔮 Giáp huyền thoại', tier: 5, defMin: 50, defMax: 100, dodge: 0.04, price: 6000 },
      { id: 'heavenly_armor', name: '👼 Giáp thiên thần', tier: 5, defMin: 55, defMax: 90, dodge: 0.06, price: 6500 },
    ]
  },

  COSTUMES: [
    { id: 'thuong', name: 'Thường phục', desc: 'Trang phục cơ bản', emoji: '🧑', color: '#88FF88', price: 0 },
    { id: 'hiepsi', name: 'Hiệp sĩ', desc: 'Giáp sáng chói', emoji: '⚔️', color: '#FFD700', price: 50 },
    { id: 'phapsu', name: 'Pháp sư', desc: 'Áo choàng huyền bí', emoji: '🔮', color: '#B388FF', price: 100 },
    { id: 'ninja', name: 'Ninja', desc: 'Trang phục bóng đêm', emoji: '🥷', color: '#FF4444', price: 150 },
    { id: 'vuonggia', name: 'Vương giả', desc: 'Trang phục xa hoa', emoji: '👑', color: '#FFD700', price: 300 },
    { id: 'thienthan', name: 'Thiên thần', desc: 'Đôi cánh trắng tinh', emoji: '👼', color: '#FFFFFF', price: 500 }
  ],

  MAX_SKILL_SLOTS: 5,

  SKILL_PRICES: {
    1: 500,
    2: 1200,
    3: 2500,
    4: 5000,
    5: 8000
  },

  SKILL_TIER_RANGES: [
    { tier: 1, maxIdx: 5 },
    { tier: 2, maxIdx: 12 },
    { tier: 3, maxIdx: 20 },
    { tier: 4, maxIdx: 26 },
    { tier: 5, maxIdx: 30 }
  ],

  LEADERBOARD_SIZE: 20,
  STARTING_GOLD: 1000,
  STARTING_DIAMOND: 50
};
