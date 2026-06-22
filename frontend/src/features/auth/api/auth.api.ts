import { apiClient } from "@/config/axios";
import type { ApiResponse, Session } from "@/types";
import type { LoginPayload, RegisterTenantPayload } from "../types";

/**
 * All auth endpoints rely entirely on the HttpOnly cookie the backend sets
 * on a successful login/register response — no token is ever read from or
 * written to the response body on the client.
 */

export async function loginRequest(payload: LoginPayload): Promise<Session> {
  const { data } = await apiClient.post<ApiResponse<Session>>("/auth/login", payload);
  return data.data;
}

export async function registerTenantRequest(payload: RegisterTenantPayload): Promise<Session> {
  const { data } = await apiClient.post<ApiResponse<Session>>(
    "/auth/register-tenant",
    payload,
  );
  return data.data;
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post("/auth/logout");
}

/** Resolves the current session from the HttpOnly cookie. 401 here just
 * means "not logged in" — callers should treat it as a normal, expected
 * outcome rather than an error to surface. */
export async function fetchSessionRequest(): Promise<Session> {
  const { data } = await apiClient.get<ApiResponse<Session>>("/auth/me");
  return data.data;
}
