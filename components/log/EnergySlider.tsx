'use client';

import { motion } from 'framer-motion';

interface EnergySliderProps {
    value: number;
    onChange: (value: number) => void;
}

const energyEmojis = ['😴', '😪', '😐', '😊', '🤩', '🔥'];

function getEmoji(val: number): string {
    if (val <= 2) return energyEmojis[0];
    if (val <= 4) return energyEmojis[1];
    if (val <= 5) return energyEmojis[2];
    if (val <= 7) return energyEmojis[3];
    if (val <= 9) return energyEmojis[4];
    return energyEmojis[5];
}

function getColor(val: number): string {
    if (val <= 3) return '#D97B7B';
    if (val <= 5) return '#E8C07A';
    if (val <= 7) return '#7BAE8A';
    return '#4A9E6D';
}

export function EnergySlider({ value, onChange }: EnergySliderProps) {
    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
            <h3 className="text-xl font-serif font-semibold text-flow-text">
                Energy level today?
            </h3>

            {/* Emoji display */}
            <motion.div
                key={value}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', duration: 0.4 }}
                className="text-6xl"
            >
                {getEmoji(value)}
            </motion.div>

            {/* Value display */}
            <div className="text-center">
                <motion.span
                    key={value}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-3xl font-mono font-bold"
                    style={{ color: getColor(value) }}
                >
                    {value}
                </motion.span>
                <span className="text-flow-muted text-sm"> / 10</span>
            </div>

            {/* Slider */}
            <div className="w-full relative px-2">
                <input
                    type="range"
                    min={1}
                    max={10}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                        background: `linear-gradient(to right, ${getColor(value)} 0%, ${getColor(value)} ${((value - 1) / 9) * 100
                            }%, #ECDDD7 ${((value - 1) / 9) * 100}%, #ECDDD7 100%)`,
                    }}
                />
                <div className="flex justify-between mt-2">
                    <span className="text-xs text-flow-muted">Drained</span>
                    <span className="text-xs text-flow-muted">Thriving</span>
                </div>
            </div>
        </div>
    );
}
