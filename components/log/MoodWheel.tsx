'use client';

import { motion } from 'framer-motion';
import { MOODS } from '@/lib/cycleEngine';

interface MoodWheelProps {
    value: string;
    onChange: (mood: string) => void;
}

const moodEmojis: Record<string, string> = {
    Calm: '😌',
    Happy: '😊',
    Energised: '⚡',
    Grateful: '🙏',
    Confident: '💪',
    Romantic: '💕',
    Anxious: '😰',
    Sad: '😢',
    Irritable: '😤',
    Overwhelmed: '😵',
    Foggy: '🌫️',
    Exhausted: '😩',
};

const moodColors: Record<string, string> = {
    Calm: '#7BAE8A',
    Happy: '#E8C07A',
    Energised: '#E8A598',
    Grateful: '#C9B8D8',
    Confident: '#D4537E',
    Romantic: '#F2C4CE',
    Anxious: '#8C7B75',
    Sad: '#6B8CAE',
    Irritable: '#D97B7B',
    Overwhelmed: '#A67B5B',
    Foggy: '#9CA3AF',
    Exhausted: '#6B7280',
};

export function MoodWheel({ value, onChange }: MoodWheelProps) {
    const allMoods = [...MOODS.positive, ...MOODS.negative];

    return (
        <div className="flex flex-col items-center gap-6">
            <h3 className="text-xl font-serif font-semibold text-flow-text">
                How are you feeling?
            </h3>

            {/* Positive moods */}
            <div>
                <p className="text-xs text-flow-muted uppercase tracking-wide text-center mb-3 font-medium">
                    Positive
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                    {MOODS.positive.map((mood) => {
                        const isSelected = value === mood;
                        return (
                            <motion.button
                                key={mood}
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onChange(mood)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl flow-transition font-medium text-sm ${isSelected
                                    ? 'shadow-float text-white'
                                    : 'bg-white text-flow-text hover:shadow-card'
                                    }`}
                                style={{
                                    backgroundColor: isSelected
                                        ? moodColors[mood]
                                        : undefined,
                                    outline: isSelected
                                        ? `2px solid ${moodColors[mood]}`
                                        : undefined,
                                    outlineOffset: '2px',
                                }}
                            >
                                <span className="text-lg">{moodEmojis[mood]}</span>
                                {mood}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Negative moods */}
            <div>
                <p className="text-xs text-flow-muted uppercase tracking-wide text-center mb-3 font-medium">
                    Challenging
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                    {MOODS.negative.map((mood) => {
                        const isSelected = value === mood;
                        return (
                            <motion.button
                                key={mood}
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onChange(mood)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl flow-transition font-medium text-sm ${isSelected
                                    ? 'shadow-float text-white'
                                    : 'bg-white text-flow-text hover:shadow-card'
                                    }`}
                                style={{
                                    backgroundColor: isSelected
                                        ? moodColors[mood]
                                        : undefined,
                                    outline: isSelected
                                        ? `2px solid ${moodColors[mood]}`
                                        : undefined,
                                    outlineOffset: '2px',
                                }}
                            >
                                <span className="text-lg">{moodEmojis[mood]}</span>
                                {mood}
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
