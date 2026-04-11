import { addDays, differenceInDays, format } from 'date-fns';

export type FlowLevel = 0 | 1 | 2 | 3 | 4;

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export interface DailyLog {
  id: string;
  date: string;
  flow: FlowLevel;
  symptoms: string[];
  mood: string;
  energy: number;
  note: string;
  createdAt: string;
}

export interface CycleRecord {
  id: string;
  startDate: string;
  endDate: string | null;
  length: number | null;
  periodLength: number | null;
  notes: string;
}

export interface CyclePrediction {
  nextPeriodStart: string;
  nextPeriodEnd: string;
  ovulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  currentPhase: CyclePhase;
  currentPhaseDay: number;
  daysUntilNextPeriod: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface PhaseInfo {
  phase: CyclePhase;
  label: string;
  description: string;
  energyExpected: string;
  nutritionTip: string;
  moodExpected: string;
  color: string;
}

export class CycleEngine {
  static calculateAdaptiveCycleLength(cycles: CycleRecord[]): number {
    if (cycles.length === 0) return 28;
    if (cycles.length === 1) return cycles[0].length ?? 28;

    const lengths = cycles
      .filter((c) => c.length !== null)
      .map((c) => c.length as number);

    if (lengths.length === 0) return 28;

    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const sd = Math.sqrt(
      lengths.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) /
        lengths.length
    );
    const filtered = lengths.filter((l) => Math.abs(l - mean) <= 1.5 * sd);
    if (filtered.length === 0) return Math.round(mean);

    const weights = filtered.map((_, i) => i + 1);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const weightedSum = filtered.reduce(
      (sum, len, i) => sum + len * weights[i],
      0
    );

    return Math.round(weightedSum / totalWeight);
  }

  static calculateAveragePeriodLength(cycles: CycleRecord[]): number {
    const lengths = cycles
      .filter((c) => c.periodLength)
      .map((c) => c.periodLength as number);
    if (!lengths.length) return 5;
    return Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
  }

  static predict(
    cycles: CycleRecord[],
    dailyLogs: DailyLog[]
  ): CyclePrediction {
    const avgCycleLength = this.calculateAdaptiveCycleLength(cycles);
    const avgPeriodLength = this.calculateAveragePeriodLength(cycles);

    if (cycles.length === 0) {
      const today = new Date();
      return {
        nextPeriodStart: format(addDays(today, 14), 'yyyy-MM-dd'),
        nextPeriodEnd: format(addDays(today, 18), 'yyyy-MM-dd'),
        ovulationDate: format(today, 'yyyy-MM-dd'),
        fertileWindowStart: format(addDays(today, -5), 'yyyy-MM-dd'),
        fertileWindowEnd: format(addDays(today, 1), 'yyyy-MM-dd'),
        currentPhase: 'follicular',
        currentPhaseDay: 1,
        daysUntilNextPeriod: 14,
        confidence: 'low',
      };
    }

    const lastCycle = cycles[cycles.length - 1];
    const lastPeriodStart = new Date(lastCycle.startDate);

    const nextPeriodStart = addDays(lastPeriodStart, avgCycleLength);
    const nextPeriodEnd = addDays(nextPeriodStart, avgPeriodLength - 1);
    const ovulationDate = addDays(nextPeriodStart, -14);
    const fertileWindowStart = addDays(ovulationDate, -5);
    const fertileWindowEnd = addDays(ovulationDate, 1);

    const today = new Date();
    const dayOfCycle = differenceInDays(today, lastPeriodStart) + 1;
    const { phase, phaseDay } = this.determinePhase(
      dayOfCycle,
      avgCycleLength,
      avgPeriodLength
    );
    const daysUntilNextPeriod = differenceInDays(nextPeriodStart, today);
    const confidence =
      cycles.length >= 6 ? 'high' : cycles.length >= 3 ? 'medium' : 'low';

    return {
      nextPeriodStart: format(nextPeriodStart, 'yyyy-MM-dd'),
      nextPeriodEnd: format(nextPeriodEnd, 'yyyy-MM-dd'),
      ovulationDate: format(ovulationDate, 'yyyy-MM-dd'),
      fertileWindowStart: format(fertileWindowStart, 'yyyy-MM-dd'),
      fertileWindowEnd: format(fertileWindowEnd, 'yyyy-MM-dd'),
      currentPhase: phase,
      currentPhaseDay: phaseDay,
      daysUntilNextPeriod,
      confidence,
    };
  }

  static determinePhase(
    dayOfCycle: number,
    cycleLength: number,
    periodLength: number
  ): { phase: CyclePhase; phaseDay: number } {
    if (dayOfCycle <= periodLength)
      return { phase: 'menstrual', phaseDay: dayOfCycle };
    const ovulationDay = cycleLength - 14;
    if (dayOfCycle <= ovulationDay - 2)
      return { phase: 'follicular', phaseDay: dayOfCycle - periodLength };
    if (dayOfCycle <= ovulationDay + 2)
      return {
        phase: 'ovulatory',
        phaseDay: dayOfCycle - (ovulationDay - 2),
      };
    return { phase: 'luteal', phaseDay: dayOfCycle - (ovulationDay + 2) };
  }

  static getPhaseInfo(phase: CyclePhase): PhaseInfo {
    const info: Record<CyclePhase, PhaseInfo> = {
      menstrual: {
        phase: 'menstrual',
        label: 'Menstrual phase',
        description:
          'Your body is shedding the uterine lining. Rest is your superpower right now.',
        energyExpected: 'Low — honour that',
        nutritionTip: 'Iron-rich foods: lentils, spinach, dark chocolate',
        moodExpected: 'Introspective, sensitive',
        color: '#D4537E',
      },
      follicular: {
        phase: 'follicular',
        label: 'Follicular phase',
        description:
          'Oestrogen is rising. Your energy and creativity are naturally increasing.',
        energyExpected: 'Building — great for new projects',
        nutritionTip: 'Fermented foods, light proteins, fresh vegetables',
        moodExpected: 'Optimistic, sociable, motivated',
        color: '#7BAE8A',
      },
      ovulatory: {
        phase: 'ovulatory',
        label: 'Ovulatory phase',
        description:
          'Peak oestrogen. Your communication, confidence, and energy are at their highest.',
        energyExpected: 'Peak — schedule important things now',
        nutritionTip:
          'Anti-inflammatory foods: berries, leafy greens, flaxseed',
        moodExpected: 'Confident, magnetic, social',
        color: '#E8C07A',
      },
      luteal: {
        phase: 'luteal',
        label: 'Luteal phase',
        description:
          'Progesterone rises then falls. PMS symptoms may appear in the second half.',
        energyExpected: 'Moderate then declining',
        nutritionTip: 'Magnesium-rich foods: dark chocolate, nuts, bananas',
        moodExpected: 'Detail-oriented early, then sensitive',
        color: '#C9B8D8',
      },
    };
    return info[phase];
  }

  static detectSymptomPatterns(
    cycles: CycleRecord[],
    dailyLogs: DailyLog[]
  ): { symptom: string; typicalDay: number; confidence: number }[] {
    const patterns: Map<string, Map<number, number>> = new Map();
    const cycleDayMap = this.buildCycleDayMap(cycles, dailyLogs);

    cycleDayMap.forEach(({ cycleDay }, logId) => {
      const log = dailyLogs.find((l) => l.id === logId);
      if (!log) return;
      log.symptoms.forEach((symptom) => {
        if (!patterns.has(symptom)) patterns.set(symptom, new Map());
        const dayMap = patterns.get(symptom)!;
        dayMap.set(cycleDay, (dayMap.get(cycleDay) ?? 0) + 1);
      });
    });

    const results: { symptom: string; typicalDay: number; confidence: number }[] =
      [];
    patterns.forEach((dayMap, symptom) => {
      dayMap.forEach((count, day) => {
        const freq = count / cycles.length;
        if (freq >= 0.5)
          results.push({ symptom, typicalDay: day, confidence: freq });
      });
    });
    return results.sort((a, b) => b.confidence - a.confidence);
  }

  static buildCycleDayMap(
    cycles: CycleRecord[],
    logs: DailyLog[]
  ): Map<string, { cycleDay: number; cycleIndex: number }> {
    const map = new Map<string, { cycleDay: number; cycleIndex: number }>();
    logs.forEach((log) => {
      const logDate = new Date(log.date);
      for (let i = 0; i < cycles.length; i++) {
        const start = new Date(cycles[i].startDate);
        const end = cycles[i + 1]
          ? new Date(cycles[i + 1].startDate)
          : addDays(start, 35);
        if (logDate >= start && logDate < end) {
          map.set(log.id, {
            cycleDay: differenceInDays(logDate, start) + 1,
            cycleIndex: i,
          });
          break;
        }
      }
    });
    return map;
  }
}

export const SYMPTOMS = [
  'Cramps', 'Bloating', 'Headache', 'Back pain', 'Breast tenderness',
  'Fatigue', 'Nausea', 'Acne', 'Mood swings', 'Insomnia',
  'Food cravings', 'Spotting', 'Discharge', 'Constipation', 'Diarrhoea',
  'Hot flashes', 'Brain fog', 'Joint pain', 'Anxiety', 'None',
] as const;

export const MOODS = {
  positive: ['Calm', 'Happy', 'Energised', 'Grateful', 'Confident', 'Romantic'],
  negative: ['Anxious', 'Sad', 'Irritable', 'Overwhelmed', 'Foggy', 'Exhausted'],
} as const;

export const FLOW_LABELS: Record<FlowLevel, string> = {
  0: 'None',
  1: 'Spotting',
  2: 'Light',
  3: 'Medium',
  4: 'Heavy',
};
