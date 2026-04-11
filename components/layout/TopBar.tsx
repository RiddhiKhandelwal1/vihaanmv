'use client';

import { usePathname } from 'next/navigation';
import { format } from 'date-fns';

const pageNames: Record<string, string> = {
    '/home': 'Home',
    '/calendar': 'Calendar',
    '/log': 'Daily Log',
    '/insights': 'Insights',
    '/companion': 'Luna — AI Companion',
    '/profile': 'Profile & Settings',
};

export function TopBar() {
    const pathname = usePathname();
    const pageName = pageNames[pathname] || 'Flow';
    const today = format(new Date(), 'EEEE, d MMMM');

    return (
        <header className="sticky top-0 z-30 bg-flow-bg/80 backdrop-blur-md border-b border-[#ECDDD7]/50">
            <div className="flex items-center justify-between px-4 lg:px-8 h-14">
                <div>
                    <h1 className="text-lg font-serif font-semibold text-flow-text">
                        {pageName}
                    </h1>
                    <p className="text-xs text-flow-muted font-mono hidden sm:block">
                        {today}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="lg:hidden w-8 h-8 rounded-full bg-gradient-to-br from-flow-primary to-flow-secondary flex items-center justify-center text-white text-xs font-bold">
                        P
                    </div>
                </div>
            </div>
        </header>
    );
}
