import * as THREE from 'three';
import { soundManager } from '../systems/audioSystem.js';

export class PlayerController {
  constructor(scene, cameraController) {
    this.scene = scene;
    this.cameraController = cameraController;

    // Movement Physics
    this.position = new THREE.Vector3(0, 0.5, 0);
    this.velocity = new THREE.Vector3();
    this.moveSpeed = 10.0;
    this.sprintMultiplier = 1.75;
    this.jumpForce = 13.5;
    this.gravity = 32.0;
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

    // Kinematics / Animation
    this.walkCycle = 0;
    this.turnAngle = 0;
    this.targetTurnAngle = 0;

    // Collision Colliders (passed from WorldBuilder)
    this.colliders = [];
    this.playerRadius = 0.55;

    // Build the procedural 3D character mesh rig
    this.buildCharacterMesh();
    this.setupKeyboardListeners();
  }

  buildCharacterMesh() {
    this.group = new THREE.Group();
    this.group.position.copy(this.position);

    // High-tech luminous Cyberpunk materials
    const suitMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Sleek titanium silver/white
      roughness: 0.25,
      metalness: 0.65
    });
    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // High-contrast deep slate armor
      roughness: 0.2,
      metalness: 0.85
    });
    const goldAccentMat = new THREE.MeshStandardMaterial({
      color: 0xffb703,
      emissive: 0xff9900,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.9
    });
    const neonCyanMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 2.2,
      roughness: 0.1
    });
    const neonMagentaMat = new THREE.MeshStandardMaterial({
      color: 0xff007f,
      emissive: 0xff007f,
      emissiveIntensity: 2.0,
      roughness: 0.1
    });

    // 1. Torso & Armor Vest (Luminous white/silver chest with slate armor plates)
    const torsoGeo = new THREE.BoxGeometry(0.72, 0.82, 0.42);
    this.torso = new THREE.Mesh(torsoGeo, suitMat);
    this.torso.position.y = 1.35;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Front Chest Armor Plate
    const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.4, 0.08), armorMat);
    chestPlate.position.set(0, 0.15, 0.22);
    this.torso.add(chestPlate);

    // Chest Arc-Reactor / Cyber Core (Glowing Neon Cyan with Pulsing Energy)
    const coreGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16);
    coreGeo.rotateX(Math.PI / 2);
    const coreMesh = new THREE.Mesh(coreGeo, neonCyanMat);
    coreMesh.position.set(0, 0.15, 0.26);
    this.torso.add(coreMesh);

    // Glowing energy conduit stripes on torso sides
    const stripeL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.65, 0.43), neonCyanMat);
    stripeL.position.set(0.36, 0, 0);
    this.torso.add(stripeL);
    const stripeR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.65, 0.43), neonCyanMat);
    stripeR.position.set(-0.36, 0, 0);
    this.torso.add(stripeR);

    // 2. Head with High-Tech Helmet & Cyber Visor
    const headGeo = new THREE.BoxGeometry(0.42, 0.42, 0.42);
    this.head = new THREE.Mesh(headGeo, armorMat);
    this.head.position.y = 1.95;
    this.head.castShadow = true;
    this.group.add(this.head);

    // Visor: Full luminous cyber visor
    const visorGeo = new THREE.BoxGeometry(0.40, 0.14, 0.12);
    const visorMesh = new THREE.Mesh(visorGeo, neonCyanMat);
    visorMesh.position.set(0, 0.03, 0.21);
    this.head.add(visorMesh);

    // Helmet crest / antenna
    const crest = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.36), neonMagentaMat);
    crest.position.set(0, 0.24, 0);
    this.head.add(crest);

    // Headphones / ear modules with glowing rings
    const earL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 12), armorMat);
    earL.rotation.z = Math.PI / 2;
    earL.position.set(0.23, 0, 0);
    const earRingL = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.02, 8, 16), neonCyanMat);
    earRingL.rotation.y = Math.PI / 2;
    earRingL.position.set(0.26, 0, 0);
    this.head.add(earL);
    this.head.add(earRingL);

    const earR = earL.clone();
    earR.position.x = -0.23;
    const earRingR = earRingL.clone();
    earRingR.position.x = -0.26;
    this.head.add(earR);
    this.head.add(earRingR);

    // 3. High-Tech Jetpack Thrusters on back
    const jetpackGeo = new THREE.BoxGeometry(0.46, 0.52, 0.2);
    const jetpackMesh = new THREE.Mesh(jetpackGeo, armorMat);
    jetpackMesh.position.set(0, 0.05, -0.28);
    this.torso.add(jetpackMesh);

    // Jetpack central energy battery
    const jetCore = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 0.06), neonCyanMat);
    jetCore.position.set(0, 0.05, -0.38);
    this.torso.add(jetCore);

    // Dual Plasma Jet Nozzles with glowing thruster plumes
    const nozzleGeo = new THREE.CylinderGeometry(0.07, 0.09, 0.16, 12);
    this.nozzleL = new THREE.Mesh(nozzleGeo, goldAccentMat);
    this.nozzleL.position.set(0.14, -0.26, -0.28);
    this.torso.add(this.nozzleL);

    this.nozzleR = new THREE.Mesh(nozzleGeo, goldAccentMat);
    this.nozzleR.position.set(-0.14, -0.26, -0.28);
    this.torso.add(this.nozzleR);

    // Glowing exhaust cones
    const plumeGeo = new THREE.ConeGeometry(0.07, 0.22, 12);
    plumeGeo.rotateX(Math.PI);
    const plumeL = new THREE.Mesh(plumeGeo, neonCyanMat);
    plumeL.position.set(0.14, -0.42, -0.28);
    this.torso.add(plumeL);

    const plumeR = new THREE.Mesh(plumeGeo, neonCyanMat);
    plumeR.position.set(-0.14, -0.42, -0.28);
    this.torso.add(plumeR);

    // 4. Arms (White cyber suit with slate shoulder armor & glowing wrist gauntlets)
    const armGeo = new THREE.BoxGeometry(0.19, 0.72, 0.19);

    this.leftArmPivot = new THREE.Group();
    this.leftArmPivot.position.set(0.50, 1.65, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, suitMat);
    leftArmMesh.position.y = -0.36;
    leftArmMesh.castShadow = true;

    // Shoulder Pauldron
    const shoulderL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.25), armorMat);
    shoulderL.position.set(0, 0, 0);
    const shoulderTrimL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.04, 0.26), neonCyanMat);
    shoulderTrimL.position.set(0, -0.08, 0);
    shoulderL.add(shoulderTrimL);
    leftArmMesh.add(shoulderL);

    // Wrist gauntlet glow
    const gauntletL = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.12, 0.21), neonCyanMat);
    gauntletL.position.set(0, -0.25, 0);
    leftArmMesh.add(gauntletL);

    this.leftArmPivot.add(leftArmMesh);
    this.group.add(this.leftArmPivot);

    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(-0.50, 1.65, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, suitMat);
    rightArmMesh.position.y = -0.36;
    rightArmMesh.castShadow = true;

    const shoulderR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.25), armorMat);
    shoulderR.position.set(0, 0, 0);
    const shoulderTrimR = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.04, 0.26), neonCyanMat);
    shoulderTrimR.position.set(0, -0.08, 0);
    shoulderR.add(shoulderTrimR);
    rightArmMesh.add(shoulderR);

    const gauntletR = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.12, 0.21), neonCyanMat);
    gauntletR.position.set(0, -0.25, 0);
    rightArmMesh.add(gauntletR);

    this.rightArmPivot.add(rightArmMesh);
    this.group.add(this.rightArmPivot);

    // 5. Legs (White suit with armored knees & glowing cyber stripes)
    const legGeo = new THREE.BoxGeometry(0.23, 0.85, 0.23);

    this.leftLegPivot = new THREE.Group();
    this.leftLegPivot.position.set(0.21, 0.95, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, suitMat);
    leftLegMesh.position.y = -0.425;
    leftLegMesh.castShadow = true;

    // Glowing knee strip
    const kneeL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.08, 0.25), neonCyanMat);
    kneeL.position.set(0, -0.15, 0);
    leftLegMesh.add(kneeL);

    // Armored boot sole
    const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.16, 0.32), armorMat);
    bootL.position.set(0, -0.38, 0.03);
    const bootSoleL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.31), neonCyanMat);
    bootSoleL.position.set(0, -0.45, 0.03);
    leftLegMesh.add(bootL);
    leftLegMesh.add(bootSoleL);

    this.leftLegPivot.add(leftLegMesh);
    this.group.add(this.leftLegPivot);

    this.rightLegPivot = new THREE.Group();
    this.rightLegPivot.position.set(-0.21, 0.95, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, suitMat);
    rightLegMesh.position.y = -0.425;
    rightLegMesh.castShadow = true;

    const kneeR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.08, 0.25), neonCyanMat);
    kneeR.position.set(0, -0.15, 0);
    rightLegMesh.add(kneeR);

    const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.16, 0.32), armorMat);
    bootR.position.set(0, -0.38, 0.03);
    const bootSoleR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.31), neonCyanMat);
    bootSoleR.position.set(0, -0.45, 0.03);
    rightLegMesh.add(bootR);
    rightLegMesh.add(bootSoleR);

    this.rightLegPivot.add(rightLegMesh);
    this.group.add(this.rightLegPivot);

    // --- HERO AURA LIGHTS (Permanently illuminates character and surrounding ground) ---
    // Front glowing aura
    this.playerFrontAura = new THREE.PointLight(0x00f0ff, 2.8, 10);
    this.playerFrontAura.position.set(0, 1.6, 0.6);
    this.group.add(this.playerFrontAura);

    // Back jetpack glowing rim aura
    this.playerBackAura = new THREE.PointLight(0x38bdf8, 2.2, 8);
    this.playerBackAura.position.set(0, 1.4, -0.8);
    this.group.add(this.playerBackAura);

    // Shadow blob (Subtle soft ambient occlusion underneath)
    const shadowGeo = new THREE.CircleGeometry(0.65, 24);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x030712,
      transparent: true,
      opacity: 0.35
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.position.y = 0.02;
    this.scene.add(this.shadowMesh);

    this.scene.add(this.group);
  }

  setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      // Don't capture keys if typing inside input / textarea
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

  handleJump() {
    if (this.isGrounded) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
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
  }

  update(delta) {
    const dt = Math.min(delta, 0.1);

    // Calculate forward & right directions based on camera yaw
    const cameraYaw = this.cameraController.getYaw();
    const forwardVec = new THREE.Vector3(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));
    const rightVec = new THREE.Vector3(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw));

    // Combine keyboard and virtual joystick input
    let moveZ = 0;
    let moveX = 0;

    if (this.keys.forward) moveZ += 1;
    if (this.keys.backward) moveZ -= 1;
    if (this.keys.right) moveX += 1;
    if (this.keys.left) moveX -= 1;

    // Joystick contribution
    if (Math.abs(this.joystickInput.y) > 0.1) moveZ += this.joystickInput.y;
    if (Math.abs(this.joystickInput.x) > 0.1) moveX += this.joystickInput.x;

    if (this.mobileJump) {
      this.handleJump();
      this.mobileJump = false;
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

      // Calculate target angle to face movement direction
      this.targetTurnAngle = Math.atan2(inputDir.x, inputDir.z);

      // Play footsteps
      if (this.isGrounded) {
        soundManager.playFootstep(this.isSprinting);
      }
    }

    // Accelerate/Decelerate horizontal velocity
    const targetVx = inputDir.x * targetSpeed;
    const targetVz = inputDir.z * targetSpeed;
    this.velocity.x += (targetVx - this.velocity.x) * (15 * dt);
    this.velocity.z += (targetVz - this.velocity.z) * (15 * dt);

    // Gravity & Vertical physics
    this.velocity.y -= this.gravity * dt;
    const newY = this.position.y + this.velocity.y * dt;

    if (newY <= 0) {
      if (!this.isGrounded && this.velocity.y < -3) {
        soundManager.playLand();
      }
      this.position.y = 0;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.position.y = newY;
      this.isGrounded = false;
    }

    // Collision Resolution on X & Z
    const potentialX = this.position.x + this.velocity.x * dt;
    const potentialZ = this.position.z + this.velocity.z * dt;

    // Test X collision
    if (!this.checkCollision(potentialX, this.position.z)) {
      this.position.x = potentialX;
    } else {
      this.velocity.x = 0;
    }

    // Test Z collision
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

    // Update shadow
    this.shadowMesh.position.x = this.position.x;
    this.shadowMesh.position.z = this.position.z;
    const shadowScale = Math.max(0.2, 1.0 - (this.position.y * 0.15));
    this.shadowMesh.scale.set(shadowScale, shadowScale, shadowScale);

    // Procedural Animation
    this.animateAvatar(dt);
  }

  checkCollision(x, z) {
    // Plaza boundaries
    const worldRadius = 140;
    if (Math.hypot(x, z) > worldRadius) return true;

    for (let i = 0; i < this.colliders.length; i++) {
      const box = this.colliders[i];
      // Expand bounding box by player radius
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
    if (this.isMoving && this.isGrounded) {
      const freq = this.isSprinting ? 16 : 10;
      this.walkCycle += dt * freq;
      const legSwing = Math.sin(this.walkCycle) * 0.65;
      const armSwing = Math.sin(this.walkCycle) * 0.55;

      this.leftLegPivot.rotation.x = legSwing;
      this.rightLegPivot.rotation.x = -legSwing;
      this.leftArmPivot.rotation.x = -armSwing;
      this.rightArmPivot.rotation.x = armSwing;

      // Slight body bounce & sway
      this.torso.position.y = 1.35 + Math.abs(Math.sin(this.walkCycle * 2)) * 0.05;
      this.torso.rotation.z = Math.sin(this.walkCycle) * 0.04;
    } else if (!this.isGrounded) {
      // In air jump pose
      this.leftLegPivot.rotation.x = 0.4;
      this.rightLegPivot.rotation.x = -0.3;
      this.leftArmPivot.rotation.x = -0.6;
      this.rightArmPivot.rotation.x = -0.6;
      this.torso.position.y = 1.4;
    } else {
      // Idle breathing sway
      this.walkCycle += dt * 2.5;
      const breath = Math.sin(this.walkCycle) * 0.02;
      this.torso.position.y = 1.35 + breath;
      this.leftLegPivot.rotation.x = 0;
      this.rightLegPivot.rotation.x = 0;
      this.leftArmPivot.rotation.x = 0;
      this.rightArmPivot.rotation.x = 0;
      this.torso.rotation.z = 0;
    }

    // Jet thrusters intensity
    const thrusterScale = this.isSprinting || !this.isGrounded ? 1.8 : 1.0;
    this.nozzleL.scale.set(1, thrusterScale, 1);
    this.nozzleR.scale.set(1, thrusterScale, 1);
  }
}
