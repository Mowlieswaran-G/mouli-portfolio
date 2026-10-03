import * as THREE from 'three';
import { soundManager } from '../systems/audioSystem.js';

/* ---------- Radial Texture Helper ---------- */
function createRadialTex(inner, outer) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function sph(r, mat, sx = 1, sy = 1, sz = 1) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), mat);
  m.scale.set(sx, sy, sz);
  m.castShadow = true;
  return m;
}

function limb(len, r, mat) {
  const g = new THREE.Group();
  const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 20), mat);
  c.position.y = -len / 2;
  c.castShadow = true;
  g.add(c);
  return g;
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function lerp(a, b, k) {
  return a + (b - a) * k;
}

function ease(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export class PlayerController {
  constructor(scene, cameraController) {
    this.scene = scene;
    this.cameraController = cameraController;

    // Movement Physics
    this.position = new THREE.Vector3(0, 0.0, 0);
    this.velocity = new THREE.Vector3();
    this.moveSpeed = 6.0;
    this.sprintMultiplier = 1.6;
    this.jumpForce = 11.0;
    this.gravity = 26.0;
    this.isGrounded = true;
    this.isSprinting = false;
    this.isMoving = false;

    // Input States
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
      jump: false
    };

    // Virtual Joystick / External input
    this.joystickInput = { x: 0, y: 0 };
    this.mobileJump = false;
    this.mobileSprint = false;

    // Kinematics / Animation state
    this.turnAngle = 0;
    this.targetTurnAngle = 0;
    this.phase = 0;
    this.t = 0;
    this.blink = 0;
    this.nextBlink = 2.5;
    this.squash = 0;
    this.act = { n: null, t: 0 };
    this.DUR = { wave: 2.2, thumbs: 1.8, dance: 3.4 };

    // Default arm poses
    this.IDLE_R = { sx: 0, sz: -0.09, ex: -0.08, ez: 0, th: -0.5, fc: 0.55 };
    this.IDLE_L = { sx: 0, sz:  0.09, ex: -0.08, ez: 0, th: -0.5, fc: 0.55 };

    // Collision Colliders (passed from WorldBuilder)
    this.colliders = [];
    this.playerRadius = 0.55;
    this.enabled = true; // Set to false during intro/menus to prevent unwanted movement

    // Build the high-fidelity Bolt 3D character
    this.buildCharacterMesh();
    this.setupKeyboardListeners();
  }

  buildCharacterMesh() {
    this.group = new THREE.Group();
    this.group.position.copy(this.position);

    // Bolt Materials from reference
    this.matWhite = new THREE.MeshPhysicalMaterial({
      color: 0xf3f7fb,
      roughness: 0.28,
      metalness: 0.02,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2
    });
    this.matDark = new THREE.MeshStandardMaterial({
      color: 0x0c1626,
      roughness: 0.35,
      metalness: 0.5
    });
    this.matVisor = new THREE.MeshPhysicalMaterial({
      color: 0x03070d,
      roughness: 0.08,
      metalness: 0.6,
      clearcoat: 1,
      clearcoatRoughness: 0.05
    });
    this.matGlow = new THREE.MeshBasicMaterial({
      color: 0x52e6ff
    });

    const glowTex = createRadialTex('rgba(120,235,255,.75)', 'rgba(120,235,255,0)');
    this.glowTex = glowTex;

    // Rig hierarchy
    this.rig = new THREE.Group();
    this.group.add(this.rig);

    // Torso
    this.torso = new THREE.Group();
    this.torso.position.y = 0.63;
    this.rig.add(this.torso);

    this.torso.add(sph(0.34, this.matWhite, 1, 1.1, 0.82));
    const hips = sph(0.22, this.matDark, 1, 0.5, 0.85);
    hips.position.y = -0.28;
    this.torso.add(hips);

    const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 28), this.matDark);
    chest.rotation.x = Math.PI / 2;
    chest.position.set(0, 0.1, 0.272);
    this.torso.add(chest);

    const chestDot = sph(0.035, this.matGlow);
    chestDot.position.set(0, 0.1, 0.292);
    this.torso.add(chestDot);

    [-1, 1].forEach((s) => {
      for (let i = 0; i < 2; i++) {
        const v = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.12, 0.02), this.matDark);
        v.position.set(s * (0.2 + i * 0.05), 0.02, 0.21 - i * 0.03);
        v.rotation.y = s * 0.8;
        this.torso.add(v);
      }
    });

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.14, 24), this.matDark);
    neck.position.y = 0.99;
    this.rig.add(neck);

    // Head
    this.head = new THREE.Group();
    this.head.position.y = 1.04;
    this.rig.add(this.head);

    const shell = sph(0.55, this.matWhite, 1.2, 1, 1.02);
    shell.position.y = 0.55;
    this.head.add(shell);

    const visor = sph(0.5, this.matVisor, 1.12, 0.86, 0.66);
    visor.position.set(0, 0.55, 0.3);
    this.head.add(visor);

    // Eyes with radial glow sprite halos and specular highlights
    this.eyes = [];
    [-1, 1].forEach((s) => {
      const e = new THREE.Group();
      e.position.set(s * 0.24, 0.58, 0.612);
      e.rotation.y = s * 0.28;
      e.add(new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.038, 18, 48), this.matGlow));

      const halo = new THREE.Mesh(
        new THREE.PlaneGeometry(0.62, 0.62),
        new THREE.MeshBasicMaterial({
          map: glowTex,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          opacity: 0.55
        })
      );
      halo.position.z = -0.005;
      e.add(halo);

      const hi = sph(0.024, new THREE.MeshBasicMaterial({ color: 0xffffff }));
      hi.position.set(0.06, 0.07, 0.012);
      e.add(hi);

      this.head.add(e);
      e.userData.halo = halo;
      this.eyes.push(e);
    });

    // Friendly glowing smile
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.016, 10, 28, Math.PI), this.matGlow);
    smile.rotation.z = Math.PI;
    smile.position.set(0, 0.44, 0.63);
    this.head.add(smile);

    // Side ear pods with glowing rings
    [-1, 1].forEach((s) => {
      const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.14, 28), this.matDark);
      pod.rotation.z = Math.PI / 2;
      pod.position.set(s * 0.66, 0.55, 0);
      this.head.add(pod);

      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.026, 12, 36), this.matGlow);
      ring.rotation.y = Math.PI / 2;
      ring.position.set(s * 0.735, 0.55, 0);
      this.head.add(ring);
    });

    // Antenna with glowing tip
    this.antenna = new THREE.Group();
    this.antenna.position.set(-0.3, 1.07, -0.14);
    this.head.add(this.antenna);

    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.25, 8), this.matDark);
    stalk.position.y = 0.125;
    this.antenna.add(stalk);

    const tip = sph(0.035, this.matGlow);
    tip.position.y = 0.26;
    this.antenna.add(tip);

    // Arms
    this.armR = this.makeArm(-1, this.IDLE_R);
    this.armL = this.makeArm(1, this.IDLE_L);

    // Legs
    this.legR = this.makeLeg(-1);
    this.legL = this.makeLeg(1);

    // Ground Shadow Blob & Aura
    this.shadowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 2.2),
      new THREE.MeshBasicMaterial({
        map: createRadialTex('rgba(0,25,60,.55)', 'rgba(0,25,60,0)'),
        transparent: true,
        depthWrite: false
      })
    );
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.y = 0.01;
    this.scene.add(this.shadowMesh);

    this.groundGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 3.8),
      new THREE.MeshBasicMaterial({
        map: glowTex,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.35
      })
    );
    this.groundGlow.rotation.x = -Math.PI / 2;
    this.groundGlow.position.y = 0.008;
    this.scene.add(this.groundGlow);

    // Character lighting auras
    this.playerFrontAura = new THREE.PointLight(0x52e6ff, 1.5, 6);
    this.playerFrontAura.position.set(0, 1.6, 0.6);
    this.group.add(this.playerFrontAura);

    this.playerBackAura = new THREE.PointLight(0xffedd5, 1.2, 5);
    this.playerBackAura.position.set(0, 1.4, -0.6);
    this.group.add(this.playerBackAura);

    this.scene.add(this.group);
  }

  makeArm(side, pose) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.42, 0.83, 0);
    this.rig.add(shoulder);

    shoulder.add(sph(0.085, this.matDark));
    shoulder.add(limb(0.2, 0.055, this.matWhite));

    const elbow = new THREE.Group();
    elbow.position.y = -0.2;
    shoulder.add(elbow);

    elbow.add(sph(0.065, this.matDark));
    elbow.add(limb(0.17, 0.058, this.matWhite));

    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.066, 0.04, 20), this.matDark);
    cuff.position.y = -0.17;
    elbow.add(cuff);

    const hand = new THREE.Group();
    hand.position.y = -0.2;
    hand.scale.setScalar(1.3);
    elbow.add(hand);

    const palm = sph(1, this.matWhite, 0.045, 0.055, 0.068);
    palm.position.y = -0.05;
    hand.add(palm);

    const fingers = [];
    [[0.04, 1], [0.013, 1.1], [-0.013, 1], [-0.04, 0.8]].forEach((d) => {
      const L = [0.04 * d[1], 0.034 * d[1], 0.028 * d[1]], R = 0.0135;
      const a = new THREE.Group();
      a.position.set(0, -0.088, d[0]);
      hand.add(a);

      const b = new THREE.Group();
      const c = new THREE.Group();

      a.add(sph(R, this.matWhite));
      [a, b, c].forEach((g, n) => {
        const cy = new THREE.Mesh(new THREE.CylinderGeometry(R * (1 - n * 0.08), R * (1 - n * 0.08), L[n], 12), this.matWhite);
        cy.position.y = -L[n] / 2;
        cy.castShadow = true;
        g.add(cy);
        const jt = sph(R * (1 - n * 0.08), this.matWhite);
        jt.position.y = -L[n];
        g.add(jt);
      });
      b.position.y = -L[0];
      a.add(b);
      c.position.y = -L[1];
      b.add(c);
      fingers.push({ a, b, c });
    });

    const thumb = new THREE.Group();
    thumb.position.set(0, -0.035, 0.066);
    hand.add(thumb);
    thumb.add(sph(0.019, this.matWhite));

    const t1 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.017, 0.045, 12), this.matWhite);
    t1.position.y = -0.0225;
    thumb.add(t1);

    const thumb2 = new THREE.Group();
    thumb2.position.y = -0.045;
    thumb.add(thumb2);
    thumb2.add(sph(0.017, this.matWhite));

    const t2 = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.015, 0.04, 12), this.matWhite);
    t2.position.y = -0.02;
    thumb2.add(t2);

    const tt = sph(0.015, this.matWhite);
    tt.position.y = -0.04;
    thumb2.add(tt);

    return {
      shoulder,
      elbow,
      thumb,
      thumb2,
      hand,
      pr: 0,
      tw: 0,
      fingers,
      side,
      cur: { sx: pose.sx, sz: pose.sz, ex: pose.ex, ez: pose.ez, th: pose.th, fc: pose.fc }
    };
  }

  makeLeg(side) {
    const hip = new THREE.Group();
    hip.position.set(side * 0.2, 0.36, 0);
    this.rig.add(hip);

    hip.add(sph(0.075, this.matDark));
    hip.add(limb(0.14, 0.065, this.matWhite));

    const knee = new THREE.Group();
    knee.position.y = -0.14;
    hip.add(knee);

    knee.add(sph(0.07, this.matDark));
    knee.add(limb(0.12, 0.06, this.matWhite));

    const ankle = new THREE.Group();
    ankle.position.y = -0.12;
    knee.add(ankle);

    ankle.add(sph(0.06, this.matDark));

    const foot = new THREE.Group();
    ankle.add(foot);

    const f = sph(1, this.matWhite, 0.11, 0.06, 0.16);
    f.position.set(0, -0.045, 0.04);
    foot.add(f);

    const sole = sph(1, this.matDark, 0.115, 0.03, 0.17);
    sole.position.set(0, -0.075, 0.04);
    foot.add(sole);

    return { hip, knee, foot };
  }

  setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      if (!this.enabled) return;
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.sprint = true;
          break;
        case 'Space':
          e.preventDefault();
          this.handleJump();
          break;
        case 'Digit1':
        case 'Numpad1':
          this.triggerAction('wave');
          break;
        case 'Digit2':
        case 'Numpad2':
          this.triggerAction('thumbs');
          break;
        case 'Digit3':
        case 'Numpad3':
          this.triggerAction('dance');
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.keys.sprint = false;
          break;
      }
    });
  }

  triggerAction(name) {
    if (name === 'jump') {
      this.handleJump();
      return;
    }
    this.act.n = name;
    this.act.t = 0;
  }

  handleJump() {
    if (this.isGrounded) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
      this.squash = 0;
      soundManager.playJump();
    }
  }

  setColliders(boxes) {
    this.colliders = boxes;
  }

  teleport(x, y, z) {
    this.position.set(x, y, z);
    this.velocity.set(0, 0, 0);
    this.isGrounded = true;
    this.group.position.copy(this.position);
    this.shadowMesh.position.x = x;
    this.shadowMesh.position.z = z;
    this.groundGlow.position.x = x;
    this.groundGlow.position.z = z;
  }

  mixPose(a, b, k) {
    return {
      fc: lerp(a.fc, b.fc, k),
      sx: lerp(a.sx, b.sx, k),
      sz: lerp(a.sz, b.sz, k),
      ex: lerp(a.ex, b.ex, k),
      ez: lerp(a.ez, b.ez, k),
      th: lerp(a.th, b.th, k)
    };
  }

  update(delta) {
    const dt = Math.min(delta, 0.1);
    this.t += dt;

    // Camera relative orientation
    const cameraYaw = this.cameraController.getYaw();
    const forwardVec = new THREE.Vector3(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));
    const rightVec = new THREE.Vector3(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw));

    let moveZ = 0;
    let moveX = 0;

    if (this.enabled) {
      if (this.keys.forward) moveZ += 1;
      if (this.keys.backward) moveZ -= 1;
      if (this.keys.right) moveX += 1;
      if (this.keys.left) moveX -= 1;

      if (Math.abs(this.joystickInput.y) > 0.1) moveZ += this.joystickInput.y;
      if (Math.abs(this.joystickInput.x) > 0.1) moveX += this.joystickInput.x;

      if (this.mobileJump) {
        this.handleJump();
        this.mobileJump = false;
      }
    } else {
      this.keys.forward = false;
      this.keys.backward = false;
      this.keys.left = false;
      this.keys.right = false;
      this.keys.sprint = false;
    }

    const inputDir = new THREE.Vector3();
    inputDir.addScaledVector(forwardVec, moveZ);
    inputDir.addScaledVector(rightVec, moveX);

    const isMoving = inputDir.lengthSq() > 0.01;
    this.isMoving = isMoving;
    this.isSprinting = (this.keys.sprint || this.mobileSprint) && isMoving;

    let targetSpeed = 0;
    if (isMoving) {
      inputDir.normalize();
      targetSpeed = this.isSprinting ? this.moveSpeed * this.sprintMultiplier : this.moveSpeed;
      this.targetTurnAngle = Math.atan2(inputDir.x, inputDir.z);

      if (this.isGrounded) {
        soundManager.playFootstep(this.isSprinting);
      }
    }

    // Accelerate/Decelerate horizontal velocity
    const targetVx = inputDir.x * targetSpeed;
    const targetVz = inputDir.z * targetSpeed;
    this.velocity.x += (targetVx - this.velocity.x) * (13 * dt);
    this.velocity.z += (targetVz - this.velocity.z) * (13 * dt);

    // Gravity & Vertical physics
    this.velocity.y -= this.gravity * dt;
    const newY = this.position.y + this.velocity.y * dt;

    if (newY <= 0) {
      if (!this.isGrounded && this.velocity.y < -3) {
        soundManager.playLand();
        this.squash = 1;
      }
      this.position.y = 0;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.position.y = newY;
      this.isGrounded = false;
    }

    // Squash recovery
    this.squash = Math.max(0, this.squash - dt * 4);

    // Collision Resolution on X & Z
    const potentialX = this.position.x + this.velocity.x * dt;
    const potentialZ = this.position.z + this.velocity.z * dt;

    if (!this.checkCollision(potentialX, this.position.z)) {
      this.position.x = potentialX;
    } else {
      this.velocity.x = 0;
    }

    if (!this.checkCollision(this.position.x, potentialZ)) {
      this.position.z = potentialZ;
    } else {
      this.velocity.z = 0;
    }

    // Smooth character rotation
    let angleDiff = this.targetTurnAngle - this.turnAngle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    this.turnAngle += angleDiff * (12 * dt);

    this.group.position.copy(this.position);
    this.group.rotation.y = this.turnAngle;

    // Update ground shadows & halos
    this.shadowMesh.position.x = this.position.x;
    this.shadowMesh.position.z = this.position.z;
    this.groundGlow.position.x = this.position.x;
    this.groundGlow.position.z = this.position.z;

    const shadowScale = Math.max(0.3, 1.0 - (this.position.y * 0.15));
    this.shadowMesh.scale.set(shadowScale, shadowScale, shadowScale);
    this.shadowMesh.material.opacity = 0.55 * shadowScale;
    this.groundGlow.material.opacity = 0.3 + Math.sin(this.t * 2) * 0.05;

    // Procedural Bolt Robot Animation
    this.animateAvatar(dt);
  }

  checkCollision(x, z) {
    const worldRadius = 140;
    if (Math.hypot(x, z) > worldRadius) return true;

    for (let i = 0; i < this.colliders.length; i++) {
      const box = this.colliders[i];
      if (
        x >= box.min.x - this.playerRadius &&
        x <= box.max.x + this.playerRadius &&
        z >= box.min.z - this.playerRadius &&
        z <= box.max.z + this.playerRadius
      ) {
        return true;
      }
    }
    return false;
  }

  animateAvatar(dt) {
    const speed = Math.hypot(this.velocity.x, this.velocity.z);
    const m = speed / 6.0;
    const mw = Math.min(m, 1);
    const air = clamp(this.position.y / 0.25, 0, 1);

    // Action timer
    let ta = 0, dancing = false;
    if (this.act.n) {
      this.act.t += dt;
      ta = this.act.t;
      if (this.act.t > this.DUR[this.act.n]) {
        this.act.n = null;
      } else {
        dancing = this.act.n === 'dance';
      }
    }

    // Gait phase
    if (air < 0.5) this.phase += dt * speed * 1.7;
    const danceOn = dancing && mw < 0.1;
    if (danceOn) this.phase += dt * 9;
    const gm = Math.max(mw, danceOn ? 0.45 : 0);

    // Legs animation
    let hR = -Math.sin(this.phase) * 0.65 * gm;
    let hL =  Math.sin(this.phase) * 0.65 * gm;
    let kR =  Math.max(0,  Math.cos(this.phase)) * 0.9 * gm;
    let kL =  Math.max(0, -Math.cos(this.phase)) * 0.9 * gm;

    hR = lerp(hR, -0.4, air);
    hL = lerp(hL, -0.15, air);
    kR = lerp(kR,  0.7, air);
    kL = lerp(kL,  0.5, air);

    this.legR.hip.rotation.x = hR;
    this.legR.knee.rotation.x = kR;
    this.legR.foot.rotation.x = -(hR + kR);

    this.legL.hip.rotation.x = hL;
    this.legL.knee.rotation.x = kL;
    this.legL.foot.rotation.x = -(hL + kL);

    // Torso bobbing & dynamics
    let bob = Math.sin(this.t * 2) * 0.012 * (1 - mw) + Math.abs(Math.sin(this.phase)) * 0.055 * mw;
    if (dancing) bob += Math.abs(Math.sin(ta * 9)) * 0.1;
    if (this.act.n === 'thumbs') bob += Math.abs(Math.sin(ta * 7)) * 0.05;

    this.rig.position.y = bob;
    this.rig.rotation.x = lerp(this.rig.rotation.x, 0.13 * Math.min(m, 1.7), 1 - Math.exp(-dt * 8));
    this.rig.rotation.z = Math.sin(this.phase) * 0.035 * mw;
    this.rig.rotation.y = dancing ? ease(Math.min(1, ta / this.DUR.dance)) * Math.PI * 4 : 0;

    const sq = Math.sin(this.squash * Math.PI / 2);
    const stretch = clamp(this.velocity.y * 0.015, -0.05, 0.08);
    this.rig.scale.set(1 + 0.06 * sq - stretch * 0.5, 1 - 0.12 * sq + stretch, 1 + 0.06 * sq - stretch * 0.5);

    // Head sway & antenna inertia
    this.head.rotation.y = Math.sin(this.t * 0.6) * 0.14 * (1 - mw);
    this.head.rotation.z = Math.sin(this.t * 0.9) * 0.05 * (1 - mw) + (dancing ? Math.sin(ta * 9) * 0.12 : 0);
    this.head.rotation.x = -0.04 * m + (this.act.n === 'thumbs' ? Math.sin(ta * 7) * 0.08 : 0);
    this.antenna.rotation.z = Math.sin(this.t * 2.2) * 0.12 - this.velocity.x * 0.02;
    this.antenna.rotation.x = -this.velocity.z * 0.02;

    // Eye blinking & pulsing halo
    this.nextBlink -= dt;
    if (this.nextBlink < 0) {
      this.blink = 0.18;
      this.nextBlink = 2.2 + Math.random() * 3;
    }
    let ey = 1;
    if (this.blink > 0) {
      this.blink -= dt;
      ey = 1 - 0.9 * Math.sin((1 - Math.max(0, this.blink) / 0.18) * Math.PI);
    }
    this.eyes.forEach((e) => {
      e.scale.y = ey;
      if (e.userData.halo) {
        e.userData.halo.material.opacity = 0.5 + Math.sin(this.t * 3) * 0.12;
      }
    });

    // Arms kinematics & actions (walk swing, wave, thumbs, dance)
    const p = this.phase;
    const swing = 0.75 * Math.min(m, 1.4);
    const sR = Math.sin(p);
    const sL = -Math.sin(p);

    const walkR = { sx: sR * swing, sz: -0.1, ex: -0.12 - Math.max(0, -sR) * 0.5, ez: 0, th: -0.5, fc: 0.55 };
    const walkL = { sx: sL * swing, sz:  0.1, ex: -0.12 - Math.max(0, -sL) * 0.5, ez: 0, th: -0.5, fc: 0.55 };

    const k = clamp(mw * 3, 0, 1);
    let tR = this.mixPose(this.IDLE_R, walkR, k);
    let tL = this.mixPose(this.IDLE_L, walkL, k);

    if (this.act.n === 'wave') {
      tR = { sx: -0.1, sz: -2.0, ex: 0, ez: -1.14 + Math.sin(ta * 10) * 0.5, th: -0.5, fc: 0.08 };
    } else if (this.act.n === 'thumbs') {
      const pump = Math.sin(ta * 7) * 0.12;
      tR = { sx: -1.4, sz: -0.2, ex: -1.7 + pump, ez: 0, th: 0, fc: 1.3 };
      tL = { sx: -1.4, sz:  0.2, ex: -1.7 + pump, ez: 0, th: 0, fc: 1.3 };
    } else if (this.act.n === 'dance') {
      const d = Math.sin(ta * 9);
      tR = { sx: -2.5 + d * 0.5, sz: -0.5, ex: -0.3, ez: 0, th: 0, fc: 0.15 };
      tL = { sx: -2.5 - d * 0.5, sz:  0.5, ex: -0.3, ez: 0, th: 0, fc: 0.15 };
    }

    if (air > 0.3 && !this.act.n) {
      tR = { sx: -0.2, sz: -1.4, ex: 0, ez: -0.3, th: -0.5, fc: 0.4 };
      tL = { sx: -0.2, sz:  1.4, ex: 0, ez:  0.3, th: -0.5, fc: 0.4 };
    }

    const ak = 1 - Math.exp(-dt * 14);
    [[this.armR, tR], [this.armL, tL]].forEach(([a, T]) => {
      for (const q in T) {
        a.cur[q] += (T[q] - a.cur[q]) * ak;
      }
      a.shoulder.rotation.set(a.cur.sx, 0, a.cur.sz);
      a.elbow.rotation.set(a.cur.ex, 0, a.cur.ez);

      a.pr += (((this.act.n === 'wave' && a === this.armR) ? 1 : 0) - a.pr) * ak;
      a.tw += ((this.act.n === 'thumbs' ? 1 : 0) - a.tw) * ak;

      a.hand.rotation.y = a.side * Math.PI / 2 * a.pr + Math.PI * a.tw;
      a.thumb.position.y = -0.035 - 0.045 * a.tw;
      a.thumb.scale.set(1 + 0.4 * a.tw, 1 + 0.5 * a.tw, 1 + 0.4 * a.tw);
      a.thumb.rotation.x = a.cur.th;
      a.thumb2.rotation.x = a.cur.th * 0.4;
      a.thumb.rotation.z = -a.side * a.cur.fc * 0.25 * (1 - a.tw);

      const cs = -a.side * a.cur.fc * (1 - 2 * a.tw);
      a.fingers.forEach((f) => {
        f.a.rotation.z = cs * 0.85;
        f.b.rotation.z = cs * 1.05;
        f.c.rotation.z = cs * 0.7;
      });
    });
  }
}
