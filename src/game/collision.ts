import { distance } from '../math/vec2';
import type { Snake, World } from './types';
import { snakeRadius } from './snake';
import { SEGMENT_SPACING } from './constants';

/** Number of leading body points a snake cannot collide with on itself (its own neck). */
const SELF_SKIP = 4;

/**
 * True if `attacker`'s head overlaps any body segment of `victim`.
 * When attacker === victim, the first SELF_SKIP points are ignored (the neck).
 */
export function headHitsSnake(attacker: Snake, victim: Snake): boolean {
  if (!attacker.alive || !victim.alive) return false;
  const headPos = attacker.segments[0];
  const hitDist = snakeRadius(attacker) * 0.6 + snakeRadius(victim) * 0.6;
  const startIndex = attacker === victim ? SELF_SKIP : 0;
  // broad-phase: skip distant snakes cheaply
  if (attacker !== victim) {
    const span = victim.segments.length * SEGMENT_SPACING + snakeRadius(victim) + snakeRadius(attacker);
    if (distance(headPos, victim.segments[0]) > span) return false;
  }
  for (let i = startIndex; i < victim.segments.length; i++) {
    if (distance(headPos, victim.segments[i]) <= hitDist) return true;
  }
  return false;
}

/** True if the snake's head is outside the rectangular world bounds. */
export function headOutsideBorder(s: Snake, world: World): boolean {
  const h = s.segments[0];
  return Math.abs(h.x) > world.width / 2 || Math.abs(h.y) > world.height / 2;
}
