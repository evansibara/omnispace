import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { router } from "./routes/router";
import { ErrorBoundary } from "@/components/feedback/error-boundary";

export default function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors closeButton />
    </ErrorBoundary>
  );
}
