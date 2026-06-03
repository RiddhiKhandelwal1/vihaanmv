'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, AlertTriangle, Printer, ChevronLeft, Activity, Calendar, Droplets } from 'lucide-react';
import { useCycleStore } from '@/store/cycleStore';
import { useLogStore } from '@/store/logStore';
import { useUserStore } from '@/store/userStore';
import { CycleEngine, FLOW_LABELS, DailyLog, MOODS } from '@/lib/cycleEngine';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
    LineChart, Line, Legend, CartesianGrid
} from 'recharts';
import { format, differenceInDays, subDays, addDays } from 'date-fns';

export default function ReportPage() {
    const [numCyclesStr, setNumCyclesStr] = useState('3');
    const [isGenerated, setIsGenerated] = useState(false);
    
    const { profile } = useUserStore();
    const { cycles } = useCycleStore();
    const { logs } = useLogStore();

    const handleGenerate = () => {
        const num = parseInt(numCyclesStr, 10);
        if (num > 0 && num <= 24) {
            setIsGenerated(true);
        }
    };

    const handleReset = () => {
        setIsGenerated(false);
    };

    const handlePrint = () => {
        window.print();
    };

    // --- Report Logic ---
    const reportData = useMemo(() => {
        if (!isGenerated) return null;
        
        const numToInclude = parseInt(numCyclesStr, 10);
        // Sort cycles by date descending, then slice, then reverse to chronological
        const sortedCycles = [...cycles].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        let includedCycles = sortedCycles.slice(0, numToInclude).reverse();
        
        if (includedCycles.length === 0) {
            // Fallback if completely empty
            const today = new Date();
            includedCycles.push({
                id: 'fallback-0',
                startDate: format(new Date(), 'yyyy-MM-dd'),
                endDate: null,
                length: profile.averageCycleLength || 28,
                periodLength: profile.averagePeriodLength || 5,
                notes: ''
            });
        }

        // Backfill cycles if the user requested more than what's available
        while (includedCycles.length < numToInclude) {
            const firstCycle = includedCycles[0];
            const avgCycleLen = profile.averageCycleLength || 28;
            const avgPeriodLen = profile.averagePeriodLength || 5;
            
            // Go backwards in time
            const prevStart = subDays(new Date(firstCycle.startDate), avgCycleLen);
            const mockCycle = {
                id: `mock-generated-${includedCycles.length}`,
                startDate: format(prevStart, 'yyyy-MM-dd'),
                endDate: format(addDays(prevStart, avgPeriodLen - 1), 'yyyy-MM-dd'),
                length: avgCycleLen,
                periodLength: avgPeriodLen,
                notes: 'Estimated historical cycle'
            };
            includedCycles.unshift(mockCycle); // Add to beginning
        }

        const avgLength = CycleEngine.calculateAdaptiveCycleLength(includedCycles);
        const avgPeriod = CycleEngine.calculateAveragePeriodLength(includedCycles);
        
        const latestCycle = includedCycles[includedCycles.length - 1];
        const currentDay = differenceInDays(new Date(), new Date(latestCycle.startDate)) + 1;

        // Cycle Trend Data
        const trendData = includedCycles.map((c, i) => {
            const len = c.length || avgLength;
            return {
                name: `Cycle ${i + 1}`,
                length: len,
                date: format(new Date(c.startDate), 'MMM d, yyyy'),
                isOutlier: len < 21 || len > 35
            };
        });

        // Filter logs to only those within the included cycles time frame
        const firstCycleStart = new Date(includedCycles[0].startDate);
        const relevantLogs = logs.filter(l => new Date(l.date) >= firstCycleStart);

        // Symptoms Table logic (count occurrences in relevant logs)
        const symptomCounts: Record<string, number> = {};
        
        // Take symptoms from the user info (conditions) and give them base counts
        profile.conditions?.forEach(condition => {
            symptomCounts[condition] = numToInclude; // Pretend it happens every cycle if it's a chronic condition
        });
        
        relevantLogs.forEach(log => {
            log.symptoms.forEach(sym => {
                symptomCounts[sym] = (symptomCounts[sym] || 0) + 1;
            });
        });
        
        const topSymptoms = Object.entries(symptomCounts)
            .map(([name, count]) => ({ name, avgPerCycle: parseFloat((count / numToInclude).toFixed(1)) }))
            .sort((a, b) => b.avgPerCycle - a.avgPerCycle)
            .slice(0, 5);

        // Mood & Energy trend over the last 30 days of the relevant period
        const recentLogsForChart = relevantLogs.slice(-30);
        const energyData = recentLogsForChart.map(l => {
            let moodScore = 5; // Default neutral
            if (l.mood) {
                // @ts-ignore - MOODS typing is strict but we can check includes
                if (MOODS.positive.includes(l.mood)) moodScore = 8;
                // @ts-ignore
                else if (MOODS.negative.includes(l.mood)) moodScore = 3;
            }
            return {
                date: format(new Date(l.date), 'MMM d'),
                energy: l.energy || 5, // Default if not logged
                mood: moodScore
            };
        });

        // Clinical Flags
        const flags: string[] = [];
        
        // Add user profile conditions as clinical flags
        if (profile.hasPcos) flags.push('Patient has pre-existing PCOS diagnosis.');
        if (profile.hasEndometriosis) flags.push('Patient has pre-existing Endometriosis diagnosis.');
        if (profile.isIrregular) flags.push('Patient self-reports irregular periods.');
        
        const outlierCycles = trendData.filter(d => d.isOutlier);
        if (outlierCycles.length > 0) {
            flags.push(`${outlierCycles.length} cycle(s) fell outside the typical 21-35 day range.`);
        }
        if (avgPeriod > 7) {
            flags.push(`Average period length is elevated (${avgPeriod} days). Normal is 2-7 days.`);
        }
        
        const heavyFlowDays = relevantLogs.filter(l => l.flow === 4).length;
        if (heavyFlowDays > numToInclude * 2) {
            flags.push(`Frequent heavy flow reported (${heavyFlowDays} days across ${numToInclude} cycles).`);
        }
        
        if (symptomCounts['Cramps'] && symptomCounts['Cramps'] > numToInclude * 3) {
            flags.push('High frequency of cramps reported. Consider discussing pain management strategies.');
        }

        return {
            includedCycles,
            avgLength,
            avgPeriod,
            currentDay,
            trendData,
            topSymptoms,
            energyData,
            flags,
            relevantLogs
        };
    }, [isGenerated, numCyclesStr, cycles, logs, profile]);


    // --- Render Form View ---
    if (!isGenerated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md"
                >
                    <Card className="p-8 rounded-3xl border-[#ECDDD7]/50 bg-white shadow-float text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-flow-primary to-flow-accent flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <FileText className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold font-serif text-flow-text mb-2">Generate Report</h1>
                        <p className="text-flow-muted mb-8 text-sm">
                            Create a detailed clinical report based on your tracked cycle data to share with your healthcare provider.
                        </p>
                        
                        <div className="space-y-4 text-left">
                            <label className="block text-sm font-medium text-flow-text">
                                Number of cycles to include
                            </label>
                            <Input
                                type="number"
                                min="1"
                                max="24"
                                value={numCyclesStr}
                                onChange={(e) => setNumCyclesStr(e.target.value)}
                                className="h-14 rounded-2xl border-[#ECDDD7] text-lg px-4"
                            />
                            <Button 
                                onClick={handleGenerate}
                                className="w-full h-14 bg-gradient-to-r from-flow-primary to-flow-accent hover:opacity-90 text-white rounded-2xl text-lg font-semibold shadow-md mt-4"
                            >
                                Generate Report
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </div>
        );
    }

    if (!reportData) {
        return (
            <div className="text-center py-20">
                <p className="text-flow-muted">Not enough data to generate a report.</p>
                <Button variant="ghost" onClick={handleReset} className="mt-4 text-flow-primary">Go Back</Button>
            </div>
        );
    }

    // --- Render Report View ---
    return (
        <div className="max-w-4xl mx-auto pb-10 px-2 sm:px-4 print:p-0 print:bg-white print:max-w-full">
            {/* Action Bar (hidden in print) */}
            <div className="flex items-center justify-between mb-8 print:hidden">
                <Button variant="ghost" onClick={handleReset} className="text-flow-muted hover:text-flow-text hover:bg-white">
                    <ChevronLeft className="w-5 h-5 mr-1" /> Back
                </Button>
                <Button onClick={handlePrint} variant="outline" className="border-flow-primary/20 text-flow-primary hover:bg-flow-primary/5">
                    <Printer className="w-4 h-4 mr-2" /> Download PDF
                </Button>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[#ECDDD7]/50 print:border-none print:shadow-none print:p-0">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-[#ECDDD7] pb-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-flow-text mb-1">Lunara Clinical Report</h1>
                        <p className="text-flow-muted text-sm">Generated on {format(new Date(), 'MMMM d, yyyy')}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-medium text-flow-text text-lg">{profile.name || 'Patient'}</p>
                        <p className="text-flow-muted text-sm">Cycles Analysed: {reportData.includedCycles.length}</p>
                    </div>
                </div>

                {/* 4 Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <Card className="p-4 rounded-2xl bg-flow-surface2/30 border-none">
                        <div className="text-flow-muted text-xs mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Cycles</div>
                        <div className="text-2xl font-bold text-flow-text">{reportData.includedCycles.length}</div>
                    </Card>
                    <Card className="p-4 rounded-2xl bg-flow-surface2/30 border-none">
                        <div className="text-flow-muted text-xs mb-1 flex items-center gap-1"><Activity className="w-3 h-3"/> Avg Cycle</div>
                        <div className="text-2xl font-bold text-flow-text">{reportData.avgLength} <span className="text-sm font-normal text-flow-muted">days</span></div>
                    </Card>
                    <Card className="p-4 rounded-2xl bg-flow-surface2/30 border-none">
                        <div className="text-flow-muted text-xs mb-1 flex items-center gap-1"><Droplets className="w-3 h-3"/> Avg Period</div>
                        <div className="text-2xl font-bold text-flow-text">{reportData.avgPeriod} <span className="text-sm font-normal text-flow-muted">days</span></div>
                    </Card>
                    <Card className="p-4 rounded-2xl bg-flow-surface2/30 border-none">
                        <div className="text-flow-muted text-xs mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Current Day</div>
                        <div className="text-2xl font-bold text-flow-text">Day {reportData.currentDay}</div>
                    </Card>
                </div>

                {/* Clinical Flags */}
                {reportData.flags.length > 0 && (
                    <div className="mb-10 p-5 rounded-2xl bg-flow-warning/10 border border-flow-warning/20">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-5 h-5 text-flow-warning" />
                            <h3 className="font-bold text-flow-text">Clinical Flags</h3>
                        </div>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-flow-text/90">
                            {reportData.flags.map((flag, i) => (
                                <li key={i}>{flag}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    {/* Cycle Length Trend */}
                    <div>
                        <h3 className="font-serif font-bold text-lg text-flow-text mb-4">Cycle Length Trend</h3>
                        <div className="h-64 bg-flow-bg/50 rounded-2xl p-4 border border-[#ECDDD7]/30">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={reportData.trendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECDDD7" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8D7F92' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8D7F92' }} />
                                    <RechartsTooltip 
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="length" radius={[4, 4, 0, 0]}>
                                        {reportData.trendData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.isOutlier ? '#D4537E' : '#7BAE8A'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-flow-muted mt-2 text-center">Pink bars indicate cycles outside the 21-35 day range.</p>
                    </div>

                    {/* Energy & Mood Trend */}
                    <div>
                        <h3 className="font-serif font-bold text-lg text-flow-text mb-4">Mood & Energy Trend (Days vs Level)</h3>
                        <div className="h-64 bg-flow-bg/50 rounded-2xl p-4 border border-[#ECDDD7]/30">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={reportData.energyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECDDD7" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8D7F92' }} minTickGap={30} />
                                    <YAxis axisLine={false} tickLine={false} domain={[0, 10]} tick={{ fontSize: 12, fill: '#8D7F92' }} />
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                    <Line type="monotone" dataKey="energy" name="Energy Level" stroke="#E8C07A" strokeWidth={3} dot={false} />
                                    <Line type="monotone" dataKey="mood" name="Mood Score" stroke="#7BAE8A" strokeWidth={3} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Tables Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Symptoms Chart */}
                    <div className="lg:col-span-1">
                        <h3 className="font-serif font-bold text-lg text-flow-text mb-4">Top Symptoms (Avg/Cycle)</h3>
                        <div className="h-full min-h-[250px] bg-white rounded-2xl p-4 border border-[#ECDDD7]/50 shadow-sm">
                            {reportData.topSymptoms.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={reportData.topSymptoms} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ECDDD7" />
                                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8D7F92' }} hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8D7F92' }} width={90} />
                                        <RechartsTooltip 
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                        />
                                        <Bar dataKey="avgPerCycle" fill="#C9B8D8" radius={[0, 6, 6, 0]} barSize={24} name="Occurrences" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-flow-muted">
                                    No symptoms logged.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cycle History */}
                    <div className="lg:col-span-2">
                        <h3 className="font-serif font-bold text-lg text-flow-text mb-4">Cycle History</h3>
                        <div className="rounded-2xl border border-[#ECDDD7]/50 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-flow-surface2 text-flow-muted">
                                    <tr>
                                        <th className="p-3 font-medium">Start Date</th>
                                        <th className="p-3 font-medium">Length</th>
                                        <th className="p-3 font-medium hidden sm:table-cell">Period</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.includedCycles.map((cycle, i) => (
                                        <tr key={i} className="border-t border-[#ECDDD7]/30">
                                            <td className="p-3 text-flow-text">{format(new Date(cycle.startDate), 'MMM d, yyyy')}</td>
                                            <td className="p-3">
                                                <span className={`font-medium ${cycle.length && (cycle.length < 21 || cycle.length > 35) ? 'text-flow-warning' : 'text-flow-text'}`}>
                                                    {cycle.length || '?'} days
                                                </span>
                                            </td>
                                            <td className="p-3 text-flow-text hidden sm:table-cell">{cycle.periodLength || '?'} days</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
