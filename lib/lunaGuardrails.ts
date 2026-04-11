/**
 * Luna AI Guardrails — input validation, topic filtering, PII stripping,
 * output validation, and rate limiting.
 */

// ─── Constants ──────────────────────────────────────────────────────────────

const MAX_MESSAGE_LENGTH = 500;
const MAX_CONVERSATION_HISTORY = 20;
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

// In-memory rate-limit store (resets on server restart — fine for hackathon)
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

// ─── Blocked topic keywords ────────────────────────────────────────────────

const BLOCKED_TOPICS = [
    // Violence / self-harm
    'kill', 'suicide', 'self-harm', 'cut myself', 'end my life', 'want to die',
    // Politics
    'election', 'political party', 'vote for', 'democrat', 'republican', 'BJP', 'congress party',
    // Explicit / sexual
    'porn', 'sexual position', 'kink', 'fetish',
    // Off-topic abuse
    'hack', 'jailbreak', 'ignore instructions', 'ignore your system prompt',
    'pretend you are', 'act as', 'you are now',
];

const SELF_HARM_KEYWORDS = [
    'suicide', 'self-harm', 'cut myself', 'end my life', 'want to die',
    'kill myself', 'hurt myself', 'don\'t want to live',
];

// ─── PII regex patterns ────────────────────────────────────────────────────

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
const AADHAAR_REGEX = /\d{4}\s?\d{4}\s?\d{4}/g;

// ─── Output danger patterns ────────────────────────────────────────────────

const DIAGNOSIS_PATTERNS = [
    /you (?:have|definitely have|are diagnosed with|suffer from)\s+(?!a great|a wonderful|a good)/i,
    /I(?:'m| am) diagnosing you/i,
    /your diagnosis is/i,
];

const PRESCRIPTION_PATTERNS = [
    /(?:take|prescribe|prescription for)\s+\d+\s*mg/i,
    /you should take\s+(?:ibuprofen|paracetamol|aspirin|metformin|clomid)/i,
    /I(?:'m| am) prescribing/i,
];

// ─── Public API ─────────────────────────────────────────────────────────────

export interface GuardrailResult {
    allowed: boolean;
    reason?: string;
    sanitizedMessage?: string;
    redirectResponse?: string; // pre-built response to return instead of calling LLM
}

/**
 * Validate and sanitize an incoming user message.
 */
export function validateInput(
    message: string,
    conversationHistory: { role: string; content: string }[]
): GuardrailResult {
    // 1. Empty check
    if (!message || !message.trim()) {
        return { allowed: false, reason: 'empty_message' };
    }

    // 2. Length check
    if (message.length > MAX_MESSAGE_LENGTH) {
        return {
            allowed: false,
            reason: 'message_too_long',
            redirectResponse:
                "That's quite a long message! Could you break it down into a shorter question? I'm best with focused queries under a few sentences. 💛",
        };
    }

    // 3. Conversation history cap
    if (conversationHistory.length > MAX_CONVERSATION_HISTORY) {
        return {
            allowed: false,
            reason: 'history_too_long',
            redirectResponse:
                "We've had a great conversation! To keep things running smoothly, could you start a fresh chat? I'll still remember your cycle data. 🌙",
        };
    }

    // 4. Self-harm detection (sensitive — provide resources)
    const lower = message.toLowerCase();
    if (SELF_HARM_KEYWORDS.some((kw) => lower.includes(kw))) {
        return {
            allowed: false,
            reason: 'self_harm_detected',
            redirectResponse:
                "I hear you, and I want you to know you're not alone. 💜 I'm not equipped to help with this, but please reach out to someone who can:\n\n" +
                "🇮🇳 iCall: 9152987821\n" +
                "🇮🇳 Vandrevala Foundation: 1860-2662-345 (24/7)\n" +
                "🌐 Crisis Text Line: Text HOME to 741741\n\n" +
                "You matter. Please talk to someone today.",
        };
    }

    // 5. Blocked topic detection
    const blockedMatch = BLOCKED_TOPICS.find((kw) => lower.includes(kw));
    if (blockedMatch) {
        return {
            allowed: false,
            reason: 'off_topic',
            redirectResponse:
                "I'm your menstrual health companion, so I'm best with questions about your cycle, symptoms, mood, nutrition, and wellness. 🌸 What can I help you with about your health today?",
        };
    }

    // 6. Strip PII from the message
    const sanitized = stripPII(message);

    return { allowed: true, sanitizedMessage: sanitized };
}

/**
 * Validate output from the LLM before returning to user.
 */
export function validateOutput(response: string): string {
    let cleaned = response;

    // Check for diagnosis language
    for (const pattern of DIAGNOSIS_PATTERNS) {
        if (pattern.test(cleaned)) {
            cleaned += "\n\n⚠️ Please note: I'm not a doctor and cannot diagnose conditions. Please consult a healthcare provider for any medical concerns.";
            break;
        }
    }

    // Check for prescription language
    for (const pattern of PRESCRIPTION_PATTERNS) {
        if (pattern.test(cleaned)) {
            cleaned =
                "I want to help, but I can't prescribe or recommend specific medications — that's something only your doctor can do. 💛 I can share general wellness tips for your current phase instead. What would you like to know?";
            break;
        }
    }

    // Truncate excessively long responses
    if (cleaned.length > 2000) {
        cleaned = cleaned.slice(0, 1800) + '...';
    }

    return cleaned;
}

/**
 * Simple rate limiter — returns true if request is allowed.
 */
export function checkRateLimit(sessionId: string): GuardrailResult {
    const now = Date.now();
    const entry = rateLimitMap.get(sessionId);

    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.set(sessionId, { count: 1, windowStart: now });
        return { allowed: true };
    }

    if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
        return {
            allowed: false,
            reason: 'rate_limited',
            redirectResponse:
                "You're chatting quickly! Give me a moment to catch up. Try again in about a minute. 🌙",
        };
    }

    entry.count++;
    return { allowed: true };
}

/**
 * Strip PII from text before sending to external API.
 */
function stripPII(text: string): string {
    return text
        .replace(EMAIL_REGEX, '[email]')
        .replace(PHONE_REGEX, '[phone]')
        .replace(AADHAAR_REGEX, '[id-number]');
}

/**
 * Sanitize conversation history — trim to max size and strip PII.
 */
export function sanitizeHistory(
    history: { role: string; content: string }[]
): { role: string; content: string }[] {
    return history.slice(-MAX_CONVERSATION_HISTORY).map((msg) => ({
        role: msg.role,
        content: msg.role === 'user' ? stripPII(msg.content) : msg.content,
    }));
}
