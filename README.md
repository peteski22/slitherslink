# 🐍 Snake

A personal, ad-free, **offline** snake.io-style game for the family's tablets (iPad first,
Android later). One player vs. AI bots: slither around, eat to grow longer *and* fatter,
boost, cut rivals off, and chase the "King" crown — with none of the ads, in-app purchases,
or online strangers of the real thing.

> Built for my kids. Not affiliated with snake.io.

## Status

**Playable core is working** (the full single-player game runs in a browser). Polish still
to come: persistence, on-screen HUD + menus/settings, audio, and packaging it as an
installable home-screen app (PWA). See [the plan](docs/superpowers/plans/2026-06-14-snake-game.md)
for what's done and what's left, and [the design spec](docs/superpowers/specs/2026-06-14-snake-game-design.md)
for the intended behavior.

## Running it

Requires [pnpm](https://pnpm.io) (the repo pins Node via `.npmrc`, so any shell works).

```bash
pnpm install      # first time
pnpm dev          # dev server with hot reload — open the printed http://localhost:5173
pnpm test         # unit tests (Vitest)
pnpm build        # production build into dist/ (this is the installable PWA)
pnpm preview      # serve the production build (use --host to reach it from a tablet)
```

## Controls

- **Mouse mode** (desktop testing): the snake steers toward the mouse pointer; **click to boost**.
  Toggle it on the start screen (once that screen lands) — for now it's on by default in the
  playable build.
- **Touch** (primary, on tablets): a thumbstick on the left half to steer, a boost zone on the
  right half.
- Keyboard fallback: arrow keys / WASD to steer, space to boost.

## How it plays

- Eat scattered food to grow; mass drives both **length and girth**.
- **Boost** (hold) for a speed burst that sheds mass into a trail you (or others) can re-collect;
  you can't boost once you shrink back to starting size.
- You die if your head's **forward cone** hits another snake's body, or if your head reaches the
  **deadly red border**. You can cross your *own* body freely.
- Kill rivals by making them run into you — a dead snake bursts into glowing pellets in its own
  colour, worth more than normal food.
- You spawn growing out from a point with a brief invulnerability pulse; bots grow out too but
  aren't invulnerable.

## Tech

Vanilla **TypeScript** + **Vite**, rendering to an HTML5 `<canvas>`. A single authoritative,
DOM-free **simulation** (unit-tested with Vitest) is drawn through a follow-camera. No runtime
dependencies, no network, no analytics. Ships as a static, offline **PWA**.

Source layout: `src/math` (vectors), `src/game` (constants, types, snake, food, collision,
bots, leaderboard, simulation), `src/config` (difficulty), `src/render` (camera, renderer),
`src/skins`, `src/input`, plus `src/main.ts` to wire it together. All tunable gameplay numbers
live in `src/game/constants.ts`.
