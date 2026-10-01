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
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Balanced medium slate stone base (combines light and dark values)
    ctx.fillStyle = '#526071';
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle stone tile grid (clean architectural pavers)
    const tileSize = 128;
    for (let x = 0; x < 1024; x += tileSize) {
      for (let y = 0; y < 1024; y += tileSize) {
        // Micro tonal variation between tiles
        const isAlt = ((x / tileSize) + (y / tileSize)) % 2 === 0;
        ctx.fillStyle = isAlt ? '#5d6c7e' : '#4d5b6c';
        ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

        // Architectural joint seams (bright light highlight seam)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, tileSize, tileSize);

        // Dark corner alignment ticks (dark contrast)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
        ctx.fillRect(x - 2, y - 2, 4, 4);
      }
    }

    // Refined wayfinding grid lines (light contrast lines)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i <= 1024; i += tileSize * 4) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 1024);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(1024, i);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(30, 30);
    return texture;
  }

  createNeonSignMesh(width, height, text, subtitle = '', accentColor = '#38bdf8', borderColor = 'rgba(56, 189, 248, 0.5)') {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Dual-tone smoked glass base
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, 'rgba(30, 41, 59, 0.94)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0.96)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ultra-fine architectural beveled border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

    // Accent corner brackets
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 8;
    const bracketLen = 40;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(8, 8 + bracketLen); ctx.lineTo(8, 8); ctx.lineTo(8 + bracketLen, 8);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(canvas.width - 8 - bracketLen, 8); ctx.lineTo(canvas.width - 8, 8); ctx.lineTo(canvas.width - 8, 8 + bracketLen);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(8, canvas.height - 8 - bracketLen); ctx.lineTo(8, canvas.height - 8); ctx.lineTo(8 + bracketLen, canvas.height - 8);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(canvas.width - 8 - bracketLen, canvas.height - 8); ctx.lineTo(canvas.width - 8, canvas.height - 8); ctx.lineTo(canvas.width - 8, canvas.height - 8 - bracketLen);
    ctx.stroke();

    // Crisp high-resolution title (Space Grotesk style)
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 100px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, subtitle ? 180 : 256);

    // Refined Subtitle Pill Badge
    if (subtitle) {
      ctx.shadowBlur = 0;
      ctx.font = '600 42px "JetBrains Mono", monospace';
      
      const subTextWidth = ctx.measureText(subtitle).width;
      const pillW = subTextWidth + 60;
      const pillH = 68;
      const pillX = (canvas.width - pillW) / 2;
      const pillY = 320;

      // Pill background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 34);
      ctx.fill();

      // Pill border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Accent status dot
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(pillX + 32, pillY + pillH / 2, 8, 0, Math.PI * 2);
      ctx.fill();

      // Subtitle text
      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'left';
      ctx.fillText(subtitle, pillX + 54, pillY + pillH / 2 + 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const geo = new THREE.PlaneGeometry(width, height);
    return new THREE.Mesh(geo, mat);
  }

  initMaterials() {
    const gridTex = this.createGridTexture();
    this.materials = {
      // Medium architectural slate paver (Medium tone background)
      floorDark: new THREE.MeshStandardMaterial({
        color: 0x64748b, // Balanced slate grey
        map: gridTex,
        roughness: 0.55,
        metalness: 0.2
      }),
      // Luminous Platinum/White Marble Platform (Light contrast element!)
      plazaFloor: new THREE.MeshStandardMaterial({
        color: 0xf1f5f9, // Light clean stone
        map: gridTex,
        roughness: 0.2,
        metalness: 0.35
      }),
      // Architectural off-white columns & structures (Light structural element)
      concreteWall: new THREE.MeshStandardMaterial({
        color: 0xe2e8f0, // Clean light architectural tone
        roughness: 0.3,
        metalness: 0.25
      }),
      // Contrasting dark slate/graphite frame (Dark contrast element)
      metalDark: new THREE.MeshStandardMaterial({
        color: 0x1e293b, // Dark contrast element
        roughness: 0.25,
        metalness: 0.85
      }),
      // Architectural panoramic crystal glass
      glass: new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.35,
        roughness: 0.05,
        metalness: 0.95
      }),
      // Smoked architectural glass
      smokedGlass: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        transparent: true,
        opacity: 0.55,
        roughness: 0.08,
        metalness: 0.85
      }),
      // Curated Architectural Accents (Clean, non-garish)
      neonCyan: new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        emissive: 0x0284c7,
        emissiveIntensity: 1.2,
        roughness: 0.2
      }),
      neonMagenta: new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        emissive: 0x4f46e5,
        emissiveIntensity: 1.1,
        roughness: 0.2
      }),
      neonAmber: new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 1.1,
        roughness: 0.2
      }),
      neonEmerald: new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 1.1,
        roughness: 0.2
      }),
      neonPurple: new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        emissive: 0x7c3aed,
        emissiveIntensity: 1.2,
        roughness: 0.2
      }),
      gold: new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xb45309,
        emissiveIntensity: 0.3,
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
    // 1. Massive Ground Plane (Dark luxury architectural pavers)
    const groundGeo = new THREE.PlaneGeometry(350, 350);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMesh = new THREE.Mesh(groundGeo, this.materials.floorDark);
    groundMesh.receiveShadow = true;
    this.scene.add(groundMesh);

    // 2. Central Plaza Circular Dais (Polished Dark Basalt / Quartz)
    const plazaGeo = new THREE.CylinderGeometry(20, 20.4, 0.08, 48);
    const plazaMesh = new THREE.Mesh(plazaGeo, this.materials.plazaFloor);
    plazaMesh.position.y = 0.04;
    plazaMesh.receiveShadow = true;
    this.scene.add(plazaMesh);

    // Architectural Inlaid Perimeter Rings (Brushed Champagne Gold & Ice-Blue)
    const plazaRingOuter = new THREE.Mesh(
      new THREE.RingGeometry(19.8, 20.1, 48).rotateX(-Math.PI / 2),
      this.materials.gold
    );
    plazaRingOuter.position.y = 0.085;
    this.scene.add(plazaRingOuter);

    const plazaRingInner = new THREE.Mesh(
      new THREE.RingGeometry(14.8, 15.0, 48).rotateX(-Math.PI / 2),
      this.materials.neonCyan
    );
    plazaRingInner.position.y = 0.085;
    this.scene.add(plazaRingInner);

    // 3. Player Spawn Point Teleport Plinth
    const padGeo = new THREE.CylinderGeometry(2.4, 2.5, 0.06, 32);
    const padMesh = new THREE.Mesh(padGeo, new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.2,
      metalness: 0.8
    }));
    padMesh.position.set(0, 0.05, 8);
    this.scene.add(padMesh);

    // Inlaid architectural lighting ring at spawn
    const spawnRing = new THREE.Mesh(
      new THREE.RingGeometry(2.1, 2.25, 32).rotateX(-Math.PI / 2),
      this.materials.neonCyan
    );
    spawnRing.position.set(0, 0.085, 8);
    this.scene.add(spawnRing);

    // Dedicated Architectural Spot Downlight for Spawn
    const spawnSpot = new THREE.SpotLight(0xf8fafc, 4.5, 24, Math.PI / 3.5, 0.4, 1.2);
    spawnSpot.position.set(0, 11, 8);
    spawnSpot.target.position.set(0, 0, 8);
    this.scene.add(spawnSpot);
    this.scene.add(spawnSpot.target);

    // 4. Recessed Wayfinding Light Channels (connecting Spawn to all sectors)
    const conduitMat = this.materials.neonCyan;

    const makeConduit = (x1, z1, x2, z2) => {
      const length = Math.hypot(x2 - x1, z2 - z1);
      const angle = Math.atan2(x2 - x1, z2 - z1);
      const geo = new THREE.PlaneGeometry(0.25, length);
      geo.rotateX(-Math.PI / 2);
      const conduit = new THREE.Mesh(geo, conduitMat);
      conduit.position.set((x1 + x2) / 2, 0.082, (z1 + z2) / 2);
      conduit.rotation.y = angle;
      this.scene.add(conduit);
    };

    // To Executive Studio
    makeConduit(0, 0, -26, 0);
    // To Innovation Bay
    makeConduit(0, 0, 0, -32);
    // To Technology Atrium
    makeConduit(0, 0, 26, 0);
    // To Hall of Milestones
    makeConduit(0, 0, 20, -26);
    // To Executive Comms
    makeConduit(0, 0, 0, 30);
    // Lab to Quantum Spire
    makeConduit(0, -32, 0, -66);
  }

  buildSpawnPlaza() {
    // Grand Minimalist Gateway (Brushed Titanium Twin Pylons with Glass Panels)
    const pylonMat = this.materials.concreteWall;
    this.createWall(-6.5, 4.5, 12, 1.2, 9, 1.2, pylonMat);
    this.createWall(6.5, 4.5, 12, 1.2, 9, 1.2, pylonMat);
    // Cantilevered overhead lintel
    this.createWall(0, 8.8, 12, 14.4, 0.8, 1.4, pylonMat);

    // Vertical recessed architectural light blades
    const lightBladeL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 8.5, 0.12), this.materials.neonCyan);
    lightBladeL.position.set(-5.8, 4.5, 12.6);
    this.scene.add(lightBladeL);

    const lightBladeR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 8.5, 0.12), this.materials.neonCyan);
    lightBladeR.position.set(5.8, 4.5, 12.6);
    this.scene.add(lightBladeR);

    // Architectural Glass Sign on Gateway (Front & Back)
    const archSignFront = this.createNeonSignMesh(12, 1.5, "MOULI NEXUS", "SYSTEMS ARCHITECTURE • FULL STACK • 3D", "#38bdf8");
    archSignFront.position.set(0, 8.8, 12.75);
    this.scene.add(archSignFront);

    const archSignBack = this.createNeonSignMesh(12, 1.5, "MOULI NEXUS", "INNOVATION HEADQUARTERS // 60 FPS", "#38bdf8");
    archSignBack.position.set(0, 8.8, 11.25);
    archSignBack.rotation.y = Math.PI;
    this.scene.add(archSignBack);

    // Central Kinetic Sculpture (Gyroscopic Orbital Monument)
    const plinthGeo = new THREE.CylinderGeometry(0.8, 1.1, 1.2, 8);
    const plinth = new THREE.Mesh(plinthGeo, this.materials.metalDark);
    plinth.position.set(0, 0.6, 0);
    this.scene.add(plinth);
    this.addCollider(new THREE.Box3(new THREE.Vector3(-1.2, 0, -1.2), new THREE.Vector3(1.2, 4.5, 1.2)));

    // Orbital Rings
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.04, 12, 48), this.materials.gold);
    ring1.position.set(0, 2.4, 0);
    this.scene.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.035, 12, 48), this.materials.neonCyan);
    ring2.position.set(0, 2.4, 0);
    ring2.rotation.x = Math.PI / 3;
    this.scene.add(ring2);

    const centerPrism = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), this.materials.neonMagenta);
    centerPrism.position.set(0, 2.4, 0);
    this.scene.add(centerPrism);

    this.animatedObjects.push({
      update: (dt) => {
        ring1.rotation.y += dt * 0.7;
        ring1.rotation.x += dt * 0.3;
        ring2.rotation.y -= dt * 0.9;
        ring2.rotation.z += dt * 0.4;
        centerPrism.rotation.y += dt * 1.2;
      }
    });

    // Architectural Light Bollards (Clean, modern exterior lighting columns)
    const bollardPositions = [
      { x: -8, z: -8 },
      { x: 8, z: -8 },
      { x: -8, z: 8 },
      { x: 8, z: 8 }
    ];

    bollardPositions.forEach((pos) => {
      // Slender rectangular titanium column
      const colGeo = new THREE.BoxGeometry(0.28, 2.8, 0.28);
      const col = new THREE.Mesh(colGeo, this.materials.concreteWall);
      col.position.set(pos.x, 1.4, pos.z);
      this.scene.add(col);

      // Recessed LED illumination slit
      const slitGeo = new THREE.BoxGeometry(0.12, 0.9, 0.3);
      const slit = new THREE.Mesh(slitGeo, this.materials.neonCyan);
      slit.position.set(pos.x, 2.2, pos.z);
      this.scene.add(slit);

      // Soft architectural downlight
      const light = new THREE.PointLight(0xdbeafe, 2.8, 14);
      light.position.set(pos.x, 2.4, pos.z);
      this.scene.add(light);
    });

    // Plaza Navigational Directory Signs
    this.buildNavSign(-7, 0, "[<--] EXECUTIVE STUDIO", 0x38bdf8, Math.PI / 2);
    this.buildNavSign(0, -7, "[^^^] INNOVATION BAY & CORE SPIRE", 0x38bdf8, 0);
    this.buildNavSign(7, 0, "[-->] TECHNOLOGY ATRIUM", 0x38bdf8, -Math.PI / 2);
    this.buildNavSign(0, 7, "[v v] EXECUTIVE COMMS", 0x38bdf8, Math.PI);
  }

  buildNavSign(x, z, text, colorHex, rotationY) {
    const postGeo = new THREE.BoxGeometry(0.08, 1.8, 0.08);
    const post = new THREE.Mesh(postGeo, this.materials.concreteWall);
    post.position.set(x, 0.9, z);
    this.scene.add(post);

    const boardGeo = new THREE.BoxGeometry(2.6, 0.48, 0.06);
    const board = new THREE.Mesh(boardGeo, new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.8,
      roughness: 0.2
    }));
    board.position.set(x, 1.8, z);
    board.rotation.y = rotationY;
    this.scene.add(board);

    const glowStripe = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.04, 0.08),
      new THREE.MeshBasicMaterial({ color: colorHex })
    );
    glowStripe.position.set(x, 1.58, z);
    glowStripe.rotation.y = rotationY;
    this.scene.add(glowStripe);
  }

  buildCreatorsHouse() {
    const hx = -28;
    const hz = 0;

    // --- The Architect's Executive Innovation Pavilion ---
    // Floor: Polished luxury quartz platform
    const floorGeo = new THREE.BoxGeometry(15.2, 0.08, 13.2);
    const houseFloor = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({
      color: 0x131a29,
      roughness: 0.2,
      metalness: 0.7
    }));
    houseFloor.position.set(hx, 0.05, hz);
    this.scene.add(houseFloor);

    // Polished gold rim around studio base
    const studioRim = new THREE.Mesh(
      new THREE.BoxGeometry(15.4, 0.04, 13.4),
      this.materials.gold
    );
    studioRim.position.set(hx, 0.03, hz);
    this.scene.add(studioRim);

    // Architectural Slender Titanium Columns (Corners & Portico)
    const colMat = this.materials.concreteWall;
    const colCoords = [
      { x: hx - 7.2, z: hz - 6.2 },
      { x: hx + 7.2, z: hz - 6.2 },
      { x: hx - 7.2, z: hz + 6.2 },
      { x: hx + 7.2, z: hz + 6.2 },
      { x: hx + 7.2, z: hz - 2.8 },
      { x: hx + 7.2, z: hz + 2.8 }
    ];
    colCoords.forEach((p) => {
      this.createWall(p.x, 2.6, p.z, 0.6, 5.2, 0.6, colMat);
    });

    // Floor-to-Ceiling Smoked Architectural Glass Facade Walls
    // Back wall
    this.createWall(hx, 2.6, hz - 6.2, 14, 5.2, 0.2, this.materials.smokedGlass);
    // Left wall
    this.createWall(hx - 7.2, 2.6, hz, 0.2, 5.2, 12, this.materials.smokedGlass);
    // Front wall
    this.createWall(hx, 2.6, hz + 6.2, 14, 5.2, 0.2, this.materials.smokedGlass);
    // Entrance wall (East side, partially open with glass flanking)
    this.createWall(hx + 7.2, 2.6, hz - 4.5, 0.2, 5.2, 3, this.materials.smokedGlass);
    this.createWall(hx + 7.2, 2.6, hz + 4.5, 0.2, 5.2, 3, this.materials.smokedGlass);

    // Cantilevered Modern Floating Roof Canopy
    const roofGeo = new THREE.BoxGeometry(16.0, 0.5, 14.0);
    const roof = new THREE.Mesh(roofGeo, colMat);
    roof.position.set(hx, 5.3, hz);
    this.scene.add(roof);

    // Recessed ceiling architectural downlights
    const downlight1 = new THREE.PointLight(0xffedd5, 3.2, 14);
    downlight1.position.set(hx - 2, 5.0, hz);
    this.scene.add(downlight1);

    const downlight2 = new THREE.PointLight(0x38bdf8, 2.2, 12);
    downlight2.position.set(hx + 3, 5.0, hz);
    this.scene.add(downlight2);

    // Studio Sign above entrance
    const studioSign = this.createNeonSignMesh(6.2, 1.1, "EXECUTIVE STUDIO", "SYSTEMS ARCHITECTURE // MOULI", "#38bdf8");
    studioSign.position.set(hx + 7.35, 4.4, hz);
    studioSign.rotation.y = -Math.PI / 2;
    this.scene.add(studioSign);

    // Floating Executive Smoked-Glass Workstation
    const deskGeo = new THREE.BoxGeometry(3.6, 0.1, 1.6);
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.95
    });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(hx - 3.2, 1.1, hz);
    this.scene.add(desk);

    // Polished titanium desk frame & legs
    const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.1, 1.5), this.materials.concreteWall);
    leg1.position.set(hx - 4.8, 0.55, hz);
    this.scene.add(leg1);
    const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.1, 1.5), this.materials.concreteWall);
    leg2.position.set(hx - 1.6, 0.55, hz);
    this.scene.add(leg2);

    this.addCollider(new THREE.Box3(
      new THREE.Vector3(hx - 5.0, 0, hz - 1.0),
      new THREE.Vector3(hx - 1.4, 2.6, hz + 1.0)
    ));

    // Ultra-Wide Curved Panoramic Studio Display
    const displayGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.8, 24, 1, true, -Math.PI / 6, Math.PI / 3);
    const displayMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide
    });
    const curvedDisplay = new THREE.Mesh(displayGeo, displayMat);
    curvedDisplay.position.set(hx - 3.2, 1.7, hz - 0.35);
    curvedDisplay.rotation.y = Math.PI;
    this.scene.add(curvedDisplay);

    // Architectural Task Lamp Bar
    const lampBar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 0.08), this.materials.neonCyan);
    lampBar.position.set(hx - 3.2, 2.15, hz - 0.2);
    this.scene.add(lampBar);

    // Executive Milestone Credenza / Showcase Shelf
    const credenzaGeo = new THREE.BoxGeometry(4.2, 1.8, 0.8);
    const credenza = new THREE.Mesh(credenzaGeo, this.materials.concreteWall);
    credenza.position.set(hx + 2.8, 0.9, hz - 5.4);
    this.scene.add(credenza);
    this.addCollider(new THREE.Box3(
      new THREE.Vector3(hx + 0.5, 0, hz - 5.9),
      new THREE.Vector3(hx + 5.0, 3.5, hz - 4.9)
    ));

    // Floating Glass Award Prisms on Credenza
    for (let i = 0; i < 3; i++) {
      const prismGeo = new THREE.OctahedronGeometry(0.24, 0);
      const prismMat = i === 1 ? this.materials.gold : this.materials.neonCyan;
      const prism = new THREE.Mesh(prismGeo, prismMat);
      prism.position.set(hx + 1.6 + (i * 1.2), 2.2, hz - 5.4);
      this.scene.add(prism);

      this.animatedObjects.push({
        update: (dt) => {
          prism.rotation.y += dt * 0.8;
        }
      });
    }

    // Interactive Executive Console
    this.addInteractable({
      id: "house-terminal",
      name: "Architect Console",
      type: "terminal",
      position: new THREE.Vector3(hx - 3.2, 1.2, hz),
      radius: 2.8,
      prompt: "ACCESS ARCHITECT CONSOLE"
    });

    // NPC MOULI (Distinguished Tech Lead Avatar)
    this.buildMouliNPC(hx - 1.0, hz + 0.6);
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

    // Top Header Banner "INNOVATION GALLERY"
    const bannerGeo = new THREE.BoxGeometry(16, 1.2, 0.4);
    const banner = new THREE.Mesh(bannerGeo, this.materials.metalDark);
    banner.position.set(lx, 5.8, lz + 11);
    this.scene.add(banner);

    const labSign = this.createNeonSignMesh(15.5, 1.1, "INNOVATION GALLERY", "SYSTEMS ARCHITECTURE & EXHIBITS", "#38bdf8");
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
    this.buildNavSign(sx - 10, sz, "✦ TECHNOLOGY ATRIUM", 0x10b981, Math.PI / 2);

    const skillSign = this.createNeonSignMesh(10, 1.2, "TECHNOLOGY ATRIUM", "ENGINEERING MASTERY & STACK", "#10b981", "rgba(16, 185, 129, 0.4)");
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

    // Gallery Sign
    const sign = new THREE.Mesh(new THREE.BoxGeometry(10, 0.9, 0.3), this.materials.metalDark);
    sign.position.set(ax, 4.8, az + 8);
    this.scene.add(sign);

    const achSign = this.createNeonSignMesh(9.5, 1.1, "HALL OF MILESTONES", "HONORS & RECOGNITION", "#f59e0b", "rgba(245, 158, 11, 0.4)");
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

    const bossSign = this.createNeonSignMesh(11, 1.3, "QUANTUM CORE SPIRE", "FLAGSHIP ARCHITECTURE PLATFORM", "#a855f7", "rgba(168, 85, 247, 0.4)");
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

    // Architectural Sign
    const contactSign = this.createNeonSignMesh(8.5, 1.1, "EXECUTIVE COMMS", "DIRECT COLLABORATION & INQUIRIES", "#38bdf8");
    contactSign.position.set(cx, 4.2, cz + 6.2);
    this.scene.add(contactSign);

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

    const cLight = new THREE.PointLight(0x38bdf8, 3.0, 12);
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
    // Dual-tone corporate tech metropolis in the distance (mix of light and dark architecture)
    const buildingMaterials = [
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.2, metalness: 0.35 }), // Light architectural tower
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.25, metalness: 0.6 }),  // Medium silver-slate glass
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.75 }), // Dark slate tower
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.25, metalness: 0.85 }) // Deep obsidian tower
    ];

    const warmWindowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const coolWindowMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
    const redBeaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const crownMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    const skylineRadius = 145;
    const towerCount = 42;

    for (let i = 0; i < towerCount; i++) {
      const angle = (i / towerCount) * Math.PI * 2;
      const dist = skylineRadius + (Math.sin(i * 4) * 20);
      const bx = Math.cos(angle) * dist;
      const bz = Math.sin(angle) * dist;
      const width = 10 + (Math.sin(i * 2.3) + 1) * 6;
      const height = 45 + (Math.sin(i * 1.7) + 1) * 35;
      const depth = 10 + (Math.cos(i * 2.1) + 1) * 6;

      // Main tower shaft
      const geo = new THREE.BoxGeometry(width, height, depth);
      const mat = buildingMaterials[i % buildingMaterials.length];
      const tower = new THREE.Mesh(geo, mat);
      tower.position.set(bx, height / 2, bz);
      this.scene.add(tower);

      // Multi-tier architectural crown setback for taller towers
      if (height > 75) {
        const crownGeo = new THREE.BoxGeometry(width * 0.65, 12, depth * 0.65);
        const crown = new THREE.Mesh(crownGeo, mat);
        crown.position.set(bx, height + 6, bz);
        this.scene.add(crown);
      }

      // Elegant architectural office window grid bands (soft warm & cool lights)
      const floorBands = 5 + Math.floor((height / 110) * 8);
      for (let f = 1; f <= floorBands; f++) {
        const bandY = (height / (floorBands + 1)) * f;
        const bandGeo = new THREE.BoxGeometry(width + 0.08, 0.45, depth + 0.08);
        const bandMesh = new THREE.Mesh(bandGeo, f % 2 === 0 ? warmWindowMat : coolWindowMat);
        bandMesh.position.set(bx, bandY, bz);
        this.scene.add(bandMesh);
      }

      // Architectural rooftop crown parapet light
      const roofBand = new THREE.Mesh(
        new THREE.BoxGeometry(width + 0.1, 0.3, depth + 0.1),
        crownMat
      );
      roofBand.position.set(bx, height - 0.2, bz);
      this.scene.add(roofBand);

      // Rooftop Communications Mast with Red Aviation Warning Beacon
      if (i % 2 === 0) {
        const mastHeight = 8 + (i % 3) * 4;
        const spire = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.2, mastHeight, 6),
          this.materials.metalDark
        );
        spire.position.set(bx, height + mastHeight / 2, bz);
        this.scene.add(spire);

        const beacon = new THREE.Mesh(
          new THREE.SphereGeometry(0.28, 8, 8),
          redBeaconMat
        );
        beacon.position.set(bx, height + mastHeight, bz);
        this.scene.add(beacon);
      }
    }
  }

  buildParticleDust() {
    // Ethereal ambient micro-stardust
    const particleCount = 240;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 140;
      positions[i + 1] = 0.5 + Math.random() * 16;
      positions[i + 2] = (Math.random() - 0.5) * 140;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.18,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);

    this.animatedObjects.push({
      update: (dt) => {
        const posArr = geometry.attributes.position.array;
        for (let i = 1; i < posArr.length; i += 3) {
          posArr[i] += Math.sin(posArr[i - 1] + posArr[i + 1]) * dt * 0.25;
          if (posArr[i] > 18) posArr[i] = 0.5;
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
