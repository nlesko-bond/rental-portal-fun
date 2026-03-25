import { Suspense } from "react";
import { BookingExperience } from "@/components/booking/BookingExperience";

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-5xl flex-1 px-6 py-16" aria-busy="true">
          <p className="text-zinc-600 dark:text-zinc-400">Loading…</p>
        </main>
      }
    >
      <BookingExperience />
    </Suspense>
  );
}
