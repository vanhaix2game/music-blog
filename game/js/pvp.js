class PVPBattle {
  constructor(player) {
    this.player = player;
    this.playerTeam = [];
    this.enemyTeam = [];
    this.running = false;
    this.interval = null;
    this.onEnd = null;
    this.onUpdate = null;
    this.onAttackAnim = null;
    this.tickIntervalMs = 700;
    this.fightLog = [];

    this.petEffects1 = {};
    this.petEffects2 = {};
    this.ccImmunity1 = {};
    this.ccImmunity2 = {};

    this.winner = null;
    this._lastLogKey = '';
  }

  getFormation(roleId, index, side) {
    const formations = {
      tank:     [{ col: 2, row: 5 }, { col: 2, row: 7 }],
      melee:    [{ col: 3, row: 3 }, { col: 4, row: 8 }, { col: 4, row: 5 }],
      ranged:   [{ col: 5, row: 3 }, { col: 5, row: 7 }, { col: 6, row: 5 }],
      magic:    [{ col: 6, row: 4 }, { col: 7, row: 7 }, { col: 7, row: 5 }],
      support:  [{ col: 7, row: 5 }, { col: 8, row: 8 }, { col: 8, row: 4 }],
    };
    const list = formations[roleId] || formations.melee;
    const base = list[index % list.length];
    if (side === 'right') {
      return { col: 26 - base.col, row: base.row };
    }
    return { col: base.col, row: base.row };
  }

  getAlive(team) {
    return team.filter(p => !p.dead && p.hp > 0);
  }

  gridDist(a, b) {
    if (!a || !b) return 999;
    return Math.abs(a.gridCol - b.gridCol);
  }

  _clonePet(pet) {
    const d = pet.toJSON();
    const clone = Pet.fromJSON(d);
    clone.hp = clone.maxHp;
    clone.element = getPetElement(clone.baseId);
    return clone;
  }

  start(playerPets, enemyPets) {
    this.playerTeam = [];
    this.enemyTeam = [];
    this.fightLog = [{ text: '⚔️ Trận PvP bắt đầu!', type: 'system' }];
    this.petEffects1 = {};
    this.petEffects2 = {};
    this.ccImmunity1 = {};
    this.ccImmunity2 = {};
    this.winner = null;

    for (let i = 0; i < playerPets.length; i++) {
      const pet = this._clonePet(playerPets[i]);
      const role = getPetRole(pet.baseId);
      const pos = this.getFormation(role.id, i, 'left');
      pet.gridCol = pos.col;
      pet.gridRow = pos.row;
      pet.resetBattleEnergy();
      this.playerTeam.push(pet);
    }

    for (let i = 0; i < enemyPets.length; i++) {
      const pet = this._clonePet(enemyPets[i]);
      const role = getPetRole(pet.baseId);
      const pos = this.getFormation(role.id, i, 'right');
      pet.gridCol = pos.col;
      pet.gridRow = pos.row;
      pet.resetBattleEnergy();
      this.enemyTeam.push(pet);
    }

    this.running = true;
    this._startLoop();
  }

  stop() {
    this.running = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  pauseExploring() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  resumeExploring() {
    if (this.running && !this.interval) {
      this._startLoop();
    }
  }

  _startLoop() {
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => {
      if (!this.running) {
        clearInterval(this.interval);
        this.interval = null;
        return;
      }
      try {
        this._autoTick();
      } catch (e) {
        console.warn('PVP autoTick error', e);
      }
    }, this.tickIntervalMs);
  }

  _autoTick() {
    const alivePlayers = this.getAlive(this.playerTeam);
    const aliveEnemies = this.getAlive(this.enemyTeam);

    if (alivePlayers.length === 0 || aliveEnemies.length === 0) {
      this._endBattle(alivePlayers.length > 0 ? 1 : 2);
      return;
    }

    for (const pet of alivePlayers) {
      this._processPetAI(pet, alivePlayers, aliveEnemies, 1);
    }

    if (this.getAlive(this.enemyTeam).length === 0) {
      this._endBattle(1);
      return;
    }

    for (const pet of aliveEnemies) {
      this._processPetAI(pet, aliveEnemies, alivePlayers, 2);
    }

    if (this.getAlive(this.playerTeam).length === 0) {
      this._endBattle(2);
      return;
    }

    this._tickEffects();

    if (this.onUpdate) this.onUpdate(this);
  }

  _processPetAI(pet, allies, enemies, teamId) {
    if (pet.hp <= 0 || pet.dead) return;

    pet.addBattleEnergy(12);

    const effs = teamId === 1 ? (this.petEffects1[pet.id] || []) : (this.petEffects2[pet.id] || []);
    for (const e of effs) {
      if (e.def.canAct === false) {
        this.fightLog.push({ text: `💨 ${pet.emoji} bị khống chế, mất lượt!`, type: 'effect' });
        return;
      }
    }

    let target = null;
    let minDist = Infinity;
    for (const e of enemies) {
      const d = this.gridDist(pet, e);
      if (d < minDist) { minDist = d; target = e; }
    }
    if (!target) return;

    const role = getPetRole(pet.baseId);

    if (role.id === 'support') {
      const injured = allies.filter(p => p.id !== pet.id && p.hp < p.maxHp * 0.7);
      if (injured.length > 0 && Math.random() < 0.5) {
        const healSkill = pet.skills.find(s => (s.type === 'heal' || s.healMul > 0) && s.isReady());
        if (healSkill) {
          this._petUseHealSkill(pet, injured[0], healSkill);
          return;
        }
        this._petHealAlly(pet, injured[0]);
        return;
      }
    }

    const desired = this._getPetDesiredPosition(pet, target, allies, role);
    this._movePetTowardPosition(pet, desired.col, desired.row);

    if (pet.battleEnergy >= pet.maxBattleEnergy) {
      const ult = getRoleUltimate(role);
      if (ult) {
        this._petUseSkill(pet, target, ult, allies, enemies, true);
        pet.battleEnergy = 0;
        return;
      }
    }

    const readySkills = pet.skills ? pet.skills.filter(s => s.isReady()) : [];
    if (readySkills.length > 0 && Math.random() < 0.45) {
      const skill = this._selectPetSkill(pet, target, readySkills, enemies);
      if (skill) {
        this._petUseSkill(pet, target, skill, allies, enemies);
        pet.addBattleEnergy(15);
        return;
      }
    }

    const petRange = this._getPetRange(pet);
    if (minDist <= petRange) {
      this._petAttackPet(pet, target, teamId);
      pet.addBattleEnergy(10);
    } else {
      const dir = target.gridCol > pet.gridCol ? 1 : -1;
      pet.gridCol += dir * 2;
      pet.gridCol = Math.max(1, Math.min(28, pet.gridCol));
    }
  }

  _getPetRange(pet) {
    const role = getPetRole(pet.baseId);
    if (role.id === 'tank') return 1;
    if (role.id === 'melee') return 2;
    return 3;
  }

  _getPetDesiredPosition(pet, target, allies, role) {
    const idx = allies.indexOf(pet);
    const targetCol = target.gridCol || 10;
    const targetRow = target.gridRow || 4;

    if (role.id === 'tank') {
      return { col: clamp(targetCol - 2, 2, 12), row: clamp(targetRow + (targetRow > 5 ? 0 : 1), 2, 10) };
    }
    if (role.id === 'melee') {
      return { col: clamp(targetCol - 1, 3, 12), row: clamp(targetRow, 2, 10) };
    }
    if (role.id === 'ranged' || role.id === 'magic') {
      return { col: clamp(targetCol - 2, 4, 12), row: clamp(targetRow + (pet.gridRow > targetRow ? -1 : 1), 2, 10) };
    }
    if (role.id === 'support') {
      const protector = allies.find(p => p.id !== pet.id && ['tank', 'melee'].includes(getPetRole(p.baseId).id));
      if (protector) {
        return { col: clamp(protector.gridCol - 1, 4, 12), row: clamp(protector.gridRow + 1, 2, 10) };
      }
      return { col: clamp(targetCol - 2, 4, 12), row: clamp(targetRow + 1, 2, 10) };
    }
    return { col: clamp(targetCol - 2, 4, 12), row: clamp(targetRow, 2, 10) };
  }

  _movePetTowardPosition(pet, targetCol, targetRow) {
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

    pet.gridCol = clamp(pet.gridCol, 1, 28);
    pet.gridRow = clamp(pet.gridRow, 2, 10);
  }

  _selectPetSkill(pet, target, readySkills, enemies) {
    if (!readySkills || readySkills.length === 0) return null;
    const role = getPetRole(pet.baseId);
    const petElem = getPetElement(pet.baseId);
    const targetElem = target?.element || 'fire';
    const monsterCount = enemies ? enemies.filter(e => !e.dead && e.hp > 0).length : 1;

    const scored = readySkills.map(s => {
      let score = 10;
      const adv = getElementAdvantage(petElem, targetElem);
      if (adv > 1) score += 15;
      else if (adv < 1) score -= 5;

      const dmgMul = s.dmgMul || 0;
      if (dmgMul > 0) { score += 15 + dmgMul * 10; }

      const isControl = s.effect && ['root','freeze','slow','stun','knockback','vortex'].includes(s.effect);
      if (isControl) score += 10;
      if (s.effect === 'shield' && role.id === 'tank') score += 25;
      if (role.id === 'support' && (s.type === 'heal' || s.healMul > 0)) score += 15;
      if (s.type === 'aoe' && monsterCount > 1) score += 8 * Math.min(monsterCount, 4);
      if (s.name === pet._lastSkillName) score -= 20;
      const prof = pet.skillProficiency?.[s.id || s.name] || 0;
      score += Math.min(prof, 5);

      return { skill: s, score: Math.max(1, score) };
    });

    const total = scored.reduce((sum, s) => sum + s.score, 0);
    let roll = Math.random() * total;
    for (const entry of scored) {
      roll -= entry.score;
      if (roll <= 0) {
        pet._lastSkillName = entry.skill.name;
        return entry.skill;
      }
    }
    const last = scored[scored.length - 1];
    if (last) pet._lastSkillName = last.skill.name;
    return last?.skill || null;
  }

  _petAttackPet(attacker, defender, teamId) {
    if (this._checkDodge(defender, attacker.spd || 6)) {
      this.fightLog.push({ text: `💨 ${defender.emoji} ${defender.name} né đòn của ${attacker.emoji}!`, type: 'buff' });
      if (this.onAttackAnim) this.onAttackAnim(attacker.id, defender.id, 0, false, 'dodge');
      return;
    }

    const role = getPetRole(attacker.baseId);
    const atkPower = attacker.atk + (attacker.weapon?.atk || 0) * (1 + (attacker.weapon?.enhanceLevel || 0) * 0.1);
    const defPower = defender.def + (defender.armor?.def || 0) * (1 + (defender.armor?.enhanceLevel || 0) * 0.1);
    const atkElem = getPetElement(attacker.baseId);
    const defElem = getPetElement(defender.baseId);
    const elemMul = getElementAdvantage(atkElem, defElem);
    const dmg = Math.max(1, Math.floor((atkPower * (0.3 + Math.random() * 0.35) - Math.floor(defPower * 0.4)) * elemMul));
    const crit = Math.random() < 0.08 + (role.id === 'ranged' ? 0.05 : 0);
    const finalDmg = crit ? Math.floor(dmg * 1.5) : dmg;

    defender.hp = Math.max(0, defender.hp - finalDmg);
    let elemIcon = '';
    if (elemMul > 1) elemIcon = '✨';
    else if (elemMul < 1) elemIcon = '🔽';
    const text = crit
      ? `💥 ${attacker.emoji} chí mạng ${defender.emoji} -${finalDmg}!${elemIcon}`
      : `${attacker.emoji} đánh ${defender.emoji} -${finalDmg}${elemIcon}`;
    this.fightLog.push({ text, type: 'damage' });

    if (this.onAttackAnim) {
      this.onAttackAnim(attacker.id, defender.id, finalDmg, crit, 'slash', role.id);
    }

    if (defender.hp <= 0) {
      defender.dead = true;
      this.fightLog.push({ text: `💀 ${defender.emoji} ${defender.name} bị hạ gục!`, type: 'defeat' });
    }
  }

  _checkDodge(defender, attackerSpeed) {
    const spd = defender.spd || 5;
    const baseChance = 0.05 + Math.max(0, (spd - attackerSpeed) * 0.005);
    return Math.random() < Math.min(0.4, baseChance);
  }

  _petUseSkill(attacker, target, skill, allies, enemies, isUltimate) {
    const role = getPetRole(attacker.baseId);
    const atkPower = attacker.atk + (attacker.weapon?.atk || 0) * (1 + (attacker.weapon?.enhanceLevel || 0) * 0.1);
    const atkElem = getPetElement(attacker.baseId);
    const defElem = target.element || getPetElement(target.baseId);
    const elemMul = getElementAdvantage(atkElem, defElem);
    const mul = skill.dmgMul || 1.5;
    const multiHit = skill.multiHit || 1;

    attacker.recordSkillUse(skill.id || skill.name);
    attacker.recordElementUse(atkElem);

    let totalDamage = 0;
    for (let hit = 0; hit < multiHit; hit++) {
      const hitMul = multiHit > 1 ? (1 / multiHit) * (0.85 + Math.random() * 0.3) : 1;
      const dmg = Math.max(1, Math.floor((atkPower * (0.4 + Math.random() * 0.3) * mul * hitMul - Math.floor((target.def || 0) * 0.3)) * elemMul));
      const crit = Math.random() < 0.12;
      const hitDmg = crit ? Math.floor(dmg * 1.5) : dmg;
      totalDamage += hitDmg;

      if (skill.type === 'aoe') {
        const aliveEnemies = enemies.filter(e => e.hp > 0);
        for (const e of aliveEnemies) {
          const aoeDmg = Math.floor(hitDmg * (0.6 + Math.random() * 0.4));
          e.hp = Math.max(0, e.hp - aoeDmg);
          this.fightLog.push({ text: `${attacker.emoji} ${skill.name} → ${e.emoji} -${aoeDmg}${crit ? '💥' : ''}`, type: 'damage' });
          if (this.onAttackAnim) this.onAttackAnim(attacker.id, e.id, aoeDmg, crit, skill.anim, role.id, !!isUltimate);
          if (e.hp <= 0) { e.dead = true; this.fightLog.push({ text: `💀 ${e.emoji} ${e.name} bị hạ gục!`, type: 'defeat' }); }
        }
      } else {
        target.hp = Math.max(0, target.hp - hitDmg);
        this.fightLog.push({ text: `${isUltimate ? '🔥 ' : ''}${attacker.emoji} ${skill.name} → ${target.emoji} -${hitDmg}${crit ? '💥' : ''}`, type: isUltimate ? 'buff' : 'damage' });
        if (this.onAttackAnim) this.onAttackAnim(attacker.id, target.id, hitDmg, crit, skill.anim, role.id, !!isUltimate);
        if (target.hp <= 0) { target.dead = true; this.fightLog.push({ text: `💀 ${target.emoji} ${target.name} bị hạ gục!`, type: 'defeat' }); break; }
      }
    }

    if (skill.effect && Math.random() < (skill.effectChance || 0.3)) {
      const effDef = EFFECTS[skill.effect];
      const effName = effDef?.name || skill.effect;
      const effIcon = effDef?.icon || '';
      const duration = effDef?.duration || 2;
      this._addEffect(2, target.id, skill.effect, duration);
      this.fightLog.push({ text: `${ELEMENTS[atkElem]?.icon || ''} ${target.emoji} ${target.name} bị ${effIcon} ${effName}!`, type: 'effect' });
    }

    skill.use();
    if (isUltimate) {
      this.fightLog.push({ text: `🌟 ${attacker.emoji} GIẢI PHÓNG TUYỆT CHIÊU: ${skill.name}!`, type: 'buff' });
    }
  }

  _petUseHealSkill(pet, ally, skill) {
    const heal = Math.floor(pet.atk * (skill.healMul || 0.3) + 20 + Math.random() * 15);
    ally.hp = Math.min(ally.maxHp, ally.hp + heal);
    this.fightLog.push({ text: `💚 ${pet.emoji} ${skill.name} → ${ally.emoji} +${heal} máu`, type: 'heal' });
    if (this.onAttackAnim) this.onAttackAnim(pet.id, ally.id, heal, false, skill.anim, getPetRole(pet.baseId).id);
    skill.use();
  }

  _petHealAlly(pet, ally) {
    const heal = Math.floor(pet.atk * 0.4 + 10 + Math.random() * 10);
    ally.hp = Math.min(ally.maxHp, ally.hp + heal);
    this.fightLog.push({ text: `💚 ${pet.emoji} hồi ${ally.emoji} +${heal} máu`, type: 'heal' });
    if (this.onAttackAnim) this.onAttackAnim(pet.id, ally.id, heal, false, 'heal', getPetRole(pet.baseId).id);
  }

  _addEffect(teamId, petId, type, duration) {
    const map = teamId === 1 ? this.petEffects1 : this.petEffects2;
    const effDef = EFFECTS[type];
    if (!effDef) return;
    if (!map[petId]) map[petId] = [];
    const existing = map[petId].find(e => e.type === type);
    if (existing) {
      existing.duration = Math.max(existing.duration, duration);
    } else {
      map[petId].push({ type, duration, def: effDef });
    }
  }

  _tickEffects() {
    for (const map of [this.petEffects1, this.petEffects2]) {
      for (const petId of Object.keys(map)) {
        map[petId] = map[petId].filter(e => {
          e.duration--;
          return e.duration > 0;
        });
        if (map[petId].length === 0) delete map[petId];
      }
    }
  }

  _endBattle(winner) {
    this.winner = winner;
    this.running = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    if (winner === 1) {
      this.fightLog.push({ text: '🎉 Chiến thắng PvP!', type: 'victory' });
    } else {
      this.fightLog.push({ text: '💔 Thất bại PvP!', type: 'defeat' });
    }
    if (this.onEnd) this.onEnd(this);
    if (this.onUpdate) this.onUpdate(this);
  }

  getSummary() {
    return {
      winner: this.winner,
      team1Alive: this.getAlive(this.playerTeam).length,
      team2Alive: this.getAlive(this.enemyTeam).length,
      log: this.fightLog
    };
  }
}
