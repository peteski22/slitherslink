// src/config/difficulty.test.ts
import { describe, it, expect } from 'vitest';
import { DIFFICULTIES, DIFFICULTY_ORDER } from './difficulty';

describe('difficulty presets', () => {
  it('defines easy, normal, hard in order', () => {
    expect(DIFFICULTY_ORDER).toEqual(['easy', 'normal', 'hard']);
  });

  // Difficulty changes ONLY the bot AI (count, aggression, cunning).
  // It never carries game-rule fields like speed or border behavior.
  it('scales bot count, aggression and cunning upward', () => {
    const e = DIFFICULTIES.easy, n = DIFFICULTIES.normal, h = DIFFICULTIES.hard;
    expect(e.botCount).toBeLessThan(n.botCount);
    expect(n.botCount).toBeLessThan(h.botCount);
    expect(e.aggression).toBeLessThan(h.aggression);
    expect(e.cunning).toBeLessThan(h.cunning);
  });

  it('does not expose any game-rule fields', () => {
    const keys = Object.keys(DIFFICULTIES.normal).sort();
    expect(keys).toEqual(['aggression', 'botCount', 'cunning']);
  });
});
