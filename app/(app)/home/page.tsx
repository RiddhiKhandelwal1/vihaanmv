'use client';

import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { PhaseChip } from '@/components/ui/PhaseChip';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { GradientText } from '@/components/ui/GradientText';
import { useCycleStore } from '@/store/cycleStore';
import { useLogStore } from '@/store/logStore';
import { useUserStore } from '@/store/userStore';
import { CycleEngine } from '@/lib/cycleEngine';
import { format, addDays, isToday, isTomorrow } from 'date-fns';
import {
    Droplets,
    Smile,
    AlertCircle,
    StickyNote,
    Sparkles,
    ArrowRight,
    Zap,
    CalendarDays,
    Clock,
    TrendingUp,
    Shield,
    Lock,
} from 'lucide-react';
import Link from 'next/link';
import { useUIStore } from '@/store/uiStore';

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

export default function HomePage() {
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => setHasMounted(true), []);

    const { profile } = useUserStore();
    const cycles = useCycleStore((s) => s.cycles);
    const logs = useLogStore((s) => s.logs);
    const lastMood = useLogStore((s) => s.getLastMood());
    const lastEnergy = useLogStore((s) => s.getLastEnergy());
    const { openLogAtStep } = useUIStore();

    const prediction = useMemo(
        () => CycleEngine.predict(cycles, logs),
        [cycles, logs]
    );

    const phaseInfo = CycleEngine.getPhaseInfo(prediction.currentPhase);
    const today = format(new Date(), 'EEEE, d MMMM yyyy');

    // Calendar strip — next 14 days
    const calendarDays = useMemo(() => {
        const days = [];
        const now = new Date();
        for (let i = 0; i < 14; i++) {
            const date = addDays(now, i);
            const dateStr = format(date, 'yyyy-MM-dd');
            const isPeriod =
                dateStr >= prediction.nextPeriodStart &&
                dateStr <= prediction.nextPeriodEnd;
            const isFertile =
                dateStr >= prediction.fertileWindowStart &&
                dateStr <= prediction.fertileWindowEnd;
            const isOvulation = dateStr === prediction.ovulationDate;
            const hasLog = logs.some((l) => l.date === dateStr);

            days.push({
                date,
                dateStr,
                isPeriod,
                isFertile,
                isOvulation,
                hasLog,
                isToday: isToday(date),
                isTomorrow: isTomorrow(date),
            });
        }
        return days;
    }, [prediction, logs]);

    // Prevent hydration mismatch — all hooks above, early return here
    if (!hasMounted) return null;

    const quickLogButtons = [
        { label: 'Flow', icon: Droplets, step: 0, color: '#D4537E' },
        { label: 'Mood', icon: Smile, step: 2, color: '#E8C07A' },
        { label: 'Symptom', icon: AlertCircle, step: 1, color: '#C9B8D8' },
        { label: 'Note', icon: StickyNote, step: 4, color: '#7BAE8A' },
    ];

    return (
        <div className="space-y-6">
            {/* Greeting */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-start justify-between"
            >
                <div>
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-flow-text">
                        {getGreeting()},{' '}
                        <GradientText>{profile.name || 'friend'}</GradientText>
                    </h1>
                    <p className="text-sm text-flow-muted mt-1 font-mono">{today} · Cycle Day {prediction.currentPhaseDay}</p>
                </div>
            </motion.div>

            {/* Phase Card */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                <div
                    className="relative overflow-hidden p-6 sm:p-8 rounded-3xl text-white shadow-card"
                    style={{
                        background: {
                            menstrual: 'linear-gradient(135deg, #D4537E 0%, #E8A598 100%)',
                            follicular: 'linear-gradient(135deg, #7BAE8A 0%, #A8D4B4 100%)',
                            ovulatory: 'linear-gradient(135deg, #E8C07A 0%, #F2D4A0 100%)',
                            luteal: 'linear-gradient(135deg, #C9B8D8 0%, #E0D5EB 100%)',
                        }[prediction.currentPhase] || 'linear-gradient(135deg, #E8A598 0%, #D4537E 100%)',
                    }}
                >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-10 -translate-x-10" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                                {phaseInfo.label} · Day {prediction.currentPhaseDay}
                            </span>
                        </div>
                        <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-4 max-w-md">
                            {phaseInfo.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs text-white/80">
                            <div>
                                <span className="block text-white/60 mb-0.5">Energy</span>
                                {phaseInfo.energyExpected}
                            </div>
                            <div>
                                <span className="block text-white/60 mb-0.5">Mood</span>
                                {phaseInfo.moodExpected}
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/20">
                            <p className="text-xs text-white/70">
                                💡 <strong>Tip:</strong> {phaseInfo.nutritionTip}
                            </p>
                        </div>
                        <div className="mt-3">
                            <span className="text-[10px] bg-white/15 backdrop-blur-sm rounded-full px-2 py-0.5">
                                Based on {cycles.length} cycles · {prediction.confidence} confidence
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Quick Log Bar */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-2"
            >
                {quickLogButtons.map((btn) => {
                    const Icon = btn.icon;
                    return (
                        <Link key={btn.label} href="/log">
                            <motion.div
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-2.5 px-4 py-3 bg-white rounded-2xl shadow-card cursor-pointer flow-transition hover:shadow-float"
                            >
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: `${btn.color}20` }}
                                >
                                    <Icon className="w-4 h-4" style={{ color: btn.color }} />
                                </div>
                                <span className="text-sm font-medium text-flow-text">
                                    + {btn.label}
                                </span>
                            </motion.div>
                        </Link>
                    );
                })}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column — Stats + AI */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Stat Cards */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                    >
                        <Card className="p-4 rounded-2xl border-[#ECDDD7]/50 bg-white">
                            <div className="flex items-center gap-2 mb-2">
                                <CalendarDays className="w-4 h-4 text-flow-primary" />
                                <span className="text-xs text-flow-muted">Cycle Day</span>
                            </div>
                            <AnimatedNumber
                                value={prediction.currentPhaseDay}
                                className="text-2xl font-bold text-flow-text"
                            />
                        </Card>
                        <Card className="p-4 rounded-2xl border-[#ECDDD7]/50 bg-white">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-phase-menstrual" />
                                <span className="text-xs text-flow-muted">Period in</span>
                            </div>
                            <AnimatedNumber
                                value={Math.max(0, prediction.daysUntilNextPeriod)}
                                suffix=" days"
                                className="text-2xl font-bold text-flow-text"
                            />
                        </Card>
                        <Card className="p-4 rounded-2xl border-[#ECDDD7]/50 bg-white">
                            <div className="flex items-center gap-2 mb-2">
                                <Smile className="w-4 h-4 text-flow-warning" />
                                <span className="text-xs text-flow-muted">Last Mood</span>
                            </div>
                            <p className="text-base font-semibold text-flow-text truncate">
                                {lastMood || '—'}
                            </p>
                        </Card>
                        <Card className="p-4 rounded-2xl border-[#ECDDD7]/50 bg-white">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-4 h-4 text-flow-success" />
                                <span className="text-xs text-flow-muted">Energy</span>
                            </div>
                            <p className="text-2xl font-bold text-flow-text font-mono">
                                {lastEnergy !== null ? `${lastEnergy}/10` : '—'}
                            </p>
                        </Card>
                    </motion.div>

                    {/* AI Insight Card */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="p-5 rounded-2xl border-[#ECDDD7]/50 bg-white">
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-flow-warning/20 to-flow-warning/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Sparkles className="w-5 h-5 text-flow-warning" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-flow-text mb-1">
                                        Luna&apos;s Insight
                                    </h3>
                                    <p className="text-sm text-flow-muted leading-relaxed">
                                        You&apos;re in your{' '}
                                        <strong className="text-flow-text">
                                            {phaseInfo.label.toLowerCase()}
                                        </strong>
                                        . {phaseInfo.description.split('.')[0]}.
                                        Try incorporating {phaseInfo.nutritionTip.toLowerCase().split(':')[1] || 'nourishing foods'} into your meals today.
                                    </p>
                                    <Link
                                        href="/companion"
                                        className="inline-flex items-center gap-1 text-sm text-flow-primary font-medium mt-2 hover:underline"
                                    >
                                        Chat with Luna
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* Right column — Calendar strip */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="p-5 rounded-2xl border-[#ECDDD7]/50 bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-flow-text">
                                Upcoming
                            </h3>
                            <Link
                                href="/calendar"
                                className="text-xs text-flow-primary font-medium hover:underline"
                            >
                                Full calendar →
                            </Link>
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((day) => (
                                <div
                                    key={day.dateStr}
                                    className={`flex flex-col items-center py-2 rounded-xl text-center flow-transition ${day.isToday
                                        ? 'bg-flow-primary/10 ring-1 ring-flow-primary/30'
                                        : ''
                                        }`}
                                >
                                    <span className="text-[9px] text-flow-muted uppercase">
                                        {format(day.date, 'EEE')}
                                    </span>
                                    <span
                                        className={`text-sm font-mono font-medium mt-0.5 ${day.isToday ? 'text-flow-primary font-bold' : 'text-flow-text'
                                            }`}
                                    >
                                        {format(day.date, 'd')}
                                    </span>
                                    <div className="flex gap-0.5 mt-1">
                                        {day.isPeriod && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-phase-menstrual" />
                                        )}
                                        {day.isFertile && !day.isPeriod && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-phase-follicular" />
                                        )}
                                        {day.isOvulation && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-flow-warning" />
                                        )}
                                        {day.hasLog && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-flow-muted" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Privacy Trust Badge */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
            >
                <Card className="p-4 rounded-2xl border-[#ECDDD7]/50 bg-white flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#6B8CAE]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Shield className="w-4 h-4 text-[#6B8CAE]" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-flow-text">Your data never leaves your device</p>
                        <p className="text-xs text-flow-muted mt-0.5 leading-relaxed">
                            Vihaan stores everything locally. No ads. No data selling. No third-party trackers.
                            Unlike Flo, Clue, and others — <strong>we cannot share what we cannot see.</strong>
                        </p>
                    </div>
                    <Lock className="w-4 h-4 text-[#6B8CAE] flex-shrink-0 mt-1" />
                </Card>
            </motion.div>
        </div>
    );
}
