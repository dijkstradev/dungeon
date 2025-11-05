const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const healthEl = document.querySelector(".health");
const manaEl = document.querySelector(".mana");
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
const startOverlay = document.getElementById("start-overlay");
const startBtn = document.getElementById("start-btn");
const spellSlotEls = Array.from(document.querySelectorAll(".spell-slot"));
let initialStart = false;
let isMobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 768;

const BASE_PLAYER_MAX_HEALTH = 100;
const STARTING_MANA = 30;
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
const BASE_HUNGER_RATE = 0.45;
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
  "glowing_moss",
  "glowing_moss_field",
  "hanging_vine",
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
  glowing_moss: {
    base: 0.9,
    alpha: 0.06,
    wobble: 0.35,
    sparkle: true,
    sparkleColor: "rgba(140,255,190,0.45)",
    sparkleScale: 1.3,
  },
  glowing_moss_field: {
    base: 0.92,
    alpha: 0.08,
    wobble: 0.25,
    sparkle: true,
    sparkleColor: "rgba(140,255,200,0.35)",
    sparkleScale: 1.6,
  },
  hanging_vine: {
    base: 0.9,
    alpha: 0.05,
    wobble: 0.4,
  },
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
  home_bed: { base: 0.96, alpha: 0.015, wobble: 0.18 },
  home_potion_table: {
    base: 0.94,
    alpha: 0.04,
    wobble: 0.3,
    sparkle: true,
    sparkleColor: "rgba(110,200,255,0.35)",
    sparkleScale: 1.1,
  },
  home_lounge: { base: 0.95, alpha: 0.02, wobble: 0.16 },
  home_rug: { base: 0.97, alpha: 0.012, wobble: 0.08 },
  home_books: { base: 0.95, alpha: 0.02, wobble: 0.14 },
  home_bed_large: { base: 0.96, alpha: 0.02, wobble: 0.16 },
  home_potion_table_large: {
    base: 0.94,
    alpha: 0.05,
    wobble: 0.32,
    sparkle: true,
    sparkleColor: "rgba(120,210,255,0.4)",
    sparkleScale: 1.25,
  },
  home_lounge_large: { base: 0.95, alpha: 0.028, wobble: 0.2 },
  home_books_large: { base: 0.95, alpha: 0.028, wobble: 0.18 },
  home_rug_large: { base: 0.97, alpha: 0.015, wobble: 0.1 },
  home_feast_table: { base: 0.93, alpha: 0.035, wobble: 0.25 },
  home_storage: { base: 0.92, alpha: 0.024, wobble: 0.18 },
  home_cauldron: {
    base: 0.94,
    alpha: 0.06,
    wobble: 0.34,
    sparkle: true,
    sparkleColor: "rgba(120,255,200,0.35)",
    sparkleScale: 1.4,
  },
  home_rug_grand: { base: 0.97, alpha: 0.012, wobble: 0.08 },
  home_round_table: { base: 0.95, alpha: 0.02, wobble: 0.22 },
  home_round_table_large: { base: 0.95, alpha: 0.024, wobble: 0.24 },
  home_chair: { base: 0.95, alpha: 0.02, wobble: 0.18 },
  home_lamp: {
    base: 0.92,
    alpha: 0.04,
    wobble: 0.3,
    sparkle: true,
    sparkleColor: "rgba(255,236,180,0.45)",
    sparkleScale: 1.3,
  },
  home_spell_table: { base: 0.94, alpha: 0.045, wobble: 0.3, sparkle: true, sparkleColor: "rgba(160,120,255,0.35)", sparkleScale: 1.1 },
  home_scroll_table: { base: 0.94, alpha: 0.03, wobble: 0.24 },
  home_potion_shelf: { base: 0.93, alpha: 0.02, wobble: 0.18 },
  home_crystal_pedestal: {
    base: 0.92,
    alpha: 0.05,
    wobble: 0.28,
    sparkle: true,
    sparkleColor: "rgba(150,130,255,0.4)",
    sparkleScale: 1.2,
  },
  floor_rune_ember: { base: 0.93, alpha: 0.05, wobble: 0.14 },
  floor_rune_tide: { base: 0.92, alpha: 0.05, wobble: 0.12 },
  floor_rune_verdant: { base: 0.93, alpha: 0.05, wobble: 0.16 },
};

const DECOR_GROUPS = {
  stalagmite_small: ["stalagmite_small", "stalagmite_tall", "moss_patch"],
  stalagmite_tall: ["stalagmite_small", "stalagmite_tall", "moss_patch"],
  stalactite_small: ["stalactite_small", "stalactite_tall", "spider_web"],
  stalactite_tall: ["stalactite_small", "stalactite_tall", "spider_web"],
  moss_patch: ["moss_patch", "fungus_cluster", "drip_pool"],
  glowing_moss: ["glowing_moss", "moss_patch", "fungus_cluster"],
  glowing_moss_field: ["glowing_moss_field", "glowing_moss", "moss_patch"],
  hanging_vine: ["hanging_vine", "glowing_moss", "stalactite_tall"],
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
  baseSpeed: 240,
  speed: 240,
  maxHealth: BASE_PLAYER_MAX_HEALTH,
  health: BASE_PLAYER_MAX_HEALTH,
  damage: BASE_GUN_DAMAGE,
  attackCooldown: BASE_GUN_COOLDOWN,
  attackRange: BASE_GUN_RANGE,
  lastAttack: 0,
  mana: STARTING_MANA,
  maxMana: 10000000,
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
  lastFacingX: 0,
  lastFacingY: 1,
  speedBoostTimer: 0,
  terrashieldTimer: 0,
  terrashieldArmorTimer: 0,
  terrashieldBurstPending: false,
};

const state = {
  running: false,
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
let hasteTrailAccumulator = 0;

const keys = { up: false, down: false, left: false, right: false };

const joystickState = {
  active: false,
  pointerId: null,
  dx: 0,
  dy: 0,
};

let nextSpellSpawnIndex = 0;
const spellSlots = [null, null, null];

const enemies = [];
let spawnAccumulator = 0;
const SPAWN_INTERVAL = 3600;
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
    speed: 210,
    speedGrowth: 0.55,
    health: 95,
    damage: 16,
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
    lungeSpeedMultiplier: 2.8,
    initialLungeDelayMultiplier: 0.7,
    lungeParticleColor: "#ffb37a",
    hasteThreshold: 0.45,
    hasteMultiplier: 1.18,
  },
  {
    id: "voidreaver",
    behaviour: "sentry",
    speed: 175,
    speedGrowth: 0.5,
    health: 120,
    damage: 21,
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
    lungeSpeedMultiplier: 2.6,
    initialLungeDelayMultiplier: 0.75,
    lungeParticleColor: "#b6a5ff",
    hasteThreshold: 0.5,
    hasteMultiplier: 1.12,
  },
  {
    id: "doomclaw",
    behaviour: "brute",
    speed: 145,
    speedGrowth: 0.48,
    health: 150,
    damage: 26,
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
    lungeSpeedMultiplier: 2.5,
    initialLungeDelayMultiplier: 0.8,
    lungeParticleColor: "#ff6f9d",
    hasteThreshold: 0.5,
    hasteMultiplier: 1.15,
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

const manaDrops = [];
const MANA_RESPAWN = 9000;
let manaAccumulator = MANA_RESPAWN;

const healthDrops = [];
const HEALTH_RESPAWN = 15000;
let healthAccumulator = HEALTH_RESPAWN;
const HEALTH_AMOUNT = 25;
const spellDrops = [];
const SPELL_RESPAWN = 20000;
let spellAccumulator = SPELL_RESPAWN;
const SPELL_TYPES = [
  { id: "blast", label: "Arc Blast", rune: "blast", color: "#f9d64c" },
  { id: "heal", label: "Sanctify", rune: "heal", color: "#8ef9ff" },
  { id: "haste", label: "Swiftstep", rune: "haste", color: "#b0ff6a" },
  { id: "terrashield", label: "Terrashield", rune: "terrashield", color: "#8cff8a" },
];
nextSpellSpawnIndex = Math.floor(Math.random() * SPELL_TYPES.length);
const SPELL_SLOT_RUNES = {
  blast:
    '<svg viewBox="0 0 32 32" class="spell-slot__icon" aria-hidden="true"><path d="M16 4l2.8 6.8 6.8 2.8-6.8 2.8-2.8 6.8-2.8-6.8-6.8-2.8 6.8-2.8z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><circle cx="16" cy="16" r="3.6" fill="currentColor"/></svg>',
  heal:
    '<svg viewBox="0 0 32 32" class="spell-slot__icon" aria-hidden="true"><path d="M16 6v20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M9.5 13c2.6-4.2 10.4-4.2 13 0" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.5 19c2.4 3.8 10.6 3.8 13.2 0" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="16" r="3" fill="currentColor"/></svg>',
  haste:
    '<svg viewBox="0 0 32 32" class="spell-slot__icon" aria-hidden="true"><path d="M22 9c-7-4-14 1.5-11.5 7 2 4 6.8 4.4 10 2.3" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M12.5 13.5c1.8-1.4 5.5-1.4 7.3 0" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M12.2 20.8c3 2.6 8 2.8 10.6-0.4" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M11 11c-1.6 1.4-2.4 4.2-0.8 6.2" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  terrashield:
    '<svg viewBox="0 0 32 32" class="spell-slot__icon" aria-hidden="true"><path d="M16 6l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V10z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M16 11v7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M12 15l4 3 4-3" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
};
const SPELL_BLAST_RANGE_MULTIPLIER = 2;
const SPELL_BLAST_DAMAGE_MULTIPLIER = 1.75;
const SPEED_SPELL_DURATION = 15000;
const SPEED_SPELL_MULTIPLIER = 1.45;
const MIN_PICKUP_DISTANCE = CELL_SIZE * 9;
const TERRASHIELD_ROOT_DURATION = 1800;
const TERRASHIELD_ARMOR_DURATION = 3200;
const TERRASHIELD_BURST_RADIUS = 140;
const TERRASHIELD_DAMAGE_MULTIPLIER = 2.3;
const TERRASHIELD_ARMOR_REDUCTION = 0.45;
const LIFEBLOOM_HEAL_RANGE = CELL_SIZE * 1.1;
const COMPANION_BOND_DISTANCE = CELL_SIZE * 1.2;
const LIFEBLOOM_FOLLOW_DISTANCE = CELL_SIZE * 0.55;
const COMPANION_FOLLOW_DISTANCE = CELL_SIZE * 0.62;
const COMPANION_FOLLOW_SPEED_MULT = 1.12;
const COMPANION_SPEED_BONUS = 60;
const COMPANION_NEAR_PLAYER_RADIUS = CELL_SIZE * 10;
const COMPANION_MIN_SPAWN_DISTANCE = CELL_SIZE * 1.4;
const COMPANION_SPAWN_INTERVAL = 62000;
const ECHOSPRITE_MANA_INTERVAL = 1700;
const ECHOSPRITE_COOLDOWN_REDUCTION = 0.4;
const PICKUP_LIFETIME = 60000;
const MEAT_HUNGER_RESTORE = 2;
const HUNGER_MAX = 100;
const MEAT_SPAWN_LIFETIME = 45000;
const MEAT_HOVER_SCALE = 2.4;
const MUTATION_EAT_INTERVAL = 5;
const HUNGER_WARNING_THRESHOLD = 70;
const HUNGER_CRITICAL_THRESHOLD = 90;

const particles = [];
const spellEffects = [];
const manaUsedPositions = new Set();
const healthUsedPositions = new Set();
const spellUsedPositions = new Set();
const damageNumbers = [];
const TITAN_SPAWN_INTERVAL = 60000;
let titanAccumulator = 0;
const meatDrops = [];
const meatUsedPositions = new Set();
const ENEMY_PREY_HEALTH_THRESHOLD = 0.3;
const ENEMY_PREY_OPPORTUNITY_RANGE = CELL_SIZE * 4;
const ENEMY_PREY_FEAST_HEAL = 60;
const enemyAggroFlags = {};
const ALWAYS_AGGRESSIVE_VARIANTS = new Set(["voidreaver", "doomclaw", "blightfang", "blightreaver", "titan"]);
const PREY_TYPES = [
  { id: "scamper", speed: 150, health: 45, color: "#7befa2", weight: 0.24, radius: 14, groupMin: 1, groupMax: 2 },
  { id: "glider", speed: 160, health: 40, color: "#5de0c2", weight: 0.20, radius: 14, groupMin: 1, groupMax: 2 },
  { id: "burrower", speed: 140, health: 55, color: "#8cf29d", weight: 0.18, radius: 16, groupMin: 1, groupMax: 2 },
  { id: "hootling", speed: 155, health: 48, color: "#b6ff9a", weight: 0.16, radius: 14, groupMin: 1, groupMax: 2 },
  { id: "spritelings", speed: 175, health: 24, color: "#9effd6", weight: 0.14, radius: 10, groupMin: 3, groupMax: 6, pack: true },
  { id: "boulderback", speed: 110, health: 140, color: "#9a774c", weight: 0.08, radius: 24, groupMin: 1, groupMax: 1 },
  { id: "lifebloom", speed: 80, health: 70, color: "#8cffb4", weight: 0.1, radius: 18, groupMin: 1, groupMax: 1 },
  { id: "glintmoth", speed: 165, health: 52, color: "#ffe78a", weight: 0.12, radius: 16, groupMin: 1, groupMax: 1 },
  { id: "echosprite", speed: 150, health: 44, color: "#9ec9ff", weight: 0.09, radius: 14, groupMin: 1, groupMax: 1 },
];
const COMPANION_VARIANTS = new Set(["lifebloom", "glintmoth", "echosprite"]);
const COMPANION_VARIANT_LIST = ["lifebloom", "glintmoth", "echosprite"];
const COMPANION_VARIANT_LIMITS = {
  lifebloom: 1,
  glintmoth: 2,
  echosprite: 2,
};
const PREY_SPAWN_INTERVAL = 8500;
const MAX_PREY = 14;
const PREY_IDLE_MIN = 1400;
const PREY_IDLE_MAX = 3000;
const PREY_FLEE_RANGE = CELL_SIZE * 3.2;
const PREY_FLEE_SPEED_MULT = 1.25;
const PREY_PATROL_DISTANCE = CELL_SIZE * 2.4;
const PREY_PATROL_SPREAD = CELL_SIZE * 3.2;
const PREY_MEAT_RESTORE = 4;
const PREY_MEAT_COLOR = "#ffb97f";
const preyList = [];
let companionSpeedBonus = 0;
let companionEchoAccumulator = 0;
let companionSpawnAccumulator = COMPANION_SPAWN_INTERVAL;
let preyAccumulator = PREY_SPAWN_INTERVAL;
let ensuredPackPrey = false;
let ensuredGiantPrey = false;

function updateCanvasSize() {
  const dpr = window.devicePixelRatio || 1;
  const targetWidth = Math.min(1200, window.innerWidth - 16);
  const targetHeight = isMobile ? window.innerHeight - 32 : Math.min(720, window.innerHeight - 140);
  canvas.width = targetWidth * dpr;
  canvas.height = targetHeight * dpr;
  canvas.style.width = `${targetWidth}px`;
  canvas.style.height = `${targetHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  VIEWPORT.width = targetWidth;
  VIEWPORT.height = targetHeight;
  const minimapSize = isMobile ? 150 : 200;
  minimapCanvas.width = minimapSize;
  minimapCanvas.height = minimapSize;
  minimapCanvas.style.width = `${minimapSize}px`;
  minimapCanvas.style.height = `${minimapSize}px`;
  minimapCtx.setTransform(1, 0, 0, 1, 0, 0);
  const slotSize = isMobile ? 48 : 54;
  document.documentElement.style.setProperty("--minimap-size", `${minimapSize}px`);
  document.documentElement.style.setProperty("--spell-slot-size", `${slotSize}px`);
}

function resetGame() {
  closeInfoOverlay(false);
  updateCanvasSize();
  player.x = spawnPoint.x * CELL_SIZE + CELL_SIZE / 2;
  player.y = spawnPoint.y * CELL_SIZE + CELL_SIZE / 2;
  player.maxHealth = BASE_PLAYER_MAX_HEALTH;
  player.health = player.maxHealth;
  player.mana = STARTING_MANA;
  player.damage = BASE_GUN_DAMAGE;
  player.attackCooldown = BASE_GUN_COOLDOWN;
  player.attackRange = BASE_GUN_RANGE;
  player.lastAttack = 0;
  player.frame = 0;
  player.animTimer = 0;
  player.facingX = 1;
  player.facingY = 0;
  player.shootingTimer = 0;
  player.baseSpeed = 240;
  player.speed = player.baseSpeed;
  player.speedBoostTimer = 0;
  player.terrashieldTimer = 0;
  player.terrashieldArmorTimer = 0;
  player.terrashieldBurstPending = false;
  player.gunLevel = 0;
  player.nextGunUpgrade = GUN_UPGRADE_FIRST;
  player.hunger = 0;
  player.hungerRate = BASE_HUNGER_RATE;
  player.hungerEaten = 0;
  player.mutationStage = 0;
  player.lastFacingX = 0;
  player.lastFacingY = 1;
  enemies.length = 0;
  manaDrops.length = 0;
  healthDrops.length = 0;
  meatDrops.length = 0;
  spellDrops.length = 0;
  particles.length = 0;
  spellEffects.length = 0;
  damageNumbers.length = 0;
  manaUsedPositions.clear();
  healthUsedPositions.clear();
  meatUsedPositions.clear();
  spellUsedPositions.clear();
  nextSpellSpawnIndex = Math.floor(Math.random() * SPELL_TYPES.length);
  for (let i = 0; i < spellSlots.length; i += 1) {
    spellSlots[i] = null;
  }
  SPELL_TYPES.forEach((spell, index) => {
    if (index < spellSlots.length) {
      spellSlots[index] = spell.id;
    }
  });
  Object.keys(enemyAggroFlags).forEach((key) => {
    delete enemyAggroFlags[key];
  });
  spawnAccumulator = 0;
  manaAccumulator = MANA_RESPAWN;
  healthAccumulator = HEALTH_RESPAWN;
  spellAccumulator = SPELL_RESPAWN;
  titanAccumulator = 0;
  preyList.length = 0;
  companionSpeedBonus = 0;
  companionEchoAccumulator = 0;
  companionSpawnAccumulator = COMPANION_SPAWN_INTERVAL * 0.85;
  preyAccumulator = PREY_SPAWN_INTERVAL;
  ensuredPackPrey = false;
  ensuredGiantPrey = false;
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
  hasteTrailAccumulator = 0;
  document.body.classList.add("show-minimap");
  createManaDrop();
  createHealthDrop();
  createTitanEnemy();
  spawnHomeLifebloom();
  spawnHomeGlintmoth();
  spawnCompanionNearPlayer("echosprite", { originX: player.x, originY: player.y, maxDistance: COMPANION_NEAR_PLAYER_RADIUS * 0.6 });
  for (let i = 0; i < Math.min(4, MAX_PREY); i += 1) {
    createPrey();
  }
  updateSpellSlotsUI();
  updateHUD();
}

function startGame() {
  if (initialStart) return;
  initialStart = true;
  if (startOverlay) {
    startOverlay.classList.add("start-overlay--hidden");
    startOverlay.setAttribute("aria-hidden", "true");
  }
  resetGame();
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
    walkCycle: 0,
    glowPhase: Math.random() * Math.PI * 2,
    attackTimer: 0,
    dashRange: template.dashRange ?? CELL_SIZE * 2.4,
    dashCooldownBase: template.dashCooldown ?? 2100,
    dashCooldownTimer: Math.random() * ((template.dashCooldown ?? 2100) * 0.7),
    dashDuration: template.dashDuration ?? 220,
    dashSpeedMultiplier: template.dashSpeedMultiplier ?? 1.85,
    isDashing: false,
    dashTimer: 0,
    dashDirX: 0,
    dashDirY: 0,
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
    attackTimer: 0,
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

function pickPreyType() {
  if (!ensuredPackPrey) {
    const packType = PREY_TYPES.find((type) => type.id === "spritelings");
    if (packType) {
      return packType;
    }
  }
  if (!ensuredGiantPrey && preyList.length >= Math.max(2, Math.floor(MAX_PREY / 2))) {
    const giantType = PREY_TYPES.find((type) => type.id === "boulderback");
    if (giantType) {
      return giantType;
    }
  }
  const totalWeight = PREY_TYPES.reduce((sum, type) => sum + type.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const type of PREY_TYPES) {
    if ((roll -= type.weight) <= 0) {
      return type;
    }
  }
  return PREY_TYPES[0];
}

function createManaDrop() {
  const drop = generatePickupLocation();
  manaUsedPositions.add(drop.key);
  manaDrops.push({
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

function createSpellDrop() {
  const drop = generatePickupLocation(MIN_PICKUP_DISTANCE * 1.4);
  const spell = SPELL_TYPES[nextSpellSpawnIndex % SPELL_TYPES.length];
  nextSpellSpawnIndex = (nextSpellSpawnIndex + 1) % SPELL_TYPES.length;
  spellUsedPositions.add(drop.key);
  spellDrops.push({
    x: drop.x,
    y: drop.y,
    radius: 22,
    lifetime: PICKUP_LIFETIME * 1.4,
    key: drop.key,
    bobPhase: Math.random() * Math.PI * 2,
    bobOffset: 0,
    spellId: spell.id,
    color: spell.color,
  });
}

function addPreyFromTemplate(template, spawnX, spawnY, overrides = {}) {
  const radius = template.radius ?? 14;
  const isCompanion =
    overrides.companion !== undefined ? overrides.companion : COMPANION_VARIANTS.has(template.id);
  const prey = {
    x: spawnX,
    y: spawnY,
    radius,
    speed: template.speed,
    maxHealth: template.health,
    health: template.health,
    color: template.color,
    variant: template.id,
    state: "idle",
    idleTimer: PREY_IDLE_MIN + Math.random() * (PREY_IDLE_MAX - PREY_IDLE_MIN),
    spawnTimer: ENEMY_SPAWN_FLASH,
    animTimer: 0,
    targetX: null,
    targetY: null,
    pack: !!template.pack,
    healTimer: 0,
    companion: isCompanion,
    bonded: false,
    bondAngle: Math.random() * Math.PI * 2,
    bondSpin: 0,
    effectTimer: 0,
    auraTimer: 0,
  };
  Object.assign(prey, overrides);
  preyList.push(prey);
  return prey;
}

function createPrey() {
  if (preyList.length >= MAX_PREY) return;
  const template = pickPreyType();
  const room = dungeonRooms[Math.floor(Math.random() * dungeonRooms.length)];
  const padding = 2;
  const tileX = room.x + padding + Math.floor(Math.random() * Math.max(1, room.width - padding * 2));
  const tileY = room.y + padding + Math.floor(Math.random() * Math.max(1, room.height - padding * 2));
  const baseX = tileX * CELL_SIZE + CELL_SIZE / 2;
  const baseY = tileY * CELL_SIZE + CELL_SIZE / 2;
  const groupMin = template.groupMin ?? 1;
  const groupMax = template.groupMax ?? groupMin;
  const desiredCount = groupMin + Math.floor(Math.random() * Math.max(1, groupMax - groupMin + 1));
  let spawnCount = Math.max(1, Math.min(desiredCount, MAX_PREY - preyList.length));
  const radius = template.radius ?? 14;
  const isCompanion = COMPANION_VARIANTS.has(template.id);

  for (let i = 0; i < spawnCount; i += 1) {
    let spawnX = baseX;
    let spawnY = baseY;
    if (spawnCount > 1) {
      let attempt = 0;
      const spread = (template.pack ? 0.45 : 0.65) * CELL_SIZE;
      while (attempt < 12) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * spread;
        const candidateX = baseX + Math.cos(angle) * distance;
        const candidateY = baseY + Math.sin(angle) * distance;
        if (isWalkable(candidateX, candidateY, radius)) {
          spawnX = candidateX;
          spawnY = candidateY;
          break;
        }
        attempt += 1;
      }
    }
    if (!isWalkable(spawnX, spawnY, radius)) continue;
    addPreyFromTemplate(template, spawnX, spawnY, {
      pack: !!template.pack,
      companion: isCompanion,
    });
    if (template.id === "spritelings") ensuredPackPrey = true;
    if (template.id === "boulderback") ensuredGiantPrey = true;
    if (preyList.length >= MAX_PREY) break;
  }
}

function spawnHomeLifebloom() {
  if (preyList.length >= MAX_PREY) return;
  const template = PREY_TYPES.find((prey) => prey.id === "lifebloom");
  if (!template) return;
  const homeRoom = dungeonRooms.find((room) => room.isHome);
  if (!homeRoom) return;

  const baseTileX = homeRoom.centerX;
  const baseTileY = homeRoom.centerY;
  const candidateOffsets = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
    { x: 1, y: 1 },
    { x: -1, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: -1 },
    { x: 2, y: 0 },
    { x: -2, y: 0 },
    { x: 0, y: 2 },
    { x: 0, y: -2 },
    { x: 2, y: 1 },
    { x: -2, y: 1 },
    { x: 2, y: -1 },
    { x: -2, y: -1 },
  ];

  const isInsideHome = (tileX, tileY) =>
    tileX >= homeRoom.x &&
    tileX < homeRoom.x + homeRoom.width &&
    tileY >= homeRoom.y &&
    tileY < homeRoom.y + homeRoom.height;

  const radius = template.radius ?? 14;
  let spawnX = null;
  let spawnY = null;

  for (let i = 0; i < candidateOffsets.length; i += 1) {
    const offset = candidateOffsets[i];
    const tileX = baseTileX + offset.x;
    const tileY = baseTileY + offset.y;
    if (!isInsideHome(tileX, tileY)) continue;
    const worldX = tileX * CELL_SIZE + CELL_SIZE / 2;
    const worldY = tileY * CELL_SIZE + CELL_SIZE / 2;
    if (!isWalkable(worldX, worldY, radius)) continue;
    if (Math.hypot(worldX - player.x, worldY - player.y) < radius + player.radius + 12) continue;
    spawnX = worldX;
    spawnY = worldY;
    break;
  }

  if (spawnX === null || spawnY === null) {
    spawnX = baseTileX * CELL_SIZE + CELL_SIZE / 2;
    spawnY = baseTileY * CELL_SIZE + CELL_SIZE / 2;
  }

  addPreyFromTemplate(template, spawnX, spawnY, { companion: true });
}

function spawnHomeGlintmoth() {
  if (preyList.length >= MAX_PREY) return;
  const template = PREY_TYPES.find((prey) => prey.id === "glintmoth");
  if (!template) return;
  const homeRoom = dungeonRooms.find((room) => room.isHome);
  if (!homeRoom) return;

  const baseTileX = homeRoom.centerX - 1;
  const baseTileY = homeRoom.centerY + 1;
  const candidateOffsets = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
    { x: 1, y: 1 },
    { x: -1, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: -1 },
    { x: 2, y: 0 },
    { x: -2, y: 0 },
    { x: 0, y: 2 },
    { x: 0, y: -2 },
  ];

  const isInsideHome = (tileX, tileY) =>
    tileX >= homeRoom.x &&
    tileX < homeRoom.x + homeRoom.width &&
    tileY >= homeRoom.y &&
    tileY < homeRoom.y + homeRoom.height;

  const radius = template.radius ?? 14;
  let spawnX = null;
  let spawnY = null;

  for (let i = 0; i < candidateOffsets.length; i += 1) {
    const offset = candidateOffsets[i];
    const tileX = baseTileX + offset.x;
    const tileY = baseTileY + offset.y;
    if (!isInsideHome(tileX, tileY)) continue;
    const worldX = tileX * CELL_SIZE + CELL_SIZE / 2;
    const worldY = tileY * CELL_SIZE + CELL_SIZE / 2;
    if (!isWalkable(worldX, worldY, radius)) continue;
    if (Math.hypot(worldX - player.x, worldY - player.y) < radius + player.radius + 12) continue;
    spawnX = worldX;
    spawnY = worldY;
    break;
  }

  if (spawnX === null || spawnY === null) {
    spawnX = baseTileX * CELL_SIZE + CELL_SIZE / 2;
    spawnY = baseTileY * CELL_SIZE + CELL_SIZE / 2;
  }

  addPreyFromTemplate(template, spawnX, spawnY, { companion: true });
}

function spawnCompanionNearPlayer(variantId, options = {}) {
  if (preyList.length >= MAX_PREY) return false;
  const template = PREY_TYPES.find((prey) => prey.id === variantId);
  if (!template) return false;
  const radius = template.radius ?? 14;
  const originX = options.originX ?? player.x;
  const originY = options.originY ?? player.y;
  const maxDistance = Math.max(COMPANION_MIN_SPAWN_DISTANCE, options.maxDistance ?? COMPANION_NEAR_PLAYER_RADIUS);
  const minDistance = Math.max(radius + player.radius + 10, options.minDistance ?? COMPANION_MIN_SPAWN_DISTANCE);

  for (let attempt = 0; attempt < 28; attempt += 1) {
    const distance = minDistance + Math.random() * Math.max(0, maxDistance - minDistance);
    const angle = Math.random() * Math.PI * 2;
    const spawnX = originX + Math.cos(angle) * distance;
    const spawnY = originY + Math.sin(angle) * distance;
    if (!isWalkable(spawnX, spawnY, radius)) continue;
    if (Math.hypot(spawnX - player.x, spawnY - player.y) < radius + player.radius + 8) continue;
    const tileX = Math.floor(spawnX / CELL_SIZE);
    const tileY = Math.floor(spawnY / CELL_SIZE);
    if (getTile(tileX, tileY) === 0) continue;
    addPreyFromTemplate(template, spawnX, spawnY, { companion: true });
    return true;
  }
  return false;
}

function countCompanionVariant(variantId) {
  let count = 0;
  preyList.forEach((prey) => {
    if (prey.variant === variantId) count += 1;
  });
  return count;
}

function spawnNextCompanion() {
  if (preyList.length >= MAX_PREY) return false;
  const available = COMPANION_VARIANT_LIST.filter(
    (variant) => countCompanionVariant(variant) < (COMPANION_VARIANT_LIMITS[variant] ?? 1),
  );
  if (available.length === 0) return false;

  let selected = available[0];
  let bestCount = countCompanionVariant(selected);
  for (let i = 1; i < available.length; i += 1) {
    const variant = available[i];
    const variantCount = countCompanionVariant(variant);
    if (variantCount < bestCount) {
      bestCount = variantCount;
      selected = variant;
    }
  }
  const success = spawnCompanionNearPlayer(selected);
  if (!success && available.length > 1) {
    return spawnCompanionNearPlayer(available[Math.floor(Math.random() * available.length)]);
  }
  return success;
}

function scheduleMeatDrop(enemy, color, guaranteed = false, options = {}) {
  createMeatDrop(enemy.x, enemy.y, color || MEAT_COLOR, options);
}

function createMeatDrop(baseX, baseY, color = MEAT_COLOR, options = {}) {
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
    restore: options.restore ?? MEAT_HUNGER_RESTORE,
    mutates: options.mutates !== undefined ? options.mutates : true,
  });
}

function getSpellDefinition(spellId) {
  return SPELL_TYPES.find((spell) => spell.id === spellId) || null;
}

function updateSpellSlotsUI() {
  if (!spellSlotEls || spellSlotEls.length === 0) return;
  spellSlotEls.forEach((slotEl, index) => {
    const spellId = spellSlots[index];
    const runeEl = slotEl.querySelector(".spell-slot__rune");
    slotEl.classList.toggle("spell-slot--filled", Boolean(spellId));
    slotEl.classList.toggle("spell-slot--empty", !spellId);
    if (spellId) {
      const spell = getSpellDefinition(spellId);
      slotEl.dataset.spell = spellId;
      slotEl.setAttribute(
        "aria-label",
        `Spell slot ${index + 1}: ${spell ? spell.label : "Ready"}`
      );
      slotEl.style.color = spell && spell.color ? spell.color : "#f9d64c";
      if (runeEl) {
        runeEl.innerHTML = SPELL_SLOT_RUNES[spellId] || "";
      }
    } else {
      slotEl.dataset.spell = "";
      slotEl.setAttribute("aria-label", `Spell slot ${index + 1}: Empty`);
      slotEl.style.removeProperty("color");
      if (runeEl) {
        runeEl.innerHTML = "";
      }
    }
  });
}

function addSpellToSlots(spellId) {
  for (let i = 0; i < spellSlots.length; i += 1) {
    if (spellSlots[i] === null) {
      spellSlots[i] = spellId;
      updateSpellSlotsUI();
      return i;
    }
  }
  return -1;
}

function clearSpellSlot(index) {
  if (index < 0 || index >= spellSlots.length) return;
  spellSlots[index] = null;
  updateSpellSlotsUI();
}

function updateHUD() {
  const currentHealth = Math.max(Math.round(player.health), 0);
  const maxHealth = Math.round(player.maxHealth);
  healthEl.textContent = `${currentHealth}/${maxHealth}`;
  manaEl.textContent = player.mana.toString().padStart(3, " ");
  killsEl.textContent = state.kills.toString().padStart(3, "0");
  if (hungerEl) hungerEl.textContent = Math.floor(player.hunger).toString().padStart(3, " ");
  const elapsed = state.over ? state.durationWhenOver : Math.floor((performance.now() - state.startedAt) / 1000);
  const minutes = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const seconds = (elapsed % 60).toString().padStart(2, "0");
  timerEl.textContent = `${minutes}:${seconds}`;
  updateSpellSlotsUI();
}

function showAchievement(text) {
  if (!achievementBanner) return;
  achievementBanner.textContent = text;
  achievementBanner.classList.add("achievement-banner--visible");
  achievementTimer = 10000;
}

function eatMeat(amount = MEAT_HUNGER_RESTORE, mutates = true) {
  player.hunger = Math.max(0, player.hunger - amount);
  if (mutates) {
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
    player.mana = Math.max(player.mana, STARTING_MANA);
    const prevMaxHealth = player.maxHealth;
    player.maxHealth += 10;
    const healthGain = player.maxHealth - prevMaxHealth;
    player.health = Math.min(player.health + healthGain, player.maxHealth);

    const damageGain = newDamage - prevDamage;
    const fireRateGain =
      prevCooldown > 0 ? Math.round(((prevCooldown - newCooldown) / prevCooldown) * 100) : 0;
    const rangeGain = newRange - prevRange;
    const levelLabel = `MK-${String(player.gunLevel + 1).padStart(2, "0")}`;
    const prefix = player.gunLevel === 1 ? "5 Kills! " : "";
    showAchievement(
      `${prefix}Staff upgrade ${levelLabel}! Damage +${damageGain}, cast rate +${Math.max(fireRateGain, 0)}%, range +${rangeGain}, max HP +${healthGain}`,
    );
    updateHUD();
  }
}

function update(delta) {
  if (!initialStart) return;
  if (!state.running || state.paused) return;
  if (player.terrashieldTimer > 0) {
    player.terrashieldTimer = Math.max(0, player.terrashieldTimer - delta);
    if (player.terrashieldTimer === 0 && player.terrashieldBurstPending) {
      triggerTerrashieldBurst();
    }
  } else if (player.terrashieldBurstPending) {
    triggerTerrashieldBurst();
  }
  if (player.terrashieldArmorTimer > 0) {
    player.terrashieldArmorTimer = Math.max(0, player.terrashieldArmorTimer - delta);
  }
  const currentCompanionBonus = companionSpeedBonus;
  if (player.speedBoostTimer > 0) {
    player.speedBoostTimer = Math.max(0, player.speedBoostTimer - delta);
    player.speed = player.baseSpeed * SPEED_SPELL_MULTIPLIER + currentCompanionBonus;
    hasteTrailAccumulator += delta;
    if (hasteTrailAccumulator >= 160) {
      spawnParticles(player.x, player.y, "#b0ff6a", 80, 6);
      hasteTrailAccumulator = 0;
    }
    if (player.speedBoostTimer <= 0) {
      player.speed = player.baseSpeed + currentCompanionBonus;
    }
  } else {
    player.speed = player.baseSpeed + currentCompanionBonus;
    hasteTrailAccumulator = 0;
  }
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

  if (player.terrashieldTimer > 0) {
    moveX = 0;
    moveY = 0;
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
    player.lastFacingX = moveX;
    player.lastFacingY = moveY;
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

  manaAccumulator += delta;
  if (manaAccumulator >= MANA_RESPAWN) {
    manaAccumulator -= MANA_RESPAWN;
    createManaDrop();
  }

  healthAccumulator += delta;
  if (healthAccumulator >= HEALTH_RESPAWN) {
    healthAccumulator -= HEALTH_RESPAWN;
    createHealthDrop();
  }

  spellAccumulator += delta;
  if (spellAccumulator >= SPELL_RESPAWN) {
    spellAccumulator -= SPELL_RESPAWN;
    createSpellDrop();
  }

  titanAccumulator += delta;
  if (titanAccumulator >= TITAN_SPAWN_INTERVAL) {
    titanAccumulator -= TITAN_SPAWN_INTERVAL;
    createTitanEnemy();
  }

  preyAccumulator += delta;
  if (preyAccumulator >= PREY_SPAWN_INTERVAL) {
    preyAccumulator = 0;
    if (preyList.length < MAX_PREY) {
      createPrey();
    }
  }

  companionSpawnAccumulator -= delta;
  if (companionSpawnAccumulator <= 0) {
    const spawned = spawnNextCompanion();
    const intervalMultiplier = spawned ? 0.7 + Math.random() * 0.6 : 0.5;
    companionSpawnAccumulator = COMPANION_SPAWN_INTERVAL * intervalMultiplier;
  }

  updatePrey(delta);

  enemies.forEach((enemy) => {
    const dxPlayer = player.x - enemy.x;
    const dyPlayer = player.y - enemy.y;
    const distanceToPlayer = Math.hypot(dxPlayer, dyPlayer) || 1;
    const isTitan = enemy.behaviour === "titan";
    const hasLunge = enemy.lungeRange !== undefined && enemy.lungeCooldownBase;
    const nearestPreyInfo = getNearestPrey(enemy.x, enemy.y);
    const healthRatio = enemy.health / enemy.maxHealth;
    const variantAggro =
      ALWAYS_AGGRESSIVE_VARIANTS.has(enemy.variant) || enemyAggroFlags[enemy.variant] || isTitan;
    const provoked = enemy.health < enemy.maxHealth;
    const shouldAggroPlayer = variantAggro || provoked;

    if (enemy.attackTimer === undefined) enemy.attackTimer = 0;
    enemy.attackTimer = Math.max(0, (enemy.attackTimer || 0) - delta);

    let targetType = null;
    let targetEntity = null;
    let targetDx = 0;
    let targetDy = 0;
    let distance = Infinity;
    let hasTargetSight = false;

    if (shouldAggroPlayer) {
      targetType = "player";
      targetEntity = player;
      targetDx = dxPlayer;
      targetDy = dyPlayer;
      distance = distanceToPlayer;
      hasTargetSight = hasLineOfSight(enemy.x, enemy.y, player.x, player.y);
    }

    if (nearestPreyInfo) {
      const preyDistance = nearestPreyInfo.distance;
      if (
        healthRatio <= ENEMY_PREY_HEALTH_THRESHOLD ||
        preyDistance <= ENEMY_PREY_OPPORTUNITY_RANGE
      ) {
        targetType = "prey";
        targetEntity = nearestPreyInfo.prey;
        targetDx = targetEntity.x - enemy.x;
        targetDy = targetEntity.y - enemy.y;
        distance = preyDistance || 1;
        hasTargetSight = hasLineOfSight(enemy.x, enemy.y, targetEntity.x, targetEntity.y);
      }
    }

    if (!targetEntity) {
      if (enemy.behaviour === "sentry") {
        if (!enemy.targetX || Math.hypot(enemy.targetX - enemy.x, enemy.targetY - enemy.y) < 12) {
          assignPatrolTarget(enemy);
        }
        targetType = "patrol";
        targetEntity = { x: enemy.targetX, y: enemy.targetY };
        targetDx = enemy.targetX - enemy.x;
        targetDy = enemy.targetY - enemy.y;
        distance = Math.hypot(targetDx, targetDy) || 1;
        hasTargetSight = true;
      } else {
        if (!enemy.wanderTarget || Math.hypot(enemy.wanderTarget.x - enemy.x, enemy.wanderTarget.y - enemy.y) < 12) {
          assignWanderTarget(enemy);
        }
        targetType = "wander";
        targetEntity = enemy.wanderTarget;
        targetDx = targetEntity.x - enemy.x;
        targetDy = targetEntity.y - enemy.y;
        distance = Math.hypot(targetDx, targetDy) || 1;
        hasTargetSight = true;
      }
    }
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
        if (enemy.lungeTimer === 0) enemy.isLunging = false;
      }
      if (!enemy.isLunging && enemy.lungeCooldownTimer === 0 && distance < enemy.lungeRange && hasTargetSight) {
        enemy.isLunging = true;
        enemy.lungeTimer = enemy.lungeDuration || 260;
        enemy.lungeCooldownTimer = enemy.lungeCooldownBase;
        const len = distance || 1;
        enemy.lungeDirX = targetDx / len;
        enemy.lungeDirY = targetDy / len;
        enemy.attackTimer = Math.max(enemy.attackTimer || 0, (enemy.lungeDuration || 260) + 150);
        spawnParticles(
          enemy.x,
          enemy.y,
          enemy.lungeParticleColor || enemy.color || "#ff4d94",
          160,
          Math.max(16, Math.round((enemy.radius || 18) * 0.9)),
        );
      }
    }

    if (enemy.dashCooldownBase !== undefined) {
      enemy.dashCooldownTimer = Math.max(0, (enemy.dashCooldownTimer || 0) - delta);
      if (enemy.isDashing) {
        enemy.dashTimer = Math.max(0, (enemy.dashTimer || 0) - delta);
        if (enemy.dashTimer === 0) enemy.isDashing = false;
      }
      const canDash = !enemy.isDashing && (!enemy.isLunging || !hasLunge) && enemy.dashCooldownTimer === 0;
      if (canDash && targetEntity && hasTargetSight && distance < enemy.dashRange && distance > enemy.radius + 12) {
        enemy.isDashing = true;
        enemy.dashTimer = enemy.dashDuration || 220;
        const len = distance || 1;
        enemy.dashDirX = targetDx / len;
        enemy.dashDirY = targetDy / len;
        enemy.dashCooldownTimer = enemy.dashCooldownBase;
        enemy.attackTimer = Math.max(enemy.attackTimer || 0, (enemy.dashDuration || 220) + 120);
        spawnParticles(enemy.x, enemy.y, enemy.color || "#f79d2a", 120, 14);
      }
    }

    if (isTitan) {
      if (enemy.walkCycle === undefined) enemy.walkCycle = 0;
      if (enemy.glowPhase === undefined) enemy.glowPhase = Math.random() * Math.PI * 2;
    }

    let moved = false;
    if (targetEntity) {
      let dirX = targetDx / (distance || 1);
      let dirY = targetDy / (distance || 1);
      let moveSpeed = enemy.speed;
      let shrink = enemy.collisionShrink ?? (isTitan ? 0.6 : 0.65);
      if (enemy.isLunging) {
        moveSpeed = enemy.speed * (enemy.lungeSpeedMultiplier || 1.8);
        if (enemy.lungeDirX !== undefined) {
          dirX = enemy.lungeDirX || dirX;
          dirY = enemy.lungeDirY || dirY;
        }
      } else if (enemy.isDashing) {
        moveSpeed = enemy.speed * (enemy.dashSpeedMultiplier || 1.8);
        dirX = enemy.dashDirX || dirX;
        dirY = enemy.dashDirY || dirY;
        shrink *= 0.92;
      } else if (
        hasLunge &&
        enemy.hasteThreshold !== undefined &&
        enemy.hasteMultiplier &&
        enemy.lungeCooldownTimer < enemy.lungeCooldownBase * enemy.hasteThreshold
      ) {
        moveSpeed = enemy.speed * enemy.hasteMultiplier;
      } else if (!shouldAggroPlayer && targetType !== "prey") {
        moveSpeed = enemy.speed * 0.75;
      }
      moved = stepEntity(enemy, dirX, dirY, moveSpeed, deltaSeconds, shrink);

      if (
        enemy.behaviour === "sentry" &&
        targetType === "player" &&
        (!hasTargetSight || distance > SENTRY_LOSE_RANGE)
      ) {
        enemy.state = "patrol";
        assignPatrolTarget(enemy);
      }
    }

    if (!shouldAggroPlayer && enemy.behaviour !== "sentry") {
      enemy.state = "wander";
    } else if (shouldAggroPlayer && enemy.behaviour !== "sentry") {
      enemy.state = "hunt";
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

    if (moved) {
      enemy.walkCycle = ((enemy.walkCycle || 0) + delta) % 1800;
    } else {
      enemy.walkCycle = Math.max(0, (enemy.walkCycle || 0) - delta * 0.6);
    }

    if (Math.hypot(enemy.x - enemy.prevX, enemy.y - enemy.prevY) > STUCK_DISTANCE) {
      enemy.prevX = enemy.x;
      enemy.prevY = enemy.y;
      enemy.stuckTimer = Math.max(0, enemy.stuckTimer - delta);
    }

    attemptConsumePrey(enemy);

    enemy.damageCooldown = Math.max(0, enemy.damageCooldown - delta);
    if (
      distanceToPlayer < enemy.radius + player.radius + 4 &&
      enemy.damageCooldown === 0 &&
      (shouldAggroPlayer || enemy.behaviour === "titan")
    ) {
      let incomingDamage = enemy.damage;
      if (player.terrashieldArmorTimer > 0) {
        incomingDamage = Math.max(1, Math.ceil(incomingDamage * (1 - TERRASHIELD_ARMOR_REDUCTION)));
      }
      player.health -= incomingDamage;
      spawnDamageNumber(player.x, player.y - player.radius * 1.4, incomingDamage, "player");
      enemy.damageCooldown = 700;
      enemy.attackTimer = Math.max(enemy.attackTimer || 0, 260);
      spawnParticles(player.x, player.y, "#f45d5d");
      if (player.health <= 0) gameOver();
    }
  });

  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    const enemy = enemies[i];
    if (enemy.health <= 0) {
      spawnParticles(enemy.x, enemy.y, enemy.color || "#f79d2a");
      enemyAggroFlags[enemy.variant] = true;
      scheduleMeatDrop(enemy, enemy.color || MEAT_COLOR, enemy.behaviour === "titan");
      enemies.splice(i, 1);
      state.kills += 1;
      handleGunUpgrade();
    }
  }

  for (let i = manaDrops.length - 1; i >= 0; i -= 1) {
    const drop = manaDrops[i];
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
      manaUsedPositions.delete(drop.key);
      manaDrops.splice(i, 1);
      continue;
    }
    const distance = Math.hypot(drop.x - player.x, drop.y - player.y);
    if (distance < drop.radius + player.radius) {
      player.mana = Math.min(player.maxMana, player.mana + 5);
      spawnParticles(drop.x, drop.y, "#62f2ff");
      manaUsedPositions.delete(drop.key);
      manaDrops.splice(i, 1);
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

  for (let i = spellDrops.length - 1; i >= 0; i -= 1) {
    const drop = spellDrops[i];
    drop.lifetime -= delta;
    drop.bobPhase = (drop.bobPhase || 0) + delta * PICKUP_BOB_SPEED;
    if (drop.bobPhase > Math.PI * 2) drop.bobPhase -= Math.PI * 2;
    drop.bobOffset = Math.sin(drop.bobPhase) * PICKUP_BOB_AMPLITUDE;
    if (drop.lifetime <= 0) {
      spellUsedPositions.delete(drop.key);
      spellDrops.splice(i, 1);
      continue;
    }
    const distance = Math.hypot(drop.x - player.x, drop.y - player.y);
    if (distance < drop.radius + player.radius) {
      const addedSlot = addSpellToSlots(drop.spellId);
      const spellDef = getSpellDefinition(drop.spellId);
      spellUsedPositions.delete(drop.key);
      spellDrops.splice(i, 1);
      if (addedSlot !== -1 && spellDef) {
        const sparkColor = spellDef.color || "#f9d64c";
        spawnParticles(drop.x, drop.y, sparkColor, 220, 20);
        showAchievement(`Spell prepped: ${spellDef.label}`);
      }
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
      eatMeat(drop.restore || MEAT_HUNGER_RESTORE, drop.mutates !== false);
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

  for (let i = spellEffects.length - 1; i >= 0; i -= 1) {
    const effect = spellEffects[i];
    effect.elapsed = (effect.elapsed || 0) + delta;
    if (effect.duration) {
      effect.progress = Math.min(effect.elapsed / effect.duration, 1);
      if (effect.elapsed >= effect.duration) {
        spellEffects.splice(i, 1);
      }
    }
  }

  for (let i = damageNumbers.length - 1; i >= 0; i -= 1) {
    const dmg = damageNumbers[i];
    dmg.life -= delta;
    if (dmg.life <= 0) {
      damageNumbers.splice(i, 1);
      continue;
    }
    const t = 1 - dmg.life / dmg.maxLife;
    dmg.y -= delta * (0.035 + 0.015 * t);
    dmg.x += dmg.drift * delta;
  }

  updateHUD();
}

function updatePrey(delta) {
  const deltaSeconds = delta / 1000;
  let pendingSpeedBonus = 0;
  let echoSpriteCount = 0;
  preyList.forEach((prey) => {
    prey.animTimer = (prey.animTimer + delta) % 1000;
    if (prey.spawnTimer) {
      prey.spawnTimer = Math.max(0, prey.spawnTimer - delta);
    }
    let avoidX = 0;
    let avoidY = 0;
    const playerDist = Math.hypot(player.x - prey.x, player.y - prey.y);
    const isCompanionVariant = COMPANION_VARIANTS.has(prey.variant);
    if (!isCompanionVariant && playerDist < PREY_FLEE_RANGE) {
      const inv = 1 / Math.max(playerDist, 1);
      avoidX += (prey.x - player.x) * inv;
      avoidY += (prey.y - player.y) * inv;
    }
    enemies.forEach((enemy) => {
      const dist = Math.hypot(enemy.x - prey.x, enemy.y - prey.y);
      if (dist < PREY_FLEE_RANGE * 1.15) {
        const inv = 1 / Math.max(dist, 1);
        avoidX += (prey.x - enemy.x) * inv;
        avoidY += (prey.y - enemy.y) * inv;
      }
    });
    if (avoidX !== 0 || avoidY !== 0) {
      const len = Math.hypot(avoidX, avoidY) || 1;
      const dirX = avoidX / len;
      const dirY = avoidY / len;
      stepEntity(prey, dirX, dirY, prey.speed * PREY_FLEE_SPEED_MULT, deltaSeconds, 0.6);
      prey.state = "flee";
      prey.idleTimer = PREY_IDLE_MIN;
      return;
    }
    if (prey.pack && prey.state !== "flee") {
      let cx = 0;
      let cy = 0;
      let count = 0;
      const cohesionRange = CELL_SIZE * 2.6;
      preyList.forEach((other) => {
        if (other === prey || other.variant !== prey.variant) return;
        const d = Math.hypot(other.x - prey.x, other.y - prey.y);
        if (d < cohesionRange) {
          cx += other.x;
          cy += other.y;
          count += 1;
        }
      });
      if (count > 0) {
        const avgX = cx / count;
        const avgY = cy / count;
        if (!prey.targetX || Math.hypot(prey.targetX - avgX, prey.targetY - avgY) > CELL_SIZE * 0.5) {
          prey.targetX = avgX;
          prey.targetY = avgY;
          if (prey.state !== "patrol") {
            prey.state = "patrol";
          }
        }
      }
    }
    if (prey.state === "flee") {
      prey.state = "idle";
      prey.idleTimer = PREY_IDLE_MIN + Math.random() * (PREY_IDLE_MAX - PREY_IDLE_MIN);
      prey.targetX = null;
      prey.targetY = null;
    }

    let handledByCompanion = false;
    if (isCompanionVariant) {
      handledByCompanion = updateCompanionBehaviour(prey, deltaSeconds, playerDist);
    }

    if (!handledByCompanion) {
      if (prey.state === "idle") {
        prey.idleTimer -= delta;
        if (prey.idleTimer <= 0) {
          setPreyPatrolTarget(prey);
          prey.state = "patrol";
        }
      } else if (prey.state === "patrol") {
        if (!prey.targetX || !prey.targetY) {
          setPreyPatrolTarget(prey);
        }
        const dx = prey.targetX - prey.x;
        const dy = prey.targetY - prey.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < 12) {
          prey.state = "idle";
          prey.idleTimer = PREY_IDLE_MIN + Math.random() * (PREY_IDLE_MAX - PREY_IDLE_MIN);
          prey.targetX = null;
          prey.targetY = null;
        } else {
          stepEntity(prey, dx / dist, dy / dist, prey.speed * 0.8, deltaSeconds, 0.62);
        }
      }
    }

    if (prey.variant === "lifebloom") {
      if (playerDist <= LIFEBLOOM_HEAL_RANGE && player.health > 0 && player.health < player.maxHealth) {
        prey.healTimer += delta;
        while (prey.healTimer >= 1000) {
          prey.healTimer -= 1000;
          player.health = Math.min(player.maxHealth, player.health + 1);
          spawnHealNumber(player.x, player.y - player.radius * 1.5, 1);
          updateHUD();
        }
      } else {
        prey.healTimer = Math.max(0, prey.healTimer - delta * 0.5);
      }
    } else if (prey.variant === "glintmoth" && prey.bonded) {
      pendingSpeedBonus += COMPANION_SPEED_BONUS;
    } else if (prey.variant === "echosprite" && prey.bonded) {
      echoSpriteCount += 1;
      prey.effectTimer = (prey.effectTimer || 0) + delta;
      if (prey.effectTimer >= 420) {
        spawnParticles(prey.x, prey.y, "#9ec9ff", 100, 12);
        prey.effectTimer = 0;
      }
    }
  });
  companionSpeedBonus = pendingSpeedBonus;
  if (echoSpriteCount > 0) {
    companionEchoAccumulator += delta * echoSpriteCount;
    const now = performance.now();
    while (companionEchoAccumulator >= ECHOSPRITE_MANA_INTERVAL) {
      companionEchoAccumulator -= ECHOSPRITE_MANA_INTERVAL;
      if (player.mana < player.maxMana) {
        player.mana = Math.min(player.maxMana, player.mana + 1);
        spawnManaNumber(player.x, player.y - player.radius * 1.6, 1);
        updateHUD();
      } else {
        player.lastAttack = Math.max(
          player.lastAttack - player.attackCooldown * ECHOSPRITE_COOLDOWN_REDUCTION,
          now - player.attackCooldown,
        );
        spawnParticles(player.x, player.y, "#9ec9ff", 140, 14);
      }
    }
  } else {
    companionEchoAccumulator = Math.max(0, companionEchoAccumulator - delta * 0.5);
  }
}

function findCompanionOrbitTarget(prey, angle, desiredDistance) {
  const minDistance = Math.max(prey.radius + player.radius + 10, desiredDistance * 0.55);
  const maxDistance = Math.max(minDistance, desiredDistance);
  const stepSize = CELL_SIZE * 0.35;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const dist = Math.max(minDistance, maxDistance - attempt * stepSize);
    const targetX = player.x + Math.cos(angle) * dist;
    const targetY = player.y + Math.sin(angle) * dist;
    if (isWalkable(targetX, targetY, prey.radius, 0.7)) {
      return { x: targetX, y: targetY };
    }
  }
  const fallbackDist = minDistance;
  const fallbackX = player.x + Math.cos(angle) * fallbackDist;
  const fallbackY = player.y + Math.sin(angle) * fallbackDist;
  if (isWalkable(fallbackX, fallbackY, prey.radius, 0.7)) {
    return { x: fallbackX, y: fallbackY };
  }
  return { x: player.x, y: player.y };
}

function updateCompanionBehaviour(prey, deltaSeconds, playerDist) {
  if (!prey.companion) return false;
  const isLifebloom = prey.variant === "lifebloom";
  const bondRange = isLifebloom ? LIFEBLOOM_HEAL_RANGE * 1.1 : COMPANION_BOND_DISTANCE;
  if (!prey.bonded && playerDist <= bondRange) {
    prey.bonded = true;
    prey.bondAngle = Math.random() * Math.PI * 2;
    prey.bondSpin = (Math.random() > 0.5 ? 1 : -1) * (0.12 + Math.random() * 0.18);
    prey.followTargetX = prey.x;
    prey.followTargetY = prey.y;
    spawnParticles(prey.x, prey.y, "#ffe070", 120, 14);
  }
  if (!prey.bonded) return false;

  const followDistance = isLifebloom ? LIFEBLOOM_FOLLOW_DISTANCE : COMPANION_FOLLOW_DISTANCE;
  const angleDrift = (prey.bondSpin || 0) * deltaSeconds;
  prey.bondAngle = (prey.bondAngle + angleDrift) % (Math.PI * 2);
  const { x: desiredX, y: desiredY } = findCompanionOrbitTarget(prey, prey.bondAngle, followDistance);

  const smoothFactor = Math.min(1, deltaSeconds * 5.5);
  if (prey.followTargetX === undefined) {
    prey.followTargetX = prey.x;
    prey.followTargetY = prey.y;
  }
  prey.followTargetX += (desiredX - prey.followTargetX) * smoothFactor;
  prey.followTargetY += (desiredY - prey.followTargetY) * smoothFactor;

  const dx = prey.followTargetX - prey.x;
  const dy = prey.followTargetY - prey.y;
  const dist = Math.hypot(dx, dy);
  const followSpeed = Math.max(prey.speed * COMPANION_FOLLOW_SPEED_MULT, player.speed + 40);
  if (dist > 0.4) {
    const denom = Math.max(deltaSeconds, 0.001);
    const cappedSpeed = Math.min(followSpeed, (dist / denom) * 0.92);
    const moved = stepEntity(prey, dx / (dist || 1), dy / (dist || 1), cappedSpeed, deltaSeconds, 0.62);
    if (!moved) {
      prey.followTargetX = prey.x;
      prey.followTargetY = prey.y;
    }
  }
  prey.state = "follow";
  prey.idleTimer = PREY_IDLE_MIN;
  prey.targetX = prey.followTargetX;
  prey.targetY = prey.followTargetY;
  return true;
}

function attack() {
  if (!initialStart) return;
  if (state.paused || !state.running) return;
  const now = performance.now();
  if (now - player.lastAttack < player.attackCooldown) return;
  if (player.mana <= 0) return;
  player.lastAttack = now;
  player.mana -= 1;
  player.shootingTimer = 200;
  spawnParticles(player.x, player.y, "#f9d64c", 160, 18);
  enemies.forEach((enemy) => {
    const distance = Math.hypot(enemy.x - player.x, enemy.y - player.y);
    if (distance <= player.attackRange) {
      const prevHealth = enemy.health;
      enemy.health -= player.damage;
      const dealt = Math.min(player.damage, prevHealth);
      if (dealt > 0) {
        spawnDamageNumber(enemy.x, enemy.y - enemy.radius * 1.1, dealt, "enemy");
      }
    }
  });
  for (let i = preyList.length - 1; i >= 0; i -= 1) {
    const prey = preyList[i];
    if (prey.bonded) continue;
    const distance = Math.hypot(prey.x - player.x, prey.y - player.y);
    if (distance <= player.attackRange + prey.radius) {
      prey.health -= player.damage;
      if (prey.health <= 0) {
        spawnParticles(prey.x, prey.y, prey.color || "#7befa2", 120, 12);
        scheduleMeatDrop(prey, PREY_MEAT_COLOR, false, { restore: PREY_MEAT_RESTORE, mutates: false });
        preyList.splice(i, 1);
      }
    }
  }
  updateHUD();
}

function useSpell(slotIndex) {
  if (!initialStart) return;
  if (state.paused || !state.running) return;
  if (slotIndex < 0 || slotIndex >= spellSlots.length) return;
  const spellId = spellSlots[slotIndex];
  if (!spellId) return;
  clearSpellSlot(slotIndex);
  switch (spellId) {
    case "blast":
      castBlastSpell();
      break;
    case "heal":
      castHealSpell();
      break;
    case "haste":
      castHasteSpell();
      break;
    case "terrashield":
      castTerrashieldSpell();
      break;
    default:
      break;
  }
}

function removeSpellEffectsByType(type) {
  for (let i = spellEffects.length - 1; i >= 0; i -= 1) {
    if (spellEffects[i].type === type) {
      spellEffects.splice(i, 1);
    }
  }
}

function castBlastSpell() {
  const range = player.attackRange * SPELL_BLAST_RANGE_MULTIPLIER;
  const damage = player.damage * SPELL_BLAST_DAMAGE_MULTIPLIER;
  let hits = 0;
  enemies.forEach((enemy) => {
    const distance = Math.hypot(enemy.x - player.x, enemy.y - player.y);
    if (distance <= range) {
      const prevHealth = enemy.health;
      enemy.health -= damage;
      enemy.damageCooldown = 0;
      const dealt = Math.min(damage, prevHealth);
      if (dealt > 0) {
        spawnDamageNumber(enemy.x, enemy.y - enemy.radius * 1.1, dealt, "enemy");
      }
      hits += 1;
    }
  });
  for (let i = preyList.length - 1; i >= 0; i -= 1) {
    const prey = preyList[i];
    const distance = Math.hypot(prey.x - player.x, prey.y - player.y);
    if (distance <= range + prey.radius) {
      prey.health -= damage;
      if (prey.health <= 0) {
        spawnParticles(prey.x, prey.y, prey.color || "#7befa2", 160, 16);
        scheduleMeatDrop(prey, PREY_MEAT_COLOR, false, { restore: PREY_MEAT_RESTORE, mutates: false });
        preyList.splice(i, 1);
      } else {
        prey.state = "flee";
      }
    }
  }
  spawnParticles(player.x, player.y, "#f9d64c", 360, 32);
  spellEffects.push({
    type: "blast",
    x: player.x,
    y: player.y,
    maxRadius: range * 1.1,
    elapsed: 0,
    duration: 620,
  });
  if (hits > 0) {
    showAchievement(`Arc blast scorched ${hits} foe${hits === 1 ? "" : "s"}!`);
  }
}

function castHealSpell() {
  player.health = player.maxHealth;
  spawnParticles(player.x, player.y, "#8ef9ff", 280, 26);
  spellEffects.push({
    type: "heal",
    followPlayer: true,
    elapsed: 0,
    duration: 820,
  });
  showAchievement("Sanctify surges through you!");
  updateHUD();
}

function castHasteSpell() {
  player.speedBoostTimer = SPEED_SPELL_DURATION;
  player.speed = player.baseSpeed * SPEED_SPELL_MULTIPLIER;
  spawnParticles(player.x, player.y, "#b0ff6a", 220, 20);
  removeSpellEffectsByType("haste");
  spellEffects.push({
    type: "haste",
    followPlayer: true,
    elapsed: 0,
    duration: SPEED_SPELL_DURATION,
  });
  showAchievement("Swiftstep spell ignited!");
}

function castTerrashieldSpell() {
  player.terrashieldTimer = TERRASHIELD_ROOT_DURATION;
  player.terrashieldBurstPending = true;
  spawnParticles(player.x, player.y, "#9cff74", 240, 18);
  removeSpellEffectsByType("terrashield");
  spellEffects.push({
    type: "terrashield",
    followPlayer: true,
    elapsed: 0,
    duration: TERRASHIELD_ROOT_DURATION + TERRASHIELD_ARMOR_DURATION,
    rootDuration: TERRASHIELD_ROOT_DURATION,
  });
  showAchievement("Terrashield raised! Brace yourself.");
}

function triggerTerrashieldBurst() {
  player.terrashieldBurstPending = false;
  const damage = Math.round(player.damage * TERRASHIELD_DAMAGE_MULTIPLIER);
  enemies.forEach((enemy) => {
    const distance = Math.hypot(enemy.x - player.x, enemy.y - player.y);
    if (distance <= TERRASHIELD_BURST_RADIUS + enemy.radius) {
      const prevHealth = enemy.health;
      enemy.health -= damage;
      enemy.damageCooldown = 0;
      const dealt = Math.min(damage, prevHealth);
      if (dealt > 0) {
        spawnDamageNumber(enemy.x, enemy.y - enemy.radius * 1.1, dealt, "enemy");
      }
    }
  });
  for (let i = preyList.length - 1; i >= 0; i -= 1) {
    const prey = preyList[i];
    if (prey.bonded) continue;
    const distance = Math.hypot(prey.x - player.x, prey.y - player.y);
    if (distance <= TERRASHIELD_BURST_RADIUS + prey.radius) {
      prey.health -= damage;
      if (prey.health <= 0) {
        spawnParticles(prey.x, prey.y, prey.color || "#7befa2", 140, 16);
        scheduleMeatDrop(prey, PREY_MEAT_COLOR, false, { restore: PREY_MEAT_RESTORE, mutates: false });
        preyList.splice(i, 1);
      } else {
        prey.state = "flee";
      }
    }
  }
  spawnParticles(player.x, player.y, "#8cff8a", 260, 24);
  player.terrashieldArmorTimer = TERRASHIELD_ARMOR_DURATION;
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
  drawMana(cameraX, cameraY);
  drawHealth(cameraX, cameraY);
  drawSpells(cameraX, cameraY);
  drawMeat(cameraX, cameraY);
  drawPrey(cameraX, cameraY);
  drawEnemies(cameraX, cameraY);
  drawPlayer(cameraX, cameraY);
  drawSpellEffects(cameraX, cameraY);
  drawDamageNumbers(cameraX, cameraY);
  drawParticles(cameraX, cameraY);
  drawFog();
  if (isMobile) drawCanvasHUD();
  drawMinimap();
}

function drawMana(offsetX, offsetY) {
  manaDrops.forEach((drop) => {
    const screenX = drop.x - offsetX;
    const screenY = drop.y - offsetY;
    drawPickupSprite(screenX, screenY, "mana", drop.bobOffset || 0);
  });
}

function drawHealth(offsetX, offsetY) {
  healthDrops.forEach((drop) => {
    const screenX = drop.x - offsetX;
    const screenY = drop.y - offsetY;
    drawPickupSprite(screenX, screenY, "health", drop.bobOffset || 0);
  });
}

function drawSpells(offsetX, offsetY) {
  spellDrops.forEach((drop) => {
    const screenX = drop.x - offsetX;
    const screenY = drop.y - offsetY;
    drawSpellDropSprite(screenX, screenY, drop);
  });
}

function drawMeat(offsetX, offsetY) {
  meatDrops.forEach((drop) => {
    const screenX = drop.x - offsetX;
    const screenY = drop.y - offsetY;
    drawMeatSprite(screenX, screenY, drop);
  });
}

function drawPrey(offsetX, offsetY) {
  preyList.forEach((prey) => {
    const screenX = prey.x - offsetX;
    const screenY = prey.y - offsetY;
    drawPreySprite(prey, screenX, screenY);
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

  if (type === "mana" || type === "health") {
    const glassColor = type === "mana" ? "#dfe6ff" : "#ffe4e6";
    const liquidColor = type === "mana" ? "#2d5bff" : "#ff4d6d";
    const corkColor = "#8f5a2e";
    const rimColor = type === "mana" ? "#b8c5ff" : "#ffc7d1";
    const highlightColor =
      type === "mana" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.38)";

    ctx.fillStyle = rimColor;
    ctx.fillRect(-1.2, -3.4, 2.4, 0.8);
    ctx.fillStyle = corkColor;
    ctx.fillRect(-1.0, -3.8, 2.0, 0.6);
    ctx.fillStyle = glassColor;
    ctx.beginPath();
    ctx.moveTo(-2.3, -2.4);
    ctx.quadraticCurveTo(-2.6, 0.4, -1.2, 2.2);
    ctx.quadraticCurveTo(0, 3.0, 1.2, 2.2);
    ctx.quadraticCurveTo(2.6, 0.4, 2.3, -2.4);
    ctx.quadraticCurveTo(0, -3.2, -2.3, -2.4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = liquidColor;
    ctx.beginPath();
    ctx.moveTo(-1.9, -1.2);
    ctx.quadraticCurveTo(-2.0, 1.6, -0.8, 2.1);
    ctx.quadraticCurveTo(0, 2.4, 0.8, 2.1);
    ctx.quadraticCurveTo(2.0, 1.6, 1.9, -1.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = highlightColor;
    ctx.beginPath();
    ctx.moveTo(-1.4, -1.6);
    ctx.quadraticCurveTo(-1.6, 0.0, -0.6, 0.8);
    ctx.quadraticCurveTo(-0.2, 1.1, 0.1, 0.6);
    ctx.quadraticCurveTo(-0.6, -0.4, -1.0, -1.8);
    ctx.closePath();
    ctx.fill();
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

function drawSpellDropSprite(x, y, drop) {
  const hoverOffset = drop.bobOffset || 0;
  const wobblePhase = (drop.bobPhase || 0) + animationTime * 0.003;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(PICKUP_SCALE, PICKUP_SCALE);
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(0, 1.1, 2.9, 1.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(x, y + hoverOffset);
  ctx.scale(PICKUP_SCALE, PICKUP_SCALE);
  ctx.rotate(Math.sin(wobblePhase) * 0.08);

  // chunky spine/back cover
  ctx.fillStyle = "#1c0e05";
  ctx.fillRect(-3.9, -3.3, 1.4, 6.6);
  ctx.fillStyle = "#2d180a";
  ctx.fillRect(-3.5, -3.1, 1.0, 6.2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.fillRect(-3.9, -3.3, 0.35, 6.6);

  ctx.fillStyle = "#2e1c0e";
  ctx.fillRect(-2.9, -3.1, 5.8, 6.2);
  ctx.fillStyle = "#402712";
  ctx.fillRect(-2.6, -2.8, 5.2, 5.6);
  ctx.fillStyle = "#d9c9aa";
  ctx.fillRect(-2.1, -2.2, 4.2, 4.6);
  ctx.fillStyle = "#f4edd5";
  ctx.fillRect(-2.1, -2.4, 4.2, 0.35);
  ctx.fillRect(-2.1, 1.9, 4.2, 0.35);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(-2.1, 1.9, 4.2, 0.18);
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.lineWidth = 0.2;
  ctx.strokeRect(-2.6, -2.8, 5.2, 5.6);
  ctx.fillStyle = "#7d4e28";
  ctx.fillRect(-2.1, -0.2, 4.2, 0.6);
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.moveTo(-1.6, -2.2);
  ctx.lineTo(1.6, -2.2);
  ctx.lineTo(0.6, -1.2);
  ctx.lineTo(-2.1, -1.2);
  ctx.closePath();
  ctx.fill();

  const spellColor = drop.color || "#f9d64c";
  const rgb = hexToRgb(spellColor);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`;
  ctx.beginPath();
  ctx.ellipse(0, -0.2, 2.0, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = spellColor;
  ctx.fillStyle = spellColor;
  ctx.lineWidth = 0.32;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  renderSpellRune(drop.spellId);
  ctx.restore();

  ctx.restore();
}

function renderSpellRune(spellId) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  switch (spellId) {
    case "blast":
      ctx.lineWidth = 0.45;
      ctx.beginPath();
      for (let i = 0; i < 8; i += 1) {
        const angle = (Math.PI / 4) * i;
        const innerR = 0.5;
        const outerR = 1.7;
        ctx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
        ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
      }
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 0.65, 0, Math.PI * 2);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fill();
      break;
    case "heal":
      ctx.lineWidth = 0.42;
      ctx.beginPath();
      ctx.moveTo(0, -1.8);
      ctx.lineTo(0, 1.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-1.4, -0.6);
      ctx.quadraticCurveTo(0, -1.4, 1.4, -0.6);
      ctx.moveTo(-1.45, 0.65);
      ctx.quadraticCurveTo(0, 1.45, 1.45, 0.65);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 0.55, 0, Math.PI * 2);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fill();
      break;
    case "haste":
      ctx.lineWidth = 0.42;
      ctx.beginPath();
      ctx.moveTo(1.2, -1.2);
      ctx.quadraticCurveTo(-0.8, -2.0, -1.6, -0.2);
      ctx.quadraticCurveTo(-2.2, 1.3, -0.8, 2.0);
      ctx.quadraticCurveTo(0.8, 2.6, 1.6, 1.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-0.6, -0.4);
      ctx.quadraticCurveTo(0.4, -0.1, 0.8, -0.9);
      ctx.moveTo(-0.8, 0.6);
      ctx.quadraticCurveTo(0.1, 0.8, 0.7, 0.3);
      ctx.stroke();
      break;
    default:
      ctx.beginPath();
      ctx.arc(0, 0, 1.0, 0, Math.PI * 2);
      ctx.stroke();
      break;
  }
}

function spawnDamageNumber(x, y, amount, target = "enemy", options = {}) {
  const { variant = "damage" } = options;
  if (!amount || amount <= 0) return;
  const clamped = Math.max(1, Math.round(amount));
  let color;
  let shadow;
  let value;
  if (variant === "heal") {
    color = "rgba(120,255,160,0.95)";
    shadow = "rgba(20,80,40,0.55)";
    value = `+${clamped}`;
  } else if (variant === "mana") {
    color = "rgba(142,249,255,0.95)";
    shadow = "rgba(26,94,118,0.55)";
    value = `+${clamped}`;
  } else {
    color = target === "player" ? "rgba(255,90,90,0.95)" : "rgba(255,236,140,0.9)";
    shadow = target === "player" ? "rgba(120,0,0,0.55)" : "rgba(80,60,0,0.45)";
    value = `-${clamped}`;
  }
  damageNumbers.push({
    x,
    y,
    drift: (Math.random() - 0.5) * 0.08,
    value,
    color,
    shadow,
    life: 520,
    maxLife: 520,
  });
}

function spawnHealNumber(x, y, amount = 1) {
  spawnDamageNumber(x, y, amount, "player", { variant: "heal" });
}

function spawnManaNumber(x, y, amount = 1) {
  spawnDamageNumber(x, y, amount, "player", { variant: "mana" });
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
  if (decoration.rotation) ctx.rotate(decoration.rotation);
  ctx.globalAlpha = alpha;

  const drawHomeBed = (scale = 1) => {
    ctx.save();
    ctx.scale(scale, scale);
    ctx.fillStyle = "#2e1d1a";
    ctx.fillRect(-3.0, -1.6, 6.0, 3.2);
    ctx.fillStyle = "#3c2724";
    ctx.fillRect(-2.7, -1.3, 5.4, 2.6);
    ctx.fillStyle = "#99b9ff";
    ctx.fillRect(-2.4, -1.0, 1.9, 1.4);
    ctx.fillStyle = "#4f65c6";
    ctx.fillRect(-0.5, -1.0, 3.2, 2.2);
    ctx.fillStyle = "#233275";
    ctx.fillRect(-0.5, 0.6, 3.2, 0.6);
    ctx.restore();
  };

  const drawHomePotionTable = (scale = 1) => {
    ctx.save();
    ctx.scale(scale, scale);
    ctx.fillStyle = "#412b24";
    ctx.fillRect(-2.5, -1.0, 5.0, 2.2);
    ctx.fillRect(-2.8, 1.0, 0.8, 2.2);
    ctx.fillRect(2.0, 1.0, 0.8, 2.2);
    ctx.fillStyle = "#d9b376";
    ctx.fillRect(-2.3, -1.3, 4.6, 0.6);
    ctx.fillStyle = "#7ad8ff";
    ctx.beginPath();
    ctx.ellipse(-1.3, -0.3, 0.6, 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8e5cff";
    ctx.beginPath();
    ctx.ellipse(0.2, -0.4, 0.55, 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffd966";
    ctx.beginPath();
    ctx.ellipse(1.5, -0.5, 0.5, 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f2f2f2";
    ctx.fillRect(-1.5, -1.6, 0.5, 0.6);
    ctx.fillRect(0.0, -1.6, 0.45, 0.6);
    ctx.fillRect(1.3, -1.6, 0.45, 0.6);
    ctx.restore();
  };

  const drawHomeLounge = (scale = 1) => {
    ctx.save();
    ctx.scale(scale, scale);
    ctx.fillStyle = "#2a1b2d";
    ctx.fillRect(-3.2, -1.2, 6.4, 2.8);
    ctx.fillStyle = "#4a2f58";
    ctx.fillRect(-3.0, -1.0, 6.0, 2.4);
    ctx.fillStyle = "#613e75";
    ctx.fillRect(-2.6, -0.6, 5.2, 1.6);
    ctx.fillStyle = "#2e1c39";
    ctx.fillRect(-3.0, 1.4, 0.8, 1.8);
    ctx.fillRect(2.2, 1.4, 0.8, 1.8);
    ctx.fillStyle = "#8550a9";
    ctx.beginPath();
    ctx.ellipse(0, -0.2, 2.0, 1.0, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawHomeRug = (scale = 1) => {
    ctx.save();
    ctx.scale(scale, scale);
    ctx.fillStyle = "#2b203e";
    ctx.beginPath();
    ctx.ellipse(0, 0, 3.4, 2.0, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#8d66ff";
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 2.6, 1.5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "#f0b45c";
    ctx.beginPath();
    ctx.ellipse(0, 0, 1.6, 0.95, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };

  const drawHomeBooks = (scale = 1) => {
    ctx.save();
    ctx.scale(scale, scale);
    ctx.fillStyle = "#3a2416";
    ctx.fillRect(-2.4, -2.2, 4.8, 4.4);
    ctx.fillStyle = "#24160e";
    ctx.fillRect(-2.6, -2.4, 5.2, 0.5);
    ctx.fillRect(-2.6, 1.9, 5.2, 0.5);
    ctx.fillStyle = "#d85f6a";
    ctx.fillRect(-2.0, -1.6, 0.8, 3.0);
    ctx.fillStyle = "#6fd0c8";
    ctx.fillRect(-0.9, -1.2, 0.9, 2.6);
    ctx.fillStyle = "#f3d26d";
    ctx.fillRect(0.3, -0.8, 0.8, 2.2);
    ctx.fillStyle = "#8b6cff";
    ctx.fillRect(1.6, -1.4, 0.7, 2.8);
    ctx.restore();
  };

  const drawHomeGrandRug = (scale = 1) => {
    ctx.save();
    ctx.scale(scale, scale);
    ctx.fillStyle = "#2b1e3a";
    ctx.beginPath();
    ctx.ellipse(0, 0, 4.8, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(140,102,255,0.65)";
    ctx.lineWidth = 0.35;
    ctx.beginPath();
    ctx.ellipse(0, 0, 3.8, 2.5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,202,120,0.55)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 2.6, 1.8, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };

  const drawHomeRoundTable = (scale = 1, withCandles = true) => {
    ctx.save();
    ctx.scale(scale, scale);
    ctx.fillStyle = "#3b2418";
    ctx.beginPath();
    ctx.ellipse(0, 0, 2.4, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#5a351f";
    ctx.beginPath();
    ctx.ellipse(0, -0.08, 2.0, 1.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2b1a10";
    ctx.fillRect(-0.4, 0.8, 0.8, 1.6);
    ctx.fillRect(-1.4, 1.0, 0.5, 1.2);
    ctx.fillRect(0.9, 1.0, 0.5, 1.2);
    if (withCandles) {
      ctx.fillStyle = "#f9e7b8";
      ctx.fillRect(-0.4, -0.8, 0.3, 1.0);
      ctx.fillRect(0.2, -0.9, 0.3, 1.2);
      ctx.fillStyle = "#ffcd4f";
      ctx.beginPath();
      ctx.arc(-0.25, -1.0, 0.18, 0, Math.PI * 2);
      ctx.arc(0.35, -1.1, 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  const drawHomeChair = (scale = 1) => {
    ctx.save();
    ctx.scale(scale, scale);
    ctx.fillStyle = "#2e1c10";
    ctx.fillRect(-1.2, -1.6, 0.6, 3.2);
    ctx.fillRect(0.6, -1.6, 0.6, 3.2);
    ctx.fillStyle = "#6b3f25";
    ctx.fillRect(-1.0, -1.2, 2.0, 1.2);
    ctx.fillStyle = "#83553a";
    ctx.fillRect(-0.9, 0, 1.8, 0.8);
    ctx.fillStyle = "#3f2616";
    ctx.fillRect(-1.0, 0.8, 2.0, 0.35);
    ctx.restore();
  };

  const drawHomeLamp = (scale = 1) => {
    ctx.save();
    ctx.scale(scale, scale);
    ctx.fillStyle = "#3e2d1e";
    ctx.fillRect(-0.4, -2.0, 0.8, 3.8);
    ctx.fillStyle = "#b98c52";
    ctx.fillRect(-0.6, -2.2, 1.2, 0.6);
    const glow = ctx.createRadialGradient(0, -3.0, 0.2, 0, -3.0, 2.4);
    glow.addColorStop(0, "rgba(255, 236, 160, 0.75)");
    glow.addColorStop(1, "rgba(255, 236, 160, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(0, -3.0, 2.0, 1.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffdd8a";
    ctx.beginPath();
    ctx.ellipse(0, -2.6, 1.4, 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawHomeSpellTable = (scale = 1) => {
    ctx.save();
    ctx.scale(scale, scale);
    ctx.fillStyle = "#322034";
    ctx.fillRect(-2.0, -0.8, 4.0, 1.4);
    ctx.fillRect(-2.2, 0.6, 0.6, 1.6);
    ctx.fillRect(1.6, 0.6, 0.6, 1.6);
    ctx.fillStyle = "#4a2d5b";
    ctx.fillRect(-1.8, -1.1, 3.6, 0.5);
    ctx.fillStyle = "#9f6cff";
    ctx.beginPath();
    ctx.arc(-0.8, -0.2, 0.5, 0, Math.PI * 2);
    ctx.arc(0.8, -0.2, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffe09c";
    ctx.beginPath();
    ctx.moveTo(0, -0.6);
    ctx.lineTo(0.5, -0.1);
    ctx.lineTo(0, 0.4);
    ctx.lineTo(-0.5, -0.1);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawHomeScrollTable = (scale = 1) => {
    ctx.save();
    ctx.scale(scale, scale);
    ctx.fillStyle = "#3a2618";
    ctx.fillRect(-2.2, -0.8, 4.4, 1.4);
    ctx.fillRect(-2.4, 0.6, 0.6, 1.6);
    ctx.fillRect(1.8, 0.6, 0.6, 1.6);
    ctx.fillStyle = "#d9c29a";
    ctx.fillRect(-1.6, -0.4, 3.2, 0.5);
    ctx.fillStyle = "#f7e2bd";
    ctx.beginPath();
    ctx.ellipse(-0.9, -0.15, 0.5, 0.32, 0, 0, Math.PI * 2);
    ctx.ellipse(0.9, -0.15, 0.5, 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#cfa86a";
    ctx.fillRect(-1.5, -0.15, 3.0, 0.3);
    ctx.restore();
  };

  const drawHomePotionShelf = (scale = 1) => {
    ctx.save();
    ctx.scale(scale, scale);
    ctx.fillStyle = "#3c2818";
    ctx.fillRect(-2.2, -2.4, 4.4, 4.8);
    ctx.fillStyle = "#2b1b12";
    ctx.fillRect(-2.4, -2.6, 4.8, 0.5);
    ctx.fillRect(-2.4, 1.9, 4.8, 0.5);
    ctx.fillStyle = "#7ad8ff";
    ctx.fillRect(-1.8, -1.6, 1.0, 1.4);
    ctx.fillStyle = "#ff85d8";
    ctx.fillRect(0, -1.3, 1.0, 1.2);
    ctx.fillStyle = "#ffe46c";
    ctx.fillRect(-1.8, 0.4, 1.0, 1.2);
    ctx.fillStyle = "#7cffae";
    ctx.fillRect(0, 0.4, 1.0, 1.2);
    ctx.restore();
  };

  const drawHomeCrystalPedestal = (scale = 1) => {
    ctx.save();
    ctx.scale(scale, scale);
    ctx.fillStyle = "#2f2138";
    ctx.fillRect(-1.0, -0.4, 2.0, 2.4);
    ctx.fillStyle = "#6c4aa4";
    ctx.beginPath();
    ctx.moveTo(0, -1.6);
    ctx.lineTo(1.0, -0.4);
    ctx.lineTo(0.4, 0.8);
    ctx.lineTo(-0.4, 0.8);
    ctx.lineTo(-1.0, -0.4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(150,120,255,0.45)";
    ctx.beginPath();
    ctx.ellipse(0, -1.0, 1.2, 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };


  switch (type) {
    case "stalagmite_small": {
      ctx.fillStyle = "#2e2b26";
      ctx.beginPath();
      ctx.ellipse(0, 1.6, 1.6, 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#4b433a";
      ctx.beginPath();
      ctx.ellipse(-0.5, 0.4, 0.85, 1.6, -0.25, 0, Math.PI * 2);
      ctx.ellipse(0.9, 0.3, 0.75, 1.4, 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.beginPath();
      ctx.ellipse(-0.8, 0.1, 0.35, 0.8, -0.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "stalagmite_tall": {
      ctx.fillStyle = "#312c28";
      ctx.beginPath();
      ctx.ellipse(0, 1.8, 1.9, 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#52483f";
      ctx.beginPath();
      ctx.moveTo(-1.0, 1.2);
      ctx.quadraticCurveTo(-0.6, -1.4, -0.2, -2.6);
      ctx.quadraticCurveTo(0.4, -1.3, 1.2, 1.1);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.beginPath();
      ctx.moveTo(-0.5, -0.6);
      ctx.quadraticCurveTo(-0.2, -1.8, 0.3, -1.0);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 0.22;
      ctx.stroke();
      break;
    }
    case "stalactite_small": {
      ctx.fillStyle = "#2f2a25";
      ctx.beginPath();
      ctx.ellipse(0, -1.8, 1.6, 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#473d35";
      ctx.beginPath();
      ctx.moveTo(-1.0, -1.8);
      ctx.quadraticCurveTo(0, 0.2, 0, 2.0);
      ctx.quadraticCurveTo(0, 0.2, 1.0, -1.8);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "stalactite_tall": {
      ctx.fillStyle = "#2c2823";
      ctx.beginPath();
      ctx.ellipse(0, -2.2, 1.9, 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#4a4238";
      ctx.beginPath();
      ctx.moveTo(-1.2, -2.0);
      ctx.quadraticCurveTo(-0.4, 0.4, -0.2, 2.6);
      ctx.quadraticCurveTo(0.6, 0.6, 1.3, -2.0);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "moss_patch":
      ctx.fillStyle = "#30533c";
      ctx.beginPath();
      ctx.ellipse(0, 0.2, 2.5, 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#49a064";
      ctx.beginPath();
      ctx.ellipse(-0.9, -0.1, 1.1, 0.7, 0, 0, Math.PI * 2);
      ctx.ellipse(0.9, 0.0, 1.0, 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "glowing_moss":
      ctx.fillStyle = "rgba(20, 40, 30, 0.7)";
      ctx.beginPath();
      ctx.ellipse(0, 0.2, 2.4, 1.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(90, 255, 200, 0.8)";
      ctx.beginPath();
      ctx.ellipse(-0.8, -0.1, 0.9, 0.5, 0, 0, Math.PI * 2);
      ctx.ellipse(0.9, 0.0, 0.85, 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.beginPath();
      ctx.ellipse(0.2, -0.2, 0.35, 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "glowing_moss_field":
      ctx.fillStyle = "rgba(18, 45, 32, 0.7)";
      ctx.beginPath();
      ctx.ellipse(0, 0.4, 4.8, 2.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(80, 255, 190, 0.8)";
      ctx.beginPath();
      ctx.ellipse(-1.6, -0.1, 1.8, 1.0, 0, 0, Math.PI * 2);
      ctx.ellipse(1.8, 0.2, 1.7, 0.9, 0, 0, Math.PI * 2);
      ctx.ellipse(0, 0.6, 2.2, 1.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(160,255,220,0.55)";
      ctx.beginPath();
      ctx.ellipse(-0.6, -0.2, 0.7, 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(1.0, 0.4, 0.8, 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "fungus_cluster":
      ctx.fillStyle = "#6f4fb1";
      ctx.beginPath();
      ctx.ellipse(-0.8, -0.2, 0.9, 0.6, 0, 0, Math.PI * 2);
      ctx.ellipse(0.9, -0.1, 0.8, 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3d286e";
      ctx.fillRect(-0.9, -0.2, 0.3, 1.8);
      ctx.fillRect(0.6, -0.1, 0.3, 1.7);
      ctx.fillStyle = "#9e8ce4";
      ctx.beginPath();
      ctx.ellipse(-0.8, -0.3, 0.5, 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "bone_pile":
      ctx.fillStyle = "#f0e9df";
      ctx.beginPath();
      ctx.ellipse(-0.8, 0.6, 1.0, 0.5, 0, 0, Math.PI * 2);
      ctx.ellipse(1.0, 0.6, 1.1, 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e5dbce";
      ctx.beginPath();
      ctx.ellipse(-0.3, -0.2, 0.4, 1.0, 0, 0, Math.PI * 2);
      ctx.ellipse(0.7, -0.1, 0.4, 1.0, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "skull":
      ctx.fillStyle = "#f3efe6";
      ctx.beginPath();
      ctx.ellipse(0, -0.4, 1.4, 1.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#222222";
      ctx.beginPath();
      ctx.ellipse(-0.5, -0.4, 0.35, 0.38, 0, 0, Math.PI * 2);
      ctx.ellipse(0.5, -0.4, 0.35, 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#cbbca9";
      ctx.beginPath();
      ctx.ellipse(0, 0.4, 0.5, 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "broken_crate":
      ctx.fillStyle = "#7c4a25";
      ctx.beginPath();
      ctx.moveTo(-1.6, -2.2);
      ctx.lineTo(1.6, -2.2);
      ctx.quadraticCurveTo(2.2, -2.2, 2.2, -1.6);
      ctx.lineTo(2.2, 1.6);
      ctx.quadraticCurveTo(2.2, 2.2, 1.6, 2.2);
      ctx.lineTo(-1.6, 2.2);
      ctx.quadraticCurveTo(-2.2, 2.2, -2.2, 1.6);
      ctx.lineTo(-2.2, -1.6);
      ctx.quadraticCurveTo(-2.2, -2.2, -1.6, -2.2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#d7a162";
      ctx.lineWidth = 0.26;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-2.0, -1.8);
      ctx.lineTo(2.0, 1.8);
      ctx.moveTo(-2.0, 1.8);
      ctx.lineTo(2.0, -1.8);
      ctx.stroke();
      break;
    case "rusted_barrel":
      ctx.fillStyle = "#3b2718";
      ctx.beginPath();
      ctx.ellipse(0, -1.6, 1.4, 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#83532d";
      ctx.fillRect(-1.4, -1.6, 2.8, 3.2);
      ctx.strokeStyle = "#e19f5c";
      ctx.lineWidth = 0.22;
      ctx.strokeRect(-1.4, -1.6, 2.8, 3.2);
      ctx.fillStyle = "#3b2718";
      ctx.beginPath();
      ctx.ellipse(0, 1.6, 1.4, 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "campfire_out":
      ctx.fillStyle = "#2a2018";
      ctx.beginPath();
      ctx.ellipse(0, 1.1, 2.2, 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#5f3c22";
      ctx.beginPath();
      ctx.moveTo(-1.4, 1.0);
      ctx.lineTo(-0.2, -0.9);
      ctx.lineTo(0.4, -0.6);
      ctx.lineTo(-0.6, 1.0);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(1.4, 1.0);
      ctx.lineTo(0.2, -0.9);
      ctx.lineTo(-0.4, -0.6);
      ctx.lineTo(0.6, 1.0);
      ctx.closePath();
      ctx.fill();
      break;
    case "campfire_glow":
      ctx.fillStyle = "rgba(255,200,120,0.28)";
      ctx.beginPath();
      ctx.ellipse(0, 1.0, 2.4, 1.0, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f79d2a";
      ctx.beginPath();
      ctx.moveTo(0, -1.2);
      ctx.quadraticCurveTo(-0.8, 0.2, 0, 1.0);
      ctx.quadraticCurveTo(0.8, 0.2, 0, -1.2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.ellipse(-0.4, -0.2, 0.35, 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "torch_bracket":
      ctx.fillStyle = "#2e2e2e";
      ctx.fillRect(-0.3, -2.1, 0.6, 3.8);
      ctx.fillStyle = "#f7a43a";
      ctx.beginPath();
      ctx.ellipse(0, -2.3, 0.7, 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,220,160,0.75)";
      ctx.beginPath();
      ctx.ellipse(0, -2.3, 1.0, 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "chain_hook":
      ctx.strokeStyle = "rgba(140,140,140,0.9)";
      ctx.lineWidth = 0.28;
      ctx.beginPath();
      ctx.moveTo(0, -2.6);
      ctx.quadraticCurveTo(0.4, -1.8, -0.1, -1.0);
      ctx.quadraticCurveTo(0.4, -0.2, -0.1, 0.6);
      ctx.quadraticCurveTo(0.3, 1.2, -0.4, 1.8);
      ctx.stroke();
      break;
    case "drip_pool":
      ctx.fillStyle = "#132933";
      ctx.beginPath();
      ctx.ellipse(0, 0.6, 2.4, 1.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3a728a";
      ctx.beginPath();
      ctx.ellipse(-0.6, 0.3, 1.2, 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "crystal_blue":
      ctx.fillStyle = "#5cd6ff";
      ctx.beginPath();
      ctx.moveTo(0, -2.2);
      ctx.lineTo(1.0, 1.6);
      ctx.lineTo(0, 2.6);
      ctx.lineTo(-1.0, 1.6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath();
      ctx.moveTo(0, -1.8);
      ctx.lineTo(0.4, 1.0);
      ctx.lineTo(0, 1.8);
      ctx.closePath();
      ctx.fill();
      break;
    case "crystal_orange":
      ctx.fillStyle = "#ffb067";
      ctx.beginPath();
      ctx.moveTo(0, -2.0);
      ctx.lineTo(1.1, 1.4);
      ctx.lineTo(0.2, 2.4);
      ctx.lineTo(-1.0, 1.2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.beginPath();
      ctx.moveTo(0, -1.6);
      ctx.lineTo(0.3, 1.0);
      ctx.lineTo(-0.2, 1.7);
      ctx.closePath();
      ctx.fill();
      break;
    case "rubble_heap":
      ctx.fillStyle = "#2a2320";
      ctx.beginPath();
      ctx.ellipse(-1.0, 0.6, 1.2, 0.8, 0, 0, Math.PI * 2);
      ctx.ellipse(1.1, 0.4, 1.4, 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#44372f";
      ctx.beginPath();
      ctx.ellipse(0, 0.2, 0.8, 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "spider_web":
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 0.18;
      ctx.beginPath();
      ctx.ellipse(0, 0, 2.2, 1.8, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-2.2, 0);
      ctx.lineTo(2.2, 0);
      ctx.moveTo(0, -1.8);
      ctx.lineTo(0, 1.8);
      ctx.moveTo(-1.5, -1.3);
      ctx.lineTo(1.5, 1.3);
      ctx.stroke();
      break;
    case "ancient_rune":
      ctx.fillStyle = "rgba(130, 200, 255, 0.22)";
      ctx.beginPath();
      ctx.ellipse(0, 0, 2.4, 1.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#7fb3ff";
      ctx.beginPath();
      ctx.ellipse(0, -0.4, 0.35, 1.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, 0.6, 1.1, 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "floor_rune_ember": {
      ctx.save();
      ctx.scale(1.05, 1.05);
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(0, 1.2, 2.5, 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = "rgba(255,214,120,0.85)";
      ctx.lineWidth = 0.35;
      ctx.beginPath();
      for (let i = 0; i < 6; i += 1) {
        const angle = (Math.PI / 3) * i;
        ctx.moveTo(Math.cos(angle) * 0.4, Math.sin(angle) * 0.4);
        ctx.lineTo(Math.cos(angle) * 1.6, Math.sin(angle) * 1.6);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(255,240,160,0.8)";
      ctx.beginPath();
      ctx.arc(0, 0, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }
    case "floor_rune_tide": {
      ctx.save();
      ctx.scale(1.1, 1.1);
      ctx.strokeStyle = "rgba(140,220,255,0.85)";
      ctx.lineWidth = 0.28;
      ctx.globalCompositeOperation = "lighter";
      ctx.beginPath();
      ctx.ellipse(0, 0, 1.8, 1.0, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, 0, 1.05, 0.6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-1.4, 0);
      ctx.quadraticCurveTo(-0.5, -1.1, 0.6, -0.4);
      ctx.quadraticCurveTo(1.3, 0.1, 0.8, 0.9);
      ctx.stroke();
      ctx.restore();
      break;
    }
    case "floor_rune_verdant": {
      ctx.save();
      ctx.scale(1.05, 1.05);
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = "rgba(150,255,150,0.8)";
      ctx.lineWidth = 0.32;
      ctx.beginPath();
      ctx.moveTo(-1.2, 1.4);
      ctx.quadraticCurveTo(-1.8, -0.6, 0.3, -1.8);
      ctx.quadraticCurveTo(1.6, -1.0, 1.2, 0.4);
      ctx.quadraticCurveTo(0.7, 1.8, -0.6, 1.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-0.4, -0.3);
      ctx.quadraticCurveTo(0.4, 0.1, 0.9, -0.6);
      ctx.stroke();
      ctx.restore();
      break;
    }
    case "hanging_vine":
      ctx.fillStyle = "#253d26";
      ctx.beginPath();
      ctx.moveTo(0, -2.6);
      ctx.quadraticCurveTo(-0.6, -1.4, -0.2, -0.4);
      ctx.quadraticCurveTo(0.3, 0.6, -0.1, 1.6);
      ctx.quadraticCurveTo(-0.4, 2.2, 0.2, 2.8);
      ctx.lineTo(0.8, 2.3);
      ctx.quadraticCurveTo(0.4, 1.4, 0.6, 0.3);
      ctx.quadraticCurveTo(0.8, -0.8, 0.1, -2.6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#4fbf66";
      ctx.beginPath();
      ctx.ellipse(-0.2, -0.8, 0.35, 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0.3, 0.8, 0.3, 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "home_bed":
      drawHomeBed(1);
      break;
    case "home_bed_large":
      drawHomeBed(1.48);
      break;
    case "home_potion_table":
      drawHomePotionTable(1);
      break;
    case "home_potion_table_large":
      drawHomePotionTable(1.5);
      break;
    case "home_lounge":
      drawHomeLounge(1);
      break;
    case "home_lounge_large":
      drawHomeLounge(1.4);
      break;
    case "home_rug":
      drawHomeRug(1.0);
      break;
    case "home_books":
      drawHomeBooks(1);
      break;
    case "home_books_large":
      drawHomeBooks(1.42);
      break;
    case "home_rug_large":
      drawHomeRug(1.45);
      break;
    case "home_rug_grand":
      drawHomeGrandRug(1.35);
      break;
    case "home_round_table":
      drawHomeRoundTable(1, false);
      break;
    case "home_round_table_large":
      drawHomeRoundTable(1.25, true);
      break;
    case "home_chair":
      drawHomeChair(1);
      break;
    case "home_lamp":
      drawHomeLamp(1);
      break;
    case "home_spell_table":
      drawHomeSpellTable(1);
      break;
    case "home_scroll_table":
      drawHomeScrollTable(1);
      break;
    case "home_potion_shelf":
      drawHomePotionShelf(1);
      break;
    case "home_crystal_pedestal":
      drawHomeCrystalPedestal(1);
      break;
    case "home_feast_table":
      ctx.save();
      ctx.scale(1.35, 1.35);
      ctx.fillStyle = "#3e2818";
      ctx.fillRect(-3.4, -1.3, 6.8, 2.6);
      ctx.fillStyle = "#693d22";
      ctx.fillRect(-3.0, -1.0, 6.0, 2.0);
      ctx.fillStyle = "#2a1b10";
      ctx.fillRect(-2.8, 1.0, 0.6, 2.0);
      ctx.fillRect(2.2, 1.0, 0.6, 2.0);
      ctx.fillStyle = "#d4b27a";
      ctx.beginPath();
      ctx.ellipse(-1.6, -0.2, 0.9, 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, -0.1, 1.1, 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ff9b62";
      ctx.beginPath();
      ctx.ellipse(1.8, -0.2, 0.8, 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f2f2f2";
      ctx.fillRect(-2.2, -0.8, 0.4, 0.6);
      ctx.fillRect(-1.0, -0.7, 0.4, 0.6);
      ctx.fillRect(1.0, -0.7, 0.4, 0.6);
      ctx.fillRect(2.4, -0.8, 0.4, 0.6);
      ctx.restore();
      break;
    case "home_storage":
      ctx.save();
      ctx.scale(1.3, 1.3);
      ctx.fillStyle = "#4a2c12";
      ctx.fillRect(-2.4, -1.6, 4.8, 3.2);
      ctx.fillStyle = "#2c180a";
      ctx.fillRect(-2.6, -1.8, 5.2, 0.6);
      ctx.strokeStyle = "#c58b46";
      ctx.lineWidth = 0.25;
      ctx.strokeRect(-2.4, -1.6, 4.8, 3.2);
      ctx.beginPath();
      ctx.moveTo(-2.4, -0.4);
      ctx.lineTo(2.4, -0.4);
      ctx.moveTo(-2.4, 0.6);
      ctx.lineTo(2.4, 0.6);
      ctx.stroke();
      ctx.fillStyle = "#f2d19a";
      ctx.fillRect(-0.3, -0.2, 0.6, 0.6);
      ctx.restore();
      break;
    case "home_cauldron":
      ctx.save();
      ctx.scale(1.28, 1.28);
      ctx.fillStyle = "#1e1024";
      ctx.beginPath();
      ctx.ellipse(0, 0.4, 2.8, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#140a18";
      ctx.beginPath();
      ctx.ellipse(0, -0.6, 2.4, 1.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3ef2b1";
      ctx.beginPath();
      ctx.ellipse(0, -0.7, 2.2, 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(150,255,210,0.45)";
      ctx.beginPath();
      ctx.ellipse(-1.0, -0.7, 0.6, 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1b091d";
      ctx.beginPath();
      ctx.moveTo(-2.6, 0.0);
      ctx.lineTo(-3.2, 0.8);
      ctx.lineTo(-2.6, 1.2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(2.6, 0.0);
      ctx.lineTo(3.2, 0.8);
      ctx.lineTo(2.6, 1.2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
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
  const hasFacing = Math.abs(player.facingX) > 0.01 || Math.abs(player.facingY) > 0.01;
  let fx = hasFacing ? player.facingX : player.lastFacingX || 0;
  let fy = hasFacing ? player.facingY : player.lastFacingY || 1;
  if (fx === 0 && fy === 0) fy = 1;

  const absFx = Math.abs(fx);
  const absFy = Math.abs(fy);

  let orientation = "front";
  let facing = 1;

  if (absFy >= absFx) {
    if (fy <= -0.2) {
      orientation = "back";
    } else if (fy >= 0.2) {
      orientation = "front";
    } else if (absFx > 0.1) {
      orientation = "side";
      facing = fx >= 0 ? 1 : -1;
    }
  } else if (absFx > 0.1) {
    orientation = "side";
    facing = fx >= 0 ? 1 : -1;
  }

  drawPlayerSprite(screenX, screenY, player.frame, orientation, facing, player.shootingTimer > 0);
}

function drawPlayerSprite(x, y, frame, orientation, facing, shooting) {
  const scale = 3.1;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (orientation === "side" && facing < 0) {
    ctx.scale(-1, 1);
  }

  const isSide = orientation === "side";
  const isBack = orientation === "back";

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(0, 2.6, isSide ? 2.8 : 3.2, 1.4, 0, 0, Math.PI * 2);
  ctx.fill();

  const stage = Math.min(player.mutationStage || 0, MAX_MUTATION_STAGE);
  const stageRatio = stage / MAX_MUTATION_STAGE;
  const mutationPhase = stage >= 18 ? 3 : stage >= 12 ? 2 : stage >= 6 ? 1 : 0;
  const walkPhase = frame % 4;

  let robeColor;
  let robeHighlight;
  let trimColor;
  let sashColor;
  let gloveColor;
  let hatBase;
  let hatShadow;
  let hatHighlight;
  let headColor;
  let faceGlowColor;
  let faceGlowAlphaBase;
  let faceGlowAlphaBonus;
  let eyeColor;
  let eyeGlowColor;
  let hornColor;
  let clawColor;
  let fangColor;
  let sparkleColor;
  let sparkleSecondaryColor;
  let sparkleAlphaBias;
  let staffWoodColor;
  let staffCapColor;
  let orbCoreColor;
  let staffAuraStroke;

  switch (mutationPhase) {
    case 0:
      robeColor = "#765438";
      robeHighlight = "#8f6d49";
      trimColor = "#cfb582";
      sashColor = "#ba8141";
      gloveColor = "#8b6b45";
      hatBase = "#c59b4e";
      hatShadow = "#8f6e36";
      hatHighlight = "#e3c27a";
      headColor = "#06050c";
      faceGlowColor = "190, 210, 255";
      faceGlowAlphaBase = 0.18;
      faceGlowAlphaBonus = 0.12;
      eyeColor = "#ffffff";
      eyeGlowColor = "255, 255, 255";
      hornColor = "#d8c372";
      clawColor = "#6f4d2b";
      fangColor = "#ffe6c6";
      sparkleColor = "rgba(255, 248, 230, 0.9)";
      sparkleSecondaryColor = "rgba(247, 226, 160, 0.9)";
      sparkleAlphaBias = 0.26;
      staffWoodColor = "#5b3b22";
      staffCapColor = "#3f3279";
      orbCoreColor = "#ffba26";
      staffAuraStroke = "rgba(255,233,110,0.75)";
      break;
    case 1:
      robeColor = "#4d56c8";
      robeHighlight = "#6673dc";
      trimColor = "#b7caff";
      sashColor = "#e2c46a";
      gloveColor = "#5f56c1";
      hatBase = "#d4b05c";
      hatShadow = "#a27d3f";
      hatHighlight = "#efd592";
      headColor = "#04040e";
      faceGlowColor = "182, 213, 255";
      faceGlowAlphaBase = 0.24;
      faceGlowAlphaBonus = 0.16;
      eyeColor = "#f7fbff";
      eyeGlowColor = "210, 235, 255";
      hornColor = "#b3a2ff";
      clawColor = "#42318c";
      fangColor = "#fff1d7";
      sparkleColor = "rgba(180, 225, 255, 0.95)";
      sparkleSecondaryColor = "rgba(120, 180, 255, 0.85)";
      sparkleAlphaBias = 0.3;
      staffWoodColor = "#4a2a42";
      staffCapColor = "#5c54c4";
      orbCoreColor = "#ffc640";
      staffAuraStroke = "rgba(255,220,150,0.78)";
      break;
    case 2:
      robeColor = "#37225c";
      robeHighlight = "#4a2f77";
      trimColor = "#9d82ec";
      sashColor = "#ff7b4d";
      gloveColor = "#3a2561";
      hatBase = "#4b336a";
      hatShadow = "#2a1d42";
      hatHighlight = "#7c5bb2";
      headColor = "#040210";
      faceGlowColor = "164, 190, 255";
      faceGlowAlphaBase = 0.28;
      faceGlowAlphaBonus = 0.2;
      eyeColor = "#fffbf1";
      eyeGlowColor = "255, 150, 180";
      hornColor = "#f6b257";
      clawColor = "#5f274a";
      fangColor = "#ffddb4";
      sparkleColor = "rgba(255, 160, 210, 0.92)";
      sparkleSecondaryColor = "rgba(255, 110, 170, 0.88)";
      sparkleAlphaBias = 0.34;
      staffWoodColor = "#3c1b3d";
      staffCapColor = "#8b77e6";
      orbCoreColor = "#ff5fb0";
      staffAuraStroke = "rgba(255,120,190,0.82)";
      break;
    default:
      robeColor = "#24112f";
      robeHighlight = "#32183f";
      trimColor = "#5f1d36";
      sashColor = "#8c1c3d";
      gloveColor = "#2d0f28";
      hatBase = null;
      hatShadow = null;
      hatHighlight = null;
      headColor = "#0f020d";
      faceGlowColor = "120, 12, 40";
      faceGlowAlphaBase = 0.36;
      faceGlowAlphaBonus = 0.24;
      eyeColor = "#ffe7f5";
      eyeGlowColor = "255, 50, 120";
      hornColor = "#ff6f6f";
      clawColor = "#4d0f24";
      fangColor = "#ffd7c0";
      sparkleColor = "rgba(140, 255, 180, 0.95)";
      sparkleSecondaryColor = "rgba(90, 220, 140, 0.88)";
      sparkleAlphaBias = 0.4;
      staffWoodColor = "#22060e";
      staffCapColor = "#4f102a";
      orbCoreColor = "#ff3f6a";
      staffAuraStroke = "rgba(255,60,120,0.9)";
      break;
  }

  const faceGlow = `rgba(${faceGlowColor}, ${faceGlowAlphaBase + stageRatio * faceGlowAlphaBonus})`;
  const eyeGlow = `rgba(${eyeGlowColor}, ${0.42 + stageRatio * 0.3})`;
  const eyePulse = 0.04 + Math.sin(animationTime * 0.005 + walkPhase) * 0.03;
  const showHat = hatBase !== null;
  const hatTattered = mutationPhase >= 2 && mutationPhase < 3;
  const showHorns = mutationPhase >= 1;
  const largeHorns = mutationPhase >= 2;
  const showFangs = mutationPhase >= 2;
  const showClaws = mutationPhase >= 1;
  const backSpikes = mutationPhase >= 3;

  const robeWidth = isSide ? 2.3 : 2.8;
  const robeBaseY = 3.15;
  const belly = Math.sin((walkPhase + (shooting ? 0.5 : 0)) * (Math.PI / 2)) * 0.12;
  const sway = Math.sin(animationTime * 0.0025) * 0.12;
  const staffGlowBase = 0.32 + stageRatio * 0.18 + mutationPhase * 0.08;
  const staffGlow = shooting ? staffGlowBase + 0.32 : staffGlowBase;
  const staffShift = shooting ? 0.55 + mutationPhase * 0.08 : 0.1 + mutationPhase * 0.05;
  const staffBaseX = orientation === "back" ? 2.0 : orientation === "side" ? 2.4 : 2.8;
  const staffBaseY = orientation === "back" ? -1.6 : -1.4;

  const drawStaff = () => {
    ctx.save();
    ctx.translate(staffBaseX + staffShift, staffBaseY);
    if (shooting) {
      ctx.rotate(-0.18);
    } else if (orientation === "back") {
      ctx.rotate(0.08);
    } else {
      ctx.rotate(0.05);
    }
    ctx.fillStyle = staffWoodColor;
    ctx.beginPath();
    ctx.moveTo(-0.35, -0.3);
    ctx.quadraticCurveTo(-0.65, 2.0, -0.25, 3.6);
    ctx.quadraticCurveTo(0.15, 5.4, -0.05, 6.2);
    ctx.quadraticCurveTo(0.3, 6.4, 0.55, 6.1);
    ctx.quadraticCurveTo(0.25, 4.2, 0.55, 2.0);
    ctx.quadraticCurveTo(0.75, 0.6, 0.35, -0.4);
    ctx.closePath();
    ctx.fill();

    if (mutationPhase >= 2) {
      ctx.fillStyle = clawColor;
      ctx.beginPath();
      ctx.moveTo(-0.55, 3.8);
      ctx.lineTo(-1.45, 5.4);
      ctx.lineTo(-0.35, 5.2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0.45, 5.6);
      ctx.lineTo(1.4, 7.2);
      ctx.lineTo(0.6, 7.0);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = staffCapColor;
    ctx.beginPath();
    ctx.ellipse(0, -0.8, 0.65, 0.75, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = orbCoreColor;
    ctx.beginPath();
    ctx.arc(0, -1.4, 1.05 + staffGlow * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = staffAuraStroke;
    ctx.lineWidth = 0.22;
    ctx.beginPath();
    ctx.arc(0, -1.4, 1.3 + staffGlow * 0.45, 0, Math.PI * 2);
    ctx.stroke();
    if (mutationPhase >= 3) {
      ctx.globalAlpha = 0.6 + staffGlow * 0.6;
      ctx.strokeStyle = "rgba(255,80,130,0.7)";
      ctx.beginPath();
      ctx.arc(0, -1.4, 2.1 + staffGlow * 0.9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(255,60,120,0.3)";
      ctx.beginPath();
      ctx.arc(0.8, -2.2, 0.6, 0, Math.PI * 2);
      ctx.arc(-0.9, -2.3, 0.5, 0, Math.PI * 2);
      ctx.fill("evenodd");
    } else if (mutationPhase >= 2) {
      ctx.globalAlpha = 0.5 + staffGlow * 0.4;
      ctx.strokeStyle = "rgba(255,140,190,0.55)";
      ctx.beginPath();
      ctx.arc(0, -1.4, 1.8 + staffGlow * 0.6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.4 + staffGlow * 0.35;
    ctx.fillStyle =
      mutationPhase >= 2 ? "rgba(255,120,200,0.6)" : "rgba(255,220,150,0.55)";
    ctx.beginPath();
    ctx.arc(0, -1.4, 2.2 + staffGlow * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha *= 0.75;
    ctx.fillStyle =
      mutationPhase >= 2 ? "rgba(255,80,160,0.45)" : "rgba(255,235,200,0.42)";
    ctx.beginPath();
    ctx.arc(0, -1.4, 2.8 + staffGlow, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.restore();
  };

  const drawFrontHorns = () => {
    if (!showHorns) return;
    ctx.save();
    ctx.fillStyle = hornColor;
    const hornStretch = largeHorns ? 1.1 : 0.8;
    const hornLift = largeHorns ? -4.9 - stageRatio * 0.4 : -4.3 - stageRatio * 0.25;
    ctx.beginPath();
    ctx.moveTo(-1.1, -2.8);
    ctx.quadraticCurveTo(-1.9 * hornStretch, hornLift, -0.9, -3.1);
    ctx.quadraticCurveTo(-0.7, -2.6, -1.1, -2.4);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(1.1, -2.8);
    ctx.quadraticCurveTo(1.9 * hornStretch, hornLift, 0.9, -3.1);
    ctx.quadraticCurveTo(0.7, -2.6, 1.1, -2.4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.moveTo(-0.9, -3.6);
    ctx.quadraticCurveTo(-0.7, hornLift + 1.0, -0.6, -3.1);
    ctx.quadraticCurveTo(-0.7, -3.2, -0.9, -3.6);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0.9, -3.6);
    ctx.quadraticCurveTo(0.7, hornLift + 1.0, 0.6, -3.1);
    ctx.quadraticCurveTo(0.7, -3.2, 0.9, -3.6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawSideHorns = () => {
    if (!showHorns) return;
    ctx.save();
    ctx.fillStyle = hornColor;
    const hornLift = largeHorns ? -4.7 - stageRatio * 0.38 : -4.1 - stageRatio * 0.24;
    if (facing < 0) ctx.scale(-1, 1);
    ctx.beginPath();
    ctx.moveTo(-0.4, -2.6);
    ctx.quadraticCurveTo(-1.6, hornLift, -0.6, -3.0);
    ctx.quadraticCurveTo(-0.4, -2.5, -0.4, -2.1);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawBackHorns = () => {
    if (!showHorns) return;
    ctx.save();
    ctx.fillStyle = hornColor;
    const hornSpread = largeHorns ? 1.4 : 1.0;
    const hornLift = largeHorns ? -4.8 - stageRatio * 0.38 : -4.1 - stageRatio * 0.24;
    ctx.beginPath();
    ctx.moveTo(-0.9 * hornSpread, -2.5);
    ctx.quadraticCurveTo(-1.6 * hornSpread, hornLift, -0.3, -3.2);
    ctx.quadraticCurveTo(-0.4, -2.7, -0.9 * hornSpread, -2.5);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0.9 * hornSpread, -2.5);
    ctx.quadraticCurveTo(1.6 * hornSpread, hornLift, 0.3, -3.2);
    ctx.quadraticCurveTo(0.4, -2.7, 0.9 * hornSpread, -2.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawBackSpines = () => {
    if (!backSpikes) return;
    ctx.save();
    ctx.fillStyle = "rgba(255,90,150,0.45)";
    for (let i = 0; i < 4; i += 1) {
      const t = i / 3;
      const angleOffset = Math.sin(animationTime * 0.003 + i * 1.4) * 0.15;
      ctx.beginPath();
      ctx.moveTo(0, 0.8 + t * 2.8);
      ctx.quadraticCurveTo(
        -0.6 + angleOffset,
        -0.6 + t * 2.0,
        0,
        -0.2 + t * 3.2,
      );
      ctx.quadraticCurveTo(0.6 + angleOffset, -0.6 + t * 2.0, 0, 0.8 + t * 2.8);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  };

  if (isBack) {
    drawStaff();
  }

  ctx.save();
  if (isSide) ctx.scale(0.9, 1);

  const leftLift = Math.max(0, Math.sin(walkPhase * (Math.PI / 2))) * 0.45;
  const rightLift = Math.max(0, Math.sin(((walkPhase + 2) % 4) * (Math.PI / 2))) * 0.45;
  const leftSwing = Math.cos(walkPhase * (Math.PI / 2)) * 0.32;
  const rightSwing = Math.cos(((walkPhase + 2) % 4) * (Math.PI / 2)) * 0.32;
  const bootColor = stage >= 10 ? "#2a2441" : "#342a44";
  const soleColor = stage >= 10 ? "#4a3f6b" : "#45385c";

  const drawFeetFront = () => {
    ctx.fillStyle = bootColor;
    ctx.beginPath();
    ctx.ellipse(-1.25 + leftSwing * 0.45, robeBaseY - leftLift, 1.2, 0.75 + leftLift * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(1.05 + rightSwing * 0.45, robeBaseY - rightLift, 1.2, 0.75 + rightLift * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = soleColor;
    ctx.beginPath();
    ctx.ellipse(-1.25 + leftSwing * 0.45, robeBaseY + 0.18, 1.25, 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(1.05 + rightSwing * 0.45, robeBaseY + 0.18, 1.25, 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawFeetSide = () => {
    ctx.fillStyle = bootColor;
    ctx.beginPath();
    ctx.ellipse(-0.85 + leftSwing * 0.35, robeBaseY - leftLift * 0.9, 1.3, 0.8 + leftLift * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = soleColor;
    ctx.beginPath();
    ctx.ellipse(-0.85 + leftSwing * 0.35, robeBaseY + 0.2, 1.35, 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = bootColor;
    ctx.save();
    ctx.globalAlpha = 0.72;
    ctx.beginPath();
    ctx.ellipse(0.75 + rightSwing * 0.25, robeBaseY - rightLift * 0.6, 1.05, 0.65 + rightLift * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawFront = () => {
    ctx.fillStyle = robeColor;
    ctx.beginPath();
    ctx.moveTo(-robeWidth, -1.2 - sway);
    ctx.quadraticCurveTo(-robeWidth - 0.7, 0.9 + belly, -1.1, robeBaseY);
    ctx.quadraticCurveTo(0, robeBaseY + 0.6, 1.1, robeBaseY);
    ctx.quadraticCurveTo(robeWidth + 0.7, 0.9 + belly, robeWidth, -1.2 - sway);
    ctx.quadraticCurveTo(0, -2.3 - sway * 0.4, -robeWidth, -1.2 - sway);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = robeHighlight;
    ctx.beginPath();
    ctx.moveTo(-robeWidth * 0.6, -0.8 - sway * 0.5);
    ctx.quadraticCurveTo(-robeWidth * 0.4, 0.9 + belly * 0.6, -0.4, 2.6);
    ctx.quadraticCurveTo(0, 2.95, 0.4, 2.6);
    ctx.quadraticCurveTo(robeWidth * 0.4, 0.9 + belly * 0.6, robeWidth * 0.6, -0.8 - sway * 0.5);
    ctx.quadraticCurveTo(0, -1.8 - sway * 0.3, -robeWidth * 0.6, -0.8 - sway * 0.5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = sashColor;
    ctx.beginPath();
    ctx.ellipse(0, 0.6 + belly * 0.4, robeWidth * 0.82, 0.95, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = trimColor;
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.ellipse(0, 0.4 + belly * 0.4, robeWidth * 0.7, 0.65, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = gloveColor;
    ctx.beginPath();
    ctx.ellipse(-robeWidth + 0.5, 0.3 + belly * 0.4, 0.75, 1.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(robeWidth - 0.5, 0.3 + belly * 0.4, 0.75, 1.15, 0, 0, Math.PI * 2);
    ctx.fill();
    if (showClaws) {
      ctx.fillStyle = clawColor;
      ctx.beginPath();
      ctx.moveTo(-robeWidth + 0.6, 1.2 + belly * 0.4);
      ctx.lineTo(-robeWidth - 0.2, 1.9 + belly * 0.5);
      ctx.lineTo(-robeWidth + 0.3, 2.2 + belly * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(robeWidth - 0.6, 1.2 + belly * 0.4);
      ctx.lineTo(robeWidth + 0.2, 1.9 + belly * 0.5);
      ctx.lineTo(robeWidth - 0.3, 2.2 + belly * 0.45);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = headColor;
    ctx.beginPath();
    ctx.ellipse(0, -2.05, 1.72, 1.08, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = faceGlow;
    ctx.beginPath();
    ctx.ellipse(0, -2.05, 1.86, 1.22, 0, 0, Math.PI * 2);
    ctx.fill();

    const eyeWidth = 0.34 + eyePulse;
    const eyeHeight = 0.46 + eyePulse * 0.6;
    ctx.fillStyle = eyeGlow;
    ctx.beginPath();
    ctx.ellipse(-0.64, -2.0, eyeWidth + 0.18, eyeHeight + 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0.64, -2.0, eyeWidth + 0.18, eyeHeight + 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.ellipse(-0.64, -2.0, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0.64, -2.0, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();
    ctx.ellipse(-0.38, -2.18, 0.16, 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0.38, -2.18, 0.16, 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    const pupilColor = mutationPhase >= 3 ? "#ff2a6a" : mutationPhase >= 2 ? "#2d0f45" : "#1b1b1b";
    const pupilWidth = mutationPhase >= 2 ? 0.18 : 0.24;
    const pupilHeight = mutationPhase >= 2 ? 0.62 : 0.36;
    ctx.fillStyle = pupilColor;
    ctx.beginPath();
    ctx.ellipse(-0.64, -2.0, pupilWidth, pupilHeight, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0.64, -2.0, pupilWidth, pupilHeight, 0, 0, Math.PI * 2);
    ctx.fill();
    if (showFangs) {
      ctx.fillStyle = fangColor;
      ctx.beginPath();
      ctx.moveTo(-0.35, -1.42);
      ctx.lineTo(-0.58, -0.8);
      ctx.lineTo(-0.1, -1.05);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0.35, -1.42);
      ctx.lineTo(0.58, -0.8);
      ctx.lineTo(0.1, -1.05);
      ctx.closePath();
      ctx.fill();
    }

    drawFrontHorns();

    if (showHat && hatShadow && hatBase && hatHighlight) {
      ctx.save();
      ctx.globalAlpha = 0.72;
      ctx.fillStyle = hatShadow;
      ctx.beginPath();
      ctx.ellipse(0, -2.25, robeWidth + 0.7, 0.55 + mutationPhase * 0.05, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = hatBase;
      ctx.beginPath();
      if (hatTattered) {
        ctx.moveTo(-robeWidth - 0.6, -2.4);
        ctx.quadraticCurveTo(-1.6, -3.3 - stageRatio * 0.5, -1.2, -4.2 - stageRatio * 0.5);
        ctx.lineTo(-0.6, -4.9 - stageRatio * 0.6);
        ctx.lineTo(-0.2, -4.0 - stageRatio * 0.4);
        ctx.lineTo(0.2, -5.2 - stageRatio * 0.65);
        ctx.lineTo(0.8, -4.1 - stageRatio * 0.4);
        ctx.lineTo(1.2, -5.0 - stageRatio * 0.65);
        ctx.quadraticCurveTo(2.6, -3.7 - stageRatio * 0.45, robeWidth + 0.9, -2.35);
      } else {
        ctx.moveTo(-robeWidth - 0.5, -2.3);
        ctx.quadraticCurveTo(-1.6, -3.3 - stageRatio * 0.4, -0.8, -4.6 - stageRatio * 0.5);
        ctx.quadraticCurveTo(-0.1, -5.7 - stageRatio * 0.55, 1.1, -4.9 - stageRatio * 0.6);
        ctx.quadraticCurveTo(2.6, -3.9 - stageRatio * 0.45, robeWidth + 0.8, -2.35);
      }
      ctx.quadraticCurveTo(0.4, -2.6, -robeWidth - 0.5, -2.3);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = hatHighlight;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      if (hatTattered) {
        ctx.moveTo(-0.8, -4.3 - stageRatio * 0.45);
        ctx.lineTo(-0.2, -5.0 - stageRatio * 0.5);
        ctx.lineTo(0.4, -4.2 - stageRatio * 0.45);
        ctx.lineTo(0.9, -4.6 - stageRatio * 0.5);
        ctx.lineTo(0.3, -3.6 - stageRatio * 0.3);
        ctx.closePath();
      } else {
        ctx.moveTo(-1.0, -4.3 - stageRatio * 0.45);
        ctx.quadraticCurveTo(-0.5, -4.9 - stageRatio * 0.5, 0.6, -4.8 - stageRatio * 0.55);
        ctx.quadraticCurveTo(1.5, -4.4 - stageRatio * 0.45, 0.9, -3.7 - stageRatio * 0.4);
        ctx.closePath();
      }
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (showHat && hatBase && hatShadow) {
      const rimWidth = robeWidth + 1.0;
      ctx.save();
      ctx.translate(0, -1.05);
      ctx.beginPath();
      ctx.fillStyle = hatHighlight || "#f0d59a";
      ctx.globalAlpha = 0.65;
      ctx.ellipse(0, 0, rimWidth, 0.46, 0, 0, Math.PI);
      ctx.lineTo(rimWidth, 0.18);
      ctx.ellipse(0, 0.18, rimWidth, 0.32, 0, Math.PI, 0, true);
      ctx.closePath();
      ctx.fill();

      ctx.globalAlpha = 0.4;
      ctx.fillStyle = hatShadow || "#856436";
      ctx.beginPath();
      ctx.ellipse(0, -0.04, rimWidth * 0.92, 0.3, 0, 0, Math.PI);
      ctx.lineTo(rimWidth * 0.92, 0.08);
      ctx.ellipse(0, 0.08, rimWidth * 0.92, 0.22, 0, Math.PI, 0, true);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    drawFeetFront();
  };

  const drawSide = () => {
    ctx.fillStyle = robeColor;
    ctx.beginPath();
    ctx.moveTo(-robeWidth + 0.4, -1.3 - sway);
    ctx.quadraticCurveTo(-robeWidth - 0.3, 1.0 + belly, -0.9, robeBaseY);
    ctx.quadraticCurveTo(0.4, robeBaseY + 0.4, 1.6, robeBaseY - 0.2);
    ctx.quadraticCurveTo(2.2, 0.8 + belly * 0.6, 2.1, -0.4);
    ctx.quadraticCurveTo(2.3, -1.6, -robeWidth + 0.4, -1.3 - sway);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = robeHighlight;
    ctx.beginPath();
    ctx.moveTo(-1.4, -0.6 - sway * 0.5);
    ctx.quadraticCurveTo(-1.2, 0.6 + belly * 0.4, -0.5, 2.5);
    ctx.quadraticCurveTo(0.2, 2.8, 0.9, 2.4);
    ctx.quadraticCurveTo(1.5, 1.0, 1.2, -0.4 - sway * 0.3);
    ctx.quadraticCurveTo(-0.1, -1.2, -1.4, -0.6 - sway * 0.5);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = sashColor;
    ctx.beginPath();
    ctx.ellipse(-0.2, 0.4 + belly * 0.4, robeWidth * 0.65, 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = gloveColor;
    ctx.beginPath();
    ctx.ellipse(robeWidth - 0.1, 0.1 + belly * 0.3, 0.75, 1.0, 0, 0, Math.PI * 2);
    ctx.fill();
    if (showClaws) {
      ctx.fillStyle = clawColor;
      ctx.beginPath();
      ctx.moveTo(robeWidth - 0.45, 0.9 + belly * 0.3);
      ctx.lineTo(robeWidth + 0.2, 1.45 + belly * 0.35);
      ctx.lineTo(robeWidth - 0.2, 1.9 + belly * 0.4);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = headColor;
    ctx.beginPath();
    ctx.ellipse(0.3, -2.0, 1.2, 1.0, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = faceGlow;
    ctx.beginPath();
    ctx.ellipse(0.4, -2.0, 1.3, 1.1, 0, 0, Math.PI * 2);
    ctx.fill();

    const sideEyeWidth = 0.3 + eyePulse * 0.8;
    const sideEyeHeight = 0.35 + eyePulse * 0.5;
    ctx.fillStyle = headColor;
    ctx.beginPath();
    ctx.ellipse(0.8, -1.9, 0.9, 0.82, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = faceGlow;
    ctx.beginPath();
    ctx.ellipse(0.86, -1.88, 1.02, 0.95, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = eyeGlow;
    ctx.beginPath();
    ctx.ellipse(0.9, -1.9, sideEyeWidth + 0.2, sideEyeHeight + 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.ellipse(0.96, -1.9, sideEyeWidth + 0.06, sideEyeHeight + 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();
    ctx.ellipse(1.02, -1.98, 0.12, 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
    const sidePupilColor = mutationPhase >= 3 ? "#ff2a6a" : mutationPhase >= 2 ? "#321346" : "#1b1b1b";
    const sidePupilWidth = mutationPhase >= 2 ? 0.12 : 0.18;
    const sidePupilHeight = mutationPhase >= 2 ? 0.5 : 0.3;
    ctx.fillStyle = sidePupilColor;
    ctx.beginPath();
    ctx.ellipse(0.96, -1.9, sidePupilWidth, sidePupilHeight, 0, 0, Math.PI * 2);
    ctx.fill();
    if (showFangs) {
      ctx.fillStyle = fangColor;
      ctx.beginPath();
      ctx.moveTo(0.35, -1.4);
      ctx.lineTo(0.6, -0.85);
      ctx.lineTo(0.05, -1.08);
      ctx.closePath();
      ctx.fill();
    }

    drawSideHorns();

    if (showHat && hatShadow && hatBase && hatHighlight) {
      ctx.fillStyle = hatShadow;
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.ellipse(0.1, -1.95, robeWidth + 0.55, 0.55 + mutationPhase * 0.04, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = hatBase;
      ctx.beginPath();
      if (hatTattered) {
        ctx.moveTo(-robeWidth, -2.2);
        ctx.lineTo(-0.9, -3.1 - stageRatio * 0.42);
        ctx.lineTo(-0.4, -3.7 - stageRatio * 0.5);
        ctx.lineTo(-0.1, -4.6 - stageRatio * 0.58);
        ctx.lineTo(0.2, -3.9 - stageRatio * 0.4);
        ctx.lineTo(0.6, -4.8 - stageRatio * 0.58);
        ctx.lineTo(1.2, -4.0 - stageRatio * 0.42);
        ctx.lineTo(1.7, -4.8 - stageRatio * 0.54);
        ctx.quadraticCurveTo(2.8, -3.4 - stageRatio * 0.4, 2.3, -2.05);
      } else {
        ctx.moveTo(-robeWidth, -2.2);
        ctx.quadraticCurveTo(-0.8, -3.1 - stageRatio * 0.4, 0.3, -4.4 - stageRatio * 0.5);
        ctx.quadraticCurveTo(1.1, -5.2 - stageRatio * 0.55, 2.2, -4.4 - stageRatio * 0.5);
        ctx.quadraticCurveTo(2.9, -3.4 - stageRatio * 0.4, 2.4, -2.1);
      }
      ctx.quadraticCurveTo(0.8, -2.5, -robeWidth, -2.2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = hatHighlight;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      if (hatTattered) {
        ctx.moveTo(0.05, -3.7 - stageRatio * 0.45);
        ctx.lineTo(0.6, -3.5 - stageRatio * 0.38);
        ctx.lineTo(0.3, -2.9 - stageRatio * 0.32);
        ctx.closePath();
      } else {
        ctx.moveTo(0.2, -3.8 - stageRatio * 0.45);
        ctx.quadraticCurveTo(1.0, -3.6 - stageRatio * 0.4, 1.6, -2.8 - stageRatio * 0.35);
        ctx.quadraticCurveTo(0.8, -2.9, 0.2, -3.0 - stageRatio * 0.35);
        ctx.closePath();
      }
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    drawFeetSide();
  };

  const drawBack = () => {
    ctx.fillStyle = robeColor;
    ctx.beginPath();
    ctx.moveTo(-robeWidth, -1.1 - sway);
    ctx.quadraticCurveTo(-robeWidth - 0.6, 0.95 + belly, -1.05, robeBaseY);
    ctx.quadraticCurveTo(0, robeBaseY + 0.5, 1.05, robeBaseY);
    ctx.quadraticCurveTo(robeWidth + 0.6, 0.95 + belly, robeWidth, -1.1 - sway);
    ctx.quadraticCurveTo(0, -2.4 - sway * 0.4, -robeWidth, -1.1 - sway);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = headColor;
    ctx.beginPath();
    ctx.ellipse(0, -2.0, 1.8, 1.25, 0, 0, Math.PI * 2);
    ctx.fill();

    drawBackSpines();
    drawBackHorns();

    if (showHat && hatBase && hatShadow && hatHighlight) {
      ctx.save();
      ctx.translate(0, -1.15);
      ctx.fillStyle = hatBase;
      const brimWidth = robeWidth + 1.15;
      ctx.beginPath();
      ctx.ellipse(0, 0.05, brimWidth, 0.58, 0, 0, Math.PI);
      ctx.lineTo(brimWidth, 0.32);
      ctx.ellipse(0, 0.32, brimWidth, 0.42, 0, Math.PI, 0, true);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = hatShadow;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.ellipse(0, 0.12, brimWidth * 0.92, 0.34, 0, 0, Math.PI);
      ctx.lineTo(brimWidth * 0.92, 0.38);
      ctx.ellipse(0, 0.38, brimWidth * 0.92, 0.24, 0, Math.PI, 0, true);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = hatBase;
      ctx.beginPath();
      if (hatTattered) {
        ctx.moveTo(-robeWidth - 0.5, -2.0);
        ctx.lineTo(-1.2, -3.0 - stageRatio * 0.5);
        ctx.lineTo(-0.8, -4.5 - stageRatio * 0.6);
        ctx.lineTo(-0.1, -4.0 - stageRatio * 0.45);
        ctx.lineTo(0.4, -5.2 - stageRatio * 0.6);
        ctx.lineTo(1.0, -4.1 - stageRatio * 0.45);
        ctx.lineTo(1.4, -4.9 - stageRatio * 0.55);
        ctx.quadraticCurveTo(robeWidth + 0.6, -2.1, robeWidth + 0.5, -1.9);
      } else {
        ctx.moveTo(-robeWidth - 0.4, -1.9);
        ctx.quadraticCurveTo(-1.2, -3.1 - stageRatio * 0.45, -0.6, -4.8 - stageRatio * 0.55);
        ctx.quadraticCurveTo(0, -5.7 - stageRatio * 0.55, 0.7, -4.9 - stageRatio * 0.55);
        ctx.quadraticCurveTo(1.4, -3.6 - stageRatio * 0.45, robeWidth + 0.4, -1.9);
      }
      ctx.quadraticCurveTo(0, -2.6, -robeWidth - 0.4, -1.9);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = hatShadow;
      ctx.beginPath();
      ctx.ellipse(0, -1.7, robeWidth + 0.75, 0.7 + mutationPhase * 0.05, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = hatHighlight;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      if (hatTattered) {
        ctx.moveTo(-0.2, -4.6 - stageRatio * 0.55);
        ctx.lineTo(0.3, -5.0 - stageRatio * 0.55);
        ctx.lineTo(0.6, -4.2 - stageRatio * 0.45);
        ctx.closePath();
      } else {
        ctx.moveTo(-0.4, -4.7 - stageRatio * 0.55);
        ctx.quadraticCurveTo(0.1, -5.1 - stageRatio * 0.55, 0.6, -4.6 - stageRatio * 0.5);
        ctx.quadraticCurveTo(0.1, -4.4 - stageRatio * 0.45, -0.4, -4.2 - stageRatio * 0.4);
        ctx.closePath();
      }
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    drawFeetFront();
  };

  const drawSparkles = () => {
    const sparkleCount = 6;
    const baseRadius = 2.2 + stageRatio * 0.18 + mutationPhase * 0.15;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < sparkleCount; i += 1) {
      const angle = (i / sparkleCount) * Math.PI * 2;
      const radius =
        baseRadius + Math.sin(animationTime * 0.006 + i * 1.7) * (0.12 + mutationPhase * 0.05);
      const xOffset = Math.cos(angle) * radius;
      const yOffset = Math.sin(angle) * (radius * 0.6) - 1.1;
      const sizeBase = 0.2 + stageRatio * 0.08;
      const size =
        sizeBase + Math.sin(animationTime * 0.01 + i * 2.1) * (0.05 + mutationPhase * 0.015);
      ctx.save();
      const alphaBase = sparkleAlphaBias + stageRatio * 0.18;
      const alphaPulse = 0.08 + mutationPhase * 0.04;
      ctx.globalAlpha = alphaBase + Math.sin(animationTime * 0.006 + i) * alphaPulse;
      ctx.fillStyle = i % 2 === 0 ? sparkleColor : sparkleSecondaryColor;
      ctx.beginPath();
      ctx.ellipse(xOffset, yOffset, size, size * 0.6, angle, 0, Math.PI * 2);
      ctx.fill();
      if (mutationPhase >= 3) {
        ctx.globalAlpha *= 0.6;
        ctx.fillStyle = "rgba(255,80,140,0.85)";
        ctx.beginPath();
        ctx.ellipse(
          xOffset * 0.9,
          yOffset * 0.9 - 0.2,
          size * 0.65,
          size * 0.45,
          angle,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  };

  if (isBack) {
    drawBack();
  } else if (isSide) {
    drawSide();
  } else {
    drawFront();
  }

  drawSparkles();

  ctx.restore();

  if (!isBack) {
    drawStaff();
  }

  if (stage >= 4) {
    const sparkCount = 3 + Math.floor(stageRatio * 5);
    for (let i = 0; i < sparkCount; i += 1) {
      const angle = (i / sparkCount) * Math.PI * 2 + animationTime * 0.0015;
      const radius = 2.6 + stageRatio * 0.9 + Math.sin(animationTime * 0.002 + i) * 0.2;
      const sx = Math.cos(angle) * radius;
      const sy = Math.sin(angle) * (radius * 0.4) - 1.0;
      const flicker = 0.5 + Math.sin(animationTime * 0.004 + i * 2) * 0.25;
      ctx.fillStyle = `rgba(255, ${200 + Math.floor(stageRatio * 30)}, ${90 + Math.floor(stageRatio * 40)}, ${0.35 + flicker * 0.25})`;
      ctx.beginPath();
      ctx.ellipse(sx, sy, 0.22 + stageRatio * 0.18, 0.32 + stageRatio * 0.22, angle, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (stage >= 9) {
    ctx.save();
    ctx.globalAlpha = 0.25 + stageRatio * 0.25;
    ctx.strokeStyle = stage >= 17 ? "rgba(255,214,96,0.8)" : "rgba(194,178,255,0.7)";
    ctx.lineWidth = 0.35 + stageRatio * 0.3;
    ctx.beginPath();
    ctx.arc(0, -0.2, 2.4 + stageRatio * 0.9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

function drawPreySprite(prey, x, y) {
  ctx.save();
  ctx.translate(x, y);
  const spawnProgress = prey.spawnTimer ? prey.spawnTimer / ENEMY_SPAWN_FLASH : 0;
  if (spawnProgress > 0) {
    const pulse = Math.sin((1 - spawnProgress) * Math.PI * 2 + animationTime * 0.01) * 5;
    ctx.save();
    ctx.globalAlpha = 0.35 + 0.4 * spawnProgress;
    ctx.lineWidth = 2.6 - spawnProgress * 1.4;
    ctx.strokeStyle = `rgba(124, 255, 162, ${0.5 * spawnProgress + 0.2})`;
    ctx.beginPath();
    ctx.arc(0, 0, prey.radius * 0.8 + (1 - spawnProgress) * prey.radius * 0.6 + pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  const scaleFactor = Math.max(0.78, Math.min(1.38, 1 + (prey.radius - 14) * 0.045));
  ctx.scale(2.3 * scaleFactor, 2.3 * scaleFactor);
  const wobble = Math.sin((prey.animTimer || 0) / 18) * 0.12;
  const shadowWidth = 2.4 + (scaleFactor - 1) * 1.1;
  const shadowHeight = 1.15 + (scaleFactor - 1) * 0.45;
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath();
  ctx.ellipse(0, 2.2, shadowWidth, shadowHeight, 0, 0, Math.PI * 2);
  ctx.fill();

  if (prey.bonded) {
    const glowPulse = 0.5 + Math.sin((prey.animTimer || 0) / 95) * 0.25;
    ctx.save();
    ctx.globalAlpha = 0.45 + glowPulse * 0.25;
    ctx.fillStyle = "rgba(255, 234, 140, 0.6)";
    ctx.beginPath();
    ctx.ellipse(0, 1.2, 2.4 + glowPulse * 0.8, 1.4 + glowPulse * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const variant = prey.variant;
  const bodyColor = prey.color || "#7befa2";

  if (variant === "spritelings") {
    ctx.save();
    ctx.globalAlpha = 0.65;
    ctx.fillStyle = "rgba(174, 255, 219, 0.65)";
    ctx.beginPath();
    ctx.ellipse(-1.6, -0.4, 1.6, 0.85, -0.45, 0, Math.PI * 2);
    ctx.ellipse(1.6, -0.4, 1.6, 0.85, 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(-1.2, -1.2);
    ctx.quadraticCurveTo(0, -1.9 - wobble * 0.8, 1.2, -1.2);
    ctx.quadraticCurveTo(1.5, 0.2 + wobble, 0, 1.4);
    ctx.quadraticCurveTo(-1.5, 0.2 - wobble, -1.2, -1.2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-0.5, -0.55, 0.32, 0.42);
    ctx.fillRect(0.16, -0.55, 0.32, 0.42);
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(-0.42, -0.45, 0.18, 0.18);
    ctx.fillRect(0.22, -0.45, 0.18, 0.18);

    ctx.fillStyle = "#87ffd1";
    ctx.beginPath();
    ctx.moveTo(0, 1.3);
    ctx.quadraticCurveTo(0.6, 2.3, 0, 2.8);
    ctx.quadraticCurveTo(-0.6, 2.3, 0, 1.3);
    ctx.fill();
  } else if (variant === "boulderback") {
    ctx.fillStyle = "#1d1811";
    ctx.beginPath();
    ctx.moveTo(-2.2, -1.4);
    ctx.quadraticCurveTo(0, -2.7 - wobble * 0.5, 2.2, -1.4);
    ctx.quadraticCurveTo(3.0, 1.1 + wobble * 0.4, 0, 2.9);
    ctx.quadraticCurveTo(-3.0, 1.1 - wobble * 0.4, -2.2, -1.4);
    ctx.fill();

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(-1.8, -1.2);
    ctx.quadraticCurveTo(0, -2.2 - wobble * 0.4, 1.8, -1.2);
    ctx.quadraticCurveTo(2.4, 1.0 + wobble * 0.2, 0, 2.0);
    ctx.quadraticCurveTo(-2.4, 1.0 - wobble * 0.2, -1.8, -1.2);
    ctx.fill();

    ctx.strokeStyle = "rgba(62, 47, 32, 0.65)";
    ctx.lineWidth = 0.25;
    ctx.beginPath();
    ctx.moveTo(-1.6, -0.8);
    ctx.quadraticCurveTo(-0.4, -1.6, 0, -1.0);
    ctx.quadraticCurveTo(0.6, -0.4, 1.5, -0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-1.0, 0.1);
    ctx.quadraticCurveTo(-0.2, 0.6, -0.4, 1.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0.6, 0.4);
    ctx.quadraticCurveTo(0.8, 1.0, 0.3, 1.6);
    ctx.stroke();

    ctx.fillStyle = "#ffecc0";
    ctx.fillRect(-0.8, -0.2, 0.5, 0.5);
    ctx.fillRect(0.4, -0.2, 0.5, 0.5);
    ctx.fillStyle = "#312313";
    ctx.fillRect(-0.7, -0.1, 0.24, 0.24);
    ctx.fillRect(0.5, -0.1, 0.24, 0.24);
  } else if (variant === "lifebloom") {
    const petalPulse = 0.6 + Math.sin((prey.animTimer || 0) / 90 + wobble) * 0.18;
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = "rgba(140, 255, 170, 0.35)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 2.6 + petalPulse, 1.4 + petalPulse * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "rgba(90, 180, 110, 0.45)";
    ctx.beginPath();
    ctx.ellipse(-0.6, 1.4, 0.6, 1.4, -0.3, 0, Math.PI * 2);
    ctx.ellipse(0.6, 1.4, 0.6, 1.4, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI * 2 * i) / 6 + wobble * 0.4;
      const px = Math.cos(angle) * 1.4;
      const py = Math.sin(angle) * 1.4;
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(px * 0.7, py * 0.7 - 0.4, px, py);
      ctx.quadraticCurveTo(px * 0.5, py * 0.5 + 0.4, 0, 0);
    }
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(0, -0.2, 0.6, 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2b5d33";
    ctx.beginPath();
    ctx.ellipse(-0.2, -0.2, 0.14, 0.18, 0, 0, Math.PI * 2);
    ctx.ellipse(0.2, -0.2, 0.14, 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#92ffba";
    ctx.beginPath();
    ctx.moveTo(-0.5, 0.8);
    ctx.quadraticCurveTo(0, 1.4 + wobble * 0.4, 0.5, 0.8);
    ctx.quadraticCurveTo(0, 1.7, -0.5, 0.8);
    ctx.fill();
    if (prey.bonded) {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 234, 160, 0.8)";
      ctx.lineWidth = 0.3;
      ctx.beginPath();
      ctx.arc(0, 0, 2.2 + wobble * 0.4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  } else if (variant === "glintmoth") {
    const wingPulse = 0.6 + Math.sin((prey.animTimer || 0) / 80 + wobble) * 0.2;
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "rgba(255, 236, 158, 0.4)";
    ctx.beginPath();
    ctx.ellipse(-1.6, -0.2, 1.7 + wingPulse * 0.5, 1.3 + wingPulse * 0.4, Math.PI / 6, 0, Math.PI * 2);
    ctx.ellipse(1.6, -0.2, 1.7 + wingPulse * 0.5, 1.3 + wingPulse * 0.4, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(-0.8, -1.6);
    ctx.quadraticCurveTo(0, -2.4 - wobble * 0.4, 0.8, -1.6);
    ctx.quadraticCurveTo(1.1, 0.2 + wobble * 0.5, 0, 2.0);
    ctx.quadraticCurveTo(-1.1, 0.2 - wobble * 0.5, -0.8, -1.6);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(-0.32, -0.5, 0.28, 0.4, 0, 0, Math.PI * 2);
    ctx.ellipse(0.32, -0.5, 0.28, 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#363636";
    ctx.beginPath();
    ctx.ellipse(-0.32, -0.48, 0.14, 0.18, 0, 0, Math.PI * 2);
    ctx.ellipse(0.32, -0.48, 0.14, 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffdc7a";
    ctx.beginPath();
    ctx.moveTo(-0.4, 0.6);
    ctx.quadraticCurveTo(0, 1.2 + wobble * 0.35, 0.4, 0.6);
    ctx.quadraticCurveTo(0, 1.6, -0.4, 0.6);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 228, 120, 0.75)";
    ctx.lineWidth = 0.22;
    ctx.beginPath();
    ctx.moveTo(0, -1.8 - wobble * 0.2);
    ctx.quadraticCurveTo(-0.6, -2.3, -0.3, -2.8);
    ctx.moveTo(0, -1.8 - wobble * 0.2);
    ctx.quadraticCurveTo(0.6, -2.3, 0.3, -2.8);
    ctx.stroke();
  } else if (variant === "echosprite") {
    const pulse = 0.5 + Math.sin((prey.animTimer || 0) / 65 + wobble) * 0.2;
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = "rgba(158, 201, 255, 0.45)";
    ctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI * 2 * i) / 6;
      const px = Math.cos(angle) * (1.8 + pulse * 0.4);
      const py = Math.sin(angle) * (1.8 + pulse * 0.4);
      ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(0, -1.6);
    ctx.quadraticCurveTo(0.9, -1.9 - wobble * 0.3, 1.1, -0.4);
    ctx.quadraticCurveTo(1.0, 0.9 + wobble * 0.2, 0, 2.0);
    ctx.quadraticCurveTo(-1.0, 0.9 - wobble * 0.2, -1.1, -0.4);
    ctx.quadraticCurveTo(-0.9, -1.9 - wobble * 0.3, 0, -1.6);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(-0.32, -0.4, 0.26, 0.34, 0, 0, Math.PI * 2);
    ctx.ellipse(0.32, -0.4, 0.26, 0.34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2d3f63";
    ctx.beginPath();
    ctx.ellipse(-0.32, -0.4, 0.14, 0.2, 0, 0, Math.PI * 2);
    ctx.ellipse(0.32, -0.4, 0.14, 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#b6d4ff";
    ctx.beginPath();
    ctx.moveTo(-0.4, 0.7);
    ctx.quadraticCurveTo(0, 1.3 + wobble * 0.3, 0.4, 0.7);
    ctx.quadraticCurveTo(0, 1.6, -0.4, 0.7);
    ctx.fill();
  } else {
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(-1.8, -1.4);
    ctx.quadraticCurveTo(0, -2.4 - wobble, 1.8, -1.4);
    ctx.quadraticCurveTo(2.2, 0.6 + wobble, 0, 2.0);
    ctx.quadraticCurveTo(-2.2, 0.6 - wobble, -1.8, -1.4);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-1.1, -0.6, 0.7, 0.7);
    ctx.fillRect(0.4, -0.6, 0.7, 0.7);
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(-0.9, -0.45, 0.3, 0.3);
    ctx.fillRect(0.55, -0.45, 0.3, 0.3);

    ctx.fillStyle = "#3c6a36";
    ctx.beginPath();
    ctx.moveTo(-1.6, 0.4);
    ctx.quadraticCurveTo(0, 1.6 + wobble, 1.6, 0.4);
    ctx.quadraticCurveTo(0.2, 2.4, -1.6, 0.4);
    ctx.fill();
  }

  ctx.restore();

  const baseBarWidth = 34 + Math.max(0, prey.radius - 14) * 1.5;
  const barWidth = Math.max(28, Math.min(52, baseBarWidth));
  const barHeight = 5;
  const healthRatio = Math.max(prey.health / prey.maxHealth, 0);
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(x - barWidth / 2, y - 32, barWidth, barHeight);
  ctx.fillStyle = "#66df81";
  ctx.fillRect(x - barWidth / 2, y - 32, barWidth * healthRatio, barHeight);
}

function drawEnemySprite(enemy, offsetX, offsetY) {
  const x = enemy.x - offsetX;
  const y = enemy.y - offsetY;
  const scale =
    enemy.drawScale ??
    (enemy.behaviour === "titan"
      ? 4.4
      : enemy.behaviour === "brute"
        ? 3.2
        : enemy.behaviour === "sentry"
          ? 3.0
          : 2.6);
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

  const glowPulse = 0.35 + Math.sin(animationTime * 0.005 + (enemy.glowPhase || 0)) * 0.25;
  const glowRadius = (enemy.radius || 18) * (0.55 + glowPulse * 0.25);
  ctx.save();
  ctx.globalAlpha = 0.24 + glowPulse * 0.22;
  ctx.fillStyle = enemy.color || "#f25858";
  ctx.beginPath();
  ctx.ellipse(0, 0, glowRadius, glowRadius, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const walkPhase = ((enemy.walkCycle || 0) / 240) * Math.PI * 2;
  const stepAmount = Math.sin(walkPhase);
  const bobAmount = Math.cos(walkPhase) * 0.22;
  const attackIntensity = Math.min(1, (enemy.attackTimer || 0) / 520);

  ctx.scale(scale, scale);
  ctx.scale(1 + attackIntensity * 0.2, 1 + attackIntensity * 0.14);
  ctx.translate(0, bobAmount * 0.5 - attackIntensity * 0.35);

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  const shadowWidth =
    enemy.shadowWidth ??
    (enemy.behaviour === "titan"
      ? 4.6
      : enemy.behaviour === "brute"
        ? 3.4
        : enemy.behaviour === "sentry"
          ? 3.2
          : 3.0);
  const shadowHeight =
    enemy.shadowHeight ??
    (enemy.behaviour === "titan"
      ? 1.8
      : enemy.behaviour === "brute"
        ? 1.4
        : enemy.behaviour === "sentry"
          ? 1.25
          : 1.2);
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
    ctx.translate(0, torsoBob - (enemy.isLunging ? 0.4 : 0) - attackIntensity * 0.8);
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
    const variant = enemy.variant;
    const time = animationTime * 0.003;
    const wobble = Math.sin(enemy.animTimer / 10) * 0.2;
    const spawnFade = spawnProgress > 0 ? 0.55 + (1 - spawnProgress) * 0.45 : 1;

    const drawDefault = () => {
      const leftStep = stepAmount * 0.32;
      const rightStep = -stepAmount * 0.32;
      ctx.save();
      ctx.globalAlpha *= spawnFade;
      ctx.translate(0, attackIntensity * -0.1);
      ctx.fillStyle = "#3b2610";
      ctx.beginPath();
      ctx.ellipse(0, 0, 2.6, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f79d2a";
      ctx.beginPath();
      ctx.ellipse(0, -0.2, 2.2, 1.8 + wobble * 0.2 + attackIntensity * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#251508";
      ctx.beginPath();
      ctx.moveTo(-1.4, -0.2);
      ctx.lineTo(-0.6, 1.6 + wobble * 0.4 + leftStep * 0.4);
      ctx.lineTo(-2.0, 1.2 + leftStep * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(1.4, -0.2);
      ctx.lineTo(0.6, 1.6 + wobble * 0.4 + rightStep * 0.4);
      ctx.lineTo(2.0, 1.2 + rightStep * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#fcd78e";
      ctx.beginPath();
      ctx.ellipse(-0.6, -1.0, 0.45, 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0.6, -1.0, 0.45, 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1a0d06";
      ctx.beginPath();
      ctx.ellipse(-0.55, -1.0, 0.18, 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0.55, -1.0, 0.18, 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawGnasher = () => {
      const chomp = 0.6 + Math.sin(time * 2.4 + enemy.animTimer * 0.18) * 0.25;
      const bite = chomp + attackIntensity * 0.5;
      const jawDrop = chomp * 0.4 + attackIntensity * 0.35;
      const leftStep = stepAmount * 0.55;
      const rightStep = -stepAmount * 0.55;
      ctx.save();
      ctx.globalAlpha *= spawnFade;
      if (enemy.isLunging) {
        ctx.scale(1.12, 0.9);
      }
      ctx.translate(0, attackIntensity * -0.12);
      ctx.fillStyle = "#2a0406";
      ctx.beginPath();
      ctx.ellipse(0, 0, 2.9, 2.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f24c52";
      ctx.beginPath();
      ctx.ellipse(0, -0.2, 2.5, 2.0 + bite * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#140001";
      ctx.beginPath();
      ctx.moveTo(-2.3, -0.3);
      ctx.quadraticCurveTo(0, 1.2 + bite, 2.3, -0.3);
      ctx.quadraticCurveTo(0, 0.9 + jawDrop, -2.3, -0.5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#fff3e6";
      for (let i = -2; i <= 2; i += 1) {
        const tx = i * 0.65;
        ctx.beginPath();
        ctx.moveTo(tx - 0.22, 0.0);
        ctx.lineTo(tx + 0.22, 0.0);
        ctx.lineTo(tx, 0.65 + bite * 0.45);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = "#ffe7ec";
      ctx.beginPath();
      ctx.ellipse(-1.2, -1.1, 0.6, 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(1.2, -1.1, 0.6, 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#270206";
      ctx.beginPath();
      ctx.ellipse(-1.05, -1.1, 0.22, 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(1.05, -1.1, 0.22, 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath();
      ctx.ellipse(-1.35, -1.25, 0.22, 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(1.35, -1.25, 0.22, 0.18, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#5d0f18";
      for (let i = -3; i <= 3; i += 1) {
        const px = i * 0.5;
        const stepOffset = i < 0 ? leftStep : rightStep;
        ctx.beginPath();
        ctx.moveTo(px, -2.2);
        ctx.lineTo(px + 0.3, -1.5 + stepOffset * 0.25);
        ctx.lineTo(px - 0.3, -1.5 + stepOffset * 0.25);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = "#3c0b12";
      ctx.beginPath();
      ctx.ellipse(-1.6, 1.2 + leftStep * 0.35, 0.6, 1.4 + leftStep * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(1.6, 1.2 + rightStep * 0.35, 0.6, 1.4 - rightStep * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#180305";
      ctx.beginPath();
      ctx.ellipse(-1.6, 2.4 + leftStep * 0.25, 0.65, 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(1.6, 2.4 + rightStep * 0.25, 0.65, 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawStalker = () => {
      const sway = Math.sin(time * 2 + enemy.animTimer * 0.1) * 0.2;
      ctx.save();
      ctx.globalAlpha *= spawnFade;
      ctx.translate(0, sway - attackIntensity * 0.2);
      ctx.fillStyle = "#120724";
      ctx.beginPath();
      ctx.moveTo(0, -2.8);
      ctx.quadraticCurveTo(-1.8, -1.6, -1.4, 0.2);
      ctx.quadraticCurveTo(-1.0, 2.6, -0.2, 3.1);
      ctx.quadraticCurveTo(0.2, 3.3, 0.8, 3.1);
      ctx.quadraticCurveTo(1.6, 1.8, 1.4, -0.2);
      ctx.quadraticCurveTo(1.0, -1.9, 0, -2.8);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#2f1772";
      ctx.beginPath();
      ctx.moveTo(0, -2.2);
      ctx.quadraticCurveTo(-1.0, -1.0, -0.6, 1.2);
      ctx.quadraticCurveTo(-0.2, 2.8, 0.0, 2.9);
      ctx.quadraticCurveTo(0.2, 2.8, 0.6, 1.2);
      ctx.quadraticCurveTo(1.0, -1.0, 0, -2.2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#bca9ff";
      ctx.beginPath();
      ctx.ellipse(-0.6, -1.2, 0.35, 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0.6, -1.2, 0.35, 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0d0618";
      ctx.beginPath();
      ctx.ellipse(-0.5, -1.2, 0.16, 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0.5, -1.2, 0.16, 0.22, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#472497";
      ctx.beginPath();
      ctx.moveTo(-1.8, -0.4 + stepAmount * 0.3);
      ctx.quadraticCurveTo(-3.0, 0.6 + stepAmount * 0.4, -2.8, 1.6 + stepAmount * 0.3);
      ctx.quadraticCurveTo(-2.6, 2.4 + stepAmount * 0.2, -1.6, 2.0);
      ctx.quadraticCurveTo(-0.6, 1.6, -0.8, 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(1.8, -0.4 - stepAmount * 0.3);
      ctx.quadraticCurveTo(3.0, 0.6 - stepAmount * 0.4, 2.8, 1.6 - stepAmount * 0.3);
      ctx.quadraticCurveTo(2.6, 2.4 - stepAmount * 0.2, 1.6, 2.0);
      ctx.quadraticCurveTo(0.6, 1.6, 0.8, 0.2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(210,195,255,0.25)";
      ctx.lineWidth = 0.22;
      ctx.beginPath();
      ctx.moveTo(0, -1.8);
      ctx.quadraticCurveTo(-0.4, -0.6, 0, 1.2);
      ctx.quadraticCurveTo(0.4, -0.6, 0, -1.8);
      ctx.stroke();
      ctx.restore();
    };

    const drawBlightfang = () => {
      const flare = Math.sin(time * 3 + enemy.animTimer * 0.22) * 0.3;
      ctx.save();
      ctx.globalAlpha *= spawnFade;
      ctx.translate(0, attackIntensity * -0.18);
      ctx.fillStyle = "#3a1606";
      ctx.beginPath();
      ctx.ellipse(0, 0.3, 3.0, 2.0, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ff8456";
      ctx.beginPath();
      ctx.moveTo(-2.6, -0.5);
      ctx.quadraticCurveTo(0, -2.4 - flare, 2.6, -0.5);
      ctx.quadraticCurveTo(2.9, 0.6 + flare, 0, 2.2);
      ctx.quadraticCurveTo(-2.9, 0.6 + flare, -2.6, -0.5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#52220b";
      ctx.beginPath();
      ctx.moveTo(-1.8, 0.4 + stepAmount * 0.25);
      ctx.quadraticCurveTo(-2.8, 1.8 + stepAmount * 0.35, -1.8, 2.6 + stepAmount * 0.2);
      ctx.lineTo(-1.2, 1.0);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(1.8, 0.4 - stepAmount * 0.25);
      ctx.quadraticCurveTo(2.8, 1.8 - stepAmount * 0.35, 1.8, 2.6 - stepAmount * 0.2);
      ctx.lineTo(1.2, 1.0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#ffe0c6";
      ctx.beginPath();
      ctx.moveTo(-1.2, -0.8);
      ctx.lineTo(0, 0.4 + flare * 0.5);
      ctx.lineTo(1.2, -0.8);
      ctx.quadraticCurveTo(0, -1.4 - flare * 0.3, -1.2, -0.8);
      ctx.fill();

      ctx.fillStyle = "#2a0b03";
      ctx.beginPath();
      ctx.ellipse(-0.9, -1.3, 0.4, 0.34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0.9, -1.3, 0.4, 0.34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffe6d4";
      ctx.beginPath();
      ctx.moveTo(-0.6, 0.4 + flare * 0.4);
      ctx.lineTo(-0.2, 1.4 + flare * 0.4);
      ctx.lineTo(-1.0, 1.1 + flare * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0.6, 0.4 + flare * 0.4);
      ctx.lineTo(0.2, 1.4 + flare * 0.4);
      ctx.lineTo(1.0, 1.1 + flare * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawVoidreaver = () => {
      const pulse = 0.6 + Math.sin(time * 4 + enemy.animTimer * 0.3) * 0.25;
      ctx.save();
      ctx.globalAlpha *= spawnFade;
      ctx.translate(Math.sin(walkPhase * 0.5) * 0.2, attackIntensity * -0.25);
      ctx.fillStyle = "rgba(20,12,46,0.95)";
      ctx.beginPath();
      ctx.ellipse(0, 0, 2.6, 2.4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = `rgba(72,58,170,${0.3 + pulse * 0.25})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, 2.2 + pulse * 0.6, 2.0 + pulse * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(140,130,255,${0.2 + pulse * 0.2})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, 1.6 + pulse * 0.3, 1.5 + pulse * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = "#0c0216";
      ctx.beginPath();
      ctx.moveTo(-1.6, -0.6);
      ctx.quadraticCurveTo(0, -1.8 - pulse * 0.5, 1.6, -0.6);
      ctx.quadraticCurveTo(0, 0.8 + pulse * 0.6, -1.6, -0.6);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#d6d4ff";
      ctx.beginPath();
      ctx.ellipse(-0.8, -0.8, 0.42, 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0.8, -0.8, 0.42, 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#100622";
      ctx.beginPath();
      ctx.ellipse(-0.68, -0.8, 0.16, 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0.68, -0.8, 0.16, 0.22, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(160,150,255,0.35)";
      ctx.lineWidth = 0.25;
      ctx.beginPath();
      ctx.moveTo(-1.8, 0.6 + stepAmount * 0.2);
      ctx.quadraticCurveTo(-2.8, 1.6 + stepAmount * 0.3, -1.6, 2.4 + stepAmount * 0.25);
      ctx.moveTo(1.8, 0.6 - stepAmount * 0.2);
      ctx.quadraticCurveTo(2.8, 1.6 - stepAmount * 0.3, 1.6, 2.4 - stepAmount * 0.25);
      ctx.stroke();
      ctx.restore();
    };

    const drawDoomclaw = () => {
      const slam = Math.sin(time * 2.2 + enemy.animTimer * 0.16) + attackIntensity * 0.5;
      ctx.save();
      ctx.globalAlpha *= spawnFade;
      ctx.translate(0, attackIntensity * -0.22);
      ctx.fillStyle = "#330615";
      ctx.beginPath();
      ctx.ellipse(0, 0.2, 3.2, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ff4d7a";
      ctx.beginPath();
      ctx.moveTo(-2.8, -1.2);
      ctx.quadraticCurveTo(0, -3.0, 2.8, -1.2);
      ctx.quadraticCurveTo(2.6, 1.4 + slam * 0.4, 0, 2.6);
      ctx.quadraticCurveTo(-2.6, 1.4 + slam * 0.4, -2.8, -1.2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#ffe6f1";
      ctx.beginPath();
      ctx.ellipse(-1.2, -0.5, 0.5, 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(1.2, -0.5, 0.5, 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2d0615";
      ctx.beginPath();
      ctx.ellipse(-1.0, -0.5, 0.2, 0.26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(1.0, -0.5, 0.2, 0.26, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#5a1128";
      ctx.beginPath();
      ctx.moveTo(-2.4, 0.6 + stepAmount * 0.2);
      ctx.lineTo(-3.2, 2.8 + slam * 0.3 + stepAmount * 0.3);
      ctx.lineTo(-1.8, 2.4 + slam * 0.2 + stepAmount * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(2.4, 0.6 - stepAmount * 0.2);
      ctx.lineTo(3.2, 2.8 + slam * 0.3 - stepAmount * 0.3);
      ctx.lineTo(1.8, 2.4 + slam * 0.2 - stepAmount * 0.2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#2f0814";
      ctx.beginPath();
      ctx.moveTo(-0.6, -0.2);
      ctx.lineTo(-0.2, 1.8 + slam * 0.3);
      ctx.lineTo(0.2, 1.8 + slam * 0.3);
      ctx.lineTo(0.6, -0.2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(255,140,180,0.3)";
      ctx.lineWidth = 0.3;
      ctx.beginPath();
      ctx.moveTo(-2.0, -0.8);
      ctx.quadraticCurveTo(0, -1.6 - slam * 0.2, 2.0, -0.8);
      ctx.stroke();
      ctx.restore();
    };

    ctx.save();
    switch (variant) {
      case "gnasher":
        drawGnasher();
        break;
      case "stalker":
        drawStalker();
        break;
      case "blightfang":
        drawBlightfang();
        break;
      case "voidreaver":
        drawVoidreaver();
        break;
      case "doomclaw":
        drawDoomclaw();
        break;
      default:
        ctx.globalAlpha *= spawnFade;
        drawDefault();
        break;
    }
    ctx.restore();
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
          : enemy.variant === "blightfang"
            ? "#ff8456"
            : enemy.variant === "voidreaver"
              ? "#7d7bff"
              : enemy.variant === "doomclaw"
                ? "#ff4d7a"
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

function drawSpellEffects(offsetX, offsetY) {
  spellEffects.forEach((effect) => {
    const baseX = (effect.followPlayer ? player.x : effect.x) - offsetX;
    const baseY = (effect.followPlayer ? player.y : effect.y) - offsetY;
    ctx.save();
    ctx.translate(baseX, baseY);
    switch (effect.type) {
      case "blast": {
        const progress = Math.min(effect.progress || 0, 1);
        const maxRadius = effect.maxRadius || player.attackRange * 2;
        const radius = Math.max(40, maxRadius * (0.35 + 0.65 * progress));
        const inner = radius * 0.35;
        ctx.globalCompositeOperation = "lighter";
        const gradient = ctx.createRadialGradient(0, 0, inner, 0, 0, radius);
        gradient.addColorStop(0, `rgba(249,214,76,${0.55 * (1 - progress * 0.3)})`);
        gradient.addColorStop(0.45, `rgba(249,214,76,${0.3 * (1 - progress)})`);
        gradient.addColorStop(1, "rgba(249,214,76,0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 232, 140, ${0.8 * (1 - progress)})`;
        ctx.lineWidth = 4 + 6 * (1 - progress);
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.82, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
      case "heal": {
        const progress = effect.progress || 0;
        const pulse = Math.sin(progress * Math.PI * 2) * 0.3 + 0.7;
        const radius = 72 + pulse * 26;
        ctx.globalCompositeOperation = "lighter";
        const gradient = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius);
        gradient.addColorStop(0, "rgba(142,249,255,0.6)");
        gradient.addColorStop(0.4, "rgba(142,249,255,0.25)");
        gradient.addColorStop(1, "rgba(142,249,255,0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(142,249,255,0.65)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
      case "haste": {
        const progress = effect.progress || 0;
        const fade = 1 - progress;
        ctx.globalCompositeOperation = "lighter";

        const glow = ctx.createRadialGradient(0, 0, 6, 0, 0, 28);
        glow.addColorStop(0, `rgba(120,255,150,${0.18 * fade})`);
        glow.addColorStop(1, "rgba(120,255,150,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.fill();

        const sparkCount = 14;
        for (let i = 0; i < sparkCount; i += 1) {
          const angle = (Math.PI * 2 * i) / sparkCount + animationTime * 0.01;
          const wobble = Math.sin(animationTime * 0.015 + i) * 3.5;
          const radius = 18 + wobble;
          const sx = Math.cos(angle) * radius;
          const sy = Math.sin(angle) * radius * 0.6;
          const size = 2.2 + Math.sin(animationTime * 0.03 + i) * 0.8;
          ctx.fillStyle = `rgba(180,255,150,${0.6 * fade})`;
          ctx.beginPath();
          ctx.ellipse(sx, sy, size, size * 0.6, angle, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(120,240,120,${0.35 * fade})`;
          ctx.beginPath();
          ctx.ellipse(sx * 0.65, sy * 0.65, size * 0.35, size * 0.2, angle, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case "terrashield": {
        const rootDuration = effect.rootDuration || TERRASHIELD_ROOT_DURATION;
        const elapsed = effect.elapsed || 0;
        const rootPhase = Math.min(elapsed / rootDuration, 1);
        const armorPhase = elapsed > rootDuration ? (elapsed - rootDuration) / Math.max(effect.duration - rootDuration, 1) : 0;

        ctx.globalCompositeOperation = "lighter";

        const baseGlow = ctx.createRadialGradient(0, 0, 10, 0, 0, 44);
        baseGlow.addColorStop(0, `rgba(120,180,120,${0.18 + armorPhase * 0.1})`);
        baseGlow.addColorStop(1, "rgba(60,90,60,0)");
        ctx.fillStyle = baseGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 44, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(110,180,90,${0.45 + armorPhase * 0.35})`;
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.arc(0, 0, 32 + Math.sin(animationTime * 0.004) * 2.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(160,220,120,${0.4 * (1 - armorPhase * 0.4)})`;
        ctx.lineWidth = 2.0;
        const shards = 7;
        for (let i = 0; i < shards; i += 1) {
          const angle = (Math.PI * 2 * i) / shards + animationTime * 0.0025;
          const radius = 20 + Math.sin(animationTime * 0.006 + i) * 4;
          const inner = 8 + rootPhase * 6;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
          ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.9);
          ctx.stroke();
        }

        ctx.strokeStyle = `rgba(255,255,255,${0.25 * (1 - armorPhase)})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, 0, 18 + rootPhase * 6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalCompositeOperation = "source-over";
        break;
      }
      default:
        break;
    }
    ctx.restore();
    ctx.globalCompositeOperation = "source-over";
  });
}

function drawDamageNumbers(offsetX, offsetY) {
  if (damageNumbers.length === 0) return;
  ctx.save();
  ctx.font = "14px 'Press Start 2P', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  damageNumbers.forEach((dmg) => {
    const alpha = Math.max(0, dmg.life / dmg.maxLife);
    ctx.fillStyle = dmg.shadow;
    ctx.globalAlpha = alpha * 0.6;
    ctx.fillText(dmg.value, dmg.x - offsetX, dmg.y - offsetY + 2);
    ctx.fillStyle = dmg.color;
    ctx.globalAlpha = alpha;
    ctx.fillText(dmg.value, dmg.x - offsetX, dmg.y - offsetY);
  });
  ctx.restore();
  ctx.globalAlpha = 1;
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

  const manaBlink =
    0.4 +
    0.6 *
      (0.5 +
        0.5 *
          Math.sin(animationTime * 0.008));
  const healthBlink =
    0.4 +
    0.6 *
      (0.5 +
        0.5 *
          Math.sin(animationTime * 0.008 + Math.PI / 2));
  const spellBlink =
    0.4 +
    0.6 *
      (0.5 +
        0.5 *
          Math.sin(animationTime * 0.006 + Math.PI / 3));

  minimapCtx.save();
  minimapCtx.globalAlpha = manaBlink;
  minimapCtx.fillStyle = "#62f2ff";
  manaDrops.forEach((drop) => {
    minimapCtx.fillRect(drop.x * scaleX - 3, drop.y * scaleY - 3, 6, 6);
  });
  minimapCtx.restore();

  minimapCtx.save();
  minimapCtx.globalAlpha = healthBlink;
  minimapCtx.fillStyle = "#ff6b7d";
  healthDrops.forEach((drop) => {
    minimapCtx.fillRect(drop.x * scaleX - 3, drop.y * scaleY - 3, 6, 6);
  });
  minimapCtx.restore();

  minimapCtx.save();
  minimapCtx.globalAlpha = spellBlink;
  minimapCtx.fillStyle = "#f4a54c";
  spellDrops.forEach((drop) => {
    minimapCtx.fillRect(drop.x * scaleX - 3, drop.y * scaleY - 3, 6, 6);
  });
  minimapCtx.restore();

  meatDrops.forEach((drop) => {
    minimapCtx.fillStyle = MEAT_COLOR;
    minimapCtx.fillRect(drop.x * scaleX - 3, drop.y * scaleY - 3, 6, 6);
  });

  preyList.forEach((prey) => {
    minimapCtx.fillStyle = "#9bff8a";
    minimapCtx.fillRect(prey.x * scaleX - 3, prey.y * scaleY - 3, 6, 6);
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
  ctx.fillText(`HP ${Math.round(player.health)}/${Math.round(player.maxHealth)}`, 24, 32);
  ctx.fillText(`MN ${player.mana.toString().padStart(3, "0")}`, 24, 52);
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

function getNearestPrey(x, y) {
  let closest = null;
  let closestDistance = Infinity;
  for (let i = 0; i < preyList.length; i += 1) {
    const prey = preyList[i];
    if (prey.bonded) continue;
    const distance = Math.hypot(prey.x - x, prey.y - y);
    if (distance < closestDistance) {
      closest = prey;
      closestDistance = distance;
    }
  }
  return closest ? { prey: closest, distance: closestDistance } : null;
}

function attemptConsumePrey(enemy) {
  for (let i = preyList.length - 1; i >= 0; i -= 1) {
    const prey = preyList[i];
    if (prey.bonded) continue;
    const distance = Math.hypot(prey.x - enemy.x, prey.y - enemy.y);
    if (distance < enemy.radius + prey.radius + 6) {
      spawnParticles(prey.x, prey.y, prey.color || "#7befa2", 120, 12);
      enemy.health = Math.min(enemy.maxHealth, enemy.health + ENEMY_PREY_FEAST_HEAL);
      preyList.splice(i, 1);
      break;
    }
  }
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

  const dungeonCenterX = MAP_COLS / 2;
  const dungeonCenterY = MAP_ROWS / 2;
  const smallCandidates = rooms.filter((room) => room.width <= 8 && room.height <= 8);
  let homeRoom = null;
  let homeScore = -Infinity;

  const evaluateSideScore = (room) => {
    const area = room.width * room.height;
    const distance = Math.hypot(room.centerX - dungeonCenterX, room.centerY - dungeonCenterY);
    const edgeDistance = Math.min(
      room.centerX,
      MAP_COLS - room.centerX,
      room.centerY,
      MAP_ROWS - room.centerY,
    );
    const edgeBias = Math.max(0, (MAP_COLS / 2 - edgeDistance) * 0.6);
    const areaBias = Math.max(0, 14 - area) * 0.35;
    return distance * 1.4 + edgeBias + areaBias;
  };

  if (smallCandidates.length > 0) {
    smallCandidates.forEach((room) => {
      const score = evaluateSideScore(room);
      if (score > homeScore) {
        homeScore = score;
        homeRoom = room;
      }
    });
  }

  if (!homeRoom) {
    homeRoom = rooms[0];
    homeScore = -Infinity;
    rooms.forEach((room) => {
      const area = room.width * room.height;
      const distance = Math.hypot(room.centerX - dungeonCenterX, room.centerY - dungeonCenterY);
      const score = area - distance * 1.8;
      if (score > homeScore) {
        homeScore = score;
        homeRoom = room;
      }
    });
  }
  homeRoom.isHome = true;

  rooms.sort((a, b) => a.centerX + a.centerY - (b.centerX + b.centerY));
  for (let i = 1; i < rooms.length; i += 1) connectRooms(grid, rooms[i - 1], rooms[i]);

  rooms.forEach((room, index) => {
    if (room.isHome) return;
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

  const spawnRoom = homeRoom;
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

  function decorateHomeRoom(room) {
    if (!room) return;
    const safeOffset = (value, limit) => Math.max(0.2, Math.min(limit - 0.2, value));
    const toWorld = (offsetX, offsetY) => ({
      x: (room.x + safeOffset(offsetX, room.width) + 0.5) * CELL_SIZE,
      y: (room.y + safeOffset(offsetY, room.height) + 0.5) * CELL_SIZE,
    });

    const centerRug = toWorld(room.width / 2 - 0.3, room.height / 2 - 0.3);
    const roundTable = toWorld(room.width / 2 - 0.25, room.height / 2 - 1.2);
    const frontChair = toWorld(room.width / 2 - 0.2, room.height / 2 + 0.35);
    const leftChair = toWorld(room.width / 2 - 1.35, room.height / 2 - 0.9);
    const rightChair = toWorld(room.width / 2 + 0.95, room.height / 2 - 0.9);
    const lampLeft = toWorld(0.7, 0.5);
    const lampRight = toWorld(room.width - 0.8, 0.5);
    const bedPos = toWorld(0.6, 0.9);
    const potionCorner = toWorld(room.width - 1.1, 0.9);
    const loungePos = toWorld(room.width - 1.2, room.height - 0.7);
    const spellTablePos = toWorld(room.width - 1.2, room.height / 2 - 0.8);
    const scrollTablePos = toWorld(room.width - 1.25, room.height / 2 + 0.8);
    const potionShelfPos = toWorld(0.7, room.height / 2 - 0.3);
    const bookWallPos = toWorld(0.9, room.height - 1.0);
    const cauldronPos = toWorld(room.width - 0.8, room.height / 2 + 0.35);
    const crystalPos = toWorld(room.width / 2 - 0.1, room.height - 1.0);
    const mossHighlights = [toWorld(0.4, 0.3), toWorld(room.width - 0.5, room.height - 0.4)];

    const homeItems = [
      { pos: centerRug, type: "home_rug_grand", speed: 0.18, intensity: 0.55 },
      { pos: roundTable, type: "home_round_table_large", speed: 0.25, intensity: 0.45 },
      { pos: frontChair, type: "home_chair", rotation: Math.PI, speed: 0.18, intensity: 0.4 },
      { pos: leftChair, type: "home_chair", rotation: -Math.PI / 8, speed: 0.18, intensity: 0.4 },
      { pos: rightChair, type: "home_chair", rotation: Math.PI / 8, speed: 0.18, intensity: 0.4 },
      { pos: lampLeft, type: "home_lamp", speed: 0.25, intensity: 0.75 },
      { pos: lampRight, type: "home_lamp", speed: 0.28, intensity: 0.75 },
      { pos: bedPos, type: "home_bed_large", speed: 0.24, intensity: 0.55 },
      { pos: potionCorner, type: "home_potion_table_large", speed: 0.35, intensity: 0.92 },
      { pos: loungePos, type: "home_lounge_large", speed: 0.28, intensity: 0.6 },
      { pos: spellTablePos, type: "home_spell_table", speed: 0.32, intensity: 0.85 },
      { pos: scrollTablePos, type: "home_scroll_table", speed: 0.28, intensity: 0.7 },
      { pos: potionShelfPos, type: "home_potion_shelf", speed: 0.3, intensity: 0.65 },
      { pos: bookWallPos, type: "home_books_large", speed: 0.24, intensity: 0.6 },
      { pos: cauldronPos, type: "home_cauldron", speed: 0.32, intensity: 0.92 },
      { pos: crystalPos, type: "home_crystal_pedestal", speed: 0.28, intensity: 0.8 },
    ];

    homeItems.forEach((item) => {
      decorations.push({
        x: item.pos.x,
        y: item.pos.y,
        type: item.type,
        rotation: item.rotation || 0,
        phase: Math.random() * Math.PI * 2,
        speed: item.speed,
        intensity: item.intensity,
      });
    });

    mossHighlights.forEach((pos) => {
      decorations.push({
        x: pos.x,
        y: pos.y,
        type: "glowing_moss",
        phase: Math.random() * Math.PI * 2,
        speed: 0.25 + Math.random() * 0.2,
        intensity: 0.7,
      });
    });
  }

function createMossField(room) {
  const centerTileX = room.x + 1 + Math.floor(Math.random() * Math.max(1, room.width - 2));
  const centerTileY = room.y + 1 + Math.floor(Math.random() * Math.max(1, room.height - 2));
  const centerX = (centerTileX + 0.5) * CELL_SIZE;
  const centerY = (centerTileY + 0.5) * CELL_SIZE;
  decorations.push({
    x: centerX,
    y: centerY,
    type: "glowing_moss_field",
    phase: Math.random() * Math.PI * 2,
    speed: 0.3 + Math.random() * 0.2,
    intensity: 0.8,
  });
  const clusterCount = 4 + Math.floor(Math.random() * 4);
  for (let i = 0; i < clusterCount; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const distance = CELL_SIZE * 0.4 + Math.random() * CELL_SIZE * 0.6;
    decorations.push({
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
      type: "glowing_moss",
      phase: Math.random() * Math.PI * 2,
      speed: 0.25 + Math.random() * 0.2,
      intensity: 0.65 + Math.random() * 0.2,
    });
  }
}

  rooms.forEach((room) => {
    if (room.isHome) return;
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
    if (Math.random() < 0.25) {
      createMossField(room);
    }
  });

  rooms.forEach((room) => {
    if (room.isHome) return;
    const mossCount = 1 + Math.floor(Math.random() * 2);
    let placed = 0;
    let attempts = 0;
    while (placed < mossCount && attempts < 12) {
      const vertical = Math.random() < 0.5;
      let tileX;
      let tileY;
      const leftWall = room.x + Math.min(room.width - 1, 1);
      const rightWall = room.x + Math.max(1, room.width - 2);
      const topWall = room.y + Math.min(room.height - 1, 1);
      const bottomWall = room.y + Math.max(1, room.height - 2);
      if (vertical) {
        tileX = Math.random() < 0.5 ? leftWall : rightWall;
        tileY = room.y + 1 + Math.floor(Math.random() * Math.max(1, room.height - 2));
      } else {
        tileY = Math.random() < 0.5 ? topWall : bottomWall;
        tileX = room.x + 1 + Math.floor(Math.random() * Math.max(1, room.width - 2));
      }
      if (
        placeDecoration(tileX, tileY, "glowing_moss", {
          minDistance: CELL_SIZE * 0.6,
          minOpenNeighbors: 3,
        })
      ) {
        placed += 1;
      }
      attempts += 1;
    }
  });

  rooms.forEach((room) => {
    if (room.isHome) return;
    const vineAttempts = 1 + Math.floor(Math.random() * 2);
    let attempts = 0;
    let placed = 0;
    while (attempts < 10 && placed < vineAttempts) {
      const placeTop = Math.random() < 0.5;
      const tileX = room.x + 1 + Math.floor(Math.random() * Math.max(1, room.width - 2));
      const tileY = placeTop ? room.y + 1 : room.y + Math.max(1, room.height - 2);
      if (
        placeDecoration(tileX, tileY, "hanging_vine", {
          minDistance: CELL_SIZE * 0.75,
          minOpenNeighbors: 3,
        })
      ) {
        placed += 1;
      }
      attempts += 1;
    }
  });

  const runeTypes = ["floor_rune_ember", "floor_rune_tide", "floor_rune_verdant"];
  const runeTarget = 3 + Math.floor(Math.random() * 3);
  let runePlaced = 0;
  let runeAttempts = 0;
  while (runePlaced < runeTarget && runeAttempts < 80) {
    const room = rooms[Math.floor(Math.random() * rooms.length)];
    if (!room || room.isHome) {
      runeAttempts += 1;
      continue;
    }
    const tileX = room.x + 1 + Math.floor(Math.random() * Math.max(1, room.width - 2));
    const tileY = room.y + 1 + Math.floor(Math.random() * Math.max(1, room.height - 2));
    if (
      placeDecoration(tileX, tileY, runeTypes[Math.floor(Math.random() * runeTypes.length)], {
        minDistance: CELL_SIZE * 2.0,
        minOpenNeighbors: 5,
      })
    ) {
      runePlaced += 1;
    }
    runeAttempts += 1;
  }

  decorateHomeRoom(homeRoom);

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
    if (
      manaUsedPositions.has(key) ||
      healthUsedPositions.has(key) ||
      meatUsedPositions.has(key) ||
      spellUsedPositions.has(key)
    ) {
      continue;
    }
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

function assignWanderTarget(enemy) {
  const baseRoom = enemy.homeRoom || getRoomAt(Math.floor(enemy.x / CELL_SIZE), Math.floor(enemy.y / CELL_SIZE));
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const angle = Math.random() * Math.PI * 2;
    const distance = CELL_SIZE * (1.6 + Math.random() * 2.4);
    const candidateX = (baseRoom.centerX * CELL_SIZE) + Math.cos(angle) * distance;
    const candidateY = (baseRoom.centerY * CELL_SIZE) + Math.sin(angle) * distance;
    if (isWalkable(candidateX, candidateY, enemy.radius, enemy.collisionShrink ?? 0.65)) {
      enemy.wanderTarget = { x: candidateX, y: candidateY };
      return;
    }
  }
  enemy.wanderTarget = {
    x: enemy.x + (Math.random() - 0.5) * CELL_SIZE * 2,
    y: enemy.y + (Math.random() - 0.5) * CELL_SIZE * 2,
  };
}

function setPreyPatrolTarget(prey) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const angle = Math.random() * Math.PI * 2;
    const distance = PREY_PATROL_DISTANCE + Math.random() * PREY_PATROL_SPREAD;
    const candidateX = prey.x + Math.cos(angle) * distance;
    const candidateY = prey.y + Math.sin(angle) * distance;
    if (isWalkable(candidateX, candidateY, prey.radius)) {
      prey.targetX = candidateX;
      prey.targetY = candidateY;
      return;
    }
  }
  prey.targetX = prey.x;
  prey.targetY = prey.y;
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
  shareCtx.fillText(`Mana ${player.mana.toString().padStart(3, "0")}`, width / 2, 240);
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
    case "1":
      useSpell(0);
      break;
    case "2":
      useSpell(1);
      break;
    case "3":
      useSpell(2);
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
if (startOverlay) {
  startOverlay.setAttribute("aria-hidden", "false");
}
if (startBtn) {
  startBtn.addEventListener("click", startGame);
}
if (shareBtn) shareBtn.addEventListener("click", downloadShareImage);

window.addEventListener("resize", () => {
  isMobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 768;
  setupMobile();
  updateCanvasSize();
});

init();
