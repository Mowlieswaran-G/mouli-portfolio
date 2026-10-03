import * as THREE from 'three';

/**
 * BoltRobot – Ported from the "Bolt – 3D Robot" HTML animation.
 *
 * Options:
 *   seated: boolean — if true, robot is in a seated/typing pose (for desk use)
 *   position: { x, y, z }
 */
export class BoltRobot {
  constructor(scene, position = { x: 0, y: 0, z: 0 }, options = {}) {
    this.scene = scene;
    this.isSeated = options.seated || false;

    // Animation state
    this.act = null;
    this.actT = 0;
    this.actD = 1;
    this.idleT = this.isSeated ? 6 : 5;
    this.blink = 0;
    this.nb = 2;
    this.elapsedTime = 0;
    this.typingPhase = 0; // for seated typing animation

    // Arm pose interpolation arrays: [shoulderZ, shoulderX, elbowZ, indexCurl, otherCurl]
    this.POSE = {
      rest:   [[-0.1, -0.04,  0.22, 0.3, 0.3], [ 0.1, -0.04, -0.22, 0.3, 0.3]],
      wave:   [[-0.9, -0.1,  -1.9,  0.1, 0.1], [ 0.2, -0.15, -0.3,  0.3, 0.3]],
      point:  [[-0.9, -0.1,  -1.9,  0.0, 1.5], [ 0.2, -0.15, -0.3,  0.3, 0.3]],
      up:     [[-2.5,  0.0,   0.3,  0.2, 0.2], [ 2.5,  0.0,  -0.3,  0.2, 0.2]],
      // Natural seated typing pose: upper arms hang down, forearms extend forward horizontally, hands flat over keys
      // Format: [shoulderX, shoulderY, shoulderZ, elbowX, elbowY, elbowZ, fingerCurl]
      typing: [
        [-0.41, 0.00, -0.03, -0.75, -0.50,  1.15, 0.35], // left arm
        [-0.41, 0.00,  0.03, -0.75,  0.50, -1.15, 0.35], // right arm
      ],
    };
    this.D = { jump: 0.9, spin: 1.1, dance: 3, wave: 2.2, point: 2 };

    this.cur = [
      [...(this.isSeated ? this.POSE.typing[0] : this.POSE.rest[0])],
      [...(this.isSeated ? this.POSE.typing[1] : this.POSE.rest[1])],
    ];

    // Root group
    this.root = new THREE.Group();
    this.root.position.set(position.x, position.y, position.z);
    this.root.scale.setScalar(0.42);

    this._build();
    scene.add(this.root);
  }

  // -------------------------------------------------------------------
  _mat(color, opts = {}) {
    return new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.25,
      metalness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      ...opts,
    });
  }

  _add(parent, geo, mat, pos, sc, rot) {
    const o = new THREE.Mesh(geo, mat);
    o.castShadow = true;
    if (pos) o.position.set(...pos);
    if (sc)  o.scale.set(...sc);
    if (rot) o.rotation.set(...rot);
    parent.add(o);
    return o;
  }

  _grp(parent, x = 0, y = 0, z = 0) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  }

  _sp(r) { return new THREE.SphereGeometry(r, 40, 28); }
  _cy(a, b, h) { return new THREE.CylinderGeometry(a, b, h, 32); }

  // -------------------------------------------------------------------
  _build() {
    const white = this._mat(0xeef3fb, { roughness: 0.18 });
    const grey  = this._mat(0xc9d2de);
    const dark  = this._mat(0x0b0f1a, { roughness: 0.3, metalness: 0.8 });
    const visor = this._mat(0x05070d, { roughness: 0.04, metalness: 0.4 });
    const blue  = new THREE.MeshBasicMaterial({ color: 0x3fd9ff });
    const core  = new THREE.MeshBasicMaterial({ color: 0xc8fcff });

    this.rig = this._grp(this.root);

    // ---- Torso ----
    this._add(this.rig, this._sp(1),    white,  [0, 2.55, 0], [0.72, 0.78, 0.56]);
    this._add(this.rig, this._sp(0.4),  grey,   [0, 2.7,  0.5], [1.1, 0.75, 0.16]);
    this._add(this.rig, this._sp(0.07), blue,   [0, 2.52, 0.58], [1, 1, 0.4]);
    this._add(this.rig, new THREE.TorusGeometry(0.12, 0.012, 8, 32), blue, [0, 2.52, 0.58]);
    this._add(this.rig, this._sp(0.5),  dark,   [0, 2.6, -0.45], [0.9, 1.1, 0.5]);
    this._add(this.rig, new THREE.TorusGeometry(0.7, 0.012, 8, 64), dark, [0, 3.05, 0], null, [Math.PI / 2, 0, 0]);
    this._add(this.rig, this._cy(0.36, 0.4, 0.28), dark, [0, 1.85, 0]);
    this._add(this.rig, this._sp(0.45), dark,   [0, 1.62, 0], [1, 0.6, 0.85]);
    this._add(this.rig, this._cy(0.16, 0.2, 0.32), dark, [0, 3.42, 0]);

    // ---- Head ----
    this.head = this._grp(this.rig, 0, 4.15, 0);
    this._add(this.head, this._sp(0.85), white, [0, 0, 0], [1.15, 0.92, 1]);
    this._add(this.head, this._sp(0.6),  visor, [0, -0.02, 0.62], [1.45, 0.8, 0.5]);

    // Eye glow texture
    const gc = document.createElement('canvas');
    gc.width = gc.height = 64;
    const g2 = gc.getContext('2d');
    const gg = g2.createRadialGradient(32, 32, 2, 32, 32, 32);
    gg.addColorStop(0, 'rgba(120,240,255,.9)');
    gg.addColorStop(0.4, 'rgba(60,200,255,.35)');
    gg.addColorStop(1, 'rgba(60,200,255,0)');
    g2.fillStyle = gg;
    g2.fillRect(0, 0, 64, 64);
    const gtex = new THREE.CanvasTexture(gc);

    this._add(this.head, new THREE.TorusGeometry(0.62, 0.025, 10, 64), dark, [0, -0.02, 0.7], [1.42, 0.8, 0.5]);

    this.eyes = [-1, 1].map(s => {
      const sp2 = new THREE.Sprite(new THREE.SpriteMaterial({
        map: gtex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
      }));
      sp2.scale.set(1.1, 1.1, 1);
      sp2.position.set(s * 0.38, 0.03, 0.97);
      this.head.add(sp2);
      const e = this._grp(this.head, s * 0.38, 0.03, 0.9);
      this._add(e, this._sp(0.26), blue, [0, 0, 0], [1, 1, 0.22]);
      this._add(e, this._sp(0.15), core, [0, 0, 0.04], [1, 1, 0.2]);
      return e;
    });

    [-1, 1].forEach(s => {
      this._add(this.head, this._cy(0.32, 0.32, 0.2), dark, [s * 1.06, 0, 0], null, [0, 0, Math.PI / 2]);
      this._add(this.head, this._cy(0.18, 0.18, 0.24), blue, [s * 1.09, 0, 0], null, [0, 0, Math.PI / 2]);
    });
    this._add(this.head, new THREE.TorusGeometry(0.8, 0.012, 8, 60), dark, [0, 0.35, 0], [1.13, 0.9, 1], [Math.PI / 2.4, 0, 0]);

    // ---- Arms ----
    this.arms = [-1, 1].map(s => {
      const sh = this._grp(this.rig, s * 0.98, 2.95, 0);
      this._add(sh, this._sp(0.22), dark);
      this._add(sh, this._sp(0.3),  white, [s * 0.04, 0.02, 0], [0.9, 1, 1]);
      this._add(sh, new THREE.TorusGeometry(0.2, 0.014, 8, 28), blue, [0, -0.12, 0], null, [Math.PI / 2, 0, 0]);
      this._add(sh, this._cy(0.15, 0.14, 0.8), white, [0, -0.45, 0]);

      const el = this._grp(sh, 0, -0.9, 0);
      this._add(el, this._sp(0.18), dark);
      this._add(el, new THREE.TorusGeometry(0.16, 0.013, 8, 24), blue, [0, -0.05, 0], null, [Math.PI / 2, 0, 0]);
      this._add(el, this._cy(0.14, 0.12, 0.75), white, [0, -0.42, 0]);

      const hd = this._grp(el, 0, -0.86, 0);
      this._add(hd, this._sp(0.17), dark, [0, 0, 0], [1, 1.1, 0.8]);

      const f = [0, 1, 2].map(i => {
        const p = this._grp(hd, (i - 1) * 0.085, -0.14, 0.0);
        this._add(p, this._cy(0.04, 0.035, 0.24), dark, [0, -0.12, 0]);
        return p;
      });

      const th = this._grp(hd, s * -0.15, -0.05, 0.03);
      this._add(th, this._cy(0.04, 0.035, 0.18), dark, [0, -0.08, 0]);

      return { sh, el, f, th, s };
    });

    // ---- Legs ----
    this.legs = [-1, 1].map(s => {
      const h = this._grp(this.rig, s * 0.4, 1.58, 0);
      this._add(h, this._sp(0.24), dark);
      this._add(h, this._cy(0.2, 0.18, 0.62), white, [0, -0.38, 0]);

      const k = this._grp(h, 0, -0.72, 0);
      this._add(k, this._sp(0.19), dark);
      this._add(k, new THREE.TorusGeometry(0.18, 0.013, 8, 24), blue, [0, 0, 0], null, [0, Math.PI / 2, 0]);
      this._add(k, this._cy(0.17, 0.19, 0.55), white, [0, -0.33, 0]);

      const ft = this._grp(k, 0, -0.62, 0);
      this._add(ft, this._sp(0.4), white, [0, -0.05, 0.2], [0.9, 0.55, 1.45]);
      this._add(ft, this._cy(0.38, 0.4, 0.1), dark, [0, -0.24, 0.22], [1, 1, 1.6]);
      this._add(ft, new THREE.BoxGeometry(0.5, 0.05, 0.12), blue, [0, -0.2, 0.8]);

      return { h, k, s };
    });

    // Set initial seated pose immediately (legs under desk, arms on keyboard, head at screen)
    if (this.isSeated) {
      this.legs.forEach(l => {
        l.h.rotation.x = -1.50;  // thigh forward along chair cushion under desk
        l.k.rotation.x =  1.45;  // knee bends lower-leg DOWN toward floor
      });
      this.arms.forEach((a, i) => {
        const t = this.POSE.typing[i];
        a.sh.rotation.set(t[0], t[1], t[2]);
        a.el.rotation.set(t[3], t[4], t[5]);
        a.f.forEach(f => { f.rotation.x = 0.35; });
      });
      this.head.rotation.x = -0.15;
      this.rig.position.y = 0.0;
    }

    // Soft shadow blob
    const cs = document.createElement('canvas');
    cs.width = cs.height = 64;
    const cx = cs.getContext('2d');
    const gr = cx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(0,0,0,.35)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    cx.fillStyle = gr;
    cx.fillRect(0, 0, 64, 64);
    this.shadowBlob = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 2),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cs), transparent: true, depthWrite: false })
    );
    this.shadowBlob.rotation.x = -Math.PI / 2;
    this.shadowBlob.position.y = -0.02;
    this.root.add(this.shadowBlob);

    // Floor / desk glow
    const fc = document.createElement('canvas');
    fc.width = fc.height = 128;
    const f2 = fc.getContext('2d');
    const fg = f2.createRadialGradient(64, 64, 4, 64, 64, 64);
    fg.addColorStop(0, 'rgba(80,220,255,.55)');
    fg.addColorStop(0.5, 'rgba(80,160,255,.2)');
    fg.addColorStop(1, 'rgba(80,160,255,0)');
    f2.fillStyle = fg;
    f2.fillRect(0, 0, 128, 128);
    const floorGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 3.6),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(fc),
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      })
    );
    floorGlow.rotation.x = -Math.PI / 2;
    floorGlow.position.y = -0.03;
    this.root.add(floorGlow);

    // NPC point light
    const npcLight = new THREE.PointLight(0x3fd9ff, 3.5, 8);
    npcLight.position.set(0, 3.5, 0);
    this.root.add(npcLight);
    this.npcLight = npcLight;
  }

  // -------------------------------------------------------------------
  //  Public API
  // -------------------------------------------------------------------
  play(name) {
    this.act = name;
    this.actT = 0;
    this.actD = this.D[name] || 1;
    this.idleT = 10;
  }

  lookAt(targetX, targetZ) {
    const dx = targetX - this.root.position.x;
    const dz = targetZ - this.root.position.z;
    const angle = Math.atan2(dx, dz);
    const current = this.root.rotation.y;
    const delta = Math.atan2(Math.sin(angle - current), Math.cos(angle - current));
    this.root.rotation.y += delta * 0.04;
  }

  // -------------------------------------------------------------------
  update(dt) {
    this.elapsedTime += dt;
    const t = this.elapsedTime;
    const k = Math.min(1, dt * 8);
    const L = (a, b, kk) => a + (b - a) * kk;

    if (this.isSeated) {
      this._updateSeated(dt, t, k, L);
    } else {
      this._updateStanding(dt, t, k, L);
    }

    // Blink
    this.nb -= dt;
    if (this.nb < 0) { this.blink = 0.13; this.nb = 2 + Math.random() * 3; }
    this.blink = Math.max(0, this.blink - dt);
    this.eyes.forEach(e => { e.scale.y = this.blink > 0 ? 0.08 : 1; });

    // NPC light pulse
    this.npcLight.intensity = 3.5 + Math.sin(t * 2.2) * 0.8;
  }

  _updateSeated(dt, t, k, L) {
    // ---- Seated legs: thighs resting forward on chair cushion, shins down ----
    this.legs.forEach(l => {
      l.h.rotation.x = L(l.h.rotation.x, -1.50, k * 0.4); // thighs forward
      l.k.rotation.x = L(l.k.rotation.x,  1.45, k * 0.4); // lower-legs down
    });

    // ---- Head looks down at monitor code ----
    this.typingPhase += dt;
    const lookAtScreen = -0.15;
    const headSway = Math.sin(t * 0.7) * 0.02;

    // Seated: always keep hands on keyboard operating the computer
    const tp = this.POSE.typing;
    let turboTyping = false;
    if (this.act) {
      this.actT += dt;
      const p = Math.min(this.actT / this.actD, 1);
      turboTyping = true; // Turbo code sprint when user triggers an action
      if (p >= 1) {
        this.act = null;
      }
    }

    // Realistic typing cadence (bursts of keystrokes with brief thinking pauses)
    const burst = Math.sin(t * 1.6);
    const isTypingActive = turboTyping || (burst > -0.65);
    const typeSpeed = turboTyping ? 26 : 14;

    // ---- Arms over Keyboard (Natural Typing Reach) ----
    this.arms.forEach((a, i) => {
      const c = this.cur[i];
      const g = tp[i];
      for (let j = 0; j < 7; j++) c[j] = L(c[j], g[j], k);

      let sx = c[0];
      let sy = c[1];
      let sz = c[2];
      let ex = c[3];
      let ey = c[4];
      let ez = c[5];

      if (isTypingActive) {
        // Natural alternating hand typing motion
        const handOffset = i * Math.PI;
        const tapMotion = Math.sin(t * typeSpeed + handOffset);
        // Forearm keystroke tap down towards keys
        ex += (tapMotion > 0 ? tapMotion * 0.03 : 0);
        // Subtle drift across keyboard keys
        ez += Math.sin(t * 2.2 + i * 1.5) * 0.02;
      }

      a.sh.rotation.set(sx, sy, sz);
      a.el.rotation.set(ex, ey, ez);

      // Fingers actively typing on keys (tapping DOWN onto keycaps)
      a.f.forEach((f, n) => {
        let curl = 0.35;
        if (isTypingActive) {
          const fingerTap = Math.sin(t * (typeSpeed + n * 2.2) + i * 2.8);
          curl = 0.25 + (fingerTap > 0 ? fingerTap * 0.25 : 0);
        }
        f.rotation.x = curl; // POSITIVE curl bends fingers downward onto keys
      });

      // Thumb tapping spacebar
      const thumbTap = isTypingActive ? Math.abs(Math.sin(t * 7.5 + i * 3)) * 0.2 : 0;
      a.th.rotation.x = 0.2 + thumbTap;
    });

    // ---- Gentle breathing ----
    this.rig.position.y = Math.sin(t * 1.5) * 0.01;
    this.rig.rotation.z = Math.sin(t * 0.9) * 0.005;

    // Head tracks monitor text
    this.head.rotation.x = L(this.head.rotation.x, lookAtScreen + headSway, k);
    this.head.rotation.y = L(this.head.rotation.y, Math.sin(t * 0.6) * 0.06, k);
    this.head.rotation.z = Math.sin(t * 1.1) * 0.012;

    this.shadowBlob.scale.setScalar(1);
  }

  _updateStanding(dt, t, k, L) {
    if (!this.act) {
      this.idleT -= dt;
      if (this.idleT < 0) {
        const idles = ['wave', 'point', 'dance'];
        this.play(idles[Math.floor(Math.random() * idles.length)]);
      }
    }

    let tp = this.POSE.rest;
    let spin = 0, lift = 0, sway = 0;

    if (this.act) {
      this.actT += dt;
      const p = Math.min(this.actT / this.actD, 1);
      if (this.act === 'wave')  tp = this.POSE.wave;
      if (this.act === 'point') tp = this.POSE.point;
      if (this.act === 'jump')  { lift = Math.sin(p * Math.PI) * 1.3; tp = this.POSE.up; }
      if (this.act === 'spin')  { spin = p * Math.PI * 2; lift = Math.sin(p * Math.PI) * 0.4; tp = this.POSE.up; }
      if (this.act === 'dance') { tp = this.POSE.up; sway = Math.sin(t * 9); lift = Math.abs(sway) * 0.2; }
      if (p >= 1) { this.act = null; this.idleT = 4 + Math.random() * 3; }
    }

    this.arms.forEach((a, i) => {
      const c = this.cur[i];
      const g = tp[i];
      for (let j = 0; j < 5; j++) c[j] = L(c[j], g[j], k);
      let sz = c[0], ez = c[2];
      if (this.act === 'wave' && i === 0) ez += Math.sin(t * 12) * 0.35;
      if (this.act === 'dance') sz += sway * 0.35 * a.s;
      a.sh.rotation.set(c[1], 0, sz);
      a.el.rotation.z = ez;
      a.f.forEach((f, n) => { f.rotation.x = -(n === 1 ? c[3] : c[4]); });
      a.th.rotation.x = -0.3;
    });

    this.legs.forEach(l => {
      l.h.rotation.x = lift > 0 ? -0.4 : 0;
      l.k.rotation.x = lift > 0 ? 0.7 : 0;
    });

    if (spin !== 0) this.root.rotation.y += spin * dt * 1.5;

    this.rig.position.y = lift + Math.sin(t * 2) * 0.03;
    this.rig.rotation.z = sway * 0.08 + Math.sin(t * 1.1) * 0.012;
    this.head.rotation.x = L(this.head.rotation.x, 0, k);
    this.head.rotation.z = this.act === 'dance' ? sway * 0.12 : Math.sin(t * 1.3) * 0.03;
    this.shadowBlob.scale.setScalar(1 - lift * 0.18);
  }

  dispose() {
    this.scene.remove(this.root);
  }
}
