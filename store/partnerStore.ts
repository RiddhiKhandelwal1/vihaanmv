import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Companion {
    id: string;
    name: string;
    email: string;
    notifications: string[];
    createdAt: string;
}

interface CompanionState {
    companions: Companion[];
    addCompanion: (name: string, email: string) => string;
    removeCompanion: (id: string) => void;
    updateCompanion: (id: string, data: Partial<Companion>) => void;
    toggleNotification: (companionId: string, notifId: string) => void;
}

export const useCompanionStore = create<CompanionState>()(
    persist(
        (set) => ({
            companions: [],

            addCompanion: (name, email) => {
                const id = `comp-${Date.now()}`;
                set((state) => ({
                    companions: [
                        ...state.companions,
                        {
                            id,
                            name,
                            email,
                            notifications: [],
                            createdAt: new Date().toISOString(),
                        },
                    ],
                }));
                return id;
            },

            removeCompanion: (id) =>
                set((state) => ({
                    companions: state.companions.filter((c) => c.id !== id),
                })),

            updateCompanion: (id, data) =>
                set((state) => ({
                    companions: state.companions.map((c) =>
                        c.id === id ? { ...c, ...data } : c
                    ),
                })),

            toggleNotification: (companionId, notifId) =>
                set((state) => ({
                    companions: state.companions.map((c) =>
                        c.id === companionId
                            ? {
                                ...c,
                                notifications: c.notifications.includes(notifId)
                                    ? c.notifications.filter((n) => n !== notifId)
                                    : [...c.notifications, notifId],
                            }
                            : c
                    ),
                })),
        }),
        {
            name: 'flow-companion-store',
        }
    )
);
