import type { InputState } from '../game/types';

/**
 * Player input. Two modes:
 *  - Touch (primary): a dynamic thumbstick anchored where the player first touches the
 *    left half of the screen, plus a boost zone on the right half.
 *  - Mouse (desktop testing toggle): the snake steers toward the mouse pointer and a mouse
 *    click boosts. The player head is always at screen center, so the steer angle is the
 *    angle from screen center to the pointer.
 * Arrow/WASD + space are also accepted as a keyboard fallback for development.
 */
export class Controls {
  private steerAngle: number | null = null;
  private boost = false;

  private stickId: number | null = null;
  private stickOrigin = { x: 0, y: 0 };
  private stickKnob = { x: 0, y: 0 };
  private boostId: number | null = null;
  private readonly stickMax = 50; // px the knob can travel from the origin

  private mouseMode = false;
  private mouseAngle: number | null = null;
  private mouseBoost = false;

  private keys = new Set<string>();
  private readonly deadZone = 14; // px before steering registers

  constructor(target: HTMLElement) {
    target.addEventListener('pointerdown', this.onDown, { passive: false });
    target.addEventListener('pointermove', this.onMove, { passive: false });
    // Release/cancel listen on the window so letting go *anywhere* (e.g. over a dialog)
    // clears boost/steer state — otherwise boost can "stick" on after dying mid-boost.
    window.addEventListener('pointerup', this.onUp);
    window.addEventListener('pointercancel', this.onUp);
    window.addEventListener('keydown', (e) => this.keys.add(e.key));
    window.addEventListener('keyup', (e) => this.keys.delete(e.key));
  }

  /** Enable/disable desktop mouse mode. Clears any stale mouse state when turned off. */
  setMouseMode(on: boolean): void {
    this.mouseMode = on;
    if (!on) { this.mouseAngle = null; this.mouseBoost = false; }
  }

  /** Thumbstick draw state: base origin + clamped knob position. */
  get stick(): { active: boolean; ox: number; oy: number; kx: number; ky: number } {
    return {
      active: this.stickId !== null,
      ox: this.stickOrigin.x,
      oy: this.stickOrigin.y,
      kx: this.stickKnob.x,
      ky: this.stickKnob.y,
    };
  }

  /** True when boost is currently engaged (for highlighting the boost button). */
  get isBoosting(): boolean {
    return this.boost || (this.mouseMode && this.mouseBoost) || this.keys.has(' ');
  }

  private angleFromCenter(x: number, y: number): number {
    return Math.atan2(y - window.innerHeight / 2, x - window.innerWidth / 2);
  }

  private onDown = (e: PointerEvent) => {
    e.preventDefault();
    if (this.mouseMode && e.pointerType === 'mouse') {
      this.mouseBoost = true;
      this.mouseAngle = this.angleFromCenter(e.clientX, e.clientY);
      return;
    }
    const leftHalf = e.clientX < window.innerWidth / 2;
    if (leftHalf && this.stickId === null) {
      this.stickId = e.pointerId;
      this.stickOrigin = { x: e.clientX, y: e.clientY };
      this.stickKnob = { x: e.clientX, y: e.clientY };
    } else if (!leftHalf && this.boostId === null) {
      this.boostId = e.pointerId;
      this.boost = true;
    }
  };

  private onMove = (e: PointerEvent) => {
    if (this.mouseMode && e.pointerType === 'mouse') {
      this.mouseAngle = this.angleFromCenter(e.clientX, e.clientY);
      return;
    }
    if (e.pointerId !== this.stickId) return;
    e.preventDefault();
    const dx = e.clientX - this.stickOrigin.x;
    const dy = e.clientY - this.stickOrigin.y;
    const mag = Math.hypot(dx, dy);
    if (mag >= this.deadZone) this.steerAngle = Math.atan2(dy, dx);
    const clamp = Math.min(mag, this.stickMax);
    const a = Math.atan2(dy, dx);
    this.stickKnob = mag > 0
      ? { x: this.stickOrigin.x + Math.cos(a) * clamp, y: this.stickOrigin.y + Math.sin(a) * clamp }
      : { x: this.stickOrigin.x, y: this.stickOrigin.y };
  };

  private onUp = (e: PointerEvent) => {
    if (this.mouseMode && e.pointerType === 'mouse') { this.mouseBoost = false; return; }
    if (e.pointerId === this.stickId) { this.stickId = null; this.steerAngle = null; }
    if (e.pointerId === this.boostId) { this.boostId = null; this.boost = false; }
  };

  /** Read the current intent. Mouse mode (if on) and keyboard override touch state. */
  read(): InputState {
    let angle = this.mouseMode ? this.mouseAngle : this.steerAngle;
    let boost = this.mouseMode ? this.mouseBoost : this.boost;

    let kx = 0, ky = 0;
    if (this.keys.has('ArrowLeft') || this.keys.has('a')) kx -= 1;
    if (this.keys.has('ArrowRight') || this.keys.has('d')) kx += 1;
    if (this.keys.has('ArrowUp') || this.keys.has('w')) ky -= 1;
    if (this.keys.has('ArrowDown') || this.keys.has('s')) ky += 1;
    if (kx !== 0 || ky !== 0) angle = Math.atan2(ky, kx);
    if (this.keys.has(' ')) boost = true;

    return { steerAngle: angle, boost };
  }
}
