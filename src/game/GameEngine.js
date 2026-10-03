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
    // Warm twilight amber-slate fog to match golden-hour sky at mid distance
    this.scene.background = new THREE.Color(0x1e2a3a);
    this.scene.fog = new THREE.FogExp2(0x1e2a3a, 0.0028);

    // Renderer — high fidelity, crisp pixels
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: false,
      precision: 'highp'
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.physicallyCorrectLights = true;

    this.container.appendChild(this.renderer.domElement);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      450
    );

    // --- Premium Multi-Band Twilight Sky Dome ---
    // Deep indigo-navy zenith → violet midtone → amber-gold horizon
    // Professional "magic hour" atmosphere — medium dark/light balance
    const skyGeo = new THREE.SphereGeometry(380, 48, 24);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        zenithColor:   { value: new THREE.Color(0x0d1b2e) }, // Deep navy-indigo zenith
        midColor:      { value: new THREE.Color(0x2d3a6e) }, // Rich violet-blue midtone
        horizonColor:  { value: new THREE.Color(0xd97c3a) }, // Warm amber-gold horizon
        glowColor:     { value: new THREE.Color(0xf5a623) }, // Sun glow band
        sunDir:        { value: new THREE.Vector3(0.55, 0.08, -0.83).normalize() },
        time:          { value: 0.0 }
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
        uniform vec3 zenithColor;
        uniform vec3 midColor;
        uniform vec3 horizonColor;
        uniform vec3 glowColor;
        uniform vec3 sunDir;
        uniform float time;
        varying vec3 vWorldPosition;

        void main() {
          vec3 dir = normalize(vWorldPosition);
          float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0); // 0 at horizon, 1 at zenith

          // 3-band sky: zenith → mid → horizon
          vec3 skyColor;
          if (h > 0.5) {
            skyColor = mix(midColor, zenithColor, (h - 0.5) * 2.0);
          } else {
            skyColor = mix(horizonColor, midColor, h * 2.0);
          }

          // Warm glow band near horizon
          float horizonGlow = pow(1.0 - abs(h - 0.08), 6.0) * 0.9;
          skyColor = mix(skyColor, glowColor, horizonGlow);

          // Sun disc
          float sunDot = dot(dir, sunDir);
          float sunDisc = smoothstep(0.9985, 0.9998, sunDot);
          float sunHalo = pow(max(sunDot, 0.0), 48.0) * 0.5;
          skyColor = mix(skyColor, vec3(1.0, 0.85, 0.5), sunHalo);
          skyColor = mix(skyColor, vec3(1.0, 0.98, 0.9), sunDisc);

          gl_FragColor = vec4(skyColor, 1.0);
        }
      `
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(sky);
    this.skyMat = skyMat; // Store for animation

    // --- Professional Star Field (Visible in upper dome, fades near horizon) ---
    const starCount = 800;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * 2.0 * Math.PI;
      // Concentrate stars in upper hemisphere
      const phi = Math.acos(1.0 - Math.random() * 0.7); // Upper 70% of sphere
      const r = 370;
      starPositions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.cos(phi) + 10;
      starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      // Slight color variation: white / blue-white / warm-white
      const starType = Math.random();
      if (starType < 0.33) { starColors[i*3]=0.8; starColors[i*3+1]=0.9; starColors[i*3+2]=1.0; } // blue-white
      else if (starType < 0.66) { starColors[i*3]=1.0; starColors[i*3+1]=1.0; starColors[i*3+2]=1.0; } // pure white
      else { starColors[i*3]=1.0; starColors[i*3+1]=0.92; starColors[i*3+2]=0.78; } // warm gold
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.9,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    this.scene.add(starPoints);
    this.starPoints = starPoints;

    // --- Cinematic Professional Lighting (balanced warm-cool, magic-hour feel) ---

    // 1. Hemisphere: Warm golden sky-top + cool navy-indigo ground bounce
    const hemiLight = new THREE.HemisphereLight(0xf5a623, 0x1a2a4a, 1.6);
    this.scene.add(hemiLight);

    // 2. Ambient Fill: Soft neutral visibility — not too bright, preserves depth
    const ambientLight = new THREE.AmbientLight(0xc8d8f0, 0.55);
    this.scene.add(ambientLight);

    // 3. Primary Sun: Warm golden-hour key light casting long shadows
    this.moonLight = new THREE.DirectionalLight(0xffb347, 2.4);
    this.moonLight.position.set(55, 40, -80);
    this.moonLight.castShadow = true;
    this.moonLight.shadow.mapSize.width = 2048;
    this.moonLight.shadow.mapSize.height = 2048;
    this.moonLight.shadow.camera.near = 5;
    this.moonLight.shadow.camera.far = 200;
    const d = 70;
    this.moonLight.shadow.camera.left = -d;
    this.moonLight.shadow.camera.right = d;
    this.moonLight.shadow.camera.top = d;
    this.moonLight.shadow.camera.bottom = -d;
    this.moonLight.shadow.bias = -0.0003;
    this.scene.add(this.moonLight);

    // 4. Cool blue-violet sky fill from opposite — creates professional contrast
    const skyFill = new THREE.DirectionalLight(0x7ba7d4, 0.9);
    skyFill.position.set(-45, 60, 45);
    this.scene.add(skyFill);

    // 5. Subtle cyan-indigo fill for architectural depth on shadowed faces
    const fillLight = new THREE.DirectionalLight(0xa8c0ff, 0.45);
    fillLight.position.set(20, 15, 60);
    this.scene.add(fillLight);

    // 6. Subtle warm rim from below-horizon (simulates reflected city glow)
    const cityGlow = new THREE.PointLight(0xff8c42, 0.6, 150, 1.8);
    cityGlow.position.set(0, -8, 0);
    this.scene.add(cityGlow);
    this.cityGlow = cityGlow;

    // 7. Additional scene-wide warm fill to eliminate harsh shadow zones
    const warmFill1 = new THREE.PointLight(0xfff3d6, 1.2, 80);
    warmFill1.position.set(-28, 6, 0);   // Inside Executive Studio area
    this.scene.add(warmFill1);

    const warmFill2 = new THREE.PointLight(0xddeeff, 0.8, 60);
    warmFill2.position.set(0, 5, -35);   // Over Innovation Gallery
    this.scene.add(warmFill2);

    const warmFill3 = new THREE.PointLight(0xfff0e0, 0.7, 50);
    warmFill3.position.set(35, 5, 0);    // Hall of Milestones / east wing
    this.scene.add(warmFill3);
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

    // Update animated world objects (rings, crystals, lights, dust) + Bolt robot
    this.worldBuilder.update(delta, elapsedTime, this.player.position);

    // Animate sky time uniform (subtle living atmosphere)
    if (this.skyMat) {
      this.skyMat.uniforms.time.value = elapsedTime;
    }

    // Subtle city glow pulse (simulates warm ambient city reflections)
    if (this.cityGlow) {
      this.cityGlow.intensity = 0.6 + Math.sin(elapsedTime * 0.8) * 0.15;
    }

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

  /** Trigger a Bolt robot animation: 'wave' | 'point' | 'jump' | 'dance' | 'spin' | 'thumbs' */
  playRobotAction(action) {
    if (this.player && this.player.triggerAction) {
      this.player.triggerAction(action);
    }
    // Target the seated Bolt robot at the desk
    if (this.worldBuilder && this.worldBuilder.seatedRobot) {
      this.worldBuilder.seatedRobot.play(action);
    }
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
