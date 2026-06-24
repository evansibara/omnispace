import { Suspense } from "react";
import { FullScreenSpinner } from "@/components/feedback/full-screen-spinner";

export function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<FullScreenSpinner />}>{element}</Suspense>;
}