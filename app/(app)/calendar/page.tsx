'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCycleStore } from '@/store/cycleStore';
import { useLogStore } from '@/store/logStore';
import { CycleEngine, FLOW_LABELS } from '@/lib/cycleEngine';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    addMonths,
    subMonths,
    getDay,
    isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Star, X } from 'lucide-react';

export default function CalendarPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const cycles = useCycleStore((s) => s.cycles);
    const logs = useLogStore((s) => s.logs);

    const prediction = useMemo(
        () => CycleEngine.predict(cycles, logs),
        [cycles, logs]
    );

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startPadding = getDay(monthStart);

    const selectedLog = selectedDate
        ? logs.find((l) => l.date === selectedDate)
        : null;

    const getDayState = (dateStr: string) => {
        const hasLog = logs.some((l) => l.date === dateStr);
        const log = logs.find((l) => l.date === dateStr);
        const isPeriod = log && log.flow > 0;
        const isPeriodPredicted =
            dateStr >= prediction.nextPeriodStart &&
            dateStr <= prediction.nextPeriodEnd &&
            !isPeriod;
        const isFertile =
            dateStr >= prediction.fertileWindowStart &&
            dateStr <= prediction.fertileWindowEnd;
        const isOvulation = dateStr === prediction.ovulationDate;
        return { hasLog, isPeriod, isPeriodPredicted, isFertile, isOvulation };
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-serif font-bold text-flow-text">
                    Calendar
                </h1>
                <div className="flex items-center gap-4 text-xs text-flow-muted">
                    <span className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-phase-menstrual" />
                        Period
                    </span>
                    <span className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-phase-menstrual" />
                        Predicted
                    </span>
                    <span className="flex items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-phase-follicular/50" />
                        Fertile
                    </span>
                </div>
            </div>

            <Card className="p-4 sm:p-6 rounded-2xl border-[#ECDDD7]/50 bg-white">
                {/* Month navigation */}
                <div className="flex items-center justify-between mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="rounded-xl text-flow-muted hover:text-flow-text"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <h2 className="text-lg font-serif font-bold text-flow-text">
                        {format(currentMonth, 'MMMM yyyy')}
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="rounded-xl text-flow-muted hover:text-flow-text"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div
                            key={day}
                            className="text-center text-xs font-medium text-flow-muted py-1"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-1">
                    {/* Empty slots for padding */}
                    {Array.from({ length: startPadding }).map((_, i) => (
                        <div key={`pad-${i}`} className="aspect-square" />
                    ))}

                    {days.map((day) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const state = getDayState(dateStr);
                        const isSelected = selectedDate === dateStr;
                        const today = isToday(day);

                        return (
                            <motion.button
                                key={dateStr}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                                className={`aspect-square rounded-xl flex flex-col items-center justify-center relative flow-transition text-sm ${isSelected
                                        ? 'bg-flow-primary text-white shadow-card'
                                        : state.isPeriod
                                            ? 'bg-phase-menstrual/15 text-phase-menstrual font-semibold'
                                            : state.isPeriodPredicted
                                                ? 'border-2 border-dashed border-phase-menstrual/40 text-flow-text'
                                                : state.isFertile
                                                    ? 'bg-phase-follicular/10 text-flow-text'
                                                    : today
                                                        ? 'ring-2 ring-flow-primary font-bold text-flow-primary'
                                                        : 'text-flow-text hover:bg-flow-surface2'
                                    }`}
                            >
                                {state.isOvulation && !isSelected && (
                                    <Star className="w-2.5 h-2.5 text-flow-warning absolute top-1 right-1" />
                                )}
                                <span className="font-mono">{format(day, 'd')}</span>
                                {state.hasLog && !isSelected && (
                                    <div className="w-1 h-1 rounded-full bg-flow-primary mt-0.5" />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </Card>

            {/* Selected day detail */}
            <AnimatePresence>
                {selectedDate && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                    >
                        <Card className="p-5 rounded-2xl border-[#ECDDD7]/50 bg-white">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-serif font-semibold text-flow-text">
                                    {format(new Date(selectedDate), 'EEEE, MMMM d')}
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedDate(null)}
                                    className="rounded-xl"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            {selectedLog ? (
                                <div className="space-y-3 text-sm">
                                    {selectedLog.flow > 0 && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-flow-muted">Flow:</span>
                                            <span className="font-medium text-flow-text">
                                                {FLOW_LABELS[selectedLog.flow as keyof typeof FLOW_LABELS]}
                                            </span>
                                        </div>
                                    )}
                                    {selectedLog.mood && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-flow-muted">Mood:</span>
                                            <span className="font-medium text-flow-text">
                                                {selectedLog.mood}
                                            </span>
                                        </div>
                                    )}
                                    {selectedLog.symptoms.length > 0 && (
                                        <div>
                                            <span className="text-flow-muted">Symptoms: </span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {selectedLog.symptoms.map((s) => (
                                                    <span
                                                        key={s}
                                                        className="px-2 py-0.5 bg-flow-surface2 rounded-full text-xs text-flow-text"
                                                    >
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {selectedLog.energy > 0 && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-flow-muted">Energy:</span>
                                            <span className="font-medium text-flow-text font-mono">
                                                {selectedLog.energy}/10
                                            </span>
                                        </div>
                                    )}
                                    {selectedLog.note && (
                                        <div>
                                            <span className="text-flow-muted">Note:</span>
                                            <p className="mt-1 text-flow-text bg-flow-surface2 p-3 rounded-xl text-sm">
                                                {selectedLog.note}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-flow-muted">
                                    No log for this day.{' '}
                                    <a href="/log" className="text-flow-primary hover:underline">
                                        Add one →
                                    </a>
                                </p>
                            )}
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
