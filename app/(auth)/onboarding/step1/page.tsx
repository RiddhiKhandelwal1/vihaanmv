'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingStep1() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/onboarding');
    }, [router]);
    return null;
}
