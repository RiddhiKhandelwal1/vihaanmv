'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, profile } = useUserStore();

  useEffect(() => {
    if (isAuthenticated && profile.onboardingComplete) {
      router.replace('/home');
    } else {
      router.replace('/welcome');
    }
  }, [isAuthenticated, profile.onboardingComplete, router]);

  return (
    <div className="min-h-screen bg-flow-bg flex items-center justify-center">
      <div className="animate-pulse">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-flow-primary to-flow-accent" />
      </div>
    </div>
  );
}
