/** Normalize Bond / public questionnaire question payloads (shapes vary by version). */

export type QuestionFieldKind = "text" | "date" | "number" | "boolean" | "select" | "multiselect";

export type NormalizedQuestionOption = { value: string; label: string };

export type NormalizedQuestion = {
  id: number;
  label: string;
  mandatory: boolean;
  kind: QuestionFieldKind;
  options: NormalizedQuestionOption[];
};

function numId(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && /^\d+$/.test(v)) return Number(v);
  return null;
}

function parseOptions(raw: unknown): NormalizedQuestionOption[] {
  if (!Array.isArray(raw)) return [];
  const out: NormalizedQuestionOption[] = [];
  for (const o of raw) {
    if (typeof o === "string") {
      out.push({ value: o, label: o });
      continue;
    }
    if (o && typeof o === "object") {
      const r = o as Record<string, unknown>;
      const val =
        typeof r.value === "string"
          ? r.value
          : typeof r.id === "number" || typeof r.id === "string"
            ? String(r.id)
            : typeof r.key === "string"
              ? r.key
              : null;
      const lab =
        typeof r.label === "string"
          ? r.label
          : typeof r.name === "string"
            ? r.name
            : typeof r.text === "string"
              ? r.text
              : val;
      if (val != null && lab != null) out.push({ value: val, label: lab });
    }
  }
  return out;
}

export function normalizeQuestion(raw: unknown): NormalizedQuestion | null {
  if (!raw || typeof raw !== "object") return null;
  const q = raw as Record<string, unknown>;
  const id = numId(q.id);
  if (id == null) return null;
  const label =
    (typeof q.text === "string" && q.text) ||
    (typeof q.label === "string" && q.label) ||
    (typeof q.title === "string" && q.title) ||
    (typeof q.name === "string" && q.name) ||
    `Question ${id}`;
  const mandatory = Boolean(
    q.isMandatory === true || q.mandatory === true || q.required === true || q.isRequired === true
  );
  const rawType = String(
    q.questionType ?? q.type ?? q.inputType ?? q.fieldType ?? q.answerType ?? ""
  ).toLowerCase();
  const options = parseOptions(q.options ?? q.answerOptions ?? q.choices ?? q.values);

  let kind: QuestionFieldKind = "text";
  if (rawType.includes("multi") && (rawType.includes("select") || rawType.includes("choice"))) {
    kind = "multiselect";
  } else if (rawType.includes("select") || rawType.includes("dropdown") || rawType.includes("choice")) {
    kind = "select";
  } else if (rawType.includes("date") || rawType.includes("calendar")) {
    kind = "date";
  } else if (rawType.includes("bool") || (rawType.includes("checkbox") && !rawType.includes("multi"))) {
    kind = "boolean";
  } else if (rawType.includes("number") || rawType.includes("numeric") || rawType.includes("int")) {
    kind = "number";
  } else if (options.length > 0 && kind === "text") {
    kind = "select";
  }

  return { id, label, mandatory, kind, options };
}

export function mergeQuestionnaireQuestions(
  questionnaireId: number,
  checkoutRow: Record<string, unknown> | undefined,
  publicRow: Record<string, unknown> | undefined
): NormalizedQuestion[] {
  const checkoutQs = checkoutRow && Array.isArray(checkoutRow.questions) ? checkoutRow.questions : [];
  const publicQs = publicRow && Array.isArray(publicRow.questions) ? publicRow.questions : [];
  const byId = new Map<number, Record<string, unknown>>();
  for (const raw of publicQs) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const id = numId(r.id);
    if (id == null) continue;
    byId.set(id, { ...r });
  }
  for (const raw of checkoutQs) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const id = numId(r.id);
    if (id == null) continue;
    const prev = byId.get(id);
    byId.set(id, prev ? { ...prev, ...r } : { ...r });
  }
  const ids = [...byId.keys()].sort((a, b) => a - b);
  const out: NormalizedQuestion[] = [];
  for (const id of ids) {
    const n = normalizeQuestion(byId.get(id));
    if (n) out.push(n);
  }
  void questionnaireId;
  return out;
}
