// Web Audio API Procedural Sound Engine
// Zero external assets required, 100% reliable, low-latency

class AudioSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isMusicEnabled = true;
    this.isSfxEnabled = true;
    this.ambientNodes = null;
    this.lastFootstepTime = 0;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.startAmbientDrone();
    } catch (e) {
      console.warn("AudioContext failed to initialize", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      if (this.ambientNodes && this.ambientNodes.masterGain) {
        this.ambientNodes.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
    } else {
      if (this.ambientNodes && this.ambientNodes.masterGain && this.isMusicEnabled) {
        this.ambientNodes.masterGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      }
    }
    return this.isMuted;
  }

  startAmbientDrone() {
    if (!this.ctx || this.ambientNodes) return;
    try {
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(this.isMuted || !this.isMusicEnabled ? 0 : 0.07, this.ctx.currentTime);
      masterGain.connect(this.ctx.destination);

      // Warm low drone
      const osc1 = this.ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1

      const osc2 = this.ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(110, this.ctx.currentTime); // A2

      // Subtle slow low-pass filter movement
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(280, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(120, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(masterGain);

      osc1.start();
      osc2.start();
      lfo.start();

      this.ambientNodes = { osc1, osc2, lfo, masterGain };
    } catch (e) {
      console.warn("Ambient drone failed to start", e);
    }
  }

  playFootstep(isSprinting = false) {
    if (!this.ctx || this.isMuted || !this.isSfxEnabled) return;
    const now = Date.now();
    const interval = isSprinting ? 240 : 380;
    if (now - this.lastFootstepTime < interval) return;
    this.lastFootstepTime = now;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(isSprinting ? 400 : 250, this.ctx.currentTime);

      osc.type = "triangle";
      const startFreq = isSprinting ? 120 : 85;
      osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(isSprinting ? 0.08 : 0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch (e) {}
  }

  playJump() {
    if (!this.ctx || this.isMuted || !this.isSfxEnabled) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(380, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.23);
    } catch (e) {}
  }

  playLand() {
    if (!this.ctx || this.isMuted || !this.isSfxEnabled) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(90, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.17);
    } catch (e) {}
  }

  playInteract() {
    if (!this.ctx || this.isMuted || !this.isSfxEnabled) return;
    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = "sine";
      osc2.type = "sine";

      osc1.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
      osc2.frequency.setValueAtTime(880.00, this.ctx.currentTime + 0.05); // A5

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start(this.ctx.currentTime + 0.05);
      osc1.stop(this.ctx.currentTime + 0.25);
      osc2.stop(this.ctx.currentTime + 0.25);
    } catch (e) {}
  }

  playDiscovery() {
    if (!this.ctx || this.isMuted || !this.isSfxEnabled) return;
    try {
      // Arpeggio chord C - E - G - B - C high
      const notes = [261.63, 329.63, 392.00, 493.88, 523.25];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.09, this.ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.08);
        osc.stop(this.ctx.currentTime + idx * 0.08 + 0.36);
      });
    } catch (e) {}
  }

  playQuestComplete() {
    this.playDiscovery();
  }

  playClick() {
    if (!this.ctx || this.isMuted || !this.isSfxEnabled) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(900, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {}
  }
}

export const soundManager = new AudioSystem();
