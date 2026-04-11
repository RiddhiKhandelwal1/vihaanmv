'use client';

import { motion } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { GradientText } from '@/components/ui/GradientText';

export default function WelcomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-flow-bg via-white to-flow-bg flex flex-col items-center justify-center px-6 relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-20 -left-20 w-64 h-64 bg-flow-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 -right-20 w-80 h-80 bg-flow-secondary/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-flow-accent/10 rounded-full blur-3xl" />

            <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                className="relative z-10 flex flex-col items-center text-center max-w-md"
            >
                {/* Logo */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2, bounce: 0.4 }}
                    className="w-20 h-20 rounded-3xl bg-gradient-to-br from-flow-primary to-flow-accent shadow-float flex items-center justify-center mb-8"
                >
                    <Heart className="w-10 h-10 text-white" strokeWidth={2} />
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-4xl sm:text-5xl font-serif font-bold text-flow-text mb-4 leading-tight"
                >
                    Your body has a{' '}
                    <GradientText from="#E8A598" to="#C9B8D8">
                        rhythm
                    </GradientText>
                </motion.h1>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.55 }}
                    className="text-lg text-flow-muted mb-2 leading-relaxed"
                >
                    Let&apos;s learn it together.
                </motion.p>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.65 }}
                    className="text-sm text-flow-muted/70 mb-10 max-w-xs"
                >
                    Intelligent cycle tracking, mood insights, and a personalised AI
                    companion — designed for the way your body works.
                </motion.p>

                {/* CTA buttons */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-col gap-3 w-full"
                >
                    <Link href="/signup" className="w-full">
                        <Button className="w-full h-12 bg-gradient-to-r from-flow-primary to-flow-accent hover:opacity-90 text-white rounded-2xl text-base font-semibold shadow-float flow-transition">
                            Get started
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                    <Link href="/login" className="w-full">
                        <Button
                            variant="ghost"
                            className="w-full h-12 text-flow-muted hover:text-flow-text rounded-2xl text-base"
                        >
                            I already have an account
                        </Button>
                    </Link>
                </motion.div>

                {/* Trust badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="flex items-center gap-4 mt-10 text-xs text-flow-muted/60"
                >
                    <span>🔒 Private by design</span>
                    <span>·</span>
                    <span>✨ AI-powered</span>
                    <span>·</span>
                    <span>❤️ Made for women</span>
                </motion.div>
            </motion.div>
        </div>
    );
}
