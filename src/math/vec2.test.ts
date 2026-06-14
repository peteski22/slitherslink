import { describe, it, expect } from 'vitest';
import {
  vec, add, sub, scale, length, normalize, distance,
  fromAngle, angleOf, normalizeAngle, rotateToward,
} from './vec2';

describe('vec2', () => {
  it('adds and subtracts', () => {
    expect(add(vec(1, 2), vec(3, 4))).toEqual({ x: 4, y: 6 });
    expect(sub(vec(3, 4), vec(1, 2))).toEqual({ x: 2, y: 2 });
  });

  it('scales and measures length', () => {
    expect(scale(vec(2, 3), 2)).toEqual({ x: 4, y: 6 });
    expect(length(vec(3, 4))).toBe(5);
    expect(distance(vec(0, 0), vec(0, 5))).toBe(5);
  });

  it('normalizes to unit length and handles zero', () => {
    const n = normalize(vec(0, 10));
    expect(n.x).toBeCloseTo(0);
    expect(n.y).toBeCloseTo(1);
    expect(normalize(vec(0, 0))).toEqual({ x: 0, y: 0 });
  });

  it('converts between angle and vector', () => {
    const v = fromAngle(0);
    expect(v.x).toBeCloseTo(1);
    expect(v.y).toBeCloseTo(0);
    expect(angleOf(vec(0, 1))).toBeCloseTo(Math.PI / 2);
  });

  it('normalizes angles into (-PI, PI]', () => {
    expect(normalizeAngle(3 * Math.PI)).toBeCloseTo(Math.PI);
    expect(normalizeAngle(-3 * Math.PI)).toBeCloseTo(Math.PI);
  });

  it('rotates toward a target without overshooting', () => {
    expect(rotateToward(0, Math.PI / 2, Math.PI / 6)).toBeCloseTo(Math.PI / 6);
    expect(rotateToward(0, 0.1, 1)).toBeCloseTo(0.1);
    // short distance from -3 to 3 is ~0.283 rad; a 0.1 step moves 0.1 rad the short way
    const stepped = rotateToward(-3, 3, 0.1);
    expect(Math.abs(normalizeAngle(stepped - (-3)))).toBeCloseTo(0.1);
  });
});
