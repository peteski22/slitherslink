import { describe, it, expect } from 'vitest';
import { AudioManager } from './audio';

// Only the mute-state logic is unit-tested (no audio hardware in the test env); the actual
// sounds are verified by ear in the browser.
describe('AudioManager mute state', () => {
  it('uses the provided initial mute state', () => {
    expect(new AudioManager(true).isMuted).toBe(true);
    expect(new AudioManager(false).isMuted).toBe(false);
  });

  it('toggles mute and returns the new state', () => {
    const a = new AudioManager(false);
    expect(a.toggleMute()).toBe(true);
    expect(a.isMuted).toBe(true);
    expect(a.toggleMute()).toBe(false);
    expect(a.isMuted).toBe(false);
  });
});
