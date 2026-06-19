import { distance, sub, dot, fromAngle, type Vec2 } from '../math/vec2';
import type { Snake, World } from './types';
import { snakeRadius } from './snake';
import { SEGMENT_SPACING } from './constants';

/** Number of leading body points a snake cannot collide with on itself (its own neck). */
const SELF_SKIP = 4;

/**
 * cos of the head's forward half-angle. Only the head's forward cone is deadly, so a snake
 * can swerve in front of / cut off others without dying from side or rear contact.
 * ~0.25 ≈ a 75° half-angle (a ~150° frontal arc).
 */
const HEAD_CONE_COS = 0.25;

/** Closest point to `p` on the line segment a–b. */
function closestOnSegment(p: Vec2, a: Vec2, b: Vec2): Vec2 {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const len2 = abx * abx + aby * aby;
  let t = len2 > 0 ? ((p.x - a.x) * abx + (p.y - a.y) * aby) / len2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return { x: a.x + abx * t, y: a.y + aby * t };
}

/**
 * True if `attacker`'s head runs into `victim`'s body (within its forward cone). The body is
 * treated as connected segments (a capsule chain), so a fast head can't slip *between* two
 * body points. When attacker === victim, the first SELF_SKIP points are ignored (the neck).
 */
export function headHitsSnake(attacker: Snake, victim: Snake): boolean {
  if (!attacker.alive || !victim.alive) return false;
  const headPos = attacker.segments[0];
  const hitDist = (snakeRadius(attacker) + snakeRadius(victim)) * 0.45;
  const startIndex = attacker === victim ? SELF_SKIP : 0;
  // broad-phase: skip distant snakes cheaply
  if (attacker !== victim) {
    const span = victim.segments.length * SEGMENT_SPACING + snakeRadius(victim) + snakeRadius(attacker);
    if (distance(headPos, victim.segments[0]) > span) return false;
  }
  const facing = fromAngle(attacker.heading);
  for (let i = startIndex; i < victim.segments.length - 1; i++) {
    const cp = closestOnSegment(headPos, victim.segments[i], victim.segments[i + 1]);
    const d = distance(headPos, cp);
    if (d > hitDist) continue;
    if (d < 0.0001) return true; // exactly overlapping
    if (dot(sub(cp, headPos), facing) / d >= HEAD_CONE_COS) return true; // only the forward cone
  }
  return false;
}

/**
 * True once the head's leading edge reaches the wall (consistent on all four sides, rather
 * than dying when the head centre is already half over the border).
 */
export function headOutsideBorder(s: Snake, world: World): boolean {
  const h = s.segments[0];
  const r = snakeRadius(s);
  return Math.abs(h.x) + r > world.width / 2 || Math.abs(h.y) + r > world.height / 2;
}
