import { Vec2, vec } from '../math/vec2';

export interface Camera {
  focus: Vec2;     // world point shown at screen center
  width: number;
  height: number;
  zoom: number;    // screen px per world unit
}

export function makeCamera(focus: Vec2, width: number, height: number, zoom = 1): Camera {
  return { focus, width, height, zoom };
}

export function worldToScreen(cam: Camera, p: Vec2): Vec2 {
  return vec(
    (p.x - cam.focus.x) * cam.zoom + cam.width / 2,
    (p.y - cam.focus.y) * cam.zoom + cam.height / 2,
  );
}
