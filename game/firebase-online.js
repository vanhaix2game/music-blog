(function(){
  var config = {
    apiKey: "AIzaSyBM7Oysa5yni_3uFa_fkxiDLtO-hmD10HQ",
    authDomain: "planning-with-ai-142c8.firebaseapp.com",
    databaseURL: "https://planning-with-ai-142c8-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "planning-with-ai-142c8",
    storageBucket: "planning-with-ai-142c8.firebasestorage.app",
    messagingSenderId: "260848244627",
    appId: "1:260848244627:web:f75ac226aeafd755cd7a66"
  };

  if (!firebase.apps.length) firebase.initializeApp(config);
  var auth = firebase.auth();
  var db = firebase.database();

  var FirebaseOnline = {
    auth: auth,
    db: db,
    uid: null,
    isLoggedIn: false,
    _battleListeners: {},
    _roomListener: null,
    _currentRoomId: null,
    onRoomUpdate: null,
    onBattleUpdate: null,
    onError: null,

    init: function(){
      return new Promise(function(resolve){
        auth.onAuthStateChanged(function(user){
          if(user){
            FirebaseOnline.uid = user.uid;
            FirebaseOnline.isLoggedIn = true;
            resolve(user);
          } else {
            FirebaseOnline.uid = null;
            FirebaseOnline.isLoggedIn = false;
            resolve(null);
          }
        });
      });
    },

    signIn: function(email, password){
      return auth.signInWithEmailAndPassword(email, password);
    },

    signOut: function(){
      FirebaseOnline.leaveCurrentRoom();
      return auth.signOut();
    },

    loadGame: function(){
      return new Promise(function(resolve){
        if(!FirebaseOnline.isLoggedIn){resolve(null);return;}
        db.ref('online_users/'+FirebaseOnline.uid).once('value').then(function(snap){
          resolve(snap.val());
        }).catch(function(e){
          if(FirebaseOnline.onError) FirebaseOnline.onError(e);
          resolve(null);
        });
      });
    },

    saveGame: function(data){
      if(!FirebaseOnline.isLoggedIn) return Promise.resolve();
      data.lastSave = firebase.database.ServerValue.TIMESTAMP;
      return db.ref('online_users/'+FirebaseOnline.uid).update(data).catch(function(e){
        if(FirebaseOnline.onError) FirebaseOnline.onError(e);
      });
    },

    getOpenRooms: function(){
      return new Promise(function(resolve){
        db.ref('pvp_rooms').orderByChild('status').equalTo('waiting').once('value', function(snap){
          var rooms = [];
          snap.forEach(function(child){
            var r = child.val();
            r.id = child.key;
            rooms.push(r);
          });
          resolve(rooms);
        });
      });
    },

    listenRooms: function(callback){
      if(FirebaseOnline._roomListener) FirebaseOnline._roomListener();
      var ref = db.ref('pvp_rooms').orderByChild('status').equalTo('waiting');
      FirebaseOnline._roomListener = ref.on('value', function(snap){
        var rooms = [];
        snap.forEach(function(child){
          var r = child.val();
          r.id = child.key;
          rooms.push(r);
        });
        callback(rooms);
      });
      return function(){ref.off('value', FirebaseOnline._roomListener);};
    },

    createRoom: function(pets){
      return new Promise(function(resolve){
        if(!FirebaseOnline.isLoggedIn){resolve(null);return;}
        var roomRef = db.ref('pvp_rooms').push();
        var player = FirebaseOnline._playerData(pets);
        var room = {
          host: player,
          guest: null,
          status: 'waiting',
          created: firebase.database.ServerValue.TIMESTAMP
        };
        roomRef.set(room).then(function(){
          FirebaseOnline._currentRoomId = roomRef.key;
          resolve(roomRef.key);
        });
      });
    },

    joinRoom: function(roomId, pets){
      return new Promise(function(resolve, reject){
        if(!FirebaseOnline.isLoggedIn){reject('Chưa đăng nhập');return;}
        var ref = db.ref('pvp_rooms/'+roomId);
        ref.once('value').then(function(snap){
          var room = snap.val();
          if(!room){reject('Phòng không tồn tại');return;}
          if(room.status !== 'waiting'){reject('Phòng đã đầy hoặc kết thúc');return;}
          if(room.host.uid === FirebaseOnline.uid){reject('Không thể join phòng của chính mình');return;}
          var player = FirebaseOnline._playerData(pets);
          room.guest = player;
          room.status = 'ready';
          room.battleId = 'battle_'+Date.now();
          ref.update({
            guest: player,
            status: 'ready',
            battleId: room.battleId
          }).then(function(){
            FirebaseOnline._currentRoomId = roomId;
            FirebaseOnline._initBattle(room.battleId, room.host.pets, player.pets);
            resolve(room);
          });
        });
      });
    },

    _playerData: function(pets){
      return {
        uid: FirebaseOnline.uid,
        name: localStorage.getItem('musicblog_username') || 'Người chơi',
        pets: pets.map(function(p){return p.toJSON();})
      };
    },

    watchRoom: function(roomId, callback){
      var ref = db.ref('pvp_rooms/'+roomId);
      ref.on('value', function(snap){
        callback(snap.val());
      });
      return function(){ref.off('value');};
    },

    leaveCurrentRoom: function(){
      if(FirebaseOnline._currentRoomId){
        db.ref('pvp_rooms/'+FirebaseOnline._currentRoomId).remove();
        FirebaseOnline._currentRoomId = null;
      }
    },

    _initBattle: function(battleId, team1Data, team2Data){
      var battleRef = db.ref('pvp_battles/'+battleId);
      var state = {
        roomId: FirebaseOnline._currentRoomId,
        turn: 0,
        team1: team1Data,
        team2: team2Data,
        winner: 0,
        log: ['⚔️ Trận đấu bắt đầu!'],
        lastTick: Date.now()
      };
      battleRef.set(state);
    },

    watchBattle: function(battleId, callback){
      if(FirebaseOnline._battleListeners[battleId]){
        FirebaseOnline._battleListeners[battleId]();
      }
      var ref = db.ref('pvp_battles/'+battleId);
      var listener = ref.on('value', function(snap){
        callback(snap.val());
      });
      FirebaseOnline._battleListeners[battleId] = function(){ref.off('value', listener);};
      return FirebaseOnline._battleListeners[battleId];
    },

    updateBattle: function(battleId, state){
      var data = {
        turn: state.turn,
        team1: state.team1,
        team2: state.team2,
        winner: state.winner,
        log: state.log.slice(-100),
        lastTick: Date.now()
      };
      return db.ref('pvp_battles/'+battleId).update(data);
    },

    endBattle: function(battleId, winner){
      return db.ref('pvp_battles/'+battleId).update({
        winner: winner,
        lastTick: Date.now()
      }).then(function(){
        if(FirebaseOnline._currentRoomId){
          db.ref('pvp_rooms/'+FirebaseOnline._currentRoomId).update({
            status: 'ended'
          });
        }
      });
    }
  };

  window.FirebaseOnline = FirebaseOnline;
})();
