class BattleEngine {
  constructor() {
    this.reset();
    this.onUpdate = null;
    this.onEnd = null;
  }

  reset() {
    this.state = 'idle';
    this.turn = 0;
    this.maxTurns = 50;
    this.team1 = [];
    this.team2 = [];
    this.buffs1 = {};
    this.buffs2 = {};
    this.effects1 = {};  // { petId: [StatusEffect, ...] }
    this.effects2 = {};
    this.summon1 = [];   // summoned entities for team1 (wood element)
    this.summon2 = [];
    this.log = [];
    this.winner = null;
    this.isPvP = false;
    this.isBoss = false;
  }

  start(team1, team2, isPvP = false, isBoss = false) {
    this.reset();
    this.isPvP = isPvP;
    this.isBoss = isBoss;
    this.team1 = team1.map(p => this.clonePet(p));
    this.team2 = team2.map(p => this.clonePet(p));
    this.buffs1 = {};
    this.buffs2 = {};
    this.effects1 = {};
    this.effects2 = {};
    this.summon1 = [];
    this.summon2 = [];
    this.state = 'fighting';
    this.log = [{ text: '⚔️ Trận chiến bắt đầu!', type: 'system' }];
  }

  clonePet(pet) {
    const d = pet.toJSON();
    const clone = Pet.fromJSON(d);
    clone.hp = clone.maxHp;
    clone.element = getPetElement(clone.baseId);
    clone.storedDef = clone.def; // for buff tracking
    return clone;
  }

  getAlive(team) {
    return team.filter(p => p.hp > 0);
  }

  // ===== HIỆU ỨNG TRẠNG THÁI =====
  getEffects(teamId) {
    return teamId === 1 ? this.effects1 : this.effects2;
  }

  getEffectsFor(teamId, petId) {
    const map = this.getEffects(teamId);
    return map[petId] || [];
  }

  addEffect(teamId, petId, effectType, duration, stacks = 1) {
    const map = this.getEffects(teamId);
    if (!map[petId]) map[petId] = [];
    const existing = map[petId].find(e => e.type === effectType);
    if (existing) {
      existing.stacks = Math.min(existing.stacks + stacks, existing.def.maxStacks || 99);
      existing.duration = Math.max(existing.duration, duration);
    } else if (map[petId].length < 2) {
      map[petId].push(new StatusEffect(effectType, duration, stacks));
    }
  }

  processEffects(teamId, team) {
    const map = this.getEffects(teamId);
    // Determine the enemy team for summon attacks
    const enemyTeam = teamId === 1 ? this.team2 : this.team1;
    const enemyAlive = this.getAlive(enemyTeam);

    for (const pet of team) {
      if (pet.hp <= 0) continue;
      const effects = map[pet.id] || [];
      for (const eff of effects) {
        // Process DOT (burn, poison)
        if (eff.def.dotPct) {
          const dotDmg = eff.applyDot(pet.maxHp);
          if (dotDmg > 0) {
            pet.hp = Math.max(0, pet.hp - dotDmg);
            this.log.push({ text: `${eff.def.icon} ${pet.emoji} ${pet.name} chịu ${dotDmg} sát thương từ ${eff.def.name}`, type: 'damage' });
          }
        }
        // Process summon (wood - cây triệu hồi tấn công kẻ địch)
        if (eff.type === 'summon' && enemyAlive.length > 0) {
          const target = enemyAlive[Math.floor(Math.random() * enemyAlive.length)];
          const summonAtk = Math.floor(pet.atk * (eff.def.dmgMul || 0.6));
          const dmg = Math.max(1, summonAtk + Math.floor(Math.random() * 10));
          target.hp = Math.max(0, target.hp - dmg);
          this.log.push({ text: `🌱 Cây triệu hồi của ${pet.name} đánh ${target.emoji} ${target.name} -${dmg}`, type: 'damage' });
        }
      }
    }
    // Tick effects
    for (const petId of Object.keys(map)) {
      map[petId] = map[petId].filter(e => e.tick());
      if (map[petId].length === 0) delete map[petId];
    }
  }

  canPetAct(teamId, pet) {
    const effects = this.getEffectsFor(teamId, pet.id);
    for (const eff of effects) {
      if (!eff.canAct()) return false;
    }
    if (pet._actionCooldown > 0) return false;
    return true;
  }

  getSpdMul(teamId, pet) {
    const effects = this.getEffectsFor(teamId, pet.id);
    let mul = 1;
    for (const eff of effects) {
      if (eff.def.spdMul !== undefined) mul *= eff.def.spdMul;
    }
    return mul;
  }

  getAtkReduction(teamId, pet) {
    const effects = this.getEffectsFor(teamId, pet.id);
    let reduction = 0;
    for (const eff of effects) {
      reduction += eff.getAtkReduction();
    }
    return Math.min(0.9, reduction);
  }

  getBossDmgReduction(pet) {
    if (pet.isBoss) return 0.3;
    if (pet.isMonster) {
      // Higher tier = more resistance
      const tier = pet.tier || 1;
      return Math.min(0.25, tier * 0.02);
    }
    return 0;
  }

  // ===== BUFF =====
  useBuff(teamId, buff) {
    const team = teamId === 1 ? this.team1 : this.team2;
    const buffs = teamId === 1 ? this.buffs1 : this.buffs2;
    const alive = this.getAlive(team);
    if (alive.length === 0) return false;

    if (buff.type === 'heal') {
      const target = alive[Math.floor(Math.random() * alive.length)];
      const heal = buff.value + Math.floor(Math.random() * 10);
      target.hp = Math.min(target.hp + heal, target.maxHp);
      this.log.push({ text: `❤️ ${target.emoji} ${target.name} hồi ${heal} máu!`, type: 'heal' });
      if (this.onUpdate) this.onUpdate(this);
      return true;
    }

    const target = alive[Math.floor(Math.random() * alive.length)];
    if (!buffs[target.id]) buffs[target.id] = {};
    buffs[target.id][buff.type] = { value: buff.value, turns: buff.turns };
    const names = { atk: '⚡ Tấn công', def: '🛡️ Phòng thủ' };
    this.log.push({ text: `${names[buff.type] || '🔮 Buff'} → ${target.emoji} ${target.name} (${buff.turns} lượt)`, type: 'buff' });
    if (this.onUpdate) this.onUpdate(this);
    return true;
  }

  // ===== MAIN TICK =====
  tick() {
    if (this.state !== 'fighting') return false;
    this.turn++;
    if (this.turn > this.maxTurns) {
      this.state = 'ended';
      this.winner = 'draw';
      this.log.push({ text: '🤝 Hòa! Hết số lượt tối đa.', type: 'system' });
      this.endBattle();
      return true;
    }

    this.log.push({ text: `\n--- Lượt ${this.turn} ---`, type: 'turn' });

    // Năng lượng tự hồi mỗi lượt
    for (const pet of this.team1) { pet.tickEnergy(); pet.addBattleEnergy(3); if (pet._actionCooldown > 0) pet._actionCooldown--; }
    for (const pet of this.team2) { pet.tickEnergy(); pet.addBattleEnergy(3); if (pet._actionCooldown > 0) pet._actionCooldown--; }

    // Hiệu ứng sát thương theo lượt (DOT, triệu hồi)
    this.processEffects(1, this.team1);
    this.processEffects(2, this.team2);

    // Kiểm tra chết sau DOT
    if (this.getAlive(this.team2).length === 0) {
      this.state = 'ended';
      this.winner = 1;
      this.log.push({ text: '🎉 Chiến thắng!', type: 'victory' });
      this.endBattle();
      return true;
    }
    if (this.getAlive(this.team1).length === 0) {
      this.state = 'ended';
      this.winner = 2;
      this.log.push({ text: '💔 Thất bại!', type: 'defeat' });
      this.endBattle();
      return true;
    }

    // Team 1 tấn công
    this.processTeam(this.team1, this.team2, this.buffs1, this.buffs2, 1);
    if (this.getAlive(this.team2).length === 0) {
      this.state = 'ended';
      this.winner = 1;
      this.log.push({ text: '🎉 Chiến thắng!', type: 'victory' });
      this.endBattle();
      return true;
    }

    // Team 2 tấn công
    this.processTeam(this.team2, this.team1, this.buffs2, this.buffs1, 2);
    if (this.getAlive(this.team1).length === 0) {
      this.state = 'ended';
      this.winner = 2;
      this.log.push({ text: '💔 Thất bại!', type: 'defeat' });
      this.endBattle();
      return true;
    }

    this.decayBuffs(this.buffs1);
    this.decayBuffs(this.buffs2);

    if (this.onUpdate) this.onUpdate(this);
    return true;
  }

  processTeam(attackers, defenders, attackBuffs, defendBuffs, teamId) {
    const aliveAttackers = this.getAlive(attackers)
      .filter(a => this.canPetAct(teamId, a))
      .sort((a, b) => {
        const spdA = a.spd * this.getSpdMul(teamId, a);
        const spdB = b.spd * this.getSpdMul(teamId, b);
        return spdB - spdA;
      });
    const aliveDefenders = this.getAlive(defenders);

    for (const attacker of aliveAttackers) {
      if (aliveDefenders.length === 0) break;
      const defender = aliveDefenders[Math.floor(Math.random() * aliveDefenders.length)];

      // Tính sát thương cơ bản
      let dmg = attacker.atk + (attacker.weapon?.atk || 0);
      if (attackBuffs[attacker.id]?.atk) dmg = Math.floor(dmg * attackBuffs[attacker.id].atk.value);
      const actionSpeed = attacker.getBattleSpeedMultiplier ? attacker.getBattleSpeedMultiplier() : 1;
      dmg = Math.floor(dmg * actionSpeed);

      // Giảm sát thương từ hiệu ứng trạng thái
      const atkReduction = this.getAtkReduction(teamId, attacker);
      dmg = Math.floor(dmg * (1 - atkReduction));

      const defVal = defender.def + (defender.armor?.def || 0);
      let finalDef = defVal;
      if (defendBuffs[defender.id]?.def) finalDef = Math.floor(defVal * defendBuffs[defender.id].def.value);

      // Tương quan nguyên tố
      const atkElem = getPetElement(attacker.baseId);
      const defElem = getPetElement(defender.baseId);
      const elemMul = getElementAdvantage(atkElem, defElem);
      let damage = Math.max(1, Math.floor((dmg - Math.floor(finalDef * 0.35)) * elemMul));

      // Crit
      const crit = Math.random() < 0.06;
      if (crit) damage = Math.floor(damage * 1.5);

      // Affinity bonus
      const affMod = 1 + (attacker.affinity - 50) / 250;
      damage = Math.floor(damage * affMod);

      // Boss/monster damage reduction
      const dmgReduction = this.getBossDmgReduction(defender);
      if (dmgReduction > 0) {
        damage = Math.max(1, Math.floor(damage * (1 - dmgReduction)));
      }

      // Shield effect damage reduction (ice)
      const defEffects = this.getEffectsFor(teamId === 1 ? 2 : 1, defender.id);
      const shieldEff = defEffects.find(e => e.type === 'shield');
      if (shieldEff && shieldEff.def.dmgReduction) {
        const shieldReduce = shieldEff.def.dmgReduction;
        damage = Math.max(1, Math.floor(damage * (1 - shieldReduce)));
        this.log.push({ text: `🛡️ Khiên băng của ${defender.name} giảm ${Math.floor(shieldReduce * 100)}% sát thương!`, type: 'effect' });
      }

      const baseDelay = 7 + (attacker.isBoss ? 1 : 0) + (attacker.level > 20 ? 1 : 0);
      const speedBonus = Math.floor((attacker.spd || 1) / 55);
      attacker._actionCooldown = Math.max(attacker._actionCooldown || 0, Math.round(baseDelay - Math.min(2, speedBonus)));
      defender.hp = Math.max(0, defender.hp - damage);
      const hpPct = Math.floor(defender.hp / defender.maxHp * 100);

      // Áp dụng hiệu ứng nguyên tố từ attacker
      this.tryApplyElementEffect(attacker, defender, teamId === 1 ? 2 : 1);

      let elemIcon = '';
      if (elemMul > 1) elemIcon = '✨';
      else if (elemMul < 1) elemIcon = '🔽';

      let msg = `${attacker.emoji} ${attacker.name} gây ${damage} sát thương → ${defender.emoji} ${defender.name} (${hpPct}%)${elemIcon}`;
      if (crit) msg = `💥 CHÍ MẠNG! ${msg}`;
      this.log.push({ text: msg, type: 'damage' });
    }
  }

  tryApplyElementEffect(attacker, defender, defTeamId) {
    const element = getPetElement(attacker.baseId);
    const progression = getSkillProgressionForElement(element, attacker.level || 1);
    if (!progression.length) return;

    const skillDef = progression[Math.floor(Math.random() * progression.length)];
    const skill = new Skill(skillDef);
    const effectChance = Math.min(0.3, Math.max(0.06, (skill.effectChance || 0.24) * (0.65 + (attacker.level || 1) * 0.0018)));
    if (skill.effect && Math.random() < effectChance) {
      attacker.recordElementUse(element);
      const bonus = attacker.getElementMasteryBonus(element);
      const duration = (EFFECTS[skill.effect]?.duration || 2) + bonus;
      const stacks = skill.effect === 'poison' || skill.effect === 'burn' ? 1 : 1;
      this.addEffect(defTeamId, defender.id, skill.effect, duration, stacks);
      const effName = EFFECTS[skill.effect]?.name || skill.effect;
      const effIcon = EFFECTS[skill.effect]?.icon || '';
      const bonusTag = bonus > 0 ? ` [+${bonus}]` : '';
      this.log.push({ text: `${ELEMENTS[element]?.icon || ''} ${defender.emoji} ${defender.name} bị ${effIcon} ${effName}!${bonusTag}`, type: 'effect' });
    }
  }

  decayBuffs(buffs) {
    for (const id of Object.keys(buffs)) {
      for (const type of Object.keys(buffs[id])) {
        buffs[id][type].turns--;
        if (buffs[id][type].turns <= 0) delete buffs[id][type];
      }
      if (Object.keys(buffs[id]).length === 0) delete buffs[id];
    }
  }

  endBattle() {
    for (const pet of this.team1) {
      if (pet.hp > 0 && this.winner === 1) {
        const gains = 20 + Math.floor(Math.random() * 30);
        pet.addExp(gains);
      }
    }

    this.state = 'ended';
    if (this.onEnd) this.onEnd(this);
    if (this.onUpdate) this.onUpdate(this);
  }

  getAliveCount(team) {
    return this.getAlive(team).length;
  }

  getSummary() {
    return {
      turn: this.turn,
      winner: this.winner,
      team1Alive: this.getAliveCount(this.team1),
      team2Alive: this.getAliveCount(this.team2),
      log: this.log
    };
  }

  simulateFull() {
    while (this.state === 'fighting') {
      this.tick();
    }
    return this.getSummary();
  }

  autoBattle(playerPets, enemyPets, isPvP = false, isBoss = false) {
    this.start(playerPets, enemyPets, isPvP, isBoss);
    return this.simulateFull();
  }

  static createEnemyPet(level = 1) {
    const types = ['animal', 'mystical', 'robot', 'ice', 'wood'];
    const type = types[Math.floor(Math.random() * types.length)];
    const list = DATA.PET_TYPES[type].list;
    const t = list[Math.floor(Math.random() * list.length)];
    return new Pet({
      baseId: t.id, name: t.name, type, emoji: t.emoji, desc: t.desc,
      level: level + Math.floor(Math.random() * 5) - 2,
      owner: 'enemy'
    });
  }
}

// ===== HỆ THỐNG BOSS =====
class BossSystem {
  static BOSSES = [
    { id: 'boss1', name: 'Trùm Rồng Đen', emoji: '🐉', type: 'mystical', element: 'fire', desc: 'Chúa tể bóng tối', color: '#8B0000' },
    { id: 'boss2', name: 'Trùm Robot Khổng Lồ', emoji: '🤖', type: 'robot', element: 'thunder', desc: 'Cỗ máy hủy diệt', color: '#444488' },
    { id: 'boss3', name: 'Trùm Ma Vương', emoji: '👿', type: 'mystical', element: 'poison', desc: 'Ác quỷ từ địa ngục', color: '#880044' },
    { id: 'boss4', name: 'Trùm Thú Hoang', emoji: '🐻', type: 'animal', element: 'earth', desc: 'Dã thú cổ đại', color: '#886644' },
    { id: 'boss5', name: 'Trùm Băng Đế', emoji: '❄️', type: 'ice', element: 'ice', desc: 'Chúa tể băng giá', color: '#4488AA' },
    { id: 'boss6', name: 'Trùm Mộc Vương', emoji: '🌳', type: 'wood', element: 'wood', desc: 'Vua của rừng xanh', color: '#2E7D32' },
    { id: 'boss7', name: 'Trùm Hỏa Long', emoji: '🐲', type: 'mystical', element: 'fire', desc: 'Rồng lửa hủy diệt', color: '#CC4400' },
    { id: 'boss8', name: 'Trùm Thần Chết', emoji: '💀', type: 'mystical', element: 'poison', desc: 'Tử thần gặt hái', color: '#222222' },
    { id: 'boss9', name: 'Trùm Lôi Thần', emoji: '⚡', type: 'robot', element: 'thunder', desc: 'Chúa tể sấm sét', color: '#444400' },
    { id: 'boss10', name: 'Trùm Vua Quái Vật', emoji: '👾', type: 'robot', element: 'poison', desc: 'Vua của mọi quái vật', color: '#660066' },
  ];

  static createBoss(bossId, playerLevel) {
    const template = this.BOSSES.find(b => b.id === bossId) || this.BOSSES[0];
    const bossLevel = Math.max(playerLevel + 20, Math.floor(playerLevel * 1.5));
    const baseStats = this.calcBossStats(bossLevel);

    const boss = new Pet({
      baseId: template.id,
      name: `${template.emoji} ${template.name}`,
      type: template.type,
      emoji: template.emoji,
      desc: template.desc,
      level: bossLevel,
      atk: baseStats.atk,
      def: baseStats.def,
      spd: baseStats.spd,
      hp: baseStats.hp,
      maxHp: baseStats.hp,
      energy: 999,
      affinity: 100,
      owner: 'boss'
    });
    boss.isBoss = true;
    boss.bossId = bossId;
    boss.element = template.element;
    boss.bossScale = 1.5; // Boss to hơn
    return boss;
  }

  static calcBossStats(level) {
    const scale = 1 + (level - 1) * 0.08;
    return {
      atk: Math.floor(100 * scale + level * 2),
      def: Math.floor(80 * scale + level * 2),
      spd: Math.floor(50 * scale + level),
      hp: Math.floor((800 * scale + level * 15) * 10)
    };
  }

  static createBossTeam(bossId, playerLevel) {
    const boss = this.createBoss(bossId, playerLevel);
    const minions = [
      BattleEngine.createEnemyPet(Math.max(1, Math.floor(playerLevel * 0.8))),
      BattleEngine.createEnemyPet(Math.max(1, Math.floor(playerLevel * 0.9)))
    ];
    return [boss, ...minions];
  }

  static getRandomBoss(playerLevel) {
    const idx = Math.min(Math.floor(playerLevel / 20), this.BOSSES.length - 1);
    if (idx < 0) return this.BOSSES[0];
    return this.BOSSES[idx];
  }

  static getBossRewards(bossLevel) {
    return {
      gold: 800 + bossLevel * 30 + Math.floor(Math.random() * 500),
      diamond: 10 + Math.floor(Math.random() * 15),
      exp: 200 + bossLevel * 10
    };
  }
}

// ===== HỆ THỐNG SINH SẢN =====
class BreedingSystem {
  static canBreed(pet1, pet2) {
    if (pet1.id === pet2.id) return false;
    if (pet1.owner !== pet2.owner) return false;
    return pet1.canBreed() && pet2.canBreed() && pet1.energy >= 50 && pet2.energy >= 50;
  }

  static breed(pet1, pet2) {
    if (!this.canBreed(pet1, pet2)) return null;

    pet1.energy -= 50;
    pet2.energy -= 50;

    const avgAtk = Math.floor((pet1.atk + pet2.atk) / 2);
    const avgDef = Math.floor((pet1.def + pet2.def) / 2);
    const avgSpd = Math.floor((pet1.spd + pet2.spd) / 2);
    const avgHp = Math.floor((pet1.maxHp + pet2.maxHp) / 2);

    const mutation = 0.8 + Math.random() * 0.4;
    const mutAtk = Math.floor(avgAtk * mutation);
    const mutDef = Math.floor(avgDef * mutation);
    const mutSpd = Math.floor(avgSpd * mutation);
    const mutHp = Math.floor(avgHp * mutation);

    const parents = [pet1, pet2];
    const types = Object.keys(DATA.PET_TYPES);
    let childType, childBase;
    if (Math.random() < 0.1) {
      childType = types[Math.floor(Math.random() * types.length)];
    } else {
      childType = parents[Math.random() < 0.5 ? 0 : 1].type;
    }
    const list = DATA.PET_TYPES[childType].list;
    childBase = list[Math.floor(Math.random() * list.length)];

    const child = new Pet({
      baseId: childBase.id,
      name: childBase.name,
      type: childType,
      emoji: childBase.emoji,
      desc: childBase.desc,
      level: 1,
      atk: mutAtk,
      def: mutDef,
      spd: mutSpd,
      hp: mutHp,
      maxHp: mutHp,
      generation: Math.max(pet1.generation, pet2.generation) + 1,
      owner: pet1.owner,
      affinity: 70
    });

    const mutChance = Math.random() * 100;
    if (mutChance < 5) {
      child.atk = Math.floor(child.atk * 1.5);
      child.emoji = '🌟';
      child.name = `${childBase.name} huyền thoại`;
    } else if (mutChance < 15) {
      child.atk = Math.floor(child.atk * 1.2);
    }

    return child;
  }
}
