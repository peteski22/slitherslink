export type Difficulty = 'easy' | 'normal' | 'hard';

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'normal', 'hard'];

// NOTE: Difficulty tunes ONLY the bot AI. Game rules (speed, world size, border
// death, collisions, growth) are constants shared across every difficulty and live
// in src/game/constants.ts — they must never be added here.
export interface DifficultySettings {
  botCount: number;    // number of AI opponents
  aggression: number;  // 0..1: chance a bot actively hunts / cuts off the player
  cunning: number;     // 0..1: bot decision quality (look-ahead for avoiding & hunting)
}

export const DIFFICULTIES: Record<Difficulty, DifficultySettings> = {
  easy:   { botCount: 5,  aggression: 0.05, cunning: 0.25 },
  normal: { botCount: 10, aggression: 0.4,  cunning: 0.6 },
  hard:   { botCount: 16, aggression: 0.85, cunning: 1.0 },
};
