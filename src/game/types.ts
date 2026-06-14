import type { Vec2 } from '../math/vec2';

export type SnakeId = string;

export interface Snake {
  id: SnakeId;
  name: string;
  isPlayer: boolean;
  skinId: string;
  /** segments[0] is the head; subsequent points trail the head. */
  segments: Vec2[];
  heading: number; // radians, current facing
  mass: number;    // drives both length (segment count) and girth (radius)
  boosting: boolean;
  alive: boolean;
  boostDropTimer: number; // internal: time accumulator for boost food drops
}

export interface Food {
  id: number;
  pos: Vec2;
  value: number;
  big: boolean; // true for glowing pellets from dead snakes
}

export interface World {
  radius: number; // arena is a circle centered at (0,0)
}

export interface GameState {
  world: World;
  snakes: Snake[];
  food: Food[];
  nextFoodId: number;
  tick: number;
}

/** Per-frame player intent produced by the input layer. */
export interface InputState {
  /** Desired heading in radians, or null if the player isn't steering this frame. */
  steerAngle: number | null;
  boost: boolean;
}
