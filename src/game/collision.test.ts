// src/game/collision.test.ts
import { describe, it, expect } from 'vitest';
import { vec } from '../math/vec2';
import { createSnake, stepSnake } from './snake';
import { headHitsSnake, headOutsideBorder } from './collision';

describe('collision', () => {
  it('detects a head striking another snake body', () => {
    const a = createSnake({ id: 'a', name: 'A', isPlayer: true, skinId: 'pink', pos: vec(0, 0), heading: 0 });
    // B's body lies right on A's head
    const b = createSnake({ id: 'b', name: 'B', isPlayer: false, skinId: 'blue', pos: vec(0, 0), heading: Math.PI / 2 });
    expect(headHitsSnake(a, b)).toBe(true);
  });

  it('ignores snakes that are far apart', () => {
    const a = createSnake({ id: 'a', name: 'A', isPlayer: true, skinId: 'pink', pos: vec(0, 0), heading: 0 });
    const b = createSnake({ id: 'b', name: 'B', isPlayer: false, skinId: 'blue', pos: vec(800, 800), heading: 0 });
    expect(headHitsSnake(a, b)).toBe(false);
  });

  it('does not flag an extended snake colliding with its own straight neck', () => {
    const a = createSnake({ id: 'a', name: 'A', isPlayer: true, skinId: 'pink', pos: vec(0, 0), heading: 0 });
    // Snakes spawn collapsed at a point; move straight so the body extends behind the head.
    for (let i = 0; i < 100; i++) stepSnake(a, 120, 1 / 60);
    expect(headHitsSnake(a, a)).toBe(false);
  });

  it('detects the head leaving the rectangular world', () => {
    const a = createSnake({ id: 'a', name: 'A', isPlayer: true, skinId: 'pink', pos: vec(0, 0), heading: 0 });
    const world = { width: 2000, height: 2000 };
    expect(headOutsideBorder(a, world)).toBe(false);
    a.segments[0] = vec(1001, 0);
    expect(headOutsideBorder(a, world)).toBe(true);
  });
});
