'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useCycleStore } from '@/store/cycleStore';
import { useLogStore } from '@/store/logStore';
import { CycleEngine } from '@/lib/cycleEngine';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';

const CHART_COLORS = ['#E8A598', '#C9B8D8', '#7BAE8A', '#E8C07A', '#F2C4CE', '#D4537E'];

export default function InsightsPage() {
    const cycles = useCycleStore((s) => s.cycles);
    const logs = useLogStore((s) => s.logs);

    // Cycle length trend data
    const cycleLengthData = useMemo(() => {
        return cycles
            .filter((c) => c.length)
            .map((c, i) => ({
                name: `Cycle ${i + 1}`,
                length: c.length,
                avg: CycleEngine.calculateAdaptiveCycleLength(cycles.slice(0, i + 1)),
            }));
    }, [cycles]);

    // Mood distribution
    const moodData = useMemo(() => {
        const counts: Record<string, number> = {};
        logs.forEach((log) => {
            if (log.mood) {
                counts[log.mood] = (counts[log.mood] || 0) + 1;
            }
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [logs]);

    // Symptom frequency
    const symptomData = useMemo(() => {
        const counts: Record<string, number> = {};
        logs.forEach((log) => {
            log.symptoms.forEach((s) => {
                if (s !== 'None') {
                    counts[s] = (counts[s] || 0) + 1;
                }
            });
        });
        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);
    }, [logs]);

    // Energy by phase (radar)
    const energyByPhase = useMemo(() => {
        const phaseEnergy: Record<string, { total: number; count: number }> = {
            Menstrual: { total: 0, count: 0 },
            Follicular: { total: 0, count: 0 },
            Ovulatory: { total: 0, count: 0 },
            Luteal: { total: 0, count: 0 },
        };

        logs.forEach((log) => {
            if (log.energy) {
                // Simple approximation based on cycle position
                const logDate = new Date(log.date);
                const cycleDayMap = CycleEngine.buildCycleDayMap(cycles, [log]);
                const entry = cycleDayMap.get(log.id);
                if (entry) {
                    const { phase } = CycleEngine.determinePhase(
                        entry.cycleDay,
                        28,
                        5
                    );
                    const phaseName = phase.charAt(0).toUpperCase() + phase.slice(1);
                    if (phaseEnergy[phaseName]) {
                        phaseEnergy[phaseName].total += log.energy;
                        phaseEnergy[phaseName].count += 1;
                    }
                }
            }
        });

        return Object.entries(phaseEnergy).map(([phase, data]) => ({
            phase,
            energy: data.count > 0 ? Math.round((data.total / data.count) * 10) / 10 : 5,
        }));
    }, [logs, cycles]);

    // Cycle regularity score
    const regularityScore = useMemo(() => {
        if (cycles.length < 2) return null;
        const lengths = cycles.filter((c) => c.length).map((c) => c.length!);
        if (lengths.length < 2) return null;
        const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const variance =
            lengths.reduce((sum, l) => sum + Math.pow(l - mean, 2), 0) / lengths.length;
        const sd = Math.sqrt(variance);
        const score = Math.max(0, Math.min(100, Math.round(100 - sd * 10)));
        return score;
    }, [cycles]);

    const hasData = logs.length > 0 || cycles.length > 0;

    if (!hasData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-flow-surface2 flex items-center justify-center mb-4">
                    <BarChart3 className="w-8 h-8 text-flow-muted" />
                </div>
                <h2 className="text-xl font-serif font-bold text-flow-text mb-2">
                    No insights yet
                </h2>
                <p className="text-flow-muted text-sm max-w-xs">
                    Start logging your daily symptoms, mood, and flow to see patterns and
                    trends emerge over time.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-serif font-bold text-flow-text">
                    Insights
                </h1>
                <p className="text-sm text-flow-muted mt-1">
                    Patterns and trends from your cycle data
                </p>
            </div>

            {/* Regularity Score */}
            {regularityScore !== null && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <Card className="p-6 rounded-2xl border-[#ECDDD7]/50 bg-gradient-to-br from-white to-flow-surface2">
                        <div className="flex items-center gap-6">
                            <div className="relative w-24 h-24">
                                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="42"
                                        fill="none"
                                        stroke="#ECDDD7"
                                        strokeWidth="8"
                                    />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="42"
                                        fill="none"
                                        stroke="#E8A598"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={`${(regularityScore / 100) * 264} 264`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-mono font-bold text-flow-text">
                                        {regularityScore}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-serif font-semibold text-flow-text">
                                    Cycle Regularity
                                </h3>
                                <p className="text-sm text-flow-muted mt-1">
                                    {regularityScore >= 80
                                        ? 'Your cycle is very regular! Great consistency.'
                                        : regularityScore >= 50
                                            ? 'Your cycle has some variability — this is quite common.'
                                            : 'Your cycle varies significantly. Consider tracking more data.'}
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cycle Length Trend */}
                {cycleLengthData.length > 0 && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <Card className="p-5 rounded-2xl border-[#ECDDD7]/50 bg-white">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-4 h-4 text-flow-primary" />
                                <h3 className="text-sm font-semibold text-flow-text">
                                    Cycle Length Trend
                                </h3>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={cycleLengthData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ECDDD7" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8C7B75' }} />
                                    <YAxis tick={{ fontSize: 11, fill: '#8C7B75' }} domain={['auto', 'auto']} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #ECDDD7',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="length"
                                        stroke="#E8A598"
                                        strokeWidth={2}
                                        dot={{ fill: '#E8A598', r: 4 }}
                                        animationDuration={1000}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="avg"
                                        stroke="#C9B8D8"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        dot={false}
                                        animationDuration={1200}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    </motion.div>
                )}

                {/* Mood Distribution */}
                {moodData.length > 0 && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <Card className="p-5 rounded-2xl border-[#ECDDD7]/50 bg-white">
                            <div className="flex items-center gap-2 mb-4">
                                <PieChartIcon className="w-4 h-4 text-flow-secondary" />
                                <h3 className="text-sm font-semibold text-flow-text">
                                    Mood Distribution
                                </h3>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={moodData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        innerRadius={40}
                                        animationDuration={1000}
                                    >
                                        {moodData.map((_, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #ECDDD7',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap gap-2 mt-2 justify-center">
                                {moodData.slice(0, 5).map((m, i) => (
                                    <span
                                        key={m.name}
                                        className="flex items-center gap-1 text-xs text-flow-muted"
                                    >
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                                        />
                                        {m.name}
                                    </span>
                                ))}
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* Symptom Frequency */}
                {symptomData.length > 0 && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <Card className="p-5 rounded-2xl border-[#ECDDD7]/50 bg-white">
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart3 className="w-4 h-4 text-flow-success" />
                                <h3 className="text-sm font-semibold text-flow-text">
                                    Top Symptoms
                                </h3>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={symptomData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ECDDD7" />
                                    <XAxis type="number" tick={{ fontSize: 11, fill: '#8C7B75' }} />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        tick={{ fontSize: 11, fill: '#8C7B75' }}
                                        width={90}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #ECDDD7',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                        }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="#C9B8D8"
                                        radius={[0, 6, 6, 0]}
                                        animationDuration={1000}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </motion.div>
                )}

                {/* Energy by Phase (Radar) */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <Card className="p-5 rounded-2xl border-[#ECDDD7]/50 bg-white">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="w-4 h-4 text-flow-warning" />
                            <h3 className="text-sm font-semibold text-flow-text">
                                Energy by Phase
                            </h3>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <RadarChart data={energyByPhase} cx="50%" cy="50%" outerRadius="70%">
                                <PolarGrid stroke="#ECDDD7" />
                                <PolarAngleAxis
                                    dataKey="phase"
                                    tick={{ fontSize: 11, fill: '#8C7B75' }}
                                />
                                <PolarRadiusAxis
                                    angle={90}
                                    domain={[0, 10]}
                                    tick={{ fontSize: 9, fill: '#8C7B75' }}
                                />
                                <Radar
                                    name="Energy"
                                    dataKey="energy"
                                    stroke="#E8A598"
                                    fill="#E8A598"
                                    fillOpacity={0.3}
                                    animationDuration={1000}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #ECDDD7',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                    }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
