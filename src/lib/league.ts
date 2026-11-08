// League levels by monthly progress (studied hours / monthly target).
export type League = {
  name: string;
  min: number; // minimum progress ratio, e.g. 0.5 = 50%
  tier: number; // 0 = Failed ... 10 = Freedom, drives the card's animation strength
};

// Ordered highest first so the first match wins.
export const LEAGUE_LEVELS: League[] = [
  { name: 'Freedom', min: 0.95, tier: 10 },
  { name: 'Mastery', min: 0.9, tier: 9 },
  { name: 'Unstoppable', min: 0.85, tier: 8 },
  { name: 'Focused', min: 0.8, tier: 7 },
  { name: 'Achiever', min: 0.75, tier: 6 },
  { name: 'Striver', min: 0.7, tier: 5 },
  { name: 'Climber', min: 0.65, tier: 4 },
  { name: 'Builder', min: 0.6, tier: 3 },
  { name: 'Rising', min: 0.55, tier: 2 },
  { name: 'Awakening', min: 0.5, tier: 1 },
];

export const FAILED_LEAGUE: League = { name: 'Failed', min: 0, tier: 0 };

export function getLeague(progress: number): League {
  for (const level of LEAGUE_LEVELS) {
    if (progress >= level.min) return level;
  }
  return FAILED_LEAGUE;
}
