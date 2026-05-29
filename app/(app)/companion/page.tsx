'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCycleStore } from '@/store/cycleStore';
import { useLogStore } from '@/store/logStore';
import { useUserStore } from '@/store/userStore';
import { useJournalStore, JournalEntry } from '@/store/journalStore';
import { useChatStore, ChatMessage } from '@/store/chatStore';
import { CycleEngine } from '@/lib/cycleEngine';
import { buildLunaSystemPrompt } from '@/lib/lunaContext';
import { buildTherapistSystemPrompt } from '@/lib/lunaTherapist';
import { useVoiceChat } from '@/lib/useVoiceChat';
import {
    Send,
    Sparkles,
    User,
    Mic,
    MicOff,
    X,
    Volume2,
    VolumeX,
    BookHeart,
    MessageSquarePlus,
    History,
    Trash2,
    ChevronLeft,
} from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
    'Why am I so tired right now?',
    'What should I eat this week?',
    'When is my next period?',
    'Why do I feel anxious before my period?',
    "What's my fertile window this month?",
    'Is my cycle regular?',
    'What exercise should I do today?',
];

const FEELING_TAGS = [
    { label: 'Anxious', emoji: '😰' },
    { label: 'Sad', emoji: '😢' },
    { label: 'Angry', emoji: '😤' },
    { label: 'Overwhelmed', emoji: '🥺' },
    { label: 'Confused', emoji: '😶‍🌫️' },
    { label: 'Lonely', emoji: '💔' },
    { label: 'Stressed', emoji: '😫' },
    { label: 'Frustrated', emoji: '😣' },
    { label: 'Grateful', emoji: '🙏' },
    { label: 'Hopeful', emoji: '🌱' },
];

const MOOD_LEVELS = [
    { value: 1, label: 'Very Low', emoji: '😞' },
    { value: 2, label: 'Low', emoji: '😔' },
    { value: 3, label: 'Okay', emoji: '😐' },
    { value: 4, label: 'Good', emoji: '🙂' },
    { value: 5, label: 'Great', emoji: '😊' },
];

type VoicePhase = 'closed' | 'feelings' | 'mood' | 'session' | 'checkout';

// ─── Component ──────────────────────────────────────────────────────────────

export default function CompanionPage() {
    // ── Hydration guard ─────────────────────────────────────────────
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => setHasMounted(true), []);

    // ── Chat store ──────────────────────────────────────────────────────
    const {
        sessions,
        activeSessionId,
        createSession,
        addMessage,
        deleteSession,
        setActiveSession,
        getActiveSession,
    } = useChatStore();

    const activeSession = getActiveSession();

    // ── UI state ────────────────────────────────────────────────────────
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // ── Voice journal state ─────────────────────────────────────────────
    const [voicePhase, setVoicePhase] = useState<VoicePhase>('closed');
    const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
    const [moodBefore, setMoodBefore] = useState<number>(3);
    const [moodAfter, setMoodAfter] = useState<number>(3);
    const [voiceMessages, setVoiceMessages] = useState<
        { role: 'user' | 'assistant'; content: string }[]
    >([]);
    const [voiceIsTyping, setVoiceIsTyping] = useState(false);
    const sessionStartRef = useRef<Date | null>(null);
    const lastTranscriptRef = useRef<string>('');

    // ── Stores ──────────────────────────────────────────────────────────
    const { profile } = useUserStore();
    const cycles = useCycleStore((s) => s.cycles);
    const logs = useLogStore((s) => s.logs);
    const addJournalEntry = useJournalStore((s) => s.addEntry);

    // ── Voice hook ──────────────────────────────────────────────────────
    const voice = useVoiceChat();

    // ── Derived ─────────────────────────────────────────────────────────
    const prediction = useMemo(
        () => CycleEngine.predict(cycles, logs),
        [cycles, logs]
    );
    const phaseInfo = CycleEngine.getPhaseInfo(prediction.currentPhase);

    const textSystemPrompt = useMemo(() => {
        return buildLunaSystemPrompt({
            userName: profile.name || 'friend',
            prediction,
            phaseInfo,
            recentLogs: logs.slice(-14),
            cycles,
            profile: {
                averageCycleLength: profile.averageCycleLength,
                averagePeriodLength: profile.averagePeriodLength,
                hasPcos: profile.hasPcos,
                hasEndometriosis: profile.hasEndometriosis,
                isIrregular: profile.isIrregular,
                goals: profile.goals,
                conditions: profile.conditions,
            },
        });
    }, [profile, prediction, phaseInfo, logs, cycles]);

    const therapistPrompt = useMemo(() => {
        return buildTherapistSystemPrompt({
            userName: profile.name || 'friend',
            prediction,
            phaseInfo,
            feelingTags: selectedFeelings,
        });
    }, [profile, prediction, phaseInfo, selectedFeelings]);

    // ── Scroll ──────────────────────────────────────────────────────────
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(() => {
        scrollToBottom();
    }, [activeSession?.messages]);

    // ── Voice transcript handler ────────────────────────────────────────
    useEffect(() => {
        if (
            voicePhase === 'session' &&
            !voice.isListening &&
            voice.transcript &&
            voice.transcript !== lastTranscriptRef.current
        ) {
            lastTranscriptRef.current = voice.transcript;
            sendVoiceMessage(voice.transcript);
            voice.clearTranscript();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [voice.isListening, voice.transcript, voicePhase]);

    // ── New chat ────────────────────────────────────────────────────────
    const handleNewChat = () => {
        createSession();
        setShowHistory(false);
    };

    // ── Switch to a session ─────────────────────────────────────────────
    const handleSelectSession = (id: string) => {
        setActiveSession(id);
        setShowHistory(false);
    };

    // ── Send text message ───────────────────────────────────────────────
    const sendMessage = async (text: string) => {
        if (!text.trim() || isTyping) return;

        // Ensure we have an active session
        let sessionId = activeSessionId;
        if (!sessionId) {
            sessionId = createSession();
        }

        const userMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: new Date().toISOString(),
        };
        addMessage(sessionId, userMsg);

        // Build conversation history for API
        const currentSession = useChatStore.getState().getActiveSession();
        const apiMessages = (currentSession?.messages || []).map((m) => ({
            role: m.role,
            content: m.content,
        }));

        setInput('');
        setIsTyping(true);

        try {
            const res = await fetch('/api/luna', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: apiMessages,
                    systemPrompt: textSystemPrompt,
                }),
            });
            const data = await res.json();
            const reply =
                data.response || "I'm having trouble right now. Try again?";

            const assistantMsg: ChatMessage = {
                id: `msg-${Date.now()}-r`,
                role: 'assistant',
                content: reply,
                timestamp: new Date().toISOString(),
            };
            addMessage(sessionId, assistantMsg);
        } catch {
            const errMsg: ChatMessage = {
                id: `msg-err-${Date.now()}`,
                role: 'assistant',
                content: 'Luna is resting right now 🌙 Try again in a moment.',
                timestamp: new Date().toISOString(),
            };
            addMessage(sessionId, errMsg);
        } finally {
            setIsTyping(false);
        }
    };

    // ── Voice message send ──────────────────────────────────────────────
    const sendVoiceMessage = useCallback(
        async (text: string) => {
            if (!text.trim() || voiceIsTyping) return;

            const userMsg = { role: 'user' as const, content: text };
            const updatedHistory = [...voiceMessages, userMsg];
            setVoiceMessages(updatedHistory);
            setVoiceIsTyping(true);

            try {
                const res = await fetch('/api/luna', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: updatedHistory,
                        systemPrompt: therapistPrompt,
                    }),
                });
                const data = await res.json();
                const reply =
                    data.response || "I hear you. Take your time… 💜";

                setVoiceMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: reply },
                ]);
                await voice.speak(reply);
            } catch {
                const fallback =
                    "I'm here with you. Let's take a breath together. 💜";
                setVoiceMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: fallback },
                ]);
            } finally {
                setVoiceIsTyping(false);
            }
        },
        [voiceMessages, voiceIsTyping, therapistPrompt, voice]
    );

    // Prevent hydration mismatch — all hooks above, early return here
    if (!hasMounted) return null;

    // ── Voice journal flow ──────────────────────────────────────────────
    const openVoiceJournal = () => {
        setVoicePhase('feelings');
        setSelectedFeelings([]);
        setVoiceMessages([]);
        setMoodBefore(3);
        setMoodAfter(3);
        lastTranscriptRef.current = '';
    };

    const toggleFeeling = (label: string) => {
        setSelectedFeelings((prev) =>
            prev.includes(label)
                ? prev.filter((f) => f !== label)
                : [...prev, label]
        );
    };

    const startSession = () => {
        sessionStartRef.current = new Date();
        setVoicePhase('session');
        const greeting =
            selectedFeelings.length > 0
                ? `I'm here for you. You mentioned feeling ${selectedFeelings.join(' and ').toLowerCase()}… I want you to know that's completely valid. Tell me what's on your mind — I'm listening. 💜`
                : `I'm here, and I'm listening. Whenever you're ready, just start talking about whatever's on your mind. There's no rush. 💜`;
        setVoiceMessages([{ role: 'assistant', content: greeting }]);
        voice.speak(greeting);
    };

    const endSession = () => {
        voice.stopListening();
        voice.stopSpeaking();
        setVoicePhase('checkout');
    };

    const saveAndClose = () => {
        const duration = sessionStartRef.current
            ? Math.floor(
                (Date.now() - sessionStartRef.current.getTime()) / 1000
            )
            : 0;
        const entry: JournalEntry = {
            id: `journal-${Date.now()}`,
            date: new Date().toISOString(),
            duration,
            feelingTags: selectedFeelings,
            moodBefore,
            moodAfter,
            messages: voiceMessages,
        };
        addJournalEntry(entry);
        setVoicePhase('closed');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleVoiceMicToggle = () => {
        if (voice.isListening) {
            voice.stopListening();
        } else {
            voice.startListening();
        }
    };

    const orbStateClass = voice.isListening
        ? 'voice-orb-listening'
        : voice.isSpeaking
            ? 'voice-orb-speaking'
            : 'voice-orb-idle';

    // Messages to display
    const displayMessages = activeSession?.messages || [];

    // ── Format timestamp ────────────────────────────────────────────────
    const formatDate = (iso: string) => {
        const d = new Date(iso);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
        });
    };

    // ─── Render ─────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] lg:h-[calc(100vh-100px)]">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-[#ECDDD7]/50">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-flow-warning to-flow-primary flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                    <h2 className="text-base font-serif font-semibold text-flow-text">
                        Luna
                    </h2>
                    <p className="text-xs text-flow-muted">
                        Your AI health companion · {phaseInfo.label}
                    </p>
                </div>

                {/* Chat history toggle */}
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-flow-surface2 hover:bg-[#ECDDD7]/40 flow-transition text-flow-muted hover:text-flow-text"
                    title="Chat History"
                >
                    <History className="w-4 h-4" />
                    <span className="text-xs font-medium hidden sm:inline">
                        {sessions.length > 0 ? sessions.length : ''}
                    </span>
                </button>

                {/* New Chat */}
                <button
                    onClick={handleNewChat}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-flow-primary/10 hover:bg-flow-primary/20 flow-transition text-flow-primary"
                    title="New Chat"
                >
                    <MessageSquarePlus className="w-4 h-4" />
                    <span className="text-xs font-medium hidden sm:inline">
                        New
                    </span>
                </button>

                {/* Voice Journal */}
                <button
                    onClick={openVoiceJournal}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-flow-secondary/20 to-flow-primary/20 hover:from-flow-secondary/30 hover:to-flow-primary/30 border border-flow-secondary/30 flow-transition group"
                    title="Voice Journal"
                >
                    <BookHeart className="w-4 h-4 text-flow-secondary group-hover:scale-110 flow-transition" />
                    <span className="text-xs font-medium text-flow-text hidden sm:inline">
                        Voice Journal
                    </span>
                </button>
            </div>

            {/* ─── Chat History Panel ────────────────────────────────────── */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden border-b border-[#ECDDD7]/50"
                    >
                        <div className="py-3 space-y-1 max-h-60 overflow-y-auto">
                            <div className="flex items-center justify-between px-1 mb-2">
                                <p className="text-xs font-medium text-flow-muted">
                                    Chat History
                                </p>
                                <button
                                    onClick={handleNewChat}
                                    className="text-xs text-flow-primary hover:underline flex items-center gap-1"
                                >
                                    <MessageSquarePlus className="w-3 h-3" />
                                    New Chat
                                </button>
                            </div>

                            {sessions.length === 0 && (
                                <p className="text-xs text-flow-muted/60 text-center py-4">
                                    No conversations yet. Start chatting!
                                </p>
                            )}

                            {sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer flow-transition group ${activeSessionId === session.id
                                        ? 'bg-flow-primary/10 border border-flow-primary/20'
                                        : 'hover:bg-flow-surface2'
                                        }`}
                                    onClick={() =>
                                        handleSelectSession(session.id)
                                    }
                                >
                                    <Sparkles
                                        className={`w-4 h-4 flex-shrink-0 ${activeSessionId === session.id
                                            ? 'text-flow-primary'
                                            : 'text-flow-muted/40'
                                            }`}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className={`text-sm truncate ${activeSessionId === session.id
                                                ? 'font-medium text-flow-text'
                                                : 'text-flow-text/70'
                                                }`}
                                        >
                                            {session.title}
                                        </p>
                                        <p className="text-[10px] text-flow-muted/60">
                                            {session.messages.length} messages ·{' '}
                                            {formatDate(session.updatedAt)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteSession(session.id);
                                        }}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-flow-error/10 flow-transition"
                                        title="Delete chat"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-flow-error/60" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Messages ──────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {displayMessages.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center h-full text-center px-4"
                    >
                        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-flow-warning/20 to-flow-primary/10 flex items-center justify-center mb-4">
                            <Sparkles className="w-8 h-8 text-flow-warning" />
                        </div>
                        <h3 className="text-lg font-serif font-semibold text-flow-text mb-2">
                            Hi {profile.name || 'there'}! I&apos;m Luna 🌙
                        </h3>
                        <p className="text-sm text-flow-muted mb-6 max-w-xs">
                            I&apos;m your AI health companion. Ask me anything
                            about your cycle, symptoms, nutrition, or wellness.
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {SUGGESTED_PROMPTS.map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => sendMessage(prompt)}
                                    className="px-3 py-2 bg-white rounded-2xl text-xs text-flow-text border border-[#ECDDD7] hover:bg-flow-surface2 flow-transition shadow-sm"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                <AnimatePresence>
                    {displayMessages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className={`flex gap-2.5 ${msg.role === 'user'
                                ? 'justify-end'
                                : 'justify-start'
                                }`}
                        >
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-flow-warning to-flow-primary flex items-center justify-center flex-shrink-0 mt-1">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                            )}
                            <div
                                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                                    ? 'bg-flow-primary text-white rounded-br-md'
                                    : 'bg-white text-flow-text shadow-card rounded-bl-md border border-[#ECDDD7]/50'
                                    }`}
                            >
                                {msg.content}
                            </div>
                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-flow-primary to-flow-secondary flex items-center justify-center flex-shrink-0 mt-1">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-2.5"
                    >
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-flow-warning to-flow-primary flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white shadow-card rounded-2xl rounded-bl-md px-4 py-3 border border-[#ECDDD7]/50">
                            <div className="flex gap-1">
                                <span
                                    className="w-2 h-2 rounded-full bg-flow-muted animate-bounce"
                                    style={{ animationDelay: '0ms' }}
                                />
                                <span
                                    className="w-2 h-2 rounded-full bg-flow-muted animate-bounce"
                                    style={{ animationDelay: '150ms' }}
                                />
                                <span
                                    className="w-2 h-2 rounded-full bg-flow-muted animate-bounce"
                                    style={{ animationDelay: '300ms' }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
                onSubmit={handleSubmit}
                className="pt-3 border-t border-[#ECDDD7]/50"
            >
                <div className="flex items-center gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask Luna anything..."
                        className="flex-1 h-12 rounded-2xl bg-white border-[#ECDDD7] focus:ring-flow-primary/50"
                    />
                    <Button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="w-12 h-12 rounded-2xl bg-flow-primary hover:bg-flow-primary/90 text-white p-0"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
                <p className="text-[10px] text-flow-muted/60 text-center mt-2">
                    Luna is an AI companion, not a medical professional. Always
                    consult a healthcare provider for medical concerns.
                </p>
            </form>

            {/* ═══════════════════════════════════════════════════════════════
                VOICE JOURNAL OVERLAY
            ═══════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {voicePhase !== 'closed' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-gradient-to-b from-[#1a1420] via-[#1e1628] to-[#151020] flex flex-col"
                    >
                        {/* Close */}
                        <div className="flex justify-between items-center px-6 pt-6">
                            <div className="flex items-center gap-2">
                                <BookHeart className="w-5 h-5 text-flow-secondary" />
                                <span className="text-sm font-medium text-white/80">
                                    Voice Journal
                                </span>
                            </div>
                            <button
                                onClick={() => {
                                    voice.stopListening();
                                    voice.stopSpeaking();
                                    setVoicePhase('closed');
                                }}
                                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center flow-transition"
                            >
                                <X className="w-5 h-5 text-white/70" />
                            </button>
                        </div>

                        {/* FEELINGS */}
                        {voicePhase === 'feelings' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex-1 flex flex-col items-center justify-center px-6 gap-8"
                            >
                                <div className="text-center">
                                    <h2 className="text-2xl font-serif font-semibold text-white mb-2">
                                        How are you feeling?
                                    </h2>
                                    <p className="text-sm text-white/50">
                                        Select all that resonate — or skip ahead
                                    </p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-3 max-w-md">
                                    {FEELING_TAGS.map((tag) => (
                                        <button
                                            key={tag.label}
                                            onClick={() =>
                                                toggleFeeling(tag.label)
                                            }
                                            className={`px-4 py-2.5 rounded-2xl text-sm font-medium flow-transition border ${selectedFeelings.includes(
                                                tag.label
                                            )
                                                ? 'bg-flow-secondary/30 border-flow-secondary text-white'
                                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                                }`}
                                        >
                                            {tag.emoji} {tag.label}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setVoicePhase('mood')}
                                    className="px-8 py-3 rounded-2xl bg-gradient-to-r from-flow-secondary to-flow-primary text-white font-medium text-sm hover:opacity-90 flow-transition shadow-lg shadow-flow-primary/20"
                                >
                                    Continue
                                </button>
                            </motion.div>
                        )}

                        {/* MOOD */}
                        {voicePhase === 'mood' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex-1 flex flex-col items-center justify-center px-6 gap-8"
                            >
                                <div className="text-center">
                                    <h2 className="text-2xl font-serif font-semibold text-white mb-2">
                                        How&apos;s your mood right now?
                                    </h2>
                                    <p className="text-sm text-white/50">
                                        We&apos;ll check in again after your
                                        session
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    {MOOD_LEVELS.map((level) => (
                                        <button
                                            key={level.value}
                                            onClick={() =>
                                                setMoodBefore(level.value)
                                            }
                                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl flow-transition ${moodBefore === level.value
                                                ? 'bg-white/15 scale-110'
                                                : 'hover:bg-white/5'
                                                }`}
                                        >
                                            <span className="text-3xl">
                                                {level.emoji}
                                            </span>
                                            <span className="text-xs text-white/60">
                                                {level.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={startSession}
                                    className="px-8 py-3 rounded-2xl bg-gradient-to-r from-flow-secondary to-flow-primary text-white font-medium text-sm hover:opacity-90 flow-transition shadow-lg shadow-flow-primary/20"
                                >
                                    Start Talking to Luna
                                </button>
                            </motion.div>
                        )}

                        {/* SESSION */}
                        {voicePhase === 'session' && (
                            <div className="flex-1 flex flex-col items-center px-6 relative">
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="relative">
                                        {voice.isListening && (
                                            <>
                                                <div className="absolute inset-0 rounded-full border-2 border-flow-secondary/30 listening-ring" />
                                                <div
                                                    className="absolute inset-0 rounded-full border border-flow-primary/20 listening-ring"
                                                    style={{
                                                        animationDelay: '0.5s',
                                                    }}
                                                />
                                            </>
                                        )}
                                        <div
                                            className={`w-36 h-36 rounded-full voice-orb ${orbStateClass}`}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {voice.isListening ? (
                                                <Mic className="w-8 h-8 text-white/90" />
                                            ) : voice.isSpeaking ? (
                                                <Volume2 className="w-8 h-8 text-white/90" />
                                            ) : (
                                                <Sparkles className="w-8 h-8 text-white/80" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center mb-4">
                                    <p className="text-sm text-white/60">
                                        {voice.isListening
                                            ? 'Listening…'
                                            : voice.isSpeaking
                                                ? 'Luna is speaking…'
                                                : voiceIsTyping
                                                    ? 'Luna is thinking…'
                                                    : 'Tap the mic to talk'}
                                    </p>
                                    {(voice.interimTranscript ||
                                        voice.transcript) && (
                                            <p className="text-sm text-white/40 mt-2 max-w-xs mx-auto italic">
                                                &ldquo;
                                                {voice.interimTranscript ||
                                                    voice.transcript}
                                                &rdquo;
                                            </p>
                                        )}
                                </div>

                                {voiceMessages.length > 0 && (
                                    <div className="w-full max-w-md mb-4">
                                        <div className="bg-white/5 rounded-2xl px-4 py-3 border border-white/10">
                                            <p className="text-sm text-white/70 leading-relaxed">
                                                {
                                                    voiceMessages[
                                                        voiceMessages.length - 1
                                                    ].content
                                                }
                                            </p>
                                            <p className="text-[10px] text-white/30 mt-1">
                                                {voiceMessages[
                                                    voiceMessages.length - 1
                                                ].role === 'assistant'
                                                    ? '— Luna'
                                                    : '— You'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {voice.error && (
                                    <p className="text-xs text-flow-error mb-4">
                                        {voice.error}
                                    </p>
                                )}

                                <div className="flex items-center gap-4 pb-10">
                                    <button
                                        onClick={endSession}
                                        className="px-4 py-2.5 rounded-2xl bg-white/10 text-white/70 text-sm hover:bg-white/20 flow-transition"
                                    >
                                        End Session
                                    </button>
                                    <button
                                        onClick={handleVoiceMicToggle}
                                        disabled={
                                            voice.isSpeaking || voiceIsTyping
                                        }
                                        className={`w-16 h-16 rounded-full flex items-center justify-center flow-transition shadow-lg ${voice.isListening
                                            ? 'bg-flow-error hover:bg-flow-error/80 shadow-flow-error/30'
                                            : 'bg-gradient-to-br from-flow-secondary to-flow-primary hover:opacity-90 shadow-flow-primary/30'
                                            } ${voice.isSpeaking || voiceIsTyping
                                                ? 'opacity-50 cursor-not-allowed'
                                                : ''
                                            }`}
                                    >
                                        {voice.isListening ? (
                                            <MicOff className="w-6 h-6 text-white" />
                                        ) : (
                                            <Mic className="w-6 h-6 text-white" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() =>
                                            voice.isSpeaking
                                                ? voice.stopSpeaking()
                                                : undefined
                                        }
                                        className={`px-4 py-2.5 rounded-2xl text-sm flow-transition ${voice.isSpeaking
                                            ? 'bg-white/10 text-white/70 hover:bg-white/20'
                                            : 'bg-transparent text-transparent cursor-default'
                                            }`}
                                    >
                                        {voice.isSpeaking && (
                                            <VolumeX className="w-5 h-5 text-white/70 inline" />
                                        )}
                                    </button>
                                </div>

                                {!voice.isSupported && (
                                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center px-8">
                                        <div className="bg-white/10 rounded-3xl p-6 text-center border border-white/20 max-w-sm">
                                            <MicOff className="w-10 h-10 text-flow-error mx-auto mb-3" />
                                            <h3 className="text-white font-serif font-semibold mb-2">
                                                Voice Not Supported
                                            </h3>
                                            <p className="text-sm text-white/60">
                                                Your browser doesn&apos;t
                                                support voice features. Try
                                                Chrome, Edge, or Safari.
                                            </p>
                                            <button
                                                onClick={() =>
                                                    setVoicePhase('closed')
                                                }
                                                className="mt-4 px-6 py-2 rounded-2xl bg-white/10 text-white/80 text-sm hover:bg-white/20 flow-transition"
                                            >
                                                Go Back
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* CHECKOUT */}
                        {voicePhase === 'checkout' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex-1 flex flex-col items-center justify-center px-6 gap-8"
                            >
                                <div className="text-center">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-flow-warning/30 to-flow-primary/20 flex items-center justify-center mx-auto mb-4">
                                        <Sparkles className="w-7 h-7 text-flow-warning" />
                                    </div>
                                    <h2 className="text-2xl font-serif font-semibold text-white mb-2">
                                        Thank you for sharing 💜
                                    </h2>
                                    <p className="text-sm text-white/50 max-w-xs">
                                        How are you feeling now? Let&apos;s
                                        check in.
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    {MOOD_LEVELS.map((level) => (
                                        <button
                                            key={level.value}
                                            onClick={() =>
                                                setMoodAfter(level.value)
                                            }
                                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl flow-transition ${moodAfter === level.value
                                                ? 'bg-white/15 scale-110'
                                                : 'hover:bg-white/5'
                                                }`}
                                        >
                                            <span className="text-3xl">
                                                {level.emoji}
                                            </span>
                                            <span className="text-xs text-white/60">
                                                {level.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                {moodAfter > moodBefore && (
                                    <p className="text-sm text-flow-success">
                                        ✨ Your mood improved — that&apos;s
                                        wonderful!
                                    </p>
                                )}
                                {moodAfter < moodBefore && (
                                    <p className="text-sm text-white/50">
                                        It&apos;s okay to not feel better right
                                        away. You showed up for yourself today.
                                        💛
                                    </p>
                                )}
                                <button
                                    onClick={saveAndClose}
                                    className="px-8 py-3 rounded-2xl bg-gradient-to-r from-flow-secondary to-flow-primary text-white font-medium text-sm hover:opacity-90 flow-transition shadow-lg shadow-flow-primary/20"
                                >
                                    Save & Close
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
