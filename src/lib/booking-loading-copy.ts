function hashPick(seed: string, modulo: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return modulo <= 0 ? 0 : h % modulo;
}

/** Deterministic “fun fact” line from `messages` `booking.sportsFacts` array. */
export function pickSportsFact(seed: string, facts: readonly string[]): string {
  if (facts.length === 0) return "";
  return facts[hashPick(seed, facts.length)]!;
}
