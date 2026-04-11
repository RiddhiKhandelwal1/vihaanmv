'use client';

import { motion } from 'framer-motion';
import { Heart, ArrowRight, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GradientText } from '@/components/ui/GradientText';
import { DEMO_PROFILES, loadDemoProfile, DemoProfile } from '@/lib/demoProfiles';
import { useUserStore } from '@/store/userStore';
import { useCycleStore } from '@/store/cycleStore';
import { useLogStore } from '@/store/logStore';

export default function WelcomePage() {
    const router = useRouter();
    const { setProfile, setAuthenticated, completeOnboarding } = useUserStore();

    const handleSelectProfile = (profile: DemoProfile) => {
        const { cycles, logs, userProfile } = loadDemoProfile(profile);

        // Load user profile
        setProfile(userProfile);
        completeOnboarding();
        setAuthenticated(true);

        // Load cycle and log data directly via setState
        useCycleStore.setState({ cycles });
        useLogStore.setState({ logs });

        router.push('/home');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-flow-bg via-white to-flow-bg flex flex-col items-center px-4 sm:px-6 py-10 relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-20 -left-20 w-64 h-64 bg-flow-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 -right-20 w-80 h-80 bg-flow-secondary/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-flow-accent/10 rounded-full blur-3xl" />

            {/* Header */}
            <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                className="relative z-10 flex flex-col items-center text-center max-w-2xl mb-10"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2, bounce: 0.4 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-flow-primary to-flow-accent shadow-float flex items-center justify-center mb-6"
                >
                    <Heart className="w-8 h-8 text-white" strokeWidth={2} />
                </motion.div>

                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl sm:text-4xl font-serif font-bold text-flow-text mb-3 leading-tight"
                >
                    Welcome to{' '}
                    <GradientText from="#E8A598" to="#C9B8D8">
                        Vihaan
                    </GradientText>
                </motion.h1>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="text-sm sm:text-base text-flow-muted max-w-md"
                >
                    Choose a demo profile to explore instantly, or create your own account.
                </motion.p>
            </motion.div>

            {/* Demo Profile Grid */}
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="relative z-10 w-full max-w-3xl"
            >
                <p className="text-xs text-flow-muted uppercase tracking-wide font-medium mb-3 px-1">
                    <Sparkles className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                    Demo Profiles — click to explore
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {DEMO_PROFILES.map((profile, index) => (
                        <motion.div
                            key={profile.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7 + index * 0.07 }}
                        >
                            <Card
                                onClick={() => handleSelectProfile(profile)}
                                className="relative overflow-hidden rounded-2xl border-[#ECDDD7]/50 bg-white p-4 cursor-pointer hover:shadow-float flow-transition group"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-serif font-bold shadow-sm flex-shrink-0"
                                        style={{
                                            background: `linear-gradient(135deg, ${profile.color}, ${profile.colorEnd})`,
                                        }}
                                    >
                                        {profile.avatar}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-flow-text truncate group-hover:text-flow-primary flow-transition">
                                            {profile.name}
                                        </p>
                                        <p className="text-[11px] text-flow-muted truncate">
                                            {profile.tagline}
                                        </p>
                                    </div>
                                </div>
                                {profile.conditions.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {profile.conditions.map((c) => (
                                            <span
                                                key={c}
                                                className="text-[10px] px-2 py-0.5 rounded-full bg-flow-surface2 text-flow-muted"
                                            >
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {profile.conditions.length === 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {profile.goals.slice(0, 2).map((g) => (
                                            <span
                                                key={g}
                                                className="text-[10px] px-2 py-0.5 rounded-full bg-flow-surface2 text-flow-muted"
                                            >
                                                {g}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div
                                    className="absolute top-0 right-0 w-16 h-16 rounded-full -translate-y-6 translate-x-6 opacity-10"
                                    style={{ backgroundColor: profile.color }}
                                />
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Divider */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="relative z-10 flex items-center gap-4 my-8 w-full max-w-3xl"
            >
                <div className="flex-1 h-px bg-[#ECDDD7]" />
                <span className="text-xs text-flow-muted">or</span>
                <div className="flex-1 h-px bg-[#ECDDD7]" />
            </motion.div>

            {/* New User CTA */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="relative z-10 w-full max-w-3xl"
            >
                <Link href="/onboarding" className="block">
                    <Card className="p-4 rounded-2xl border-[#ECDDD7]/50 bg-white hover:shadow-float flow-transition cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-flow-primary/20 to-flow-accent/10 flex items-center justify-center flex-shrink-0 group-hover:from-flow-primary/30 flow-transition">
                                <Plus className="w-5 h-5 text-flow-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-flow-text group-hover:text-flow-primary flow-transition">
                                    Create New Account
                                </p>
                                <p className="text-xs text-flow-muted">
                                    Set up your own profile with custom cycle data
                                </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-flow-muted group-hover:text-flow-primary flow-transition" />
                        </div>
                    </Card>
                </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="flex items-center gap-4 mt-8 text-xs text-flow-muted/60 relative z-10"
            >
                <span>🔒 Private by design</span>
                <span>·</span>
                <span>✨ AI-powered</span>
                <span>·</span>
                <span>❤️ Made for women</span>
            </motion.div>
        </div>
    );
}
