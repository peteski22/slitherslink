import type { GameState } from '../game/types';
import { ranking, scoreOf, kingId } from '../game/leaderboard';

/**
 * On-screen heads-up display: the player's length/best up top and a live leaderboard of the
 * top snakes (player and bots), with a crown on the current King. Pure DOM over the canvas.
 */
export class Hud {
  private root: HTMLElement;
  private scoreEl: HTMLElement;
  private boardEl: HTMLElement;
  private wasKing = false;

  constructor(mount: HTMLElement) {
    this.root = mount;
    this.root.innerHTML = `
      <div class="score-pill" id="hud-score"></div>
      <div class="leaderboard">
        <h4>Leaderboard</h4>
        <div id="hud-board"></div>
      </div>
    `;
    this.scoreEl = this.root.querySelector('#hud-score')!;
    this.boardEl = this.root.querySelector('#hud-board')!;
  }

  /** Refresh the HUD from the current game state. */
  update(state: GameState, playerId: string, best: number): void {
    const ranked = ranking(state.snakes);
    const player = state.snakes.find((s) => s.id === playerId);
    const king = kingId(state.snakes);

    this.scoreEl.textContent = `Length ${player ? scoreOf(player) : 0}  ·  🏆 ${best}`;

    // Build rows with textContent (not innerHTML) so snake names can never inject markup.
    const rows = ranked.slice(0, 5).map((s, i) => {
      const row = document.createElement('div');
      if (s.id === playerId) row.className = 'you';
      const crown = s.id === king ? '👑 ' : '';
      const name = s.id === playerId ? 'You' : s.name;
      row.textContent = `${i + 1}. ${crown}${name} — ${scoreOf(s)}`;
      return row;
    });
    this.boardEl.replaceChildren(...rows);

    const isKing = king === playerId;
    if (isKing && !this.wasKing) this.flashKing();
    this.wasKing = isKing;
  }

  private flashKing(): void {
    const el = document.createElement('div');
    el.className = 'king-flash';
    el.textContent = "You're the King! 👑";
    this.root.appendChild(el);
    setTimeout(() => el.remove(), 1700);
  }

  show(): void { this.root.classList.remove('hidden'); }
  hide(): void { this.root.classList.add('hidden'); }
}
