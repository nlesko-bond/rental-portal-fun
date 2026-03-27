/** Normalize Bond questionnaire question payloads (public + checkout APIs). */

export type QuestionFieldKind =
  | "text"
  | "textarea"
  | "email"
  | "tel"
  | "address"
  | "date"
  | "number"
  | "boolean"
  | "yesno"
  | "select"
  | "multiselect"
  | "waiver"
  | "file";

export type NormalizedQuestionOption = { value: string; label: string };

export type NormalizedQuestion = {
  id: number;
  label: string;
  mandatory: boolean;
  kind: QuestionFieldKind;
  options: NormalizedQuestionOption[];
  ordinal: number;
  /** Rich HTML for waiver / customWaiver (sanitize before render) */
  htmlContent?: string;
  maxLength?: number;
  numericMin?: number;
  numericMax?: number;
};

function numId(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && /^\d+$/.test(v)) return Number(v);
  return null;
}

function numOpt(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return undefined;
}

function readMetadata(q: Record<string, unknown>): Record<string, unknown> {
  const m = q.metadata;
  if (m && typeof m === "object") return m as Record<string, unknown>;
  return {};
}

function parseSelectOptionsFromMetadata(meta: Record<string, unknown>): NormalizedQuestionOption[] {
  const raw = meta.selectOptions;
  if (!Array.isArray(raw)) return [];
  const out: NormalizedQuestionOption[] = [];
  for (const o of raw) {
    if (o && typeof o === "object") {
      const t = (o as Record<string, unknown>).text;
      if (typeof t === "string" && t.length > 0) {
        out.push({ value: t, label: t });
      }
    }
  }
  return out;
}

function parseOptionsLegacy(raw: unknown): NormalizedQuestionOption[] {
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
    (typeof q.question === "string" && q.question.trim().length > 0 && q.question) ||
    (typeof q.text === "string" && q.text) ||
    (typeof q.label === "string" && q.label) ||
    (typeof q.title === "string" && q.title) ||
    (typeof q.name === "string" && q.name) ||
    `Question ${id}`;

  const mandatory = Boolean(
    q.isMandatory === true || q.mandatory === true || q.required === true || q.isRequired === true
  );

  const ordinal = typeof q.ordinal === "number" && Number.isFinite(q.ordinal) ? q.ordinal : 0;
  const meta = readMetadata(q);
  const customType = typeof meta.customType === "string" ? meta.customType.toLowerCase() : "";

  const qtRaw = String(q.questionType ?? q.type ?? q.inputType ?? q.fieldType ?? q.answerType ?? "").trim();
  const qt = qtRaw.toLowerCase();

  let kind: QuestionFieldKind = "text";
  let options: NormalizedQuestionOption[] = [];
  let htmlContent: string | undefined;
  let maxLength: number | undefined;
  let numericMin: number | undefined;
  let numericMax: number | undefined;

  if (qt === "emailaddress" || qt === "email") {
    kind = "email";
  } else if (qt === "phonenumber" || qt === "phone" || qt === "tel") {
    kind = "tel";
  } else if (qt === "address") {
    kind = "address";
  } else if (qt === "birthdate" || qt === "date") {
    kind = "date";
  } else if (qt === "customwaiver") {
    kind = "waiver";
    const html = meta.text;
    htmlContent = typeof html === "string" ? html : undefined;
  } else if (qt === "waiver") {
    kind = "waiver";
  } else if (qt === "other") {
    if (customType === "yesno") {
      kind = "yesno";
    } else if (customType === "multiplechoices") {
      kind = "multiselect";
      options = parseSelectOptionsFromMetadata(meta);
    } else if (customType === "singlechoice") {
      kind = "select";
      options = parseSelectOptionsFromMetadata(meta);
    } else if (customType === "fileupload" || customType === "file") {
      kind = "file";
    } else if (customType === "numeric") {
      kind = "number";
      numericMin = numOpt(meta.numericFrom);
      numericMax = numOpt(meta.numericTo);
    } else if (customType === "text") {
      kind = "text";
      const ml = meta.maxLength;
      if (typeof ml === "number" && Number.isFinite(ml)) maxLength = ml;
    } else {
      kind = "text";
    }
  } else if (qt.includes("multi") && (qt.includes("select") || qt.includes("choice"))) {
    kind = "multiselect";
    options = parseOptionsLegacy(q.options ?? q.answerOptions ?? meta.selectOptions);
  } else if (qt.includes("select") || qt.includes("dropdown") || qt.includes("choice")) {
    kind = "select";
    options = parseOptionsLegacy(q.options ?? q.answerOptions ?? meta.selectOptions);
  } else if (qt.includes("date") || qt.includes("calendar") || qt.includes("birth")) {
    kind = "date";
  } else if (qt.includes("bool") || (qt.includes("checkbox") && !qt.includes("multi"))) {
    kind = "boolean";
  } else if (qt.includes("number") || qt.includes("numeric") || qt.includes("int")) {
    kind = "number";
  }

  if (options.length === 0) {
    options = parseOptionsLegacy(q.options ?? q.answerOptions ?? q.choices ?? q.values);
  }

  if (kind === "text" && options.length > 0) {
    kind = "select";
  }

  return {
    id,
    label,
    mandatory,
    kind,
    options,
    ordinal,
    htmlContent,
    maxLength,
    numericMin,
    numericMax,
  };
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
    if (!prev) {
      byId.set(id, { ...r });
      continue;
    }
    const merged = { ...prev, ...r } as Record<string, unknown>;
    if (typeof merged.question !== "string" && typeof prev.question === "string") {
      merged.question = prev.question;
    }
    const pm = prev.metadata;
    const rm = r.metadata;
    if (pm && typeof pm === "object" && rm && typeof rm === "object") {
      merged.metadata = { ...pm, ...rm };
    } else if (merged.metadata == null && pm != null) {
      merged.metadata = pm;
    }
    byId.set(id, merged);
  }
  const ids = [...byId.keys()].sort((a, b) => a - b);
  const out: NormalizedQuestion[] = [];
  for (const id of ids) {
    const n = normalizeQuestion(byId.get(id));
    if (n) out.push(n);
  }
  out.sort((a, b) => a.ordinal - b.ordinal || a.id - b.id);
  void questionnaireId;
  return out;
}
