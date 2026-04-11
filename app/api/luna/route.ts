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

        // ─── Call Anthropic API ─────────────────────────────────────────
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { response: "Luna is being set up — the API key hasn't been configured yet. 🌙" },
                { status: 200 }
            );
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 600,
                system: systemPrompt,
                messages: sanitizedMessages,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('[Luna API] Anthropic error:', response.status, error);
            return NextResponse.json(
                { response: "Luna is resting right now 🌙 Try again in a moment." },
                { status: 200 } // Return 200 so the UI handles it gracefully
            );
        }

        const data = await response.json();
        const rawText = data.content?.[0]?.text ?? 'Sorry, I had trouble responding.';

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
