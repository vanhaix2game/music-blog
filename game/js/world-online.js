class WorldOnlineManager {
  constructor() {
    this.mapId = null;
    this.isHost = false;
    this.remotePlayers = {};
    this.remoteMonsters = {};
    this._posTimer = null;
    this._unsub = null;
    this.onPlayersUpdate = null;
    this.onMonstersUpdate = null;
    this.onResourcesUpdate = null;
  }

  async createWorld(name, emoji) {
    var result = await FirebaseOnline.createWorldRoom(name, emoji);
    if (!result) return null;
    this.mapId = result.mapId;
    this.isHost = true;
    this._startWatching();
    return result;
  }

  async joinWorld(roomId, name, emoji) {
    var room = await FirebaseOnline.joinWorldRoom(roomId, name, emoji);
    if (!room) return null;
    this.mapId = room.mapId;
    this.isHost = false;
    this._startWatching();
    return room;
  }

  leaveWorld() {
    if (this._posTimer) { clearInterval(this._posTimer); this._posTimer = null; }
    FirebaseOnline.leaveWorldRoom();
    this._cleanup();
  }

  startSyncPosition(worldMap) {
    if (this._posTimer) clearInterval(this._posTimer);
    var self = this;
    this._posTimer = setInterval(function(){
      if (!self.mapId) return;
      var pos = worldMap.getPlayerPosition();
      if (pos) FirebaseOnline.updatePlayerPosition(self.mapId, pos.x, pos.y);
    }, 200);
  }

  stopSyncPosition() {
    if (this._posTimer) { clearInterval(this._posTimer); this._posTimer = null; }
  }

  updatePlayerHP(mapId, hp, maxHp, alive) {
    FirebaseOnline.updatePlayerState(mapId, { hp: hp, maxHp: maxHp, alive: alive });
  }

  syncMonster(monsterId, data) {
    if (!this.mapId) return;
    FirebaseOnline.updateWorldMonster(this.mapId, monsterId, data);
  }

  removeMonster(monsterId) {
    if (!this.mapId) return;
    FirebaseOnline.removeWorldMonster(this.mapId, monsterId);
  }

  syncResource(resId, data) {
    if (!this.mapId) return;
    FirebaseOnline.updateWorldResource(this.mapId, resId, data);
  }

  _startWatching() {
    if (this._unsub) this._unsub();
    var self = this;
    this._unsub = FirebaseOnline.watchWorldMap(this.mapId, function(data){
      if (!data) return;
      var players = {};
      if (data.players) {
        for (var uid in data.players) {
          if (uid !== FirebaseOnline.uid) players[uid] = data.players[uid];
        }
      }
      self.remotePlayers = players;
      if (self.onPlayersUpdate) self.onPlayersUpdate(players);

      var monsters = data.monsters || {};
      self.remoteMonsters = monsters;
      if (self.onMonstersUpdate) self.onMonstersUpdate(monsters);

      if (self.onResourcesUpdate && data.resources) {
        self.onResourcesUpdate(data.resources);
      }
    });
  }

  _cleanup() {
    this.mapId = null;
    this.isHost = false;
    this.remotePlayers = {};
    this.remoteMonsters = {};
    if (this._unsub) { this._unsub(); this._unsub = null; }
  }
}

window.worldOnline = new WorldOnlineManager();
