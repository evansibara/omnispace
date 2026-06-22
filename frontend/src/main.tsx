import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./index.css";
import App from "./App.tsx";
import { queryClient } from "./config/query-client";
import { registerUnauthorizedHandler } from "./config/axios";
import { useAuthStore } from "./store/useAuthStore";

// Wire the Axios 401 interceptor to clear Zustand auth state without a
// circular import between config/ and store/.
registerUnauthorizedHandler(() => useAuthStore.getState().clearSession());

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element '#root' was not found in index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>,
);
