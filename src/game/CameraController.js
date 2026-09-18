import * as THREE from 'three';

export class CameraController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    // Angles
    this.yaw = 0;
    this.pitch = 0.25; // slight downward angle
    this.minPitch = -0.15;
    this.maxPitch = 1.1;

    // Distance & offsets
    this.defaultDistance = 5.5;
    this.currentDistance = 5.5;
    this.targetHeight = 1.6;

    // Mouse drag / look state
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.mouseSensitivity = 0.0035;

    // Target to follow
    this.target = null; // Vector3 or Player reference

    // Cinematic focus override
    this.isCinematic = false;
    this.cinematicCameraPos = new THREE.Vector3();
    this.cinematicLookAtPos = new THREE.Vector3();

    this.currentLookAt = new THREE.Vector3();

    this.setupListeners();
  }

  setTarget(target) {
    this.target = target;
  }

  getYaw() {
    return this.yaw;
  }

  setupListeners() {
    // Mouse down & drag
    this.domElement.addEventListener('mousedown', (e) => {
      if (e.button === 0 || e.button === 2) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging || this.isCinematic) return;

      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.yaw -= deltaX * this.mouseSensitivity;
      this.pitch += deltaY * this.mouseSensitivity;
      this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    // Touch events for mobile camera drag
    let touchStartX = 0;
    let touchStartY = 0;

    this.domElement.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1 && !this.isCinematic) {
        // Only if touch is on the right half of the screen (left half is joystick)
        if (e.touches[0].clientX > window.innerWidth * 0.4) {
          this.isDragging = true;
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      }
    }, { passive: true });

    this.domElement.addEventListener('touchmove', (e) => {
      if (!this.isDragging || this.isCinematic) return;
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        this.yaw -= deltaX * this.mouseSensitivity * 1.2;
        this.pitch += deltaY * this.mouseSensitivity * 1.2;
        this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));

        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      }
    }, { passive: true });

    this.domElement.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    // Wheel zoom
    this.domElement.addEventListener('wheel', (e) => {
      if (this.isCinematic) return;
      this.defaultDistance += e.deltaY * 0.005;
      this.defaultDistance = Math.max(3.0, Math.min(9.0, this.defaultDistance));
    }, { passive: true });
  }

  startCinematic(cameraPos, lookAtPos) {
    this.isCinematic = true;
    this.cinematicCameraPos.copy(cameraPos);
    this.cinematicLookAtPos.copy(lookAtPos);
  }

  stopCinematic() {
    this.isCinematic = false;
  }

  update(delta) {
    const dt = Math.min(delta, 0.1);

    if (this.isCinematic) {
      // Smoothly transition to cinematic view
      this.camera.position.lerp(this.cinematicCameraPos, 5 * dt);
      this.currentLookAt.lerp(this.cinematicLookAtPos, 6 * dt);
      this.camera.lookAt(this.currentLookAt);
      return;
    }

    if (!this.target) return;

    // Player position
    const targetPos = this.target.position ? this.target.position : this.target;

    // Desired lookAt point (head/chest height)
    const desiredLookAt = new THREE.Vector3(
      targetPos.x,
      targetPos.y + this.targetHeight,
      targetPos.z
    );

    this.currentLookAt.lerp(desiredLookAt, 12 * dt);

    // Spherical coordinates for third person camera offset
    const horizontalDistance = this.defaultDistance * Math.cos(this.pitch);
    const verticalDistance = this.defaultDistance * Math.sin(this.pitch);

    const offsetX = horizontalDistance * Math.sin(this.yaw);
    const offsetZ = horizontalDistance * Math.cos(this.yaw);
    const offsetY = verticalDistance;

    const desiredCameraPos = new THREE.Vector3(
      desiredLookAt.x + offsetX,
      desiredLookAt.y + offsetY,
      desiredLookAt.z + offsetZ
    );

    // Prevent camera from going below floor level
    if (desiredCameraPos.y < 0.6) {
      desiredCameraPos.y = 0.6;
    }

    // Smoothly damp camera position
    this.camera.position.lerp(desiredCameraPos, 10 * dt);
    this.camera.lookAt(this.currentLookAt);
  }
}
