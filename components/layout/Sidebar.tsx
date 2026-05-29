'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import {
    Home,
    Calendar,
    PlusCircle,
    BarChart3,
    User,
    Sparkles,
    Heart,
} from 'lucide-react';

const navItems = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/log', label: 'Log', icon: PlusCircle, isAction: true },
    { href: '/insights', label: 'Insights', icon: BarChart3 },
    { href: '/profile', label: 'Profile', icon: User },
];

export function Sidebar() {
    const pathname = usePathname();
    const { profile } = useUserStore();
    const userName = profile.name || 'User';

    return (
        <aside className="hidden lg:flex flex-col w-[240px] h-screen bg-white border-r border-[#ECDDD7] fixed left-0 top-0 z-40">
            {/* Logo */}
            <div className="p-6 pb-2">
                <Link href="/home" className="flex items-center gap-2 group">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-flow-primary to-flow-accent flex items-center justify-center">
                        <Heart className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="font-serif text-xl font-bold text-flow-text tracking-tight">
                        Lunara
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium flow-transition group ${isActive
                                ? 'text-flow-text bg-flow-surface2'
                                : 'text-flow-muted hover:text-flow-text hover:bg-flow-surface2/60'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute inset-0 bg-flow-surface2 rounded-xl"
                                    transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
                                />
                            )}
                            <Icon
                                className={`relative z-10 w-5 h-5 ${item.isAction ? 'text-flow-primary' : ''
                                    }`}
                            />
                            <span className="relative z-10">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* AI Companion link */}
            <div className="px-3 pb-1">
                <Link
                    href="/companion"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium flow-transition ${pathname === '/companion'
                        ? 'text-flow-text bg-flow-surface2'
                        : 'text-flow-muted hover:text-flow-text hover:bg-flow-surface2/60'
                        }`}
                >
                    <Sparkles className="w-5 h-5 text-flow-warning" />
                    <span>Chat with Luna</span>
                </Link>
            </div>

            {/* My Companions link */}
            <div className="px-3 pb-3">
                <Link
                    href="/partner"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium flow-transition ${pathname === '/partner'
                        ? 'text-flow-text bg-flow-surface2'
                        : 'text-flow-muted hover:text-flow-text hover:bg-flow-surface2/60'
                        }`}
                >
                    <Heart className="w-5 h-5 text-flow-accent" />
                    <span>My Companions</span>
                </Link>
            </div>

            {/* Bottom user section */}
            <div className="p-4 border-t border-[#ECDDD7]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-flow-primary to-flow-secondary flex items-center justify-center text-white text-xs font-bold">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-flow-text truncate">
                            {userName}
                        </p>
                        <p className="text-xs text-flow-muted">Free plan</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
