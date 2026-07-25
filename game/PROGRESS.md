# Pet PB1 - Tiến trình nâng cấp

> Lưu ngày: 2026-07-08
> Game path: `G:\Other computers\My Laptop\Projects\DA\Game\Pet 3\Pet - PB1`

---

## Tổng quan thay đổi

### 1. Skill pet — chọn skill thông minh hơn
**File:** `js/world.js`
- **`selectPetSkill()`**: Weighted random scoring thay vì random thuần:
  - +15 lợi thế nguyên tố
  - +15 + dmgMul×10 ưu tiên skill tấn công
  - +20 nếu control effect + boss
  - +25 shield cho tank, +15 heal + injured×5 cho support
  - +8 × số monster nếu AOE
  - -20 penalty nếu dùng trùng skill gần đây
  - +1~5 proficiency bonus
- **`_skillCycleIdx`**: Duy trì vòng tuần tự, skill được chọn từ top-3 có điểm cao nhất

### 2. Boss nhỏ (non-boss) — tuần tự skill mỗi 2 giây
**File:** `js/world.js`
- Boss dùng skill **xoay vòng tuần tự**, mỗi skill cách nhau ~2 giây
- **Không cần năng lượng, không cooldown** — skill luôn sẵn sàng
- `mon._bossSkillCycleIdx` và `mon._bossSkillTimer` quản lý vòng lặp
- `monsterUseSkill` bỏ qua energy/cd khi `forceUse=true`

### 3. Quái nhỏ — tấn công liên tục
**File:** `js/world.js`
- Quái thường đánh **1 lần/tick** (~800ms ≈ 1 giây)
- **Luôn tấn công khi trong tầm** (bỏ 40% cơ hội lùi của ranged)
- **Di chuyển nhanh**: 2 cột/tick thay vì 1 (dùng `moveMonsterTowardTarget` phase=3)
- **6.5% knockback** khi đánh pet (effect `knockback`, pet mất 1 lượt)

### 4. Quái không đứng chung ô
**File:** `js/world.js`
- **`findVacantMonsterCell()`**: Tìm ô trống khi spawn, thử 20 lần
- **`isMonsterCellOccupied()`**: Kiểm tra ô có quái khác không
- **`moveMonsterTowardTarget()`**: Tự né ô có quái khác khi di chuyển
- Áp dụng cho cả quái thường và boss

### 5. Hiệu ứng hình ảnh — phân loại rõ theo skill
**File:** `js/mapview.js`

#### `getVisualTypeForAnim()` — ~80+ entry, phân loại:
| Element | Loại hiệu ứng |
|---------|---------------|
| Fire | `ember_wave`, `molten_lance`, `triple_true_fire`, `meteor_storm`, `fire_eruption`, `hellfire_rain`, `solar_fall`, `flame_orb` |
| Ice | `ice_rain`, `diamond_dust`, `permafrost`, `absolute_zero`, `crystal_spike` |
| Earth | `ground_stomp`, `earth_split`, `mountain_crush`, `petrify`, `chibaku_gravity`, `slam` |
| Storm | `whirlwind`, `sky_breaker`, `aurora_wave`, `hurricane`, `knockback` |
| Poison | `poison_web`, `shadow_burst`, `plague_cloud`, `blood_moon`, `voidtear` |
| Thunder | `thunder_bolt`, `flash_strike`, `dash_strike`, `chain_lightning`, `divine_bolt` |
| Wood | `vine_barrage`, `ancient_bloom`, `jungle_devour`, `natureswrath`, `overgrowth` |
| Water | `tidal_rush`, `sea_curse`, `abyssal_bubble` |
| Dragon | `dragon_palm` |

#### `drawSpecialEffect()` — ~20+ case mới:
- `ember_wave`, `molten_lance`, `triple_true_fire`, `hellfire_rain`, `solar_fall`, `flame_orb`
- `diamond_dust`, `permafrost`, `absolute_zero`
- `mountain_crush`, `petrify`, `chibaku_gravity`
- `sky_breaker`, `aurora_wave`
- `plague_cloud`, `blood_moon`, `voidtear`
- `chain_lightning`, `dash_strike`, `divine_bolt`, `flash_strike`, `fire_breath`
- `dragon_palm` (rồng bay + chưởng)

### 6. Màu sắc nguyên tố — chỉnh vibrant
**File:** `js/mapview.js` (hằng số `ELEMENT_COLORS`)
| Element | Main | Glow | Light | Dark |
|---------|------|------|-------|------|
| Wood | `#00C853` | `#69F0AE` | `#B9F6CA` | `#009624` |

### 7. Cooldown giảm
**File:** `js/roles.js`
- `Skill.getCooldownFor()`: `Math.max(1, round(cd + tier + level) - 1)` — giảm 1 turn
**File:** `js/world.js`
- `getMonsterSkillCooldown()`: `Math.max(1, cooldownTurns - 1)`

### 8. Visual monster hit theo element
**File:** `js/mapview.js`
- `queueAction()`: Nếu attacker là monster → dùng `element` thật của monster thay vì mặc định 'fire'

### 9. Tăng kích thước hiệu ứng 1.6x
**File:** `js/mapview.js`
- Regex thay thế `X + p * Y` → `X*1.6 + p * Y*1.6` trong `drawSpecialEffect`
- Bỏ qua `alpha`, `fade`, `lineWidth`, `shadowBlur`

---

## File bị ảnh hưởng

| File | Thay đổi |
|------|----------|
| `js/world.js` | selectPetSkill, boss cycle AI, normal monster AI, knockback, di chuyển, spawn không chồng ô, monsterUseSkill bỏ energy/cd |
| `js/mapview.js` | getVisualTypeForAnim, drawSpecialEffect, queueAction (element monster), applyEntityImpact (knockback giảm), getElementForAnim |
| `js/roles.js` | getCooldownFor, EFFECTS |
| `js/monsters.js` | spawnWorldBoss shuffle skill |

---

## Tiếp theo có thể làm

- Test in-game, fix bug nếu có
- Cân bằng lại sát thương / tốc độ
- Thêm hiệu ứng mới
- Tối ưu performance (giảm effect count)
