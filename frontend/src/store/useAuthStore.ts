import { create } from "zustand";
import type { Tenant, User } from "@/types";

/**
 * Auth store holds only the *current session snapshot* the UI needs
 * synchronously (for guards, sidebar, role checks). It is NOT the source
 * of truth for "is the session valid" — that's whatever `/auth/me`
 * returns via TanStack Query (see `features/auth/hooks/useSession.ts`).
 * Treat this as a cache the query layer writes into, not the other way
 * around — keeps server-state and client-state cleanly separated per NFR-3.
 */
interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  setSession: (user: User, tenant: Tenant) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tenant: null,
  isAuthenticated: false,
  setSession: (user, tenant) =>
    set({ user, tenant, isAuthenticated: true }),
  clearSession: () => set({ user: null, tenant: null, isAuthenticated: false }),
}));
