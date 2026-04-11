'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { TopBar } from '@/components/layout/TopBar';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-flow-bg">
            <Sidebar />
            <div className="lg:ml-[240px] min-h-screen pb-20 lg:pb-0">
                <TopBar />
                <AnimatePresence mode="wait">
                    <motion.main
                        key={pathname}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                        className="max-w-5xl mx-auto px-4 lg:px-8 py-6"
                    >
                        {children}
                    </motion.main>
                </AnimatePresence>
            </div>
            <MobileNav />
        </div>
    );
}
