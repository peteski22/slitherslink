export type FoodMode = 'famine' | 'normal' | 'feast';

export const FOOD_MODE_ORDER: FoodMode[] = ['feast', 'normal', 'famine'];

export interface FoodModeSettings {
  densityMultiplier: number;
  respawnRate: number;
}

export const FOOD_MODES: Record<FoodMode, FoodModeSettings> = {
  famine: { densityMultiplier: 0.4, respawnRate: 1 },
  normal: { densityMultiplier: 1.0, respawnRate: 3 },
  feast:  { densityMultiplier: 2.5, respawnRate: 8 },
};
