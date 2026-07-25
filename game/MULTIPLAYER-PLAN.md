# Kế Hoạch Multiplayer — Pet Game Online

> Có 2 người làm song song: **T** (tôi) và **M** (Mimo)
> Các bước độc lập có thể làm đồng thời, các bước có ⛓️ là phải chờ nhau

---

## 🔷 TỔNG QUAN KIẾN TRÚC

```
┌──────────────────────────────────────────────────┐
│  personal.html (chứa Firebase Auth sẵn)          │
│  │                                                │
│  ├── iframe ─── game/index.html ─── Game App     │
│  │                    │                           │
│  │              ┌─────┴──────┐                    │
│  │              │  firebase-  │  (T - file mới)   │
│  │              │  online.js  │                    │
│  │              └─────┬──────┘                    │
│  │                    │                            │
│  │         ┌──────────┼──────────┐                │
│  │         ▼          ▼          ▼                │
│  │     app.js    pvp-online   ui.js               │
│  │     (T sửa)   (T tạo mới)  (M sửa)            │
│  │         │                    │                  │
│  │         └──────┬─────────────┘                 │
│  │                ▼                                │
│  │          Firebase RTDB                          │
│  │    ┌─────┬─────┬──────┬────────┐               │
│  │    │     │     │      │        │               │
│  │ online_users  pvp_rooms  pvp_battles           │
│  └──────────────────────────────────────────────────┘
│
└── Chat (đã có) — tất cả cùng chat chung
```

---

## 🔷 GIAO TIẾP GIỮA 2 TRACK

### Cấu trúc Firebase RTDB (thống nhất giữa T và M)

```js
// === Firebase paths ===

// A. Lưu game online (T làm)
online_users / {uid} / {
  name: string,
  pets: Pet[],          // toàn bộ pet của user
  equipment: {...},
  gold: number,
  diamond: number,
  pvpWins: number,
  pvpRating: number,
  lastSave: timestamp
}

// B. Phòng chơi (T làm, M dùng)
pvp_rooms / {roomId} / {
  host: { uid, name, emoji, pets: Pet[] },
  guest: { uid, name, emoji, pets: Pet[] } | null,
  status: 'waiting' | 'ready' | 'fighting' | 'ended',
  created: timestamp
}

// C. Trận đấu (T làm, M dùng)
pvp_battles / {battleId} / {
  roomId: string,
  players: [uid1, uid2],
  state: {           // snapshot mỗi turn
    turn: number,
    team1: [PetState],
    team2: [PetState],
    winner: 0 | 1 | 2,
    log: string[]
  },
  lastTick: timestamp
}
```

### File interfaces (T khai báo, M dùng)

```js
// --- firebase-online.js (global object) ---

const FirebaseOnline = {
  // Auth
  auth: firebase.auth(),        // dùng chung với personal.html
  uid: string,
  isLoggedIn: boolean,

  // Save/Load
  loadGame(): Promise<PlayerData | null>,
  saveGame(data: PlayerData): Promise<void>,

  // PvP Rooms
  getOpenRooms(): Promise<Room[]>,
  createRoom(myPets: Pet[]): Promise<roomId>,
  joinRoom(roomId, myPets: Pet[]): Promise<void>,
  leaveRoom(roomId): Promise<void>,

  // Battle sync
  onBattleUpdate(battleId, callback): unsubscribe,
  sendBattleAction(battleId, action): Promise<void>,
}
```

---

## 🔷 CHI TIẾT TỪNG BƯỚC

---

### 📌 Bước T1: Tạo `firebase-online.js` (T làm — 2h)

**File mới**: `game/firebase-online.js`
**Nội dung**: Module kết nối Firebase + load/save game online

```js
// firebase-online.js
// ============================================================
// PHỤ THUỘC: firebase-app.js, firebase-auth.js, firebase-database.js
// Đã được load từ personal.html (parent), cần lấy auth token từ parent

class FirebaseOnline {
  constructor() {
    this.auth = null;
    this.uid = null;
    this.db = null;
    this._battleListeners = {};
  }

  // Khởi tạo — nhận auth từ parent page (personal.html)
  // ⚠️ M sẽ dùng: await FirebaseOnline.init()
  async init() {
    // Lấy firebase instance từ parent page qua postMessage
    // Hoặc self-initialize nếu chạy độc lập
    // ...
  }

  // Load game data từ Firebase
  async loadGame() { /* ... */ }

  // Save game data lên Firebase
  async saveGame(data) { /* ... */ }

  // PvP Room methods
  async getOpenRooms() { /* ... */ }
  async createRoom(pets) { /* ... */ }
  async joinRoom(roomId, pets) { /* ... */ }
  async leaveRoom(roomId) { /* ... */ }

  // Battle sync
  onBattleUpdate(battleId, callback) { /* ... */ }
  async sendBattleAction(battleId, action) { /* ... */ }
}

window.FirebaseOnline = new FirebaseOnline();
```

### 📌 Bước T2: Sửa `app.js` — load/save online (T làm — 1h)

**Sửa file**: `game/js/app.js`

```js
// THÊM vào constructor:
// this.onlineMode = false;

// SỬA loadGame():
async loadGame() {
  if (FirebaseOnline.isLoggedIn) {
    const onlineData = await FirebaseOnline.loadGame();
    if (onlineData) {
      this.player = Player.fromJSON(onlineData);
      this.onlineMode = true;
      return;
    }
  }
  // Fallback: localStorage như cũ
  // ...
}

// SỬA saveGame():
async saveGame() {
  if (this.onlineMode) {
    await FirebaseOnline.saveGame(this.player.toJSON());
  } else {
    // localStorage như cũ
  }
}
```

### 📌 Bước T3: Tạo `pvp-online.js` — phòng chơi + matchmaking (T làm — 3h)

**File mới**: `game/js/pvp-online.js`

```js
class PvPOnlineManager {
  constructor() { /* ... */ }

  // Tạo phòng
  async createRoom(pets) { /* ... */ }

  // Tìm phòng đang chờ
  async findOpenRooms() { /* ... */ }

  // Join phòng
  async joinRoom(roomId, pets) { /* ... */ }

  // Lắng nghe trận đấu
  watchBattle(battleId, uiCallback) { /* ... */ }
}

window.pvpOnline = new PvPOnlineManager();
```

### 📌 Bước T4: Sửa `personal.html` — truyền auth xuống game (T làm — 1h)

```html
<!-- Thêm trong <style> -->
.game-container iframe {
  /* đã có */
}

<!-- THÊM script trong game/index.html để nhận auth từ parent -->
<script>
window.addEventListener('message', (e) => {
  if (e.data.type === 'firebase-auth') {
    // Nhận token từ personal.html
    FirebaseOnline.initWithToken(e.data.token);
  }
});
</script>
```

---

### 📌 Bước M1: Thêm tab "PvP Online" vào UI (M làm — 3h)

**Sửa file**: `game/js/ui.js`

```js
// THÊM methods mới:

// Hiển thị danh sách phòng
async renderOnlineRooms() {
  const rooms = await pvpOnline.findOpenRooms();
  // Render HTML: danh sách phòng + nút Create/Join
}

// Hiển thị màn hình chọn pet cho PvP online
renderOnlineTeamSelect() {
  // Chọn 3 pet từ danh sách pet của mình
  // Khác với PvP cũ: không random team đối thủ
}

// Hiển thị trận đấu online
renderOnlineBattle(battleId) {
  // Gọi pvpOnline.watchBattle() để nhận cập nhật realtime
}
```

**Thay đổi trong `render()`:**

```js
// THÊM vào navigation tabs:
const tabs = ['pets', 'world', 'shop', 'battle', 'pvp-online', 'breed', 'rank'];

// THÊM case 'pvp-online':
case 'pvp-online':
  this.renderOnlineRooms();
  break;
```

### 📌 Bước M2: Sửa `PVPBattle` — dùng team từ online (M làm — 1h)

**Sửa file**: `game/js/pvp.js`

```js
// THÊM method:
setTeamsFromOnline(playerTeam, enemyTeam) {
  // Gán trực tiếp team từ dữ liệu online
  // Không random, không clone
  this.playerTeam = playerTeam;
  this.enemyTeam = enemyTeam;
}

// SỬA start() để hỗ trợ online mode:
start(playerPets, enemyPets, isOnline) {
  if (isOnline) {
    // Dùng team từ online (đã có sẵn)
    // Chỉ reset trạng thái, không clone lại
  } else {
    // Logic cũ
  }
}
```

### 📌 Bước M3: Cập nhật `WorldMap` — chọn team khi vào PvP (M làm — 2h)

**Sửa file**: `game/js/world.js`

```js
// THÊM trong class WorldMap:
selectPvPTeam(petIds) {
  // Lưu 3 pet được chọn
  // Đảm bảo pet còn sống
}
```

---

## 🔷 LỘ TRÌNH THỰC HIỆN

```
Tuần 1:
  T: T1 (firebase-online.js) ──────┐
                                   ├──> ⛓️ T4 (personal.html)
  M: M1 (ui.js pvp-online tab) ────┘

Tuần 2:
  T: T2 (app.js save online) ──────┐
                                   ├──> ⛓️ T3 (pvp-online.js phòng)
  M: M2 (pvp.js online teams) ─────┘

Tuần 3:
  T: Xử lý edge cases (mất kết nối, timeout, reconnect)
  M: M3 (world.js team select) + test tổng thể
```

---

## 🔷 QUY TẮC LÀM VIỆC

### Commit message
- `T: <nội dung>` — cho T
- `M: <nội dung>` — cho M

### Branch
- Mỗi người branch riêng: `multiplayer-T` / `multiplayer-M`
- Merge vào `multiplayer` khi 2 bên gặp nhau

### Test
- Cả 2 mở 2 tab trình duyệt, login 2 tài khoản khác nhau
- Phòng Tạo/Join: tab1 tạo phòng, tab2 join
- Trận đấu: cả 2 thấy log + trạng thái giống nhau

---

## 🔷 DATA CONTRACT (QUAN TRỌNG)

Cả T và M phải dùng CHUNG các key Firebase này:

### Firebase path: `online_users/{uid}/`
```js
{
  name: "Người chơi",
  gold: 1000,
  diamond: 10,
  pvpWins: 5,
  pvpRating: 1200,
  pets: [ /* Pet[] */ ],
  equipment: { weapons: [], armors: [] },
  lastSave: 1720000000000
}
```

### Firebase path: `pvp_rooms/{roomId}/`
```js
{
  id: "room_abc123",
  host: { uid: "u1", name: "A", emoji: "🐉", petIds: ["pet1","pet2","pet3"] },
  guest: null | { uid: "u2", name: "B", emoji: "🦊", petIds: ["pet4","pet5","pet6"] },
  status: "waiting" | "ready" | "fighting" | "ended",
  battleId: null | "battle_xyz",
  created: 1720000000000
}
```

### Firebase path: `pvp_battles/{battleId}/`
```js
{
  roomId: "room_abc123",
  turn: 0,
  team1: [ /* PetState[] */ ],
  team2: [ /* PetState[] */ ],
  winner: 0,
  log: ["⚔️ Trận đấu bắt đầu!"],
  lastTick: 1720000000000
}

// PetState (dùng trong battle):
{
  id: "pet1",
  name: "Rồng Lửa",
  emoji: "🐉",
  hp: 350,
  maxHp: 350,
  atk: 45,
  def: 30,
  spd: 12,
  gridCol: 2,
  gridRow: 5,
  dead: false,
  element: "fire",
  battleEnergy: 0,
  maxBattleEnergy: 100
}
```

---

## 🔷 CÁCH TƯƠNG TÁC GIỮA 2 NGƯỜI

### 1. Firebase là cầu nối
- M không cần đợi T xong code — dùng **đúng key Firebase** là chạy được
- M có thể fake data bằng cách ghi trực tiếp vào Firebase Console

### 2. Chat sẵn có
- Cả 2 dùng chat trong `personal.html` để trao đổi khi test
- Hoặc comment trực tiếp vào file với prefix `[T]` / `[M]`

### 3. File interface chung
- File `firebase-online.js` do T viết — M chỉ cần gọi `FirebaseOnline.*`
- File `pvp-online.js` do T viết — M chỉ cần gọi `pvpOnline.*`
- M không cần hiểu code Firebase bên trong

### 4. Test song song
- Mở 2 tab trình duyệt (Edge + Chrome) login 2 tài khoản Firebase khác nhau
- Tab 1 (T): tạo phòng → Tab 2 (M): thấy phòng → join → đánh
