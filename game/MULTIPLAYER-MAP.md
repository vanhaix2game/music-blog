# Kế Hoạch Online Map — Pet Game Cùng Nhau Trên Map

> Có 2 người làm song song: **T** (tôi) và **M** (Mimo)
> Đây là bước mở rộng sau khi đã có PvP Online qua phòng

---

## 🔷 KIẾN TRÚC TỔNG QUAN

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Firebase RTDB                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ world_maps / {mapId} / {                                     │   │
│  │   players: { uid: { x, y, emoji, name, hp, state }, ... },   │   │
│  │   monsters: { mid: { x, y, hp, maxHp, element, ... } },     │   │
│  │   resources: { rid: { x, y, type, amount } },               │   │
│  │   host: uid,                                                  │   │
│  │   created: timestamp                                          │   │
│  │ }                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
          ▲                       ▲                    ▲
          │ write pos             │ read others       │ read monsters
          │ (mỗi 200ms)           │ (on value)        │ (on value)
          │                       │                    │
   ┌──────┴──────┐        ┌──────┴──────┐     ┌──────┴──────┐
   │  Player A   │        │  Player B   │     │  Player C   │
   │  (Edge)     │        │  (Chrome)   │     │  (Firefox)  │
   └─────────────┘        └─────────────┘     └─────────────┘
```

### Luồng dữ liệu

```
1. Mỗi player di chuyển → ghi vị trí lên Firebase
2. Các player khác đọc position changes → cập nhật entity trên canvas
3. Monster/resource state do host quản lý, sync lên Firebase
4. Ai cũng đọc được monster state → thấy cùng 1 con quái
5. Khi 1 người đánh quái → cập nhật HP quái trên Firebase → mọi người thấy
```

---

## 🔷 DATA CONTRACT

### Firebase path: `world_maps/{mapId}/`

```js
{
  host: "uid_cua_host",
  created: 1720000000000,
  status: "waiting" | "playing" | "ended",

  players: {
    "uid_a": {
      name: "Người A",
      emoji: "🐉",
      x: 5, y: 3,          // ô hiện tại trên grid
      hp: 350,
      maxHp: 350,
      alive: true,
      lastMove: 1720000001000
    },
    "uid_b": { ... }
  },

  monsters: {
    "mon_1": {
      id: "mon_1",
      name: "Slime",
      emoji: "🟢",
      x: 12, y: 7,
      hp: 80, maxHp: 80,
      atk: 12, def: 5,
      element: "wood",
      level: 3,
      alive: true,
      lastAction: 1720000002000
    }
  },

  resources: {
    "res_1": {
      x: 8, y: 4,
      type: "gold",
      amount: 50,
      collected: false
    }
  }
}
```

---

## 🔷 PHÂN CHIA CÔNG VIỆC

### 📌 Bước M1: Thêm "Online Map" tab + nút Join/Create (M — 2h)

**Sửa file**: `game/js/ui.js`

```js
// THÊM tab button trong render()
<button class="tab-btn" data-tab="worldOnline">🌍 Map Online</button>

// THÊM tab content div
<div id="tab-worldOnline" class="tab-content"></div>

// THÊM method:
renderWorldOnline() {
  // Render: nút "Tạo phòng Map" + "Danh sách phòng map"
  // Danh sách phòng map (từ pvpOnline-like manager)
}

async loadWorldRooms() {
  // Load danh sách phòng world map từ Firebase
  // Room có status='waiting' + type='world'
}
```

### 📌 Bước T1: Tạo `world-online.js` — quản lý phòng world map (T — 3h)

**File mới**: `game/js/world-online.js`

```js
class WorldOnlineManager {
  constructor() {
    this.mapId = null;
    this.isHost = false;
    this._posTimer = null;     // interval ghi vị trí
    this._playersRef = null;   // Firebase ref players
    this._monstersRef = null;  // Firebase ref monsters
    this.remotePlayers = {};   // player khác (uid -> {x, y, emoji, ...})
    this.onPlayersUpdate = null;
    this.onMonstersUpdate = null;
  }

  async createWorld(email) { /* tạo phòng world, set host */ }
  async joinWorld(mapId) { /* join phòng world */ }
  leaveWorld() { /* dọn dẹp Firebase */ }

  startSyncPosition(worldMap) {
    // Mỗi 200ms ghi vị trí player lên Firebase
    setInterval(() => {
      const pos = worldMap.getPlayerPosition();
      this._playersRef.child(this.uid).update({
        x: pos.x, y: pos.y,
        lastMove: Date.now()
      });
    }, 200);
  }

  watchPlayers() {
    // Lắng nghe tất cả player khác
    this._playersRef.on('value', (snap) => {
      const data = snap.val();
      // Lọc bỏ mình, cập nhật remotePlayers
      if (this.onPlayersUpdate) this.onPlayersUpdate(remotePlayers);
    });
  }

  syncMonsterState(monsterData) {
    // Host update monster state
    this._monstersRef.update(monsterData);
  }

  watchMonsters() {
    // Tất cả cùng đọc monster state
    this._monstersRef.on('value', (snap) => {
      if (this.onMonstersUpdate) this.onMonstersUpdate(snap.val());
    });
  }
}

window.worldOnline = new WorldOnlineManager();
```

### 📌 Bước M2: Sửa `mapview.js` — render player khác trên canvas (M — 3h)

**Sửa file**: `game/js/mapview.js`

```js
// THÊM method:
syncRemotePlayers(remotePlayers) {
  // Vẽ player khác trên canvas với màu + emoji riêng
  // Highlight tên player khác
  // Mỗi remote player là 1 entity trên map
}

// SỬA render():
// THÊM bước vẽ remotePlayers sau khi vẽ local player
```

### 📌 Bước T2 + M3 ⛓️: Sửa `world.js` — tích hợp online sync (T + M — 4h)

**Sửa file**: `game/js/world.js`

```js
// T sửa: THÊM online sync methods
class WorldMap {
  // THÊM:
  setOnlineMode(manager) {
    this.onlineManager = manager;
    this.isOnline = true;

    // Khi vào online, spawn monsters từ Firebase thay vì tự random
    // Khi di chuyển, sync vị trí
    // Khi đánh quái, sync HP
  }

  getPlayerPosition() {
    return { x: this.player.x, y: this.player.y };
  }

  // THAY ĐỔI movePlayer():
  // Sau khi di chuyển local, gọi worldOnline.startSyncPosition()
  // Để Firebase cập nhật vị trí mới
}

// M sửa: THÊM xử lý khi remote player vào cùng ô
// Nếu 2 player đứng gần nhau → có thể hỗ trợ đánh quái chung
```

### 📌 Bước T3: Sync monster — host quản lý, ai cũng thấy (T — 2h)

```js
// Trong WorldMap.update():
// Nếu là host → spawn monster → sync lên Firebase
// Nếu không phải host → đọc monster từ Firebase thay vì tự spawn

// Khi 1 player đánh quái:
// - Ghi damage lên Firebase
// - Mọi player thấy HP quái giảm
// - Quái chết → host xác nhận → xoá khỏi Firebase

// Để tránh spam damage:
// - 1 con quái chỉ nhận damage mỗi 500ms từ mỗi player
// - Host là người duy nhất có quyền xoá quái
```

---

## 🔷 LỘ TRÌNH

```
Tuần 1:
  T: T1 (world-online.js) ───────────────┐
                                         ├──> ⛓️ T2 + M3 (world.js online sync)
  M: M1 (ui.js worldOnline tab) ─────────┘
  M: M2 (mapview.js render remote) ──────┘

Tuần 2:
  T: T3 (monster sync + damage) ─────────┐
                                         ├──> Test tổng thể 2 tab
  M: Fix bugs + UI (health bar remote) ──┘
```

---

## 🔷 QUY TẮC

- Mỗi người branch riêng: `online-map-T` / `online-map-M`
- Commit message: `T: <nội dung>` / `M: <nội dung>`
- Test: mở 2 tab trình duyệt, login 2 tài khoản khác nhau
- Tab 1 tạo phòng map → Tab 2 join → thấy nhau di chuyển

---

## 🔷 RỦI RO

1. **Latency**: Nếu ping cao, player nhảy lag. Giải pháp: dùng interpolation (mỗi frame di chuyển 1 phần về phía target position)
2. **Conflict damage**: 2 người đánh cùng 1 quái → damage có thể bị mất. Giải pháp: queue damage, host xử lý tuần tự
3. **Desync**: Nếu mất kết nối, player biến mất. Giải pháp: `onDisconnect().remove()`
