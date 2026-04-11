import { create } from 'zustand';

interface UIState {
    isLogDialogOpen: boolean;
    logStep: number;
    selectedDate: string | null;
    isSidebarCollapsed: boolean;
    setLogDialogOpen: (open: boolean) => void;
    setLogStep: (step: number) => void;
    setSelectedDate: (date: string | null) => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    openLogAtStep: (step: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
    isLogDialogOpen: false,
    logStep: 0,
    selectedDate: null,
    isSidebarCollapsed: false,
    setLogDialogOpen: (open) => set({ isLogDialogOpen: open }),
    setLogStep: (step) => set({ logStep: step }),
    setSelectedDate: (date) => set({ selectedDate: date }),
    setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
    openLogAtStep: (step) => set({ isLogDialogOpen: true, logStep: step }),
}));
