import './style.css';
import { createGame, update, respawnPlayer, PLAYER_ID } from './game/simulation';
import { DIFFICULTIES } from './config/difficulty';
import { Controls } from './input/controls';
import { makeCamera } from './render/camera';
import { render } from './render/renderer';
import { scoreOf, kingId } from './game/leaderboard';
import { Hud } from './ui/hud';
import { Screens } from './ui/screens';
import { AudioManager } from './audio/audio';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const hud = new Hud(document.getElementById('hud') as HTMLElement);
const screens = new Screens(document.getElementById('screens') as HTMLElement);
const audio = new AudioManager(localStorage.getItem('snake.muted') === '1');

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

let playerName = localStorage.getItem('snake.name') || 'Skiddles';
let state = createGame('normal', 'pink', rng, playerName);
let player = state.snakes.find((s) => s.id === PLAYER_ID)!;
let best = 0; // session best score (until persistence lands)

type Phase = 'start' | 'playing' | 'gameover';
let phase: Phase = 'start';

hud.bindName(playerName, (name) => {
  playerName = name;
  localStorage.setItem('snake.name', name);
  player.name = name; // reflect on the live leaderboard immediately
});

hud.bindMute(audio.isMuted, (muted) => {
  audio.toggleMute();
  localStorage.setItem('snake.muted', muted ? '1' : '0');
});

const FIXED_DT = 1 / 60;
let last = performance.now();
let acc = 0;
let prevMass = player.mass;
let wasKingAudio = false;
let lastKingSound = -Infinity;

function refindPlayer(): void {
  player = state.snakes.find((s) => s.id === PLAYER_ID)!;
  prevMass = player.mass;
}

function enterGameOver(): void {
  phase = 'gameover';
  const deadScore = scoreOf(player);
  const deadMass = player.mass;
  audio.playDie();
  audio.setBoosting(false);
  hud.hide();
  void screens.showGameOver(deadScore, best).then((choice) => {
    if (choice === 'restart') {
      state = createGame('normal', 'pink', rng, playerName); // everyone resets
    } else if (choice === 'revive') {
      respawnPlayer(state, rng, playerName, undefined, deadMass, deadScore); // keep size + score
    } else {
      respawnPlayer(state, rng, playerName); // small respawn into the existing world
    }
    refindPlayer();
    hud.show();
    phase = 'playing';
  });
}

function frame(now: number): void {
  acc += Math.min(0.1, (now - last) / 1000);
  last = now;

  if (phase === 'playing') {
    const input = controls.read();
    while (acc >= FIXED_DT) {
      update(state, FIXED_DT, input, settings, rng);
      acc -= FIXED_DT;
    }
    // audio reactions to game events
    if (player.alive && player.mass > prevMass + 0.001) audio.playEat();
    audio.setBoosting(player.alive && player.boosting);
    const isKing = kingId(state.snakes) === PLAYER_ID;
    if (isKing && !wasKingAudio && now - lastKingSound > 9000) {
      audio.playKing();
      lastKingSound = now;
    }
    wasKingAudio = isKing;
    best = Math.max(best, scoreOf(player));
    prevMass = player.mass;
    if (!player.alive) enterGameOver();
  } else {
    acc = 0; // don't accumulate time while a dialog is up
  }

  const cam = makeCamera(player.segments[0], window.innerWidth, window.innerHeight, 1);
  render(ctx, state, cam);
  if (phase === 'playing') hud.update(state, PLAYER_ID, best);

  requestAnimationFrame(frame);
}

// Start screen first — its Play button is the user gesture that unlocks audio.
hud.hide();
void screens.showStart(best).then(() => {
  audio.resume();
  audio.startMusic();
  hud.show();
  phase = 'playing';
});
requestAnimationFrame(frame);
