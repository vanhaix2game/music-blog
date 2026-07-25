const BTL_ELEMENT_COLORS = {
  fire:   { main:'#FF4400', light:'#FF8844', glow:'#FFD700', particle:'#FF6622', dark:'#CC2200' },
  water:  { main:'#00AAFF', light:'#44CCFF', glow:'#88DDFF', particle:'#00BBFF', dark:'#0066CC' },
  earth:  { main:'#8B6914', light:'#A08530', glow:'#C4A950', particle:'#9E7B20', dark:'#5C4508' },
  thunder:{ main:'#FFD700', light:'#FFFF44', glow:'#FFFFFF', particle:'#FFEE00', dark:'#CCA800' },
  poison: { main:'#9B59B6', light:'#BB77DD', glow:'#DD99FF', particle:'#AA66CC', dark:'#6C3586' },
  ice:    { main:'#80DEEA', light:'#B2EBF2', glow:'#FFFFFF', particle:'#99EEFF', dark:'#4DB6C4' },
  wood:   { main:'#66BB6A', light:'#A5D6A7', glow:'#C8E6C9', particle:'#77CC7A', dark:'#388E3C' },
  storm:  { main:'#4DD0E1', light:'#80DEEA', glow:'#E0F7FA', particle:'#26C6DA', dark:'#0097A7' },
  default:{ main:'#FFD700', light:'#FF8844', glow:'#FFD700', particle:'#FF9933', dark:'#CC8800' }
};

function getBtlElement(pet) {
  const elem = getPetElement(pet.baseId);
  return BTL_ELEMENT_COLORS[elem] || BTL_ELEMENT_COLORS.default;
}

function getBtlElementByEffect(effectType) {
  const map = { burn:'fire', freeze:'ice', slow:'ice', poison:'poison', stun:'thunder', root:'wood', summon:'wood', vortex:'storm', knockback:'storm' };
  return BTL_ELEMENT_COLORS[map[effectType]] || BTL_ELEMENT_COLORS.default;
}

class BattleProjectile {
  constructor(fromX, fromY, toX, toY, colors, size, element) {
    this.x = fromX;
    this.y = fromY;
    this.fromX = fromX;
    this.fromY = fromY;
    this.toX = toX;
    this.toY = toY;
    this.colors = colors;
    this.size = size || 6;
    this.progress = 0;
    this.speed = 2.5;
    this.life = 1;
    this.active = true;
    this.element = element || 'default';
    this.trail = [];
    this.spawnedChild = false;
  }

  update(dt) {
    this.progress += this.speed * dt;
    if (this.progress >= 1) {
      this.active = false;
      return false;
    }
    const t = this.progress;
    const oldX = this.x;
    const oldY = this.y;
    this.x = this.fromX + (this.toX - this.fromX) * t;
    this.y = this.fromY + (this.toY - this.fromY) * t - 8 * Math.sin(t * Math.PI);

    // Trail record
    if (this.element !== 'thunder' && this.element !== 'storm') {
      this.trail.push({ x: oldX || this.x, y: oldY || this.y, life: 0.3 });
      if (this.trail.length > 8) this.trail.shift();
    }
    for (const t of this.trail) t.life -= dt;
    this.trail = this.trail.filter(t => t.life > 0);
    return true;
  }

  draw(ctx) {
    const t = this.progress;
    const alpha = t < 0.1 ? t * 10 : (t > 0.7 ? (1 - t) / 0.3 : 1);

    switch (this.element) {
      case 'fire': this.drawFire(ctx, t, alpha); break;
      case 'ice': this.drawIce(ctx, t, alpha); break;
      case 'wood': this.drawWood(ctx, t, alpha); break;
      case 'thunder': this.drawThunder(ctx, t, alpha); break;
      case 'poison': this.drawPoison(ctx, t, alpha); break;
      case 'water': this.drawWater(ctx, t, alpha); break;
      case 'earth': this.drawEarth(ctx, t, alpha); break;
      case 'storm': this.drawStorm(ctx, t, alpha); break;
      default: this.drawDefault(ctx, t, alpha); break;
    }
  }

  // 🔥 FIRE: Fireball with sparks and explosion trail
  drawFire(ctx, t, alpha) {
    const r = this.size * (1 + t * 0.6);
    // Outer flame glow
    ctx.globalAlpha = alpha * 0.25;
    ctx.fillStyle = this.colors.glow;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r + 6, 0, Math.PI * 2);
    ctx.fill();
    // Multiple flame layers
    const layers = [
      { r: r + 2, c: this.colors.dark, a: 0.4 },
      { r: r, c: this.colors.main, a: 0.8 },
      { r: r * 0.6, c: this.colors.light, a: 0.9 },
      { r: r * 0.3, c: '#FFF', a: 0.7 }
    ];
    for (const layer of layers) {
      ctx.globalAlpha = alpha * layer.a;
      ctx.fillStyle = layer.c;
      ctx.beginPath();
      const ox = (Math.random() - 0.5) * 1.5;
      const oy = (Math.random() - 0.5) * 1.5;
      ctx.arc(this.x + ox, this.y + oy, layer.r, 0, Math.PI * 2);
      ctx.fill();
    }
    // Sparks flying off
    ctx.globalAlpha = alpha * 0.6;
    for (let i = 0; i < 3; i++) {
      const angle = t * 15 + i * 2.1;
      const dist = r * 1.2 + Math.sin(t * 20 + i) * 4;
      ctx.fillStyle = this.colors.particle;
      ctx.fillRect(
        this.x + Math.cos(angle) * dist - 1,
        this.y + Math.sin(angle) * dist - 1, 2, 2
      );
    }
    // Trail (flame streaks)
    ctx.globalAlpha = alpha * 0.15;
    for (let i = 0; i < this.trail.length; i++) {
      const tr = this.trail[i];
      ctx.fillStyle = this.colors.light;
      const sz = this.size * 0.5 * (tr.life / 0.3);
      ctx.beginPath();
      ctx.arc(tr.x, tr.y, sz, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ❄️ ICE: Crystal shard with frost particles
  drawIce(ctx, t, alpha) {
    const size = this.size * (0.8 + t * 0.3);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(t * 3 + Math.PI / 4);

    // Crystal glow
    ctx.globalAlpha = alpha * 0.3;
    ctx.fillStyle = this.colors.glow;
    ctx.beginPath();
    ctx.arc(0, 0, size + 5, 0, Math.PI * 2);
    ctx.fill();

    // Ice shard (diamond shape)
    ctx.globalAlpha = alpha * 0.8;
    ctx.fillStyle = this.colors.main;
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.5);
    ctx.lineTo(size * 0.6, 0);
    ctx.lineTo(0, size * 1.5);
    ctx.lineTo(-size * 0.6, 0);
    ctx.closePath();
    ctx.fill();

    // Inner crystal
    ctx.fillStyle = this.colors.light;
    ctx.globalAlpha = alpha * 0.6;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.9);
    ctx.lineTo(size * 0.35, 0);
    ctx.lineTo(0, size * 0.9);
    ctx.lineTo(-size * 0.35, 0);
    ctx.closePath();
    ctx.fill();

    // Core light
    ctx.fillStyle = '#FFF';
    ctx.globalAlpha = alpha * 0.5;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Frost trail
    ctx.globalAlpha = alpha * 0.12;
    for (let i = 0; i < this.trail.length; i++) {
      const tr = this.trail[i];
      ctx.fillStyle = this.colors.glow;
      const sz = this.size * 0.6 * (tr.life / 0.3);
      ctx.fillRect(tr.x - sz/2, tr.y - sz/2, sz, sz);
    }
    ctx.globalAlpha = 1;
  }

  // 🌿 WOOD: Vine whip with leaves
  drawWood(ctx, t, alpha) {
    const r = this.size * (1 - t * 0.3);
    // Vine arc
    ctx.globalAlpha = alpha * 0.7;
    ctx.strokeStyle = this.colors.dark;
    ctx.lineWidth = 3;
    ctx.beginPath();
    const midX = (this.fromX + this.toX) / 2;
    const midY = Math.min(this.fromY, this.toY) - 30;
    ctx.moveTo(this.fromX, this.fromY);
    ctx.quadraticCurveTo(midX, midY, this.x, this.y);
    ctx.stroke();

    // Vine light overlay
    ctx.strokeStyle = this.colors.main;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.fromX, this.fromY);
    ctx.quadraticCurveTo(midX, midY, this.x, this.y);
    ctx.stroke();

    // Leaf at projectile position
    ctx.globalAlpha = alpha * 0.8;
    ctx.fillStyle = this.colors.light;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, r * 0.7, r * 0.4, t * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.colors.main;
    ctx.beginPath();
    ctx.ellipse(this.x - 1, this.y - 1, r * 0.4, r * 0.25, t * 2, 0, Math.PI * 2);
    ctx.fill();

    // Vine particles
    ctx.globalAlpha = alpha * 0.2;
    for (let i = 0; i < this.trail.length; i++) {
      const tr = this.trail[i];
      ctx.fillStyle = this.colors.particle;
      ctx.fillRect(tr.x - 1, tr.y, 2, 3 + Math.sin(i) * 2);
    }
    ctx.globalAlpha = 1;
  }

  // ⚡ THUNDER: Jagged lightning bolt
  drawThunder(ctx, t, alpha) {
    const boltSegments = 6;
    const boltLen = Math.sqrt(
      (this.toX - this.fromX) ** 2 + (this.toY - this.fromY) ** 2
    );
    const angle = Math.atan2(this.toY - this.fromY, this.toX - this.fromX);
    const segLen = boltLen / boltSegments * t;

    ctx.save();
    ctx.translate(this.fromX, this.fromY);
    ctx.rotate(angle);

    // Lightning bolt
    ctx.globalAlpha = alpha * 0.9;
    let points = [{ x: 0, y: 0 }];
    for (let i = 1; i <= boltSegments; i++) {
      const p = i / boltSegments;
      if (p > t) break;
      const x = segLen * i * (1 / t);
      const y = (Math.random() - 0.5) * 12 * (1 - p * 0.5);
      points.push({ x, y });
    }

    // Glow behind bolt
    ctx.strokeStyle = this.colors.glow;
    ctx.lineWidth = 6;
    ctx.globalAlpha = alpha * 0.3;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Main bolt
    ctx.strokeStyle = this.colors.main;
    ctx.lineWidth = 3;
    ctx.globalAlpha = alpha * 0.9;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Core white
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = alpha * 0.7;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Electric sparks around
    ctx.globalAlpha = alpha * 0.4;
    for (let i = 0; i < 4; i++) {
      const sp = points[Math.floor(Math.random() * points.length)];
      if (!sp) continue;
      ctx.fillStyle = '#FFF';
      ctx.fillRect(
        sp.x + (Math.random() - 0.5) * 8,
        sp.y + (Math.random() - 0.5) * 8,
        1 + Math.random() * 2, 1 + Math.random() * 2
      );
    }

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  // ☠️ POISON: Gas cloud expanding
  drawPoison(ctx, t, alpha) {
    const r = this.size * (1 + t * 1.0);
    // Gas cloud (multiple overlapping circles)
    const cloudAlpha = alpha * (1 - t * 0.3);
    ctx.globalAlpha = cloudAlpha * 0.2;
    ctx.fillStyle = this.colors.main;
    for (let i = 0; i < 5; i++) {
      const ox = Math.cos(i * 1.3 + t * 2) * r * 0.4;
      const oy = Math.sin(i * 1.3 + t * 2) * r * 0.4;
      ctx.beginPath();
      ctx.arc(this.x + ox, this.y + oy, r * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
    // Core cloud
    ctx.globalAlpha = cloudAlpha * 0.3;
    ctx.fillStyle = this.colors.main;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
    // Inner glow
    ctx.globalAlpha = cloudAlpha * 0.2;
    ctx.fillStyle = this.colors.glow;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
    // Bubbles
    ctx.globalAlpha = cloudAlpha * 0.4;
    for (let i = 0; i < 3; i++) {
      const bx = this.x + Math.cos(t * 4 + i * 2) * r * 0.5;
      const by = this.y + Math.sin(t * 3 + i * 2) * r * 0.5;
      ctx.fillStyle = this.colors.light;
      ctx.beginPath();
      ctx.arc(bx, by, 2 + Math.sin(t * 5 + i) * 1, 0, Math.PI * 2);
      ctx.fill();
    }
    // Toxic trail
    ctx.globalAlpha = alpha * 0.1;
    for (let i = 0; i < this.trail.length; i++) {
      const tr = this.trail[i];
      ctx.fillStyle = this.colors.particle;
      ctx.beginPath();
      ctx.arc(tr.x, tr.y, this.size * 0.3 * (tr.life / 0.3), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // 💧 WATER: Wave stream
  drawWater(ctx, t, alpha) {
    const r = this.size * (0.8 + t * 0.3);
    // Water drop shape
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(t * 2);

    // Outer glow
    ctx.globalAlpha = alpha * 0.2;
    ctx.fillStyle = this.colors.glow;
    ctx.beginPath();
    ctx.arc(0, 0, r + 4, 0, Math.PI * 2);
    ctx.fill();

    // Main water drop
    ctx.globalAlpha = alpha * 0.7;
    ctx.fillStyle = this.colors.main;
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.3);
    ctx.quadraticCurveTo(r * 0.8, -r * 0.3, r * 0.7, r * 0.4);
    ctx.quadraticCurveTo(0, r * 0.9, -r * 0.7, r * 0.4);
    ctx.quadraticCurveTo(-r * 0.8, -r * 0.3, 0, -r * 1.3);
    ctx.closePath();
    ctx.fill();

    // Inner shine
    ctx.fillStyle = this.colors.light;
    ctx.globalAlpha = alpha * 0.5;
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.2, r * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Splash trail
    ctx.globalAlpha = alpha * 0.1;
    for (let i = 0; i < this.trail.length; i++) {
      const tr = this.trail[i];
      ctx.fillStyle = this.colors.light;
      const sz = this.size * 0.4 * (tr.life / 0.3);
      ctx.fillRect(tr.x - sz/2, tr.y - sz, sz, sz * 2);
    }
    ctx.globalAlpha = 1;
  }

  // 🪨 EARTH: Rock shard
  drawEarth(ctx, t, alpha) {
    const r = this.size * (0.9 + t * 0.2);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(t * 1.5 + 0.5);

    // Glow
    ctx.globalAlpha = alpha * 0.2;
    ctx.fillStyle = this.colors.glow;
    ctx.beginPath();
    ctx.arc(0, 0, r + 3, 0, Math.PI * 2);
    ctx.fill();

    // Rock (rough polygon)
    ctx.globalAlpha = alpha * 0.8;
    ctx.fillStyle = this.colors.main;
    const pts = 5;
    ctx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const angle = (i / pts) * Math.PI * 2;
      const rad = r * (0.7 + Math.random() * 0.3);
      if (i === 0) ctx.moveTo(Math.cos(angle) * rad, Math.sin(angle) * rad);
      else ctx.lineTo(Math.cos(angle) * rad, Math.sin(angle) * rad);
    }
    ctx.closePath();
    ctx.fill();

    // Edge highlight
    ctx.strokeStyle = this.colors.light;
    ctx.lineWidth = 1;
    ctx.globalAlpha = alpha * 0.4;
    ctx.stroke();

    ctx.restore();
    // Dust trail
    ctx.globalAlpha = alpha * 0.08;
    for (let i = 0; i < this.trail.length; i++) {
      const tr = this.trail[i];
      ctx.fillStyle = this.colors.particle;
      const sz = this.size * 0.8 * (tr.life / 0.3);
      ctx.fillRect(tr.x - sz/2, tr.y - sz/2, sz, sz);
    }
    ctx.globalAlpha = 1;
  }

  // 🌪️ STORM: Tornado vortex
  drawStorm(ctx, t, alpha) {
    const r = this.size * (0.6 + t * 0.8);
    ctx.save();
    ctx.translate(this.x, this.y);

    // Outer wind ring
    ctx.globalAlpha = alpha * 0.15;
    ctx.strokeStyle = this.colors.glow;
    ctx.lineWidth = 2;
    for (let ring = 0; ring < 3; ring++) {
      const ringR = r + ring * 6 + Math.sin(t * 8 + ring) * 3;
      ctx.beginPath();
      ctx.arc(0, 0, ringR, t * 4 + ring * 2, t * 4 + Math.PI * 1.5 + ring * 2);
      ctx.stroke();
    }

    // Spiral vortex
    ctx.globalAlpha = alpha * 0.5;
    ctx.strokeStyle = this.colors.main;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= 20; i++) {
      const p = i / 20;
      const angle = p * Math.PI * 4 + t * 6;
      const rad = r * p;
      const ox = Math.cos(angle) * rad;
      const oy = Math.sin(angle) * rad - r * 0.5 + p * r * 0.8;
      if (i === 0) ctx.moveTo(ox, oy);
      else ctx.lineTo(ox, oy);
    }
    ctx.stroke();

    // Inner wind streaks
    ctx.globalAlpha = alpha * 0.3;
    for (let i = 0; i < 5; i++) {
      const angle = t * 5 + i * 1.3;
      const dist = r * 0.5 + Math.sin(t * 3 + i * 0.7) * r * 0.3;
      ctx.fillStyle = this.colors.light;
      const sx = Math.cos(angle) * dist;
      const sy = Math.sin(angle) * dist * 0.5;
      ctx.fillRect(sx - 1.5, sy - 3, 3, 6);
    }

    // Wind particles
    ctx.globalAlpha = alpha * 0.4;
    for (let i = 0; i < 6; i++) {
      const angle = t * 3 + i * 1.05;
      const dist = r * 0.3 + Math.random() * r * 0.6;
      ctx.fillStyle = i % 2 === 0 ? this.colors.particle : '#FFF';
      ctx.fillRect(
        Math.cos(angle) * dist - 1,
        Math.sin(angle) * dist * 0.6 - 1,
        2, 2
      );
    }

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  drawDefault(ctx, t, alpha) {
    const r = this.size * (1 + t * 0.5);
    ctx.globalAlpha = alpha * 0.3;
    ctx.fillStyle = this.colors.glow;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r + 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.colors.main;
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.globalAlpha = alpha * 0.6;
    ctx.beginPath();
    ctx.arc(this.x - r * 0.2, this.y - r * 0.2, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

class StatusIcon {
  constructor(x, y, icon, color, text) {
    this.x = x;
    this.y = y;
    this.icon = icon;
    this.color = color;
    this.text = text;
    this.life = 2.5;
    this.maxLife = 2.5;
    this.vy = -20;
  }

  update(dt) {
    this.y += this.vy * dt;
    this.vy += 15 * dt;
    this.life -= dt;
    return this.life > 0;
  }

  draw(ctx) {
    const alpha = Math.min(1, this.life * 2);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.icon, this.x, this.y);
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

class EffectText {
  constructor(x, y, text, color) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.life = 0.8;
    this.maxLife = 0.8;
    this.vy = -60;
  }

  update(dt) {
    this.y += this.vy * dt;
    this.vy += 30 * dt;
    this.life -= dt;
    return this.life > 0;
  }

  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeText(this.text, this.x, this.y);
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

class AnimatedSprite {
  constructor(pet, team, x, y) {
    this.pet = pet;
    this.team = team;
    this.homeX = x;
    this.homeY = y;
    this.x = x;
    this.y = y;
    this.scale = (pet.isBoss || false) ? 1.0 : 0.75;
    this.alpha = 1;
    this.rotation = 0;
    this.flash = 0;
    this.shakeX = 0;
    this.shakeY = 0;

    this.state = 'idle';
    this.stateTime = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.bobPhase = Math.random() * Math.PI * 2;

    this.walkTargetX = x;
    this.walkTargetY = y;

    this.dead = false;
    this.fadeOutProgress = 0;

    this.hitFlashTime = 0;
  }

  update(dt) {
    this.stateTime += dt;
    this.bobPhase += dt * 3;

    if (this.dead) {
      this.fadeOutProgress = Math.min(1, this.fadeOutProgress + dt * 1.5);
      this.alpha = 1 - this.fadeOutProgress;
      this.y = this.homeY + this.fadeOutProgress * 10;
      return;
    }

    switch (this.state) {
      case 'idle':
        this.velocityX *= 0.9;
        this.velocityY *= 0.9;
        this.x += this.velocityX * dt * 60;
        this.y += this.velocityY * dt * 60;
        this.x += (this.homeX - this.x) * 0.05;
        this.y += (this.homeY - this.y) * 0.05;
        break;

      case 'walking':
        const dx = this.walkTargetX - this.x;
        const dy = this.walkTargetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 3) {
          this.x = this.walkTargetX;
          this.y = this.walkTargetY;
          this.state = 'idle';
          this.stateTime = 0;
        } else {
          const speed = 200;
          this.x += (dx / dist) * speed * dt;
          this.y += (dy / dist) * speed * dt;
        }
        break;

      case 'attacking':
        if (this.stateTime < 0.15) {
          this.rotation = -0.1 + Math.random() * 0.2;
          this.x += Math.sin(this.stateTime * 30) * 2;
        } else {
          this.rotation *= 0.9;
          this.x += (this.homeX - this.x) * 0.1;
          this.y += (this.homeY - this.y) * 0.1;
        }
        break;

      case 'hit':
        this.flash = Math.max(0, this.flash - dt * 8);
        this.shakeX = (Math.random() - 0.5) * 6 * this.flash;
        this.shakeY = (Math.random() - 0.5) * 6 * this.flash;
        if (this.flash <= 0) {
          this.state = 'idle';
          this.shakeX = 0;
          this.shakeY = 0;
        }
        break;

      case 'dying':
        this.fadeOutProgress = Math.min(1, this.fadeOutProgress + dt * 2);
        this.alpha = 1 - this.fadeOutProgress;
        this.y += dt * 30;
        this.rotation = this.fadeOutProgress * 0.3 * (Math.random() > 0.5 ? 1 : -1);
        if (this.fadeOutProgress >= 1) {
          this.dead = true;
          this.state = 'dead';
          this.alpha = 0;
        }
        break;
    }
  }

  walkTo(x, y) {
    this.walkTargetX = x;
    this.walkTargetY = y;
    this.state = 'walking';
    this.stateTime = 0;
  }

  attack() {
    this.state = 'attacking';
    this.stateTime = 0;
  }

  hit() {
    this.state = 'hit';
    this.flash = 1;
    this.stateTime = 0;
  }

  die() {
    this.state = 'dying';
    this.fadeOutProgress = 0;
    this.stateTime = 0;
  }

  isIdle() {
    return this.state === 'idle';
  }

  isAnimating() {
    return this.state !== 'idle' && this.state !== 'dead';
  }

  getBobY() {
    if (this.state === 'idle') return Math.sin(this.bobPhase) * 2;
    if (this.state === 'walking') return Math.abs(Math.sin(this.bobPhase * 2)) * 3;
    return 0;
  }

  getDrawX() {
    return this.x + this.shakeX;
  }

  getDrawY() {
    return this.y + this.getBobY() + this.shakeY;
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    const oldAlpha = ctx.globalAlpha;
    ctx.globalAlpha = this.alpha;

    ctx.save();
    ctx.translate(this.getDrawX(), this.getDrawY());
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);

    // Flash overlay - white for pets, red for monsters/bosses
    if (this.flash > 0.05) {
      ctx.save();
      ctx.globalAlpha = this.flash * 0.5;
      const isMonster = this.pet && (this.pet.isMonster || this.pet.isBoss);
      ctx.fillStyle = isMonster ? '#FF0000' : '#FFFFFF';
      ctx.fillRect(-16, -4, 32, 36);
      ctx.restore();
    }

    PixelArt.drawCharacter(ctx, this.pet, 0, 32, 1, this.pet.isBoss || false);
    PixelArt.drawWeapon(ctx, this.pet, 0, 32, 1);

    ctx.restore();
    ctx.globalAlpha = oldAlpha;
  }
}

class Particle {
  constructor(x, y, vx, vy, color, life, size, type) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.size = size || 3;
    this.gravity = 100;
    this.type = type || 'circle';
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 5;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += this.gravity * dt;
    this.vx *= 0.98;
    this.rotation += this.rotSpeed * dt;
    this.life -= dt;
    return this.life > 0;
  }

  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = alpha;
    const s = this.size * (0.5 + alpha * 0.5);

    switch (this.type) {
      case 'spark':
        // Star/spark shape
        ctx.fillStyle = this.color;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillRect(-s * 0.3, -s * 1.5, s * 0.6, s * 3);
        ctx.fillRect(-s * 1.5, -s * 0.3, s * 3, s * 0.6);
        ctx.restore();
        break;

      case 'ice':
        // Ice crystal
        ctx.fillStyle = this.color;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.4, -s * 0.3);
        ctx.lineTo(s, 0);
        ctx.lineTo(s * 0.4, s * 0.3);
        ctx.lineTo(0, s);
        ctx.lineTo(-s * 0.4, s * 0.3);
        ctx.lineTo(-s, 0);
        ctx.lineTo(-s * 0.4, -s * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        break;

      case 'leaf':
        // Leaf shape
        ctx.fillStyle = this.color;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.8, s * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = this.lightColor || this.color;
        ctx.beginPath();
        ctx.ellipse(-s * 0.2, 0, s * 0.35, s * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;

      case 'wind':
        // Wind streak
        ctx.fillStyle = this.color;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillRect(-s * 2, -s * 0.2, s * 4, s * 0.4);
        ctx.restore();
        break;

      case 'drop':
        // Water drop
        ctx.fillStyle = this.color;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.beginPath();
        ctx.moveTo(0, -s * 1.2);
        ctx.quadraticCurveTo(s * 0.6, -s * 0.2, s * 0.5, s * 0.3);
        ctx.quadraticCurveTo(0, s * 0.7, -s * 0.5, s * 0.3);
        ctx.quadraticCurveTo(-s * 0.6, -s * 0.2, 0, -s * 1.2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        break;

      case 'fire':
        // Flame flicker
        ctx.fillStyle = this.color;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.beginPath();
        const flicker = 0.7 + Math.random() * 0.3;
        ctx.moveTo(0, s * flicker);
        ctx.quadraticCurveTo(-s * 0.7, 0, -s * 0.3, -s * 0.5);
        ctx.quadraticCurveTo(0, -s * flicker, s * 0.3, -s * 0.5);
        ctx.quadraticCurveTo(s * 0.7, 0, 0, s * flicker);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        break;

      default:
        // Square particle (default)
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - s / 2, this.y - s / 2, s, s);
        break;
    }
    ctx.globalAlpha = 1;
  }
}

class DamageNumber {
  constructor(x, y, value, color = '#FFD700') {
    this.x = x;
    this.y = y;
    this.value = value;
    this.color = color;
    this.life = 1.2;
    this.maxLife = 1.2;
    this.vy = -80;
  }

  update(dt) {
    this.y += this.vy * dt;
    this.vy += 50 * dt;
    this.life -= dt;
    return this.life > 0;
  }

  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeText(this.value, this.x, this.y);
    ctx.fillText(this.value, this.x, this.y);
    ctx.restore();
  }
}

class BattleAnimator {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.battle = null;
    this.sprites = [];
    this.particles = [];
    this.damageNumbers = [];
    this.running = false;
    this.lastTime = 0;
    this.turnActions = [];
    this.currentActionIdx = -1;
    this.actionCooldown = 0;
    this.waitingForAction = false;
    this.staleActionTime = 0;
    this.onActionsComplete = null;
    this.lastLogLength = 0;
    this.shakeAmount = 0;
    this.bgCloudOffset = 0;
    this.bgStarTwinkle = 0;
    this.visibilityHandler = null;
    this.visibilityHandlerBound = false;
    this.projectiles = [];
    this.statusIcons = [];
    this.effectTexts = [];
    this.elementColors = {};
    this.qualityMode = 'high';
    this.maxParticles = 160;
    this.maxProjectiles = 24;
    this.maxDamageNumbers = 20;
    this.maxStatusIcons = 8;
    this.maxEffectTexts = 10;
    this.maxShockwaves = 8;
    this._renderAccumulator = 0;
    this.minRenderInterval = 1 / 30;
  }

  init(canvas, battle) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.battle = battle;
    this.sprites = [];
    this.particles = [];
    this.damageNumbers = [];
    this.turnActions = [];
    this.currentActionIdx = -1;
    this.waitingForAction = false;
    this.staleActionTime = 0;
    this.lastLogLength = battle ? battle.log.length : 0;
    this.projectiles = [];
    this.statusIcons = [];
    this.effectTexts = [];
    this._renderAccumulator = 0;
    this.elementColors = {};
    this.screenFlash = 0;
    this.shockwaves = [];
    this.pendingTimeouts = [];
    this.currentActionTimeout = null;
    this.qualityMode = 'high';
    this.buildBgCache();

    const groundY = Math.floor(PixelArt.SCENE_HEIGHT * 0.65);

    (battle.team1 || []).forEach((pet, i) => {
      const s = new AnimatedSprite(pet, 'player', 60 + i * 50, groundY - 5);
      this.sprites.push(s);
    });

    (battle.team2 || []).forEach((pet, i) => {
      const s = new AnimatedSprite(pet, 'enemy',
        PixelArt.SCENE_WIDTH - 60 - i * 50, groundY - 5);
      this.sprites.push(s);
    });
  }

  bindVisibilityHandlers() {
    if (this.visibilityHandlerBound || typeof document === 'undefined') return;
    this.visibilityHandler = () => {
      if (document.visibilityState === 'hidden') return;
      this.lastTime = performance.now();
      this.render();
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
    window.addEventListener('focus', this.visibilityHandler);
    window.addEventListener('pageshow', this.visibilityHandler);
    this.visibilityHandlerBound = true;
  }

  detachVisibilityHandlers() {
    if (!this.visibilityHandlerBound || typeof document === 'undefined') return;
    document.removeEventListener('visibilitychange', this.visibilityHandler);
    window.removeEventListener('focus', this.visibilityHandler);
    window.removeEventListener('pageshow', this.visibilityHandler);
    this.visibilityHandlerBound = false;
    this.visibilityHandler = null;
  }

  scheduleTimeout(fn, delay) {
    const wrapper = () => {
      const idx = this.pendingTimeouts.indexOf(id);
      if (idx !== -1) this.pendingTimeouts.splice(idx, 1);
      fn();
    };
    const id = setTimeout(wrapper, delay);
    this.pendingTimeouts.push(id);
    return id;
  }

  setActionTimeout(fn, delay) {
    if (this.currentActionTimeout) {
      clearTimeout(this.currentActionTimeout);
      this.currentActionTimeout = null;
    }
    this.currentActionTimeout = this.scheduleTimeout(fn, delay);
    return this.currentActionTimeout;
  }

  clearTimeouts() {
    for (const id of this.pendingTimeouts) {
      clearTimeout(id);
    }
    this.pendingTimeouts.length = 0;
    if (this.currentActionTimeout) {
      clearTimeout(this.currentActionTimeout);
      this.currentActionTimeout = null;
    }
  }

  start() {
    // Stop any previous animation loop to prevent duplicate loops
    this.running = false;
    this.detachVisibilityHandlers();
    this.clearTimeouts();

    this.running = true;
    this.bindVisibilityHandlers();
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop() {
    this.running = false;
    this.clearTimeouts();
    if (this.ctx) this.render();
    this.detachVisibilityHandlers();
  }

  loop(timestamp) {
    if (!this.running) return;
    if (this.canvas && !document.body.contains(this.canvas)) {
      this.running = false;
      return;
    }
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    this.checkNewLogEntries();
    this.update(dt);

    const active = this.waitingForAction || this.turnActions.length > 0 || this.particles.length > 0 || this.projectiles.length > 0 || this.statusIcons.length > 0 || this.effectTexts.length > 0 || this.damageNumbers.length > 0 || this.shockwaves.length > 0;
    const interval = active ? 0.016 : 0.05;
    this._renderAccumulator += dt;
    if (this._renderAccumulator >= interval) {
      this.render();
      this._renderAccumulator = 0;
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  checkNewLogEntries() {
    if (!this.battle || this.waitingForAction) return;
    const log = this.battle.log;
    if (log.length > this.lastLogLength && !this.hasQueuedActions()) {
      const newEntries = log.slice(this.lastLogLength);
      this.lastLogLength = log.length;

      const actions = [];
      for (const entry of newEntries) {
        if (entry.type === 'damage') {
          actions.push({ type: 'attack', entry });
        } else if (entry.type === 'heal') {
          actions.push({ type: 'heal', entry });
        } else if (entry.type === 'effect') {
          actions.push({ type: 'effect', entry });
        } else if (entry.type === 'victory') {
          actions.push({ type: 'victory', entry });
        } else if (entry.type === 'defeat') {
          actions.push({ type: 'defeat', entry });
        }
      }

      if (actions.length > 0) {
        this.turnActions = actions;
        this.currentActionIdx = -1;
        this.waitingForAction = true;
        this.staleActionTime = 0;
        this.actionCooldown = 0.5;
        this.nextAction();
      }
    }
  }

  hasQueuedActions() {
    return this.currentActionIdx < this.turnActions.length - 1;
  }

  nextAction() {
    if (this.currentActionTimeout) {
      clearTimeout(this.currentActionTimeout);
      this.currentActionTimeout = null;
    }
    this.currentActionIdx++;
    if (this.currentActionIdx >= this.turnActions.length) {
      this.waitingForAction = false;
      this.staleActionTime = 0;
      this.lastLogLength = this.battle ? this.battle.log.length : 0;
      if (this.onActionsComplete) this.onActionsComplete();
      return;
    }

    const action = this.turnActions[this.currentActionIdx];
    this.actionCooldown = 0;

    switch (action.type) {
      case 'attack':
        this.playAttackAnimation(action.entry);
        break;
      case 'heal':
        this.playHealAnimation(action.entry);
        break;
      case 'effect':
        this.playEffectAnimation(action.entry);
        break;
      case 'victory':
      case 'defeat':
        this.scheduleTimeout(() => this.nextAction(), 600);
        break;
    }
  }

  findSpriteByPetName(name) {
    return this.sprites.find(s => s.pet && s.pet.name === name);
  }

  findSpriteByEmoji(emoji) {
    return this.sprites.find(s => s.pet && s.pet.emoji === emoji);
  }

  parseAttackNames(text) {
    const parts = text.split('gây');
    const attackerStr = parts[0]?.trim() || '';
    const rest = parts[1] || '';
    const defParts = rest.split('→');
    const defStr = defParts[1]?.trim() || '';
    const defName = defStr.split('(')[0]?.trim() || '';

    const atkEmoji = attackerStr.match(/[\u{1F000}-\u{1FFFF}]/u)?.[0] || '';
    const defEmoji = defStr.match(/[\u{1F000}-\u{1FFFF}]/u)?.[0] || '';

    return { atkEmoji, defEmoji };
  }

  findSpriteInText(text) {
    const emojis = text.match(/[\u{1F000}-\u{1FFFF}]/gu) || [];
    const names = text.match(/[A-ZÀ-Ỹ][a-zà-ỹ]+\s*/g) || [];

    for (const s of this.sprites) {
      if (s.pet) {
        for (const emoji of emojis) {
          if (s.pet.emoji === emoji) return s;
        }
        for (const name of names) {
          if (s.pet.name.includes(name.trim())) return s;
        }
      }
    }
    return null;
  }

  findAttackerDefender(text) {
    const emojis = text.match(/[\u{1F000}-\u{1FFFF}]/gu) || [];
    const atkEmoji = emojis[0];
    const defEmoji = emojis[1] || emojis[0];
    return {
      attacker: this.sprites.find(s => s.pet?.emoji === atkEmoji && !s.dead),
      defender: this.sprites.find(s => s.pet?.emoji === defEmoji && !s.dead)
    };
  }

  getElementFromPet(pet) {
    if (!pet) return 'default';
    const elem = getPetElement(pet.baseId);
    return elem;
  }

  playAttackAnimation(entry) {
    const { attacker, defender } = this.findAttackerDefender(entry.text);
    if (!attacker || !defender) {
      this.scheduleTimeout(() => this.nextAction(), 200);
      return;
    }

    const atkX = attacker.homeX;
    const defX = defender.homeX;
    const colors = attacker.pet ? getBtlElement(attacker.pet) : BTL_ELEMENT_COLORS.default;
    const element = this.getElementFromPet(attacker.pet);
    const isMonster = attacker.pet && (attacker.pet.isMonster || attacker.pet.isBoss);
    const isDefMonster = defender.pet && (defender.pet.isMonster || defender.pet.isBoss);

    // Show skill name with element color
    const skillMatch = entry.text.match(/\[(.+?)\]/);
    if (skillMatch) {
      const et = new EffectText(attacker.x, attacker.y - 40, skillMatch[1], colors.light);
      this.effectTexts.push(et);
    }

    // Element-specific approach distance
    const approachDist = element === 'thunder' || element === 'storm' ? 30 : 20;
    attacker.walkTo(defX - approachDist, attacker.homeY - 5);

    const checkWalk = () => {
      if (attacker.state === 'walking') {
        requestAnimationFrame(checkWalk);
        return;
      }
      attacker.attack();

      // Element-specific defender hit reaction
      if (element === 'thunder') {
        // Stun shake - multiple hits
        defender.flash = 2;
        defender.shakeX = (Math.random() - 0.5) * 10;
        defender.shakeY = (Math.random() - 0.5) * 10;
      } else if (element === 'storm') {
        defender.flash = 1.8;
        defender.shakeX = (Math.random() - 0.5) * 12;
        defender.shakeY = (Math.random() - 0.5) * 8;
      } else if (element === 'fire') {
        defender.flash = 1.5;
        defender.shakeX = (Math.random() - 0.5) * 6;
        defender.shakeY = (Math.random() - 0.5) * 4;
      } else if (element === 'ice') {
        defender.flash = 1.2;
      } else {
        defender.hit();
      }

      // Monster hit: red flash
      if (isDefMonster) {
        defender.flash = 1.5;
      }

      const dmgMatch = entry.text.match(/gây\s*(\d+)/);
      const isCrit = entry.text.includes('CHÍ MẠNG');
      const dmg = dmgMatch ? parseInt(dmgMatch[1]) : 0;

      if (dmg > 0) {
        const num = new DamageNumber(defender.x, defender.y - 30,
          `-${dmg}`, isCrit ? '#FF4444' : colors.main);
        this.damageNumbers.push(num);
      }

      // Element-specific particle effects
      const pCount = isCrit ? 16 : (element === 'storm' || element === 'fire' ? 12 : 8);
      this.spawnParticles(defender.x, defender.y, colors, pCount, element);

      // Element-specific shake
      if (isCrit) {
        this.shakeAmount = 6;
        this.screenFlash = 0.15;
        this.spawnParticles(defender.x, defender.y - 5, colors, 8, element);
        this.shockwaves.push({ x: defender.x, y: defender.y - 10, radius: 5, life: 0.4, color: colors.glow });
      } else if (element === 'storm') {
        this.shakeAmount = 4;
        this.shockwaves.push({ x: defender.x, y: defender.y - 10, radius: 3, life: 0.35, color: colors.light });
      } else if (element === 'thunder') {
        this.shakeAmount = 3 + (isDefMonster ? 2 : 0);
        this.screenFlash = 0.08;
      } else if (element === 'fire') {
        this.shakeAmount = 2 + (isDefMonster ? 1 : 0);
        this.shockwaves.push({ x: defender.x, y: defender.y - 10, radius: 2, life: 0.25, color: colors.glow });
      } else {
        this.shakeAmount = 2 + (isDefMonster ? 1 : 0);
      }

      // Element-specific projectile
      const projSize = isCrit ? 9 : (element === 'storm' ? 7 : 5);
      const proj = new BattleProjectile(
        attacker.x, attacker.y - 15,
        defender.x, defender.y - 15,
        colors, projSize, element
      );
      this.projectiles.push(proj);

      // Extra multihit for thunder
      if (element === 'thunder' && isCrit) {
        this.scheduleTimeout(() => {
          const proj2 = new BattleProjectile(
            defender.x - 5, defender.y - 20,
            defender.x, defender.y - 15,
            colors, 4, 'thunder'
          );
          this.projectiles.push(proj2);
          this.shakeAmount = 4;
        }, 100);
      }

      this.scheduleTimeout(() => {
        if (defender.pet && defender.pet.hp <= 0 && !defender.dead) {
          defender.die();
          // Element-specific death explosion
          this.screenFlash = 0.25;
          this.spawnParticles(defender.x, defender.y, colors, 30, element);
          this.spawnParticles(defender.x, defender.y, '#FF4444', 15, 'default');
          this.spawnParticles(defender.x, defender.y, '#FFFFFF', 10, 'default');
          this.shakeAmount = 8;
          this.shockwaves.push({ x: defender.x, y: defender.y - 10, radius: 5, life: 0.5, color: colors.glow });
          this.shockwaves.push({ x: defender.x, y: defender.y - 10, radius: 3, life: 0.4, color: '#FFFFFF' });
        }
        attacker.walkTo(atkX, attacker.homeY);
        this.scheduleTimeout(() => this.nextAction(), 300);
      }, 400);
    };

    this.setActionTimeout(checkWalk, 100);
  }

  playHealAnimation(entry) {
    const target = this.findSpriteInText(entry.text);
    if (!target || target.dead) {
      this.scheduleTimeout(() => this.nextAction(), 200);
      return;
    }

    const colors = BTL_ELEMENT_COLORS.water;

    // Expanding green + white cross effect
    this.spawnParticles(target.x, target.y - 10, colors, 14, 'water');
    this.spawnParticles(target.x, target.y - 10, { main: '#FFF', light: '#FFF', particle: '#FFF', glow: '#FFF' }, 6);

    // Healing aura rings
    for (let i = 0; i < 3; i++) {
      const ringP = new Particle(target.x, target.y, 0, 0, '#2ECC71', 0.5 + i * 0.1, 4 + i * 4, 'circle');
      ringP.gravity = 0;
      this.particles.push(ringP);
    }

    this.shakeAmount = 2;

    // Projectile to target (heal orb)
    const attacker = this.sprites.find(s => s.pet && !s.dead && s.team === 'player');
    if (attacker) {
      const proj = new BattleProjectile(attacker.x, attacker.y - 15, target.x, target.y - 15, colors, 6, 'water');
      this.projectiles.push(proj);
    }

    const healMatch = entry.text.match(/hồi\s*(\d+)/);
    const heal = healMatch ? parseInt(healMatch[1]) : 0;
    if (heal > 0) {
      const num = new DamageNumber(target.x, target.y - 30, `+${heal}`, '#2ECC71');
      this.damageNumbers.push(num);
    }

    this.scheduleTimeout(() => {
      this.spawnParticles(target.x, target.y - 10, colors, 10, 'water');
      this.shakeAmount = 1;
      this.nextAction();
    }, 600);
  }

  playEffectAnimation(entry) {
    const target = this.findSpriteInText(entry.text);
    if (!target || target.dead) {
      this.scheduleTimeout(() => this.nextAction(), 200);
      return;
    }

    // Extract effect icon from log (e.g., "🔥 Thiêu đốt")
    const effMatch = entry.text.match(/bị\s*(\S+)\s+(.+)/);
    const effIcon = effMatch ? effMatch[1] : '💥';
    const effName = effMatch ? effMatch[2] : 'Hiệu ứng';

    const colors = getBtlElementByEffect(effName.toLowerCase());
    const effectColors = { main: colors.main, light: colors.light, particle: colors.particle, glow: colors.glow };

    // Determine element from effect name
    const effectElemMap = { 'thiêu đốt': 'fire', 'đóng băng': 'ice', 'làm chậm': 'ice', 'trúng độc': 'poison',
      'choáng': 'thunder', 'bó chặt': 'wood', 'lốc xoáy': 'storm', 'đẩy lùi': 'storm',
      'tam muội chân hỏa': 'fire', 'thiên hấp': 'earth', 'hàng long thập bát chưởng': 'earth' };
    const effElem = effectElemMap[effName.toLowerCase()] || 'default';

    this.spawnParticles(target.x, target.y, effectColors, 12, effElem);
    this.shakeAmount = 3;
    this.spawnParticles(target.x, target.y - 5, { main: '#FFF', light: '#FFF', particle: '#FFF', glow: '#FFF' }, 6);

    // Element-specific effect burst
    if (effElem === 'fire') {
      for (let i = 0; i < 4; i++) {
        const p = new Particle(target.x, target.y, (Math.random() - 0.5) * 40, -30 + Math.random() * -40, '#FF4400', 0.4, 3, 'fire');
        this.particles.push(p);
      }
    } else if (effElem === 'storm') {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const p = new Particle(
          target.x, target.y,
          Math.cos(a) * 50, Math.sin(a) * 30,
          '#4DD0E1', 0.3, 2, 'wind'
        );
        p.gravity = 0;
        this.particles.push(p);
      }
    } else if (effElem === 'thunder') {
      this.shakeAmount = 5;
    }

    const icon = new StatusIcon(target.x, target.y - 40, effIcon, colors.main, effName);
    this.statusIcons.push(icon);

    const et = new EffectText(target.x, target.y - 55, effName, colors.light);
    this.effectTexts.push(et);

    this.scheduleTimeout(() => this.nextAction(), 500);
  }

  updatePerformanceMode() {
    const totalActors = this.particles.length + this.projectiles.length + this.statusIcons.length + this.effectTexts.length + this.damageNumbers.length + this.shockwaves.length;
    if (totalActors > 260) {
      this.qualityMode = 'low';
    } else if (totalActors > 160) {
      this.qualityMode = 'medium';
    } else {
      this.qualityMode = 'high';
    }
  }

  getAdaptiveSpawnCount(baseCount) {
    this.updatePerformanceMode();
    const multipliers = { low: 0.45, medium: 0.7, high: 1 };
    const count = Math.max(0, Math.round(baseCount * (multipliers[this.qualityMode] || 1)));
    if (this.particles.length > this.maxParticles - 24) {
      return Math.max(0, Math.floor(count * 0.6));
    }
    return count;
  }

  trimCollections() {
    this.updatePerformanceMode();
    if (this.particles.length > this.maxParticles) this.particles.splice(0, this.particles.length - this.maxParticles);
    if (this.projectiles.length > this.maxProjectiles) this.projectiles.splice(0, this.projectiles.length - this.maxProjectiles);
    if (this.damageNumbers.length > this.maxDamageNumbers) this.damageNumbers.splice(0, this.damageNumbers.length - this.maxDamageNumbers);
    if (this.statusIcons.length > this.maxStatusIcons) this.statusIcons.splice(0, this.statusIcons.length - this.maxStatusIcons);
    if (this.effectTexts.length > this.maxEffectTexts) this.effectTexts.splice(0, this.effectTexts.length - this.maxEffectTexts);
    if (this.shockwaves.length > this.maxShockwaves) this.shockwaves.splice(0, this.shockwaves.length - this.maxShockwaves);
  }

  spawnParticles(x, y, colors, count, element) {
    this.trimCollections();
    if (this.particles.length >= this.maxParticles) return;
    const elemTypes = {
      fire:    ['fire', 'spark'],
      ice:     ['ice', 'ice'],
      wood:    ['leaf', 'leaf'],
      thunder: ['spark', 'spark'],
      poison:  ['circle', 'circle'],
      water:   ['drop', 'circle'],
      earth:   ['circle', 'circle'],
      storm:   ['wind', 'wind'],
      default: ['circle', 'circle']
    };
    const types = elemTypes[element] || elemTypes.default;
    const c = colors || { main: '#FFF', light: '#FFF', particle: '#FFF', glow: '#FFF' };
    const adaptiveCount = this.getAdaptiveSpawnCount(count);
    if (adaptiveCount <= 0) return;

    for (let i = 0; i < adaptiveCount && this.particles.length < this.maxParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 100;
      const particleColor = i % 2 === 0 ? c.main : (c.light || c.main);
      const pType = types[Math.floor(Math.random() * types.length)];
      const p = new Particle(
        x + (Math.random() - 0.5) * 14,
        y + (Math.random() - 0.5) * 14,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed - 50,
        particleColor,
        0.3 + Math.random() * 0.6,
        2 + Math.random() * 4,
        pType
      );
      p.lightColor = c.glow || c.light;
      this.particles.push(p);
    }

    // Extra special effect for certain elements
    if (element === 'fire') {
      // Smoke particles
      for (let i = 0; i < Math.max(1, Math.floor(adaptiveCount / 8)); i++) {
        const p = new Particle(x, y, (Math.random() - 0.5) * 20, -30, '#555', 0.6, 6, 'circle');
        p.gravity = -10;
        this.particles.push(p);
      }
    }
    if (element === 'storm') {
      // Wind ring
      for (let i = 0; i < Math.max(2, Math.floor(adaptiveCount / 3)); i++) {
        const a = (i / 8) * Math.PI * 2;
        const p = new Particle(
          x + Math.cos(a) * 20, y + Math.sin(a) * 20,
          Math.cos(a + Math.PI / 2) * 60, Math.sin(a + Math.PI / 2) * 40,
          c.glow || '#FFF', 0.3, 2, 'wind'
        );
        p.gravity = 0;
        this.particles.push(p);
      }
    }
    if (element === 'thunder') {
      for (let i = 0; i < Math.max(2, Math.floor(adaptiveCount / 4)); i++) {
        const p = new Particle(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 30, -40 - Math.random() * 40,
          '#FFFFFF', 0.2 + Math.random() * 0.3, 1 + Math.random() * 2, 'spark');
        p.gravity = -20;
        this.particles.push(p);
      }
    }
    if (element === 'ice') {
      for (let i = 0; i < Math.max(2, Math.floor(adaptiveCount / 4)); i++) {
        const p = new Particle(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 30, -20 - Math.random() * 30,
          c.glow || '#FFFFFF', 0.3 + Math.random() * 0.4, 2 + Math.random() * 3, 'ice');
        this.particles.push(p);
      }
    }
  }

  update(dt) {
    this.bgCloudOffset += dt * 8;
    this.bgStarTwinkle += dt * 2;

    for (const sprite of this.sprites) {
      sprite.update(dt);
    }

    // In-place removal to avoid GC pressure from filter() allocation
    this.inPlaceRemove(this.particles, dt);
    this.inPlaceRemove(this.damageNumbers, dt);
    this.inPlaceRemove(this.projectiles, dt);
    this.inPlaceRemove(this.statusIcons, dt);
    this.inPlaceRemove(this.effectTexts, dt);

    this.trimCollections();

    if (this.shakeAmount > 0) {
      this.shakeAmount *= 0.9;
      if (this.shakeAmount < 0.5) this.shakeAmount = 0;
    }
    if (this.screenFlash > 0) this.screenFlash -= dt;

    if (this.waitingForAction) {
      this.staleActionTime += dt;
      if (this.staleActionTime > 2.5) {
        this.waitingForAction = false;
        this.turnActions = [];
        this.currentActionIdx = -1;
        this.staleActionTime = 0;
      }
    }

    // In-place removal for shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const s = this.shockwaves[i];
      s.life -= dt;
      s.radius += dt * 120;
      if (s.life <= 0) {
        this.shockwaves[i] = this.shockwaves[this.shockwaves.length - 1];
        this.shockwaves.pop();
      }
    }
  }

  inPlaceRemove(arr, dt) {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (!arr[i].update(dt)) {
        arr[i] = arr[arr.length - 1];
        arr.pop();
      }
    }
  }

  render() {
    const ctx = this.ctx;
    if (!ctx) return;
    const W = PixelArt.SCENE_WIDTH;
    const H = PixelArt.SCENE_HEIGHT;

    ctx.clearRect(0, 0, W, H);

    // Screen shake
    ctx.save();
    if (this.shakeAmount > 0.5) {
      ctx.translate(
        (Math.random() - 0.5) * this.shakeAmount * 2,
        (Math.random() - 0.5) * this.shakeAmount * 2
      );
    }

    this.drawBackground(ctx, W, H);

    const groundY = Math.floor(H * 0.65);

    // Draw projectiles behind sprites
    for (const proj of this.projectiles) {
      proj.draw(ctx);
    }

    // Draw VS
    if (this.battle && this.battle.state !== 'idle' && !this.battleEnded()) {
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeText('VS', W / 2, groundY - 30);
      ctx.fillText('VS', W / 2, groundY - 30);
    }

    // Draw sprites sorted by Y for depth
    const alive = this.sprites.filter(s => s.alpha > 0);
    alive.sort((a, b) => a.getDrawY() - b.getDrawY());
    for (const sprite of alive) {
      sprite.draw(ctx);
      // Draw status effect tint on character body
      if (this.battle && sprite.pet) {
        const teamId = sprite.team === 'player' ? 1 : 2;
        const effects = this.battle.getEffectsFor(teamId, sprite.pet.id);
        if (effects.length > 0) {
          this.drawEffectTint(ctx, sprite, effects);
        }
      }
    }

    // Draw HP bars
    for (const sprite of this.sprites) {
      if (sprite.alpha <= 0 || sprite.dead) continue;
      const pet = sprite.pet;
      if (!pet) continue;
      const bx = sprite.getDrawX() - 22;
      const by = sprite.getDrawY() - 48;
      PixelArt.drawHPBar(ctx, bx, by, 44, 5, Math.max(0, pet.hp), pet.maxHp);
    }

    // Draw persistent status effect overlays on sprites
    if (this.battle) {
      for (const sprite of this.sprites) {
        if (sprite.alpha <= 0 || sprite.dead || !sprite.pet) continue;
        const teamId = sprite.team === 'player' ? 1 : 2;
        const effects = this.battle.getEffectsFor(teamId, sprite.pet.id);
        if (effects.length > 0) {
          this.drawEffectOverlay(ctx, sprite, effects);
        }
      }
    }

    // Draw damage numbers
    for (const num of this.damageNumbers) {
      num.draw(ctx);
    }

    // Draw particles
    const particleLimit = this.qualityMode === 'low' ? 40 : this.qualityMode === 'medium' ? 80 : this.particles.length;
    for (let i = 0; i < Math.min(this.particles.length, particleLimit); i++) {
      this.particles[i].draw(ctx);
    }

    // Draw status icons
    for (const icon of this.statusIcons) {
      icon.draw(ctx);
    }

    // Draw effect texts
    for (const et of this.effectTexts) {
      et.draw(ctx);
    }

    // Shockwave rings
    for (const sw of this.shockwaves) {
      ctx.save();
      ctx.globalAlpha = sw.life * 0.5;
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 2 * sw.life;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Screen flash overlay
    if (this.screenFlash > 0) {
      ctx.save();
      ctx.globalAlpha = this.screenFlash * 0.3;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, PixelArt.SCENE_WIDTH, PixelArt.SCENE_HEIGHT);
      ctx.restore();
    }

    ctx.restore();
  }

  drawEffectTint(ctx, sprite, effects) {
    const TINT = {
      burn:   { r:255, g:60,  b:0,   a:0.15 },
      freeze: { r:0,   g:180, b:255, a:0.15 },
      poison: { r:160, g:50,  b:200, a:0.15 },
      stun:   { r:255, g:230, b:0,   a:0.12 },
      slow:   { r:80,  g:80,  b:120, a:0.12 },
      root:   { r:50,  g:200, b:80,  a:0.12 },
      knockback:{ r:180, g:180, b:255, a:0.15 },
      shield:  { r:100, g:200, b:255, a:0.12 },
      vortex:  { r:77,  g:208, b:225, a:0.15 },
      searing_flame:{ r:255, g:200, b:0,   a:0.2 },
      gravity: { r:150, g:50,  b:200, a:0.18 },
      dragon_palm:{ r:255, g:180, b:50,  a:0.15 }
    };
    const effect = effects.find(e => TINT[e.type]);
    if (!effect) return;
    const t = TINT[effect.type];
    const intensity = Math.sin(this.bgStarTwinkle * 4 + sprite.pet.id.charCodeAt(0)) * 0.3 + 0.7;
    ctx.save();
    ctx.globalAlpha = t.a * intensity;
    ctx.fillStyle = `rgb(${t.r},${t.g},${t.b})`;
    ctx.translate(sprite.getDrawX(), sprite.getDrawY());
    ctx.scale(sprite.scale, sprite.scale);
    ctx.fillRect(-16, -4, 32, 36);
    ctx.restore();
  }

  drawEffectOverlay(ctx, sprite, effects) {
    const EFFECT_AURA = {
      burn:   { color:'rgba(255, 68, 0, ', icon:'🔥', pulse:true },
      freeze: { color:'rgba(0, 170, 255, ', icon:'❄️', pulse:true },
      poison: { color:'rgba(155, 89, 182, ', icon:'☠️', pulse:true },
      stun:   { color:'rgba(255, 215, 0, ', icon:'⚡', pulse:true },
      slow:   { color:'rgba(100, 100, 130, ', icon:'🐢', pulse:false },
      root:   { color:'rgba(46, 204, 113, ', icon:'🌿', pulse:false },
      summon: { color:'rgba(102, 187, 106, ', icon:'🌱', pulse:false },
      knockback:{ color:'rgba(180, 180, 255, ', icon:'💨', pulse:true },
      shield:  { color:'rgba(100, 200, 255, ', icon:'🛡️', pulse:false },
      vortex:  { color:'rgba(77, 208, 225, ', icon:'🌪️', pulse:true },
      searing_flame:{ color:'rgba(255, 200, 0, ', icon:'🔥', pulse:true },
      gravity: { color:'rgba(150, 50, 200, ', icon:'🌀', pulse:true },
      dragon_palm:{ color:'rgba(255, 180, 50, ', icon:'🐉', pulse:true }
    };

    const x = sprite.getDrawX();
    const y = sprite.getDrawY();
    const pulse = Math.sin(this.bgStarTwinkle * 3) * 0.2 + 0.6;
    let mainEffect = null;
    let maxDuration = 0;

    for (const eff of effects) {
      const aura = EFFECT_AURA[eff.type];
      if (!aura) continue;
      if (!mainEffect || eff.duration > maxDuration) {
        mainEffect = eff;
        maxDuration = eff.duration;
      }
    }

    if (!mainEffect) return;
    const aura = EFFECT_AURA[mainEffect.type];

    // Glow ring behind entity
    const alpha = aura.pulse ? pulse * 0.4 : 0.25;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = aura.color + '0.5)';
    ctx.beginPath();
    ctx.arc(x, y - 2, 20 * sprite.scale, 0, Math.PI * 2);
    ctx.fill();

    // Secondary glow ring
    ctx.globalAlpha = alpha * 0.5;
    ctx.fillStyle = aura.color + '0.3)';
    ctx.beginPath();
    ctx.arc(x, y - 2, 26 * sprite.scale, 0, Math.PI * 2);
    ctx.fill();

    // Effect icon above entity
    ctx.globalAlpha = 0.9;
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(aura.icon, x, y - 52);
    ctx.restore();
  }

  battleEnded() {
    return this.battle && (this.battle.state === 'ended');
  }

  drawBackground(ctx, W, H) {
    // Blit cached static background (sky, moon, buildings, street, sidewalk)
    if (this.bgCacheCanvas) {
      ctx.drawImage(this.bgCacheCanvas, 0, 0);
    }

    // Aurora/nebula effect
    ctx.globalAlpha = 0.08;
    const auroraX = Math.sin(this.bgCloudOffset * 0.05) * W * 0.2 + W * 0.3;
    for (let i = 0; i < 3; i++) {
      const grad = ctx.createRadialGradient(
        auroraX + i * 40, 40 + i * 10, 5,
        auroraX + i * 40, 40 + i * 10, 80 + i * 20
      );
      const hue = [200, 280, 160][i];
      grad.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.4)`);
      grad.addColorStop(1, `hsla(${hue}, 80%, 60%, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(auroraX + i * 40, 40 + i * 10, 80 + i * 20, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Stars with varying sizes and twinkling
    for (let i = 0; i < 45; i++) {
      const sx = (i * 137.5 + 50) % W;
      const sy = (i * 97.3 + 20) % Math.floor(H * 0.38);
      const bright = 0.3 + Math.sin(this.bgStarTwinkle * 0.7 + i * 2.7) * 0.7;
      ctx.globalAlpha = bright;
      const size = 1 + (i % 4);
      if (size >= 3) {
        ctx.fillStyle = '#CCDDFF';
        ctx.fillRect(sx - 1, sy - 2, 3, 5);
        ctx.fillRect(sx - 2, sy - 1, 5, 3);
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(sx, sy, size, size);
      }
    }
    ctx.globalAlpha = 1;

    // Clouds with storm variant
    ctx.globalAlpha = 0.12;
    const stormIntensity = Math.sin(this.bgCloudOffset * 0.15) * 0.5 + 0.5;
    const cloudColor = `rgba(180, 200, 230, ${0.1 + stormIntensity * 0.1})`;
    ctx.fillStyle = cloudColor;
    this.drawCloud(ctx, 50 + Math.sin(this.bgCloudOffset * 0.3) * 25, 25, 45, 12);
    this.drawCloud(ctx, 180 + Math.cos(this.bgCloudOffset * 0.25) * 35, 38, 55, 14);
    this.drawCloud(ctx, 310 + Math.sin(this.bgCloudOffset * 0.35 + 1) * 30, 22, 40, 10);

    // Lightning flash effect
    if (stormIntensity > 0.85) {
      ctx.globalAlpha = (stormIntensity - 0.85) * 0.3;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }

    // Blinking windows (drawn over cached buildings)
    const groundY = Math.floor(H * 0.65);
    const bData = [
      { x: 8, w: 42, h: 75 }, { x: 54, w: 32, h: 52 },
      { x: 88, w: 52, h: 95 }, { x: 143, w: 36, h: 58 },
      { x: 183, w: 58, h: 85 }, { x: 243, w: 42, h: 48 },
      { x: 288, w: 48, h: 90 }, { x: 338, w: 54, h: 65 }
    ];
    for (const b of bData) {
      const by = groundY - b.h;
      for (let wy = by + 8; wy < groundY - 8; wy += 14) {
        for (let wx = b.x + 6; wx < b.x + b.w - 6; wx += 10) {
          const twinkle = Math.sin(this.bgStarTwinkle * 0.5 + wx * 7.1 + wy * 3.3) > 0.2;
          ctx.fillStyle = twinkle ? '#FFE484' : '#1A1A3A';
          ctx.fillRect(wx, wy, 5, 7);
        }
      }
    }

    // Animated road lines
    ctx.fillStyle = '#FFE484';
    const roadY = groundY + Math.floor((H - groundY) * 0.5);
    for (let rx = 0; rx < W; rx += 30) {
      ctx.globalAlpha = 0.6 + Math.sin(this.bgCloudOffset * 0.1 + rx) * 0.2;
      ctx.fillRect(rx + 5 + Math.sin(this.bgCloudOffset * 0.1 + rx) * 2, roadY - 1, 15, 2);
    }
    ctx.globalAlpha = 1;

    // Street details
    ctx.fillStyle = '#3A3A3A';
    for (let sx = 0; sx < W; sx += 35) {
      ctx.fillRect(sx, groundY + 6, 2, 3);
    }
  }

  buildBgCache() {
    const W = PixelArt.SCENE_WIDTH, H = PixelArt.SCENE_HEIGHT;
    const offscreen = document.createElement('canvas');
    offscreen.width = W;
    offscreen.height = H;
    const ctx = offscreen.getContext('2d');

    // Static sky gradient
    const skyColors = PixelArt.COLORS.sky;
    const bandH = Math.floor(H * 0.5 / skyColors.length);
    for (let i = 0; i < skyColors.length; i++) {
      ctx.fillStyle = skyColors[i];
      ctx.fillRect(0, i * bandH, W, bandH + 1);
    }

    // Static moon
    const moonX = W - 60, moonY = 40;
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#FFE484';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#FFE484';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = skyColors[2];
    ctx.beginPath();
    ctx.arc(moonX + 8, moonY - 5, 17, 0, Math.PI * 2);
    ctx.fill();

    // Static buildings
    const groundY = Math.floor(H * 0.65);
    const bData = [
      { x: 8, w: 42, h: 75 }, { x: 54, w: 32, h: 52 },
      { x: 88, w: 52, h: 95 }, { x: 143, w: 36, h: 58 },
      { x: 183, w: 58, h: 85 }, { x: 243, w: 42, h: 48 },
      { x: 288, w: 48, h: 90 }, { x: 338, w: 54, h: 65 }
    ];
    for (const b of bData) {
      const by = groundY - b.h;
      const shades = ['#252550', '#30305E', '#3A3A6A', '#2A2A56'];
      ctx.fillStyle = shades[b.x % shades.length];
      ctx.fillRect(b.x, by, b.w, b.h);
      ctx.strokeStyle = '#1A1A3A';
      ctx.lineWidth = 1;
      ctx.strokeRect(b.x, by, b.w, b.h);
    }

    // Static street
    ctx.fillStyle = PixelArt.COLORS.street || '#2A2A2A';
    ctx.fillRect(0, groundY, W, H - groundY);

    // Static sidewalk
    ctx.fillStyle = '#4A4A4A';
    ctx.fillRect(0, groundY, W, 3);

    this.bgCacheCanvas = offscreen;
  }

  drawCloud(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.ellipse(x, y, w * 0.4, h * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x - w * 0.3, y + h * 0.2, w * 0.3, h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + w * 0.3, y + h * 0.15, w * 0.35, h * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
