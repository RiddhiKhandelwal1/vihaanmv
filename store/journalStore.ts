import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface JournalEntry {
    id: string;
    date: string; // ISO string
    duration: number; // seconds
    feelingTags: string[];
    moodBefore: number; // 1–5
    moodAfter: number | null; // 1–5, set at end of session
    messages: { role: 'user' | 'assistant'; content: string }[];
}

interface JournalState {
    entries: JournalEntry[];
    addEntry: (entry: JournalEntry) => void;
    updateEntry: (id: string, data: Partial<JournalEntry>) => void;
    getRecentEntries: (count?: number) => JournalEntry[];
}

export const useJournalStore = create<JournalState>()(
    persist(
        (set, get) => ({
            entries: [],

            addEntry: (entry) =>
                set((state) => ({
                    entries: [entry, ...state.entries],
                })),

            updateEntry: (id, data) =>
                set((state) => ({
                    entries: state.entries.map((e) =>
                        e.id === id ? { ...e, ...data } : e
                    ),
                })),

            getRecentEntries: (count = 5) => {
                return get().entries.slice(0, count);
            },
        }),
        {
            name: 'flow-journal-store',
        }
    )
);
