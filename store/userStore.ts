import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserProfile {
    name: string;
    dateOfBirth: string;
    averageCycleLength: number;
    averagePeriodLength: number;
    hasPcos: boolean;
    hasEndometriosis: boolean;
    isIrregular: boolean;
    subscriptionTier: 'free' | 'pro' | 'clinic';
    onboardingComplete: boolean;
    goals: string[];
    conditions: string[];
}

interface UserState {
    profile: UserProfile;
    isAuthenticated: boolean;
    setProfile: (profile: Partial<UserProfile>) => void;
    setAuthenticated: (auth: boolean) => void;
    completeOnboarding: () => void;
    reset: () => void;
}

const defaultProfile: UserProfile = {
    name: '',
    dateOfBirth: '',
    averageCycleLength: 28,
    averagePeriodLength: 5,
    hasPcos: false,
    hasEndometriosis: false,
    isIrregular: false,
    subscriptionTier: 'free',
    onboardingComplete: false,
    goals: [],
    conditions: [],
};

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            profile: defaultProfile,
            isAuthenticated: false,
            setProfile: (partial) =>
                set((state) => ({
                    profile: { ...state.profile, ...partial },
                })),
            setAuthenticated: (auth) => set({ isAuthenticated: auth }),
            completeOnboarding: () =>
                set((state) => ({
                    profile: { ...state.profile, onboardingComplete: true },
                })),
            reset: () =>
                set({
                    profile: defaultProfile,
                    isAuthenticated: false,
                }),
        }),
        {
            name: 'flow-user-store',
        }
    )
);
