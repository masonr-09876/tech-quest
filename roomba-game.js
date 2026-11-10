/* ==========================================================
   The Roomba Revolution — Full 3D WebGL Game (Three.js)
   Supports Keyboard+Mouse, Keyboard-Only, and Gamepad controls
   ========================================================== */
(() => {
  const canvas = document.getElementById("game-canvas");
  if (!canvas || typeof THREE === "undefined") return;

  // Logical game arena coordinates (1120 x 630 mapped into 3D space)
  const W = 1120;
  const H = 630;
  const SCALE = 0.1; // 112 x 63 3D units
  const to3DX = (x) => (x - W / 2) * SCALE;
  const to3DZ = (y) => (y - H / 2) * SCALE;
  const from3DX = (wx) => wx / SCALE + W / 2;
  const from3DZ = (wz) => wz / SCALE + H / 2;

  // Ammo definitions
  const AMMO_TYPES = [
    { key: "marble", name: "Marbles", color: 0x3ee6cf, hex: "#3ee6cf", recoil: 2.5, speed: 11.5, radius: 7 },
    { key: "sock", name: "Stray Sock", color: 0xf5a83a, hex: "#f5a83a", recoil: 3.2, speed: 10.0, radius: 9 },
    { key: "food", name: "Pet Food", color: 0xe86a92, hex: "#e86a92", recoil: 2.0, speed: 10.5, radius: 7 },
    { key: "can", name: "Soda Can", color: 0xff5c5c, hex: "#ff5c5c", recoil: 6.5, speed: 13.5, radius: 10 }
  ];

  // Stage definitions
  const STAGES = [
    {
      id: 1,
      name: "1. Kitchen Disaster (3D)",
      eyebrow: "STAGE 1 · THE KITCHEN DISASTER (3D)",
      title: "The Kitchen Disaster",
      desc: "Dodge the cereal-throwing toddler and territorial cat in full 3D! Suck up ammo and shoot a Soda Can or Marble at the glowing Fridge Target (back-right) to unlock the Exit Door, or jam the red security laser with a Stray Sock!",
      floorColor: 0x1c2433,
      tileColor: 0x263147,
      wallColor: 0x151b26,
      dock: { x: 120, y: 510, r: 38 },
      exit: { x: 1055, y: 315, w: 42, h: 115 },
      target: { x: 860, y: 110, r: 30, label: "FRIDGE KEY", hp: 1 },
      laser: { x: 950, y: 165, w: 16, h: 300, jammedTimer: 0 },
      mudZones: [{ x: 420, y: 250, w: 230, h: 160, color: 0xf5a83a, label: "Cereal Spill" }],
      enemies: [
        { type: "human", label: "Toddler", x: 520, y: 190, vx: 2.1, vy: 1.6, r: 26, color: 0xff7b72, stun: 0 },
        { type: "cat", label: "Tabby Cat", x: 700, y: 460, vx: -2.5, vy: -1.8, r: 21, color: 0xf5a83a, stun: 0 }
      ]
    },
    {
      id: 2,
      name: "2. Living Room War Zone (3D)",
      eyebrow: "STAGE 2 · THE LIVING ROOM WAR ZONE (3D)",
      title: "The Living Room War Zone",
      desc: "A massive Golden Retriever blocks the exit couch and heavy human feet patrol the shag rug! Blast the target or jam the security laser gate to escape.",
      floorColor: 0x231d2e,
      tileColor: 0x2e263d,
      wallColor: 0x181420,
      dock: { x: 120, y: 120, r: 38 },
      exit: { x: 1055, y: 315, w: 42, h: 115 },
      target: { x: 920, y: 315, r: 32, label: "SLEEPING DOG", hp: 1 },
      laser: { x: 650, y: 95, w: 16, h: 440, jammedTimer: 0 },
      mudZones: [{ x: 310, y: 140, w: 250, h: 350, color: 0x9b5de5, label: "Thick Shag Rug" }],
      enemies: [
        { type: "human", label: "Heavy Feet", x: 460, y: 300, vx: 2.4, vy: 2.1, r: 28, color: 0xff7b72, stun: 0 },
        { type: "cat", label: "Angry Cat", x: 790, y: 200, vx: -2.8, vy: 2.3, r: 21, color: 0xf5a83a, stun: 0 }
      ]
    },
    {
      id: 3,
      name: "3. The Backyard Jungle (3D)",
      eyebrow: "STAGE 3 · THE BACKYARD JUNGLE (3D)",
      title: "The Backyard Jungle",
      desc: "Tall grass drains your battery faster! Outrun the spinning 3D Automated Lawnmower—your ultimate rival—and smash the Fence Latch twice to escape!",
      floorColor: 0x142820,
      tileColor: 0x1b352b,
      wallColor: 0x0f1f18,
      dock: { x: 120, y: 315, r: 38 },
      exit: { x: 1055, y: 315, w: 42, h: 115 },
      target: { x: 920, y: 315, r: 32, label: "FENCE LATCH", hp: 2 },
      laser: { x: 760, y: 110, w: 16, h: 410, jammedTimer: 0 },
      mudZones: [{ x: 260, y: 85, w: 420, h: 460, color: 0x2ec4b6, label: "Tall Grass" }],
      enemies: [
        { type: "mower", label: "Rival Lawnmower", x: 560, y: 315, vx: 3.1, vy: 2.6, r: 30, color: 0xff3b3b, stun: 0 },
        { type: "cat", label: "Feral Cat", x: 840, y: 460, vx: -2.7, vy: -2.4, r: 21, color: 0xf5a83a, stun: 0 }
      ]
    }
  ];

  // ---------- Three.js Scene Setup ----------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(W, H, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0e14);
  scene.fog = new THREE.FogExp2(0x0b0e14, 0.0065);

  const camera = new THREE.PerspectiveCamera(48, W / H, 0.5, 300);
  let cameraMode = "follow"; // "follow" | "arena"

  // Lights
  const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.85);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.15);
  dirLight.position.set(28, 65, 36);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near = 10;
  dirLight.shadow.camera.far = 160;
  const d = 65;
  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = -d;
  scene.add(dirLight);

  const dockLight = new THREE.PointLight(0x3ee6cf, 2.2, 22);
  scene.add(dockLight);

  const exitLight = new THREE.PointLight(0xff5c5c, 2.2, 25);
  scene.add(exitLight);

  // Groups for dynamic stage objects
  const stageGroup = new THREE.Group();
  const dynamicGroup = new THREE.Group();
  scene.add(stageGroup);
  scene.add(dynamicGroup);

  // ---------- Build 3D Roomba Mesh ----------
  const roombaGroup = new THREE.Group();
  scene.add(roombaGroup);

  // Main cylindrical body
  const bodyGeo = new THREE.CylinderGeometry(2.2, 2.35, 0.95, 32);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e2636, metalness: 0.55, roughness: 0.35 });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.y = 0.65;
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  roombaGroup.add(bodyMesh);

  // Glowing neon teal rim
  const rimGeo = new THREE.TorusGeometry(2.22, 0.09, 12, 36);
  const rimMat = new THREE.MeshBasicMaterial({ color: 0x3ee6cf });
  const rimMesh = new THREE.Mesh(rimGeo, rimMat);
  rimMesh.rotation.x = Math.PI / 2;
  rimMesh.position.y = 1.12;
  roombaGroup.add(rimMesh);

  // Center power button
  const btnGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.12, 24);
  const btnMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x3ee6cf, emissiveIntensity: 0.4 });
  const btnMesh = new THREE.Mesh(btnGeo, btnMat);
  btnMesh.position.y = 1.15;
  roombaGroup.add(btnMesh);

  // Eyes on front bumper (+X is forward)
  const eyeGeo = new THREE.BoxGeometry(0.2, 0.28, 0.55);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x3ee6cf });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(2.18, 0.72, -0.65);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(2.18, 0.72, 0.65);
  roombaGroup.add(leftEye, rightEye);

  // Exhaust Cannon Turret on top
  const cannonGeo = new THREE.CylinderGeometry(0.38, 0.48, 1.35, 16);
  cannonGeo.rotateZ(-Math.PI / 2);
  const cannonMat = new THREE.MeshStandardMaterial({ color: 0xf5a83a, metalness: 0.4, roughness: 0.3 });
  const cannonMesh = new THREE.Mesh(cannonGeo, cannonMat);
  cannonMesh.position.set(1.45, 1.35, 0);
  roombaGroup.add(cannonMesh);

  // Wheels (scale up when Monster Wheels upgrade is bought)
  const wheelGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.45, 18);
  wheelGeo.rotateX(Math.PI / 2);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f131a, roughness: 0.8 });
  const leftWheel = new THREE.Mesh(wheelGeo, wheelMat);
  leftWheel.position.set(-0.2, 0.75, -2.15);
  const rightWheel = new THREE.Mesh(wheelGeo, wheelMat);
  rightWheel.position.set(-0.2, 0.75, 2.15);
  roombaGroup.add(leftWheel, rightWheel);

  // Spinning side brush
  const brushGroup = new THREE.Group();
  brushGroup.position.set(1.5, 0.2, 1.5);
  for (let i = 0; i < 3; i++) {
    const whisker = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.06, 0.08),
      new THREE.MeshBasicMaterial({ color: 0x3ee6cf })
    );
    whisker.rotation.y = (i * Math.PI) / 1.5;
    brushGroup.add(whisker);
  }
  roombaGroup.add(brushGroup);

  // 3D Suck Vortex Ring
  const vortexGeo = new THREE.RingGeometry(2.6, 9.5, 36);
  vortexGeo.rotateX(-Math.PI / 2);
  const vortexMat = new THREE.MeshBasicMaterial({
    color: 0x3ee6cf,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide
  });
  const vortexMesh = new THREE.Mesh(vortexGeo, vortexMat);
  vortexMesh.position.y = 0.15;
  vortexMesh.visible = false;
  roombaGroup.add(vortexMesh);

  // 3D Aiming Laser Sight Line & Reticle
  const aimDotsGroup = new THREE.Group();
  for (let i = 1; i <= 8; i++) {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x3ee6cf })
    );
    dot.position.set(2.2 + i * 1.45, 0.8, 0);
    aimDotsGroup.add(dot);
  }
  roombaGroup.add(aimDotsGroup);

  // Persistent game state
  let stageIdx = 0;
  let dustBunnies = 0;
  const upgrades = { wheels: false, suck: false, boost: false };
  const ammoCounts = { marble: 3, sock: 2, food: 2, can: 2 };
  let selectedAmmoIdx = 0;

  const roomba = {
    x: 140,
    y: 315,
    vx: 0,
    vy: 0,
    r: 22,
    aimAngle: 0,
    battery: 100,
    maxBattery: 100,
    boostCooldown: 0,
    invuln: 0
  };

  let items = [];
  let projectiles = [];
  let slipZones = [];
  let lures = [];
  let particles = [];
  let stageState = null;
  let running = false;

  // Stage 3D references
  let targetMesh = null;
  let laserBeamMesh = null;
  let exitDoorMesh = null;
  let dockRingMesh = null;

  // Input state
  const keys = {};
  let mouseDownLeft = false;
  const raycaster = new THREE.Raycaster();
  const mouseNDC = new THREE.Vector2();
  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const intersectPt = new THREE.Vector3();

  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k) && running) {
      e.preventDefault();
    }
    keys[k] = true;

    if (k === "q" || k === "i") cycleAmmo(-1);
    if (k === "e" || k === "o") cycleAmmo(1);
    if (k === "c") toggleCameraMode();
    if ((k === "k" || k === "z") && running) shootAmmo();
    if ((k === "l" || k === "x" || k === "shift") && running) triggerBoost();
  });

  window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  // 3D Raycast mouse aiming onto floor plane
  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouseNDC, camera);
    if (raycaster.ray.intersectPlane(floorPlane, intersectPt)) {
      const gx = from3DX(intersectPt.x);
      const gy = from3DZ(intersectPt.z);
      roomba.aimAngle = Math.atan2(gy - roomba.y, gx - roomba.x);
    }
  });

  canvas.addEventListener("mousedown", (e) => {
    if (!running) return;
    if (e.button === 0) mouseDownLeft = true;
    if (e.button === 2) shootAmmo();
  });
  window.addEventListener("mouseup", (e) => {
    if (e.button === 0) mouseDownLeft = false;
  });
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  canvas.addEventListener("wheel", (e) => {
    if (!running) return;
    e.preventDefault();
    cycleAmmo(e.deltaY > 0 ? 1 : -1);
  }, { passive: false });

  function toggleCameraMode() {
    cameraMode = cameraMode === "follow" ? "arena" : "follow";
    const btn = document.getElementById("btn-camera");
    if (btn) btn.textContent = cameraMode === "follow" ? "Cam: 3D Follow" : "Cam: 3D Arena";
  }

  const camBtn = document.getElementById("btn-camera");
  if (camBtn) camBtn.addEventListener("click", toggleCameraMode);

  function cycleAmmo(dir) {
    selectedAmmoIdx = (selectedAmmoIdx + dir + AMMO_TYPES.length) % AMMO_TYPES.length;
    updateHud();
  }

  function clearGroup(grp) {
    while (grp.children.length > 0) {
      const obj = grp.children[0];
      grp.remove(obj);
    }
  }

  function createItemMesh(type) {
    const grp = new THREE.Group();
    if (type === "marble") {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.85, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x3ee6cf, metalness: 0.3, roughness: 0.15 })
      );
      m.position.y = 0.85;
      m.castShadow = true;
      grp.add(m);
    } else if (type === "sock") {
      const mat = new THREE.MeshStandardMaterial({ color: 0xf5a83a, roughness: 0.7 });
      const p1 = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.7, 0.75), mat);
      const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.85, 1.1), mat);
      p1.position.set(0.2, 0.4, 0);
      p2.position.set(-0.3, 0.5, 0.3);
      p1.castShadow = true;
      grp.add(p1, p2);
    } else if (type === "food") {
      const m = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.85),
        new THREE.MeshStandardMaterial({ color: 0xe86a92, roughness: 0.5 })
      );
      m.position.y = 0.8;
      m.castShadow = true;
      grp.add(m);
    } else if (type === "can") {
      const m = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.65, 1.65, 16),
        new THREE.MeshStandardMaterial({ color: 0xff5c5c, metalness: 0.6, roughness: 0.25 })
      );
      m.rotation.z = Math.PI / 3;
      m.position.y = 0.8;
      m.castShadow = true;
      grp.add(m);
    } else {
      // Dust bunny cluster
      const mat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.9 });
      for (let i = 0; i < 3; i++) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(0.6, 10, 10), mat);
        puff.position.set((i - 1) * 0.45, 0.65 + (i % 2) * 0.2, (i % 2) * 0.3);
        grp.add(puff);
      }
    }
    dynamicGroup.add(grp);
    return grp;
  }

  function createEnemyMesh(en) {
    const grp = new THREE.Group();
    if (en.type === "human") {
      // 3D Human Legs / Giant Slippers
      const legMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.6 });
      const shoeMat = new THREE.MeshStandardMaterial({ color: en.color, roughness: 0.5 });
      const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.75, 6.5, 14), legMat);
      const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.75, 6.5, 14), legMat);
      legL.position.set(0, 3.4, -1.1);
      legR.position.set(0, 3.4, 1.1);
      const shoeL = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.9, 1.35), shoeMat);
      const shoeR = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.9, 1.35), shoeMat);
      shoeL.position.set(0.5, 0.45, -1.1);
      shoeR.position.set(0.5, 0.45, 1.1);
      legL.castShadow = legR.castShadow = true;
      grp.add(legL, legR, shoeL, shoeR);
    } else if (en.type === "cat") {
      // 3D Orange Tabby Cat
      const catMat = new THREE.MeshStandardMaterial({ color: 0xf5a83a, roughness: 0.45 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.5, 1.6), catMat);
      body.position.y = 1.1;
      const head = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.35, 1.45), catMat);
      head.position.set(1.3, 1.85, 0);
      const earGeo = new THREE.ConeGeometry(0.35, 0.65, 4);
      const earL = new THREE.Mesh(earGeo, catMat);
      const earR = new THREE.Mesh(earGeo, catMat);
      earL.position.set(1.3, 2.7, -0.45);
      earR.position.set(1.3, 2.7, 0.45);
      const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2.0, 8), catMat);
      tail.position.set(-1.5, 1.9, 0);
      tail.rotation.z = Math.PI / 4;
      body.castShadow = head.castShadow = true;
      grp.add(body, head, earL, earR, tail);
    } else {
      // 3D Rival Automated Lawnmower
      const mowerMat = new THREE.MeshStandardMaterial({ color: 0xff3b3b, metalness: 0.5, roughness: 0.3 });
      const deck = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.2, 1.2, 24), mowerMat);
      deck.position.y = 0.8;
      const engine = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 1.4, 2.2),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 })
      );
      engine.position.y = 1.8;
      const bladeRing = new THREE.Mesh(
        new THREE.TorusGeometry(3.3, 0.15, 8, 24),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      bladeRing.rotation.x = Math.PI / 2;
      bladeRing.position.y = 0.35;
      deck.castShadow = true;
      grp.add(deck, engine, bladeRing);
    }
    dynamicGroup.add(grp);
    return grp;
  }

  function buildStage3D(def) {
    clearGroup(stageGroup);
    clearGroup(dynamicGroup);

    const arenaW = W * SCALE;
    const arenaH = H * SCALE;

    // 3D Floor Base
    const floorGeo = new THREE.PlaneGeometry(arenaW, arenaH);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({ color: def.floorColor, roughness: 0.75, metalness: 0.1 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.receiveShadow = true;
    stageGroup.add(floorMesh);

    // 3D Grid Lines on Floor
    const gridHelper = new THREE.GridHelper(arenaW, 16, def.tileColor, def.tileColor);
    gridHelper.position.y = 0.03;
    gridHelper.scale.z = arenaH / arenaW;
    stageGroup.add(gridHelper);

    // 3D Room Perimeter Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: def.wallColor, roughness: 0.6 });
    const wallH = 6.5;
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(arenaW + 4, wallH, 2), wallMat);
    northWall.position.set(0, wallH / 2, -arenaH / 2 - 1);
    northWall.receiveShadow = true;
    const southWall = new THREE.Mesh(new THREE.BoxGeometry(arenaW + 4, wallH, 2), wallMat);
    southWall.position.set(0, wallH / 2, arenaH / 2 + 1);
    const westWall = new THREE.Mesh(new THREE.BoxGeometry(2, wallH, arenaH + 4), wallMat);
    westWall.position.set(-arenaW / 2 - 1, wallH / 2, 0);
    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(2, wallH, arenaH + 4), wallMat);
    eastWall.position.set(arenaW / 2 + 1, wallH / 2, 0);
    stageGroup.add(northWall, southWall, westWall, eastWall);

    // Mud / Shag Rug / Tall Grass 3D Zones
    for (const z of def.mudZones) {
      const zw = z.w * SCALE;
      const zh = z.h * SCALE;
      const zx = to3DX(z.x + z.w / 2);
      const zz = to3DZ(z.y + z.h / 2);
      const zoneMesh = new THREE.Mesh(
        new THREE.BoxGeometry(zw, 0.25, zh),
        new THREE.MeshStandardMaterial({ color: z.color, transparent: true, opacity: 0.32, roughness: 0.9 })
      );
      zoneMesh.position.set(zx, 0.13, zz);
      stageGroup.add(zoneMesh);
    }

    // 3D Charging Dock
    const dkX = to3DX(def.dock.x);
    const dkZ = to3DZ(def.dock.y);
    const dkR = def.dock.r * SCALE;
    const dockBase = new THREE.Mesh(
      new THREE.CylinderGeometry(dkR, dkR * 1.08, 0.3, 32),
      new THREE.MeshStandardMaterial({ color: 0x112222, emissive: 0x3ee6cf, emissiveIntensity: 0.35 })
    );
    dockBase.position.set(dkX, 0.15, dkZ);
    dockRingMesh = new THREE.Mesh(
      new THREE.TorusGeometry(dkR * 0.95, 0.14, 12, 32),
      new THREE.MeshBasicMaterial({ color: 0x3ee6cf })
    );
    dockRingMesh.rotation.x = Math.PI / 2;
    dockRingMesh.position.set(dkX, 0.35, dkZ);
    const dockTower = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 2.8, 2.4),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, emissive: 0x3ee6cf, emissiveIntensity: 0.25 })
    );
    dockTower.position.set(dkX - dkR + 0.5, 1.4, dkZ);
    stageGroup.add(dockBase, dockRingMesh, dockTower);
    dockLight.position.set(dkX, 3.5, dkZ);

    // 3D Target Objective Pedestal
    if (def.target) {
      const tx = to3DX(def.target.x);
      const tz = to3DZ(def.target.y);
      const tr = def.target.r * SCALE;
      targetMesh = new THREE.Group();
      const ped = new THREE.Mesh(
        new THREE.CylinderGeometry(tr, tr * 1.15, 3.2, 24),
        new THREE.MeshStandardMaterial({ color: 0xf5a83a, emissive: 0xf5a83a, emissiveIntensity: 0.3, roughness: 0.3 })
      );
      ped.position.y = 1.6;
      ped.castShadow = true;
      const crown = new THREE.Mesh(
        new THREE.OctahedronGeometry(tr * 0.75),
        new THREE.MeshBasicMaterial({ color: 0xfef08a, wireframe: false })
      );
      crown.position.y = 4.2;
      targetMesh.add(ped, crown);
      targetMesh.position.set(tx, 0, tz);
      stageGroup.add(targetMesh);
    }

    // 3D Laser Gate Hazard
    if (def.laser) {
      const lx = to3DX(def.laser.x + def.laser.w / 2);
      const lz1 = to3DZ(def.laser.y);
      const lz2 = to3DZ(def.laser.y + def.laser.h);
      const pillarGeo = new THREE.CylinderGeometry(0.6, 0.7, 4.2, 16);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 });
      const p1 = new THREE.Mesh(pillarGeo, pillarMat);
      const p2 = new THREE.Mesh(pillarGeo, pillarMat);
      p1.position.set(lx, 2.1, lz1);
      p2.position.set(lx, 2.1, lz2);
      stageGroup.add(p1, p2);

      laserBeamMesh = new THREE.Group();
      const beamLen = Math.abs(lz2 - lz1);
      for (let h = 1.0; h <= 3.2; h += 1.1) {
        const beam = new THREE.Mesh(
          new THREE.CylinderGeometry(0.16, 0.16, beamLen, 8),
          new THREE.MeshBasicMaterial({ color: 0xff3b3b })
        );
        beam.rotation.x = Math.PI / 2;
        beam.position.set(lx, h, (lz1 + lz2) / 2);
        laserBeamMesh.add(beam);
      }
      stageGroup.add(laserBeamMesh);
    }

    // 3D Exit Doorway
    const ex = def.exit;
    const exX = to3DX(ex.x + ex.w / 2);
    const exZ = to3DZ(ex.y + ex.h / 2);
    const exH = ex.h * SCALE;
    exitDoorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 5.5, exH),
      new THREE.MeshStandardMaterial({
        color: 0xff5c5c,
        emissive: 0xff5c5c,
        emissiveIntensity: 0.45,
        transparent: true,
        opacity: 0.85
      })
    );
    exitDoorMesh.position.set(exX, 2.75, exZ);
    stageGroup.add(exitDoorMesh);
    exitLight.position.set(exX - 3, 4, exZ);
  }

  function spawnFloorItems() {
    items = [];
    const types = ["marble", "sock", "food", "can", "dust", "dust"];
    for (let i = 0; i < 16; i++) {
      const t = types[i % types.length];
      const x = 180 + Math.random() * (W - 320);
      const y = 80 + Math.random() * (H - 160);
      const mesh = createItemMesh(t);
      mesh.position.set(to3DX(x), 0, to3DZ(y));
      items.push({ type: t, x, y, r: t === "dust" ? 8 : 9, mesh });
    }
  }

  function loadStage(idx) {
    stageIdx = idx % STAGES.length;
    const def = STAGES[stageIdx];
    stageState = JSON.parse(JSON.stringify(def));
    roomba.x = 120;
    roomba.y = 315;
    roomba.vx = 0;
    roomba.vy = 0;
    roomba.maxBattery = upgrades.boost ? 135 : 100;
    roomba.battery = roomba.maxBattery;
    roomba.invuln = 0;
    projectiles = [];
    slipZones = [];
    lures = [];
    particles = [];

    buildStage3D(stageState);
    spawnFloorItems();

    for (const en of stageState.enemies) {
      en.mesh = createEnemyMesh(en);
    }

    updateHud();

    document.getElementById("overlay-eyebrow").textContent = def.eyebrow;
    document.getElementById("overlay-title").textContent = def.title;
    document.getElementById("overlay-desc").textContent = def.desc;
    document.getElementById("start-overlay").hidden = false;
    running = false;
  }

  function shootAmmo() {
    const ammo = AMMO_TYPES[selectedAmmoIdx];
    if ((ammoCounts[ammo.key] || 0) <= 0) return;
    ammoCounts[ammo.key]--;

    const px = roomba.x + Math.cos(roomba.aimAngle) * (roomba.r + 10);
    const py = roomba.y + Math.sin(roomba.aimAngle) * (roomba.r + 10);
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(ammo.radius * SCALE * 1.15, 14, 14),
      new THREE.MeshBasicMaterial({ color: ammo.color })
    );
    mesh.position.set(to3DX(px), 1.1, to3DZ(py));
    dynamicGroup.add(mesh);

    projectiles.push({
      type: ammo.key,
      color: ammo.color,
      x: px,
      y: py,
      vx: Math.cos(roomba.aimAngle) * ammo.speed,
      vy: Math.sin(roomba.aimAngle) * ammo.speed,
      r: ammo.radius,
      life: 110,
      mesh
    });

    // Recoil kick backward
    roomba.vx -= Math.cos(roomba.aimAngle) * ammo.recoil;
    roomba.vy -= Math.sin(roomba.aimAngle) * ammo.recoil;
    burst3D(roomba.x, roomba.y, ammo.color, 7);
    updateHud();
  }

  function triggerBoost() {
    if (roomba.boostCooldown > 0 || roomba.battery < 8) return;
    const mult = upgrades.boost ? 11 : 7.5;
    const angle = Math.hypot(roomba.vx, roomba.vy) > 0.3
      ? Math.atan2(roomba.vy, roomba.vx)
      : roomba.aimAngle;
    roomba.vx += Math.cos(angle) * mult;
    roomba.vy += Math.sin(angle) * mult;
    roomba.battery = Math.max(0, roomba.battery - 6);
    roomba.boostCooldown = upgrades.boost ? 28 : 50;
    burst3D(roomba.x, roomba.y, 0x3ee6cf, 12);
  }

  function burst3D(x, y, colorHex, count) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 1.5 + Math.random() * 4;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.42, 0.42),
        new THREE.MeshBasicMaterial({ color: colorHex })
      );
      mesh.position.set(to3DX(x), 0.9 + Math.random() * 1.2, to3DZ(y));
      dynamicGroup.add(mesh);
      particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        vy3d: 0.08 + Math.random() * 0.12,
        life: 24,
        mesh
      });
    }
  }

  function pollGamepad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = pads && pads[0];
    if (!gp) return { ax: 0, ay: 0, sucking: false };
    const lx = Math.abs(gp.axes[0]) > 0.15 ? gp.axes[0] : 0;
    const ly = Math.abs(gp.axes[1]) > 0.15 ? gp.axes[1] : 0;
    const rx = Math.abs(gp.axes[2]) > 0.2 ? gp.axes[2] : 0;
    const ry = Math.abs(gp.axes[3]) > 0.2 ? gp.axes[3] : 0;
    if (rx || ry) roomba.aimAngle = Math.atan2(ry, rx);
    if (gp.buttons[7]?.pressed && !gp._rtPrev) shootAmmo();
    gp._rtPrev = gp.buttons[7]?.pressed;
    if (gp.buttons[0]?.pressed && !gp._aPrev) triggerBoost();
    gp._aPrev = gp.buttons[0]?.pressed;
    return { ax: lx, ay: ly, sucking: Boolean(gp.buttons[6]?.pressed) };
  }

  function update() {
    const tNow = performance.now() * 0.004;
    brushGroup.rotation.y = tNow * 3;
    if (dockRingMesh) dockRingMesh.scale.setScalar(0.95 + Math.sin(tNow * 2) * 0.06);
    if (targetMesh) targetMesh.rotation.y = tNow;

    // Upgrade visual scaling on Roomba
    const wheelScale = upgrades.wheels ? 1.45 : 1.0;
    leftWheel.scale.setScalar(wheelScale);
    rightWheel.scale.setScalar(wheelScale);

    if (running && stageState) {
      const gp = pollGamepad();

      // Aim with Arrow Keys
      const aimDx = (keys["arrowright"] ? 1 : 0) - (keys["arrowleft"] ? 1 : 0);
      const aimDy = (keys["arrowdown"] ? 1 : 0) - (keys["arrowup"] ? 1 : 0);
      if (aimDx !== 0 || aimDy !== 0) {
        roomba.aimAngle = Math.atan2(aimDy, aimDx);
      }

      // Movement input (WASD + Gamepad)
      let moveX = (keys["d"] ? 1 : 0) - (keys["a"] ? 1 : 0) + gp.ax;
      let moveY = (keys["s"] ? 1 : 0) - (keys["w"] ? 1 : 0) + gp.ay;
      const mag = Math.hypot(moveX, moveY);
      if (mag > 1) { moveX /= mag; moveY /= mag; }

      // Slow zone check
      let inSlowZone = false;
      for (const z of stageState.mudZones) {
        if (roomba.x > z.x && roomba.x < z.x + z.w && roomba.y > z.y && roomba.y < z.y + z.h) {
          inSlowZone = true;
        }
      }

      const accel = upgrades.wheels ? 0.65 : (inSlowZone ? 0.28 : 0.45);
      const friction = upgrades.wheels ? 0.84 : 0.92;

      roomba.vx = (roomba.vx + moveX * accel) * friction;
      roomba.vy = (roomba.vy + moveY * accel) * friction;
      roomba.x = Math.max(45, Math.min(W - 45, roomba.x + roomba.vx));
      roomba.y = Math.max(45, Math.min(H - 45, roomba.y + roomba.vy));

      if (roomba.boostCooldown > 0) roomba.boostCooldown--;
      if (roomba.invuln > 0) roomba.invuln--;

      // Battery drain & recharge dock
      const drain = (inSlowZone && !upgrades.wheels && stageIdx === 2) ? 0.065 : 0.028;
      roomba.battery = Math.max(0, roomba.battery - drain);

      const dDock = Math.hypot(roomba.x - stageState.dock.x, roomba.y - stageState.dock.y);
      if (dDock < stageState.dock.r + roomba.r) {
        roomba.battery = Math.min(roomba.maxBattery, roomba.battery + 0.55);
      }

      if (roomba.battery <= 0) {
        showBanner("Battery Depleted!", "You ran out of charge before reaching the 3D charging dock. Try again!");
        return;
      }

      // Suck Mode
      const sucking = Boolean(keys[" "] || keys["j"] || mouseDownLeft || gp.sucking);
      const suckRadius = upgrades.suck ? 165 : 95;
      vortexMesh.visible = sucking;
      vortexMesh.scale.setScalar(upgrades.suck ? 1.7 : 1.0);

      if (sucking) {
        for (let i = items.length - 1; i >= 0; i--) {
          const it = items[i];
          const dist = Math.hypot(it.x - roomba.x, it.y - roomba.y);
          if (dist < suckRadius) {
            const pull = upgrades.suck ? 5.2 : 3.2;
            it.x += ((roomba.x - it.x) / (dist || 1)) * pull;
            it.y += ((roomba.y - it.y) / (dist || 1)) * pull;
            it.mesh.position.set(to3DX(it.x), 0, to3DZ(it.y));
            if (dist < roomba.r + it.r) {
              if (it.type === "dust") {
                dustBunnies++;
                burst3D(it.x, it.y, 0xf5a83a, 8);
              } else {
                ammoCounts[it.type] = (ammoCounts[it.type] || 0) + 1;
                burst3D(it.x, it.y, 0x3ee6cf, 6);
              }
              dynamicGroup.remove(it.mesh);
              items.splice(i, 1);
              updateHud();
            }
          }
        }
      }

      // Respawn floor items if low
      if (items.length < 8 && Math.random() < 0.03) {
        const types = ["marble", "sock", "food", "can", "dust"];
        const t = types[Math.floor(Math.random() * types.length)];
        const x = 160 + Math.random() * (W - 300);
        const y = 80 + Math.random() * (H - 160);
        const mesh = createItemMesh(t);
        mesh.position.set(to3DX(x), 0, to3DZ(y));
        items.push({ type: t, x, y, r: 9, mesh });
      }

      // Rotate floor items gently
      for (const it of items) {
        it.mesh.rotation.y = tNow;
      }

      // Projectiles update
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.mesh.position.set(to3DX(p.x), 1.1, to3DZ(p.y));

        // Hit target objective
        if (stageState.target && stageState.target.hp > 0) {
          const dt = Math.hypot(p.x - stageState.target.x, p.y - stageState.target.y);
          if (dt < stageState.target.r + p.r) {
            stageState.target.hp--;
            burst3D(p.x, p.y, 0xf5a83a, 16);
            if (stageState.target.hp <= 0 && targetMesh) {
              targetMesh.visible = false;
            }
            dynamicGroup.remove(p.mesh);
            projectiles.splice(i, 1);
            continue;
          }
        }

        // Hit laser with sock or can
        const lz = stageState.laser;
        if (lz && lz.jammedTimer <= 0 && p.x > lz.x - 14 && p.x < lz.x + lz.w + 14 && p.y > lz.y && p.y < lz.y + lz.h) {
          if (p.type === "sock" || p.type === "can") {
            lz.jammedTimer = 360;
            burst3D(p.x, p.y, 0x3ee6cf, 14);
          }
          dynamicGroup.remove(p.mesh);
          projectiles.splice(i, 1);
          continue;
        }

        // Hit enemies
        let hitEnemy = false;
        for (const en of stageState.enemies) {
          if (Math.hypot(p.x - en.x, p.y - en.y) < en.r + p.r) {
            en.stun = 180;
            burst3D(en.x, en.y, p.color, 14);
            hitEnemy = true;
            break;
          }
        }
        if (hitEnemy) {
          dynamicGroup.remove(p.mesh);
          projectiles.splice(i, 1);
          continue;
        }

        if (p.x < 40 || p.x > W - 40) p.vx *= -1;
        if (p.y < 40 || p.y > H - 40) p.vy *= -1;

        if (p.life <= 0) {
          if (p.type === "marble") {
            const szMesh = new THREE.Mesh(
              new THREE.CylinderGeometry(3.4, 3.4, 0.12, 24),
              new THREE.MeshBasicMaterial({ color: 0x3ee6cf, transparent: true, opacity: 0.35 })
            );
            szMesh.position.set(to3DX(p.x), 0.08, to3DZ(p.y));
            dynamicGroup.add(szMesh);
            slipZones.push({ x: p.x, y: p.y, r: 34, life: 420, mesh: szMesh });
          }
          if (p.type === "food") {
            const lureMesh = new THREE.Mesh(
              new THREE.CylinderGeometry(3.8, 3.8, 0.12, 24),
              new THREE.MeshBasicMaterial({ color: 0xe86a92, transparent: true, opacity: 0.35 })
            );
            lureMesh.position.set(to3DX(p.x), 0.08, to3DZ(p.y));
            dynamicGroup.add(lureMesh);
            lures.push({ x: p.x, y: p.y, r: 40, life: 360, mesh: lureMesh });
          }
          dynamicGroup.remove(p.mesh);
          projectiles.splice(i, 1);
        }
      }

      if (stageState.laser) {
        if (stageState.laser.jammedTimer > 0) stageState.laser.jammedTimer--;
        if (laserBeamMesh) laserBeamMesh.visible = stageState.laser.jammedTimer <= 0;
      }

      // Slip zones & lures lifetime
      for (let i = slipZones.length - 1; i >= 0; i--) {
        if (--slipZones[i].life <= 0) {
          dynamicGroup.remove(slipZones[i].mesh);
          slipZones.splice(i, 1);
        }
      }
      for (let i = lures.length - 1; i >= 0; i--) {
        if (--lures[i].life <= 0) {
          dynamicGroup.remove(lures[i].mesh);
          lures.splice(i, 1);
        }
      }

      // Enemies update
      for (const en of stageState.enemies) {
        if (en.stun > 0) {
          en.stun--;
          en.mesh.rotation.z = Math.PI / 2.2; // Comically tipped over when stunned!
        } else {
          en.mesh.rotation.z = 0;
          if (en.type === "cat" && lures.length) {
            const l = lures[0];
            const a = Math.atan2(l.y - en.y, l.x - en.x);
            en.x += Math.cos(a) * 2.4;
            en.y += Math.sin(a) * 2.4;
            en.mesh.rotation.y = -a;
          } else {
            en.x += en.vx;
            en.y += en.vy;
            if (en.x < 90 || en.x > W - 140) en.vx *= -1;
            if (en.y < 70 || en.y > H - 70) en.vy *= -1;
            en.mesh.rotation.y = -Math.atan2(en.vy, en.vx);
          }

          for (const s of slipZones) {
            if (Math.hypot(en.x - s.x, en.y - s.y) < en.r + s.r) {
              en.stun = 160;
              burst3D(en.x, en.y, 0x3ee6cf, 10);
            }
          }

          if (roomba.invuln <= 0 && Math.hypot(en.x - roomba.x, en.y - roomba.y) < en.r + roomba.r) {
            roomba.battery = Math.max(0, roomba.battery - 18);
            roomba.invuln = 45;
            burst3D(roomba.x, roomba.y, 0xff5c5c, 14);
          }
        }
        en.mesh.position.set(to3DX(en.x), 0, to3DZ(en.y));
      }

      // Laser hazard collision
      const lz = stageState.laser;
      if (lz && lz.jammedTimer <= 0 && roomba.invuln <= 0) {
        if (roomba.x + roomba.r > lz.x && roomba.x - roomba.r < lz.x + lz.w &&
            roomba.y + roomba.r > lz.y && roomba.y - roomba.r < lz.y + lz.h) {
          roomba.battery = Math.max(0, roomba.battery - 22);
          roomba.vx = -6;
          roomba.invuln = 40;
          burst3D(roomba.x, roomba.y, 0xff3b3b, 15);
        }
      }

      // Exit Door state & win check
      const ex = stageState.exit;
      const unlocked = !stageState.target || stageState.target.hp <= 0;
      if (exitDoorMesh) {
        exitDoorMesh.material.color.setHex(unlocked ? 0x3ee6cf : 0xff5c5c);
        exitDoorMesh.material.emissive.setHex(unlocked ? 0x3ee6cf : 0xff5c5c);
        exitLight.color.setHex(unlocked ? 0x3ee6cf : 0xff5c5c);
      }

      if (unlocked &&
          roomba.x + roomba.r > ex.x &&
          roomba.y > ex.y && roomba.y < ex.y + ex.h) {
        dustBunnies += 3;
        updateHud();
        if (stageIdx < STAGES.length - 1) {
          loadStage(stageIdx + 1);
        } else {
          showBanner(
            "You Escaped the 3D Mansion! 🎉",
            "The Roomba Revolution is victorious! You conquered the Kitchen, Living Room, and Backyard Jungle in full 3D!"
          );
          stageIdx = 0;
        }
      }

      // Particles update
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.mesh.position.x = to3DX(pt.x);
        pt.mesh.position.z = to3DZ(pt.y);
        pt.mesh.position.y += pt.vy3d;
        pt.vy3d -= 0.01;
        if (--pt.life <= 0) {
          dynamicGroup.remove(pt.mesh);
          particles.splice(i, 1);
        }
      }

      updateHud();
    }

    // Sync 3D Roomba transform
    const rx3 = to3DX(roomba.x);
    const rz3 = to3DZ(roomba.y);
    roombaGroup.position.set(rx3, 0, rz3);
    roombaGroup.rotation.y = -roomba.aimAngle;
    bodyMat.color.setHex(roomba.invuln % 6 > 3 ? 0xff5c5c : 0x1e2636);

    // Sync 3D Camera
    if (cameraMode === "follow") {
      const targetCamX = rx3 * 0.55;
      const targetCamZ = rz3 * 0.55 + 42;
      camera.position.lerp(new THREE.Vector3(targetCamX, 46, targetCamZ), 0.08);
      camera.lookAt(rx3 * 0.45, 0, rz3 * 0.45);
    } else {
      camera.position.lerp(new THREE.Vector3(0, 74, 48), 0.08);
      camera.lookAt(0, 0, 2);
    }

    renderer.render(scene, camera);
  }

  function showBanner(title, desc) {
    running = false;
    document.getElementById("overlay-eyebrow").textContent = STAGES[stageIdx].eyebrow;
    document.getElementById("overlay-title").textContent = title;
    document.getElementById("overlay-desc").textContent = desc;
    document.getElementById("start-overlay").hidden = false;
  }

  function updateHud() {
    if (!stageState) return;
    document.getElementById("hud-stage").textContent = stageState.name;
    const pct = Math.max(0, Math.min(100, Math.round((roomba.battery / roomba.maxBattery) * 100)));
    const bar = document.getElementById("hud-battery");
    bar.style.width = pct + "%";
    bar.style.background = pct < 25 ? "var(--red)" : pct < 55 ? "var(--amber)" : "var(--teal)";
    document.getElementById("hud-battery-pct").textContent = pct + "%";
    document.getElementById("hud-dust").textContent = dustBunnies;
    document.getElementById("shop-dust").textContent = dustBunnies;

    const belt = document.getElementById("hud-ammo");
    belt.innerHTML = AMMO_TYPES.map((a, idx) => `
      <span class="ammo-slot ${idx === selectedAmmoIdx ? "active" : ""}" data-idx="${idx}">
        ${a.name}: ${ammoCounts[a.key] || 0}
      </span>
    `).join("");

    belt.querySelectorAll(".ammo-slot").forEach((el) => {
      el.addEventListener("click", () => {
        selectedAmmoIdx = Number(el.dataset.idx);
        updateHud();
      });
    });

    const wBtn = document.getElementById("buy-wheels");
    wBtn.textContent = upgrades.wheels ? "Installed ✓" : "Buy (5 Dust)";
    wBtn.disabled = upgrades.wheels || dustBunnies < 5;

    const sBtn = document.getElementById("buy-suck");
    sBtn.textContent = upgrades.suck ? "Installed ✓" : "Buy (5 Dust)";
    sBtn.disabled = upgrades.suck || dustBunnies < 5;

    const bBtn = document.getElementById("buy-boost");
    bBtn.textContent = upgrades.boost ? "Installed ✓" : "Buy (5 Dust)";
    bBtn.disabled = upgrades.boost || dustBunnies < 5;
  }

  // UI Button events
  document.getElementById("btn-start-game").addEventListener("click", () => {
    document.getElementById("start-overlay").hidden = true;
    running = true;
  });

  document.getElementById("btn-restart").addEventListener("click", () => {
    loadStage(stageIdx);
  });

  document.getElementById("btn-open-shop").addEventListener("click", () => {
    updateHud();
    document.getElementById("shop-overlay").hidden = false;
  });

  document.getElementById("btn-close-shop").addEventListener("click", () => {
    document.getElementById("shop-overlay").hidden = true;
  });

  document.getElementById("buy-wheels").addEventListener("click", () => {
    if (dustBunnies >= 5 && !upgrades.wheels) { dustBunnies -= 5; upgrades.wheels = true; updateHud(); }
  });
  document.getElementById("buy-suck").addEventListener("click", () => {
    if (dustBunnies >= 5 && !upgrades.suck) { dustBunnies -= 5; upgrades.suck = true; updateHud(); }
  });
  document.getElementById("buy-boost").addEventListener("click", () => {
    if (dustBunnies >= 5 && !upgrades.boost) { dustBunnies -= 5; upgrades.boost = true; updateHud(); }
  });

  function loop() {
    update();
    requestAnimationFrame(loop);
  }

  loadStage(0);
  requestAnimationFrame(loop);
})();
