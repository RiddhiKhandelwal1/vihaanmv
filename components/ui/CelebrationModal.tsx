'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMilestoneStore } from '@/store/milestoneStore';
import { MILESTONES } from '@/lib/milestones';
import * as Icons from 'lucide-react';
import { Button } from './button';

export function CelebrationModal() {
    const { newlyEarnedMilestoneId, clearNewlyEarned } = useMilestoneStore();

    const milestone = newlyEarnedMilestoneId 
        ? MILESTONES.find(m => m.id === newlyEarnedMilestoneId)
        : null;

    useEffect(() => {
        if (newlyEarnedMilestoneId) {
            // Optional: play a celebration sound or trigger confetti here if we had a library for it
        }
    }, [newlyEarnedMilestoneId]);

    return (
        <AnimatePresence>
            {milestone && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-white"
                >
                    {/* Animated background blobs */}
                    <motion.div
                        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-30"
                        style={{ backgroundColor: milestone.color }}
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-20"
                        style={{ backgroundColor: milestone.color }}
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    />

                    <div className="relative z-10 flex flex-col items-center justify-center p-8 max-w-md text-center">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ 
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                                delay: 0.2
                            }}
                            className="w-32 h-32 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl"
                            style={{ 
                                background: `linear-gradient(135deg, ${milestone.color}80, ${milestone.color})`,
                                boxShadow: `0 20px 40px -10px ${milestone.color}60`
                            }}
                        >
                            {/* @ts-ignore - Dynamic icon rendering */}
                            {(() => {
                                const IconComponent = (Icons as any)[milestone.icon] || Icons.Star;
                                return <IconComponent className="w-16 h-16 text-white" strokeWidth={1.5} />;
                            })()}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: milestone.color }}>
                                Milestone Unlocked
                            </p>
                            <h2 className="text-4xl font-serif font-bold text-flow-text mb-4 leading-tight">
                                {milestone.title}
                            </h2>
                            <p className="text-lg text-flow-muted mb-10">
                                {milestone.description}
                            </p>

                            <Button 
                                onClick={clearNewlyEarned}
                                className="h-14 px-10 rounded-2xl text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                                style={{ backgroundColor: milestone.color }}
                            >
                                Continue
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
