class App {
  constructor() {
    this.player = null;
    this.ui = null;
    this.onlineMode = false;
  }

  async init() {
    Leaderboard.init();
    await FirebaseOnline.init();

    this.onlineMode = FirebaseOnline.isLoggedIn;

    if(!this.onlineMode){
      var creds = await this._waitForPostMessage(5000);
      if(creds){
        try {
          await FirebaseOnline.signIn(creds.email, creds.password);
          this.onlineMode = FirebaseOnline.isLoggedIn;
        } catch(e) {}
      }
    }

    if(!this.onlineMode){
      try{
        var result = await FirebaseOnline.signIn('guest@musicblog.com', 'guest123');
        if(result) this.onlineMode = true;
      }catch(e){}
    }

    await this.loadGame();
    this.ui = new GameUI(this);
    this.ui.init();
    this.autoSave();
    document.addEventListener('keydown', (e) => {
      if (e.key === '`') {
        this.addCheatResources();
      }
    });
  }

  _waitForPostMessage(timeout){
    return new Promise(function(resolve){
      var handler = function(e){
        if(e.data && e.data.type === 'firebase-auth'){
          window.removeEventListener('message', handler);
          resolve(e.data);
        }
      };
      window.addEventListener('message', handler);
      setTimeout(function(){
        window.removeEventListener('message', handler);
        resolve(null);
      }, timeout);
    });
  }

  async loadGame() {
    if(this.onlineMode){
      try {
        const onlineData = await FirebaseOnline.loadGame();
        if(onlineData && onlineData.pets){
          this.player = Player.fromJSON(onlineData);
          return;
        }
      } catch(e) {
        console.warn('Online load failed, trying local', e);
      }
    }
    try {
      const data = localStorage.getItem('myai_save');
      if (data) {
        this.player = Player.fromJSON(JSON.parse(data));
        return;
      }
    } catch (e) {
      console.warn('Save load failed, starting new game', e);
    }
    this.player = new Player('Người chơi');
    this.giveStarterPet();
  }

  giveStarterPet() {
    const types = ['animal', 'mystical', 'robot', 'ice', 'wood', 'storm'];
    const type = types[Math.floor(Math.random() * types.length)];
    const list = DATA.PET_TYPES[type].list;
    const t = list[Math.floor(Math.random() * list.length)];
    const pet = new Pet({
      baseId: t.id,
      name: t.name,
      type,
      emoji: t.emoji,
      desc: t.desc,
      level: 1,
      owner: this.player.name
    });
    this.player.addPet(pet);
  }

  async saveGame() {
    try {
      localStorage.setItem('myai_save', JSON.stringify(this.player.toJSON()));
      Leaderboard.updatePlayer(this.player);
      if(this.onlineMode){
        await FirebaseOnline.saveGame(this.player.toJSON());
      }
    } catch (e) {
      console.warn('Save failed', e);
    }
  }

  autoSave() {
    setInterval(() => this.saveGame(), 30000);
  }

  addCheatResources() {
    this.player.gold = 99999999;
    this.player.diamond = 9999;
    this.saveGame();
    this.ui.updateResources();
    this.ui.toast('💰 Nhận 99.999.999 vàng + 9.999 ruby!');
  }

  claimFreePet() {
    if (this.player.pets.length >= 50) {
      this.ui.toast('Tối đa 50 pet!');
      return;
    }
    const types = ['animal', 'mystical', 'robot', 'ice', 'wood', 'storm'];
    const type = types[Math.floor(Math.random() * types.length)];
    const list = DATA.PET_TYPES[type].list;
    const t = list[Math.floor(Math.random() * list.length)];
    const pet = new Pet({
      baseId: t.id,
      name: t.name,
      type,
      emoji: t.emoji,
      desc: t.desc,
      level: Math.floor(Math.random() * 10) + 1,
      owner: this.player.name
    });
    this.player.addPet(pet);
    this.saveGame();
    this.ui.updateResources();
    this.ui.toast(`🎉 Nhận được ${pet.emoji} ${pet.name} cấp ${pet.level}!`);
    this.ui.renderPets();
  }

  feedPet(petId, foodIdx) {
    const pet = this.player.getPet(petId);
    if (!pet) return;
    const food = DATA.ITEMS.food[foodIdx];
    if (!food) return;
    if (!this.player.spendGold(food.price)) {
      this.ui.toast('Không đủ vàng!');
      return;
    }
    pet.feed(food);
    this.saveGame();
    this.ui.updateResources();
    this.ui.toast(`🍖 ${pet.name} ăn ${food.name}!`);
    this.ui.showPetDetail(petId);
  }

  bathPet(petId, bathIdx) {
    const pet = this.player.getPet(petId);
    if (!pet) return;
    const bath = DATA.ITEMS.bath[bathIdx];
    if (!bath) return;
    if (!this.player.spendGold(bath.price)) {
      this.ui.toast('Không đủ vàng!');
      return;
    }
    pet.bath(bath);
    this.saveGame();
    this.ui.updateResources();
    this.ui.toast(`🛁 ${pet.name} sạch sẽ! +${bath.energy} năng lượng`);
    this.ui.showPetDetail(petId);
  }

  playPet(petId) {
    const pet = this.player.getPet(petId);
    if (!pet) return;
    if (!this.player.spendGold(20)) {
      this.ui.toast('Không đủ vàng!');
      return;
    }
    pet.play();
    this.saveGame();
    this.ui.updateResources();
    this.ui.toast(`🎮 Chơi với ${pet.name}! Thân thiết +5`);
    this.ui.showPetDetail(petId);
  }

  trainPet(petId) {
    const pet = this.player.getPet(petId);
    if (!pet) return;
    const { cost, leveled } = pet.train();
    if (!this.player.spendGold(cost)) {
      this.ui.toast('Không đủ vàng!');
      return;
    }
    this.saveGame();
    this.ui.updateResources();
    this.ui.toast(`🏋️ ${pet.name} tập luyện!${leveled ? ' 📈 Lên cấp!' : ''}`);
    this.ui.showPetDetail(petId);
  }

  buyPet(petId) {
    const shopItem = DATA.SHOP_PETS.find(p => p.id === petId);
    if (!shopItem) return;
    if (this.player.pets.length >= 50) {
      this.ui.toast('Tối đa 50 pet!');
      return;
    }
    if (!this.player.spendGold(shopItem.price)) {
      this.ui.toast('Không đủ vàng!');
      return;
    }
    const pet = new Pet({
      baseId: shopItem.id,
      name: shopItem.name,
      type: shopItem.type,
      emoji: shopItem.emoji,
      desc: DATA.PET_TYPES[shopItem.type].list.find(t => t.id === shopItem.id)?.desc || '',
      level: 1,
      owner: this.player.name
    });
    this.player.addPet(pet);
    this.saveGame();
    this.ui.updateResources();
    this.ui.toast(`🎉 Mua ${shopItem.emoji} ${shopItem.name}!`);
    this.ui.renderShop();
  }

  buyWeapon(weaponId) {
    const template = DATA.EQUIPMENT.weapons.find(w => w.id === weaponId);
    if (!template) return;
    if (!this.player.spendGold(template.price)) {
      this.ui.toast('Không đủ vàng!');
      return;
    }
    const weapon = generateWeaponItem(template);
    this.player.addWeapon(weapon);
    this.saveGame();
    this.ui.updateResources();
    this.ui.toast(`🔪 Mua ${weapon.name} (ATK:${weapon.atk})!`);
    this.ui.renderShop();
  }

  buyArmor(armorId) {
    const template = DATA.EQUIPMENT.armors.find(a => a.id === armorId);
    if (!template) return;
    if (!this.player.spendGold(template.price)) {
      this.ui.toast('Không đủ vàng!');
      return;
    }
    const armor = generateArmorItem(template);
    this.player.addArmor(armor);
    this.saveGame();
    this.ui.updateResources();
    this.ui.toast(`🛡️ Mua ${armor.name} (DEF:${armor.def})!`);
    this.ui.renderShop();
  }

  buyBuff(buffIdx) {
    const buff = DATA.ITEMS.buff[buffIdx];
    if (!buff) return;
    if (!this.player.spendGold(buff.price)) {
      this.ui.toast('Không đủ vàng!');
      return;
    }
    this.player.addItem('buff', buff);
    this.saveGame();
    this.ui.updateResources();
    this.ui.toast(`📦 Mua ${buff.name}!`);
    this.ui.renderShop();
  }

  buyFood(foodIdx) {
    const food = DATA.ITEMS.food[foodIdx];
    if (!food) return;
    if (!this.player.spendGold(food.price)) {
      this.ui.toast('Không đủ vàng!');
      return;
    }
    this.player.addItem('food', food);
    this.saveGame();
    this.ui.updateResources();
    this.ui.toast(`📦 Mua ${food.name}!`);
    this.ui.renderShop();
  }

  buyBath(bathIdx) {
    const bath = DATA.ITEMS.bath[bathIdx];
    if (!bath) return;
    if (!this.player.spendGold(bath.price)) {
      this.ui.toast('Không đủ vàng!');
      return;
    }
    this.player.addItem('bath', bath);
    this.saveGame();
    this.ui.updateResources();
    this.ui.toast(`📦 Mua ${bath.name}!`);
    this.ui.renderShop();
  }

  equipWeapon(petId, weaponIdx) {
    const pet = this.player.getPet(petId);
    if (!pet) return;
    const weapons = this.player.equipment.weapons;
    if (weaponIdx < 0 || weaponIdx >= weapons.length) return;
    const weapon = weapons[weaponIdx];
    if (pet.weapon) {
      this.player.equipment.weapons.push(pet.weapon);
    }
    pet.weapon = weapon;
    this.player.equipment.weapons.splice(weaponIdx, 1);
    this.player.updatePower();
    this.saveGame();
    this.ui.updateResources();
    this.ui.toast(`🔪 Trang bị ${weapon.name} cho ${pet.name}!`);
    this.ui.showPetDetail(petId);
  }

  equipArmor(petId, armorIdx) {
    const pet = this.player.getPet(petId);
    if (!pet) return;
    const armors = this.player.equipment.armors;
    if (armorIdx < 0 || armorIdx >= armors.length) return;
    const armor = armors[armorIdx];
    if (pet.armor) {
      this.player.equipment.armors.push(pet.armor);
    }
    pet.armor = armor;
    this.player.equipment.armors.splice(armorIdx, 1);
    this.player.updatePower();
    this.saveGame();
    this.ui.updateResources();
    this.ui.toast(`🛡️ Trang bị ${armor.name} cho ${pet.name}!`);
    this.ui.showPetDetail(petId);
  }

  unequip(petId, slot) {
    const pet = this.player.getPet(petId);
    if (!pet) return;
    if (slot === 'weapon' && pet.weapon) {
      this.player.equipment.weapons.push(pet.weapon);
      pet.weapon = null;
    } else if (slot === 'armor' && pet.armor) {
      this.player.equipment.armors.push(pet.armor);
      pet.armor = null;
    }
    this.player.updatePower();
    this.saveGame();
    this.ui.updateResources();
    this.ui.toast(`Đã tháo trang bị!`);
    this.ui.showPetDetail(petId);
  }

  getBattleTeam() {
    let ids = this.player.battleTeam.filter(id => {
      const p = this.player.getPet(id);
      return p && !p.dead && p.hp > 0;
    });
    if (ids.length === 0) {
      ids = this.player.getStrongestPets(3).map(p => p.id);
    }
    return ids.map(id => this.player.getPet(id)).filter(Boolean);
  }

  startPvEBattle() {
    const team = this.getBattleTeam();
    if (!team.length) {
      this.ui.toast('Cần ít nhất 1 pet!');
      return;
    }
    const enemyLevel = Math.max(1, Math.floor(team.reduce((s, p) => s + p.level, 0) / team.length));
    const enemyTeam = [
      BattleEngine.createEnemyPet(enemyLevel),
      enemyLevel > 5 ? BattleEngine.createEnemyPet(enemyLevel) : null,
      enemyLevel > 10 ? BattleEngine.createEnemyPet(enemyLevel) : null
    ].filter(Boolean);

    const battle = this.ui.battleEngine;
    battle.start(team, enemyTeam, false);
    this.ui.showBattleLive(battle, false);
    battle.onEnd = (be) => {
      if (this.ui.battleAnimator) {
        this.ui.battleAnimator.stop();
        this.ui.battleAnimator = null;
      }
      if (be.winner === 1) {
        const goldReward = 50 + be.turn * 10 + Math.floor(Math.random() * 30);
        this.player.addGold(goldReward);
        for (const pet of team) {
          pet.totalBattles++;
          pet.wins++;
          pet.addExp(15 + Math.floor(Math.random() * 20));
        }
        let newPet = null;
        if (Math.random() < 0.2) {
          const types = Object.keys(DATA.PET_TYPES);
          const type = types[Math.floor(Math.random() * types.length)];
          const list = DATA.PET_TYPES[type].list;
          const t = list[Math.floor(Math.random() * list.length)];
          newPet = new Pet({
            baseId: t.id, name: t.name, type,
            emoji: t.emoji, desc: t.desc,
            level: 1, owner: this.player.name
          });
          this.player.addPet(newPet);
          this.ui.toast(`🎉 Nhận pet mới: ${newPet.emoji} ${newPet.name}!`);
        }
        this.player.updatePower();
        this.saveGame();
        this.ui.updateResources();
        this.ui.closeModal();
        this.ui.showBattleResult(be.getSummary(), { gold: goldReward, newPet });
      } else if (be.winner === 2) {
        for (const pet of team) {
          pet.totalBattles++;
          pet.losses++;
        }
        this.player.addGold(10);
        this.saveGame();
        this.ui.updateResources();
        this.ui.closeModal();
        this.ui.showBattleResult(be.getSummary(), { gold: 10 });
      } else {
        this.player.addGold(25);
        this.saveGame();
        this.ui.updateResources();
        this.ui.closeModal();
        this.ui.showBattleResult(be.getSummary(), { gold: 25 });
      }
    };
  }

  startBossBattle() {
    const team = this.getBattleTeam();
    if (!team.length) {
      this.ui.toast('Cần ít nhất 1 pet!');
      return;
    }
    const avgLevel = Math.floor(team.reduce((s, p) => s + p.level, 0) / team.length);
    if (avgLevel < 30) {
      this.ui.toast('Cần đội pet cấp 30+ để đánh trùm!');
      return;
    }
    const bossDef = BossSystem.getRandomBoss(avgLevel);
    const bossTeam = BossSystem.createBossTeam(bossDef.id, avgLevel);
    const battle = this.ui.battleEngine;
    battle.start(team, bossTeam, false, true);
    this.ui.showBattleLive(battle, false, true);
    battle.onEnd = (be) => {
      if (this.ui.battleAnimator) {
        this.ui.battleAnimator.stop();
        this.ui.battleAnimator = null;
      }
      const rewards = BossSystem.getBossRewards(avgLevel);
      if (be.winner === 1) {
        this.player.addGold(rewards.gold);
        this.player.addDiamond(rewards.diamond);
        for (const pet of team) {
          pet.totalBattles++;
          pet.wins++;
          pet.addExp(rewards.exp + Math.floor(Math.random() * 50));
        }
        let newPet = null;
        if (Math.random() < 0.4) {
          const types = Object.keys(DATA.PET_TYPES);
          const type = types[Math.floor(Math.random() * types.length)];
          const list = DATA.PET_TYPES[type].list;
          const t = list[Math.floor(Math.random() * list.length)];
          newPet = new Pet({
            baseId: t.id, name: `${t.name} siêu cấp`, type,
            emoji: t.emoji, desc: t.desc,
            level: Math.floor(Math.random() * 15) + 10, owner: this.player.name
          });
          // Boost stats for boss reward
          newPet.atk = Math.floor(newPet.atk * 1.3);
          newPet.def = Math.floor(newPet.def * 1.3);
          newPet.maxHp = Math.floor(newPet.maxHp * 1.3);
          newPet.hp = newPet.maxHp;
          this.player.addPet(newPet);
          this.ui.toast(`🎉 Nhận pet siêu cấp: ${newPet.emoji} ${newPet.name}!`);
        }
        this.player.updatePower();
        this.saveGame();
        this.ui.updateResources();
        this.ui.closeModal();
        this.ui.showBattleResult(be.getSummary(), { gold: rewards.gold, diamond: rewards.diamond, newPet });
      } else {
        for (const pet of team) {
          pet.totalBattles++;
          pet.losses++;
        }
        const consolation = Math.floor(rewards.gold * 0.2);
        this.player.addGold(consolation);
        this.saveGame();
        this.ui.updateResources();
        this.ui.closeModal();
        this.ui.showBattleResult(be.getSummary(), { gold: consolation });
      }
    };
  }

  startPvPBattle() {
    // Normal PvP (offline) using selectedEnemyPets
    const team = this.ui.selectedEnemyPets;
    if (!team || team.length === 0) {
      this.ui.toast('Chọn ít nhất 1 pet!');
      return;
    }
    // existing code unchanged below
    const avgLevel = Math.floor(team.reduce((s, p) => s + p.level, 0) / team.length);
    const types = Object.keys(DATA.PET_TYPES);
    const enemyTeam = [];
    const usedIds = [];
    for (let i = 0; i < 3; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const list = DATA.PET_TYPES[type].list;
      let t;
      do {
        t = list[Math.floor(Math.random() * list.length)];
      } while (usedIds.includes(t.id));
      usedIds.push(t.id);
      const lvl = Math.max(1, avgLevel + Math.floor(Math.random() * 6) - 2);
      const pet = new Pet({
        baseId: t.id, name: t.name, type,
        emoji: t.emoji, desc: t.desc,
        level: lvl, owner: 'Đối thủ'
      });
      pet.hp = pet.maxHp;
      enemyTeam.push(pet);
    }
    this.ui.closeModal();
    const pvp = new PVPBattle(this.player);
    this.ui.activePvPBattle = pvp;
    pvp.start(team, enemyTeam);
    this.ui.currentTab = 'battle';
    this.ui.renderBattle();
    pvp.onEnd = (b) => {
      for (const pet of team) {
        pet.totalBattles++;
        if (b.winner === 1) {
          pet.wins++; pet.addExp(30 + Math.floor(Math.random() * 30));
        } else {
          pet.losses++;
        }
      }
      if (b.winner === 1) {
        this.player.pvpWins++; this.player.pvpRating += 15 + Math.floor(Math.random() * 10);
        const goldReward = 100 + Math.floor(Math.random() * 100);
        this.player.addGold(goldReward);
        this.ui.toast(`🎉 PvP Thắng! +${goldReward} vàng, +rating!`);
        this.player.updatePower(); this.saveGame(); this.ui.updateResources();
        setTimeout(() => { this.ui.showBattleResult(b.getSummary(), { gold: goldReward }); this.ui.leavePvP(); }, 2000);
      } else if (b.winner === 2) {
        this.player.pvpLosses++; this.player.pvpRating = Math.max(0, this.player.pvpRating - 10);
        this.player.addGold(20);
        this.ui.toast(`💔 PvP Thua! -rating`);
        this.player.updatePower(); this.saveGame(); this.ui.updateResources();
        setTimeout(() => { this.ui.showBattleResult(b.getSummary(), { gold: 20 }); this.ui.leavePvP(); }, 2000);
      }
    };
  }

  doBreed() {
    const pet1 = this.ui.selectedBreedPet1;
    const pet2 = this.ui.selectedBreedPet2;
    if (!pet1 || !pet2) {
      this.ui.toast('Chọn 2 pet để lai tạo!');
      return;
    }
    if (!BreedingSystem.canBreed(pet1, pet2)) {
      this.ui.toast('Không thể lai tạo! Kiểm tra cấp độ và năng lượng.');
      return;
    }
    const child = BreedingSystem.breed(pet1, pet2);
    if (!child) {
      this.ui.toast('Lai tạo thất bại!');
      return;
    }
    this.player.addPet(child);
    this.ui.selectedBreedPet1 = null;
    this.ui.selectedBreedPet2 = null;
    this.saveGame();
    this.ui.updateResources();
    this.ui.toast(`🥚 ${child.emoji} ${child.name} thế hệ ${child.generation} chào đời! ⚡ ${child.getPower()}`);
    this.ui.renderBreed();
    document.getElementById('breed-result').innerHTML = `
      <div class="breed-success">
        🎉 ${child.emoji} <strong>${child.name}</strong> thế hệ ${child.generation}!
        <br>Cấp 1 | ⚡ ${child.getPower()}
        <br>ATK: ${child.atk} | DEF: ${child.def} | SPD: ${child.spd} | HP: ${child.maxHp}
        ${child.name.includes('huyền thoại') ? '<br>🌟 <strong>ĐỘT BIẾN HUYỀN THOẠI!</strong>' : ''}
      </div>
    `;
  }

  buyCostume(costumeId) {
    const costume = DATA.COSTUMES.find(c => c.id === costumeId);
    if (!costume) return;
    if (this.player.ownedCostumes.includes(costumeId)) {
      this.ui.toast('Bạn đã sở hữu phục trang này!');
      return;
    }
    if (!this.player.spendDiamond(costume.price)) {
      this.ui.toast('Không đủ 💎 ruby!');
      return;
    }
    this.player.ownedCostumes.push(costumeId);
    this.player.costume = costumeId;
    this.saveGame();
    this.ui.updateResources();
    this.ui.toast(`👗 Mua ${costume.name} thành công!`);
    this.ui.renderShop();
  }

  equipCostume(costumeId) {
    if (!this.player.ownedCostumes.includes(costumeId)) {
      this.ui.toast('Chưa sở hữu phục trang này!');
      return;
    }
    const c = DATA.COSTUMES.find(x => x.id === costumeId);
    this.player.costume = costumeId;
    this.saveGame();
    this.ui.toast(`👗 Đã mặc ${c?.name || 'phục trang'}`);
    // Update avatar on map canvas
    if (this.ui.mapView) this.ui.mapView.setPlayer(this.player);
    // Update section avatar indicator
    const ind = document.querySelector('.avatar-indicator');
    if (ind) ind.textContent = c.emoji;
    if (this.ui.currentTab === 'shop') this.ui.renderShop();
  }

  updateLeaderboard() {
    Leaderboard.updatePlayer(this.player);
    this.ui.toast('🔄 Đã cập nhật bảng xếp hạng!');
    this.ui.renderRank();
  }

  startExploring() {
    if (!this.ui.worldMap) {
      this.ui.toast('Lỗi hệ thống map!');
      return;
    }
    if (this.ui.worldMap.startExploring()) {
      this.ui.toast('⚔️ Bắt đầu khám phá map!');
      this.ui.currentTab = 'world';
      this.ui.renderWorld();
    } else {
      this.ui.toast('Cần pet còn sống để chiến đấu!');
    }
  }

  startOnlineExploring() {
    if (!this.ui.worldMap) {
      this.ui.toast('Lỗi hệ thống map!');
      return;
    }
    if (this.ui.worldMap.startExploring()) {
      this.ui.toast('⚔️ Đang khám phá map online!');
      if (worldOnline.isHost && this.ui.worldMap.monsters) {
        var wm = this.ui.worldMap;
        wm.monsters.forEach(function(m){
          if (!m.firebaseId) {
            var fid = 'mon_' + (++wm._monsterIdCounter);
            m.firebaseId = fid;
            worldOnline.syncMonster(fid, {
              x: m.gridCol, y: m.gridRow,
              hp: m.hp, maxHp: m.maxHp,
              atk: m.atk, def: m.def,
              element: m.element || 'fire',
              level: m.level, alive: true, name: m.name, emoji: m.emoji,
              isBoss: !!m.isBoss
            });
          }
        });
      }
      this.ui.currentTab = 'mapOnline';
      this.ui.showTab('mapOnline');
    } else {
      this.ui.toast('Cần pet còn sống để chiến đấu!');
    }
  }

  // === Persistent Online World (auto-joined) ===

  async enterOnlineWorld() {
    if (worldOnline.isOnline) return;
    var name = localStorage.getItem('musicblog_username') || FirebaseOnline.uid || 'Khách';
    var emoji = this.player.costume ? (DATA.COSTUMES.find(function(c){ return c.id === app.player.costume; })?.emoji || '🐉') : '🐉';
    var ok = await worldOnline.enterWorld(name, emoji);
    if (!ok) return;
    this._setupOnlineWorld();
    this.ui.toast('🌐 Đã vào thế giới online!');
    this.ui.currentTab = 'mapOnline';
    this.ui.showTab('mapOnline');
  }

  _setupOnlineWorld() {
    var self = this;
    // Stop single-player exploration if active
    if (this.ui.worldMap && this.ui.worldMap.exploring) {
      this.ui.worldMap.stopExploring();
    }
    // Create or reuse WorldMap with online mode
    if (!this.ui.worldMap) {
      this.ui.worldMap = new WorldMap(this.player);
    }
    this.ui.worldMap.onUpdate = () => self.ui.refreshMapOnlineUI();
    this.ui.worldMap.setOnlineMode(worldOnline);
    this.ui.worldMap.startExploring();
    // Host: sync initial monsters to Firebase
    if (worldOnline.isHost && this.ui.worldMap.monsters) {
      var self2 = this;
      this.ui.worldMap.monsters.forEach(function(m){
        var fid = 'mon_' + (++self2.ui.worldMap._monsterIdCounter);
        m.firebaseId = fid;
        worldOnline.syncMonster(fid, {
          x: m.gridCol, y: m.gridRow,
          hp: m.hp, maxHp: m.maxHp,
          atk: m.atk, def: m.def,
          element: m.element || 'fire',
          level: m.level, alive: true, name: m.name, emoji: m.emoji,
          isBoss: !!m.isBoss
        });
      });
    }
    // Start periodic refresh
    worldOnline._onlineRefreshTimer = setInterval(function(){
      if (self.ui.currentTab === 'mapOnline' && self.ui.mapView) {
        self.ui.refreshMapOnlineUI();
      }
    }, 200);
    // Challenge callbacks for PvP Online tab
    worldOnline.onChallenge = function(id, c){
      self.ui._incomingChallengeId = id;
      self.ui._incomingChallenge = c;
      self.ui.toast('⚔️ ' + (c.fromName || c.from) + ' thách đấu bạn!');
    };
    worldOnline.onChallengeResponse = function(accepted, c){
      self.ui._incomingChallengeId = null;
      self.ui._incomingChallenge = null;
      if (accepted) {
        self.ui.toast('✅ Đối thủ đã chấp nhận!');
        self._startPvPBattle(c.from, c.fromName, c.fromEmoji);
      } else {
        self.ui.toast('❌ Đối thủ từ chối thách đấu');
      }
    };
  }

  _enterPvPWorld() {
    var self = this;
    if (this.ui.worldMap) {
      this.ui.worldMap.stopExploring();
    }
    // Set up challenge callbacks
    worldOnline.onChallenge = function(id, c){
      self.ui._incomingChallengeId = id;
      self.ui._incomingChallenge = c;
      self.ui.toast('⚔️ ' + (c.fromName || c.from) + ' thách đấu bạn!');
      self.ui.renderWorldPvP();
    };
    worldOnline.onChallengeResponse = function(accepted, c){
      self.ui._incomingChallengeId = null;
      self.ui._incomingChallenge = null;
      self.ui._outgoingChallengeSent = false;
      if (accepted) {
        self.ui.toast('✅ Đối thủ đã chấp nhận!');
        self._startPvPBattle(c.from, c.fromName, c.fromEmoji);
      } else {
        self.ui.toast('❌ Đối thủ từ chối thách đấu');
      }
      self.ui.renderWorldPvP();
    };
    this.ui.currentTab = 'world';
    this.ui.renderWorldPvP();
    // Start a timer for refresh
    if (this._pvpRefreshTimer) clearInterval(this._pvpRefreshTimer);
    this._pvpRefreshTimer = setInterval(function(){
      self.ui.refreshWorldUI();
    }, 500);
  }

  challengePlayer(targetUid) {
    var self = this;
    var alivePets = this.player.pets.filter(function(p){ return !p.dead && p.hp > 0; });
    if (alivePets.length === 0) { this.ui.toast('Không có pet sống để chiến!'); return; }
    if (this.ui._pvpWarActive) { this.ui.toast('Đang trong trận!'); return; }
    worldOnline.challengePlayer(targetUid).then(function(){
      self.ui.toast('⚔️ Đã gửi thách đấu!');
      self.ui.renderWorldPvP();
    });
  }

  acceptChallenge(challengeId) {
    var self = this;
    var alivePets = this.player.pets.filter(function(p){ return !p.dead && p.hp > 0; });
    if (alivePets.length === 0) { this.ui.toast('Không có pet sống để chiến!'); return; }
    worldOnline.respondToChallenge(challengeId, true);
    var c = this.ui._incomingChallenge;
    this.ui._incomingChallengeId = null;
    this.ui._incomingChallenge = null;
    this.ui.toast('✅ Đã chấp nhận!');
    this._startPvPBattle(c.from, c.fromName, c.fromEmoji);
  }

  declineChallenge(challengeId) {
    worldOnline.respondToChallenge(challengeId, false);
    this.ui._incomingChallengeId = null;
    this.ui._incomingChallenge = null;
    this.ui.toast('❌ Đã từ chối');
    this.ui.renderWorldPvP();
  }

  _startPvPBattle(enemyUid, enemyName, enemyEmoji) {
    var self = this;
    var myPets = this.player.pets.filter(function(p){ return !p.dead && p.hp > 0; }).slice(0, 3);
    if (myPets.length === 0) { this.ui.toast('Không có pet sống!'); return; }
    this.ui._pvpWarActive = true;
    this.ui._pvpBattle = null;

    // Host creates the PVPBattle engine
    if (worldOnline.isHost) {
      var PVPBattle = window.PVPBattle;
      if (!PVPBattle) { this.ui.toast('Lỗi: thiếu PVPBattle'); return; }
      var pvp = new PVPBattle(myPets, []);
      pvp._enemyUid = enemyUid;
      pvp._enemyName = enemyName || 'Đối thủ';
      pvp._enemyEmoji = enemyEmoji || '🧑';
      this.ui._pvpBattle = pvp;
      this.ui.toast('⚔️ Đợi đối thủ vào trận...');
      // For now, just show the battle waiting state
    }

    // Watch for enemy battle data
    this._watchEnemyBattleData(enemyUid);
    this.ui.renderWorldPvP();
    // Start periodic sync
    if (worldOnline.isHost) {
      this._pvpHostLoop = setInterval(function(){
        if (!self.ui._pvpBattle || self.ui._pvpBattle.winner) {
          clearInterval(self._pvpHostLoop);
          self.ui._pvpHostLoop = null;
          return;
        }
        self.ui._pvpBattle.tick();
        self.ui.refreshWorldUI();
      }, 700);
    }
  }

  leavePvPWorld() {
    if (this.ui._pvpBattle) {
      this.ui._pvpBattle = null;
    }
    this.ui._pvpWarActive = false;
    this.ui._incomingChallengeId = null;
    this.ui._incomingChallenge = null;
    if (this._pvpRefreshTimer) { clearInterval(this._pvpRefreshTimer); this._pvpRefreshTimer = null; }
    if (this._pvpHostLoop) { clearInterval(this._pvpHostLoop); this._pvpHostLoop = null; }
    if (worldOnline._onlineRefreshTimer) { clearInterval(worldOnline._onlineRefreshTimer); worldOnline._onlineRefreshTimer = null; }
    if (this.ui.worldMap && this.ui.worldMap.isOnline) {
      this.ui.worldMap.isOnline = false;
      this.ui.worldMap.onlineManager = null;
    }
    worldOnline.leaveWorld();
    this.ui.currentTab = 'home';
    if (this.ui.mapView) { this.ui.mapView.stop(); this.ui.mapView = null; }
    this.ui.showTab('home');
  }

  // For single-player explore (unchanged)
  _startWorldExplore() {
    if (!this.ui.worldMap) {
      this.ui.worldMap = new WorldMap(this.player);
    }
    this.ui.worldMap.onUpdate = () => this.ui.refreshWorldUI();
    if (this.ui.worldMap.startExploring()) {
      this.ui.currentTab = 'world';
      this.ui.renderWorld();
    }
  }

  stopExploring() {
    if (this.ui.worldMap) {
      this.ui.worldMap.stopExploring();
      this.ui.toast('⏹️ Dừng khám phá!');
      this.ui.renderWorld();
    }
  }

  setCommand(cmd) {
    if (this.ui.worldMap) {
      this.ui.worldMap.setCommand(cmd);
      this.ui.toast(`Lệnh: ${cmd === 'attack' ? '⚔️ Tấn công' : cmd === 'defend' ? '🛡️ Phòng thủ' : '🏃 Rút lui'}`);
      this.ui.refreshWorldUI();
    }
  }

  setZoom(level) {
    if (this.ui.mapView) {
      this.ui.mapView.setZoom(level);
    }
  }

  startOnlineBattle(room) {
    this.ui.closeModal();
    var isHost = pvpOnline.isHost;
    if (isHost) {
      var pvp = pvpOnline.startHostBattle(room);
      if (!pvp) { this.ui.toast('Lỗi khởi tạo battle'); return; }
      this.ui.activePvPBattle = pvp;
      this.ui.currentTab = 'battle';
      this.ui.renderBattle();
    }
    pvpOnline.startWatching(room, function(data){
      if (!data) return;
      if (!isHost) {
        var team1 = (data.team1 || []).map(function(d){ return Pet.fromJSON(d); });
        var team2 = (data.team2 || []).map(function(d){ return Pet.fromJSON(d); });
        var fake = {
          playerTeam: team1,
          enemyTeam: team2,
          fightLog: data.log || [],
          winner: data.winner,
          getAlive: function(arr){ return arr.filter(function(p){ return !p.dead && p.hp > 0; }); },
          getSummary: function(){
            return { winner: data.winner, team1Alive: this.getAlive(team1).length, team2Alive: this.getAlive(team2).length, log: this.fightLog };
          }
        };
        if (!app.ui.activePvPBattle) {
          app.ui.activePvPBattle = fake;
          app.ui.currentTab = 'battle';
          app.ui.renderBattle();
        }
        app.ui._renderPvPBattleContent(document.getElementById('tab-battle'));
      }
      if (data.winner && data.winner !== 0) {
        var msg = data.winner === 1 ? '🎉 Chiến thắng!' : '💔 Thua cuộc!';
        app.ui.toast(msg);
        if (isHost) {
          app.player.addGold(data.winner === 1 ? 100 : 20);
          if (data.winner === 1) app.player.pvpWins++;
          else app.player.pvpLosses++;
          app.saveGame();
          app.ui.updateResources();
        }
        var summary = { winner: data.winner, team1Alive: data.team1 ? data.team1.filter(function(p){ return p.hp > 0; }).length : 0, team2Alive: data.team2 ? data.team2.filter(function(p){ return p.hp > 0; }).length : 0, log: data.log || [] };
        setTimeout(function(){ app.ui.showBattleResult(summary, { gold: data.winner === 1 ? 100 : 20 }); }, 1500);
        pvpOnline.stopWatching();
        pvpOnline.leaveRoom();
        app.ui.leavePvP();
      }
    });
  }

  reviveAllPets() {
    if (this.ui.worldMap) {
      const count = this.ui.worldMap.reviveAll();
      if (count > 0) {
        this.ui.toast(`💚 Hồi sinh ${count} pet! Cho ăn để tăng máu.`);
        this.saveGame();
        this.ui.renderWorld();
      } else {
        this.ui.toast('Không có pet nào chết!');
      }
    }
  }
}

const app = new App();
document.addEventListener('DOMContentLoaded', () => app.init());
