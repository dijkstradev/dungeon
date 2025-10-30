const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const healthEl = document.querySelector(".health");
const ammoEl = document.querySelector(".ammo");
const timerEl = document.querySelector(".timer");
const killsEl = document.querySelector(".kills");
const overlay = document.getElementById("game-over");
const finalTimerEl = document.querySelector(".final-timer");
const finalKillsEl = document.querySelector(".final-kills");
const finalAmmoEl = document.querySelector(".final-ammo");
const restartBtn = document.getElementById("restart-btn");
const joystick = document.getElementById("joystick");
const joystickThumb = joystick.querySelector(".joystick-thumb");
const attackBtn = document.getElementById("attack-btn");
const shareBtn = document.getElementById("share-btn");
const sharePreview = document.querySelector(".share-preview");
const shareCanvas = document.getElementById("share-canvas");
const shareCtx = shareCanvas.getContext("2d");
const minimapCanvas = document.getElementById("minimap");
const minimapCtx = minimapCanvas.getContext("2d");
let isMobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 768;

const STARTING_AMMO = 5;
const PICKUP_BOB_SPEED = 0.005;
const PICKUP_BOB_AMPLITUDE = 8;
const DECORATION_SCALE = 3.8;
const PICKUP_SCALE = 3.8;

const VIEWPORT = { width: canvas.width, height: canvas.height };
const MAP_COLS = 60;
const MAP_ROWS = 60;
const CELL_SIZE = 96;
const MAP_SIZE = Math.max(MAP_COLS, MAP_ROWS) * CELL_SIZE;
const DECOR_TYPES = [
  "stalagmite_small",
  "stalagmite_tall",
  "stalactite_small",
  "stalactite_tall",
  "moss_patch",
  "fungus_cluster",
  "bone_pile",
  "skull",
  "broken_crate",
  "rusted_barrel",
  "campfire_out",
  "campfire_glow",
  "torch_bracket",
  "chain_hook",
  "drip_pool",
  "crystal_blue",
  "crystal_orange",
  "rubble_heap",
  "spider_web",
  "ancient_rune",
];

const DECOR_ANIM_DEFAULT = { base: 0.86, alpha: 0.05, wobble: 0.6 };
const DECOR_ANIM_SETTINGS = {
  stalagmite_small: { base: 0.83, alpha: 0.04, wobble: 0.9 },
  stalagmite_tall: { base: 0.83, alpha: 0.045, wobble: 1.1 },
  stalactite_small: { base: 0.82, alpha: 0.04, wobble: 0.8 },
  stalactite_tall: { base: 0.82, alpha: 0.05, wobble: 1.2 },
  moss_patch: { base: 0.84, alpha: 0.035, wobble: 0.5 },
  fungus_cluster: {
    base: 0.87,
    alpha: 0.07,
    wobble: 0.7,
    sparkle: true,
    sparkleColor: "rgba(180,140,255,0.38)",
    sparkleScale: 1.0,
  },
  bone_pile: { base: 0.83, alpha: 0.03, wobble: 0.35 },
  skull: {
    base: 0.84,
    alpha: 0.04,
    wobble: 0.45,
    sparkle: true,
    sparkleColor: "rgba(255,255,255,0.28)",
    sparkleScale: 0.8,
  },
  broken_crate: { base: 0.85, alpha: 0.025, wobble: 0.28 },
  rusted_barrel: { base: 0.85, alpha: 0.03, wobble: 0.32 },
  campfire_out: { base: 0.84, alpha: 0.04, wobble: 0.45 },
  campfire_glow: {
    base: 0.88,
    alpha: 0.11,
    wobble: 1.4,
    sparkle: true,
    sparkleColor: "rgba(247,157,42,0.52)",
    sparkleScale: 1.6,
  },
  torch_bracket: {
    base: 0.86,
    alpha: 0.1,
    wobble: 1.2,
    sparkle: true,
    sparkleColor: "rgba(255,198,120,0.5)",
    sparkleScale: 1.2,
  },
  chain_hook: { base: 0.82, alpha: 0.05, wobble: 1.5 },
  drip_pool: {
    base: 0.85,
    alpha: 0.06,
    wobble: 0.6,
    sparkle: true,
    sparkleColor: "rgba(70,130,180,0.35)",
    sparkleScale: 1.3,
  },
  crystal_blue: {
    base: 0.9,
    alpha: 0.1,
    wobble: 1.6,
    sparkle: true,
    sparkleColor: "rgba(120,200,255,0.5)",
    sparkleScale: 1.5,
  },
  crystal_orange: {
    base: 0.9,
    alpha: 0.1,
    wobble: 1.6,
    sparkle: true,
    sparkleColor: "rgba(255,180,120,0.45)",
    sparkleScale: 1.5,
  },
  rubble_heap: { base: 0.82, alpha: 0.03, wobble: 0.4 },
  spider_web: { base: 0.86, alpha: 0.06, wobble: 1.0 },
  ancient_rune: {
    base: 0.88,
    alpha: 0.12,
    wobble: 1.2,
    sparkle: true,
    sparkleColor: "rgba(120,180,255,0.45)",
    sparkleScale: 1.4,
  },
};

const dungeonData = generateDungeon();
const dungeonGrid = dungeonData.grid;
const dungeonRooms = dungeonData.rooms;
const spawnPoint = dungeonData.spawn;
const decorations = dungeonData.decorations;

const player = {
  x: spawnPoint.x * CELL_SIZE + CELL_SIZE / 2,
  y: spawnPoint.y * CELL_SIZE + CELL_SIZE / 2,
  radius: 18,
  speed: 240,
  maxHealth: 100,
  health: 100,
  damage: 25,
  attackCooldown: 420,
  attackRange: 110,
  lastAttack: 0,
  ammo: STARTING_AMMO,
  maxAmmo: 30,
  frame: 0,
  animTimer: 0,
  facingX: 1,
  facingY: 0,
  shootingTimer: 0,
};

const state = {
  running: true,
  over: false,
  startedAt: performance.now(),
  kills: 0,
  durationWhenOver: 0,
};

const keys = { up: false, down: false, left: false, right: false };

const joystickState = {
  active: false,
  pointerId: null,
  dx: 0,
  dy: 0,
};

const enemies = [];
let spawnAccumulator = 0;
const SPAWN_INTERVAL = 2400;
const SENTRY_VISION_RANGE = CELL_SIZE * 7.5;
const SENTRY_LOSE_RANGE = CELL_SIZE * 9;
const STUCK_THRESHOLD = 450;
const STUCK_DISTANCE = 6;

const ENEMY_TYPES = [
  {
    id: "gnasher",
    behaviour: "chaser",
    speed: 190,
    health: 35,
    damage: 10,
    color: "#f25858",
    weight: 0.45,
  },
  {
    id: "stalker",
    behaviour: "sentry",
    speed: 130,
    health: 45,
    damage: 8,
    color: "#8b5cf6",
    weight: 0.35,
  },
  {
    id: "mauler",
    behaviour: "brute",
    speed: 120,
    health: 70,
    damage: 15,
    color: "#f79d2a",
    weight: 0.2,
  },
];

const ammoDrops = [];
const AMMO_RESPAWN = 9000;
let ammoAccumulator = AMMO_RESPAWN;

const healthDrops = [];
const HEALTH_RESPAWN = 15000;
let healthAccumulator = HEALTH_RESPAWN;
const HEALTH_AMOUNT = 25;
const MIN_PICKUP_DISTANCE = CELL_SIZE * 9;
const PICKUP_LIFETIME = 60000;

const particles = [];
const ammoUsedPositions = new Set();
const healthUsedPositions = new Set();

function updateCanvasSize() {
  const dpr = window.devicePixelRatio || 1;
  const targetWidth = Math.min(960, window.innerWidth - 16);
  const targetHeight = isMobile ? window.innerHeight - 32 : Math.min(600, window.innerHeight - 160);
  canvas.width = targetWidth * dpr;
  canvas.height = targetHeight * dpr;
  canvas.style.width = `${targetWidth}px`;
  canvas.style.height = `${targetHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  VIEWPORT.width = targetWidth;
  VIEWPORT.height = targetHeight;
  const minimapSize = isMobile ? 140 : 180;
  minimapCanvas.width = minimapSize;
  minimapCanvas.height = minimapSize;
  minimapCanvas.style.width = `${minimapSize}px`;
  minimapCanvas.style.height = `${minimapSize}px`;
  minimapCtx.setTransform(1, 0, 0, 1, 0, 0);
}

function resetGame() {
  updateCanvasSize();
  player.x = spawnPoint.x * CELL_SIZE + CELL_SIZE / 2;
  player.y = spawnPoint.y * CELL_SIZE + CELL_SIZE / 2;
  player.health = player.maxHealth;
  player.ammo = STARTING_AMMO;
  player.lastAttack = 0;
  player.frame = 0;
  player.animTimer = 0;
  player.facingX = 1;
  player.facingY = 0;
  player.shootingTimer = 0;
  enemies.length = 0;
  ammoDrops.length = 0;
  healthDrops.length = 0;
  particles.length = 0;
  ammoUsedPositions.clear();
  healthUsedPositions.clear();
  spawnAccumulator = 0;
  ammoAccumulator = AMMO_RESPAWN;
  healthAccumulator = HEALTH_RESPAWN;
  state.running = true;
  state.over = false;
  state.startedAt = performance.now();
  state.kills = 0;
  overlay.classList.add("overlay--hidden");
  if (sharePreview) sharePreview.style.display = "none";
  document.body.classList.add("show-minimap");
  createAmmoDrop();
  createHealthDrop();
  updateHUD();
}

function createEnemy() {
  const template = pickEnemyType();
  const room = dungeonRooms[Math.floor(Math.random() * dungeonRooms.length)];
  const padding = 2;
  const tileX = room.x + padding + Math.floor(Math.random() * Math.max(1, room.width - padding * 2));
  const tileY = room.y + padding + Math.floor(Math.random() * Math.max(1, room.height - padding * 2));
  const enemy = {
    x: tileX * CELL_SIZE + CELL_SIZE / 2,
    y: tileY * CELL_SIZE + CELL_SIZE / 2,
    radius: 16,
    speed: template.speed + state.kills * 0.4,
    health: template.health,
    maxHealth: template.health,
    damageCooldown: 0,
    damage: template.damage,
    variant: template.id,
    behaviour: template.behaviour,
    state: template.behaviour === "sentry" ? "patrol" : "hunt",
    homeRoom: getRoomAt(tileX, tileY),
    stuckTimer: 0,
    prevX: tileX * CELL_SIZE + CELL_SIZE / 2,
    prevY: tileY * CELL_SIZE + CELL_SIZE / 2,
    color: template.color,
  };
  if (enemy.behaviour === "sentry") {
    assignPatrolTarget(enemy);
  }
  enemies.push(enemy);
}

function pickEnemyType() {
  const totalWeight = ENEMY_TYPES.reduce((sum, t) => sum + t.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const type of ENEMY_TYPES) {
    if ((roll -= type.weight) <= 0) {
      return type;
    }
  }
  return ENEMY_TYPES[0];
}

function createAmmoDrop() {
  const drop = generatePickupLocation();
  ammoUsedPositions.add(drop.key);
  ammoDrops.push({
    x: drop.x,
    y: drop.y,
    radius: 18,
    lifetime: PICKUP_LIFETIME,
    key: drop.key,
    bobPhase: Math.random() * Math.PI * 2,
    bobOffset: 0,
  });
}

function createHealthDrop() {
  const drop = generatePickupLocation(MIN_PICKUP_DISTANCE * 1.2);
  healthUsedPositions.add(drop.key);
  healthDrops.push({
    x: drop.x,
    y: drop.y,
    radius: 20,
    lifetime: PICKUP_LIFETIME,
    key: drop.key,
    bobPhase: Math.random() * Math.PI * 2,
    bobOffset: 0,
  });
}

function updateHUD() {
  healthEl.textContent = Math.max(player.health, 0).toString().padStart(3, " ");
  ammoEl.textContent = player.ammo.toString().padStart(3, " ");
  killsEl.textContent = state.kills.toString().padStart(3, "0");
  const elapsed = state.over ? state.durationWhenOver : Math.floor((performance.now() - state.startedAt) / 1000);
  const minutes = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const seconds = (elapsed % 60).toString().padStart(2, "0");
  timerEl.textContent = `${minutes}:${seconds}`;
}

function update(delta) {
  if (!state.running) return;
  const deltaSeconds = delta / 1000;
  player.shootingTimer = Math.max(0, player.shootingTimer - delta);

  let moveX = 0;
  let moveY = 0;
  if (keys.left) moveX -= 1;
  if (keys.right) moveX += 1;
  if (keys.up) moveY -= 1;
  if (keys.down) moveY += 1;
  if (joystickState.active) {
    moveX += joystickState.dx;
    moveY += joystickState.dy;
  }

  let movedPlayer = false;
  if (moveX !== 0 || moveY !== 0) {
    const len = Math.hypot(moveX, moveY);
    moveX /= len;
    moveY /= len;
    const nextX = player.x + moveX * player.speed * deltaSeconds;
    const nextY = player.y + moveY * player.speed * deltaSeconds;
    if (isWalkable(nextX, player.y, player.radius)) {
      player.x = nextX;
      movedPlayer = true;
    }
    if (isWalkable(player.x, nextY, player.radius)) {
      player.y = nextY;
      movedPlayer = true;
    }
    player.facingX = moveX;
    player.facingY = moveY;
  }

  if (movedPlayer) {
    player.animTimer += delta;
    if (player.animTimer >= 140) {
      player.animTimer = 0;
      player.frame = (player.frame + 1) % 4;
    }
  } else {
    player.animTimer = 0;
    player.frame = 0;
  }

  spawnAccumulator += delta;
  if (spawnAccumulator >= SPAWN_INTERVAL) {
    spawnAccumulator -= SPAWN_INTERVAL;
    createEnemy();
  }

  ammoAccumulator += delta;
  if (ammoAccumulator >= AMMO_RESPAWN) {
    ammoAccumulator -= AMMO_RESPAWN;
    createAmmoDrop();
  }

  healthAccumulator += delta;
  if (healthAccumulator >= HEALTH_RESPAWN) {
    healthAccumulator -= HEALTH_RESPAWN;
    createHealthDrop();
  }

  enemies.forEach((enemy) => {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.hypot(dx, dy) || 1;

    let moved = false;
    if (enemy.behaviour === "chaser" || enemy.behaviour === "brute" || enemy.state === "chase") {
      const dirX = dx / distance;
      const dirY = dy / distance;
      moved = stepEntity(enemy, dirX, dirY, enemy.speed, deltaSeconds, 0.65);

      if (
        enemy.behaviour === "sentry" &&
        (!hasLineOfSight(enemy.x, enemy.y, player.x, player.y) || distance > SENTRY_LOSE_RANGE)
      ) {
        enemy.state = "patrol";
        assignPatrolTarget(enemy);
      }
    } else {
      const seesPlayer = distance <= SENTRY_VISION_RANGE && hasLineOfSight(enemy.x, enemy.y, player.x, player.y);
      if (seesPlayer) {
        enemy.state = "chase";
      } else {
        if (!enemy.targetX || Math.hypot(enemy.targetX - enemy.x, enemy.targetY - enemy.y) < 12) {
          assignPatrolTarget(enemy);
        }
        const tdx = enemy.targetX - enemy.x;
        const tdy = enemy.targetY - enemy.y;
        const len = Math.hypot(tdx, tdy) || 1;
        moved = stepEntity(enemy, tdx / len, tdy / len, enemy.speed * 0.75, deltaSeconds, 0.65);
      }
    }

    if (!moved) {
      enemy.stuckTimer += delta;
      if (enemy.stuckTimer > STUCK_THRESHOLD) {
        const randomAngle = Math.random() * Math.PI * 2;
        stepEntity(enemy, Math.cos(randomAngle), Math.sin(randomAngle), enemy.speed, deltaSeconds, 0.55);
        enemy.stuckTimer = 0;
      if (enemy.behaviour === "sentry") assignPatrolTarget(enemy);
      }
    } else {
      enemy.stuckTimer = Math.max(0, enemy.stuckTimer - delta * 0.5);
    }

    if (Math.hypot(enemy.x - enemy.prevX, enemy.y - enemy.prevY) > STUCK_DISTANCE) {
      enemy.prevX = enemy.x;
      enemy.prevY = enemy.y;
      enemy.stuckTimer = Math.max(0, enemy.stuckTimer - delta);
    }

    enemy.damageCooldown = Math.max(0, enemy.damageCooldown - delta);
    if (distance < enemy.radius + player.radius + 4 && enemy.damageCooldown === 0) {
      player.health -= enemy.damage;
      enemy.damageCooldown = 700;
      spawnParticles(player.x, player.y, "#f45d5d");
      if (player.health <= 0) gameOver();
    }
  });

  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    if (enemies[i].health <= 0) {
      spawnParticles(enemies[i].x, enemies[i].y, "#f79d2a");
      enemies.splice(i, 1);
      state.kills += 1;
    }
  }

  for (let i = ammoDrops.length - 1; i >= 0; i -= 1) {
    const drop = ammoDrops[i];
    drop.lifetime -= delta;
    if (drop.bobPhase === undefined) {
      drop.bobPhase = Math.random() * Math.PI * 2;
    }
    drop.bobPhase += delta * PICKUP_BOB_SPEED;
    if (drop.bobPhase > Math.PI * 2) {
      drop.bobPhase -= Math.PI * 2;
    }
    drop.bobOffset = Math.sin(drop.bobPhase) * PICKUP_BOB_AMPLITUDE;
    if (drop.lifetime <= 0) {
      ammoUsedPositions.delete(drop.key);
      ammoDrops.splice(i, 1);
      continue;
    }
    const distance = Math.hypot(drop.x - player.x, drop.y - player.y);
    if (distance < drop.radius + player.radius) {
      player.ammo = Math.min(player.maxAmmo, player.ammo + 5);
      spawnParticles(drop.x, drop.y, "#62f2ff");
      ammoUsedPositions.delete(drop.key);
      ammoDrops.splice(i, 1);
    }
  }

  for (let i = healthDrops.length - 1; i >= 0; i -= 1) {
    const drop = healthDrops[i];
    drop.lifetime -= delta;
    if (drop.bobPhase === undefined) {
      drop.bobPhase = Math.random() * Math.PI * 2;
    }
    drop.bobPhase += delta * PICKUP_BOB_SPEED;
    if (drop.bobPhase > Math.PI * 2) {
      drop.bobPhase -= Math.PI * 2;
    }
    drop.bobOffset = Math.sin(drop.bobPhase) * PICKUP_BOB_AMPLITUDE;
    if (drop.lifetime <= 0) {
      healthUsedPositions.delete(drop.key);
      healthDrops.splice(i, 1);
      continue;
    }
    const distance = Math.hypot(drop.x - player.x, drop.y - player.y);
    if (distance < drop.radius + player.radius) {
      player.health = Math.min(player.maxHealth, player.health + HEALTH_AMOUNT);
      spawnParticles(drop.x, drop.y, "#66df81");
      healthUsedPositions.delete(drop.key);
      healthDrops.splice(i, 1);
    }
  }

  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const p = particles[i];
    p.life -= delta;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    p.x += p.vx * deltaSeconds;
    p.y += p.vy * deltaSeconds;
  }

  updateHUD();
}

function attack() {
  const now = performance.now();
  if (now - player.lastAttack < player.attackCooldown) return;
  if (player.ammo <= 0) return;
  player.lastAttack = now;
  player.ammo -= 1;
  player.shootingTimer = 200;
  spawnParticles(player.x, player.y, "#f9d64c", 160, 18);
  enemies.forEach((enemy) => {
    const distance = Math.hypot(enemy.x - player.x, enemy.y - player.y);
    if (distance <= player.attackRange) enemy.health -= player.damage;
  });
  updateHUD();
}

function gameOver() {
  if (state.over) return;
  state.running = false;
  state.over = true;
  state.durationWhenOver = Math.floor((performance.now() - state.startedAt) / 1000);
  const minutes = Math.floor(state.durationWhenOver / 60).toString().padStart(2, "0");
  const seconds = (state.durationWhenOver % 60).toString().padStart(2, "0");
  finalTimerEl.textContent = `${minutes}:${seconds}`;
  finalKillsEl.textContent = state.kills.toString().padStart(3, "0");
  finalAmmoEl.textContent = player.ammo.toString().padStart(3, "0");
  overlay.classList.remove("overlay--hidden");
  if (sharePreview) sharePreview.style.display = "block";
  renderShareCard(minutes, seconds);
}

function draw() {
  ctx.clearRect(0, 0, VIEWPORT.width, VIEWPORT.height);
  const cameraX = player.x - VIEWPORT.width / 2;
  const cameraY = player.y - VIEWPORT.height / 2;
  drawFloor(cameraX, cameraY);
  drawDecorations(cameraX, cameraY);
  drawAmmo(cameraX, cameraY);
  drawHealth(cameraX, cameraY);
  drawEnemies(cameraX, cameraY);
  drawPlayer(cameraX, cameraY);
  drawParticles(cameraX, cameraY);
  drawFog();
  if (isMobile) drawCanvasHUD();
  drawMinimap();
}

function drawAmmo(offsetX, offsetY) {
  ammoDrops.forEach((drop) => {
    const screenX = drop.x - offsetX;
    const screenY = drop.y - offsetY;
    drawPickupSprite(screenX, screenY, "ammo", drop.bobOffset || 0);
  });
}

function drawHealth(offsetX, offsetY) {
  healthDrops.forEach((drop) => {
    const screenX = drop.x - offsetX;
    const screenY = drop.y - offsetY;
    drawPickupSprite(screenX, screenY, "health", drop.bobOffset || 0);
  });
}

function drawPickupSprite(x, y, type, hoverOffset = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(PICKUP_SCALE, PICKUP_SCALE);
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath();
  ctx.ellipse(0, 0.9, 2.6, 1.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(x, y + hoverOffset);
  ctx.scale(PICKUP_SCALE, PICKUP_SCALE);

  if (type === "ammo") {
    ctx.fillStyle = "#1f1f1f";
    ctx.fillRect(-2.6, -2.4, 5.2, 4.0);
    ctx.fillStyle = "#58351a";
    ctx.fillRect(-2.2, -1.7, 4.4, 1.4);
    ctx.fillStyle = "#c16a28";
    ctx.fillRect(-1.6, -0.8, 3.2, 2.4);
    ctx.fillStyle = "#ffd27b";
    ctx.fillRect(-1.2, -0.2, 2.4, 1.0);
  } else {
    ctx.fillStyle = "#1a3c24";
    ctx.fillRect(-2.8, -2.6, 5.6, 5.2);
    ctx.fillStyle = "#66df81";
    ctx.fillRect(-1.8, -2.4, 3.6, 4.8);
    ctx.fillStyle = "#f2faf3";
    ctx.fillRect(-0.5, -1.8, 1.0, 3.6);
    ctx.fillRect(-1.8, -0.5, 3.6, 1.0);
  }
  ctx.restore();
}

function drawDecorations(offsetX, offsetY) {
  decorations.forEach((item) => {
    const x = item.x - offsetX;
    const y = item.y - offsetY;
    drawDecorationSprite(x, y, item);
  });
}

function drawDecorationSprite(x, y, decoration) {
  const type = decoration.type;
  const settings = DECOR_ANIM_SETTINGS[type] || DECOR_ANIM_DEFAULT;
  const time = animationTime / 1000;
  const freq = (decoration.speed || 1) * 1.2;
  const wobble = Math.sin(time * freq + (decoration.phase || 0)) * settings.wobble;
  const flicker =
    Math.sin(time * freq * 1.8 + (decoration.phase || 0) * 1.3) * settings.alpha * (decoration.intensity || 1);
  const baseAlpha = settings.base ?? DECOR_ANIM_DEFAULT.base;
  const alpha = Math.min(Math.max(baseAlpha + flicker, 0.35), 0.96);

  ctx.save();
  ctx.translate(x, y + wobble);
  ctx.scale(DECORATION_SCALE, DECORATION_SCALE);
  ctx.globalAlpha = alpha;

  switch (type) {
    case "stalagmite_small":
      ctx.fillStyle = "#2a2722";
      ctx.beginPath();
      ctx.moveTo(0, 2.4);
      ctx.lineTo(-1.2, -1.8);
      ctx.lineTo(1.2, -1.4);
      ctx.closePath();
      ctx.fill();
      break;
    case "stalagmite_tall":
      ctx.fillStyle = "#332f28";
      ctx.beginPath();
      ctx.moveTo(0, 2.6);
      ctx.lineTo(-1.4, -2.4);
      ctx.lineTo(0.8, -2.0);
      ctx.lineTo(1.4, -0.4);
      ctx.closePath();
      ctx.fill();
      break;
    case "stalactite_small":
      ctx.fillStyle = "#36312a";
      ctx.beginPath();
      ctx.moveTo(-0.8, -2.6);
      ctx.lineTo(0.8, -2.2);
      ctx.lineTo(0.0, 1.8);
      ctx.closePath();
      ctx.fill();
      break;
    case "stalactite_tall":
      ctx.fillStyle = "#2e2a24";
      ctx.beginPath();
      ctx.moveTo(-1.0, -2.8);
      ctx.lineTo(1.2, -2.4);
      ctx.lineTo(0.4, 2.2);
      ctx.lineTo(-0.6, 1.2);
      ctx.closePath();
      ctx.fill();
      break;
    case "moss_patch":
      ctx.fillStyle = "#2f5030";
      ctx.beginPath();
      ctx.ellipse(0, 0.2, 2.8, 1.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3f7a3b";
      ctx.ellipse(-0.6, 0, 1.4, 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "fungus_cluster":
      ctx.fillStyle = "#8c5dc4";
      ctx.beginPath();
      ctx.arc(-1.2, 0.6, 0.9, 0, Math.PI * 2);
      ctx.arc(0.8, 0.8, 1.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#56307f";
      ctx.fillRect(-1.4, 0.6, 0.3, 1.6);
      ctx.fillRect(0.7, 0.8, 0.3, 1.5);
      break;
    case "bone_pile":
      ctx.fillStyle = "#d9d4c9";
      ctx.fillRect(-1.8, 0.6, 3.6, 0.6);
      ctx.fillRect(-1.2, -0.4, 0.6, 1.6);
      ctx.fillRect(0.4, -0.3, 0.6, 1.5);
      break;
    case "skull":
      ctx.fillStyle = "#e6e2d8";
      ctx.fillRect(-1.0, -1.2, 2.0, 1.8);
      ctx.fillStyle = "#1b1b1b";
      ctx.fillRect(-0.6, -0.6, 0.6, 0.6);
      ctx.fillRect(0.2, -0.6, 0.6, 0.6);
      ctx.fillRect(-0.3, 0.2, 0.6, 0.5);
      break;
    case "broken_crate":
      ctx.fillStyle = "#6a3f1d";
      ctx.fillRect(-2.2, -2.2, 4.4, 4.4);
      ctx.strokeStyle = "#b87b42";
      ctx.lineWidth = 0.4;
      ctx.strokeRect(-2.2, -2.2, 4.4, 4.4);
      ctx.beginPath();
      ctx.moveTo(-2.2, -2.2);
      ctx.lineTo(2.2, 2.2);
      ctx.moveTo(-2.2, 2.2);
      ctx.lineTo(2.2, -2.2);
      ctx.stroke();
      break;
    case "rusted_barrel":
      ctx.fillStyle = "#4f3320";
      ctx.fillRect(-1.5, -2.4, 3.0, 4.8);
      ctx.fillStyle = "#d9842a";
      ctx.fillRect(-1.5, -1.2, 3.0, 0.6);
      ctx.fillRect(-1.5, 0.6, 3.0, 0.6);
      break;
    case "campfire_out":
      ctx.fillStyle = "#3b2a1c";
      ctx.fillRect(-2.0, 0.4, 4.0, 1.0);
      ctx.fillRect(-0.6, -0.8, 1.2, 2.2);
      break;
    case "campfire_glow":
      ctx.fillStyle = "rgba(247,157,42,0.45)";
      ctx.beginPath();
      ctx.ellipse(0, 0.6, 2.4, 1.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f79d2a";
      ctx.beginPath();
      ctx.moveTo(0, -1.8);
      ctx.lineTo(-1.0, 0.8);
      ctx.lineTo(1.0, 0.8);
      ctx.closePath();
      ctx.fill();
      break;
    case "torch_bracket":
      ctx.fillStyle = "#272727";
      ctx.fillRect(-0.4, -2.4, 0.8, 4.8);
      ctx.fillStyle = "#f79d2a";
      ctx.beginPath();
      ctx.arc(0, -2.8, 0.8, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "chain_hook":
      ctx.strokeStyle = "#4a4a4a";
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(0, -2.8);
      ctx.lineTo(0, 1.4);
      ctx.arc(0.4, 2.2, 0.9, Math.PI * 0.8, Math.PI * 1.8);
      ctx.stroke();
      break;
    case "drip_pool":
      ctx.fillStyle = "#1b2f3a";
      ctx.beginPath();
      ctx.ellipse(0, 0.6, 2.6, 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2d4f65";
      ctx.ellipse(-0.5, 0.4, 1.4, 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "crystal_blue":
      ctx.fillStyle = "#4ce1ff";
      ctx.beginPath();
      ctx.moveTo(0, -2.6);
      ctx.lineTo(1.1, 2.2);
      ctx.lineTo(-1.1, 2.2);
      ctx.closePath();
      ctx.fill();
      break;
    case "crystal_orange":
      ctx.fillStyle = "#ffa94d";
      ctx.beginPath();
      ctx.moveTo(-0.4, -2.4);
      ctx.lineTo(1.2, 2.0);
      ctx.lineTo(-1.6, 2.0);
      ctx.closePath();
      ctx.fill();
      break;
    case "rubble_heap":
      ctx.fillStyle = "#2a2320";
      ctx.beginPath();
      ctx.arc(-1.2, 0.8, 1.2, 0, Math.PI * 2);
      ctx.arc(1.0, 0.6, 1.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "spider_web":
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 0.2;
      ctx.beginPath();
      ctx.arc(0, 0, 2.4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-2.4, 0);
      ctx.lineTo(2.4, 0);
      ctx.moveTo(0, -2.4);
      ctx.lineTo(0, 2.4);
      ctx.stroke();
      break;
    case "ancient_rune":
      ctx.fillStyle = "rgba(120, 180, 255, 0.2)";
      ctx.beginPath();
      ctx.ellipse(0, 0, 2.6, 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#78b4ff";
      ctx.fillRect(-0.3, -1.4, 0.6, 2.8);
      ctx.fillRect(-1.1, -0.4, 2.2, 0.6);
      break;
    default:
      ctx.fillStyle = "#322c27";
      ctx.fillRect(-1.0, -1.0, 2.0, 2.0);
  }
  if (settings.sparkle) {
    const sparklePulse =
      0.35 + Math.abs(Math.sin(time * freq * 2.4 + (decoration.phase || 0) * 2)) * 0.45 * (decoration.intensity || 1);
    ctx.save();
    ctx.globalAlpha = Math.min(0.85, 0.25 + sparklePulse * 0.55);
    ctx.fillStyle = settings.sparkleColor || "rgba(255,255,255,0.5)";
    const sparkleScale = settings.sparkleScale || 1.1;
    ctx.beginPath();
    ctx.ellipse(
      0,
      -0.2,
      sparkleScale * (0.5 + sparklePulse * 0.5),
      sparkleScale * (0.35 + sparklePulse * 0.3),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawFloor(offsetX, offsetY) {
  const startCol = Math.floor(offsetX / CELL_SIZE) - 1;
  const endCol = Math.floor((offsetX + VIEWPORT.width) / CELL_SIZE) + 1;
  const startRow = Math.floor(offsetY / CELL_SIZE) - 1;
  const endRow = Math.floor((offsetY + VIEWPORT.height) / CELL_SIZE) + 1;

  for (let row = startRow; row <= endRow; row += 1) {
    for (let col = startCol; col <= endCol; col += 1) {
      const tile = getTile(col, row);
      const x = col * CELL_SIZE - offsetX;
      const y = row * CELL_SIZE - offsetY;
      if (tile === 1) {
        const noise = Math.abs(Math.sin(col * 12.94 + row * 7.12));
        const shade = Math.floor(24 + noise * 20);
        ctx.fillStyle = `rgb(${shade}, ${shade - 3}, ${shade - 6})`;
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        ctx.fillStyle = `rgba(${shade + 14}, ${shade + 6}, ${shade}, 0.12)`;
        ctx.beginPath();
        ctx.ellipse(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE / 2.6, CELL_SIZE / 3.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.02)";
        ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
        if (noise > 0.68) {
          ctx.fillStyle = "rgba(255,255,255,0.06)";
          ctx.beginPath();
          ctx.moveTo(x + 6, y + 6);
          ctx.lineTo(x + 10, y + 14);
          ctx.lineTo(x + 4, y + 16);
          ctx.closePath();
          ctx.fill();
        }
      } else if (tile === 2) {
        ctx.fillStyle = "#1a1412";
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = "rgba(247,157,42,0.28)";
        ctx.strokeRect(x + 10, y + 10, CELL_SIZE - 20, CELL_SIZE - 20);
        ctx.fillStyle = "rgba(247,157,42,0.18)";
        ctx.fillRect(x + 14, y + 14, CELL_SIZE - 28, CELL_SIZE - 28);
        ctx.fillStyle = "rgba(247,157,42,0.25)";
        ctx.fillRect(x + CELL_SIZE / 2 - 6, y + CELL_SIZE / 2 - 6, 12, 12);
      } else {
        const noise = Math.abs(Math.sin(col * 5.73 + row * 4.21));
        const base = Math.floor(4 + noise * 6);
        const topColor = `rgb(${Math.min(base + 12, 38)}, ${Math.min(base + 8, 34)}, ${Math.min(base + 16, 48)})`;
        const bottomColor = `rgb(${Math.max(base - 1, 0)}, ${Math.max(base - 2, 0)}, ${Math.max(base + 2, 4)})`;
        const gradient = ctx.createLinearGradient(x, y, x, y + CELL_SIZE);
        gradient.addColorStop(0, topColor);
        gradient.addColorStop(0.45, `rgb(${Math.max(base + 4, 6)}, ${Math.max(base + 2, 4)}, ${Math.max(base + 6, 8)})`);
        gradient.addColorStop(1, bottomColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        ctx.fillStyle = `rgba(96, 74, 56, ${0.06 + noise * 0.05})`;
        ctx.beginPath();
        ctx.moveTo(x + 12, y + 10);
        ctx.lineTo(x + CELL_SIZE - 14, y + 16);
        ctx.lineTo(x + CELL_SIZE - 20, y + CELL_SIZE - 12);
        ctx.lineTo(x + 10, y + CELL_SIZE - 18);
        ctx.closePath();
        ctx.fill();
        if (noise > 0.72) {
          ctx.strokeStyle = "rgba(180, 140, 90, 0.08)";
          ctx.beginPath();
          ctx.moveTo(x + 18, y + 12);
          ctx.lineTo(x + CELL_SIZE - 18, y + CELL_SIZE - 14);
          ctx.moveTo(x + 22, y + CELL_SIZE - 20);
          ctx.lineTo(x + CELL_SIZE - 12, y + 8);
          ctx.stroke();
        }
        ctx.strokeStyle = "rgba(0,0,0,0.85)";
        ctx.lineWidth = 1.6;
        ctx.strokeRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      }
    }
  }
}

function drawEnemies(offsetX, offsetY) {
  enemies.forEach((enemy) => {
    drawEnemySprite(enemy, offsetX, offsetY);
  });
}

function drawPlayer(offsetX, offsetY) {
  const screenX = player.x - offsetX;
  const screenY = player.y - offsetY;
  ctx.save();
  ctx.strokeStyle = "rgba(247,157,42,0.4)";
  ctx.setLineDash([8, 10]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(screenX, screenY, player.attackRange, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  let fx = player.facingX;
  let fy = player.facingY;
  if (Math.abs(fx) < 0.01 && Math.abs(fy) < 0.01) {
    fx = 1;
    fy = 0;
  }
  const angle = Math.atan2(fy, fx);
  drawPlayerSprite(screenX, screenY, player.frame, angle, player.shootingTimer > 0);
}

function drawPlayerSprite(x, y, frame, angle, shooting) {
  const scale = 2.8;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(0, 2.4, 3.4, 1.4, 0, 0, Math.PI * 2);
  ctx.fill();

  const legOffsets = [0, 0.35, 0, -0.35];
  const legOpp = [0, -0.35, 0, 0.35];
  const lf = legOffsets[frame % 4];
  const rf = legOpp[frame % 4];

  ctx.fillStyle = "#343434";
  ctx.fillRect(-1.4 + lf, 0.8, 1.1, 2.4);
  ctx.fillRect(0.3 + rf, 0.8, 1.1, 2.4);

  ctx.fillStyle = "#3764f0";
  ctx.fillRect(-2.2, -1.9, 4.4, 3.8);
  ctx.fillStyle = "#2546a6";
  ctx.fillRect(-2.2, -0.4, 4.4, 1.2);
  ctx.fillStyle = "#1f1f1f";
  ctx.fillRect(-2.0, -0.1, 4.0, 0.6);

  ctx.fillStyle = "#f0c9a6";
  ctx.fillRect(-3.0, -1.2, 0.7, 1.8);
  ctx.fillRect(2.3, -1.2, 0.7, 1.8);

  ctx.fillStyle = "#fbdcbf";
  ctx.fillRect(-1.5, -3.8, 3.0, 2.2);
  ctx.fillStyle = "#d89a65";
  ctx.fillRect(-1.5, -4.2, 3.0, 0.8);
  ctx.fillStyle = "#1d1d1d";
  ctx.fillRect(-1.1, -2.7, 2.2, 0.5);

  ctx.save();
  ctx.rotate(angle);
  ctx.translate(1.2, 0.3);
  if (shooting) {
    ctx.fillStyle = "#bcbcbc";
    ctx.fillRect(0.4, -0.25, 3.2, 0.5);
    ctx.fillStyle = "#8b5a2b";
    ctx.fillRect(-0.4, -0.3, 0.9, 0.6);
    ctx.fillStyle = "#ffd27b";
    ctx.fillRect(3.4, -0.35, 0.8, 0.7);
  } else {
    ctx.fillStyle = "#7c4a21";
    ctx.fillRect(0.2, -0.25, 2.6, 0.5);
    ctx.fillStyle = "#b3b3b3";
    ctx.fillRect(-0.3, -0.2, 0.7, 0.4);
  }
  ctx.restore();

  ctx.restore();
}

function drawEnemySprite(enemy, offsetX, offsetY) {
  const x = enemy.x - offsetX;
  const y = enemy.y - offsetY;
  const scale = enemy.behaviour === "brute" ? 3.2 : 2.6;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(0, 2.4, 3.0, 1.2, 0, 0, Math.PI * 2);
  ctx.fill();

  const palette = enemy.variant === "gnasher"
    ? { body: "#f25858", shell: "#2d0a0a", eye: "#f9f9f9" }
    : enemy.variant === "stalker"
      ? { body: "#8b5cf6", shell: "#291c4d", eye: "#f9f9f9" }
      : { body: "#f79d2a", shell: "#3b2610", eye: "#121212" };

  if (!enemy.animTimer) enemy.animTimer = 0;
  enemy.animTimer = (enemy.animTimer + 1) % 60;
  const wobble = Math.sin(enemy.animTimer / 10) * 0.2;

  ctx.fillStyle = palette.shell;
  ctx.fillRect(-2.8, -2.2, 5.6, 3.6);
  ctx.fillStyle = palette.body;
  ctx.fillRect(-2.0, -1.4, 4.0, 2.8);
  ctx.fillRect(-1.0, -2.8, 2.0, 1.4 + wobble);
  ctx.fillStyle = palette.eye;
  ctx.fillRect(0.6, -1.6, 1.0, 1.0);
  ctx.fillStyle = "#121212";
  ctx.fillRect(0.95, -1.35, 0.4, 0.4);

  ctx.fillStyle = palette.body;
  ctx.fillRect(-2.4, 0.6, 1.0, 2.2 - wobble);
  ctx.fillRect(1.4, 0.6, 1.0, 2.2 + wobble);

  ctx.restore();

  const healthRatio = Math.max(enemy.health / enemy.maxHealth, 0);
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(x - 24, y - 34, 48, 6);
  ctx.fillStyle = palette.body;
  ctx.fillRect(x - 24, y - 34, 48 * healthRatio, 6);
}

function drawParticles(offsetX, offsetY) {
  particles.forEach((p) => {
    const alpha = p.life / p.maxLife;
    ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha.toFixed(2)})`;
    ctx.fillRect(p.x - offsetX, p.y - offsetY, p.size, p.size);
  });
}

function drawFog() {
  const gradient = ctx.createRadialGradient(
    VIEWPORT.width / 2,
    VIEWPORT.height / 2,
    120,
    VIEWPORT.width / 2,
    VIEWPORT.height / 2,
    VIEWPORT.width / 1.2
  );
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(0,0,0,0.78)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, VIEWPORT.width, VIEWPORT.height);
}

function drawMinimap() {
  if (!minimapCanvas) return;
  const scaleX = minimapCanvas.width / (MAP_COLS * CELL_SIZE);
  const scaleY = minimapCanvas.height / (MAP_ROWS * CELL_SIZE);
  minimapCtx.fillStyle = "#090909";
  minimapCtx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);

  for (let row = 0; row < MAP_ROWS; row += 1) {
    for (let col = 0; col < MAP_COLS; col += 1) {
      const tile = dungeonGrid[row][col];
      if (tile === 0) continue;
      minimapCtx.fillStyle = tile === 1 ? "#1f1f1f" : "#523210";
      minimapCtx.fillRect(
        col * CELL_SIZE * scaleX,
        row * CELL_SIZE * scaleY,
        CELL_SIZE * scaleX,
        CELL_SIZE * scaleY
      );
    }
  }

  ammoDrops.forEach((drop) => {
    minimapCtx.fillStyle = "#62f2ff";
    minimapCtx.fillRect(drop.x * scaleX - 3, drop.y * scaleY - 3, 6, 6);
  });

  healthDrops.forEach((drop) => {
    minimapCtx.fillStyle = "#66df81";
    minimapCtx.fillRect(drop.x * scaleX - 3, drop.y * scaleY - 3, 6, 6);
  });

  enemies.forEach((enemy) => {
    minimapCtx.fillStyle = enemy.color || "#f45d5d";
    minimapCtx.fillRect(enemy.x * scaleX - 3, enemy.y * scaleY - 3, 6, 6);
  });

  minimapCtx.fillStyle = "#f9d64c";
  minimapCtx.fillRect(player.x * scaleX - 4, player.y * scaleY - 4, 8, 8);
}

function drawCanvasHUD() {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(12, 12, 220, 74);
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.strokeRect(12, 12, 220, 74);
  ctx.fillStyle = "#f2f2f2";
  ctx.font = "12px 'Press Start 2P', monospace";
  ctx.fillText(`HP ${Math.max(player.health, 0).toString().padStart(3, "0")}`, 24, 32);
  ctx.fillText(`AM ${player.ammo.toString().padStart(3, "0")}`, 24, 52);
  const elapsed = state.over
    ? state.durationWhenOver
    : Math.floor((performance.now() - state.startedAt) / 1000);
  const minutes = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const seconds = (elapsed % 60).toString().padStart(2, "0");
  ctx.fillText(`TM ${minutes}:${seconds}`, 24, 72);
  ctx.fillText(`KL ${state.kills.toString().padStart(3, "0")}`, 120, 52);
  ctx.restore();
}

function spawnParticles(x, y, colorHex, spread = 120, count = 12) {
  const color = hexToRgb(colorHex);
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 140 + Math.random() * spread;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 4 + Math.random() * 4,
      life: 320 + Math.random() * 200,
      maxLife: 520,
      color,
    });
  }
}

function hexToRgb(hex) {
  const value = parseInt(hex.replace("#", ""), 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function isWalkable(x, y, radius, shrink = 1) {
  const r = radius * shrink;
  const points = [
    { x: x - r, y: y - r },
    { x: x + r, y: y - r },
    { x: x - r, y: y + r },
    { x: x + r, y: y + r },
  ];
  return points.every((point) => {
    const col = Math.floor(point.x / CELL_SIZE);
    const row = Math.floor(point.y / CELL_SIZE);
    return getTile(col, row) !== 0;
  });
}

function getTile(col, row) {
  if (col < 0 || row < 0 || col >= MAP_COLS || row >= MAP_ROWS) return 0;
  return dungeonGrid[row][col];
}

function generateDungeon() {
  const grid = Array.from({ length: MAP_ROWS }, () => Array(MAP_COLS).fill(0));
  const rooms = [];
  const decorations = [];
  const roomCount = 22;
  for (let i = 0; i < roomCount; i += 1) {
    const width = 6 + Math.floor(Math.random() * 6);
    const height = 6 + Math.floor(Math.random() * 5);
    const x = 2 + Math.floor(Math.random() * (MAP_COLS - width - 4));
    const y = 2 + Math.floor(Math.random() * (MAP_ROWS - height - 4));
    const room = {
      x,
      y,
      width,
      height,
      centerX: x + Math.floor(width / 2),
      centerY: y + Math.floor(height / 2),
    };
    carveRoom(grid, room, 1);
    rooms.push(room);
  }

  rooms.sort((a, b) => a.centerX + a.centerY - (b.centerX + b.centerY));
  for (let i = 1; i < rooms.length; i += 1) connectRooms(grid, rooms[i - 1], rooms[i]);

  rooms.forEach((room, index) => {
    if (index % 3 === 0) {
      const alcoves = Math.floor(room.width / 3);
      for (let i = 0; i < alcoves; i += 1) {
        const alcoveX = room.x + room.width - 2;
        const alcoveY = room.y + 1 + i * 2;
        if (alcoveX + 1 < MAP_COLS && alcoveY < MAP_ROWS) {
          grid[alcoveY][alcoveX + 1] = 1;
          grid[alcoveY][alcoveX + 2] = 2;
        }
      }
    }
  });

  const spawnRoom = rooms[0];
  const decorationCells = new Set();

  function pickDecorationCell(room) {
    let best = null;
    let bestScore = -Infinity;
    for (let attempt = 0; attempt < 28; attempt += 1) {
      const tileX = room.x + 1 + Math.floor(Math.random() * Math.max(1, room.width - 2));
      const tileY = room.y + 1 + Math.floor(Math.random() * Math.max(1, room.height - 2));
      const key = `${tileX},${tileY}`;
      if (decorationCells.has(key)) continue;
      if (Math.abs(tileX - spawnRoom.centerX) <= 1 && Math.abs(tileY - spawnRoom.centerY) <= 1) continue;
      if (grid[tileY][tileX] === 0) continue;

      const worldX = tileX * CELL_SIZE + CELL_SIZE / 2;
      const worldY = tileY * CELL_SIZE + CELL_SIZE / 2;
      let tooClose = false;
      for (let d = decorations.length - 1; d >= 0; d -= 1) {
        const other = decorations[d];
        if (Math.hypot(other.x - worldX, other.y - worldY) < CELL_SIZE * 0.9) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;

      let wallTouch = 0;
      let openNeighbors = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx === 0 && dy === 0) continue;
          const nx = tileX + dx;
          const ny = tileY + dy;
          const neighbor =
            nx < 0 || ny < 0 || nx >= MAP_COLS || ny >= MAP_ROWS ? 0 : grid[ny][nx];
          if (neighbor === 0) wallTouch += 1;
          if (neighbor === 1 || neighbor === 2) openNeighbors += 1;
        }
      }
      if (openNeighbors < 4) continue;

      const adjacencyBonus = wallTouch * 2.2 + Math.max(openNeighbors - 4, 0);
      const distanceFromCenter = Math.hypot(tileX - room.centerX, tileY - room.centerY);
      const corridorPenalty = openNeighbors <= 5 ? 1.2 : 0;
      const score = adjacencyBonus - corridorPenalty - distanceFromCenter * 0.15 + Math.random() * 0.8;
      if (score > bestScore) {
        bestScore = score;
        best = { tileX, tileY, worldX, worldY, key };
      }
    }
    return best;
  }

  rooms.forEach((room) => {
    const decorCount = 4 + Math.floor(Math.random() * 5);
    for (let i = 0; i < decorCount; i += 1) {
      let spot = pickDecorationCell(room);
      if (!spot) {
        for (let attempt = 0; attempt < 16 && !spot; attempt += 1) {
          const fallbackX = room.x + 1 + Math.floor(Math.random() * Math.max(1, room.width - 2));
          const fallbackY = room.y + 1 + Math.floor(Math.random() * Math.max(1, room.height - 2));
          const fallbackKey = `${fallbackX},${fallbackY}`;
          if (decorationCells.has(fallbackKey)) continue;
          if (Math.abs(fallbackX - spawnRoom.centerX) <= 1 && Math.abs(fallbackY - spawnRoom.centerY) <= 1) continue;
          spot = {
            tileX: fallbackX,
            tileY: fallbackY,
            worldX: fallbackX * CELL_SIZE + CELL_SIZE / 2,
            worldY: fallbackY * CELL_SIZE + CELL_SIZE / 2,
            key: fallbackKey,
          };
        }
      }
      if (!spot || decorationCells.has(spot.key)) continue;
      decorationCells.add(spot.key);
      const type = DECOR_TYPES[Math.floor(Math.random() * DECOR_TYPES.length)];
      decorations.push({
        x: spot.worldX,
        y: spot.worldY,
        type,
        phase: Math.random() * Math.PI * 2,
        speed: 0.7 + Math.random() * 0.8,
        intensity: 0.6 + Math.random() * 0.6,
      });
    }
  });

  return { grid, rooms, decorations, spawn: { x: spawnRoom.centerX, y: spawnRoom.centerY } };
}

function carveRoom(grid, room, value) {
  for (let y = room.y; y < room.y + room.height; y += 1) {
    for (let x = room.x; x < room.x + room.width; x += 1) {
      grid[y][x] = value;
    }
  }
}

function connectRooms(grid, roomA, roomB) {
  let x = roomA.centerX;
  let y = roomA.centerY;
  while (x !== roomB.centerX) {
    grid[y][x] = 1;
    x += roomB.centerX > x ? 1 : -1;
  }
  while (y !== roomB.centerY) {
    grid[y][x] = 1;
    y += roomB.centerY > y ? 1 : -1;
  }
}

function generatePickupLocation(minDistance = MIN_PICKUP_DISTANCE) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const room = dungeonRooms[Math.floor(Math.random() * dungeonRooms.length)];
    const tileX = room.x + 1 + Math.floor(Math.random() * Math.max(1, room.width - 2));
    const tileY = room.y + 1 + Math.floor(Math.random() * Math.max(1, room.height - 2));
    const key = `${tileX},${tileY}`;
    if (ammoUsedPositions.has(key) || healthUsedPositions.has(key)) continue;
    const x = tileX * CELL_SIZE + CELL_SIZE / 2;
    const y = tileY * CELL_SIZE + CELL_SIZE / 2;
    if (Math.hypot(x - player.x, y - player.y) >= minDistance) {
      return { x, y, key };
    }
  }
  return {
    x: spawnPoint.x * CELL_SIZE + CELL_SIZE / 2,
    y: spawnPoint.y * CELL_SIZE + CELL_SIZE / 2,
    key: `${spawnPoint.x},${spawnPoint.y}`,
  };
}

function stepEntity(entity, dirX, dirY, speed, deltaSeconds, shrink = 1) {
  const baseAngle = Math.atan2(dirY, dirX);
  const attempts = [0, Math.PI / 6, -Math.PI / 6, Math.PI / 3, -Math.PI / 3, Math.PI / 2, -Math.PI / 2, Math.PI];
  for (let i = 0; i < attempts.length; i += 1) {
    const angle = baseAngle + attempts[i];
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const nextX = entity.x + dx * speed * deltaSeconds;
    const nextY = entity.y + dy * speed * deltaSeconds;
    if (isWalkable(nextX, entity.y, entity.radius, shrink) && isWalkable(entity.x, nextY, entity.radius, shrink)) {
      entity.x = nextX;
      entity.y = nextY;
      return true;
    }
  }
  return false;
}

function getRoomAt(col, row) {
  return (
    dungeonRooms.find(
      (room) => col >= room.x && col < room.x + room.width && row >= room.y && row < room.y + room.height
    ) || dungeonRooms[0]
  );
}

function assignPatrolTarget(enemy) {
  const room = enemy.homeRoom || getRoomAt(Math.floor(enemy.x / CELL_SIZE), Math.floor(enemy.y / CELL_SIZE));
  const tileX = room.x + 1 + Math.floor(Math.random() * Math.max(1, room.width - 2));
  const tileY = room.y + 1 + Math.floor(Math.random() * Math.max(1, room.height - 2));
  enemy.targetX = tileX * CELL_SIZE + CELL_SIZE / 2;
  enemy.targetY = tileY * CELL_SIZE + CELL_SIZE / 2;
}

function hasLineOfSight(ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const steps = Math.max(Math.abs(dx), Math.abs(dy)) / (CELL_SIZE / 2);
  for (let i = 1; i < steps; i += 1) {
    const tx = ax + (dx * i) / steps;
    const ty = ay + (dy * i) / steps;
    if (getTile(Math.floor(tx / CELL_SIZE), Math.floor(ty / CELL_SIZE)) === 0) {
      return false;
    }
  }
  return true;
}

function renderShareCard(minutes, seconds) {
  if (!shareCanvas) return;
  const width = shareCanvas.width;
  const height = shareCanvas.height;
  shareCtx.fillStyle = "#121212";
  shareCtx.fillRect(0, 0, width, height);
  const gradient = shareCtx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "rgba(60,60,60,0.25)");
  gradient.addColorStop(1, "rgba(18,18,18,0.85)");
  shareCtx.fillStyle = gradient;
  shareCtx.fillRect(14, 14, width - 28, height - 28);
  shareCtx.strokeStyle = "#2d2d2d";
  shareCtx.lineWidth = 4;
  shareCtx.strokeRect(14, 14, width - 28, height - 28);
  shareCtx.fillStyle = "#f2f2f2";
  shareCtx.font = "28px 'Press Start 2P', monospace";
  shareCtx.textAlign = "center";
  shareCtx.fillText("DUNGEON RUN", width / 2, 92);
  shareCtx.font = "18px 'Press Start 2P', monospace";
  shareCtx.fillStyle = "#9d9d9d";
  shareCtx.fillText(`Time ${minutes}:${seconds}`, width / 2, 160);
  shareCtx.fillText(`Kills ${state.kills.toString().padStart(3, "0")}`, width / 2, 200);
  shareCtx.fillText(`Ammo ${player.ammo.toString().padStart(3, "0")}`, width / 2, 240);
  shareCtx.font = "12px 'Press Start 2P', monospace";
  shareCtx.fillStyle = "#666666";
  shareCtx.fillText("#DungeonRun", width / 2, height - 48);
  shareCtx.fillText("quickpixel.games", width / 2, height - 28);
}

function downloadShareImage() {
  if (!shareCanvas) return;
  const link = document.createElement("a");
  link.href = shareCanvas.toDataURL("image/png");
  link.download = `dungeon-run-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

let lastTimestamp = performance.now();
let animationTime = 0;
function loop(now) {
  const delta = Math.min(now - lastTimestamp, 32);
  lastTimestamp = now;
  animationTime += delta;
  update(delta);
  draw();
  requestAnimationFrame(loop);
}

function handleKeyDown(event) {
  if (event.repeat) return;
  switch (event.key) {
    case "ArrowUp":
    case "w":
    case "W":
      keys.up = true;
      break;
    case "ArrowDown":
    case "s":
    case "S":
      keys.down = true;
      break;
    case "ArrowLeft":
    case "a":
    case "A":
      keys.left = true;
      break;
    case "ArrowRight":
    case "d":
    case "D":
      keys.right = true;
      break;
    case " ":
    case "Enter":
      attack();
      break;
    default:
      return;
  }
  event.preventDefault();
}

function handleKeyUp(event) {
  switch (event.key) {
    case "ArrowUp":
    case "w":
    case "W":
      keys.up = false;
      break;
    case "ArrowDown":
    case "s":
    case "S":
      keys.down = false;
      break;
    case "ArrowLeft":
    case "a":
    case "A":
      keys.left = false;
      break;
    case "ArrowRight":
    case "d":
    case "D":
      keys.right = false;
      break;
    default:
  }
}

function handleJoystickStart(event) {
  joystickState.active = true;
  joystickState.pointerId = event.pointerId;
  joystickState.dx = 0;
  joystickState.dy = 0;
  joystickThumb.style.transform = "translate(-50%, -50%)";
  joystick.setPointerCapture(event.pointerId);
  event.preventDefault();
}

function handleJoystickMove(event) {
  if (!joystickState.active || event.pointerId !== joystickState.pointerId) return;
  const rect = joystick.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  let dx = event.clientX - centerX;
  let dy = event.clientY - centerY;
  const maxDistance = rect.width / 2;
  const distance = Math.min(Math.hypot(dx, dy), maxDistance);
  const angle = Math.atan2(dy, dx);
  dx = Math.cos(angle) * distance;
  dy = Math.sin(angle) * distance;
  joystickThumb.style.transform = `translate(${dx}px, ${dy}px)`;
  joystickState.dx = dx / maxDistance;
  joystickState.dy = dy / maxDistance;
  event.preventDefault();
}

function handleJoystickEnd(event) {
  if (event.pointerId !== joystickState.pointerId) return;
  joystickState.active = false;
  joystickState.pointerId = null;
  joystickState.dx = 0;
  joystickState.dy = 0;
  joystickThumb.style.transform = "translate(-50%, -50%)";
  joystick.releasePointerCapture(event.pointerId);
  event.preventDefault();
}

function setupMobile() {
  if (isMobile) {
    joystick.style.display = "block";
    attackBtn.style.display = "block";
  } else {
    joystick.style.display = "none";
    attackBtn.style.display = "none";
  }
}

function init() {
  setupMobile();
  updateCanvasSize();
  resetGame();
  requestAnimationFrame(loop);
}

attackBtn.addEventListener("pointerdown", (event) => {
  attack();
  event.preventDefault();
});

joystick.addEventListener("pointerdown", handleJoystickStart);
joystick.addEventListener("pointermove", handleJoystickMove);
joystick.addEventListener("pointerup", handleJoystickEnd);
joystick.addEventListener("pointercancel", handleJoystickEnd);

document.addEventListener("keydown", handleKeyDown, { passive: false });
document.addEventListener("keyup", handleKeyUp, { passive: false });
canvas.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse") attack();
});

restartBtn.addEventListener("click", resetGame);
if (shareBtn) shareBtn.addEventListener("click", downloadShareImage);

window.addEventListener("resize", () => {
  isMobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 768;
  setupMobile();
  updateCanvasSize();
});

init();
