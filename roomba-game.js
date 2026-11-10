/* ==========================================================
   The Roomba Revolution — Playable HTML5 Canvas Game
   Supports Keyboard+Mouse, Keyboard-Only, and Gamepad controls
   ========================================================== */
(() => {
  const canvas = document.getElementById("game-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  // Ammo definitions
  const AMMO_TYPES = [
    { key: "marble", name: "Marbles", color: "#3ee6cf", recoil: 2.5, speed: 11, radius: 7, desc: "Creates slip zone" },
    { key: "sock", name: "Stray Sock", color: "#f5a83a", recoil: 3.2, speed: 9.5, radius: 9, desc: "Jams lasers/hazards" },
    { key: "food", name: "Pet Food", color: "#e86a92", recoil: 2.0, speed: 10, radius: 7, desc: "Distracts pets/rivals" },
    { key: "can", name: "Soda Can", color: "#ff5c5c", recoil: 6.5, speed: 13, radius: 10, desc: "Smashes barriers" }
  ];

  // Stage definitions
  const STAGES = [
    {
      id: 1,
      name: "1. Kitchen Disaster",
      eyebrow: "STAGE 1 · THE KITCHEN DISASTER",
      title: "The Kitchen Disaster",
      desc: "Dodge the cereal-throwing toddler and territorial cat! Suck up ammo and shoot a Soda Can or Marble at the Fridge Target (top-right) to knock down the Exit Key, or jam the laser sensor with a Stray Sock!",
      floorColor: "#1a202c",
      tileColor: "#222938",
      dock: { x: 110, y: 520, r: 36 },
      exit: { x: 1045, y: 315, w: 42, h: 110 },
      target: { x: 880, y: 95, r: 28, label: "FRIDGE KEY", hp: 1 },
      laser: { x: 960, y: 180, w: 14, h: 270, jammedTimer: 0 },
      mudZones: [{ x: 420, y: 260, w: 220, h: 150, label: "Cereal Spill" }],
      enemies: [
        { type: "human", label: "Toddler", x: 520, y: 180, vx: 2.1, vy: 1.6, r: 26, color: "#ff7b72", stun: 0 },
        { type: "cat", label: "Tabby Cat", x: 700, y: 460, vx: -2.5, vy: -1.8, r: 20, color: "#f5a83a", stun: 0 }
      ]
    },
    {
      id: 2,
      name: "2. Living Room War Zone",
      eyebrow: "STAGE 2 · THE LIVING ROOM WAR ZONE",
      title: "The Living Room War Zone",
      desc: "A massive Golden Retriever is sleeping right in front of the exit couch, and a human is stomping around! Shoot Pet Food to lure the dog away or smash the wooden cabinet with a Soda Can to unlock the door.",
      floorColor: "#1d1b27",
      tileColor: "#262334",
      dock: { x: 110, y: 110, r: 36 },
      exit: { x: 1045, y: 315, w: 42, h: 110 },
      target: { x: 950, y: 315, r: 32, label: "SLEEPING DOG (Shoot Food/Can)", hp: 1 },
      laser: { x: 640, y: 90, w: 14, h: 450, jammedTimer: 0 },
      mudZones: [
        { x: 310, y: 140, w: 250, h: 350, label: "Thick Shag Rug" }
      ],
      enemies: [
        { type: "human", label: "Heavy Feet", x: 460, y: 300, vx: 2.4, vy: 2.1, r: 28, color: "#ff7b72", stun: 0 },
        { type: "cat", label: "Angry Cat", x: 790, y: 200, vx: -2.8, vy: 2.3, r: 20, color: "#f5a83a", stun: 0 }
      ]
    },
    {
      id: 3,
      name: "3. The Backyard Jungle",
      eyebrow: "STAGE 3 · THE BACKYARD JUNGLE",
      title: "The Backyard Jungle",
      desc: "Tall grass drains your battery faster! Outrun the spinning Automated Lawnmower—your ultimate rival—and blast the Wooden Fence Latch with a Soda Can to escape the mansion for good!",
      floorColor: "#13221d",
      tileColor: "#192c25",
      dock: { x: 120, y: 315, r: 36 },
      exit: { x: 1045, y: 315, w: 42, h: 110 },
      target: { x: 960, y: 315, r: 30, label: "FENCE LATCH", hp: 2 },
      laser: { x: 760, y: 110, w: 14, h: 410, jammedTimer: 0 },
      mudZones: [
        { x: 260, y: 80, w: 420, h: 470, label: "Tall Grass (Drains Battery)" }
      ],
      enemies: [
        { type: "mower", label: "Rival Lawnmower", x: 560, y: 315, vx: 3.1, vy: 2.6, r: 30, color: "#ff4444", stun: 0 },
        { type: "cat", label: "Feral Cat", x: 840, y: 460, vx: -2.7, vy: -2.4, r: 20, color: "#f5a83a", stun: 0 }
      ]
    }
  ];

  // Persistent state
  let stageIdx = 0;
  let dustBunnies = 0;
  const upgrades = { wheels: false, suck: false, boost: false };
  const ammoCounts = { marble: 2, sock: 1, food: 1, can: 1 };
  let selectedAmmoIdx = 0;

  // Roomba state
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

  // Input state
  const keys = {};
  let mouseAimActive = false;
  let mouseDownLeft = false;

  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k) && running) {
      e.preventDefault();
    }
    keys[k] = true;

    if (k === "q" || k === "i") cycleAmmo(-1);
    if (k === "e" || k === "o") cycleAmmo(1);
    if ((k === "k" || k === "z") && running) shootAmmo();
    if ((k === "l" || k === "x" || k === "shift") && running) triggerBoost();
  });

  window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * W;
    const my = ((e.clientY - rect.top) / rect.height) * H;
    roomba.aimAngle = Math.atan2(my - roomba.y, mx - roomba.x);
    mouseAimActive = true;
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

  function cycleAmmo(dir) {
    selectedAmmoIdx = (selectedAmmoIdx + dir + AMMO_TYPES.length) % AMMO_TYPES.length;
    updateHud();
  }

  function spawnFloorItems() {
    items = [];
    const types = ["marble", "sock", "food", "can", "dust", "dust"];
    for (let i = 0; i < 16; i++) {
      const t = types[i % types.length];
      items.push({
        type: t,
        x: 180 + Math.random() * (W - 320),
        y: 70 + Math.random() * (H - 140),
        r: t === "dust" ? 8 : 9
      });
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
    spawnFloorItems();
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

    projectiles.push({
      type: ammo.key,
      color: ammo.color,
      x: roomba.x + Math.cos(roomba.aimAngle) * (roomba.r + 8),
      y: roomba.y + Math.sin(roomba.aimAngle) * (roomba.r + 8),
      vx: Math.cos(roomba.aimAngle) * ammo.speed,
      vy: Math.sin(roomba.aimAngle) * ammo.speed,
      r: ammo.radius,
      life: 110
    });

    // Recoil kick backward
    roomba.vx -= Math.cos(roomba.aimAngle) * ammo.recoil;
    roomba.vy -= Math.sin(roomba.aimAngle) * ammo.recoil;
    burst(roomba.x, roomba.y, ammo.color, 6);
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
    burst(roomba.x, roomba.y, "#3ee6cf", 12);
  }

  function burst(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 1 + Math.random() * 4;
      particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, color, life: 22 });
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
    if (!running || !stageState) return;

    const gp = pollGamepad();

    // Aim with Arrow Keys
    let aimDx = (keys["arrowright"] ? 1 : 0) - (keys["arrowleft"] ? 1 : 0);
    let aimDy = (keys["arrowdown"] ? 1 : 0) - (keys["arrowup"] ? 1 : 0);
    if (aimDx !== 0 || aimDy !== 0) {
      const targetAngle = Math.atan2(aimDy, aimDx);
      roomba.aimAngle = targetAngle;
    }

    // Movement input (WASD + Gamepad)
    let moveX = (keys["d"] ? 1 : 0) - (keys["a"] ? 1 : 0) + gp.ax;
    let moveY = (keys["s"] ? 1 : 0) - (keys["w"] ? 1 : 0) + gp.ay;
    const mag = Math.hypot(moveX, moveY);
    if (mag > 1) { moveX /= mag; moveY /= mag; }

    // Check mud / carpet / tall grass zones
    let inSlowZone = false;
    for (const z of stageState.mudZones) {
      if (roomba.x > z.x && roomba.x < z.x + z.w && roomba.y > z.y && roomba.y < z.y + z.h) {
        inSlowZone = true;
      }
    }

    const accel = upgrades.wheels ? 0.65 : (inSlowZone ? 0.28 : 0.45);
    const friction = upgrades.wheels ? 0.84 : 0.92; // Hardwood drift vs Monster Wheels grip

    roomba.vx = (roomba.vx + moveX * accel) * friction;
    roomba.vy = (roomba.vy + moveY * accel) * friction;
    roomba.x = Math.max(40, Math.min(W - 40, roomba.x + roomba.vx));
    roomba.y = Math.max(40, Math.min(H - 40, roomba.y + roomba.vy));

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
      showBanner("Battery Depleted!", "You ran out of charge before reaching a charging dock. Try again!");
      return;
    }

    // Suck mode (Space / J / Left Click / LT)
    const sucking = Boolean(keys[" "] || keys["j"] || mouseDownLeft || gp.sucking);
    const suckRadius = upgrades.suck ? 165 : 95;
    if (sucking) {
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        const dist = Math.hypot(it.x - roomba.x, it.y - roomba.y);
        if (dist < suckRadius) {
          const pull = upgrades.suck ? 5.2 : 3.2;
          it.x += ((roomba.x - it.x) / (dist || 1)) * pull;
          it.y += ((roomba.y - it.y) / (dist || 1)) * pull;
          if (dist < roomba.r + it.r) {
            if (it.type === "dust") {
              dustBunnies++;
              burst(it.x, it.y, "#f5a83a", 8);
            } else {
              ammoCounts[it.type] = (ammoCounts[it.type] || 0) + 1;
              burst(it.x, it.y, "#3ee6cf", 6);
            }
            items.splice(i, 1);
            updateHud();
          }
        }
      }
    }

    // Keep floor stocked with debris
    if (items.length < 7 && Math.random() < 0.03) {
      const types = ["marble", "sock", "food", "can", "dust"];
      items.push({
        type: types[Math.floor(Math.random() * types.length)],
        x: 160 + Math.random() * (W - 300),
        y: 70 + Math.random() * (H - 140),
        r: 9
      });
    }

    // Projectiles update
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;

      // Hit target objective
      if (stageState.target && stageState.target.hp > 0) {
        const dt = Math.hypot(p.x - stageState.target.x, p.y - stageState.target.y);
        if (dt < stageState.target.r + p.r) {
          stageState.target.hp--;
          burst(p.x, p.y, "#f5a83a", 16);
          projectiles.splice(i, 1);
          continue;
        }
      }

      // Hit laser with sock
      const lz = stageState.laser;
      if (lz && lz.jammedTimer <= 0 && p.x > lz.x - 12 && p.x < lz.x + lz.w + 12 && p.y > lz.y && p.y < lz.y + lz.h) {
        if (p.type === "sock" || p.type === "can") {
          lz.jammedTimer = 360;
          burst(p.x, p.y, "#3ee6cf", 14);
        }
        projectiles.splice(i, 1);
        continue;
      }

      // Hit enemies
      let hitEnemy = false;
      for (const en of stageState.enemies) {
        if (Math.hypot(p.x - en.x, p.y - en.y) < en.r + p.r) {
          en.stun = 180;
          burst(en.x, en.y, p.color, 14);
          hitEnemy = true;
          break;
        }
      }
      if (hitEnemy) {
        projectiles.splice(i, 1);
        continue;
      }

      // Expire or wall bounce for marbles
      if (p.x < 35 || p.x > W - 35) p.vx *= -1;
      if (p.y < 35 || p.y > H - 35) p.vy *= -1;

      if (p.life <= 0) {
        if (p.type === "marble") slipZones.push({ x: p.x, y: p.y, r: 34, life: 420 });
        if (p.type === "food") lures.push({ x: p.x, y: p.y, r: 40, life: 360 });
        projectiles.splice(i, 1);
      }
    }

    if (stageState.laser && stageState.laser.jammedTimer > 0) {
      stageState.laser.jammedTimer--;
    }

    // Update slip zones & lures
    slipZones = slipZones.filter((s) => --s.life > 0);
    lures = lures.filter((l) => --l.life > 0);

    // Enemies update
    for (const en of stageState.enemies) {
      if (en.stun > 0) {
        en.stun--;
        continue;
      }

      // Lure cats/dogs toward pet food
      if (en.type === "cat" && lures.length) {
        const l = lures[0];
        const a = Math.atan2(l.y - en.y, l.x - en.x);
        en.x += Math.cos(a) * 2.4;
        en.y += Math.sin(a) * 2.4;
      } else {
        en.x += en.vx;
        en.y += en.vy;
        if (en.x < 90 || en.x > W - 140) en.vx *= -1;
        if (en.y < 70 || en.y > H - 70) en.vy *= -1;
      }

      // Slip zone check
      for (const s of slipZones) {
        if (Math.hypot(en.x - s.x, en.y - s.y) < en.r + s.r) {
          en.stun = 160;
          burst(en.x, en.y, "#3ee6cf", 10);
        }
      }

      // Roomba collision
      if (roomba.invuln <= 0 && Math.hypot(en.x - roomba.x, en.y - roomba.y) < en.r + roomba.r) {
        roomba.battery = Math.max(0, roomba.battery - 18);
        roomba.invuln = 45;
        burst(roomba.x, roomba.y, "#ff5c5c", 14);
      }
    }

    // Laser hazard collision
    const lz = stageState.laser;
    if (lz && lz.jammedTimer <= 0 && roomba.invuln <= 0) {
      if (roomba.x + roomba.r > lz.x && roomba.x - roomba.r < lz.x + lz.w &&
          roomba.y + roomba.r > lz.y && roomba.y - roomba.r < lz.y + lz.h) {
        roomba.battery = Math.max(0, roomba.battery - 22);
        roomba.vx = -6;
        roomba.invuln = 40;
        burst(roomba.x, roomba.y, "#ff4444", 15);
      }
    }

    // Check exit door (unlocked once target hp === 0)
    const ex = stageState.exit;
    const unlocked = !stageState.target || stageState.target.hp <= 0;
    if (unlocked &&
        roomba.x + roomba.r > ex.x &&
        roomba.y > ex.y && roomba.y < ex.y + ex.h) {
      dustBunnies += 3;
      updateHud();
      if (stageIdx < STAGES.length - 1) {
        loadStage(stageIdx + 1);
      } else {
        showBanner(
          "You Escaped the Mansion! 🎉",
          "The Roomba Revolution is victorious! You conquered the Kitchen, Living Room, and Backyard Jungle. Play again with your upgrades!"
        );
        stageIdx = 0;
      }
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      if (--pt.life <= 0) particles.splice(i, 1);
    }

    updateHud();
  }

  function showBanner(title, desc) {
    running = false;
    document.getElementById("overlay-eyebrow").textContent = STAGES[stageIdx].eyebrow;
    document.getElementById("overlay-title").textContent = title;
    document.getElementById("overlay-desc").textContent = desc;
    document.getElementById("start-overlay").hidden = false;
  }

  function draw() {
    if (!stageState) return;
    ctx.fillStyle = stageState.floorColor;
    ctx.fillRect(0, 0, W, H);

    // Floor tiles
    ctx.strokeStyle = stageState.tileColor;
    ctx.lineWidth = 2;
    for (let x = 0; x < W; x += 70) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 70) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Slow / mud / rug / grass zones
    for (const z of stageState.mudZones) {
      ctx.fillStyle = "rgba(245, 168, 58, 0.12)";
      ctx.strokeStyle = "rgba(245, 168, 58, 0.4)";
      ctx.beginPath();
      ctx.roundRect(z.x, z.y, z.w, z.h, 14);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(245, 168, 58, 0.75)";
      ctx.font = "600 13px 'JetBrains Mono', monospace";
      ctx.fillText(z.label, z.x + 14, z.y + 24);
    }

    // Charging Dock
    const dk = stageState.dock;
    ctx.save();
    ctx.beginPath();
    ctx.arc(dk.x, dk.y, dk.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(62, 230, 207, 0.14)";
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#3ee6cf";
    ctx.stroke();
    ctx.fillStyle = "#3ee6cf";
    ctx.font = "600 11px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("CHARGE DOCK", dk.x, dk.y + 4);
    ctx.restore();

    // Slip zones & lures
    for (const s of slipZones) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(62, 230, 207, 0.22)";
      ctx.fill();
    }
    for (const l of lures) {
      ctx.beginPath();
      ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(232, 106, 146, 0.22)";
      ctx.fill();
    }

    // Target Objective
    const tg = stageState.target;
    if (tg && tg.hp > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(tg.x, tg.y, tg.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(245, 168, 58, 0.22)";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#f5a83a";
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 11px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(tg.label, tg.x, tg.y - tg.r - 8);
      ctx.restore();
    }

    // Laser sensor hazard
    const lz = stageState.laser;
    if (lz) {
      ctx.save();
      if (lz.jammedTimer > 0) {
        ctx.strokeStyle = "rgba(140, 160, 180, 0.35)";
        ctx.setLineDash([6, 6]);
      } else {
        ctx.strokeStyle = "#ff3b3b";
        ctx.shadowColor = "#ff3b3b";
        ctx.shadowBlur = 12;
      }
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(lz.x + lz.w / 2, lz.y);
      ctx.lineTo(lz.x + lz.w / 2, lz.y + lz.h);
      ctx.stroke();
      ctx.restore();
    }

    // Exit door
    const ex = stageState.exit;
    const unlocked = !stageState.target || stageState.target.hp <= 0;
    ctx.save();
    ctx.fillStyle = unlocked ? "rgba(62, 230, 207, 0.28)" : "rgba(255, 92, 92, 0.22)";
    ctx.strokeStyle = unlocked ? "#3ee6cf" : "#ff5c5c";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(ex.x, ex.y, ex.w, ex.h, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "600 11px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(unlocked ? "EXIT OPEN" : "LOCKED", ex.x - 24, ex.y + ex.h / 2);
    ctx.restore();

    // Debris items on floor
    for (const it of items) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(it.x, it.y, it.r, 0, Math.PI * 2);
      const colors = { marble: "#3ee6cf", sock: "#f5a83a", food: "#e86a92", can: "#ff5c5c", dust: "#cbd5e1" };
      ctx.fillStyle = colors[it.type] || "#fff";
      ctx.fill();
      ctx.restore();
    }

    // Projectiles
    for (const p of projectiles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    // Enemies
    for (const en of stageState.enemies) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(en.x, en.y, en.r, 0, Math.PI * 2);
      ctx.fillStyle = en.stun > 0 ? "#64748b" : en.color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#11151c";
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 11px 'Space Grotesk', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(en.stun > 0 ? "STUNNED!" : en.label, en.x, en.y + 4);
      ctx.restore();
    }

    // Suck vortexcone + dotted trajectory line
    const sucking = Boolean(keys[" "] || keys["j"] || mouseDownLeft);
    if (sucking && running) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(roomba.x, roomba.y, upgrades.suck ? 165 : 95, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(62, 230, 207, 0.35)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.restore();
    }

    // Dotted aim trajectory line
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = "rgba(62, 230, 207, 0.7)";
    ctx.lineWidth = 2;
    ctx.moveTo(roomba.x, roomba.y);
    ctx.lineTo(
      roomba.x + Math.cos(roomba.aimAngle) * 125,
      roomba.y + Math.sin(roomba.aimAngle) * 125
    );
    ctx.stroke();
    ctx.restore();

    // Draw Roomba
    ctx.save();
    ctx.translate(roomba.x, roomba.y);
    ctx.rotate(roomba.aimAngle);
    ctx.beginPath();
    ctx.arc(0, 0, roomba.r, 0, Math.PI * 2);
    ctx.fillStyle = roomba.invuln % 6 > 3 ? "#ff5c5c" : "#1f2735";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#3ee6cf";
    ctx.stroke();
    // Glowing eyes / front bumper
    ctx.fillStyle = "#3ee6cf";
    ctx.fillRect(8, -8, 6, 5);
    ctx.fillRect(8, 3, 6, 5);
    // Cannon nozzle
    ctx.fillStyle = "#f5a83a";
    ctx.fillRect(roomba.r - 4, -4, 9, 8);
    ctx.restore();

    // Particles
    for (const pt of particles) {
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x, pt.y, 4, 4);
    }
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

    // Update shop buttons
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
    draw();
    requestAnimationFrame(loop);
  }

  loadStage(0);
  requestAnimationFrame(loop);
})();
