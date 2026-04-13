import type { NormalizedQuestionOption } from "@/lib/questionnaire-parse";

/** Map Bond profile gender to a select option value when labels overlap. */
export function matchGenderToSelectValue(
  profileGender: string,
  options: NormalizedQuestionOption[]
): string | null {
  if (!profileGender.trim() || options.length === 0) return null;
  const pg = profileGender.trim().toLowerCase();
  for (const o of options) {
    const val = o.value.trim().toLowerCase();
    const lab = o.label.trim().toLowerCase();
    if (val === pg || lab === pg) return o.value;
  }
  for (const o of options) {
    const val = o.value.trim().toLowerCase();
    const lab = o.label.trim().toLowerCase();
    if (pg === "male" && (lab.includes("male") || val.includes("male")) && !lab.includes("female")) {
      return o.value;
    }
    if (pg === "female" && (lab.includes("female") || val.includes("female"))) {
      return o.value;
    }
    if (pg === "other" && (lab.includes("other") || val.includes("other"))) {
      return o.value;
    }
  }
  return null;
}

export function labelSuggestsGender(label: string): boolean {
  return /\bgender\b/i.test(label);
}

/** Display `YYYY-MM-DD` as a short local date for UI copy. */
export function formatProfileDateYmd(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso;
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
