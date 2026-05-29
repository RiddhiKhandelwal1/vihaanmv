'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCompanionStore } from '@/store/partnerStore';
import { useUserStore } from '@/store/userStore';
import {
    Heart,
    Bell,
    Moon,
    Smile,
    Calendar,
    Zap,
    ShieldCheck,
    Check,
    UserPlus,
    Trash2,
    ChevronDown,
    ChevronUp,
    Users,
    Send,
    Loader2,
} from 'lucide-react';

// ─── Notification Options ───────────────────────────────────────────────────

const NOTIFICATION_OPTIONS = [
    {
        id: 'period-1week',
        label: 'Notify 1 week before my period',
        description: 'A heads-up 7 days before your predicted period',
        icon: Calendar,
        color: 'from-phase-menstrual to-flow-primary',
    },
    {
        id: 'period-3days',
        label: 'Notify 3 days before my period',
        description: 'A gentle reminder as your period approaches',
        icon: Bell,
        color: 'from-flow-primary to-flow-accent',
    },
    {
        id: 'mood-cycle',
        label: 'Moods connected to my cycle',
        description: 'How your cycle phases may affect your mood',
        icon: Smile,
        color: 'from-flow-warning to-flow-primary',
    },
    {
        id: 'energy-levels',
        label: 'Energy level updates',
        description: 'When your energy might be low or high',
        icon: Zap,
        color: 'from-flow-success to-phase-follicular',
    },
    {
        id: 'pms-alert',
        label: 'PMS symptom alerts',
        description: 'When cramps or headaches are expected',
        icon: Moon,
        color: 'from-flow-secondary to-phase-luteal',
    },
    {
        id: 'fertile-window',
        label: 'Fertile window notifications',
        description: 'Predicted fertile days for family planning',
        icon: Heart,
        color: 'from-flow-accent to-flow-primary',
    },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function CompanionNotifyPage() {
    const { companions, addCompanion, removeCompanion, toggleNotification } = useCompanionStore();
    const { profile } = useUserStore();
    const userName = profile.name || 'Your companion';

    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showSaved, setShowSaved] = useState(false);
    const [sendingId, setSendingId] = useState<string | null>(null);
    const [sentStatus, setSentStatus] = useState<Record<string, 'sent' | 'error'>>({});

    // Track stats for the demo button separately
    const [demoSendingId, setDemoSendingId] = useState<string | null>(null);
    const [demoSentStatus, setDemoSentStatus] = useState<Record<string, 'sent' | 'error'>>({});

    const handleAdd = () => {
        if (!newName.trim() || !newEmail.trim()) return;
        const id = addCompanion(newName.trim(), newEmail.trim());
        setNewName('');
        setNewEmail('');
        setExpandedId(id);
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2500);
    };

    const toggleExpand = (id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    const handleSendEmail = async (companionId: string, emailType: 'intro' | 'demo-period' = 'intro') => {
        const companion = companions.find((c) => c.id === companionId);
        if (!companion || companion.notifications.length === 0) return;

        const isDemo = emailType === 'demo-period';
        if (isDemo) setDemoSendingId(companionId);
        else setSendingId(companionId);

        try {
            const res = await fetch('/api/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companionName: companion.name,
                    companionEmail: companion.email,
                    userName,
                    notifications: companion.notifications,
                    emailType,
                }),
            });

            if (isDemo) {
                setDemoSentStatus((prev) => ({ ...prev, [companionId]: res.ok ? 'sent' : 'error' }));
            } else {
                setSentStatus((prev) => ({ ...prev, [companionId]: res.ok ? 'sent' : 'error' }));
            }
        } catch {
            if (isDemo) setDemoSentStatus((prev) => ({ ...prev, [companionId]: 'error' }));
            else setSentStatus((prev) => ({ ...prev, [companionId]: 'error' }));
        } finally {
            if (isDemo) setDemoSendingId(null);
            else setSendingId(null);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-flow-accent/20 to-flow-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-flow-primary" />
                </div>
                <h1 className="text-2xl font-serif font-bold text-flow-text">My Companions</h1>
                <p className="text-sm text-flow-muted max-w-sm mx-auto">
                    Add people who care about you — choose what each companion receives 💛
                </p>
            </div>

            {/* Add New Companion */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-[#ECDDD7]/50 shadow-card p-6 space-y-4"
            >
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-flow-primary to-flow-secondary flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-base font-serif font-semibold text-flow-text">Add a Companion</h2>
                        <p className="text-xs text-flow-muted">Partner, friend, family member — anyone you trust</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-medium text-flow-muted mb-1 block">Name</label>
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="e.g. Rahul"
                            className="h-11 rounded-xl bg-flow-surface2 border-[#ECDDD7] focus:ring-flow-primary/50"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-flow-muted mb-1 block">Email</label>
                        <Input
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="email@example.com"
                            type="email"
                            className="h-11 rounded-xl bg-flow-surface2 border-[#ECDDD7] focus:ring-flow-primary/50"
                        />
                    </div>
                </div>
                <Button
                    onClick={handleAdd}
                    disabled={!newName.trim() || !newEmail.trim()}
                    className="w-full h-11 rounded-xl bg-flow-primary hover:bg-flow-primary/90 text-white font-medium disabled:opacity-40"
                >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Companion
                </Button>
            </motion.div>

            {/* Companion List */}
            {companions.length > 0 && (
                <div className="space-y-3">
                    <p className="text-xs font-medium text-flow-muted px-1">
                        {companions.length} companion{companions.length !== 1 ? 's' : ''} added
                    </p>
                    <AnimatePresence>
                        {companions.map((companion, index) => (
                            <motion.div
                                key={companion.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-2xl border border-[#ECDDD7]/50 shadow-card overflow-hidden"
                            >
                                {/* Companion header row */}
                                <div
                                    onClick={() => toggleExpand(companion.id)}
                                    role="button"
                                    tabIndex={0}
                                    className="w-full flex items-center gap-3 p-4 hover:bg-flow-surface2/30 flow-transition text-left cursor-pointer"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-flow-primary to-flow-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                        {companion.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-flow-text truncate">{companion.name}</p>
                                        <p className="text-xs text-flow-muted truncate">
                                            {companion.email} · {companion.notifications.length} notification{companion.notifications.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeCompanion(companion.id);
                                            }}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 flow-transition"
                                            title="Remove"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-400/60" />
                                        </button>
                                        {expandedId === companion.id
                                            ? <ChevronUp className="w-4 h-4 text-flow-muted" />
                                            : <ChevronDown className="w-4 h-4 text-flow-muted" />
                                        }
                                    </div>
                                </div>

                                {/* Expanded: notification toggles + send button */}
                                <AnimatePresence>
                                    {expandedId === companion.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="overflow-hidden border-t border-[#ECDDD7]/30"
                                        >
                                            <div className="px-4 pt-3 pb-2 space-y-2">
                                                <p className="text-xs text-flow-muted mb-1">What to share with {companion.name}:</p>
                                                {NOTIFICATION_OPTIONS.map((option) => {
                                                    const isOn = companion.notifications.includes(option.id);
                                                    const Icon = option.icon;
                                                    return (
                                                        <button
                                                            key={option.id}
                                                            onClick={() => toggleNotification(companion.id, option.id)}
                                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border flow-transition text-left ${isOn
                                                                ? 'bg-flow-primary/5 border-flow-primary/30'
                                                                : 'border-transparent hover:bg-flow-surface2/50'
                                                                }`}
                                                        >
                                                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center flex-shrink-0 ${isOn ? '' : 'opacity-40'} flow-transition`}>
                                                                <Icon className="w-4 h-4 text-white" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-sm ${isOn ? 'font-medium text-flow-text' : 'text-flow-text/70'}`}>
                                                                    {option.label}
                                                                </p>
                                                                <p className="text-[10px] text-flow-muted leading-snug">{option.description}</p>
                                                            </div>
                                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 flow-transition ${isOn ? 'bg-flow-primary' : 'border-2 border-[#ECDDD7]'}`}>
                                                                {isOn && <Check className="w-3 h-3 text-white" />}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Send email buttons */}
                                            <div className="px-4 pb-4 pt-1 space-y-2">
                                                <button
                                                    onClick={() => handleSendEmail(companion.id, 'intro')}
                                                    disabled={companion.notifications.length === 0 || sendingId === companion.id}
                                                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium flow-transition ${sentStatus[companion.id] === 'sent'
                                                            ? 'bg-green-50 text-green-600 border border-green-200'
                                                            : sentStatus[companion.id] === 'error'
                                                                ? 'bg-red-50 text-red-500 border border-red-200'
                                                                : 'bg-flow-primary text-white hover:bg-flow-primary/90 disabled:opacity-40'
                                                        }`}
                                                >
                                                    {sendingId === companion.id ? (
                                                        <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                                                    ) : sentStatus[companion.id] === 'sent' ? (
                                                        <><Check className="w-4 h-4" /> Intro email sent!</>
                                                    ) : sentStatus[companion.id] === 'error' ? (
                                                        <><Send className="w-4 h-4" /> Failed — check Gmail credentials</>
                                                    ) : (
                                                        <><Send className="w-4 h-4" /> Send Intro Email</>
                                                    )}
                                                </button>

                                                {/* Demo Button */}
                                                <button
                                                    onClick={() => handleSendEmail(companion.id, 'demo-period')}
                                                    disabled={companion.notifications.length === 0 || demoSendingId === companion.id}
                                                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium flow-transition border ${demoSentStatus[companion.id] === 'sent'
                                                            ? 'bg-flow-secondary/10 text-flow-secondary border-flow-secondary/30'
                                                            : demoSentStatus[companion.id] === 'error'
                                                                ? 'bg-red-50 text-red-500 border-red-200'
                                                                : 'bg-flow-surface2 text-flow-text border-[#ECDDD7] hover:bg-flow-surface2/70 disabled:opacity-40'
                                                        }`}
                                                >
                                                    {demoSendingId === companion.id ? (
                                                        <><Loader2 className="w-4 h-4 animate-spin" /> Sending Demo…</>
                                                    ) : demoSentStatus[companion.id] === 'sent' ? (
                                                        <><Check className="w-4 h-4" /> Demo Period Alert Sent!</>
                                                    ) : demoSentStatus[companion.id] === 'error' ? (
                                                        <><Send className="w-4 h-4" /> Failed — check Gmail</>
                                                    ) : (
                                                        <><Zap className="w-4 h-4 text-flow-secondary" /> Demo: Send "3 Days to Period" Alert</>
                                                    )}
                                                </button>

                                                {companion.notifications.length === 0 && (
                                                    <p className="text-[10px] text-flow-muted text-center mt-1 pt-1">Select at least one notification to send</p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Empty state */}
            {companions.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
                    <Heart className="w-10 h-10 text-flow-muted/30 mx-auto mb-3" />
                    <p className="text-sm text-flow-muted">No companions added yet</p>
                    <p className="text-xs text-flow-muted/60 mt-1">Add someone you trust to keep them in the loop</p>
                </motion.div>
            )}

            {/* Privacy note */}
            <div className="flex items-start gap-3 bg-flow-surface2 rounded-2xl p-4 border border-[#ECDDD7]/30">
                <ShieldCheck className="w-5 h-5 text-flow-success flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-xs font-medium text-flow-text">Your privacy is protected</p>
                    <p className="text-xs text-flow-muted mt-0.5 leading-relaxed">
                        Companions only see what you choose. They won&apos;t have access to your app, logs, or Luna conversations. You can stop sharing anytime.
                    </p>
                </div>
            </div>

            {/* Added toast */}
            <AnimatePresence>
                {showSaved && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-flow-success text-white px-6 py-3 rounded-2xl shadow-float flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">Companion added!</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
