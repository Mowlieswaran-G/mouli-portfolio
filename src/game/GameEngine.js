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
    this.scene.background = new THREE.Color(0x080e1c);
    // Soft atmospheric distance fog for infinite horizon depth
    this.scene.fog = new THREE.Fog(0x080e1c, 110, 320);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance", alpha: false });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25; // Pristine, balanced professional dynamic range

    this.container.appendChild(this.renderer.domElement);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      450
    );

    // --- Atmospheric Cosmic Sky Dome ---
    const skyGeo = new THREE.SphereGeometry(380, 32, 16);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        topColor: { value: new THREE.Color(0x020612) },    // Deep midnight zenith
        bottomColor: { value: new THREE.Color(0x0e172a) }, // Refined twilight horizon
        offset: { value: 30 },
        exponent: { value: 0.55 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(sky);

    // Distant Architectural Stars / Constellation Dust in Upper Dome
    const starCount = 350;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 360;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = Math.abs(r * Math.cos(phi)) + 15; // Only in upper hemisphere
      const z = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3] = x;
      starPositions[i * 3 + 1] = y;
      starPositions[i * 3 + 2] = z;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.8,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    this.scene.add(starPoints);

    // --- Architectural Studio Lighting ---
    // 1. Hemisphere Light: Soft crystalline skylight + warm graphite ground bounce
    const hemiLight = new THREE.HemisphereLight(0xe2e8f0, 0x0f172a, 1.4);
    this.scene.add(hemiLight);

    // 2. Ambient Fill: Crisp baseline visibility without harshness
    const ambientLight = new THREE.AmbientLight(0xcfd8dc, 0.7);
    this.scene.add(ambientLight);

    // 3. Primary Key Directional Sunlight (Crisp architectural shadows)
    this.moonLight = new THREE.DirectionalLight(0xffffff, 2.5);
    this.moonLight.position.set(40, 65, 30);
    this.moonLight.castShadow = true;
    this.moonLight.shadow.mapSize.width = 1024;
    this.moonLight.shadow.mapSize.height = 1024;
    this.moonLight.shadow.camera.near = 10;
    this.moonLight.shadow.camera.far = 180;
    const d = 60;
    this.moonLight.shadow.camera.left = -d;
    this.moonLight.shadow.camera.right = d;
    this.moonLight.shadow.camera.top = d;
    this.moonLight.shadow.camera.bottom = -d;
    this.moonLight.shadow.bias = -0.0003;
    this.scene.add(this.moonLight);

    // 4. Warm Architectural Accent Fill (Simulates premium exterior facade uplights)
    const warmFill = new THREE.DirectionalLight(0xffedd5, 0.8);
    warmFill.position.set(-30, 40, -30);
    this.scene.add(warmFill);

    // 5. Crystalline Edge Light (Refined silhouette definition)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
    rimLight.position.set(0, 25, 35);
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
