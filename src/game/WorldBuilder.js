import * as THREE from 'three';
import { PROJECTS_DATA } from '../data/projects.js';
import { SKILLS_DATA } from '../data/skills.js';
import { ACHIEVEMENTS_DATA } from '../data/achievements.js';

export class WorldBuilder {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.interactables = [];
    this.animatedObjects = [];
    this.npc = null;

    // Materials Palette
    this.initMaterials();
  }

  createGridTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Sleek cyber deep slate background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 512);

    // Minor glowing cyan grid lines
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 2;
    const step = 64;
    for (let x = 0; x <= 512; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y <= 512; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // Major cyber nexus lines (brighter accents)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 3;
    for (let x = 0; x <= 512; x += step * 2) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y <= 512; y += step * 2) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // Luminous glowing intersection nodes
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    for (let x = 0; x <= 512; x += step) {
      for (let y = 0; y <= 512; y += step) {
        ctx.fillRect(x - 2, y - 2, 4, 4);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(40, 40);
    return texture;
  }

  createNeonSignMesh(width, height, text, subtitle = '', textColor = '#00f0ff', borderColor = 'rgba(0, 240, 255, 0.5)') {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Outer cyber border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

    // Glowing Main Title
    ctx.shadowColor = textColor;
    ctx.shadowBlur = 28;
    ctx.fillStyle = textColor;
    ctx.font = 'bold 74px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, subtitle ? 95 : 128);

    // Subtitle
    if (subtitle) {
      ctx.shadowBlur = 10;
      ctx.font = '500 32px "JetBrains Mono", monospace';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(subtitle, canvas.width / 2, 175);
    }

    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const geo = new THREE.PlaneGeometry(width, height);
    return new THREE.Mesh(geo, mat);
  }

  initMaterials() {
    const gridTex = this.createGridTexture();
    this.materials = {
      floorDark: new THREE.MeshStandardMaterial({
        color: 0x1a2744, // Vibrant deep cyber blue
        map: gridTex,
        roughness: 0.35,
        metalness: 0.55
      }),
      plazaFloor: new THREE.MeshStandardMaterial({
        color: 0x243b66, // Luminous plaza platform
        map: gridTex,
        roughness: 0.25,
        metalness: 0.65
      }),
      concreteWall: new THREE.MeshStandardMaterial({
        color: 0x334155, // Clean slate structure
        roughness: 0.45,
        metalness: 0.5
      }),
      metalDark: new THREE.MeshStandardMaterial({
        color: 0x24324a, // Polished high-tech alloy
        roughness: 0.25,
        metalness: 0.75
      }),
      glass: new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.4,
        roughness: 0.05,
        metalness: 0.95
      }),
      neonCyan: new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 1.8,
        roughness: 0.1
      }),
      neonMagenta: new THREE.MeshStandardMaterial({
        color: 0xff007f,
        emissive: 0xff007f,
        emissiveIntensity: 1.8,
        roughness: 0.1
      }),
      neonAmber: new THREE.MeshStandardMaterial({
        color: 0xffb703,
        emissive: 0xffb703,
        emissiveIntensity: 1.8,
        roughness: 0.1
      }),
      neonEmerald: new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x10b981,
        emissiveIntensity: 1.8,
        roughness: 0.1
      }),
      neonPurple: new THREE.MeshStandardMaterial({
        color: 0xc084fc,
        emissive: 0xa855f7,
        emissiveIntensity: 1.8,
        roughness: 0.1
      }),
      gold: new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xffaa00,
        emissiveIntensity: 0.5,
        metalness: 0.9,
        roughness: 0.2
      })
    };
  }

  buildWorld() {
    this.buildGroundAndSky();
    this.buildSpawnPlaza();
    this.buildCreatorsHouse();
    this.buildProjectLab();
    this.buildSkillArena();
    this.buildAchievementHall();
    this.buildBossCoreSpire();
    this.buildContactStation();
    this.buildEasterEgg();
    this.buildDistantSkyline();
    this.buildParticleDust();

    return {
      colliders: this.colliders,
      interactables: this.interactables,
      npc: this.npc
    };
  }

  // Register an interactable POI
  addInteractable(data) {
    this.interactables.push(data);
  }

  // Register physical collision bounding box
  addCollider(box) {
    this.colliders.push(box);
  }

  createWall(x, y, z, width, height, depth, material = this.materials.concreteWall, angle = 0) {
    const geo = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(x, y, z);
    mesh.rotation.y = angle;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    // Compute oriented or AABB bounding box for collision
    const halfW = width / 2;
    const halfD = depth / 2;
    const box = new THREE.Box3(
      new THREE.Vector3(x - halfW, 0, z - halfD),
      new THREE.Vector3(x + halfW, height, z + halfD)
    );
    this.addCollider(box);

    return mesh;
  }

  buildGroundAndSky() {
    // 1. Massive Ground Plane
    const groundGeo = new THREE.PlaneGeometry(350, 350);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMesh = new THREE.Mesh(groundGeo, this.materials.floorDark);
    groundMesh.receiveShadow = true;
    this.scene.add(groundMesh);

    // 2. Central Plaza Hexagonal Inset
    const plazaGeo = new THREE.CylinderGeometry(20, 20, 0.05, 6);
    const plazaMesh = new THREE.Mesh(plazaGeo, this.materials.plazaFloor);
    plazaMesh.position.y = 0.02;
    plazaMesh.receiveShadow = true;
    this.scene.add(plazaMesh);

    // Glowing Hexagonal Border for Plaza
    const plazaBorderGeo = new THREE.RingGeometry(19.8, 20.3, 6);
    plazaBorderGeo.rotateX(-Math.PI / 2);
    const plazaBorder = new THREE.Mesh(plazaBorderGeo, this.materials.neonCyan);
    plazaBorder.position.y = 0.03;
    this.scene.add(plazaBorder);

    // 3. Player Spawn Point Teleport Pad (Directly under starting player position (0, 0, 8))
    const padGeo = new THREE.CircleGeometry(2.4, 32);
    padGeo.rotateX(-Math.PI / 2);
    const padMesh = new THREE.Mesh(padGeo, new THREE.MeshStandardMaterial({
      color: 0x1e294b,
      roughness: 0.2,
      metalness: 0.8
    }));
    padMesh.position.set(0, 0.03, 8);
    this.scene.add(padMesh);

    // Outer & inner glowing cyan energy rings around spawn
    const spawnRingOuter = new THREE.Mesh(new THREE.RingGeometry(2.2, 2.38, 32).rotateX(-Math.PI / 2), this.materials.neonCyan);
    spawnRingOuter.position.set(0, 0.035, 8);
    this.scene.add(spawnRingOuter);

    const spawnRingInner = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.32, 32).rotateX(-Math.PI / 2), this.materials.neonMagenta);
    spawnRingInner.position.set(0, 0.036, 8);
    this.scene.add(spawnRingInner);

    // Dedicated Spawn Celestial Spotlight (illuminates player brightly at launch)
    const spawnSpot = new THREE.SpotLight(0x00f0ff, 5.0, 22, Math.PI / 3, 0.4, 1.2);
    spawnSpot.position.set(0, 9, 8);
    spawnSpot.target.position.set(0, 0, 8);
    this.scene.add(spawnSpot);
    this.scene.add(spawnSpot.target);

    // 4. Glowing Floor Conduits (connecting Spawn to all sectors)
    const conduitMat = this.materials.neonCyan;

    const makeConduit = (x1, z1, x2, z2) => {
      const length = Math.hypot(x2 - x1, z2 - z1);
      const angle = Math.atan2(x2 - x1, z2 - z1);
      const geo = new THREE.PlaneGeometry(0.4, length);
      geo.rotateX(-Math.PI / 2);
      const conduit = new THREE.Mesh(geo, conduitMat);
      conduit.position.set((x1 + x2) / 2, 0.03, (z1 + z2) / 2);
      conduit.rotation.y = angle;
      this.scene.add(conduit);
    };

    // To House
    makeConduit(0, 0, -26, 0);
    // To Lab
    makeConduit(0, 0, 0, -32);
    // To Skills
    makeConduit(0, 0, 26, 0);
    // To Achievements
    makeConduit(0, 0, 20, -26);
    // To Contact
    makeConduit(0, 0, 0, 30);
    // Lab to Boss Core
    makeConduit(0, -32, 0, -66);
  }

  buildSpawnPlaza() {
    // Monumental Entrance Archway
    const archMat = this.materials.metalDark;
    this.createWall(-6, 4, 12, 1.2, 8, 1.2, archMat);
    this.createWall(6, 4, 12, 1.2, 8, 1.2, archMat);
    this.createWall(0, 8, 12, 13.2, 1.2, 1.2, archMat);

    // Neon Pillars on Archway
    const pillarLightL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 7.8, 1.22), this.materials.neonCyan);
    pillarLightL.position.set(-5.4, 4, 12);
    this.scene.add(pillarLightL);

    const pillarLightR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 7.8, 1.22), this.materials.neonCyan);
    pillarLightR.position.set(5.4, 4, 12);
    this.scene.add(pillarLightR);

    // Luminous Sign on Entrance Arch (Front & Back)
    const archSignFront = this.createNeonSignMesh(11, 1.4, "M O U L I", "DEVELOPER • CREATOR • BUILDER", "#00f0ff");
    archSignFront.position.set(0, 8, 12.65);
    this.scene.add(archSignFront);

    const archSignBack = this.createNeonSignMesh(11, 1.4, "M O U L I", "PORTFOLIO NEXUS // 60 FPS", "#00f0ff");
    archSignBack.position.set(0, 8, 11.35);
    archSignBack.rotation.y = Math.PI;
    this.scene.add(archSignBack);

    // Central Kinetic Monument / Obelisk
    const obeliskGeo = new THREE.CylinderGeometry(0.5, 0.9, 4.5, 6);
    const obeliskMesh = new THREE.Mesh(obeliskGeo, this.materials.metalDark);
    obeliskMesh.position.set(0, 2.25, 0);
    this.scene.add(obeliskMesh);
    this.addCollider(new THREE.Box3(new THREE.Vector3(-1.2, 0, -1.2), new THREE.Vector3(1.2, 5, 1.2)));

    // Spinning Holographic Rings around obelisk
    const ringGeo = new THREE.TorusGeometry(1.8, 0.05, 8, 32);
    const ring1 = new THREE.Mesh(ringGeo, this.materials.neonCyan);
    ring1.position.set(0, 2.5, 0);
    this.scene.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.04, 8, 32), this.materials.neonMagenta);
    ring2.position.set(0, 2.5, 0);
    ring2.rotation.x = Math.PI / 4;
    this.scene.add(ring2);

    this.animatedObjects.push({
      update: (dt) => {
        ring1.rotation.y += dt * 0.8;
        ring1.rotation.x += dt * 0.4;
        ring2.rotation.y -= dt * 1.0;
        ring2.rotation.z += dt * 0.5;
      }
    });

    // Street Lamps with radiant high-power light sources
    const lampPositions = [
      { x: -8, z: -8 },
      { x: 8, z: -8 },
      { x: -8, z: 8 },
      { x: 8, z: 8 }
    ];

    lampPositions.forEach((pos) => {
      const poleGeo = new THREE.CylinderGeometry(0.1, 0.12, 4.5, 8);
      const pole = new THREE.Mesh(poleGeo, this.materials.metalDark);
      pole.position.set(pos.x, 2.25, pos.z);
      this.scene.add(pole);

      const lampHeadGeo = new THREE.BoxGeometry(0.65, 0.3, 0.65);
      const lampHead = new THREE.Mesh(lampHeadGeo, this.materials.neonCyan);
      lampHead.position.set(pos.x, 4.5, pos.z);
      this.scene.add(lampHead);

      // High-intensity radiant pointlight
      const light = new THREE.PointLight(0x38bdf8, 4.2, 22);
      light.position.set(pos.x, 4.2, pos.z);
      this.scene.add(light);
    });

    // Plaza Navigational Signs
    this.buildNavSign(-7, 0, "[<--] THE CREATOR'S HOUSE", 0x00f0ff, Math.PI / 2);
    this.buildNavSign(0, -7, "[^^^] PROJECT LAB & CORE SPIRE", 0x00f0ff, 0);
    this.buildNavSign(7, 0, "[-->] SKILL ARENA", 0x00f0ff, -Math.PI / 2);
    this.buildNavSign(0, 7, "[v v] CONTACT TRANSMISSION", 0x00f0ff, Math.PI);
  }

  buildNavSign(x, z, text, colorHex, rotationY) {
    const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.8, 6);
    const post = new THREE.Mesh(postGeo, this.materials.metalDark);
    post.position.set(x, 0.9, z);
    this.scene.add(post);

    const boardGeo = new THREE.BoxGeometry(2.4, 0.5, 0.08);
    const board = new THREE.Mesh(boardGeo, new THREE.MeshStandardMaterial({ color: 0x0a0e17, metalness: 0.8 }));
    board.position.set(x, 1.8, z);
    board.rotation.y = rotationY;
    this.scene.add(board);

    const glowStripe = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.06, 0.09), new THREE.MeshBasicMaterial({ color: colorHex }));
    glowStripe.position.set(x, 1.6, z);
    glowStripe.rotation.y = rotationY;
    this.scene.add(glowStripe);
  }

  buildCreatorsHouse() {
    const hx = -28;
    const hz = 0;

    // Outer Walls (Studio Room 14m x 12m, height 5m)
    // Left wall
    this.createWall(hx - 7, 2.5, hz, 0.6, 5, 12);
    // Back wall
    this.createWall(hx, 2.5, hz - 6, 14, 5, 0.6);
    // Front wall (partially open for entrance)
    this.createWall(hx - 4.5, 2.5, hz + 6, 5, 5, 0.6);
    this.createWall(hx + 4.5, 2.5, hz + 6, 5, 5, 0.6);
    // Right wall (entrance side, with door gap)
    this.createWall(hx + 7, 2.5, hz - 3.5, 0.6, 5, 5);
    this.createWall(hx + 7, 2.5, hz + 3.5, 0.6, 5, 5);

    // Ceiling / Roof
    const roofGeo = new THREE.BoxGeometry(14.8, 0.4, 12.8);
    const roof = new THREE.Mesh(roofGeo, this.materials.metalDark);
    roof.position.set(hx, 5.2, hz);
    this.scene.add(roof);

    // House Floor
    const floorGeo = new THREE.BoxGeometry(13.6, 0.06, 11.6);
    const houseFloor = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({
      color: 0x172033,
      roughness: 0.4,
      metalness: 0.6
    }));
    houseFloor.position.set(hx, 0.04, hz);
    this.scene.add(houseFloor);

    // House Neon Sign above entrance
    const signGeo = new THREE.BoxGeometry(5.8, 0.9, 0.2);
    const signMesh = new THREE.Mesh(signGeo, this.materials.metalDark);
    signMesh.position.set(hx + 7.1, 4.2, hz);
    signMesh.rotation.y = -Math.PI / 2;
    this.scene.add(signMesh);

    const houseSign = this.createNeonSignMesh(5.6, 0.85, "THE CREATOR'S HOUSE", "MEET MOULI // NPC 01", "#38bdf8");
    houseSign.position.set(hx + 7.22, 4.2, hz);
    houseSign.rotation.y = -Math.PI / 2;
    this.scene.add(houseSign);

    // Interior Warm Spot Light
    const houseLight = new THREE.PointLight(0xffecd2, 4.0, 16);
    houseLight.position.set(hx, 4.0, hz);
    this.scene.add(houseLight);

    // Work Desk
    const deskGeo = new THREE.BoxGeometry(3.2, 0.1, 1.4);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.3 });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(hx - 3.5, 1.1, hz);
    this.scene.add(desk);

    // Desk legs
    const legGeo = new THREE.BoxGeometry(0.1, 1.1, 1.3);
    const leg1 = new THREE.Mesh(legGeo, this.materials.metalDark);
    leg1.position.set(hx - 4.9, 0.55, hz);
    this.scene.add(leg1);
    const leg2 = new THREE.Mesh(legGeo, this.materials.metalDark);
    leg2.position.set(hx - 2.1, 0.55, hz);
    this.scene.add(leg2);

    this.addCollider(new THREE.Box3(
      new THREE.Vector3(hx - 5.2, 0, hz - 0.9),
      new THREE.Vector3(hx - 1.8, 2.5, hz + 0.9)
    ));

    // Dual Monitors on Desk
    const monGeo = new THREE.BoxGeometry(1.2, 0.7, 0.05);
    const monScreenMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const mon1 = new THREE.Mesh(monGeo, monScreenMat);
    mon1.position.set(hx - 4.0, 1.6, hz - 0.2);
    mon1.rotation.y = 0.2;
    this.scene.add(mon1);

    const mon2 = new THREE.Mesh(monGeo, this.materials.neonMagenta);
    mon2.position.set(hx - 2.8, 1.6, hz - 0.2);
    mon2.rotation.y = -0.2;
    this.scene.add(mon2);

    // Keyboard & Coffee Mug
    const kb = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.03, 0.25), this.materials.metalDark);
    kb.position.set(hx - 3.5, 1.16, hz + 0.2);
    this.scene.add(kb);

    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.16, 8), this.materials.neonAmber);
    mug.position.set(hx - 2.4, 1.22, hz + 0.2);
    this.scene.add(mug);

    // Bookshelf against back wall
    const shelfGeo = new THREE.BoxGeometry(3.6, 3.8, 0.7);
    const shelf = new THREE.Mesh(shelfGeo, this.materials.concreteWall);
    shelf.position.set(hx + 2.5, 1.9, hz - 5.2);
    this.scene.add(shelf);
    this.addCollider(new THREE.Box3(
      new THREE.Vector3(hx + 0.5, 0, hz - 5.7),
      new THREE.Vector3(hx + 4.5, 4, hz - 4.7)
    ));

    // Decorative Books on shelf
    const bookColors = [0x00f0ff, 0xff007f, 0xffb703, 0x10b981];
    for (let b = 0; b < 6; b++) {
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.45, 0.35),
        new THREE.MeshBasicMaterial({ color: bookColors[b % bookColors.length] })
      );
      book.position.set(hx + 1.2 + (b * 0.3), 2.2, hz - 5.2);
      this.scene.add(book);
    }

    // Interactive Terminal Computer on Desk
    this.addInteractable({
      id: "house-terminal",
      name: "Developer Workstation",
      type: "terminal",
      position: new THREE.Vector3(hx - 3.5, 1.2, hz),
      radius: 2.5,
      prompt: "INSPECT WORKSTATION"
    });

    // NPC MOULI
    this.buildMouliNPC(hx - 1.2, hz + 0.5);
  }

  buildMouliNPC(x, z) {
    const npcGroup = new THREE.Group();
    npcGroup.position.set(x, 0, z);

    // NPC Cyber Robe / Grand Architect Coat (Luminous Royal Cobalt with Golden Trims)
    const bodyGeo = new THREE.CylinderGeometry(0.3, 0.42, 1.4, 8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb, // Radiant Royal Blue
      roughness: 0.25,
      metalness: 0.6
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.0;
    body.castShadow = true;
    npcGroup.add(body);

    // Golden Mantle / Collar
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.38, 0.25, 8), this.materials.gold);
    collar.position.y = 1.6;
    npcGroup.add(collar);

    // NPC Head with Sleek Titanium Mask & Cyan Visor
    const headGeo = new THREE.BoxGeometry(0.38, 0.38, 0.38);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Titanium silver head
      roughness: 0.2,
      metalness: 0.8
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.9;
    npcGroup.add(head);

    const visorGeo = new THREE.BoxGeometry(0.36, 0.12, 0.1);
    const visor = new THREE.Mesh(visorGeo, this.materials.neonCyan);
    visor.position.set(0, 0.04, 0.2);
    head.add(visor);

    // Holographic Halo / Creator Emblem (Radiant Golden Aura)
    const haloGeo = new THREE.TorusGeometry(0.38, 0.03, 8, 24);
    const halo = new THREE.Mesh(haloGeo, this.materials.neonAmber);
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 2.28;
    npcGroup.add(halo);

    // Radiant NPC Aura Beacon Light
    const npcLight = new THREE.PointLight(0x38bdf8, 4.0, 10);
    npcLight.position.set(0, 2.2, 0);
    npcGroup.add(npcLight);

    // Facing direction
    npcGroup.rotation.y = -Math.PI / 2;

    this.scene.add(npcGroup);
    this.npc = npcGroup;

    // Animate idle breathing
    let breathe = 0;
    this.animatedObjects.push({
      update: (dt) => {
        breathe += dt * 2.0;
        head.position.y = 1.9 + Math.sin(breathe) * 0.02;
        halo.rotation.z += dt * 0.8;
      }
    });

    // Add NPC Interactable
    this.addInteractable({
      id: "npc-mouli",
      name: "Mouli",
      type: "npc",
      position: new THREE.Vector3(x, 1.2, z),
      radius: 3.2,
      prompt: "TALK TO MOULI"
    });

    // NPC physical collision
    this.addCollider(new THREE.Box3(
      new THREE.Vector3(x - 0.7, 0, z - 0.7),
      new THREE.Vector3(x + 0.7, 2.2, z + 0.7)
    ));
  }

  buildProjectLab() {
    const lx = 0;
    const lz = -35;

    // Platform base for the Project Lab
    const labBaseGeo = new THREE.BoxGeometry(32, 0.1, 24);
    const labBase = new THREE.Mesh(labBaseGeo, this.materials.plazaFloor);
    labBase.position.set(lx, 0.04, lz);
    this.scene.add(labBase);

    // Trusses & Columns
    const colGeo = new THREE.BoxGeometry(0.8, 6, 0.8);
    const colPositions = [
      { x: lx - 15, z: lz - 11 },
      { x: lx + 15, z: lz - 11 },
      { x: lx - 15, z: lz + 11 },
      { x: lx + 15, z: lz + 11 }
    ];

    colPositions.forEach((pos) => {
      const col = new THREE.Mesh(colGeo, this.materials.metalDark);
      col.position.set(pos.x, 3, pos.z);
      this.scene.add(col);
      this.addCollider(new THREE.Box3(
        new THREE.Vector3(pos.x - 0.6, 0, pos.z - 0.6),
        new THREE.Vector3(pos.x + 0.6, 6, pos.z + 0.6)
      ));
    });

    // Top Header Banner "PROJECT LAB"
    const bannerGeo = new THREE.BoxGeometry(16, 1.2, 0.4);
    const banner = new THREE.Mesh(bannerGeo, this.materials.metalDark);
    banner.position.set(lx, 5.8, lz + 11);
    this.scene.add(banner);

    const labSign = this.createNeonSignMesh(15.5, 1.1, "PROJECT LAB", "INSPECTION BAY // 4 EXHIBITS", "#00f0ff");
    labSign.position.set(lx, 5.8, lz + 11.22);
    this.scene.add(labSign);

    // Glowing Ceiling Grid
    const ceilingBeam = new THREE.Mesh(new THREE.BoxGeometry(30, 0.3, 0.3), this.materials.neonCyan);
    ceilingBeam.position.set(lx, 6, lz);
    this.scene.add(ceilingBeam);

    // Distinct Project Stations
    const stations = [
      { project: PROJECTS_DATA[0], x: lx - 9, z: lz - 5 },
      { project: PROJECTS_DATA[1], x: lx - 3, z: lz - 7 },
      { project: PROJECTS_DATA[2], x: lx + 3, z: lz - 7 },
      { project: PROJECTS_DATA[3], x: lx + 9, z: lz - 5 }
    ];

    stations.forEach((st) => {
      this.buildProjectStation(st.project, st.x, st.z);
    });
  }

  buildProjectStation(project, x, z) {
    // Pedestal Base
    const baseGeo = new THREE.CylinderGeometry(1.2, 1.5, 1.0, 8);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.2,
      metalness: 0.9
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(x, 0.5, z);
    base.castShadow = true;
    this.scene.add(base);

    // Glowing ring on pedestal
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.22, 0.04, 8, 24),
      new THREE.MeshBasicMaterial({ color: project.color })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(x, 0.95, z);
    this.scene.add(ring);

    // Pedestal Collision
    this.addCollider(new THREE.Box3(
      new THREE.Vector3(x - 1.4, 0, z - 1.4),
      new THREE.Vector3(x + 1.4, 1.5, z + 1.4)
    ));

    // Unique 3D Model representation for each project
    let model;
    if (project.stationType === "sphere") {
      // NeuralFlow AI: Wireframe sphere + orbiting rings
      const sphereGeo = new THREE.IcosahedronGeometry(0.7, 2);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        wireframe: true,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.4
      });
      model = new THREE.Mesh(sphereGeo, sphereMat);
      const innerCore = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      model.add(innerCore);
    } else if (project.stationType === "core") {
      // QuantumOps: Hexagonal reactor core
      const coreGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.0, 6);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0xff007f,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0xff007f,
        emissiveIntensity: 0.5
      });
      model = new THREE.Mesh(coreGeo, coreMat);
      const energyBeam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 1.4, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      model.add(energyBeam);
    } else if (project.stationType === "network") {
      // NexusRealtime: Connected node network
      model = new THREE.Group();
      const nodeGeo = new THREE.SphereGeometry(0.18, 12, 12);
      const nodeMat = new THREE.MeshBasicMaterial({ color: 0xffb703 });
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const subNode = new THREE.Mesh(nodeGeo, nodeMat);
        subNode.position.set(Math.cos(angle) * 0.6, Math.sin(angle * 2) * 0.25, Math.sin(angle) * 0.6);
        model.add(subNode);
      }
      const centerNode = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), nodeMat);
      model.add(centerNode);
    } else {
      // HyperEngine 3D: Faceted crystal prism
      const crystalGeo = new THREE.OctahedronGeometry(0.7, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        roughness: 0.1,
        metalness: 0.8,
        wireframe: false,
        emissive: 0x10b981,
        emissiveIntensity: 0.4
      });
      model = new THREE.Mesh(crystalGeo, crystalMat);
    }

    model.position.set(x, 2.0, z);
    this.scene.add(model);

    // Pedestal Light
    const pLight = new THREE.PointLight(project.color, 2.2, 7);
    pLight.position.set(x, 2.6, z);
    this.scene.add(pLight);

    // Animate rotation & hovering
    this.animatedObjects.push({
      update: (dt, time) => {
        model.rotation.y += dt * 1.2;
        model.position.y = 2.0 + Math.sin(time * 2.5 + x) * 0.12;
      }
    });

    // Proximity trigger
    this.addInteractable({
      id: project.id,
      name: project.name,
      type: "project",
      data: project,
      position: new THREE.Vector3(x, 1.5, z),
      radius: 2.8,
      prompt: `INSPECT ${project.name.toUpperCase()}`
    });
  }

  buildSkillArena() {
    const sx = 28;
    const sz = 0;

    // Arena circular platform (diameter 26m)
    const arenaGeo = new THREE.CylinderGeometry(13, 13, 0.1, 32);
    const arenaMesh = new THREE.Mesh(arenaGeo, this.materials.plazaFloor);
    arenaMesh.position.set(sx, 0.04, sz);
    this.scene.add(arenaMesh);

    // Concentric glowing rings
    const r1 = new THREE.Mesh(new THREE.TorusGeometry(12.5, 0.05, 8, 32), this.materials.neonCyan);
    r1.rotation.x = Math.PI / 2;
    r1.position.set(sx, 0.06, sz);
    this.scene.add(r1);

    const r2 = new THREE.Mesh(new THREE.TorusGeometry(8.0, 0.05, 8, 32), this.materials.neonMagenta);
    r2.rotation.x = Math.PI / 2;
    r2.position.set(sx, 0.06, sz);
    this.scene.add(r2);

    // Center Skill Tree Trunk Pylon
    const trunkGeo = new THREE.CylinderGeometry(0.8, 1.4, 5.5, 8);
    const trunk = new THREE.Mesh(trunkGeo, this.materials.metalDark);
    trunk.position.set(sx, 2.75, sz);
    this.scene.add(trunk);
    this.addCollider(new THREE.Box3(new THREE.Vector3(sx - 1.2, 0, sz - 1.2), new THREE.Vector3(sx + 1.2, 6, sz + 1.2)));

    // Central Core Pulse Light
    const coreLight = new THREE.PointLight(0x00f0ff, 3.5, 20);
    coreLight.position.set(sx, 5.0, sz);
    this.scene.add(coreLight);

    // Signboard
    this.buildNavSign(sx - 10, sz, "✦ SKILL ARENA (5 ACTIVE NODES)", 0x00f0ff, Math.PI / 2);

    const skillSign = this.createNeonSignMesh(10, 1.2, "SKILL ARENA", "5 INTERACTIVE 3D NODES", "#10b981", "rgba(16, 185, 129, 0.6)");
    skillSign.position.set(sx, 4.8, sz - 10.5);
    this.scene.add(skillSign);

    // 5 Glowing Skill Tree Nodes branching out
    const nodeRadius = 7.5;
    SKILLS_DATA.forEach((skill, index) => {
      const angle = (index / SKILLS_DATA.length) * Math.PI * 2;
      const nx = sx + Math.cos(angle) * nodeRadius;
      const nz = sz + Math.sin(angle) * nodeRadius;

      // Connecting conduit branch from trunk
      const branchGeo = new THREE.BoxGeometry(nodeRadius, 0.1, 0.1);
      const branchMat = new THREE.MeshBasicMaterial({ color: skill.color });
      const branch = new THREE.Mesh(branchGeo, branchMat);
      branch.position.set((sx + nx) / 2, 2.5, (sz + nz) / 2);
      branch.rotation.y = -angle;
      this.scene.add(branch);

      // Node Pylon
      const pylonGeo = new THREE.CylinderGeometry(0.4, 0.6, 2.0, 8);
      const pylon = new THREE.Mesh(pylonGeo, this.materials.metalDark);
      pylon.position.set(nx, 1.0, nz);
      this.scene.add(pylon);
      this.addCollider(new THREE.Box3(new THREE.Vector3(nx - 0.7, 0, nz - 0.7), new THREE.Vector3(nx + 0.7, 2.5, nz + 0.7)));

      // Glowing Skill Orb
      const orbGeo = new THREE.IcosahedronGeometry(0.55, 1);
      const orbMat = new THREE.MeshStandardMaterial({
        color: skill.color,
        emissive: skill.color,
        emissiveIntensity: 0.6,
        roughness: 0.2
      });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.set(nx, 2.8, nz);
      this.scene.add(orb);

      // Node light
      const nLight = new THREE.PointLight(skill.color, 1.8, 8);
      nLight.position.set(nx, 3.2, nz);
      this.scene.add(nLight);

      this.animatedObjects.push({
        update: (dt, time) => {
          orb.rotation.y += dt * 1.5;
          orb.rotation.x += dt * 0.8;
          orb.position.y = 2.8 + Math.sin(time * 3 + index) * 0.15;
        }
      });

      // Interactable
      this.addInteractable({
        id: skill.id,
        name: skill.name,
        type: "skill",
        data: skill,
        position: new THREE.Vector3(nx, 1.5, nz),
        radius: 2.6,
        prompt: `DISCOVER ${skill.name.toUpperCase()}`
      });
    });
  }

  buildAchievementHall() {
    const ax = 22;
    const az = -28;

    // Museum Gallery Platform (16m x 16m)
    const platGeo = new THREE.BoxGeometry(18, 0.1, 18);
    const plat = new THREE.Mesh(platGeo, this.materials.plazaFloor);
    plat.position.set(ax, 0.04, az);
    this.scene.add(plat);

    // Gallery Pillars
    const pilGeo = new THREE.BoxGeometry(0.8, 5, 0.8);
    [
      { x: ax - 8, z: az - 8 },
      { x: ax + 8, z: az - 8 },
      { x: ax - 8, z: az + 8 },
      { x: ax + 8, z: az + 8 }
    ].forEach((p) => {
      const pil = new THREE.Mesh(pilGeo, this.materials.metalDark);
      pil.position.set(p.x, 2.5, p.z);
      this.scene.add(pil);
      this.addCollider(new THREE.Box3(new THREE.Vector3(p.x - 0.5, 0, p.z - 0.5), new THREE.Vector3(p.x + 0.5, 5, p.z + 0.5)));
    });

    // Gallery Neon Sign
    const sign = new THREE.Mesh(new THREE.BoxGeometry(10, 0.9, 0.3), this.materials.metalDark);
    sign.position.set(ax, 4.8, az + 8);
    this.scene.add(sign);

    const achSign = this.createNeonSignMesh(9.5, 1.1, "HALL OF MILESTONES", "HONORS & RECOGNITION", "#ffb703", "rgba(255, 183, 3, 0.6)");
    achSign.position.set(ax, 4.8, az + 8.2);
    this.scene.add(achSign);

    // 4 Display Pedestals for Achievements
    const positions = [
      { x: ax - 4, z: az - 4 },
      { x: ax + 4, z: az - 4 },
      { x: ax - 4, z: az + 4 },
      { x: ax + 4, z: az + 4 }
    ];

    ACHIEVEMENTS_DATA.forEach((ach, i) => {
      const pos = positions[i];

      // Glass Pedestal
      const pedGeo = new THREE.BoxGeometry(1.2, 1.4, 1.2);
      const ped = new THREE.Mesh(pedGeo, this.materials.metalDark);
      ped.position.set(pos.x, 0.7, pos.z);
      this.scene.add(ped);

      const glassCase = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.1), this.materials.glass);
      glassCase.position.set(pos.x, 1.95, pos.z);
      this.scene.add(glassCase);

      this.addCollider(new THREE.Box3(
        new THREE.Vector3(pos.x - 0.8, 0, pos.z - 0.8),
        new THREE.Vector3(pos.x + 0.8, 2.5, pos.z + 0.8)
      ));

      // 3D Trophy / Award Model inside glass
      let trophy;
      if (ach.icon === "trophy") {
        // Golden Cup
        const cupGeo = new THREE.CylinderGeometry(0.3, 0.15, 0.5, 12);
        trophy = new THREE.Mesh(cupGeo, this.materials.gold);
      } else if (ach.icon === "shield-check") {
        // Hex Shield
        const shieldGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 6);
        trophy = new THREE.Mesh(shieldGeo, this.materials.neonEmerald);
        trophy.rotation.x = Math.PI / 2;
      } else {
        // Star / Plaque
        const starGeo = new THREE.OctahedronGeometry(0.28, 0);
        trophy = new THREE.Mesh(starGeo, this.materials.neonAmber);
      }

      trophy.position.set(pos.x, 1.95, pos.z);
      this.scene.add(trophy);

      // Light inside
      const aLight = new THREE.PointLight(ach.color, 1.5, 5);
      aLight.position.set(pos.x, 2.2, pos.z);
      this.scene.add(aLight);

      this.animatedObjects.push({
        update: (dt) => {
          trophy.rotation.y += dt * 1.2;
        }
      });

      // Interactable
      this.addInteractable({
        id: ach.id,
        name: ach.title,
        type: "achievement",
        data: ach,
        position: new THREE.Vector3(pos.x, 1.4, pos.z),
        radius: 2.5,
        prompt: `INSPECT ${ach.title.toUpperCase()}`
      });
    });
  }

  buildBossCoreSpire() {
    const bx = 0;
    const bz = -70;

    // Circular elevated dais
    const daisGeo = new THREE.CylinderGeometry(10, 11, 0.8, 32);
    const dais = new THREE.Mesh(daisGeo, this.materials.plazaFloor);
    dais.position.set(bx, 0.4, bz);
    this.scene.add(dais);

    const bossSign = this.createNeonSignMesh(11, 1.3, "AEGIS CORE SPIRE", "FLAGSHIP MASTER PLATFORM", "#a855f7", "rgba(168, 85, 247, 0.6)");
    bossSign.position.set(bx, 5.2, bz + 9);
    this.scene.add(bossSign);

    // Massive Cyber Monolith Spire (Height 32m)
    const spireGeo = new THREE.BoxGeometry(2.4, 28, 2.4);
    const spireMat = new THREE.MeshStandardMaterial({
      color: 0x0b0f19,
      roughness: 0.1,
      metalness: 0.95
    });
    const spire = new THREE.Mesh(spireGeo, spireMat);
    spire.position.set(bx, 14, bz);
    this.scene.add(spire);

    this.addCollider(new THREE.Box3(
      new THREE.Vector3(bx - 2.0, 0, bz - 2.0),
      new THREE.Vector3(bx + 2.0, 30, bz + 2.0)
    ));

    // Glowing Neon Vertical Seams
    const seamGeo = new THREE.BoxGeometry(0.12, 27, 2.5);
    const seam = new THREE.Mesh(seamGeo, this.materials.neonPurple);
    seam.position.set(bx, 14, bz);
    this.scene.add(seam);

    // Monolith Orbiting Energy Rings
    const rGeo = new THREE.TorusGeometry(4.2, 0.08, 8, 32);
    const rMesh = new THREE.Mesh(rGeo, this.materials.neonCyan);
    rMesh.position.set(bx, 10, bz);
    this.scene.add(rMesh);

    // Sky Spotlight Beam pointing upward
    const beamGeo = new THREE.CylinderGeometry(0.4, 1.8, 60, 16);
    beamGeo.translate(0, 30, 0);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.35
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(bx, 0, bz);
    this.scene.add(beam);

    // Central Boss Project Terminal Dais
    const termPedGeo = new THREE.BoxGeometry(1.6, 1.2, 1.6);
    const termPed = new THREE.Mesh(termPedGeo, this.materials.metalDark);
    termPed.position.set(bx, 1.0, bz + 4.5);
    this.scene.add(termPed);

    const holoDisplay = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.05), this.materials.neonPurple);
    holoDisplay.position.set(bx, 1.8, bz + 4.5);
    this.scene.add(holoDisplay);

    this.addCollider(new THREE.Box3(
      new THREE.Vector3(bx - 1.0, 0, bz + 3.5),
      new THREE.Vector3(bx + 1.0, 2.0, bz + 5.5)
    ));

    this.animatedObjects.push({
      update: (dt) => {
        rMesh.rotation.y += dt * 0.9;
        rMesh.rotation.x += dt * 0.3;
      }
    });

    const flagshipProject = PROJECTS_DATA.find((p) => p.id === "proj-boss");
    this.addInteractable({
      id: "boss-terminal",
      name: "Aegis Core Platform",
      type: "project",
      data: flagshipProject,
      position: new THREE.Vector3(bx, 1.2, bz + 4.5),
      radius: 3.5,
      prompt: "INSPECT FLAGSHIP CORE SPIRE"
    });
  }

  buildContactStation() {
    const cx = 0;
    const cz = 32;

    // Contact Deck (radius 10m)
    const deckGeo = new THREE.CylinderGeometry(9, 9, 0.1, 24);
    const deck = new THREE.Mesh(deckGeo, this.materials.plazaFloor);
    deck.position.set(cx, 0.04, cz);
    this.scene.add(deck);

    // Outer border ring
    const borderRing = new THREE.Mesh(new THREE.TorusGeometry(8.9, 0.06, 8, 32), this.materials.neonCyan);
    borderRing.rotation.x = Math.PI / 2;
    borderRing.position.set(cx, 0.06, cz);
    this.scene.add(borderRing);

    // Satellite Dish Antenna Mast
    const mastGeo = new THREE.CylinderGeometry(0.2, 0.3, 7, 8);
    const mast = new THREE.Mesh(mastGeo, this.materials.metalDark);
    mast.position.set(cx, 3.5, cz + 6.5);
    this.scene.add(mast);

    const dishGeo = new THREE.CylinderGeometry(1.6, 0.1, 0.5, 16);
    const dish = new THREE.Mesh(dishGeo, this.materials.metalDark);
    dish.position.set(cx, 7, cz + 6.5);
    dish.rotation.x = Math.PI / 3;
    this.scene.add(dish);

    this.addCollider(new THREE.Box3(
      new THREE.Vector3(cx - 0.8, 0, cz + 5.8),
      new THREE.Vector3(cx + 0.8, 7.5, cz + 7.2)
    ));

    // Central Communications Terminal
    const termBaseGeo = new THREE.CylinderGeometry(1.2, 1.4, 1.1, 8);
    const termBase = new THREE.Mesh(termBaseGeo, this.materials.metalDark);
    termBase.position.set(cx, 0.55, cz);
    this.scene.add(termBase);

    // Hologram projection rings
    const holoRing1 = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.03, 8, 24), this.materials.neonCyan);
    holoRing1.rotation.x = Math.PI / 2;
    holoRing1.position.set(cx, 1.4, cz);
    this.scene.add(holoRing1);

    const holoRing2 = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.02, 8, 24), this.materials.neonMagenta);
    holoRing2.rotation.x = Math.PI / 2;
    holoRing2.position.set(cx, 1.7, cz);
    this.scene.add(holoRing2);

    this.addCollider(new THREE.Box3(
      new THREE.Vector3(cx - 1.4, 0, cz - 1.4),
      new THREE.Vector3(cx + 1.4, 2.0, cz + 1.4)
    ));

    const cLight = new THREE.PointLight(0x00f0ff, 3.0, 12);
    cLight.position.set(cx, 2.2, cz);
    this.scene.add(cLight);

    this.animatedObjects.push({
      update: (dt) => {
        holoRing1.rotation.z += dt * 1.2;
        holoRing2.rotation.z -= dt * 1.6;
      }
    });

    // Interactable Contact Terminal
    this.addInteractable({
      id: "contact-terminal",
      name: "Contact Station Terminal",
      type: "contact",
      position: new THREE.Vector3(cx, 1.2, cz),
      radius: 3.2,
      prompt: "ACCESS TRANSMISSION TERMINAL"
    });
  }

  buildEasterEgg() {
    // Secret terminal tucked in the alleyway behind The Creator's House
    const ex = -35;
    const ez = -10;

    const secretBoxGeo = new THREE.BoxGeometry(0.8, 1.0, 0.6);
    const secretBox = new THREE.Mesh(secretBoxGeo, this.materials.metalDark);
    secretBox.position.set(ex, 0.5, ez);
    this.scene.add(secretBox);

    const secretLight = new THREE.PointLight(0xff007f, 1.8, 4);
    secretLight.position.set(ex, 1.2, ez);
    this.scene.add(secretLight);

    this.addCollider(new THREE.Box3(
      new THREE.Vector3(ex - 0.5, 0, ez - 0.5),
      new THREE.Vector3(ex + 0.5, 1.2, ez + 0.5)
    ));

    this.addInteractable({
      id: "easter-egg",
      name: "Secret Dev Console",
      type: "easter-egg",
      position: new THREE.Vector3(ex, 0.8, ez),
      radius: 2.2,
      prompt: "ACCESS CLASSIFIED CONSOLE"
    });
  }

  buildDistantSkyline() {
    // Cyberpunk skyscraper metropolis in the distance
    const buildingColors = [0x14203d, 0x1a294f, 0x172547, 0x1e3a6a];
    const skylineRadius = 135;

    for (let i = 0; i < 48; i++) {
      const angle = (i / 48) * Math.PI * 2;
      const dist = skylineRadius + (Math.sin(i * 3) * 16);
      const bx = Math.cos(angle) * dist;
      const bz = Math.sin(angle) * dist;
      const width = 9 + Math.random() * 11;
      const height = 35 + Math.random() * 60;
      const depth = 9 + Math.random() * 11;

      const geo = new THREE.BoxGeometry(width, height, depth);
      const mat = new THREE.MeshStandardMaterial({
        color: buildingColors[i % buildingColors.length],
        roughness: 0.4,
        metalness: 0.7
      });
      const tower = new THREE.Mesh(geo, mat);
      tower.position.set(bx, height / 2, bz);
      this.scene.add(tower);

      // Glowing window stripes / data-center bands on towers
      const bandCount = 3 + Math.floor(Math.random() * 4);
      for (let b = 1; b <= bandCount; b++) {
        const bandHeight = (height / (bandCount + 1)) * b;
        const bandGeo = new THREE.BoxGeometry(width + 0.1, 0.4, depth + 0.1);
        const bandMesh = new THREE.Mesh(
          bandGeo,
          (i + b) % 2 === 0 ? this.materials.neonCyan : this.materials.neonMagenta
        );
        bandMesh.position.set(bx, bandHeight, bz);
        this.scene.add(bandMesh);
      }

      // Neon rooftop beacon & spire antenna
      const beacon = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.85, 0.5, depth * 0.85),
        i % 2 === 0 ? this.materials.neonCyan : this.materials.neonMagenta
      );
      beacon.position.set(bx, height + 0.25, bz);
      this.scene.add(beacon);

      if (i % 2 === 0) {
        const spire = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.15, 6, 6),
          this.materials.neonAmber
        );
        spire.position.set(bx, height + 3.2, bz);
        this.scene.add(spire);
      }
    }
  }

  buildParticleDust() {
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 120;
      positions[i + 1] = 0.5 + Math.random() * 14;
      positions[i + 2] = (Math.random() - 0.5) * 120;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.15,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);

    this.animatedObjects.push({
      update: (dt) => {
        const posArr = geometry.attributes.position.array;
        for (let i = 1; i < posArr.length; i += 3) {
          posArr[i] += Math.sin(posArr[i - 1] + posArr[i + 1]) * dt * 0.3;
          if (posArr[i] > 16) posArr[i] = 0.5;
        }
        geometry.attributes.position.needsUpdate = true;
      }
    });
  }

  update(delta, time) {
    for (let i = 0; i < this.animatedObjects.length; i++) {
      this.animatedObjects[i].update(delta, time);
    }
  }
}
