import { format, subDays, addDays } from 'date-fns';
import { DailyLog, CycleRecord, FlowLevel } from './cycleEngine';

const SYMPTOM_POOLS = {
    menstrual: ['Cramps', 'Fatigue', 'Bloating', 'Back pain', 'Headache'],
    follicular: ['Discharge', 'Acne', 'Food cravings'],
    ovulatory: ['Breast tenderness', 'Discharge'],
    luteal: ['Mood swings', 'Bloating', 'Food cravings', 'Anxiety', 'Fatigue', 'Insomnia'],
};

const MOOD_POOLS = {
    menstrual: ['Exhausted', 'Sad', 'Irritable', 'Calm'],
    follicular: ['Happy', 'Energised', 'Confident', 'Grateful'],
    ovulatory: ['Confident', 'Happy', 'Romantic', 'Energised'],
    luteal: ['Anxious', 'Overwhelmed', 'Irritable', 'Foggy', 'Calm'],
};

const ENERGY_BY_PHASE = {
    menstrual: [3, 4, 3, 2, 4],
    follicular: [5, 6, 7, 7, 8, 6, 7],
    ovulatory: [8, 9, 8, 7],
    luteal: [7, 6, 6, 5, 5, 4, 4, 3, 4, 3, 3, 2],
};

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function pickMultiple<T>(arr: T[], min = 0, max = 2): T[] {
    const count = min + Math.floor(Math.random() * (max - min + 1));
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

export interface DemoDataParams {
    cycleLengths?: number[];
    periodLengths?: number[];
    dayIntoCurrent?: number; // how many days into the current cycle
}

export function generateDemoData(params?: DemoDataParams): {
    cycles: CycleRecord[];
    logs: DailyLog[];
} {
    const cycleLengths = params?.cycleLengths ?? [26, 28, 27, 29, 28, 27];
    const periodLengths = params?.periodLengths ?? [5, 4, 5, 6, 5, 4];
    const dayIntoCurrent = params?.dayIntoCurrent ?? 8;

    const cycles: CycleRecord[] = [];
    const logs: DailyLog[] = [];

    // Total days of completed cycles
    const totalPastDays = cycleLengths.reduce((a, b) => a + b, 0);

    // The start of the very first cycle
    const firstCycleStart = subDays(new Date(), totalPastDays + dayIntoCurrent);

    let runningStart = firstCycleStart;

    for (let i = 0; i < cycleLengths.length; i++) {
        const startDate = runningStart;
        const endDate = addDays(startDate, periodLengths[i] - 1);

        cycles.push({
            id: `demo-cycle-${i}`,
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd'),
            length: cycleLengths[i],
            periodLength: periodLengths[i],
            notes: '',
        });

        // Generate daily logs for this cycle
        for (let day = 0; day < cycleLengths[i]; day++) {
            const logDate = addDays(startDate, day);

            // Don't create logs for future dates
            if (logDate > new Date()) continue;

            // Skip ~20% of days (realistic — people don't log every day)
            if (Math.random() < 0.2) continue;

            // Determine phase for this day
            let phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
            let flow: FlowLevel = 0;

            if (day < periodLengths[i]) {
                phase = 'menstrual';
                if (day === 0) flow = 2;
                else if (day === 1) flow = 3;
                else if (day === 2) flow = 4;
                else if (day === 3) flow = 3;
                else flow = 1;
            } else if (day < cycleLengths[i] - 16) {
                phase = 'follicular';
            } else if (day < cycleLengths[i] - 12) {
                phase = 'ovulatory';
            } else {
                phase = 'luteal';
            }

            const energyPool = ENERGY_BY_PHASE[phase];
            const moodPool = MOOD_POOLS[phase];
            const symptomPool = SYMPTOM_POOLS[phase];
            const symptoms = Math.random() < 0.6 ? pickMultiple(symptomPool, 0, 2) : [];

            const noteOptions = [
                '', '', '', '',
                'Feeling more tired than usual today.',
                'Had a good workout this morning.',
                'Stress from work today.',
                'Slept really well last night.',
                'Headache since afternoon.',
                'Feeling bloated after dinner.',
            ];

            logs.push({
                id: `demo-log-${format(logDate, 'yyyyMMdd')}`,
                date: format(logDate, 'yyyy-MM-dd'),
                flow: flow as FlowLevel,
                symptoms,
                mood: pick(moodPool),
                energy: pick(energyPool),
                note: pick(noteOptions),
                createdAt: logDate.toISOString(),
            });
        }

        runningStart = addDays(startDate, cycleLengths[i]);
    }

    // Also generate logs for the current (incomplete) cycle
    const currentCycleStart = runningStart;
    const currentPeriodLength = periodLengths[0]; // reuse first

    cycles.push({
        id: `demo-cycle-current`,
        startDate: format(currentCycleStart, 'yyyy-MM-dd'),
        endDate: format(addDays(currentCycleStart, currentPeriodLength - 1), 'yyyy-MM-dd'),
        length: null, // ongoing
        periodLength: currentPeriodLength,
        notes: '',
    });

    for (let day = 0; day < dayIntoCurrent; day++) {
        const logDate = addDays(currentCycleStart, day);
        if (logDate > new Date()) continue;
        if (Math.random() < 0.15) continue;

        let phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
        let flow: FlowLevel = 0;

        if (day < currentPeriodLength) {
            phase = 'menstrual';
            if (day === 0) flow = 2;
            else if (day === 1) flow = 3;
            else if (day === 2) flow = 4;
            else if (day === 3) flow = 3;
            else flow = 1;
        } else {
            phase = 'follicular';
        }

        const energyPool = ENERGY_BY_PHASE[phase];
        const moodPool = MOOD_POOLS[phase];
        const symptomPool = SYMPTOM_POOLS[phase];
        const symptoms = Math.random() < 0.6 ? pickMultiple(symptomPool, 0, 2) : [];

        logs.push({
            id: `demo-log-cur-${format(logDate, 'yyyyMMdd')}`,
            date: format(logDate, 'yyyy-MM-dd'),
            flow: flow as FlowLevel,
            symptoms,
            mood: pick(moodPool),
            energy: pick(energyPool),
            note: '',
            createdAt: logDate.toISOString(),
        });
    }

    return {
        cycles: cycles.sort((a, b) => a.startDate.localeCompare(b.startDate)),
        logs: logs.sort((a, b) => a.date.localeCompare(b.date)),
    };
}
