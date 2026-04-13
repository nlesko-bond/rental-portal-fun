import { Suspense } from "react";
import { BookingExperience } from "@/components/booking/BookingExperience";
import { PageLoadingFallback } from "@/components/PageLoadingFallback";

export default function Home() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <BookingExperience />
    </Suspense>
  );
}
