import * as THREE from "three";

const TARGET_SCORE = 700;
const TARGET_HITS = 35;
const ARENA_SIZE = 52;
const PLAYER_SPEED = 5.4;
const PLAYER_ACCEL = 38;
const PLAYER_FRICTION = 14;
const JOYSTICK_DEADZONE = 0.18;
const PLAYER_FIRE_RATE = 95;
const PLAYER_SHOT_SPEED = 44;
const DASH_SPEED = 14;
const DASH_DURATION = 0.18;
const DASH_COOLDOWN = 1.4;
const GRENADE_COOLDOWN = 10;
const GRENADE_RADIUS = 6;
const GRENADE_SPEED = 22;
const SHIELD_COOLDOWN = 18;
const SHIELD_DURATION = 3.5;
const ENEMY_LIMIT = 10;
const PLAYER_START = new THREE.Vector3(0, 0, 14);

const isPhone = Math.min(window.innerWidth, window.innerHeight) < 720
  || /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
if (isPhone) document.body.classList.add("phone");

const QUALITY = {
  pixelRatioCap: isPhone ? 1.0 : 1.4,
  starsMultiplier: isPhone ? 0.45 : 1,
  asteroidCount: isPhone ? 6 : 14,
  nebulaCount: isPhone ? 4 : 10,
  burstParticles: isPhone ? 0.55 : 1,
  maxParticles: isPhone ? 90 : 220,
  sphereSegmentsLow: isPhone ? 16 : 24,
  sphereSegmentsHi: isPhone ? 22 : 32,
};
const SEGEL_DATA = {
  "א": {
    names: ["עידן", "דביר", "איה", "מיכאל", "עלמה", "עדי", "אורי", "שאבון"],
    winner: "עדי",
  },
  "ב": {
    names: ["ליה", "ינאי", "זוהר", "איתי", "חן", "ליאור", "רון", "רותם"],
    winner: "ליאור",
  },
};
const WHEEL_COLORS = ["#5de7ff", "#80ffb3", "#ffd45c", "#ff66bd", "#9f8cff", "#ff8d5c", "#a7f3d0", "#f9a8d4"];

const assets = {
  geometries: {
    alienBody: new THREE.CapsuleGeometry(0.32, 0.42, 8, 12),
    alienHead: new THREE.SphereGeometry(0.74, 36, 28),
    alienChin: new THREE.SphereGeometry(0.5, 24, 18),
    alienEye: new THREE.SphereGeometry(0.18, 24, 16),
    eyeGlint: new THREE.SphereGeometry(0.045, 10, 8),
    antenna: new THREE.SphereGeometry(0.055, 10, 8),
    blaster: new THREE.BoxGeometry(0.16, 0.2, 0.82),
    ufoHull: new THREE.SphereGeometry(1, 24, 10),
    ufoDome: new THREE.SphereGeometry(0.58, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    ufoBeam: new THREE.ConeGeometry(0.72, 1.65, 18, 1, true),
    ufoRim: new THREE.TorusGeometry(1.14, 0.055, 8, 40),
    ufoLight: new THREE.SphereGeometry(0.08, 8, 6),
    playerShot: new THREE.CapsuleGeometry(0.1, 1.85, 6, 8),
    enemyShot: new THREE.CapsuleGeometry(0.14, 0.84, 6, 8),
    particle: new THREE.SphereGeometry(0.1, 8, 6),
    flash: new THREE.SphereGeometry(0.22, 10, 8),
    targetRing: new THREE.RingGeometry(1.55, 1.72, 36),
    shockwave: new THREE.RingGeometry(0.6, 0.78, 48),
    trail: new THREE.SphereGeometry(0.07, 6, 5),
  },
  materials: {
    alienSkin: new THREE.MeshStandardMaterial({ color: 0xb6e8a3, roughness: 0.55, metalness: 0.02 }),
    alienEye: new THREE.MeshStandardMaterial({ color: 0x07090f, roughness: 0.18, metalness: 0.1 }),
    alienGlint: new THREE.MeshBasicMaterial({ color: 0xffffff }),
    alienSuit: new THREE.MeshStandardMaterial({ color: 0x26315d, roughness: 0.52, metalness: 0.14 }),
    laserCannon: new THREE.MeshStandardMaterial({ color: 0x5de7ff, emissive: 0x1cb8ce, emissiveIntensity: 0.9 }),
    ufoMetal: new THREE.MeshStandardMaterial({ color: 0xd6e0ec, roughness: 0.26, metalness: 0.58 }),
    ufoDome: new THREE.MeshStandardMaterial({
      color: 0x5de7ff,
      emissive: 0x168b98,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.84,
    }),
    ufoBeam: new THREE.MeshBasicMaterial({ color: 0x80ffb3, transparent: true, opacity: 0.16, side: THREE.DoubleSide }),
    ufoRim: new THREE.MeshBasicMaterial({ color: 0xffd45c }),
    ufoLights: WHEEL_COLORS.map((color) => new THREE.MeshBasicMaterial({ color })),
    playerShot: new THREE.MeshBasicMaterial({ color: 0x6ff3ff }),
    enemyShot: new THREE.MeshBasicMaterial({ color: 0xff66bd }),
    hitFx: new THREE.MeshBasicMaterial({ color: 0x80ffb3, transparent: true, opacity: 0.86 }),
    hurtFx: new THREE.MeshBasicMaterial({ color: 0xff66bd, transparent: true, opacity: 0.86 }),
    flashFx: new THREE.MeshBasicMaterial({ color: 0xfff3a8, transparent: true, opacity: 0.9 }),
    targetRing: new THREE.MeshBasicMaterial({ color: 0xffd45c, transparent: true, opacity: 0.72, side: THREE.DoubleSide }),
    shockwave: new THREE.MeshBasicMaterial({ color: 0x9ff7d4, transparent: true, opacity: 0.9, side: THREE.DoubleSide }),
    trailFx: new THREE.MeshBasicMaterial({ color: 0x6ff3ff, transparent: true, opacity: 0.85 }),
  },
};

const ui = {
  canvas: document.querySelector("#game-canvas"),
  score: document.querySelector("#score"),
  hits: document.querySelector("#hits"),
  hearts: document.querySelector("#hearts"),
  progress: document.querySelector("#progress-bar"),
  toast: document.querySelector("#toast"),
  floatingText: document.querySelector("#floating-text"),
  startScreen: document.querySelector("#start-screen"),
  celebrationScreen: document.querySelector("#celebration-screen"),
  partyAnimals: document.querySelector("#party-animals"),
  partyConfetti: document.querySelector("#party-confetti"),
  choiceScreen: document.querySelector("#choice-screen"),
  endScreen: document.querySelector("#end-screen"),
  choiceA: document.querySelector("#choice-a"),
  choiceB: document.querySelector("#choice-b"),
  winnerMessage: document.querySelector("#winner-message"),
  startButton: document.querySelector("#start-button"),
  restartButton: document.querySelector("#restart-button"),
  spinButton: document.querySelector("#spin-button"),
  wheel: document.querySelector("#wheel"),
  wheelStage: document.querySelector(".wheel-stage"),
  winnerReveal: document.querySelector("#winner-reveal"),
  winnerName: document.querySelector("#winner-name"),
  fireworks: document.querySelector("#fireworks"),
  joystick: document.querySelector("#joystick"),
  stick: document.querySelector("#stick"),
  fireButton: document.querySelector("#fire-button"),
  grenadeButton: document.querySelector("#grenade-button"),
  shieldButton: document.querySelector("#shield-button"),
  grenadeCd: document.querySelector("#grenade-cd"),
  shieldCd: document.querySelector("#shield-cd"),
};

const state = {
  mode: "start",
  score: 0,
  hits: 0,
  lives: 6,
  invincibleFor: 0,
  lastShotAt: 0,
  fireHeld: false,
  joystickPointerId: null,
  joystick: new THREE.Vector2(),
  keyboard: new Set(),
  wheelSpun: false,
  velocity: new THREE.Vector3(),
  dashTimer: 0,
  dashCooldown: 0,
  dashDirection: new THREE.Vector3(0, 0, -1),
  shotSide: 1,
  shake: { intensity: 0, duration: 0 },
  recoil: 0,
  hitStop: 0,
  combo: 0,
  comboTimer: 0,
  activeSegel: null,
  grenadeCooldown: 0,
  shieldCooldown: 0,
  shieldUntil: 0,
};

const world = {
  scene: null,
  camera: null,
  renderer: null,
  clock: new THREE.Clock(),
  player: null,
  playerModel: null,
  playerRing: null,
  targetRing: null,
  aimTarget: null,
  nextSpawnAt: 0,
  ufoPool: [],
  particlePool: [],
  shotPools: {
    player: [],
    enemy: [],
  },
  enemies: [],
  playerShots: [],
  enemyShots: [],
  particles: [],
  dyingUfos: [],
  shockwaves: [],
  grenades: [],
  shieldMesh: null,
  covers: [],
  lanes: [
    [-16, -14], [-9, -18], [-2, -20], [6, -19], [13, -15], [17, -7], [-17, -5],
    [0, -10], [-12, -7], [9, -8], [-6, -22], [3, -22],
  ],
};

bootstrap();

function bootstrap() {
  buildRenderer();
  buildScene();
  buildWheel();
  bindEvents();
  resetGame();
  setMode("start");
  animate();
}

function buildRenderer() {
  world.scene = new THREE.Scene();
  world.scene.background = new THREE.Color(0x05071a);
  world.scene.fog = new THREE.Fog(0x0a0c24, 38, 95);

  world.camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 160);
  world.renderer = new THREE.WebGLRenderer({
    canvas: ui.canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  world.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, QUALITY.pixelRatioCap));
  world.renderer.setSize(window.innerWidth, window.innerHeight);
  world.renderer.shadowMap.enabled = false;
}

function buildScene() {
  const hemi = new THREE.HemisphereLight(0xb7f6ff, 0x28305f, 1.35);
  world.scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 1.55);
  key.position.set(10, 22, 12);
  world.scene.add(key);

  const fill = new THREE.PointLight(0xff66bd, 1.2, 28);
  fill.position.set(-12, 7, 8);
  world.scene.add(fill);

  const floorTexture = makeFloorTexture();
  const arenaSegments = isPhone ? 56 : 96;
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(ARENA_SIZE * 0.85, arenaSegments),
    new THREE.MeshStandardMaterial({
      map: floorTexture,
      color: 0x1a2049,
      roughness: 0.78,
      metalness: 0.32,
      emissive: 0x1a2a55,
      emissiveIntensity: 0.18,
    })
  );
  floor.rotation.x = -Math.PI / 2;
  world.scene.add(floor);

  const arenaInner = new THREE.Mesh(
    new THREE.RingGeometry(ARENA_SIZE * 0.83, ARENA_SIZE * 0.86, arenaSegments),
    new THREE.MeshBasicMaterial({ color: 0x6bf0ff, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
  );
  arenaInner.rotation.x = -Math.PI / 2;
  arenaInner.position.y = 0.02;
  world.scene.add(arenaInner);

  const arenaGlow = new THREE.Mesh(
    new THREE.RingGeometry(ARENA_SIZE * 0.86, ARENA_SIZE * 0.94, arenaSegments),
    new THREE.MeshBasicMaterial({ color: 0x9b88ff, transparent: true, opacity: 0.22, side: THREE.DoubleSide })
  );
  arenaGlow.rotation.x = -Math.PI / 2;
  arenaGlow.position.y = 0.015;
  world.scene.add(arenaGlow);

  for (let i = 0; i < 12; i += 1) {
    const angle = (i / 12) * Math.PI * 2;
    const beacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.22, 1.1, 8),
      new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x6bf0ff : 0xff66bd,
      })
    );
    beacon.position.set(
      Math.cos(angle) * ARENA_SIZE * 0.85,
      0.55,
      Math.sin(angle) * ARENA_SIZE * 0.85
    );
    world.scene.add(beacon);
  }

  const grid = new THREE.GridHelper(ARENA_SIZE * 1.7, 32, 0x6bf0ff, 0x2a3878);
  grid.material.transparent = true;
  grid.material.opacity = 0.18;
  grid.position.y = 0.005;
  world.scene.add(grid);

  addStars();
  addNebula();
  addPlanets();
  addAsteroids();
  addCoverBlocks();

  world.player = new THREE.Group();
  world.playerModel = createAlien();
  world.player.add(world.playerModel);
  world.scene.add(world.player);

  world.playerRing = new THREE.Mesh(
    new THREE.RingGeometry(0.92, 1.04, 48),
    new THREE.MeshBasicMaterial({ color: 0x80ffb3, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
  );
  world.playerRing.rotation.x = -Math.PI / 2;
  world.scene.add(world.playerRing);

  world.targetRing = new THREE.Mesh(assets.geometries.targetRing, assets.materials.targetRing);
  world.targetRing.rotation.x = -Math.PI / 2;
  world.targetRing.visible = false;
  world.scene.add(world.targetRing);
}

function addStars() {
  const m = QUALITY.starsMultiplier;
  const layers = [
    { count: Math.round(520 * m), color: 0xfff8e8, size: 0.11, spread: 130 },
    { count: Math.round(280 * m), color: 0x9ed8ff, size: 0.07, spread: 150 },
    { count: Math.round(160 * m), color: 0xffd9a8, size: 0.13, spread: 110 },
    { count: Math.round(100 * m), color: 0xff9ec7, size: 0.09, spread: 160 },
  ];
  for (const layer of layers) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < layer.count; i += 1) {
      positions.push(
        (Math.random() - 0.5) * layer.spread,
        Math.random() * 60 + 6,
        (Math.random() - 0.5) * layer.spread
      );
    }
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    const points = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: layer.color,
        size: layer.size,
        transparent: true,
        opacity: 0.92,
        sizeAttenuation: true,
      })
    );
    world.scene.add(points);
  }
}

function addNebula() {
  const cloudTexture = makeCloudTexture();
  const palette = [0xff66bd, 0x5de7ff, 0x9f8cff, 0x80ffb3];
  const count = QUALITY.nebulaCount;
  for (let i = 0; i < count; i += 1) {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: cloudTexture,
        color: palette[i % palette.length],
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6;
    const radius = 55 + Math.random() * 25;
    sprite.position.set(
      Math.cos(angle) * radius,
      14 + Math.random() * 32,
      Math.sin(angle) * radius
    );
    const scale = 28 + Math.random() * 18;
    sprite.scale.set(scale, scale, 1);
    world.scene.add(sprite);
  }
}

function makeFloorTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");

  const bg = ctx.createRadialGradient(size / 2, size / 2, 30, size / 2, size / 2, size / 2);
  bg.addColorStop(0, "#1d2658");
  bg.addColorStop(0.55, "#141a3e");
  bg.addColorStop(1, "#0a0d24");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = "rgba(107, 240, 255, 0.32)";
  ctx.lineWidth = 1.5;
  for (let r = 30; r < size / 2; r += 28) {
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(159, 140, 255, 0.42)";
  ctx.lineWidth = 1;
  const spokes = 12;
  for (let i = 0; i < spokes; i += 1) {
    const a = (i / spokes) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(size / 2 + Math.cos(a) * 30, size / 2 + Math.sin(a) * 30);
    ctx.lineTo(size / 2 + Math.cos(a) * (size / 2 - 6), size / 2 + Math.sin(a) * (size / 2 - 6));
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255, 212, 92, 0.85)";
  for (let i = 0; i < spokes; i += 1) {
    const a = (i / spokes) * Math.PI * 2;
    for (let r = 60; r < size / 2; r += 56) {
      ctx.beginPath();
      ctx.arc(size / 2 + Math.cos(a) * r, size / 2 + Math.sin(a) * r, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const ringGlow = ctx.createRadialGradient(size / 2, size / 2, size * 0.42, size / 2, size / 2, size / 2);
  ringGlow.addColorStop(0, "rgba(107, 240, 255, 0)");
  ringGlow.addColorStop(0.85, "rgba(107, 240, 255, 0.4)");
  ringGlow.addColorStop(1, "rgba(155, 136, 255, 0.7)");
  ctx.fillStyle = ringGlow;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function makeCloudTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(128, 128, 8, 128, 128, 124);
  gradient.addColorStop(0, "rgba(255,255,255,0.95)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.45)");
  gradient.addColorStop(0.7, "rgba(255,255,255,0.12)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function addAsteroids() {
  const count = QUALITY.asteroidCount;
  const material = new THREE.MeshStandardMaterial({
    color: 0x484e6e,
    roughness: 0.9,
    metalness: 0.18,
    flatShading: true,
  });
  world.asteroids = [];
  for (let i = 0; i < count; i += 1) {
    const r = 0.7 + Math.random() * 1.3;
    const geo = new THREE.IcosahedronGeometry(r, 0);
    const ast = new THREE.Mesh(geo, material);
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const dist = 36 + Math.random() * 18;
    ast.position.set(Math.cos(angle) * dist, 8 + Math.random() * 22, Math.sin(angle) * dist);
    ast.userData.spin = new THREE.Vector3(
      (Math.random() - 0.5) * 0.6,
      (Math.random() - 0.5) * 0.6,
      (Math.random() - 0.5) * 0.6
    );
    ast.userData.orbit = (Math.random() - 0.5) * 0.05;
    ast.userData.angle = angle;
    ast.userData.radius = dist;
    ast.userData.height = ast.position.y;
    world.asteroids.push(ast);
    world.scene.add(ast);
  }
}

function addPlanets() {
  const ringedPlanet = new THREE.Group();
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(5.5, 28, 22),
    new THREE.MeshStandardMaterial({
      color: 0xff8d5c,
      emissive: 0x4a1e10,
      emissiveIntensity: 0.4,
      roughness: 0.85,
    })
  );
  ringedPlanet.add(planet);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(7.2, 9.4, 80),
    new THREE.MeshBasicMaterial({
      color: 0xffd45c,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    })
  );
  ring.rotation.x = -Math.PI / 2.2;
  ring.rotation.z = 0.3;
  ringedPlanet.add(ring);
  ringedPlanet.position.set(-44, 30, -58);
  world.scene.add(ringedPlanet);
  world.planet = ringedPlanet;

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(2.6, 22, 18),
    new THREE.MeshStandardMaterial({
      color: 0xa7b9ff,
      emissive: 0x182146,
      emissiveIntensity: 0.5,
      roughness: 0.9,
    })
  );
  moon.position.set(38, 22, -52);
  world.scene.add(moon);
  world.moon = moon;

  const distantStarSphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 18, 14),
    new THREE.MeshBasicMaterial({ color: 0xfff3c8 })
  );
  distantStarSphere.position.set(0, 48, -78);
  world.scene.add(distantStarSphere);
}

function addCoverBlocks() {
  const crystalMaterial = new THREE.MeshStandardMaterial({
    color: 0x6a4cff,
    emissive: 0x382080,
    emissiveIntensity: 0.55,
    roughness: 0.32,
    metalness: 0.4,
    flatShading: true,
  });
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x252b54,
    roughness: 0.85,
    metalness: 0.18,
    flatShading: true,
  });

  const placements = [
    { x: -10, z: -2, scale: 1.0, rot: 0.2, color: 0x6a4cff, emissive: 0x382080 },
    { x: 9, z: -4, scale: 1.15, rot: -0.35, color: 0x4cffd0, emissive: 0x0a5a4a },
    { x: -14, z: 8, scale: 0.85, rot: -0.2, color: 0xff66bd, emissive: 0x6a1c4a },
    { x: 13, z: 9, scale: 0.95, rot: 0.25, color: 0xffd45c, emissive: 0x6a4a14 },
    { x: 0, z: 4, scale: 1.05, rot: 0, color: 0x5de7ff, emissive: 0x0a4a66 },
    { x: -6, z: -10, scale: 0.8, rot: 0.6, color: 0x9f8cff, emissive: 0x382080 },
    { x: 7, z: -12, scale: 0.9, rot: -0.5, color: 0x80ffb3, emissive: 0x14613e },
  ];

  placements.forEach(({ x, z, scale, rot, color, emissive }) => {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rot;

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0 * scale, 1.4 * scale, 0.35, 8),
      baseMaterial
    );
    base.position.y = 0.18;
    group.add(base);

    const crystalMat = crystalMaterial.clone();
    crystalMat.color.setHex(color);
    crystalMat.emissive.setHex(emissive);
    crystalMat.transparent = true;
    crystalMat.opacity = 0.92;

    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.05 * scale, 0),
      crystalMat
    );
    crystal.scale.set(0.85, 1.55, 0.85);
    crystal.position.y = 1.45 * scale;
    crystal.rotation.y = Math.random() * Math.PI;
    group.add(crystal);

    const shard1 = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.45 * scale, 0),
      crystalMat
    );
    shard1.scale.set(0.6, 1.1, 0.6);
    shard1.position.set(0.6 * scale, 0.85, 0.4 * scale);
    shard1.rotation.set(0.3, 0.6, -0.2);
    group.add(shard1);

    const shard2 = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.35 * scale, 0),
      crystalMat
    );
    shard2.scale.set(0.55, 0.9, 0.55);
    shard2.position.set(-0.55 * scale, 0.7, -0.5 * scale);
    shard2.rotation.set(-0.2, -0.4, 0.3);
    group.add(shard2);

    const glowRing = new THREE.Mesh(
      new THREE.RingGeometry(1.1 * scale, 1.35 * scale, 24),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.42, side: THREE.DoubleSide })
    );
    glowRing.rotation.x = -Math.PI / 2;
    glowRing.position.y = 0.04;
    group.add(glowRing);

    group.userData.radius = 1.25 * scale;
    group.userData.crystal = crystal;
    group.userData.basePulse = Math.random() * Math.PI * 2;
    world.covers.push(group);
    world.scene.add(group);
  });
}

function createAlien() {
  const alien = new THREE.Group();

  const body = new THREE.Mesh(assets.geometries.alienBody, assets.materials.alienSkin);
  body.position.y = 0.55;
  body.scale.set(0.85, 0.85, 0.85);
  alien.add(body);

  const head = new THREE.Mesh(assets.geometries.alienHead, assets.materials.alienSkin);
  head.scale.set(1.05, 1.28, 1.0);
  head.position.y = 1.5;
  alien.add(head);

  const chin = new THREE.Mesh(assets.geometries.alienChin, assets.materials.alienSkin);
  chin.scale.set(0.82, 0.62, 0.82);
  chin.position.set(0, 1.05, 0.05);
  alien.add(chin);

  for (const sign of [-1, 1]) {
    const eye = new THREE.Mesh(assets.geometries.alienEye, assets.materials.alienEye);
    eye.scale.set(0.95, 2.0, 0.4);
    eye.position.set(sign * 0.28, 1.5, 0.62);
    eye.rotation.z = sign * 0.5;
    alien.add(eye);

    const glint = new THREE.Mesh(assets.geometries.eyeGlint, assets.materials.alienGlint);
    glint.position.set(sign * 0.32, 1.66, 0.78);
    alien.add(glint);
  }

  const blaster = new THREE.Mesh(assets.geometries.blaster, assets.materials.laserCannon);
  blaster.position.set(0.5, 0.85, 0.45);
  alien.add(blaster);

  return alien;
}

function createUfo(x, z) {
  let ufo = world.ufoPool.pop();

  if (!ufo) {
    ufo = new THREE.Group();

    const hull = new THREE.Mesh(assets.geometries.ufoHull, assets.materials.ufoMetal);
    hull.scale.set(1.55, 0.24, 1.55);
    ufo.add(hull);

    const dome = new THREE.Mesh(assets.geometries.ufoDome, assets.materials.ufoDome);
    dome.position.y = 0.18;
    ufo.add(dome);

    const rim = new THREE.Mesh(assets.geometries.ufoRim, assets.materials.ufoRim);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -0.02;
    ufo.add(rim);

    const beam = new THREE.Mesh(assets.geometries.ufoBeam, assets.materials.ufoBeam);
    beam.position.y = -0.82;
    beam.rotation.x = Math.PI;
    ufo.add(beam);

    for (let i = 0; i < 6; i += 1) {
      const light = new THREE.Mesh(
        assets.geometries.ufoLight,
        assets.materials.ufoLights[i % assets.materials.ufoLights.length]
      );
      const angle = (i / 6) * Math.PI * 2;
      light.position.set(Math.cos(angle) * 1.14, -0.08, Math.sin(angle) * 1.14);
      ufo.add(light);
    }
  }

  const roleRoll = Math.random();
  let role = "hunter";
  if (roleRoll < 0.25) role = "scout";
  else if (roleRoll < 0.5) role = "sniper";
  else if (roleRoll < 0.7) role = "swooper";

  ufo.visible = true;
  ufo.scale.setScalar(1);
  ufo.rotation.set(0, 0, 0);
  ufo.position.set(x, 2.6 + Math.random() * 0.9, z);
  ufo.userData = {
    role,
    radius: role === "scout" ? 1.7 : 2.05,
    baseY: ufo.position.y,
    phase: Math.random() * Math.PI * 2,
    shootIn: 1.6 + Math.random() * 1.6,
    burstLeft: 0,
    burstCooldown: 0,
    swoopTimer: 4 + Math.random() * 3,
    swooping: 0,
    strafeDir: Math.random() < 0.5 ? -1 : 1,
    strafeSwap: 1.5 + Math.random() * 1.5,
    drift: new THREE.Vector3((Math.random() - 0.5) * 0.4, 0, (Math.random() - 0.5) * 0.35),
  };
  if (role === "scout") ufo.scale.setScalar(0.78);
  world.scene.add(ufo);
  return ufo;
}

function recycleUfo(ufo) {
  world.scene.remove(ufo);
  ufo.visible = false;
  world.ufoPool.push(ufo);
}

function bindEvents() {
  ui.startButton.addEventListener("click", () => startGame());
  ui.restartButton.addEventListener("click", () => startGame());
  ui.spinButton.addEventListener("click", spinWheel);
  ui.choiceA.addEventListener("click", () => chooseSegel("א"));
  ui.choiceB.addEventListener("click", () => chooseSegel("ב"));

  ui.fireButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    ui.fireButton.setPointerCapture(event.pointerId);
    state.fireHeld = true;
    document.body.classList.add("firing");
    shoot();
  });

  ui.fireButton.addEventListener("pointerup", stopFire);
  ui.fireButton.addEventListener("pointercancel", stopFire);

  ui.grenadeButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    throwGrenade();
  });
  ui.shieldButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    activateShield();
  });
  window.addEventListener("pointerup", releaseJoystick);
  window.addEventListener("pointercancel", releaseJoystick);

  let lastJoyTap = 0;
  ui.joystick.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    state.joystickPointerId = event.pointerId;
    ui.joystick.setPointerCapture(event.pointerId);
    updateJoystick(event);
    const now = performance.now();
    if (now - lastJoyTap < 280) tryDash();
    lastJoyTap = now;
  });
  ui.joystick.addEventListener("pointermove", (event) => {
    if (event.pointerId === state.joystickPointerId) updateJoystick(event);
  });

  window.addEventListener("keydown", (event) => {
    state.keyboard.add(event.key.toLowerCase());
    if (event.code === "Space") {
      event.preventDefault();
      state.fireHeld = true;
      document.body.classList.add("firing");
      shoot();
    }
    if (event.code === "ShiftLeft" || event.code === "ShiftRight" || event.key === "Shift") {
      event.preventDefault();
      tryDash();
    }
    if (event.key === "g" || event.key === "G") {
      event.preventDefault();
      throwGrenade();
    }
    if (event.key === "e" || event.key === "E") {
      event.preventDefault();
      activateShield();
    }
  });
  window.addEventListener("keyup", (event) => {
    state.keyboard.delete(event.key.toLowerCase());
    if (event.code === "Space") stopFire();
  });
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      state.fireHeld = false;
      document.body.classList.remove("firing");
      resetJoystick();
    }
  });

  document.addEventListener("gesturestart", (e) => e.preventDefault());
  document.addEventListener("gesturechange", (e) => e.preventDefault());
  document.addEventListener("gestureend", (e) => e.preventDefault());
  let lastTouchEnd = 0;
  document.addEventListener("touchend", (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 350) event.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });
  document.addEventListener("touchmove", (event) => {
    if (event.touches.length > 1) event.preventDefault();
  }, { passive: false });
  document.addEventListener("dblclick", (e) => e.preventDefault());
  document.addEventListener("contextmenu", (e) => e.preventDefault());
}

function startGame() {
  resetGame();
  setMode("playing");
}

function resetGame() {
  state.score = 0;
  state.hits = 0;
  state.lives = 5;
  state.invincibleFor = 3.5;
  state.lastShotAt = 0;
  state.fireHeld = false;
  document.body.classList.remove("firing");
  state.wheelSpun = false;
  resetJoystick();

  world.enemies.forEach(recycleUfo);
  world.dyingUfos.forEach(recycleUfo);
  world.playerShots.forEach(recycleShot);
  world.enemyShots.forEach(recycleShot);
  world.particles.forEach(recycleParticle);
  world.shockwaves.forEach((r) => {
    world.scene.remove(r);
    r.material.dispose();
  });
  world.enemies = [];
  world.dyingUfos = [];
  world.playerShots = [];
  world.enemyShots = [];
  world.particles = [];
  world.shockwaves = [];

  state.velocity.set(0, 0, 0);
  state.dashTimer = 0;
  state.dashCooldown = 0;
  state.shotSide = 1;
  state.shake.intensity = 0;
  state.shake.duration = 0;
  state.recoil = 0;
  state.hitStop = 0;
  state.combo = 0;
  state.comboTimer = 0;
  state.grenadeCooldown = 0;
  state.shieldCooldown = 0;
  state.shieldUntil = 0;
  world.grenades.forEach((g) => world.scene.remove(g));
  world.grenades = [];
  if (world.shieldMesh) {
    world.scene.remove(world.shieldMesh);
    world.shieldMesh = null;
  }
  updateActionUI();

  world.player.position.copy(PLAYER_START);
  world.player.rotation.y = Math.PI;
  world.playerModel.position.y = 0;
  world.playerRing.position.set(PLAYER_START.x, 0.035, PLAYER_START.z);
  world.camera.position.set(0, 6, 23);
  world.aimTarget = null;
  world.nextSpawnAt = performance.now() + 900;
  world.targetRing.visible = false;

  spawnWave();
  updateHud();
  ui.wheel.style.transition = "none";
  ui.wheel.style.transform = "rotate(0deg)";
  void ui.wheel.offsetWidth;
  ui.spinButton.disabled = false;
  ui.spinButton.textContent = "סובבו";
  if (ui.winnerReveal) ui.winnerReveal.classList.remove("active");
  if (ui.fireworks) ui.fireworks.innerHTML = "";
  if (ui.wheelStage) ui.wheelStage.classList.remove("spinning", "landed");
  ui.wheel.classList.remove("landed");
}

function setMode(mode) {
  state.mode = mode;
  if (mode !== "playing") {
    state.fireHeld = false;
    document.body.classList.remove("firing");
    if (world.targetRing) world.targetRing.visible = false;
  }
  document.body.classList.toggle("playing", mode === "playing");
  ui.startScreen.classList.toggle("active", mode === "start");
  ui.celebrationScreen.classList.toggle("active", mode === "celebration");
  ui.choiceScreen.classList.toggle("active", mode === "choice");
  ui.endScreen.classList.toggle("active", mode === "won" || mode === "lost");
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(world.clock.getDelta(), 0.033);

  if (state.mode === "playing") {
    const scaled = state.hitStop > 0 ? dt * 0.18 : dt;
    state.hitStop = Math.max(0, state.hitStop - dt);
    updateGame(scaled, dt);
  } else {
    animateIdle(dt);
  }

  world.renderer.render(world.scene, world.camera);
}

function updateGame(dt, realDt) {
  state.invincibleFor = Math.max(0, state.invincibleFor - realDt);
  state.comboTimer = Math.max(0, state.comboTimer - realDt);
  if (state.comboTimer === 0) state.combo = 0;
  state.recoil *= Math.pow(0.001, realDt);
  state.grenadeCooldown = Math.max(0, state.grenadeCooldown - realDt);
  state.shieldCooldown = Math.max(0, state.shieldCooldown - realDt);
  movePlayer(dt);
  updateCamera(realDt);
  updateEnemies(dt);
  updateDyingUfos(dt);
  updateShockwaves(dt);
  updateGrenades(dt);
  updateShield(dt);
  updateTargetRing(dt);
  updateShots(world.playerShots, dt, "player");
  updateShots(world.enemyShots, dt, "enemy");
  updateParticles(dt);
  maintainEnemies();
  if (state.fireHeld) shoot();
  updateAmbient(dt);
  updateActionUI();
}

function animateIdle(dt) {
  world.playerModel.position.y = Math.sin(performance.now() * 0.004) * 0.07;
  world.playerRing.rotation.z += dt * 0.8;
  updateCamera(dt);
  updateParticles(dt);
  updateAmbient(dt);
}

function updateAmbient(dt) {
  if (world.planet) world.planet.rotation.y += dt * 0.06;
  if (world.moon) world.moon.rotation.y += dt * 0.04;
  if (world.covers) {
    const t = performance.now() * 0.001;
    for (const cover of world.covers) {
      if (cover.userData.crystal) {
        cover.userData.crystal.rotation.y += dt * 0.5;
        const pulse = 0.7 + 0.3 * Math.sin(t * 1.6 + cover.userData.basePulse);
        cover.userData.crystal.material.emissiveIntensity = pulse;
      }
    }
  }
  if (world.asteroids) {
    for (const ast of world.asteroids) {
      ast.rotation.x += ast.userData.spin.x * dt;
      ast.rotation.y += ast.userData.spin.y * dt;
      ast.rotation.z += ast.userData.spin.z * dt;
      ast.userData.angle += ast.userData.orbit * dt;
      ast.position.x = Math.cos(ast.userData.angle) * ast.userData.radius;
      ast.position.z = Math.sin(ast.userData.angle) * ast.userData.radius;
      ast.position.y = ast.userData.height + Math.sin(performance.now() * 0.0006 + ast.userData.angle) * 0.4;
    }
  }
}

function movePlayer(dt) {
  const rawInput = getMovementInput();
  const rawMag = Math.min(1, rawInput.length());
  let throttle = 0;
  const input = new THREE.Vector3();
  if (rawMag > JOYSTICK_DEADZONE) {
    throttle = (rawMag - JOYSTICK_DEADZONE) / (1 - JOYSTICK_DEADZONE);
    input.copy(rawInput).normalize().multiplyScalar(throttle);
  }
  const hasInput = throttle > 0;

  state.dashCooldown = Math.max(0, state.dashCooldown - dt);

  if (state.dashTimer > 0) {
    state.dashTimer -= dt;
    state.velocity.x = state.dashDirection.x * DASH_SPEED;
    state.velocity.z = state.dashDirection.z * DASH_SPEED;
  } else if (hasInput) {
    const targetVx = input.x * PLAYER_SPEED;
    const targetVz = input.z * PLAYER_SPEED;
    const k = Math.min(1, PLAYER_ACCEL * dt / PLAYER_SPEED);
    state.velocity.x += (targetVx - state.velocity.x) * k;
    state.velocity.z += (targetVz - state.velocity.z) * k;
  } else {
    const decay = Math.max(0, 1 - PLAYER_FRICTION * dt);
    state.velocity.x *= decay;
    state.velocity.z *= decay;
    if (Math.abs(state.velocity.x) < 0.05) state.velocity.x = 0;
    if (Math.abs(state.velocity.z) < 0.05) state.velocity.z = 0;
  }

  const next = world.player.position.clone().addScaledVector(state.velocity, dt);
  next.x = THREE.MathUtils.clamp(next.x, -ARENA_SIZE / 2 + 1.2, ARENA_SIZE / 2 - 1.2);
  next.z = THREE.MathUtils.clamp(next.z, -ARENA_SIZE / 2 + 1.2, ARENA_SIZE / 2 - 1.2);

  if (!collidesWithCover(next, 0.72)) {
    world.player.position.copy(next);
  } else {
    state.velocity.multiplyScalar(0.25);
  }

  if (state.velocity.lengthSq() > 0.4 && state.dashTimer <= 0) {
    const targetRot = Math.atan2(state.velocity.x, state.velocity.z);
    world.player.rotation.y = lerpAngle(world.player.rotation.y, targetRot, Math.min(1, dt * 4));
  }

  const speed = Math.hypot(state.velocity.x, state.velocity.z);
  const normSpeed = Math.min(1, speed / PLAYER_SPEED);
  const leanZ = -state.velocity.x * 0.045;
  const leanX = state.velocity.z * 0.035;
  world.playerModel.rotation.z += (leanZ - world.playerModel.rotation.z) * Math.min(1, dt * 7);
  world.playerModel.rotation.x += (leanX - world.playerModel.rotation.x) * Math.min(1, dt * 7);

  const t = performance.now();
  const bobFreq = state.dashTimer > 0 ? 0.03 : 0.013;
  const bobAmp = state.dashTimer > 0 ? 0.18 : 0.05 + normSpeed * 0.09;
  world.playerModel.position.y = Math.sin(t * bobFreq) * bobAmp - state.recoil * 0.15;
  world.playerModel.position.z = state.recoil * 0.25;

  world.playerRing.position.set(world.player.position.x, 0.035, world.player.position.z);
  world.playerRing.rotation.z += dt * (1.8 + normSpeed * 4);

  const cdReady = state.dashCooldown <= 0;
  world.playerRing.scale.setScalar(cdReady ? 1 + Math.sin(t * 0.006) * 0.04 : 0.6 + (1 - state.dashCooldown / DASH_COOLDOWN) * 0.4);
  world.playerRing.material.opacity = cdReady ? 0.65 : 0.35;
}

function lerpAngle(current, target, t) {
  let delta = target - current;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return current + delta * t;
}

function tryDash() {
  if (state.dashCooldown > 0 || state.dashTimer > 0 || state.mode !== "playing") return;
  const input = getMovementInput();
  if (input.lengthSq() > 0.001) {
    input.normalize();
    state.dashDirection.set(input.x, 0, input.z);
  } else {
    state.dashDirection.set(Math.sin(world.player.rotation.y), 0, Math.cos(world.player.rotation.y));
  }
  state.dashTimer = DASH_DURATION;
  state.dashCooldown = DASH_COOLDOWN;
  state.invincibleFor = Math.max(state.invincibleFor, DASH_DURATION + 0.05);
  burst(world.player.position.clone().add(new THREE.Vector3(0, 0.4, 0)), 0x6ff3ff, 12);
  addShake(0.08, 0.15);
}

function throwGrenade() {
  if (state.mode !== "playing" || state.grenadeCooldown > 0) return;
  state.grenadeCooldown = GRENADE_COOLDOWN;

  const facingDirection = getAimDirection();
  const dir = new THREE.Vector3(facingDirection.x, 0, facingDirection.z).normalize();

  const grenade = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 16, 12),
    new THREE.MeshStandardMaterial({
      color: 0x2c3e22,
      emissive: 0xff6a2c,
      emissiveIntensity: 0.45,
      roughness: 0.55,
    })
  );
  grenade.position.copy(world.player.position).add(new THREE.Vector3(0, 1.4, 0)).addScaledVector(dir, 1.0);
  grenade.userData = {
    velocity: new THREE.Vector3(dir.x * GRENADE_SPEED, 8.5, dir.z * GRENADE_SPEED),
    fuse: 1.05,
    spin: new THREE.Vector3(Math.random() * 6, Math.random() * 6, Math.random() * 6),
  };
  world.grenades.push(grenade);
  world.scene.add(grenade);
  showToast("רימון!");
}

function updateGrenades(dt) {
  for (let i = world.grenades.length - 1; i >= 0; i -= 1) {
    const g = world.grenades[i];
    g.userData.velocity.y -= dt * 22;
    g.position.addScaledVector(g.userData.velocity, dt);
    g.rotation.x += g.userData.spin.x * dt;
    g.rotation.y += g.userData.spin.y * dt;
    g.rotation.z += g.userData.spin.z * dt;

    if (g.position.y < 0.32) {
      g.position.y = 0.32;
      g.userData.velocity.y *= -0.4;
      g.userData.velocity.x *= 0.55;
      g.userData.velocity.z *= 0.55;
    }

    g.userData.fuse -= dt;
    if (g.userData.fuse <= 0) {
      explodeGrenade(g.position);
      world.scene.remove(g);
      world.grenades.splice(i, 1);
    }
  }
}

function explodeGrenade(position) {
  burst(position, 0xff8d5c, 28);
  burst(position, 0xfff3a8, 18);
  spawnShockwave(position);
  addShake(0.45, 0.4);
  state.hitStop = 0.08;

  for (let i = world.enemies.length - 1; i >= 0; i -= 1) {
    const enemy = world.enemies[i];
    const flat = Math.hypot(position.x - enemy.position.x, position.z - enemy.position.z);
    if (flat <= GRENADE_RADIUS + enemy.userData.radius) {
      registerEnemyHit(i, enemy);
    }
  }
}

function activateShield() {
  if (state.mode !== "playing" || state.shieldCooldown > 0) return;
  state.shieldCooldown = SHIELD_COOLDOWN;
  state.shieldUntil = SHIELD_DURATION;
  state.invincibleFor = Math.max(state.invincibleFor, SHIELD_DURATION);

  if (!world.shieldMesh) {
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(1.55, 28, 18),
      new THREE.MeshBasicMaterial({
        color: 0x80ffb3,
        transparent: true,
        opacity: 0.32,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    world.shieldMesh = dome;
  }
  world.shieldMesh.scale.setScalar(1);
  world.shieldMesh.material.opacity = 0.4;
  world.scene.add(world.shieldMesh);
  showToast("מגן פעיל");
}

function updateShield(dt) {
  if (state.shieldUntil > 0) {
    state.shieldUntil = Math.max(0, state.shieldUntil - dt);
  }
  if (world.shieldMesh) {
    if (state.shieldUntil <= 0) {
      world.scene.remove(world.shieldMesh);
      assets.materials.alienSkin.emissive.setHex(0x000000);
      assets.materials.alienSkin.emissiveIntensity = 0;
      return;
    }
    world.shieldMesh.position.copy(world.player.position).add(new THREE.Vector3(0, 1.0, 0));
    const t = performance.now() * 0.003;
    const pulse = 1 + Math.sin(t) * 0.04;
    world.shieldMesh.scale.setScalar(pulse);
    world.shieldMesh.material.opacity = 0.32 + Math.sin(t * 1.6) * 0.08;
    world.shieldMesh.rotation.y += dt * 0.6;
    assets.materials.alienSkin.emissive.setHex(0x2acf5d);
    assets.materials.alienSkin.emissiveIntensity = 0.4 + Math.sin(t * 2) * 0.15;
  }
}

var _lastActionUI = 0;
function updateActionUI(force) {
  const now = performance.now();
  if (!force && now - _lastActionUI < 100) return;
  _lastActionUI = now;
  if (ui.grenadeCd) {
    const ratio = state.grenadeCooldown / GRENADE_COOLDOWN;
    ui.grenadeCd.style.setProperty("--cd", `${ratio * 360}deg`);
    ui.grenadeButton.disabled = state.grenadeCooldown > 0 || state.mode !== "playing";
  }
  if (ui.shieldCd) {
    const ratio = state.shieldCooldown / SHIELD_COOLDOWN;
    ui.shieldCd.style.setProperty("--cd", `${ratio * 360}deg`);
    ui.shieldButton.disabled = state.shieldCooldown > 0 || state.mode !== "playing";
  }
}

function getMovementInput() {
  const input = new THREE.Vector3(state.joystick.x, 0, state.joystick.y);
  if (state.keyboard.has("w") || state.keyboard.has("arrowup")) input.z -= 1;
  if (state.keyboard.has("s") || state.keyboard.has("arrowdown")) input.z += 1;
  if (state.keyboard.has("a") || state.keyboard.has("arrowleft")) input.x -= 1;
  if (state.keyboard.has("d") || state.keyboard.has("arrowright")) input.x += 1;
  return input;
}

function updateCamera(dt) {
  const rot = world.player.rotation.y;
  const facingX = Math.sin(rot);
  const facingZ = Math.cos(rot);
  const camDist = 7.5;
  const camHeight = 4.6;
  const lookDist = 6;
  const cameraTarget = new THREE.Vector3(
    world.player.position.x - facingX * camDist,
    camHeight,
    world.player.position.z - facingZ * camDist
  );
  const lookTarget = new THREE.Vector3(
    world.player.position.x + facingX * lookDist,
    1.3,
    world.player.position.z + facingZ * lookDist
  );
  const k = Math.min(1, dt * 1.7);
  world.camera.position.x += (cameraTarget.x - world.camera.position.x) * k;
  world.camera.position.y += (cameraTarget.y - world.camera.position.y) * k;
  world.camera.position.z += (cameraTarget.z - world.camera.position.z) * k;

  if (state.shake.duration > 0) {
    state.shake.duration -= dt;
    const k = state.shake.intensity * Math.max(0, Math.min(1, state.shake.duration * 4));
    world.camera.position.x += (Math.random() - 0.5) * k * 1.6;
    world.camera.position.y += (Math.random() - 0.5) * k * 1.4;
    world.camera.position.z += (Math.random() - 0.5) * k * 0.8;
    if (state.shake.duration <= 0) state.shake.intensity = 0;
  }

  world.camera.lookAt(lookTarget);
}

function addShake(intensity, duration) {
  state.shake.intensity = Math.max(state.shake.intensity, intensity);
  state.shake.duration = Math.max(state.shake.duration, duration);
}

function updateEnemies(dt) {
  for (const enemy of world.enemies) {
    const ud = enemy.userData;
    const role = ud.role;
    const flatToPlayer = world.player.position.clone().sub(enemy.position).setY(0);
    const distance = Math.max(flatToPlayer.length(), 0.001);
    const dirToPlayer = flatToPlayer.clone().normalize();
    const tangent = new THREE.Vector3(-dirToPlayer.z, 0, dirToPlayer.x);

    ud.phase += dt;
    enemy.position.y = ud.baseY + Math.sin(ud.phase * 2.4) * 0.32;
    enemy.rotation.y += dt * (role === "scout" ? 3.2 : 2.0);

    ud.strafeSwap -= dt;
    if (ud.strafeSwap <= 0) {
      ud.strafeDir *= -1;
      ud.strafeSwap = 1.4 + Math.random() * 1.6;
    }

    let approachSpeed = 0;
    let preferred = 9;
    let strafeSpeed = 1.6;

    if (role === "scout") {
      preferred = 7;
      strafeSpeed = 4.5;
      approachSpeed = 3.5;
    } else if (role === "sniper") {
      preferred = 14;
      strafeSpeed = 1.2;
      approachSpeed = 1.5;
    } else if (role === "swooper") {
      preferred = 9;
      strafeSpeed = 2.0;
      approachSpeed = 2.0;
    } else {
      preferred = 9;
      strafeSpeed = 2.4;
      approachSpeed = 2.2;
    }

    if (ud.swooping > 0) {
      ud.swooping -= dt;
      enemy.position.addScaledVector(dirToPlayer, dt * 14);
      if (state.invincibleFor <= 0 && distance < 1.6) {
        burst(enemy.position.clone(), 0xff66bd, 14);
        damagePlayer();
        ud.swooping = 0;
        ud.swoopTimer = 6 + Math.random() * 3;
      }
    } else {
      const distError = distance - preferred;
      const approachDir = distError > 0 ? 1 : -1;
      enemy.position.addScaledVector(dirToPlayer, dt * approachSpeed * approachDir * Math.min(1, Math.abs(distError) / 4));
      enemy.position.addScaledVector(tangent, dt * strafeSpeed * ud.strafeDir);
      enemy.position.addScaledVector(ud.drift, dt);
    }

    if (role === "swooper") {
      ud.swoopTimer -= dt;
      if (ud.swoopTimer <= 0 && ud.swooping <= 0 && distance < 18) {
        ud.swooping = 0.65;
        ud.swoopTimer = 5 + Math.random() * 3;
      }
    }

    enemy.position.x = THREE.MathUtils.clamp(enemy.position.x, -ARENA_SIZE / 2 + 2, ARENA_SIZE / 2 - 2);
    enemy.position.z = THREE.MathUtils.clamp(enemy.position.z, -ARENA_SIZE / 2, 6);

    if (ud.burstLeft > 0) {
      ud.burstCooldown -= dt;
      if (ud.burstCooldown <= 0) {
        enemyShoot(enemy);
        ud.burstLeft -= 1;
        ud.burstCooldown = 0.16;
      }
    } else {
      ud.shootIn -= dt;
      if (ud.shootIn <= 0) {
        if (role === "sniper") {
          enemyShoot(enemy, true);
          ud.shootIn = 2.0 + Math.random() * 1.2;
        } else if (role === "scout") {
          ud.burstLeft = 3;
          ud.burstCooldown = 0;
          ud.shootIn = 2.4 + Math.random() * 1.4;
        } else {
          enemyShoot(enemy, Math.random() < 0.6);
          ud.shootIn = 1.6 + Math.random() * 1.4;
        }
      }
    }
  }
}

function shoot() {
  const now = performance.now();
  if (state.mode !== "playing" || now - state.lastShotAt < PLAYER_FIRE_RATE) return;
  state.lastShotAt = now;

  const baseDirection = getAimDirection();
  const targetEnemy = world.aimTarget;

  state.shotSide *= -1;
  const sideOffset = new THREE.Vector3(
    baseDirection.z * 0.42 * state.shotSide,
    0,
    -baseDirection.x * 0.42 * state.shotSide
  );
  const origin = world.player.position
    .clone()
    .add(new THREE.Vector3(0, 1.45, 0))
    .addScaledVector(baseDirection, 1.05)
    .add(sideOffset);

  let direction;
  if (targetEnemy) {
    direction = targetEnemy.position.clone().sub(origin).normalize();
  } else {
    direction = baseDirection;
  }

  const shot = createShot("player");
  shot.position.copy(origin);
  shot.userData.velocity = direction.clone().multiplyScalar(PLAYER_SHOT_SPEED);
  shot.userData.life = 1.4;
  shot.userData.radius = 0.55;
  shot.userData.trailIn = 0;
  world.playerShots.push(shot);
  world.scene.add(shot);
  muzzleFlash(shot.position, direction);

  state.recoil = Math.min(1, state.recoil + 0.6);
  addShake(0.04, 0.06);
}

function getAimDirection() {
  const facing = new THREE.Vector3(Math.sin(world.player.rotation.y), 0, Math.cos(world.player.rotation.y));
  let best = null;
  let bestEnemy = null;
  let bestScore = -Infinity;

  for (const enemy of world.enemies) {
    const toEnemy = enemy.position.clone().sub(world.player.position).setY(0);
    const distance = toEnemy.length();
    if (distance < 0.001 || distance > 48) continue;
    const direction = toEnemy.normalize();
    const facingBonus = direction.dot(facing);
    if (facingBonus < -0.35) continue;
    const aimScore = facingBonus * 1.6 - distance * 0.02;
    if (aimScore > bestScore) {
      bestScore = aimScore;
      best = direction;
      bestEnemy = enemy;
    }
  }

  world.aimTarget = bestEnemy;
  return best || facing;
}

function updateTargetRing(dt) {
  getAimDirection();
  if (!world.aimTarget || !world.enemies.includes(world.aimTarget)) {
    world.targetRing.visible = false;
    return;
  }

  world.targetRing.visible = true;
  world.targetRing.position.set(world.aimTarget.position.x, 0.06, world.aimTarget.position.z);
  world.targetRing.rotation.z += dt * 4;
  const pulse = 1 + Math.sin(performance.now() * 0.008) * 0.08;
  world.targetRing.scale.setScalar(pulse);
}

function enemyShoot(enemy, lead = true) {
  if (state.mode !== "playing") return;
  const role = enemy.userData.role || "hunter";
  const speed = role === "sniper" ? 13 : role === "scout" ? 10 : 9;
  const origin = enemy.position.clone().add(new THREE.Vector3(0, -0.15, 0));
  const playerPos = world.player.position.clone().add(new THREE.Vector3(0, 1.0, 0));

  let aimAt = playerPos;
  if (lead) {
    const toPlayer = playerPos.clone().sub(origin);
    const t = Math.min(1.2, toPlayer.length() / speed);
    const leadAccuracy = role === "sniper" ? 0.7 : 0.45;
    aimAt = playerPos.clone().addScaledVector(state.velocity, t * leadAccuracy);
  }

  const direction = aimAt.sub(origin).normalize();
  const shot = createShot("enemy");
  shot.position.copy(origin).addScaledVector(direction, 0.85);
  shot.userData.velocity = direction.multiplyScalar(speed);
  shot.userData.life = 3.6;
  shot.userData.radius = role === "sniper" ? 0.32 : 0.28;
  world.enemyShots.push(shot);
  world.scene.add(shot);
}

function createShot(owner) {
  const shot = world.shotPools[owner].pop() || (
    owner === "player"
      ? new THREE.Mesh(assets.geometries.playerShot, assets.materials.playerShot)
      : new THREE.Mesh(assets.geometries.enemyShot, assets.materials.enemyShot)
  );
  shot.userData.owner = owner;
  shot.visible = true;
  shot.scale.setScalar(1);
  return shot;
}

const _shotPrev = new THREE.Vector3();
const _shotDir = new THREE.Vector3();
const _unitY = new THREE.Vector3(0, 1, 0);
const _playerCenter = new THREE.Vector3();
function updateShots(shots, dt, owner) {
  for (let i = shots.length - 1; i >= 0; i -= 1) {
    const shot = shots[i];
    _shotPrev.copy(shot.position);
    shot.position.addScaledVector(shot.userData.velocity, dt);
    shot.userData.life -= dt;
    _shotDir.copy(shot.userData.velocity).normalize();
    shot.quaternion.setFromUnitVectors(_unitY, _shotDir);

    if (owner === "player") {
      shot.userData.trailIn -= dt;
      if (shot.userData.trailIn <= 0) {
        shot.userData.trailIn = 0.018;
        spawnTrail(shot.position);
      }
    }

    if (shot.userData.life <= 0 || isOutsideArena(shot.position) || collidesWithCover(shot.position, shot.userData.radius)) {
      removeAt(shots, i);
      continue;
    }

    if (owner === "player" && damageEnemyAlongSegment(_shotPrev, shot.position, shot.userData.radius)) {
      removeAt(shots, i);
      continue;
    }

    if (owner === "enemy" && state.invincibleFor <= 0) {
      _playerCenter.copy(world.player.position);
      _playerCenter.y += 1.1;
      if (segmentSphereDistance(_shotPrev, shot.position, _playerCenter) < 0.95) {
        removeAt(shots, i);
        damagePlayer();
      }
    }
  }
}

const _abTmp = new THREE.Vector3();
const _apTmp = new THREE.Vector3();
const _closestTmp = new THREE.Vector3();
function segmentSphereDistance(a, b, p) {
  _abTmp.subVectors(b, a);
  const lenSq = _abTmp.lengthSq();
  if (lenSq < 1e-6) return p.distanceTo(a);
  _apTmp.subVectors(p, a);
  const t = Math.max(0, Math.min(1, _apTmp.dot(_abTmp) / lenSq));
  _closestTmp.copy(a).addScaledVector(_abTmp, t);
  return _closestTmp.distanceTo(p);
}

function damageEnemyAlongSegment(a, b, shotRadius) {
  for (let i = world.enemies.length - 1; i >= 0; i -= 1) {
    const enemy = world.enemies[i];
    const dist = segmentSphereDistance(a, b, enemy.position);
    if (dist <= enemy.userData.radius + shotRadius) {
      registerEnemyHit(i, enemy);
      return true;
    }
  }
  return false;
}

function registerEnemyHit(index, enemy) {
  world.enemies.splice(index, 1);
  world.aimTarget = null;

  enemy.userData.dying = 0.55;
  enemy.userData.spinSpeed = (Math.random() < 0.5 ? -1 : 1) * (10 + Math.random() * 8);
  enemy.userData.fallVel = 1.5 + Math.random() * 1.2;
  world.dyingUfos.push(enemy);

  burst(enemy.position, 0xfff3a8, 10);
  addShake(0.18, 0.22);
  state.hitStop = 0.05;

  state.combo += 1;
  state.comboTimer = 2.4;

  state.hits += 1;
  state.score = Math.min(TARGET_SCORE, Math.round((state.hits / TARGET_HITS) * TARGET_SCORE));
  updateHud();

  const baseHitPoints = Math.round(TARGET_SCORE / TARGET_HITS);
  const comboMult = state.combo >= 3 ? state.combo : 1;
  spawnFloatingText(`+${baseHitPoints * comboMult}`, enemy.position.clone().add(new THREE.Vector3(0, 1.6, 0)), state.combo >= 3);
  if (state.combo === 3) showToast("קומבו x3!");
  else if (state.combo > 3 && state.combo % 2 === 0) showToast(`קומבו x${state.combo}!`);

  if (state.hits >= TARGET_HITS) {
    winGame();
  }
}

function spawnFloatingText(text, worldPos, isCombo) {
  if (!ui.floatingText || !world.camera) return;
  const projected = worldPos.clone().project(world.camera);
  if (projected.z < -1 || projected.z > 1) return;
  const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;
  const el = document.createElement("span");
  el.className = isCombo ? "float-num combo" : "float-num";
  el.textContent = text;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  ui.floatingText.append(el);
  window.setTimeout(() => el.remove(), 950);
}

function updateDyingUfos(dt) {
  for (let i = world.dyingUfos.length - 1; i >= 0; i -= 1) {
    const u = world.dyingUfos[i];
    u.userData.dying -= dt;
    u.rotation.z += dt * u.userData.spinSpeed;
    u.rotation.x += dt * u.userData.spinSpeed * 0.4;
    u.position.y -= u.userData.fallVel * dt;
    u.userData.fallVel += dt * 7;
    u.scale.multiplyScalar(Math.max(0.5, 1 - dt * 0.6));

    if (u.userData.dying <= 0 || u.position.y < 0.1) {
      const explosionPos = u.position.clone();
      explosionPos.y = Math.max(0.2, explosionPos.y);
      burst(explosionPos, 0x80ffb3, 22);
      burst(explosionPos, 0xfff3a8, 8);
      spawnShockwave(explosionPos);
      addShake(0.22, 0.3);
      state.hitStop = Math.max(state.hitStop, 0.04);
      world.dyingUfos.splice(i, 1);
      recycleUfo(u);
    }
  }
}

function spawnShockwave(position) {
  const ring = new THREE.Mesh(
    assets.geometries.shockwave,
    assets.materials.shockwave.clone()
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(position.x, 0.06, position.z);
  ring.userData.life = 0.55;
  ring.userData.maxLife = 0.55;
  world.shockwaves.push(ring);
  world.scene.add(ring);
}

function updateShockwaves(dt) {
  for (let i = world.shockwaves.length - 1; i >= 0; i -= 1) {
    const r = world.shockwaves[i];
    r.userData.life -= dt;
    const t = 1 - Math.max(0, r.userData.life) / r.userData.maxLife;
    r.scale.setScalar(1 + t * 8);
    r.material.opacity = 0.9 * (1 - t);
    if (r.userData.life <= 0) {
      world.scene.remove(r);
      r.material.dispose();
      world.shockwaves.splice(i, 1);
    }
  }
}

function spawnTrail(position) {
  const p = getParticle(assets.geometries.trail, assets.materials.trailFx);
  p.position.copy(position);
  p.scale.setScalar(1);
  p.userData.velocity = new THREE.Vector3(0, 0, 0);
  p.userData.maxLife = 0.18;
  p.userData.life = p.userData.maxLife;
  world.particles.push(p);
  world.scene.add(p);
}

function damagePlayer() {
  state.lives -= 1;
  state.invincibleFor = 2.1;
  state.combo = 0;
  state.comboTimer = 0;
  burst(world.player.position.clone().add(new THREE.Vector3(0, 1.1, 0)), 0xff66bd, 18);
  addShake(0.55, 0.45);
  state.hitStop = 0.08;
  updateHud();
  showToast(state.lives > 0 ? "נפגעתם, יש לכם רגע להתאושש" : "העב״מים ניצחו הפעם");

  if (state.lives <= 0) {
    loseGame();
  }
}

function winGame() {
  state.activeSegel = null;
  resetEndScreen();
  resetJoystick();
  showCelebration();
}

function showCelebration() {
  setMode("celebration");
  spawnPartyAnimals();
  startPartyConfetti();
  window.setTimeout(() => {
    if (state.mode === "celebration") setMode("choice");
  }, 4600);
}

function spawnPartyAnimals() {
  const root = ui.partyAnimals;
  if (!root) return;
  root.innerHTML = "";
  const cast = ["🐶", "🐱", "🦊", "🐻", "🐼", "🐵", "🦁", "🐯", "🐰", "🐸", "🦄", "🐨", "🐷", "🐹", "🥳", "🎉", "🎊", "🪩", "🕺", "💃", "🎵", "✨"];
  const count = 22;
  for (let i = 0; i < count; i += 1) {
    const el = document.createElement("span");
    el.className = "party-animal";
    el.textContent = cast[i % cast.length];
    el.style.left = `${6 + Math.random() * 88}%`;
    el.style.top = `${8 + Math.random() * 80}%`;
    el.style.fontSize = `clamp(2rem, ${4 + Math.random() * 6}vmin, 6rem)`;
    el.style.animationDelay = `${Math.random() * 600}ms`;
    el.style.animationDuration = `${1 + Math.random() * 1.4}s`;
    el.style.setProperty("--swayX", `${(Math.random() - 0.5) * 60}px`);
    el.style.setProperty("--rot", `${(Math.random() - 0.5) * 40}deg`);
    root.append(el);
  }
}

function startPartyConfetti() {
  const root = ui.partyConfetti;
  if (!root) return;
  root.innerHTML = "";
  const colors = ["#5de7ff", "#80ffb3", "#ffd45c", "#ff66bd", "#9f8cff", "#ff8d5c", "#ffffff"];
  const total = 80;
  for (let i = 0; i < total; i += 1) {
    const piece = document.createElement("span");
    piece.className = "party-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 1500}ms`;
    piece.style.animationDuration = `${1.6 + Math.random() * 1.6}s`;
    piece.style.setProperty("--drift", `${(Math.random() - 0.5) * 240}px`);
    piece.style.setProperty("--rot", `${(Math.random() - 0.5) * 1440}deg`);
    root.append(piece);
  }
}

function chooseSegel(key) {
  state.activeSegel = key;
  state.wheelSpun = false;
  buildWheel(SEGEL_DATA[key].names);
  resetEndScreen();
  setMode("won");
}

function loseGame() {
  setMode("lost");
  resetEndScreen();
  ui.spinButton.disabled = true;
  ui.spinButton.textContent = "—";
  resetJoystick();
}

function resetEndScreen() {
  ui.spinButton.disabled = false;
  ui.spinButton.textContent = "סובבו";
  ui.winnerReveal.classList.remove("active");
  ui.winnerReveal.setAttribute("aria-hidden", "true");
  ui.fireworks.innerHTML = "";
  ui.wheel.classList.remove("landed");
  ui.wheelStage.classList.remove("spinning", "landed");
  ui.wheel.querySelectorAll(".wheel-name.is-winner").forEach((el) => el.classList.remove("is-winner"));
}

function maintainEnemies() {
  if (state.mode !== "playing") return;
  const now = performance.now();
  const progress = state.hits / TARGET_HITS;
  const limit = 7 + (progress > 0.6 ? 1 : 0) + (progress > 0.85 ? 1 : 0);
  if (world.enemies.length >= limit || now < world.nextSpawnAt) return;

  const lane = world.lanes[Math.floor(Math.random() * world.lanes.length)];
  const x = lane[0] + (Math.random() - 0.5) * 3;
  const z = lane[1] + (Math.random() - 0.5) * 3;
  world.enemies.push(createUfo(x, z));

  const baseDelay = 700;
  const minDelay = 420;
  const delay = Math.max(minDelay, baseDelay - progress * 280);
  world.nextSpawnAt = now + delay;
}

function spawnWave() {
  world.lanes.slice(0, 5).forEach(([x, z]) => {
    world.enemies.push(createUfo(x, z));
  });
}

function burst(position, color, count) {
  const material =
    color === 0xff66bd ? assets.materials.hurtFx
    : color === 0xfff3a8 ? assets.materials.flashFx
    : color === 0x6ff3ff ? assets.materials.playerShot
    : assets.materials.hitFx;
  const scaled = Math.max(1, Math.round(count * QUALITY.burstParticles));
  for (let i = 0; i < scaled; i += 1) {
    pruneParticles();
    const particle = getParticle(assets.geometries.particle, material);
    const size = 0.6 + Math.random() * 0.7;
    particle.scale.setScalar(size);
    particle.position.copy(position);
    particle.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 9,
      Math.random() * 4.4 + 0.6,
      (Math.random() - 0.5) * 9
    );
    particle.userData.maxLife = 0.42 + Math.random() * 0.34;
    particle.userData.life = particle.userData.maxLife;
    world.particles.push(particle);
    world.scene.add(particle);
  }
}

function pruneParticles() {
  while (world.particles.length >= QUALITY.maxParticles) {
    recycleParticleAt(0);
  }
}

function muzzleFlash(position, direction) {
  const flash = getParticle(assets.geometries.flash, assets.materials.flashFx);
  flash.position.copy(position).addScaledVector(direction, 0.35);
  flash.scale.setScalar(1);
  flash.userData.velocity = direction.clone().multiplyScalar(1.5);
  flash.userData.maxLife = 0.14;
  flash.userData.life = flash.userData.maxLife;
  world.particles.push(flash);
  world.scene.add(flash);

  for (let i = 0; i < 2; i += 1) {
    const spark = getParticle(assets.geometries.particle, assets.materials.playerShot);
    spark.scale.setScalar(0.28);
    spark.position.copy(position);
    spark.userData.velocity = new THREE.Vector3((Math.random() - 0.5) * 2.4, Math.random() * 1.2, (Math.random() - 0.5) * 2.4);
    spark.userData.maxLife = 0.16 + Math.random() * 0.1;
    spark.userData.life = spark.userData.maxLife;
    world.particles.push(spark);
    world.scene.add(spark);
  }
}

function updateParticles(dt) {
  for (let i = world.particles.length - 1; i >= 0; i -= 1) {
    const particle = world.particles[i];
    particle.position.addScaledVector(particle.userData.velocity, dt);
    particle.userData.velocity.y -= dt * 4;
    particle.userData.life -= dt;
    particle.scale.multiplyScalar(0.92);
    if (particle.userData.life <= 0) recycleParticleAt(i);
  }
}

function getParticle(geometry, material) {
  const particle = world.particlePool.pop() || new THREE.Mesh();
  particle.geometry = geometry;
  particle.material = material;
  particle.visible = true;
  particle.scale.setScalar(1);
  return particle;
}

function recycleParticleAt(index) {
  const particle = world.particles[index];
  world.particles.splice(index, 1);
  recycleParticle(particle);
}

function recycleParticle(particle) {
  world.scene.remove(particle);
  particle.visible = false;
  world.particlePool.push(particle);
}

function buildWheel(names = SEGEL_DATA["א"].names) {
  const slice = 360 / names.length;
  const segments = names.map((_, index) => {
    const start = index * slice;
    const end = (index + 1) * slice;
    return `${WHEEL_COLORS[index % WHEEL_COLORS.length]} ${start}deg ${end}deg`;
  });
  ui.wheel.style.background = `conic-gradient(${segments.join(", ")})`;

  ui.wheel.innerHTML = "";
  names.forEach((name, index) => {
    const label = document.createElement("span");
    label.className = "wheel-name";
    label.textContent = name;
    label.style.transform = `translate(-100%, -50%) rotate(${index * slice + slice / 2 + 90}deg)`;
    ui.wheel.append(label);
  });

  ui.wheel.style.transition = "none";
  ui.wheel.style.transform = "rotate(0deg)";
  void ui.wheel.offsetWidth;
}

function spinWheel() {
  if (state.wheelSpun || state.mode === "lost" || !state.activeSegel) return;
  state.wheelSpun = true;
  ui.spinButton.disabled = true;
  ui.spinButton.textContent = "";
  ui.wheel.classList.remove("landed");
  ui.wheelStage.classList.add("spinning");
  ui.wheel.querySelectorAll(".wheel-name.is-winner").forEach((el) => el.classList.remove("is-winner"));

  const data = SEGEL_DATA[state.activeSegel];
  const names = data.names;
  const winnerName = data.winner;
  const winnerIndex = Math.max(0, names.indexOf(winnerName));
  const slice = 360 / names.length;
  const winnerMiddle = winnerIndex * slice + slice / 2;
  const totalSpin = 360 * 9 + (360 - winnerMiddle) - slice * 0.18;
  ui.wheel.style.transition = "transform 6.2s cubic-bezier(0.08, 0.78, 0.16, 1)";
  ui.wheel.style.transform = `rotate(${totalSpin}deg)`;

  window.setTimeout(() => {
    ui.wheelStage.classList.remove("spinning");
    ui.wheelStage.classList.add("landed");
    ui.wheel.classList.add("landed");
    highlightWinnerLabel(winnerIndex);
    launchConfetti();
    revealWinner(winnerName);
    launchFireworks();
  }, 6300);
}

function revealWinner(name) {
  ui.winnerName.textContent = name;
  ui.winnerMessage.textContent = "מזל טוב, את א׳ יום קרב";
  ui.winnerReveal.classList.add("active");
  ui.winnerReveal.setAttribute("aria-hidden", "false");
}

function launchFireworks() {
  const colors = ["#5de7ff", "#80ffb3", "#ffd45c", "#ff66bd", "#9f8cff", "#ff8d5c", "#ffffff"];
  let count = 0;
  const burst = () => {
    if (count >= 8) return;
    count += 1;
    spawnFirework(colors);
    window.setTimeout(burst, 320 + Math.random() * 220);
  };
  burst();
}

function spawnFirework(colors) {
  const root = ui.fireworks;
  const x = 12 + Math.random() * 76;
  const y = 14 + Math.random() * 52;
  const baseColor = colors[Math.floor(Math.random() * colors.length)];

  const sparks = 22;
  for (let i = 0; i < sparks; i += 1) {
    const spark = document.createElement("span");
    spark.className = "spark-piece";
    const angle = (i / sparks) * Math.PI * 2 + Math.random() * 0.2;
    const dist = 90 + Math.random() * 110;
    spark.style.left = `${x}%`;
    spark.style.top = `${y}%`;
    spark.style.background = baseColor;
    spark.style.boxShadow = `0 0 12px ${baseColor}, 0 0 22px ${baseColor}`;
    spark.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
    spark.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
    spark.style.animationDelay = `${Math.random() * 60}ms`;
    root.append(spark);
    window.setTimeout(() => spark.remove(), 1500);
  }

  const flash = document.createElement("span");
  flash.className = "spark-flash";
  flash.style.left = `${x}%`;
  flash.style.top = `${y}%`;
  flash.style.background = `radial-gradient(circle, ${baseColor} 0%, transparent 60%)`;
  root.append(flash);
  window.setTimeout(() => flash.remove(), 600);
}

function highlightWinnerLabel(winnerIndex) {
  const labels = ui.wheel.querySelectorAll(".wheel-name");
  labels.forEach((el, i) => el.classList.toggle("is-winner", i === winnerIndex));
}

function launchConfetti() {
  const stage = document.querySelector(".wheel-stage");
  if (!stage) return;
  const colors = ["#5de7ff", "#80ffb3", "#ffd45c", "#ff66bd", "#9f8cff", "#ff8d5c"];
  for (let i = 0; i < 60; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    const angle = Math.random() * Math.PI * 2;
    const dist = 110 + Math.random() * 180;
    piece.style.setProperty("--tx", `${Math.cos(angle) * dist}px`);
    piece.style.setProperty("--ty", `${Math.sin(angle) * dist}px`);
    piece.style.setProperty("--rot", `${Math.random() * 720 - 360}deg`);
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 120}ms`;
    stage.append(piece);
    setTimeout(() => piece.remove(), 1600);
  }
}

function updateJoystick(event) {
  const rect = ui.joystick.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const max = rect.width * 0.34;
  const dx = event.clientX - centerX;
  const dy = event.clientY - centerY;
  const length = Math.hypot(dx, dy);
  const scale = length > max ? max / length : 1;
  const x = dx * scale;
  const y = dy * scale;

  state.joystick.set(x / max, y / max);
  ui.stick.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
}

function releaseJoystick(event) {
  if (event.pointerId === state.joystickPointerId) {
    resetJoystick();
  }
}

function resetJoystick() {
  state.joystickPointerId = null;
  state.joystick.set(0, 0);
  ui.stick.style.transform = "translate(-50%, -50%)";
}

function stopFire(event) {
  if (event) event.preventDefault();
  state.fireHeld = false;
  document.body.classList.remove("firing");
}

function collidesWithCover(position, radius) {
  return world.covers.some((cover) => {
    const flatDistance = Math.hypot(position.x - cover.position.x, position.z - cover.position.z);
    return position.y < 2.7 && flatDistance < cover.userData.radius + radius;
  });
}

function isOutsideArena(position) {
  return Math.abs(position.x) > ARENA_SIZE / 2 + 4 || Math.abs(position.z) > ARENA_SIZE / 2 + 6 || position.y < -1 || position.y > 18;
}

function removeAt(collection, index) {
  const item = collection[index];
  collection.splice(index, 1);
  if (item.userData.owner === "player" || item.userData.owner === "enemy") {
    recycleShot(item);
    return;
  }
  world.scene.remove(item);
}

function recycleShot(shot) {
  world.scene.remove(shot);
  shot.visible = false;
  world.shotPools[shot.userData.owner].push(shot);
}

function updateHud() {
  ui.score.textContent = state.score.toString();
  ui.hits.textContent = state.hits.toString();
  ui.hearts.textContent = "💚".repeat(Math.max(0, state.lives)) || "💔";
  ui.progress.style.width = `${Math.min(100, (state.hits / TARGET_HITS) * 100)}%`;
}

function showToast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.add("show");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => ui.toast.classList.remove("show"), 1100);
}

function randomHitText() {
  const messages = ["בול!", "פגיעה נקייה", "עוד עב״ם ירד", "הלייזר התחמם", "יפה, ממשיכים"];
  return messages[Math.floor(Math.random() * messages.length)];
}

function resize() {
  world.camera.aspect = window.innerWidth / window.innerHeight;
  world.camera.updateProjectionMatrix();
  world.renderer.setSize(window.innerWidth, window.innerHeight);
}
