'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlowDots } from './FlowDots';
import { SymptomGrid } from './SymptomGrid';
import { MoodWheel } from './MoodWheel';
import { EnergySlider } from './EnergySlider';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FlowLevel } from '@/lib/cycleEngine';
import { useLogStore } from '@/store/logStore';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react';

interface LogStepperProps {
    initialStep?: number;
    onComplete?: () => void;
    date?: string;
}

const STEPS = ['Flow', 'Symptoms', 'Mood', 'Energy', 'Notes'];

export function LogStepper({
    initialStep = 0,
    onComplete,
    date,
}: LogStepperProps) {
    const [step, setStep] = useState(initialStep);
    const [flow, setFlow] = useState<FlowLevel>(0);
    const [symptoms, setSymptoms] = useState<string[]>([]);
    const [mood, setMood] = useState<string>('');
    const [energy, setEnergy] = useState<number>(5);
    const [note, setNote] = useState<string>('');
    const [completed, setCompleted] = useState(false);
    const addLog = useLogStore((s) => s.addLog);
    const logDate = date || format(new Date(), 'yyyy-MM-dd');

    const handleComplete = () => {
        addLog({
            id: `log-${Date.now()}`,
            date: logDate,
            flow,
            symptoms,
            mood,
            energy,
            note,
            createdAt: new Date().toISOString(),
        });
        setCompleted(true);
        setTimeout(() => {
            onComplete?.();
        }, 2000);
    };

    if (completed) {
        return (
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 gap-4"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2, bounce: 0.5 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-flow-primary to-flow-accent flex items-center justify-center"
                >
                    <Sparkles className="w-10 h-10 text-white" />
                </motion.div>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center"
                >
                    <h3 className="text-xl font-serif font-semibold text-flow-text">
                        Logged for {format(new Date(logDate), 'MMMM d')}
                    </h3>
                    <p className="text-flow-muted mt-1">See you tomorrow 🌸</p>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Progress bar */}
            <div className="flex items-center gap-2 px-4 py-3">
                {STEPS.map((s, i) => (
                    <div key={s} className="flex-1 flex flex-col items-center gap-1">
                        <div
                            className={`h-1.5 w-full rounded-full flow-transition ${i <= step ? 'bg-flow-primary' : 'bg-flow-surface2'
                                }`}
                        />
                        <span
                            className={`text-[10px] font-medium ${i === step ? 'text-flow-text' : 'text-flow-muted'
                                }`}
                        >
                            {s}
                        </span>
                    </div>
                ))}
            </div>

            {/* Step content */}
            <div className="flex-1 flex items-center justify-center p-4 min-h-[300px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -50, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                        className="w-full"
                    >
                        {step === 0 && <FlowDots value={flow} onChange={setFlow} />}
                        {step === 1 && (
                            <SymptomGrid selected={symptoms} onChange={setSymptoms} />
                        )}
                        {step === 2 && <MoodWheel value={mood} onChange={setMood} />}
                        {step === 3 && (
                            <EnergySlider value={energy} onChange={setEnergy} />
                        )}
                        {step === 4 && (
                            <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
                                <h3 className="text-xl font-serif font-semibold text-flow-text">
                                    Anything else?
                                </h3>
                                <Textarea
                                    placeholder="How are you feeling? Anything unusual?"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value.slice(0, 500))}
                                    rows={4}
                                    className="bg-white border-[#ECDDD7] rounded-xl resize-none focus:ring-flow-primary/50"
                                />
                                <p className="text-xs text-flow-muted self-end">
                                    {note.length}/500
                                </p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between p-4 border-t border-[#ECDDD7]/50">
                <Button
                    variant="ghost"
                    onClick={() => setStep(Math.max(0, step - 1))}
                    disabled={step === 0}
                    className="text-flow-muted"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                </Button>

                {step < STEPS.length - 1 ? (
                    <Button
                        onClick={() => setStep(step + 1)}
                        className="bg-flow-primary hover:bg-flow-primary/90 text-white rounded-xl px-6"
                    >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleComplete}
                        className="bg-flow-primary hover:bg-flow-primary/90 text-white rounded-xl px-6"
                    >
                        <Check className="w-4 h-4 mr-1" />
                        Save Log
                    </Button>
                )}
            </div>
        </div>
    );
}
