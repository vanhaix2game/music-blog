class WorldOnlineManager {
  constructor() {
    this.mapId = null;
    this.isHost = false;
    this.remotePlayers = {};
    this.remoteMonsters = {};
    this._posTimer = null;
    this._unsub = null;
    this._challengeUnsub = null;
    this.onPlayersUpdate = null;
    this.onMonstersUpdate = null;
    this.onResourcesUpdate = null;
    this.onChallenge = null;
    this.onChallengeResponse = null;
    this.myName = '';
    this.myEmoji = '🐉';
    this._outgoingChallengeId = null;
    this._outgoingTarget = null;
  }

  async createWorld(name, emoji) {
    var result = await FirebaseOnline.createWorldRoom(name, emoji);
    if (!result) return null;
    this.mapId = result.mapId;
    this.isHost = true;
    this.myName = name;
    this.myEmoji = emoji;
    this._startWatching();
    this._startWatchChallenges();
    return result;
  }

  async joinWorld(roomId, name, emoji) {
    var room = await FirebaseOnline.joinWorldRoom(roomId, name, emoji);
    if (!room) return null;
    this.mapId = room.mapId;
    this.isHost = false;
    this.myName = name;
    this.myEmoji = emoji;
    this._startWatching();
    this._startWatchChallenges();
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

  updatePlayerHP(hp, maxHp, alive) {
    FirebaseOnline.updatePlayerState(this.mapId, { hp: hp, maxHp: maxHp, alive: alive });
  }

  challengePlayer(targetUid) {
    if (this._outgoingChallengeId) return;
    var self = this;
    return FirebaseOnline.sendChallenge(this.mapId, targetUid, this.myName, this.myEmoji).then(function(id){
      self._outgoingChallengeId = id;
      self._outgoingTarget = targetUid;
      return id;
    });
  }

  cancelChallenge() {
    if (!this._outgoingChallengeId) return;
    var self = this;
    FirebaseOnline.respondToChallenge(this.mapId, this._outgoingChallengeId, false).then(function(){
      self._outgoingChallengeId = null;
      self._outgoingTarget = null;
    });
  }

  respondToChallenge(challengeId, accept) {
    var self = this;
    return FirebaseOnline.respondToChallenge(this.mapId, challengeId, accept).then(function(){
      if (accept) self._outgoingChallengeId = null;
    });
  }

  _startWatchChallenges() {
    if (this._challengeUnsub) this._challengeUnsub();
    var self = this;
    FirebaseOnline.watchChallenges(this.mapId, function(challenges){
      for (var id in challenges) {
        var c = challenges[id];
        if (!c || c.status === 'declined') continue;
        // Incoming challenge (someone challenged us)
        if (c.to === FirebaseOnline.uid && c.status === 'pending') {
          if (self.onChallenge) self.onChallenge(id, c);
        }
        // Our outgoing challenge was responded to
        if (c.from === FirebaseOnline.uid && self._outgoingChallengeId === id) {
          self._outgoingChallengeId = null;
          self._outgoingTarget = null;
          if (c.status === 'accepted') {
            if (self.onChallengeResponse) self.onChallengeResponse(true, c);
          } else if (c.status === 'declined') {
            if (self.onChallengeResponse) self.onChallengeResponse(false, c);
          }
        }
      }
    });
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
    this._outgoingChallengeId = null;
    this._outgoingTarget = null;
    if (this._unsub) { this._unsub(); this._unsub = null; }
    if (this._challengeUnsub) { this._challengeUnsub(); this._challengeUnsub = null; }
    FirebaseOnline.unwatchChallenges();
  }
}

window.worldOnline = new WorldOnlineManager();
