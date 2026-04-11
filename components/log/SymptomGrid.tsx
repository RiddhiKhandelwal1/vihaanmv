'use client';

import { motion } from 'framer-motion';
import { SYMPTOMS } from '@/lib/cycleEngine';
import {
    Frown, Brain, Flame, Heart, Zap, Moon,
    Apple, Droplets, Eye, Bone, CloudRain, Wind,
    ThermometerSun, AlertTriangle, Sparkles, Ban,
    Headphones, Pill, Coffee, Waves,
} from 'lucide-react';

const symptomIcons: Record<string, React.ElementType> = {
    Cramps: Flame,
    Bloating: Wind,
    Headache: Brain,
    'Back pain': Bone,
    'Breast tenderness': Heart,
    Fatigue: Zap,
    Nausea: Waves,
    Acne: Sparkles,
    'Mood swings': CloudRain,
    Insomnia: Moon,
    'Food cravings': Apple,
    Spotting: Droplets,
    Discharge: Droplets,
    Constipation: AlertTriangle,
    Diarrhoea: AlertTriangle,
    'Hot flashes': ThermometerSun,
    'Brain fog': Eye,
    'Joint pain': Bone,
    Anxiety: Frown,
    None: Ban,
};

interface SymptomGridProps {
    selected: string[];
    onChange: (symptoms: string[]) => void;
}

export function SymptomGrid({ selected, onChange }: SymptomGridProps) {
    const toggle = (symptom: string) => {
        if (symptom === 'None') {
            onChange(['None']);
            return;
        }
        const filtered = selected.filter((s) => s !== 'None');
        if (filtered.includes(symptom)) {
            onChange(filtered.filter((s) => s !== symptom));
        } else {
            onChange([...filtered, symptom]);
        }
    };

    return (
        <div className="flex flex-col items-center gap-6">
            <h3 className="text-xl font-serif font-semibold text-flow-text">
                Any symptoms?
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 w-full max-w-md">
                {SYMPTOMS.map((symptom) => {
                    const isSelected = selected.includes(symptom);
                    const Icon = symptomIcons[symptom] || Sparkles;
                    return (
                        <motion.button
                            key={symptom}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggle(symptom)}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-center flow-transition ${isSelected
                                    ? 'bg-flow-primary/15 text-flow-primary ring-1 ring-flow-primary/30 shadow-sm'
                                    : 'bg-white text-flow-muted hover:bg-flow-surface2'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-[10px] font-medium leading-tight">
                                {symptom}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
