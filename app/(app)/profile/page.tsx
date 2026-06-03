'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/userStore';
import { useCycleStore } from '@/store/cycleStore';
import { useLogStore } from '@/store/logStore';
import { useRouter } from 'next/navigation';
import { generateDoctorReport } from '@/lib/generateReport';
import { generateDemoData } from '@/lib/demoData';
import { useMilestoneStore } from '@/store/milestoneStore';
import { MILESTONES } from '@/lib/milestones';
import * as Icons from 'lucide-react';
import {
    User,
    Settings,
    Shield,
    Bell,
    Palette,
    HelpCircle,
    LogOut,
    Heart,
    Trash2,
    Crown,
    ChevronRight,
    FileText,
    Download,
    Database,
} from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage() {
    const { profile, reset: resetUser, setAuthenticated } = useUserStore();
    const cycles = useCycleStore((s) => s.cycles);
    const logs = useLogStore((s) => s.logs);
    const { unlockedMilestones, unlockMilestone } = useMilestoneStore();
    const router = useRouter();
    const [demoLoaded, setDemoLoaded] = useState(false);

    const handleLogout = () => {
        setAuthenticated(false);
        router.push('/welcome');
    };

    const handleDeleteData = () => {
        if (
            confirm(
                'Are you sure you want to delete all your data? This cannot be undone.'
            )
        ) {
            resetUser();
            localStorage.removeItem('flow-cycle-store');
            localStorage.removeItem('flow-log-store');
            localStorage.removeItem('flow-user-store');
            router.push('/welcome');
        }
    };

    const handleExportReport = () => {
        generateDoctorReport({
            userName: profile.name || 'User',
            cycles,
            logs,
            profile: {
                averageCycleLength: profile.averageCycleLength,
                averagePeriodLength: profile.averagePeriodLength,
                hasPcos: profile.hasPcos,
                hasEndometriosis: profile.hasEndometriosis,
                isIrregular: profile.isIrregular,
                dateOfBirth: profile.dateOfBirth,
            },
        });
    };

    const handleLoadDemo = () => {
        const { cycles, logs } = generateDemoData();
        useCycleStore.setState({ cycles });
        useLogStore.setState({ logs });
        
        setDemoLoaded(true);
        setTimeout(() => setDemoLoaded(false), 3000);
    };

    const settingsGroups = [
        {
            title: 'Account',
            items: [
                {
                    icon: User,
                    label: 'Personal Info',
                    description: `${profile.name || 'Not set'} · Cycle: ${profile.averageCycleLength} days`,
                    color: '#E8A598',
                },
                {
                    icon: Crown,
                    label: 'Subscription',
                    description:
                        profile.subscriptionTier === 'free'
                            ? 'Free plan'
                            : 'Pro plan',
                    color: '#E8C07A',
                },
            ],
        },
        {
            title: 'Preferences',
            items: [
                {
                    icon: Bell,
                    label: 'Notifications',
                    description: 'Period reminders, phase changes',
                    color: '#7BAE8A',
                },
                {
                    icon: Palette,
                    label: 'Appearance',
                    description: 'Theme and display settings',
                    color: '#C9B8D8',
                },
            ],
        },
        {
            title: 'Support',
            items: [
                {
                    icon: Shield,
                    label: 'Privacy & Security',
                    description:
                        'Local-only storage · Zero third-party trackers · GDPR compliant',
                    color: '#6B8CAE',
                },
                {
                    icon: HelpCircle,
                    label: 'Help & FAQ',
                    description: 'Get support and answers',
                    color: '#8C7B75',
                },
            ],
        },
    ];

    return (
        <div className="space-y-6 max-w-lg mx-auto">
            {/* Profile header */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-col items-center text-center pt-4"
            >
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-flow-primary to-flow-secondary flex items-center justify-center text-white text-2xl font-serif font-bold mb-3 shadow-float">
                    {(profile.name || 'P').charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-serif font-bold text-flow-text">
                    {profile.name || 'Your Profile'}
                </h2>
                <p className="text-sm text-flow-muted mt-0.5">
                    {profile.subscriptionTier === 'free'
                        ? '✨ Free plan'
                        : '👑 Pro plan'}
                </p>
            </motion.div>

            {/* Upgrade banner (free users) */}
            {profile.subscriptionTier === 'free' && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="p-4 rounded-2xl bg-gradient-to-r from-flow-primary to-flow-accent border-0 text-white shadow-md">
                        <div className="flex items-center gap-3">
                            <Crown className="w-8 h-8 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-sm">
                                    Upgrade to Pro
                                </h3>
                                <p className="text-xs text-white/80 mt-0.5">
                                    Unlock AI companion, advanced insights, and
                                    unlimited history
                                </p>
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-xl text-xs"
                            >
                                ₹149/mo
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Milestones */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.12 }}
            >
                <div className="flex items-center justify-between px-1 mb-2">
                    <p className="text-xs text-flow-muted uppercase tracking-wide font-medium">
                        Your Milestones
                    </p>
                    <p className="text-xs text-flow-primary font-medium bg-flow-primary/10 px-2 py-0.5 rounded-full">
                        {Object.keys(unlockedMilestones).length} / {MILESTONES.length}
                    </p>
                </div>
                <Card className="p-4 rounded-2xl border-[#ECDDD7]/50 bg-white shadow-sm overflow-hidden">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {MILESTONES.map((milestone) => {
                            const earnedDate = unlockedMilestones[milestone.id];
                            const isEarned = !!earnedDate;
                            // @ts-ignore - Dynamic icon
                            const IconComponent = Icons[milestone.icon] || Icons.Star;
                            
                            return (
                                <div 
                                    key={milestone.id} 
                                    className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${
                                        isEarned 
                                        ? 'bg-flow-surface2/30 border-flow-primary/20' 
                                        : 'bg-flow-bg/30 border-transparent opacity-50 grayscale'
                                    }`}
                                >
                                    <div 
                                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 shadow-sm"
                                        style={{ backgroundColor: isEarned ? milestone.color : '#D1C8D4' }}
                                    >
                                        <IconComponent className="w-5 h-5 text-white" strokeWidth={1.5} />
                                    </div>
                                    <p className={`text-[10px] font-bold text-center mb-1 leading-tight ${isEarned ? 'text-flow-text' : 'text-flow-muted'}`}>
                                        {milestone.title}
                                    </p>
                                    <p className="text-[9px] text-center text-flow-muted">
                                        {isEarned ? new Date(earnedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Locked'}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </motion.div>

            {/* Settings groups */}
            {settingsGroups.map((group, gi) => (
                <motion.div
                    key={group.title}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15 + gi * 0.05 }}
                >
                    <p className="text-xs text-flow-muted uppercase tracking-wide font-medium mb-2 px-1">
                        {group.title}
                    </p>
                    <Card className="rounded-2xl border-[#ECDDD7]/50 bg-white overflow-hidden divide-y divide-[#ECDDD7]/30">
                        {group.items.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.label}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-flow-surface2/50 flow-transition text-left"
                                >
                                    <div
                                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{
                                            backgroundColor: `${item.color}20`,
                                        }}
                                    >
                                        <Icon
                                            className="w-4.5 h-4.5"
                                            style={{ color: item.color }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-flow-text">
                                            {item.label}
                                        </p>
                                        <p className="text-xs text-flow-muted truncate">
                                            {item.description}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-flow-muted flex-shrink-0" />
                                </button>
                            );
                        })}
                    </Card>
                </motion.div>
            ))}

            {/* Health Export */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <p className="text-xs text-flow-muted uppercase tracking-wide font-medium mb-2 px-1">
                    Health Export
                </p>
                <Card className="rounded-2xl border-[#ECDDD7]/50 bg-white overflow-hidden">
                    <button
                        onClick={handleExportReport}
                        disabled={cycles.length === 0 && logs.length === 0}
                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-flow-surface2/50 flow-transition text-left disabled:opacity-40"
                    >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#6B8CAE]/10">
                            <FileText className="w-4 h-4 text-[#6B8CAE]" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-flow-text">
                                Doctor Report PDF
                            </p>
                            <p className="text-xs text-flow-muted">
                                Download your cycle data for your next
                                appointment
                            </p>
                        </div>
                        <Download className="w-4 h-4 text-flow-muted" />
                    </button>
                </Card>
            </motion.div>

            {/* Danger zone */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="space-y-2 pb-8"
            >
                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start gap-3 text-flow-muted hover:text-flow-text rounded-xl h-12"
                >
                    <LogOut className="w-4 h-4" />
                    Log out
                </Button>
                <Button
                    variant="ghost"
                    onClick={handleDeleteData}
                    className="w-full justify-start gap-3 text-flow-error hover:text-flow-error/80 hover:bg-flow-error/5 rounded-xl h-12"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete all my data
                </Button>

                {/* Demo Data Loader */}
                <button
                    onClick={handleLoadDemo}
                    className="w-full text-center text-xs text-flow-muted/50 hover:text-flow-muted py-2 flow-transition flex items-center justify-center gap-1.5"
                >
                    <Database className="w-3 h-3" />
                    {demoLoaded ? '✓ Demo data loaded!' : 'Load demo data (hackathon mode)'}
                </button>

                <p className="text-[10px] text-flow-muted/60 text-center px-4">
                    Your data is stored locally on this device and is never
                    shared with third parties. Vihaan is built with privacy at
                    its core. ❤️
                </p>
            </motion.div>
        </div>
    );
}
