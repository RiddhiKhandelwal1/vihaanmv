'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCycleStore } from '@/store/cycleStore';
import { useLogStore } from '@/store/logStore';
import { useUserStore } from '@/store/userStore';
import { CycleEngine } from '@/lib/cycleEngine';
import { buildLunaSystemPrompt } from '@/lib/lunaContext';
import { Send, Sparkles, User } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const SUGGESTED_PROMPTS = [
    'Why am I so tired right now?',
    'What should I eat this week?',
    'When is my next period?',
    'Why do I feel anxious before my period?',
    "What's my fertile window this month?",
    'Is my cycle regular?',
    'What exercise should I do today?',
];

export default function CompanionPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversationHistory, setConversationHistory] = useState<
        { role: 'user' | 'assistant'; content: string }[]
    >([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { profile } = useUserStore();
    const cycles = useCycleStore((s) => s.cycles);
    const logs = useLogStore((s) => s.logs);

    const prediction = useMemo(
        () => CycleEngine.predict(cycles, logs),
        [cycles, logs]
    );
    const phaseInfo = CycleEngine.getPhaseInfo(prediction.currentPhase);

    // Build system prompt once on mount / when data changes
    const systemPrompt = useMemo(() => {
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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isTyping) return;

        const userMsg = { role: 'user' as const, content: text };
        const updatedHistory = [...conversationHistory, userMsg];

        setMessages((prev) => [
            ...prev,
            {
                id: `msg-${Date.now()}`,
                role: 'user',
                content: text,
                timestamp: new Date(),
            },
        ]);
        setConversationHistory(updatedHistory);
        setInput('');
        setIsTyping(true);

        try {
            const res = await fetch('/api/luna', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: updatedHistory,
                    systemPrompt,
                }),
            });
            const data = await res.json();
            const reply =
                data.response || "I'm having trouble right now. Try again?";

            setConversationHistory((prev) => [
                ...prev,
                { role: 'assistant', content: reply },
            ]);
            setMessages((prev) => [
                ...prev,
                {
                    id: `msg-${Date.now()}-r`,
                    role: 'assistant',
                    content: reply,
                    timestamp: new Date(),
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: `msg-err-${Date.now()}`,
                    role: 'assistant',
                    content:
                        'Luna is resting right now 🌙 Try again in a moment.',
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] lg:h-[calc(100vh-100px)]">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-[#ECDDD7]/50">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-flow-warning to-flow-primary flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-base font-serif font-semibold text-flow-text">
                        Luna
                    </h2>
                    <p className="text-xs text-flow-muted">
                        Your AI health companion · {phaseInfo.label}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {messages.length === 0 && (
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
                    {messages.map((msg) => (
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

                {/* Typing indicator */}
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
        </div>
    );
}
