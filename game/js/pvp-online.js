class PvPOnlineManager {
  constructor() {
    this.currentRoomId = null;
    this.currentBattleId = null;
    this.isHost = false;
    this._roomUnsub = null;
    this._battleUnsub = null;
    this.onRoomListChange = null;
    this.onBattleUpdate = null;
    this.onError = null;
    this.onJoined = null;
    this.onRoomClosed = null;
  }

  async findOpenRooms() {
    try {
      const rooms = await FirebaseOnline.getOpenRooms();
      return rooms.filter(r => r.host.uid !== FirebaseOnline.uid);
    } catch (e) {
      if (this.onError) this.onError('Không thể tải danh sách phòng');
      return [];
    }
  }

  async createRoom(pets) {
    try {
      const roomId = await FirebaseOnline.createRoom(pets);
      if (!roomId) {
        if (this.onError) this.onError('Tạo phòng thất bại');
        return null;
      }
      this.currentRoomId = roomId;
      this.isHost = true;
      this._startWatchingRoom(roomId);
      return roomId;
    } catch (e) {
      if (this.onError) this.onError('Lỗi tạo phòng: ' + e.message);
      return null;
    }
  }

  async findOrCreateRoom(pets) {
    const rooms = await this.findOpenRooms();
    const available = rooms.find(r => r.status === 'waiting' && r.host.uid !== FirebaseOnline.uid);
    if (available) {
      return this.joinRoom(available.id, pets);
    }
    return this.createRoom(pets);
  }

  startListening(callback) {
    this.onRoomListChange = callback;
    if (this._roomUnsub) this._roomUnsub();
    this._roomUnsub = FirebaseOnline.listenRooms((rooms) => {
      if (this.onRoomListChange) {
        this.onRoomListChange(rooms.filter(r => r.host.uid !== FirebaseOnline.uid));
      }
    });
  }

  stopListening() {
    if (this._roomUnsub) {
      this._roomUnsub();
      this._roomUnsub = null;
    }
  }

  async joinRoom(roomId, pets) {
    try {
      const room = await FirebaseOnline.joinRoom(roomId, pets);
      if (!room) {
        if (this.onError) this.onError('Không thể tham gia phòng');
        return null;
      }
      this.currentRoomId = roomId;
      this.currentBattleId = room.battleId;
      this.isHost = false;
      if (this.onJoined) this.onJoined(room);
      return room;
    } catch (e) {
      if (this.onError) this.onError(e.message || 'Lỗi tham gia phòng');
      return null;
    }
  }

  leaveRoom() {
    FirebaseOnline.leaveCurrentRoom();
    this._cleanup();
  }

  // Host starts battle engine and syncs to Firebase
  startHostBattle(room) {
    if (!room || !room.battleId) return;
    this.currentBattleId = room.battleId;
    var hostPets = (room.host.pets || []).map(function(d){ return Pet.fromJSON(d); });
    var guestPets = (room.guest.pets || []).map(function(d){ return Pet.fromJSON(d); });
    var pvp = new PVPBattle(null);
    pvp.start(hostPets, guestPets, true);
    pvp.onUpdate = function(b){
      FirebaseOnline.updateBattle(room.battleId, {
        turn: b.turn,
        team1: b.playerTeam.map(function(p){ return p.toJSON(); }),
        team2: b.enemyTeam.map(function(p){ return p.toJSON(); }),
        winner: b.winner,
        log: b.fightLog
      });
    };
    pvp.onEnd = function(b){
      FirebaseOnline.endBattle(room.battleId, b.winner);
    };
    return pvp;
  }

  startWatching(room, onData){
    if (!room || !room.battleId) return;
    this.currentBattleId = room.battleId;
    if (this._battleUnsub) this._battleUnsub();
    this._battleUnsub = FirebaseOnline.watchBattle(room.battleId, function(data){
      if (onData) onData(data);
    });
  }

  stopWatching(){
    if (this._battleUnsub){
      this._battleUnsub();
      this._battleUnsub = null;
    }
  }

  _startWatchingRoom(roomId) {
    if (this._roomUnsub) this._roomUnsub();
    var self = this;
    this._roomUnsub = FirebaseOnline.watchRoom(roomId, function(room){
      if (!room || room.status === 'ended') {
        if (self.onRoomClosed) self.onRoomClosed();
        self._cleanup();
        return;
      }
      if (room.status === 'ready' && room.battleId) {
        self.currentBattleId = room.battleId;
        if (self.onJoined) self.onJoined(room);
      }
    });
  }

  _cleanup() {
    this.currentRoomId = null;
    this.currentBattleId = null;
    this.isHost = false;
    if (this._roomUnsub) { this._roomUnsub(); this._roomUnsub = null; }
    if (this._battleUnsub) { this._battleUnsub(); this._battleUnsub = null; }
  }
}

window.pvpOnline = new PvPOnlineManager();
