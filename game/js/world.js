const MAP_TIERS = [
  { id: 1, name: 'Đồng cỏ xanh', minLvl: 1, maxLvl: 10, theme: 'grass', icon: '🌾',
    monsters: { normal: { count: [1,2], lvlRange: [1,4], statMul: 0.7, hpMul: 5 }, boss: { count: [0,1], lvlRange: [4,6], statMul: 0.6, hpMul: 5 } } },
  { id: 2, name: 'Rừng rậm', minLvl: 10, maxLvl: 20, theme: 'forest', icon: '🌲',
    monsters: { normal: { count: [2,3], lvlRange: [10,16], statMul: 0.9, hpMul: 5 }, boss: { count: [0,1], lvlRange: [16,19], statMul: 0.85, hpMul: 5 } } },
  { id: 3, name: 'Núi băng', minLvl: 20, maxLvl: 30, theme: 'ice', icon: '❄️',
    monsters: { normal: { count: [2,4], lvlRange: [20,26], statMul: 1.0, hpMul: 12.5 }, boss: { count: [0,1], lvlRange: [26,29], statMul: 1.0, hpMul: 15 } } },
  { id: 4, name: 'Đầm lầy tử thần', minLvl: 30, maxLvl: 40, theme: 'swamp', icon: '☠️',
    monsters: { normal: { count: [3,4], lvlRange: [30,36], statMul: 1.1, hpMul: 15 }, boss: { count: [1,2], lvlRange: [36,39], statMul: 1.1, hpMul: 17.5 } } },
  { id: 5, name: 'Thung lũng quỷ', minLvl: 40, maxLvl: 50, theme: 'volcanic', icon: '🌋',
    monsters: { normal: { count: [3,5], lvlRange: [40,46], statMul: 1.2, hpMul: 17.5 }, boss: { count: [1,2], lvlRange: [46,49], statMul: 1.2, hpMul: 20 } } },
  { id: 6, name: 'Hoang mạc lửa', minLvl: 50, maxLvl: 60, theme: 'desert', icon: '🏜️',
    monsters: { normal: { count: [4,5], lvlRange: [50,55], statMul: 1.3, hpMul: 20 }, boss: { count: [1,2], lvlRange: [55,58], statMul: 1.3, hpMul: 22.5 } } },
  { id: 7, name: 'Rừng tối thẳm', minLvl: 60, maxLvl: 70, theme: 'darkforest', icon: '🌑',
    monsters: { normal: { count: [4,6], lvlRange: [60,65], statMul: 1.4, hpMul: 25 }, boss: { count: [1,2], lvlRange: [65,68], statMul: 1.4, hpMul: 27.5 } } },
  { id: 8, name: 'Lãnh địa băng', minLvl: 70, maxLvl: 80, theme: 'icecave', icon: '🧊',
    monsters: { normal: { count: [5,6], lvlRange: [70,75], statMul: 1.5, hpMul: 30 }, boss: { count: [2,3], lvlRange: [75,78], statMul: 1.5, hpMul: 32.5 } } },
  { id: 9, name: 'Rừng cổ thụ', minLvl: 80, maxLvl: 90, theme: 'ancient', icon: '🏛️',
    monsters: { normal: { count: [5,6], lvlRange: [80,85], statMul: 1.7, hpMul: 35 }, boss: { count: [2,3], lvlRange: [85,88], statMul: 1.7, hpMul: 40 } } },
  { id: 10, name: 'Thiên đàng', minLvl: 90, maxLvl: 100, theme: 'heavenly', icon: '✨',
    monsters: { normal: { count: [5,6], lvlRange: [90,95], statMul: 2.0, hpMul: 40 }, boss: { count: [2,3], lvlRange: [95,98], statMul: 2.0, hpMul: 45 } } },
  { id: 11, name: 'Cõi hư vô', minLvl: 100, maxLvl: 999, theme: 'void', icon: '🌀',
    monsters: { normal: { count: [5,6], lvlRange: [100,110], statMul: 2.5, hpMul: 50 }, boss: { count: [2,3], lvlRange: [110,115], statMul: 2.5, hpMul: 60 } } }
];

function getMapTierData(mapId) {
  return MAP_TIERS.find(m => m.id === mapId) || MAP_TIERS[0];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getEnhanceChance(currentLevel) {
  if (currentLevel < 10) return 1.0;
  if (currentLevel < 20) return 0.9;
  if (currentLevel < 30) return 0.75;
  if (currentLevel < 40) return 0.55;
  if (currentLevel < 50) return 0.35;
  if (currentLevel < 60) return 0.20;
  if (currentLevel < 70) return 0.10;
  if (currentLevel < 80) return 0.05;
  if (currentLevel < 90) return 0.02;
  return 0.01;
}

class WorldMap {
  constructor(player) {
    this.player = player;
    this.selectedMapId = 1;
    this.exploring = false;
    this.monsters = [];
    this.fightLog = [];
    this.autoInterval = null;
    this.command = 'attack';
    this.expPool = 0;
    this.totalKills = 0;
    this.bossKillCount = 0;
    this.currentBossTierIdx = 0;
    this.deathCount = 0;
    this.mapTimer = 0;

    this.fieldPetIds = [];
    this.reservePetIds = [];
    this.botPlayers = [];

    // Continuous spawn tracking
    this.spawnCooldown = 0;
    this.bossLevelTimer = 0;
    this.maxNormalMonsters = 6;
    this.maxBosses = 1;
    this.tickIntervalMs = 800;
    this._lastIntervalKey = null;
    this.applyPerformanceProfile();

    this.onUpdate = null;
    this.onBattle = null;
    this.onPetDeath = null;
    this.onLevelUp = null;
    this.onMapComplete = null;
    this.onAttackAnim = null;
    this.onLogUpdate = null;

    // Throttle UI updates to avoid DOM thrashing (prevent freezes)
    this._updateScheduled = null;
    this.scheduleUpdate = () => {
      if (this._updateScheduled) return;
      this._updateScheduled = setTimeout(() => {
        this._updateScheduled = null;
        try {
          // Trim fight log to avoid unbounded growth causing memory/DOM issues
          if (Array.isArray(this.fightLog) && this.fightLog.length > 500) {
            this.fightLog = this.fightLog.slice(-500);
          }
          if (this.onUpdate) this.onUpdate();
          if (this.onLogUpdate) this.onLogUpdate();
        } catch (e) {
          console.warn('onUpdate handler error', e);
        }
      }, 300);
    };

    // Effect tracking
    this.petEffects = {};
    this.monsterEffects = {};
    // CC immunity: { entityId: { effectType: remainingTicks } } — miễn nhiễm 3s sau khi dính CC
    this.ccImmunity = {};

    // Online mode
    this.isOnline = false;
    this.onlineManager = null;
    this._monsterIdCounter = 0;
  }

  getPlayerPosition() {
    var pet = this.fieldPetIds.length > 0 ? this.player.getPet(this.fieldPetIds[0]) : null;
    if (!pet) return null;
    return { x: pet.gridCol || 6, y: pet.gridRow || 5 };
  }

  setOnlineMode(manager) {
    if (this.onlineManager === manager && this.isOnline) {
      if (manager.remoteMonsters && Object.keys(manager.remoteMonsters).length > 0) {
        this._syncMonstersFromFirebase(manager.remoteMonsters);
        this.scheduleUpdate();
      }
      return;
    }
    this.onlineManager = manager;
    this.isOnline = true;
    var self = this;
    manager.startSyncPosition(this);
    manager.onMonstersUpdate = function(monsters){
      self._syncMonstersFromFirebase(monsters);
    };
    // If the manager already has monster data from an initial world snapshot,
    // sync it immediately to avoid stale empty map state after joining.
    if (manager.remoteMonsters && Object.keys(manager.remoteMonsters).length > 0) {
      self._syncMonstersFromFirebase(manager.remoteMonsters);
      self.scheduleUpdate();
    }
  }

  _syncMonstersFromFirebase(firebaseMonsters) {
    // Update existing Firebase monsters (HP/position), don't create new ones.
    // This avoids duplicating host monsters on top of each player's local spawns.
    for (var id in firebaseMonsters) {
      var fm = firebaseMonsters[id];
      if (!fm || !fm.alive) continue;
      var existing = this.monsters.find(function(m){ return m.firebaseId === id; });
      if (existing) {
        existing.gridCol = fm.x;
        existing.gridRow = fm.y;
        if (fm.hp != null && fm.hp < existing.hp) {
          existing.hp = fm.hp;
          existing._lastSyncHp = existing.hp;
        }
      }
    }
    // Remove monsters whose Firebase entry is gone (host removed them after death)
    this.monsters = this.monsters.filter(function(m) {
      if (!m.firebaseId) return true;
      var fm = firebaseMonsters[m.firebaseId];
      return fm && fm.alive;
    });
  }

  getMapInfo() {
    return getMapTierData(this.selectedMapId);
  }

  getMapLevelRange() {
    const info = this.getMapInfo();
    return { min: info.minLvl, max: info.maxLvl };
  }

  getMapName() {
    return this.getMapInfo().name;
  }

  canExplore() {
    return this.getBattlePets().length > 0;
  }

  selectMap(mapId) {
    this.selectedMapId = mapId;
    if (this.exploring) {
      this.stopExploring();
    }
  }

  applyPerformanceProfile() {
    const mapId = this.selectedMapId || 1;
    const aliveMonsters = (this.monsters || []).filter(m => !m.dead && m.hp > 0).length;
    const alivePets = this.getBattlePets().length + (this.getBotPets?.().length || 0);
    const busyCombat = aliveMonsters + alivePets >= 10 || this.mapTimer > 180;
    const veryBusy = aliveMonsters + alivePets >= 14 || this.mapTimer > 300;

    if (veryBusy) {
      this.maxNormalMonsters = 3;
      this.maxBosses = 1;
      this.spawnCooldownBase = 8;
      this.spawnCooldownVariance = 5;
      this.bossSpawnChance = 0.004;
      this.tickIntervalMs = 750;
    } else if (busyCombat) {
      this.maxNormalMonsters = 4;
      this.maxBosses = 1;
      this.spawnCooldownBase = 6;
      this.spawnCooldownVariance = 4;
      this.bossSpawnChance = 0.008;
      this.tickIntervalMs = 680;
    } else if (mapId >= 8) {
      this.maxNormalMonsters = 4;
      this.maxBosses = 1;
      this.spawnCooldownBase = 6;
      this.spawnCooldownVariance = 4;
      this.bossSpawnChance = 0.008;
      this.tickIntervalMs = 650;
    } else if (mapId >= 5) {
      this.maxNormalMonsters = 5;
      this.maxBosses = 1;
      this.spawnCooldownBase = 5;
      this.spawnCooldownVariance = 3;
      this.bossSpawnChance = 0.01;
      this.tickIntervalMs = 600;
    } else {
      this.maxNormalMonsters = 6;
      this.maxBosses = 1;
      this.spawnCooldownBase = 3;
      this.spawnCooldownVariance = 5;
      this.bossSpawnChance = 0.02;
      this.tickIntervalMs = 600;
    }

    if (this.exploring && this.autoInterval && this._lastIntervalKey !== this.tickIntervalMs) {
      this._lastIntervalKey = this.tickIntervalMs;
      clearInterval(this.autoInterval);
      this.autoInterval = setInterval(() => {
        if (!this.exploring) {
          clearInterval(this.autoInterval);
          this.autoInterval = null;
          return;
        }
        // ⚠️ CRITICAL: Phải có try-catch. Nếu autoTick() throw, interval vẫn chạy tiếp nhưng trạng thái game có thể sai lệch
        try {
          this.mapTimer++;
          this.spawnCooldown++;
          this.bossLevelTimer++;
          this.autoTick();
        } catch (e) {
          console.warn('autoLoop tick error', e);
        }
      }, this.tickIntervalMs);
    } else if (!this._lastIntervalKey) {
      this._lastIntervalKey = this.tickIntervalMs;
    }
  }

  startExploring() {
    if (this.exploring) return;
    if (!this.canExplore()) return false;
    this.exploring = true;
    this.applyPerformanceProfile();
    this.monsters = [];
    this.fightLog = [];
    this.mapTimer = 0;
    this.spawnCooldown = 0;
    this.bossLevelTimer = 0;
    this.command = 'attack';
    this.fieldPetIds = [];
    this.reservePetIds = [];
    const battlePets = this.getBattlePets();
    battlePets.forEach(p => p.resetBattleEnergy());
    battlePets.forEach((p, i) => this.assignPetGrid(p, i));
    this.spawnInitialMonsters();
    if (this.reservePetIds.length > 0) {
      this.fightLog.push({ text: `🔄 ${this.reservePetIds.length} pet dự bị sẵn sàng vào sân`, type: 'system' });
    }
    this.botPlayers = [];
    this.startAutoLoop();
    return true;
  }

  stopExploring() {
    this.exploring = false;
    if (this.autoInterval) {
      clearInterval(this.autoInterval);
      this.autoInterval = null;
    }
    this.botPlayers = [];
  }

  spawnInitialMonsters() {
    this.applyPerformanceProfile();
    const info = this.getMapInfo();
    const baseNormalCount = info.monsters.normal.count[0] + Math.floor(Math.random() * (info.monsters.normal.count[1] - info.monsters.normal.count[0] + 1));
    const baseBossCount = info.monsters.boss.count[0] + Math.floor(Math.random() * (info.monsters.boss.count[1] - info.monsters.boss.count[0] + 1));
    const normalCount = Math.max(1, Math.min(baseNormalCount, this.maxNormalMonsters));
    const bossCount = Math.max(0, Math.min(baseBossCount, this.maxBosses));
    for (let i = 0; i < normalCount; i++) this.spawnNormalMonster();
    for (let i = 0; i < bossCount; i++) this.spawnBossMonster();
    this.scheduleUpdate();
  }

  // Select up to 3 alive pets for online PvP
  selectOnlinePets(petIds) {
    const alive = this.player.pets.filter(p => !p.dead && p.hp > 0);
    const valid = petIds.filter(id => alive.some(p => p.id === id)).slice(0, 3);
    if (valid.length === 0) return false;
    this.fieldPetIds = valid;
    this.updateReserve();
    return true;
  }

  getBattlePets() {
    if (this.fieldPetIds.length > 0) {
      const alive = this.fieldPetIds.map(id => this.player.getPet(id)).filter(p => p && !p.dead && p.hp > 0);
      while (alive.length < 3) {
        const reserve = this.getReservePets();
        if (reserve.length === 0) break;
        const fresh = reserve[0];
        this.fieldPetIds.push(fresh.id);
        alive.push(fresh);
        const idx = this.reservePetIds.indexOf(fresh.id);
        if (idx !== -1) this.reservePetIds.splice(idx, 1);
      }
      return alive;
    }
    let bt = this.player.battleTeam;
    if (bt && bt.length > 0) {
      bt = bt.filter(id => { const p = this.player.getPet(id); return p && !p.dead && p.hp > 0; });
      this.player.battleTeam = bt;
    }
    let candidates;
    if (bt && bt.length > 0) {
      candidates = bt.map(id => this.player.getPet(id)).filter(Boolean);
    }
    if (!candidates || candidates.length === 0) {
      candidates = this.player.pets.filter(p => !p.dead && p.hp > 0).sort((a, b) => b.getPower() - a.getPower()).slice(0, 3);
    }
    const alive = candidates.filter(p => !p.dead && p.hp > 0);
    this.fieldPetIds = alive.map(p => p.id);
    this.updateReserve();
    return alive;
  }

  updateReserve() {
    const allAlive = this.player.pets.filter(p => !p.dead && p.hp > 0).map(p => p.id);
    this.reservePetIds = allAlive.filter(id => !this.fieldPetIds.includes(id));
  }

  getReservePets() {
    return this.reservePetIds.map(id => this.player.getPet(id)).filter(p => p && !p.dead && p.hp > 0);
  }

  getPetRange(pet) {
    const role = getPetRole(pet.baseId);
    if (role.id === 'tank') return 1;
    if (role.id === 'melee') return 2;
    return 3;
  }

  getMonsterRange(mon) {
    return mon.attackRange || 1;
  }

  gridDist(a, b) {
    if (!a || !b) return 999;
    return Math.abs(a.gridCol - b.gridCol);
  }

  assignPetGrid(pet, index) {
    const role = getPetRole(pet.baseId);
    const fm = this.getFormation(role.id, index);
    pet.gridCol = fm.col;
    pet.gridRow = fm.row;
  }

  getFormation(roleId, index) {
    const formations = {
      tank:     [{ col: 2, row: 3 }, { col: 2, row: 4 }],
      melee:    [{ col: 3, row: 2 }, { col: 3, row: 4 }, { col: 3, row: 3 }],
      ranged:   [{ col: 5, row: 2 }, { col: 5, row: 4 }, { col: 5, row: 3 }],
      magic:    [{ col: 5, row: 2 }, { col: 6, row: 4 }, { col: 6, row: 3 }],
      support:  [{ col: 6, row: 3 }, { col: 6, row: 4 }, { col: 6, row: 2 }],
    };
    const list = formations[roleId] || formations.melee;
    return list[index % list.length];
  }

  getRoleFormationPosition(roleId, index, command = this.command) {
    if (command === 'defend') {
      const defendMap = {
        tank: { col: 2, row: 2 },
        melee: { col: 3, row: 2 },
        ranged: { col: 5, row: 3 },
        magic: { col: 5, row: 3 },
        support: { col: 6, row: 2 }
      };
      return defendMap[roleId] || { col: 3, row: 3 };
    }
    return this.getFormation(roleId, index);
  }

  getPetThreatScore(pet) {
    const role = getPetRole(pet.baseId);
    const roleMul = { tank: 1.25, melee: 1.1, ranged: 1.2, magic: 1.25, support: 0.9 };
    const hpRatio = pet.maxHp > 0 ? pet.hp / pet.maxHp : 0;
    return (pet.getPower?.() || pet.atk || 0) * (roleMul[role.id] || 1) + (hpRatio < 0.5 ? 25 : 0) + (role.id === 'support' ? 8 : 0);
  }

  getBossTargetScore(monster, pet) {
    if (!monster || !pet) return -999;
    const role = getPetRole(pet.baseId).id;
    const threat = this.getPetThreatScore(pet);
    const dist = this.gridDist(monster, pet);
    const lowHpBonus = pet.hp < pet.maxHp * 0.45 ? 18 : 0;
    const supportBonus = role === 'support' ? 24 : 0;
    const tankBonus = role === 'tank' ? 12 : 0;
    const rangedBonus = (monster.bossRole === 'ranged' || monster.bossRole === 'magic') && role === 'support' ? 16 : 0;
    const meleeBonus = monster.bossRole === 'melee' && role === 'tank' ? 10 : 0;
    const closeBonus = dist <= 1 ? 8 : 0;
    const rangePenalty = (monster.bossRole === 'ranged' || monster.bossRole === 'magic') && dist <= 1 ? -6 : 0;
    return threat + lowHpBonus + supportBonus + tankBonus + rangedBonus + meleeBonus + closeBonus + rangePenalty - dist * 2.8;
  }

  selectPetTarget(pet, aliveMonsters, alivePets) {
    const role = getPetRole(pet.baseId);
    const bossTargets = aliveMonsters.filter(m => m.isBoss);
    const candidates = bossTargets.length > 0 ? bossTargets : aliveMonsters;
    const sorted = candidates.slice().sort((a, b) => {
      const aScore = (a.isBoss ? 40 : 0) + (a.getPower?.() || a.atk || 0) - this.gridDist(pet, a) * 2;
      const bScore = (b.isBoss ? 40 : 0) + (b.getPower?.() || b.atk || 0) - this.gridDist(pet, b) * 2;
      return bScore - aScore;
    });
    if (role.id === 'support' && alivePets.length > 0) {
      const injured = alivePets.filter(p => p.id !== pet.id && p.hp < p.maxHp * 0.7);
      if (injured.length > 0 && Math.random() < 0.5) return null;
    }
    return sorted[0] || candidates[0] || null;
  }

  getPetDesiredPosition(pet, target, alivePets) {
    const role = getPetRole(pet.baseId);
    const idx = alivePets.indexOf(pet);
    const base = this.getRoleFormationPosition(role.id, idx, this.command);
    if (!target) return { col: base.col, row: base.row };

    const targetCol = target.gridCol || 10;
    const targetRow = target.gridRow || 4;

    if (this.command === 'defend') {
      const pos = this.getRoleFormationPosition(role.id, idx, 'defend');
      return { col: pos.col, row: pos.row };
    }

    if (role.id === 'tank') {
      return { col: clamp(targetCol - 1, 2, 9), row: clamp(targetRow + (targetRow > 3 ? 0 : 1), 2, 5) };
    }
    if (role.id === 'melee') {
      return { col: clamp(targetCol - 1, 3, 9), row: clamp(targetRow, 2, 5) };
    }
    if (role.id === 'ranged' || role.id === 'magic') {
      return { col: clamp(targetCol - 1, 3, 9), row: clamp(targetRow + (pet.gridRow > targetRow ? -1 : 1), 2, 5) };
    }
    if (role.id === 'support') {
      const protector = alivePets.find(p => p.id !== pet.id && ['tank', 'melee'].includes(getPetRole(p.baseId).id));
      if (protector) {
        return { col: clamp(protector.gridCol - 1, 3, 9), row: clamp(protector.gridRow + 1, 2, 5) };
      }
      return { col: clamp(targetCol - 1, 3, 9), row: clamp(targetRow + 1, 2, 5) };
    }
    return { col: base.col, row: base.row };
  }

  movePetTowardPosition(pet, targetCol, targetRow) {
    const currentCol = pet.gridCol ?? 6;
    const currentRow = pet.gridRow ?? 4;
    const colDelta = targetCol - currentCol;
    const rowDelta = targetRow - currentRow;

    if (Math.abs(colDelta) > 1) {
      pet.gridCol = currentCol + (colDelta > 0 ? 1 : -1);
    } else if (Math.abs(colDelta) === 1) {
      pet.gridCol = targetCol;
    }
    if (Math.abs(rowDelta) > 1) {
      pet.gridRow = currentRow + (rowDelta > 0 ? 1 : -1);
    } else if (Math.abs(rowDelta) === 1) {
      pet.gridRow = targetRow;
    }

    pet.gridCol = clamp(pet.gridCol, 1, 35);
    pet.gridRow = clamp(pet.gridRow, 2, 11);
  }

  selectPetSkill(pet, target, readySkills, aliveMonsters, alivePets) {
    if (!readySkills || readySkills.length === 0) return null;
    const role = getPetRole(pet.baseId);
    const petElem = getPetElement(pet.baseId);
    const targetElem = target?.element || 'fire';
    const targetIsBoss = target?.isBoss;
    const monsterCount = aliveMonsters ? aliveMonsters.filter(m => !m.dead && m.hp > 0).length : 1;

    // Weighted random scoring
    const scored = readySkills.map(s => {
      let score = 10; // base

      // Element advantage
      const adv = getElementAdvantage(petElem, targetElem);
      if (adv > 1) score += 15;
      else if (adv < 1) score -= 5;

      // High damage = attractive (ưu tiên skill tấn công)
      const dmgMul = s.dmgMul || 0;
      if (dmgMul > 0) {
        score += 15;          // base bonus cho skill tấn công
        score += dmgMul * 10; // thêm theo damage multiplier
      }

      // Control effect vs boss
      const isControl = s.effect && ['root','freeze','slow','stun','knockback','vortex'].includes(s.effect);
      if (targetIsBoss && isControl) score += 20;
      if (s.effect === 'shield' && role.id === 'tank') {
        const hasShield = this.petEffects?.[pet.id]?.some(e => e.type === 'shield');
        if (!hasShield) score += 25;
      }

      // Heal for support when allies injured
      if (role.id === 'support' && (s.type === 'heal' || s.healMul > 0)) {
        const injured = alivePets ? alivePets.filter(p => p.id !== pet.id && p.hp < p.maxHp * 0.8).length : 0;
        if (injured > 0) score += 15 + injured * 5;
      }

      // AOE scales with number of monsters
      if (s.type === 'aoe' && monsterCount > 1) score += 8 * Math.min(monsterCount, 4);

      // Penalty for repeating last skill
      if (s.name === pet._lastSkillName) score -= 20;

      // Proficiency bonus (pet dùng skill quen thuộc sẽ hiệu quả hơn)
      const prof = pet.skillProficiency?.[s.id || s.name] || 0;
      score += Math.min(prof, 5);

      return { skill: s, score: Math.max(1, score) };
    });

    // Weighted random pick
    const totalScore = scored.reduce((sum, s) => sum + s.score, 0);
    let roll = Math.random() * totalScore;
    for (const entry of scored) {
      roll -= entry.score;
      if (roll <= 0) {
        pet._lastSkillName = entry.skill.name;
        return entry.skill;
      }
    }
    // Fallback
    const last = scored[scored.length - 1];
    if (last) pet._lastSkillName = last.skill.name;
    return last?.skill || null;
  }

  getMonsterPreferredDistance(monster) {
    if (!monster) return 1;
    if (monster.combatStyle === 'ranged') return 2;
    if (monster.combatStyle === 'tank') return 1;
    return 1;
  }

  moveMonsterForCombat(monster, target, preferredRange = 1) {
    if (!target) return;
    const dist = this.gridDist(monster, target);
    const style = monster?.combatStyle || 'melee';

    if (style === 'ranged') {
      if (dist < preferredRange) {
        const retreatDir = monster.gridCol > target.gridCol ? -1 : 1;
        monster.gridCol = clamp(monster.gridCol + retreatDir, 8, 33);
      } else if (dist > preferredRange + 1) {
        this.moveMonsterTowardTarget(monster, target, 1);
      }
      return;
    }

    if (dist > preferredRange) {
      this.moveMonsterTowardTarget(monster, target, 1);
    } else if (style === 'tank' && dist < preferredRange) {
      const retreatDir = monster.gridCol > target.gridCol ? -1 : 1;
      monster.gridCol = clamp(monster.gridCol + retreatDir, 8, 33);
    }
  }

  getMonsterSkillCost(monster, skill) {
    if (!skill) return 0;
    if (skill.energyCost != null) return skill.energyCost;
    if (!monster?.isBoss) return 0;
    const heavySpecials = ['meteor', 'meteor_storm', 'fire_eruption', 'ice_rain', 'tornado', 'poison_spider', 'stomp', 'hurricane', 'giant_storm', 'ground_stomp', 'volcano_wave', 'thunder_arc', 'earth_split', 'aurora_surge', 'shadow_burst'];
    if (skill.special && heavySpecials.includes(skill.special)) return 60;
    if (skill.aoe) return 52;
    if (skill.special) return 48;
    return 40;
  }

  getMonsterSkillCooldown(monster, skill) {
    if (!skill) return 0;
    if (skill.cooldownTurns != null) return Math.max(1, skill.cooldownTurns - 1);
    if (!monster?.isBoss) return 1;
    const heavySpecials = ['meteor', 'meteor_storm', 'fire_eruption', 'ice_rain', 'tornado', 'poison_spider', 'stomp', 'hurricane', 'giant_storm', 'ground_stomp', 'volcano_wave', 'thunder_arc', 'earth_split', 'aurora_surge', 'shadow_burst'];
    if (skill.special && heavySpecials.includes(skill.special)) return 2;
    if (skill.aoe || skill.special) return 1;
    return 1;
  }

  canMonsterUseSkill(monster, skill) {
    if (!skill) return false;
    const skillKey = skill.id || skill.name;
    const cooldown = this.getMonsterSkillCooldown(monster, skill);
    const activeCooldown = (monster?.monsterSkillCooldowns?.[skillKey] || 0) > 0;
    if (monster?.isBoss) {
      const cost = this.getMonsterSkillCost(monster, skill);
      return (monster.battleEnergy || 0) >= cost && !activeCooldown && cooldown >= 0;
    }
    return !activeCooldown && cooldown >= 0;
  }

  getBossSkillPool(mon, phase) {
    if (!mon.isBoss || !mon.monsterSkill) return [];
    const element = mon.element || 'fire';
    const signaturePool = {
      fire: [MONSTER_SKILLS.volcanoblast, MONSTER_SKILLS.meteor_storm, MONSTER_SKILLS.fire_eruption, MONSTER_SKILLS.fire_breath, MONSTER_SKILLS.inferno, MONSTER_SKILLS.ember_wave, MONSTER_SKILLS.molten_lance, MONSTER_SKILLS.hellfire_rain, MONSTER_SKILLS.solar_fall, MONSTER_SKILLS.triple_true_fire, MONSTER_SKILLS.flame_orb],
      ice: [MONSTER_SKILLS.icenova, MONSTER_SKILLS.ice_rain, MONSTER_SKILLS.frostbite, MONSTER_SKILLS.blizzard, MONSTER_SKILLS.permafrost, MONSTER_SKILLS.crystal_spike, MONSTER_SKILLS.glacier_spear, MONSTER_SKILLS.frostnova, MONSTER_SKILLS.frost_wreath, MONSTER_SKILLS.diamond_dust],
      wood: [MONSTER_SKILLS.natureswrath, MONSTER_SKILLS.thornwave, MONSTER_SKILLS.forestwrath, MONSTER_SKILLS.overgrowth, MONSTER_SKILLS.ancientpower, MONSTER_SKILLS.vine_barrage, MONSTER_SKILLS.root_maelstrom, MONSTER_SKILLS.ancient_bloom, MONSTER_SKILLS.jungle_devour],
      thunder: [MONSTER_SKILLS.thunderstorm, MONSTER_SKILLS.chainlightning, MONSTER_SKILLS.flash_strike, MONSTER_SKILLS.dash_strike, MONSTER_SKILLS.thunder_bolt, MONSTER_SKILLS.thunder_arc, MONSTER_SKILLS.storm_impact, MONSTER_SKILLS.divine_bolt, MONSTER_SKILLS.lightning_spear, MONSTER_SKILLS.thunder_vanguard, MONSTER_SKILLS.cosmic_cleave],
      poison: [MONSTER_SKILLS.plague, MONSTER_SKILLS.voidtear, MONSTER_SKILLS.poison_web, MONSTER_SKILLS.darkpulse, MONSTER_SKILLS.nightmare, MONSTER_SKILLS.shadow_burst, MONSTER_SKILLS.venom_tornado, MONSTER_SKILLS.plague_bloom, MONSTER_SKILLS.void_harvest, MONSTER_SKILLS.poison_trap, MONSTER_SKILLS.blood_moon],
      storm: [MONSTER_SKILLS.hurricane, MONSTER_SKILLS.whirlwind, MONSTER_SKILLS.giant_storm, MONSTER_SKILLS.knockback_blast, MONSTER_SKILLS.tornado, MONSTER_SKILLS.aurora_surge, MONSTER_SKILLS.cyclone_rend, MONSTER_SKILLS.sky_breaker, MONSTER_SKILLS.cosmic_wind, MONSTER_SKILLS.storm_fury],
      earth: [MONSTER_SKILLS.ground_stomp, MONSTER_SKILLS.fissure, MONSTER_SKILLS.earthquake, MONSTER_SKILLS.rockslide, MONSTER_SKILLS.smash, MONSTER_SKILLS.earth_split, MONSTER_SKILLS.mountain_crush, MONSTER_SKILLS.stone_rain, MONSTER_SKILLS.dragon_18_palm, MONSTER_SKILLS.chibaku_tensei, MONSTER_SKILLS.petrifying_gaze],
      water: [MONSTER_SKILLS.chaoswave, MONSTER_SKILLS.freeze, MONSTER_SKILLS.blizzard, MONSTER_SKILLS.ice_rain, MONSTER_SKILLS.frostbite, MONSTER_SKILLS.tidal_rush, MONSTER_SKILLS.abyss_surge, MONSTER_SKILLS.sea_curse, MONSTER_SKILLS.abyssal_bubble]
    };
    const pool = [...(mon.monsterSkills || []).filter(Boolean)];
    if (mon.monsterSkill && !pool.includes(mon.monsterSkill)) pool.unshift(mon.monsterSkill);
    const elementSkills = signaturePool[element] || signaturePool.fire;
    pool.push(...elementSkills.filter(Boolean));
    if (phase >= 3) {
      pool.push(MONSTER_SKILLS.ground_stomp, MONSTER_SKILLS.meteor_storm, MONSTER_SKILLS.whirlwind, MONSTER_SKILLS.dash_strike, MONSTER_SKILLS.poison_web, MONSTER_SKILLS.earth_split, MONSTER_SKILLS.aurora_surge, MONSTER_SKILLS.shadow_burst);
    } else if (phase >= 2) {
      pool.push(MONSTER_SKILLS.flash_strike, MONSTER_SKILLS.knockback_blast, MONSTER_SKILLS.fire_breath, MONSTER_SKILLS.fissure, MONSTER_SKILLS.crystal_spike, MONSTER_SKILLS.thunder_arc, MONSTER_SKILLS.vine_barrage);
    } else {
      pool.push(MONSTER_SKILLS.flash_strike, MONSTER_SKILLS.dash_strike, MONSTER_SKILLS.thunder_bolt, MONSTER_SKILLS.ember_wave, MONSTER_SKILLS.crystal_spike);
    }
    return pool.filter(Boolean);
  }

  getBossSkillChoice(mon, target, dist, phase, alivePets = []) {
    if (!mon.isBoss || !mon.monsterSkill) return null;
    const pool = this.getBossSkillPool(mon, phase);
    const hpPct = mon.hp / Math.max(1, mon.maxHp);
    const isLowHp = hpPct < 0.35;
    const wantsPressure = dist <= 2 || isLowHp || alivePets.length > 1;
    if (wantsPressure) {
      pool.unshift(
        MONSTER_SKILLS.ground_stomp,
        MONSTER_SKILLS.whirlwind,
        MONSTER_SKILLS.meteor_storm,
        MONSTER_SKILLS.fire_eruption,
        MONSTER_SKILLS.ice_rain,
        MONSTER_SKILLS.poison_web,
        MONSTER_SKILLS.earth_split,
        MONSTER_SKILLS.aurora_surge,
        MONSTER_SKILLS.shadow_burst
      );
    }
    if (dist > 2) pool.push(MONSTER_SKILLS.dash_strike, MONSTER_SKILLS.flash_strike, MONSTER_SKILLS.thunder_arc);
    if (isLowHp) pool.unshift(MONSTER_SKILLS.meteor_storm, MONSTER_SKILLS.whirlwind, MONSTER_SKILLS.ground_stomp, MONSTER_SKILLS.ember_wave, MONSTER_SKILLS.earth_split);

    const rangeType = mon.rangeType || 1;

    const readySkills = pool.filter(skill => skill && this.canMonsterUseSkill(mon, skill));
    if (readySkills.length === 0) return null;

    const scoredSkills = readySkills.map(skill => {
      let score = 0;
      const isAoE = !!(skill.aoe || ['meteor', 'stomp', 'ice_rain', 'tornado', 'poison_spider', 'volcano_wave', 'thunder_arc', 'shadow_burst', 'aurora_surge', 'earth_split', 'tidal_rush', 'crystal_spike', 'vine_barrage', 'triple_fire', 'storm_fury', 'poison_trap', 'void'].includes(skill.special));
      const isControl = !!(skill.category === 'control' || ['stun', 'freeze', 'knockback', 'vortex', 'poison', 'root', 'gravity'].includes(skill.effect));
      if (isAoE) score += 16;
      if (isControl) score += 12;
      if (isLowHp && (skill.special === 'meteor' || skill.special === 'stomp' || skill.special === 'tornado' || skill.special === 'volcano_wave' || skill.special === 'earth_split' || skill.special === 'shadow_burst' || skill.special === 'void' || skill.special === 'triple_fire' || skill.special === 'storm_fury')) score += 16;
      if (dist > 2 && (skill.special === 'dash' || skill.special === 'flash' || skill.special === 'thunder_arc')) score += 14;
      if (dist <= 1 && skill.dmgMul >= 2.4) score += 10;
      if (alivePets.length > 1 && isAoE) score += 14;
      if (hpPct < 0.6 && skill.dmgMul >= 2.6) score += 6;
      // Range type preferences
      if (rangeType === 1 && dist <= 1) score += 10;
      if (rangeType === 3) { score += (isAoE ? 8 : 0) + (dist > 2 ? 6 : 0); }
      if (rangeType === 2 && dist >= 2 && isAoE) score += 6;
      if (skill.name === mon._lastBossSkillName) score -= 10;
      if (skill.energyCost && skill.energyCost > (mon.battleEnergy || 0)) score -= 6;
      return { skill, score };
    }).sort((a, b) => b.score - a.score);

    const topPool = scoredSkills.slice(0, Math.min(3, scoredSkills.length));
    if (mon._skillCycleIdx == null) mon._skillCycleIdx = 0;
    const cycleIdx = mon._skillCycleIdx % Math.max(1, topPool.length);
    mon._skillCycleIdx = (cycleIdx + 1) % Math.max(1, topPool.length);
    const best = topPool[cycleIdx];
    if (best) mon._lastBossSkillName = best.skill.name;
    return best?.skill || null;
  }

  isMonsterCellOccupied(col, row, excludeMon) {
    return this.monsters.some(m => m !== excludeMon && !m.dead && m.gridCol === col && m.gridRow === row);
  }

  findVacantMonsterCell() {
    for (let attempt = 0; attempt < 20; attempt++) {
      const col = 11 + Math.floor(Math.random() * 5);
      const row = 2 + Math.floor(Math.random() * 5);
      if (!this.isMonsterCellOccupied(col, row)) {
        return { col, row };
      }
    }
    return { col: 11 + Math.floor(Math.random() * 5), row: 2 + Math.floor(Math.random() * 5) };
  }

  moveMonsterTowardTarget(monster, target, phase) {
    if (!target) return;
    const speed = phase > 3 ? 3 : (phase > 2 ? 2 : (phase > 1 ? 1 : 1));
    const colDelta = target.gridCol - monster.gridCol;
    const rowDelta = target.gridRow - monster.gridRow;
    let newCol = monster.gridCol;
    let newRow = monster.gridRow;
    if (Math.abs(colDelta) > speed) {
      newCol += colDelta > 0 ? speed : -speed;
    }
    if (Math.abs(rowDelta) > 1) {
      newRow += rowDelta > 0 ? 1 : -1;
    }
    if (!this.isMonsterCellOccupied(newCol, newRow, monster)) {
      monster.gridCol = newCol;
      monster.gridRow = newRow;
    } else if (newCol !== monster.gridCol && !this.isMonsterCellOccupied(newCol, monster.gridRow, monster)) {
      monster.gridCol = newCol;
    } else if (newRow !== monster.gridRow && !this.isMonsterCellOccupied(monster.gridCol, newRow, monster)) {
      monster.gridRow = newRow;
    }
    monster.gridCol = clamp(monster.gridCol, 8, 33);
    monster.gridRow = clamp(monster.gridRow, 2, 11);
  }

  shouldBossRetreat(monster, target, dist, phase) {
    if (!monster.isBoss || !target) return false;
    const hpRatio = monster.hp / Math.max(1, monster.maxHp);
    const lowPressure = hpRatio < 0.25;
    const noSkillReady = !monster.monsterSkill && monster.battleEnergy < 40;
    const tooClose = dist <= 1;
    return tooClose && noSkillReady && lowPressure;
  }

  moveBossForPosition(monster, target, phase) {
    if (!target) return;
    const dist = this.gridDist(monster, target);
    const rangeType = monster.rangeType || 1;
    if (this.shouldBossRetreat(monster, target, dist, phase)) {
      const retreatDir = monster.gridCol > target.gridCol ? -1 : 1;
      monster.gridCol = clamp(monster.gridCol + retreatDir, 8, 33);
      monster.gridRow = clamp(monster.gridRow + (Math.random() < 0.5 ? -1 : 1), 2, 11);
      this.fightLog.push({ text: `↩️ ${monster.emoji} ${monster.name} lùi lại để chờ thời điểm đánh!`, type: 'buff' });
      return;
    }
    // Maintain preferred range based on range type
    if (rangeType >= 2 && dist < 2) {
      const retreatDir = monster.gridCol > target.gridCol ? -1 : 1;
      monster.gridCol = clamp(monster.gridCol + retreatDir, 8, 33);
      return;
    }
    const desiredMinDist = rangeType;
    if (dist > desiredMinDist + 1) {
      this.moveMonsterTowardTarget(monster, target, phase);
    }
  }

  startAutoLoop() {
    this.applyPerformanceProfile();
    if (this.autoInterval) clearInterval(this.autoInterval);
    this.autoInterval = setInterval(() => {
      if (!this.exploring) {
        clearInterval(this.autoInterval);
        this.autoInterval = null;
        return;
      }
      try {
        this.mapTimer++;
        this.spawnCooldown++;
        this.bossLevelTimer++;
        this.autoTick();
      } catch (e) {
        console.warn('autoLoop tick error', e);
      }
    }, this.tickIntervalMs || 800);
  }

  pauseExploring() {
    if (this.autoInterval) {
      clearInterval(this.autoInterval);
      this.autoInterval = null;
    }
  }

  resumeExploring() {
    if (this.exploring && !this.autoInterval) {
      this.startAutoLoop();
    }
  }

  setCommand(cmd) {
    this.command = cmd;
    const battlePets = this.getBattlePets();
    for (let i = 0; i < battlePets.length; i++) {
      const pet = battlePets[i];
      const role = getPetRole(pet.baseId);
      const pos = this.getRoleFormationPosition(role.id, i, cmd);
      pet.gridCol = pos.col;
      pet.gridRow = pos.row;
    }
  }

  // ===== CONTINUOUS SPAWN =====
  applyStatMul(mon, statMul, hpMul) {
    if (hpMul) {
      mon.maxHp = Math.max(10, Math.floor(mon.maxHp * hpMul));
      mon.hp = Math.min(mon.hp, mon.maxHp);
    }
    if (statMul && statMul !== 1) {
      mon.atk = Math.max(1, Math.floor(mon.atk * statMul));
      mon.def = Math.max(0, Math.floor(mon.def * statMul));
    }
  }

  spawnNormalMonster() {
    const battlePets = this.getBattlePets();
    if (battlePets.length === 0) return null;
    const info = this.getMapInfo();
    const lvlRange = info.monsters.normal.lvlRange;
    const playerAvgLvl = Math.floor(battlePets.reduce((s, p) => s + p.level, 0) / battlePets.length);
    const targetLvl = Math.max(lvlRange[0], Math.min(lvlRange[1], playerAvgLvl));
    const mon = spawnMonster(targetLvl, battlePets);
    this.applyStatMul(mon, info.monsters.normal.statMul, info.monsters.normal.hpMul);
    const cell = this.findVacantMonsterCell();
    mon.gridCol = cell.col;
    mon.gridRow = cell.row;
    this.monsters.push(mon);
    this.scheduleUpdate();
    if (this.isOnline && this.onlineManager && this.onlineManager.isHost) {
      var fid = 'mon_' + (++this._monsterIdCounter);
      mon.firebaseId = fid;
      this.onlineManager.syncMonster(fid, {
        x: mon.gridCol, y: mon.gridRow,
        hp: mon.hp, maxHp: mon.maxHp,
        atk: mon.atk, def: mon.def,
        element: mon.element || 'fire',
        level: mon.level, alive: true, name: mon.name, emoji: mon.emoji
      });
    }
    return mon;
  }

  spawnBossMonster() {
    const battlePets = this.getBattlePets();
    if (battlePets.length === 0) return null;
    const info = this.getMapInfo();
    const lvlRange = info.monsters.boss.lvlRange;
    const playerAvgLvl = Math.floor(battlePets.reduce((s, p) => s + p.level, 0) / battlePets.length);
    const targetLvl = Math.max(lvlRange[0], Math.min(lvlRange[1], playerAvgLvl + 3));

    // Boss progression based on kill count
    const bossTier = getBossTier(this.bossKillCount);
    const tierIdx = BOSS_TIERS.indexOf(bossTier);
    const boss = spawnWorldBoss(targetLvl, battlePets, this.selectedMapId, this.bossKillCount);
    this.applyStatMul(boss, info.monsters.boss.statMul, info.monsters.boss.hpMul);
    const bossCell = this.findVacantMonsterCell();
    boss.gridCol = bossCell.col;
    boss.gridRow = bossCell.row;
    boss._spawnTime = this.mapTimer;
    boss._baseLevel = boss.level;
    boss._maxLevel = boss._baseLevel + 3 + tierIdx;

    // Higher tier bosses are rarer (exponential curve)
    const rarityChances = [1.0, 0.3, 0.1, 0.03];
    const rarity = rarityChances[tierIdx] ?? 1.0;
    if (tierIdx > 0 && Math.random() > rarity) {
      // Fallback to normal boss
      const lowerBoss = spawnWorldBoss(targetLvl, battlePets, this.selectedMapId, 0);
      lowerBoss.gridCol = 11 + Math.floor(Math.random() * 3);
      lowerBoss.gridRow = 3 + Math.floor(Math.random() * 5);
      lowerBoss._spawnTime = this.mapTimer;
      lowerBoss._baseLevel = lowerBoss.level;
      lowerBoss._maxLevel = lowerBoss._baseLevel + 3;
this.monsters.push(lowerBoss);
      this.fightLog.push({ text: `👤 ${lowerBoss.name} (Lv.${lowerBoss.level}) xuất hiện!`, type: 'system' });
      if (this.isOnline && this.onlineManager && this.onlineManager.isHost) {
        var fid = 'mon_' + (++this._monsterIdCounter);
        lowerBoss.firebaseId = fid;
        this.onlineManager.syncMonster(fid, {
          x: lowerBoss.gridCol, y: lowerBoss.gridRow,
          hp: lowerBoss.hp, maxHp: lowerBoss.maxHp,
          atk: lowerBoss.atk, def: lowerBoss.def,
          element: lowerBoss.element || 'fire',
          level: lowerBoss.level, alive: true, name: lowerBoss.name, emoji: lowerBoss.emoji,
          isBoss: true
        });
      }
    } else {
      // Extra boss durability boost to make bosses tankier (def x3, hp x3)
      boss.def = Math.max(1, Math.floor(boss.def * 3));
      boss.maxHp = Math.max(10, Math.floor(boss.maxHp * 3));
      boss.hp = Math.min(boss.hp, boss.maxHp);
      this.monsters.push(boss);
      const tierTag = tierIdx > 0 ? ` [${bossTier.name}]` : '';
      this.fightLog.push({ text: `👑 ${boss.name} (Lv.${boss.level}) xuất hiện!${tierTag}`, type: 'system' });
      if (this.isOnline && this.onlineManager && this.onlineManager.isHost) {
        var fid = 'mon_' + (++this._monsterIdCounter);
        boss.firebaseId = fid;
        this.onlineManager.syncMonster(fid, {
          x: boss.gridCol, y: boss.gridRow,
          hp: boss.hp, maxHp: boss.maxHp,
          atk: boss.atk, def: boss.def,
          element: boss.element || 'fire',
          level: boss.level, alive: true, name: boss.name, emoji: boss.emoji,
          isBoss: true
        });
      }
    }
    this.scheduleUpdate();
    return boss;
  }

  tickBossLevels() {
    // Boss lên cấp mỗi 10 phút (600 ticks)
    if (this.bossLevelTimer < 30) return; // Check every 30 seconds
    this.bossLevelTimer = 0;

    for (const mon of this.monsters) {
      if (!mon || mon.dead || mon.hp <= 0) continue;
      if (!mon.isBoss) continue;
      if (mon._baseLevel == null) continue;

      const elapsed = this.mapTimer - (mon._spawnTime || 0);
      const levelsGained = Math.floor(elapsed / 600); // 10 phút = 600 ticks

      if (levelsGained > 0) {
        const newLevel = Math.min(mon._baseLevel + levelsGained, mon._maxLevel);
        if (newLevel > mon.level) {
          const oldLevel = mon.level;
          mon.level = newLevel;
          // Tăng chỉ số theo cấp
          const scaleMul = 1 + (newLevel - oldLevel) * 0.08;
          mon.atk = Math.floor(mon.atk * scaleMul);
          mon.def = Math.floor(mon.def * scaleMul);
          mon.maxHp = Math.floor(mon.maxHp * (1 + (newLevel - oldLevel) * 0.06));
          mon.hp = Math.min(mon.maxHp, mon.hp + Math.floor(mon.maxHp * 0.1));
          this.fightLog.push({ text: `⬆️ ${mon.emoji} ${mon.name} lên cấp ${newLevel}!`, type: 'buff' });
        }

        // Boss chết khi quá max level
        if (mon.level >= mon._maxLevel) {
          mon.hp = 0;
          mon.dead = true;
          this.fightLog.push({ text: `💀 ${mon.emoji} ${mon.name} đã tự hủy sau khi đạt đỉnh sức mạnh!`, type: 'system' });
        }
      }
    }
    this.scheduleUpdate();
  }

  autoTick() {
    try {
      if (!this.exploring) return;

      const playerPets = this.getBattlePets();
    const botPets = this.getBotPets();
    const alivePets = [...playerPets, ...botPets];
    if (alivePets.length === 0) {
      this.fightLog.push({ text: '💀 Tất cả pet đã chết!', type: 'system' });
      this.stopExploring();
      this.scheduleUpdate();
      return;
    }

    // Boss level-up check
    this.tickBossLevels();

    // Continuous spawning: spawn normal monsters every 3-8 seconds
    const aliveNormals = this.monsters.filter(m => !m.dead && m.hp > 0 && !m.isBoss);
    const aliveBosses = this.monsters.filter(m => !m.dead && m.hp > 0 && m.isBoss);

    this.applyPerformanceProfile();
    const spawnDelay = this.spawnCooldownBase + Math.floor(Math.random() * this.spawnCooldownVariance);
    if (aliveNormals.length < this.maxNormalMonsters && this.spawnCooldown > spawnDelay) {
      this.spawnNormalMonster();
      this.spawnCooldown = 0;
    }
    if (aliveBosses.length < this.maxBosses && Math.random() < this.bossSpawnChance) {
      this.spawnBossMonster();
    }

    const aliveMonsters = this.monsters.filter(m => !m.dead && m.hp > 0);
    if (aliveMonsters.length === 0) return;

    // --- Tick cooldowns ---
    for (const pet of alivePets) {
      if (pet.skills) pet.skills.forEach(s => s.tick());
    }

    // --- Pet movement + attack ---
    for (const pet of alivePets) {
      if (aliveMonsters.length === 0) break;
      if (pet.hp <= 0 || pet.dead) continue;

      const role = getPetRole(pet.baseId);
      pet.addBattleEnergy(10);
      const selectedTarget = this.selectPetTarget(pet, aliveMonsters, alivePets);
      // Track which monster this pet is engaging (for remote combat sync)
      pet._targetFirebaseId = selectedTarget ? (selectedTarget.firebaseId || null) : null;

      if (selectedTarget) {
        const desired = this.getPetDesiredPosition(pet, selectedTarget, alivePets);
        this.movePetTowardPosition(pet, desired.col, desired.row);
      }

      // Ult ready
      if (pet.battleEnergy >= pet.maxBattleEnergy) {
        const ult = getRoleUltimate(role);
        if (ult) {
          let target = null;
          let minDist = Infinity;
          for (const mon of aliveMonsters) {
            const d = this.gridDist(pet, mon);
            if (d < minDist) { minDist = d; target = mon; }
          }
          if (target) {
            this.petUseSkill(pet, target, ult, alivePets, aliveMonsters, true);
            pet.battleEnergy = 0;
            continue;
          }
        }
      }

      // Support heals
      if (role.id === 'support') {
        const injured = alivePets.filter(p => p.id !== pet.id && p.hp < p.maxHp * 0.8);
        if (injured.length > 0) {
          const healSkill = pet.skills.find(s => (s.type === 'heal' || s.healMul > 0) && s.isReady());
          if (healSkill && Math.random() < 0.6) {
            this.petUseHealSkill(pet, injured[0], healSkill);
            continue;
          }
          this.petHealAlly(pet, injured[0]);
          continue;
        }
      }

      // Skills
      const readySkills = pet.skills.filter(s => s.isReady());
      if (readySkills.length > 0 && Math.random() < 0.45) {
        const skill = this.selectPetSkill(pet, selectedTarget, readySkills, aliveMonsters, alivePets);
        if (selectedTarget) {
          this.petUseSkill(pet, selectedTarget, skill, alivePets, aliveMonsters);
          pet.addBattleEnergy(15);
          continue;
        }
      }

      // Basic attack
      let target = null;
      let minDist = Infinity;
      for (const mon of aliveMonsters) {
        const d = this.gridDist(pet, mon);
        if (d < minDist) { minDist = d; target = mon; }
      }
      if (!target) continue;

      const petRange = this.getPetRange(pet);
      if (minDist <= petRange) {
        this.petAttackMonster(pet, target);
        pet.addBattleEnergy(10);
      } else {
        const dir = target.gridCol > pet.gridCol ? 1 : -1;
        pet.gridCol += dir * 2;
        pet.gridCol = Math.max(1, Math.min(35, pet.gridCol));
      }
    }

    // --- Monster movement + attack ---
    for (const mon of aliveMonsters) {
      if (alivePets.length === 0) break;
      if (mon.hp <= 0 || mon.dead) continue;

      // Check knockback/stun — monster can't act
      const monEffs = this.getMonsterEffects(mon.id || mon.name);
      if (monEffs.some(e => e.def.canAct === false)) {
        this.fightLog.push({ text: `💨 ${mon.emoji} bị khống chế, mất lượt!`, type: 'effect' });
        continue;
      }

      let target = this.selectMonsterTarget(alivePets, mon);
      if (!target) continue;

      const monRange = this.getMonsterRange(mon);
      const dist = this.gridDist(mon, target);

      if (!mon.isBoss) {
        if (mon.battleEnergy == null) mon.battleEnergy = 0;
        mon.battleEnergy = Math.min(100, mon.battleEnergy + 8);
      }

      if (mon.isBoss) {
        // Sequential skill cycling: dùng lần lượt từng skill, mỗi 2 giây, không cần năng lượng/cooldown
        if (mon._bossSkillCycleIdx == null) mon._bossSkillCycleIdx = 0;
        if (mon._bossSkillTimer == null) mon._bossSkillTimer = 0;
        const skills = (mon.monsterSkills || []).filter(s => s && s.name);
        const skillInterval = Math.ceil(2000 / (this.tickIntervalMs || 800));
        mon._bossSkillTimer++;
        if (skills.length > 0 && mon._bossSkillTimer >= skillInterval) {
          mon._bossSkillTimer = 0;
          const skill = skills[mon._bossSkillCycleIdx];
          mon._bossSkillCycleIdx = (mon._bossSkillCycleIdx + 1) % skills.length;
          this.monsterUseSkill(mon, target, skill, true);
        } else {
          this.monsterAttackPet(mon, target);
        }
      } else {
        // Normal monster AI: chủ động tìm và lao tới pet gần nhất
        if (dist <= monRange) {
          this.monsterAttackPet(mon, target);
        } else {
          // Detection radius: nếu pet trong tầm phát hiện (8 ô), quái lao nhanh hơn
          const seekPhase = dist <= 6 ? 4 : 3;
          this.moveMonsterTowardTarget(mon, target, seekPhase);
        }
        mon.battleEnergy = Math.min(100, (mon.battleEnergy || 0) + 8);
      }
    }

    // Tick effects at end of round
    this.tickEffects();

    // Sync monster HP changes to Firebase (shared competitive combat)
    if (this.isOnline && this.onlineManager) {
      for (var mi = 0; mi < this.monsters.length; mi++) {
        var m = this.monsters[mi];
        if (m.firebaseId && m.hp !== m._lastSyncHp) {
          m._lastSyncHp = m.hp;
          this.onlineManager.syncMonsterHP(m.firebaseId, m.hp);
        }
      }
    }

    // Remove dead monsters
    var removedIds = [];
    this.monsters = this.monsters.filter(function(m){
      var alive = m.hp > 0 || !m.dead;
      if (!alive && m.firebaseId) removedIds.push(m.firebaseId);
      return alive;
    });
    // Sync monster deaths to Firebase (host only)
    if (this.isOnline && this.onlineManager && this.onlineManager.isHost) {
      for (var i = 0; i < removedIds.length; i++) {
        this.onlineManager.removeMonster(removedIds[i]);
      }
    }

    // Check if all pets died
    const remainingPlayer = this.getBattlePets();
    if (remainingPlayer.length === 0) {
      this.fightLog.push({ text: '💀 Cả đội đã ngã xuống!', type: 'defeat' });
      this.stopExploring();
      this.scheduleUpdate();
      return;
    }

    // Small passive regen
    if (Math.random() < 0.1) {
      const injured = alivePets.find(p => p.hp < p.maxHp * 0.6);
      if (injured) {
        injured.hp = Math.min(injured.maxHp, injured.hp + Math.floor(injured.maxHp * 0.05));
      }
    }

    this.scheduleUpdate();
    } catch (e) {
      console.warn('autoTick error', e);
      this.fightLog.push({ text: `⚠️ Lỗi: ${e.message}`, type: 'system' });
      this.scheduleUpdate();
    }
  }

  petMoveAnim(pet) {}

  petHealAlly(pet, ally) {
    const heal = Math.floor(pet.atk * 0.4 + 10 + Math.random() * 10);
    ally.hp = Math.min(ally.maxHp, ally.hp + heal);
    this.fightLog.push({ text: `💚 ${pet.emoji} hồi ${ally.emoji} +${heal} máu`, type: 'heal' });
    if (this.onAttackAnim) {
      this.onAttackAnim(pet.id, ally.id, heal, false, 'heal', getPetRole(pet.baseId).id);
    }
  }

  // ===== EFFECT TRACKING (world) =====
  isCcEffect(type) {
    const def = EFFECTS[type];
    return def && def.canAct === false;
  }

  isImmuneTo(entityId, type) {
    return this.ccImmunity[entityId] && this.ccImmunity[entityId][type] > 0;
  }

  setImmunity(entityId, type) {
    if (!this.ccImmunity[entityId]) this.ccImmunity[entityId] = {};
    const immunityTicks = Math.ceil(3000 / (this.tickIntervalMs || 800));
    this.ccImmunity[entityId][type] = Math.max(this.ccImmunity[entityId][type] || 0, immunityTicks);
  }

  addPetEffect(petId, type, duration) {
    const effDef = EFFECTS[type];
    if (!effDef) return;
    // Kiểm tra miễn nhiễm: nếu đã dính hiệu ứng này trước đó, bỏ qua
    if (this.isCcEffect(type) && this.isImmuneTo(petId, type)) {
      this.fightLog.push({ text: `🛡️ Miễn nhiễm ${effDef.icon}${effDef.name} cho pet!`, type: 'effect' });
      return;
    }
    if (!this.petEffects[petId]) this.petEffects[petId] = [];
    const existing = this.petEffects[petId].find(e => e.type === type);
    if (existing) {
      existing.duration = Math.max(existing.duration, duration);
    } else {
      this.petEffects[petId].push({ type, duration, def: effDef });
    }
    // Nếu là CC (không thể hành động), set miễn nhiễm 3s
    if (this.isCcEffect(type)) this.setImmunity(petId, type);
  }

  addMonsterEffect(monster, type, duration) {
    const effDef = EFFECTS[type];
    if (!effDef) return;
    const monId = monster.id || monster.name;
    // Kiểm tra miễn nhiễm: nếu đã dính hiệu ứng này trước đó, bỏ qua
    if (this.isCcEffect(type) && this.isImmuneTo(monId, type)) {
      this.fightLog.push({ text: `🛡️ Miễn nhiễm ${effDef.icon}${effDef.name} cho ${monster.emoji}${monster.name}!`, type: 'effect' });
      return;
    }
    if (!this.monsterEffects[monId]) this.monsterEffects[monId] = [];
    const existing = this.monsterEffects[monId].find(e => e.type === type);
    if (existing) {
      existing.duration = Math.max(existing.duration, duration);
    } else {
      this.monsterEffects[monId].push({ type, duration, def: effDef });
    }
    // Nếu là CC (không thể hành động), set miễn nhiễm 3s
    if (this.isCcEffect(type)) this.setImmunity(monId, type);
  }

  getPetEffects(petId) {
    return this.petEffects[petId] || [];
  }

  getMonsterEffects(monsterId) {
    return this.monsterEffects[monsterId] || [];
  }

  hasShield(petId) {
    return this.getPetEffects(petId).some(e => e.type === 'shield');
  }

  tickEffects() {
    // Tick pet effects
    for (const petId of Object.keys(this.petEffects)) {
      this.petEffects[petId] = this.petEffects[petId].filter(e => {
        e.duration--;
        return e.duration > 0;
      });
      if (this.petEffects[petId].length === 0) delete this.petEffects[petId];
    }
    // Tick monster effects
    for (const monId of Object.keys(this.monsterEffects)) {
      this.monsterEffects[monId] = this.monsterEffects[monId].filter(e => {
        e.duration--;
        return e.duration > 0;
      });
      if (this.monsterEffects[monId].length === 0) delete this.monsterEffects[monId];
    }
    // Tick CC immunity timers
    for (const entityId of Object.keys(this.ccImmunity)) {
      for (const effType of Object.keys(this.ccImmunity[entityId])) {
        this.ccImmunity[entityId][effType]--;
        if (this.ccImmunity[entityId][effType] <= 0) {
          delete this.ccImmunity[entityId][effType];
        }
      }
      if (Object.keys(this.ccImmunity[entityId]).length === 0) {
        delete this.ccImmunity[entityId];
      }
    }
  }

  petUseSkill(pet, target, skill, alivePets, aliveMonsters, isUltimate) {
    const role = getPetRole(pet.baseId);
    const atkPower = pet.atk + (pet.weapon?.atk || 0) * (1 + (pet.weapon?.enhanceLevel || 0) * 0.1);
    const atkElem = getPetElement(pet.baseId);
    const defElem = target.element || 'fire';
    const elemMul = getElementAdvantage(atkElem, defElem);
    const mul = skill.dmgMul || 1.5;
    const isNewUltimate = mul >= 3.0 || skill.name.includes('Bão Tố') || skill.name.includes('Chibaku') || skill.name.includes('Tam Muội');
    const multiHit = skill.multiHit || 1;

    // Track proficiency
    pet.recordSkillUse(skill.id || skill.name);
    pet.recordElementUse(atkElem);

    // Multi-hit skill (Hàng Long Thập Bát Chưởng)
    let totalDamage = 0;
    for (let hit = 0; hit < multiHit; hit++) {
      const hitMul = multiHit > 1 ? (1 / multiHit) * (0.85 + Math.random() * 0.3) : 1;
      const dmg = Math.max(1, Math.floor((atkPower * (0.4 + Math.random() * 0.3) * mul * hitMul - Math.floor((target.def || 0) * 0.3)) * elemMul));
      const crit = Math.random() < 0.12;
      const hitDmg = crit ? Math.floor(dmg * 1.5) : dmg;
      totalDamage += hitDmg;

      if (skill.type === 'aoe') {
        for (const mon of aliveMonsters) {
          if (mon.hp <= 0) continue;
          const monDmg = Math.floor(hitDmg * (0.6 + Math.random() * 0.4));
          mon.hp = Math.max(0, mon.hp - monDmg);
          if (skill.effect && skill.effect !== 'shield' && Math.random() < (skill.effectChance || 0.3)) {
            const duration = (EFFECTS[skill.effect]?.duration || 2) + (pet.getSkillMasteryBonus(skill.id || skill.name) || 0);
            this.addMonsterEffect(mon, skill.effect, duration);
          }
          if (multiHit > 1) {
            this.fightLog.push({ text: `🐉 Chưởng ${hit + 1}/${multiHit}! → ${mon.emoji} -${monDmg}`, type: 'damage' });
          } else {
            this.fightLog.push({ text: `${isUltimate ? '🔥 ' : ''}${pet.emoji} ${skill.name} → ${mon.emoji} -${monDmg}${crit ? '💥' : ''}`, type: isUltimate ? 'buff' : 'damage' });
          }
          pet.displaySkill = skill.name;
          if (this.onAttackAnim) {
            this.onAttackAnim(pet.id, mon.id, monDmg, crit, skill.anim, role.id, !!isUltimate || isNewUltimate);
          }
          if (mon.hp <= 0) this.onMonsterKilled(pet, mon);
        }
      } else {
        target.hp = Math.max(0, target.hp - hitDmg);
        if (multiHit > 1) {
          this.fightLog.push({ text: `🐉 Chưởng ${hit + 1}/${multiHit}! → ${target.emoji} -${hitDmg}${crit ? '💥' : ''}`, type: 'damage' });
        } else {
          this.fightLog.push({ text: `${isUltimate ? '🔥 ' : ''}${pet.emoji} ${skill.name} → ${target.emoji} -${hitDmg}${crit ? '💥' : ''}`, type: isUltimate ? 'buff' : 'damage' });
        }
        pet.displaySkill = skill.name;
        if (this.onAttackAnim) {
          this.onAttackAnim(pet.id, target.id, hitDmg, crit, skill.anim, role.id, !!isUltimate || isNewUltimate);
        }
        if (target.hp <= 0) { this.onMonsterKilled(pet, target); break; }
      }
    }

    // Apply effect once after all hits
    if (skill.effect && Math.random() < (skill.effectChance || 0.3)) {
      const effName = EFFECTS[skill.effect]?.name || skill.effect;
      const effIcon = EFFECTS[skill.effect]?.icon || '';
      const bonus = pet.getSkillMasteryBonus(skill.id || skill.name);
      const duration = (EFFECTS[skill.effect]?.duration || 2) + bonus;
      const bonusTag = bonus > 0 ? ` [+${bonus}]` : '';
      if (skill.effect === 'shield') {
        this.addPetEffect(pet.id, skill.effect, duration);
      } else if (skill.type === 'aoe') {
        for (const mon of aliveMonsters) {
          if (mon.hp > 0 && Math.random() < 0.5) {
            this.addMonsterEffect(mon, skill.effect, Math.floor(duration * 0.7));
          }
        }
      } else if (target && target.hp > 0) {
        this.addMonsterEffect(target, skill.effect, duration);
      }
      this.fightLog.push({ text: `${ELEMENTS[atkElem]?.icon || ''} ${target.emoji} ${target.name} bị ${effIcon} ${effName}!${bonusTag}`, type: 'effect' });
    }

    skill.use();
    pet.totalBattles++;
    if (isUltimate) {
      this.fightLog.push({ text: `🌟 ${pet.emoji} GIẢI PHÓNG TUYỆT CHIÊU: ${skill.name}!`, type: 'buff' });
    }
  }

  petUseHealSkill(pet, ally, skill) {
    const role = getPetRole(pet.baseId);
    const heal = Math.floor(pet.atk * (skill.healMul || 0.3) + 20 + Math.random() * 15);
    ally.hp = Math.min(ally.maxHp, ally.hp + heal);
    this.fightLog.push({ text: `💚 ${pet.emoji} ${skill.name} → ${ally.emoji} +${heal} máu`, type: 'heal' });
    pet.displaySkill = skill.name;
    if (this.onAttackAnim) {
      this.onAttackAnim(pet.id, ally.id, heal, false, skill.anim, role.id);
    }
    skill.use();
  }

  monsterUseSkill(mon, target, skill, forceUse = false) {
    if (!target || !skill) return;

    const skillCost = this.getMonsterSkillCost(mon, skill);
    const skillCooldown = this.getMonsterSkillCooldown(mon, skill);
    const skillKey = skill.id || skill.name;
    const hpRatio = (mon.hp || 0) / Math.max(1, mon.maxHp || 1);
    const underPressure = mon.isBoss && (hpRatio < 0.4 || this.getBattlePets().length > 1);
    const isForcedCharge = skill && String(skill.name || '').includes('SIÊU');
    const canUseNow = forceUse || isForcedCharge || this.canMonsterUseSkill(mon, skill) || underPressure;
    const special = skill.special || '';
    const animIsUltimate = !!(mon.isBoss && (special || skill.aoe || (skill.dmgMul || 1) >= 2.5));
    if (mon.isBoss && !canUseNow) {
      if ((mon.battleEnergy || 0) < skillCost) {
        this.fightLog.push({ text: `⚡ ${mon.emoji} ${mon.name} đang tích năng lượng cho ${skill.name}!`, type: 'buff' });
      } else if ((mon.monsterSkillCd || 0) > 0) {
        this.fightLog.push({ text: `⏳ ${mon.emoji} ${mon.name} đang hồi ${skill.name}!`, type: 'buff' });
      }
      this.monsterAttackPet(mon, target);
      return;
    }

    // Dodge check (pet tries to dodge, harder vs boss skills)
    const dodgeChance = mon.isBoss ? 0.08 : 0.15;
    if (this.checkDodge(target, (mon.spd || 8) + 5) && Math.random() < dodgeChance) {
      this.fightLog.push({ text: `💨 ${target.emoji} ${target.name} né ${skill.name} từ ${mon.emoji}!`, type: 'buff' });
      if (this.onAttackAnim) this.onAttackAnim(mon.id, target.id, 0, false, 'dodge');
      return;
    }

    const isAoeTargeting = !!(skill.aoe || ['meteor', 'stomp', 'volcano_wave', 'shadow_burst', 'aurora_surge', 'earth_split', 'tidal_rush', 'ice_rain', 'tornado', 'poison_spider', 'vine_barrage', 'thunder_arc'].includes(special));
    const targetLabel = isAoeTargeting ? 'cả đội' : `${target.emoji} ${target.name}`;
    this.fightLog.push({ text: `🎯 ${mon.emoji} ${mon.name} chuẩn bị dùng ${skill.name} vào ${targetLabel}!`, type: 'buff' });
    if (this.onAttackAnim) this.onAttackAnim(mon.id, target.id, 0, false, 'taunt', 'monster', animIsUltimate);

    const monAtk = mon.atk || 15;
    const mul = skill.dmgMul || 1.5;
    const atkElem = mon.element || 'fire';
    const defElem = getPetElement(target.baseId);
    const elemMul = getElementAdvantage(atkElem, defElem);
    const bossMul = mon.isBoss
      ? (mon.bossRole === 'tank' ? 1.2 : mon.bossRole === 'magic' ? 1.5 : mon.bossRole === 'ranged' ? 1.4 : 1.35)
      : 1;
    if (mon.isBoss && !forceUse) {
      mon.battleEnergy = Math.max(0, (mon.battleEnergy || 0) - skillCost);
    }
    if (!forceUse) {
      if (!mon.monsterSkillCooldowns) mon.monsterSkillCooldowns = {};
      mon.monsterSkillCooldowns[skillKey] = skillCooldown;
      mon.monsterSkillCd = skillCooldown;
    }
    mon.displaySkill = skill.name;

    // === SPECIAL SKILL BEHAVIORS ===

    // Flash strike: monster teleports to target position
    if (special === 'flash') {
      const oldCol = mon.gridCol;
      mon.gridCol = Math.max(1, target.gridCol - 1);
      this.fightLog.push({ text: `⚡ ${mon.emoji} ${mon.name} chớp nhoáng đến gần ${target.emoji}!`, type: 'buff' });
    }

    // Knockback: push target away
    if (special === 'knockback') {
      const dir = target.gridCol > mon.gridCol ? 3 : -3;
      target.gridCol = Math.max(1, Math.min(35, target.gridCol + dir));
      this.fightLog.push({ text: `💨 ${mon.emoji} ${mon.name} đẩy lùi ${target.emoji}!`, type: 'buff' });
    }

    if (mon.isBoss && !forceUse) {
      this.onAttackAnim?.(mon.id, target.id, 0, false, skill.anim || 'taunt', 'monster', animIsUltimate);
    }

    // Calculate damage
    const petDef = target.def + (target.armor?.def || 0) * (1 + (target.armor?.enhanceLevel || 0) * 0.1);
    let dmg = Math.max(1, Math.floor((monAtk * (0.3 + Math.random() * 0.3) * mul - Math.floor(petDef * 0.3)) * elemMul * bossMul));

    // Shield reduction
    if (this.hasShield(target.id)) {
      const shieldReduce = EFFECTS.shield.dmgReduction || 0.4;
      dmg = Math.max(1, Math.floor(dmg * (1 - shieldReduce)));
      this.fightLog.push({ text: `🛡️ Khiên băng của ${target.name} giảm ${Math.floor(shieldReduce * 100)}% sát thương!`, type: 'effect' });
    }

    // Apply damage to target(s)
    const alivePets = this.getBattlePets().filter(p => p.hp > 0);

    if (special === 'dash') {
      const dashCol = clamp(target.gridCol - 1, 8, 33);
      mon.gridCol = dashCol;
      mon.gridRow = clamp(target.gridRow + (Math.random() < 0.5 ? -1 : 1), 2, 11);
      target.hp = Math.max(0, target.hp - dmg);
      this.fightLog.push({ text: `⚡ ${mon.emoji} ${skill.name}! → ${target.emoji} -${dmg}`, type: 'buff' });
      if (this.onAttackAnim) this.onAttackAnim(mon.id, target.id, dmg, false, skill.anim || 'dash_strike', 'monster', animIsUltimate);
      if (target.hp <= 0) this.onPetDied(target);
    }
    // Stomp: ground crack AoE hits all pets
    else if (special === 'stomp') {
      const stompDmg = Math.floor(dmg * 0.6);
      for (const pet of alivePets) {
        if (pet.id === target.id) {
          pet.hp = Math.max(0, pet.hp - dmg);
          this.fightLog.push({ text: `💥 ${mon.emoji} ${skill.name}! → ${pet.emoji} -${dmg}`, type: 'buff' });
          if (this.onAttackAnim) this.onAttackAnim(mon.id, pet.id, dmg, false, skill.anim || 'earthquake', 'monster', animIsUltimate);
        } else {
          const distDmg = Math.floor(stompDmg * (1 - Math.random() * 0.3));
          pet.hp = Math.max(0, pet.hp - distDmg);
          const knockDir = pet.gridCol > mon.gridCol ? 1 : -1;
          pet.gridCol = clamp(pet.gridCol + knockDir, 1, 35);
          pet.gridRow = clamp(pet.gridRow + (Math.random() < 0.5 ? -1 : 1), 2, 11);
          this.fightLog.push({ text: `🌊 ${mon.emoji} chấn động! → ${pet.emoji} -${distDmg}`, type: 'damage' });
          if (this.onAttackAnim) this.onAttackAnim(mon.id, pet.id, distDmg, false, 'earthquake', 'monster', animIsUltimate);
        }
        if (pet.hp <= 0) this.onPetDied(pet);
      }
    }
    // Meteor storm: multi-hit on all pets
    else if (special === 'meteor') {
      for (let hit = 0; hit < 3; hit++) {
        const randomPet = alivePets[Math.floor(Math.random() * alivePets.length)];
        if (!randomPet || randomPet.hp <= 0) continue;
        const hitDmg = Math.floor(dmg * (0.45 + Math.random() * 0.25));
        randomPet.hp = Math.max(0, randomPet.hp - hitDmg);
        this.fightLog.push({ text: `☄️ ${skill.name}! → ${randomPet.emoji} -${hitDmg}`, type: 'damage' });
        if (this.onAttackAnim) this.onAttackAnim(mon.id, randomPet.id, hitDmg, false, skill.anim || 'meteor_storm', 'monster', animIsUltimate);
        if (randomPet.hp <= 0) this.onPetDied(randomPet);
        }
        this.scheduleUpdate();
    }
    else if (special === 'volcano_wave') {
      for (const pet of alivePets) {
        const petDmg = pet.id === target.id ? dmg : Math.floor(dmg * 0.7);
        pet.hp = Math.max(0, pet.hp - petDmg);
        if (Math.random() < 0.65) this.addPetEffect(pet.id, 'burn', 3);
        this.fightLog.push({ text: `🔥 ${mon.emoji} ${skill.name}! → ${pet.emoji} -${petDmg}`, type: 'buff' });
        if (this.onAttackAnim) this.onAttackAnim(mon.id, pet.id, petDmg, false, skill.anim || 'inferno', 'monster', animIsUltimate);
        if (pet.hp <= 0) this.onPetDied(pet);
      }
    }
    else if (special === 'crystal_spike') {
      target.hp = Math.max(0, target.hp - dmg);
      if (Math.random() < 0.45) this.addPetEffect(target.id, 'freeze', 1);
      this.fightLog.push({ text: `❄️ ${mon.emoji} ${skill.name}! → ${target.emoji} -${dmg}`, type: 'buff' });
      if (this.onAttackAnim) this.onAttackAnim(mon.id, target.id, dmg, false, skill.anim || 'blizzard', 'monster', animIsUltimate);
      if (target.hp <= 0) this.onPetDied(target);
    }
    else if (special === 'vine_barrage') {
      const victims = [target, ...alivePets.filter(p => p.id !== target.id).slice(0, 1)];
      for (const pet of victims) {
        if (!pet || pet.hp <= 0) continue;
        const petDmg = Math.floor(dmg * (pet.id === target.id ? 1 : 0.65));
        pet.hp = Math.max(0, pet.hp - petDmg);
        if (Math.random() < 0.55) this.addPetEffect(pet.id, 'root', 2);
        this.fightLog.push({ text: `🌿 ${mon.emoji} ${skill.name}! → ${pet.emoji} -${petDmg}`, type: 'buff' });
        if (this.onAttackAnim) this.onAttackAnim(mon.id, pet.id, petDmg, false, skill.anim || 'vine', 'monster', animIsUltimate);
        if (pet.hp <= 0) this.onPetDied(pet);
      }
    }
    else if (special === 'thunder_arc') {
      const victims = [target, ...alivePets.filter(p => p.id !== target.id).slice(0, 1)];
      for (const pet of victims) {
        if (!pet || pet.hp <= 0) continue;
        const petDmg = Math.floor(dmg * (pet.id === target.id ? 1 : 0.75));
        pet.hp = Math.max(0, pet.hp - petDmg);
        if (Math.random() < 0.4) this.addPetEffect(pet.id, 'stun', 1);
        this.fightLog.push({ text: `⚡ ${mon.emoji} ${skill.name}! → ${pet.emoji} -${petDmg}`, type: 'buff' });
        if (this.onAttackAnim) this.onAttackAnim(mon.id, pet.id, petDmg, false, skill.anim || 'thunder', 'monster', animIsUltimate);
        if (pet.hp <= 0) this.onPetDied(pet);
      }
    }
    else if (special === 'shadow_burst') {
      for (const pet of alivePets) {
        const petDmg = pet.id === target.id ? dmg : Math.floor(dmg * 0.6);
        pet.hp = Math.max(0, pet.hp - petDmg);
        if (Math.random() < 0.7) this.addPetEffect(pet.id, 'poison', 3);
        this.fightLog.push({ text: `☠️ ${mon.emoji} ${skill.name}! → ${pet.emoji} -${petDmg}`, type: 'buff' });
        if (this.onAttackAnim) this.onAttackAnim(mon.id, pet.id, petDmg, false, skill.anim || 'curse', 'monster', animIsUltimate);
        if (pet.hp <= 0) this.onPetDied(pet);
      }
    }
    else if (special === 'aurora_surge') {
      for (const pet of alivePets) {
        const petDmg = pet.id === target.id ? dmg : Math.floor(dmg * 0.55);
        pet.hp = Math.max(0, pet.hp - petDmg);
        if (Math.random() < 0.55) this.addPetEffect(pet.id, 'slow', 2);
        this.fightLog.push({ text: `🌈 ${mon.emoji} ${skill.name}! → ${pet.emoji} -${petDmg}`, type: 'buff' });
        if (this.onAttackAnim) this.onAttackAnim(mon.id, pet.id, petDmg, false, skill.anim || 'blizzard', 'monster', animIsUltimate);
        if (pet.hp <= 0) this.onPetDied(pet);
      }
    }
    else if (special === 'earth_split') {
      for (const pet of alivePets) {
        const petDmg = pet.id === target.id ? dmg : Math.floor(dmg * 0.65);
        pet.hp = Math.max(0, pet.hp - petDmg);
        const knockDir = pet.gridCol > mon.gridCol ? 1 : -1;
        pet.gridCol = clamp(pet.gridCol + knockDir, 1, 35);
        pet.gridRow = clamp(pet.gridRow + (Math.random() < 0.5 ? -1 : 1), 2, 11);
        if (Math.random() < 0.4) this.addPetEffect(pet.id, 'stun', 1);
        this.fightLog.push({ text: `🪨 ${mon.emoji} ${skill.name}! → ${pet.emoji} -${petDmg}`, type: 'buff' });
        if (this.onAttackAnim) this.onAttackAnim(mon.id, pet.id, petDmg, false, skill.anim || 'earthquake', 'monster', animIsUltimate);
        if (pet.hp <= 0) this.onPetDied(pet);
      }
    }
    else if (special === 'tidal_rush') {
      for (const pet of alivePets) {
        const petDmg = pet.id === target.id ? dmg : Math.floor(dmg * 0.6);
        pet.hp = Math.max(0, pet.hp - petDmg);
        if (Math.random() < 0.5) this.addPetEffect(pet.id, 'slow', 2);
        this.fightLog.push({ text: `🌊 ${mon.emoji} ${skill.name}! → ${pet.emoji} -${petDmg}`, type: 'buff' });
        if (this.onAttackAnim) this.onAttackAnim(mon.id, pet.id, petDmg, false, skill.anim || 'water', 'monster', animIsUltimate);
        if (pet.hp <= 0) this.onPetDied(pet);
      }
    }
    else if (special === 'ice_rain') {
      const rainDmg = Math.floor(dmg * 0.65);
      for (const pet of alivePets) {
        const petDmg = pet.id === target.id ? dmg : Math.floor(rainDmg * (0.8 + Math.random() * 0.2));
        pet.hp = Math.max(0, pet.hp - petDmg);
        if (Math.random() < 0.55) this.addPetEffect(pet.id, 'freeze', 1);
        this.fightLog.push({ text: `❄️ ${mon.emoji} ${skill.name}! → ${pet.emoji} -${petDmg}`, type: 'buff' });
        if (this.onAttackAnim) this.onAttackAnim(mon.id, pet.id, petDmg, false, skill.anim || 'ice_rain', 'monster', animIsUltimate);
        if (pet.hp <= 0) this.onPetDied(pet);
      }
    }
    else if (special === 'tornado') {
      for (const pet of alivePets) {
        const petDmg = pet.id === target.id ? dmg : Math.floor(dmg * 0.55);
        pet.hp = Math.max(0, pet.hp - petDmg);
        const knockDir = pet.gridCol > mon.gridCol ? 1 : -1;
        pet.gridCol = clamp(pet.gridCol + knockDir, 1, 35);
        pet.gridRow = clamp(pet.gridRow + (Math.random() < 0.5 ? -1 : 1), 2, 11);
        this.fightLog.push({ text: `🌪️ ${mon.emoji} ${skill.name}! → ${pet.emoji} -${petDmg}`, type: 'buff' });
        if (this.onAttackAnim) this.onAttackAnim(mon.id, pet.id, petDmg, false, skill.anim || 'whirlwind', 'monster', animIsUltimate);
        if (pet.hp <= 0) this.onPetDied(pet);
      }
    }
    else if (special === 'poison_spider') {
      for (const pet of alivePets) {
        const petDmg = pet.id === target.id ? dmg : Math.floor(dmg * 0.5);
        pet.hp = Math.max(0, pet.hp - petDmg);
        if (Math.random() < 0.7) this.addPetEffect(pet.id, 'poison', 3);
        this.fightLog.push({ text: `🕷️ ${mon.emoji} ${skill.name}! → ${pet.emoji} -${petDmg}`, type: 'damage' });
        if (this.onAttackAnim) this.onAttackAnim(mon.id, pet.id, petDmg, false, skill.anim || 'poison_web', 'monster', animIsUltimate);
        if (pet.hp <= 0) this.onPetDied(pet);
      }
    }
    // AoE skill: hit all enemies
    else if (skill.aoe) {
      const aoeMul = 0.6;
      for (const pet of alivePets) {
        const petDmg = pet.id === target.id ? dmg : Math.floor(dmg * aoeMul * (0.8 + Math.random() * 0.2));
        pet.hp = Math.max(0, pet.hp - petDmg);
        this.fightLog.push({ text: `🌟 ${mon.emoji} ${skill.name}! → ${pet.emoji} -${petDmg}`, type: 'buff' });
        if (this.onAttackAnim) this.onAttackAnim(mon.id, pet.id, petDmg, false, skill.anim || 'fireball', 'monster', animIsUltimate);
        if (pet.hp <= 0) this.onPetDied(pet);
      }
    }
    // Single-target skill
    else {
      target.hp = Math.max(0, target.hp - dmg);
      this.fightLog.push({ text: `🌟 ${mon.emoji} ${skill.name}! → ${target.emoji} -${dmg}`, type: 'buff' });
      if (this.onAttackAnim) this.onAttackAnim(mon.id, target.id, dmg, false, skill.anim || 'fireball', 'monster', animIsUltimate);
      if (target.hp <= 0) this.onPetDied(target);
    }

    // Apply skill effect to target(s)
    if (skill.effect && Math.random() < (skill.effectChance || 0.3)) {
      const effDef = EFFECTS[skill.effect];
      const effName = effDef?.name || skill.effect;
      const duration = effDef?.duration || 2;
      if (skill.effect !== 'shield') {
        this.addPetEffect(target.id, skill.effect, duration);
        if (special === 'stomp' || skill.aoe) {
          for (const pet of this.getBattlePets().filter(p => p.id !== target.id && p.hp > 0)) {
            if (Math.random() < (skill.effectChance || 0.3) * 0.5) {
              this.addPetEffect(pet.id, skill.effect, Math.floor(duration * 0.6));
            }
          }
        }
      }
      this.fightLog.push({ text: `${ELEMENTS[atkElem]?.icon || ''} ${target.emoji} ${target.name} bị ${effName}!`, type: 'effect' });
    }
  }

  petAttackMonster(pet, monster) {
    // Monster dodge
    if (this.checkDodge(monster, pet.spd || 6)) {
      this.fightLog.push({ text: `💨 ${monster.emoji} ${monster.name} né đòn của ${pet.emoji}!`, type: 'buff' });
      if (this.onAttackAnim) this.onAttackAnim(pet.id, monster.id, 0, false, 'dodge');
      return;
    }

    const role = getPetRole(pet.baseId);
    const atkPower = pet.atk + (pet.weapon?.atk || 0) * (1 + (pet.weapon?.enhanceLevel || 0) * 0.1);
    const defPower = monster.def || 0;
    const atkElem = getPetElement(pet.baseId);
    const defElem = monster.element || 'fire';
    const elemMul = getElementAdvantage(atkElem, defElem);
    const dmg = Math.max(1, Math.floor((atkPower * (0.3 + Math.random() * 0.35) - Math.floor(defPower * 0.4)) * elemMul));
    monster.hp = Math.max(0, monster.hp - dmg);
    pet.totalBattles++;
    const crit = Math.random() < 0.08 + (role.id === 'ranged' ? 0.05 : 0);
    const finalDmg = crit ? Math.floor(dmg * 1.5) : dmg;
    monster.hp = Math.max(0, monster.hp - (finalDmg - dmg));
    let elemIcon = '';
    if (elemMul > 1) elemIcon = '✨';
    else if (elemMul < 1) elemIcon = '🔽';
    const text = crit
      ? `💥 ${pet.emoji} chí mạng ${monster.emoji} -${finalDmg}!${elemIcon}`
      : `${pet.emoji} đánh ${monster.emoji} -${finalDmg}${elemIcon}`;
    this.fightLog.push({ text, type: 'damage' });
    this.tryApplyMonsterEffect(pet, monster, false);
    pet.displaySkill = role.skills[0]?.name || 'Đánh thường';
    if (this.onAttackAnim) {
      this.onAttackAnim(pet.id, monster.id, finalDmg, crit, role.skills[0]?.anim || 'slash', role.id, elemMul > 1);
    }
    if (monster.hp <= 0) {
      monster.dead = true;
      this.onMonsterKilled(pet, monster);
    }
  }

  tryApplyMonsterEffect(pet, monster, isUltimate) {
    const element = getPetElement(pet.baseId);
    const elemSkills = ELEMENT_SKILLS[element];
    if (!elemSkills || elemSkills.length === 0) return;
    const skill = elemSkills[Math.floor(Math.random() * elemSkills.length)];
    if (skill.effect && Math.random() < (skill.effectChance || 0.3)) {
      const effName = EFFECTS[skill.effect]?.name || skill.effect;
      const effIcon = EFFECTS[skill.effect]?.icon || '';
      const bonus = pet.getSkillMasteryBonus(skill.id || skill.name);
      const duration = (EFFECTS[skill.effect]?.duration || 2) + bonus;
      if (skill.effect !== 'shield') {
        this.addMonsterEffect(monster, skill.effect, duration);
      }
      this.fightLog.push({ text: `${ELEMENTS[element]?.icon || ''} ${monster.emoji} ${monster.name} bị ${effIcon} ${effName}!`, type: 'effect' });
    }
  }

  selectMonsterTarget(alivePets, monster) {
    if (this.command === 'retreat') {
      if (Math.random() < 0.3) return null;
    }
    const candidates = alivePets.filter(p => p.hp > 0 && !p.dead);
    if (candidates.length === 0) return null;

    if (monster?.isBoss) {
      const bossTarget = candidates.slice().sort((a, b) => this.getBossTargetScore(monster, b) - this.getBossTargetScore(monster, a))[0];
      if (bossTarget) return bossTarget;
    }

    // Normal monsters: ưu tiên pet gần nhất (khoảng cách là yếu tố chính)
    const sorted = candidates.slice().sort((a, b) => {
      const distA = this.gridDist(monster, a);
      const distB = this.gridDist(monster, b);
      if (distA !== distB) return distA - distB;
      return this.getPetThreatScore(b) - this.getPetThreatScore(a);
    });
    return sorted[0] || candidates[Math.floor(Math.random() * candidates.length)];
  }

  checkDodge(defender, attackerSpeed) {
    const spd = defender.spd || 5;
    const baseChance = 0.05 + Math.max(0, (spd - attackerSpeed) * 0.005);
    return Math.random() < Math.min(0.4, baseChance);
  }

  monsterAttackPet(monster, pet) {
    // Dodge check (pet tries to dodge monster attack)
    if (this.checkDodge(pet, monster.spd || 8)) {
      this.fightLog.push({ text: `💨 ${pet.emoji} ${pet.name} né đòn của ${monster.emoji}!`, type: 'buff' });
      if (this.onAttackAnim) {
        this.onAttackAnim(monster.id, pet.id, 0, false, 'dodge');
      }
      return;
    }

    // Armor dodge check
    if (pet.armor && pet.armor.dodge && Math.random() < pet.armor.dodge) {
      this.fightLog.push({ text: `🛡️ ${pet.emoji} ${pet.name} né nhờ giáp!`, type: 'buff' });
      if (this.onAttackAnim) {
        this.onAttackAnim(monster.id, pet.id, 0, false, 'dodge');
      }
      return;
    }

    const monAtk = monster.atk || 15;
    const petDef = pet.def + (pet.armor?.def || 0) * (1 + (pet.armor?.enhanceLevel || 0) * 0.1);
    const atkElem = monster.element || 'fire';
    const defElem = getPetElement(pet.baseId);
    const elemMul = getElementAdvantage(atkElem, defElem);
    const bossMul = monster.isBoss
      ? (monster.bossRole === 'tank' ? 1.2 : monster.bossRole === 'magic' ? 1.45 : monster.bossRole === 'ranged' ? 1.35 : 1.3)
      : 1;
    const attackSpeedMul = monster.isBoss ? 1.35 : 1;
    let dmg = Math.max(1, Math.floor((monAtk * (0.3 + Math.random() * 0.35) - Math.floor(petDef * 0.35)) * elemMul * bossMul * attackSpeedMul));

    // Shield reduction
    if (this.hasShield(pet.id)) {
      const shieldReduce = EFFECTS.shield.dmgReduction || 0.4;
      dmg = Math.max(1, Math.floor(dmg * (1 - shieldReduce)));
      this.fightLog.push({ text: `🛡️ Khiên băng của ${pet.name} giảm ${Math.floor(shieldReduce * 100)}% sát thương!`, type: 'effect' });
    }

    pet.hp = Math.max(0, pet.hp - dmg);
    let elemIcon = '';
    if (elemMul > 1) elemIcon = '✨';
    else if (elemMul < 1) elemIcon = '🔽';
    const text = `${monster.emoji} đánh ${pet.emoji} -${dmg}${elemIcon}`;
    this.fightLog.push({ text, type: 'damage' });
    monster.displaySkill = monster.monsterSkill?.name || 'Đánh thường';
    if (this.onAttackAnim) {
      const visual = monster.isBoss ? 'boss_hit' : 'monster_hit';
      const color = monster.isBoss ? '#FF6B35' : '#FFD166';
      this.onAttackAnim(monster.id, pet.id, dmg, false, visual, 'monster', monster.isBoss);
      if (monster.isBoss && this.onUpdate) this.onUpdate();
    }
    // Apply monster auto-attack effect
    if (monster.monsterSkill && monster.monsterSkill.effect && Math.random() < (monster.monsterSkill.effectChance || 0.3)) {
      const effDef = EFFECTS[monster.monsterSkill.effect];
      const effName = effDef?.name || monster.monsterSkill.effect;
      const duration = effDef?.duration || 2;
      if (monster.monsterSkill.effect !== 'shield') {
        this.addPetEffect(pet.id, monster.monsterSkill.effect, duration);
      }
      this.fightLog.push({ text: `${ELEMENTS[atkElem]?.icon || ''} ${pet.emoji} ${pet.name} bị ${effName}!`, type: 'effect' });
    } else if (!monster.isBoss && monster.isMonster && Math.random() < 0.065) {
      this.addPetEffect(pet.id, 'knockback', 1);
      this.fightLog.push({ text: `💨 ${pet.emoji} ${pet.name} bị đẩy lùi!`, type: 'effect' });
    }
    if (pet.hp <= 0) {
      pet.dead = true;
      this.onPetDied(pet);
    }
  }

  onMonsterKilled(pet, monster) {
    const isBoss = monster.isBoss || false;
    const tierIdx = monster._bossTierIdx || 0;
    const expGain = Math.floor(monster.level * 3 + (monster.tier || 1) * 10 * (tierIdx + 1));
    const bonusExp = Math.floor(expGain * (0.8 + Math.random() * 0.4));
    const leveled = pet.addExp(bonusExp);
    pet.wins++;
    this.totalKills++;

    this.fightLog.push({ text: `💀 ${monster.name} bị tiêu diệt! +${bonusExp} EXP`, type: 'victory' });

    if (leveled) {
      this.fightLog.push({ text: `🎉 ${pet.emoji} ${pet.name} lên cấp ${pet.level}!`, type: 'system' });
      if (this.onLevelUp) this.onLevelUp(pet);
    }

    // Gold drop (increase for higher tier bosses)
    const goldMul = tierIdx > 0 ? tierIdx * 2 : 1;
    const gold = Math.floor((monster.level * 3 + Math.random() * monster.level * 2) * goldMul);
    this.player.addGold(gold);

    // Boss bonus + kill tracking
    if (isBoss) {
      this.bossKillCount++;
      const diamondDrop = (3 + Math.floor(Math.random() * 8)) * (tierIdx + 1);
      this.player.addDiamond(diamondDrop);
      this.fightLog.push({ text: `💎 Nhặt được ${diamondDrop} ruby từ boss! (Tổng boss: ${this.bossKillCount})`, type: 'system' });

      // Notify when boss tier threshold reached
      for (const bt of BOSS_TIERS) {
        if (bt.killsRequired > 0 && this.bossKillCount === bt.killsRequired) {
          this.fightLog.push({ text: `⚡ ${bt.title} Mở khóa cấp boss: ${bt.name}!`, type: 'system' });
        }
      }
    }

    // Item / food / bath drop
    const roll = Math.random();
    const tierBonus = (monster.tier || 1) * 0.01;
    if (roll < 0.04 + tierBonus) {
      const foodPool = DATA.ITEMS.food;
      const food = foodPool[Math.floor(Math.random() * foodPool.length)];
      this.player.addItem('food', food);
      this.fightLog.push({ text: `🥩 Nhặt được ${food.name}!`, type: 'system' });
    } else if (roll < 0.06 + tierBonus) {
      const bathPool = DATA.ITEMS.bath;
      const bath = bathPool[Math.floor(Math.random() * bathPool.length)];
      this.player.addItem('bath', bath);
      this.fightLog.push({ text: `🧴 Nhặt được ${bath.name}!`, type: 'system' });
    } else if (roll < 0.08 + tierBonus) {
      const weaponPool = DATA.EQUIPMENT.weapons;
      const template = weaponPool[Math.floor(Math.random() * Math.min(weaponPool.length, (monster.tier || 1) + 1))];
      if (template) {
        const item = generateWeaponItem(template);
        this.player.addWeapon(item);
        this.fightLog.push({ text: `📦 Nhặt được ${item.name} (ATK:${item.atk})!`, type: 'system' });
      }
    } else if (roll < 0.10 + tierBonus) {
      const armorPool = DATA.EQUIPMENT.armors;
      const template = armorPool[Math.floor(Math.random() * Math.min(armorPool.length, (monster.tier || 1) + 1))];
      if (template) {
        const item = generateArmorItem(template);
        this.player.addArmor(item);
        this.fightLog.push({ text: `📦 Nhặt được ${item.name} (DEF:${item.def})!`, type: 'system' });
      }
    }
  }

  onPetDied(pet) {
    this.deathCount++;
    const penalty = 0.05 + Math.random() * 0.05;
    const lost = Math.floor(pet.level * penalty);
    pet.level = Math.max(1, pet.level - lost);
    pet.hp = 0;
    pet.dead = true;
    pet.losses++;
    this.fightLog.push({ text: `💔 ${pet.emoji} ${pet.name} chết! Mất ${lost} cấp.`, type: 'defeat' });

    const idx = this.fieldPetIds.indexOf(pet.id);
    if (idx !== -1) this.fieldPetIds.splice(idx, 1);
    this.updateReserve();

    const reserve = this.getReservePets();
    if (reserve.length > 0) {
      const fresh = reserve[0];
      this.fieldPetIds.push(fresh.id);
      fresh.resetBattleEnergy();
      const reserveIdx = this.reservePetIds.indexOf(fresh.id);
      if (reserveIdx !== -1) this.reservePetIds.splice(reserveIdx, 1);
      this.assignPetGrid(fresh, this.fieldPetIds.length - 1);
      this.fightLog.push({ text: `🔄 ${fresh.emoji} ${fresh.name} vào sân thay thế!`, type: 'system' });
    }

    if (this.onPetDeath) this.onPetDeath(pet, lost);
  }

  revivePet(petId) {
    const pet = this.player.getPet(petId);
    if (!pet || !pet.dead) return false;
    pet.dead = false;
    pet.hp = Math.floor(pet.maxHp * 0.25);
    this.fightLog.push({ text: `💚 ${pet.emoji} ${pet.name} hồi sinh!`, type: 'system' });
    return true;
  }

  reviveAll() {
    let count = 0;
    for (const pet of this.player.pets) {
      if (pet.dead) {
        if (this.revivePet(pet.id)) count++;
      }
    }
    return count;
  }

  // ===== BOT PLAYER =====
  addBot() {
    if (this.botPlayers.length >= 3) return;
    const botNames = ['Alex', 'Luna', 'Max', 'Mia', 'Leo', 'Zara', 'Kai', 'Nina', 'Tina', 'Jake'];
    const team = this.getBattlePets();
    const avgLvl = team.length > 0
      ? Math.floor(team.reduce((s, p) => s + p.level, 0) / team.length)
      : 5;

    const botName = botNames[Math.floor(Math.random() * botNames.length)];
    const petTypes = Object.keys(DATA.PET_TYPES);
    const botPets = [];
    const botIndex = this.botPlayers.length;
    const baseCol = 12 + botIndex;
    for (let i = 0; i < 3; i++) {
      const type = petTypes[Math.floor(Math.random() * petTypes.length)];
      const list = DATA.PET_TYPES[type].list;
      const template = list[Math.floor(Math.random() * list.length)];
      const lvl = Math.max(1, avgLvl + Math.floor(Math.random() * 5) - 2);
      const pet = Pet.fromJSON({
        baseId: template.id,
        name: template.name + ' (' + botName + ')',
        emoji: template.emoji,
        desc: template.desc,
        type: type,
        level: 1,
        owner: 'bot'
      });
      // Scale stats to target level
      const targetLvl = lvl;
      while (pet.level < targetLvl) {
        pet.exp = pet.expToNext;
        pet.addExp(0);
      }
      pet.hp = pet.maxHp;
      pet.dead = false;
      pet.isBot = true;
      pet.gridCol = baseCol + i;
      pet.gridRow = 7;
      botPets.push(pet);
    }

    const playerCostume = DATA.COSTUMES.find(c => c.id === this.player.costume) || DATA.COSTUMES[0];
    this.botPlayers.push({
      name: botName,
      emoji: playerCostume.emoji,
      costume: playerCostume,
      pets: botPets,
      character: {
        id: 'bot_char_' + botIndex,
        name: botName,
        emoji: playerCostume.emoji,
        costume: playerCostume,
        gridCol: baseCol,
        gridRow: 7,
        hp: 999,
        maxHp: 999,
        dead: false,
        isBotCharacter: true,
        isBot: true
      }
    });
    this.fightLog.push({ text: `🤝 ${botName} tham gia map!`, type: 'system' });
    this.scheduleUpdate();
  }

  getBotPets() {
    return this.botPlayers.flatMap(bp => bp.pets.filter(p => !p.dead && p.hp > 0));
  }

  getBotCharacters() {
    return this.botPlayers.map(bp => bp.character).filter(Boolean);
  }
}

// Sync methods for online map data — added via prototype
WorldMap.prototype.syncOnlinePlayers = function(players) {
  this.onlinePlayers = players || [];
  this.scheduleUpdate();
};
WorldMap.prototype.syncOnlineMonsters = function(monsters) {
  this.onlineMonsters = monsters || [];
  this.scheduleUpdate();
};
WorldMap.prototype.syncOnlineResources = function(resources) {
  this.onlineResources = resources || [];
  this.scheduleUpdate();
};
