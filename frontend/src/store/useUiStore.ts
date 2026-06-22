import { create } from "zustand";

/** Pure client/UI state — never anything that comes from the server. */
interface UiState {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  activeProjectModal: "create" | null;
  openProjectModal: (modal: "create") => void;
  closeProjectModal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  activeProjectModal: null,
  openProjectModal: (modal) => set({ activeProjectModal: modal }),
  closeProjectModal: () => set({ activeProjectModal: null }),
}));
