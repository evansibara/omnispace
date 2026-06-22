import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiError } from "@/types";

/**
 * Single Axios instance for the whole app.
 *
 * Security model:
 * - The backend issues the session JWT inside an HttpOnly cookie. JavaScript
 *   never sees the token, so it is never stored in localStorage/sessionStorage
 *   and cannot be exfiltrated via XSS.
 * - `withCredentials: true` is mandatory on every request so the cookie is
 *   attached automatically by the browser.
 * - On a 401, we clear local auth state and bounce to /login. We do NOT try
 *   to "fix" the request and retry, because there is no refresh token in
 *   JS-land to refresh with — the cookie itself is the source of truth.
 */

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1";

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

/** Set by `bootstrapAxiosAuthHandling` so the interceptor can clear Zustand
 * auth state without creating a circular import between `config/` and `store/`. */
let onUnauthorized: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // withCredentials is set at the instance level above, but we assert it
  // here too in case any call site overrides config — this must never be
  // silently dropped to false.
  config.withCredentials = true;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const status = error.response?.status;

    if (status === 401) {
      onUnauthorized?.();
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    const normalized: ApiError = error.response?.data ?? {
      success: false,
      message: error.message || "Network error. Please try again.",
      statusCode: status ?? 0,
    };

    return Promise.reject(normalized);
  },
);
