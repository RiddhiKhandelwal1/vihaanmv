import { useMilestoneStore } from '@/store/milestoneStore';

export interface MilestoneDef {
    id: string;
    title: string;
    description: string;
    icon: string; // Lucide icon name
    color: string;
    requiredOpens: number;
}

export const MILESTONES: MilestoneDef[] = [
    { id: 'open_1', title: 'Your journey starts here', description: 'Opened the app for the 1st time.', icon: 'Star', color: '#E8C07A', requiredOpens: 1 },
    { id: 'open_3', title: 'Building a habit', description: 'Checked in 3 times.', icon: 'RefreshCcw', color: '#7BAE8A', requiredOpens: 3 },
    { id: 'open_7', title: 'One week of listening', description: '7 visits to Lunara.', icon: 'CalendarDays', color: '#D4537E', requiredOpens: 7 },
    { id: 'open_14', title: 'Two weeks strong', description: '14 visits to Lunara.', icon: 'Heart', color: '#9B8CAE', requiredOpens: 14 },
    { id: 'open_30', title: 'A whole month of literacy', description: '30 check-ins.', icon: 'Award', color: '#6B8CAE', requiredOpens: 30 },
    { id: 'open_100', title: 'Body Literacy Master', description: '100 visits!', icon: 'Crown', color: '#E8A598', requiredOpens: 100 }
];

/**
 * Evaluates triggers against the user's data and unlocks milestones.
 */
export const checkMilestones = () => {
    const { appOpenCount, unlockMilestone, unlockedMilestones } = useMilestoneStore.getState();

    MILESTONES.forEach(m => {
        if (appOpenCount >= m.requiredOpens && !unlockedMilestones[m.id]) {
            unlockMilestone(m.id);
        }
    });
};
