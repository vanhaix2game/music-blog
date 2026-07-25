function lightenColor(hex, amt) {
  let c = parseInt(hex.slice(1), 16);
  let r = Math.min(255, (c >> 16) + amt);
  let g = Math.min(255, ((c >> 8) & 0xff) + amt);
  let b = Math.min(255, (c & 0xff) + amt);
  return `rgb(${r},${g},${b})`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

const ELEMENT_COLORS = {
  fire:   { main: '#FF4400', light: '#FF8844', glow: '#FFD700', dark: '#CC2200' },
  water:  { main: '#00AAFF', light: '#44CCFF', glow: '#88DDFF', dark: '#0077CC' },
  earth:  { main: '#8B6914', light: '#A08530', glow: '#C4A950', dark: '#6B4E0A' },
  thunder:{ main: '#FFD700', light: '#FFFF44', glow: '#FFFFFF', dark: '#CCAA00' },
  poison: { main: '#9B59B6', light: '#BB77DD', glow: '#DD99FF', dark: '#7B3896' },
  ice:    { main: '#80DEEA', light: '#B2EBF2', glow: '#FFFFFF', dark: '#50BECC' },
  wood:   { main: '#00C853', light: '#69F0AE', glow: '#B9F6CA', dark: '#009624' },
  storm:  { main: '#4488CC', light: '#77BBEE', glow: '#AADDFF', dark: '#2266AA' }
};

function getElementForAnim(anim, roleId, baseId) {
  if (anim === 'fireball' || anim === 'flame' || anim === 'inferno' || anim === 'sunfire' || anim === 'hellfire' || anim === 'fire_breath' || anim === 'fire_eruption' || anim === 'meteor_storm' || anim === 'volcanoblast' || anim === 'molten_lance' || anim === 'hellfire_rain' || anim === 'solar_fall' || anim === 'flame_orb' || anim === 'triple_true_fire' || anim === 'ember_wave' || anim === 'dragonbreath' || anim === 'demonrage' || anim === 'rage' || anim === 'annihilate') return 'fire';
  if (anim === 'thunder' || anim === 'thunderbolt' || anim === 'celestial' || anim === 'thunder_bolt' || anim === 'flash_strike' || anim === 'dash_strike' || anim === 'chainlightning' || anim === 'thunder_arc' || anim === 'storm_impact' || anim === 'divine_bolt' || anim === 'lightning_spear' || anim === 'divine' || anim === 'cosmic_cleave' || anim === 'thunder_vanguard') return 'thunder';
  if (anim === 'ice_shard' || anim === 'iceshard' || anim === 'freeze' || anim === 'blizzard' || anim === 'permafrost' || anim === 'absolutezero' || anim === 'eternalwinter' || anim === 'ice_rain' || anim === 'icenova' || anim === 'frostbite' || anim === 'crystal_spike' || anim === 'glacier_spear' || anim === 'frostnova' || anim === 'frost_wreath' || anim === 'diamond_dust' || anim === 'freezing_blast') return 'ice';
  if (anim === 'vine' || anim === 'root' || anim === 'summon' || anim === 'sapling' || anim === 'overgrowth' || anim === 'gaiarage' || anim === 'forestwrath' || anim === 'natureswrath' || anim === 'thornwave' || anim === 'vine_barrage' || anim === 'root_maelstrom' || anim === 'ancient_bloom' || anim === 'jungle_devour' || anim === 'ancientpower') return 'wood';
  if (anim === 'heal' || anim === 'shield' || anim === 'water' || anim === 'holy' || anim === 'tidal_rush' || anim === 'abyss_surge' || anim === 'sea_curse' || anim === 'abyssal_bubble' || anim === 'chaoswave') return 'water';
  if (anim === 'poison' || anim === 'darkbolt' || anim === 'darkfire' || anim === 'curse' || anim === 'drain' || anim === 'void' || anim === 'poison_web' || anim === 'plague' || anim === 'voidtear' || anim === 'darkpulse' || anim === 'nightmare' || anim === 'shadow_burst' || anim === 'venom_tornado' || anim === 'plague_bloom' || anim === 'void_harvest' || anim === 'blood_moon' || anim === 'poison_trap') return 'poison';
  if (anim === 'earthquake' || anim === 'quake' || anim === 'slam' || anim === 'smash' || anim === 'defend' || anim === 'ground_stomp' || anim === 'fissure' || anim === 'rockslide' || anim === 'earth_split' || anim === 'mountain_crush' || anim === 'stone_rain' || anim === 'petrifying_gaze' || anim === 'chibaku_tensei' || anim === 'dragon_18_palm' || anim === 'dragon_palm' || anim === 'axe' || anim === 'claw') return 'earth';
  if (anim === 'storm' || anim === 'tornado' || anim === 'sandstorm' || anim === 'cloud' || anim === 'rain' || anim === 'blizzard' || anim === 'hurricane' || anim === 'fissure' || anim === 'thunderstorm' || anim === 'giant_storm' || anim === 'knockback' || anim === 'whirlwind' || anim === 'cyclone_rend' || anim === 'sky_breaker' || anim === 'cosmic_wind' || anim === 'aurora_surge' || anim === 'storm_fury' || anim === 'howl') return 'storm';
  if (anim === 'chibaku_tensei') return 'earth';
  // Per-pet element via getPetElement
  if (baseId && PET_ELEMENT[baseId]) return PET_ELEMENT[baseId];
  // Fallback by role
  if (roleId === 'melee' || roleId === 'tank') return 'fire';
  if (roleId === 'ranged') return 'thunder';
  if (roleId === 'support') return 'water';
  if (roleId === 'magic') return 'poison';
  return 'fire';
}

const THEME_COLORS = {
  grass: {
    bg: '#1a2a1a', sky: '#0d1f2d',
    ground: ['#3d8b37', '#4a9e44', '#357a30', '#5aad54', '#6bbd64', '#2d7b27'],
    edge: ['#1a3a1a', '#2a4a2a', '#0d2a0d'],
    road: '#5a5a5a',
    water: ['#2a6a8a', '#3a7a9a', '#1a5a7a', '#4a8aaa', '#0a4a6a'],
    tree: { trunk: '#5a3a1a', leaf: '#2d7b27', leaf2: '#3d8b37', leaf3: '#5aad54' },
    decor: ['bush', 'flower', 'rock'],
    decorChance: 0.10,
    ambient: 'rgba(100,180,255,0.06)'
  },
  forest: {
    bg: '#0d1f0d', sky: '#0a1520',
    ground: ['#2d6b27', '#3a7e34', '#256a20', '#4a8e44', '#5a9e54', '#1a5a15'],
    edge: ['#0d2a0d', '#1a3a1a', '#051a05'],
    road: '#4a4a3a',
    water: ['#1a5a6a', '#2a6a7a', '#0a4a5a', '#3a7a8a', '#0a3a4a'],
    tree: { trunk: '#4a2a0a', leaf: '#1d6b17', leaf2: '#2d7b27', leaf3: '#4a8e44' },
    decor: ['bush', 'flower', 'mushroom'],
    decorChance: 0.10,
    ambient: 'rgba(50,120,200,0.05)'
  },
  ice: {
    bg: '#0a1525', sky: '#051525',
    ground: ['#a0d8e8', '#b0e8f8', '#90c8d8', '#c0f0ff', '#d0f8ff', '#80c0d0'],
    edge: ['#1a2a3a', '#2a3a4a', '#0a1a2a'],
    road: '#7a8a9a',
    water: ['#8ac0d0', '#9ad0e0', '#7ab0c0', '#aae0f0', '#6aa0b0'],
    tree: { trunk: '#8a9aaa', leaf: '#c0e8f0', leaf2: '#d0f0ff', leaf3: '#e0f8ff' },
    decor: ['ice_crystal', 'crystal_cluster', 'snow'],
    decorChance: 0.10,
    ambient: 'rgba(180,220,255,0.10)'
  },
  swamp: {
    bg: '#0a150a', sky: '#0a1008',
    ground: ['#3a5a2a', '#4a6a3a', '#2a4a1a', '#5a7a4a', '#6a8a5a', '#1a3a0a'],
    edge: ['#0a1a0a', '#1a2a1a', '#050a05'],
    road: '#3a3a2a',
    water: ['#2a5a3a', '#3a6a4a', '#1a4a2a', '#4a7a5a', '#0a3a1a'],
    tree: { trunk: '#3a2a0a', leaf: '#3a6a2a', leaf2: '#4a7a3a', leaf3: '#5a8a4a' },
    decor: ['mushroom', 'skull', 'bones', 'torch'],
    decorChance: 0.10,
    ambient: 'rgba(80,120,60,0.06)'
  },
  volcanic: {
    bg: '#1a0a0a', sky: '#1a0500',
    ground: ['#5a2a0a', '#6a3a1a', '#4a1a00', '#7a4a2a', '#8a5a3a', '#3a0a00'],
    edge: ['#1a0a00', '#2a1a0a', '#0a0000'],
    road: '#4a2a0a',
    water: ['#5a1a00', '#6a2a0a', '#4a0a00', '#7a3a1a', '#3a0000'],
    tree: { trunk: '#3a1a00', leaf: '#5a2a00', leaf2: '#6a3a0a', leaf3: '#7a4a1a' },
    decor: ['lava', 'rock', 'skull'],
    decorChance: 0.10,
    ambient: 'rgba(255,100,0,0.08)'
  },
  desert: {
    bg: '#1a1a0a', sky: '#1a1808',
    ground: ['#c4a050', '#d4b060', '#b49040', '#e4c070', '#f0d080', '#a48030'],
    edge: ['#2a2a0a', '#3a3a1a', '#1a1a00'],
    road: '#8a7030',
    water: ['#4a6a8a', '#5a7a9a', '#3a5a7a', '#6a8aaa', '#2a4a6a'],
    tree: { trunk: '#6a5a20', leaf: '#8a7a30', leaf2: '#9a8a40', leaf3: '#aa9a50' },
    decor: ['cactus', 'rock', 'skull', 'bones'],
    decorChance: 0.10,
    ambient: 'rgba(255,200,100,0.08)'
  },
  darkforest: {
    bg: '#050510', sky: '#040208',
    ground: ['#1a2a1a', '#2a3a2a', '#0a1a0a', '#3a4a3a', '#4a5a4a', '#0a0a0a'],
    edge: ['#050505', '#0a0a0a', '#000000'],
    road: '#2a2a2a',
    water: ['#0a1a2a', '#1a2a3a', '#050a1a', '#2a3a4a', '#000a1a'],
    tree: { trunk: '#2a1a0a', leaf: '#0a1a0a', leaf2: '#1a2a1a', leaf3: '#050a05' },
    decor: ['skull', 'mushroom', 'bones', 'torch'],
    decorChance: 0.10,
    ambient: 'rgba(30,0,60,0.06)'
  },
  icecave: {
    bg: '#050a15', sky: '#030810',
    ground: ['#6a8aaa', '#7a9aba', '#5a7a9a', '#8aaaca', '#9abad0', '#4a6a8a'],
    edge: ['#0a1525', '#1a2a3a', '#050a15'],
    road: '#4a6a8a',
    water: ['#3a6a8a', '#4a7a9a', '#2a5a7a', '#5a8aaa', '#1a4a6a'],
    tree: { trunk: '#5a7a9a', leaf: '#8aaaca', leaf2: '#9abada', leaf3: '#aacada' },
    decor: ['ice_crystal', 'crystal_cluster', 'snow'],
    decorChance: 0.10,
    ambient: 'rgba(100,180,220,0.06)'
  },
  ancient: {
    bg: '#0a0a05', sky: '#080808',
    ground: ['#4a6a3a', '#5a7a4a', '#3a5a2a', '#6a8a5a', '#7a9a6a', '#2a4a1a'],
    edge: ['#0a1a00', '#1a2a0a', '#000a00'],
    road: '#5a4a3a',
    water: ['#2a5a4a', '#3a6a5a', '#1a4a3a', '#4a7a6a', '#0a3a2a'],
    tree: { trunk: '#3a2a0a', leaf: '#2a5a1a', leaf2: '#3a6a2a', leaf3: '#4a7a3a' },
    decor: ['bush', 'flower', 'mushroom'],
    decorChance: 0.10,
    ambient: 'rgba(100,200,80,0.05)'
  },
  heavenly: {
    bg: '#0a0a1a', sky: '#0a0a2a',
    ground: ['#c0c8e0', '#d0d8f0', '#b0b8d0', '#e0e8ff', '#f0f4ff', '#a0a8c0'],
    edge: ['#1a1a3a', '#2a2a4a', '#0a0a2a'],
    road: '#8a90b0',
    water: ['#6a8ad0', '#7a9ae0', '#5a7ac0', '#8aaaf0', '#4a6ab0'],
    tree: { trunk: '#8a8aaa', leaf: '#c0c8e0', leaf2: '#d0d8f0', leaf3: '#e0e8ff' },
    decor: ['star', 'flower', 'ice_crystal', 'crystal_cluster'],
    decorChance: 0.10,
    ambient: 'rgba(200,200,255,0.10)'
  },
  void: {
    bg: '#050005', sky: '#020002',
    ground: ['#1a0a1a', '#2a1a2a', '#0a000a', '#3a2a3a', '#4a3a4a', '#0a000a'],
    edge: ['#000000', '#050505', '#000000'],
    road: '#1a001a',
    water: ['#0a002a', '#1a003a', '#05001a', '#2a004a', '#00001a'],
    tree: { trunk: '#1a001a', leaf: '#0a000a', leaf2: '#1a0a1a', leaf3: '#050005' },
    decor: ['star', 'skull', 'ice_crystal', 'crystal_cluster'],
    decorChance: 0.10,
    ambient: 'rgba(80,0,120,0.06)'
  }
};

class MapView2D {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;

    this.cols = 36;
    this.rows = 12;
    // Zoom gần full frame — fill canvas, minimal border
    const gap = 4;
    this.tileW = Math.floor((this.W - gap * 2) / this.cols);
    this.tileH = Math.floor((this.H - gap * 2) / this.rows);
    this.offX = Math.floor((this.W - this.cols * this.tileW) / 2);
    this.offY = Math.floor((this.H - this.rows * this.tileH) / 2);

    this.entities = [];
    this.effects = [];
    this.damageTexts = [];
    this.weatherParticles = [];
    this.animTime = 0;
    this.running = false;
    this.lastTime = 0;
    this.tileMap = [];
    this.actionQueue = [];
    this.actionTimer = 0;
    this.playerEntity = null;
    this.shakeTimer = 0;
    this.weatherGust = 0;
    this.visibilityHandler = null;
    this.visibilityHandlerBound = false;
    this.qualityMode = 'high';
    this.effectSharpness = 1.5;
    this.maxEffects = 10;
    this._pendingTimeouts = [];
    this.maxDamageTexts = 5;
    this.maxActionQueue = 2;
    this._renderAccumulator = 0;

    // Zoom state (1-4, mapped to non-linear scales so 4x only slightly > 3x)
    this.zoomLevel = 1;
    this.ZOOM_SCALES = [1, 1.8, 2.5, 2.9];
    this._zoomCX = this.W / 2;
    this._zoomCY = this.H / 2;

    // Player/bot character animation state
    this.charAnim = { type: 'idle', timer: 0, phase: 0 };
    this.charAnimCooldown = 0;

    // Offscreen canvas for background caching (big perf win)
    this._cacheCanvas = null;
    this._cacheDirty = true;

    this.currentTheme = 'grass';
    this.weatherType = 'clear';
    this.weatherIntensity = 0;
    this.lightningFlash = 0;
    this.buildTileMap();
    this.initWeather();
  }

  setTheme(theme) {
    if (theme && THEME_COLORS[theme]) {
      this.currentTheme = theme;
      this.buildTileMap();
      this.initWeather();
      this._cacheDirty = true;
    }
  }

  initWeather() {
    this.weatherType = 'clear';
    this.weatherIntensity = 0;
    this.weatherParticles = [];
  }

  updatePerformanceMode() {
    const totalActors = this.effects.length + this.damageTexts.length + this.actionQueue.length + this.entities.length;
    if (totalActors > 28) {
      this.qualityMode = 'low';
    } else if (totalActors > 16) {
      this.qualityMode = 'medium';
    } else {
      this.qualityMode = 'high';
    }
  }

  getRenderInterval() {
    if (this.qualityMode === 'low') return 0.033;
    if (this.qualityMode === 'medium') return 0.022;
    return 0.016;
  }

  trimVisualCollections() {
    this.updatePerformanceMode();
    if (this.effects.length > this.maxEffects) this.effects.splice(0, this.effects.length - this.maxEffects);
    if (this.damageTexts.length > this.maxDamageTexts) this.damageTexts.splice(0, this.damageTexts.length - this.maxDamageTexts);
    if (this.actionQueue.length > this.maxActionQueue) this.actionQueue.splice(0, this.actionQueue.length - this.maxActionQueue);
  }

  createWeatherParticle(init) {
    const p = {
      x: Math.random() * (this.W + 40) - 20,
      y: init ? Math.random() * this.H : -10,
      speed: 40 + Math.random() * 60,
      wind: -10 + Math.random() * 30,
      size: 1 + Math.random() * 2,
      alpha: 0.3 + Math.random() * 0.5,
      life: 1,
      phase: Math.random() * Math.PI * 2,
      drift: 0.5 + Math.random() * 1.2,
      wobble: Math.random() * Math.PI * 2,
      seed: Math.random() * 10
    };
    if (this.weatherType === 'snow') {
      p.speed = 15 + Math.random() * 25;
      p.wind = 5 + Math.random() * 15;
      p.size = 1.5 + Math.random() * 2.5;
      p.alpha = 0.5 + Math.random() * 0.4;
      p.drift = 0.7 + Math.random() * 1.4;
    } else if (this.weatherType === 'fog') {
      p.speed = 5 + Math.random() * 10;
      p.wind = 3 + Math.random() * 8;
      p.size = 8 + Math.random() * 12;
      p.alpha = 0.05 + Math.random() * 0.08;
      p.drift = 0.2 + Math.random() * 0.6;
    } else if (this.weatherType === 'ash' || this.weatherType === 'sand') {
      p.speed = 20 + Math.random() * 30;
      p.wind = -15 + Math.random() * 10;
      p.size = 1.5 + Math.random() * 2;
      p.drift = 0.8 + Math.random() * 1.1;
    } else if (this.weatherType === 'light') {
      p.speed = 8 + Math.random() * 12;
      p.wind = 0;
      p.size = 2 + Math.random() * 3;
      p.alpha = 0.2 + Math.random() * 0.3;
      p.drift = 0.3 + Math.random() * 0.5;
    } else if (this.weatherType === 'void') {
      p.speed = 10 + Math.random() * 20;
      p.wind = -5 + Math.random() * 10;
      p.size = 2 + Math.random() * 4;
      p.alpha = 0.1 + Math.random() * 0.2;
      p.drift = 0.4 + Math.random() * 0.9;
    }
    return p;
  }

  buildTileMap() {
    const tc = THEME_COLORS[this.currentTheme] || THEME_COLORS.grass;
    this.tileMap = [];
    for (let r = 0; r < this.rows; r++) {
      this.tileMap[r] = [];
      for (let c = 0; c < this.cols; c++) {
        let type = 'grass';
        if (r === 0 || r === this.rows - 1 || c === 0 || c === this.cols - 1) type = 'edge';
        else if (r >= this.rows - 2) type = 'road';
        else {
          const roll = Math.random();
          let cum = 0;
          for (const dec of tc.decor) {
            cum += tc.decorChance / tc.decor.length;
            if (roll < cum) { type = dec; break; }
          }
        }
        this.tileMap[r][c] = { type, variant: Math.floor(Math.random() * 2) };
      }
    }
    this._cacheDirty = true;
  }

  tileToScreen(col, row) {
    return {
      x: this.offX + col * this.tileW + this.tileW / 2,
      y: this.offY + row * this.tileH + this.tileH / 2
    };
  }

  bindVisibilityHandlers() {
    if (this.visibilityHandlerBound || typeof document === 'undefined') return;
    this.visibilityHandler = () => {
      if (document.visibilityState === 'hidden') return;
      this.lastTime = performance.now();
      this.render();
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
    window.addEventListener('focus', this.visibilityHandler);
    window.addEventListener('pageshow', this.visibilityHandler);
    this.visibilityHandlerBound = true;
  }

  detachVisibilityHandlers() {
    if (!this.visibilityHandlerBound || typeof document === 'undefined') return;
    document.removeEventListener('visibilitychange', this.visibilityHandler);
    window.removeEventListener('focus', this.visibilityHandler);
    window.removeEventListener('pageshow', this.visibilityHandler);
    this.visibilityHandlerBound = false;
    this.visibilityHandler = null;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.bindVisibilityHandlers();
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop() {
    this.running = false;
    for (const t of this._pendingTimeouts) clearTimeout(t);
    this._pendingTimeouts = [];
    if (this.ctx) this.render();
    this.detachVisibilityHandlers();
  }

  loop(timestamp) {
    if (!this.running) return;
    // ⚠️ CRITICAL: Luôn giữ try-catch ở đây. Nếu update() hoặc render() throw exception mà ko catch, requestAnimationFrame ko được gọi lại -> map treo vĩnh viễn
    // ⚠️ requestAnimationFrame ở cuối PHẢI luôn chạy, kể cả khi có lỗi
    try {
      const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
      this.lastTime = timestamp;
      this.animTime += dt;
      this.update(dt);
      this.updatePerformanceMode();
      const hasRemote = this.entities.some(e => e.isRemote);
      const idle = !hasRemote && this.effects.length === 0 && this.damageTexts.length === 0
        && this.actionQueue.length === 0 && this.shakeTimer <= 0
        && this.lightningFlash <= 0 && !this.entities.some(e => e?.hitFlash > 0 || e?._skillTimer > 0);
      this._renderAccumulator += dt;
      const interval = this.getRenderInterval();
      const shouldRender = !idle && this._renderAccumulator >= interval;
      if (shouldRender) {
        this.render();
        this._renderAccumulator = 0;
      }
    } catch (e) {
      console.warn('MapView2D loop error:', e);
    }
    requestAnimationFrame((t) => this.loop(t));
  }

  setPlayer(player) {
    const col = 2, row = this.rows - 1;
    if (!this.playerEntity) {
      const fakePet = {
        id: 'player',
        baseId: 'player',
        name: player.name,
        emoji: '🧑',
        maxHp: 1,
        hp: 1,
        type: 'animal',
        dead: false,
        level: 1,
        getPower: () => 0
      };
      this.playerEntity = new MapEntity(fakePet, false, col, row);
      const s = this.tileToScreen(col, row);
      this.playerEntity.x = s.x;
      this.playerEntity.y = s.y;
    }
    // Update costume info
    const c = DATA.COSTUMES.find(x => x.id === player.costume) || DATA.COSTUMES[0];
    this.playerEntity.pet.emoji = c.emoji;
    this.playerEntity.pet.name = player.name;
    this.playerEntity.playerColor = c.color;
    this.playerEntity.setTarget(col, row);
  }

  getCharOffset(state, phase) {
    const t = state.timer;
    const type = state.type;
    let bobY = 0, wobX = 0;
    switch (type) {
      case 'wave':
        bobY = Math.sin(t * 8) * 0.3;
        wobX = Math.sin(t * 10) * 1.5 * Math.max(0, 1 - t * 1.5);
        break;
      case 'jump':
        bobY = -Math.abs(Math.sin(t * 10)) * 4 * Math.max(0, 1 - t * 2);
        break;
      case 'look':
        wobX = Math.sin(t * 4) * 2 * Math.max(0, 1 - t * 1.5);
        break;
      default:
        bobY = Math.sin(this.animTime * 0.8 + phase) * 0.2;
        break;
    }
    return { bobY, wobX };
  }

  getWeaponVisual(weapon) {
    if (!weapon) return null;
    const raw = typeof weapon === 'string' ? weapon : (weapon.name || weapon.type || weapon.id || '');
    const text = String(raw).toLowerCase();
    if (!text) return null;
    if (text.includes('sword') || text.includes('blade') || text.includes('katana') || text.includes('kiếm')) {
      return { kind: 'sword', color: '#D9E6F2' };
    }
    if (text.includes('staff') || text.includes('wand') || text.includes('trượng') || text.includes('pha lê') || text.includes('cây')) {
      return { kind: 'staff', color: '#D4B96A' };
    }
    if (text.includes('bow') || text.includes('cung') || text.includes('crossbow')) {
      return { kind: 'bow', color: '#A67C52' };
    }
    if (text.includes('axe') || text.includes('rìu') || text.includes('búa')) {
      return { kind: 'axe', color: '#B8C3CF' };
    }
    if (text.includes('spear') || text.includes('thương') || text.includes('giáo')) {
      return { kind: 'spear', color: '#B0B0B0' };
    }
    if (text.includes('dagger') || text.includes('dao') || text.includes('knife')) {
      return { kind: 'dagger', color: '#B0B0B0' };
    }
    if (text.includes('hammer') || text.includes('búa')) {
      return { kind: 'hammer', color: '#8B7355' };
    }
    if (text.includes('gun') || text.includes('súng') || text.includes('laser') || text.includes('cannon') || text.includes('đại bác')) {
      return { kind: 'gun', color: '#555555' };
    }
    if (text.includes('shield') || text.includes('khiên')) {
      return { kind: 'shield', color: '#6C8CFF' };
    }
    return { kind: 'sword', color: '#D9E6F2' };
  }

  drawWeaponIndicator(ctx, ent, sx, sy, bobY, scale) {
    if (!ent?.pet || this.qualityMode === 'low') return;
    const weapon = ent.pet.weapon;
    const visual = this.getWeaponVisual(weapon);
    if (!visual) return;

    const weaponX = sx + 9 * scale;
    const weaponY = sy - 1 + bobY;
    ctx.save();
    ctx.translate(weaponX, weaponY);
    ctx.scale(scale * 0.22, scale * 0.22);
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetY = 1;

    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1.2;
    ctx.fillStyle = visual.color;

    if (visual.kind === 'sword') {
      ctx.fillRect(-3, -8, 2, 12);
      ctx.beginPath();
      ctx.moveTo(-2, -9);
      ctx.lineTo(3, -4);
      ctx.lineTo(1, -2);
      ctx.lineTo(-4, -7);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(-2, 4, 2, 4);
    } else if (visual.kind === 'staff') {
      ctx.fillRect(-2, -8, 2, 14);
      ctx.fillRect(-4, 4, 4, 3);
      ctx.fillRect(0, 4, 4, 3);
    } else if (visual.kind === 'bow') {
      ctx.beginPath();
      ctx.moveTo(-5, -3);
      ctx.quadraticCurveTo(0, -7, 5, -3);
      ctx.quadraticCurveTo(0, 1, -5, -3);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(0, 4);
      ctx.stroke();
    } else if (visual.kind === 'axe') {
      ctx.fillRect(-3, -7, 2, 10);
      ctx.beginPath();
      ctx.moveTo(-2, -8);
      ctx.lineTo(4, -2);
      ctx.lineTo(1, 0);
      ctx.lineTo(-5, -6);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(-1, 3, 2, 4);
    } else if (visual.kind === 'dagger') {
      ctx.fillRect(-2, -8, 2, 10);
      ctx.beginPath();
      ctx.moveTo(-2, -8);
      ctx.lineTo(2, -4);
      ctx.lineTo(-2, -2);
      ctx.closePath();
      ctx.fill();
    } else if (visual.kind === 'shield') {
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(4, -3);
      ctx.lineTo(4, 3);
      ctx.lineTo(0, 7);
      ctx.lineTo(-4, 3);
      ctx.lineTo(-4, -3);
      ctx.closePath();
      ctx.fill();
    } else if (visual.kind === 'spear') {
      ctx.fillRect(-1, -8, 2, 12);
      ctx.beginPath();
      ctx.moveTo(-1, -8);
      ctx.lineTo(-3, -5);
      ctx.lineTo(1, -5);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(-2, 4, 2, 4);
    } else if (visual.kind === 'hammer') {
      ctx.fillRect(-2, -7, 2, 10);
      ctx.fillStyle = '#666';
      ctx.fillRect(-4, -8, 6, 5);
      ctx.fillRect(-2, 3, 2, 4);
    } else if (visual.kind === 'gun') {
      ctx.fillStyle = '#444';
      ctx.fillRect(-3, -3, 8, 3);
      ctx.fillRect(4, -2, 3, 2);
      ctx.fillStyle = '#FF4400';
      ctx.fillRect(5, -2, 1, 2);
    }

    ctx.restore();
  }

  syncEntities(pets, monsters, botPets, botCharacters, remotePlayers) {
    if (!botCharacters) botCharacters = [];
    if (!Array.isArray(botCharacters)) botCharacters = [botCharacters];
    if (!remotePlayers) remotePlayers = {};
    const alivePetIds = new Set(pets.filter(p => !p.dead && p.hp > 0).map(p => p.id));
    const aliveMonIds = new Set(monsters.filter(m => !m.dead && m.hp > 0).map(m => m.id));
    const aliveBotIds = botPets ? new Set(botPets.filter(p => !p.dead && p.hp > 0).map(p => p.id)) : new Set();
    const aliveCharIds = new Set(botCharacters.filter(c => c && !c.dead).map(c => c.id));
    const remoteUids = new Set(Object.keys(remotePlayers));

    this.entities = this.entities.filter(e => {
      if (e.dead) return false;
      if (e.isRemote) return remoteUids.has(e.pet.id);
      if (e.isBotCharacter) return aliveCharIds.has(e.pet.id);
      if (e.isBot) return aliveBotIds.has(e.pet.id);
      if (!e.isMonster) return alivePetIds.has(e.pet.id);
      if (e.isMonster) return aliveMonIds.has(e.pet.id);
      return false;
    });

    for (const pet of pets) {
      if (pet.dead || pet.hp <= 0) continue;
      const col = pet.gridCol != null ? pet.gridCol : 2;
      const row = pet.gridRow != null ? pet.gridRow : 2;
      let ent = this.entities.find(e => !e.isMonster && !e.isBot && !e.isBotCharacter && e.pet.id === pet.id);
      if (ent) {
        ent.setTarget(col, row);
        ent.pet.hp = pet.hp;
        if (pet.hp <= 0) ent.dead = true;
      } else {
        const e = new MapEntity(pet, false, col, row);
        const s = this.tileToScreen(col, row);
        e.x = s.x; e.y = s.y;
        this.entities.push(e);
      }
    }

    for (const mon of monsters) {
      if (mon.dead || mon.hp <= 0) continue;
      const col = mon.gridCol != null ? mon.gridCol : 8;
      const row = mon.gridRow != null ? mon.gridRow : 4;
      let ent = this.entities.find(e => e.isMonster && e.pet.id === mon.id);
      if (ent) {
        ent.setTarget(col, row);
        ent.pet.hp = mon.hp;
        ent.pet.name = mon.name;
        ent.pet.emoji = mon.emoji;
        if (mon.hp <= 0) ent.dead = true;
      } else {
        const e = new MapEntity(mon, true, col, row);
        const s = this.tileToScreen(col, row);
        e.x = s.x; e.y = s.y;
        this.entities.push(e);
      }
    }

    // Bot pet entities
    if (botPets) {
      for (const bp of botPets) {
        if (bp.dead || bp.hp <= 0) continue;
        const col = bp.gridCol != null ? bp.gridCol : 2;
        const row = bp.gridRow != null ? bp.gridRow : 2;
        let ent = this.entities.find(e => e.isBot && !e.isBotCharacter && e.pet.id === bp.id);
        if (ent) {
          ent.setTarget(col, row);
          ent.pet.hp = bp.hp;
          if (bp.hp <= 0) ent.dead = true;
        } else {
          const e = new MapEntity(bp, false, col, row);
          e.isBot = true;
          const s = this.tileToScreen(col, row);
          e.x = s.x; e.y = s.y;
          this.entities.push(e);
        }
      }
    }

    // Bot character entities (multiple)
    for (const bc of botCharacters) {
      if (!bc || bc.dead) continue;
      const col = bc.gridCol != null ? bc.gridCol : 0;
      const row = bc.gridRow != null ? bc.gridRow : 8;
      let ent = this.entities.find(e => e.isBotCharacter && e.pet.id === bc.id);
      if (ent) {
        ent.setTarget(col, row);
      } else {
        const e = new MapEntity(bc, false, col, row);
        e.isBotCharacter = true;
        const s = this.tileToScreen(col, row);
        e.x = s.x; e.y = s.y;
        this.entities.push(e);
      }
    }

    // Remote player entities (online co-op)
    for (const uid in remotePlayers) {
      const rp = remotePlayers[uid];
      if (!rp.alive) continue;
      const col = rp.x != null ? rp.x : 0;
      const row = rp.y != null ? rp.y : 0;
      const pseudoPet = {
        id: uid,
        name: rp.name || uid.substring(0, 6),
        emoji: rp.emoji || '🧑',
        hp: rp.hp || 100,
        maxHp: rp.maxHp || 100,
        level: rp.level || 1,
        playerColor: rp.color || '#FF6644',
        gridCol: col,
        gridRow: row,
      };
      let ent = this.entities.find(e => e.isRemote && e.pet.id === uid);
      if (ent) {
        ent.setTarget(col, row);
        ent.pet.hp = pseudoPet.hp;
        ent.pet.maxHp = pseudoPet.maxHp;
        ent.pet.emoji = pseudoPet.emoji;
        ent.pet.name = pseudoPet.name;
      } else {
        const e = new MapEntity(pseudoPet, false, col, row);
        e.isRemote = true;
        const s = this.tileToScreen(col, row);
        e.x = s.x; e.y = s.y;
        this.entities.push(e);
      }
    }
  }

  getVisualTypeForAnim(anim, isUltimate, element) {
    const vt = String(anim || '');
    if (vt === 'dodge') return 'dodge';
    if (isUltimate) return vt;

    const visualMap = {
      // === FIRE - phân loại rõ 4 dạng ===
      ember_wave:'ember_wave', molten_lance:'molten_lance',
      triple_true_fire:'triple_true_fire',
      meteor_storm:'meteor_storm', fire_eruption:'fire_eruption',
      volcanoblast:'meteor', meteorstorm:'meteor_storm',
      hellfire_rain:'hellfire_rain', solar_fall:'solar_fall',
      flame_orb:'flame_orb', fireball:'flame_orb',
      flame:'fire_breath', inferno:'meteor', hellfire:'hellfire',
      dragonbreath:'fire_breath', breath:'fire_breath',
      darkfire:'shadow_burst', annihilate:'shadow_burst',

      // === ICE - phân loại rõ 3 dạng ===
      ice_rain:'ice_rain', icenova:'ice_rain',
      frostnova:'ice_rain', frost_wreath:'ice_rain',
      freeze:'ice_rain', blizzard:'ice_rain',
      diamond_dust:'diamond_dust',
      permafrost:'permafrost', eternalwinter:'permafrost',
      absolutezero:'absolute_zero', freezing_blast:'absolute_zero',
      crystal_spike:'crystal_spike',
      glacier_spear:'crystal_spike', frostbite:'crystal_spike',
      ice_shard:'crystal_spike', iceshard:'crystal_spike',

      // === EARTH - phân loại 4 dạng ===
      ground_stomp:'ground_stomp', fissure:'earth_split',
      stone_rain:'earth_split', earthquake:'earth_split',
      quake:'earth_split', rockslide:'earth_split',
      earth_split:'earth_split', mountain_crush:'mountain_crush',
      petrifying_gaze:'petrify', chibaku_tensei:'chibaku_gravity',
      slam:'slam', smash:'slam', axe:'slam', claw:'slam',

      // === STORM / WIND - phân loại 3 dạng ===
      whirlwind:'whirlwind', tornado:'whirlwind',
      cyclone_rend:'whirlwind', storm_fury:'whirlwind',
      sky_breaker:'sky_breaker', cosmic_wind:'sky_breaker',
      aurora_surge:'aurora_wave',
      giant_storm:'hurricane', hurricane:'hurricane',
      sandstorm:'hurricane', cloud:'whirlwind',
      howl:'taunt', knockback_blast:'knockback', knockback:'knockback',

      // === POISON / DARK - phân loại 3 dạng ===
      poison_web:'poison_web', poison_trap:'poison_web',
      shadow_burst:'shadow_burst', void_harvest:'shadow_burst',
      plague:'plague_cloud', plague_bloom:'plague_cloud',
      blood_moon:'blood_moon',
      voidtear:'voidtear', nightmare:'shadow_burst',
      darkpulse:'shadow_burst', chaoswave:'shadow_burst',
      curse:'plague_cloud', drain:'poison_web',
      poison:'poison_web',

      // === THUNDER - phân loại 3 dạng ===
      thunder_bolt:'thunder_bolt', thunder_arc:'thunder_bolt',
      flash_strike:'flash_strike', dash_strike:'dash_strike',
      chainlightning:'chain_lightning', lightning_spear:'chain_lightning',
      divine_bolt:'divine_bolt',
      cosmic_cleave:'divine_bolt', thunder_vanguard:'divine_bolt',
      storm_impact:'thunder_bolt', thunder:'thunder_bolt',
      celestial:'thunder_bolt', divine:'divine_bolt',
      // New thunder attack visuals
      thunder_slash:'thunder_slash', thunder_burst:'thunder_burst',
      thunder_beam:'thunder_beam', electric_wave:'electric_wave',
      lightning_blade:'lightning_blade', twin_sparks:'twin_sparks',
      thunder_hammer:'thunder_hammer', lightning_chain:'lightning_chain',
      lightning_pillar:'lightning_pillar', electric_storm:'electric_storm',

      // === WOOD / NATURE ===
      vine_barrage:'vine_barrage', root_maelstrom:'vine_barrage',
      ancient_bloom:'ancient_bloom', jungle_devour:'jungle_devour',
      vine:'vine_barrage', root:'vine_barrage', summon:'vine_barrage',
      sapling:'vine_barrage', ancientpower:'vine_barrage',
      thornwave:'vine_barrage', natureswrath:'natureswrath',
      overgrowth:'overgrowth', gaiarage:'natureswrath',
      forestwrath:'natureswrath',

      // === WATER ===
      tidal_rush:'tidal_rush', abyss_surge:'tidal_rush',
      sea_curse:'sea_curse', abyssal_bubble:'abyssal_bubble',
      water:'tidal_rush', rain:'tidal_rush',

      // === DRAGON ===
      dragon_palm:'dragon_palm',

      // === SUPPORT ===
      heal:'heal', holy:'holy', regen:'heal',
      shield:'shield', defend:'shield', barrier:'shield',
      protect:'shield', ward:'shield',
      drain:'drain', lifesteal:'drain', blood:'drain',
      taunt:'taunt', shout:'taunt', provoke:'taunt',

      // === MISC ===
      rage:'slam', demonrage:'slam',
      fire_breath:'fire_breath',
    };
    return visualMap[vt] || vt;
  }

  queueAction(attackerId, targetId, dmg, isCrit, skillType, roleId, isUltimate) {
    // ⚠️ CRITICAL: Phải check this.running trước khi queue, nếu không sẽ push action vào queue khi tab world không active -> treo khi quay lại
    if (!this.running) return;
    this.trimVisualCollections();
    if (this.actionQueue.length >= this.maxActionQueue) {
      this.actionQueue.shift();
    }
    if (skillType === 'dodge') {
      this.actionQueue.push({
        attackerId, targetId, dmg: 0, isCrit: false,
        skillType: 'dodge',
        visualType: 'dodge',
        element: 'dodge',
        isUltimate: false,
        timer: 0,
        telegraph: false,
        prepTime: 0.24
      });
      return;
    }
    const atkEnt = this.entities.find(e => e.pet.id === attackerId);
    const baseId = atkEnt?.pet?.baseId;
    let element;
    if (atkEnt?.pet?.isMonster) {
      element = atkEnt.pet.element || 'fire';
    } else {
      element = getElementForAnim(skillType, roleId || 'melee', baseId);
    }
    const isSupportVisual = ['heal', 'holy', 'shield', 'defend', 'drain', 'taunt'].includes(skillType);
    const isTelegraph = !isSupportVisual && (dmg || 0) <= 0;
    const visualType = this.getVisualTypeForAnim(skillType, !!isUltimate, element);
    const bigThunderAttack = ['thunder_burst', 'thunder_beam', 'thunder_hammer', 'lightning_pillar', 'electric_storm', 'lightning_chain'].includes(visualType);
    const isMassiveVisual = !!isUltimate || ['meteor', 'meteor_storm', 'fire_eruption', 'ground_stomp', 'whirlwind', 'poison_web', 'shadow_burst', 'ice_rain', 'thunder_bolt'].includes(visualType) || isSupportVisual || bigThunderAttack;
    // Lấy tên skill từ entity attacker và lưu vào entity để render
    if (atkEnt && !isTelegraph) {
      const skName = atkEnt.pet?.displaySkill;
      if (skName) {
        atkEnt._displaySkill = skName;
        atkEnt._skillTimer = 1.5;
      }
    }
    this.actionQueue.push({
      attackerId, targetId, dmg, isCrit,
      skillType: skillType || 'slash',
      visualType,
      element,
      isUltimate: !!isUltimate || isMassiveVisual,
      timer: 0,
      telegraph: isTelegraph,
      prepTime: isTelegraph ? 0.6 : (isMassiveVisual ? 0.7 : 0.28)
    });

    // If the canvas entities are not yet synced (rare timing), show immediate damage number
    const atkEntNow = this.entities.find(e => e.pet && e.pet.id === attackerId);
    const defEntNow = this.entities.find(e => e.pet && e.pet.id === targetId);
    if (!defEntNow) {
      const x = (atkEntNow && atkEntNow.x) ? atkEntNow.x : (this.W / 2);
      const y = (atkEntNow && atkEntNow.y) ? atkEntNow.y - 12 : (this.H / 2 - 20);
      const textVal = skillType === 'dodge' ? 'NE' : (dmg > 0 ? `-${dmg}${isCrit ? '💥' : ''}${isUltimate ? '🔥' : ''}` : '0');
      const color = isUltimate ? '#FF4400' : (isCrit ? '#FF4444' : '#FFD700');
      this.damageTexts.push(new MapDamageText(x, y, textVal, color));
    }
  }

  update(dt) {
    // Player stays at fixed tile position
    if (this.playerEntity) {
      const target = this.tileToScreen(this.playerEntity.targetCol, this.playerEntity.targetRow);
      this.playerEntity.x = target.x;
      this.playerEntity.y = target.y;
    }

    const shouldUpdateMotion = this.actionQueue.length > 0 || this.effects.length > 0 || this.damageTexts.length > 0
      || this.shakeTimer > 0 || this.lightningFlash > 0
      || this.entities.some(e => e?.hitFlash > 0 || e?.attackTimer > 0 || e?.staggerTimer > 0 || e?.impactPulse > 0
        || Math.abs(e?.knockbackX || 0) > 0.001 || Math.abs(e?.knockbackY || 0) > 0.001);

    for (const ent of this.entities) {
      if (ent.dead) continue;
      // Skill display timer
      if (ent._skillTimer > 0) {
        ent._skillTimer = Math.max(0, ent._skillTimer - dt);
        if (ent._skillTimer <= 0) {
          ent._displaySkill = '';
        }
      }
      if (!shouldUpdateMotion) {
        if (ent.hitFlash > 0) ent.hitFlash = Math.max(0, ent.hitFlash - dt);
        if (ent.attackTimer > 0) ent.attackTimer = Math.max(0, ent.attackTimer - dt);
        if (ent.staggerTimer > 0) ent.staggerTimer = Math.max(0, ent.staggerTimer - dt);
        if (ent.impactPulse > 0) ent.impactPulse = Math.max(0, ent.impactPulse - dt * 2.2);
        continue;
      }
      const target = this.tileToScreen(ent.targetCol, ent.targetRow);
      const dx = target.x - ent.x;
      const dy = target.y - ent.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let moveX = 0;
      let moveY = 0;
      if (dist > 0.5) {
        const speed = Math.max(35, Math.min(160, dist * 1.45)) * dt;
        moveX += (dx / dist) * Math.min(speed, dist);
        moveY += (dy / dist) * Math.min(speed, dist);
      } else {
        ent.x = target.x;
        ent.y = target.y;
      }

      const staggerMul = ent.staggerTimer > 0 ? 0.55 : 1;
      if (ent.knockbackX || ent.knockbackY) {
        moveX += ent.knockbackX * (1 + dt * 2);
        moveY += ent.knockbackY * (1 + dt * 2);
        ent.knockbackX *= 0.84;
        ent.knockbackY *= 0.84;
      }

      if (Math.abs(moveX) > 0.001 || Math.abs(moveY) > 0.001) {
        ent.x += moveX * staggerMul;
        ent.y += moveY * staggerMul;
      }

      if (ent.hitFlash > 0) ent.hitFlash -= dt;
      if (ent.attackTimer > 0) ent.attackTimer -= dt;
      if (ent.staggerTimer > 0) ent.staggerTimer -= dt;
      if (ent.impactPulse > 0) ent.impactPulse = Math.max(0, ent.impactPulse - dt * 2.2);
    }

    // Action queue
    if (this.actionQueue.length > 0) {
      try {
      this.actionTimer += dt;
      const action = this.actionQueue[0];
      const atkEnt = this.entities.find(e => e.pet?.id === action?.attackerId);
      const defEnt = this.entities.find(e => e.pet?.id === action?.targetId);
      const isUlt = action?.isUltimate;
      const isMonster = defEnt?.pet?.isMonster || defEnt?.pet?.isBoss;
      const isTelegraph = !!action?.telegraph;
      const actionDamage = action?.dmg || 0;
      const isSupportAction = ['heal', 'holy', 'shield', 'defend', 'drain', 'taunt'].includes(action?.visualType);
      const isMassiveHit = isUlt && actionDamage > 150 && !isSupportAction;
      const actionDuration = action?.prepTime || (isTelegraph ? 0.6 : 0.28);
      if (atkEnt && defEnt && !defEnt.dead) {
        if (this.actionTimer < 0.08) {
          atkEnt.attackTimer = isUlt ? 0.7 : 0.4;
        } else if (this.actionTimer < actionDuration) {
          if (this.actionTimer > 0.1 && this.actionTimer < 0.12) {
            const ts = this.tileToScreen(defEnt.targetCol, defEnt.targetRow);
            if (action.element === 'dodge') {
              this.damageTexts.push(new MapDamageText(ts.x, ts.y - 20, 'NE', '#44FF88'));
            } else {
              defEnt.hitFlash = isUlt ? 0.25 : 0.12;
              if (isTelegraph) {
                const elementKey = action.element || 'fire';
                const telegraphColor = ELEMENT_COLORS[elementKey] || ELEMENT_COLORS.fire;
                this.spawnEffect(elementKey, ts.x, ts.y - 8, ts.x, ts.y, false, 'taunt');
                this.spawnEffect(elementKey, ts.x, ts.y - 10, ts.x + 8, ts.y + 2, false, 'spin');
                defEnt.hitFlash = 0.24;
                defEnt.impactPulse = 0.6;
                this.shakeTimer = 0.03;
                this.damageTexts.push(new MapDamageText(ts.x, ts.y - 28, '⚠️', telegraphColor.glow || '#FFD166'));
              } else {
                this.applyEntityImpact(atkEnt, defEnt, action, isUlt);
                this.spawnEffect(action.element ?? 'fire', atkEnt.x, atkEnt.y, ts.x, ts.y, isUlt, action.visualType ?? 'slash');
              }
              if (isMassiveHit) {
                const burstCount = this.qualityMode === 'low' ? 1 : (this.qualityMode === 'medium' ? 2 : 3);
                for (let i = 0; i < burstCount; i++) {
                  const tid = setTimeout(() => {
                    const idx = this._pendingTimeouts.indexOf(tid);
                    if (idx >= 0) this._pendingTimeouts.splice(idx, 1);
                    this.spawnEffect(action.element, atkEnt.x + (Math.random() - 0.5) * 40, atkEnt.y + (Math.random() - 0.5) * 20, ts.x + (Math.random() - 0.5) * 40, ts.y + (Math.random() - 0.5) * 15, true, action.visualType);
                    if (this.qualityMode !== 'low' && Math.random() < 0.4) {
                      this.spawnEffect('thunder', atkEnt.x + (Math.random() - 0.5) * 50, atkEnt.y - 20, ts.x, ts.y, false, 'thunder');
                    }
                  }, i * 100);
                  this._pendingTimeouts.push(tid);
                }
                this.shakeTimer = 0.22;
                this.lightningFlash = 0.4;
              } else if (isUlt && !isSupportAction) {
                const burstCount = this.qualityMode === 'low' ? 1 : 2;
                for (let i = 0; i < burstCount; i++) {
                  const tid = setTimeout(() => {
                    const idx = this._pendingTimeouts.indexOf(tid);
                    if (idx >= 0) this._pendingTimeouts.splice(idx, 1);
                    this.spawnEffect(action.element, atkEnt.x + (Math.random() - 0.5) * 30, atkEnt.y + (Math.random() - 0.5) * 10, ts.x + (Math.random() - 0.5) * 30, ts.y + (Math.random() - 0.5) * 10, false, action.visualType);
                  }, i * 60);
                  this._pendingTimeouts.push(tid);
                }
                this.shakeTimer = 0.12;
              } else if (isMonster && !isTelegraph) {
                this.shakeTimer = 0.08;
              }
              if (!isTelegraph) {
                const textVal = isSupportAction
                  ? (action.visualType === 'drain' ? `-${action.dmg}♻️` : `+${action.dmg}💚`)
                  : `-${action.dmg}${action.isCrit ? '💥' : ''}${isUlt ? '🔥' : ''}`;
                const textColor = isSupportAction ? '#2ECC71' : (isUlt ? '#FF4400' : (action.isCrit ? '#FF4444' : '#FFD700'));
                this.damageTexts.push(new MapDamageText(
                  ts.x, ts.y - (isUlt ? 24 : 14),
                  textVal,
                  textColor
                ));
              }
            }
          }
        } else {
          this.actionTimer = 0;
          this.actionQueue.shift();
        }
      } else {
        this.actionTimer = 0;
        this.actionQueue.shift();
      }
    } catch (e) {
      this.actionTimer = 0;
      this.actionQueue.shift();
      console.warn('queueAction error:', e);
    }
    }

    // Character animation state
    this.charAnim.timer += dt;
    this.charAnimCooldown -= dt;
    if (this.charAnim.type !== 'idle' && this.charAnim.timer > 0.6) {
      this.charAnim.type = 'idle';
      this.charAnim.timer = 0;
      this.charAnimCooldown = 2 + Math.random() * 4;
    }
    if (this.charAnim.type === 'idle' && this.charAnimCooldown <= 0) {
      const actions = ['wave', 'jump', 'look', 'idle'];
      this.charAnim.type = actions[Math.floor(Math.random() * actions.length)];
      this.charAnim.timer = 0;
      this.charAnim.phase = 0;
    }

    // Clean up stale pending timeouts (> 2s old) to prevent accumulation
    if (this._pendingTimeouts.length > 20) {
      for (const t of this._pendingTimeouts.splice(0, 10)) {
        clearTimeout(t);
      }
    }
    if (this.shakeTimer > 0) this.shakeTimer -= dt;
    if (this.lightningFlash > 0) this.lightningFlash -= dt;
    this.effects = this.effects.filter(e => e.update(dt));
    this.damageTexts = this.damageTexts.filter(d => d.update(dt));
    this.trimVisualCollections();

    // Weather update disabled for smoother combat
    this.weatherParticles = [];
  }

  applyEntityImpact(attackerEnt, targetEnt, action, isUltimate) {
    if (!targetEnt) return;
    const vt = action?.visualType;
    const isSupportImpact = ['heal', 'holy', 'shield', 'defend', 'drain'].includes(vt);
    // Support skills (heal, shield, etc.) don't apply knockback
    if (isSupportImpact) {
      targetEnt.hitFlash = Math.max(targetEnt.hitFlash || 0, 0.08);
      targetEnt.impactPulse = 0.3;
      return;
    }
    const dx = targetEnt.x - (attackerEnt?.x || targetEnt.x);
    const dy = targetEnt.y - (attackerEnt?.y || targetEnt.y);
    const len = Math.hypot(dx, dy) || 1;
    const dirX = dx / len;
    const dirY = dy / len;
    const isMassiveHit = isUltimate && (action?.dmg || 0) > 150;
    let baseStrength = isMassiveHit ? 22 : (isUltimate ? 14 : 6);
    const isSmallMonster = attackerEnt?.pet?.isMonster && !attackerEnt?.pet?.isBoss;
    if (isSmallMonster) baseStrength *= 0.3;
    const strength = baseStrength + (['knockback', 'slam', 'spin', 'storm', 'rainshot', 'shot', 'taunt'].includes(vt) ? 4 : 0);
    const lift = ['slam', 'spin', 'storm', 'taunt'].includes(vt) ? -8 : (vt === 'knockback' ? -4 : 0);

    targetEnt.hitFlash = Math.max(targetEnt.hitFlash || 0, isMassiveHit ? 0.4 : (isUltimate ? 0.2 : 0.12));
    targetEnt.staggerTimer = isMassiveHit ? 0.4 : (isUltimate ? 0.22 : 0.12);
    targetEnt.impactPulse = isMassiveHit ? 1.6 : (isUltimate ? 0.8 : 0.5);
    targetEnt.knockbackX = dirX * strength;
    targetEnt.knockbackY = dirY * strength + lift;

    if (attackerEnt && attackerEnt !== targetEnt) {
      attackerEnt.knockbackX = -dirX * (isMassiveHit ? 8 : (isUltimate ? 4 : 2));
      attackerEnt.knockbackY = -dirY * (isMassiveHit ? 4 : (isUltimate ? 2.5 : 1.2));
    }
  }

  spawnEffect(type, fromX, fromY, toX, toY, isUltimate, visualType) {
    this.trimVisualCollections();
    if (this.qualityMode === 'low' && !isUltimate && Math.random() < 0.45) return;
    if (this.qualityMode === 'medium' && !isUltimate && this.effects.length >= this.maxEffects - 1 && Math.random() < 0.4) return;
    if (this.effects.length >= this.maxEffects) {
      this.effects.splice(0, Math.max(1, this.effects.length - this.maxEffects + 1));
      if (this.effects.length >= this.maxEffects) return;
    }
    if (isUltimate) {
      this.effects.push(new MapUltimateEffect(type, fromX, fromY, toX, toY, visualType, this.W, this.H, this.effectSharpness));
    } else {
      this.effects.push(new MapEffect(type, fromX, fromY, toX, toY, visualType, this.W, this.H, this.effectSharpness));
    }
  }

  render() {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.save();
    // ⚠️ CRITICAL: Luôn dùng try-finally để đảm bảo ctx.restore() chạy. Nếu save() mà ko restore, canvas state tích luỹ qua frame -> hình nhoè dần
    try {
    // Screen shake (reduced intensity)
    if (this.shakeTimer > 0) {
      const intensity = this.shakeTimer * 5;
      ctx.translate(
        (Math.random() - 0.5) * intensity,
        (Math.random() - 0.5) * intensity
      );
    }

    // Camera zoom — world-space transform (zoom into pet area)
    if (this.zoomLevel > 1) {
      const center = this.getZoomCenter();
      if (this._zoomCX == null) { this._zoomCX = center.x; this._zoomCY = center.y; }
      this._zoomCX += (center.x - this._zoomCX) * 0.1;
      this._zoomCY += (center.y - this._zoomCY) * 0.1;
      const zs = this.ZOOM_SCALES[this.zoomLevel - 1];
      ctx.save();
      ctx.translate(this.W / 2, this.H / 2);
      ctx.scale(zs, zs);
      ctx.translate(-this._zoomCX, -this._zoomCY);
    }

    // Draw cached background if available
    if (!this._cacheCanvas) {
      this._cacheCanvas = document.createElement('canvas');
      this._cacheCanvas.width = this.W;
      this._cacheCanvas.height = this.H;
    }
    if (this._cacheDirty) {
      this._cacheDirty = false;
      this.buildBackgroundCache();
    }
    ctx.drawImage(this._cacheCanvas, 0, 0);

    // Animated sky elements (clouds, fog) — drawn each frame
    const hasClouds = ['grass', 'forest', 'desert', 'heavenly'].includes(this.currentTheme);
    if (hasClouds) {
      ctx.save();
      for (let i = 0; i < 3; i++) {
        const cx = ((this.animTime * 3 + i * 120) % (this.W + 60)) - 30;
        const cy = 12 + i * 14;
        const cw = 30 + i * 10;
        ctx.globalAlpha = 0.04 + i * 0.01;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(cx, cy, cw * 0.5, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx - cw * 0.25, cy + 2, cw * 0.3, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + cw * 0.3, cy + 1, cw * 0.35, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    const hasFog = ['swamp', 'darkforest', 'void'].includes(this.currentTheme);
    if (hasFog) {
      ctx.save();
      for (let i = 0; i < 4; i++) {
        const fx = ((this.animTime * 2 + i * 80 + Math.sin(this.animTime * 0.5 + i) * 20) % (this.W + 40)) - 20;
        const fy = this.H * 0.6 + i * 12;
        const fw = 50 + i * 15;
        ctx.globalAlpha = 0.03 + i * 0.005;
        const fogGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, fw);
        fogGrad.addColorStop(0, 'rgba(180,200,200,0.06)');
        fogGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = fogGrad;
        ctx.beginPath();
        ctx.arc(fx, fy, fw, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    const drawEnts = this.entities.filter(e => !e.dead);
    drawEnts.sort((a, b) => a.targetRow - b.targetRow);
    const maxDrawEnts = this.qualityMode === 'low' ? 10 : (this.qualityMode === 'medium' ? 16 : drawEnts.length);

    for (const [index, ent] of drawEnts.entries()) {
      if (index >= maxDrawEnts) break;
      const sx = ent.x, sy = ent.y;
      const bobY = Math.sin(this.animTime * 2.5 + (ent.isMonster ? 100 : 0) + ent.targetCol * 2) * 0.8;
      const scaleOverride = ent.pet?.bossScale || (ent.pet?.isBoss ? 1.3 : 0);
      const s = scaleOverride ? scaleOverride * 0.45 : (ent.isMonster ? 0.42 : 0.48);
      const levelScale = ent.pet && !ent.isMonster ? 1 + Math.floor((ent.pet.level || 0) / 20) * 0.08 + ((ent.pet.level || 0) >= 100 ? 0.05 : 0) : 1;
      const impactScale = ent.impactPulse > 0 ? 1 + ent.impactPulse * 0.04 : 1;
      const walkPhase = this.animTime * 4 + ent.targetCol * 0.7 + ent.targetRow * 0.5;

      if (ent.hitFlash > 0) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = ent.isMonster ? '#FF0000' : '#FFFFFF';
        ctx.beginPath();
        ctx.arc(sx, sy - 5 + bobY, 10 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      PixelArt.drawCharacter(ctx, ent.pet, sx, sy + bobY, s * levelScale * impactScale, false, walkPhase, ent.isMonster);
      this.drawWeaponIndicator(ctx, ent, sx, sy + bobY, 0, s * levelScale * impactScale);

      const isBossEnt = ent.pet?.isBoss || ent.pet?.bossScale > 0;
      if (this.qualityMode !== 'low') {
        const barW = isBossEnt ? 28 : ent.isMonster ? 22 : 16;
        const barH = isBossEnt ? 4 : 3;
        const barY = sy - 18 + bobY + (isBossEnt ? -6 : -2);
        PixelArt.drawHPBar(ctx, sx - barW / 2, barY, barW, barH, Math.max(0, ent.pet.hp), ent.pet.maxHp);

        ctx.fillStyle = ent.isMonster ? '#FF8888' : (ent.isBot ? '#88AAFF' : '#88FF88');
        ctx.font = '5px monospace';
        ctx.textAlign = 'center';
        const label = ent.isBot
          ? '🤖' + (ent.pet.emoji || '')
          : ent.isMonster
            ? (ent.pet.isMutant ? '🧬' : '') + (ent.pet.name || '').substring(0, 5)
            : ent.pet.emoji;
        ctx.fillText(label, sx, sy - 21 + bobY);

        // Skill name floating text phía trên đầu
        if (ent._skillTimer > 0 && ent._displaySkill) {
          const fadeAlpha = Math.min(1, ent._skillTimer / 0.4) * Math.min(1, ent._skillTimer * 2);
          const rise = (1.5 - ent._skillTimer) * 6;
          ctx.save();
          ctx.globalAlpha = Math.max(0, fadeAlpha * 0.95);
          ctx.fillStyle = ent.isMonster ? '#FF8844' : '#FFD700';
          ctx.font = 'bold 6px monospace';
          ctx.textAlign = 'center';
          ctx.shadowColor = ent.isMonster ? '#FF4400' : '#FF8800';
          ctx.shadowBlur = 6;
          ctx.fillText(ent._displaySkill, sx, sy - 28 + bobY - rise);
          ctx.shadowBlur = 0;
          ctx.restore();
        }
      }
    }

    // Draw player avatar on map with smooth occasional animations
    if (this.playerEntity) {
      const p = this.playerEntity;
      const sx = p.x, sy = p.y;
      const anim = this.getCharOffset(this.charAnim, 0);
      const walkPhase = this.animTime * 4 + 0.3;
      PixelArt.drawPlayer(ctx, sx + anim.wobX, sy + anim.bobY, 1.2, p.playerColor, p.pet.emoji, walkPhase);
      this.drawWeaponIndicator(ctx, p, sx + anim.wobX, sy + anim.bobY, anim.bobY, 1.2);
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.font = '6px monospace';
      const tw = ctx.measureText(p.pet.name).width || 24;
      ctx.fillRect(sx + anim.wobX - tw / 2 - 3, sy - 34 + anim.bobY, tw + 6, 9);
      ctx.fillStyle = '#FFF';
      ctx.font = '6px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.pet.name, sx + anim.wobX, sy - 29.5 + anim.bobY);
    }

    // Draw bot characters with same animation system
    const botCharEnts = this.entities.filter(e => e.isBotCharacter && !e.dead);
    for (let bi = 0; bi < botCharEnts.length; bi++) {
      const p = botCharEnts[bi];
      const sx = p.x, sy = p.y;
      const anim = this.getCharOffset(this.charAnim, bi + 1);
      const costume = p.pet.costume || DATA.COSTUMES[0];
      const walkPhase = this.animTime * 4 + bi * 1.7 + 0.5;
      PixelArt.drawPlayer(ctx, sx + anim.wobX, sy + anim.bobY, 1.2, costume.color || '#4488CC', p.pet.emoji || '🧑', walkPhase);
      this.drawWeaponIndicator(ctx, p, sx + anim.wobX, sy + anim.bobY, anim.bobY, 1.2);
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.font = '6px monospace';
      const tw = ctx.measureText(p.pet.name).width || 24;
      ctx.fillRect(sx + anim.wobX - tw / 2 - 3, sy - 34 + anim.bobY, tw + 6, 9);
      ctx.fillStyle = '#88BBFF';
      ctx.font = '6px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.pet.name, sx + anim.wobX, sy - 29.5 + anim.bobY);
    }

    // Draw remote players (online co-op)
    const remoteEnts = this.entities.filter(e => e.isRemote && !e.dead);
    for (let ri = 0; ri < remoteEnts.length; ri++) {
      const p = remoteEnts[ri];
      const sx = p.x, sy = p.y;
      const bobY = Math.sin(this.animTime * 2.5 + ri * 100) * 0.8;
      const walkPhase = this.animTime * 4 + ri * 1.3 + 0.3;
      PixelArt.drawPlayer(ctx, sx, sy + bobY, 1.2, p.pet.playerColor || '#FF6644', p.pet.emoji || '🧑', walkPhase);
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.font = '6px monospace';
      const tw = ctx.measureText(p.pet.name).width || 24;
      ctx.fillRect(sx - tw/2 - 3, sy - 34 + bobY, tw + 6, 9);
      ctx.fillStyle = '#FFCC44';
      ctx.font = '6px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.pet.name, sx, sy - 29.5 + bobY);
      // HP bar
      if (p.pet.hp != null && p.pet.maxHp != null) {
        const barW = 20, barH = 3;
        const barY = sy - 18 + bobY;
        PixelArt.drawHPBar(ctx, sx - barW/2, barY, barW, barH, Math.max(0, p.pet.hp), p.pet.maxHp);
      }
    }

    for (const eff of this.effects) eff.draw(ctx);
    for (const d of this.damageTexts) d.draw(ctx);

    // Restore zoom transform before screen-space overlays
    if (this.zoomLevel > 1) ctx.restore();

    // Dynamic atmosphere overlays
    ctx.save();
    const isWarm = ['desert', 'volcanic'].includes(this.currentTheme);
    const isBright = ['heavenly', 'grass', 'desert'].includes(this.currentTheme);
    const isDark = ['void', 'darkforest', 'icecave'].includes(this.currentTheme);

    // God rays for bright/warm themes
    if (isBright || isWarm) {
      ctx.globalAlpha = 0.03 + Math.sin(this.animTime * 0.2) * 0.01;
      for (let i = 0; i < 5; i++) {
        const rayX = ((this.animTime * 0.3 + i * 117) % this.W);
        const rayW = 15 + i * 8;
        const rayGrad = ctx.createLinearGradient(rayX, 0, rayX + rayW, this.H * 0.6);
        const rayColor = isWarm ? 'rgba(255,200,100,0.04)' : 'rgba(255,240,200,0.03)';
        rayGrad.addColorStop(0, rayColor);
        rayGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rayGrad;
        ctx.fillRect(rayX, 0, rayW, this.H * 0.6);
      }
    }

    // Volcanic ember glow
    if (this.currentTheme === 'volcanic') {
      const emberGlow = Math.sin(this.animTime * 0.5) * 0.02 + 0.04;
      ctx.globalAlpha = emberGlow;
      ctx.fillStyle = 'rgba(255,50,0,0.1)';
      ctx.fillRect(0, this.H * 0.5, this.W, this.H * 0.5);
    }

    // Volcanic ember particles
    if (this.currentTheme === 'volcanic') {
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < 6; i++) {
        const ex = ((this.animTime * 12 + i * 63 + Math.sin(this.animTime * 0.7 + i) * 20) % this.W);
        const ey = this.H - ((this.animTime * 8 + i * 97) % (this.H * 0.3)) - this.H * 0.05;
        const es = 1 + Math.sin(this.animTime + i) * 0.5;
        const eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, es * 3);
        eg.addColorStop(0, `rgba(255,${100 + (i % 3) * 50},0,${0.3 + Math.sin(this.animTime * 2 + i) * 0.1})`);
        eg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = eg;
        ctx.beginPath();
        ctx.arc(ex, ey, es * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Leaf/forest particles for organic themes
    if (['forest', 'grass', 'swamp', 'ancient'].includes(this.currentTheme)) {
      ctx.globalAlpha = 0.3;
      for (let i = 0; i < 4; i++) {
        const lx = ((this.animTime * 6 + i * 91 + Math.sin(this.animTime * 0.5 + i * 2) * 15) % (this.W + 10)) - 5;
        const ly = ((this.animTime * 4 + i * 73 + Math.sin(this.animTime * 0.3 + i) * 10) % (this.H * 0.5)) + 5;
        ctx.fillStyle = ['rgba(60,160,40,0.08)', 'rgba(80,200,60,0.06)', 'rgba(40,120,30,0.10)'][i % 3];
        const leafW = 2 + Math.sin(this.animTime + i) * 0.5;
        const leafH = 1 + Math.cos(this.animTime * 0.7 + i) * 0.3;
        ctx.fillRect(lx, ly, leafW, leafH);
      }
    }

    // Deep fog/mist at ground level for swamp and dark forest
    if (['swamp', 'darkforest'].includes(this.currentTheme)) {
      ctx.globalAlpha = 0.08 + Math.sin(this.animTime * 0.3) * 0.03;
      const mistGrad = ctx.createLinearGradient(0, this.H * 0.8, 0, this.H);
      const mistColor = this.currentTheme === 'swamp' ? 'rgba(80,120,80,0.1)' : 'rgba(20,10,30,0.12)';
      mistGrad.addColorStop(0, 'rgba(0,0,0,0)');
      mistGrad.addColorStop(1, mistColor);
      ctx.fillStyle = mistGrad;
      ctx.fillRect(0, this.H * 0.8, this.W, this.H * 0.2);
    }

    // Ambient pulsing glow overlay for all themes
    {
      const tc2 = this.getThemeColors();
      if (tc2.ambient) {
        const pulse = Math.sin(this.animTime * 0.4) * 0.3 + 0.7;
        ctx.globalAlpha = pulse * 0.5;
        ctx.fillStyle = tc2.ambient;
        ctx.fillRect(0, 0, this.W, this.H);
      }
    }
    ctx.restore();

    // Weather overlay
    this.drawWeather(ctx);

    // Lightning flash — edge glow only
    if (this.lightningFlash > 0) {
      ctx.save();
      const a = this.lightningFlash * 0.35;
      const bw = this.W, bh = this.H;
      const thick = 8;
      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = a * 0.6;
      ctx.fillRect(0, 0, bw, thick);
      ctx.fillRect(0, bh - thick, bw, thick);
      ctx.fillRect(0, 0, thick, bh);
      ctx.fillRect(bw - thick, 0, thick, bh);
      // faint glow just inside edges
      ctx.globalAlpha = a * 0.2;
      ctx.fillRect(thick, thick, bw - thick * 2, thick);
      ctx.fillRect(thick, bh - thick * 2, bw - thick * 2, thick);
      ctx.fillRect(thick, thick, thick, bh - thick * 2);
      ctx.fillRect(bw - thick * 2, thick, thick, bh - thick * 2);
      ctx.restore();
    }

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, this.W, 14);
    ctx.fillStyle = '#FFF';
    ctx.font = '7px monospace';
    ctx.textAlign = 'left';
    const themeNames = { grass:'Đồng cỏ', forest:'Rừng', ice:'Băng', swamp:'Đầm lầy', volcanic:'Núi lửa', desert:'Sa mạc', darkforest:'Rừng tối', icecave:'Băng động', ancient:'Cổ thụ', heavenly:'Thiên đàng', void:'Hư vô' };
    ctx.fillText('🗺️ ' + (themeNames[this.currentTheme] || 'Map'), 4, 10);
    } finally {
      ctx.restore();
    }
  }

  setZoom(level) {
    this.zoomLevel = Math.max(1, Math.min(4, Math.round(level)));
    this._zoomCX = null;
    this._zoomCY = null;
  }

  getZoomCenter() {
    // Find center of player pets (non-monster, non-bot, non-dead)
    const pets = this.entities.filter(e => !e.isMonster && !e.isBot && !e.isBotCharacter && !e.dead);
    if (pets.length === 0) {
      return { x: this.W / 2, y: this.H / 2 };
    }
    let cx = 0, cy = 0;
    for (const p of pets) { cx += p.x; cy += p.y; }
    return { x: cx / pets.length, y: cy / pets.length };
  }

  drawWeather(ctx) {
    if (this.weatherType === 'clear' || this.weatherParticles.length === 0) return;
    for (const p of this.weatherParticles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      if (this.weatherType === 'rain') {
        ctx.strokeStyle = `rgba(170,221,255,${0.7 + p.alpha * 0.3})`;
        ctx.lineWidth = 0.8 + p.size * 0.15;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.wind * 0.35, p.y + 5 + p.size * 1.1);
        ctx.stroke();
        // Rain splash at bottom
        if (p.y > this.H * 0.8) {
          ctx.fillStyle = `rgba(170,221,255,${p.alpha * 0.2})`;
          ctx.fillRect(p.x - 1, p.y, 3, 1);
        }
      } else if (this.weatherType === 'snow') {
        const wobble = Math.sin(this.animTime * 2 + p.x * 0.1) * 0.5;
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath();
        ctx.arc(p.x + wobble, p.y, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(p.x - 1 + wobble, p.y - 1, p.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        // Sparkle
        if (p.size > 1.5) {
          ctx.fillStyle = 'rgba(255,255,255,0.15)';
          ctx.fillRect(p.x + wobble, p.y - 2, 1, 1);
        }
      } else if (this.weatherType === 'fog') {
        const driftX = Math.sin(this.animTime * 0.1 + p.x * 0.01 + p.y * 0.01) * 10;
        const grad = ctx.createRadialGradient(p.x + driftX, p.y, 1, p.x + driftX, p.y, p.size);
        grad.addColorStop(0, `rgba(180,200,220,${0.04 + p.alpha * 0.04})`);
        grad.addColorStop(1, 'rgba(180,200,220,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x + driftX, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.weatherType === 'ash') {
        const flicker = Math.sin(this.animTime * 3 + p.x + p.y) * 0.3 + 0.7;
        ctx.fillStyle = '#553322';
        const sz = p.size * 0.6;
        ctx.globalAlpha = p.alpha * flicker;
        ctx.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
        ctx.fillStyle = `rgba(255,100,0,${p.alpha * 0.1 * flicker})`;
        ctx.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
      } else if (this.weatherType === 'sand') {
        ctx.fillStyle = '#C4A050';
        const sz = p.size * 0.5;
        ctx.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
        ctx.fillStyle = 'rgba(200,160,80,0.2)';
        ctx.fillRect(p.x - sz / 2 - 0.5, p.y - sz / 2 - 0.5, sz + 1, sz + 1);
      } else if (this.weatherType === 'light') {
        const pulse = Math.sin(this.animTime * 2 + p.x) * 0.2 + 0.8;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, `rgba(255,255,200,${0.3 * pulse})`);
        grad.addColorStop(1, 'rgba(255,255,200,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.weatherType === 'void') {
        const pulse = Math.sin(this.animTime * 1.5 + p.x * 0.5) * 0.1 + 0.15;
        ctx.fillStyle = `rgba(100,0,150,${pulse})`;
        const sz = p.size;
        ctx.beginPath();
        ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  buildBackgroundCache() {
    const ctx = this._cacheCanvas.getContext('2d');
    const W = this.W, H = this.H;
    ctx.clearRect(0, 0, W, H);

    const tc = THEME_COLORS[this.currentTheme] || THEME_COLORS.grass;
    ctx.fillStyle = tc.bg;
    ctx.fillRect(0, 0, W, H);

    // Sky gradient overlay (dynamic, rich gradient)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.7);
    const skyColors = {
      grass:      ['rgba(60,120,200,0.15)', 'rgba(100,180,255,0.08)', 'rgba(0,0,0,0)'],
      forest:     ['rgba(30,80,160,0.10)', 'rgba(50,120,200,0.06)', 'rgba(0,0,0,0)'],
      ice:        ['rgba(140,200,255,0.20)', 'rgba(180,220,255,0.12)', 'rgba(0,0,0,0)'],
      swamp:      ['rgba(60,100,40,0.10)', 'rgba(80,120,60,0.06)', 'rgba(0,0,0,0)'],
      volcanic:   ['rgba(200,80,0,0.15)', 'rgba(255,100,0,0.08)', 'rgba(0,0,0,0)'],
      desert:     ['rgba(255,200,100,0.15)', 'rgba(200,160,80,0.08)', 'rgba(0,0,0,0)'],
      darkforest: ['rgba(20,0,40,0.12)', 'rgba(30,0,60,0.06)', 'rgba(0,0,0,0)'],
      icecave:    ['rgba(80,160,200,0.12)', 'rgba(100,180,220,0.06)', 'rgba(0,0,0,0)'],
      ancient:    ['rgba(80,180,60,0.10)', 'rgba(100,200,80,0.06)', 'rgba(0,0,0,0)'],
      heavenly:   ['rgba(180,180,255,0.20)', 'rgba(200,200,255,0.12)', 'rgba(0,0,0,0)'],
      void:       ['rgba(60,0,100,0.12)', 'rgba(80,0,120,0.06)', 'rgba(0,0,0,0)']
    };
    const sky = skyColors[this.currentTheme] || ['rgba(60,120,200,0.10)', 'rgba(100,180,255,0.06)', 'rgba(0,0,0,0)'];
    skyGrad.addColorStop(0, sky[0]);
    skyGrad.addColorStop(0.5, sky[1]);
    skyGrad.addColorStop(1, sky[2]);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H * 0.7);

    // Stars for dark themes
    const starThemes = ['icecave', 'void', 'darkforest', 'heavenly'];
    if (starThemes.includes(this.currentTheme)) {
      const seed = this.currentTheme === 'heavenly' ? 42 : (this.currentTheme === 'void' ? 99 : 17);
      for (let i = 0; i < 40; i++) {
        const sx = ((i * 137.5 + seed) % (W - 10)) + 5;
        const sy = ((i * 97.3 + 20) % Math.floor(H * 0.3)) + 3;
        const size = 0.5 + (i % 3) * 0.5;
        ctx.globalAlpha = 0.15 + (i % 5) * 0.05;
        ctx.fillStyle = this.currentTheme === 'void' ? '#8844AA' : '#CCDDFF';
        ctx.fillRect(sx, sy, size, size);
      }
      ctx.globalAlpha = 1;
    }

    // Sun/moon glow + celestial body
    const hasGlow = ['grass', 'desert', 'heavenly', 'volcanic'].includes(this.currentTheme);
    if (hasGlow) {
      const isMoon = this.currentTheme === 'heavenly';
      const glowColor = isMoon ? 'rgba(255,255,200,0.08)' :
                        this.currentTheme === 'volcanic' ? 'rgba(255,100,0,0.07)' :
                        this.currentTheme === 'desert' ? 'rgba(255,200,100,0.08)' :
                        'rgba(255,220,150,0.07)';
      const sunX = W * 0.75, sunY = 18;
      const glowGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, H * 0.35);
      glowGrad.addColorStop(0, glowColor);
      glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, W, H * 0.35);
      // Sun/moon disc
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = isMoon ? '#FFEEDD' : '#FFEEAA';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Parallax mountain/hill silhouettes for depth
    const hasMountains = !['void', 'icecave', 'darkforest'].includes(this.currentTheme);
    if (hasMountains) {
      // Far mountain range (distant, darker)
      const farColor = {
        grass: '#1a2a1a', forest: '#0d1a0d', ice: '#2a3a4a',
        swamp: '#0a150a', volcanic: '#1a0a00', desert: '#2a2a0a',
        ancient: '#0a0a05', heavenly: '#1a1a3a'
      }[this.currentTheme] || '#1a1a2a';
      
      // Far mountains
      ctx.fillStyle = farColor;
      ctx.beginPath();
      ctx.moveTo(0, H * 0.45);
      for (let x = 0; x <= W; x += 12) {
        const h = H * 0.42 + Math.sin(x * 0.015 + 1) * 12 + Math.sin(x * 0.03) * 6 + Math.sin(x * 0.007) * 18;
        ctx.lineTo(x, h);
      }
      ctx.lineTo(W, H * 0.45);
      ctx.closePath();
      ctx.fill();

      // Near hills (closer, lighter)
      const nearColor = {
        grass: '#2a4a2a', forest: '#1a3a1a', ice: '#4a5a6a',
        swamp: '#1a2a1a', volcanic: '#2a1a0a', desert: '#3a3a1a',
        ancient: '#1a2a0a', heavenly: '#2a2a4a'
      }[this.currentTheme] || '#2a2a3a';
      
      ctx.fillStyle = nearColor;
      ctx.beginPath();
      ctx.moveTo(0, H * 0.5);
      for (let x = 0; x <= W; x += 8) {
        const h = H * 0.48 + Math.sin(x * 0.025 + 3) * 8 + Math.sin(x * 0.05) * 4 + Math.sin(x * 0.01) * 12;
        ctx.lineTo(x, h);
      }
      ctx.lineTo(W, H * 0.5);
      ctx.closePath();
      ctx.fill();
    }

    // Tiles
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.drawTile(ctx, c, r);
      }
    }
  }

  getThemeColors() {
    return THEME_COLORS[this.currentTheme] || THEME_COLORS.grass;
  }

  drawTile(ctx, col, row) {
    const x = this.offX + col * this.tileW;
    const y = this.offY + row * this.tileH;
    const tile = this.tileMap[row][col];
    const tc = this.getThemeColors();
    const seed = (col * 7 + row * 13) % 100;
    const isAnimated = ['water', 'lava', 'grass'].includes(this.currentTheme);

    // Ground fill
    if (tile.type === 'edge') {
      ctx.fillStyle = tc.edge[tile.variant % tc.edge.length];
      ctx.fillRect(x, y, this.tileW, this.tileH);
    } else if (tile.type === 'road') {
      ctx.fillStyle = tc.road;
      ctx.fillRect(x, y, this.tileW, this.tileH);
      const hr = tc.road === '#5a5a5a' ? '#6a6a6a' : lightenColor(tc.road, 20);
      ctx.fillStyle = hr;
      ctx.fillRect(x + 3, y + 3, 3, 3);
      ctx.fillRect(x + 12, y + 7, 3, 3);
      ctx.fillRect(x + 7, y + 12, 3, 3);
      ctx.fillRect(x + 17, y + 10, 2, 2);
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(x, y, this.tileW, 1);
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(this.tileW / 28, this.tileH / 24);
      // Animated grass on road edges
      if (seed % 3 === 0 && isAnimated) {
        const swayX = Math.sin(this.animTime * 2 + col * 0.7 + row * 0.5) * 1.2;
        ctx.fillStyle = 'rgba(50,120,50,0.15)';
        ctx.fillRect(10 + swayX, 17, 1.5, 5);
        ctx.fillRect(17 + swayX * 0.7, 18, 1, 4);
        ctx.fillRect(5 + swayX * 1.1, 18, 1, 4);
      }
      ctx.restore();
      return;
    } else {
      ctx.fillStyle = tc.ground[tile.variant % tc.ground.length];
      ctx.fillRect(x, y, this.tileW, this.tileH);
      // Ground texture: tiny grass/stone dots + subtle cracks
      const dotSeed = (col * 31 + row * 17) % 10;
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      if (dotSeed === 0 || dotSeed === 5) ctx.fillRect(x + 5, y + 8, 2, 2);
      if (dotSeed === 1 || dotSeed === 6) ctx.fillRect(x + 15, y + 4, 2, 1);
      if (dotSeed === 2) ctx.fillRect(x + 10, y + 16, 2, 2);
      if (dotSeed === 3) ctx.fillRect(x + 20, y + 12, 1, 1);
      if (dotSeed === 4) ctx.fillRect(x + 3, y + 18, 2, 1);
      if (dotSeed === 7) ctx.fillRect(x + 8, y + 6, 1, 3);
      if (dotSeed === 8) ctx.fillRect(x + 18, y + 14, 2, 1);
      // Small cracks (darker)
      if (dotSeed === 9 && this.currentTheme !== 'heavenly' && this.currentTheme !== 'ice') {
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        ctx.fillRect(x + 12, y + 5, 1, 4);
        ctx.fillRect(x + 12, y + 4, 2, 1);
      }
      // Grass blades sway for organic themes
      const hasGrass = ['grass', 'forest', 'swamp', 'ancient'].includes(this.currentTheme);
      if (hasGrass && seed % 4 < 2) {
        const swaySin = Math.sin(this.animTime * 1.5 + col * 0.9 + row * 0.7);
        const sway = swaySin * 1.2;
        const bladeH = 4 + (seed % 3);
        ctx.fillStyle = tile.type === 'edge' ? 'rgba(80,160,60,0.08)' : 'rgba(60,140,40,0.12)';
        ctx.fillRect(x + 6 + sway, y + this.tileH - bladeH - 1, 1.5, bladeH);
        ctx.fillRect(x + 14 + sway * 0.6, y + this.tileH - bladeH + 1, 1, bladeH - 2);
        ctx.fillRect(x + 22 + sway * 0.8, y + this.tileH - bladeH, 1.2, bladeH);
        ctx.fillStyle = tile.type === 'edge' ? 'rgba(100,200,80,0.06)' : 'rgba(80,180,60,0.08)';
        ctx.fillRect(x + 8 + sway * 0.5, y + this.tileH - bladeH, 1, bladeH - 1);
      }
    }

    // === 3D tile bevel ===
    if (tile.type !== 'road' && tile.type !== 'edge') {
      // Top highlight
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(x, y, this.tileW, 1);
      // Left highlight
      ctx.fillRect(x, y, 1, this.tileH);
      // Bottom shadow
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fillRect(x, y + this.tileH - 1, this.tileW, 1);
      // Right shadow
      ctx.fillRect(x + this.tileW - 1, y, 1, this.tileH);
    }

    // Ground-level shadow for more depth
    if (tile.type !== 'road' && tile.type !== 'edge' && seed % 5 === 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.04)';
      ctx.fillRect(x + 1, y + this.tileH - 3, this.tileW - 2, 2);
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x, y, this.tileW, this.tileH);

    // Decorations (scaled to tile size)
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(this.tileW / 28, this.tileH / 24);
    if (tile.type === 'flower') {
      const petal = ['#ffdd44', '#ff88cc', '#ff6644', '#ffffff'][tile.variant % 4];
      ctx.fillStyle = petal;
      ctx.fillRect(10, 7, 4, 4);
      ctx.fillRect(16, 12, 3, 3);
      ctx.fillStyle = '#ffdd44';
      ctx.fillRect(12, 9, 3, 3);
    }
    if (tile.type === 'mushroom') {
      ctx.fillStyle = '#cc8844';
      ctx.fillRect(11, 10, 3, 5);
      ctx.fillStyle = ['#ff4444', '#ff8844', '#aa44ff'][tile.variant % 3];
      ctx.beginPath();
      ctx.arc(12, 9, 5, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(10, 7, 2, 2);
      ctx.fillRect(14, 8, 2, 2);
    }
    if (tile.type === 'ice_crystal') {
      ctx.fillStyle = '#b0e8ff';
      ctx.beginPath();
      ctx.moveTo(12, 4);
      ctx.lineTo(16, 12);
      ctx.lineTo(8, 12);
      ctx.fill();
      ctx.fillStyle = '#d0f0ff';
      ctx.beginPath();
      ctx.moveTo(12, 7);
      ctx.lineTo(14, 12);
      ctx.lineTo(10, 12);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(12, 4); ctx.lineTo(8, 12);
      ctx.moveTo(12, 4); ctx.lineTo(16, 12);
      ctx.stroke();
    }
    if (tile.type === 'snow') {
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.arc(10, 10, 3.5, 0, Math.PI * 2);
      ctx.arc(16, 8, 2.5, 0, Math.PI * 2);
      ctx.arc(13, 14, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.arc(7, 12, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    if (tile.type === 'lava') {
      ctx.fillStyle = '#ff4400';
      ctx.fillRect(6, 8, 12, 5);
      // Lava glow
      ctx.fillStyle = `rgba(255,50,0,${0.06 + Math.sin(this.animTime * 1.5 + seed) * 0.04})`;
      ctx.fillRect(4, 6, 16, 9);
      // Animated lava flow waves
      ctx.fillStyle = '#ff8800';
      const wave1 = Math.sin(this.animTime * 2 + col + row) * 1.5 + 1.5;
      const wave2 = Math.sin(this.animTime * 1.7 + col * 1.2 + row * 0.8 + 1) * 1.3 + 1.3;
      ctx.fillRect(8, 9 + wave1, 3, 2);
      ctx.fillRect(14, 10 + wave1, 2, 2);
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(6, 8 + wave2, 2, 1);
      ctx.fillRect(16, 9 + wave2 * 0.8, 2, 1);
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(10, 10 + Math.sin(this.animTime * 3 + col) * 1.2, 2, 1);
      // Bubbles
      const bubblePhase = (this.animTime * 2 + col * 0.5 + row * 0.7) % 4;
      if (bubblePhase < 1) {
        ctx.fillStyle = `rgba(255,200,50,${0.15 * (1 - bubblePhase)})`;
        ctx.beginPath();
        ctx.arc(12, 11 - bubblePhase * 2, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (tile.type === 'cactus') {
      ctx.fillStyle = '#3a6a2a';
      ctx.fillRect(11, 6, 3, 10);
      ctx.fillRect(8, 8, 9, 3);
      ctx.fillRect(7, 9, 4, 2);
      ctx.fillRect(14, 7, 4, 2);
      ctx.fillStyle = '#4a7a3a';
      ctx.fillRect(12, 5, 2, 2);
      ctx.fillStyle = '#5a8a4a';
      ctx.fillRect(9, 10, 2, 1);
    }
    if (tile.type === 'skull') {
      ctx.fillStyle = '#aaaaaa';
      ctx.fillRect(8, 7, 8, 7);
      ctx.fillStyle = '#222222';
      ctx.fillRect(10, 9, 2, 2);
      ctx.fillRect(12, 9, 2, 2);
      ctx.fillRect(11, 12, 2, 1);
      ctx.fillStyle = 'rgba(255,0,0,0.08)';
      ctx.fillRect(9, 8, 6, 1);
    }
    if (tile.type === 'water') {
      ctx.fillStyle = tc.water[tile.variant % tc.water.length];
      ctx.fillRect(2, 6, 20, 10);
      // Reflective highlight gradient
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(3, 7, 8, 1);
      // Animated wave ripples
      const wave1 = Math.sin(this.animTime * 1.2 + col * 0.8 + row * 0.6) * 1.8 + 1.8;
      const wave2 = Math.sin(this.animTime * 0.9 + row * 0.7 + col * 0.5 + 2) * 1.5 + 1.5;
      const wave3 = Math.sin(this.animTime * 1.5 + col * 1.1 + 1) * 1.2 + 1.2;
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(5, 8 + wave1, 5, 1);
      ctx.fillRect(13, 13 + wave2, 6, 1);
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      ctx.fillRect(3, 11 + wave3, 3, 1);
      ctx.fillRect(17, 9 + Math.sin(this.animTime * 1.7 + col * 0.9) * 1.5 + 1.5, 4, 1);
      // Foam edge at top
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(4, 6 + Math.sin(this.animTime * 0.8 + col) * 0.8, 3, 1);
      ctx.fillRect(14, 6 + Math.sin(this.animTime * 0.6 + row) * 0.8, 3, 1);
      // Deep water shadow
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(6, 14, 8, 2);
    }
    if (tile.type === 'rock') {
      ctx.fillStyle = '#5a5a5a';
      ctx.fillRect(8, 9, 8, 4);
      ctx.fillRect(11, 7, 4, 3);
      ctx.fillStyle = '#6a6a6a';
      ctx.fillRect(9, 8, 3, 2);
      ctx.fillStyle = '#7a7a7a';
      ctx.fillRect(13, 10, 2, 1);
    }
    if (tile.type === 'tree') {
      const tr = tc.tree || { trunk: '#5a3a1a', leaf: '#2d7b27', leaf2: '#3d8b37', leaf3: '#5aad54' };
      // Gentle sway for foliage
      const sway = Math.sin(this.animTime * 0.8 + col * 1.2 + row * 0.9) * 0.8;
      ctx.fillStyle = tr.trunk;
      ctx.fillRect(10, 7, 4, 10);
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(10, 7, 2, 10);
      // Foliage layers (back to front)
      ctx.fillStyle = tr.leaf3 || '#5aad54';
      ctx.beginPath();
      ctx.arc(12 + sway * 0.3, 6, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = tr.leaf;
      ctx.beginPath();
      ctx.arc(12 + sway * 0.5, 6, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = tr.leaf2;
      ctx.beginPath();
      ctx.arc(9 + sway * 0.4, 4, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(15 + sway * 0.4, 5, 5, 0, Math.PI * 2);
      ctx.fill();
      // Leaf highlight
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath();
      ctx.arc(10 + sway * 0.2, 3, 3, 0, Math.PI * 2);
      ctx.fill();
      // Fallen leaves at base
      if (seed % 2 === 0) {
        ctx.fillStyle = tr.leaf2;
        ctx.fillRect(6 + sway, 18, 2, 1);
        ctx.fillRect(17 + sway * 0.5, 18, 2, 1);
        ctx.fillStyle = tr.leaf;
        ctx.fillRect(11 + sway, 19, 2, 1);
      }
    }
    // === NEW: additional decorations ===
    if (tile.type === 'bush') {
      ctx.fillStyle = '#3a7a2a';
      ctx.beginPath();
      ctx.arc(12, 10, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4a8a3a';
      ctx.beginPath();
      ctx.arc(9, 12, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(15, 11, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    if (tile.type === 'bones') {
      ctx.fillStyle = '#cccccc';
      ctx.fillRect(8, 9, 3, 1);
      ctx.fillRect(15, 12, 3, 1);
      ctx.fillRect(9, 10, 1, 3);
      ctx.fillRect(16, 11, 1, 3);
      ctx.fillStyle = '#aaaaaa';
      ctx.fillRect(11, 12, 4, 1);
    }
    if (tile.type === 'torch') {
      const flicker = Math.sin(this.animTime * 5 + seed) * 0.3 + 0.7;
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(11, 12, 3, 6);
      ctx.fillStyle = `rgba(255,150,0,${0.6 * flicker})`;
      ctx.fillRect(11, 9, 3, 4);
      ctx.fillStyle = `rgba(255,200,50,${0.4 * flicker})`;
      ctx.fillRect(12, 8, 1, 4);
      ctx.fillStyle = `rgba(255,100,0,${0.08 * flicker})`;
      ctx.beginPath();
      ctx.arc(12, 10, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    if (tile.type === 'star') {
      const twinkle = Math.sin(this.animTime * 2 + seed + col * 3) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(255,255,200,${0.4 * twinkle})`;
      ctx.fillRect(12, 8, 2, 2);
      ctx.fillStyle = `rgba(255,255,200,${0.15 * twinkle})`;
      ctx.beginPath();
      ctx.arc(13, 9, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    if (tile.type === 'crystal_cluster') {
      ctx.fillStyle = '#8a5aff';
      ctx.beginPath();
      ctx.moveTo(10, 14);
      ctx.lineTo(12, 5);
      ctx.lineTo(14, 14);
      ctx.fill();
      ctx.fillStyle = '#aa7aff';
      ctx.beginPath();
      ctx.moveTo(8, 14);
      ctx.lineTo(9, 8);
      ctx.lineTo(11, 14);
      ctx.fill();
      ctx.fillStyle = '#6a3add';
      ctx.beginPath();
      ctx.moveTo(14, 14);
      ctx.lineTo(16, 7);
      ctx.lineTo(18, 14);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(11, 7, 1, 5);
    }
    ctx.restore();
  }


}

class MapEntity {
  constructor(pet, isMonster, col, row) {
    this.pet = pet;
    this.isMonster = isMonster;
    this.targetCol = col;
    this.targetRow = row;
    this.x = 0;
    this.y = 0;
    this.hitFlash = 0;
    this.attackTimer = 0;
    this.staggerTimer = 0;
    this.impactPulse = 0;
    this.knockbackX = 0;
    this.knockbackY = 0;
    this.dead = false;
    this._displaySkill = '';
    this._skillTimer = 0;
  }
  setTarget(col, row) {
    this.targetCol = col;
    this.targetRow = row;
  }
}

class MapEffect {
  constructor(type, fromX, fromY, toX, toY, visualType, canvasW, canvasH, sharpness = 1.5) {
    this.type = type;
    this.visualType = visualType || type;
    this.fromX = fromX;
    this.fromY = fromY;
    this.toX = toX;
    this.toY = toY;
    this.canvasW = canvasW || 0;
    this.canvasH = canvasH || 0;
    this.life = 0.34;
    this.maxLife = 0.34;
    this.progress = 0;
    this.seed = Math.random() * 100;
    this.trail = [];
    this.S = sharpness;
  }

  getVisualKey() {
    return this.visualType || this.type;
  }

  drawSpecialEffect(ctx, p, alpha, e, cx, cy) {
    const S = this.S;
    const key = this.getVisualKey();
    switch (key) {
      case 'slash': {
        ctx.save();
        ctx.globalAlpha = alpha * 0.9;
        ctx.strokeStyle = e.light;
        ctx.lineWidth = 2 + p * 1.8;
        ctx.beginPath();
        ctx.moveTo(this.fromX, this.fromY - 2);
        ctx.quadraticCurveTo(this.fromX + (this.toX - this.fromX) * 0.45, this.fromY + (this.toY - this.fromY) * 0.45 - 18, cx, cy);
        ctx.stroke();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.fromX + 2, this.fromY - 1);
        ctx.quadraticCurveTo(this.fromX + (this.toX - this.fromX) * 0.5, this.fromY + (this.toY - this.fromY) * 0.5 - 10, cx + 1, cy + 1);
        ctx.stroke();
        ctx.fillStyle = e.glow;
        ctx.beginPath();
        ctx.arc(cx, cy, 3.2 + p * 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      }
      case 'spin': {
        ctx.save();
        ctx.globalAlpha = alpha * 0.75;
        for (let i = 0; i < 8; i++) {
          const angle = p * 6 + i * 0.785;
          const dist = 4.8 + p * 12.8 + i * 0.6;
          ctx.strokeStyle = i % 2 === 0 ? e.light : e.glow;
          ctx.lineWidth = 1 + p * 0.4;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist);
          ctx.stroke();
        }
        ctx.restore();
        return true;
      }
      case 'shot': {
        ctx.save();
        ctx.globalAlpha = alpha * 0.9;
        ctx.strokeStyle = e.light;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(this.fromX, this.fromY);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        ctx.fillStyle = e.main;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - 4, cy - 2.5);
        ctx.lineTo(cx - 4, cy + 2.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        return true;
      }
      case 'rainshot': {
        ctx.save();
        ctx.globalAlpha = alpha * 0.7;
        for (let i = 0; i < 4; i++) {
          const offset = (i - 1.5) * 3;
          ctx.strokeStyle = i % 2 === 0 ? e.light : e.glow;
          ctx.lineWidth = 1.2 + p * 0.5;
          ctx.beginPath();
          ctx.moveTo(this.fromX + offset, this.fromY - 8 - i * 2);
          ctx.lineTo(cx + offset * 0.5, cy + i * 1.2);
          ctx.stroke();
        }
        ctx.restore();
        return true;
      }
      case 'taunt': {
        ctx.save();
        // Aggressive expanding rings
        ctx.globalAlpha = alpha * 0.7;
        for (let i = 0; i < 3; i++) {
          const ringR = 4 + i * 4 + p * 8;
          ctx.strokeStyle = i % 2 === 0 ? e.glow : '#FFFFFF';
          ctx.lineWidth = 1.6 * (1 - p * 0.5);
          ctx.beginPath();
          ctx.arc(cx, cy - 2, ringR, 0, Math.PI * 2);
          ctx.stroke();
        }
        // Inner flash
        ctx.globalAlpha = alpha * 0.9;
        const tauntGrad = ctx.createRadialGradient(cx, cy - 2, 0, cx, cy - 2, 6 + p * 5);
        tauntGrad.addColorStop(0, '#FFFFFF');
        tauntGrad.addColorStop(0.5, e.main || '#FF4400');
        tauntGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = tauntGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 2, 6 + p * 5, 0, Math.PI * 2);
        ctx.fill();
        // Sparks
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = e.glow;
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + p * 4;
          const d = 5 + p * 10 + i * 0.5;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * d, cy - 2 + Math.sin(a) * d, 1.2 + (1 - p) * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return true;
      }
      case 'knockback': {
        ctx.save();
        ctx.globalAlpha = alpha * 0.8;
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 9.6 + p * 9.6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - 6, cy - 1);
        ctx.lineTo(cx + 6, cy - 1);
        ctx.moveTo(cx - 5, cy + 2);
        ctx.lineTo(cx + 5, cy + 2);
        ctx.stroke();
        ctx.restore();
        return true;
      }
      case 'slam': {
        ctx.save();
        // Slam wave
        ctx.globalAlpha = alpha * 0.7;
        ctx.fillStyle = e.glow;
        ctx.beginPath();
        ctx.arc(cx, cy, 12.8 + p * 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = e.main;
        ctx.beginPath();
        ctx.arc(cx, cy, 6.4 + p * 6.4, 0, Math.PI * 2);
        ctx.fill();
        // White flash
        ctx.globalAlpha = alpha * Math.max(0, 1 - p * 2.5);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx, cy, 5 * (1 - p), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      }
      case 'storm': {
        ctx.save();
        // Spinning vortex
        ctx.globalAlpha = alpha * 0.7;
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 3.2 + p * 4.8;
          const dist = 6.4 + p * 16 + i * 1.2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist);
          ctx.stroke();
        }
        // Outer ring
        ctx.globalAlpha = alpha * 0.4;
        ctx.strokeStyle = e.light;
        ctx.lineWidth = 1.5 * (1 - p);
        ctx.beginPath();
        ctx.arc(cx, cy, 9.6 + p * 19.2, 0, Math.PI * 2);
        ctx.stroke();
        // Wind particles
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = e.light;
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 3.2 + p * 6.4;
          const d = 4.8 + p * 22.4 + i;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 1.5 + (1 - p) * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return true;
      }
      case 'dash':
      case 'dash_strike': {
        ctx.save();
        // Main dash trail
        ctx.globalAlpha = alpha * 0.95;
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 3 + p * 2;
        ctx.beginPath();
        ctx.moveTo(this.fromX, this.fromY);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        // Speed lines
        ctx.globalAlpha = alpha * 0.5;
        ctx.strokeStyle = e.light;
        ctx.lineWidth = 1.2;
        for (let i = -2; i <= 2; i++) {
          if (i === 0) continue;
          ctx.beginPath();
          ctx.moveTo(this.fromX + i * 3, this.fromY + i * 1.5);
          ctx.lineTo(cx + i * 2, cy + i);
          ctx.stroke();
        }
        // Impact burst
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx, cy, 3.2 + p * 4.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      }
      case 'meteor':
      case 'meteor_storm':
      case 'fire_eruption': {
        ctx.save();
        // Outer shockwave ring
        ctx.globalAlpha = alpha * 0.5;
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 2.5 * (1 - p);
        ctx.beginPath();
        ctx.arc(cx, cy, 9.6 + p * 28.8, 0, Math.PI * 2);
        ctx.stroke();
        // Inner blast
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillStyle = e.glow;
        ctx.beginPath();
        ctx.arc(cx, cy, 12.8 + p * 12.8, 0, Math.PI * 2);
        ctx.fill();
        // Core
        ctx.fillStyle = e.main;
        ctx.beginPath();
        ctx.arc(cx, cy, 8 + p * 6.4, 0, Math.PI * 2);
        ctx.fill();
        // Bright flash at center
        ctx.globalAlpha = alpha * Math.max(0, 1 - p * 3);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx, cy, 4 * (1 - p), 0, Math.PI * 2);
        ctx.fill();
        // Fire particles
        ctx.globalAlpha = alpha * 0.7;
        ctx.fillStyle = e.light;
        for (let i = 0; i < 6; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = p * 20 + i * 2;
          const ps = 1.5 + (1 - p) * 2;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, ps, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return true;
      }
      case 'ground_stomp': {
        ctx.save();
        // Expanding ground ring
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = e.glow;
        ctx.beginPath();
        ctx.arc(cx, cy, 16 + p * 19.2, 0, Math.PI * 2);
        ctx.fill();
        // Ground crack radiating
        ctx.globalAlpha = alpha * 0.5;
        ctx.strokeStyle = e.dark;
        ctx.lineWidth = 1.8;
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 3.2 + p * 0.5;
          const len = 8 + p * 22.4;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
          ctx.stroke();
        }
        // Core impact
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillStyle = e.main;
        ctx.beginPath();
        ctx.arc(cx, cy, 8 + p * 6.4, 0, Math.PI * 2);
        ctx.fill();
        // Ring shockwave
        ctx.globalAlpha = alpha * 0.7;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.4 * (1 - p);
        ctx.beginPath();
        ctx.arc(cx, cy, 11.2 + p * 16, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        return true;
      }
      case 'fire_breath': {
        ctx.save();
        // Flame arc trail
        ctx.globalAlpha = alpha * 0.85;
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 3 + p * 3;
        ctx.beginPath();
        ctx.moveTo(this.fromX, this.fromY);
        ctx.quadraticCurveTo(cx - 12, cy - 6, cx, cy);
        ctx.stroke();
        // Secondary flame trail
        ctx.globalAlpha = alpha * 0.55;
        ctx.strokeStyle = e.main;
        ctx.lineWidth = 2 + p * 2;
        ctx.beginPath();
        ctx.moveTo(this.fromX - 3, this.fromY + 2);
        ctx.quadraticCurveTo(cx - 8, cy + 2, cx + 2, cy + 2);
        ctx.stroke();
        // Fireball at impact
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillStyle = e.main;
        ctx.beginPath();
        ctx.arc(cx, cy, 4.8 + p * 9.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = e.glow;
        ctx.beginPath();
        ctx.arc(cx, cy, 2.4 + p * 4.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      }
      case 'thunder_bolt':
      case 'flash_strike': {
        ctx.save();
        // Main lightning bolt
        ctx.globalAlpha = alpha * 0.95;
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 3 + p * 2;
        ctx.beginPath();
        ctx.moveTo(this.fromX, this.fromY - 3);
        ctx.lineTo(cx - 5, cy - 4);
        ctx.lineTo(cx + 2, cy + 2);
        ctx.lineTo(cx + 8, cy + 4);
        ctx.stroke();
        // Secondary branches
        ctx.globalAlpha = alpha * 0.6;
        ctx.strokeStyle = e.light;
        ctx.lineWidth = 1.5 + p;
        ctx.beginPath();
        ctx.moveTo(cx - 3, cy - 2);
        ctx.lineTo(cx - 8, cy + 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 2, cy + 1);
        ctx.lineTo(cx + 10, cy - 3);
        ctx.stroke();
        // Impact flash
        ctx.globalAlpha = alpha * Math.max(0, 1 - p * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx, cy, 5 * (1 - p), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      }
      // === 10 NEW THUNDER ATTACK VISUALS ===
      case 'thunder_slash': {
        ctx.save();
        // Lightning-infused blade arc
        ctx.globalAlpha = alpha * 0.9;
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 3 + p * 2;
        ctx.beginPath();
        ctx.moveTo(this.fromX, this.fromY);
        const cpx = (this.fromX + cx) / 2 - 12;
        const cpy = (this.fromY + cy) / 2 - 20;
        ctx.quadraticCurveTo(cpx, cpy, cx, cy);
        ctx.stroke();
        // Inner bright arc
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5 + p;
        ctx.beginPath();
        ctx.moveTo(this.fromX + 2, this.fromY + 1);
        ctx.quadraticCurveTo(cpx + 2, cpy + 2, cx + 1, cy + 1);
        ctx.stroke();
        // Sparkle particles along arc
        ctx.globalAlpha = alpha * 0.7;
        ctx.fillStyle = e.light;
        for (let i = 0; i < 8; i++) {
          const t = i / 7;
          const sx = this.fromX + (cx - this.fromX) * t + (Math.random() - 0.5) * 6;
          const sy = this.fromY + (cy - this.fromY) * t - 8 * Math.sin(t * Math.PI) + (Math.random() - 0.5) * 4;
          ctx.beginPath();
          ctx.arc(sx, sy, 1 + (1 - p) * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        // Impact star
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2;
          const d = 3 + p * 5;
          ctx.fillRect(cx + Math.cos(a) * d - 1, cy + Math.sin(a) * d - 1, 2, 2);
        }
        ctx.restore();
        return true;
      }
      case 'thunder_burst': {
        ctx.save();
        // Expanding electric sphere
        ctx.globalAlpha = alpha * 0.7;
        const burstGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12 + p * 20);
        burstGrad.addColorStop(0, '#FFFFFF');
        burstGrad.addColorStop(0.3, e.glow);
        burstGrad.addColorStop(0.6, e.main);
        burstGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = burstGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 12 + p * 20, 0, Math.PI * 2);
        ctx.fill();
        // Lightning arcs from center
        ctx.globalAlpha = alpha * 0.6;
        ctx.strokeStyle = e.light;
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + Math.random() * 0.3;
          const len = 6 + p * 18 + i;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          const midX = cx + Math.cos(a) * len * 0.5 + (Math.random() - 0.5) * 4;
          const midY = cy + Math.sin(a) * len * 0.5 + (Math.random() - 0.5) * 4;
          ctx.lineTo(midX, midY);
          ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
          ctx.stroke();
        }
        // Spark particles outward
        ctx.globalAlpha = alpha * 0.8;
        ctx.fillStyle = e.light;
        for (let i = 0; i < 12; i++) {
          const a = Math.random() * Math.PI * 2;
          const d = p * 22 + i * 1.2;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 1 + (1 - p) * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return true;
      }
      case 'thunder_beam': {
        ctx.save();
        // Main beam from caster to target
        ctx.globalAlpha = alpha * 0.85;
        const beamW = 4 + p * 3;
        const beamGrad = ctx.createLinearGradient(this.fromX, this.fromY, cx, cy);
        beamGrad.addColorStop(0, e.main + '80');
        beamGrad.addColorStop(0.5, e.glow);
        beamGrad.addColorStop(1, '#FFFFFF');
        ctx.strokeStyle = beamGrad;
        ctx.lineWidth = beamW;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.fromX, this.fromY);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        // Outer glow
        ctx.globalAlpha = alpha * 0.4;
        ctx.strokeStyle = e.light;
        ctx.lineWidth = beamW * 2.5;
        ctx.beginPath();
        ctx.moveTo(this.fromX, this.fromY);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        // Impact explosion
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx, cy, 4 + p * 6, 0, Math.PI * 2);
        ctx.fill();
        // Particles along beam
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = e.light;
        for (let i = 0; i < 6; i++) {
          const t = (i + 1) / 7;
          const bx = this.fromX + (cx - this.fromX) * t;
          const by = this.fromY + (cy - this.fromY) * t;
          ctx.beginPath();
          ctx.arc(bx + (Math.random() - 0.5) * 3, by + (Math.random() - 0.5) * 3, 1.5 + p, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return true;
      }
      case 'electric_wave': {
        ctx.save();
        // Concentric expanding waves
        for (let w = 0; w < 3; w++) {
          const waveR = 4 + w * 5 + p * 14;
          ctx.globalAlpha = alpha * (0.5 - w * 0.12);
          ctx.strokeStyle = w === 1 ? e.glow : e.light;
          ctx.lineWidth = 2 * (1 - p * 0.3);
          ctx.beginPath();
          ctx.arc(cx, cy, waveR, 0, Math.PI * 2);
          ctx.stroke();
          // Zigzag on wave
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 0.8;
          for (let z = 0; z < 6; z++) {
            const za = (z / 6) * Math.PI * 2 + w * 0.5 + p * 0.3;
            const zr = waveR;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(za) * (zr - 2), cy + Math.sin(za) * (zr - 2));
            ctx.lineTo(cx + Math.cos(za + 0.1) * (zr + 2), cy + Math.sin(za + 0.1) * (zr + 2));
            ctx.stroke();
          }
        }
        // Center glow
        ctx.globalAlpha = alpha * 0.7;
        ctx.fillStyle = e.glow;
        ctx.beginPath();
        ctx.arc(cx, cy, 3 + p * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      }
      case 'lightning_blade': {
        ctx.save();
        // Blade-shaped projectile
        ctx.globalAlpha = alpha * 0.9;
        const bladeLen = 16 + p * 8;
        const angle = Math.atan2(cy - this.fromY, cx - this.fromX);
        // Blade body
        ctx.fillStyle = e.glow;
        ctx.beginPath();
        ctx.moveTo(cx, cy - bladeLen * 0.4);
        ctx.lineTo(cx + bladeLen * 0.15, cy);
        ctx.lineTo(cx, cy + bladeLen * 0.4);
        ctx.lineTo(cx - bladeLen * 0.15, cy);
        ctx.closePath();
        ctx.fill();
        // Blade edge glow
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(cx, cy - bladeLen * 0.35);
        ctx.lineTo(cx + bladeLen * 0.08, cy);
        ctx.lineTo(cx, cy + bladeLen * 0.35);
        ctx.lineTo(cx - bladeLen * 0.08, cy);
        ctx.closePath();
        ctx.fill();
        // Lightning trail behind blade
        ctx.globalAlpha = alpha * 0.5;
        ctx.strokeStyle = e.light;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - Math.cos(angle) * 8, cy - Math.sin(angle) * 8);
        ctx.lineTo(this.fromX, this.fromY);
        ctx.stroke();
        // Spark particles
        ctx.globalAlpha = alpha * 0.7;
        ctx.fillStyle = e.light;
        for (let i = 0; i < 5; i++) {
          const px = cx + (Math.random() - 0.5) * bladeLen * 0.5;
          const py = cy + (Math.random() - 0.5) * bladeLen * 0.3;
          ctx.beginPath();
          ctx.arc(px, py, 1 + (1 - p) * 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return true;
      }
      case 'twin_sparks': {
        ctx.save();
        // Two rapid spark trails
        for (let t = 0; t < 2; t++) {
          const offX = (t - 0.5) * 6;
          const offY = (t - 0.5) * 3;
          ctx.globalAlpha = alpha * (0.8 - t * 0.1);
          ctx.strokeStyle = t === 0 ? e.glow : e.light;
          ctx.lineWidth = 2.5 - t * 0.5;
          ctx.beginPath();
          ctx.moveTo(this.fromX + offX, this.fromY + offY);
          ctx.lineTo(cx + offX * 0.3, cy + offY * 0.3);
          ctx.stroke();
          // Spark dots along trail
          ctx.fillStyle = t === 0 ? '#FFFFFF' : e.light;
          for (let i = 0; i < 4; i++) {
            const t2 = (i + 1) / 5;
            const sx = this.fromX + (cx - this.fromX) * t2 + offX * (1 - t2);
            const sy = this.fromY + (cy - this.fromY) * t2 + offY * (1 - t2);
            ctx.beginPath();
            ctx.arc(sx + (Math.random() - 0.5) * 2, sy + (Math.random() - 0.5) * 2, 1 + (1 - p) * 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        // Impact cross
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(cx - 2, cy - 5, 4, 10);
        ctx.fillRect(cx - 5, cy - 2, 10, 4);
        ctx.restore();
        return true;
      }
      case 'thunder_hammer': {
        ctx.save();
        // Heavy hammer slam
        ctx.globalAlpha = alpha * 0.8;
        // Shockwave rings
        for (let r = 0; r < 3; r++) {
          const rr = 4 + r * 6 + p * 16;
          ctx.strokeStyle = r % 2 === 0 ? e.glow : '#FFFFFF';
          ctx.lineWidth = 2.5 * (1 - p * 0.3);
          ctx.beginPath();
          ctx.arc(cx, cy + 4, rr, 0, Math.PI * 2);
          ctx.stroke();
        }
        // Ground spikes (electric)
        ctx.globalAlpha = alpha * 0.7;
        ctx.fillStyle = e.light;
        for (let i = 0; i < 5; i++) {
          const sx = cx + (i - 2) * 5;
          const sh = 6 + p * 10 + i * 0.8;
          ctx.beginPath();
          ctx.moveTo(sx - 2, cy + 4);
          ctx.lineTo(sx, cy + 4 - sh);
          ctx.lineTo(sx + 2, cy + 4);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = e.glow;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
        // Core flash
        ctx.globalAlpha = alpha * Math.max(0, 1 - p * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx, cy, 5 * (1 - p), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      }
      case 'lightning_chain': {
        ctx.save();
        // Chain lightning arcs between all entities
        ctx.globalAlpha = alpha * 0.85;
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 2 + p * 1.5;
        // Main arc to target
        ctx.beginPath();
        ctx.moveTo(this.fromX, this.fromY);
        const midX = (this.fromX + cx) / 2 + (Math.random() - 0.5) * 10;
        const midY = Math.min(this.fromY, cy) - 10 + Math.random() * 20;
        ctx.quadraticCurveTo(midX, midY, cx, cy);
        ctx.stroke();
        // Branch arcs
        ctx.globalAlpha = alpha * 0.5;
        ctx.strokeStyle = e.light;
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 4; i++) {
          const ba = Math.random() * Math.PI * 2;
          const bl = 5 + p * 10 + i * 2;
          const bx = cx + Math.cos(ba) * bl;
          const by = cy + Math.sin(ba) * bl;
          ctx.beginPath();
          ctx.moveTo(cx - 2, cy - 1);
          ctx.quadraticCurveTo((cx + bx) / 2 + (Math.random() - 0.5) * 6, (cy + by) / 2 + (Math.random() - 0.5) * 6, bx, by);
          ctx.stroke();
        }
        // Arcing sparks
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 6; i++) {
          const t = Math.random();
          const px = this.fromX + (cx - this.fromX) * t + (Math.random() - 0.5) * 8;
          const py = this.fromY + (cy - this.fromY) * t - 6 * Math.sin(t * Math.PI) + (Math.random() - 0.5) * 6;
          ctx.beginPath();
          ctx.arc(px, py, 1.5 + (1 - p) * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return true;
      }
      case 'lightning_pillar': {
        ctx.save();
        // Huge pillar from sky
        ctx.globalAlpha = alpha * 0.9;
        const pillarTop = cy - 20 - p * 30;
        // Pillar body
        const pillarGrad = ctx.createLinearGradient(0, pillarTop, 0, cy);
        pillarGrad.addColorStop(0, e.light + '40');
        pillarGrad.addColorStop(0.3, e.glow);
        pillarGrad.addColorStop(0.7, '#FFFFFF');
        pillarGrad.addColorStop(1, e.main);
        ctx.fillStyle = pillarGrad;
        const pw = 4 + p * 4;
        ctx.fillRect(cx - pw, pillarTop, pw * 2, cy - pillarTop);
        // Outer glow
        ctx.globalAlpha = alpha * 0.3;
        ctx.fillStyle = e.light;
        ctx.fillRect(cx - pw - 3, pillarTop, pw * 2 + 6, cy - pillarTop);
        // Ground explosion on impact
        ctx.globalAlpha = alpha * 0.8;
        const expGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 8 + p * 10);
        expGrad.addColorStop(0, '#FFFFFF');
        expGrad.addColorStop(0.5, e.glow);
        expGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = expGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 8 + p * 10, 0, Math.PI * 2);
        ctx.fill();
        // Rising particles
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = e.light;
        for (let i = 0; i < 8; i++) {
          const px = cx + (Math.random() - 0.5) * 10;
          const py = cy - Math.random() * (20 + p * 20) - 5;
          ctx.beginPath();
          ctx.arc(px, py, 1.5 + (1 - p) * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        // Horizontal arcs at top
        ctx.globalAlpha = alpha * 0.5;
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, pillarTop + 2, 6 + p * 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        return true;
      }
      case 'electric_storm': {
        ctx.save();
        // Massive storm overlay
        // Dark storm cloud at top
        ctx.globalAlpha = alpha * 0.4;
        ctx.fillStyle = '#1a1a3a';
        ctx.beginPath();
        ctx.ellipse(cx, cy - 20 - p * 15, 18 + p * 14, 6 + p * 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2a2a5a';
        ctx.beginPath();
        ctx.ellipse(cx - 8, cy - 22 - p * 12, 12 + p * 8, 5 + p * 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 10, cy - 18 - p * 10, 10 + p * 6, 4 + p * 2, 0, 0, Math.PI * 2);
        ctx.fill();
        // Multiple lightning bolts from cloud
        ctx.globalAlpha = alpha * 0.85;
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 2 + p;
        for (let i = 0; i < 5; i++) {
          const lx = cx + (i - 2) * 6;
          const ly = cy - 16 - p * 10 - i * 2;
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          const endX = cx + (i - 2) * 4 + (Math.random() - 0.5) * 6;
          const endY = cy + (Math.random() - 0.5) * 4;
          ctx.lineTo((lx + endX) / 2 + (Math.random() - 0.5) * 4, (ly + endY) / 2 + 4);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
        // Ground impact zone
        ctx.globalAlpha = alpha * 0.6;
        const stormGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14 + p * 14);
        stormGrad.addColorStop(0, '#FFFFFF40');
        stormGrad.addColorStop(0.5, e.glow + '30');
        stormGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = stormGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 14 + p * 14, 0, Math.PI * 2);
        ctx.fill();
        // Rain/sleet particles
        ctx.globalAlpha = alpha * 0.5;
        ctx.strokeStyle = e.light;
        ctx.lineWidth = 0.8;
        for (let i = 0; i < 10; i++) {
          const rx = cx + (Math.random() - 0.5) * 30;
          const ry = cy - 5 - Math.random() * (14 + p * 12);
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx + 1, ry + 6 + p * 3);
          ctx.stroke();
        }
        ctx.restore();
        return true;
      }
      case 'ice_rain': {
        ctx.save();
        // Falling ice shards
        ctx.globalAlpha = alpha * 0.85;
        for (let i = 0; i < 6; i++) {
          const x = cx + (i - 2.5) * 4;
          const y = cy + i * 2;
          ctx.strokeStyle = e.glow;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(x, y - 16 + p * 9.6);
          ctx.lineTo(x + 2, y + 3.2 + p * 4.8);
          ctx.lineTo(x - 2, y + 3.2 + p * 4.8);
          ctx.closePath();
          ctx.stroke();
          ctx.fillStyle = e.light;
          ctx.fill();
        }
        // Frost ring at impact
        ctx.globalAlpha = alpha * 0.5;
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 1.5 * (1 - p);
        ctx.beginPath();
        ctx.arc(cx, cy, 6.4 + p * 16, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        return true;
      }
      case 'whirlwind': {
        ctx.save();
        // Spiral wind
        ctx.globalAlpha = alpha * 0.75;
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 2;
        for (let i = 0; i < 10; i++) {
          const angle = (i / 10) * Math.PI * 3.2 + p * 6.4;
          const dist = 4.8 + p * 16 + i * 0.7;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist);
          ctx.stroke();
        }
        // Swirling wind particles
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = e.light;
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 3.2 + p * 8;
          const dist = 3.2 + p * 19.2 + i;
          const size = 1 + (1 - p) * 2;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return true;
      }
      case 'poison_web': {
        ctx.save();
        // Poison web strands
        ctx.globalAlpha = alpha * 0.8;
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 1.6;
        for (let i = 0; i < 6; i++) {
          const r = 3 + i * 3.2 + p * 8;
          ctx.beginPath();
          ctx.arc(cx, cy, r, (i / 6) * Math.PI * 2, ((i + 1) / 6) * Math.PI * 2);
          ctx.stroke();
        }
        // Toxic bubbles
        ctx.globalAlpha = alpha * 0.7;
        ctx.fillStyle = e.main;
        for (let i = 0; i < 5; i++) {
          const angle = Math.random() * Math.PI * 2;
          const d = 3.2 + p * 12.8 + i * 1.5;
          const bs = 1.2 + (1 - p) * 1.8;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(angle) * d, cy + Math.sin(angle) * d, bs, 0, Math.PI * 2);
          ctx.fill();
        }
        // Center core
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillStyle = e.glow;
        ctx.beginPath();
        ctx.arc(cx, cy, 3.2 + p * 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      }
      case 'dodge': {
        ctx.save();
        ctx.globalAlpha = alpha * 0.7;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.fromX + 2, this.fromY + 2);
        ctx.lineTo(cx + 3, cy - 2);
        ctx.moveTo(this.fromX - 2, this.fromY - 2);
        ctx.lineTo(cx - 3, cy + 2);
        ctx.stroke();
        ctx.restore();
        return true;
      }
      case 'shield':
      case 'defend': {
        ctx.save();
        // Outer protective bubble
        ctx.globalAlpha = alpha * 0.4;
        const shieldGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 12 + p * 9.6);
        shieldGrad.addColorStop(0, e.glow + '30');
        shieldGrad.addColorStop(0.6, e.main + '20');
        shieldGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = shieldGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 12 + p * 9.6, 0, Math.PI * 2);
        ctx.fill();
        // Shield ring
        ctx.globalAlpha = alpha * 0.8;
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 2 + p * 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 8 + p * 6.4, 0, Math.PI * 2);
        ctx.stroke();
        // Inner glowing ring
        ctx.globalAlpha = alpha * 0.5;
        ctx.strokeStyle = e.light;
        ctx.lineWidth = 1.2 * (1 - p);
        ctx.beginPath();
        ctx.arc(cx, cy, 5 + p * 4, 0, Math.PI * 2);
        ctx.stroke();
        // Shield emblem
        ctx.globalAlpha = alpha * 0.85;
        const shSize = 3 + p * 2;
        ctx.fillStyle = e.main;
        ctx.beginPath();
        ctx.moveTo(cx - shSize, cy - shSize * 0.4);
        ctx.lineTo(cx - shSize * 0.5, cy + shSize * 0.8);
        ctx.lineTo(cx + shSize * 0.5, cy + shSize * 0.8);
        ctx.lineTo(cx + shSize, cy - shSize * 0.4);
        ctx.lineTo(cx + shSize * 0.4, cy - shSize);
        ctx.lineTo(cx - shSize * 0.4, cy - shSize);
        ctx.closePath();
        ctx.fill();
        // Particles orbiting
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillStyle = e.light;
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + p * 3;
          const d = 10 + p * 5;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 1 + p, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return true;
      }
      case 'heal':
      case 'holy': {
        ctx.save();
        // Rising holy light
        ctx.globalAlpha = alpha * 0.7;
        const healGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14 + p * 8);
        healGrad.addColorStop(0, e.glow + '60');
        healGrad.addColorStop(0.5, e.main + '30');
        healGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = healGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 14 + p * 8, 0, Math.PI * 2);
        ctx.fill();
        // Cross with glow
        ctx.globalAlpha = alpha * 0.9;
        ctx.shadowColor = e.glow;
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(cx - 1.5, cy - 5, 3, 10);
        ctx.fillRect(cx - 5, cy - 1.5, 10, 3);
        ctx.shadowBlur = 0;
        // Rising particles
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = e.light || '#FFFFFF';
        for (let i = 0; i < 5; i++) {
          const xOff = (i - 2) * 3.5 + Math.sin(p * 8 + i) * 1.5;
          const yOff = -6 - p * 10 - i * 2;
          const size = 1.2 + (1 - p) * 1.5;
          ctx.beginPath();
          ctx.arc(cx + xOff, cy + yOff, size, 0, Math.PI * 2);
          ctx.fill();
        }
        // Ground ring
        ctx.globalAlpha = alpha * 0.4;
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 1.2 * (1 - p);
        ctx.beginPath();
        ctx.arc(cx, cy + 4, 5 + p * 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        return true;
      }
      case 'drain': {
        ctx.save();
        // Red/purple lifesteal tether
        ctx.globalAlpha = alpha * 0.8;
        ctx.strokeStyle = e.glow || '#cc4488';
        ctx.lineWidth = 2 + p * 1.5;
        ctx.beginPath();
        ctx.moveTo(this.fromX, this.fromY);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        // Secondary tether
        ctx.globalAlpha = alpha * 0.5;
        ctx.strokeStyle = '#ff66aa';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(this.fromX - 2, this.fromY + 2);
        ctx.quadraticCurveTo((this.fromX + cx) / 2 - 4, (this.fromY + cy) / 2, cx + 2, cy - 2);
        ctx.stroke();
        // Absorb orb at target
        ctx.globalAlpha = alpha * 0.9;
        const drainGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 6 + p * 5);
        drainGrad.addColorStop(0, '#ff6699');
        drainGrad.addColorStop(0.5, e.main || '#cc3366');
        drainGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = drainGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 6 + p * 5, 0, Math.PI * 2);
        ctx.fill();
        // Particles flying toward caster
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = '#ff88cc';
        for (let i = 0; i < 4; i++) {
          const t = p + i * 0.2;
          const px = this.fromX + (cx - this.fromX) * t + (Math.random() - 0.5) * 4;
          const py = this.fromY + (cy - this.fromY) * t + (Math.random() - 0.5) * 4;
          ctx.beginPath();
          ctx.arc(px, py, 1.2 + (1 - p) * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return true;
      }
      case 'boss_hit': {
        ctx.save();
        // Expanding shockwave ring
        ctx.globalAlpha = alpha * 0.7;
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 3 * (1 - p);
        ctx.beginPath();
        ctx.arc(cx, cy - 2, 6.4 + p * 25.6, 0, Math.PI * 2);
        ctx.stroke();
        // Inner bright flash
        ctx.globalAlpha = alpha * Math.max(0, 1 - p * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx, cy - 2, 6 * (1 - p), 0, Math.PI * 2);
        ctx.fill();
        // Element core
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillStyle = e.main;
        ctx.beginPath();
        ctx.arc(cx, cy - 2, 6.4 + p * 12.8, 0, Math.PI * 2);
        ctx.fill();
        // Ground crack lines radiating outward
        ctx.globalAlpha = alpha * 0.5;
        ctx.strokeStyle = e.dark;
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 3.2 + p * 0.8;
          const len = 9.6 + p * 22.4;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(angle) * 3, cy - 2 + Math.sin(angle) * 3);
          ctx.lineTo(cx + Math.cos(angle) * len, cy - 2 + Math.sin(angle) * len);
          ctx.stroke();
        }
        // Burst particles
        ctx.globalAlpha = alpha * 0.8;
        ctx.fillStyle = e.light;
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 3.2 + p * 4.8;
          const dist = 3.2 + p * 28.8 + i * 0.5;
          const size = 1.5 + (1 - p) * 2;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(angle) * dist, cy - 2 + Math.sin(angle) * dist, size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return true;
      }
      case 'monster_hit': {
        ctx.save();
        // Small burst
        ctx.globalAlpha = alpha * 0.8;
        ctx.fillStyle = e.glow;
        ctx.beginPath();
        ctx.arc(cx, cy - 2, 6.4 + p * 9.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = e.main;
        ctx.beginPath();
        ctx.arc(cx, cy - 2, 3.2 + p * 6.4, 0, Math.PI * 2);
        ctx.fill();
        // Particles
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = e.light;
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 3.2 + p * 3.2;
          const dist = 3.2 + p * 16;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(angle) * dist, cy - 2 + Math.sin(angle) * dist, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return true;
      }
      case 'void':
      case 'voidtear':
      case 'chaoswave': {
        ctx.save();
        // Void rift - expanding dark tear
        ctx.globalAlpha = alpha * 0.7;
        ctx.fillStyle = e.dark || '#1a0033';
        ctx.beginPath();
        ctx.arc(cx, cy, 9.6 + p * 16, 0, Math.PI * 2);
        ctx.fill();
        // Rift edge glow
        ctx.globalAlpha = alpha * 0.9;
        ctx.strokeStyle = e.glow || '#aa44ff';
        ctx.lineWidth = 2 + p * 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 8 + p * 14.4, 0, Math.PI  * 2);
        ctx.stroke();
        // Gravity tendrils
        ctx.globalAlpha = alpha * 0.6;
        ctx.strokeStyle = e.light || '#cc88ff';
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 3.2 + p * 1.3;
          const len = 4.8 + p * 19.2 + i;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          const cpDist = len * 0.6;
          const endAngle = angle + (Math.sin(p * 10 + i) * 0.5);
          ctx.quadraticCurveTo(
            cx + Math.cos(angle) * cpDist, cy + Math.sin(angle) * cpDist,
            cx + Math.cos(endAngle) * len, cy + Math.sin(endAngle) * len
          );
          ctx.stroke();
        }
        // Core flash
        ctx.globalAlpha = alpha * Math.max(0, 1 - p * 2.5);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx, cy, 3 * (1 - p), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      }
      case 'shadow_burst':
      case 'darkpulse':
      case 'nightmare':
      case 'blood_moon':
      case 'void_harvest':
      case 'darkfire': {
        ctx.save();
        // Dark explosion ring
        ctx.globalAlpha = alpha * 0.8;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 16 + p * 22.4);
        grad.addColorStop(0, e.glow || '#660066');
        grad.addColorStop(0.4, e.main || '#330033');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, 16 + p * 22.4, 0, Math.PI * 2);
        ctx.fill();
        // Shadow tendrils
        ctx.globalAlpha = alpha * 0.5;
        ctx.strokeStyle = e.dark || '#1a001a';
        ctx.lineWidth = 1.8;
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 3.2 + p * 3.2;
          const len = 6.4 + p * 25.6;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          const cx2 = cx + Math.cos(angle) * len * 0.5;
          const cy2 = cy + Math.sin(angle) * len * 0.5;
          ctx.quadraticCurveTo(cx2 + (Math.random() - 0.5) * 6, cy2 + (Math.random() - 0.5) * 6, cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
          ctx.stroke();
        }
        // Center bright
        ctx.globalAlpha = alpha * Math.max(0, 1 - p * 2.5);
        ctx.fillStyle = e.light || '#ff66ff';
        ctx.beginPath();
        ctx.arc(cx, cy, 4 * (1 - p), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      }
      case 'crystal_spike':
      case 'icenova':
      case 'frostbite':
      case 'diamond_dust':
      case 'glacier_spear':
      case 'frost_wreath':
      case 'frostnova': {
        ctx.save();
        // Crystal spikes erupting upward
        ctx.globalAlpha = alpha * 0.9;
        for (let i = 0; i < 5; i++) {
          const xOff = (i - 2) * 4;
          const spikeH = 9.6 + p * 16 + i * 0.5;
          ctx.fillStyle = i % 2 === 0 ? e.glow : e.light;
          ctx.beginPath();
          ctx.moveTo(cx + xOff - 2, cy);
          ctx.lineTo(cx + xOff, cy - spikeH);
          ctx.lineTo(cx + xOff + 2, cy);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
        // Frost burst ring
        ctx.globalAlpha = alpha * 0.4;
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 1.5 * (1 - p);
        ctx.beginPath();
        ctx.arc(cx, cy, 4.8 + p * 19.2, 0, Math.PI * 2);
        ctx.stroke();
        // Sparkle particles
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 4; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 3.2 + p * 12.8;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, 1 + (1 - p) * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return true;
      }
      case 'vine_barrage':
      case 'root_maelstrom':
      case 'thornwave':
      case 'natureswrath':
      case 'overgrowth':
      case 'gaiarage':
      case 'ancient_bloom':
      case 'jungle_devour': {
        ctx.save();
        // Expanding nature ring
        ctx.globalAlpha = alpha * 0.35;
        ctx.fillStyle = e.glow;
        ctx.beginPath();
        ctx.arc(cx, cy, 9.6 + p * 25.6, 0, Math.PI * 2);
        ctx.fill();
        // Vine tendrils lashing out
        const vineCount = 10;
        for (let i = 0; i < vineCount; i++) {
          const angle = (i / vineCount) * Math.PI * 3.2 + p * 1.3;
          const len = 8 + p * 28.8 + i * 0.6;
          const segs = 6;
          // Draw segmented vine for curved look
          for (let seg = 0; seg < segs; seg++) {
            const t0 = seg / segs;
            const t1 = (seg + 1) / segs;
            const x0 = cx + Math.cos(angle + Math.sin(p * 6 + i + t0 * 3) * 0.6) * len * t0;
            const y0 = cy + Math.sin(angle + Math.sin(p * 6 + i + t0 * 3) * 0.6) * len * t0;
            const x1 = cx + Math.cos(angle + Math.sin(p * 6 + i + t1 * 3) * 0.6) * len * t1;
            const y1 = cy + Math.sin(angle + Math.sin(p * 6 + i + t1 * 3) * 0.6) * len * t1;
            ctx.globalAlpha = alpha * (0.7 + 0.3 * (1 - t1));
            ctx.strokeStyle = seg % 2 === 0 ? e.main : e.light;
            ctx.lineWidth = (1.8 + p * 1.2) * (1 - t0 * 0.5);
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.stroke();
          }
          // Leaf tip
          const tipX = cx + Math.cos(angle + Math.sin(p * 6 + i + 3) * 0.6) * len;
          const tipY = cy + Math.sin(angle + Math.sin(p * 6 + i + 3) * 0.6) * len;
          ctx.globalAlpha = alpha * 0.9;
          ctx.fillStyle = e.light;
          ctx.beginPath();
          ctx.ellipse(tipX, tipY, 2.5, 1.2, angle, 0, Math.PI * 2);
          ctx.fill();
        }
        // Center bloom core
        ctx.globalAlpha = alpha * 0.95;
        ctx.fillStyle = e.glow;
        ctx.shadowColor = e.main;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(cx, cy, 4.8 + p * 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Inner bright flash
        ctx.globalAlpha = alpha * Math.max(0, 1 - p * 2.5);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx, cy, 3 * (1 - p), 0, Math.PI * 2);
        ctx.fill();
        // Floating spore particles
        ctx.globalAlpha = alpha * 0.6;
        for (let i = 0; i < 6; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 3.2 + p * 25.6 + i * 1.5;
          const size = 1 + (1 - p) * 2.5;
          ctx.fillStyle = i % 2 === 0 ? e.light : e.glow;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return true;
      }
      case 'tidal_rush':
      case 'sea_curse':
      case 'abyss_surge':
      case 'abyssal_bubble':
      case 'water':
      case 'rain': {
        ctx.save();
        // Water surge wave
        ctx.globalAlpha = alpha * 0.8;
        ctx.fillStyle = e.glow;
        ctx.beginPath();
        ctx.arc(cx, cy, 9.6 + p * 12.8, 0, Math.PI * 2);
        ctx.fill();
        // Wave rings
        ctx.globalAlpha = alpha * 0.5;
        ctx.strokeStyle = e.light;
        ctx.lineWidth = 1.8 * (1 - p);
        for (let i = 0; i < 3; i++) {
          const r = 6.4 + p * 19.2 + i * 3;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        // Water droplets
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 5; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 3.2 + p * 16 + i * 0.5;
          const dropSize = 1 + (1 - p) * 1.5;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, dropSize, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return true;
      }
      case 'dragon_palm': {
        ctx.save();
        const dx = cx - this.fromX;
        const dy = cy - this.fromY;
        const dist = Math.hypot(dx, dy) || 1;
        const angle = Math.atan2(dy, dx);
        // Dragon body segments (serpentine)
        const segments = 12;
        const bodyWidth = 4 + p * 2;
        for (let i = segments; i >= 0; i--) {
          const t = i / segments;
          const segX = this.fromX + dx * t;
          const segY = this.fromY + dy * t + Math.sin(t * Math.PI * 6.4 + p * 9.6) * 6;
          const segAlpha = alpha * (0.5 + t * 0.4);
          const segRadius = bodyWidth * (0.3 + t * 0.7);
          ctx.globalAlpha = segAlpha;
          ctx.fillStyle = i === segments ? e.light : (i % 2 === 0 ? e.main : e.glow);
          ctx.beginPath();
          ctx.arc(segX, segY, segRadius, 0, Math.PI * 2);
          ctx.fill();
          // Body connecting lines
          if (i < segments) {
            const prevT = (i + 1) / segments;
            const prevX = this.fromX + dx * prevT;
            const prevY = this.fromY + dy * prevT + Math.sin(prevT * Math.PI * 6.4 + p * 9.6) * 6;
            ctx.globalAlpha = segAlpha * 0.8;
            ctx.strokeStyle = e.glow;
            ctx.lineWidth = segRadius * 0.6;
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(segX, segY);
            ctx.stroke();
          }
        }
        // Dragon head (front)
        const headX = this.fromX + dx * 0.95;
        const headY = this.fromY + dy * 0.95 + Math.sin(0.95 * Math.PI * 6.4 + p * 9.6) * 6;
        ctx.globalAlpha = alpha;
        // Head glow
        ctx.fillStyle = e.light;
        ctx.shadowColor = e.glow;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(headX, headY, bodyWidth + 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Head core
        ctx.fillStyle = e.main;
        ctx.beginPath();
        ctx.arc(headX, headY, bodyWidth * 0.6, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#FFF';
        const eyeOffX = Math.cos(angle) * bodyWidth * 0.3;
        const eyeOffY = Math.sin(angle) * bodyWidth * 0.3;
        ctx.beginPath();
        ctx.arc(headX + eyeOffX - 2, headY + eyeOffY - 1.5, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(headX + eyeOffX - 2, headY + eyeOffY + 1.5, 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Horns
        ctx.strokeStyle = e.dark;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(headX - 2, headY - bodyWidth - 1);
        ctx.lineTo(headX - 4, headY - bodyWidth - 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(headX + 2, headY - bodyWidth - 1);
        ctx.lineTo(headX + 4, headY - bodyWidth - 6);
        ctx.stroke();
        // Impact burst at target
        ctx.globalAlpha = alpha * Math.max(0, 1 - p * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx, cy, 4 * (1 - p), 0, Math.PI * 2);
        ctx.fill();
        // Palm print flash
        ctx.globalAlpha = alpha * 0.4 * (1 - p);
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 4.8 + p * 16, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        return true;
      }
      // ===== FIRE VARIATIONS =====
      case 'ember_wave': {
        ctx.save();
        // Horizontal fire wave sweeping across
        const waveX = this.fromX + (this.toX - this.fromX) * p;
        const waveH = 6 + Math.sin(p * 6) * 4;
        ctx.globalAlpha = alpha * 0.85;
        // Wave body
        ctx.fillStyle = e.glow;
        ctx.beginPath();
        ctx.ellipse(waveX, cy, 6.4 + p * 16, waveH, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = e.main;
        ctx.beginPath();
        ctx.ellipse(waveX, cy, 3.2 + p * 9.6, waveH * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        // Flame crests on wave
        for (let i = -2; i <= 2; i++) {
          const crestX = waveX + i * 5;
          const crestH = waveH * (0.5 + Math.sin(p * 8 + i * 2) * 0.3);
          ctx.globalAlpha = alpha * (0.4 + 0.4 * (1 - Math.abs(i) / 3));
          ctx.fillStyle = e.light;
          ctx.beginPath();
          ctx.moveTo(crestX - 2, cy - crestH);
          ctx.lineTo(crestX, cy - crestH - 3);
          ctx.lineTo(crestX + 2, cy - crestH);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
        return true;
      }
      case 'molten_lance': {
        ctx.save();
        // Piercing magma spear
        const midX = this.fromX + (this.toX - this.fromX) * 0.5;
        const midY = this.fromY + (this.toY - this.fromY) * 0.5;
        ctx.globalAlpha = alpha * 0.9;
        // Spear shaft
        ctx.strokeStyle = e.main;
        ctx.lineWidth = 3 + p * 2;
        ctx.beginPath();
        ctx.moveTo(this.fromX, this.fromY);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        // Glow core
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.fromX, this.fromY);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        // Spear tip impact
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = e.glow;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(cx, cy, 4.8 + p * 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Magma drip particles behind
        ctx.globalAlpha = alpha * 0.5;
        for (let i = 0; i < 4; i++) {
          const t = 0.2 + i * 0.15;
          const px = this.fromX + (this.toX - this.fromX) * t + (Math.random() - 0.5) * 4;
          const py = this.fromY + (this.toY - this.fromY) * t + (Math.random() - 0.5) * 4;
          ctx.fillStyle = e.light;
          ctx.beginPath();
          ctx.arc(px, py, 1 + (1 - p) * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return true;
      }
      case 'triple_true_fire': {
        ctx.save();
        // Three flames converging
        for (let i = 0; i < 3; i++) {
          const angle = p * 4 + (i / 3) * Math.PI * 2;
          const swirlDist = 5 + (1 - p) * 12;
          const fx = cx + Math.cos(angle) * swirlDist;
          const fy = cy + Math.sin(angle) * swirlDist;
          ctx.globalAlpha = alpha * (0.5 + 0.4 * (1 - i * 0.2));
          const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, 9.6 + p * 9.6);
          grad.addColorStop(0, i === 1 ? '#FFFFFF' : e.light);
          grad.addColorStop(0.4, e.main);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(fx, fy, 9.6 + p * 9.6, 0, Math.PI * 2);
          ctx.fill();
        }
        // Center pillar
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = e.glow;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(cx, cy, 4.8 + p * 6.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
        return true;
      }
      // ===== ICE VARIATIONS =====
      case 'permafrost': {
        ctx.save();
        // Slow expanding frost zone
        const zoneR = 6.4 + p * 22.4;
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillStyle = e.main;
        ctx.beginPath();
        ctx.arc(cx, cy, zoneR, 0, Math.PI * 2);
        ctx.fill();
        // Frost rings
        ctx.globalAlpha = alpha * 0.4;
        ctx.strokeStyle = e.light;
        ctx.lineWidth = 1.5 * (1 - p);
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(cx, cy, zoneR * (0.3 + i * 0.25), 0, Math.PI * 2);
          ctx.stroke();
        }
        // Ice crystals forming at edge
        ctx.globalAlpha = alpha * 0.7;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 3.2 + p * 0.8;
          const cDist = zoneR * (1 + p * 0.5);
          const cSize = 2.4 + p * 4.8;
          ctx.fillStyle = i % 2 === 0 ? e.glow : e.light;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * cDist, cy + Math.sin(a) * cDist, cSize, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return true;
      }
      case 'absolute_zero': {
        ctx.save();
        // Dark implosion freeze
        const implodeR = 8 + (1 - p) * 12;
        ctx.globalAlpha = alpha * 0.7;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, implodeR);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.3, e.light);
        grad.addColorStop(0.7, e.main);
        grad.addColorStop(1, 'rgba(0,0,50,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, implodeR, 0, Math.PI * 2);
        ctx.fill();
        // Freeze rays
        ctx.globalAlpha = alpha * 0.5;
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 1.2 * (1 - p);
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a) * implodeR, cy + Math.sin(a) * implodeR);
          ctx.stroke();
        }
        ctx.restore();
        return true;
      }
      case 'diamond_dust': {
        ctx.save();
        // Sparkling shimmer
        ctx.globalAlpha = alpha * 0.85;
        for (let i = 0; i < 10; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 3.2 + p * 22.4 + i * 1.2;
          const sz = 1 + (1 - p) * 2.5;
          ctx.fillStyle = i % 3 === 0 ? '#FFFFFF' : e.light;
          ctx.shadowColor = e.glow;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          // Diamond shape
          const dx = cx + Math.cos(angle) * dist;
          const dy = cy + Math.sin(angle) * dist;
          ctx.moveTo(dx, dy - sz);
          ctx.lineTo(dx + sz * 0.7, dy);
          ctx.lineTo(dx, dy + sz);
          ctx.lineTo(dx - sz * 0.7, dy);
          ctx.closePath();
          ctx.fill();
        }
        ctx.shadowBlur = 0;
        // Center shimmer burst
        ctx.globalAlpha = alpha * Math.max(0, 1 - p * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx, cy, 4 * (1 - p), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      }
      // ===== EARTH VARIATIONS =====
      case 'earth_split': {
        ctx.save();
        // Ground tearing open - fast expanding linear crack
        ctx.globalAlpha = alpha * 0.8;
        ctx.strokeStyle = e.dark;
        ctx.lineWidth = 2 + p * 3;
        ctx.beginPath();
        ctx.moveTo(cx - 6 - p * 10, cy - 2);
        ctx.quadraticCurveTo(cx - 2, cy - 5 - p * 4, cx, cy);
        ctx.quadraticCurveTo(cx + 2, cy + 8 + p * 6.4, cx + 9.6 + p * 16, cy + 2);
        ctx.stroke();
        // Crack glow
        ctx.globalAlpha = alpha * 0.6;
        ctx.strokeStyle = e.main;
        ctx.lineWidth = 1.2 * (1 - p);
        ctx.beginPath();
        ctx.moveTo(cx - 4 - p * 8, cy - 1);
        ctx.quadraticCurveTo(cx - 1, cy - 3 - p * 3, cx, cy);
        ctx.quadraticCurveTo(cx + 1, cy + 4.8 + p * 4.8, cx + 6.4 + p * 12.8, cy + 1);
        ctx.stroke();
        // Debris particles
        ctx.globalAlpha = alpha * 0.5;
        for (let i = 0; i < 5; i++) {
          const a = Math.random() * Math.PI * 2;
          const d = 3.2 + p * 16;
          ctx.fillStyle = e.dark;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * d, cy - 2 + Math.sin(a) * d, 1.5 + Math.random() * 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return true;
      }
      case 'mountain_crush': {
        ctx.save();
        // Massive falling boulder impact
        const boulderY = this.fromY + (this.toY - this.fromY) * p;
        const boulderX = this.fromX + (this.toX - this.fromX) * p;
        const bSize = 9.6 + p * 12.8;
        ctx.globalAlpha = alpha * 0.85;
        // Boulder body
        ctx.fillStyle = e.main;
        ctx.shadowColor = e.dark;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(boulderX, boulderY, bSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Boulder facets
        ctx.globalAlpha = alpha * 0.5;
        ctx.strokeStyle = e.dark;
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(boulderX - bSize * 0.3, boulderY - bSize * 0.2);
          ctx.lineTo(boulderX + bSize * 0.4, boulderY + bSize * 0.3);
          ctx.stroke();
        }
        // Impact cloud
        ctx.globalAlpha = alpha * Math.max(0, 1 - p * 2);
        ctx.fillStyle = e.glow;
        ctx.beginPath();
        ctx.arc(boulderX, boulderY + bSize, 4 * (1 - p) + p * 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      }
      case 'petrify': {
        ctx.save();
        // Petrifying gaze beam
        ctx.globalAlpha = alpha * 0.8;
        ctx.strokeStyle = e.dark;
        ctx.lineWidth = 2 + p * 2;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(this.fromX, this.fromY);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        ctx.setLineDash([]);
        // Inner beam
        ctx.globalAlpha = alpha * 0.5;
        ctx.strokeStyle = e.main;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.fromX, this.fromY);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        // Stone effect at target
        ctx.globalAlpha = alpha * 0.7;
        ctx.fillStyle = e.main;
        ctx.beginPath();
        ctx.arc(cx, cy, 4.8 + p * 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = e.dark;
        ctx.beginPath();
        ctx.arc(cx - 1, cy - 1, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      }
      case 'chibaku_gravity': {
        ctx.save();
        // Gravity sphere pulling rocks
        const gravR = 8 + p * 22.4;
        // Dark gravity well
        ctx.globalAlpha = alpha * 0.8;
        const gravGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, gravR);
        gravGrad.addColorStop(0, '#FFFFFF');
        gravGrad.addColorStop(0.2, e.light || '#C4A950');
        gravGrad.addColorStop(0.6, e.main);
        gravGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gravGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, gravR, 0, Math.PI * 2);
        ctx.fill();
        // Orbiting rocks
        ctx.globalAlpha = alpha * 0.6;
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 3.2 + p * 4.8;
          const orbDist = 4.8 + p * 19.2 + i * 0.5;
          const rSize = 2.4 + p * 4.8;
          ctx.fillStyle = e.dark;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * orbDist, cy + Math.sin(a) * orbDist, rSize, 0, Math.PI * 2);
          ctx.fill();
        }
        // Gravity ring
        ctx.globalAlpha = alpha * 0.3;
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 1.5 * (1 - p);
        ctx.beginPath();
        ctx.arc(cx, cy, gravR * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        return true;
      }
      // ===== POISON VARIATIONS =====
      case 'plague_cloud': {
        ctx.save();
        // Spreading poison mist
        const mistR = 6.4 + p * 25.6;
        ctx.globalAlpha = alpha * 0.5;
        const mistGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, mistR);
        mistGrad.addColorStop(0, e.glow);
        mistGrad.addColorStop(0.5, e.main);
        mistGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = mistGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, mistR, 0, Math.PI * 2);
        ctx.fill();
        // Wispy tendrils
        ctx.globalAlpha = alpha * 0.4;
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 3.2 + p * 2.4;
          const tLen = 4.8 + p * 22.4 + i * 0.8;
          ctx.strokeStyle = e.light;
          ctx.lineWidth = 1 + (1 - p) * 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          const wav = Math.sin(p * 6 + i * 2) * 3;
          ctx.quadraticCurveTo(cx + Math.cos(a) * tLen * 0.5 + wav, cy + Math.sin(a) * tLen * 0.5 - wav, cx + Math.cos(a) * tLen, cy + Math.sin(a) * tLen);
          ctx.stroke();
        }
        ctx.restore();
        return true;
      }
      case 'blood_moon': {
        ctx.save();
        // Red moon projection
        const moonR = 8 + p * 16;
        ctx.globalAlpha = alpha * 0.8;
        const moonGrad = ctx.createRadialGradient(cx, cy - moonR * 0.3, 0, cx, cy, moonR);
        moonGrad.addColorStop(0, e.light || '#FF6666');
        moonGrad.addColorStop(0.6, e.main);
        moonGrad.addColorStop(1, 'rgba(80,0,0,0)');
        ctx.fillStyle = moonGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, moonR, 0, Math.PI * 2);
        ctx.fill();
        // Moon crescent detail
        ctx.globalAlpha = alpha * 0.4;
        ctx.fillStyle = e.dark || '#440000';
        ctx.beginPath();
        ctx.arc(cx + moonR * 0.2, cy - moonR * 0.15, moonR * 0.3, 0, Math.PI * 2);
        ctx.fill();
        // Red glow rays
        ctx.globalAlpha = alpha * 0.3;
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 3.2 + p * 0.8;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a) * moonR * 1.5, cy + Math.sin(a) * moonR * 1.5);
          ctx.stroke();
        }
        ctx.restore();
        return true;
      }
      case 'voidtear': {
        ctx.save();
        // Ripping tear in space
        ctx.globalAlpha = alpha * 0.85;
        for (let i = 0; i < 3; i++) {
          const t = p + i * 0.08;
          const tearX = this.fromX + (this.toX - this.fromX) * t;
          const tearY = this.fromY + (this.toY - this.fromY) * t + Math.sin(t * 8) * 4;
          ctx.fillStyle = i === 1 ? '#000' : e.dark;
          ctx.beginPath();
          ctx.ellipse(tearX, tearY, 3 + t * 5, 1.5 + t * 2, Math.sin(t * 4) * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        // Edge glow
        ctx.globalAlpha = alpha * 0.6;
        ctx.strokeStyle = e.light;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 4.8 + p * 12.8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        return true;
      }
      // ===== THUNDER VARIATIONS =====
      case 'chain_lightning': {
        ctx.save();
        // Arcing/branching lightning
        ctx.globalAlpha = alpha * 0.9;
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 2 + p * 1.5;
        for (let b = 0; b < 3; b++) {
          const startX = this.fromX + (Math.random() - 0.5) * 8;
          const startY = this.fromY + (Math.random() - 0.5) * 8;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          let segX = startX, segY = startY;
          for (let s = 0; s < 5; s++) {
            segX += (this.toX - startX) * 0.2 + (Math.random() - 0.5) * 10;
            segY += (this.toY - startY) * 0.2 + (Math.random() - 0.5) * 8;
            ctx.lineTo(segX, segY);
          }
          ctx.stroke();
          // Branch
          if (b < 2) {
            ctx.globalAlpha = alpha * 0.4;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(segX, segY);
            ctx.lineTo(segX + (Math.random() - 0.5) * 15, segY + (Math.random() - 0.5) * 15);
            ctx.stroke();
          }
        }
        ctx.restore();
        return true;
      }
      case 'divine_bolt': {
        ctx.save();
        // Massive vertical bolt from above
        const boltX = cx + (Math.random() - 0.5) * 6;
        ctx.globalAlpha = alpha * 0.95;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4 + p * 3;
        ctx.shadowColor = e.glow;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(boltX, this.fromY - 10);
        ctx.lineTo(boltX - 3, cy - 4);
        ctx.lineTo(boltX + 2, cy + 2);
        ctx.lineTo(boltX - 1, cy + 6);
        ctx.stroke();
        ctx.shadowBlur = 0;
        // Secondary glow bolt
        ctx.globalAlpha = alpha * 0.5;
        ctx.strokeStyle = e.light;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(boltX + 5, this.fromY - 5);
        ctx.lineTo(boltX + 2, cy - 2);
        ctx.lineTo(boltX + 6, cy + 3);
        ctx.stroke();
        // Ground impact ring
        ctx.globalAlpha = alpha * Math.max(0, 1 - p * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx, cy, 6 * (1 - p), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      }
      // ===== STORM VARIATIONS =====
      case 'hurricane': {
        ctx.save();
        // Massive multi-ring funnel
        const layers = 4;
        for (let l = 0; l < layers; l++) {
          const layerR = 4.8 + p * 22.4 - l * 2;
          ctx.globalAlpha = alpha * (0.5 - l * 0.1);
          ctx.strokeStyle = l % 2 === 0 ? e.glow : e.main;
          ctx.lineWidth = 1.5 + (1 - p) * 2 - l * 0.3;
          ctx.beginPath();
          ctx.arc(cx, cy, layerR, 0, Math.PI * 2);
          ctx.stroke();
          // Spiral arms
          ctx.globalAlpha = alpha * 0.3;
          for (let a = 0; a < 3; a++) {
            const armAngle = (a / 3) * Math.PI * 2 + p * (4 - l);
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(armAngle) * layerR * 0.5, cy + Math.sin(armAngle) * layerR * 0.5);
            ctx.lineTo(cx + Math.cos(armAngle) * layerR * 1.2, cy + Math.sin(armAngle) * layerR * 1.2);
            ctx.stroke();
          }
        }
        ctx.restore();
        return true;
      }
      case 'aurora_wave': {
        ctx.save();
        // Colorful aurora wave
        const waveCount = 3;
        for (let w = 0; w < waveCount; w++) {
          ctx.globalAlpha = alpha * (0.35 - w * 0.08);
          ctx.strokeStyle = w === 0 ? e.light : (w === 1 ? e.main : e.glow);
          ctx.lineWidth = 2.5 - w * 0.5;
          ctx.beginPath();
          for (let t = 0; t <= 10; t++) {
            const nt = t / 10;
            const wx = cx - 12 + nt * 24;
            const wy = cy + Math.sin(nt * Math.PI * 4.8 + p * 6.4 + w) * (8 + p * 9.6);
            if (t === 0) ctx.moveTo(wx, wy);
            else ctx.lineTo(wx, wy);
          }
          ctx.stroke();
        }
        ctx.restore();
        return true;
      }
      case 'sky_breaker': {
        ctx.save();
        // Sky shattering - jagged crack across sky
        ctx.globalAlpha = alpha * 0.8;
        ctx.strokeStyle = e.light;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(this.fromX, this.fromY - 5);
        for (let i = 0; i <= 8; i++) {
          const t = i / 8;
          const sx = this.fromX + (this.toX - this.fromX) * t;
          const sy = this.fromY + (this.toY - this.fromY) * t - 3 + Math.sin(t * 11.2 + p * 4.8) * 8;
          ctx.lineTo(sx, sy);
        }
        ctx.stroke();
        // Secondary crack
        ctx.globalAlpha = alpha * 0.4;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.fromX + 3, this.fromY);
        for (let i = 0; i <= 6; i++) {
          const t = i / 6;
          const sx = this.fromX + (this.toX - this.fromX) * t + 5;
          const sy = this.fromY + (this.toY - this.fromY) * t + 2 + Math.sin(t * 9.6 + p * 3.2) * 5;
          ctx.lineTo(sx, sy);
        }
        ctx.stroke();
        ctx.restore();
        return true;
      }
      // ===== WOOD VARIATIONS =====
      case 'natureswrath':
      case 'gaiarage':
      case 'forestwrath': {
        ctx.save();
        // Massive nature fury - thick roots + expanding ring
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillStyle = e.glow;
        ctx.beginPath();
        ctx.arc(cx, cy, 8 + p * 28.8, 0, Math.PI * 2);
        ctx.fill();
        // Thick root tendrils bursting out
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 3.2 + p * 0.8;
          const len = 4.8 + p * 25.6 + i * 0.5;
          ctx.globalAlpha = alpha * 0.75;
          ctx.strokeStyle = e.dark;
          ctx.lineWidth = 2.5 + p * 1.5;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.quadraticCurveTo(cx + Math.cos(a) * len * 0.4 + Math.sin(p * 5 + i) * 4, cy + Math.sin(a) * len * 0.4, cx + Math.cos(a) * len, cy + Math.sin(a) * len);
          ctx.stroke();
          // Thorns
          ctx.fillStyle = e.main;
          ctx.beginPath();
          const tx = cx + Math.cos(a) * len;
          const ty = cy + Math.sin(a) * len;
          ctx.moveTo(tx - 2, ty + 1);
          ctx.lineTo(tx, ty - 4);
          ctx.lineTo(tx + 2, ty + 1);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
        return true;
      }
      case 'overgrowth': {
        ctx.save();
        // Plants growing from ground upward
        for (let i = 0; i < 6; i++) {
          const baseX = cx + (i - 2.5) * 4;
          const growH = 3.2 + p * 19.2 + i * 0.4;
          ctx.globalAlpha = alpha * (0.6 + 0.3 * (1 - p));
          ctx.strokeStyle = e.main;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(baseX, cy + 4);
          ctx.quadraticCurveTo(baseX - Math.sin(p * 4 + i) * 3, cy - growH * 0.5, baseX + Math.sin(p * 3 + i) * 2, cy - growH);
          ctx.stroke();
          // Leaf
          ctx.fillStyle = e.light;
          ctx.beginPath();
          ctx.ellipse(baseX + Math.sin(p * 3 + i) * 2, cy - growH, 2, 1, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return true;
      }
      case 'ancient_bloom': {
        ctx.save();
        // Flower blooming
        const bloomR = 2 + p * 10;
        ctx.globalAlpha = alpha * 0.8;
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 3.2 + p * 0.5;
          ctx.fillStyle = i % 2 === 0 ? e.light : e.main;
          ctx.beginPath();
          ctx.ellipse(cx + Math.cos(a) * bloomR * 0.6, cy + Math.sin(a) * bloomR * 0.6, bloomR * 0.5, bloomR * 0.25, a, 0, Math.PI * 2);
          ctx.fill();
        }
        // Center
        ctx.fillStyle = e.glow;
        ctx.beginPath();
        ctx.arc(cx, cy, 3.2 + p * 4.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      }
      case 'jungle_devour': {
        ctx.save();
        // Devouring maw
        ctx.globalAlpha = alpha * 0.85;
        // Jaw
        ctx.fillStyle = e.dark;
        ctx.beginPath();
        const jawR = 4.8 + p * 14.4;
        ctx.arc(cx, cy, jawR, Math.PI * 0.2, Math.PI * 0.8);
        ctx.lineTo(cx - jawR, cy + jawR);
        ctx.closePath();
        ctx.fill();
        // Teeth
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 4; i++) {
          const tAngle = Math.PI * 0.25 + (i / 3) * Math.PI * 0.5;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(tAngle) * jawR * 0.9, cy + Math.sin(tAngle) * jawR * 0.9);
          ctx.lineTo(cx + Math.cos(tAngle) * jawR * 1.6, cy + Math.sin(tAngle) * jawR * 1.0);
          ctx.lineTo(cx + Math.cos(tAngle) * jawR * 0.7, cy + Math.sin(tAngle) * jawR * 1.2);
          ctx.closePath();
          ctx.fill();
        }
        // Inner glow
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = e.main;
        ctx.beginPath();
        ctx.arc(cx - jawR * 0.2, cy + jawR * 0.2, jawR * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      }
      // ===== WATER VARIATIONS =====
      case 'sea_curse': {
        ctx.save();
        // Dark water vortex
        ctx.globalAlpha = alpha * 0.7;
        for (let i = 0; i < 5; i++) {
          const vr = 3.2 + p * 19.2 - i * 1.5;
          const va = p * 3 + i * 0.5;
          ctx.strokeStyle = i % 2 === 0 ? e.main : e.dark;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(cx, cy, vr + Math.sin(va) * 2, vr * 0.4 + Math.cos(va) * 1.5, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
        return true;
      }
      case 'abyssal_bubble': {
        ctx.save();
        // Rising bubbles
        for (let i = 0; i < 6; i++) {
          const bX = cx + (i - 2.5) * 3 + Math.sin(p * 4 + i) * 2;
          const bY = cy + 6 - p * 12 + i * 1.5;
          const bR = 1.2 + (1 - p) * 2.5 - i * 0.15;
          ctx.globalAlpha = alpha * (0.5 + 0.3 * (1 - i / 6));
          ctx.strokeStyle = e.light;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(bX, bY, Math.max(0.5, bR), 0, Math.PI * 2);
          ctx.stroke();
          // Bubble highlight
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(bX - bR * 0.3, bY - bR * 0.3, bR * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return true;
      }
      // ===== FIRE BREATH / HELLFIRE / FLAME ORB =====
      case 'hellfire': {
        ctx.save();
        // Dark flame explosion
        ctx.globalAlpha = alpha * 0.8;
        const hfGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12.8 + p * 19.2);
        hfGrad.addColorStop(0, '#FFFFFF');
        hfGrad.addColorStop(0.2, e.light || '#FF6644');
        hfGrad.addColorStop(0.5, e.main);
        hfGrad.addColorStop(0.8, e.dark || '#880000');
        hfGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = hfGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 12.8 + p * 19.2, 0, Math.PI * 2);
        ctx.fill();
        // Ember rings
        ctx.globalAlpha = alpha * 0.3;
        ctx.strokeStyle = e.dark;
        ctx.lineWidth = 1.5 * (1 - p);
        ctx.beginPath();
        ctx.arc(cx, cy, 8 + p * 16, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        return true;
      }
      case 'flame_orb':
      case 'solar_fall': {
        ctx.save();
        // Rotating fire orb
        const orbR = 6.4 + p * 9.6;
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillStyle = e.glow;
        ctx.shadowColor = e.main;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(cx, cy, orbR, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Spiral trail
        for (let i = 0; i < 4; i++) {
          const ang = (i / 4) * Math.PI * 3.2 + p * 8;
          const spDist = orbR * 0.6 + p * 9.6;
          ctx.fillStyle = e.light;
          ctx.globalAlpha = alpha * (0.5 - i * 0.1);
          ctx.beginPath();
          ctx.arc(cx + Math.cos(ang) * spDist, cy + Math.sin(ang) * spDist, 1.5 + (1 - p) * 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return true;
      }
      case 'hellfire_rain': {
        ctx.save();
        // Rain of fire from above
        for (let i = 0; i < 8; i++) {
          const fx = cx + (i - 3.5) * 3 + Math.sin(p * 5 + i) * 2;
          const fy = cy - 19.2 + p * 22.4 + i * 1.2;
          ctx.globalAlpha = alpha * (0.7 - i * 0.07);
          ctx.fillStyle = i % 2 === 0 ? e.main : e.light;
          ctx.beginPath();
          ctx.arc(fx, fy, 2.4 + p * 3.2, 0, Math.PI * 2);
          ctx.fill();
          // Trail
          ctx.globalAlpha = alpha * 0.3;
          ctx.fillStyle = e.glow;
          ctx.beginPath();
          ctx.arc(fx, fy + 3, 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        return true;
      }
      default:
        return false;
    }
  }

  update(dt) {
    this.life -= dt;
    this.progress = 1 - this.life / this.maxLife;
    if (this.progress < 0.6) {
      this.trail.push({ x: this.currentX || this.fromX, y: this.currentY || this.fromY, life: 0.3 });
    }
    this.trail = this.trail.filter(t => { t.life -= dt; return t.life > 0; });
    return this.life > 0;
  }

  draw(ctx) {
    const p = this.progress;
    const alpha = Math.max(0, 1 - p / 0.7);
    const e = ELEMENT_COLORS[this.type] || ELEMENT_COLORS.fire;
    const cx = this.fromX + (this.toX - this.fromX) * p;
    const cy = this.fromY + (this.toY - this.fromY) * p;
    this.currentX = cx;
    this.currentY = cy;
    const S = this.S;

    // Scale all effect rendering about the effect center for sharper, more visible visuals
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(S, S);
    ctx.translate(-cx, -cy);

    const handled = this.drawSpecialEffect(ctx, p, alpha, e, cx, cy);
    if (handled) {
      ctx.restore();
      return;
    }

    switch (this.type) {
      // === FIRE: Fireball with flame trail, sparks, explosion ===
      case 'fire': {
        const fy = cy - 7 * Math.sin(p * Math.PI);
        ctx.save();
        // Trail
        for (let i = 0; i < this.trail.length; i++) {
          const t = this.trail[i];
          const ta = t.life / 0.3;
          ctx.globalAlpha = ta * 0.4;
          ctx.fillStyle = e.dark;
          const tr = 2 + ta * 4;
          ctx.beginPath();
          ctx.arc(t.x, t.y, tr, 0, Math.PI * 2);
          ctx.fill();
        }
        // Glow
        ctx.globalAlpha = alpha * 0.3;
        ctx.shadowColor = e.glow;
        ctx.shadowBlur = 12;
        ctx.fillStyle = e.glow;
        ctx.beginPath();
        ctx.arc(cx, fy, 12.8 + p * 6.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Fire core
        ctx.globalAlpha = alpha;
        const r = 4.8 + p * 11.2;
        ctx.fillStyle = e.main;
        ctx.beginPath();
        ctx.arc(cx, fy, r, 0, Math.PI * 2);
        ctx.fill();
        // Inner bright core
        ctx.fillStyle = e.glow;
        ctx.beginPath();
        ctx.arc(cx - r * 0.15, fy - r * 0.25, r * 0.45, 0, Math.PI * 2);
        ctx.fill();
        // Flame tongues
        ctx.fillStyle = e.light;
        for (let i = 0; i < 4; i++) {
          const a = p * 5 + i * 1.57 + this.seed;
          const fr = r * (0.6 + Math.sin(p * 8 + i + this.seed) * 0.3);
          ctx.fillRect(cx + Math.cos(a) * r * 0.7 - 1, fy + Math.sin(a) * r * 0.7 - fr * 0.5, 2, fr);
        }
        // Sparks
        ctx.globalAlpha = alpha * (0.8 - p * 0.5);
        ctx.fillStyle = '#FFEECC';
        for (let i = 0; i < 5; i++) {
          const a = p * 6 + i * 1.26 + this.seed;
          const dist = r * 1.3 + p * 16 + Math.sin(p * 5 + i) * 3;
          const sx = cx + Math.cos(a) * dist;
          const sy = fy + Math.sin(a) * dist;
          ctx.fillRect(sx - 0.5, sy - 0.5, 2, 2);
        }
        // Smoke puffs at end
        if (p > 0.5) {
          ctx.globalAlpha = (p - 0.5) * 0.3;
          ctx.fillStyle = '#444';
          for (let i = 0; i < 3; i++) {
            const a = this.seed + i * 2.1;
            const dist = (p - 0.5) * 12 + i * 3;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(a) * dist, fy - 3 + Math.sin(a) * dist, 3.2 + p * 4.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
        break;
      }
      // === WATER: Fluid stream with splash rings ===
      case 'water': {
        ctx.save();
        // Trail drops
        for (const t of this.trail) {
          const ta = t.life / 0.3;
          ctx.globalAlpha = ta * 0.3;
          ctx.fillStyle = e.light;
          ctx.beginPath();
          ctx.arc(t.x, t.y, 1.5 + ta * 2, 0, Math.PI * 2);
          ctx.fill();
        }
        // Water orb
        ctx.globalAlpha = alpha * 0.8;
        ctx.fillStyle = e.main;
        ctx.beginPath();
        ctx.arc(cx, cy, 4.8 + p * 6.4, 0, Math.PI * 2);
        ctx.fill();
        // Inner shine
        ctx.fillStyle = e.glow;
        ctx.globalAlpha = alpha * 0.4;
        ctx.beginPath();
        ctx.arc(cx - 1.5, cy - 2, 3.2 + p * 3.2, 0, Math.PI * 2);
        ctx.fill();
        // Expanding rings
        ctx.globalAlpha = alpha * 0.5;
        for (let i = 0; i < 3; i++) {
          const ringR = 6.4 + p * 16 + i * 4;
          ctx.strokeStyle = e.light;
          ctx.lineWidth = 1.5 - p * 0.5;
          ctx.beginPath();
          ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
          ctx.stroke();
        }
        // Splash particles at end
        if (p > 0.6) {
          ctx.globalAlpha = (p - 0.5) * 0.7;
          ctx.fillStyle = e.main;
          for (let i = 0; i < 6; i++) {
            const a = p * 4 + i * 1.05 + this.seed;
            const d = (p - 0.5) * 15;
            ctx.fillRect(cx + Math.cos(a) * d - 1, cy - 3 + Math.sin(a) * d - 1, 2, 3);
          }
        }
        ctx.restore();
        break;
      }
      // === EARTH: Rock with dust debris ===
      case 'earth': {
        const ex = this.toX;
        const ey = this.toY;
        ctx.save();
        // Flying rock
        ctx.globalAlpha = alpha;
        ctx.fillStyle = e.dark;
        ctx.beginPath();
        ctx.moveTo(cx - 3 - p * 2, cy + 3.2 + p * 4.8);
        ctx.lineTo(cx - 1 - p, cy - 3 - p * 4);
        ctx.lineTo(cx + 4.8 + p * 3.2, cy - 1 + p);
        ctx.lineTo(cx + 1 + p, cy + 4.8 + p * 3.2);
        ctx.fill();
        ctx.fillStyle = e.main;
        ctx.beginPath();
        ctx.moveTo(cx - 2 - p, cy + 1.6 + p * 3.2);
        ctx.lineTo(cx, cy - 2 - p * 3);
        ctx.lineTo(cx + 2 + p, cy);
        ctx.lineTo(cx + p, cy + 2 + p);
        ctx.fill();
        // Dust trail
        ctx.globalAlpha = alpha * 0.3;
        ctx.fillStyle = e.light;
        for (let i = 0; i < 4; i++) {
          const a = this.seed + i * 1.57;
          const d = 4.8 + p * 12.8 + Math.sin(p * 4 + i) * 3;
          ctx.fillRect(cx + Math.cos(a) * d - 1.5, cy + Math.sin(a) * d - 1.5, 3, 3);
        }
        // Impact debris
        if (p > 0.7) {
          ctx.globalAlpha = (p - 0.7) * 0.8;
          for (let i = 0; i < 8; i++) {
            const a = p * 6 + i * 0.785 + this.seed;
            const d = (p - 0.7) * 12 + 2;
            ctx.fillStyle = i % 2 === 0 ? e.main : e.light;
            const sz = 1.5 + Math.sin(p * 10 + i) * 1;
            ctx.fillRect(ex + Math.cos(a) * d - sz / 2, ey + Math.sin(a) * d - sz / 2, sz, sz);
          }
        }
        ctx.restore();
        break;
      }
      // === THUNDER: Lightning bolt with arcs and flash ===
      case 'thunder': {
        const tx = this.toX;
        const ty = this.toY;
        ctx.save();
        // Main bolt (flash removed — handled by global edge lightning)
        ctx.globalAlpha = alpha;
        ctx.shadowColor = e.glow;
        ctx.shadowBlur = 8;
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 3;
        ctx.beginPath();
        let bx = tx, by = ty - 14 - p * 8;
        ctx.moveTo(bx, by);
        for (let i = 0; i < 6; i++) {
          bx += (Math.random() - 0.5) * 8 + (tx - bx) * 0.15;
          by += 4 + Math.random() * 2;
          ctx.lineTo(bx, by);
        }
        ctx.stroke();
        // Core white line
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        bx = tx; by = ty - 14 - p * 8;
        ctx.moveTo(bx, by);
        for (let i = 0; i < 6; i++) {
          bx += (Math.random() - 0.5) * 8 + (tx - bx) * 0.15;
          by += 4 + Math.random() * 2;
          ctx.lineTo(bx, by);
        }
        ctx.stroke();
        // Branch bolts
        ctx.globalAlpha = alpha * 0.5;
        ctx.strokeStyle = e.main;
        ctx.lineWidth = 1.5;
        for (let b = 0; b < 3; b++) {
          ctx.beginPath();
          let bx2 = tx + (Math.random() - 0.5) * 10;
          let by2 = ty - 10 - p * 6 - Math.random() * 8;
          ctx.moveTo(bx2, by2);
          for (let i = 0; i < 3; i++) {
            bx2 += (Math.random() - 0.5) * 6;
            by2 += 3 + Math.random() * 3;
            ctx.lineTo(bx2, by2);
          }
          ctx.stroke();
        }
        // Impact glow
        ctx.shadowBlur = 0;
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillStyle = e.glow;
        ctx.beginPath();
        ctx.arc(tx, ty, 6.4 + p * 9.6, 0, Math.PI * 2);
        ctx.fill();
        // Sparks
        ctx.globalAlpha = alpha * (0.7 - p * 0.4);
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 6; i++) {
          const a = p * 5 + i * 1.05 + this.seed;
          const d = 4.8 + p * 16 + Math.sin(p * 4 + i) * 3;
          ctx.fillRect(tx + Math.cos(a) * d - 1, ty + Math.sin(a) * d - 1, 2, 2);
        }
        ctx.restore();
        break;
      }
      // === ICE: Crystal shard with frost spread ===
      case 'ice': {
        ctx.save();
        // Frost trail
        for (const t of this.trail) {
          const ta = t.life / 0.3;
          ctx.globalAlpha = ta * 0.2;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(t.x, t.y, 1 + ta * 2, 0, Math.PI * 2);
          ctx.fill();
        }
        // Crystal body
        ctx.globalAlpha = alpha;
        ctx.shadowColor = e.glow;
        ctx.shadowBlur = 6;
        ctx.fillStyle = e.main;
        ctx.beginPath();
        ctx.moveTo(cx - 4 * (1 + p), cy + 3);
        ctx.lineTo(cx, cy - 8 - p * 5);
        ctx.lineTo(cx + 4 * (1 + p), cy + 3);
        ctx.lineTo(cx, cy + 5 * (1.6 + p * 0.8));
        ctx.fill();
        ctx.shadowBlur = 0;
        // Inner facet
        ctx.fillStyle = e.light;
        ctx.beginPath();
        ctx.moveTo(cx - 2 * (1 + p), cy + 2);
        ctx.lineTo(cx, cy - 4 - p * 3);
        ctx.lineTo(cx + 2 * (1 + p), cy + 2);
        ctx.fill();
        // Frost spread
        ctx.globalAlpha = alpha * 0.4;
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 6; i++) {
          const a = p * 3 + i * 1.05 + this.seed;
          const d = 3.2 + p * 16;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a) * d, cy + Math.sin(a) * d);
          ctx.stroke();
        }
        // Ice particles
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = e.glow;
        for (let i = 0; i < 8; i++) {
          const a = p * 5 + i * 0.785 + this.seed;
          const r = 3.2 + p * 12.8 + Math.sin(p * 3 + i) * 3;
          const ix = cx + Math.cos(a) * r;
          const iy = cy + Math.sin(a) * r;
          ctx.fillRect(ix - 1, iy - 1, 2, 2);
        }
        ctx.restore();
        break;
      }
      // === WOOD: Growing vine with leaf burst ===
      case 'wood': {
        const vy = cy - 4 * Math.sin(p * Math.PI);
        ctx.save();
        // Vine stem
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = e.dark;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const cp1x = cx - 7 * p;
        const cp1y = vy + 5 * p;
        const cp2x = cx + 5 * p;
        const cp2y = vy - 6 * p;
        ctx.moveTo(cx - 8 * p, vy + 5 * p);
        ctx.quadraticCurveTo(cx, vy - 8 * p, cx + 8 * p, vy + 4 * p);
        ctx.stroke();
        // Inner vine
        ctx.strokeStyle = e.main;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - 5 * p, vy + 3 * p);
        ctx.quadraticCurveTo(cx, vy - 5 * p, cx + 5 * p, vy + 3 * p);
        ctx.stroke();
        // Leaves
        ctx.fillStyle = e.glow;
        for (let i = 0; i < 5; i++) {
          const lx = cx + Math.cos(p * 4 + i * 1.26) * (4.8 + p * 11.2);
          const ly = vy + Math.sin(p * 4 + i * 1.26) * (3.2 + p * 8) - 2;
          ctx.globalAlpha = alpha * (0.8 - i * 0.1);
          ctx.beginPath();
          ctx.ellipse(lx, ly, 3, 1.5, p * 2 + i, 0, Math.PI * 2);
          ctx.fill();
        }
        // Bloom burst
        if (p > 0.6) {
          ctx.globalAlpha = (p - 0.6) * 0.8;
          ctx.fillStyle = '#FFEECC';
          for (let i = 0; i < 8; i++) {
            const a = p * 4 + i * 0.785 + this.seed;
            const d = (p - 0.6) * 12;
            const sz = 1.5 + Math.sin(p * 8 + i) * 1;
            ctx.fillRect(cx + Math.cos(a) * d - sz / 2, vy + Math.sin(a) * d - sz / 2, sz, sz);
          }
        }
        ctx.restore();
        break;
      }
      // === POISON: Toxic gas with bubbles ===
      case 'poison': {
        const py = cy - 5 * Math.sin(p * Math.PI * 2);
        ctx.save();
        // Gas cloud
        for (let i = 0; i < 5; i++) {
          const gx = cx + Math.cos(p * 2 + i * 1.26 + this.seed) * (4.8 + p * 11.2);
          const gy = py + Math.sin(p * 2 + i * 1.26 + this.seed) * (3.2 + p * 8);
          const gr = 6.4 + p * 8 - i * 1.5;
          ctx.globalAlpha = alpha * (0.3 - i * 0.04);
          ctx.fillStyle = e.main;
          ctx.beginPath();
          ctx.arc(gx, gy, gr, 0, Math.PI * 2);
          ctx.fill();
        }
        // Inner glow
        ctx.globalAlpha = alpha * 0.2;
        ctx.shadowColor = e.glow;
        ctx.shadowBlur = 10;
        ctx.fillStyle = e.glow;
        ctx.beginPath();
        ctx.arc(cx, py, 6.4 + p * 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Bubbles
        ctx.globalAlpha = alpha * 0.6;
        for (let i = 0; i < 4; i++) {
          const a = p * 3 + i * 1.57 + this.seed;
          const d = 4.8 + p * 9.6 + Math.sin(p * 4 + i) * 2;
          ctx.fillStyle = e.light;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * d, py + Math.sin(a) * d - 2, 1.5 + Math.sin(p * 5 + i) * 1, 0, Math.PI * 2);
          ctx.fill();
        }
        // Toxic drip
        if (p > 0.5) {
          ctx.globalAlpha = (p - 0.5) * 0.4;
          ctx.fillStyle = e.dark;
          for (let i = 0; i < 3; i++) {
            const dx = cx + (Math.random() - 0.5) * 8;
            const dy = py + (p - 0.5) * 10 + i * 3;
            ctx.fillRect(dx - 1, dy - 1, 2, 3 + Math.random() * 2);
          }
        }
        ctx.restore();
        break;
      }
      // === STORM: Tornado vortex with wind ===
      case 'storm': {
        ctx.save();
        const scy = cy - 4 * Math.sin(p * Math.PI);
        // Outer wind rings
        ctx.globalAlpha = alpha * 0.3;
        for (let i = 0; i < 3; i++) {
          const ringR = 4.8 + p * 16 + i * 4;
          ctx.strokeStyle = e.light;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx, scy, ringR, p * 3 + i * 2, p * 3 + i * 2 + 2.5);
          ctx.stroke();
        }
        // Spiral body
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillStyle = e.main;
        for (let i = 0; i < 8; i++) {
          const a = p * 5 + i * 0.785 + this.seed;
          const dist = 1.6 + p * 12.8 + Math.sin(p * 3 + i) * 3;
          const sz = 3.2 + p * 4.8 - i * 0.2;
          ctx.fillRect(cx + Math.cos(a) * dist - sz / 2, scy + Math.sin(a) * dist - sz / 2, sz, sz);
        }
        // Wind streaks
        ctx.globalAlpha = alpha * 0.4;
        ctx.strokeStyle = e.glow;
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
          const a = p * 2 + i * 1.57 + this.seed;
          const d = 3.2 + p * 12.8;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * d, scy + Math.sin(a) * d);
          ctx.lineTo(cx + Math.cos(a + 0.3) * (d + 4), scy + Math.sin(a + 0.3) * (d + 4));
          ctx.stroke();
        }
        ctx.restore();
        break;
      }
      // --- FALLBACK: generic hit ---
      default: {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = e?.main || '#FF8844';
        const sz = 4.8 + p * 11.2;
        ctx.fillRect(this.toX - sz / 2, this.toY - sz / 2 - 4, sz, sz);
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.toX - sz / 2, this.toY - sz / 2 - 4, sz, sz);
        ctx.restore();
        break;
      }
    }
    ctx.restore();
  }
}

class MapUltimateEffect extends MapEffect {
  constructor(type, fromX, fromY, toX, toY, visualType, canvasW, canvasH, sharpness = 1.5) {
    super(type, fromX, fromY, toX, toY, visualType, canvasW, canvasH, sharpness);
    this.life = 0.8;
    this.maxLife = 0.8;
    this.ringPhase = 0;
  }

  draw(ctx) {
    const p = this.progress;
    const alpha = Math.max(0, 1 - p / 0.8);
    const e = ELEMENT_COLORS[this.type] || ELEMENT_COLORS.fire;
    const tx = this.toX;
    const ty = this.toY;
    const S = this.S;

    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(S, S);
    ctx.translate(-tx, -ty);

    // Expanding ground ring (multiple)
    for (let r = 0; r < 3; r++) {
      const ringP = Math.max(0, p - r * 0.15);
      if (ringP <= 0) continue;
      ctx.save();
      ctx.globalAlpha = alpha * 0.25 * (1 - r * 0.2);
      ctx.strokeStyle = e.main;
      ctx.lineWidth = 2 - r * 0.3;
      const ringR = 4 + ringP * 24;
      ctx.beginPath();
      ctx.arc(tx, ty - 2, ringR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Ground glow
    ctx.save();
    ctx.globalAlpha = alpha * 0.15;
    const groundGrad = ctx.createRadialGradient(tx, ty - 2, 1, tx, ty - 2, 6.4 + p * 35.2);
    groundGrad.addColorStop(0, e.glow);
    groundGrad.addColorStop(0.5, e.main);
    groundGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = groundGrad;
    ctx.beginPath();
    ctx.arc(tx, ty - 2, 6.4 + p * 35.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Rising particles (orbital)
    ctx.save();
    ctx.globalAlpha = alpha;
    for (let i = 0; i < 12; i++) {
      const angle = p * 5 + i * 0.524 + i * 0.1;
      const dist = 3.2 + p * 25.6 + Math.sin(p * 3 + i * 2) * 3;
      const px = tx + Math.cos(angle) * dist;
      const py = ty - 4 + Math.sin(angle) * dist - p * 14;
      ctx.fillStyle = i % 3 === 0 ? e.glow : (i % 3 === 1 ? e.light : e.main);
      const sz = 2 + Math.sin(p * 8 + i * 3) * 2.4 + p * 3.2;
      ctx.shadowColor = e.glow;
      ctx.shadowBlur = sz > 3 ? 8 : 0;
      ctx.fillRect(px - sz / 2, py - sz / 2, sz, sz);
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    // Central burst
    ctx.save();
    ctx.globalAlpha = alpha * 0.8;
    const grad = ctx.createRadialGradient(tx, ty - 4, 0, tx, ty - 4, 4.8 + p * 22.4);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.3, e.glow);
    grad.addColorStop(0.7, e.main);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.shadowColor = e.glow;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(tx, ty - 4, 4.8 + p * 22.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    // Star flash (4-pointed)
    ctx.save();
    ctx.globalAlpha = alpha * 0.9 * (1 - p);
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 4; i++) {
      const a = p * 10 + i * 1.57;
      const d = 3.2 + p * 25.6;
      const sx = tx + Math.cos(a) * d;
      const sy = ty - 4 + Math.sin(a) * d;
      const sw = 3.2 + p * 4.8;
      const sh = 1.6 + p * 3.2;
      ctx.fillRect(sx - sw / 2, sy - sh / 2, sw, sh);
    }
    // Cross flash
    for (let i = 0; i < 4; i++) {
      const a = p * 10 + i * 1.57 + 0.785;
      const d = 3.2 + p * 16;
      const sx = tx + Math.cos(a) * d;
      const sy = ty - 4 + Math.sin(a) * d;
      ctx.fillRect(sx - 1, sy - 2, 2, 4);
    }
    ctx.restore();
    ctx.restore();
  }
}

class MapDamageText {
  constructor(x, y, value, color) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.color = color;
    this.life = 0.85;
    this.maxLife = 0.85;
    this.vy = -60;
  }
  update(dt) {
    this.y += this.vy * dt;
    this.vy += 45 * dt;
    this.life -= dt;
    return this.life > 0;
  }
  draw(ctx) {
    const a = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = this.color;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText(this.value, this.x, this.y);
    ctx.fillText(this.value, this.x, this.y);
    ctx.restore();
  }
}
