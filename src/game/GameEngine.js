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
    // Medium atmospheric silver-slate background & fog (harmonic combination of light and dark)
    this.scene.background = new THREE.Color(0x94a3b8);
    this.scene.fog = new THREE.Fog(0x94a3b8, 110, 360);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance", alpha: false });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2; // Balanced, natural dynamic range

    this.container.appendChild(this.renderer.domElement);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      450
    );

    // --- Atmospheric Dual-Tone Sky Dome (Medium Slate Zenith -> Luminous Dawn Horizon) ---
    const skyGeo = new THREE.SphereGeometry(380, 32, 16);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        topColor: { value: new THREE.Color(0x273549) },    // Sophisticated medium-dark slate zenith
        bottomColor: { value: new THREE.Color(0xdbe4ee) }, // Luminous warm silver-pearl horizon
        offset: { value: 35 },
        exponent: { value: 0.65 }
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

    // Subtle ambient stardust shimmer in upper dome
    const starCount = 200;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 360;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = Math.abs(r * Math.cos(phi)) + 20;
      const z = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3] = x;
      starPositions[i * 3 + 1] = y;
      starPositions[i * 3 + 2] = z;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.7,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    this.scene.add(starPoints);

    // --- High-End Dual-Tone Studio Lighting ---
    // 1. Hemisphere Light: Luminous sky daylight + warm architectural slate bounce
    const hemiLight = new THREE.HemisphereLight(0xf8fafc, 0x64748b, 2.0);
    this.scene.add(hemiLight);

    // 2. Ambient Fill: Clear, radiant visibility across all architecture
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(ambientLight);

    // 3. Primary Key Directional Sunlight (Crisp, realistic architectural sunbeams & shadows)
    this.moonLight = new THREE.DirectionalLight(0xfffbeb, 2.8);
    this.moonLight.position.set(45, 70, 35);
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

    // 4. Secondary Daylight Sky Fill (Soft sky-blue fill from opposite quadrant)
    const skyFill = new THREE.DirectionalLight(0xbae6fd, 1.2);
    skyFill.position.set(-35, 45, -35);
    this.scene.add(skyFill);

    // 5. Warm Platinum Edge Light
    const rimLight = new THREE.DirectionalLight(0xfef08a, 0.7);
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
