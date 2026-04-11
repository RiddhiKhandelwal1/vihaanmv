'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCycleStore } from '@/store/cycleStore';
import { useLogStore } from '@/store/logStore';
import { useUserStore } from '@/store/userStore';
import { CycleEngine } from '@/lib/cycleEngine';
import { Send, Sparkles, User, Bot } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const SUGGESTED_PROMPTS = [
    'Why am I so tired right now?',
    'What should I eat this week?',
    'Is my cycle regular?',
    'Why do I feel anxious before my period?',
    "What's my fertile window?",
];

function generateLunaResponse(
    message: string,
    phase: string,
    phaseDay: number,
    userName: string
): string {
    const responses: Record<string, string[]> = {
        tired: [
            `Feeling tired during your ${phase} phase is completely normal, ${userName}. Your body is doing a lot of work right now. Try to honour your energy levels — rest is productive too. Iron-rich foods like lentils and dark leafy greens can help if you're in your menstrual phase. 💛`,
            `It's day ${phaseDay} of your cycle, and fatigue is common at this point. Make sure you're staying hydrated and getting enough sleep. Gentle movement like yoga can actually help boost your energy without overdoing it.`,
        ],
        eat: [
            `Great question! During your ${phase} phase, your body benefits from specific nutrients. I'd suggest focusing on anti-inflammatory foods — berries, leafy greens, fatty fish, and whole grains. Dark chocolate is also a wonderful (and delicious) source of magnesium. 🍫`,
            `Right now in your ${phase} phase, your body could use some extra nourishment. Try incorporating more iron-rich foods (spinach, lentils), healthy fats (avocado, nuts), and warming foods like soups and stews. Stay hydrated with herbal teas — ginger or chamomile are lovely choices.`,
        ],
        regular: [
            `Based on your tracked cycles, I can see your pattern. A "regular" cycle can range from 21–35 days, and some variation between cycles is perfectly normal. What matters more is consistency over time. Keep tracking — the more data we have, the better I can help you understand your patterns! 📊`,
        ],
        anxious: [
            `The pre-menstrual anxiety you're feeling is very common and has a biological explanation, ${userName}. In the luteal phase, progesterone rises and then drops sharply before your period. This hormonal shift can affect serotonin levels, leading to increased anxiety. Magnesium-rich foods and gentle exercise can help. Always talk to a healthcare provider if it's significantly impacting your daily life. 💜`,
        ],
        fertile: [
            `Your fertile window typically starts about 5 days before ovulation and ends 1 day after. Based on your cycle history, I can estimate when this window occurs, but remember — this is an estimate, not a guarantee. For more precise tracking, consider combining this with other fertility awareness methods. Please consult a healthcare provider for family planning advice. 🌿`,
        ],
        default: [
            `That's a great question, ${userName}! I'm here to help you understand your body better. Based on what I know about your cycle — you're currently in your ${phase} phase (day ${phaseDay}). Could you tell me more about what you'd like to know? I can share insights about nutrition, energy, mood patterns, or general wellness tips for your current phase. Remember, I'm your supportive companion, not a doctor — always consult a healthcare professional for medical concerns. 🌸`,
        ],
    };

    const lowerMessage = message.toLowerCase();
    let category = 'default';
    if (lowerMessage.includes('tired') || lowerMessage.includes('fatigue') || lowerMessage.includes('energy'))
        category = 'tired';
    else if (lowerMessage.includes('eat') || lowerMessage.includes('food') || lowerMessage.includes('diet') || lowerMessage.includes('nutrition'))
        category = 'eat';
    else if (lowerMessage.includes('regular') || lowerMessage.includes('cycle length') || lowerMessage.includes('normal'))
        category = 'regular';
    else if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('stress'))
        category = 'anxious';
    else if (lowerMessage.includes('fertile') || lowerMessage.includes('ovulation') || lowerMessage.includes('pregnant'))
        category = 'fertile';

    const options = responses[category];
    return options[Math.floor(Math.random() * options.length)];
}

export default function CompanionPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { profile } = useUserStore();
    const cycles = useCycleStore((s) => s.cycles);
    const logs = useLogStore((s) => s.logs);

    const prediction = CycleEngine.predict(cycles, logs);
    const phaseInfo = CycleEngine.getPhaseInfo(prediction.currentPhase);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;

        const userMessage: Message = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate AI response delay
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1500));

        const response = generateLunaResponse(
            text,
            phaseInfo.label.toLowerCase(),
            prediction.currentPhaseDay,
            profile.name || 'friend'
        );

        const assistantMessage: Message = {
            id: `msg-${Date.now()}-resp`,
            role: 'assistant',
            content: response,
            timestamp: new Date(),
        };

        setIsTyping(false);
        setMessages((prev) => [...prev, assistantMessage]);
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
                            I&apos;m your AI health companion. Ask me anything about your
                            cycle, symptoms, nutrition, or wellness.
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
                            className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'
                                }`}
                        >
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-flow-warning to-flow-primary flex items-center justify-center flex-shrink-0 mt-1">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                            )}
                            <div
                                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
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
                                <span className="w-2 h-2 rounded-full bg-flow-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 rounded-full bg-flow-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 rounded-full bg-flow-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="pt-3 border-t border-[#ECDDD7]/50">
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
                    Luna is an AI companion, not a medical professional. Always consult a
                    healthcare provider for medical concerns.
                </p>
            </form>
        </div>
    );
}
