// src/render/camera.test.ts
import { describe, it, expect } from 'vitest';
import { vec } from '../math/vec2';
import { makeCamera, worldToScreen } from './camera';

describe('camera', () => {
  it('places the focus point at the screen center', () => {
    const cam = makeCamera(vec(100, 100), 800, 600);
    const p = worldToScreen(cam, vec(100, 100));
    expect(p.x).toBeCloseTo(400);
    expect(p.y).toBeCloseTo(300);
  });

  it('offsets other points relative to the focus', () => {
    const cam = makeCamera(vec(0, 0), 800, 600);
    const p = worldToScreen(cam, vec(10, 0));
    expect(p.x).toBeCloseTo(400 + 10 * cam.zoom);
    expect(p.y).toBeCloseTo(300);
  });
});
