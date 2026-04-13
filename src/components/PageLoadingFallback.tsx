"use client";

import { useTranslations } from "next-intl";

export function PageLoadingFallback() {
  const t = useTranslations("common");
  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-16" aria-busy="true">
      <p className="text-zinc-600 dark:text-zinc-400">{t("loading")}</p>
    </main>
  );
}
