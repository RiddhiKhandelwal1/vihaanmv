'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Calendar, Plus, BarChart3, User } from 'lucide-react';

const navItems = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/log', label: 'Log', icon: Plus, isAction: true },
    { href: '/insights', label: 'Insights', icon: BarChart3 },
    { href: '/profile', label: 'Profile', icon: User },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#ECDDD7] safe-area-pb">
            <div className="flex items-center justify-around px-2 h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    if (item.isAction) {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative flex flex-col items-center justify-center -mt-5"
                            >
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    className="w-14 h-14 rounded-full bg-gradient-to-br from-flow-primary to-flow-accent shadow-float flex items-center justify-center"
                                >
                                    <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                                </motion.div>
                                <span className="text-[10px] text-flow-muted mt-1 font-medium">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative flex flex-col items-center justify-center py-1 px-3 min-w-[56px]"
                        >
                            <div className="relative">
                                <Icon
                                    className={`w-5 h-5 flow-transition ${isActive ? 'text-flow-primary' : 'text-flow-muted'
                                        }`}
                                />
                                {isActive && (
                                    <motion.div
                                        layoutId="mobile-nav-dot"
                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-flow-primary"
                                        transition={{ type: 'spring', duration: 0.3 }}
                                    />
                                )}
                            </div>
                            <span
                                className={`text-[10px] mt-1 font-medium flow-transition ${isActive ? 'text-flow-primary' : 'text-flow-muted'
                                    }`}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
