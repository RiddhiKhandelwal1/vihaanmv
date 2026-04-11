import { generateDemoData } from './demoData';
import { CycleRecord, DailyLog } from './cycleEngine';

export interface DemoProfile {
    id: string;
    name: string;
    avatar: string; // first letter
    cycleLength: number;
    periodLength: number;
    conditions: string[];
    goals: string[];
    hasPcos: boolean;
    hasEndometriosis: boolean;
    isIrregular: boolean;
    tagline: string;
    color: string; // gradient start
    colorEnd: string; // gradient end
}

export const DEMO_PROFILES: DemoProfile[] = [
    {
        id: 'priya',
        name: 'Priya',
        avatar: 'P',
        cycleLength: 27,
        periodLength: 5,
        conditions: [],
        goals: ['Track my period', 'General health'],
        hasPcos: false,
        hasEndometriosis: false,
        isIrregular: false,
        tagline: '27-day cycle · Regular',
        color: '#E8A598',
        colorEnd: '#F2C4CE',
    },
    {
        id: 'ananya',
        name: 'Ananya',
        avatar: 'A',
        cycleLength: 32,
        periodLength: 6,
        conditions: ['PCOS', 'Irregular cycles'],
        goals: ['Manage PMS', 'Understand mood patterns'],
        hasPcos: true,
        hasEndometriosis: false,
        isIrregular: true,
        tagline: '32-day cycle · PCOS',
        color: '#C9B8D8',
        colorEnd: '#E0D5EB',
    },
    {
        id: 'meera',
        name: 'Meera',
        avatar: 'M',
        cycleLength: 25,
        periodLength: 4,
        conditions: ['Endometriosis'],
        goals: ['Track my period', 'Manage PMS'],
        hasPcos: false,
        hasEndometriosis: true,
        isIrregular: false,
        tagline: '25-day cycle · Endometriosis',
        color: '#D4537E',
        colorEnd: '#E8A598',
    },
    {
        id: 'riya',
        name: 'Riya',
        avatar: 'R',
        cycleLength: 28,
        periodLength: 5,
        conditions: ['Coming off birth control'],
        goals: ['Track my period', 'General health'],
        hasPcos: false,
        hasEndometriosis: false,
        isIrregular: false,
        tagline: '28-day cycle · Post birth control',
        color: '#7BAE8A',
        colorEnd: '#A8D4B4',
    },
    {
        id: 'kavya',
        name: 'Kavya',
        avatar: 'K',
        cycleLength: 30,
        periodLength: 5,
        conditions: [],
        goals: ['Fertility awareness', 'Understand mood patterns'],
        hasPcos: false,
        hasEndometriosis: false,
        isIrregular: false,
        tagline: '30-day cycle · Fertility tracking',
        color: '#E8C07A',
        colorEnd: '#F2D4A0',
    },
    {
        id: 'zara',
        name: 'Zara',
        avatar: 'Z',
        cycleLength: 26,
        periodLength: 7,
        conditions: ['Irregular cycles'],
        goals: ['Perimenopause', 'General health'],
        hasPcos: false,
        hasEndometriosis: false,
        isIrregular: true,
        tagline: '26-day cycle · Perimenopause',
        color: '#6B8CAE',
        colorEnd: '#A0BDD4',
    },
];

/**
 * Generate full demo data for a specific profile.
 */
export function loadDemoProfile(profile: DemoProfile): {
    cycles: CycleRecord[];
    logs: DailyLog[];
    userProfile: {
        name: string;
        averageCycleLength: number;
        averagePeriodLength: number;
        hasPcos: boolean;
        hasEndometriosis: boolean;
        isIrregular: boolean;
        goals: string[];
        conditions: string[];
        onboardingComplete: boolean;
    };
} {
    // Vary cycle lengths around the base for realism
    const base = profile.cycleLength;
    const variation = profile.isIrregular ? 3 : 1;
    const cycleLengths = [
        base - variation,
        base + variation,
        base,
        base + variation - 1,
        base - 1,
        base,
    ];
    const periodLengths = Array(6).fill(profile.periodLength).map(
        (p, i) => Math.max(3, p + (i % 3 === 0 ? -1 : i % 3 === 1 ? 1 : 0))
    );

    const { cycles, logs } = generateDemoData({
        cycleLengths,
        periodLengths,
        dayIntoCurrent: Math.floor(Math.random() * 12) + 3,
    });

    return {
        cycles,
        logs,
        userProfile: {
            name: profile.name,
            averageCycleLength: profile.cycleLength,
            averagePeriodLength: profile.periodLength,
            hasPcos: profile.hasPcos,
            hasEndometriosis: profile.hasEndometriosis,
            isIrregular: profile.isIrregular,
            goals: profile.goals,
            conditions: profile.conditions,
            onboardingComplete: true,
        },
    };
}
