class Pet {
  constructor(config) {
    this.id = config.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    this.baseId = config.baseId || 'tho';
    this.name = config.name || 'Thỏ';
    this.type = config.type || 'animal';
    this.emoji = config.emoji || '🐰';
    this.desc = config.desc || '';
    this.level = config.level || 1;
    this.exp = config.exp || 0;
    this.expToNext = this.calcExpToNext();

    const base = this.calcBaseStats();
    this.atk = config.atk ?? base.atk;
    this.def = config.def ?? base.def;
    this.spd = config.spd ?? base.spd;
    this.hp = config.hp ?? base.hp;
    this.maxHp = config.maxHp ?? base.hp;
    this.energy = config.energy ?? 100;
    this.maxEnergy = 100;
    this.battleEnergy = 0;
    this.maxBattleEnergy = 100;
    this.affinity = config.affinity ?? 50;

    this.weapon = config.weapon || null;
    this.armor = config.armor || null;

    this.owner = config.owner || 'player';
    this.generation = config.generation || 0;
    this.wins = config.wins || 0;
    this.losses = config.losses || 0;
    this.totalBattles = config.totalBattles || 0;
    this.isBoss = config.isBoss || false;
    this.isMonster = config.isMonster || false;
    this.isMutant = config.isMutant || false;
    this.dead = config.dead || false;
    this.role = config.role || getPetRole(this.baseId);
    this.purchasedSkills = [];
    this.pendingSkillChoices = config.pendingSkillChoices || [];
    this._savedPurchasedIds = config._savedPurchasedIds || null;
    this._savedSkillIds = config._savedSkillIds || null;

    // Migration: old saves have skills directly in config
    if (config.skills && config.skills.length > 0 && !config._savedPurchasedIds && !config._savedSkillIds) {
      this.skills = config.skills.map(s => s instanceof Skill ? s : new Skill(s));
    } else {
      this.skills = [];
      this._initElementSkills();
    }

    this.skillProficiency = config.skillProficiency || {};
    this.elementProficiency = config.elementProficiency || {};
    this.foodBonuses = config.foodBonuses || { atk: 0, def: 0, spd: 0, hp: 0 };
  }

  calcExpToNext() {
    return Math.floor(50 * Math.pow(this.level, 1.5));
  }

  calcBaseStats() {
    const typeMod = {
      animal: { atk: 0.8, def: 0.8, spd: 1.2, hp: 0.9 },
      mystical: { atk: 1.1, def: 1.0, spd: 0.9, hp: 1.0 },
      robot: { atk: 1.1, def: 1.2, spd: 0.8, hp: 1.1 },
      ice: { atk: 0.8, def: 1.1, spd: 0.9, hp: 1.2 },
      wood: { atk: 1.0, def: 1.0, spd: 0.8, hp: 1.2 },
      storm: { atk: 1.2, def: 0.7, spd: 1.3, hp: 0.9 }
    };
    const m = typeMod[this.type] || typeMod.animal;
    const roleBonus = this.role?.statBonus || { atk: 1, def: 1, spd: 1, hp: 1 };
    const seed = this.baseId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const r = (seed % 100) / 100;
    const baseAtk = Math.floor((20 + r * 30) * m.atk * roleBonus.atk);
    const baseDef = Math.floor((15 + r * 20) * m.def * roleBonus.def);
    const baseSpd = Math.floor((18 + r * 25) * m.spd * roleBonus.spd);
    const baseHp = Math.floor((80 + r * 60) * m.hp * roleBonus.hp * 10);
    return { atk: baseAtk, def: baseDef, spd: baseSpd, hp: baseHp };
  }

  getPower() {
    const wAtk = this.weapon ? (this.weapon.atk || 0) * (1 + (this.weapon.enhanceLevel || 0) * 0.1) : 0;
    const aDef = this.armor ? (this.armor.def || 0) * (1 + (this.armor.enhanceLevel || 0) * 0.1) : 0;
    const lvlBonus = 1 + (this.level - 1) * 0.05;
    const affBonus = 1 + (this.affinity - 50) / 200;
    return Math.floor(((this.atk + wAtk) * 2 + (this.def + aDef) * 1.5 + this.spd * 1.2 + this.hp * 0.5) * lvlBonus * affBonus);
  }

  getDisplayStats() {
    const wAtk = this.weapon ? (this.weapon.atk || 0) * (1 + (this.weapon.enhanceLevel || 0) * 0.1) : 0;
    const aDef = this.armor ? (this.armor.def || 0) * (1 + (this.armor.enhanceLevel || 0) * 0.1) : 0;
    return {
      atk: this.atk + wAtk,
      def: this.def + aDef,
      spd: this.spd,
      hp: this.hp,
      maxHp: this.maxHp,
      energy: this.energy,
      maxEnergy: this.maxEnergy,
      affinity: this.affinity
    };
  }

  addExp(amount) {
    this.exp += amount;
    let leveled = false;
    while (this.exp >= this.expToNext && this.level < DATA.MAX_LEVEL) {
      this.exp -= this.expToNext;
      this.level++;
      this.expToNext = this.calcExpToNext();
      this.levelUp();
      leveled = true;
    }
    return leveled;
  }

  levelUp() {
    const oldLevel = this.level - 1;
    const stats = this.calcBaseStats();
    const ratio = 1 + (this.level - 1) * 0.03;
    this.atk = Math.floor(stats.atk * ratio + this.level * 0.5);
    this.def = Math.floor(stats.def * ratio + this.level * 0.4);
    this.spd = Math.floor(stats.spd * ratio + this.level * 0.3);
    this.maxHp = Math.floor(stats.hp * ratio + this.level);
    this.hp = this.maxHp;
    // Re-apply food bonuses on top of recalculated base
    this.atk += this.foodBonuses.atk || 0;
    this.def += this.foodBonuses.def || 0;
    this.spd += this.foodBonuses.spd || 0;
    this.maxHp += this.foodBonuses.hp || 0;
    this.maxEnergy = Math.min(100 + Math.floor(this.level / 10) * 5, 300);
    this.energy = this.maxEnergy;

    const oldCount = this.getAutoSkillCount(oldLevel);
    const newCount = this.getAutoSkillCount(this.level);
    if (newCount > oldCount) {
      this.createPendingSkillChoices(Math.min(3, newCount - oldCount + 1));
    } else if (this.canLearnSkill() && this.skills.length < this.getAutoSkillCount(this.level) && this.pendingSkillChoices.length === 0) {
      this.createPendingSkillChoices(3);
    }
  }

  feed(food) {
    const statKey = food.stat;
    if (statKey === 'atk') { this.atk += food.value; this.foodBonuses.atk += food.value; }
    else if (statKey === 'def') { this.def += food.value; this.foodBonuses.def += food.value; }
    else if (statKey === 'spd') { this.spd += food.value; this.foodBonuses.spd += food.value; }
    else if (statKey === 'hp') { this.maxHp += food.value; this.hp += food.value; this.foodBonuses.hp += food.value; }
    // Revive dead pet when fed
    if (this.dead) {
      this.dead = false;
      this.hp = Math.max(this.hp || 0, Math.floor(this.maxHp * 0.25));
    }
    const leveled = this.addExp(food.exp);
    return leveled;
  }

  bath(item) {
    this.energy = Math.min(this.energy + item.energy, this.maxEnergy);
  }

  play() {
    this.affinity = Math.min(this.affinity + 5, 100);
    this.addExp(10);
  }

  train() {
    const cost = 50 + this.level * 10;
    const stats = this.calcBaseStats();
    const ratio = 1 + (this.level - 1) * 0.03;
    this.atk = Math.floor(stats.atk * ratio + this.level * 0.5);
    this.def = Math.floor(stats.def * ratio + this.level * 0.4);
    this.spd = Math.floor(stats.spd * ratio + this.level * 0.3);
    this.maxHp = Math.floor(stats.hp * ratio + this.level);
    this.hp = this.maxHp;
    // Re-apply food bonuses
    this.atk += this.foodBonuses.atk || 0;
    this.def += this.foodBonuses.def || 0;
    this.spd += this.foodBonuses.spd || 0;
    this.maxHp += this.foodBonuses.hp || 0;
    const leveled = this.addExp(50);
    return { cost, leveled };
  }

  addBattleEnergy(amt) {
    this.battleEnergy = Math.min(this.maxBattleEnergy, this.battleEnergy + amt);
    return this.battleEnergy >= this.maxBattleEnergy;
  }

  getBattleSpeedMultiplier() {
    const levelBonus = Math.min(0.2, (this.level - 1) * 0.001);
    return 0.95 + levelBonus;
  }

  resetBattleEnergy() {
    this.battleEnergy = 0;
  }

  tickEnergy() {
    if (this.energy < this.maxEnergy) {
      this.energy = Math.min(this.maxEnergy, this.energy + 2 + Math.floor(this.level / 20));
    }
  }

  canBreed() {
    return this.level >= DATA.BREED_START_LEVEL &&
           (this.level - DATA.BREED_START_LEVEL) % DATA.BREED_INTERVAL === 0 &&
           this.energy >= 50;
  }

  // ===== SKILL SYSTEM =====
  getAutoSkillCount(level) {
    if (level >= 70) return 5;
    if (level >= 40) return 4;
    if (level >= 20) return 3;
    if (level >= 10) return 2;
    return 1;
  }

  getMaxSkillSlots() {
    return typeof getMaxSkillSlots === 'function' ? getMaxSkillSlots() : (DATA.MAX_SKILL_SLOTS || 10);
  }

  getPurchasableSlots() {
    const auto = this.getAutoSkillCount(this.level);
    const purchased = this.purchasedSkills ? this.purchasedSkills.length : 0;
    const total = auto + purchased;
    if (total >= this.getMaxSkillSlots()) return 0;
    return this.getMaxSkillSlots() - total;
  }

  canLearnSkill() {
    return this.getPurchasableSlots() > 0;
  }

  learnSkill(skillDef) {
    if (!this.canLearnSkill()) return false;
    const existingIds = new Set(this.skills.map(s => s.id || s.name));
    if (existingIds.has(skillDef.id || skillDef.name)) return false;
    const skill = new Skill(skillDef);
    this.purchasedSkills.push(skillDef.id);
    this.skills.push(skill);
    return true;
  }

  createPendingSkillChoices(limit = 3) {
    if (!this.canLearnSkill()) return [];
    const element = getPetElement(this.baseId);
    const catalog = getSkillProgressionForElement(element, this.level);
    const existingIds = new Set(this.skills.map(s => s.id || s.name));
    const available = catalog.filter(skill => {
      const id = skill.id || skill.name;
      return !existingIds.has(id) && (skill.minLevel || 1) <= this.level;
    }).sort((a, b) => (a.tier || 1) - (b.tier || 1));

    if (!available.length) return [];
    const picks = [];
    const pool = [...available];
    while (picks.length < Math.min(limit, pool.length)) {
      const idx = Math.floor(Math.random() * pool.length);
      const skill = pool.splice(idx, 1)[0];
      if (!skill) break;
      picks.push({
        id: skill.id,
        name: skill.name,
        desc: skill.desc || '',
        cooldownMax: skill.cooldownMax || skill.cd || 1,
        element
      });
    }
    this.pendingSkillChoices = picks;
    return picks;
  }

  consumeSkillChoice(skillId) {
    if (!this.pendingSkillChoices.length) return false;
    if (!this.canLearnSkill()) return false;
    const choice = this.pendingSkillChoices.find(c => (c.id || c.name) === skillId);
    if (!choice) return false;
    const skillDef = this._findSkillDefinition(choice.id);
    if (!skillDef) return false;
    const existingIds = new Set(this.skills.map(s => s.id || s.name));
    if (existingIds.has(skillDef.id || skillDef.name)) {
      this.pendingSkillChoices = this.pendingSkillChoices.filter(c => (c.id || c.name) !== skillId);
      return false;
    }
    this.skills.push(new Skill(skillDef));
    this.pendingSkillChoices = this.pendingSkillChoices.filter(c => (c.id || c.name) !== skillId);
    return true;
  }

  _findSkillDefinition(skillId) {
    const element = getPetElement(this.baseId);
    const pool = [
      ...(ELEMENT_SKILLS[element] || []),
      ...Object.values(ELEMENT_SKILLS).flat()
    ];
    return pool.find(skill => (skill.id || skill.name) === skillId) || null;
  }

  _initElementSkills() {
    const element = getPetElement(this.baseId);
    const pool = ELEMENT_SKILLS[element] || [];
    if (pool.length === 0) return;

    const count = this.getAutoSkillCount(this.level);
    const catalog = typeof getSkillProgressionForElement === 'function'
      ? getSkillProgressionForElement(element, this.level)
      : (ELEMENT_SKILLS[element] || []).slice(0, Math.max(1, count));

    // If the pet already has saved skills, restore them.
    if (this._savedSkillIds && this._savedSkillIds.length > 0) {
      this.skills = [];
      for (const skillId of this._savedSkillIds) {
        const skillDef = pool.find(s => s.id === skillId) ||
                         this._findSkillInAllElements(skillId);
        if (skillDef) {
          this.skills.push(new Skill(skillDef));
        }
      }
    }

    // If no saved skills, create selectable pending skill choices instead of auto-assigning fixed skills.
    if (this.skills.length === 0 && this.pendingSkillChoices.length === 0) {
      this.createPendingSkillChoices(count);
    }

    // Restore purchased skills from saved IDs
    if (this._savedPurchasedIds) {
      for (const skillId of this._savedPurchasedIds) {
        const skillDef = pool.find(s => s.id === skillId) || 
                         this._findSkillInAllElements(skillId);
        if (skillDef) {
          this.purchasedSkills.push(skillDef.id);
          const alreadyHas = this.skills.some(s => (s.id || s.name) === skillDef.id);
          if (!alreadyHas) {
            this.skills.push(new Skill(skillDef));
          }
        }
      }
      this._savedPurchasedIds = null;
    }
    this._savedSkillIds = null;
  }

  _findSkillInAllElements(skillId) {
    for (const elem of Object.keys(ELEMENT_SKILLS)) {
      const found = ELEMENT_SKILLS[elem].find(s => s.id === skillId);
      if (found) return found;
    }
    return null;
  }

  getSkillDisplay() {
    return this.skills.map(s => ({
      name: s.name,
      desc: s.desc,
      cd: s.cooldownMax,
      tier: s.tier || 1,
      minLevel: s.minLevel || 1,
      type: this._getSkillCategory(s),
      isPurchased: this.purchasedSkills ? this.purchasedSkills.includes(s.id || s.name) : false
    }));
  }

  _getSkillCategory(s) {
    if (s.healMul || s.type === 'heal' || s.type === 'heal_all') return 'heal';
    if (s.defSelf || s.defUp || s.taunt || s.type === 'selfbuff' || s.type === 'buff' || s.type === 'taunt') return 'defense';
    if (s.effect && (s.effect === 'stun' || s.effect === 'freeze' || s.effect === 'root' || s.effect === 'slow')) return 'control';
    return 'attack';
  }

  // ===== SKILL PROFICIENCY =====
  recordSkillUse(skillId) {
    if (!this.skillProficiency[skillId]) this.skillProficiency[skillId] = 0;
    this.skillProficiency[skillId]++;
  }

  recordElementUse(element) {
    if (!this.elementProficiency[element]) this.elementProficiency[element] = 0;
    this.elementProficiency[element]++;
  }

  getSkillMasteryBonus(skillId) {
    const count = this.skillProficiency[skillId] || 0;
    return Math.min(3, Math.floor(count / 5));
  }

  getElementMasteryBonus(element) {
    const count = this.elementProficiency[element] || 0;
    return Math.min(3, Math.floor(count / 5));
  }

  getProficiencyLevel(skillId) {
    const count = this.skillProficiency[skillId] || 0;
    if (count >= 50) return 5;
    if (count >= 30) return 4;
    if (count >= 15) return 3;
    if (count >= 5) return 2;
    if (count >= 1) return 1;
    return 0;
  }

  getElementProficiencyLevel(element) {
    const count = this.elementProficiency[element] || 0;
    if (count >= 80) return 5;
    if (count >= 50) return 4;
    if (count >= 25) return 3;
    if (count >= 10) return 2;
    if (count >= 3) return 1;
    return 0;
  }

  toJSON() {
    return {
      id: this.id, baseId: this.baseId, name: this.name, type: this.type,
      emoji: this.emoji, desc: this.desc, level: this.level, exp: this.exp,
      expToNext: this.expToNext, atk: this.atk, def: this.def, spd: this.spd,
      hp: this.hp, maxHp: this.maxHp, energy: this.energy, maxEnergy: this.maxEnergy,
      affinity: this.affinity, weapon: this.weapon, armor: this.armor,
      owner: this.owner, generation: this.generation,
      wins: this.wins, losses: this.losses, totalBattles: this.totalBattles,
      isBoss: this.isBoss, isMonster: this.isMonster, isMutant: this.isMutant, dead: this.dead,
      role: this.role,
      purchasedSkills: this.purchasedSkills,
      pendingSkillChoices: this.pendingSkillChoices,
      skillProficiency: this.skillProficiency,
      elementProficiency: this.elementProficiency,
      foodBonuses: this.foodBonuses,
      _savedSkillIds: this.skills.map(s => s.id || s.name)
    };
  }

  static fromJSON(d) {
    const config = { ...d };
    if (d.purchasedSkills && d.purchasedSkills.length > 0) {
      config._savedPurchasedIds = d.purchasedSkills;
    }
    return new Pet(config);
  }
}

function generateWeaponItem(template, enhanceLevel = 0) {
  const atk = template.atkMin + Math.floor(Math.random() * (template.atkMax - template.atkMin + 1));
  return {
    id: template.id,
    name: template.name,
    tier: template.tier,
    atk: atk,
    element: template.element,
    enhanceLevel: enhanceLevel || 0,
    price: template.price
  };
}

function generateArmorItem(template, enhanceLevel = 0) {
  const def = template.defMin + Math.floor(Math.random() * (template.defMax - template.defMin + 1));
  return {
    id: template.id,
    name: template.name,
    tier: template.tier,
    def: def,
    dodge: template.dodge || 0,
    enhanceLevel: enhanceLevel || 0,
    price: template.price
  };
}

class Player {
  constructor(name) {
    this.name = name || 'Người chơi';
    this.gold = DATA.STARTING_GOLD;
    this.diamond = DATA.STARTING_DIAMOND;
    this.pets = [];
    this.items = { food: [], bath: [], buff: [] };
    this.equipment = { weapons: [], armors: [] };
    this.battleLog = [];
    this.pvpWins = 0;
    this.pvpLosses = 0;
    this.pvpRating = 1000;
    this.totalPower = 0;
    this.costume = 'thuong';
    this.ownedCostumes = ['thuong'];
    this.battleTeam = [];
    this.skillBooks = [];
  }

  addPet(pet) {
    this.pets.push(pet);
    this.updatePower();
    return pet;
  }

  removePet(petId) {
    const idx = this.pets.findIndex(p => p.id === petId);
    if (idx === -1) return false;
    this.pets.splice(idx, 1);
    this.updatePower();
    return true;
  }

  getPet(id) {
    return this.pets.find(p => p.id === id);
  }

  updatePower() {
    this.totalPower = this.pets.reduce((s, p) => s + p.getPower(), 0);
  }

  addGold(amount) {
    this.gold += amount;
  }

  spendGold(amount) {
    if (this.gold < amount) return false;
    this.gold -= amount;
    return true;
  }

  addDiamond(amount) {
    this.diamond += amount;
  }

  spendDiamond(amount) {
    if (this.diamond < amount) return false;
    this.diamond -= amount;
    return true;
  }

  addItem(category, item) {
    if (!this.items[category]) this.items[category] = [];
    this.items[category].push({ ...item });
  }

  removeItem(category, index) {
    if (!this.items[category] || index < 0 || index >= this.items[category].length) return false;
    this.items[category].splice(index, 1);
    return true;
  }

  addWeapon(weapon) {
    this.equipment.weapons.push({ ...weapon });
  }

  addArmor(armor) {
    this.equipment.armors.push({ ...armor });
  }

  getWeapon(id) {
    return this.equipment.weapons.find(w => w.id === id);
  }

  getArmor(id) {
    return this.equipment.armors.find(a => a.id === id);
  }

  removeWeapon(id) {
    const idx = this.equipment.weapons.findIndex(w => w.id === id);
    if (idx === -1) return false;
    this.equipment.weapons.splice(idx, 1);
    return true;
  }

  removeArmor(id) {
    const idx = this.equipment.armors.findIndex(a => a.id === id);
    if (idx === -1) return false;
    this.equipment.armors.splice(idx, 1);
    return true;
  }

  addSkillBook(skillDef) {
    this.skillBooks.push({ id: skillDef.id, name: skillDef.name, desc: skillDef.desc, element: skillDef.element || '' });
  }

  removeSkillBook(index) {
    if (index < 0 || index >= this.skillBooks.length) return false;
    this.skillBooks.splice(index, 1);
    return true;
  }

  getStrongestPets(count = 3) {
    return [...this.pets].sort((a, b) => b.getPower() - a.getPower()).slice(0, count);
  }

  toJSON() {
    return {
      name: this.name, gold: this.gold, diamond: this.diamond,
      pets: this.pets.map(p => p.toJSON()),
      items: this.items,
      equipment: this.equipment,
      battleLog: this.battleLog,
      pvpWins: this.pvpWins, pvpLosses: this.pvpLosses,
      pvpRating: this.pvpRating, totalPower: this.totalPower,
      costume: this.costume, ownedCostumes: this.ownedCostumes,
      battleTeam: this.battleTeam,
      skillBooks: this.skillBooks
    };
  }

  static fromJSON(d) {
    const p = new Player(d.name);
    p.gold = d.gold;
    p.diamond = d.diamond;
    p.pets = (d.pets || []).map(pd => Pet.fromJSON(pd));
    p.skillBooks = d.skillBooks || [];
    p.items = d.items || { food: [], bath: [], buff: [] };
    p.equipment = d.equipment || { weapons: [], armors: [] };
    p.battleLog = d.battleLog || [];
    p.pvpWins = d.pvpWins || 0;
    p.pvpLosses = d.pvpLosses || 0;
    p.pvpRating = d.pvpRating || 1000;
    p.totalPower = d.totalPower || 0;
    p.costume = d.costume || 'thuong';
    p.ownedCostumes = d.ownedCostumes || ['thuong'];
    p.battleTeam = d.battleTeam || [];
    return p;
  }
}
