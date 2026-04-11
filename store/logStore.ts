import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DailyLog, FlowLevel } from '@/lib/cycleEngine';
import { format } from 'date-fns';

interface LogState {
    logs: DailyLog[];
    addLog: (log: DailyLog) => void;
    updateLog: (id: string, data: Partial<DailyLog>) => void;
    removeLog: (id: string) => void;
    getLogForDate: (date: string) => DailyLog | undefined;
    getTodayLog: () => DailyLog | undefined;
    getRecentLogs: (days: number) => DailyLog[];
    getLastMood: () => string | null;
    getLastEnergy: () => number | null;
}

export const useLogStore = create<LogState>()(
    persist(
        (set, get) => ({
            logs: [],
            addLog: (log) =>
                set((state) => {
                    // Replace if same date exists
                    const filtered = state.logs.filter((l) => l.date !== log.date);
                    return { logs: [...filtered, log].sort((a, b) => a.date.localeCompare(b.date)) };
                }),
            updateLog: (id, data) =>
                set((state) => ({
                    logs: state.logs.map((l) =>
                        l.id === id ? { ...l, ...data } : l
                    ),
                })),
            removeLog: (id) =>
                set((state) => ({
                    logs: state.logs.filter((l) => l.id !== id),
                })),
            getLogForDate: (date) => {
                return get().logs.find((l) => l.date === date);
            },
            getTodayLog: () => {
                const today = format(new Date(), 'yyyy-MM-dd');
                return get().logs.find((l) => l.date === today);
            },
            getRecentLogs: (days) => {
                const logs = get().logs;
                return logs.slice(-days);
            },
            getLastMood: () => {
                const logs = get().logs;
                for (let i = logs.length - 1; i >= 0; i--) {
                    if (logs[i].mood) return logs[i].mood;
                }
                return null;
            },
            getLastEnergy: () => {
                const logs = get().logs;
                for (let i = logs.length - 1; i >= 0; i--) {
                    if (logs[i].energy) return logs[i].energy;
                }
                return null;
            },
        }),
        {
            name: 'flow-log-store',
        }
    )
);
