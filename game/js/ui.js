function getSkillCategory(s) {
  if (s.healMul || s.type === 'heal' || s.type === 'heal_all') return 'heal';
  if (s.defSelf || s.defUp || s.taunt || s.type === 'selfbuff' || s.type === 'buff' || s.type === 'taunt') return 'defense';
  if (s.effect && (s.effect === 'stun' || s.effect === 'freeze' || s.effect === 'root' || s.effect === 'slow')) return 'control';
  return 'attack';
}

class GameUI {
  constructor(app) {
    this.selectedOnlinePets = [];
    this.app = app;
    this.player = app.player;
    this.currentTab = 'home';
    this.selectedPet = null;
    this.selectedEnemyPets = null;
    this.selectedBreedPet1 = null;
    this.selectedBreedPet2 = null;
    this.battleEngine = new BattleEngine();
    this.battleTimer = null;
    this.currentShopTab = 'pet';
    this._selectedSkillElement = '';
    this.currentPvPBattle = null;
    this.worldMap = null;
    this._worldRefreshTimer = null;
  }

  init() {
    this.render();
    this.bindEvents();
    this.showTab('home');
  }

  render() {
    document.getElementById('app').innerHTML = `
      <div id="game-container">
        <div id="header">
          <div id="header-top">
            <div class="header-left">
              <span id="player-name">${this.player.name}</span>
              <span class="badge">${this.player.pvpRating} 🏆</span>
            </div>
            <div class="header-right">
              <span class="resource"><span class="res-icon">💰</span> <span id="gold-display">${this.player.gold.toLocaleString()}</span></span>
              <span class="resource"><span class="res-icon">💎</span> <span id="diamond-display">${this.player.diamond.toLocaleString()}</span></span>
            </div>
          </div>
          <div id="pet-count-bar">
            🐾 Pet: <span id="pet-count">${this.player.pets.length}</span> | ⚡ Tổng sức mạnh: <span id="total-power">${this.player.totalPower.toLocaleString()}</span>
          </div>
        </div>

        <div id="tab-bar">
          <button class="tab-btn" data-tab="home">🏠 Nhà</button>
          <button class="tab-btn" data-tab="pets">🐾 Pet</button>
          <button class="tab-btn" data-tab="battle">⚔️ Chiến</button>
          <button class="tab-btn" data-tab="breed">🥚 Lai</button>
          <button class="tab-btn" data-tab="world">🗺️ Map</button>
          <button class="tab-btn" data-tab="inventory">🎒 Túi</button>
          <button class="tab-btn" data-tab="shop">🏪 Shop</button>
          <button class="tab-btn" data-tab="rank">🏆 Hạng</button>
    <button class="tab-btn" data-tab="pvpOnline">🌐 PvP Online</button>
    <button class="tab-btn" data-tab="mapOnline">🌍 Map Online</button>
        </div>

        <div id="content">
          <div id="tab-home" class="tab-content"></div>
          <div id="tab-pets" class="tab-content"></div>
          <div id="tab-battle" class="tab-content"></div>
          <div id="tab-breed" class="tab-content"></div>
          <div id="tab-world" class="tab-content"></div>
          <div id="tab-inventory" class="tab-content"></div>
          <div id="tab-shop" class="tab-content"></div>
          <div id="tab-rank" class="tab-content"></div>
          <div id="tab-pvpOnline" class="tab-content"></div>
          <div id="tab-mapOnline" class="tab-content"></div>
        </div>

        <div id="toast"></div>
        <div id="modal-overlay" class="hidden">
          <div id="modal-content"></div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.showTab(btn.dataset.tab));
    });
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.closeModal();
    });
  }

  showTab(tab) {
    // ⚠️ CRITICAL: Khi rời tab world, PHẢI stop mapView + pause exploring. Nếu không, autoTick tiếp tục chạy + queueAction tích luỹ -> treo khi quay lại.
    if (this.currentTab === 'world' && tab !== 'world') {
      if (this._worldRefreshTimer) {
        clearTimeout(this._worldRefreshTimer);
        this._worldRefreshTimer = null;
      }
      if (this.mapView) this.mapView.stop();
      if (this.worldMap) this.worldMap.pauseExploring();
    }
    // ⚠️ Khi quay lại tab world, PHẢI resume exploring để autoTick chạy tiếp.
    if (tab === 'world' && this.currentTab !== 'world') {
      if (this.worldMap) this.worldMap.resumeExploring();
    }
    // Handle mapOnline tab transitions
    if (this.currentTab === 'mapOnline' && tab !== 'mapOnline') {
      if (this._worldRefreshTimer) {
        clearTimeout(this._worldRefreshTimer);
        this._worldRefreshTimer = null;
      }
      if (this.mapView) this.mapView.stop();
      if (this.worldMap && this.worldMap.exploring) this.worldMap.pauseExploring();
    }
    if (tab === 'mapOnline' && this.currentTab !== 'mapOnline') {
      if (this.worldMap && this.worldMap.exploring) this.worldMap.resumeExploring();
    }
    // Pause PvP when leaving battle tab
    if (this.currentTab === 'battle' && tab !== 'battle') {
      if (this.activePvPBattle) this.activePvPBattle.pauseExploring();
      if (this.activePvPMapView) this.activePvPMapView.stop();
    }
    // Resume PvP when returning to battle tab
    if (tab === 'battle' && this.currentTab !== 'battle') {
      if (this.activePvPBattle) this.activePvPBattle.resumeExploring();
      if (this.activePvPMapView) this.activePvPMapView.start();
    }
    this.currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.tab-btn[data-tab="${tab}"]`)?.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const el = document.getElementById(`tab-${tab}`);
    if (el) {
      el.classList.add('active');
      this['render' + tab.charAt(0).toUpperCase() + tab.slice(1)]();
    }
    if (tab !== 'pvpOnline') {
      this.selectedOnlinePets = [];
    }
  }

  updateResources() {
    document.getElementById('gold-display').textContent = this.player.gold.toLocaleString();
    document.getElementById('diamond-display').textContent = this.player.diamond.toLocaleString();
    document.getElementById('pet-count').textContent = this.player.pets.length;
    document.getElementById('total-power').textContent = this.player.totalPower.toLocaleString();
  }

  toast(msg, duration = 2000) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), duration);
  }

  showModal(html) {
    document.getElementById('modal-content').innerHTML = html;
    document.getElementById('modal-overlay').classList.remove('hidden');
  }

  closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
  }

  renderHome() {
    const el = document.getElementById('tab-home');
    const topPets = this.player.getStrongestPets(3);
    el.innerHTML = `
      <div class="section-title">🏠 Trang chủ</div>
      <div class="home-stats">
        <div class="stat-card">🐾 Pet: ${this.player.pets.length}</div>
        <div class="stat-card">⚡ Sức mạnh: ${this.player.totalPower.toLocaleString()}</div>
        <div class="stat-card">🏆 PVP: ${this.player.pvpWins}W - ${this.player.pvpLosses}L</div>
        <div class="stat-card">⭐ Rating: ${this.player.pvpRating}</div>
      </div>
      <div class="section-title">🏆 Đội mạnh nhất</div>
      <div class="pet-grid">
        ${topPets.length ? topPets.map(p => this.petCard(p)).join('') : '<div class="empty-msg">Chưa có pet nào!</div>'}
      </div>
      <div class="quick-actions">
        <button class="btn btn-primary" onclick="app.ui.showTab('pets')">🐾 Xem tất cả pet</button>
        <button class="btn btn-success" onclick="app.ui.showTab('battle')">⚔️ Chiến đấu ngay</button>
        <button class="btn btn-warning" onclick="app.ui.showTab('shop')">🏪 Mua sắm</button>
        <button class="btn btn-info" onclick="app.ui.showTab('inventory')">🎒 Túi đồ</button>
      </div>
    `;
  }

  petCard(pet, showEquip = false) {
    const stats = pet.getDisplayStats();
    const hpPct = Math.floor(pet.hp / pet.maxHp * 100);
    const enPct = Math.floor(pet.energy / pet.maxEnergy * 100);
    return `
      <div class="pet-card" data-pet-id="${pet.id}" onclick="app.ui.showPetDetail('${pet.id}')">
        <div class="pet-card-header ${pet.type}">
          <span class="pet-emoji">${pet.emoji}</span>
          <span class="pet-level">Lv.${pet.level}</span>
        </div>
        <div class="pet-card-body">
          <div class="pet-name">${pet.name}</div>
          <div class="pet-type-badge ${pet.type}">${ELEMENTS[getPetElement(pet.baseId)]?.icon || ''} ${DATA.PET_TYPES[pet.type]?.name || pet.type}</div>
          <div class="pet-stats-mini">
            <span>❤️ ${stats.hp}/${stats.maxHp}</span>
            <span>⚔️ ${stats.atk}</span>
            <span>🛡️ ${stats.def}</span>
            <span>💨 ${stats.spd}</span>
          </div>
          <div class="pet-bars">
            <div class="bar-container"><div class="bar hp" style="width:${hpPct}%"></div></div>
            <div class="bar-container"><div class="bar energy" style="width:${enPct}%"></div></div>
          </div>
          <div class="pet-power">⚡ ${pet.getPower().toLocaleString()}</div>
          ${pet.weapon ? `<div class="pet-equip">🔪 ${pet.weapon.name}${pet.weapon.enhanceLevel ? ` +${pet.weapon.enhanceLevel}` : ''}</div>` : ''}
          ${pet.armor ? `<div class="pet-equip">🛡️ ${pet.armor.name}${pet.armor.enhanceLevel ? ` +${pet.armor.enhanceLevel}` : ''}</div>` : ''}
        </div>
      </div>
    `;
  }

  renderPets() {
    const el = document.getElementById('tab-pets');
    if (!this.player.pets.length) {
      el.innerHTML = `
        <div class="section-title">🐾 Danh sách Pet</div>
        <div class="empty-msg">Bạn chưa có pet nào! Nhận pet miễn phí hoặc mua ở shop.</div>
        <button class="btn btn-primary" onclick="app.claimFreePet()">🎁 Nhận pet miễn phí</button>
        <button class="btn btn-warning" onclick="app.ui.showTab('shop')">🏪 Đến shop</button>
      `;
      return;
    }
    el.innerHTML = `
      <div class="section-title">🐾 Danh sách Pet (${this.player.pets.length})</div>
      <div class="pet-list-actions">
        <button class="btn btn-primary btn-sm" onclick="app.claimFreePet()">🎁 Nhận pet mới</button>
        <button class="btn btn-danger btn-sm" onclick="app.ui.showReleasePetsModal()">🗑️ Thả hàng loạt</button>
      </div>
      <div class="pet-grid">${this.player.pets.map(p => this.petCard(p)).join('')}</div>
    `;
  }

  showPetDetail(petId) {
    const pet = this.player.getPet(petId);
    if (!pet) return;
    this.selectedPet = pet;
    const stats = pet.getDisplayStats();
    const hpPct = Math.floor(pet.hp / pet.maxHp * 100);
    const enPct = Math.floor(pet.energy / pet.maxEnergy * 100);
    const affPct = Math.floor(pet.affinity);
    const typeInfo = DATA.PET_TYPES[pet.type];

    const breedAvailable = pet.canBreed() ? '✅ Có thể sinh sản' : '❌ Cần đủ cấp & năng lượng';
    const breedInfo = pet.level >= DATA.BREED_START_LEVEL
      ? `Có thể lai ở cấp: ${this.getBreedLevels(pet).join(', ')}`
      : `Cần đạt cấp ${DATA.BREED_START_LEVEL} để sinh sản`;

    const foodHtml = DATA.ITEMS.food.map((f, i) =>
      `<button class="btn btn-sm btn-food" onclick="app.feedPet('${pet.id}', ${i})">${f.name} (💰${f.price})</button>`
    ).join('');

    const bathHtml = DATA.ITEMS.bath.map((b, i) =>
      `<button class="btn btn-sm btn-bath" onclick="app.bathPet('${pet.id}', ${i})">${b.name} (💰${b.price})</button>`
    ).join('');

    const petElement = getPetElement(pet.baseId);
    const elemInfo = ELEMENTS[petElement];

    this.showModal(`
      <div class="pet-detail">
        <div class="detail-header ${pet.type}">
          <span class="big-emoji">${pet.emoji}</span>
          <div>
            <div class="detail-name">${pet.name}</div>
            <div class="detail-type-badge ${pet.type}">${typeInfo?.name || pet.type}</div>
            <div class="detail-desc">${pet.desc}</div>
            <div class="detail-level">Cấp ${pet.level} | Thế hệ ${pet.generation} | ${elemInfo?.icon || ''} ${elemInfo?.name || ''}</div>
            <div class="detail-battles">⚔️ ${pet.totalBattles} trận (${pet.wins}W - ${pet.losses}L)</div>
          </div>
        </div>
        <div class="detail-power">⚡ Sức mạnh: ${pet.getPower().toLocaleString()}</div>
        <div class="detail-bars">
          <div class="bar-label">❤️ Máu: ${stats.hp}/${stats.maxHp}</div>
          <div class="bar-container"><div class="bar hp" style="width:${hpPct}%"></div></div>
          <div class="bar-label">⚡ Năng lượng: ${stats.energy}/${stats.maxEnergy}</div>
          <div class="bar-container"><div class="bar energy" style="width:${enPct}%"></div></div>
          <div class="bar-label">💕 Thân thiết: ${pet.affinity}/100</div>
          <div class="bar-container"><div class="bar affinity" style="width:${affPct}%"></div></div>
        </div>
        <div class="detail-stats">
          <div class="stat-row"><span>⚔️ Tấn công:</span><span>${stats.atk}${pet.weapon ? ` (${pet.weapon.atk}${pet.weapon.enhanceLevel ? ` +${Math.floor(pet.weapon.enhanceLevel*10)}%` : ''})` : ''}</span></div>
          <div class="stat-row"><span>🛡️ Phòng thủ:</span><span>${stats.def}${pet.armor ? ` (${pet.armor.def}${pet.armor.enhanceLevel ? ` +${Math.floor(pet.armor.enhanceLevel*10)}%` : ''})` : ''}</span></div>
          <div class="stat-row"><span>💨 Tốc độ:</span><span>${stats.spd}</span></div>
          <div class="stat-row"><span>📊 EXP:</span><span>${pet.exp}/${pet.expToNext}</span></div>
        </div>
        <div class="detail-section">
          <div class="section-title">🍖 Cho ăn</div>
          <div class="btn-group">${foodHtml}</div>
        </div>
        <div class="detail-section">
          <div class="section-title">🛁 Tắm rửa</div>
          <div class="btn-group">${bathHtml}</div>
        </div>
        <div class="detail-section">
          <div class="section-title">🎮 Chơi đùa (💰20)</div>
          <button class="btn btn-sm btn-play" onclick="app.playPet('${pet.id}')">🎮 Chơi với ${pet.name}</button>
        </div>
        <div class="detail-section">
          <div class="section-title">🏋️ Huấn luyện (💰${50 + pet.level * 10})</div>
          <button class="btn btn-sm btn-train" onclick="app.trainPet('${pet.id}')">🏋️ Huấn luyện</button>
        </div>
        <div class="detail-section">
          <div class="section-title">🔧 Trang bị</div>
          ${this.renderEquipSection(pet)}
        </div>
        <div class="detail-section">
          <div class="section-title">📖 Kỹ năng (${pet.skills.length}/${pet.getMaxSkillSlots()})</div>
          ${this.renderPetSkills(pet)}
          <div style="font-size:10px;color:var(--text-dim);margin-top:4px">
            🔒 Tự động: ${pet.getAutoSkillCount(pet.level)}/5 (cấp 10/20/40/70 mở thêm ô skill)
          </div>
          ${pet.pendingSkillChoices && pet.pendingSkillChoices.length > 0 ? `
            <div class="pending-skill-choices" style="margin-top:8px">
              <div style="font-size:12px;font-weight:600;margin-bottom:4px">🔔 Lựa chọn kỹ năng mới</div>
              ${pet.pendingSkillChoices.map(choice => `
                <div class="skill-choice-item" style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;margin:3px 0;background:rgba(255,255,255,0.03);border-radius:6px;font-size:11px">
                  <div>
                    <div><strong>${choice.name}</strong> <span style="color:var(--text-dim);font-size:10px">${choice.desc}</span></div>
                    <div style="color:var(--text-dim);font-size:10px">CD: ${choice.cooldownMax || 1} lượt</div>
                  </div>
                  <button class="btn btn-sm btn-success" onclick="app.ui.applyPendingSkillChoice('${pet.id}', '${choice.id}')">Chọn</button>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${this.renderProficiencySummary(pet)}
          ${pet.getPurchasableSlots() > 0 ? `<button class="btn btn-sm btn-info" onclick="app.ui.showTab('inventory')">📚 Học kỹ năng (còn ${pet.getPurchasableSlots()} ô trống)</button>` : '<div class="empty-msg" style="font-size:11px">Đã đầy kỹ năng</div>'}
        </div>
        <div class="detail-section">
          <div class="section-title">🥚 Sinh sản</div>
          <div class="breed-info">${breedInfo}</div>
          <div class="breed-status">${breedAvailable}</div>
        </div>
        <div class="detail-section">
          <div class="section-title">🗑️ Thả pet</div>
          <button class="btn btn-sm btn-danger" onclick="app.ui.confirmReleasePet('${pet.id}')">🗑️ Thả ${pet.name}</button>
        </div>
        <button class="btn btn-close" onclick="app.ui.closeModal()">Đóng</button>
      </div>
    `);
  }

  confirmReleasePet(petId) {
    const pet = this.player.getPet(petId);
    if (!pet) return;
    const elem = getPetElement(pet.baseId);
    const elemName = (ELEMENTS[elem] || {}).name || '';
    this._pendingReleaseId = petId;
    this._pendingReleaseName = pet.name;
    this.showConfirm(`Bạn có chắc muốn thả ${pet.emoji} ${pet.name} (${elemName})? Hành động này không thể hoàn tác!`, () => {
      app.ui.doReleaseSingle();
    });
  }

  doReleaseSingle() {
    if (this._pendingReleaseId) {
      this.player.removePet(this._pendingReleaseId);
      this._pendingReleaseId = null;
      this._pendingReleaseName = null;
      this.closeModal();
      this.renderPets();
      this.toast('🗑️ Đã thả pet');
    }
  }

  applyPendingSkillChoice(petId, skillId) {
    const pet = this.player.getPet(petId);
    if (!pet) return;
    const success = pet.consumeSkillChoice(skillId);
    if (!success) {
      this.toast('Không thể chọn kỹ năng này. Vui lòng thử lại.');
      return;
    }
    this.app.saveGame();
    this.showPetDetail(petId);
    this.toast('✅ Đã học kỹ năng mới!');
  }

  showReleasePetsModal() {
    if (this.player.pets.length === 0) {
      this.toast('Bạn không có pet nào để thả!');
      return;
    }
    this.showModal(`
      <div class="release-pets-modal">
        <div class="modal-title">🗑️ Thả Pet</div>
        <p>Chọn pet muốn thả. Hành động này không thể hoàn tác!</p>
        <div class="release-controls">
          <button class="btn btn-sm btn-secondary" onclick="document.querySelectorAll('.release-check').forEach(c => c.checked = true)">✅ Chọn tất cả</button>
          <button class="btn btn-sm btn-secondary" onclick="document.querySelectorAll('.release-check').forEach(c => c.checked = false)">❌ Bỏ chọn</button>
        </div>
        <div class="pet-grid release-grid">
          ${this.player.pets.map(p => {
            const elem = getPetElement(p.baseId);
            const elemIcon = (ELEMENTS[elem] || {}).icon || '';
            return `<label class="release-pet-item">
              <input type="checkbox" class="release-check" value="${p.id}">
              <span>${p.emoji}</span>
              <span>${p.name}</span>
              <span class="pet-lvl">Lv.${p.level}</span>
              <span>${elemIcon}</span>
            </label>`;
          }).join('')}
        </div>
        <button class="btn btn-danger" onclick="app.ui.executeReleasePets()">🗑️ Thả pet đã chọn</button>
        <button class="btn btn-close" onclick="app.ui.closeModal()">Đóng</button>
      </div>
    `);
  }

  executeReleasePets() {
    const checks = document.querySelectorAll('.release-check:checked');
    if (checks.length === 0) {
      this.toast('Chưa chọn pet nào!');
      return;
    }
    const ids = Array.from(checks).map(c => c.value);
    if (ids.length === this.player.pets.length) {
      this._pendingReleaseIds = ids;
      this.showConfirm('Bạn sắp thả TẤT CẢ pet! Bạn có chắc chắn?', () => {
        app.ui.doRelease(app.ui._pendingReleaseIds);
      });
    } else {
      this.doRelease(ids);
    }
  }

  doRelease(ids) {
    for (const id of ids) {
      this.player.removePet(id);
    }
    this._pendingReleaseIds = null;
    this.closeModal();
    this.renderPets();
    this.toast(`🗑️ Đã thả ${ids.length} pet`);
  }

  showConfirm(message, onConfirm) {
    this.showModal(`
      <div class="confirm-modal">
        <div class="modal-title">⚠️ Xác nhận</div>
        <p>${message}</p>
        <button class="btn btn-danger" onclick="app.ui.closeModal(); (${onConfirm.toString()})()">Xác nhận</button>
        <button class="btn btn-secondary" onclick="app.ui.closeModal()">Hủy</button>
      </div>
    `);
  }

  getBreedLevels(pet) {
    const levels = [];
    for (let lvl = DATA.BREED_START_LEVEL; lvl <= pet.level; lvl += DATA.BREED_INTERVAL) {
      levels.push(lvl);
    }
    return levels;
  }

  renderPetSkills(pet) {
    if (!pet.skills || pet.skills.length === 0) {
      return '<div class="empty-msg" style="font-size:11px">Pet chưa có kỹ năng nào</div>';
    }
    const categoryLabels = { attack: '⚔️ Tấn công', defense: '🛡️ Phòng thủ', control: '🌀 Khống chế', heal: '💚 Hồi phục' };
    const categoryColors = { attack: '#e74c3c', defense: '#3498db', control: '#9b59b6', heal: '#2ecc71' };
    const element = getPetElement(pet.baseId);
    const elemIcon = (ELEMENTS[element] || {}).icon || '';
    const purchasedSet = new Set(pet.purchasedSkills || []);
    const profStars = ['', '⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'];
    const profColors = ['#666', '#888', '#FFD700', '#FFAA00', '#FF6600', '#FF2200'];
    return pet.skills.map(s => {
      const cat = getSkillCategory(s);
      const label = categoryLabels[cat] || '⚔️';
      const color = categoryColors[cat] || '#888';
      const isPurchased = purchasedSet.has(s.id || s.name);
      const profLv = pet.getProficiencyLevel(s.id || s.name);
      const profStar = profStars[profLv] || '';
      const profColor = profColors[profLv];
      const profBonus = pet.getSkillMasteryBonus(s.id || s.name);
      return `<div class="skill-item" style="border-left: 3px solid ${color}; padding: 4px 8px; margin: 3px 0; background: rgba(255,255,255,0.04); border-radius: 4px; font-size: 11px;">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span><strong>${elemIcon} ${s.name}</strong> ${isPurchased ? '<span style="color:#f39c12;font-size:9px">📖</span>' : '<span style="color:#888;font-size:9px">🔰</span>'}</span>
          <span style="color:${color};font-size:9px">${label} ${profStar ? `<span style="color:${profColor};font-size:9px;margin-left:4px">${profStar}</span>` : ''}</span>
        </div>
        <div style="color:var(--text-dim);font-size:10px">${s.desc || ''} ${s.cooldownMax ? `(CD: ${s.cooldownMax} lượt)` : ''}${profBonus > 0 ? ` <span style="color:#2ecc71">+${profBonus} hiệu lực</span>` : ''}</div>
      </div>`;
    }).join('');
  }

  renderProficiencySummary(pet) {
    const elem = getPetElement(pet.baseId);
    const elemIcon = (ELEMENTS[elem] || {}).icon || '';
    const elemLv = pet.getElementProficiencyLevel(elem);
    const elemBonus = pet.getElementMasteryBonus(elem);
    if (elemLv === 0 && Object.keys(pet.skillProficiency || {}).length === 0) return '';
    const profStars = ['', '⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'];
    return `<div style="font-size:10px;color:var(--text-dim);margin-top:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,0.05)">
      <span>🏆 Thuần thục ${elemIcon}: ${profStars[elemLv]} ${elemBonus > 0 ? `<span style="color:#2ecc71">(+${elemBonus} hiệu lực nguyên tố)</span>` : ''}</span>
    </div>`;
  }

  renderEquipSection(pet) {
    const weapons = this.player.equipment.weapons;
    const armors = this.player.equipment.armors;
    let html = '';
    if (pet.weapon) {
      const enh = pet.weapon.enhanceLevel || 0;
      const enhStr = enh > 0 ? ` +${enh}` : '';
      html += `<div class="equipped-item">🔪 Đang trang bị: ${pet.weapon.name}${enhStr} (ATK:${pet.weapon.atk})`;
      if (enh > 0) html += ` <span style="color:#FFD700">✨+${Math.floor(enh * 10)}%</span>`;
      html += ` <button class="btn btn-sm btn-danger" onclick="app.unequip('${pet.id}', 'weapon')">Tháo</button>`;
      html += ` <button class="btn btn-sm btn-warning" onclick="app.ui.showEnhanceWeapon('${pet.id}')">🔨 Nâng cấp</button>`;
      html += `</div>`;
    }
    if (pet.armor) {
      const enh = pet.armor.enhanceLevel || 0;
      const enhStr = enh > 0 ? ` +${enh}` : '';
      html += `<div class="equipped-item">🛡️ Đang trang bị: ${pet.armor.name}${enhStr} (DEF:${pet.armor.def})`;
      if (enh > 0) html += ` <span style="color:#FFD700">✨+${Math.floor(enh * 10)}%</span>`;
      html += ` <button class="btn btn-sm btn-danger" onclick="app.unequip('${pet.id}', 'armor')">Tháo</button>`;
      html += ` <button class="btn btn-sm btn-warning" onclick="app.ui.showEnhanceArmor('${pet.id}')">🔨 Nâng cấp</button>`;
      html += `</div>`;
    }
    if (weapons.length || armors.length) {
      html += '<div class="equip-grid">';
      weapons.forEach((w, i) => {
        const enh = w.enhanceLevel || 0;
        const enhStr = enh > 0 ? ` +${enh}` : '';
        html += `<button class="btn btn-sm btn-equip" onclick="app.equipWeapon('${pet.id}', ${i})">🔪 ${w.name}${enhStr} (ATK:${w.atk})</button>`;
      });
      armors.forEach((a, i) => {
        const enh = a.enhanceLevel || 0;
        const enhStr = enh > 0 ? ` +${enh}` : '';
        html += `<button class="btn btn-sm btn-equip" onclick="app.equipArmor('${pet.id}', ${i})">🛡️ ${a.name}${enhStr} (DEF:${a.def})</button>`;
      });
      html += '</div>';
    } else {
      html += '<div class="empty-msg">Chưa có trang bị. Mua ở shop!</div>';
    }
    return html;
  }

  selectSkillElement(elem) {
    this._selectedSkillElement = elem;
    this.showShopTab('skill');
  }

  renderSkillShopItems() {
    let allSkills = [];
    const elements = this._selectedSkillElement ? [this._selectedSkillElement] : Object.keys(ELEMENT_SKILLS);
    for (const elem of elements) {
      for (const s of getShopSkillCatalog(elem)) {
        allSkills.push({ ...s, element: elem });
      }
    }

    const ownedBookIds = new Set(this.player.skillBooks.map(b => b.id));
    const elementIcons = {};
    for (const e of Object.keys(ELEMENTS)) {
      elementIcons[e] = ELEMENTS[e].icon;
    }

    const catLabels = { attack: '⚔️ Tấn công', defense: '🛡️ Hỗ trợ', control: '🌀 Khống chế', heal: '💚 Hồi phục' };
    const catColors = { attack: '#e74c3c', defense: '#3498db', control: '#9b59b6', heal: '#2ecc71' };

    if (allSkills.length === 0) {
      return '<div class="empty-msg">Không có kỹ năng nào</div>';
    }

    return allSkills.map(s => {
      const isOwned = ownedBookIds.has(s.id);
      const price = this._getSkillPrice(s);
      const elemIcon = elementIcons[s.element] || '';
      const cat = getSkillCategory(s);
      const label = catLabels[cat] || '⚔️';
      const color = catColors[cat] || '#888';

      return `<div class="shop-item skill-shop-item" style="border-left: 3px solid ${this._getElementColor(s.element)}; margin:4px 0; padding:6px 8px; background:rgba(255,255,255,0.03); border-radius:4px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <span style="font-weight:bold">${elemIcon} ${s.name}</span>
            <span style="color:${color};font-size:9px;margin-left:6px">${label}</span>
            <span style="color:var(--text-dim);font-size:10px;margin-left:4px">${s.desc || ''}</span>
            <span style="font-size:9px;color:#666;display:block">CD: ${s.cooldownMax || 1} lượt</span>
          </div>
          <div>
            ${isOwned ? '<span style="color:#f39c12;font-size:11px">📖 Đã mua</span>' :
              `<button class="btn btn-sm btn-primary" onclick="app.ui.buySkillBook('${s.id}')">💎 10</button>`}
          </div>
        </div>
      </div>`;
    }).join('');
  }

  _getSkillPrice(skillDef) {
    const idx = this._getSkillIndex(skillDef);
    const tiers = DATA.SKILL_TIER_RANGES;
    for (let i = 0; i < tiers.length; i++) {
      if (idx <= tiers[i].maxIdx) {
        return DATA.SKILL_PRICES[tiers[i].tier];
      }
    }
    return DATA.SKILL_PRICES[5];
  }

  _getSkillIndex(skillDef) {
    let idx = 0;
    for (const elem of Object.keys(ELEMENT_SKILLS)) {
      for (const s of ELEMENT_SKILLS[elem]) {
        if (s.id === skillDef.id) return idx;
        idx++;
      }
    }
    return idx;
  }

  _getElementColor(element) {
    const elemDef = ELEMENTS[element];
    if (!elemDef) return '#888';
    const colorMap = { fire: '#e74c3c', water: '#3498db', earth: '#27ae60', wind: '#1abc9c', lightning: '#f1c40f', ice: '#00bcd4', dark: '#9b59b6', light: '#f39c12', storm: '#4DD0E1' };
    return colorMap[element] || '#888';
  }

  buySkillBook(skillId) {
    // Find skill definition
    let skillDef = null;
    for (const elem of Object.keys(ELEMENT_SKILLS)) {
      skillDef = ELEMENT_SKILLS[elem].find(s => s.id === skillId);
      if (skillDef) break;
    }
    if (!skillDef) { this.toast('Kỹ năng không tồn tại!'); return; }

    // Check already owned
    if (this.player.skillBooks.some(b => b.id === skillId)) {
      this.toast('Bạn đã có sách này rồi!');
      return;
    }

    const price = 10;
    if (this.player.diamond < price) { this.toast(`Không đủ ruby! Cần ${price}💎`); return; }

    skillDef.element = skillDef.element || (Object.keys(ELEMENT_SKILLS).find(elem => (ELEMENT_SKILLS[elem] || []).some(s => s.id === skillId)) || '');
    this.player.diamond -= price;
    this.player.addSkillBook(skillDef);
    this.app.saveGame();
    this.renderAll();
    this.toast(`📖 Đã mua sách ${skillDef.name} bằng ${price}💎! Vào Túi đồ để dạy cho pet.`);
  }

  // ===== INVENTORY TAB =====
  renderInventory() {
    const el = document.getElementById('tab-inventory');
    const p = this.player;
    const wCount = p.equipment.weapons.length;
    const aCount = p.equipment.armors.length;
    const fCount = (p.items.food || []).length;
    const bathCount = (p.items.bath || []).length;
    const buffCount = (p.items.buff || []).length;
    const sCount = p.skillBooks.length;

    let html = `<div class="section-title">🎒 Túi Đồ</div>`;

    // Weapons
    html += `<div class="sub-title" style="margin-top:8px">🔪 Vũ Khí (${wCount})</div>`;
    if (wCount === 0) html += `<div class="empty-msg" style="font-size:11px">Trống</div>`;
    else {
      p.equipment.weapons.forEach((w, i) => {
        const enh = w.enhanceLevel || 0;
        const enhStr = enh > 0 ? ` +${enh}` : '';
        const enhPct = enh > 0 ? ` <span style="color:#FFD700">✨+${Math.floor(enh * 10)}%</span>` : '';
        html += `<div class="inv-item" style="display:flex;align-items:center;gap:6px;padding:6px 8px;background:var(--card);border-radius:8px;margin:3px 0;font-size:12px">
          <span style="flex:1">${w.name}${enhStr} <span style="color:var(--accent)">(ATK:${w.atk})</span>${enhPct}</span>
          <button class="btn btn-sm btn-info" onclick="app.ui.equipWeaponFromBag(${i})">Trang bị</button>
          <button class="btn btn-sm btn-danger" onclick="app.ui.discardWeapon(${i})">Vứt</button>
        </div>`;
      });
    }

    // Armors
    html += `<div class="sub-title" style="margin-top:8px">🛡️ Giáp (${aCount})</div>`;
    if (aCount === 0) html += `<div class="empty-msg" style="font-size:11px">Trống</div>`;
    else {
      p.equipment.armors.forEach((a, i) => {
        const enh = a.enhanceLevel || 0;
        const enhStr = enh > 0 ? ` +${enh}` : '';
        const enhPct = enh > 0 ? ` <span style="color:#FFD700">✨+${Math.floor(enh * 10)}%</span>` : '';
        html += `<div class="inv-item" style="display:flex;align-items:center;gap:6px;padding:6px 8px;background:var(--card);border-radius:8px;margin:3px 0;font-size:12px">
          <span style="flex:1">${a.name}${enhStr} <span style="color:var(--accent)">(DEF:${a.def})</span>${enhPct}</span>
          <button class="btn btn-sm btn-info" onclick="app.ui.equipArmorFromBag(${i})">Trang bị</button>
          <button class="btn btn-sm btn-danger" onclick="app.ui.discardArmor(${i})">Vứt</button>
        </div>`;
      });
    }

    // Food
    html += `<div class="sub-title" style="margin-top:8px">🥩 Thức Ăn (${fCount})</div>`;
    if (fCount === 0) html += `<div class="empty-msg" style="font-size:11px">Trống</div>`;
    else {
      (p.items.food || []).forEach((f, i) => {
        html += `<div class="inv-item" style="display:flex;align-items:center;gap:6px;padding:6px 8px;background:var(--card);border-radius:8px;margin:3px 0;font-size:12px">
          <span style="flex:1">${f.name}</span>
          <button class="btn btn-sm btn-success" onclick="app.ui.useFoodFromBag(${i})">Cho ăn</button>
          <button class="btn btn-sm btn-danger" onclick="app.ui.discardFood(${i})">Vứt</button>
        </div>`;
      });
    }

    // Bath
    html += `<div class="sub-title" style="margin-top:8px">🧴 Vật Phẩm Tắm (${bathCount})</div>`;
    if (bathCount === 0) html += `<div class="empty-msg" style="font-size:11px">Trống</div>`;
    else {
      (p.items.bath || []).forEach((b, i) => {
        html += `<div class="inv-item" style="display:flex;align-items:center;gap:6px;padding:6px 8px;background:var(--card);border-radius:8px;margin:3px 0;font-size:12px">
          <span style="flex:1">${b.name} <span style="color:var(--text-dim)">(+${b.energy} NL)</span></span>
          <button class="btn btn-sm btn-success" onclick="app.ui.useBathFromBag(${i})">Tắm</button>
          <button class="btn btn-sm btn-danger" onclick="app.ui.discardBath(${i})">Vứt</button>
        </div>`;
      });
    }

    // Buffs
    html += `<div class="sub-title" style="margin-top:8px">⚡ Vật Phẩm Hỗ Trợ (${buffCount})</div>`;
    if (buffCount === 0) html += `<div class="empty-msg" style="font-size:11px">Trống</div>`;
    else {
      (p.items.buff || []).forEach((b, i) => {
        html += `<div class="inv-item" style="display:flex;align-items:center;gap:6px;padding:6px 8px;background:var(--card);border-radius:8px;margin:3px 0;font-size:12px">
          <span style="flex:1">${b.name} ${b.type === 'heal' ? `(Hồi ${b.value} máu)` : `(x${b.value} ${b.type === 'atk' ? 'ATK' : 'DEF'}, ${b.turns} lượt)`}</span>
          <button class="btn btn-sm btn-danger" onclick="app.ui.discardBuff(${i})">Vứt</button>
        </div>`;
      });
    }

    // Skill books
    html += `<div class="sub-title" style="margin-top:8px">📖 Sách Kỹ Năng (${sCount})</div>`;
    if (sCount === 0) html += `<div class="empty-msg" style="font-size:11px">Trống</div>`;
    else {
      p.skillBooks.forEach((sb, i) => {
        const elem = (ELEMENTS[sb.element] || {}).icon || '📖';
        html += `<div class="inv-item" style="display:flex;align-items:center;gap:6px;padding:6px 8px;background:var(--card);border-radius:8px;margin:3px 0;font-size:12px">
          <span style="flex:1">${elem} ${sb.name} <span style="color:var(--text-dim);font-size:10px">${sb.desc || ''}</span></span>
          <button class="btn btn-sm btn-primary" onclick="app.ui.learnSkillFromBag(${i})">Dạy</button>
          <button class="btn btn-sm btn-danger" onclick="app.ui.discardSkillBook(${i})">Vứt</button>
        </div>`;
      });
    }

    el.innerHTML = html;
  }

  // ===== INVENTORY ACTIONS =====
  equipWeaponFromBag(idx) {
    const weapons = this.player.equipment.weapons;
    if (idx < 0 || idx >= weapons.length) return;
    const weapon = weapons[idx];
    const pets = this.player.pets.filter(p => !p.dead && p.hp > 0);
    if (pets.length === 0) { this.toast('Không có pet khả dụng!'); return; }
    this._showPetSelector(pets, 'Trang bị ' + weapon.name, (pet) => {
      this.app.equipWeapon(pet.id, idx);
      this.renderInventory();
      this.toast(`✅ Đã trang bị ${weapon.name} cho ${pet.name}`);
    });
  }

  equipArmorFromBag(idx) {
    const armors = this.player.equipment.armors;
    if (idx < 0 || idx >= armors.length) return;
    const armor = armors[idx];
    const pets = this.player.pets.filter(p => !p.dead && p.hp > 0);
    if (pets.length === 0) { this.toast('Không có pet khả dụng!'); return; }
    this._showPetSelector(pets, 'Trang bị ' + armor.name, (pet) => {
      this.app.equipArmor(pet.id, idx);
      this.renderInventory();
      this.toast(`✅ Đã trang bị ${armor.name} cho ${pet.name}`);
    });
  }

  useFoodFromBag(idx) {
    const foods = this.player.items.food;
    if (idx < 0 || idx >= foods.length) return;
    const food = foods[idx];
    const pets = this.player.pets.filter(p => !p.dead);
    if (pets.length === 0) { this.toast('Không có pet!'); return; }
    this._showPetSelector(pets, 'Cho ăn ' + food.name, (pet) => {
      pet.feed(food);
      this.player.removeItem('food', idx);
      this.app.saveGame();
      this.renderInventory();
      this.toast(`✅ ${pet.name} đã ăn ${food.name}`);
    });
  }

  useBathFromBag(idx) {
    const baths = this.player.items.bath;
    if (idx < 0 || idx >= baths.length) return;
    const bath = baths[idx];
    const pets = this.player.pets.filter(p => !p.dead);
    if (pets.length === 0) { this.toast('Không có pet!'); return; }
    this._showPetSelector(pets, 'Tắm ' + bath.name, (pet) => {
      pet.bath(bath);
      this.player.removeItem('bath', idx);
      this.app.saveGame();
      this.renderInventory();
      this.toast(`✅ ${pet.name} đã tắm! +${bath.energy} năng lượng`);
    });
  }

  learnSkillFromBag(idx) {
    if (idx < 0 || idx >= this.player.skillBooks.length) return;
    const sb = this.player.skillBooks[idx];
    const pets = this.player.pets.filter(p => !p.dead && p.canLearnSkill());
    if (pets.length === 0) { this.toast('Không có pet nào còn ô kỹ năng trống!'); return; }
    this._showPetSelector(pets, 'Dạy ' + sb.name, (pet) => {
      // Find skill definition
      let skillDef = null;
      for (const elem of Object.keys(ELEMENT_SKILLS)) {
        skillDef = ELEMENT_SKILLS[elem].find(s => s.id === sb.id);
        if (skillDef) break;
      }
      if (!skillDef) { this.toast('Lỗi: không tìm thấy kỹ năng!'); return; }
      pet.learnSkill(skillDef);
      this.player.removeSkillBook(idx);
      this.app.saveGame();
      this.renderInventory();
      this.toast(`✅ ${pet.name} đã học ${sb.name}!`);
    });
  }

  discardWeapon(idx) {
    const w = this.player.equipment.weapons[idx];
    if (!w) return;
    this.player.equipment.weapons.splice(idx, 1);
    this.app.saveGame();
    this.renderInventory();
    this.toast(`🗑️ Đã vứt ${w.name}`);
  }

  discardArmor(idx) {
    const a = this.player.equipment.armors[idx];
    if (!a) return;
    this.player.equipment.armors.splice(idx, 1);
    this.app.saveGame();
    this.renderInventory();
    this.toast(`🗑️ Đã vứt ${a.name}`);
  }

  discardFood(idx) {
    const f = (this.player.items.food || [])[idx];
    if (!f) return;
    this.player.removeItem('food', idx);
    this.app.saveGame();
    this.renderInventory();
    this.toast(`🗑️ Đã vứt ${f.name}`);
  }

  discardBath(idx) {
    const b = (this.player.items.bath || [])[idx];
    if (!b) return;
    this.player.removeItem('bath', idx);
    this.app.saveGame();
    this.renderInventory();
    this.toast(`🗑️ Đã vứt ${b.name}`);
  }

  discardBuff(idx) {
    const b = (this.player.items.buff || [])[idx];
    if (!b) return;
    this.player.removeItem('buff', idx);
    this.app.saveGame();
    this.renderInventory();
    this.toast(`🗑️ Đã vứt ${b.name}`);
  }

  showEnhanceWeapon(petId) {
    const pet = this.player.getPet(petId);
    if (!pet || !pet.weapon) return;
    const w = pet.weapon;
    const enh = w.enhanceLevel || 0;
    const chance = getEnhanceChance(enh);
    const cost = 500 + enh * 100;
    const atkBonus = Math.floor(enh * 10);
    const nextAtkBonus = Math.floor((enh + 1) * 10);
    const destroyChance = enh >= 50 ? 0.02 + (enh - 50) * 0.003 : 0;
    const penaltyLvl = enh >= 50 ? 3 : 1;

    this.showModal(`
      <div class="modal-title">🔨 Nâng cấp Vũ khí: ${w.name}</div>
      <div style="text-align:center;padding:12px">
        <div style="font-size:18px;margin-bottom:8px">${w.name}</div>
        <div style="margin:8px 0">Cấp hiện tại: <strong>+${enh}</strong></div>
        <div style="margin:4px 0">ATK: ${w.atk} → <span style="color:#2ecc71">${w.atk} +${atkBonus}%</span></div>
        <div style="margin:4px 0">Kế tiếp: <span style="color:#FFD700">+${nextAtkBonus}%</span></div>
        <div style="margin:8px 0;padding:8px;background:rgba(255,255,255,0.05);border-radius:8px">
          <div>Tỉ lệ thành công: <span style="color:${chance >= 0.5 ? '#2ecc71' : (chance >= 0.2 ? '#f39c12' : '#e74c3c')}">${(chance * 100).toFixed(0)}%</span></div>
          ${destroyChance > 0 ? `<div style="color:#e74c3c">Vỡ: ${(destroyChance * 100).toFixed(1)}%</div>` : ''}
          <div>Phí: 💰 ${cost.toLocaleString()}</div>
          <div>Thất bại: xuống -${penaltyLvl} cấp</div>
        </div>
        <button class="btn btn-warning" onclick="app.ui.doEnhanceWeapon('${petId}')">🔨 Đập đá (💰${cost.toLocaleString()})</button>
        <button class="btn btn-sm" onclick="app.ui.closeModal()" style="margin-top:8px">Đóng</button>
      </div>
    `);
  }

  showEnhanceArmor(petId) {
    const pet = this.player.getPet(petId);
    if (!pet || !pet.armor) return;
    const a = pet.armor;
    const enh = a.enhanceLevel || 0;
    const chance = getEnhanceChance(enh);
    const cost = 500 + enh * 100;
    const defBonus = Math.floor(enh * 10);
    const nextDefBonus = Math.floor((enh + 1) * 10);
    const destroyChance = enh >= 50 ? 0.02 + (enh - 50) * 0.003 : 0;
    const penaltyLvl = enh >= 50 ? 3 : 1;

    this.showModal(`
      <div class="modal-title">🔨 Nâng cấp Giáp: ${a.name}</div>
      <div style="text-align:center;padding:12px">
        <div style="font-size:18px;margin-bottom:8px">${a.name}</div>
        <div style="margin:8px 0">Cấp hiện tại: <strong>+${enh}</strong></div>
        <div style="margin:4px 0">DEF: ${a.def} → <span style="color:#2ecc71">${a.def} +${defBonus}%</span></div>
        <div style="margin:4px 0">Kế tiếp: <span style="color:#FFD700">+${nextDefBonus}%</span></div>
        <div style="margin:8px 0;padding:8px;background:rgba(255,255,255,0.05);border-radius:8px">
          <div>Tỉ lệ thành công: <span style="color:${chance >= 0.5 ? '#2ecc71' : (chance >= 0.2 ? '#f39c12' : '#e74c3c')}">${(chance * 100).toFixed(0)}%</span></div>
          ${destroyChance > 0 ? `<div style="color:#e74c3c">Vỡ: ${(destroyChance * 100).toFixed(1)}%</div>` : ''}
          <div>Phí: 💰 ${cost.toLocaleString()}</div>
          <div>Thất bại: xuống -${penaltyLvl} cấp</div>
        </div>
        <button class="btn btn-warning" onclick="app.ui.doEnhanceArmor('${petId}')">🔨 Đập đá (💰${cost.toLocaleString()})</button>
        <button class="btn btn-sm" onclick="app.ui.closeModal()" style="margin-top:8px">Đóng</button>
      </div>
    `);
  }

  doEnhanceWeapon(petId) {
    const pet = this.player.getPet(petId);
    if (!pet || !pet.weapon) return;
    const w = pet.weapon;
    const enh = w.enhanceLevel || 0;
    const cost = 500 + enh * 100;
    if (!this.player.spendGold(cost)) {
      this.toast('Không đủ vàng!');
      this.closeModal();
      return;
    }
    const chance = getEnhanceChance(enh);
    const penaltyLvl = enh >= 50 ? 3 : 1;
    let result = '';
    if (Math.random() < chance) {
      w.enhanceLevel = (w.enhanceLevel || 0) + 1;
      result = `✅ Thành công! ${w.name} lên +${w.enhanceLevel}!`;
    } else {
      w.enhanceLevel = Math.max(0, (w.enhanceLevel || 0) - penaltyLvl);
      if (w.enhanceLevel <= 0 && Math.random() < 0.02) {
        pet.weapon = null;
        result = `💥 Vỡ! ${w.name} đã bị phá hủy!`;
      } else {
        result = `❌ Thất bại! ${w.name} xuống +${w.enhanceLevel}`;
      }
    }
    this.app.saveGame();
    this.app.ui.updateResources();
    this.showPetDetail(petId);
    this.toast(result);
  }

  doEnhanceArmor(petId) {
    const pet = this.player.getPet(petId);
    if (!pet || !pet.armor) return;
    const a = pet.armor;
    const enh = a.enhanceLevel || 0;
    const cost = 500 + enh * 100;
    if (!this.player.spendGold(cost)) {
      this.toast('Không đủ vàng!');
      this.closeModal();
      return;
    }
    const chance = getEnhanceChance(enh);
    const penaltyLvl = enh >= 50 ? 3 : 1;
    let result = '';
    if (Math.random() < chance) {
      a.enhanceLevel = (a.enhanceLevel || 0) + 1;
      result = `✅ Thành công! ${a.name} lên +${a.enhanceLevel}!`;
    } else {
      a.enhanceLevel = Math.max(0, (a.enhanceLevel || 0) - penaltyLvl);
      if (a.enhanceLevel <= 0 && Math.random() < 0.02) {
        pet.armor = null;
        result = `💥 Vỡ! ${a.name} đã bị phá hủy!`;
      } else {
        result = `❌ Thất bại! ${a.name} xuống +${a.enhanceLevel}`;
      }
    }
    this.app.saveGame();
    this.app.ui.updateResources();
    this.showPetDetail(petId);
    this.toast(result);
  }

  discardSkillBook(idx) {
    const sb = this.player.skillBooks[idx];
    if (!sb) return;
    this.player.removeSkillBook(idx);
    this.app.saveGame();
    this.renderInventory();
    this.toast(`🗑️ Đã vứt sách ${sb.name}`);
  }

  _showPetSelector(pets, title, callback) {
    let html = `<div class="modal-title">${title}</div><div style="font-size:12px;margin-bottom:8px;color:var(--text-dim)">Chọn pet:</div>`;
    html += pets.map(p => {
      const elem = getPetElement(p.baseId);
      const elemIcon = (ELEMENTS[elem] || {}).icon || '';
      return `<button class="btn btn-sm" style="display:block;width:100%;text-align:left;margin:3px 0;background:var(--card)" onclick="app.ui._petSelectorCallback('${p.id}')">
        ${p.emoji} ${p.name} ${elemIcon} (Lv.${p.level})
      </button>`;
    }).join('');
    html += `<button class="btn btn-close" onclick="app.ui.closeModal()">Hủy</button>`;
    this._petSelectorCallback = (petId) => {
      const pet = this.player.getPet(petId);
      if (pet) callback(pet);
      this.closeModal();
    };
    this.showModal(html);
  }

  leavePvP() {
    if (this.activePvPBattle) {
      if (this.activePvPBattle.stop) this.activePvPBattle.stop();
      this.activePvPBattle = null;
    }
    if (this.activePvPMapView) {
      this.activePvPMapView.stop();
      this.activePvPMapView = null;
    }
    pvpOnline.stopWatching();
    if(pvpOnline.currentRoomId) pvpOnline.leaveRoom();
    this.renderBattle();
  }

  renderBattle() {
    const el = document.getElementById('tab-battle');

    if (this.activePvPBattle) {
      this._renderPvPBattleContent(el);
      return;
    }

    const pets = this.player.pets;
    if (!pets.length) {
      el.innerHTML = `
        <div class="section-title">⚔️ Chiến đấu</div>
        <div class="empty-msg">Bạn cần có pet để chiến đấu!</div>
        <button class="btn btn-primary" onclick="app.ui.showTab('shop')">🏪 Mua pet</button>
      `;
      return;
    }

    // Determine current team selection
    let selectedIds = this.player.battleTeam.filter(id => {
      const p = this.player.getPet(id);
      return p && !p.dead && p.hp > 0;
    });
    if (selectedIds.length === 0) {
      selectedIds = this.player.getStrongestPets(3).map(p => p.id);
    }

    el.innerHTML = `
      <div class="section-title">⚔️ Chiến đấu</div>

      <div class="pixel-battle-preview">
        <canvas id="battle-preview-canvas" width="400" height="260" class="pixel-canvas">
        </canvas>
      </div>

      <div class="battle-setup">
        <div class="battle-team">
          <div class="sub-title">🐾 Chọn đội hình (${selectedIds.length}/3)</div>
          <div class="pet-grid">${pets.map(p => {
            const selected = selectedIds.includes(p.id);
            return `<div class="pet-card ${p.dead ? 'dead' : ''} ${selected ? 'selected' : ''}" onclick="app.ui.toggleBattlePet('${p.id}')" style="cursor:pointer;${selected ? 'border:2px solid #2ecc71;' : ''}">
              <div class="pet-emoji">${p.emoji}</div>
              <div class="pet-name">${p.name}</div>
              <div class="pet-level">Lv.${p.level}</div>
              <div class="pet-hp-bar"><div class="hp-fill" style="width:${Math.floor(p.hp / p.maxHp * 100)}%"></div></div>
              <div class="pet-power">⚡${p.getPower()}</div>
              ${selected ? '<div class="selected-badge" style="color:#2ecc71;font-size:16px">✅</div>' : ''}
              ${p.dead ? '<div class="dead-badge">💀</div>' : ''}
            </div>`;
          }).join('')}</div>
        </div>
        <div class="battle-options">
          <button class="btn btn-danger btn-lg" onclick="app.startPvEBattle()">⚔️ Đánh quái 🐉</button>
          <button class="btn btn-warning btn-lg" onclick="app.ui.showPvPSetup()">👤 Đấu PvP</button>
          <button class="btn btn-boss btn-lg" onclick="app.startBossBattle()">👑 Đánh Trùm (cấp 30+)</button>
          <div style="font-size:10px;color:var(--text-dim);margin-top:4px">👆 Click vào pet để chọn/thay đổi đội hình (tối đa 3)</div>
          <div class="battle-log-container" id="battle-log">Chọn chế độ chiến đấu để bắt đầu!</div>
        </div>
      </div>
    `;
    // Draw preview scene
    requestAnimationFrame(() => {
      const canvas = document.getElementById('battle-preview-canvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        PixelArt.drawBackground(ctx);
      }
    });
  }

  toggleBattlePet(petId) {
    const pet = this.player.getPet(petId);
    if (!pet) return;
    if (pet.dead || pet.hp <= 0) { this.toast('Pet đã chết, không thể chọn!'); return; }

    let team = this.player.battleTeam.filter(id => {
      const p = this.player.getPet(id);
      return p && !p.dead && p.hp > 0;
    });

    const idx = team.indexOf(petId);
    if (idx !== -1) {
      team.splice(idx, 1);
    } else {
      if (team.length >= 3) { this.toast('Chỉ chọn tối đa 3 pet!'); return; }
      team.push(petId);
    }

    this.player.battleTeam = team;
    this.app.saveGame();
    this.renderBattle();
  }

  showPvPSetup() {
    const pets = this.player.pets;
    if (pets.length < 1) {
      this.toast('Cần ít nhất 1 pet để đấu PvP!');
      return;
    }
    const html = `
      <div class="section-title">👤 Thách đấu PvP</div>
      <div class="sub-title">Chọn pet ra trận (tối đa 3)</div>
      <div class="pet-grid" id="pvp-select">
        ${pets.map(p => `
          <div class="pet-card pvp-selectable" data-pvp-id="${p.id}" onclick="app.ui.togglePvPSelect('${p.id}')">
            <div class="pet-card-header ${p.type}">
              <span class="pet-emoji">${p.emoji}</span>
              <span class="pet-level">Lv.${p.level}</span>
            </div>
            <div class="pet-card-body">
              <div class="pet-name">${p.name}</div>
              <div class="pet-power">⚡ ${p.getPower().toLocaleString()}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div id="pvp-selected">Đã chọn: 0/3</div>
      <button class="btn btn-success btn-lg" onclick="app.startPvPBattle()">👤 Thách đấu!</button>
      <button class="btn btn-close" onclick="app.ui.closeModal()">Hủy</button>
    `;
    this.selectedEnemyPets = [];
    this.showModal(html);
  }

  togglePvPSelect(petId) {
    const pet = this.player.getPet(petId);
    if (!pet) return;
    const idx = this.selectedEnemyPets.indexOf(pet);
    if (idx >= 0) {
      this.selectedEnemyPets.splice(idx, 1);
      document.querySelector(`[data-pvp-id="${petId}"]`).classList.remove('selected');
    } else if (this.selectedEnemyPets.length < 3) {
      this.selectedEnemyPets.push(pet);
      document.querySelector(`[data-pvp-id="${petId}"]`).classList.add('selected');
    } else {
      this.toast('Chọn tối đa 3 pet!');
    }
    document.getElementById('pvp-selected').textContent = `Đã chọn: ${this.selectedEnemyPets.length}/3`;
  }

  showBattleResult(result, rewards = null) {
    const logHtml = result.log.map(l => `<div class="log-${l.type}">${l.text}</div>`).join('');
    let rewardHtml = '';
    if (rewards) {
      rewardHtml = `
        <div class="battle-rewards">
          <div>💰 Nhận: ${rewards.gold} vàng</div>
          ${rewards.diamond ? `<div>💎 Nhận: ${rewards.diamond} kim cương</div>` : ''}
          ${rewards.newPet ? `<div>🎉 Nhận pet mới: ${rewards.newPet.emoji} ${rewards.newPet.name}!</div>` : ''}
        </div>
      `;
    }
    this.showModal(`
      <div class="battle-result">
        <div class="result-title ${result.winner === 1 ? 'victory' : result.winner === 2 ? 'defeat' : 'draw'}">
          ${result.winner === 1 ? '🎉 CHIẾN THẮNG!' : result.winner === 2 ? '💔 THẤT BẠI' : '🤝 HÒA'}
        </div>
        <div class="result-info">Lượt: ${result.turn}</div>
        ${rewardHtml}
        <div class="battle-log-scroll">${logHtml}</div>
        <button class="btn btn-close" onclick="app.ui.closeModal()">Đóng</button>
      </div>
    `);
  }

  renderBreed() {
    const el = document.getElementById('tab-breed');
    const pets = this.player.pets;
    if (pets.length < 2) {
      el.innerHTML = `
        <div class="section-title">🥚 Lai tạo</div>
        <div class="empty-msg">Cần ít nhất 2 pet để lai tạo!</div>
      `;
      return;
    }
    const breedable = pets.filter(p => p.canBreed());
    el.innerHTML = `
      <div class="section-title">🥚 Lai tạo</div>
      <div class="sub-title">Chọn 2 pet để lai tạo (cấp ${DATA.BREED_START_LEVEL}+, đủ năng lượng)</div>
      ${breedable.length < 2 ? '<div class="empty-msg">Cần 2 pet đủ điều kiện (cấp 100+, năng lượng ≥ 50)</div>' : ''}
      <div class="breed-selector">
        <div id="breed-slot1" class="breed-slot" onclick="app.ui.openBreedSelect(1)">
          ${this.selectedBreedPet1 ? `<div class="pet-card">${this.petCardMini(this.selectedBreedPet1)}</div>` : '<span class="slot-placeholder">Chọn pet 1</span>'}
        </div>
        <div class="breed-heart">❤️</div>
        <div id="breed-slot2" class="breed-slot" onclick="app.ui.openBreedSelect(2)">
          ${this.selectedBreedPet2 ? `<div class="pet-card">${this.petCardMini(this.selectedBreedPet2)}</div>` : '<span class="slot-placeholder">Chọn pet 2</span>'}
        </div>
      </div>
      <button class="btn btn-success btn-lg" id="breed-btn" onclick="app.doBreed()">🥚 Lai tạo!</button>
      <div id="breed-result"></div>
      <div class="section-title">Danh sách pet có thể lai</div>
      <div class="pet-grid">${breedable.map(p => this.petCard(p)).join('')}</div>
    `;
  }

  petCardMini(pet) {
    return `
      <div class="pet-card-header ${pet.type}">
        <span class="pet-emoji">${pet.emoji}</span>
        <span class="pet-level">Lv.${pet.level}</span>
      </div>
      <div class="pet-card-body">
        <div class="pet-name">${pet.name}</div>
        <div class="pet-power">⚡ ${pet.getPower().toLocaleString()}</div>
      </div>
    `;
  }

  openBreedSelect(slot) {
    const pets = this.player.pets.filter(p => p.canBreed());
    const selected = slot === 1 ? this.selectedBreedPet2 : this.selectedBreedPet1;
    const html = `
      <div class="section-title">Chọn pet cho ô ${slot}</div>
      <div class="pet-grid">
        ${pets.map(p => {
          const disabled = selected && p.id === selected.id ? 'disabled' : '';
          return `
            <div class="pet-card ${disabled}" onclick="${disabled ? '' : `app.ui.selectBreedPet('${p.id}', ${slot})`}">
              ${this.petCardMini(p)}
              ${disabled ? '<div class="disabled-overlay">Đã chọn</div>' : ''}
            </div>
          `;
        }).join('')}
      </div>
      <button class="btn btn-close" onclick="app.ui.closeModal()">Đóng</button>
    `;
    this.showModal(html);
  }

  selectBreedPet(petId, slot) {
    const pet = this.player.getPet(petId);
    if (!pet) return;
    if (slot === 1) this.selectedBreedPet1 = pet;
    else this.selectedBreedPet2 = pet;
    this.closeModal();
    this.renderBreed();
  }

  renderShop() {
    const el = document.getElementById('tab-shop');
    el.innerHTML = `
      <div class="section-title">🏪 Cửa hàng</div>
      <div class="shop-tabs">
        <button class="shop-tab-btn ${this.currentShopTab === 'pet' ? 'active' : ''}" onclick="app.ui.showShopTab('pet')">🐾 Pet</button>
        <button class="shop-tab-btn ${this.currentShopTab === 'weapon' ? 'active' : ''}" onclick="app.ui.showShopTab('weapon')">🔪 Vũ khí</button>
        <button class="shop-tab-btn ${this.currentShopTab === 'armor' ? 'active' : ''}" onclick="app.ui.showShopTab('armor')">🛡️ Giáp</button>
        <button class="shop-tab-btn ${this.currentShopTab === 'item' ? 'active' : ''}" onclick="app.ui.showShopTab('item')">📦 Vật phẩm</button>
        <button class="shop-tab-btn ${this.currentShopTab === 'costume' ? 'active' : ''}" onclick="app.ui.showShopTab('costume')">👗 Phục trang</button>
        <button class="shop-tab-btn ${this.currentShopTab === 'skill' ? 'active' : ''}" onclick="app.ui.showShopTab('skill')">📖 Kỹ năng</button>
      </div>
      <div id="shop-content"></div>
    `;
    this.renderShopTabContent();
  }

  showShopTab(tab) {
    this.currentShopTab = tab;
    document.querySelectorAll('.shop-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.shop-tab-btn[onclick*="${tab}"]`)?.classList.add('active');
    this.renderShopTabContent();
  }

  renderShopTabContent() {
    const el = document.getElementById('shop-content');
    switch (this.currentShopTab) {
      case 'pet':
        el.innerHTML = `
          <div class="sub-title">Mua Pet</div>
          <div class="shop-grid">
            ${DATA.SHOP_PETS.map(p => `
              <div class="shop-item">
                <div class="shop-emoji">${p.emoji}</div>
                <div class="shop-name">${p.name}</div>
                <div class="shop-type ${p.type}">${DATA.PET_TYPES[p.type].name}</div>
                <div class="shop-price">💰 ${p.price.toLocaleString()}</div>
                <button class="btn btn-primary btn-sm" onclick="app.buyPet('${p.id}')">Mua</button>
              </div>
            `).join('')}
          </div>
        `;
        break;
      case 'weapon':
        el.innerHTML = `
          <div class="sub-title">Vũ khí</div>
          <div class="shop-grid">
            ${DATA.EQUIPMENT.weapons.map(w => {
              const stars = '⭐'.repeat(w.tier || 1);
              return `
              <div class="shop-item">
                <div class="shop-name">${w.name}</div>
                <div class="shop-tier">${stars} Cấp ${w.tier}</div>
                <div class="shop-stat">⚔️ ${w.atkMin}-${w.atkMax} ATK ${w.element ? `[${w.element}]` : ''}</div>
                <div class="shop-price">💰 ${w.price.toLocaleString()}</div>
                <button class="btn btn-primary btn-sm" onclick="app.buyWeapon('${w.id}')">Mua</button>
              </div>`;
            }).join('')}
          </div>
        `;
        break;
      case 'armor':
        el.innerHTML = `
          <div class="sub-title">Giáp</div>
          <div class="shop-grid">
            ${DATA.EQUIPMENT.armors.map(a => {
              const stars = '⭐'.repeat(a.tier || 1);
              return `
              <div class="shop-item">
                <div class="shop-name">${a.name}</div>
                <div class="shop-tier">${stars} Cấp ${a.tier}</div>
                <div class="shop-stat">🛡️ ${a.defMin}-${a.defMax} DEF (né ${Math.floor((a.dodge || 0) * 100)}%)</div>
                <div class="shop-price">💰 ${a.price.toLocaleString()}</div>
                <button class="btn btn-primary btn-sm" onclick="app.buyArmor('${a.id}')">Mua</button>
              </div>`;
            }).join('')}
          </div>
        `;
        break;
      case 'item':
        el.innerHTML = `
          <div class="sub-title">🥩 Thức ăn</div>
          <div class="shop-grid">
            ${DATA.ITEMS.food.map((f, i) => `
              <div class="shop-item">
                <div class="shop-name">${f.name}</div>
                <div class="shop-desc">+${f.value} ${f.stat.toUpperCase()} (${f.exp} EXP)</div>
                <div class="shop-price">💰 ${f.price.toLocaleString()}</div>
                <button class="btn btn-primary btn-sm" onclick="app.buyFood(${i})">Mua</button>
              </div>
            `).join('')}
          </div>
          <div class="sub-title">🧴 Vật phẩm tắm</div>
          <div class="shop-grid">
            ${DATA.ITEMS.bath.map((b, i) => `
              <div class="shop-item">
                <div class="shop-name">${b.name}</div>
                <div class="shop-desc">+${b.energy} Năng lượng</div>
                <div class="shop-price">💰 ${b.price.toLocaleString()}</div>
                <button class="btn btn-primary btn-sm" onclick="app.buyBath(${i})">Mua</button>
              </div>
            `).join('')}
          </div>
          <div class="sub-title">⚡ Vật phẩm hỗ trợ</div>
          <div class="shop-grid">
            ${DATA.ITEMS.buff.map((b, i) => `
              <div class="shop-item">
                <div class="shop-name">${b.name}</div>
                <div class="shop-desc">${b.type === 'heal' ? `Hồi ${b.value} máu` : `Tăng ${b.type === 'atk' ? 'sát thương' : 'phòng thủ'} x${b.value} (${b.turns} lượt)`}</div>
                <div class="shop-price">💰 ${b.price.toLocaleString()}</div>
                <button class="btn btn-primary btn-sm" onclick="app.buyBuff(${i})">Mua</button>
              </div>
            `).join('')}
          </div>
        `;
        break;
      case 'skill':
        el.innerHTML = `
          <div class="sub-title">📖 Sách Kỹ năng</div>
          <p style="font-size:11px;color:var(--text-dim);margin-bottom:8px">Mua sách kỹ năng để dạy cho pet. Chọn 1 pet để xem kỹ năng phù hợp.</p>
          <div class="element-filter" style="display:flex;gap:4px;margin-bottom:8px;flex-wrap:wrap">
            ${Object.keys(ELEMENTS).map(e => `<button class="btn btn-sm ${this._selectedSkillElement === e ? 'btn-primary' : 'btn-secondary'}" onclick="app.ui.selectSkillElement('${e}')">${ELEMENTS[e].icon} ${ELEMENTS[e].name}</button>`).join('')}
            <button class="btn btn-sm ${!this._selectedSkillElement ? 'btn-primary' : 'btn-secondary'}" onclick="app.ui.selectSkillElement('')">Tất cả</button>
          </div>
          <div class="skill-shop-grid">${this.renderSkillShopItems()}</div>
        `;
        break;
      case 'costume':
        const currentCostume = this.player.costume;
        el.innerHTML = `
          <div class="sub-title">👗 Phục trang cho người chơi</div>
          <div class="shop-grid">
            ${DATA.COSTUMES.map(c => {
              const owned = this.player.ownedCostumes.includes(c.id);
              const equipping = currentCostume === c.id;
              return `
                <div class="shop-item ${equipping ? 'equipped' : ''}">
                  <div class="shop-emoji" style="background:${c.color};border-radius:50%;width:40px;height:40px;line-height:40px;margin:0 auto 4px;font-size:20px">${c.emoji}</div>
                  <div class="shop-name">${c.name}</div>
                  <div class="shop-desc" style="font-size:10px;color:var(--text-dim)">${c.desc}</div>
                  <div class="shop-price">${c.price > 0 ? `💎 ${c.price}` : 'Miễn phí'}</div>
                  ${owned
                    ? (equipping ? '<div class="equipped-tag">✅ Đang mặc</div>' : `<button class="btn btn-sm btn-success" onclick="app.equipCostume('${c.id}')">Mặc</button>`)
                    : `<button class="btn btn-sm btn-primary" onclick="app.buyCostume('${c.id}')">Mua 💎</button>`
                  }
                </div>
              `;
            }).join('')}
          </div>
        `;
        break;
    }
  }

  renderRank() {
    const el = document.getElementById('tab-rank');
    const rankings = Leaderboard.getRankings();
    const playerRank = rankings.findIndex(r => r.name === this.player.name) + 1;

    el.innerHTML = `
      <div class="section-title">🏆 Bảng xếp hạng</div>
      <div class="rank-player">
        ${playerRank > 0 ? `Thứ hạng của bạn: #${playerRank}` : 'Chưa có thứ hạng'}
        (⚡ ${this.player.totalPower.toLocaleString()})
      </div>
      <div class="rank-list">
        ${rankings.length ? rankings.map((r, i) => `
          <div class="rank-item ${r.name === this.player.name ? 'me' : ''}">
            <span class="rank-num">#${i + 1}</span>
            <span class="rank-name">${r.name}</span>
            <span class="rank-power">⚡ ${r.power.toLocaleString()}</span>
            <span class="rank-pets">🐾 ${r.petCount}</span>
            <span class="rank-rating">🏆 ${r.rating}</span>
          </div>
        `).join('') : '<div class="empty-msg">Chưa có dữ liệu xếp hạng</div>'}
      </div>
      <button class="btn btn-primary" onclick="app.updateLeaderboard()">🔄 Cập nhật</button>
    `;
  }

  // ====================
  // M1: PvP Online UI
  // ====================
  renderPvpOnline() {
    const el = document.getElementById('tab-pvpOnline');
    if (!el) return;
    el.innerHTML = `
      <div class="section-title">🌐 PvP Online</div>
      <div id="online-rooms" class="room-list"><div class="empty-msg">Đang tải danh sách phòng...</div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
        <button class="btn btn-primary" onclick="app.ui.createRoom()">🛠️ Tạo phòng</button>
        <button class="btn btn-secondary" onclick="app.ui.loadOnlineRooms()">🔄 Làm mới</button>
      </div>
    `;
    this.loadOnlineRooms();
    this._startRoomListener();
  }

  _startRoomListener() {
    if (this._roomUnsub) this._roomUnsub();
    var self = this;
    this._roomUnsub = FirebaseOnline.listenRooms(function(rooms){
      var container = document.getElementById('online-rooms');
      if (!container) return;
      var filtered = rooms.filter(function(r){ return r.host.uid !== FirebaseOnline.uid; });
      if (!filtered || filtered.length === 0) {
        container.innerHTML = '<div class="empty-msg">Không còn phòng nào đang chờ.</div>';
        return;
      }
      container.innerHTML = filtered.map(function(r){
        var host = r.host?.name || '???';
        var btn = r.status === 'waiting'
          ? '<button class="btn btn-success" onclick="app.ui.joinRoom(\'' + r.id + '\')">🤝 Tham gia</button>'
          : '<span class="badge" style="background:#e94560">Đang chiến</span>';
        return '<div class="room-item" style="margin:4px 0;padding:6px;background:rgba(255,255,255,0.04);border-radius:4px">' +
          '<span>🛡️ Phòng <strong>' + r.id + '</strong> — Chủ: ' + host + '</span> ' + btn +
        '</div>';
      }).join('');
    });
  }

  _stopRoomListener() {
    if (this._roomUnsub) {
      this._roomUnsub();
      this._roomUnsub = null;
    }
  }

  async loadOnlineRooms() {
    try {
      const rooms = await FirebaseOnline.getOpenRooms();
      const container = document.getElementById('online-rooms');
      if (!container) return;
      if (!rooms || rooms.length === 0) {
        container.innerHTML = '<div class="empty-msg">Kh\u00f4ng c\u00f2ng ph\u00f2ng n\u00e0o \u0111ang ch\u1edd.</div>';
        return;
      }
      container.innerHTML = rooms.map(r => {
        const host = r.host?.name || '???';
        const status = r.status || 'waiting';
        const btn = status === 'waiting' ? `<button class="btn btn-success" onclick="app.ui.joinRoom('${r.id}')">\ud83e\udd1d Tham gia</button>` : '';
        return `<div class="room-item" style="margin:4px 0;padding:6px;background:rgba(255,255,255,0.04);border-radius:4px">
          <span>\ud83d\udee1\ufe0f Ph\u00f2ng <strong>${r.id}</strong> \u2013 Ch\u1ee7: ${host} \u2013 Tr\u1ea1ng th\u00e1i: ${status}</span>
          ${btn}
        </div>`;
      }).join('');
    } catch (e) {
      console.error('Load rooms error', e);
    }
  }

  async createRoom() {
    try {
      const myPets = this.player.pets.slice(0, 3);
      const roomId = await FirebaseOnline.createRoom(myPets);
      this.toast(`\u2705 \u0110\u00e3 t\u1ea1o ph\u00f2ng ${roomId}`);
      this.loadOnlineRooms();
    } catch (e) {
      this.toast('\u274c T\u1ea1o ph\u00f2ng th\u1ea5t bại');
      console.error(e);
    }
  }

  async joinRoom(roomId) {
    try {
      const myPets = this.player.pets.slice(0, 3);
      await FirebaseOnline.joinRoom(roomId, myPets);
      this.toast(`\u2705 \u0110\u00e3 v\u00e0o ph\u00f2ng ${roomId}`);
      this.selectedOnlinePets = myPets.slice(0, 3).map(p => p.id);
      if (this.worldMap) this.worldMap.selectOnlinePets(this.selectedOnlinePets);
    } catch (e) {
      this.toast('\u274c Tham gia ph\u00f2ng th\u1ea5t bại');
      console.error(e);
    }
  }

  // New modal for selecting pets for online PvP
  showOnlinePetSelect() {
    const pets = this.player.pets.filter(p => !p.dead && p.hp > 0);
    if (pets.length === 0) {
      this.toast('Kh\u00f4ng c\u00f3 pet kh\u1ea3 d\u1ee5ng!');
      return;
    }
    let html = `<div class="modal-title">\ud83d\udc2b Ch\u1ecdn t\u1ed1i \u0111a 3 pet cho PvP Online</div>`;
    html += '<div class="pet-grid">';
    pets.forEach(p => {
      const checked = this.selectedOnlinePets && this.selectedOnlinePets.includes(p.id) ? 'checked' : '';
      html += `<label class="pet-select-item" style="margin:4px;display:flex;align-items:center">
        <input type="checkbox" class="online-pet-check" value="${p.id}" ${checked} />
        <span style="margin-left:6px">${p.emoji} ${p.name} (Lv.${p.level})</span>
      </label>`;
    });
    html += '</div>';
    html += `<button class="btn btn-primary" onclick="app.ui.confirmOnlinePetSelect()">\u2714 X\u00e1c nh\u1eadn</button>`;
    html += `<button class="btn btn-close" onclick="app.ui.closeModal()">\u274c \u0110\u00f3ng</button>`;
    this.showModal(html);
  }

  confirmOnlinePetSelect() {
    const checks = document.querySelectorAll('.online-pet-check:checked');
    const ids = Array.from(checks).map(c => c.value);
    if (ids.length === 0) {
      this.toast('Ch\u01b0a ch\u1ecdn pet n\u00e0o!');
      return;
    }
    if (ids.length > 3) {
      this.toast('Ch\u1ec9 \u0111\u01b0\u1ee3c ch\u1ecdn t\u1ed1i \u0111a 3 pet');
      return;
    }
    this.selectedOnlinePets = ids;
    if (this.worldMap) this.worldMap.selectOnlinePets(ids);
    this.toast(`\u2705 \u0110\u00e3 ch\u1ecdn ${ids.length} pet cho PvP`);
    this.closeModal();
  }

  // ====================
  // M1: Map Online UI
  // ====================
  renderPvpOnline() {
    this.renderWorldPvP();
  }

  renderMapOnline() {
    var self = this;
    const el = document.getElementById('tab-mapOnline');
    if (!el) return;

    if (!window.worldOnline || !window.worldOnline.isOnline) {
      el.innerHTML = `
        <div class="section-title">🌍 Map Online — Chọn phòng</div>
        <div style="text-align:center;padding:2rem">
          <p style="font-size:1.2rem;margin-bottom:0.5rem">🌐 Cùng săn quái, cạnh tranh trong phòng</p>
          <p style="color:rgba(255,255,255,0.5);margin-bottom:1.5rem">Cùng phòng thì thấy nhau + đánh chung quái!</p>
          <div class="room-grid" style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;max-width:400px;margin:0 auto 1.5rem">
            ${[1,2,3,4,5,6,7,8,9,10].map(n => `
              <button class="btn btn-primary" onclick="app.enterOnlineWorld(${n})" style="font-size:1.1rem;padding:12px 0">Phòng ${n}</button>
            `).join('')}
          </div>
        </div>
      `;
      return;
    }

    if (el) delete el._domCache;
    if (!this.worldMap) {
      this.worldMap = new WorldMap(this.player);
      this.worldMap.onUpdate = () => this.refreshWorldUI();
      this.worldMap.onLogUpdate = () => this.refreshLogOnly();
      this.worldMap.onLevelUp = (pet) => this.toast(`🎉 ${pet.emoji} ${pet.name} lên cấp ${pet.level}!`);
      this.worldMap.onPetDeath = (pet, lost) => this.toast(`💔 ${pet.emoji} ${pet.name} chết! Mất ${lost} cấp.`);
      this.worldMap.onAttackAnim = (attackerId, targetId, dmg, isCrit, skillType, roleId, isUltimate) => {
        this.mapView?.queueAction(attackerId, targetId, dmg, isCrit, skillType, roleId, isUltimate);
      };
    }
    if (window.worldOnline && window.worldOnline.isOnline) {
      this.worldMap.setOnlineMode(window.worldOnline);
    }
    var wm = window.worldOnline;
    var roomLabel = 'Phòng ' + (wm.currentRoom || 1);
    var count = Object.keys(wm.remotePlayers || {}).length + 1;
    var headerExtra = '<span style="color:#27ae60;font-size:0.85rem;float:right">' + roomLabel + ' · 👥 ' + count + ' online</span>';

    this._renderWorldContent(el, 'online-map-canvas', headerExtra, 'selectMapOnline');

    // Append online sidebar
    var playerItems = [];
    playerItems.push({ uid: FirebaseOnline.uid, name: wm.myName || 'Bạn', emoji: wm.myEmoji || '🧑', isMe: true });
    for (var uid in wm.remotePlayers) {
      var rp = wm.remotePlayers[uid];
      playerItems.push({ uid: uid, name: rp.name || uid.slice(0,6), emoji: rp.emoji || '🧑', isMe: false });
    }
    var playerListHtml = playerItems.map(function(p){
      if (p.isMe) return '<div class="pvp-player-item me"><span class="pvp-player-emoji">' + p.emoji + '</span><span class="pvp-player-name">' + p.name + '</span></div>';
      return '<div class="pvp-player-item">' +
        '<span class="pvp-player-emoji">' + p.emoji + '</span>' +
        '<span class="pvp-player-name">' + p.name + '</span>' +
        '<button class="btn btn-sm btn-warning" onclick="app.challengePlayer(\'' + p.uid + '\')">⚔️</button></div>';
    }).join('');
    var challengeHtml = '';
    if (this._incomingChallenge) {
      var c = this._incomingChallenge;
      challengeHtml = '<div class="pvp-challenge-notice" style="margin:8px 0;padding:8px;background:#2d1b1b;border-radius:8px">' +
        '<span>⚔️ <strong>' + (c.fromName || c.from) + '</strong> thách đấu!</span>' +
        '<button class="btn btn-success btn-sm" onclick="app.acceptChallenge(\'' + this._incomingChallengeId + '\')">✅ OK</button>' +
        '<button class="btn btn-danger btn-sm" onclick="app.declineChallenge(\'' + this._incomingChallengeId + '\')">❌</button></div>';
    }
    var sidebarEl = document.createElement('div');
    sidebarEl.className = 'world-online-sidebar';
    sidebarEl.innerHTML = playerListHtml + challengeHtml;
    var existingSidebar = el.querySelector('.world-online-sidebar');
    if (existingSidebar) existingSidebar.replaceWith(sidebarEl);
    else el.querySelector('.world-commands')?.insertAdjacentElement('afterend', sidebarEl);
  }

  selectMapOnline(mapId) {
    this.worldMap.selectMap(mapId);
    this.renderMapOnline();
  }

  showBattleLive(battle, isPvP = false, isBoss = false) {
    const modeTitle = isBoss ? '👑 Đánh Trùm' : isPvP ? '👤 PvP' : '⚔️ Chiến đấu';
    const html = `
      <div class="battle-live">
        <div class="battle-title">${modeTitle}</div>
        <div class="pixel-battle-container">
          <canvas id="battle-canvas" width="400" height="260" class="pixel-canvas">
          </canvas>
        </div>
        <div class="battle-live-log" id="live-log">Trận chiến bắt đầu!</div>
        <div class="battle-controls">
          <button class="btn btn-success" onclick="app.ui.battleTick()">⏭️ Lượt tiếp</button>
          <button class="btn btn-primary" onclick="app.ui.battleAuto()">⏩ Tự động</button>
          <button class="btn btn-danger" onclick="app.ui.useBattleBuff('heal')">❤️ Hồi máu (💰100)</button>
          <button class="btn btn-warning" onclick="app.ui.useBattleBuff('atk')">⚡ Buff ATK (💰150)</button>
          <button class="btn btn-info" onclick="app.ui.useBattleBuff('def')">🛡️ Buff DEF (💰120)</button>
        </div>
      </div>
    `;
    this.showModal(html);
    this.battleAnimator = null;
    this.battleEngine.onUpdate = (be) => this.syncBattleLog(be);
    this.battleEngine.onEnd = (be) => this.endBattleUI(be);

    const canvas = document.getElementById('battle-canvas');
    if (canvas) {
      this.battleAnimator = new BattleAnimator();
      this.battleAnimator.init(canvas, battle);
      this.battleAnimator.start();
    }
  }

  syncBattleLog(battle) {
    const logEl = document.getElementById('live-log');
    if (!logEl) return;
    const recent = battle.log.slice(-8);
    logEl.innerHTML = recent.map(l => `<div class="log-${l.type}">${l.text}</div>`).join('');
    logEl.scrollTop = logEl.scrollHeight;
  }

  canTick() {
    if (this.battleEngine.state === 'ended') return false;
    if (this.battleAnimator && this.battleAnimator.waitingForAction) return false;
    return true;
  }

  battleTick() {
    if (!this.canTick()) return;
    this.battleEngine.tick();
  }

  battleAuto() {
    if (this.battleTimer) return;
    this.battleTimer = setInterval(() => {
      if (this.battleEngine.state === 'ended') {
        clearInterval(this.battleTimer);
        this.battleTimer = null;
        return;
      }
      if (this.battleAnimator && this.battleAnimator.waitingForAction) return;
      this.battleEngine.tick();
    }, 1200);
  }

  useBattleBuff(type) {
    if (this.battleEngine.state !== 'fighting') return;
    const buffMap = {
      heal: DATA.ITEMS.buff[1],
      atk: DATA.ITEMS.buff[0],
      def: DATA.ITEMS.buff[2]
    };
    const buff = buffMap[type];
    if (!buff) return;
    if (!this.player.spendGold(buff.price)) {
      this.toast('Không đủ vàng!');
      return;
    }
    this.battleEngine.useBuff(1, { type: buff.type, value: buff.value, turns: buff.turns, price: buff.price });
    this.updateResources();
  }

  endBattleUI(battle) {
    if (this.battleTimer) {
      clearInterval(this.battleTimer);
      this.battleTimer = null;
    }
    if (this.battleAnimator) {
      this.battleAnimator.stop();
      this.battleAnimator = null;
    }
    setTimeout(() => {
      this.closeModal();
      const rewards = battle.winner === 1 ? { gold: 50 + battle.turn * 10 } : null;
      this.showBattleResult(battle.getSummary(), rewards);
      this.updateResources();
    }, 500);
  }

  renderWorld() {
    if (window.worldOnline && window.worldOnline.mapId) {
      this.renderWorldPvP();
      return;
    }
    const el = document.getElementById('tab-world');
    if (el) delete el._domCache;
    if (!this.worldMap) {
      this.worldMap = new WorldMap(this.player);
      this.worldMap.onUpdate = () => this.refreshWorldUI();
      this.worldMap.onLogUpdate = () => this.refreshLogOnly();
      this.worldMap.onLevelUp = (pet) => this.toast(`🎉 ${pet.emoji} ${pet.name} lên cấp ${pet.level}!`);
      this.worldMap.onPetDeath = (pet, lost) => this.toast(`💔 ${pet.emoji} ${pet.name} chết! Mất ${lost} cấp.`);
      this.worldMap.onAttackAnim = (attackerId, targetId, dmg, isCrit, skillType, roleId, isUltimate) => {
        this.mapView?.queueAction(attackerId, targetId, dmg, isCrit, skillType, roleId, isUltimate);
      };
    }
    var wm = window.worldOnline;
    var headerExtra = '';
    if (wm && wm.isOnline) {
      this.worldMap.setOnlineMode(wm);
      var roomLabel = 'Phòng ' + (wm.currentRoom || 1);
      var count = Object.keys(wm.remotePlayers || {}).length + 1;
      headerExtra = '<span style="color:#27ae60;font-size:0.85rem;float:right">' + roomLabel + ' · 👥 ' + count + ' online</span>';
    }
    this._renderWorldContent(el, 'world-map-canvas', headerExtra, 'selectMapTier');
  }

  _renderWorldContent(el, canvasId, headerExtra, selectFn) {
    const isExploring = this.worldMap.exploring;
    const alivePets = this.worldMap.getBattlePets();
    const deadPets = this.player.pets.filter(p => p.dead);
    const monsters = this.worldMap.monsters || [];
    const aliveMonsters = monsters.filter(m => !m.dead && m.hp > 0);
    const recentLog = this.worldMap.fightLog.slice(-10);
    const allPets = this.player.pets;
    const mapInfo = this.worldMap.getMapInfo();
    const mapTimer = this.worldMap.mapTimer || 0;
    const minutes = Math.floor(mapTimer / 60);
    const seconds = mapTimer % 60;

    const bossMonsters = monsters.filter(m => m.isBoss && !m.dead && m.hp > 0);
    const bossTimerHtml = bossMonsters.length > 0
      ? bossMonsters.map(b => {
          const elapsed = mapTimer - (b._spawnTime || 0);
          const nextLevelIn = Math.max(0, 600 - (elapsed % 600));
          const nextMin = Math.floor(nextLevelIn / 60);
          const nextSec = nextLevelIn % 60;
          const capText = b._maxLevel ? ` (tối đa Lv.${b._maxLevel})` : '';
          return `<div class="boss-timer">👑 ${b.name} Lv.${b.level}${capText} — lên cấp sau ${nextMin}:${String(nextSec).padStart(2, '0')}</div>`;
        }).join('')
      : '';

    if (!isExploring) {
      const playerMaxLvl = Math.max(...this.player.pets.map(p => p.level), 1);
      const availableMaps = MAP_TIERS.filter(m => m.minLvl <= playerMaxLvl + 10);
      el.innerHTML = `
        <div class="section-title">
          🗺️ Chọn bản đồ ${headerExtra}
        </div>
        <div class="world-team">
          <span class="team-label">🐾 Đội hình:</span>
          ${this.getBattleTeamPreview()}
          ${this.worldMap.reservePetIds && this.worldMap.reservePetIds.length > 0 ? `<span class="reserve-count" title="Pet dự bị">+${this.worldMap.reservePetIds.length}</span>` : ''}
          <button class="btn btn-sm btn-secondary" onclick="app.ui.showTeamFormation()">↻</button>
          <button class="btn btn-sm btn-secondary" onclick="app.ui.showTeamReorder()">☰</button>
        </div>
        <div class="map-tier-grid">
          ${availableMaps.map(m => {
            const locked = m.minLvl > playerMaxLvl;
            const selected = this.worldMap.selectedMapId === m.id;
            return '<div class="map-tier-card ' + (selected ? 'selected' : '') + ' ' + (locked ? 'locked' : '') + '" onclick="' + (locked ? '' : 'app.ui.' + selectFn + '(' + m.id + ')') + '">' +
              '<div class="map-tier-icon">' + m.icon + '</div>' +
              '<div class="map-tier-name">' + m.name + '</div>' +
              '<div class="map-tier-levels">Cấp ' + m.minLvl + '\u2013' + (m.maxLvl === 999 ? '\u221E' : m.maxLvl) + '</div>' +
              (locked ? '<div class="map-tier-lock">🔒</div>' : '') +
              '</div>';
          }).join('')}
        </div>
        <div class="world-canvas-container map-view-container">
          <canvas id="${canvasId}" width="1280" height="540" class="pixel-canvas map-canvas"></canvas>
        </div>
        <div class="world-commands">
          <button class="btn btn-success btn-lg" onclick="app.startOnlineExploring()" ${alivePets.length === 0 ? 'disabled' : ''}>
            ${alivePets.length === 0 ? '💀 Pet đều chết! Vào 🐾 Pets cho ăn để hồi sinh' : `⚔️ Khám phá ${mapInfo.name}`}
          </button>
          ${deadPets.length > 0 ? '<div class="world-dead-hint">💀 Có pet chết. Vào tab 🐾 Pets, chọn pet và cho ăn để hồi sinh!</div>' : ''}
        </div>
        <div class="world-status">
          <div class="world-pets">
            <div class="sub-title">🐾 Pet (${alivePets.length}/${this.player.pets.length})</div>
            <div class="world-pet-list">
              ${allPets.map(p => this.worldPetItem(p)).join('')}
            </div>
          </div>
        </div>
      `;
    } else {
      el.innerHTML = `
        <div class="section-title">
          🗺️ ${mapInfo.icon} ${mapInfo.name}
          <span class="map-timer">⏱ ${minutes}:${String(seconds).padStart(2, '0')}</span>
          ${headerExtra}
        </div>
        <div class="world-info">
          <span>📍 Cấp ${mapInfo.minLvl}–${mapInfo.maxLvl === 999 ? '∞' : mapInfo.maxLvl}</span>
          <span>💀 Quái: ${this.worldMap.totalKills}</span>
          <span>👑 Boss: ${this.worldMap.bossKillCount}</span>
        </div>
        ${bossTimerHtml ? `<div class="world-boss-timers">${bossTimerHtml}</div>` : ''}
        <div class="world-team">
          <span class="team-label">🐾 Đội hình:</span>
          ${this.getBattleTeamPreview()}
          ${this.worldMap.reservePetIds && this.worldMap.reservePetIds.length > 0 ? `<span class="reserve-count" title="Pet dự bị">+${this.worldMap.reservePetIds.length}</span>` : ''}
          <button class="btn btn-sm btn-secondary" onclick="app.ui.showTeamFormation()">↻</button>
          <button class="btn btn-sm btn-secondary" onclick="app.ui.showTeamReorder()">☰</button>
        </div>
        <div class="world-canvas-container map-view-container">
          <canvas id="${canvasId}" width="1280" height="540" class="pixel-canvas map-canvas"></canvas>
        </div>
        <div class="world-commands">
          <button class="btn btn-danger" onclick="app.stopOnlineExploring()">⏹️ Dừng</button>
          <button class="btn cmd-btn ${this.worldMap.command === 'attack' ? 'active' : ''}" onclick="app.setCommand('attack')">⚔️ Tấn công</button>
          <button class="btn cmd-btn ${this.worldMap.command === 'defend' ? 'active' : ''}" onclick="app.setCommand('defend')">🛡️ Phòng thủ</button>
          <button class="btn cmd-btn ${this.worldMap.command === 'retreat' ? 'active' : ''}" onclick="app.setCommand('retreat')">🏃 Rút lui</button>
          ${(this.worldMap.botPlayers?.length || 0) > 0
            ? '<button class="btn btn-sm btn-warning" onclick="app.removeBot()">🤖 Bỏ bot (' + (this.worldMap.botPlayers?.length || 0) + ')</button>'
            : ''}
          <button class="btn btn-sm btn-success" onclick="app.callBot()">🤖 Gọi bot</button>
          <span class="zoom-group">
            <label>🔍</label>
            ${[1,2,3,4].map(z => `<button class="btn btn-sm ${(this.mapView?.zoomLevel||1) === z ? 'active' : 'btn-ghost'}" onclick="app.setZoom(${z})">${z}×</button>`).join('')}
          </span>
        </div>
        <div class="world-log">
          <div class="sub-title">📜 Nhật ký</div>
          <div class="world-log-content">
            ${recentLog.length ? recentLog.map(function(l) { return '<div class="log-' + l.type + '">' + l.text + '</div>'; }).join('') : '<div class="empty-msg">Chưa có chiến đấu nào</div>'}
          </div>
        </div>
        <div class="world-status">
          <div class="world-pets">
            <div class="sub-title">🐾 Pet (${alivePets.length}/${this.player.pets.length})</div>
            <div class="world-pet-list">
              ${allPets.map(p => this.worldPetItem(p)).join('')}
            </div>
          </div>
          ${(this.worldMap.botPlayers || []).map(bp => `
          <div class="world-bots">
            <div class="bot-player-group">
              <div class="bot-player-name">${bp.emoji} ${bp.name}</div>
              <div class="world-pet-list">
                ${bp.pets.map(pp => `
                  <div class="world-pet bot ${pp.dead || pp.hp <= 0 ? 'dead' : ''}">
                    <span>${pp.emoji}</span>
                    <span class="pet-lvl">Lv.${pp.level}</span>
                    <div class="bar-container"><div class="bar hp" style="width:${Math.floor(Math.max(0, pp.hp) / pp.maxHp * 100)}%"></div></div>
                    <span class="pet-hp">${Math.max(0, pp.hp)}/${pp.maxHp}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          `).join('')}
          <div class="world-monsters">
            <div class="sub-title">👾 Quái (${aliveMonsters.length})</div>
            <div class="world-pet-list">
              ${aliveMonsters.length ? aliveMonsters.map(m => this.worldMonsterItem(m)).join('') : '<span class="empty-msg">Không có quái</span>'}
            </div>
          </div>
        </div>
      `;
    }

    var wm = window.worldOnline;
    var remotePlayers = (wm && wm.isOnline) ? (wm.remotePlayers || {}) : {};
    const canvas = document.getElementById(canvasId);
    if (canvas) {
      if (!this.mapView || this.mapView.canvas !== canvas) {
        if (this.mapView) this.mapView.stop();
        this.mapView = new MapView2D(canvas);
      }
      this.mapView.setTheme(mapInfo.theme);
      this.mapView.setPlayer(this.player);
      const botPetsForCanvas = this.worldMap.getBotPets();
      const botChars = this.worldMap.getBotCharacters();
      this.mapView.syncEntities(alivePets, aliveMonsters, botPetsForCanvas, botChars, remotePlayers);
      if (isExploring) {
        this.mapView.start();
      } else {
        this.mapView.stop();
        this.mapView.render();
      }
    }
  }

  renderWorldPvP() {
    var self = this;
    const wm = window.worldOnline;
    const el = document.getElementById('tab-pvpOnline');
    if (!el) return;
    // Build player list from remote players + self
    var playerList = [];
    // Add self
    playerList.push({
      uid: FirebaseOnline.uid,
      name: wm.myName || 'Bạn',
      emoji: wm.myEmoji || '🧑',
      isMe: true,
      alive: true,
    });
    // Add remote players
    for (var uid in wm.remotePlayers) {
      var rp = wm.remotePlayers[uid];
      playerList.push({
        uid: uid,
        name: rp.name || uid.substring(0, 6),
        emoji: rp.emoji || '🧑',
        isMe: false,
        alive: rp.alive !== false,
      });
    }
    var isOnlineWar = this._pvpWarActive || false;

    var playerItems = playerList.map(function(p){
      if (p.isMe) {
        return '<div class="pvp-player-item me"><span class="pvp-player-emoji">' + p.emoji + '</span><span class="pvp-player-name">' + p.name + ' (bạn)</span></div>';
      }
      var challengeBtn;
      if (self._pvpWarActive) {
        challengeBtn = '<span class="pvp-war-badge">⚔️ Đang chiến</span>';
      } else if (wm._outgoingTarget === p.uid) {
        challengeBtn = '<span class="pvp-waiting">⏳ Đã thách...</span>';
      } else {
        challengeBtn = '<button class="btn btn-sm btn-warning" onclick="app.challengePlayer(\'' + p.uid + '\')">⚔️ Thách đấu</button>';
      }
      return '<div class="pvp-player-item">' +
        '<span class="pvp-player-emoji">' + p.emoji + '</span>' +
        '<span class="pvp-player-name">' + p.name + '</span>' +
        challengeBtn + '</div>';
    }).join('');

    // Incoming challenge notification
    var challengeHtml = '';
    if (this._incomingChallenge) {
      var c = this._incomingChallenge;
      challengeHtml = '<div class="pvp-challenge-notice">' +
        '<span>⚔️ <strong>' + (c.fromName || c.from) + '</strong> muốn thách đấu bạn!</span>' +
        '<button class="btn btn-success btn-sm" onclick="app.acceptChallenge(\'' + this._incomingChallengeId + '\')">✅ Chấp nhận</button>' +
        '<button class="btn btn-danger btn-sm" onclick="app.declineChallenge(\'' + this._incomingChallengeId + '\')">❌ Từ chối</button>' +
        '</div>';
    }

    el.innerHTML =
      '<div class="section-title">🗺️ Map PvP Online</div>' +
      '<div class="world-canvas-container map-view-container">' +
        '<canvas id="world-map-canvas" width="1280" height="540" class="pixel-canvas map-canvas"></canvas>' +
      '</div>' +
      '<div class="pvp-online-info">' +
        '<div class="pvp-online-players">' +
          '<div class="sub-title">👥 Người chơi online (' + playerList.length + ')</div>' +
          '<div class="pvp-player-list">' + playerItems + '</div>' +
        '</div>' +
        challengeHtml +
        '<div style="margin-top:8px;display:flex;gap:8px">' +
          '<button class="btn btn-danger" onclick="app.leavePvPWorld()">🚪 Rời map</button>' +
        '</div>' +
      '</div>';

    // Init canvas
    const canvas = document.getElementById('world-map-canvas');
    if (canvas) {
      if (!this.mapView || this.mapView.canvas !== canvas) {
        if (this.mapView) this.mapView.stop();
        this.mapView = new MapView2D(canvas);
      }
      this.mapView.setTheme('grass');
      this.mapView.setPlayer(this.player);
      this.mapView.syncEntities([], [], [], [], wm.remotePlayers || {});
      this.mapView.start();
    }
  }

  worldPetItem(p) {
    return `
      <div class="world-pet ${p.dead ? 'dead' : ''} ${p.hp <= 0 ? 'ko' : ''}">
        <span>${p.emoji}</span>
        <span class="pet-lvl">Lv.${p.level}</span>
        <div class="bar-container"><div class="bar hp" style="width:${Math.floor(Math.max(0, p.hp) / p.maxHp * 100)}%"></div></div>
        <span class="pet-hp">${Math.max(0, p.hp)}/${p.maxHp}</span>
        ${p.dead ? '<span class="dead-tag">💀</span>' : ''}
      </div>
    `;
  }

  worldMonsterItem(m) {
    return `
      <div class="world-pet monster ${m.isBoss ? 'boss' : ''} ${m.isMutant ? 'mutant' : ''}">
        <span>${m.emoji}</span>
        <span class="pet-lvl">Lv.${m.level}</span>
        ${m.isBoss ? '<span class="boss-tag">👑</span>' : ''}
        <div class="bar-container"><div class="bar hp" style="width:${Math.floor(Math.max(0, m.hp) / m.maxHp * 100)}%"></div></div>
        <span class="pet-hp">${Math.max(0, m.hp)}/${m.maxHp}</span>
        ${m.isMutant ? '<span class="mutant-tag">🧬</span>' : ''}
      </div>
    `;
  }

  selectMapTier(mapId) {
    this.worldMap.selectMap(mapId);
    this.renderWorld();
  }

  refreshLogOnly() {
    if (this.currentTab !== 'world' && this.currentTab !== 'mapOnline') return;
    const el = document.getElementById('tab-' + this.currentTab);
    if (!el) return;
    const logEl = el.querySelector('.world-log-content');
    if (!logEl) return;
    const recentLog = this.worldMap.fightLog.slice(-10);
    const logKey = recentLog.length > 0 ? recentLog[recentLog.length - 1].text : '';
    if (logEl._lastLogKey !== logKey) {
      logEl.innerHTML = recentLog.length
        ? recentLog.map(l => `<div class="log-${l.type}">${l.text}</div>`).join('')
        : '<div class="empty-msg">Chưa có chiến đấu nào</div>';
      logEl._lastLogKey = logKey;
      logEl.scrollTop = logEl.scrollHeight;
    }
  }

  refreshWorldUI() {
    if (this.currentTab !== 'world' && this.currentTab !== 'mapOnline') return;
    if (this._worldRefreshTimer) return;
    this._worldRefreshTimer = setTimeout(() => {
      this._worldRefreshTimer = null;
      const isExploring = this.worldMap.exploring;
      const el = document.getElementById('tab-' + this.currentTab);
      if (!el) return;

      // Sync canvas
      const alivePets = this.worldMap.getBattlePets();
      const monsters = this.worldMap.monsters || [];
      const aliveMonsters = monsters.filter(m => !m.dead && m.hp > 0);
      const botPetsForCanvas = this.worldMap.getBotPets();
      const botChars = this.worldMap.getBotCharacters();
      var remotePlayers = {};
      if (this.currentTab === 'mapOnline' && window.worldOnline) {
        remotePlayers = window.worldOnline.remotePlayers || {};
      }
      if (this.mapView) {
        this.mapView.syncEntities(alivePets, aliveMonsters, botPetsForCanvas, botChars, remotePlayers);
      }

      // Only update DOM in-place during exploring (avoids full re-render)
      if (isExploring) {
        this.updateWorldStatusInPlace(el, alivePets, aliveMonsters);
      }
    }, 450);
  }

  updateWorldStatusInPlace(el, alivePets, aliveMonsters) {
    // ⚠️ CRITICAL: Luôn wrap trong try-catch. Nếu throw, DOM cache (_domCache) có thể trỏ vào element cũ -> lỗi.
    // ⚠️ Khi nào gọi renderWorld(), PHẢI xoá el._domCache để cache được rebuild (DOM elements mới).
    try {
    const allPets = this.player.pets;
    const monsters = this.worldMap.monsters || [];
    const mapTimer = this.worldMap.mapTimer || 0;
    const minutes = Math.floor(mapTimer / 60);
    const seconds = mapTimer % 60;

    // Cache DOM references to avoid repeated queries
    if (!el._domCache) {
      el._domCache = {
        timerEl: el.querySelector('.map-timer'),
        infoSpans: el.querySelectorAll('.world-info span'),
        petListContainer: el.querySelector('.world-pets .world-pet-list'),
        monListContainer: el.querySelector('.world-monsters .world-pet-list'),
        botsSection: el.querySelector('.world-bots'),
        logEl: el.querySelector('.world-log-content'),
        teamContainer: el.querySelector('.world-team'),
        bossTimerContainer: el.querySelector('.world-boss-timers'),
        cmdSection: el.querySelector('.world-commands')
      };
    }
    const c = el._domCache;

    // Timer (lightweight)
    if (c.timerEl) c.timerEl.textContent = `⏱ ${minutes}:${String(seconds).padStart(2, '0')}`;

    // Kill count (lightweight)
    if (c.infoSpans.length >= 3) {
      c.infoSpans[1].textContent = `💀 Quái: ${this.worldMap.totalKills}`;
      c.infoSpans[2].textContent = `👑 Boss: ${this.worldMap.bossKillCount}`;
    }

    // Boss timers
    const bossMonsters = monsters.filter(m => m.isBoss && !m.dead && m.hp > 0);
    if (bossMonsters.length > 0 && !c.bossTimerContainer) {
      c.bossTimerContainer = document.createElement('div');
      c.bossTimerContainer.className = 'world-boss-timers';
      const info = el.querySelector('.world-info');
      const monSection = el.querySelector('.world-monsters');
      if (info && monSection) {
        info.parentNode.insertBefore(c.bossTimerContainer, monSection);
      } else {
        el.appendChild(c.bossTimerContainer);
      }
    }
    if (c.bossTimerContainer) {
      c.bossTimerContainer.innerHTML = bossMonsters.length > 0
        ? bossMonsters.map(b => {
            const elapsed = mapTimer - (b._spawnTime || 0);
            const nextLevelIn = Math.max(0, 600 - (elapsed % 600));
            const nextMin = Math.floor(nextLevelIn / 60);
            const nextSec = nextLevelIn % 60;
            const capText = b._maxLevel ? ` (tối đa Lv.${b._maxLevel})` : '';
            return `<div class="boss-timer">👑 ${b.name} Lv.${b.level}${capText} — lên cấp sau ${nextMin}:${String(nextSec).padStart(2, '0')}</div>`;
          }).join('')
        : '';
    }

    // Pet list — rebuild only if count changed
    if (c.petListContainer && c._lastPetCount !== allPets.length) {
      c.petListContainer.innerHTML = allPets.map(p => this.worldPetItem(p)).join('');
      c._lastPetCount = allPets.length;
    } else if (c.petListContainer) {
      // Update HP bars in-place without full rebuild
      const petEls = c.petListContainer.querySelectorAll('.world-pet');
      for (let i = 0; i < petEls.length && i < allPets.length; i++) {
        const p = allPets[i];
        const bar = petEls[i].querySelector('.bar');
        const hpSpan = petEls[i].querySelector('.pet-hp');
        if (bar) bar.style.width = Math.floor(Math.max(0, p.hp) / p.maxHp * 100) + '%';
        if (hpSpan) hpSpan.textContent = `${Math.max(0, p.hp)}/${p.maxHp}`;
        petEls[i].classList.toggle('dead', p.dead);
      }
    }

    // Monster list — rebuild only if count changed
    if (c.monListContainer && c._lastMonCount !== aliveMonsters.length) {
      c.monListContainer.innerHTML = aliveMonsters.length
        ? aliveMonsters.map(m => this.worldMonsterItem(m)).join('')
        : '<span class="empty-msg">Không có quái</span>';
      c._lastMonCount = aliveMonsters.length;
    } else if (c.monListContainer) {
      const monEls = c.monListContainer.querySelectorAll('.world-pet');
      for (let i = 0; i < monEls.length && i < aliveMonsters.length; i++) {
        const m = aliveMonsters[i];
        const bar = monEls[i].querySelector('.bar');
        const hpSpan = monEls[i].querySelector('.pet-hp');
        if (bar) bar.style.width = Math.floor(Math.max(0, m.hp) / m.maxHp * 100) + '%';
        if (hpSpan) hpSpan.textContent = `${Math.max(0, m.hp)}/${m.maxHp}`;
      }
    }

    // Bot players — rebuild only if bots changed
    if (c.botsSection) {
      const botPlayers = this.worldMap.botPlayers || [];
      const botId = botPlayers.map(b => b.name).join(',');
      if (c._lastBotId !== botId) {
        c.botsSection.innerHTML = botPlayers.map(bp => `
          <div class="bot-player-group">
            <div class="bot-player-name">${bp.emoji} ${bp.name}</div>
            <div class="world-pet-list">
              ${bp.pets.map(pp => `
                <div class="world-pet bot ${pp.dead || pp.hp <= 0 ? 'dead' : ''}">
                  <span>${pp.emoji}</span>
                  <span class="pet-lvl">Lv.${pp.level}</span>
                  <div class="bar-container"><div class="bar hp" style="width:${Math.floor(Math.max(0, pp.hp) / pp.maxHp * 100)}%"></div></div>
                  <span class="pet-hp">${Math.max(0, pp.hp)}/${pp.maxHp}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('');
        c._lastBotId = botId;
      } else {
        // Update HP bars in-place for all bot pets across all bot players
        const botGroups = c.botsSection.querySelectorAll('.bot-player-group');
        botPlayers.forEach((bp, gi) => {
          const group = botGroups[gi];
          if (!group) return;
          const petEls = group.querySelectorAll('.world-pet');
          for (let i = 0; i < petEls.length && i < bp.pets.length; i++) {
            const pp = bp.pets[i];
            const bar = petEls[i].querySelector('.bar');
            const hpSpan = petEls[i].querySelector('.pet-hp');
            if (bar) bar.style.width = Math.floor(Math.max(0, pp.hp) / pp.maxHp * 100) + '%';
            if (hpSpan) hpSpan.textContent = `${Math.max(0, pp.hp)}/${pp.maxHp}`;
            petEls[i].classList.toggle('dead', pp.dead || pp.hp <= 0);
          }
        });
      }
    }

    // Update command buttons when bot state changes
    if (c.cmdSection) {
      const botCount = this.worldMap.botPlayers?.length || 0;
      const removeBtn = c.cmdSection.querySelector('.btn-warning[onclick*="removeBot"]');
      const callBtn = c.cmdSection.querySelector('.btn-success[onclick*="callBot"]');
      if (botCount > 0 && !removeBtn) {
        const rBtn = document.createElement('button');
        rBtn.className = 'btn btn-sm btn-warning';
        rBtn.setAttribute('onclick', 'app.removeBot()');
        rBtn.textContent = '🤖 Bỏ bot (' + botCount + ')';
        c.cmdSection.appendChild(rBtn);
      } else if (botCount > 0 && removeBtn) {
        removeBtn.textContent = '🤖 Bỏ bot (' + botCount + ')';
      } else if (botCount === 0 && removeBtn) {
        removeBtn.remove();
      }
      if (!callBtn) {
        const cBtn = document.createElement('button');
        cBtn.className = 'btn btn-sm btn-success';
        cBtn.setAttribute('onclick', 'app.callBot()');
        cBtn.textContent = '🤖 Gọi bot';
        c.cmdSection.appendChild(cBtn);
      }
    }

    // Log — only update if new entries
    if (c.logEl) {
      const recentLog = this.worldMap.fightLog.slice(-10);
      const logKey = recentLog.length > 0 ? recentLog[recentLog.length - 1].text : '';
      if (c._lastLogKey !== logKey) {
        c.logEl.innerHTML = recentLog.length
          ? recentLog.map(l => `<div class="log-${l.type}">${l.text}</div>`).join('')
          : '<div class="empty-msg">Chưa có chiến đấu nào</div>';
        c._lastLogKey = logKey;
        c.logEl.scrollTop = c.logEl.scrollHeight;
      }
    }

    // Team preview — only update if team changed
    if (c.teamContainer) {
      const teamKey = (this.player.battleTeam || []).join(',');
      if (c._lastTeamKey !== teamKey) {
        const label = c.teamContainer.querySelector('.team-label');
        const prev = c.teamContainer.querySelectorAll('.team-pet');
        prev.forEach(p => p.remove());
        const reserveSpan = c.teamContainer.querySelector('.reserve-count');
        if (reserveSpan) reserveSpan.remove();
        label.insertAdjacentHTML('afterend', this.getBattleTeamPreview());
        if (this.worldMap.reservePetIds && this.worldMap.reservePetIds.length > 0) {
          const rc = document.createElement('span');
          rc.className = 'reserve-count';
          rc.title = 'Pet dự bị';
          rc.textContent = '+' + this.worldMap.reservePetIds.length;
          label.insertAdjacentElement('afterend', rc);
        }
        c._lastTeamKey = teamKey;
      }
    }

    // Player avatar
    if (this.mapView) this.mapView.setPlayer(this.player);
    } catch (e) {
      console.warn('updateWorldStatusInPlace error', e);
      // Invalidate DOM cache if something went wrong
      if (el) delete el._domCache;
    }
  }

  getAliveStrongest(count) {
    return this.player.pets.filter(p => !p.dead && p.hp > 0).sort((a, b) => b.getPower() - a.getPower()).slice(0, count);
  }

  getBattleTeamPreview() {
    const bt = this.player.battleTeam;
    let teamPets = [];
    if (bt && bt.length > 0) {
      teamPets = bt.map(id => this.player.getPet(id)).filter(p => p && !p.dead && p.hp > 0);
    }
    if (teamPets.length === 0) {
      teamPets = this.getAliveStrongest(3);
    }
    if (teamPets.length > 0) {
      return teamPets.map(p => `<span class="team-pet" title="Lv.${p.level} ${p.name}">${p.emoji}</span>`).join('');
    }
    return '<span class="empty-msg">Không có pet sống</span>';
  }

  showTeamReorder() {
    let bt = this.player.battleTeam;
    if (bt && bt.length > 0) {
      bt = bt.filter(id => { const p = this.player.getPet(id); return p && !p.dead && p.hp > 0; });
    }
    if (!bt || bt.length === 0) {
      bt = this.getAliveStrongest(3).map(p => p.id);
    }
    let html = `
      <div class="section-title">☰ Sắp xếp đội hình</div>
      <div style="font-size:11px;color:var(--text-dim);margin-bottom:8px">Thứ tự pet ưu tiên ra sân</div>
      <div class="reorder-list" id="reorder-list">`;
    for (let i = 0; i < bt.length; i++) {
      const p = this.player.getPet(bt[i]);
      if (!p) continue;
      html += `
        <div class="reorder-item" data-index="${i}">
          <span class="reorder-handle">⠿</span>
          <span class="reorder-emoji">${p.emoji}</span>
          <span class="reorder-name">${p.name}</span>
          <span class="reorder-lvl">Lv.${p.level}</span>
          <span class="reorder-power">⚡${p.getPower()}</span>
          <div class="reorder-btns">
            ${i > 0 ? `<button class="btn btn-sm btn-secondary" onclick="app.ui.moveTeamPet(${i}, -1)">▲</button>` : '<span></span>'}
            ${i < bt.length - 1 ? `<button class="btn btn-sm btn-secondary" onclick="app.ui.moveTeamPet(${i}, 1)">▼</button>` : '<span></span>'}
          </div>
        </div>`;
    }
    html += `</div>
      <div style="margin-top:8px;display:flex;gap:8px">
        <button class="btn btn-primary" onclick="app.ui.confirmTeamReorder()">Xác nhận</button>
        <button class="btn btn-close" onclick="app.ui.closeModal()">Hủy</button>
      </div>`;
    this.showModal(html);
    this._reorderList = [...bt];
  }

  moveTeamPet(index, direction) {
    const list = this._reorderList;
    if (!list) return;
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= list.length) return;
    [list[index], list[newIdx]] = [list[newIdx], list[index]];
    this._reorderList = list;
    // Re-render
    this.showTeamReorder();
  }

  confirmTeamReorder() {
    const list = this._reorderList || [];
    this.player.battleTeam = list.filter(id => { const p = this.player.getPet(id); return p && !p.dead && p.hp > 0; });
    this.save();
    this.closeModal();
    this.toast('✅ Đã cập nhật thứ tự đội hình!');
    this.renderWorld();
  }

  showTeamFormation() {
    const pets = this.player.pets;
    let current = this.player.battleTeam.length > 0 ? this.player.battleTeam : [];
    // Filter out dead pets from current team
    if (current.length > 0) {
      current = current.filter(id => { const p = this.player.getPet(id); return p && !p.dead && p.hp > 0; });
    }
    // If battleTeam is empty or all dead, default to strongest alive
    let selected;
    if (current.length > 0) {
      selected = [...current];
    } else {
      selected = this.getAliveStrongest(3).map(p => p.id);
    }

    const maxSlots = 3;
    let html = `
      <div class="section-title">🐾 Chọn đội hình (tối đa ${maxSlots})</div>
      <div style="margin-bottom:8px;font-size:11px;color:var(--text-dim)">Chọn pet mạnh nhất cho chiến đấu map</div>
      <div style="max-height:360px;overflow-y:auto">`;
    for (const p of pets) {
      const isSelected = selected.includes(p.id);
      const selIdx = selected.indexOf(p.id);
      html += `
        <div class="team-select-item ${isSelected ? 'selected' : ''} ${p.dead ? 'dead' : ''}" data-pet-id="${p.id}" onclick="app.ui.toggleTeamPet(${p.id})">
          <span class="team-slot-num">${isSelected ? selIdx + 1 : '-'}</span>
          <span class="team-select-emoji">${p.emoji}</span>
          <span class="team-select-name">${p.name}</span>
          <span class="team-select-lvl">Lv.${p.level}</span>
          <span class="team-select-power">⚡${p.getPower()}</span>
          ${p.dead ? '<span class="dead-tag">💀</span>' : ''}
          ${isSelected ? '<span class="team-check">✅</span>' : ''}
        </div>`;
    }
    html += `</div>
      <button class="btn btn-primary" onclick="app.ui.confirmTeam()" style="margin-top:8px">Xác nhận</button>
      <button class="btn btn-close" onclick="app.ui.closeModal()">Hủy</button>`;
    this.showModal(html);
    this._teamSelection = selected;
  }

  toggleTeamPet(petId) {
    if (!this._teamSelection) this._teamSelection = [];
    const idx = this._teamSelection.indexOf(petId);
    if (idx !== -1) {
      this._teamSelection.splice(idx, 1);
    } else {
      if (this._teamSelection.length >= 3) {
        this.toast('Chỉ chọn tối đa 3 pet!');
        return;
      }
      this._teamSelection.push(petId);
    }
    // Update DOM in-place
    const items = document.querySelectorAll('.team-select-item');
    for (const item of items) {
      const id = parseInt(item.getAttribute('data-pet-id'));
      const newIdx = this._teamSelection.indexOf(id);
      const isSel = newIdx !== -1;
      item.classList.toggle('selected', isSel);
      const slotEl = item.querySelector('.team-slot-num');
      if (slotEl) slotEl.textContent = isSel ? (newIdx + 1) : '-';
      const checkEl = item.querySelector('.team-check');
      if (checkEl) checkEl.remove();
      if (isSel) {
        const span = document.createElement('span');
        span.className = 'team-check';
        span.textContent = '✅';
        item.appendChild(span);
      }
    }
  }

  confirmTeam() {
    const sel = this._teamSelection || [];
    // Only keep alive pets
    this.player.battleTeam = sel.filter(id => { const p = this.player.getPet(id); return p && !p.dead && p.hp > 0; });
    this.save();
    this.closeModal();
    this.toast('✅ Đã cập nhật đội hình!');
    this.renderWorld();
  }

  showCostumeInfo() {
    const c = DATA.COSTUMES.find(x => x.id === this.player.costume) || DATA.COSTUMES[0];
    const owned = this.player.ownedCostumes.map(id => DATA.COSTUMES.find(x => x.id === id)).filter(Boolean);
    this.showModal(`
      <div class="section-title">${c.emoji} ${this.player.name}</div>
      <div style="text-align:center;padding:16px">
        <div style="display:inline-block;background:${c.color};border-radius:50%;width:60px;height:60px;line-height:60px;font-size:32px;margin-bottom:8px">${c.emoji}</div>
        <div style="font-size:14px;font-weight:bold">${c.name}</div>
        <div style="font-size:11px;color:var(--text-dim);margin-top:4px">${c.desc}</div>
      </div>
      <div class="sub-title">👗 Phục trang đã sở hữu (${owned.length})</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
        ${owned.map(o => `
          <div class="costume-mini ${o.id === this.player.costume ? 'active' : ''}" onclick="app.equipCostume('${o.id}')" style="background:${o.color};width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer;border:2px solid ${o.id === this.player.costume ? '#FFD700' : 'transparent'}">
            ${o.emoji}
          </div>
        `).join('')}
      </div>
      <div style="font-size:11px;color:var(--text-dim);text-align:center">👆 Chọn phục trang hoặc mua thêm ở 🏪 Shop</div>
      <button class="btn btn-close" onclick="app.ui.closeModal()">Đóng</button>
    `);
  }

  _renderPvPBattleContent(el) {
    const pvp = this.activePvPBattle;
    if (!pvp) return;

    const playerTeam = pvp.playerTeam;
    const enemyTeam = pvp.enemyTeam;

    el.innerHTML = `
      <div class="section-title">👤 PvP — Trận chiến thời gian thực</div>
      <div class="pvp-battle-layout">
        <div class="pvp-team-left">
          <div class="sub-title">🐾 Đội nhà</div>
          <div class="pvp-pet-list" id="pvp-team1-list">
            ${playerTeam.map(p => {
              const hpPct = Math.floor(p.hp / p.maxHp * 100);
              return `<div class="world-pet" data-pvp1="${p.id}">
                <span>${p.emoji}</span>
                <span class="pet-lvl">Lv.${p.level}</span>
                <div class="bar-container"><div class="bar hp" style="width:${hpPct}%"></div></div>
                <span class="pet-hp">${p.hp}/${p.maxHp}</span>
              </div>`;
            }).join('')}
          </div>
        </div>
        <div class="pvp-canvas-area">
          <canvas id="pvp-canvas" width="560" height="260" class="pixel-canvas"></canvas>
        </div>
        <div class="pvp-team-right">
          <div class="sub-title">👤 Đối thủ</div>
          <div class="pvp-pet-list" id="pvp-team2-list">
            ${enemyTeam.map(p => {
              const hpPct = Math.floor(p.hp / p.maxHp * 100);
              return `<div class="world-pet" data-pvp2="${p.id}">
                <span>${p.emoji}</span>
                <span class="pet-lvl">Lv.${p.level}</span>
                <div class="bar-container"><div class="bar hp" style="width:${hpPct}%"></div></div>
                <span class="pet-hp">${p.hp}/${p.maxHp}</span>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>
      <div class="pvp-log-container" id="pvp-log">
        <div class="log-system">⚔️ Trận PvP bắt đầu!</div>
      </div>
      <div class="pvp-actions" style="text-align:center;margin-top:6px">
        <button class="btn btn-sm btn-danger" onclick="app.ui.leavePvP()">✖ Thoát</button>
      </div>
    `;

    const canvas = document.getElementById('pvp-canvas');
    if (!canvas) return;

    const mv = new MapView2D(canvas);
    mv.setTheme('grass');
    this.activePvPMapView = mv;

    const sync = () => {
      const aliveP1 = pvp.playerTeam.filter(p => !p.dead && p.hp > 0);
      const aliveP2 = pvp.enemyTeam.filter(p => !p.dead && p.hp > 0);
      const monsters = aliveP2.map(p => ({
        ...p,
        isMonster: true,
        element: getPetElement(p.baseId)
      }));
      mv.syncEntities(aliveP1, monsters, [], []);
    };

    pvp.onAttackAnim = (attackerId, targetId, dmg, isCrit, skillType, roleId, isUltimate) => {
      mv.queueAction(attackerId, targetId, dmg, isCrit, skillType, roleId, isUltimate);
    };

    pvp.onUpdate = (b) => {
      sync();

      const logEl = document.getElementById('pvp-log');
      if (logEl) {
        const recent = b.fightLog.slice(-8);
        logEl.innerHTML = recent.map(l => `<div class="log-${l.type}">${l.text}</div>`).join('');
        logEl.scrollTop = logEl.scrollHeight;
      }

      const t1 = document.getElementById('pvp-team1-list');
      const t2 = document.getElementById('pvp-team2-list');
      if (t1) {
        const items = t1.querySelectorAll('.world-pet');
        for (let i = 0; i < items.length && i < b.playerTeam.length; i++) {
          const p = b.playerTeam[i];
          const bar = items[i].querySelector('.bar');
          const hpSpan = items[i].querySelector('.pet-hp');
          if (bar) bar.style.width = Math.floor(Math.max(0, p.hp) / p.maxHp * 100) + '%';
          if (hpSpan) hpSpan.textContent = `${Math.max(0, p.hp)}/${p.maxHp}`;
          items[i].classList.toggle('dead', p.dead || p.hp <= 0);
        }
      }
      if (t2) {
        const items = t2.querySelectorAll('.world-pet');
        for (let i = 0; i < items.length && i < b.enemyTeam.length; i++) {
          const p = b.enemyTeam[i];
          const bar = items[i].querySelector('.bar');
          const hpSpan = items[i].querySelector('.pet-hp');
          if (bar) bar.style.width = Math.floor(Math.max(0, p.hp) / p.maxHp * 100) + '%';
          if (hpSpan) hpSpan.textContent = `${Math.max(0, p.hp)}/${p.maxHp}`;
          items[i].classList.toggle('dead', p.dead || p.hp <= 0);
        }
      }
    };

    sync();
    mv.start();
  }

  save() {
    if (app && app.saveGame) app.saveGame();
  }
}
