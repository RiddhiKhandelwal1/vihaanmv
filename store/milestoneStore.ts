import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MilestoneState {
    unlockedMilestones: Record<string, string>; // id -> ISO date
    newlyEarnedMilestoneId: string | null;
    appOpenCount: number;
    incrementAppOpen: () => void;
    unlockMilestone: (id: string) => void;
    clearNewlyEarned: () => void;
}

export const useMilestoneStore = create<MilestoneState>()(
    persist(
        (set, get) => ({
            unlockedMilestones: {},
            newlyEarnedMilestoneId: null,
            appOpenCount: 0,
            incrementAppOpen: () => {
                set((state) => ({ appOpenCount: state.appOpenCount + 1 }));
                // We'll check milestones right after incrementing in the layout or engine
            },
            unlockMilestone: (id) => {
                const { unlockedMilestones } = get();
                if (!unlockedMilestones[id]) {
                    set({
                        unlockedMilestones: { ...unlockedMilestones, [id]: new Date().toISOString() },
                        newlyEarnedMilestoneId: id
                    });
                }
            },
            clearNewlyEarned: () => set({ newlyEarnedMilestoneId: null })
        }),
        {
            name: 'flow-milestone-store'
        }
    )
);
