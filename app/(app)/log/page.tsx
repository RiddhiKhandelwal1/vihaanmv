'use client';

import { LogStepper } from '@/components/log/LogStepper';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

export default function LogPage() {
    const router = useRouter();

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-lg"
            >
                <Card className="rounded-3xl border-[#ECDDD7]/50 bg-white shadow-float overflow-hidden">
                    <LogStepper onComplete={() => router.push('/home')} />
                </Card>
            </motion.div>
        </div>
    );
}
