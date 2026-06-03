import { NextRequest, NextResponse } from 'next/server';
import {
    validateInput,
    validateOutput,
    checkRateLimit,
    sanitizeHistory,
} from '@/lib/lunaGuardrails';

export async function POST(req: NextRequest) {
    try {
        const { messages, systemPrompt } = await req.json();

        // Generate a session ID from request headers (or fallback)
        const sessionId =
            req.headers.get('x-forwarded-for') ||
            req.headers.get('x-real-ip') ||
            'anonymous';

        // ─── Rate limit check ───────────────────────────────────────────
        const rateCheck = checkRateLimit(sessionId);
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { response: rateCheck.redirectResponse },
                { status: 200 }
            );
        }

        // ─── Input validation ───────────────────────────────────────────
        const lastUserMessage = messages[messages.length - 1]?.content || '';
        const inputCheck = validateInput(lastUserMessage, messages);

        if (!inputCheck.allowed) {
            return NextResponse.json(
                { response: inputCheck.redirectResponse || "I can only help with health-related questions. 🌸" },
                { status: 200 }
            );
        }

        // ─── Sanitize conversation history (strip PII, cap length) ──────
        const sanitizedMessages = sanitizeHistory(messages);

        // Replace last user message with the sanitized version
        if (inputCheck.sanitizedMessage && sanitizedMessages.length > 0) {
            sanitizedMessages[sanitizedMessages.length - 1] = {
                ...sanitizedMessages[sanitizedMessages.length - 1],
                content: inputCheck.sanitizedMessage,
            };
        }

        // ─── Call OpenAI API ────────────────────────────────────────────
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey || apiKey.trim().length < 10) {
            const mockResponses = [
                "That's a great question! While I'm in demo mode, I can tell you that staying hydrated and getting enough sleep are key.",
                "I hear you. Many people experience that. Tracking these symptoms can really help identify patterns over time.",
                "I'm operating in demo mode right now, but it sounds like you're doing a great job listening to your body! 🌸"
            ];
            const randomMock = mockResponses[Math.floor(Math.random() * mockResponses.length)];
            
            return NextResponse.json(
                { response: randomMock },
                { status: 200 }
            );
        }

        // Format messages for OpenAI (system prompt goes as first message)
        const openaiMessages = [
            { role: 'system', content: systemPrompt },
            ...sanitizedMessages,
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                max_tokens: 600,
                messages: openaiMessages,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('[Luna API] OpenAI error:', response.status, error);
            return NextResponse.json(
                { response: "Luna is resting right now 🌙 Try again in a moment." },
                { status: 200 } // Return 200 so the UI handles it gracefully
            );
        }

        const data = await response.json();
        const rawText = data.choices?.[0]?.message?.content ?? 'Sorry, I had trouble responding.';

        // ─── Output validation ──────────────────────────────────────────
        const validatedText = validateOutput(rawText);

        return NextResponse.json({ response: validatedText });
    } catch (error) {
        console.error('[Luna API] Unexpected error:', error);
        return NextResponse.json(
            { response: "Something went wrong on my end. Try again? 🌙" },
            { status: 200 }
        );
    }
}
