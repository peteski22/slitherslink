/**
 * Original snake.io-style audio via the Web Audio API. Every sound is synthesized — no
 * third-party or copyrighted assets. The audio context is created lazily.
 * NOTE: callers must invoke resume() from within a user gesture before sound will play
 * (browser autoplay policy).
 */
export class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted: boolean;

  private musicTimer: number | null = null;
  private nextNoteTime = 0;
  private noteIndex = 0;

  private boosting = false;
  private boostOsc: OscillatorNode | null = null;
  private boostGain: GainNode | null = null;

  // An original, cheerful 8-step loop (note frequencies in Hz).
  private readonly melody = [523, 659, 784, 659, 587, 698, 587, 494];
  private readonly stepDur = 0.18;

  constructor(muted = false) {
    this.muted = muted;
  }

  get isMuted(): boolean {
    return this.muted;
  }

  /** Create/resume the audio context. Safe to call repeatedly; call it from a tap/click. */
  resume(): void {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.5;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.5;
    return this.muted;
  }

  private blip(freq: number, dur: number, type: OscillatorType, vol: number): void {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t);
    osc.stop(t + dur);
  }

  playEat(): void {
    this.blip(880, 0.07, 'square', 0.18);
  }

  playDie(): void {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.5);
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  playKing(): void {
    [523, 659, 784, 1047].forEach((f, i) => {
      window.setTimeout(() => this.blip(f, 0.16, 'triangle', 0.3), i * 90);
    });
  }

  /** Start/stop a low boost rumble while the player is boosting. */
  setBoosting(on: boolean): void {
    if (on === this.boosting) return;
    this.boosting = on;
    if (!this.ctx || !this.master) return;
    if (on) {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = 220;
      g.gain.value = 0.1;
      osc.connect(g);
      g.connect(this.master);
      osc.start();
      this.boostOsc = osc;
      this.boostGain = g;
    } else if (this.boostOsc) {
      this.boostOsc.stop();
      this.boostOsc.disconnect();
      this.boostGain?.disconnect();
      this.boostOsc = null;
      this.boostGain = null;
    }
  }

  startMusic(): void {
    if (!this.ctx || !this.master || this.musicTimer !== null) return;
    this.nextNoteTime = this.ctx.currentTime;
    this.noteIndex = 0;
    const schedule = () => {
      if (!this.ctx || !this.master) return;
      while (this.nextNoteTime < this.ctx.currentTime + 0.2) {
        const f = this.melody[this.noteIndex % this.melody.length];
        const t = this.nextNoteTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.06, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + this.stepDur * 0.9);
        osc.connect(g);
        g.connect(this.master);
        osc.start(t);
        osc.stop(t + this.stepDur);
        this.nextNoteTime += this.stepDur;
        this.noteIndex++;
      }
      this.musicTimer = window.setTimeout(schedule, 60);
    };
    schedule();
  }

  stopMusic(): void {
    if (this.musicTimer !== null) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }
}
