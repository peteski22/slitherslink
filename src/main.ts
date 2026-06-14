import './style.css';
import { createGame, update, PLAYER_ID } from './game/simulation';
import { DIFFICULTIES } from './config/difficulty';
import { Controls } from './input/controls';
import { makeCamera } from './render/camera';
import { render } from './render/renderer';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

const controls = new Controls(canvas);
controls.setMouseMode(true); // desktop testing
const rng = () => Math.random();
const settings = DIFFICULTIES.normal;

let state = createGame('normal', 'pink', rng);
let player = state.snakes.find((s) => s.id === PLAYER_ID)!;

const FIXED_DT = 1 / 60;
let last = performance.now();
let acc = 0;

function frame(now: number) {
  acc += Math.min(0.1, (now - last) / 1000);
  last = now;
  const input = controls.read();
  while (acc >= FIXED_DT) {
    update(state, FIXED_DT, input, settings, rng);
    acc -= FIXED_DT;
  }
  if (!player.alive) {
    // instant restart for testing (final main shows a game-over screen instead)
    state = createGame('normal', 'pink', rng);
    player = state.snakes.find((s) => s.id === PLAYER_ID)!;
  }
  const cam = makeCamera(player.segments[0], window.innerWidth, window.innerHeight, 1);
  render(ctx, state, cam);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
