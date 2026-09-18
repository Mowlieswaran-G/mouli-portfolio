import * as THREE from 'three';
import { PlayerController } from './PlayerController.js';
import { CameraController } from './CameraController.js';
import { WorldBuilder } from './WorldBuilder.js';
import { soundManager } from '../systems/audioSystem.js';

export class GameEngine {
  constructor(canvasContainer, callbacks = {}) {
    this.container = canvasContainer;
    this.callbacks = {
      onInteractionPrompt: callbacks.onInteractionPrompt || (() => {}),
      onTriggerInteraction: callbacks.onTriggerInteraction || (() => {}),
      onPlayerMove: callbacks.onPlayerMove || (() => {}),
      ...callbacks
    };

    this.isRunning = false;
    this.clock = new THREE.Clock();
    this.activeInteractable = null;

    this.initScene();
    this.initWorld();
    this.initPlayerAndCamera();
    this.setupInteractionListener();
    this.setupResize();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a1226);
    // Soft atmospheric distance fog (leaves near and midground crystal-clear)
    this.scene.fog = new THREE.Fog(0x0a1226, 85, 270);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance", alpha: false });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35; // Luminous, high-contrast dynamic range

    this.container.appendChild(this.renderer.domElement);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      400
    );

    // --- Multi-Source Studio Game Lighting (Eliminates all dark silhouettes) ---
    // 1. Hemisphere Light: Electric cyan sky from above, warm indigo bounce from ground
    const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x1e1b4b, 1.8);
    this.scene.add(hemiLight);

    // 2. Ambient Fill: Raises baseline visibility so all geometry details pop
    const ambientLight = new THREE.AmbientLight(0x93c5fd, 0.85);
    this.scene.add(ambientLight);

    // 3. Primary Directional Key Sunlight (Crisp, clean shadows)
    this.moonLight = new THREE.DirectionalLight(0xffffff, 2.2);
    this.moonLight.position.set(30, 55, 25);
    this.moonLight.castShadow = true;
    this.moonLight.shadow.mapSize.width = 1024;
    this.moonLight.shadow.mapSize.height = 1024;
    this.moonLight.shadow.camera.near = 10;
    this.moonLight.shadow.camera.far = 160;
    const d = 55;
    this.moonLight.shadow.camera.left = -d;
    this.moonLight.shadow.camera.right = d;
    this.moonLight.shadow.camera.top = d;
    this.moonLight.shadow.camera.bottom = -d;
    this.moonLight.shadow.bias = -0.0004;
    this.scene.add(this.moonLight);

    // 4. Secondary Fill Light (Opposite quadrant to illuminate building & character back sides)
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    fillLight.position.set(-25, 35, -25);
    this.scene.add(fillLight);

    // 5. Player Entrance Rim Light (Shines from camera quadrant to highlight character back silhouette)
    const rimLight = new THREE.DirectionalLight(0xa78bfa, 1.1);
    rimLight.position.set(0, 20, 30);
    this.scene.add(rimLight);
  }

  initWorld() {
    this.worldBuilder = new WorldBuilder(this.scene);
    this.worldData = this.worldBuilder.buildWorld();
  }

  initPlayerAndCamera() {
    this.cameraController = new CameraController(this.camera, this.renderer.domElement);
    this.player = new PlayerController(this.scene, this.cameraController);

    this.player.setColliders(this.worldData.colliders);
    this.cameraController.setTarget(this.player.group);

    // Spawn player at plaza entrance
    this.player.teleport(0, 0, 8);
  }

  setupInteractionListener() {
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.code === 'KeyE') {
        this.triggerCurrentInteraction();
      }
    });
  }

  triggerCurrentInteraction() {
    if (this.activeInteractable) {
      soundManager.playInteract();
      this.callbacks.onTriggerInteraction(this.activeInteractable);
    }
  }

  setupResize() {
    this.resizeObserver = new ResizeObserver(() => {
      if (!this.container) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
    this.resizeObserver.observe(this.container);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.start();
    this.loop();
  }

  stop() {
    this.isRunning = false;
  }

  loop = () => {
    if (!this.isRunning) return;
    requestAnimationFrame(this.loop);

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Update Player physics & animations
    this.player.update(delta);

    // Update Third-person camera
    this.cameraController.update(delta);

    // Update animated world objects (rings, crystals, lights, dust)
    this.worldBuilder.update(delta, elapsedTime);

    // Proximity check for interactables
    this.checkProximity();

    // Notify listeners of player position (e.g. for Minimap & Quests)
    this.callbacks.onPlayerMove({
      x: this.player.position.x,
      y: this.player.position.y,
      z: this.player.position.z,
      yaw: this.cameraController.getYaw()
    });

    this.renderer.render(this.scene, this.camera);
  };

  checkProximity() {
    let closest = null;
    let closestDist = Infinity;
    const pPos = this.player.position;

    for (let i = 0; i < this.worldData.interactables.length; i++) {
      const it = this.worldData.interactables[i];
      const dist = pPos.distanceTo(it.position);
      if (dist <= it.radius && dist < closestDist) {
        closestDist = dist;
        closest = it;
      }
    }

    if (closest !== this.activeInteractable) {
      this.activeInteractable = closest;
      this.callbacks.onInteractionPrompt(closest);
    }
  }

  focusCinematicOn(targetPos, lookAtPos) {
    this.cameraController.startCinematic(targetPos, lookAtPos);
  }

  restoreCamera() {
    this.cameraController.stopCinematic();
  }

  teleportPlayer(x, y, z) {
    this.player.teleport(x, y, z);
  }

  destroy() {
    this.stop();
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.renderer && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
      this.renderer.dispose();
    }
  }
}
