"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  formHasOnlyOptionalQuestions,
  isFormQuestionsSatisfied,
  type NormalizedQuestion,
} from "@/lib/questionnaire-parse";
import { CheckoutQuestionField } from "./CheckoutQuestionField";

export type MergedQuestionnaireForm = {
  qid: number;
  title: string;
  questions: NormalizedQuestion[];
  /** From checkout API `PublicCheckoutQuestionnaireDto.isWaiver` or any waiver question */
  isWaiverForm?: boolean;
};

type Props = {
  mergedForms: MergedQuestionnaireForm[];
  answers: Record<string, string>;
  onAnswerChange: (key: string, value: string) => void;
  loading: boolean;
  showPrefillHint: (q: NormalizedQuestion, value: string) => boolean;
  /** Formatted display date when profile has `waiverSignedDate` (waiver fields + panel status) */
  profileWaiverDisplay?: string;
};

function Chevron({ open }: { open: boolean }) {
  return (
    <span
      className={`cb-q-panel-chevron${open ? " cb-q-panel-chevron--open" : ""}`}
      aria-hidden
    >
      ▾
    </span>
  );
}

function PanelGlyph({ variant }: { variant: "check" | "doc" | "user" }) {
  if (variant === "check") {
    return (
      <svg className="cb-q-panel-glyph-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M20 6 9 17l-5-5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (variant === "doc") {
    return (
      <svg className="cb-q-panel-glyph-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M14 2v6h6M8 13h8M8 17h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg className="cb-q-panel-glyph-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5 20.5v-1.2c0-3 2.5-5.3 7-5.3s7 2.3 7 5.3v1.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CheckoutQuestionnairePanels({
  mergedForms,
  answers,
  onAnswerChange,
  loading,
  showPrefillHint,
  profileWaiverDisplay,
}: Props) {
  const [expandedQid, setExpandedQid] = useState<number | null>(null);
  const didInit = useRef(false);

  const completedCount = useMemo(
    () =>
      mergedForms.filter((f) => isFormQuestionsSatisfied(f.questions, answers, f.qid)).length,
    [mergedForms, answers]
  );

  const totalForms = mergedForms.length;

  useEffect(() => {
    if (loading || mergedForms.length === 0) return;
    if (didInit.current) return;
    didInit.current = true;
    const firstIncomplete = mergedForms.find(
      (f) => !isFormQuestionsSatisfied(f.questions, answers, f.qid)
    );
    setExpandedQid(firstIncomplete?.qid ?? mergedForms[0]!.qid);
  }, [loading, mergedForms, answers]);

  const toggle = useCallback((qid: number) => {
    setExpandedQid((prev) => (prev === qid ? null : qid));
  }, []);

  if (loading) {
    return <p className="cb-muted text-sm">Loading forms…</p>;
  }

  return (
    <div className="cb-q-panels">
      <div className="cb-q-panels-toolbar">
        <h3 className="cb-q-panels-toolbar-title">Forms & documents</h3>
        <span
          className={`cb-q-panels-count-pill${completedCount === totalForms ? " cb-q-panels-count-pill--done" : ""}`}
        >
          {completedCount} of {totalForms} done
        </span>
      </div>

      <ul className="cb-q-panels-list">
        {mergedForms.map((form) => {
          const complete = isFormQuestionsSatisfied(form.questions, answers, form.qid);
          const open = expandedQid === form.qid;
          const hasWaiverOnlyQ = form.questions.some((q) => q.kind === "waiver");
          const allOptional = formHasOnlyOptionalQuestions(form.questions);
          const showDocIcon =
            form.isWaiverForm || form.questions.some((q) => q.kind === "waiver" || q.kind === "terms");

          let statusLine: string;
          let statusTone: "ok" | "warn" | "muted" | "optional" = "muted";
          if (complete) {
            if (allOptional) {
              statusLine = "Optional";
              statusTone = "optional";
            } else if (hasWaiverOnlyQ && profileWaiverDisplay) {
              statusLine = `Signed ${profileWaiverDisplay}`;
              statusTone = "ok";
            } else {
              statusLine = "Complete";
              statusTone = "ok";
            }
          } else {
            statusLine = "Needs answers";
            statusTone = "warn";
          }

          const glyph = complete ? "check" : showDocIcon ? "doc" : "user";
          const panelDoneClass =
            complete && allOptional ? " cb-q-panel--optional" : complete ? " cb-q-panel--complete" : "";

          return (
            <li
              key={form.qid}
              className={`cb-q-panel${panelDoneClass}${open ? " cb-q-panel--open" : ""}`}
            >
              <button
                type="button"
                className="cb-q-panel-head flex w-full min-w-0 items-start gap-3 text-left"
                aria-expanded={open}
                onClick={() => toggle(form.qid)}
              >
                <span className="cb-q-panel-head-icons shrink-0" aria-hidden>
                  <span
                    className={`cb-q-panel-icon cb-q-panel-icon--${
                      complete && allOptional ? "opt" : complete ? "ok" : showDocIcon ? "doc" : "user"
                    }`}
                  >
                    <PanelGlyph variant={glyph} />
                  </span>
                </span>
                <span className="cb-q-panel-head-text flex min-w-0 flex-1 flex-col gap-1">
                  <span className="cb-q-panel-title block">{form.title}</span>
                  <span className={`cb-q-panel-status block cb-q-panel-status--${statusTone}`}>
                    {statusLine}
                  </span>
                </span>
                <Chevron open={open} />
              </button>

              {open ? (
                <div className="cb-q-panel-body cb-checkout-form-block cb-checkout-form-block--flat">
                  {form.questions.map((q) => {
                    const key = `${form.qid}:${q.id}`;
                    const val = answers[key] ?? "";
                    return (
                      <CheckoutQuestionField
                        key={key}
                        q={q}
                        namePrefix={`q-${form.qid}`}
                        value={val}
                        prefilledHint={showPrefillHint(q, val)}
                        profileWaiverSignedDate={
                          q.kind === "waiver" && profileWaiverDisplay ? profileWaiverDisplay : undefined
                        }
                        onChange={(v) => onAnswerChange(key, v)}
                      />
                    );
                  })}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
