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

  watchBattle(battleId, callback) {
    this.currentBattleId = battleId;
    this.onBattleUpdate = callback;
    if (this._battleUnsub) this._battleUnsub();
    this._battleUnsub = FirebaseOnline.watchBattle(battleId, (data) => {
      if (this.onBattleUpdate) this.onBattleUpdate(data);
    });
  }

  syncBattleState(battleId, battleState) {
    return FirebaseOnline.updateBattle(battleId, battleState);
  }

  endBattle(battleId, winner) {
    return FirebaseOnline.endBattle(battleId, winner);
  }

  _startWatchingRoom(roomId) {
    if (this._roomUnsub) this._roomUnsub();
    this._roomUnsub = FirebaseOnline.watchRoom(roomId, (room) => {
      if (!room || room.status === 'ended') {
        if (this.onRoomClosed) this.onRoomClosed();
        this._cleanup();
        return;
      }
      if (room.status === 'ready' && room.battleId) {
        this.currentBattleId = room.battleId;
        if (this.isHost) {
          FirebaseOnline._initBattle(room.battleId, room.host.pets, room.guest.pets);
        }
        if (this.onJoined) this.onJoined(room);
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
