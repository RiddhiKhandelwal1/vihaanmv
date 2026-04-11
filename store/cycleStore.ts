import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CycleRecord, CycleEngine, CyclePrediction } from '@/lib/cycleEngine';
import { useLogStore } from './logStore';
import { format, subDays } from 'date-fns';

interface CycleState {
    cycles: CycleRecord[];
    addCycle: (cycle: CycleRecord) => void;
    updateCycle: (id: string, data: Partial<CycleRecord>) => void;
    removeCycle: (id: string) => void;
    getPrediction: () => CyclePrediction;
    initializeWithDefaults: (lastPeriodDate: string, cycleLength: number, periodLength: number) => void;
}

export const useCycleStore = create<CycleState>()(
    persist(
        (set, get) => ({
            cycles: [],
            addCycle: (cycle) =>
                set((state) => ({
                    cycles: [...state.cycles, cycle],
                })),
            updateCycle: (id, data) =>
                set((state) => ({
                    cycles: state.cycles.map((c) =>
                        c.id === id ? { ...c, ...data } : c
                    ),
                })),
            removeCycle: (id) =>
                set((state) => ({
                    cycles: state.cycles.filter((c) => c.id !== id),
                })),
            getPrediction: () => {
                const { cycles } = get();
                const logs = useLogStore.getState().logs;
                return CycleEngine.predict(cycles, logs);
            },
            initializeWithDefaults: (lastPeriodDate, cycleLength, periodLength) => {
                const cycles: CycleRecord[] = [];
                let currentStart = new Date(lastPeriodDate);

                // Create 3 mock past cycles for initial data
                for (let i = 2; i >= 0; i--) {
                    const startDate = subDays(currentStart, i * cycleLength);
                    cycles.push({
                        id: `init-${i}`,
                        startDate: format(startDate, 'yyyy-MM-dd'),
                        endDate: format(subDays(startDate, -(periodLength - 1)), 'yyyy-MM-dd'),
                        length: cycleLength,
                        periodLength: periodLength,
                        notes: '',
                    });
                }

                set({ cycles });
            },
        }),
        {
            name: 'flow-cycle-store',
        }
    )
);
