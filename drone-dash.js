/* ==========================================================
   Drone Dash — 3D Arcade Flyer (Three.js r160)
   ========================================================== */
(() => {
  const wrap = document.getElementById("dd-canvas-wrap");
  if (!wrap || typeof THREE === "undefined") return;

  const $ = (id) => document.getElementById(id);
  const elScore = $("dd-score");
  const elDist = $("dd-dist");
  const elCombo = $("dd-combo");
  const elSpeed = $("dd-speed");
  const elBattery = $("dd-battery");
  const elBatteryBar = $("dd-battery-bar");
  const elBoost = $("dd-boost");
  const elBoostBar = $("dd-boost-bar");
  const elShield = $("dd-shield");
  const elBest = $("dd-best");
  const elPauseBtn = $("dd-pause-btn");
  const elMuteBtn = $("dd-mute-btn");
  const elFsBtn = $("dd-fs-btn");
  const elStage = $("dd-stage");
  const elPopups = $("dd-popups");
  const elTouchBoost = $("dd-touch-boost");
  const elStart = $("dd-start");
  const elPause = $("dd-pause");
  const elOver = $("dd-over");
  const elOverReason = $("dd-over-reason");
  const elNewBest = $("dd-newbest");
  const elFinalScore = $("dd-final-score");
  const elFinalDist = $("dd-final-dist");
  const elFinalPkg = $("dd-final-pkg");
  const elOverBest = $("dd-over-best");

  // ---------- Audio (WebAudio synth) ----------
  let audioCtx = null;
  let muted = localStorage.getItem("tq_dd_mute") === "1";
  function syncMuteUI() {
    if (elMuteBtn) elMuteBtn.textContent = muted ? "Sound: Off" : "Sound: On";
  }
  syncMuteUI();

  function ensureAudio() {
    if (muted) return null;
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function playTone(freq, dur = 0.12, type = "sine", vol = 0.12, slide = 0) {
    const ctx = ensureAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), ctx.currentTime + dur);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  }

  // ---------- Three.js Scene ----------
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  wrap.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b101b);
  scene.fog = new THREE.FogExp2(0x0b101b, 0.012);

  const camera = new THREE.PerspectiveCamera(58, 16 / 9, 0.5, 220);
  camera.position.set(0, 4.5, 13);

  function resize() {
    const rect = wrap.getBoundingClientRect();
    const w = Math.max(320, rect.width || 960);
    const h = Math.max(180, rect.height || 540);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  // Lights
  const hemi = new THREE.HemisphereLight(0x7dd3fc, 0x1e1b4b, 0.9);
  scene.add(hemi);
  const dirLight = new THREE.DirectionalLight(0xfde68a, 1.1);
  dirLight.position.set(18, 35, 22);
  scene.add(dirLight);

  // Corridor bounds
  const BOUNDS = { x: 9.5, yMin: 1.4, yMax: 8.6 };

  // Ground road + neon lane lines
  const groundGeo = new THREE.PlaneGeometry(34, 260);
  groundGeo.rotateX(-Math.PI / 2);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x0f1522, roughness: 0.85 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.z = -95;
  scene.add(ground);

  const grid = new THREE.GridHelper(260, 52, 0x2fd3bd, 0x1e293b);
  grid.position.set(0, 0.04, -95);
  scene.add(grid);

  // Side Skyline Buildings (pooled)
  const buildings = [];
  const bldgGeo = new THREE.BoxGeometry(1, 1, 1);
  const bldgMats = [
    new THREE.MeshStandardMaterial({ color: 0x141c2b, emissive: 0x0d2b36, emissiveIntensity: 0.35 }),
    new THREE.MeshStandardMaterial({ color: 0x192132, emissive: 0x2e1f0f, emissiveIntensity: 0.3 })
  ];
  for (let i = 0; i < 36; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const w = 6 + (i % 4) * 2;
    const h = 14 + (i % 7) * 5;
    const d = 8 + (i % 3) * 3;
    const mesh = new THREE.Mesh(bldgGeo, bldgMats[i % 2]);
    mesh.scale.set(w, h, d);
    mesh.position.set(side * (BOUNDS.x + 5.5 + w / 2), h / 2, -i * 6.5);
    scene.add(mesh);
    buildings.push(mesh);
  }

  // ---------- 3D Delivery Drone Mesh ----------
  const drone = new THREE.Group();
  drone.position.set(0, 4.2, 0);
  scene.add(drone);

  const chassis = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.45, 1.3),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.3 })
  );
  drone.add(chassis);

  const canopy = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0x2fd3bd, emissive: 0x2fd3bd, emissiveIntensity: 0.45 })
  );
  canopy.scale.set(1.1, 0.55, 0.95);
  canopy.position.y = 0.22;
  drone.add(canopy);

  // Underslung delivery box
  const cargoBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.5, 0.75),
    new THREE.MeshStandardMaterial({ color: 0xf3a73b, roughness: 0.5 })
  );
  cargoBox.position.y = -0.42;
  drone.add(cargoBox);

  // 4 Arms + Spinning Rotors
  const rotors = [];
  const armPositions = [
    [-0.95, 0.15, -0.85],
    [0.95, 0.15, -0.85],
    [-0.95, 0.15, 0.85],
    [0.95, 0.15, 0.85]
  ];
  const rotorGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.05, 16);
  const rotorMat = new THREE.MeshBasicMaterial({ color: 0x2fd3bd, transparent: true, opacity: 0.65 });
  armPositions.forEach(([ax, ay, az]) => {
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.4, 8),
      new THREE.MeshStandardMaterial({ color: 0x475569 })
    );
    arm.position.set(ax, ay, az);
    drone.add(arm);

    const r = new THREE.Mesh(rotorGeo, rotorMat);
    r.position.set(ax, ay + 0.22, az);
    drone.add(r);
    rotors.push(r);
  });

  // Shield bubble around drone
  const shieldBubble = new THREE.Mesh(
    new THREE.SphereGeometry(1.65, 20, 16),
    new THREE.MeshBasicMaterial({ color: 0x2fd3bd, wireframe: true, transparent: true, opacity: 0.45 })
  );
  shieldBubble.visible = false;
  drone.add(shieldBubble);

  // ---------- Obstacles & Pickups Pool ----------
  const activeEntities = [];
  const entityGroup = new THREE.Group();
  scene.add(entityGroup);

  const sharedGeos = {
    obstacleBox: new THREE.BoxGeometry(1, 1, 1),
    pkg: new THREE.OctahedronGeometry(0.78),
    battery: new THREE.CylinderGeometry(0.48, 0.48, 1.1, 14),
    boost: new THREE.ConeGeometry(0.65, 1.25, 14),
    shield: new THREE.TorusGeometry(0.62, 0.18, 10, 20)
  };
  const sharedMats = {
    skybridge: new THREE.MeshStandardMaterial({ color: 0x334155, emissive: 0x0f172a, roughness: 0.5 }),
    billboard: new THREE.MeshStandardMaterial({ color: 0xf0645a, emissive: 0xf0645a, emissiveIntensity: 0.35 }),
    car: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, emissive: 0xf3a73b, emissiveIntensity: 0.45 }),
    pkg: new THREE.MeshStandardMaterial({ color: 0xf3a73b, emissive: 0xf3a73b, emissiveIntensity: 0.35 }),
    battery: new THREE.MeshStandardMaterial({ color: 0x2fd3bd, emissive: 0x2fd3bd, emissiveIntensity: 0.4 }),
    boost: new THREE.MeshStandardMaterial({ color: 0xf0645a, emissive: 0xf0645a, emissiveIntensity: 0.45 }),
    shield: new THREE.MeshBasicMaterial({ color: 0xffffff })
  };

  // ---------- Game State ----------
  let bestScore = Number(localStorage.getItem("tq_dd_best") || 0);
  if (elBest) elBest.textContent = bestScore.toLocaleString();

  const state = {
    mode: "start", // "start" | "playing" | "paused" | "over"
    x: 0,
    y: 4.2,
    vx: 0,
    vy: 0,
    speed: 32,
    score: 0,
    dist: 0,
    combo: 1,
    packages: 0,
    battery: 100,
    boostFuel: 60,
    shield: false,
    spawnTimer: 0,
    shake: 0
  };

  function clearEntities() {
    while (entityGroup.children.length) {
      entityGroup.remove(entityGroup.children[0]);
    }
    activeEntities.length = 0;
  }

  function spawnRow() {
    const z = -155;
    // Spawn 1 or 2 obstacles with guaranteed open lane
    const laneX = [-6.2, 0, 6.2];
    const blockedIdx = Math.floor(Math.random() * 3);
    const kind = Math.random();

    for (let i = 0; i < 3; i++) {
      if (i === blockedIdx || (Math.random() < 0.38 && i !== (blockedIdx + 1) % 3)) {
        const isCar = kind > 0.65;
        const w = isCar ? 2.6 : 4.6;
        const h = isCar ? 1.5 : 3.2;
        const d = isCar ? 3.2 : 2.2;
        const y = isCar ? 2.2 + Math.random() * 5.2 : (Math.random() < 0.5 ? 2.4 : 6.6);
        const mesh = new THREE.Mesh(
          sharedGeos.obstacleBox,
          isCar ? sharedMats.car : (i % 2 === 0 ? sharedMats.skybridge : sharedMats.billboard)
        );
        mesh.scale.set(w, h, d);
        mesh.position.set(laneX[i], y, z);
        entityGroup.add(mesh);
        activeEntities.push({
          kind: "obstacle",
          mesh,
          w,
          h,
          d,
          vx: isCar ? (Math.random() < 0.5 ? -3.5 : 3.5) : 0,
          nearMissed: false
        });
      } else if (Math.random() < 0.78) {
        // Spawn pickup in open lane
        const r = Math.random();
        let pType = "pkg";
        if (state.battery < 45 || r < 0.25) pType = "battery";
        else if (r < 0.36) pType = "boost";
        else if (r < 0.44 && !state.shield) pType = "shield";

        const mesh = new THREE.Mesh(sharedGeos[pType], sharedMats[pType]);
        mesh.position.set(laneX[i], 2.4 + Math.random() * 4.8, z);
        entityGroup.add(mesh);
        activeEntities.push({ kind: pType, mesh, w: 1.5, h: 1.5, d: 1.5, vx: 0 });
      }
    }
  }

  function showPopup(text, cls = "is-teal") {
    if (!elPopups) return;
    const span = document.createElement("span");
    span.className = `dd-pop ${cls}`;
    span.style.left = `${50 + (state.x / BOUNDS.x) * 32}%`;
    span.style.top = `${75 - ((state.y - BOUNDS.yMin) / (BOUNDS.yMax - BOUNDS.yMin)) * 50}%`;
    span.textContent = text;
    elPopups.appendChild(span);
    setTimeout(() => span.remove(), 900);
  }

  function startGame() {
    clearEntities();
    state.mode = "playing";
    state.x = 0;
    state.y = 4.2;
    state.vx = 0;
    state.vy = 0;
    state.speed = 34;
    state.score = 0;
    state.dist = 0;
    state.combo = 1;
    state.packages = 0;
    state.battery = 100;
    state.boostFuel = 65;
    state.shield = false;
    state.spawnTimer = 0;
    state.shake = 0;
    elStart.hidden = true;
    elPause.hidden = true;
    elOver.hidden = true;
    playTone(520, 0.14, "triangle", 0.12, 240);
    updateHUD();
  }

  function pauseGame() {
    if (state.mode !== "playing") return;
    state.mode = "paused";
    elPause.hidden = false;
  }

  function resumeGame() {
    if (state.mode !== "paused") return;
    state.mode = "playing";
    elPause.hidden = true;
    lastTime = performance.now();
  }

  function endGame(reason) {
    state.mode = "over";
    playTone(180, 0.35, "sawtooth", 0.16, -90);
    elOverReason.textContent = reason;
    const finalScore = Math.round(state.score);
    const isNew = finalScore > bestScore;
    if (isNew) {
      bestScore = finalScore;
      localStorage.setItem("tq_dd_best", String(bestScore));
    }
    elNewBest.hidden = !isNew;
    elFinalScore.textContent = finalScore.toLocaleString();
    elFinalDist.textContent = `${Math.round(state.dist)} m`;
    elFinalPkg.textContent = String(state.packages);
    elBest.textContent = bestScore.toLocaleString();
    elOverBest.textContent = `Best: ${bestScore.toLocaleString()}`;
    elOver.hidden = false;
  }

  function updateHUD() {
    elScore.textContent = Math.round(state.score).toLocaleString();
    elDist.textContent = `${Math.round(state.dist)} m`;
    elCombo.textContent = `x${state.combo}`;
    elCombo.classList.toggle("is-combo", state.combo > 1);
    elSpeed.textContent = `${Math.round(state.speed * 3.2)} km/h`;

    const bPct = Math.max(0, Math.min(100, Math.round(state.battery)));
    elBattery.style.width = `${bPct}%`;
    elBattery.classList.toggle("is-low", bPct <= 40 && bPct > 20);
    elBattery.classList.toggle("is-critical", bPct <= 20);
    elBatteryBar.setAttribute("aria-valuenow", String(bPct));

    const fPct = Math.max(0, Math.min(100, Math.round(state.boostFuel)));
    elBoost.style.width = `${fPct}%`;
    elBoostBar.setAttribute("aria-valuenow", String(fPct));

    elShield.classList.toggle("is-on", state.shield);
    shieldBubble.visible = state.shield;
  }

  // ---------- Input Handling ----------
  const keys = {};
  let touchBoosting = false;
  let pointerDrag = null;

  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k) && state.mode === "playing") {
      e.preventDefault();
    }
    keys[k] = true;

    if (k === "m") {
      muted = !muted;
      localStorage.setItem("tq_dd_mute", muted ? "1" : "0");
      syncMuteUI();
    } else if (k === "p" || k === "escape") {
      if (state.mode === "playing") pauseGame();
      else if (state.mode === "paused") resumeGame();
    } else if (k === "enter" || (k === " " && state.mode !== "playing")) {
      if (state.mode === "start" || state.mode === "over") startGame();
    }
  });

  window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  window.addEventListener("blur", () => {
    if (state.mode === "playing") pauseGame();
  });

  // Touch / pointer steering
  wrap.addEventListener("pointerdown", (e) => {
    elStage.classList.add("is-touch");
    pointerDrag = { id: e.pointerId, x: e.clientX, y: e.clientY, startX: state.x, startY: state.y };
  });
  window.addEventListener("pointermove", (e) => {
    if (!pointerDrag || e.pointerId !== pointerDrag.id || state.mode !== "playing") return;
    const rect = wrap.getBoundingClientRect();
    const dx = ((e.clientX - pointerDrag.x) / Math.max(1, rect.width)) * (BOUNDS.x * 2.2);
    const dy = -((e.clientY - pointerDrag.y) / Math.max(1, rect.height)) * ((BOUNDS.yMax - BOUNDS.yMin) * 1.8);
    state.x = Math.max(-BOUNDS.x, Math.min(BOUNDS.x, pointerDrag.startX + dx));
    state.y = Math.max(BOUNDS.yMin, Math.min(BOUNDS.yMax, pointerDrag.startY + dy));
  });
  window.addEventListener("pointerup", (e) => {
    if (pointerDrag && e.pointerId === pointerDrag.id) pointerDrag = null;
  });

  if (elTouchBoost) {
    elTouchBoost.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      touchBoosting = true;
      elTouchBoost.classList.add("is-active");
    });
    window.addEventListener("pointerup", () => {
      touchBoosting = false;
      elTouchBoost.classList.remove("is-active");
    });
  }

  // Buttons
  $("dd-play")?.addEventListener("click", startGame);
  $("dd-retry")?.addEventListener("click", startGame);
  $("dd-resume")?.addEventListener("click", resumeGame);
  $("dd-restart")?.addEventListener("click", startGame);
  elPauseBtn?.addEventListener("click", () => {
    if (state.mode === "playing") pauseGame();
    else if (state.mode === "paused") resumeGame();
  });
  elMuteBtn?.addEventListener("click", () => {
    muted = !muted;
    localStorage.setItem("tq_dd_mute", muted ? "1" : "0");
    syncMuteUI();
  });
  elFsBtn?.addEventListener("click", () => {
    const shell = $("dd-shell");
    if (!document.fullscreenElement) shell?.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  });

  // ---------- Main Loop ----------
  let lastTime = performance.now();
  function tick(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    // Spin rotors
    for (const r of rotors) r.rotation.y += dt * 28;

    if (state.mode === "playing") {
      // Poll gamepad
      let gpX = 0, gpY = 0, gpBoost = false;
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = pads && pads[0];
      if (gp) {
        if (Math.abs(gp.axes[0]) > 0.15) gpX = gp.axes[0];
        if (Math.abs(gp.axes[1]) > 0.15) gpY = -gp.axes[1];
        gpBoost = Boolean(gp.buttons[0]?.pressed);
      }

      const ix = (keys["d"] || keys["arrowright"] ? 1 : 0) - (keys["a"] || keys["arrowleft"] ? 1 : 0) + gpX;
      const iy = (keys["w"] || keys["arrowup"] ? 1 : 0) - (keys["s"] || keys["arrowdown"] ? 1 : 0) + gpY;

      state.vx = state.vx * 0.82 + ix * 3.4;
      state.vy = state.vy * 0.82 + iy * 2.8;
      state.x = Math.max(-BOUNDS.x, Math.min(BOUNDS.x, state.x + state.vx * dt * 4.2));
      state.y = Math.max(BOUNDS.yMin, Math.min(BOUNDS.yMax, state.y + state.vy * dt * 4.2));

      // Boost check
      const wantsBoost = Boolean(keys[" "] || keys["shift"] || touchBoosting || gpBoost);
      const boosting = wantsBoost && state.boostFuel > 1;
      if (boosting) {
        state.boostFuel = Math.max(0, state.boostFuel - 28 * dt);
      } else {
        state.boostFuel = Math.min(100, state.boostFuel + 5 * dt);
      }

      // Speed & distance
      state.speed = Math.min(68, state.speed + 0.65 * dt);
      const curSpeed = state.speed * (boosting ? 1.55 : 1);
      const stepDist = curSpeed * dt;
      state.dist += stepDist * 0.45;
      state.score += stepDist * (boosting ? 2.2 : 1) * (1 + (state.combo - 1) * 0.15);

      // Battery drain
      state.battery -= (2.8 + state.speed * 0.03) * dt;
      if (state.battery <= 0) {
        state.battery = 0;
        updateHUD();
        endGame("Battery depleted");
      }

      // Scroll buildings & road grid
      grid.position.z = ((grid.position.z + stepDist) % 5) - 95;
      for (const b of buildings) {
        b.position.z += stepDist;
        if (b.position.z > 18) b.position.z -= 36 * 6.5;
      }

      // Spawn new rows
      state.spawnTimer -= stepDist;
      if (state.spawnTimer <= 0) {
        spawnRow();
        state.spawnTimer = 24;
      }

      // Update obstacles & pickups
      for (let i = activeEntities.length - 1; i >= 0; i--) {
        const ent = activeEntities[i];
        ent.mesh.position.z += stepDist;
        if (ent.vx) {
          ent.mesh.position.x += ent.vx * dt;
          if (Math.abs(ent.mesh.position.x) > BOUNDS.x) ent.vx *= -1;
        }
        if (ent.kind !== "obstacle") {
          ent.mesh.rotation.y += dt * 2.5;
        }

        const dx = Math.abs(ent.mesh.position.x - state.x);
        const dy = Math.abs(ent.mesh.position.y - state.y);
        const dz = Math.abs(ent.mesh.position.z - drone.position.z);

        if (ent.kind === "obstacle") {
          const hitX = ent.w / 2 + 0.65;
          const hitY = ent.h / 2 + 0.35;
          const hitZ = ent.d / 2 + 0.55;
          if (dx < hitX && dy < hitY && dz < hitZ) {
            entityGroup.remove(ent.mesh);
            activeEntities.splice(i, 1);
            if (state.shield) {
              state.shield = false;
              state.shake = 0.45;
              playTone(260, 0.2, "sawtooth", 0.15, 120);
              showPopup("SHIELD SAVED!", "is-teal");
            } else {
              state.shake = 0.7;
              updateHUD();
              endGame("Crashed into obstacle");
              break;
            }
            continue;
          }
          // Near-miss check
          if (!ent.nearMissed && ent.mesh.position.z > 0.5 && dx < hitX + 1.35 && dy < hitY + 1.1) {
            ent.nearMissed = true;
            const bonus = 25 * state.combo;
            state.score += bonus;
            state.shake = 0.18;
            playTone(680, 0.09, "sine", 0.08, 180);
            showPopup(`NEAR MISS +${bonus}`, "is-amber");
          }
        } else if (dx < 1.55 && dy < 1.45 && dz < 1.45) {
          // Pickup collected
          if (ent.kind === "pkg") {
            state.packages++;
            const pts = 50 * state.combo;
            state.score += pts;
            state.combo = Math.min(8, state.combo + 1);
            playTone(580 + state.combo * 45, 0.12, "triangle", 0.14, 160);
            showPopup(`+${pts} (x${state.combo})`, "is-amber");
          } else if (ent.kind === "battery") {
            state.battery = Math.min(100, state.battery + 28);
            playTone(720, 0.14, "sine", 0.13, 220);
            showPopup("+BATTERY", "is-teal");
          } else if (ent.kind === "boost") {
            state.boostFuel = Math.min(100, state.boostFuel + 45);
            playTone(640, 0.14, "sawtooth", 0.11, 260);
            showPopup("+BOOST FUEL", "is-red");
          } else if (ent.kind === "shield") {
            state.shield = true;
            playTone(820, 0.18, "triangle", 0.13, 180);
            showPopup("SHIELD ON", "is-teal");
          }
          entityGroup.remove(ent.mesh);
          activeEntities.splice(i, 1);
          continue;
        }

        if (ent.mesh.position.z > 16) {
          if (ent.kind === "pkg") state.combo = 1;
          entityGroup.remove(ent.mesh);
          activeEntities.splice(i, 1);
        }
      }

      updateHUD();
    }

    // Smooth drone visual position & banking
    drone.position.x += (state.x - drone.position.x) * 0.22;
    drone.position.y += (state.y - drone.position.y) * 0.22;
    drone.rotation.z = -state.vx * 0.08;
    drone.rotation.x = state.vy * 0.05 - 0.12;

    // Camera follow + shake
    state.shake = Math.max(0, state.shake - dt * 1.8);
    const sx = (Math.random() - 0.5) * state.shake;
    const sy = (Math.random() - 0.5) * state.shake;
    camera.position.x += (drone.position.x * 0.55 - camera.position.x) * 0.12 + sx;
    camera.position.y += (drone.position.y * 0.45 + 2.6 - camera.position.y) * 0.12 + sy;
    camera.lookAt(drone.position.x * 0.35, drone.position.y * 0.35 + 1.5, -18);

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
