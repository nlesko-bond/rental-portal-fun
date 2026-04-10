/**
 * Resolves which picked slot keys an add-on applies to, given optional UI targeting.
 * Must stay aligned with {@link splitAddonPayloadForCreate} in `online-booking-create-body.ts`.
 */
export type AddonSlotTargetingSpec = { all: boolean; keys: string[] };

export function getEffectiveAddonSlotKeys(
  spec: AddonSlotTargetingSpec | undefined,
  allSlotKeys: ReadonlySet<string>
): Set<string> {
  // UI sets `{ all: true }` in an effect after toggle; one render can omit targeting — default to all picked slots.
  if (!spec) return new Set(allSlotKeys);
  if (spec.all) return new Set(allSlotKeys);
  return new Set(spec.keys.filter((k) => allSlotKeys.has(k)));
}
