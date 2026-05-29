import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string; // ISO string
}

export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: string;
    updatedAt: string;
}

interface ChatState {
    sessions: ChatSession[];
    activeSessionId: string | null;
    createSession: () => string;
    addMessage: (sessionId: string, message: ChatMessage) => void;
    updateSessionTitle: (sessionId: string, title: string) => void;
    deleteSession: (sessionId: string) => void;
    setActiveSession: (sessionId: string | null) => void;
    getActiveSession: () => ChatSession | null;
}

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            sessions: [],
            activeSessionId: null,

            createSession: () => {
                const id = `chat-${Date.now()}`;
                const session: ChatSession = {
                    id,
                    title: 'New Chat',
                    messages: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                set((state) => ({
                    sessions: [session, ...state.sessions],
                    activeSessionId: id,
                }));
                return id;
            },

            addMessage: (sessionId, message) =>
                set((state) => ({
                    sessions: state.sessions.map((s) =>
                        s.id === sessionId
                            ? {
                                ...s,
                                messages: [...s.messages, message],
                                updatedAt: new Date().toISOString(),
                                // Auto-title from first user message
                                title:
                                    s.title === 'New Chat' &&
                                        message.role === 'user'
                                        ? message.content.slice(0, 40) +
                                        (message.content.length > 40
                                            ? '…'
                                            : '')
                                        : s.title,
                            }
                            : s
                    ),
                })),

            updateSessionTitle: (sessionId, title) =>
                set((state) => ({
                    sessions: state.sessions.map((s) =>
                        s.id === sessionId ? { ...s, title } : s
                    ),
                })),

            deleteSession: (sessionId) =>
                set((state) => ({
                    sessions: state.sessions.filter((s) => s.id !== sessionId),
                    activeSessionId:
                        state.activeSessionId === sessionId
                            ? null
                            : state.activeSessionId,
                })),

            setActiveSession: (sessionId) =>
                set({ activeSessionId: sessionId }),

            getActiveSession: () => {
                const { sessions, activeSessionId } = get();
                return (
                    sessions.find((s) => s.id === activeSessionId) || null
                );
            },
        }),
        {
            name: 'flow-chat-store',
        }
    )
);
