class PixelArt {
  static COLORS = {
    animal: { body: '#FFB5B5', dark: '#E89292', light: '#FFD5D5', eye: '#333', nose: '#FF6B6B' },
    mystical: { body: '#C9A0FF', dark: '#A870E8', light: '#E0C8FF', eye: '#4A0080', nose: '#D4A0FF' },
    robot: { body: '#8AB8FF', dark: '#6090D0', light: '#B0D0FF', eye: '#00FF88', nose: '#4080D0' },
    storm: { body: '#4DD0E1', dark: '#26A8B8', light: '#80DEEA', eye: '#FFFFFF', nose: '#0097A7' },
    boss: { body: '#FF4444', dark: '#CC2222', light: '#FF7777', eye: '#FFD700', nose: '#FF2222' },
    sky: ['#1A1A3E', '#2A2A5E', '#3A3A7E', '#4A4A9E', '#5A5ABE'],
    building: ['#2A2A4A', '#3A3A5A', '#4A4A6A', '#1A1A3A'],
    street: '#2A2A2A'
  };

  static SPRITE_SIZE = 32;
  static SCENE_WIDTH = 400;
  static SCENE_HEIGHT = 260;

  static createCanvas(container) {
    const canvas = document.createElement('canvas');
    canvas.width = this.SCENE_WIDTH;
    canvas.height = this.SCENE_HEIGHT;
    canvas.style.width = '100%';
    canvas.style.maxWidth = '400px';
    canvas.style.height = 'auto';
    canvas.style.imageRendering = 'pixelated';
    canvas.style.borderRadius = '12px';
    canvas.style.border = '2px solid rgba(255,255,255,0.1)';
    container.prepend(canvas);
    return canvas;
  }

  static drawBackground(ctx) {
    const W = this.SCENE_WIDTH, H = this.SCENE_HEIGHT;
    const t = Date.now() * 0.001;

    // Sky gradient (pixel bands)
    const skyColors = ['#0a0a2e', '#151545', '#1a1a5e', '#2a2a7e', '#3a3a9e', '#4a4abe'];
    const bandH = Math.floor(H * 0.5 / skyColors.length);
    for (let i = 0; i < skyColors.length; i++) {
      ctx.fillStyle = skyColors[i];
      ctx.fillRect(0, i * bandH, W, bandH + 2);
    }

    // Stars with twinkling
    for (let i = 0; i < 50; i++) {
      const sx = (i * 137.5 + 50) % W;
      const sy = (i * 97.3 + 20) % Math.floor(H * 0.4);
      const twinkle = 0.4 + Math.sin(t * 2 + i * 3.7) * 0.6;
      const size = 1 + (i % 4);
      ctx.globalAlpha = twinkle * 0.8;
      ctx.fillStyle = size >= 3 ? '#CCDDFF' : '#FFFFFF';
      ctx.fillRect(sx, sy, size, size);
      // Cross star for larger stars
      if (size >= 3) {
        ctx.fillRect(sx - 1, sy, 3, 1);
        ctx.fillRect(sx, sy - 1, 1, 3);
      }
    }
    ctx.globalAlpha = 1;

    // Horizon glow
    const horizonGlow = ctx.createLinearGradient(0, 0, 0, Math.floor(H * 0.6));
    horizonGlow.addColorStop(0, 'rgba(255, 232, 132, 0.18)');
    horizonGlow.addColorStop(0.5, 'rgba(138, 92, 232, 0.06)');
    horizonGlow.addColorStop(1, 'rgba(255, 232, 132, 0)');
    ctx.fillStyle = horizonGlow;
    ctx.fillRect(0, 0, W, Math.floor(H * 0.6));

    // Nebula glow
    const nebX = Math.sin(t * 0.3) * 60 + W * 0.3;
    const nebGrad = ctx.createRadialGradient(nebX, 30, 5, nebX, 30, 100);
    nebGrad.addColorStop(0, 'rgba(120, 60, 200, 0.1)');
    nebGrad.addColorStop(1, 'rgba(120, 60, 200, 0)');
    ctx.fillStyle = nebGrad;
    ctx.beginPath();
    ctx.arc(nebX, 30, 100, 0, Math.PI * 2);
    ctx.fill();

    // Moon with glow
    const moonGlow = ctx.createRadialGradient(W - 60, 40, 10, W - 60, 40, 45);
    moonGlow.addColorStop(0, 'rgba(255, 228, 132, 0.3)');
    moonGlow.addColorStop(1, 'rgba(255, 228, 132, 0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(W - 60, 40, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFE484';
    ctx.beginPath();
    ctx.arc(W - 60, 40, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0a0a2e';
    ctx.beginPath();
    ctx.arc(W - 50, 34, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,200,0.08)';
    ctx.beginPath();
    ctx.arc(W - 58, 36, 15, 0, Math.PI * 2);
    ctx.fill();

    // City silhouette — more buildings with varied heights
    const groundY = Math.floor(H * 0.65);
    const bData = [
      { x: 5, w: 30, h: 55 }, { x: 38, w: 22, h: 38 },
      { x: 62, w: 35, h: 72 }, { x: 100, w: 18, h: 42 },
      { x: 120, w: 40, h: 88 }, { x: 163, w: 25, h: 50 },
      { x: 190, w: 30, h: 65 }, { x: 223, w: 20, h: 35 },
      { x: 245, w: 35, h: 78 }, { x: 283, w: 28, h: 55 },
      { x: 313, w: 22, h: 42 }, { x: 337, w: 38, h: 70 },
      { x: 378, w: 20, h: 48 }
    ];
    for (const b of bData) {
      const by = groundY - b.h;
      const shade = ['#1a1a3a', '#22224a', '#2a2a5a', '#1e1e44'][b.x % 4];
      ctx.fillStyle = shade;
      ctx.fillRect(b.x, by, b.w, b.h);
      // Roof detail
      ctx.fillStyle = '#151535';
      ctx.fillRect(b.x, by, b.w, 2);
      // Windows
      for (let wy = by + 6; wy < groundY - 6; wy += 14) {
        for (let wx = b.x + 5; wx < b.x + b.w - 5; wx += 10) {
          const lit = ((wx * 7 + wy * 13) % 7) > 3;
          ctx.fillStyle = lit ? 'rgba(255,228,132,0.6)' : '#0a0a1a';
          ctx.fillRect(wx, wy, 4, 6);
          if (lit) {
            ctx.fillStyle = 'rgba(255,228,132,0.08)';
            ctx.fillRect(wx - 1, wy - 1, 6, 8);
          }
        }
      }
      // Antenna on tall buildings
      if (b.h > 70) {
        ctx.fillStyle = '#1a1a2a';
        ctx.fillRect(b.x + b.w / 2 - 1, by - 8, 2, 8);
        ctx.fillRect(b.x + b.w / 2 - 3, by - 10, 6, 2);
      }
    }

    // Ground / Street with texture
    ctx.fillStyle = '#222238';
    ctx.fillRect(0, groundY, W, H - groundY);
    // Ground texture dots
    ctx.fillStyle = '#2a2a42';
    for (let gx = 0; gx < W; gx += 12) {
      for (let gy = groundY + 4; gy < H; gy += 10) {
        if (((gx * 13 + gy * 7) % 5) === 0) {
          ctx.fillRect(gx, gy, 2, 1);
        }
      }
    }

    // Road lines with glow
    const roadY = groundY + Math.floor((H - groundY) / 2);
    for (let rx = 0; rx < W; rx += 28) {
      ctx.fillStyle = 'rgba(255,228,132,0.2)';
      ctx.fillRect(rx + 5, roadY, 14, 3);
    }

    // Sidewalk
    ctx.fillStyle = '#2a2a4a';
    ctx.fillRect(0, groundY, W, 4);
    ctx.fillStyle = '#33335a';
    for (let sx = 0; sx < W; sx += 8) {
      if (((sx * 3) % 12) === 0) ctx.fillRect(sx, groundY + 1, 2, 2);
    }
  }

  static drawCharacter(ctx, pet, x, y, scale = 1, isBoss = false, walkPhase = 0, flipX = false) {
    if (flipX) { ctx.save(); ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); }

    const s = this.SPRITE_SIZE * scale;
    const cx = x - s / 2;
    const cy = y - s;

    const wp = walkPhase || 0;

    // Shadow — gradient for more depth (plus walk shadow stretch)
    const shadowW = s * 0.4 + Math.abs(Math.sin(wp * 1.5)) * s * 0.06;
    const shadowGrad = ctx.createRadialGradient(x, y + 3, 0, x, y + 3, shadowW);
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0.35)');
    shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(x, y + 3, shadowW, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    const isMonster = pet.isMonster || false;
    const baseId = pet.baseId || '';
    const element = pet.element || '';

    // Enhancement level glow
    if (pet.weapon && pet.weapon.enhanceLevel >= 50) {
      this.drawEnhancementGlow(ctx, x, cy + s * 0.45, s, pet.weapon.enhanceLevel);
    }

    // Element aura glow
    const auraColor = this.BOSS_PALETTES[element] || (isMonster ? this.BOSS_PALETTES.default : null);
    if (auraColor) {
      ctx.save();
      const grad = ctx.createRadialGradient(x, cy + s * 0.45, 0, x, cy + s * 0.45, s * 0.6);
      grad.addColorStop(0, auraColor.light + '18');
      grad.addColorStop(0.5, auraColor.body + '0C');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, cy + s * 0.45, s * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Boss crown aura
    if (isBoss || pet.isBoss) {
      ctx.save();
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(x, cy + s * 0.5, s * 0.55, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(cx + s * 0.25, cy - s * 0.15, s * 0.5, s * 0.1);
      ctx.fillRect(cx + s * 0.2, cy - s * 0.05, s * 0.15, s * 0.15);
      ctx.fillRect(cx + s * 0.4, cy - s * 0.08, s * 0.15, s * 0.15);
      ctx.fillRect(cx + s * 0.6, cy - s * 0.05, s * 0.15, s * 0.15);
      ctx.restore();
    }

    // Monster glow
    if (isMonster) {
      ctx.save();
      ctx.fillStyle = pet.isMutant ? 'rgba(255, 0, 0, 0.1)' : 'rgba(100, 200, 255, 0.06)';
      ctx.beginPath();
      ctx.arc(x, cy + s * 0.45, s * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Dispatch to boss sprite if boss, or regular pet sprite
    if (isBoss || pet.isBoss) {
      this.drawBossSprite(ctx, pet, cx, cy, s);
    } else {
      const dispatch = this.spriteDispatch[baseId] || this.spriteDispatch['tho'];
      if (dispatch) {
        dispatch.call(this, ctx, cx, cy, s, pet, wp);
      } else {
        this.drawSpriteTho(ctx, cx, cy, s, pet, wp);
      }
    }

    // Walk animation: animated leg overlay + foot dust
    if (wp !== 0 && !(isBoss || pet.isBoss)) {
      this.drawWalkLegs(ctx, cx, cy, s, pet, wp);
    }

    // Boss glow overlay (pulsing)
    if (isBoss || pet.isBoss) {
      ctx.save();
      const pulse = 0.08 + Math.sin(Date.now() * 0.003) * 0.04;
      ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
      ctx.beginPath();
      ctx.arc(x, cy + s * 0.45, s * 0.65, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (flipX) ctx.restore();
  }

  static drawWalkLegs(ctx, cx, cy, s, pet, walkPhase) {
    const p = s / 32;
    const legMove = Math.sin(walkPhase) * 2.5 * p;
    const legMove2 = Math.sin(walkPhase + Math.PI) * 2.5 * p;
    const type = (pet.type || pet.element || 'animal').toLowerCase();
    const isMonster = pet.isMonster || false;

    // Foot dust particles
    const dustPhase = Math.sin(walkPhase * 2);
    if (Math.abs(dustPhase) > 0.85) {
      const dx = (Math.sin(walkPhase * 3) * 4 + 8) * p;
      ctx.fillStyle = 'rgba(200,180,160,0.12)';
      ctx.beginPath();
      ctx.arc(cx + dx, cy + 30 * p + 2 * p, 2.5 * p, 0, Math.PI * 2);
      ctx.fill();
    }

    // Choose leg style based on pet type
    const isAnimal = ['animal', 'mystical', 'ice', 'wood'].includes(type);
    const isRobot = type === 'robot';
    const isStorm = type === 'storm';

    ctx.save();
    if (isAnimal || isStorm) {
      // Simple biped walk legs
      const legColor = isMonster ? '#666' : '#8B4513';
      const footColor = isMonster ? '#444' : '#5C2E00';
      // Left leg
      ctx.fillStyle = legColor;
      ctx.fillRect(cx + 8 * p, cy + 24 * p + legMove, 4 * p, 6 * p);
      ctx.fillStyle = footColor;
      ctx.fillRect(cx + 7 * p, cy + 29 * p + legMove, 6 * p, 2 * p);
      // Right leg
      ctx.fillStyle = legColor;
      ctx.fillRect(cx + 19 * p, cy + 24 * p + legMove2, 4 * p, 6 * p);
      ctx.fillStyle = footColor;
      ctx.fillRect(cx + 18 * p, cy + 29 * p + legMove2, 6 * p, 2 * p);
    } else if (isRobot) {
      // Mechanical legs
      ctx.fillStyle = '#546E7A';
      ctx.fillRect(cx + 9 * p, cy + 24 * p + legMove, 3 * p, 6 * p);
      ctx.fillRect(cx + 20 * p, cy + 24 * p + legMove2, 3 * p, 6 * p);
      ctx.fillStyle = '#37474F';
      ctx.fillRect(cx + 8 * p, cy + 29 * p + legMove, 5 * p, 2 * p);
      ctx.fillRect(cx + 19 * p, cy + 29 * p + legMove2, 5 * p, 2 * p);
      // Metal joint glow
      ctx.fillStyle = 'rgba(0,229,255,0.15)';
      ctx.fillRect(cx + 10 * p, cy + 25 * p + legMove, 1 * p, 2 * p);
      ctx.fillRect(cx + 21 * p, cy + 25 * p + legMove2, 1 * p, 2 * p);
    } else {
      // Generic legs
      ctx.fillStyle = '#666';
      ctx.fillRect(cx + 9 * p, cy + 24 * p + legMove, 3 * p, 6 * p);
      ctx.fillRect(cx + 19 * p, cy + 24 * p + legMove2, 3 * p, 6 * p);
    }
    ctx.restore();
  }

  static drawWeapon(ctx, pet, x, y, scale = 1) {
    if (!pet || !pet.weapon) return;
    const p = (this.SPRITE_SIZE * scale) / 32;
    const weaponId = pet.weapon.id || '';
    const weaponName = (pet.weapon.name || '').toLowerCase();
    ctx.save();

    // Determine weapon type by ID or name
    const isDagger = weaponId === 'dagger' || weaponId === 'poison_dagger' || weaponName.includes('dao');
    const isSword = weaponId === 'sword' || weaponId === 'fire_sword' || weaponId === 'ice_blade' || weaponId === 'void_blade' || weaponId === 'dragon_sword' || weaponId === 'heavenly_blade' || weaponName.includes('kiếm');
    const isAxe = weaponId === 'axe' || weaponId === 'thunder_axe' || weaponName.includes('rìu');
    const isSpear = weaponId === 'spear' || weaponId === 'frost_spear' || weaponName.includes('thương');
    const isBow = weaponId === 'bow' || weaponId === 'nature_bow' || weaponName.includes('cung');
    const isStaff = weaponId === 'staff' || weaponId === 'crystal_staff' || weaponName.includes('trượng');
    const isHammer = weaponId === 'hammer' || weaponId === 'star_hammer' || weaponName.includes('búa');
    const isGun = weaponId === 'laser_gun' || weaponName.includes('súng');
    const isCannon = weaponId === 'cannon' || weaponName.includes('đại bác');

    if (isDagger) {
      ctx.fillStyle = '#C0C0C0';
      ctx.fillRect(x + 14 * p, y - 8 * p, 3 * p, 10 * p);
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x + 13 * p, y + 2 * p, 5 * p, 3 * p);
      ctx.fillStyle = '#FFF';
      ctx.fillRect(x + 14 * p, y - 8 * p, 1 * p, 2 * p);
    } else if (isSword) {
      ctx.fillStyle = '#E0E0E0';
      ctx.fillRect(x + 14 * p, y - 12 * p, 3 * p, 14 * p);
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(x + 12 * p, y + 2 * p, 7 * p, 2 * p);
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x + 13 * p, y + 4 * p, 5 * p, 3 * p);
      ctx.fillStyle = '#FFF';
      ctx.fillRect(x + 14 * p, y - 12 * p, 1 * p, 3 * p);
    } else if (isAxe || isHammer) {
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x + 15 * p, y - 4 * p, 2 * p, 12 * p);
      ctx.fillStyle = '#A0A0A0';
      ctx.beginPath();
      ctx.moveTo(x + 10 * p, y - 4 * p);
      ctx.lineTo(x + 17 * p, y - 2 * p);
      ctx.lineTo(x + 10 * p, y + 2 * p);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#FFF';
      ctx.fillRect(x + 11 * p, y - 3 * p, 1 * p, 2 * p);
    } else if (isSpear) {
      ctx.fillStyle = '#C0C0C0';
      ctx.fillRect(x + 15 * p, y - 10 * p, 2 * p, 14 * p);
      ctx.fillStyle = '#A0A0A0';
      ctx.beginPath();
      ctx.moveTo(x + 14 * p, y - 10 * p);
      ctx.lineTo(x + 16 * p, y - 14 * p);
      ctx.lineTo(x + 18 * p, y - 10 * p);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x + 14 * p, y + 4 * p, 4 * p, 3 * p);
    } else if (isBow) {
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x + 13 * p, y - 6 * p, 2 * p, 14 * p);
      ctx.fillStyle = '#D4B96A';
      ctx.beginPath();
      ctx.moveTo(x + 14 * p, y - 6 * p);
      ctx.quadraticCurveTo(x + 20 * p, y, x + 14 * p, y + 8 * p);
      ctx.lineWidth = 1.5 * p;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 14 * p, y - 6 * p);
      ctx.lineTo(x + 10 * p, y + 1 * p);
      ctx.stroke();
    } else if (isStaff) {
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x + 14 * p, y - 10 * p, 2 * p, 16 * p);
      ctx.fillStyle = '#9B59B6';
      ctx.beginPath();
      ctx.arc(x + 15 * p, y - 10 * p, 4 * p, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(x + 15 * p, y - 10 * p, 2 * p, 0, Math.PI * 2);
      ctx.fill();
    } else if (isGun) {
      ctx.fillStyle = '#404040';
      ctx.fillRect(x + 12 * p, y - 4 * p, 8 * p, 4 * p);
      ctx.fillStyle = '#00FF88';
      ctx.fillRect(x + 18 * p, y - 3 * p, 3 * p, 2 * p);
      ctx.fillStyle = '#333';
      ctx.fillRect(x + 14 * p, y, 4 * p, 4 * p);
    } else if (isCannon) {
      ctx.fillStyle = '#333';
      ctx.fillRect(x + 10 * p, y - 6 * p, 10 * p, 5 * p);
      ctx.fillStyle = '#FF4400';
      ctx.fillRect(x + 18 * p, y - 5 * p, 3 * p, 3 * p);
      ctx.fillStyle = '#555';
      ctx.fillRect(x + 12 * p, y - 1 * p, 6 * p, 4 * p);
    }

    ctx.restore();
  }

  static drawEnhancementGlow(ctx, cx, cy, s, enhanceLevel) {
    const colors = [];
    if (enhanceLevel >= 50) colors.push('rgba(255,215,0,0.25)');
    if (enhanceLevel >= 60) colors.push('rgba(65,105,225,0.20)');
    if (enhanceLevel >= 70) colors.push('rgba(255,69,0,0.20)');
    if (enhanceLevel >= 80) colors.push('rgba(50,205,50,0.20)');
    if (enhanceLevel >= 90) colors.push('rgba(147,112,219,0.20)');
    if (enhanceLevel >= 100) colors.push('rgba(255,20,147,0.20)', 'rgba(0,255,255,0.20)');

    const radius = s * 0.55;
    ctx.save();
    for (let i = 0; i < colors.length; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius + i * 2, 0, Math.PI * 2);
      ctx.fillStyle = colors[i];
      ctx.fill();
    }
    ctx.restore();
  }

  static get spriteDispatch() {
    return {
      tho: this.drawSpriteTho,
      meo: this.drawSpriteMeo,
      cho: this.drawSpriteCho,
      gautruc: this.drawSpriteGautruc,
      cuu: this.drawSpriteCuu,
      rong: this.drawSpriteRong,
      kylan: this.drawSpriteKylan,
      phuonghoang: this.drawSpritePhuonghoang,
      kynhong: this.drawSpriteKynhong,
      macarong: this.drawSpriteMacarong,
      robotchienthan: this.drawSpriteRobotChienthan,
      robothiemhiem: this.drawSpriteRobotThiemhiem,
      robotvutru: this.drawSpriteRobotVutru,
      ninjarobot: this.drawSpriteNinjaRobot,
      robotkhonglo: this.drawSpriteRobotKhonglo,
      bangtinh: this.drawSpriteBangtinh,
      tuyetnhan: this.drawSpriteTuyetnhan,
      haicau: this.drawSpriteHaicau,
      kylanbang: this.drawSpriteKylanbang,
      rongbang: this.drawSpriteRongbang,
      caynon: this.drawSpriteCaynon,
      hoathit: this.drawSpriteHoathit,
      tinhlam: this.drawSpriteTinhlam,
      nguoicay: this.drawSpriteNguoicay,
      rongcay: this.drawSpriteRongcay,
      baobien: this.drawSpriteBaobien,
      locsay: this.drawSpriteLocsay,
      gioloc: this.drawSpriteGioloc,
      maybao: this.drawSpriteMaybao,
      sieubao: this.drawSpriteSieubao
    };
  }

  static p(ctx, x, y, s) { return { x: x + s / 32 * this.SPRITE_SIZE, y: y + s / 32 * this.SPRITE_SIZE }; }

  // 1. THỎ - Round body, long ears, tiny tail
  static drawSpriteTho(ctx, x, y, s, pet, wp) {
    const p = s / 32; const c = ['#FFB5B5', '#E89292', '#FFD5D5'];
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 19 * p, 9 * p, 10 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c[1]; ctx.fillRect(x + 8 * p, y + 2 * p, 5 * p, 11 * p); ctx.fillRect(x + 19 * p, y + 2 * p, 5 * p, 11 * p);
    ctx.fillStyle = c[2]; ctx.fillRect(x + 9 * p, y + 4 * p, 3 * p, 7 * p); ctx.fillRect(x + 20 * p, y + 4 * p, 3 * p, 7 * p);
    ctx.fillStyle = '#333'; ctx.fillRect(x + 11 * p, y + 16 * p, 3 * p, 3 * p); ctx.fillRect(x + 18 * p, y + 16 * p, 3 * p, 3 * p);
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 12 * p, y + 16 * p, 1 * p, 1 * p); ctx.fillRect(x + 19 * p, y + 16 * p, 1 * p, 1 * p);
    ctx.fillStyle = '#FF6B6B'; ctx.fillRect(x + 14 * p, y + 20 * p, 4 * p, 2 * p);
    ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(x + 24 * p, y + 24 * p, 3 * p, 0, Math.PI * 2); ctx.fill();
  }

  // 2. MÈO - Round body, triangle ears, long tail
  static drawSpriteMeo(ctx, x, y, s, pet, wp) {
    const p = s / 32; const c = ['#FFB347', '#E89230', '#FFD080'];
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 19 * p, 8 * p, 9 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.moveTo(x + 8 * p, y + 10 * p); ctx.lineTo(x + 11 * p, y); ctx.lineTo(x + 14 * p, y + 8 * p); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 18 * p, y + 8 * p); ctx.lineTo(x + 21 * p, y); ctx.lineTo(x + 24 * p, y + 10 * p); ctx.fill();
    ctx.fillStyle = c[2]; ctx.beginPath(); ctx.moveTo(x + 8 * p, y + 8 * p); ctx.lineTo(x + 11 * p, y + 2 * p); ctx.lineTo(x + 13 * p, y + 8 * p); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 19 * p, y + 8 * p); ctx.lineTo(x + 21 * p, y + 2 * p); ctx.lineTo(x + 24 * p, y + 8 * p); ctx.fill();
    ctx.fillStyle = '#333'; ctx.fillRect(x + 11 * p, y + 16 * p, 3 * p, 3 * p); ctx.fillRect(x + 18 * p, y + 16 * p, 3 * p, 3 * p);
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 12 * p, y + 16 * p, 1 * p, 1 * p); ctx.fillRect(x + 19 * p, y + 16 * p, 1 * p, 1 * p);
    ctx.fillStyle = '#FF6B6B'; ctx.fillRect(x + 13 * p, y + 20 * p, 6 * p, 2 * p);
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 10 * p, y + 20 * p, 3 * p, 2 * p); ctx.fillRect(x + 19 * p, y + 20 * p, 3 * p, 2 * p);
    // Tail
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.moveTo(x + 24 * p, y + 22 * p); ctx.quadraticCurveTo(x + 30 * p, y + 16 * p, x + 28 * p, y + 10 * p); ctx.lineWidth = 3 * p; ctx.stroke();
  }

  // 3. CHÓ - Oval body, floppy ears, short tail
  static drawSpriteCho(ctx, x, y, s, pet, wp) {
    const p = s / 32; const c = ['#C8A56D', '#A8854D', '#E0C8A0'];
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 18 * p, 10 * p, 9 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c[1]; ctx.fillRect(x + 7 * p, y + 6 * p, 5 * p, 10 * p); ctx.fillRect(x + 20 * p, y + 6 * p, 5 * p, 10 * p);
    ctx.fillStyle = c[2]; ctx.fillRect(x + 8 * p, y + 8 * p, 3 * p, 6 * p); ctx.fillRect(x + 21 * p, y + 8 * p, 3 * p, 6 * p);
    ctx.fillStyle = '#333'; ctx.fillRect(x + 11 * p, y + 16 * p, 3 * p, 3 * p); ctx.fillRect(x + 18 * p, y + 16 * p, 3 * p, 3 * p);
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 12 * p, y + 16 * p, 1 * p, 1 * p); ctx.fillRect(x + 19 * p, y + 16 * p, 1 * p, 1 * p);
    ctx.fillStyle = '#222'; ctx.fillRect(x + 14 * p, y + 21 * p, 4 * p, 2 * p);
    ctx.fillStyle = c[0]; ctx.fillRect(x + 23 * p, y + 22 * p, 4 * p, 3 * p);
  }

  // 4. GẤU TRÚC - Round body, round ears, eye patches
  static drawSpriteGautruc(ctx, x, y, s, pet, wp) {
    const p = s / 32;
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 18 * p, 10 * p, 10 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(x + 11 * p, y + 8 * p, 5 * p, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 21 * p, y + 8 * p, 5 * p, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#222'; ctx.fillRect(x + 9 * p, y + 14 * p, 6 * p, 6 * p); ctx.fillRect(x + 17 * p, y + 14 * p, 6 * p, 6 * p);
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 11 * p, y + 15 * p, 2 * p, 3 * p); ctx.fillRect(x + 19 * p, y + 15 * p, 2 * p, 3 * p);
    ctx.fillStyle = '#222'; ctx.fillRect(x + 13 * p, y + 21 * p, 6 * p, 2 * p);
  }

  // 5. CỪU - Fluffy cloud body, thin legs
  static drawSpriteCuu(ctx, x, y, s, pet, wp) {
    const p = s / 32; const c = ['#FFF', '#E8E8E8', '#333'];
    ctx.fillStyle = '#DDD'; ctx.beginPath(); ctx.arc(x + 16 * p, y + 16 * p, 12 * p, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(x + 10 * p, y + 12 * p, 7 * p, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 22 * p, y + 12 * p, 7 * p, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 16 * p, y + 10 * p, 7 * p, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#333'; ctx.fillRect(x + 11 * p, y + 16 * p, 2 * p, 2 * p); ctx.fillRect(x + 19 * p, y + 16 * p, 2 * p, 2 * p);
  }

  // 6. RỒNG - Elongated, wings, horns, tail
  static drawSpriteRong(ctx, x, y, s, pet) {
    const p = s / 32; const c = ['#4CAF50', '#2E7D32', '#81C784'];
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 18 * p, 10 * p, 8 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.moveTo(x + 14 * p, y + 6 * p); ctx.lineTo(x + 16 * p, y); ctx.lineTo(x + 18 * p, y + 6 * p); ctx.fill();
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.moveTo(x + 3 * p, y + 12 * p); ctx.lineTo(x, y + 4 * p); ctx.lineTo(x + 8 * p, y + 14 * p); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 24 * p, y + 12 * p); ctx.lineTo(x + 32 * p, y + 4 * p); ctx.lineTo(x + 28 * p, y + 14 * p); ctx.fill();
    ctx.fillStyle = '#FFD700'; ctx.fillRect(x + 11 * p, y + 16 * p, 2 * p, 2 * p); ctx.fillRect(x + 19 * p, y + 16 * p, 2 * p, 2 * p);
    ctx.fillStyle = '#FF6B6B'; ctx.fillRect(x + 13 * p, y + 20 * p, 6 * p, 2 * p);
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.moveTo(x + 26 * p, y + 22 * p); ctx.quadraticCurveTo(x + 32 * p, y + 28 * p, x + 28 * p, y + 30 * p); ctx.lineWidth = 3 * p; ctx.stroke();
    ctx.fillStyle = c[1]; ctx.fillRect(x + 9 * p, y + 25 * p, 5 * p, 4 * p); ctx.fillRect(x + 18 * p, y + 25 * p, 5 * p, 4 * p);
  }

  // 7. KỲ LÂN - Horse, horn, flowing mane  
  static drawSpriteKylan(ctx, x, y, s, pet) {
    const p = s / 32; const c = ['#E8D5F5', '#C9A0E8', '#FFF'];
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 17 * p, 9 * p, 8 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 10 * p, 5 * p, 6 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.moveTo(x + 15 * p, y + 4 * p); ctx.lineTo(x + 16 * p, y - 2 * p); ctx.lineTo(x + 17 * p, y + 4 * p); ctx.fill();
    ctx.fillStyle = '#E8D5F5'; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 22 * p, 6 * p, 4 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#333'; ctx.fillRect(x + 12 * p, y + 16 * p, 2 * p, 2 * p); ctx.fillRect(x + 18 * p, y + 16 * p, 2 * p, 2 * p);
    ctx.fillStyle = c[0]; ctx.fillRect(x + 8 * p, y + 24 * p, 4 * p, 5 * p); ctx.fillRect(x + 20 * p, y + 24 * p, 4 * p, 5 * p);
    ctx.fillStyle = '#C9A0E8'; ctx.beginPath(); ctx.moveTo(x + 8 * p, y + 10 * p); ctx.quadraticCurveTo(x + 6 * p, y + 6 * p, x + 10 * p, y + 4 * p); ctx.lineWidth = 2 * p; ctx.stroke();
  }

  // 8. PHƯỢNG HOÀNG - Bird, flame tail, wings
  static drawSpritePhuonghoang(ctx, x, y, s, pet) {
    const p = s / 32; const c = ['#FF6B35', '#FF4444', '#FFD700'];
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 16 * p, 8 * p, 7 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 10 * p, 4 * p, 4 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.moveTo(x + 10 * p, y + 10 * p); ctx.lineTo(x + 4 * p, y + 14 * p); ctx.lineTo(x + 12 * p, y + 14 * p); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 22 * p, y + 10 * p); ctx.lineTo(x + 28 * p, y + 14 * p); ctx.lineTo(x + 20 * p, y + 14 * p); ctx.fill();
    ctx.fillStyle = '#333'; ctx.fillRect(x + 13 * p, y + 11 * p, 2 * p, 2 * p); ctx.fillRect(x + 18 * p, y + 11 * p, 2 * p, 2 * p);
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.moveTo(x + 16 * p, y + 22 * p); ctx.quadraticCurveTo(x + 26 * p, y + 30 * p, x + 20 * p, y + 32 * p); ctx.lineWidth = 4 * p; ctx.stroke();
    ctx.fillStyle = c[2]; ctx.fillRect(x + 12 * p, y + 22 * p, 2 * p, 6 * p); ctx.fillRect(x + 18 * p, y + 22 * p, 2 * p, 6 * p);
    ctx.fillStyle = c[0]; ctx.fillRect(x + 8 * p, y + 22 * p, 3 * p, 6 * p); ctx.fillRect(x + 21 * p, y + 22 * p, 3 * p, 6 * p);
  }

  // 9. KỲ NHÔNG - Lizard, long tail, spots
  static drawSpriteKynhong(ctx, x, y, s, pet) {
    const p = s / 32; const c = ['#7CB342', '#558B2F', '#AED581'];
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 18 * p, 8 * p, 7 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.moveTo(x + 16 * p, y + 6 * p); ctx.lineTo(x + 14 * p, y + 12 * p); ctx.lineTo(x + 18 * p, y + 12 * p); ctx.fill();
    ctx.fillStyle = '#333'; ctx.fillRect(x + 13 * p, y + 16 * p, 2 * p, 2 * p); ctx.fillRect(x + 18 * p, y + 16 * p, 2 * p, 2 * p);
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.moveTo(x + 24 * p, y + 20 * p); ctx.quadraticCurveTo(x + 32 * p, y + 22 * p, x + 30 * p, y + 26 * p); ctx.lineWidth = 3 * p; ctx.stroke();
    ctx.fillStyle = '#AED581'; ctx.fillRect(x + 11 * p, y + 20 * p, 2 * p, 2 * p); ctx.fillRect(x + 18 * p, y + 21 * p, 2 * p, 2 * p);
    ctx.fillStyle = c[1]; ctx.fillRect(x + 9 * p, y + 24 * p, 4 * p, 4 * p); ctx.fillRect(x + 19 * p, y + 24 * p, 4 * p, 4 * p);
  }

  // 10. MA CÀ RỒNG - Cape, pointy ears, fangs, dark
  static drawSpriteMacarong(ctx, x, y, s, pet) {
    const p = s / 32; const c = ['#4A148C', '#6A1B9A', '#E040FB'];
    ctx.fillStyle = '#1A1A2E'; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 20 * p, 12 * p, 10 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 17 * p, 8 * p, 9 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.moveTo(x + 9 * p, y + 10 * p); ctx.lineTo(x + 12 * p, y + 2 * p); ctx.lineTo(x + 15 * p, y + 10 * p); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 17 * p, y + 10 * p); ctx.lineTo(x + 20 * p, y + 2 * p); ctx.lineTo(x + 23 * p, y + 10 * p); ctx.fill();
    ctx.fillStyle = '#FF1744'; ctx.fillRect(x + 12 * p, y + 16 * p, 3 * p, 2 * p); ctx.fillRect(x + 17 * p, y + 16 * p, 3 * p, 2 * p);
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 12 * p, y + 21 * p, 2 * p, 2 * p); ctx.fillRect(x + 18 * p, y + 21 * p, 2 * p, 2 * p);
    ctx.fillStyle = '#1A1A2E'; ctx.fillRect(x + 8 * p, y + 25 * p, 5 * p, 4 * p); ctx.fillRect(x + 19 * p, y + 25 * p, 5 * p, 4 * p);
  }

  // 11. ROBOT CHIẾN ĐẤU - Boxy, cannon arm, red eye
  static drawSpriteRobotChienthan(ctx, x, y, s, pet) {
    const p = s / 32; const c = ['#607D8B', '#455A64', '#90A4AE'];
    ctx.fillStyle = c[0]; ctx.fillRect(x + 6 * p, y + 8 * p, 20 * p, 18 * p);
    ctx.fillStyle = c[1]; ctx.fillRect(x + 8 * p, y + 2 * p, 16 * p, 8 * p);
    ctx.fillStyle = '#FF1744'; ctx.fillRect(x + 12 * p, y + 4 * p, 4 * p, 4 * p); ctx.fillRect(x + 18 * p, y + 4 * p, 2 * p, 2 * p);
    ctx.fillStyle = c[2]; ctx.fillRect(x + 10 * p, y + 12 * p, 12 * p, 2 * p);
    ctx.fillStyle = c[1]; ctx.fillRect(x + 1 * p, y + 12 * p, 5 * p, 12 * p);
    ctx.fillStyle = '#FF1744'; ctx.fillRect(x + 1 * p, y + 16 * p, 5 * p, 3 * p);
    ctx.fillStyle = c[1]; ctx.fillRect(x + 26 * p, y + 10 * p, 5 * p, 14 * p);
    ctx.fillStyle = c[0]; ctx.fillRect(x + 9 * p, y + 26 * p, 5 * p, 4 * p); ctx.fillRect(x + 18 * p, y + 26 * p, 5 * p, 4 * p);
  }

  // 12. ROBOT THÁM HIỂM - Round head, antenna, big eye, wheels
  static drawSpriteRobotThiemhiem(ctx, x, y, s, pet) {
    const p = s / 32; const c = ['#FFB300', '#FF8F00', '#FFD54F'];
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.arc(x + 16 * p, y + 12 * p, 10 * p, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c[1]; ctx.fillRect(x + 7 * p, y + 20 * p, 18 * p, 8 * p);
    ctx.fillStyle = '#333'; ctx.fillRect(x + 15 * p, y, 2 * p, 4 * p); ctx.fillStyle = '#FF1744'; ctx.beginPath(); ctx.arc(x + 16 * p, y, 2 * p, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#00E5FF'; ctx.beginPath(); ctx.arc(x + 16 * p, y + 12 * p, 5 * p, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(x + 16 * p, y + 12 * p, 2 * p, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#455A64'; ctx.beginPath(); ctx.arc(x + 10 * p, y + 24 * p, 3 * p, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 22 * p, y + 24 * p, 3 * p, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c[2]; ctx.fillRect(x + 11 * p, y + 28 * p, 4 * p, 2 * p); ctx.fillRect(x + 18 * p, y + 28 * p, 4 * p, 2 * p);
  }

  // 13. ROBOT VŨ TRỤ - Sleek, triangle-shaped, blue glow
  static drawSpriteRobotVutru(ctx, x, y, s, pet) {
    const p = s / 32; const c = ['#00BCD4', '#0097A7', '#80DEEA'];
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.moveTo(x + 16 * p, y + 2 * p); ctx.lineTo(x + 28 * p, y + 28 * p); ctx.lineTo(x + 4 * p, y + 28 * p); ctx.fill();
    ctx.fillStyle = c[1]; ctx.fillRect(x + 12 * p, y + 6 * p, 8 * p, 6 * p);
    ctx.fillStyle = '#00E5FF'; ctx.fillRect(x + 14 * p, y + 8 * p, 4 * p, 2 * p);
    ctx.fillStyle = c[2]; ctx.fillRect(x + 8 * p, y + 16 * p, 16 * p, 4 * p);
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 12 * p, y + 18 * p, 2 * p, 1 * p); ctx.fillRect(x + 18 * p, y + 18 * p, 2 * p, 1 * p);
    ctx.fillStyle = c[1]; ctx.fillRect(x + 10 * p, y + 24 * p, 4 * p, 4 * p); ctx.fillRect(x + 18 * p, y + 24 * p, 4 * p, 4 * p);
    ctx.fillStyle = '#00E5FF'; ctx.fillRect(x + 6 * p, y + 22 * p, 2 * p, 6 * p); ctx.fillRect(x + 24 * p, y + 22 * p, 2 * p, 6 * p);
  }

  // 14. NINJA ROBOT - Slim, sword, mask, dark
  static drawSpriteNinjaRobot(ctx, x, y, s, pet) {
    const p = s / 32; const c = ['#212121', '#424242', '#FF1744'];
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 18 * p, 7 * p, 9 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#333'; ctx.fillRect(x + 10 * p, y + 4 * p, 12 * p, 8 * p);
    ctx.fillStyle = '#FF1744'; ctx.fillRect(x + 13 * p, y + 6 * p, 6 * p, 2 * p);
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 12 * p, y + 8 * p, 2 * p, 2 * p); ctx.fillRect(x + 18 * p, y + 8 * p, 2 * p, 2 * p);
    ctx.fillStyle = c[1]; ctx.fillRect(x + 3 * p, y + 14 * p, 4 * p, 8 * p); ctx.fillRect(x + 25 * p, y + 14 * p, 4 * p, 8 * p);
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 26 * p, y + 12 * p, 1 * p, 12 * p);
    ctx.fillStyle = c[0]; ctx.fillRect(x + 10 * p, y + 26 * p, 4 * p, 4 * p); ctx.fillRect(x + 18 * p, y + 26 * p, 4 * p, 4 * p);
  }

  // 15. ROBOT KHỔNG LỒ - Huge body, fists, shoulder armor
  static drawSpriteRobotKhonglo(ctx, x, y, s, pet) {
    const p = s / 32; const c = ['#78909C', '#546E7A', '#B0BEC5'];
    ctx.fillStyle = c[0]; ctx.fillRect(x + 4 * p, y + 6 * p, 24 * p, 22 * p);
    ctx.fillStyle = c[1]; ctx.fillRect(x + 7 * p, y, 18 * p, 8 * p);
    ctx.fillStyle = '#FFD700'; ctx.fillRect(x + 12 * p, y + 2 * p, 4 * p, 4 * p); ctx.fillRect(x + 18 * p, y + 2 * p, 2 * p, 2 * p);
    ctx.fillStyle = c[2]; ctx.fillRect(x + 8 * p, y + 10 * p, 16 * p, 4 * p);
    ctx.fillStyle = '#FF4444'; ctx.fillRect(x + 10 * p, y + 12 * p, 4 * p, 1 * p); ctx.fillRect(x + 18 * p, y + 12 * p, 4 * p, 1 * p);
    ctx.fillStyle = c[1]; ctx.fillRect(x + 1 * p, y + 14 * p, 6 * p, 8 * p); ctx.fillRect(x + 25 * p, y + 14 * p, 6 * p, 8 * p);
    ctx.fillStyle = '#FFD700'; ctx.fillRect(x, y + 18 * p, 4 * p, 4 * p); ctx.fillRect(x + 28 * p, y + 18 * p, 4 * p, 4 * p);
    ctx.fillStyle = c[0]; ctx.fillRect(x + 8 * p, y + 26 * p, 6 * p, 4 * p); ctx.fillRect(x + 18 * p, y + 26 * p, 6 * p, 4 * p);
  }

  // 16. BĂNG TINH - Crystal shard, diamond shape, blue glow
  static drawSpriteBangtinh(ctx, x, y, s, pet) {
    const p = s / 32; const c = ['#80DEEA', '#4DD0E1', '#E0F7FA', '#FFF'];
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.moveTo(x + 16 * p, y); ctx.lineTo(x + 28 * p, y + 14 * p); ctx.lineTo(x + 16 * p, y + 28 * p); ctx.lineTo(x + 4 * p, y + 14 * p); ctx.fill();
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.moveTo(x + 16 * p, y + 4 * p); ctx.lineTo(x + 24 * p, y + 14 * p); ctx.lineTo(x + 16 * p, y + 24 * p); ctx.lineTo(x + 8 * p, y + 14 * p); ctx.fill();
    ctx.fillStyle = c[2]; ctx.beginPath(); ctx.moveTo(x + 16 * p, y + 8 * p); ctx.lineTo(x + 20 * p, y + 14 * p); ctx.lineTo(x + 16 * p, y + 20 * p); ctx.lineTo(x + 12 * p, y + 14 * p); ctx.fill();
    ctx.fillStyle = '#333'; ctx.fillRect(x + 14 * p, y + 12 * p, 2 * p, 2 * p); ctx.fillRect(x + 18 * p, y + 12 * p, 2 * p, 2 * p);
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 15 * p, y + 12 * p, 1 * p, 1 * p); ctx.fillRect(x + 19 * p, y + 12 * p, 1 * p, 1 * p);
    ctx.fillStyle = c[1]; ctx.fillRect(x + 8 * p, y + 26 * p, 4 * p, 3 * p); ctx.fillRect(x + 20 * p, y + 26 * p, 4 * p, 3 * p);
  }

  // 17. TUYẾT NHÂN - Snowman, round body, carrot nose, hat
  static drawSpriteTuyetnhan(ctx, x, y, s, pet) {
    const p = s / 32;
    ctx.fillStyle = '#F0F0F0'; ctx.beginPath(); ctx.arc(x + 16 * p, y + 22 * p, 10 * p, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 16 * p, y + 14 * p, 7 * p, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 16 * p, y + 8 * p, 5 * p, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#333'; ctx.fillRect(x + 10 * p, y, 12 * p, 4 * p);
    ctx.fillStyle = '#FF6B35'; ctx.beginPath(); ctx.moveTo(x + 16 * p, y + 12 * p); ctx.lineTo(x + 20 * p, y + 14 * p); ctx.lineTo(x + 16 * p, y + 14 * p); ctx.fill();
    ctx.fillStyle = '#333'; ctx.fillRect(x + 12 * p, y + 7 * p, 3 * p, 2 * p); ctx.fillRect(x + 17 * p, y + 7 * p, 3 * p, 2 * p);
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 13 * p, y + 7 * p, 1 * p, 1 * p); ctx.fillRect(x + 18 * p, y + 7 * p, 1 * p, 1 * p);
    ctx.fillStyle = '#555'; ctx.fillRect(x + 11 * p, y + 1 * p, 3 * p, 3 * p); ctx.fillRect(x + 18 * p, y + 1 * p, 3 * p, 3 * p);
    ctx.fillStyle = '#888'; ctx.fillRect(x + 9 * p, y + 20 * p, 4 * p, 3 * p); ctx.fillRect(x + 19 * p, y + 20 * p, 4 * p, 3 * p);
    ctx.fillRect(x + 12 * p, y + 26 * p, 3 * p, 3 * p); ctx.fillRect(x + 17 * p, y + 26 * p, 3 * p, 3 * p);
  }

  // 18. HẢI CẨU BĂNG - Seal, flippers, whiskers
  static drawSpriteHaicau(ctx, x, y, s, pet) {
    const p = s / 32; const c = ['#B0BEC5', '#90A4AE', '#78909C'];
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 20 * p, 10 * p, 8 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 14 * p, 7 * p, 6 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#333'; ctx.fillRect(x + 12 * p, y + 13 * p, 3 * p, 3 * p); ctx.fillRect(x + 17 * p, y + 13 * p, 3 * p, 3 * p);
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 13 * p, y + 13 * p, 1 * p, 1 * p); ctx.fillRect(x + 18 * p, y + 13 * p, 1 * p, 1 * p);
    ctx.fillStyle = '#333'; ctx.fillRect(x + 14 * p, y + 17 * p, 4 * p, 1 * p);
    ctx.fillStyle = c[2]; ctx.fillRect(x + 5 * p, y + 16 * p, 4 * p, 3 * p); ctx.fillRect(x + 23 * p, y + 16 * p, 4 * p, 3 * p);
    ctx.fillStyle = c[0]; ctx.fillRect(x + 12 * p, y + 27 * p, 3 * p, 3 * p); ctx.fillRect(x + 17 * p, y + 27 * p, 3 * p, 3 * p);
    ctx.fillStyle = '#DDD'; ctx.fillRect(x + 7 * p, y + 14 * p, 2 * p, 1 * p); ctx.fillRect(x + 8 * p, y + 16 * p, 2 * p, 1 * p);
    ctx.fillRect(x + 24 * p, y + 14 * p, 2 * p, 1 * p); ctx.fillRect(x + 23 * p, y + 16 * p, 2 * p, 1 * p);
  }

  // 19. KỲ LÂN BĂNG - Unicorn with ice horn, blue glow
  static drawSpriteKylanbang(ctx, x, y, s, pet) {
    const p = s / 32; const c = ['#E0F7FA', '#80DEEA', '#FFF'];
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 17 * p, 9 * p, 8 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 10 * p, 5 * p, 6 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#80DEEA'; ctx.beginPath(); ctx.moveTo(x + 15 * p, y + 4 * p); ctx.lineTo(x + 16 * p, y - 2 * p); ctx.lineTo(x + 17 * p, y + 4 * p); ctx.fill();
    ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(x + 16 * p, y - 2 * p, 2 * p, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#80DEEA'; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 22 * p, 6 * p, 4 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#333'; ctx.fillRect(x + 12 * p, y + 16 * p, 2 * p, 2 * p); ctx.fillRect(x + 18 * p, y + 16 * p, 2 * p, 2 * p);
    ctx.fillStyle = '#80DEEA'; ctx.fillRect(x + 8 * p, y + 24 * p, 4 * p, 5 * p); ctx.fillRect(x + 20 * p, y + 24 * p, 4 * p, 5 * p);
    ctx.fillStyle = '#B2EBF2'; ctx.beginPath(); ctx.moveTo(x + 8 * p, y + 10 * p); ctx.quadraticCurveTo(x + 4 * p, y + 4 * p, x + 8 * p, y + 2 * p); ctx.lineWidth = 2 * p; ctx.stroke();
  }

  // 20. RỒNG BĂNG - Ice dragon, crystal scales, icy breath
  static drawSpriteRongbang(ctx, x, y, s, pet) {
    const p = s / 32; const c = ['#4DD0E1', '#26C6DA', '#80DEEA', '#FFF'];
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 18 * p, 10 * p, 8 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.moveTo(x + 14 * p, y + 6 * p); ctx.lineTo(x + 16 * p, y); ctx.lineTo(x + 18 * p, y + 6 * p); ctx.fill();
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.moveTo(x + 3 * p, y + 12 * p); ctx.lineTo(x, y + 4 * p); ctx.lineTo(x + 8 * p, y + 14 * p); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 24 * p, y + 12 * p); ctx.lineTo(x + 32 * p, y + 4 * p); ctx.lineTo(x + 28 * p, y + 14 * p); ctx.fill();
    ctx.fillStyle = c[2]; ctx.fillRect(x + 11 * p, y + 16 * p, 2 * p, 2 * p); ctx.fillRect(x + 19 * p, y + 16 * p, 2 * p, 2 * p);
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 12 * p, y + 16 * p, 1 * p, 1 * p); ctx.fillRect(x + 20 * p, y + 16 * p, 1 * p, 1 * p);
    ctx.fillStyle = '#80DEEA'; ctx.fillRect(x + 13 * p, y + 20 * p, 6 * p, 2 * p);
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.moveTo(x + 26 * p, y + 22 * p); ctx.quadraticCurveTo(x + 32 * p, y + 28 * p, x + 28 * p, y + 30 * p); ctx.lineWidth = 3 * p; ctx.stroke();
    ctx.fillStyle = c[1]; ctx.fillRect(x + 9 * p, y + 25 * p, 5 * p, 4 * p); ctx.fillRect(x + 18 * p, y + 25 * p, 5 * p, 4 * p);
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 16 * p, y + 12 * p, 2 * p, 3 * p); // Frost breath
  }

  // 21. CÂY NON - Small sapling, green sprout
  static drawSpriteCaynon(ctx, x, y, s, pet) {
    const p = s / 32;
    ctx.fillStyle = '#8B4513'; ctx.fillRect(x + 14 * p, y + 16 * p, 4 * p, 12 * p);
    ctx.fillStyle = '#4CAF50'; ctx.beginPath(); ctx.arc(x + 12 * p, y + 12 * p, 6 * p, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 20 * p, y + 10 * p, 5 * p, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 16 * p, y + 8 * p, 6 * p, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#66BB6A'; ctx.beginPath(); ctx.arc(x + 10 * p, y + 9 * p, 4 * p, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 22 * p, y + 8 * p, 4 * p, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#333'; ctx.fillRect(x + 14 * p, y + 14 * p, 2 * p, 2 * p);
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 15 * p, y + 14 * p, 1 * p, 1 * p);
    ctx.fillStyle = '#00C853'; ctx.fillRect(x + 13 * p, y + 26 * p, 2 * p, 2 * p); ctx.fillRect(x + 17 * p, y + 26 * p, 2 * p, 2 * p);
  }

  // 22. HOA ĂN THỊT - Carnivorous plant, big mouth, teeth
  static drawSpriteHoathit(ctx, x, y, s, pet) {
    const p = s / 32; const c = ['#E91E63', '#C2185B', '#4CAF50'];
    ctx.fillStyle = c[2]; ctx.fillRect(x + 13 * p, y + 16 * p, 6 * p, 12 * p);
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.arc(x + 16 * p, y + 10 * p, 9 * p, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.arc(x + 16 * p, y + 10 * p, 7 * p, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 11 * p, y + 8 * p, 10 * p, 4 * p);
    ctx.fillRect(x + 13 * p, y + 6 * p, 6 * p, 8 * p);
    ctx.fillStyle = '#333'; ctx.fillRect(x + 13 * p, y + 8 * p, 3 * p, 2 * p); ctx.fillRect(x + 17 * p, y + 8 * p, 3 * p, 2 * p);
    ctx.fillRect(x + 11 * p, y + 10 * p, 2 * p, 2 * p); ctx.fillRect(x + 19 * p, y + 10 * p, 2 * p, 2 * p);
    ctx.fillStyle = '#4CAF50'; ctx.fillRect(x + 4 * p, y + 13 * p, 4 * p, 3 * p); ctx.fillRect(x + 24 * p, y + 13 * p, 4 * p, 3 * p);
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 12 * p, y + 14 * p, 2 * p, 1 * p); ctx.fillRect(x + 18 * p, y + 14 * p, 2 * p, 1 * p);
    ctx.fillStyle = c[2]; ctx.fillRect(x + 10 * p, y + 26 * p, 3 * p, 3 * p); ctx.fillRect(x + 19 * p, y + 26 * p, 3 * p, 3 * p);
  }

  // 23. TINH LÂM - Forest spirit, floating, leaf wings
  static drawSpriteTinhlam(ctx, x, y, s, pet) {
    const p = s / 32; const c = ['#66BB6A', '#43A047', '#A5D6A7', '#FFF'];
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.arc(x + 16 * p, y + 14 * p, 8 * p, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c[2]; ctx.beginPath(); ctx.arc(x + 16 * p, y + 10 * p, 5 * p, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.moveTo(x + 8 * p, y + 14 * p); ctx.lineTo(x + 4 * p, y + 6 * p); ctx.lineTo(x + 12 * p, y + 12 * p); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 24 * p, y + 14 * p); ctx.lineTo(x + 28 * p, y + 6 * p); ctx.lineTo(x + 20 * p, y + 12 * p); ctx.fill();
    ctx.fillStyle = '#333'; ctx.fillRect(x + 13 * p, y + 9 * p, 2 * p, 2 * p); ctx.fillRect(x + 17 * p, y + 9 * p, 2 * p, 2 * p);
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 14 * p, y + 9 * p, 1 * p, 1 * p); ctx.fillRect(x + 18 * p, y + 9 * p, 1 * p, 1 * p);
    ctx.fillStyle = c[2]; ctx.fillRect(x + 12 * p, y + 14 * p, 8 * p, 8 * p);
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.arc(x + 16 * p, y + 18 * p, 4 * p, 0, Math.PI * 2); ctx.fill();
    // Floating trail
    ctx.fillStyle = 'rgba(102, 187, 106, 0.3)';
    ctx.beginPath(); ctx.arc(x + 16 * p, y + 26 * p, 3 * p, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFF'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
    ctx.fillText('✨', x + 16 * p, y - 2 * p);
  }

  // 24. NGƯỜI CÂY - Treant, bark body, branch arms, roots
  static drawSpriteNguoicay(ctx, x, y, s, pet) {
    const p = s / 32; const c = ['#5D4037', '#4E342E', '#6D4C41', '#4CAF50'];
    ctx.fillStyle = c[0]; ctx.fillRect(x + 8 * p, y + 6 * p, 16 * p, 20 * p);
    ctx.fillStyle = c[1]; ctx.fillRect(x + 10 * p, y + 2 * p, 12 * p, 6 * p);
    ctx.fillStyle = c[2]; ctx.fillRect(x + 3 * p, y + 10 * p, 5 * p, 12 * p); ctx.fillRect(x + 24 * p, y + 10 * p, 5 * p, 12 * p);
    ctx.fillStyle = c[2]; ctx.fillRect(x + 6 * p, y + 18 * p, 4 * p, 4 * p); ctx.fillRect(x + 22 * p, y + 18 * p, 4 * p, 4 * p);
    ctx.fillStyle = '#333'; ctx.fillRect(x + 12 * p, y + 8 * p, 3 * p, 3 * p); ctx.fillRect(x + 17 * p, y + 8 * p, 3 * p, 3 * p);
    ctx.fillStyle = '#FF6B35'; ctx.fillRect(x + 13 * p, y + 12 * p, 6 * p, 2 * p);
    ctx.fillStyle = c[3]; ctx.beginPath(); ctx.arc(x + 16 * p, y + 2 * p, 6 * p, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 8 * p, y + 4 * p, 4 * p, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 24 * p, y + 4 * p, 4 * p, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c[1]; ctx.fillRect(x + 9 * p, y + 26 * p, 4 * p, 4 * p); ctx.fillRect(x + 19 * p, y + 26 * p, 4 * p, 4 * p);
  }

  // 25. RỒNG CÂY - Wood dragon, green scales, leaf wings, vine tail
  static drawSpriteRongcay(ctx, x, y, s, pet) {
    const p = s / 32; const c = ['#388E3C', '#2E7D32', '#66BB6A', '#A5D6A7'];
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 18 * p, 10 * p, 8 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.moveTo(x + 14 * p, y + 6 * p); ctx.lineTo(x + 16 * p, y); ctx.lineTo(x + 18 * p, y + 6 * p); ctx.fill();
    ctx.fillStyle = c[2]; ctx.beginPath(); ctx.moveTo(x + 3 * p, y + 12 * p); ctx.lineTo(x, y + 4 * p); ctx.lineTo(x + 8 * p, y + 14 * p); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 24 * p, y + 12 * p); ctx.lineTo(x + 32 * p, y + 4 * p); ctx.lineTo(x + 28 * p, y + 14 * p); ctx.fill();
    ctx.fillStyle = '#FFD700'; ctx.fillRect(x + 11 * p, y + 16 * p, 2 * p, 2 * p); ctx.fillRect(x + 19 * p, y + 16 * p, 2 * p, 2 * p);
    ctx.fillStyle = '#333'; ctx.fillRect(x + 12 * p, y + 16 * p, 1 * p, 1 * p); ctx.fillRect(x + 20 * p, y + 16 * p, 1 * p, 1 * p);
    ctx.fillStyle = c[1]; ctx.fillRect(x + 13 * p, y + 20 * p, 6 * p, 2 * p);
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.moveTo(x + 26 * p, y + 22 * p); ctx.quadraticCurveTo(x + 32 * p, y + 28 * p, x + 28 * p, y + 30 * p); ctx.lineWidth = 3 * p; ctx.stroke();
    ctx.fillStyle = c[2]; ctx.fillRect(x + 9 * p, y + 25 * p, 5 * p, 4 * p); ctx.fillRect(x + 18 * p, y + 25 * p, 5 * p, 4 * p);
    ctx.fillStyle = c[3]; ctx.beginPath(); ctx.arc(x + 16 * p, y + 10 * p, 3 * p, 0, Math.PI * 2); ctx.fill();
  }

  // 🌊 BÃO BIỂN - Wave-like body, fin, stormy aura
  static drawSpriteBaobien(ctx, x, y, s, pet) {
    const p = s / 32; const c = ['#4DD0E1', '#26A8B8', '#80DEEA', '#E0F7FA'];
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 18 * p, 9 * p, 8 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.moveTo(x + 4 * p, y + 16 * p); ctx.quadraticCurveTo(x + 16 * p, y + 6 * p, x + 28 * p, y + 16 * p); ctx.lineWidth = 4 * p; ctx.stroke();
    ctx.fillStyle = c[2]; ctx.beginPath(); ctx.moveTo(x + 24 * p, y + 10 * p); ctx.lineTo(x + 30 * p, y + 2 * p); ctx.lineTo(x + 30 * p, y + 12 * p); ctx.fill();
    ctx.fillStyle = c[3]; ctx.fillRect(x + 11 * p, y + 15 * p, 3 * p, 3 * p); ctx.fillRect(x + 18 * p, y + 15 * p, 3 * p, 3 * p);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + 12 * p, y + 15 * p, 1 * p, 1 * p); ctx.fillRect(x + 19 * p, y + 15 * p, 1 * p, 1 * p);
    ctx.fillStyle = '#0097A7'; ctx.fillRect(x + 13 * p, y + 20 * p, 6 * p, 2 * p);
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.moveTo(x + 26 * p, y + 20 * p); ctx.quadraticCurveTo(x + 32 * p, y + 14 * p, x + 30 * p, y + 22 * p); ctx.fill();
    ctx.fillStyle = c[2]; ctx.fillRect(x + 8 * p, y + 24 * p, 7 * p, 4 * p); ctx.fillRect(x + 17 * p, y + 24 * p, 7 * p, 4 * p);
  }

  // 🌪️ LỐC XOÁY - Spiral tornado body
  static drawSpriteLocsay(ctx, x, y, s, pet) {
    const p = s / 32; const c = ['#4DD0E1', '#26A8B8', '#80DEEA', '#B2EBF2'];
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 20 * p, 8 * p, 10 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.moveTo(x + 8 * p, y + 14 * p); ctx.quadraticCurveTo(x + 16 * p, y + 4 * p, x + 24 * p, y + 14 * p); ctx.quadraticCurveTo(x + 16 * p, y + 10 * p, x + 8 * p, y + 14 * p); ctx.fill();
    ctx.fillStyle = c[2]; ctx.beginPath(); ctx.moveTo(x + 10 * p, y + 18 * p); ctx.quadraticCurveTo(x + 16 * p, y + 8 * p, x + 22 * p, y + 18 * p); ctx.quadraticCurveTo(x + 16 * p, y + 14 * p, x + 10 * p, y + 18 * p); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + 11 * p, y + 16 * p, 2 * p, 2 * p); ctx.fillRect(x + 19 * p, y + 16 * p, 2 * p, 2 * p);
    ctx.fillStyle = '#006064'; ctx.fillRect(x + 12 * p, y + 16 * p, 1 * p, 1 * p); ctx.fillRect(x + 20 * p, y + 16 * p, 1 * p, 1 * p);
    ctx.fillStyle = c[3]; ctx.fillRect(x + 14 * p, y + 22 * p, 4 * p, 2 * p);
    ctx.fillStyle = c[0]; ctx.fillRect(x + 10 * p, y + 26 * p, 4 * p, 3 * p); ctx.fillRect(x + 18 * p, y + 26 * p, 4 * p, 3 * p);
    // Spiral lines
    ctx.strokeStyle = '#B2EBF2'; ctx.lineWidth = 1; ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.moveTo(x + 8 * p, y + 12 * p); ctx.quadraticCurveTo(x + 16 * p, y + 2 * p, x + 24 * p, y + 12 * p); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // 💨 GIÓ LỐC - Fast wind streak body, angular
  static drawSpriteGioloc(ctx, x, y, s, pet) {
    const p = s / 32; const c = ['#26C6DA', '#00ACC1', '#80DEEA', '#E0F7FA'];
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 18 * p, 10 * p, 7 * p, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.moveTo(x + 4 * p, y + 16 * p); ctx.lineTo(x + 8 * p, y + 8 * p); ctx.lineTo(x + 12 * p, y + 16 * p); ctx.fill();
    ctx.fillStyle = c[2]; ctx.fillRect(x + 11 * p, y + 15 * p, 3 * p, 3 * p); ctx.fillRect(x + 18 * p, y + 15 * p, 3 * p, 3 * p);
    ctx.fillStyle = '#333'; ctx.fillRect(x + 12 * p, y + 15 * p, 1 * p, 1 * p); ctx.fillRect(x + 19 * p, y + 15 * p, 1 * p, 1 * p);
    ctx.fillStyle = c[1]; ctx.fillRect(x + 13 * p, y + 20 * p, 6 * p, 2 * p);
    ctx.fillStyle = c[3]; ctx.beginPath(); ctx.moveTo(x + 6 * p, y + 24 * p); ctx.lineTo(x + 12 * p, y + 22 * p); ctx.lineTo(x + 10 * p, y + 26 * p); ctx.fill();
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.moveTo(x + 20 * p, y + 24 * p); ctx.lineTo(x + 26 * p, y + 22 * p); ctx.lineTo(x + 24 * p, y + 26 * p); ctx.fill();
    // Speed lines
    ctx.strokeStyle = '#E0F7FA'; ctx.lineWidth = 1; ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.moveTo(x + 4 * p, y + 12 * p); ctx.lineTo(x + 10 * p, y + 10 * p); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 22 * p, y + 10 * p); ctx.lineTo(x + 28 * p, y + 12 * p); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // ⛈️ MÂY BÃO - Cloud body, lightning accent
  static drawSpriteMaybao(ctx, x, y, s, pet) {
    const p = s / 32; const c = ['#78909C', '#546E7A', '#90A4AE', '#B0BEC5'];
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 18 * p, 10 * p, 8 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.arc(x + 12 * p, y + 14 * p, 7 * p, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 20 * p, y + 14 * p, 6 * p, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c[2]; ctx.beginPath(); ctx.arc(x + 16 * p, y + 10 * p, 5 * p, 0, Math.PI * 2); ctx.fill();
    // Lightning mark
    ctx.fillStyle = '#FFD700'; ctx.fillRect(x + 14 * p, y + 18 * p, 2 * p, 6 * p); ctx.fillRect(x + 12 * p, y + 22 * p, 2 * p, 3 * p);
    ctx.fillRect(x + 16 * p, y + 20 * p, 2 * p, 5 * p); ctx.fillRect(x + 18 * p, y + 18 * p, 2 * p, 3 * p);
    // Eyes
    ctx.fillStyle = '#FFD700'; ctx.fillRect(x + 10 * p, y + 14 * p, 3 * p, 3 * p); ctx.fillRect(x + 19 * p, y + 14 * p, 3 * p, 3 * p);
    ctx.fillStyle = '#333'; ctx.fillRect(x + 11 * p, y + 14 * p, 1 * p, 1 * p); ctx.fillRect(x + 20 * p, y + 14 * p, 1 * p, 1 * p);
    // Feet
    ctx.fillStyle = c[1]; ctx.fillRect(x + 9 * p, y + 24 * p, 5 * p, 4 * p); ctx.fillRect(x + 18 * p, y + 24 * p, 5 * p, 4 * p);
    // Rain drops
    ctx.fillStyle = '#4DD0E1'; ctx.globalAlpha = 0.5;
    ctx.fillRect(x + 6 * p, y + 22 * p, 1 * p, 3 * p); ctx.fillRect(x + 26 * p, y + 22 * p, 1 * p, 3 * p);
    ctx.globalAlpha = 1;
  }

  // 🌀 SIÊU BÃO - Massive spiral, crown of winds
  static drawSpriteSieubao(ctx, x, y, s, pet) {
    const p = s / 32; const c = ['#0097A7', '#00838F', '#26C6DA', '#B2EBF2'];
    ctx.fillStyle = c[0]; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 20 * p, 11 * p, 10 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c[1]; ctx.beginPath(); ctx.arc(x + 16 * p, y + 18 * p, 7 * p, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c[2]; ctx.beginPath(); ctx.arc(x + 16 * p, y + 16 * p, 4 * p, 0, Math.PI * 2); ctx.fill();
    // Crown spikes
    ctx.fillStyle = '#E0F7FA';
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + 0.5;
      ctx.fillRect(x + 16 * p + Math.cos(angle) * 10 * p - 1 * p, y + 10 * p + Math.sin(angle) * 6 * p - 1 * p, 2 * p, 2 * p);
    }
    // Eyes (large, intense)
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x + 10 * p, y + 16 * p, 4 * p, 4 * p); ctx.fillRect(x + 18 * p, y + 16 * p, 4 * p, 4 * p);
    ctx.fillStyle = '#004D5A'; ctx.fillRect(x + 11 * p, y + 17 * p, 2 * p, 2 * p); ctx.fillRect(x + 19 * p, y + 17 * p, 2 * p, 2 * p);
    // Angry mouth
    ctx.fillStyle = '#004D5A'; ctx.fillRect(x + 12 * p, y + 22 * p, 8 * p, 2 * p);
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 13 * p, y + 22 * p, 2 * p, 1 * p); ctx.fillRect(x + 17 * p, y + 22 * p, 2 * p, 1 * p);
    // Arms (wind tendrils)
    ctx.fillStyle = c[2]; ctx.beginPath(); ctx.moveTo(x + 4 * p, y + 20 * p); ctx.quadraticCurveTo(x, y + 16 * p, x + 2 * p, y + 12 * p); ctx.lineWidth = 3 * p; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 28 * p, y + 20 * p); ctx.quadraticCurveTo(x + 32 * p, y + 16 * p, x + 30 * p, y + 12 * p); ctx.stroke();
    // Feet
    ctx.fillStyle = c[1]; ctx.fillRect(x + 8 * p, y + 28 * p, 6 * p, 4 * p); ctx.fillRect(x + 18 * p, y + 28 * p, 6 * p, 4 * p);
    // Wind swirl
    ctx.strokeStyle = '#B2EBF2'; ctx.lineWidth = 1; ctx.globalAlpha = 0.3;
    ctx.beginPath(); ctx.arc(x + 16 * p, y + 16 * p, 13 * p, 0, Math.PI * 1.5); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // ===== BOSS SPRITES =====
  // Dispatch boss by type (boss.type field)
  static drawBossSprite(ctx, pet, cx, cy, s) {
    const bossTypeMap = {
      dragon:    this.drawBossDragon,
      giant:     this.drawBossGiant,
      elemental: this.drawBossElemental,
      beast:     this.drawBossBeast,
      demon:     this.drawBossDemon,
      mystic:    this.drawBossMystic,
      chaos:     this.drawBossChaos,
      plant:     this.drawBossPlant,
      god:       this.drawBossGod
    };
    const drawFn = bossTypeMap[pet.type] || this.drawBossDragon;
    drawFn.call(this, ctx, cx, cy, s, pet);
  }

  // 🐉 DRAGON BOSS — Winged serpent, imposing
  static drawBossDragon(ctx, x, y, s, pet) {
    const p = s / 32; const el = pet.element || 'fire';
    const pal = this.BOSS_PALETTES[el] || this.BOSS_PALETTES.fire;
    const c = pal;
    // Body (thick serpentine)
    ctx.fillStyle = c.body; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 20 * p, 11 * p, 7 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.dark; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 22 * p, 9 * p, 4 * p, 0, 0, Math.PI * 2); ctx.fill();
    // Head
    ctx.fillStyle = c.body; ctx.beginPath(); ctx.arc(x + 16 * p, y + 10 * p, 7 * p, 0, Math.PI * 2); ctx.fill();
    // Snout
    ctx.fillStyle = c.dark; ctx.fillRect(x + 12 * p, y + 12 * p, 8 * p, 4 * p);
    // Eyes (glowing)
    ctx.fillStyle = c.eye; ctx.fillRect(x + 11 * p, y + 7 * p, 3 * p, 3 * p); ctx.fillRect(x + 18 * p, y + 7 * p, 3 * p, 3 * p);
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 12 * p, y + 7 * p, 1 * p, 1 * p); ctx.fillRect(x + 19 * p, y + 7 * p, 1 * p, 1 * p);
    // Horns
    ctx.fillStyle = c.dark; ctx.beginPath(); ctx.moveTo(x + 11 * p, y + 5 * p); ctx.lineTo(x + 8 * p, y); ctx.lineTo(x + 13 * p, y + 4 * p); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 21 * p, y + 5 * p); ctx.lineTo(x + 24 * p, y); ctx.lineTo(x + 19 * p, y + 4 * p); ctx.fill();
    // Wings
    ctx.fillStyle = c.light; ctx.beginPath(); ctx.moveTo(x + 4 * p, y + 12 * p); ctx.quadraticCurveTo(x - 2 * p, y + 4 * p, x + 6 * p, y + 6 * p); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 28 * p, y + 12 * p); ctx.quadraticCurveTo(x + 34 * p, y + 4 * p, x + 26 * p, y + 6 * p); ctx.fill();
    // Mouth with teeth
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 13 * p, y + 14 * p, 2 * p, 2 * p); ctx.fillRect(x + 17 * p, y + 14 * p, 2 * p, 2 * p);
    ctx.fillStyle = c.body; ctx.fillRect(x + 15 * p, y + 14 * p, 2 * p, 1 * p);
    // Belly scales
    ctx.fillStyle = c.light; ctx.fillRect(x + 12 * p, y + 18 * p, 8 * p, 2 * p);
    ctx.fillRect(x + 13 * p, y + 20 * p, 6 * p, 1 * p);
    // Tail
    ctx.fillStyle = c.dark; ctx.beginPath(); ctx.moveTo(x + 26 * p, y + 18 * p); ctx.quadraticCurveTo(x + 36 * p, y + 14 * p, x + 32 * p, y + 22 * p); ctx.lineWidth = 4 * p; ctx.stroke();
    // Legs
    ctx.fillStyle = c.dark; ctx.fillRect(x + 9 * p, y + 24 * p, 5 * p, 6 * p); ctx.fillRect(x + 18 * p, y + 24 * p, 5 * p, 6 * p);
    // Element aura
    ctx.globalAlpha = 0.12; ctx.fillStyle = c.light;
    ctx.beginPath(); ctx.arc(x + 16 * p, y + 16 * p, 18 * p, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // 🗿 GIANT BOSS — Massive humanoid
  static drawBossGiant(ctx, x, y, s, pet) {
    const p = s / 32; const el = pet.element || 'earth';
    const pal = this.BOSS_PALETTES[el] || this.BOSS_PALETTES.earth;
    const c = pal;
    // Massive torso
    ctx.fillStyle = c.body; ctx.fillRect(x + 8 * p, y + 12 * p, 16 * p, 14 * p);
    // Shoulders
    ctx.fillStyle = c.dark; ctx.fillRect(x + 4 * p, y + 12 * p, 24 * p, 5 * p);
    // Head
    ctx.fillStyle = c.body; ctx.beginPath(); ctx.arc(x + 16 * p, y + 7 * p, 7 * p, 0, Math.PI * 2); ctx.fill();
    // Helmet/crown
    ctx.fillStyle = c.dark; ctx.fillRect(x + 10 * p, y, 12 * p, 4 * p); ctx.fillRect(x + 12 * p, y - 3 * p, 8 * p, 3 * p);
    // Eyes
    ctx.fillStyle = c.eye; ctx.fillRect(x + 11 * p, y + 5 * p, 3 * p, 2 * p); ctx.fillRect(x + 18 * p, y + 5 * p, 3 * p, 2 * p);
    // Angry brows
    ctx.fillStyle = c.dark; ctx.fillRect(x + 10 * p, y + 3 * p, 5 * p, 1 * p); ctx.fillRect(x + 17 * p, y + 3 * p, 5 * p, 1 * p);
    // Mouth
    ctx.fillStyle = c.dark; ctx.fillRect(x + 12 * p, y + 9 * p, 8 * p, 2 * p);
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 13 * p, y + 9 * p, 2 * p, 1 * p); ctx.fillRect(x + 17 * p, y + 9 * p, 2 * p, 1 * p);
    // Arms
    ctx.fillStyle = c.body; ctx.fillRect(x + 2 * p, y + 14 * p, 5 * p, 8 * p); ctx.fillRect(x + 25 * p, y + 14 * p, 5 * p, 8 * p);
    ctx.fillStyle = c.dark; ctx.fillRect(x, y + 20 * p, 6 * p, 4 * p); ctx.fillRect(x + 26 * p, y + 20 * p, 6 * p, 4 * p);
    // Belt
    ctx.fillStyle = c.dark; ctx.fillRect(x + 8 * p, y + 22 * p, 16 * p, 3 * p);
    ctx.fillStyle = c.eye; ctx.fillRect(x + 14 * p, y + 22 * p, 4 * p, 3 * p);
    // Legs
    ctx.fillStyle = c.dark; ctx.fillRect(x + 8 * p, y + 26 * p, 6 * p, 6 * p); ctx.fillRect(x + 18 * p, y + 26 * p, 6 * p, 6 * p);
    // Ground shake effect
    ctx.fillStyle = 'rgba(139,105,20,0.1)'; ctx.fillRect(x + 2 * p, y + 30 * p, 28 * p, 2 * p);
  }

  // ✨ ELEMENTAL BOSS — Abstract energy being
  static drawBossElemental(ctx, x, y, s, pet) {
    const p = s / 32; const el = pet.element || 'ice';
    const pal = this.BOSS_PALETTES[el] || this.BOSS_PALETTES.ice;
    const c = pal;
    // Core glow
    ctx.globalAlpha = 0.2; ctx.fillStyle = c.light;
    ctx.beginPath(); ctx.arc(x + 16 * p, y + 16 * p, 16 * p, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.4; ctx.beginPath(); ctx.arc(x + 16 * p, y + 16 * p, 11 * p, 0, Math.PI * 2); ctx.fill();
    // Floating body (crystal shape)
    ctx.globalAlpha = 0.9; ctx.fillStyle = c.body;
    ctx.beginPath(); ctx.moveTo(x + 16 * p, y + 3 * p); ctx.lineTo(x + 27 * p, y + 16 * p); ctx.lineTo(x + 16 * p, y + 29 * p); ctx.lineTo(x + 5 * p, y + 16 * p); ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.light;
    ctx.beginPath(); ctx.moveTo(x + 16 * p, y + 6 * p); ctx.lineTo(x + 24 * p, y + 16 * p); ctx.lineTo(x + 16 * p, y + 26 * p); ctx.lineTo(x + 8 * p, y + 16 * p); ctx.closePath(); ctx.fill();
    // Inner core
    ctx.fillStyle = '#FFF'; ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.arc(x + 16 * p, y + 16 * p, 4 * p, 0, Math.PI * 2); ctx.fill();
    // Floating particles
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 6; i++) {
      const angle = i * 1.05 + Date.now() * 0.001;
      const dist = 10 + Math.sin(i * 2 + Date.now() * 0.002) * 4;
      ctx.fillStyle = c.eye;
      ctx.fillRect(x + 16 * p + Math.cos(angle) * dist * p - 1 * p, y + 16 * p + Math.sin(angle) * dist * p - 1 * p, 2 * p, 2 * p);
    }
    ctx.globalAlpha = 1;
  }

  // 🐺 BEAST BOSS — Wolf-like predator
  static drawBossBeast(ctx, x, y, s, pet) {
    const p = s / 32; const el = pet.element || 'fire';
    const pal = this.BOSS_PALETTES[el] || this.BOSS_PALETTES.fire;
    const c = pal;
    // Body
    ctx.fillStyle = c.body; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 18 * p, 10 * p, 8 * p, 0, 0, Math.PI * 2); ctx.fill();
    // Head
    ctx.fillStyle = c.dark; ctx.beginPath(); ctx.arc(x + 16 * p, y + 8 * p, 7 * p, 0, Math.PI * 2); ctx.fill();
    // Snout
    ctx.fillStyle = c.body; ctx.fillRect(x + 11 * p, y + 10 * p, 10 * p, 5 * p);
    // Eyes (fierce)
    ctx.fillStyle = c.eye; ctx.fillRect(x + 10 * p, y + 5 * p, 3 * p, 2 * p); ctx.fillRect(x + 19 * p, y + 5 * p, 3 * p, 2 * p);
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 11 * p, y + 5 * p, 1 * p, 1 * p); ctx.fillRect(x + 20 * p, y + 5 * p, 1 * p, 1 * p);
    // Ears (pointed)
    ctx.fillStyle = c.dark; ctx.beginPath(); ctx.moveTo(x + 9 * p, y + 4 * p); ctx.lineTo(x + 7 * p, y - 2 * p); ctx.lineTo(x + 12 * p, y + 2 * p); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 23 * p, y + 4 * p); ctx.lineTo(x + 25 * p, y - 2 * p); ctx.lineTo(x + 20 * p, y + 2 * p); ctx.fill();
    // Mouth with fangs
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 13 * p, y + 13 * p, 2 * p, 2 * p); ctx.fillRect(x + 17 * p, y + 13 * p, 2 * p, 2 * p);
    ctx.fillStyle = '#333'; ctx.fillRect(x + 12 * p, y + 12 * p, 8 * p, 1 * p);
    // Mane
    ctx.fillStyle = c.dark; ctx.beginPath(); ctx.arc(x + 8 * p, y + 10 * p, 4 * p, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 24 * p, y + 10 * p, 4 * p, 0, Math.PI * 2); ctx.fill();
    // Legs
    ctx.fillStyle = c.dark; ctx.fillRect(x + 7 * p, y + 24 * p, 5 * p, 6 * p); ctx.fillRect(x + 20 * p, y + 24 * p, 5 * p, 6 * p);
    // Tail
    ctx.fillStyle = c.body; ctx.beginPath(); ctx.moveTo(x + 26 * p, y + 16 * p); ctx.quadraticCurveTo(x + 34 * p, y + 10 * p, x + 30 * p, y + 18 * p); ctx.lineWidth = 3 * p; ctx.stroke();
    // Claws
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 7 * p, y + 28 * p, 2 * p, 2 * p); ctx.fillRect(x + 10 * p, y + 28 * p, 2 * p, 2 * p);
    ctx.fillRect(x + 20 * p, y + 28 * p, 2 * p, 2 * p); ctx.fillRect(x + 23 * p, y + 28 * p, 2 * p, 2 * p);
  }

  // 👿 DEMON BOSS — Horned fiend
  static drawBossDemon(ctx, x, y, s, pet) {
    const p = s / 32; const el = pet.element || 'fire';
    const pal = this.BOSS_PALETTES[el] || this.BOSS_PALETTES.fire;
    const c = pal;
    // Body
    ctx.fillStyle = c.dark; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 18 * p, 9 * p, 10 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.body; ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 16 * p, 7 * p, 8 * p, 0, 0, Math.PI * 2); ctx.fill();
    // Head
    ctx.fillStyle = c.dark; ctx.beginPath(); ctx.arc(x + 16 * p, y + 6 * p, 7 * p, 0, Math.PI * 2); ctx.fill();
    // Horns (large, curved)
    ctx.fillStyle = c.light; ctx.beginPath(); ctx.moveTo(x + 10 * p, y + 2 * p); ctx.quadraticCurveTo(x + 6 * p, y - 6 * p, x + 12 * p, y + 1 * p); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 22 * p, y + 2 * p); ctx.quadraticCurveTo(x + 26 * p, y - 6 * p, x + 20 * p, y + 1 * p); ctx.fill();
    // Eyes
    ctx.fillStyle = c.eye; ctx.fillRect(x + 11 * p, y + 3 * p, 3 * p, 3 * p); ctx.fillRect(x + 18 * p, y + 3 * p, 3 * p, 3 * p);
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 12 * p, y + 3 * p, 1 * p, 1 * p); ctx.fillRect(x + 19 * p, y + 3 * p, 1 * p, 1 * p);
    // Mouth
    ctx.fillStyle = '#333'; ctx.fillRect(x + 12 * p, y + 8 * p, 8 * p, 3 * p);
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 13 * p, y + 8 * p, 2 * p, 2 * p); ctx.fillRect(x + 17 * p, y + 8 * p, 2 * p, 2 * p);
    // Wings (bat-like)
    ctx.fillStyle = c.dark; ctx.beginPath(); ctx.moveTo(x + 5 * p, y + 12 * p); ctx.quadraticCurveTo(x - 4 * p, y + 2 * p, x + 1 * p, y + 18 * p); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 27 * p, y + 12 * p); ctx.quadraticCurveTo(x + 36 * p, y + 2 * p, x + 31 * p, y + 18 * p); ctx.fill();
    // Tail (pointed)
    ctx.fillStyle = c.dark; ctx.beginPath(); ctx.moveTo(x + 22 * p, y + 26 * p); ctx.quadraticCurveTo(x + 28 * p, y + 30 * p, x + 26 * p, y + 32 * p); ctx.lineWidth = 2 * p; ctx.stroke();
    ctx.fillStyle = c.eye; ctx.beginPath(); ctx.arc(x + 26 * p, y + 32 * p, 2 * p, 0, Math.PI * 2); ctx.fill();
    // Legs
    ctx.fillStyle = c.dark; ctx.fillRect(x + 9 * p, y + 26 * p, 5 * p, 6 * p); ctx.fillRect(x + 18 * p, y + 26 * p, 5 * p, 6 * p);
    // Hooves
    ctx.fillStyle = '#333'; ctx.fillRect(x + 8 * p, y + 30 * p, 7 * p, 2 * p); ctx.fillRect(x + 17 * p, y + 30 * p, 7 * p, 2 * p);
  }

  // 🔮 MYSTIC BOSS — Ethereal being
  static drawBossMystic(ctx, x, y, s, pet) {
    const p = s / 32; const el = pet.element || 'thunder';
    const pal = this.BOSS_PALETTES[el] || this.BOSS_PALETTES.thunder;
    const c = pal;
    // Ethereal glow
    ctx.globalAlpha = 0.15; ctx.fillStyle = c.light;
    ctx.beginPath(); ctx.arc(x + 16 * p, y + 16 * p, 18 * p, 0, Math.PI * 2); ctx.fill();
    // Floating robe body
    ctx.globalAlpha = 0.85; ctx.fillStyle = c.body;
    ctx.beginPath(); ctx.moveTo(x + 6 * p, y + 8 * p); ctx.quadraticCurveTo(x + 4 * p, y + 20 * p, x + 6 * p, y + 30 * p); ctx.lineTo(x + 26 * p, y + 30 * p); ctx.quadraticCurveTo(x + 28 * p, y + 20 * p, x + 26 * p, y + 8 * p); ctx.closePath(); ctx.fill();
    // Head
    ctx.fillStyle = c.light; ctx.beginPath(); ctx.arc(x + 16 * p, y + 5 * p, 6 * p, 0, Math.PI * 2); ctx.fill();
    // Hood
    ctx.fillStyle = c.dark; ctx.beginPath(); ctx.moveTo(x + 8 * p, y + 10 * p); ctx.quadraticCurveTo(x + 16 * p, y - 2 * p, x + 24 * p, y + 10 * p); ctx.fill();
    // Eyes (glowing)
    ctx.fillStyle = c.eye; ctx.fillRect(x + 11 * p, y + 3 * p, 3 * p, 2 * p); ctx.fillRect(x + 18 * p, y + 3 * p, 3 * p, 2 * p);
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 12 * p, y + 3 * p, 1 * p, 1 * p); ctx.fillRect(x + 19 * p, y + 3 * p, 1 * p, 1 * p);
    // Mystic staff
    ctx.fillStyle = c.dark; ctx.fillRect(x + 26 * p, y + 6 * p, 2 * p, 22 * p);
    ctx.fillStyle = c.eye; ctx.beginPath(); ctx.arc(x + 27 * p, y + 5 * p, 3 * p, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.6; ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(x + 27 * p, y + 5 * p, 1 * p, 0, Math.PI * 2); ctx.fill();
    // Floating orbs
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < 3; i++) {
      const angle = i * 2.1 + Date.now() * 0.001;
      ctx.fillStyle = c.light;
      ctx.beginPath(); ctx.arc(x + 10 * p + Math.cos(angle) * 5 * p, y + 16 * p + Math.sin(angle) * 3 * p, 2 * p, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // 🌑 CHAOS BOSS — Void/shadow entity
  static drawBossChaos(ctx, x, y, s, pet) {
    const p = s / 32; const el = pet.element || 'poison';
    const pal = this.BOSS_PALETTES[el] || this.BOSS_PALETTES.poison;
    const c = pal;
    // Dark aura
    ctx.globalAlpha = 0.2; ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(x + 16 * p, y + 16 * p, 18 * p, 0, Math.PI * 2); ctx.fill();
    // Unstable body (dark cloud with tentacles)
    ctx.globalAlpha = 0.8; ctx.fillStyle = c.dark;
    ctx.beginPath(); ctx.arc(x + 16 * p, y + 16 * p, 10 * p, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.body;
    ctx.beginPath(); ctx.arc(x + 16 * p, y + 16 * p, 7 * p, 0, Math.PI * 2); ctx.fill();
    // One big eye
    ctx.fillStyle = c.eye; ctx.beginPath(); ctx.arc(x + 16 * p, y + 14 * p, 4 * p, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(x + 16 * p, y + 14 * p, 2 * p, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(x + 16 * p, y + 14 * p, 1 * p, 0, Math.PI * 2); ctx.fill();
    // Tentacles
    ctx.strokeStyle = c.dark; ctx.lineWidth = 2 * p;
    for (let i = 0; i < 5; i++) {
      const angle = i * 1.3;
      ctx.beginPath(); ctx.moveTo(x + 16 * p, y + 22 * p);
      ctx.quadraticCurveTo(
        x + 16 * p + Math.cos(angle) * 12 * p, y + 28 * p + Math.sin(angle) * 6 * p,
        x + 16 * p + Math.cos(angle) * 8 * p, y + 32 * p
      );
      ctx.stroke();
    }
    // Mouth
    ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(x + 16 * p, y + 20 * p, 3 * p, 0, Math.PI * 2); ctx.fill();
    // Rift lines
    ctx.strokeStyle = c.light; ctx.lineWidth = 1; ctx.globalAlpha = 0.3;
    ctx.beginPath(); ctx.moveTo(x + 6 * p, y + 6 * p); ctx.lineTo(x + 10 * p, y + 10 * p); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 26 * p, y + 6 * p); ctx.lineTo(x + 22 * p, y + 10 * p); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // 🌳 PLANT BOSS — Treant/flower
  static drawBossPlant(ctx, x, y, s, pet) {
    const p = s / 32; const el = pet.element || 'wood';
    const pal = this.BOSS_PALETTES[el] || this.BOSS_PALETTES.wood;
    const c = pal;
    // Trunk body
    ctx.fillStyle = c.dark; ctx.fillRect(x + 10 * p, y + 10 * p, 12 * p, 16 * p);
    ctx.fillStyle = c.body; ctx.fillRect(x + 12 * p, y + 12 * p, 8 * p, 12 * p);
    // Roots
    ctx.strokeStyle = c.dark; ctx.lineWidth = 2 * p;
    ctx.beginPath(); ctx.moveTo(x + 10 * p, y + 26 * p); ctx.quadraticCurveTo(x + 3 * p, y + 30 * p, x + 6 * p, y + 32 * p); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 22 * p, y + 26 * p); ctx.quadraticCurveTo(x + 29 * p, y + 30 * p, x + 26 * p, y + 32 * p); ctx.stroke();
    // Canopy (leaves)
    ctx.fillStyle = c.body; ctx.beginPath(); ctx.arc(x + 16 * p, y + 6 * p, 9 * p, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.light; ctx.beginPath(); ctx.arc(x + 12 * p, y + 4 * p, 5 * p, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 20 * p, y + 5 * p, 4 * p, 0, Math.PI * 2); ctx.fill();
    // Face on trunk
    ctx.fillStyle = c.eye; ctx.fillRect(x + 12 * p, y + 14 * p, 2 * p, 2 * p); ctx.fillRect(x + 18 * p, y + 14 * p, 2 * p, 2 * p);
    ctx.fillStyle = '#333'; ctx.fillRect(x + 12 * p, y + 14 * p, 1 * p, 1 * p); ctx.fillRect(x + 18 * p, y + 14 * p, 1 * p, 1 * p);
    // Mouth
    ctx.fillStyle = c.dark; ctx.fillRect(x + 13 * p, y + 18 * p, 6 * p, 2 * p);
    // Branches
    ctx.strokeStyle = c.dark; ctx.lineWidth = 2 * p;
    ctx.beginPath(); ctx.moveTo(x + 8 * p, y + 14 * p); ctx.quadraticCurveTo(x, y + 10 * p, x + 2 * p, y + 6 * p); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 24 * p, y + 14 * p); ctx.quadraticCurveTo(x + 32 * p, y + 10 * p, x + 30 * p, y + 6 * p); ctx.stroke();
    // Leaves on branches
    ctx.fillStyle = c.light; ctx.beginPath(); ctx.ellipse(x + 2 * p, y + 5 * p, 3 * p, 2 * p, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 30 * p, y + 5 * p, 3 * p, 2 * p, -0.3, 0, Math.PI * 2); ctx.fill();
  }

  // 👼 GOD BOSS — Divine being
  static drawBossGod(ctx, x, y, s, pet) {
    const p = s / 32; const el = pet.element || 'thunder';
    const pal = this.BOSS_PALETTES[el] || this.BOSS_PALETTES.thunder;
    const c = pal;
    // Divine aura (multiple rings)
    ctx.globalAlpha = 0.12;
    for (let ring = 0; ring < 3; ring++) {
      ctx.fillStyle = c.light;
      ctx.beginPath(); ctx.arc(x + 16 * p, y + 14 * p, 14 * p + ring * 5 * p, 0, Math.PI * 2); ctx.fill();
    }
    // Body
    ctx.globalAlpha = 0.9; ctx.fillStyle = c.body;
    ctx.beginPath(); ctx.ellipse(x + 16 * p, y + 18 * p, 8 * p, 10 * p, 0, 0, Math.PI * 2); ctx.fill();
    // Head with halo
    ctx.fillStyle = c.light; ctx.beginPath(); ctx.arc(x + 16 * p, y + 6 * p, 6 * p, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.dark; ctx.beginPath(); ctx.arc(x + 16 * p, y + 6 * p, 5 * p, 0, Math.PI * 2); ctx.fill();
    // Halo ring
    ctx.strokeStyle = c.eye; ctx.lineWidth = 1.5 * p; ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.arc(x + 16 * p, y + 6 * p, 9 * p, 0, Math.PI * 2); ctx.stroke();
    // Eyes (kind but powerful)
    ctx.globalAlpha = 0.9; ctx.fillStyle = c.eye;
    ctx.fillRect(x + 11 * p, y + 4 * p, 3 * p, 2 * p); ctx.fillRect(x + 18 * p, y + 4 * p, 3 * p, 2 * p);
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 12 * p, y + 4 * p, 1 * p, 1 * p); ctx.fillRect(x + 19 * p, y + 4 * p, 1 * p, 1 * p);
    // Wings (angelic)
    ctx.fillStyle = c.light; ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.moveTo(x + 2 * p, y + 12 * p); ctx.quadraticCurveTo(x - 6 * p, y + 4 * p, x + 6 * p, y + 8 * p); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 30 * p, y + 12 * p); ctx.quadraticCurveTo(x + 38 * p, y + 4 * p, x + 26 * p, y + 8 * p); ctx.fill();
    // Robe
    ctx.globalAlpha = 0.85; ctx.fillStyle = c.body;
    ctx.beginPath(); ctx.moveTo(x + 8 * p, y + 14 * p); ctx.quadraticCurveTo(x + 6 * p, y + 24 * p, x + 10 * p, y + 30 * p); ctx.lineTo(x + 22 * p, y + 30 * p); ctx.quadraticCurveTo(x + 26 * p, y + 24 * p, x + 24 * p, y + 14 * p); ctx.closePath(); ctx.fill();
    ctx.fillStyle = c.dark; ctx.fillRect(x + 12 * p, y + 24 * p, 8 * p, 2 * p);
    ctx.globalAlpha = 1;
  }

  // Boss color palettes per element
  static get BOSS_PALETTES() {
    return {
      fire:    { body:'#CC3300', dark:'#882200', light:'#FF6633', eye:'#FFD700' },
      ice:     { body:'#4DB6C4', dark:'#2C8A96', light:'#80DEEA', eye:'#FFFFFF' },
      wood:    { body:'#388E3C', dark:'#1B5E20', light:'#66BB6A', eye:'#A5D6A7' },
      water:   { body:'#0066CC', dark:'#003D82', light:'#00AAFF', eye:'#88DDFF' },
      earth:   { body:'#6D4C14', dark:'#3D2808', light:'#8B6914', eye:'#C4A950' },
      thunder: { body:'#CCA800', dark:'#8A7000', light:'#FFD700', eye:'#FFFFFF' },
      poison:  { body:'#6C3586', dark:'#3A1A4A', light:'#9B59B6', eye:'#DD99FF' },
      storm:   { body:'#0097A7', dark:'#005662', light:'#4DD0E1', eye:'#E0F7FA' },
      default: { body:'#666',    dark:'#333',    light:'#999',    eye:'#FFF' }
    };
  }

  static drawBattleScene(ctx, battle) {
    ctx.clearRect(0, 0, this.SCENE_WIDTH, this.SCENE_HEIGHT);
    this.drawBackground(ctx);

    if (!battle || battle.state === 'idle') return;

    const centerX = this.SCENE_WIDTH / 2;
    const groundY = Math.floor(this.SCENE_HEIGHT * 0.65);
    const t = Date.now() * 0.001;

    // VS button with glow
    ctx.save();
    const vsPulse = 0.8 + Math.sin(t * 3) * 0.2;
    ctx.globalAlpha = vsPulse;
    const vsGrad = ctx.createRadialGradient(centerX, groundY - 30, 2, centerX, groundY - 30, 22);
    vsGrad.addColorStop(0, 'rgba(255,215,0,0.15)');
    vsGrad.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.fillStyle = vsGrad;
    ctx.beginPath();
    ctx.arc(centerX, groundY - 30, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(255,215,0,0.4)';
    ctx.shadowBlur = 8;
    ctx.fillText('VS', centerX, groundY - 28);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2.5;
    ctx.strokeText('VS', centerX, groundY - 28);
    ctx.restore();

    // Draw player team (left side)
    const team1 = battle.team1 || [];
    const pCount = team1.length;
    for (let i = 0; i < pCount; i++) {
      const pet = team1[i];
      if (!pet || pet.hp <= 0) continue;
      const px = 60 + i * 50;
      const py = groundY - 5;
      const isBoss = pet.isBoss || false;
      this.drawCharacter(ctx, pet, px, py, 0.7, isBoss);
      this.drawHPBar(ctx, px - 20, py - 45, 40, 5, pet.hp, pet.maxHp);
      ctx.fillStyle = '#FFF';
      ctx.font = '7px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 3;
      ctx.fillText(`${pet.emoji || pet.name} Lv.${pet.level}`, px, py - 50);
      ctx.shadowBlur = 0;
    }

    // Draw enemy team (right side)
    const team2 = battle.team2 || [];
    const eCount = team2.length;
    for (let i = 0; i < eCount; i++) {
      const pet = team2[i];
      if (!pet || pet.hp <= 0) continue;
      const ex = this.SCENE_WIDTH - 60 - i * 50;
      const ey = groundY - 5;
      const isBoss = pet.isBoss || false;
      const scale = isBoss ? 1.0 : 0.7;
      this.drawCharacter(ctx, pet, ex, ey, scale, isBoss, 0, true);
      this.drawHPBar(ctx, ex - 20, ey - 45, 40, 5, pet.hp, pet.maxHp);
      ctx.fillStyle = '#FFF';
      ctx.font = '7px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 3;
      const label = isBoss ? `👑 ${pet.name}` : `${pet.emoji || pet.name} Lv.${pet.level}`;
      ctx.fillText(label, ex, ey - 50);
      ctx.shadowBlur = 0;
    }

    // Turn counter with style
    if (battle.turn) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(this.SCENE_WIDTH - 82, 5, 77, 22);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(this.SCENE_WIDTH - 82, 5, 77, 22);
      ctx.fillStyle = '#FFF';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`⏱ Lượt ${battle.turn}`, this.SCENE_WIDTH - 76, 19);
    }
  }

  static drawHPBar(ctx, x, y, w, h, current, max) {
    const pct = Math.max(0, current / max);
    const color = pct > 0.5 ? '#2ECC71' : pct > 0.25 ? '#F39C12' : '#E74C3C';
    // Background shadow
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
    // HP fill with gradient
    ctx.fillStyle = color;
    ctx.fillRect(x, y, Math.floor(w * pct), h);
    // HP shine
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(x, y, Math.floor(w * pct), Math.floor(h * 0.4));
    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x - 1, y - 1, w + 2, h + 2);
  }

  static drawEffect(ctx, type, x, y, frame = 0) {
    switch (type) {
      case 'attack': {
        const len = 5 + frame * 2;
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - len, y - len);
        ctx.lineTo(x + len, y + len);
        ctx.moveTo(x + len, y - len);
        ctx.lineTo(x - len, y + len);
        ctx.stroke();
        break;
      }
      case 'heal': {
        ctx.fillStyle = `rgba(46, 204, 113, ${0.5 - frame * 0.05})`;
        ctx.beginPath();
        ctx.arc(x, y, 8 + frame * 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'crit': {
        ctx.fillStyle = '#FFD700';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('💥', x, y - frame * 2);
        break;
      }
    }
  }

  static drawPlayer(ctx, x, y, scale, color, emoji, walkPhase, flipX = false) {
    if (flipX) { ctx.save(); ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); }

    const s = 24 * scale;
    const cx = x - s / 2;
    const cy = y - s;
    const wp = walkPhase || 0;
    const legMove = Math.sin(wp) * 2.5;
    const legMove2 = Math.sin(wp + Math.PI) * 2.5;
    // Shadow (stretches with walk)
    const shadowW = s * 0.35 + Math.abs(Math.sin(wp * 1.5)) * s * 0.05;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(x, y + 3, shadowW, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    // Legs with walk animation
    ctx.fillStyle = '#3a3a5c';
    ctx.fillRect(cx + s * 0.2, cy + s * 0.68 + legMove, s * 0.16, s * 0.26);
    ctx.fillRect(cx + s * 0.55, cy + s * 0.68 + legMove2, s * 0.16, s * 0.26);
    // Shoes (follow legs)
    ctx.fillStyle = '#2a2a3c';
    ctx.fillRect(cx + s * 0.16, cy + s * 0.88 + legMove, s * 0.24, s * 0.08);
    ctx.fillRect(cx + s * 0.52, cy + s * 0.88 + legMove2, s * 0.24, s * 0.08);
    // Foot dust
    if (wp !== 0) {
      const dustPhase = Math.sin(wp * 2);
      if (Math.abs(dustPhase) > 0.85) {
        ctx.fillStyle = 'rgba(200,180,160,0.1)';
        ctx.beginPath();
        ctx.arc(cx + s * 0.32 + Math.sin(wp * 3) * 2, cy + s * 0.92, s * 0.08, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Body (torso) with gradient
    ctx.fillStyle = color || '#66BB6A';
    ctx.fillRect(cx + s * 0.14, cy + s * 0.22, s * 0.64, s * 0.5);
    // Shirt detail — collar
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(cx + s * 0.3, cy + s * 0.22, s * 0.32, s * 0.06);
    // Shirt highlight
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(cx + s * 0.18, cy + s * 0.3, s * 0.18, s * 0.4);
    // Belt
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(cx + s * 0.14, cy + s * 0.63, s * 0.64, s * 0.06);
    ctx.fillStyle = '#D4A017';
    ctx.fillRect(cx + s * 0.43, cy + s * 0.63, s * 0.06, s * 0.06);
    // Arms (slightly angled out)
    ctx.fillStyle = color || '#66BB6A';
    ctx.fillRect(cx - s * 0.04, cy + s * 0.28, s * 0.18, s * 0.34);
    ctx.fillRect(cx + s * 0.78, cy + s * 0.28, s * 0.18, s * 0.34);
    // Hands
    ctx.fillStyle = '#FFDDBB';
    ctx.fillRect(cx - s * 0.02, cy + s * 0.56, s * 0.2, s * 0.1);
    ctx.fillRect(cx + s * 0.74, cy + s * 0.56, s * 0.2, s * 0.1);
    // Neck
    ctx.fillStyle = '#FFDDBB';
    ctx.fillRect(cx + s * 0.36, cy + s * 0.15, s * 0.2, s * 0.1);
    // Head
    ctx.fillStyle = '#FFDDBB';
    ctx.beginPath();
    ctx.arc(x, cy + s * 0.14, s * 0.24, 0, Math.PI * 2);
    ctx.fill();
    // Hair
    ctx.fillStyle = '#6B3A2A';
    ctx.beginPath();
    ctx.arc(x, cy + s * 0.08, s * 0.24, Math.PI, 0);
    ctx.fill();
    // Hair sides
    ctx.fillRect(cx + s * 0.05, cy + s * 0.08, s * 0.1, s * 0.14);
    ctx.fillRect(cx + s * 0.77, cy + s * 0.08, s * 0.1, s * 0.14);
    // Eyes
    ctx.fillStyle = '#333';
    ctx.fillRect(x - s * 0.09, cy + s * 0.12, s * 0.06, s * 0.06);
    ctx.fillRect(x + s * 0.03, cy + s * 0.12, s * 0.06, s * 0.06);
    // Eyes highlight
    ctx.fillStyle = '#FFF';
    ctx.fillRect(x - s * 0.07, cy + s * 0.105, s * 0.025, s * 0.025);
    ctx.fillRect(x + s * 0.05, cy + s * 0.105, s * 0.025, s * 0.025);
    // Eyebrows
    ctx.fillStyle = '#4A2A1A';
    ctx.fillRect(x - s * 0.1, cy + s * 0.07, s * 0.09, s * 0.02);
    ctx.fillRect(x + s * 0.01, cy + s * 0.07, s * 0.09, s * 0.02);
    // Mouth (smile)
    ctx.fillStyle = '#D4756B';
    ctx.fillRect(x - s * 0.05, cy + s * 0.21, s * 0.1, s * 0.025);
    // Cheeks (blush)
    ctx.fillStyle = 'rgba(255,150,150,0.2)';
    ctx.beginPath();
    ctx.arc(x - s * 0.12, cy + s * 0.19, s * 0.05, 0, Math.PI * 2);
    ctx.arc(x + s * 0.12, cy + s * 0.19, s * 0.05, 0, Math.PI * 2);
    ctx.fill();
    // Emoji accessory (costume icon above head)
    ctx.font = `${Math.round(s * 0.4)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji || '🧑', x, cy - s * 0.22);

    if (flipX) ctx.restore();
  }

  static animateAttack(ctx, fromX, fromY, toX, toY, progress) {
    const px = fromX + (toX - fromX) * progress;
    const py = fromY + (toY - fromY) * progress - 5 * Math.sin(progress * Math.PI);
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(px, py, 4 + (1 - progress) * 3, 0, Math.PI * 2);
    ctx.fill();
    // Trail
    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(px, py, 6 + (1 - progress) * 4, 0, Math.PI * 2);
    ctx.fill();
  }
}
