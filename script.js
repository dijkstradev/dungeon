const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const healthEl = document.querySelector(".health");
const ammoEl = document.querySelector(".ammo");
const timerEl = document.querySelector(".timer");
const killsEl = document.querySelector(".kills");
const hungerEl = document.querySelector(".hunger");
const overlay = document.getElementById("game-over");
const finalTimerEl = document.querySelector(".final-timer");
const finalKillsEl = document.querySelector(".final-kills");
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
const achievementBanner = document.getElementById("achievement-banner");
const pauseBtn = document.getElementById("pause-btn");
const infoBtn = document.getElementById("info-btn");
const infoOverlay = document.getElementById("info-overlay");
const infoClose = document.getElementById("info-close");
let isMobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 768;

const STARTING_AMMO = 30;
const PICKUP_BOB_SPEED = 0.005;
const PICKUP_BOB_AMPLITUDE = 8;
const DECORATION_SCALE = 3.8;
const PICKUP_SCALE = 3.8;
const BASE_GUN_DAMAGE = 25;
const BASE_GUN_COOLDOWN = 420;
const BASE_GUN_RANGE = 110;
const GUN_UPGRADE_FIRST = 5;
const GUN_UPGRADE_INTERVAL = 15;
const GUN_DAMAGE_STEP = 4;
const GUN_COOLDOWN_STEP = 30;
const GUN_RANGE_STEP = 14;
const GUN_COOLDOWN_MIN = 180;
const ENEMY_SPAWN_FLASH = 520;
const BASE_HUNGER_RATE = 0.72;
const MEAT_COLOR = "#ff9b3d";
const MAX_MUTATION_STAGE = 20;
const ELITE_ENEMY_UNLOCK_MS = 5 * 60 * 1000;

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

const DECOR_GROUPS = {
  stalagmite_small: ["stalagmite_small", "stalagmite_tall", "moss_patch"],
  stalagmite_tall: ["stalagmite_small", "stalagmite_tall", "moss_patch"],
  stalactite_small: ["stalactite_small", "stalactite_tall", "spider_web"],
  stalactite_tall: ["stalactite_small", "stalactite_tall", "spider_web"],
  moss_patch: ["moss_patch", "fungus_cluster", "drip_pool"],
  fungus_cluster: ["fungus_cluster", "moss_patch", "crystal_blue"],
  bone_pile: ["bone_pile", "skull", "rubble_heap"],
  skull: ["skull", "bone_pile", "ancient_rune"],
  broken_crate: ["broken_crate", "rubble_heap", "rusted_barrel"],
  rusted_barrel: ["rusted_barrel", "broken_crate", "rubble_heap"],
  campfire_out: ["campfire_out", "rubble_heap", "broken_crate"],
  campfire_glow: ["campfire_glow", "torch_bracket", "ancient_rune"],
  torch_bracket: ["torch_bracket", "campfire_glow", "ancient_rune"],
  chain_hook: ["chain_hook", "spider_web", "stalactite_small"],
  drip_pool: ["drip_pool", "moss_patch", "fungus_cluster"],
  crystal_blue: ["crystal_blue", "crystal_orange", "ancient_rune"],
  crystal_orange: ["crystal_orange", "crystal_blue", "ancient_rune"],
  rubble_heap: ["rubble_heap", "broken_crate", "bone_pile"],
  spider_web: ["spider_web", "stalactite_small", "chain_hook"],
  ancient_rune: ["ancient_rune", "crystal_blue", "campfire_glow"],
};

const DECOR_CLUSTER_OFFSETS = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
  { x: 1, y: 1 },
  { x: -1, y: 1 },
  { x: 1, y: -1 },
  { x: -1, y: -1 },
  { x: 2, y: 0 },
  { x: 0, y: 2 },
  { x: -2, y: 0 },
  { x: 0, y: -2 },
];

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
  damage: BASE_GUN_DAMAGE,
  attackCooldown: BASE_GUN_COOLDOWN,
  attackRange: BASE_GUN_RANGE,
  lastAttack: 0,
  ammo: STARTING_AMMO,
  maxAmmo: 10000000,
  frame: 0,
  animTimer: 0,
  facingX: 1,
  facingY: 0,
  shootingTimer: 0,
  gunLevel: 0,
  nextGunUpgrade: GUN_UPGRADE_FIRST,
  hunger: 0,
  hungerRate: BASE_HUNGER_RATE,
  hungerEaten: 0,
  mutationStage: 0,
};

const state = {
  running: true,
  over: false,
  startedAt: performance.now(),
  kills: 0,
  durationWhenOver: 0,
  paused: false,
};

let manualPauseActive = false;
let infoPauseActive = false;
let achievementTimer = 0;
let lastTimestamp = performance.now();
let animationTime = 0;
let hungerWarningLevel = 0;

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
    speedGrowth: 0.42,
    health: 35,
    damage: 10,
    color: "#f25858",
    weight: 0.45,
    radius: 16,
    drawScale: 2.6,
    shadowWidth: 3.0,
    shadowHeight: 1.2,
    collisionShrink: 0.66,
  },
  {
    id: "stalker",
    behaviour: "sentry",
    speed: 130,
    speedGrowth: 0.36,
    health: 45,
    damage: 8,
    color: "#8b5cf6",
    weight: 0.35,
    radius: 16,
    drawScale: 2.7,
    shadowWidth: 3.1,
    shadowHeight: 1.25,
    collisionShrink: 0.66,
  },
  {
    id: "mauler",
    behaviour: "brute",
    speed: 120,
    speedGrowth: 0.4,
    health: 70,
    damage: 15,
    color: "#f79d2a",
    weight: 0.2,
    radius: 19,
    drawScale: 3.2,
    shadowWidth: 3.4,
    shadowHeight: 1.4,
    collisionShrink: 0.62,
  },
  {
    id: "blightfang",
    behaviour: "chaser",
    speed: 230,
    speedGrowth: 0.55,
    health: 110,
    damage: 20,
    color: "#ff8456",
    weight: 0.18,
    radius: 18,
    drawScale: 3.0,
    shadowWidth: 3.2,
    shadowHeight: 1.3,
    collisionShrink: 0.62,
    unlockMs: ELITE_ENEMY_UNLOCK_MS,
    lungeRange: CELL_SIZE * 1.3,
    lungeCooldown: 2400,
    lungeDuration: 260,
    lungeSpeedMultiplier: 3.15,
    initialLungeDelayMultiplier: 0.7,
    lungeParticleColor: "#ffb37a",
    hasteThreshold: 0.45,
    hasteMultiplier: 1.24,
  },
  {
    id: "voidreaver",
    behaviour: "sentry",
    speed: 190,
    speedGrowth: 0.5,
    health: 140,
    damage: 26,
    color: "#7d7bff",
    weight: 0.12,
    radius: 20,
    drawScale: 3.2,
    shadowWidth: 3.5,
    shadowHeight: 1.4,
    collisionShrink: 0.6,
    unlockMs: ELITE_ENEMY_UNLOCK_MS,
    lungeRange: CELL_SIZE * 1.5,
    lungeCooldown: 2800,
    lungeDuration: 300,
    lungeSpeedMultiplier: 3.0,
    initialLungeDelayMultiplier: 0.75,
    lungeParticleColor: "#b6a5ff",
    hasteThreshold: 0.5,
    hasteMultiplier: 1.18,
  },
  {
    id: "doomclaw",
    behaviour: "brute",
    speed: 160,
    speedGrowth: 0.48,
    health: 180,
    damage: 32,
    color: "#ff4d7a",
    weight: 0.14,
    radius: 22,
    drawScale: 3.4,
    shadowWidth: 3.8,
    shadowHeight: 1.55,
    collisionShrink: 0.6,
    unlockMs: ELITE_ENEMY_UNLOCK_MS,
    lungeRange: CELL_SIZE * 1.45,
    lungeCooldown: 3200,
    lungeDuration: 340,
    lungeSpeedMultiplier: 2.85,
    initialLungeDelayMultiplier: 0.8,
    lungeParticleColor: "#ff6f9d",
    hasteThreshold: 0.5,
    hasteMultiplier: 1.22,
  },
];

const TITAN_TEMPLATE = {
  id: "titan",
  behaviour: "titan",
  speed: 68,
  health: 260,
  damage: 50,
  color: "#ff4d94",
};

const TITAN_LUNGE_RANGE = CELL_SIZE * 1.6;
const TITAN_LUNGE_COOLDOWN = 3000;
const TITAN_LUNGE_DURATION = 420;
const TITAN_LUNGE_SPEED_MULT = 3.6;

const ammoDrops = [];
const AMMO_RESPAWN = 9000;
let ammoAccumulator = AMMO_RESPAWN;

const healthDrops = [];
const HEALTH_RESPAWN = 15000;
let healthAccumulator = HEALTH_RESPAWN;
const HEALTH_AMOUNT = 25;
const MIN_PICKUP_DISTANCE = CELL_SIZE * 9;
const PICKUP_LIFETIME = 60000;
const MEAT_HUNGER_RESTORE = 22;
const HUNGER_MAX = 100;
const MEAT_SPAWN_LIFETIME = 45000;
const MEAT_HOVER_SCALE = 2.4;
const MUTATION_EAT_INTERVAL = 5;
const HUNGER_WARNING_THRESHOLD = 70;
const HUNGER_CRITICAL_THRESHOLD = 90;

const particles = [];
const ammoUsedPositions = new Set();
const healthUsedPositions = new Set();
const TITAN_SPAWN_INTERVAL = 60000;
let titanAccumulator = 0;
const meatDrops = [];
const meatUsedPositions = new Set();
const MEAT_DROP_PROBABILITY = 0.58;

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
  closeInfoOverlay(false);
  updateCanvasSize();
  player.x = spawnPoint.x * CELL_SIZE + CELL_SIZE / 2;
  player.y = spawnPoint.y * CELL_SIZE + CELL_SIZE / 2;
  player.health = player.maxHealth;
  player.ammo = STARTING_AMMO;
  player.damage = BASE_GUN_DAMAGE;
  player.attackCooldown = BASE_GUN_COOLDOWN;
  player.attackRange = BASE_GUN_RANGE;
  player.lastAttack = 0;
  player.frame = 0;
  player.animTimer = 0;
  player.facingX = 1;
  player.facingY = 0;
  player.shootingTimer = 0;
  player.gunLevel = 0;
  player.nextGunUpgrade = GUN_UPGRADE_FIRST;
  player.hunger = 0;
  player.hungerRate = BASE_HUNGER_RATE;
  player.hungerEaten = 0;
  player.mutationStage = 0;
  enemies.length = 0;
  ammoDrops.length = 0;
  healthDrops.length = 0;
  meatDrops.length = 0;
  particles.length = 0;
  ammoUsedPositions.clear();
  healthUsedPositions.clear();
  meatUsedPositions.clear();
  spawnAccumulator = 0;
  ammoAccumulator = AMMO_RESPAWN;
  healthAccumulator = HEALTH_RESPAWN;
  titanAccumulator = 0;
  state.running = true;
  state.over = false;
  state.startedAt = performance.now();
  state.kills = 0;
  manualPauseActive = false;
  infoPauseActive = false;
  state.paused = false;
  applyPauseState();
  overlay.classList.add("overlay--hidden");
  if (sharePreview) sharePreview.style.display = "none";
  if (achievementBanner) {
    achievementBanner.classList.remove("achievement-banner--visible");
    achievementBanner.textContent = "";
  }
  achievementTimer = 0;
  hungerWarningLevel = 0;
  document.body.classList.add("show-minimap");
  createAmmoDrop();
  createHealthDrop();
  createTitanEnemy();
  updateHUD();
}

function createEnemy() {
  const template = pickEnemyType();
  const room = dungeonRooms[Math.floor(Math.random() * dungeonRooms.length)];
  const padding = 2;
  const tileX = room.x + padding + Math.floor(Math.random() * Math.max(1, room.width - padding * 2));
  const tileY = room.y + padding + Math.floor(Math.random() * Math.max(1, room.height - padding * 2));
  const speedGrowth = template.speedGrowth ?? 0.4;
  const enemy = {
    x: tileX * CELL_SIZE + CELL_SIZE / 2,
    y: tileY * CELL_SIZE + CELL_SIZE / 2,
    radius: template.radius ?? 16,
    speed: template.speed + state.kills * speedGrowth,
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
    spawnTimer: ENEMY_SPAWN_FLASH,
    drawScale: template.drawScale,
    shadowWidth: template.shadowWidth,
    shadowHeight: template.shadowHeight,
    collisionShrink: template.collisionShrink,
  };
  if (template.lungeRange) {
    enemy.lungeRange = template.lungeRange;
    enemy.lungeCooldownBase = template.lungeCooldown || 2600;
    enemy.lungeCooldownTimer =
      enemy.lungeCooldownBase * (template.initialLungeDelayMultiplier ?? 0.6);
    enemy.lungeDuration = template.lungeDuration || 260;
    enemy.lungeSpeedMultiplier = template.lungeSpeedMultiplier || 2.6;
    enemy.lungeParticleColor = template.lungeParticleColor || template.color || "#ff4d94";
    enemy.hasteThreshold = template.hasteThreshold;
    enemy.hasteMultiplier = template.hasteMultiplier;
    enemy.isLunging = false;
    enemy.lungeTimer = 0;
    enemy.lungeDirX = 0;
    enemy.lungeDirY = 0;
  }
  if (enemy.behaviour === "sentry") {
    assignPatrolTarget(enemy);
  }
  enemies.push(enemy);
  spawnParticles(enemy.x, enemy.y, template.color, 140, 20);
}

function createTitanEnemy() {
  const template = TITAN_TEMPLATE;
  const playerTileX = Math.floor(player.x / CELL_SIZE);
  const playerTileY = Math.floor(player.y / CELL_SIZE);
  const sortedRooms = [...dungeonRooms].sort((a, b) => {
    const aDx = a.centerX - playerTileX;
    const aDy = a.centerY - playerTileY;
    const bDx = b.centerX - playerTileX;
    const bDy = b.centerY - playerTileY;
    return Math.hypot(bDx, bDy) - Math.hypot(aDx, aDy);
  });
  const room = sortedRooms[0] || dungeonRooms[0];
  const padding = 2;
  const tileX = room.x + padding + Math.floor(Math.random() * Math.max(1, room.width - padding * 2));
  const tileY = room.y + padding + Math.floor(Math.random() * Math.max(1, room.height - padding * 2));
  const enemy = {
    x: tileX * CELL_SIZE + CELL_SIZE / 2,
    y: tileY * CELL_SIZE + CELL_SIZE / 2,
    radius: 26,
    speed: template.speed + state.kills * 0.2,
    health: template.health,
    maxHealth: template.health,
    damageCooldown: 0,
    damage: template.damage,
    variant: template.id,
    behaviour: template.behaviour,
    state: "hunt",
    homeRoom: getRoomAt(tileX, tileY),
    stuckTimer: 0,
    prevX: tileX * CELL_SIZE + CELL_SIZE / 2,
    prevY: tileY * CELL_SIZE + CELL_SIZE / 2,
    color: template.color,
    drawScale: 4.4,
    shadowWidth: 4.6,
    shadowHeight: 1.8,
    collisionShrink: 0.6,
    lungeRange: TITAN_LUNGE_RANGE,
    lungeCooldownBase: TITAN_LUNGE_COOLDOWN,
    lungeCooldownTimer: TITAN_LUNGE_COOLDOWN * 0.6,
    lungeSpeedMultiplier: TITAN_LUNGE_SPEED_MULT,
    lungeDuration: TITAN_LUNGE_DURATION,
    lungeParticleColor: "#ff4d94",
    hasteThreshold: 0.35,
    hasteMultiplier: 1.12,
    lungeTimer: 0,
    isLunging: false,
    lungeDirX: 0,
    lungeDirY: 0,
    walkCycle: 0,
    glowPhase: Math.random() * Math.PI * 2,
    spawnTimer: ENEMY_SPAWN_FLASH,
  };
  enemies.push(enemy);
  spawnParticles(enemy.x, enemy.y, template.color, 160, 26);
}

function pickEnemyType() {
  const elapsed = performance.now() - (state.startedAt || 0);
  const unlocked = ENEMY_TYPES.filter((type) => !type.unlockMs || elapsed >= type.unlockMs);
  const pool =
    unlocked.length > 0
      ? unlocked
      : ENEMY_TYPES.filter((type) => !type.unlockMs) || ENEMY_TYPES;
  const totalWeight = pool.reduce((sum, t) => sum + t.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const type of pool) {
    if ((roll -= type.weight) <= 0) {
      return type;
    }
  }
  return pool[0] || ENEMY_TYPES[0];
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

function scheduleMeatDrop(enemy, color, guaranteed = false) {
  const willDrop = guaranteed || Math.random() < MEAT_DROP_PROBABILITY;
  if (!willDrop) return;
  createMeatDrop(enemy.x, enemy.y, color || MEAT_COLOR);
}

function createMeatDrop(baseX, baseY, color = MEAT_COLOR) {
  let spawnX = baseX;
  let spawnY = baseY;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * CELL_SIZE * 0.4;
    const candidateX = baseX + Math.cos(angle) * distance;
    const candidateY = baseY + Math.sin(angle) * distance;
    const col = Math.floor(candidateX / CELL_SIZE);
    const row = Math.floor(candidateY / CELL_SIZE);
    if (getTile(col, row) === 0) continue;
    const key = `${col},${row}`;
    if (meatUsedPositions.has(key)) continue;
    spawnX = candidateX;
    spawnY = candidateY;
    break;
  }
  const finalCol = Math.floor(spawnX / CELL_SIZE);
  const finalRow = Math.floor(spawnY / CELL_SIZE);
  const finalKey = `${finalCol},${finalRow}`;
  if (getTile(finalCol, finalRow) === 0) return;
  if (meatUsedPositions.has(finalKey)) return;
  meatUsedPositions.add(finalKey);
  meatDrops.push({
    x: spawnX,
    y: spawnY,
    radius: 18,
    lifetime: MEAT_SPAWN_LIFETIME,
    bobPhase: Math.random() * Math.PI * 2,
    bobOffset: 0,
    color,
    key: finalKey,
    restore: MEAT_HUNGER_RESTORE,
  });
}

function updateHUD() {
  healthEl.textContent = Math.max(player.health, 0).toString().padStart(3, " ");
  ammoEl.textContent = player.ammo.toString().padStart(3, " ");
  killsEl.textContent = state.kills.toString().padStart(3, "0");
  if (hungerEl) hungerEl.textContent = Math.floor(player.hunger).toString().padStart(3, " ");
  const elapsed = state.over ? state.durationWhenOver : Math.floor((performance.now() - state.startedAt) / 1000);
  const minutes = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const seconds = (elapsed % 60).toString().padStart(2, "0");
  timerEl.textContent = `${minutes}:${seconds}`;
}

function showAchievement(text) {
  if (!achievementBanner) return;
  achievementBanner.textContent = text;
  achievementBanner.classList.add("achievement-banner--visible");
  achievementTimer = 10000;
}

function eatMeat(amount = MEAT_HUNGER_RESTORE) {
  player.hunger = Math.max(0, player.hunger - amount);
  player.hungerEaten += 1;
  const nextStage = Math.floor(player.hungerEaten / MUTATION_EAT_INTERVAL);
  const clampedStage = Math.min(nextStage, MAX_MUTATION_STAGE);
  if (clampedStage > player.mutationStage) {
    player.mutationStage = clampedStage;
    const milestoneMeals = Math.min(
      clampedStage * MUTATION_EAT_INTERVAL,
      MAX_MUTATION_STAGE * MUTATION_EAT_INTERVAL,
    );
    showAchievement(`You feel different... (${milestoneMeals} meals)`);
  }
  updateHUD();
}

function updatePauseButton() {
  if (!pauseBtn) return;
  pauseBtn.textContent = state.paused ? "Play" : "Pause";
  pauseBtn.setAttribute("aria-pressed", state.paused ? "true" : "false");
  pauseBtn.setAttribute("aria-label", state.paused ? "Resume game" : "Pause game");
  pauseBtn.classList.toggle("pause-btn--active", state.paused);
}

function applyPauseState() {
  const shouldPause = manualPauseActive || infoPauseActive;
  const changed = state.paused !== shouldPause;
  state.paused = shouldPause;
  updatePauseButton();
  if (state.paused) {
    keys.up = keys.down = keys.left = keys.right = false;
    joystickState.active = false;
    if (joystickState.pointerId !== null && joystick && typeof joystick.releasePointerCapture === "function") {
      try {
        joystick.releasePointerCapture(joystickState.pointerId);
      } catch (error) {
        // ignore release errors
      }
    }
    joystickState.pointerId = null;
    joystickState.dx = 0;
    joystickState.dy = 0;
    if (joystickThumb) joystickThumb.style.transform = "translate(-50%, -50%)";
  }
  if (!state.paused && changed) {
    lastTimestamp = performance.now();
  }
}

function handleGunUpgrade() {
  while (state.kills >= player.nextGunUpgrade) {
    const prevDamage = player.damage;
    const prevCooldown = player.attackCooldown;
    const prevRange = player.attackRange;

    player.gunLevel += 1;
    player.nextGunUpgrade += GUN_UPGRADE_INTERVAL;

    const newDamage = BASE_GUN_DAMAGE + player.gunLevel * GUN_DAMAGE_STEP;
    const newCooldown = Math.max(
      BASE_GUN_COOLDOWN - player.gunLevel * GUN_COOLDOWN_STEP,
      GUN_COOLDOWN_MIN,
    );
    const newRange = BASE_GUN_RANGE + player.gunLevel * GUN_RANGE_STEP;

    player.damage = newDamage;
    player.attackCooldown = newCooldown;
    player.attackRange = newRange;
    player.ammo = Math.max(player.ammo, STARTING_AMMO);

    const damageGain = newDamage - prevDamage;
    const fireRateGain =
      prevCooldown > 0 ? Math.round(((prevCooldown - newCooldown) / prevCooldown) * 100) : 0;
    const rangeGain = newRange - prevRange;
    const levelLabel = `MK-${String(player.gunLevel + 1).padStart(2, "0")}`;
    const prefix = player.gunLevel === 1 ? "5 Kills! " : "";
    showAchievement(
      `${prefix}Shotgun upgrade ${levelLabel}! Damage +${damageGain}, fire rate +${Math.max(fireRateGain, 0)}%, range +${rangeGain}`,
    );
  }
}

function update(delta) {
  if (!state.running || state.paused) return;
  const deltaSeconds = delta / 1000;
  player.shootingTimer = Math.max(0, player.shootingTimer - delta);

  if (achievementTimer > 0) {
    achievementTimer -= delta;
    if (achievementTimer <= 0) {
      achievementTimer = 0;
      if (achievementBanner) {
        achievementBanner.classList.remove("achievement-banner--visible");
      }
    }
  }

  player.hunger = Math.min(HUNGER_MAX, player.hunger + player.hungerRate * deltaSeconds);
  const hungerLevel = player.hunger >= HUNGER_CRITICAL_THRESHOLD ? 2 : player.hunger >= HUNGER_WARNING_THRESHOLD ? 1 : 0;
  if (hungerLevel > hungerWarningLevel) {
    if (hungerLevel === 2) {
      showAchievement(`Hunger critical (${Math.floor(player.hunger)}%)!`);
    } else if (hungerLevel === 1) {
      showAchievement(`Hunger rising (${Math.floor(player.hunger)}%)`);
    }
  }
  hungerWarningLevel = hungerLevel;
  if (player.hunger >= HUNGER_MAX) {
    showAchievement("You starved to death...");
    player.health = 0;
    updateHUD();
    gameOver();
    return;
  }

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

  titanAccumulator += delta;
  if (titanAccumulator >= TITAN_SPAWN_INTERVAL) {
    titanAccumulator -= TITAN_SPAWN_INTERVAL;
    createTitanEnemy();
  }

  enemies.forEach((enemy) => {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.hypot(dx, dy) || 1;
    const isTitan = enemy.behaviour === "titan";
    const hasLunge = enemy.lungeRange !== undefined && enemy.lungeCooldownBase;

    if (enemy.spawnTimer) {
      enemy.spawnTimer = Math.max(0, enemy.spawnTimer - delta);
    }

    if (hasLunge) {
      if (enemy.lungeCooldownTimer === undefined) {
        enemy.lungeCooldownTimer = enemy.lungeCooldownBase;
      }
      enemy.lungeCooldownTimer = Math.max(0, (enemy.lungeCooldownTimer || 0) - delta);
      if (enemy.isLunging) {
        enemy.lungeTimer = Math.max(0, (enemy.lungeTimer || 0) - delta);
        if (enemy.lungeTimer === 0) {
          enemy.isLunging = false;
        }
      }
      if (
        !enemy.isLunging &&
        enemy.lungeCooldownTimer === 0 &&
        distance < enemy.lungeRange &&
        hasLineOfSight(enemy.x, enemy.y, player.x, player.y)
      ) {
        enemy.isLunging = true;
        enemy.lungeTimer = enemy.lungeDuration || 260;
        enemy.lungeCooldownTimer = enemy.lungeCooldownBase;
        const len = distance || 1;
        enemy.lungeDirX = dx / len;
        enemy.lungeDirY = dy / len;
        spawnParticles(
          enemy.x,
          enemy.y,
          enemy.lungeParticleColor || enemy.color || "#ff4d94",
          160,
          Math.max(16, Math.round((enemy.radius || 18) * 0.9)),
        );
      }
    }

    if (isTitan) {
      if (enemy.walkCycle === undefined) enemy.walkCycle = 0;
      if (enemy.glowPhase === undefined) enemy.glowPhase = Math.random() * Math.PI * 2;
    }

    let moved = false;
    if (
      enemy.behaviour === "chaser" ||
      enemy.behaviour === "brute" ||
      enemy.behaviour === "titan" ||
      enemy.state === "chase"
    ) {
      let dirX = dx / distance;
      let dirY = dy / distance;
      let moveSpeed = enemy.speed;
      let shrink = enemy.collisionShrink ?? (isTitan ? 0.6 : 0.65);
      if (enemy.isLunging) {
        moveSpeed = enemy.speed * (enemy.lungeSpeedMultiplier || 1.8);
        if (enemy.lungeDirX !== undefined) {
          dirX = enemy.lungeDirX || dirX;
          dirY = enemy.lungeDirY || dirY;
        }
      } else if (
        hasLunge &&
        enemy.hasteThreshold !== undefined &&
        enemy.hasteMultiplier &&
        enemy.lungeCooldownTimer < enemy.lungeCooldownBase * enemy.hasteThreshold
      ) {
        moveSpeed = enemy.speed * enemy.hasteMultiplier;
      }
      moved = stepEntity(enemy, dirX, dirY, moveSpeed, deltaSeconds, shrink);

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

    if (isTitan) {
      if (moved) {
        enemy.walkCycle = ((enemy.walkCycle || 0) + delta) % 1800;
      } else {
        enemy.walkCycle = Math.max(0, (enemy.walkCycle || 0) - delta * 0.6);
      }
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
    const enemy = enemies[i];
    if (enemy.health <= 0) {
      spawnParticles(enemy.x, enemy.y, "#f79d2a");
      scheduleMeatDrop(enemy, enemy.color || MEAT_COLOR, enemy.behaviour === "titan");
      enemies.splice(i, 1);
      state.kills += 1;
      handleGunUpgrade();
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

  for (let i = meatDrops.length - 1; i >= 0; i -= 1) {
    const drop = meatDrops[i];
    drop.lifetime -= delta;
    drop.bobPhase = (drop.bobPhase || 0) + delta * PICKUP_BOB_SPEED;
    if (drop.bobPhase > Math.PI * 2) drop.bobPhase -= Math.PI * 2;
    drop.bobOffset = Math.sin(drop.bobPhase) * PICKUP_BOB_AMPLITUDE;
    if (drop.lifetime <= 0) {
      meatUsedPositions.delete(drop.key);
      meatDrops.splice(i, 1);
      continue;
    }
    const distance = Math.hypot(drop.x - player.x, drop.y - player.y);
    if (distance < drop.radius + player.radius) {
      eatMeat(drop.restore || MEAT_HUNGER_RESTORE);
      spawnParticles(drop.x, drop.y, drop.color || MEAT_COLOR, 120, 18);
      meatUsedPositions.delete(drop.key);
      meatDrops.splice(i, 1);
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
  if (state.paused || !state.running) return;
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
  if (infoOverlay && !infoOverlay.classList.contains("info-overlay--hidden")) {
    closeInfoOverlay(false);
  }
  state.running = false;
  state.over = true;
  state.durationWhenOver = Math.floor((performance.now() - state.startedAt) / 1000);
  const minutes = Math.floor(state.durationWhenOver / 60).toString().padStart(2, "0");
  const seconds = (state.durationWhenOver % 60).toString().padStart(2, "0");
  finalTimerEl.textContent = `${minutes}:${seconds}`;
  finalKillsEl.textContent = state.kills.toString().padStart(3, "0");
  overlay.classList.remove("overlay--hidden");
  if (sharePreview) sharePreview.style.display = "block";
  renderShareCard(minutes, seconds);
  manualPauseActive = false;
  infoPauseActive = false;
  state.paused = false;
  applyPauseState();
}

function draw() {
  ctx.clearRect(0, 0, VIEWPORT.width, VIEWPORT.height);
  const cameraX = player.x - VIEWPORT.width / 2;
  const cameraY = player.y - VIEWPORT.height / 2;
  drawFloor(cameraX, cameraY);
  drawDecorations(cameraX, cameraY);
  drawAmmo(cameraX, cameraY);
  drawHealth(cameraX, cameraY);
  drawMeat(cameraX, cameraY);
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

function drawMeat(offsetX, offsetY) {
  meatDrops.forEach((drop) => {
    const screenX = drop.x - offsetX;
    const screenY = drop.y - offsetY;
    drawMeatSprite(screenX, screenY, drop);
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

function drawMeatSprite(x, y, drop) {
  const hoverOffset = drop.bobOffset || 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(MEAT_HOVER_SCALE, MEAT_HOVER_SCALE);
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath();
  ctx.ellipse(0, 0.9, 2.6, 1.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(x, y + hoverOffset);
  ctx.scale(MEAT_HOVER_SCALE, MEAT_HOVER_SCALE);

  // bone handle
  ctx.save();
  ctx.translate(0.1, 0.9);
  ctx.fillStyle = "#f8e9d5";
  ctx.beginPath();
  ctx.arc(-0.65, 0, 0.42, 0, Math.PI * 2);
  ctx.arc(1.0, 0.05, 0.45, 0, Math.PI * 2);
  ctx.rect(-0.65, -0.36, 1.65, 0.72);
  ctx.fill();
  ctx.fillStyle = "#d4beaa";
  ctx.beginPath();
  ctx.arc(-0.65, 0, 0.24, 0, Math.PI * 2);
  ctx.arc(1.0, 0.05, 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // meat cap
  const meatColor = drop.color || MEAT_COLOR;
  ctx.fillStyle = meatColor;
  ctx.beginPath();
  ctx.moveTo(-1.6, -1.2);
  ctx.quadraticCurveTo(-0.8, -2.6, 0.8, -2.4);
  ctx.quadraticCurveTo(2.2, -2.1, 2.4, -0.4);
  ctx.quadraticCurveTo(2.6, 1.4, 0.9, 2.4);
  ctx.quadraticCurveTo(-0.4, 3.0, -2.0, 1.4);
  ctx.quadraticCurveTo(-2.6, 0.2, -1.6, -1.2);
  ctx.closePath();
  ctx.fill();

  // shading
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.moveTo(0.9, 1.7);
  ctx.quadraticCurveTo(1.9, 0.9, 1.8, -0.2);
  ctx.quadraticCurveTo(1.4, 1.0, 0.1, 2.0);
  ctx.closePath();
  ctx.fill();

  // highlight
  ctx.fillStyle = "rgba(255, 238, 220, 0.7)";
  ctx.beginPath();
  ctx.moveTo(-0.9, -1.1);
  ctx.quadraticCurveTo(-0.3, -1.8, 0.4, -1.6);
  ctx.quadraticCurveTo(-0.1, -0.5, -0.6, -0.2);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(0,0,0,0.22)";
  ctx.lineWidth = 0.22;
  ctx.beginPath();
  ctx.moveTo(-1.4, -1.0);
  ctx.quadraticCurveTo(1.4, -2.0, 1.8, 0.1);
  ctx.quadraticCurveTo(1.2, 1.8, -0.5, 2.4);
  ctx.stroke();
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
  const facing = Math.cos(angle) >= 0 ? 1 : -1;
  drawPlayerSprite(screenX, screenY, player.frame, facing, player.shootingTimer > 0);
}

function drawPlayerSprite(x, y, frame, facing, shooting) {
  const scale = 2.8;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (facing < 0) {
    ctx.scale(-1, 1);
  }

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(0, 2.4, 3.4, 1.4, 0, 0, Math.PI * 2);
  ctx.fill();

  const stage = Math.min(player.mutationStage || 0, MAX_MUTATION_STAGE);
  const stageRatio = stage / MAX_MUTATION_STAGE;
  const legOffsets = [0, 0.35, 0, -0.35];
  const legOpp = [0, -0.35, 0, 0.35];
  const lf = legOffsets[frame % 4];
  const rf = legOpp[frame % 4];

  const leftLegColor =
    stage >= 17 ? "#432005" : stage >= 11 ? "#b56516" : stage >= 3 ? "#f79d2a" : "#343434";
  const rightLegColor =
    stage >= 18 ? "#761239" : stage >= 12 ? "#c11a5d" : stage >= 4 ? "#ff4d94" : "#343434";
  const torsoTopColor =
    stage >= 19 ? "#170815" : stage >= 16 ? "#2f1326" : stage >= 10 ? "#1d1638" : stage >= 6 ? "#2d3080" : "#3764f0";
  const torsoMidColor =
    stage >= 19 ? "#0c030d" : stage >= 16 ? "#1b0a1a" : stage >= 10 ? "#120c24" : stage >= 6 ? "#1f2158" : "#2546a6";
  const beltColor = stage >= 18 ? "#3b0f2f" : stage >= 12 ? "#271939" : "#1f1f1f";
  const harnessStrapColor = stage >= 19 ? "#2a0215" : stage >= 10 ? "#1b0f2f" : "#1e1e1e";
  const harnessColor = stage >= 15 ? "#ff1f6a" : stage >= 5 ? "#ff4d94" : "#343434";
  const leftArmColor =
    stage >= 18 ? "#4d0505" : stage >= 13 ? "#7d1111" : stage >= 7 ? "#b11b1b" : stage >= 1 ? "#f25858" : "#f0c9a6";
  const rightArmColor =
    stage >= 19 ? "#230f59" : stage >= 14 ? "#3a1b8f" : stage >= 8 ? "#5d34c7" : stage >= 2 ? "#8b5cf6" : "#f0c9a6";
  const headColor =
    stage >= 19 ? "#5a2730" : stage >= 16 ? "#864348" : stage >= 13 ? "#b76f5e" : stage >= 9 ? "#d6a089" : "#fbdcbf";
  const hairColor =
    stage >= 18 ? "#2f0f26" : stage >= 12 ? "#421a38" : stage >= 7 ? "#6c2f4b" : "#d89a65";
  const visorColor = stage >= 18 ? "#fdda6e" : stage >= 12 ? "#f06be8" : stage >= 9 ? "#3a1d4f" : "#1d1d1d";
  const auraStroke = stage >= 19 ? "#ff2f8f" : stage >= 16 ? "#b154ff" : "#6f5bff";

  if (stage >= 8) {
    ctx.save();
    ctx.translate(-2.2, 1.0);
    const tailColor = stage >= 18 ? "#320b3c" : stage >= 12 ? "#40235a" : "#4d2d7a";
    ctx.fillStyle = tailColor;
    ctx.beginPath();
    ctx.moveTo(-0.3, -0.1);
    ctx.quadraticCurveTo(-2.0 - stageRatio * 3.0, -1.9, -2.8 - stageRatio * 2.4, 0.1);
    ctx.quadraticCurveTo(-3.0 - stageRatio * 2.2, 1.6, -1.2, 2.2);
    ctx.quadraticCurveTo(-0.8, 1.0, -0.3, -0.1);
    ctx.closePath();
    ctx.fill();

    if (stage >= 14) {
      const spikeCount = stage >= 19 ? 4 : 3;
      ctx.fillStyle = stage >= 19 ? "#ff1f6a" : "#f5c04a";
      for (let i = 0; i < spikeCount; i += 1) {
        const t = spikeCount === 1 ? 0 : i / (spikeCount - 1);
        const baseX = -2.6 - stageRatio * 2.2 * t;
        const baseY = 0.5 + t * 1.1;
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.lineTo(baseX - 0.55, baseY - 0.85);
        ctx.lineTo(baseX + 0.35, baseY - 0.45);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  }

  ctx.fillStyle = leftLegColor;
  ctx.fillRect(-1.4 + lf, 0.8, 1.1, 2.4);
  ctx.fillStyle = rightLegColor;
  ctx.fillRect(0.3 + rf, 0.8, 1.1, 2.4);

  if (stage >= 14) {
    const clawColor = stage >= 19 ? "#fbeccf" : "#f8e6d1";
    ctx.fillStyle = clawColor;
    ctx.fillRect(-1.45 + lf, 3.05, 1.2, 0.32);
    ctx.fillRect(0.25 + rf, 3.05, 1.2, 0.32);
  }

  ctx.fillStyle = torsoTopColor;
  ctx.fillRect(-2.2, -1.9, 4.4, 3.8);
  ctx.fillStyle = torsoMidColor;
  ctx.fillRect(-2.2, -0.4, 4.4, 1.2);
  ctx.fillStyle = beltColor;
  ctx.fillRect(-2.0, -0.1, 4.0, 0.6);

  if (stage >= 11) {
    ctx.fillStyle = stage >= 19 ? "#66122c" : stage >= 15 ? "#8b1f3d" : "#4f236c";
    ctx.beginPath();
    ctx.moveTo(-1.1, -1.4);
    ctx.lineTo(1.1, -1.4);
    ctx.lineTo(1.4, 0.6);
    ctx.lineTo(-1.4, 0.6);
    ctx.closePath();
    ctx.fill();
  }

  if (stage >= 17) {
    ctx.save();
    ctx.strokeStyle = stage >= 20 ? "rgba(255, 94, 0, 0.8)" : "rgba(251, 122, 255, 0.72)";
    ctx.lineWidth = 0.16;
    ctx.beginPath();
    ctx.moveTo(-0.6, -1.1);
    ctx.lineTo(-0.2, -0.4);
    ctx.lineTo(-0.8, 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0.5, -1.3);
    ctx.lineTo(0.7, -0.4);
    ctx.lineTo(0.3, 0.2);
    ctx.stroke();
    ctx.restore();
  }

  if (stage >= 6) {
    ctx.fillStyle = stage >= 15 ? "#ffdb5a" : "#b490ff";
    ctx.beginPath();
    ctx.moveTo(-2.5, -1.6);
    ctx.lineTo(-3.3, -0.6 - legOffsets[(frame + 2) % 4] * 0.2);
    ctx.lineTo(-2.4, -1.0);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(2.5, -1.6);
    ctx.lineTo(3.3, -0.6 + legOpp[(frame + 2) % 4] * 0.2);
    ctx.lineTo(2.4, -1.0);
    ctx.closePath();
    ctx.fill();
  }

  if (stage >= 15) {
    ctx.fillStyle = stage >= 19 ? "#ff387a" : "#f0b74d";
    ctx.beginPath();
    ctx.moveTo(-1.8, -2.2);
    ctx.lineTo(-2.4, -3.4);
    ctx.lineTo(-1.3, -2.6);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(1.8, -2.2);
    ctx.lineTo(2.4, -3.4);
    ctx.lineTo(1.3, -2.6);
    ctx.closePath();
    ctx.fill();
  }

  if (stage >= 13) {
    ctx.save();
    ctx.globalAlpha = Math.min(0.34, 0.12 + stageRatio * 0.32);
    ctx.strokeStyle = auraStroke;
    ctx.lineWidth = 0.5 + stageRatio * 1.2;
    ctx.beginPath();
    ctx.arc(0, -0.1, 3.6 + stageRatio * 1.4, 0, Math.PI * 2);
    ctx.stroke();
    if (stage >= 18) {
      ctx.globalAlpha *= 0.75;
      ctx.beginPath();
      ctx.arc(0, -0.1, 2.7 + stageRatio, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  ctx.fillStyle = harnessStrapColor;
  ctx.fillRect(0.9, -2.3, 1.0, 4.8);
  ctx.fillStyle = harnessColor;
  ctx.fillRect(0.8, -1.5, 1.2, 0.7);

  ctx.fillStyle = leftArmColor;
  ctx.fillRect(-3.0, -1.2, 0.7, 1.8);
  ctx.fillStyle = rightArmColor;
  ctx.fillRect(2.3, -1.2, 0.7, 1.8);

  if (stage >= 9) {
    const clawTone = stage >= 19 ? "#fdf1f8" : "#f6d7f1";
    ctx.fillStyle = clawTone;
    ctx.fillRect(-3.0, -0.2, 0.8, 0.35);
    ctx.fillRect(2.3, -0.2, 0.8, 0.35);
  }

  if (stage >= 18) {
    ctx.fillStyle = "#ff5b9f";
    ctx.fillRect(-3.15, -0.9, 0.4, 1.1);
    ctx.fillRect(2.75, -0.9, 0.4, 1.1);
  }

  ctx.fillStyle = headColor;
  ctx.fillRect(-1.5, -3.8, 3.0, 2.2);
  ctx.fillStyle = hairColor;
  ctx.fillRect(-1.5, -4.2, 3.0, 0.8);
  ctx.fillStyle = visorColor;
  ctx.fillRect(-1.1, -2.7, 2.2, 0.5);

  if (stage >= 7) {
    ctx.fillStyle = stage >= 16 ? "#f6d266" : "#d2a23a";
    ctx.beginPath();
    ctx.moveTo(-0.9, -4.2);
    ctx.lineTo(-0.1, -5.6 - stageRatio * 0.8);
    ctx.lineTo(0.1, -4.2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0.9, -4.2);
    ctx.lineTo(0.1, -5.6 - stageRatio * 0.8);
    ctx.lineTo(-0.1, -4.2);
    ctx.closePath();
    ctx.fill();
    if (stage >= 12) {
      const sideHornColor = stage >= 18 ? "#f77e1f" : "#f0b74d";
      ctx.fillStyle = sideHornColor;
      ctx.beginPath();
      ctx.moveTo(-1.5, -4.0);
      ctx.lineTo(-2.0, -5.1);
      ctx.lineTo(-1.3, -4.2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(1.5, -4.0);
      ctx.lineTo(2.0, -5.1);
      ctx.lineTo(1.3, -4.2);
      ctx.closePath();
      ctx.fill();
    }
  }

  if (stage >= 15) {
    ctx.fillStyle = stage >= 19 ? "#ff8bc8" : "#f6c3ff";
    ctx.beginPath();
    ctx.arc(0, -3.4, 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  if (stage >= 11) {
    ctx.fillStyle = stage >= 18 ? "#471019" : "#6b1e25";
    ctx.fillRect(-1.5, -2.0, 3.0, 0.95);
    ctx.fillStyle = "#fbeef0";
    ctx.beginPath();
    ctx.moveTo(-1.3, -1.2);
    ctx.lineTo(-0.8, -1.6);
    ctx.lineTo(-0.3, -1.2);
    ctx.lineTo(0.2, -1.6);
    ctx.lineTo(0.7, -1.2);
    ctx.lineTo(1.2, -1.6);
    ctx.lineTo(1.2, -1.05);
    ctx.lineTo(-1.3, -1.05);
    ctx.closePath();
    ctx.fill();
  }

  if (stage >= 12) {
    const eyeColor = stage >= 19 ? "#ff822f" : "#f6f2ff";
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.ellipse(0, -1.0, 0.9, 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = stage >= 19 ? "#2e0715" : "#3f1455";
    ctx.beginPath();
    ctx.arc(0, -1.0, 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  if (stage >= 16) {
    ctx.fillStyle = stage >= 20 ? "#ff4b8a" : "#ed7cff";
    ctx.beginPath();
    ctx.arc(-0.9, -1.6, 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0.9, -1.6, 0.28, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  const pumpOffset = shooting ? -0.25 : 0;
  ctx.translate(1.55, 0.35);
  ctx.fillStyle = "#1b1410";
  ctx.fillRect(-0.6, -1.8, 1.0, 3.6);
  ctx.fillStyle = "#4b2f15";
  ctx.fillRect(-0.6, -1.1, 4.2, 1.05);
  ctx.fillStyle = "#825125";
  ctx.fillRect(1.1 + pumpOffset, -1.15, 1.6, 1.1);
  ctx.fillStyle = "#d6cebf";
  ctx.fillRect(3.4, -0.95, 1.6, 0.68);
  ctx.fillStyle = "#0f0f0f";
  ctx.fillRect(-0.4, 1.05, 3.4, 0.38);
  ctx.restore();

  if (stage >= 20) {
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#ff2f8f";
    ctx.beginPath();
    ctx.arc(0, 0.2, 4.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

function drawEnemySprite(enemy, offsetX, offsetY) {
  const x = enemy.x - offsetX;
  const y = enemy.y - offsetY;
  const scale =
    enemy.drawScale ??
    (enemy.behaviour === "titan" ? 4.4 : enemy.behaviour === "brute" ? 3.2 : 2.6);
  const spawnProgress = enemy.spawnTimer ? enemy.spawnTimer / ENEMY_SPAWN_FLASH : 0;
  const spawnColor = hexToRgb(enemy.color || "#f25858");
  ctx.save();
  ctx.translate(x, y);

  if (spawnProgress > 0) {
    const pulse = Math.sin((1 - spawnProgress) * Math.PI * 2 + animationTime * 0.01) * 6;
    const ringRadius = enemy.radius * 0.6 + (1 - spawnProgress) * enemy.radius * 0.9 + pulse;
    ctx.save();
    ctx.globalAlpha = 0.35 + 0.4 * spawnProgress;
    ctx.lineWidth = 4.5 - spawnProgress * 2;
    ctx.strokeStyle = `rgba(${spawnColor.r}, ${spawnColor.g}, ${spawnColor.b}, ${0.65 * spawnProgress + 0.2})`;
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = `rgba(${spawnColor.r}, ${spawnColor.g}, ${spawnColor.b}, ${0.22 * spawnProgress})`;
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.scale(scale, scale);

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  const shadowWidth =
    enemy.shadowWidth ??
    (enemy.behaviour === "titan" ? 4.6 : enemy.behaviour === "brute" ? 3.4 : 3.0);
  const shadowHeight =
    enemy.shadowHeight ??
    (enemy.behaviour === "titan" ? 1.8 : enemy.behaviour === "brute" ? 1.4 : 1.2);
  ctx.ellipse(0, 2.4, shadowWidth, shadowHeight, 0, 0, Math.PI * 2);
  ctx.fill();

  if (!enemy.animTimer) enemy.animTimer = 0;
  const animModulo = enemy.variant === "titan" ? 180 : 60;
  enemy.animTimer = (enemy.animTimer + 1) % animModulo;

  if (enemy.variant === "titan") {
    const walkCycle = enemy.walkCycle || 0;
    const breathing = Math.sin(enemy.animTimer / 18) * 0.45;
    const stride = Math.sin(walkCycle / 130) * 0.8;
    const stepLift = Math.sin(walkCycle / 90) * 0.45;
    const torsoBob = Math.sin(walkCycle / 160) * 0.35;
    const glowPulse = 0.45 + 0.35 * Math.sin(animationTime * 0.003 + (enemy.glowPhase || 0));
    const spawnFade = spawnProgress > 0 ? 0.5 + (1 - spawnProgress) * 0.5 : 1;

    ctx.save();
    ctx.translate(0, torsoBob - (enemy.isLunging ? 0.4 : 0));
    if (spawnProgress > 0) {
      ctx.globalAlpha = spawnFade;
    }
    if (enemy.isLunging) {
      ctx.scale(1.05, 0.94);
    }

    ctx.save();
    ctx.globalAlpha = 0.45 + glowPulse * 0.3;
    ctx.fillStyle = "rgba(255, 94, 188, 0.65)";
    ctx.beginPath();
    ctx.ellipse(0, -0.8, 3.4 + glowPulse * 1.1, 4.0 + glowPulse * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "rgba(255, 164, 226, 0.28)";
    ctx.beginPath();
    ctx.ellipse(0, -0.6, 2.6 + glowPulse * 0.9, 3.0 + glowPulse * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "#2d0f1f";
    ctx.fillRect(-3.6, -2.4, 7.2, 5.8 + breathing * 0.2);

    ctx.fillStyle = "#ff4d94";
    ctx.fillRect(-3.1, -3.9, 6.2, 4.6 + breathing);

    ctx.fillStyle = "#3c0c21";
    ctx.fillRect(-3.9, -1.0, 7.8, 4.2 + breathing * 0.45);

    ctx.fillStyle = "#fff2f8";
    ctx.fillRect(-1.9, -2.8, 1.5, 1.5);
    ctx.fillRect(0.5, -2.8, 1.5, 1.5);

    ctx.fillStyle = "#1b0a11";
    ctx.fillRect(-1.4, -2.3, 0.6, 0.6);
    ctx.fillRect(0.8, -2.3, 0.6, 0.6);

    ctx.fillStyle = "#ff92c2";
    ctx.fillRect(-0.9, -1.1, 1.8, 1.2 + breathing * 0.5);

    ctx.fillStyle = "#2f0d18";
    ctx.fillRect(-3.2 - stride, 1.4 - stepLift * 0.3, 1.9, 3.2 - breathing * 0.25 + stepLift * 0.4);
    ctx.fillRect(1.3 + stride, 1.4 + stepLift * 0.5, 1.9, 3.2 + breathing * 0.25 - stepLift * 0.3);

    ctx.fillStyle = "#391321";
    ctx.fillRect(-3.6 + stride * 0.3, -1.8 + breathing * 0.1, 1.2, 3.6);
    ctx.fillRect(2.4 - stride * 0.4, -1.6 - breathing * 0.1, 1.2, 3.5);

    ctx.fillStyle = `rgba(255, 159, 219, ${0.28 + glowPulse * 0.2})`;
    ctx.fillRect(-0.4, -3.2, 0.8, 6.0);
    ctx.fillRect(1.4, -1.8, 0.4, 3.8);
    ctx.fillRect(-1.8, -1.6, 0.4, 3.6);

    ctx.restore();
  } else {
    const palette = enemy.variant === "gnasher"
      ? { body: "#f25858", shell: "#2d0a0a", eye: "#f9f9f9" }
      : enemy.variant === "stalker"
        ? { body: "#8b5cf6", shell: "#291c4d", eye: "#f9f9f9" }
        : { body: "#f79d2a", shell: "#3b2610", eye: "#121212" };
    const wobble = Math.sin(enemy.animTimer / 10) * 0.2;
    if (spawnProgress > 0) {
      ctx.globalAlpha = 0.55 + (1 - spawnProgress) * 0.45;
    }
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
    ctx.globalAlpha = 1;
  }

  ctx.restore();

  const healthRatio = Math.max(enemy.health / enemy.maxHealth, 0);
  const barWidth = enemy.variant === "titan" ? 72 : 48;
  const barHeight = enemy.variant === "titan" ? 8 : 6;
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(x - barWidth / 2, y - (enemy.variant === "titan" ? 48 : 34), barWidth, barHeight);
  ctx.fillStyle =
    enemy.variant === "gnasher"
      ? "#f25858"
      : enemy.variant === "stalker"
        ? "#8b5cf6"
        : enemy.variant === "mauler"
          ? "#f79d2a"
          : enemy.variant === "titan"
            ? "#ff4d94"
            : "#f25858";
  ctx.fillRect(
    x - barWidth / 2,
    y - (enemy.variant === "titan" ? 48 : 34),
    barWidth * healthRatio,
    barHeight
  );
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

  meatDrops.forEach((drop) => {
    minimapCtx.fillStyle = MEAT_COLOR;
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
  ctx.fillRect(12, 12, 240, 74);
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.strokeRect(12, 12, 240, 74);
  ctx.fillStyle = "#f2f2f2";
  ctx.font = "12px 'Press Start 2P', monospace";
  ctx.fillText(`HP ${Math.max(player.health, 0).toString().padStart(3, "0")}`, 24, 32);
  ctx.fillText(`AM ${player.ammo.toString().padStart(3, "0")}`, 24, 52);
  ctx.fillText(`HN ${Math.floor(player.hunger).toString().padStart(3, "0")}`, 120, 32);
  const elapsed = state.over
    ? state.durationWhenOver
    : Math.floor((performance.now() - state.startedAt) / 1000);
  const minutes = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const seconds = (elapsed % 60).toString().padStart(2, "0");
  ctx.fillText(`TM ${minutes}:${seconds}`, 24, 72);
  ctx.fillText(`KL ${state.kills.toString().padStart(3, "0")}`, 160, 52);
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

  function analyzeDecorationSpot(tileX, tileY, minDistance = CELL_SIZE * 0.9, minOpenNeighbors = 4) {
    if (tileX < 0 || tileY < 0 || tileX >= MAP_COLS || tileY >= MAP_ROWS) return null;
    if (grid[tileY][tileX] === 0) return null;
    const key = `${tileX},${tileY}`;
    if (decorationCells.has(key)) return null;
    if (Math.abs(tileX - spawnRoom.centerX) <= 1 && Math.abs(tileY - spawnRoom.centerY) <= 1) return null;
    const worldX = tileX * CELL_SIZE + CELL_SIZE / 2;
    const worldY = tileY * CELL_SIZE + CELL_SIZE / 2;
    for (let d = decorations.length - 1; d >= 0; d -= 1) {
      if (Math.hypot(decorations[d].x - worldX, decorations[d].y - worldY) < minDistance) {
        return null;
      }
    }
    let wallTouch = 0;
    let openNeighbors = 0;
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (dx === 0 && dy === 0) continue;
        const nx = tileX + dx;
        const ny = tileY + dy;
        const neighbor = nx < 0 || ny < 0 || nx >= MAP_COLS || ny >= MAP_ROWS ? 0 : grid[ny][nx];
        if (neighbor === 0) wallTouch += 1;
        if (neighbor === 1 || neighbor === 2) openNeighbors += 1;
      }
    }
    if (openNeighbors < minOpenNeighbors) return null;
    return { key, worldX, worldY, wallTouch, openNeighbors };
  }

  function pickDecorationCell(room) {
    let best = null;
    let bestScore = -Infinity;
    for (let attempt = 0; attempt < 28; attempt += 1) {
      const tileX = room.x + 1 + Math.floor(Math.random() * Math.max(1, room.width - 2));
      const tileY = room.y + 1 + Math.floor(Math.random() * Math.max(1, room.height - 2));
      const analysis = analyzeDecorationSpot(tileX, tileY, CELL_SIZE * 0.9, 4);
      if (!analysis) continue;
      const adjacencyBonus = analysis.wallTouch * 2.2 + Math.max(analysis.openNeighbors - 4, 0);
      const distanceFromCenter = Math.hypot(tileX - room.centerX, tileY - room.centerY);
      const corridorPenalty = analysis.openNeighbors <= 5 ? 1.2 : 0;
      const score = adjacencyBonus - corridorPenalty - distanceFromCenter * 0.15 + Math.random() * 0.8;
      if (score > bestScore) {
        bestScore = score;
        best = { tileX, tileY };
      }
    }
    return best;
  }

  function placeDecoration(tileX, tileY, type, { minDistance = CELL_SIZE * 0.75, minOpenNeighbors = 3 } = {}) {
    const analysis = analyzeDecorationSpot(tileX, tileY, minDistance, minOpenNeighbors);
    if (!analysis) return false;
    decorationCells.add(analysis.key);
    decorations.push({
      x: analysis.worldX,
      y: analysis.worldY,
      type,
      phase: Math.random() * Math.PI * 2,
      speed: 0.7 + Math.random() * 0.8,
      intensity: 0.6 + Math.random() * 0.6,
    });
    return true;
  }

  rooms.forEach((room) => {
    const decorCount = 4 + Math.floor(Math.random() * 5);
    for (let i = 0; i < decorCount; i += 1) {
      let spot = pickDecorationCell(room);
      if (!spot) {
        for (let attempt = 0; attempt < 16 && !spot; attempt += 1) {
          const fallbackX = room.x + 1 + Math.floor(Math.random() * Math.max(1, room.width - 2));
          const fallbackY = room.y + 1 + Math.floor(Math.random() * Math.max(1, room.height - 2));
          if (analyzeDecorationSpot(fallbackX, fallbackY, CELL_SIZE * 0.9, 4)) {
            spot = { tileX: fallbackX, tileY: fallbackY };
          }
        }
      }
      if (!spot) continue;
      const baseType = DECOR_TYPES[Math.floor(Math.random() * DECOR_TYPES.length)];
      const placedBase = placeDecoration(spot.tileX, spot.tileY, baseType, {
        minDistance: CELL_SIZE * 0.9,
        minOpenNeighbors: 4,
      });
      if (!placedBase) continue;

      const groupTypes = DECOR_GROUPS[baseType];
      if (!groupTypes || Math.random() >= 0.55) continue;
      const extras = 1 + Math.floor(Math.random() * 3);
      const offsets = DECOR_CLUSTER_OFFSETS.slice().sort(() => Math.random() - 0.5);
      let placedExtras = 0;
      for (const offset of offsets) {
        if (placedExtras >= extras) break;
        const nx = spot.tileX + offset.x;
        const ny = spot.tileY + offset.y;
        const extraType = groupTypes[Math.floor(Math.random() * groupTypes.length)];
        if (
          placeDecoration(nx, ny, extraType, {
            minDistance: CELL_SIZE * 0.55,
            minOpenNeighbors: 3,
          })
        ) {
          placedExtras += 1;
        }
      }
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
    if (ammoUsedPositions.has(key) || healthUsedPositions.has(key) || meatUsedPositions.has(key)) continue;
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

function loop(now) {
  const rawDelta = now - lastTimestamp;
  lastTimestamp = now;
  const delta = Math.min(rawDelta, 32);
  if (!state.paused) {
    animationTime += delta;
    update(delta);
  } else {
    update(0);
  }
  draw();
  requestAnimationFrame(loop);
}

function handleKeyDown(event) {
  if (event.repeat) return;
  if (infoOverlay && !infoOverlay.classList.contains("info-overlay--hidden")) {
    if (event.key === "Escape") {
      closeInfoOverlay();
    }
    event.preventDefault();
    return;
  }
  if (event.key === "p" || event.key === "P") {
    if (!state.over) {
      manualPauseActive = !manualPauseActive;
      applyPauseState();
    }
    event.preventDefault();
    return;
  }
  if (state.over) {
    event.preventDefault();
    return;
  }
  if (state.paused) {
    if (event.key === "Escape" && manualPauseActive) {
      manualPauseActive = false;
      applyPauseState();
    }
    event.preventDefault();
    return;
  }
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
  if (state.paused || !state.running) {
    event.preventDefault();
    return;
  }
  joystickState.active = true;
  joystickState.pointerId = event.pointerId;
  joystickState.dx = 0;
  joystickState.dy = 0;
  joystickThumb.style.transform = "translate(-50%, -50%)";
  joystick.setPointerCapture(event.pointerId);
  event.preventDefault();
}

function handleJoystickMove(event) {
  if (state.paused) {
    event.preventDefault();
    return;
  }
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
  if (joystickThumb) joystickThumb.style.transform = "translate(-50%, -50%)";
  if (joystick && typeof joystick.releasePointerCapture === "function") {
    try {
      joystick.releasePointerCapture(event.pointerId);
    } catch (error) {
      // ignore release errors
    }
  }
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
  updatePauseButton();
  setupMobile();
  updateCanvasSize();
  resetGame();
  requestAnimationFrame(loop);
}

function openInfoOverlay() {
  if (!infoOverlay || !infoOverlay.classList.contains("info-overlay--hidden")) return;
  infoOverlay.classList.remove("info-overlay--hidden");
  infoOverlay.setAttribute("aria-hidden", "false");
  if (infoBtn) {
    infoBtn.setAttribute("aria-expanded", "true");
  }
  if (infoClose) {
    infoClose.focus();
  }
  infoPauseActive = true;
  applyPauseState();
  document.body.style.setProperty("overflow", "hidden");
}

function closeInfoOverlay(restoreFocus = true) {
  if (!infoOverlay || infoOverlay.classList.contains("info-overlay--hidden")) return;
  infoOverlay.classList.add("info-overlay--hidden");
  infoOverlay.setAttribute("aria-hidden", "true");
  if (infoBtn) {
    infoBtn.setAttribute("aria-expanded", "false");
    if (restoreFocus) {
      infoBtn.focus();
    }
  }
  infoPauseActive = false;
  applyPauseState();
  document.body.style.removeProperty("overflow");
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

if (infoBtn) {
  infoBtn.addEventListener("click", () => {
    if (infoOverlay && infoOverlay.classList.contains("info-overlay--hidden")) {
      openInfoOverlay();
    } else {
      closeInfoOverlay();
    }
  });
}

if (infoClose) {
  infoClose.addEventListener("click", () => {
    closeInfoOverlay();
  });
}

if (infoOverlay) {
  infoOverlay.addEventListener("click", (event) => {
    if (event.target === infoOverlay) {
      closeInfoOverlay();
    }
  });
}

if (pauseBtn) {
  pauseBtn.addEventListener("click", () => {
    if (state.over) return;
    manualPauseActive = !manualPauseActive;
    applyPauseState();
  });
}

restartBtn.addEventListener("click", resetGame);
if (shareBtn) shareBtn.addEventListener("click", downloadShareImage);

window.addEventListener("resize", () => {
  isMobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 768;
  setupMobile();
  updateCanvasSize();
});

init();
