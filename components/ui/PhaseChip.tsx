'use client';

import { CyclePhase, CycleEngine } from '@/lib/cycleEngine';
import { motion } from 'framer-motion';

interface PhaseChipProps {
    phase: CyclePhase;
    day?: number;
    size?: 'sm' | 'md' | 'lg';
}

const phaseStyles: Record<CyclePhase, string> = {
    menstrual: 'bg-phase-menstrual/15 text-phase-menstrual border-phase-menstrual/30',
    follicular: 'bg-phase-follicular/15 text-phase-follicular border-phase-follicular/30',
    ovulatory: 'bg-phase-ovulatory/15 text-phase-ovulatory border-phase-ovulatory/30',
    luteal: 'bg-phase-luteal/15 text-phase-luteal border-phase-luteal/30',
};

const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
};

export function PhaseChip({ phase, day, size = 'md' }: PhaseChipProps) {
    const info = CycleEngine.getPhaseInfo(phase);

    return (
        <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${phaseStyles[phase]} ${sizeStyles[size]}`}
        >
            <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: info.color }}
            />
            {info.label}
            {day !== undefined && (
                <span className="font-mono opacity-80">· Day {day}</span>
            )}
        </motion.span>
    );
}
