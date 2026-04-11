'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { useCycleStore } from '@/store/cycleStore';
import { format, subDays } from 'date-fns';
import { ArrowRight, ArrowLeft, Heart, Sparkles, Check } from 'lucide-react';
import { GradientText } from '@/components/ui/GradientText';
import { CycleEngine } from '@/lib/cycleEngine';
import { generateDemoData } from '@/lib/demoData';
import { useLogStore } from '@/store/logStore';

const GOALS = [
    'Track my period',
    'Understand mood patterns',
    'Manage PMS',
    'Fertility awareness',
    'General health',
    'Perimenopause',
];

const CONDITIONS = [
    'PCOS',
    'Irregular cycles',
    'Endometriosis',
    'Coming off birth control',
];

export default function OnboardingPage() {
    const router = useRouter();
    const { setProfile, completeOnboarding } = useUserStore();
    const { initializeWithDefaults } = useCycleStore();

    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [lastPeriod, setLastPeriod] = useState<Date | undefined>(subDays(new Date(), 14));
    const [cycleLength, setCycleLength] = useState(28);
    const [periodLength, setPeriodLength] = useState(5);
    const [goals, setGoals] = useState<string[]>([]);
    const [conditions, setConditions] = useState<string[]>([]);
    const [loadDemoData, setLoadDemoData] = useState(true);

    const totalSteps = 6;

    const toggleGoal = (goal: string) => {
        setGoals((prev) =>
            prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
        );
    };

    const toggleCondition = (condition: string) => {
        setConditions((prev) =>
            prev.includes(condition)
                ? prev.filter((c) => c !== condition)
                : [...prev, condition]
        );
    };

    const handleComplete = () => {
        setProfile({
            name: name || 'Priya',
            averageCycleLength: cycleLength,
            averagePeriodLength: periodLength,
            goals,
            conditions,
            hasPcos: conditions.includes('PCOS'),
            hasEndometriosis: conditions.includes('Endometriosis'),
            isIrregular: conditions.includes('Irregular cycles'),
        });

        if (lastPeriod) {
            initializeWithDefaults(
                format(lastPeriod, 'yyyy-MM-dd'),
                cycleLength,
                periodLength
            );
        }

        // Seed demo data if opted in
        if (loadDemoData) {
            const { cycles, logs } = generateDemoData({
                cycleLengths: [cycleLength - 1, cycleLength + 1, cycleLength, cycleLength - 1, cycleLength + 1, cycleLength],
                periodLengths: [periodLength, periodLength - 1, periodLength, periodLength + 1, periodLength, periodLength - 1].map(p => Math.max(3, p)),
                dayIntoCurrent: 8,
            });
            useCycleStore.setState({ cycles });
            useLogStore.setState({ logs });
        }

        completeOnboarding();
        router.push('/home');
    };

    const canProceed = () => {
        switch (step) {
            case 0: return name.trim().length > 0;
            case 1: return lastPeriod !== undefined;
            default: return true;
        }
    };

    const prediction = lastPeriod
        ? CycleEngine.predict(
            [{
                id: 'preview',
                startDate: format(lastPeriod, 'yyyy-MM-dd'),
                endDate: null,
                length: cycleLength,
                periodLength,
                notes: '',
            }],
            []
        )
        : null;

    const steps = [
        // Step 0 — Name
        <motion.div key="name" className="flex flex-col items-center gap-6">
            <h2 className="text-2xl font-serif font-bold text-flow-text text-center">
                What should we call you?
            </h2>
            <Input
                placeholder="Your first name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="max-w-xs h-14 text-center text-lg rounded-2xl bg-white border-[#ECDDD7] focus:ring-flow-primary/50"
                autoFocus
            />
        </motion.div>,

        // Step 1 — Last period
        <motion.div key="period" className="flex flex-col items-center gap-4">
            <h2 className="text-2xl font-serif font-bold text-flow-text text-center">
                When did your last period start?
            </h2>
            <p className="text-sm text-flow-muted text-center">
                Don&apos;t worry if you&apos;re not exact — we&apos;ll learn your pattern
            </p>
            <div className="bg-white rounded-2xl shadow-card p-1">
                <Calendar
                    mode="single"
                    selected={lastPeriod}
                    onSelect={setLastPeriod}
                    className="rounded-xl"
                />
            </div>
        </motion.div>,

        // Step 2 — Cycle length
        <motion.div key="cycle" className="flex flex-col items-center gap-6">
            <h2 className="text-2xl font-serif font-bold text-flow-text text-center">
                How long is your cycle?
            </h2>
            <p className="text-sm text-flow-muted text-center">
                Most cycles are 24–35 days
            </p>
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCycleLength(Math.max(21, cycleLength - 1))}
                    className="rounded-full w-10 h-10 border-[#ECDDD7]"
                >
                    −
                </Button>
                <div className="text-center">
                    <span className="text-5xl font-mono font-bold text-flow-text">{cycleLength}</span>
                    <p className="text-sm text-flow-muted mt-1">days</p>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCycleLength(Math.min(45, cycleLength + 1))}
                    className="rounded-full w-10 h-10 border-[#ECDDD7]"
                >
                    +
                </Button>
            </div>
            <input
                type="range"
                min={21}
                max={45}
                value={cycleLength}
                onChange={(e) => setCycleLength(Number(e.target.value))}
                className="w-64 accent-flow-primary"
            />
        </motion.div>,

        // Step 3 — Period length
        <motion.div key="periodLen" className="flex flex-col items-center gap-6">
            <h2 className="text-2xl font-serif font-bold text-flow-text text-center">
                How long does your period last?
            </h2>
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPeriodLength(Math.max(2, periodLength - 1))}
                    className="rounded-full w-10 h-10 border-[#ECDDD7]"
                >
                    −
                </Button>
                <div className="text-center">
                    <span className="text-5xl font-mono font-bold text-flow-text">{periodLength}</span>
                    <p className="text-sm text-flow-muted mt-1">days</p>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPeriodLength(Math.min(10, periodLength + 1))}
                    className="rounded-full w-10 h-10 border-[#ECDDD7]"
                >
                    +
                </Button>
            </div>
            <input
                type="range"
                min={2}
                max={10}
                value={periodLength}
                onChange={(e) => setPeriodLength(Number(e.target.value))}
                className="w-64 accent-flow-primary"
            />
        </motion.div>,

        // Step 4 — Goals
        <motion.div key="goals" className="flex flex-col items-center gap-6">
            <h2 className="text-2xl font-serif font-bold text-flow-text text-center">
                What are your goals?
            </h2>
            <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {GOALS.map((goal) => (
                    <button
                        key={goal}
                        onClick={() => toggleGoal(goal)}
                        className={`px-4 py-2.5 rounded-2xl text-sm font-medium flow-transition ${goals.includes(goal)
                            ? 'bg-flow-primary text-white shadow-card'
                            : 'bg-white text-flow-text hover:bg-flow-surface2 border border-[#ECDDD7]'
                            }`}
                    >
                        {goal}
                    </button>
                ))}
            </div>
        </motion.div>,

        // Step 5 — Ready
        <motion.div key="ready" className="flex flex-col items-center gap-6">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="w-20 h-20 rounded-3xl bg-gradient-to-br from-flow-primary to-flow-accent flex items-center justify-center shadow-float"
            >
                <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-2xl font-serif font-bold text-flow-text text-center">
                You&apos;re all set, <GradientText>{name || 'friend'}</GradientText>!
            </h2>
            {prediction && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-float p-6 text-center max-w-sm"
                >
                    <p className="text-sm text-flow-muted mb-2">Your next period is predicted around</p>
                    <p className="text-2xl font-serif font-bold text-flow-text">
                        {format(new Date(prediction.nextPeriodStart), 'MMMM d, yyyy')}
                    </p>
                    <p className="text-xs text-flow-muted mt-2">
                        Confidence: {prediction.confidence} · Based on your inputs
                    </p>
                </motion.div>
            )}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <button
                    onClick={() => setLoadDemoData(!loadDemoData)}
                    className="flex items-center gap-2.5 mt-2 px-4 py-2.5 rounded-xl bg-white border border-[#ECDDD7] hover:bg-flow-surface2 flow-transition"
                >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flow-transition ${loadDemoData ? 'bg-flow-primary border-flow-primary' : 'border-[#ECDDD7]'
                        }`}>
                        {loadDemoData && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-xs text-flow-text">
                        Load 6 months of demo data for rich Insights
                    </span>
                </button>
            </motion.div>
        </motion.div>,
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-flow-bg to-white flex flex-col">
            {/* Progress bar */}
            <div className="px-6 pt-6">
                <div className="flex items-center gap-2 max-w-md mx-auto">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <div
                            key={i}
                            className={`flex-1 h-1.5 rounded-full flow-transition ${i <= step ? 'bg-flow-primary' : 'bg-flow-surface2'
                                }`}
                        />
                    ))}
                </div>
                <p className="text-xs text-flow-muted text-center mt-2">
                    Step {step + 1} of {totalSteps}
                </p>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center px-6 py-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ x: 60, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -60, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                        className="w-full max-w-md"
                    >
                        {steps[step]}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="p-6">
                <div className="flex items-center justify-between max-w-md mx-auto">
                    <Button
                        variant="ghost"
                        onClick={() => setStep(Math.max(0, step - 1))}
                        disabled={step === 0}
                        className="text-flow-muted"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back
                    </Button>

                    {step < totalSteps - 1 ? (
                        <Button
                            onClick={() => setStep(step + 1)}
                            disabled={!canProceed()}
                            className="bg-flow-primary hover:bg-flow-primary/90 text-white rounded-2xl px-8 h-12"
                        >
                            Continue
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleComplete}
                            className="bg-gradient-to-r from-flow-primary to-flow-accent hover:opacity-90 text-white rounded-2xl px-8 h-12 shadow-float"
                        >
                            <Heart className="w-4 h-4 mr-2" />
                            Start tracking
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
