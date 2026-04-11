'use client';

import { motion } from 'framer-motion';
import { FlowLevel, FLOW_LABELS } from '@/lib/cycleEngine';
import { Droplets } from 'lucide-react';

interface FlowDotsProps {
    value: FlowLevel;
    onChange: (value: FlowLevel) => void;
}

const flowColors: Record<FlowLevel, string> = {
    0: '#D1CBC7',
    1: '#F2C4CE',
    2: '#E8A598',
    3: '#D4537E',
    4: '#A63D5C',
};

export function FlowDots({ value, onChange }: FlowDotsProps) {
    return (
        <div className="flex flex-col items-center gap-6">
            <h3 className="text-xl font-serif font-semibold text-flow-text">
                How&apos;s your flow today?
            </h3>
            <div className="flex items-center gap-4">
                {([0, 1, 2, 3, 4] as FlowLevel[]).map((level) => (
                    <motion.button
                        key={level}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onChange(level)}
                        className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl flow-transition ${value === level
                                ? 'bg-white shadow-float'
                                : 'hover:bg-white/60'
                            }`}
                        style={{
                            outline: value === level ? `2px solid ${flowColors[level]}` : 'none',
                            outlineOffset: '2px',
                        }}
                    >
                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center flow-transition"
                            style={{
                                backgroundColor:
                                    value === level
                                        ? flowColors[level]
                                        : `${flowColors[level]}40`,
                            }}
                        >
                            {level === 0 ? (
                                <span className="text-lg">—</span>
                            ) : (
                                <div className="flex gap-0.5">
                                    {Array.from({ length: level }).map((_, i) => (
                                        <Droplets
                                            key={i}
                                            className="w-3 h-3"
                                            style={{
                                                color:
                                                    value === level ? 'white' : flowColors[level],
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        <span
                            className={`text-xs font-medium ${value === level ? 'text-flow-text' : 'text-flow-muted'
                                }`}
                        >
                            {FLOW_LABELS[level]}
                        </span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
