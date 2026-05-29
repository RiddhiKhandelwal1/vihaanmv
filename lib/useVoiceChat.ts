'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
    error: string;
    message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognitionInstance;
        webkitSpeechRecognition: new () => SpeechRecognitionInstance;
    }
}

export interface UseVoiceChatReturn {
    isSupported: boolean;
    isListening: boolean;
    isSpeaking: boolean;
    transcript: string;
    interimTranscript: string;
    error: string | null;
    startListening: () => void;
    stopListening: () => void;
    speak: (text: string) => Promise<void>;
    stopSpeaking: () => void;
    clearTranscript: () => void;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useVoiceChat(): UseVoiceChatReturn {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);

    // Check browser support
    const isSupported =
        typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) &&
        'speechSynthesis' in window;

    // Initialize speech synthesis ref
    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            synthRef.current = window.speechSynthesis;
        }
    }, []);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
            if (synthRef.current) {
                synthRef.current.cancel();
            }
        };
    }, []);

    const startListening = useCallback(() => {
        if (!isSupported) {
            setError('Speech recognition is not supported in this browser.');
            return;
        }

        setError(null);
        setTranscript('');
        setInterimTranscript('');

        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalText = '';
            let interimText = '';

            for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalText += result[0].transcript;
                } else {
                    interimText += result[0].transcript;
                }
            }

            if (finalText) {
                setTranscript(finalText.trim());
            }
            setInterimTranscript(interimText);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            if (event.error === 'no-speech') {
                setError('No speech detected. Try again?');
            } else if (event.error === 'not-allowed') {
                setError('Microphone permission denied. Please enable it in your browser settings.');
            } else {
                setError(`Speech error: ${event.error}`);
            }
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        try {
            recognition.start();
        } catch {
            setError('Could not start speech recognition. Try again.');
        }
    }, [isSupported]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    }, []);

    const speak = useCallback(
        (text: string): Promise<void> => {
            return new Promise((resolve) => {
                if (!synthRef.current) {
                    resolve();
                    return;
                }

                // Cancel any ongoing speech
                synthRef.current.cancel();

                const utterance = new SpeechSynthesisUtterance(text);

                // Pick a warm female voice
                const voices = synthRef.current.getVoices();
                const preferred = voices.find(
                    (v) =>
                        v.name.includes('Samantha') || // macOS
                        v.name.includes('Google UK English Female') ||
                        v.name.includes('Microsoft Zira') ||
                        (v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
                );
                if (preferred) {
                    utterance.voice = preferred;
                }

                utterance.rate = 0.95;
                utterance.pitch = 1.05;
                utterance.volume = 1;

                utterance.onstart = () => setIsSpeaking(true);
                utterance.onend = () => {
                    setIsSpeaking(false);
                    resolve();
                };
                utterance.onerror = () => {
                    setIsSpeaking(false);
                    resolve();
                };

                synthRef.current.speak(utterance);
            });
        },
        []
    );

    const stopSpeaking = useCallback(() => {
        if (synthRef.current) {
            synthRef.current.cancel();
        }
        setIsSpeaking(false);
    }, []);

    const clearTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
    }, []);

    return {
        isSupported,
        isListening,
        isSpeaking,
        transcript,
        interimTranscript,
        error,
        startListening,
        stopListening,
        speak,
        stopSpeaking,
        clearTranscript,
    };
}
