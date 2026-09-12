/**
 * Frontend RPG calculations.
 *
 * The backend stores character.xp as XP remaining inside the current level,
 * not lifetime/cumulative XP. The backend remains authoritative for level/xp.
 *
 * Keep this formula in sync with backend LevelService:
 *   requiredXP(level) = floor(100 * level^1.6)
 */

export const BASE_XP_SCALE = 100;
export const LEVEL_EXPONENT = 1.6;

export function getRequiredXP(level: number): number {
  if (level < 1) return BASE_XP_SCALE;
  return Math.floor(BASE_XP_SCALE * Math.pow(level, LEVEL_EXPONENT));
}

/**
 * Convert backend level + remaining XP into cumulative XP.
 * This is used by the progression/rank screen only.
 */
export function getTotalXP(level: number, currentXP: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  const safeXP = Math.max(0, currentXP);

  let totalXP = safeXP;

  for (let currentLevel = 1; currentLevel < safeLevel; currentLevel += 1) {
    totalXP += getRequiredXP(currentLevel);
  }

  return totalXP;
}

export function getLevelProgress(level: number, currentXP: number) {
  const requiredXP = getRequiredXP(level);
  const safeXP = Math.max(0, currentXP);

  return {
    currentXP: safeXP,
    requiredXP,
    percentage: Math.min(100, Math.max(0, (safeXP / requiredXP) * 100)),
    totalXP: getTotalXP(level, safeXP),
  };
}
