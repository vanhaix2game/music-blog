class WorldOnlineManager {
  constructor() {
    this.isOnline = false;
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

  async enterWorld(name, emoji) {
    var result = await FirebaseOnline.enterWorld(name, emoji);
    if (!result) return false;
    this.isOnline = true;
    this.isHost = result.isHost;
    this.myName = name;
    this.myEmoji = emoji;
    this._startWatching();
    this._startWatchChallenges();
    return true;
  }

  leaveWorld() {
    this.isOnline = false;
    this.isHost = false;
    if (this._posTimer) { clearInterval(this._posTimer); this._posTimer = null; }
    FirebaseOnline.leaveWorld();
    this._cleanup();
  }

  startSyncPosition(worldMap) {
    if (this._posTimer) clearInterval(this._posTimer);
    var self = this;
    this._posTimer = setInterval(function(){
      if (!self.isOnline) return;
      var pos = worldMap.getPlayerPosition();
      if (pos) FirebaseOnline.updatePlayerPosition(pos.x, pos.y);
    }, 200);
  }

  stopSyncPosition() {
    if (this._posTimer) { clearInterval(this._posTimer); this._posTimer = null; }
  }

  updatePlayerHP(hp, maxHp, alive) {
    FirebaseOnline.updatePlayerState({ hp: hp, maxHp: maxHp, alive: alive });
  }

  challengePlayer(targetUid) {
    if (this._outgoingChallengeId) return;
    var self = this;
    return FirebaseOnline.sendChallenge(targetUid, this.myName, this.myEmoji).then(function(id){
      self._outgoingChallengeId = id;
      self._outgoingTarget = targetUid;
      return id;
    });
  }

  cancelChallenge() {
    if (!this._outgoingChallengeId) return;
    var self = this;
    FirebaseOnline.respondToChallenge(this._outgoingChallengeId, false).then(function(){
      self._outgoingChallengeId = null;
      self._outgoingTarget = null;
    });
  }

  respondToChallenge(challengeId, accept) {
    var self = this;
    return FirebaseOnline.respondToChallenge(challengeId, accept).then(function(){
      if (accept) self._outgoingChallengeId = null;
    });
  }

  _startWatchChallenges() {
    if (this._challengeUnsub) this._challengeUnsub();
    var self = this;
    FirebaseOnline.watchChallenges(function(challenges){
      for (var id in challenges) {
        var c = challenges[id];
        if (!c || c.status === 'declined') continue;
        if (c.to === FirebaseOnline.uid && c.status === 'pending') {
          if (self.onChallenge) self.onChallenge(id, c);
        }
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
    this._unsub = FirebaseOnline.watchWorld(function(data){
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