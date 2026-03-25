const SPORTS_FACTS = [
  "The fastest recorded tennis serve topped 163 mph.",
  "A soccer field can be up to 120 yards long in international play.",
  "Volleyball was invented in 1895 as a gentler alternative to basketball.",
  "Pickleball was named after the family dog, Pickles.",
  "Indoor tracks are banked so sprinters don’t fly into the stands.",
  "The first basketball hoops were peach baskets—no hole in the bottom.",
  "Futsal uses a smaller, heavier ball to keep touches sharp.",
  "Badminton shuttles can leave a racket at over 200 mph.",
] as const;

function hashPick(seed: string, modulo: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return modulo <= 0 ? 0 : h % modulo;
}

export function pickSportsFact(seed: string): string {
  return SPORTS_FACTS[hashPick(seed, SPORTS_FACTS.length)]!;
}

export const BOOKING_LOADING_TAGLINE = "Cooking up some rentals for you…";

/** Shown while the day’s slot grid is loading or re-fetching. */
export const BOOKING_SLOTS_TAGLINE = "Cooking up some fresh slots…";

export const BOOKING_SCHEDULE_SETTINGS_TAGLINE = "Syncing open dates…";
