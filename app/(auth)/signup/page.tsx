'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Mail, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const { setAuthenticated } = useUserStore();

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock signup — sets auth state and redirects to onboarding
        setAuthenticated(true);
        router.push('/onboarding/step1');
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-b from-flow-bg to-white">
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-sm"
            >
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-flow-primary to-flow-accent flex items-center justify-center">
                        <Heart className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-serif text-2xl font-bold text-flow-text">
                        Lunara
                    </span>
                </div>

                <h2 className="text-2xl font-serif font-bold text-center text-flow-text mb-2">
                    Create your account
                </h2>
                <p className="text-center text-flow-muted mb-8 text-sm">
                    Start understanding your body better
                </p>

                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-flow-text text-sm">
                            Email
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-flow-muted" />
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="pl-10 h-12 rounded-xl bg-white border-[#ECDDD7] focus:ring-flow-primary/50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-flow-text text-sm">
                            Password
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-flow-muted" />
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password"
                                className="pl-10 h-12 rounded-xl bg-white border-[#ECDDD7] focus:ring-flow-primary/50"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-flow-primary to-flow-accent hover:opacity-90 text-white rounded-2xl text-base font-semibold shadow-float"
                    >
                        Create account
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <span className="text-sm text-flow-muted">
                        Already have an account?{' '}
                    </span>
                    <Link
                        href="/login"
                        className="text-sm font-medium text-flow-primary hover:underline"
                    >
                        Log in
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
