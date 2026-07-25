# Dự Án Game Pet - Nhật Ký Nâng Cấp

## Tổng Quan
Game pixel pet theo phong cách Minecraft, canvas 2D, tự động chiến đấu theo map.

## Các Thay Đổi Đã Thực Hiện

### 1. Nâng Cấp Nền Bản Đồ (mapview.js)
- **Tile nhỏ hơn**: 24×20 (từ 28×24), 22×14 ô (từ 18×12)
- **Scale decorations**: Dùng canvas scale transform tự động
- **Điều chỉnh road dots**: Theo tỉ lệ tile mới

### 2. Bot Player (world.js:937)
- Chỉ xuất hiện ở map ID ≤ 10
- Không giới hạn boss spawn (tất cả map đều có boss)

### 3. Boss Rarity (world.js:297-299)
- Normal: 100%, Leader: 30%, Chief: 10%, Super: 3%
- Exponential rarity curve thay vì linear

### 4. HP Bar (mapview.js:538-541)
- Boss: 28×4, Monster: 22×3, Pet: 16×3 (từ 16×2)

### 5. Hệ Thống Thời Tiết (mapview.js: initWeather, drawWeather)
- Weather particles: rain, snow, fog, ash, sand, light, void
- Mỗi biome có thời tiết riêng
- Particles vật lý (gió, trọng lực, sinusoidal)

### 6. Hiệu Ứng Skill Map (MapEffect - rewrite hoàn toàn)
- **Fire**: Lửa + trail + tia lửa + khói
- **Water**: Nước + vòng sóng + splash
- **Earth**: Đá + bụi + mảnh vỡ
- **Thunder**: Sét chính + nhánh + flash + tia lửa
- **Ice**: Pha lê + vết nứt băng + mảnh băng
- **Wood**: Dây leo + lá + bloom burst
- **Poison**: Mây độc + bong bóng + giọt
- **Storm** (mới): Lốc xoáy + vòng gió + vệt gió

### 7. Ultimate Effect (MapUltimateEffect)
- 3 vòng ring lan dần, gradient ground glow, 12 orbital particles
- Central burst gradient, star flash 8 cánh

### 8. Battle Animator (animator.js)
- Screen flash khi crit/death
- Shockwave ring khi va chạm
- Extra particles cho thunder/ice
- Death explosion effect hoành tráng

### 9. PixelArt (pixelart.js)
- Shadow gradient (radial thay vì solid)
- Element aura glow cho pet
- Boss crown dash line + pulse glow

## Cấu Trúc File Chính
```
index.html          # Script load order quan trọng
js/
  pixelart.js       # Engine vẽ sprite + battle scene
  animator.js       # Battle animation (projectile, particle)
  mapview.js        # World map rendering + weather + skill effects
  world.js          # Game logic + boss system
  monsters.js       # Boss templates + tiers
  ui.js             # UI rendering (kết nối mapView)
```

## Script Load Order
data.js → pet.js → battle.js → pixelart.js → animator.js → roles.js → mapview.js → monsters.js → world.js → leaderboard.js → ui.js → app.js

## Bug Fixes & Optimization Log (2026-07)

### Bug #1 — Double `onAttackAnim` in `monsterAttackPet`
**File**: `world.js:1521-1524`
**Issue**: Monster auto-attack queued 2x actions per attack animation.
**Fix**: Removed duplicate `onAttackAnim` call.

### Bug #2 — `setCommand`/`removeBot`/`callBot` gọi `renderWorld()`
**File**: `app.js` (3 locations)
**Issue**: Mỗi lần bấm nút tấn công/phòng thủ/remove bot → renderWorld() rebuild toàn bộ DOM + canvas.
**Fix**: Đổi thành `this.ui.refreshWorldUI()`.

### Bug #3 — Không try-catch trong `autoTick`
**File**: `world.js`
**Issue**: Nếu autoTick throw exception, game ngừng chạy hoàn toàn (không có scheduleUpdate tiếp theo).
**Fix**: Wrap body trong try-catch, log lỗi + gọi `scheduleUpdate()`.

### Bug #4 — `queueAction` gọi trên mapView đã stop
**File**: `mapview.js:635`
**Issue**: Khi tab world không active, `queueAction` vẫn push action vào queue, gây treo khi quay lại.
**Fix**: Thêm `if (!this.running) return;` đầu method.

### Bug #5 — Stale DOM cache trong `updateWorldStatusInPlace`
**File**: `ui.js:1580`
**Issue**: Khi DOM elements bị thay đổi (do renderWorld), `_domCache` trỏ vào element cũ → lỗi.
**Fix**: Xoá `el._domCache` đầu `renderWorld()`, wrap body trong try-catch, invalidate cache khi lỗi.

### Bug #6 — Không pause/resume exploring khi chuyển tab
**File**: `world.js` + `ui.js`
**Issue**: Chuyển tab khác → autoTick vẫn chạy, DOM events vẫn active.
**Fix**: Thêm `pauseExploring()`/`resumeExploring()`, gọi từ `showTab()`.

### Bug #7 — `loop()` không try-catch → rAF chết vĩnh viễn (ROOT CAUSE FREEZE)
**File**: `mapview.js:370`
**Issue**: Bất kỳ exception nào trong `update(dt)` hoặc `render()` → `requestAnimationFrame` không được gọi lại → map treo mãi mãi.
**Fix**: Wrap loop body trong try-catch, log lỗi, vẫn gọi rAF ở cuối.

### Bug #8 — `render()` save không restore khi exception (ROOT CAUSE BLURRY)
**File**: `mapview.js:900-1080`
**Issue**: `render()` gọi `ctx.save()` đầu method, `ctx.restore()` cuối method. Nếu exception ở giữa → restore không chạy → canvas state tích luỹ qua frame → nhoè dần.
**Fix**: Wrap rendering body trong `try { ... } finally { ctx.restore(); }`.

### Optimization — Background tile caching
**File**: `mapview.js`
**Detail**: Offscreen canvas (`_cacheCanvas`) lưu sky + toàn bộ tiles. Mỗi frame chỉ `drawImage` thay vì vẽ 512 tiles riêng lẻ. Cache đánh dấu dirty khi đổi theme hoặc build tile map.

### Optimization — Loại bỏ đồi/núi khỏi map
**File**: `mapview.js:45-156`, `mapview.js:1307-1360`
**Detail**: Xoá `'hill'` và `'mountain'` khỏi `decor[]` tất cả themes. Xoá toàn bộ code vẽ đồi/núi trong `drawTile()`. Giảm `decorChance` từ 0.18-0.24 xuống 0.15-0.18. Giảm số decor mỗi theme từ 4-5 xuống 2-3.

### Optimization — Null safety trong action queue & entity handling
**File**: `mapview.js`
**Detail**: Thêm optional chaining (`?.`) trong entity lookups (`e.pet?.id === action?.attackerId`), idle checks (`e?.hitFlash > 0`), motion checks, `applyEntityImpact`. Tránh crash khi action/entity undefined.

### Optimization — `scheduleUpdate` throttle 200ms → 300ms
**File**: `world.js:82`
**Detail**: Giảm tần suất DOM update.

### IMPORTANT — Inline warnings in code (2026-07)
Đã thêm ⚠️ CRITICAL warnings trong source code tại các vị trí dễ gây lỗi:
- `mapview.js`: loop() try-catch, render() try-finally, queueAction() running check
- `world.js`: autoInterval try-catch
- `ui.js`: showTab() pause/resume, updateWorldStatusInPlace() try-catch, renderWorld() DOM cache
- `app.js`: setCommand/callBot/removeBot → refreshWorldUI() thay vì renderWorld()

**Rule**: Khi update code, TUYỆT ĐỐI không xoá các ⚠️ warnings. Nếu sửa các vùng code này, phải đảm bảo logic warning vẫn đúng.

## Ý Tưởng Nâng Cấp Tiếp Theo
- [ ] Skill icons trong battle UI
- [ ] Sound effects
- [ ] Animation transitions mượt hơn (easing)
- [ ] More weather particle types (tornado, lightning strike)
- [ ] Boss intro animation
- [ ] Day/night cycle
- [ ] mapview.js HP bar animation (smooth decrease)
