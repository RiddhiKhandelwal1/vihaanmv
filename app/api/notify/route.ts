import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

interface NotifyRequest {
    companionName: string;
    companionEmail: string;
    userName: string;
    notifications: string[];
    emailType?: 'intro' | 'demo-period';
}

const NOTIFICATION_LABELS: Record<string, string> = {
    'period-1week': '📅 Period starting in about 1 week',
    'period-3days': '📅 Period starting in about 3 days',
    'mood-cycle': '🌸 Mood changes connected to their cycle',
    'energy-levels': '⚡ Energy level updates',
    'pms-alert': '🌙 PMS symptom alerts',
    'fertile-window': '🌱 Fertile window notifications',
};

export async function POST(req: NextRequest) {
    try {
        const body: NotifyRequest = await req.json();
        const { companionName, companionEmail, userName, notifications } = body;

        if (!companionName || !companionEmail || notifications.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const gmailUser = process.env.GMAIL_USER;
        const gmailPass = process.env.GMAIL_APP_PASSWORD;

        if (!gmailUser || !gmailPass) {
            return NextResponse.json(
                { error: 'Email service not configured' },
                { status: 500 }
            );
        }

        // Build the notification list
        const notifList = notifications
            .map((id) => NOTIFICATION_LABELS[id] || id)
            .map((label) => `  • ${label}`)
            .join('\n');

        const htmlList = notifications
            .map((id) => NOTIFICATION_LABELS[id] || id)
            .map((label) => `<li style="padding: 6px 0; color: #555;">${label}</li>`)
            .join('');

        // Determine email content based on type
        let subject = '';
        let textContent = '';
        let htmlContent = '';

        const type = body.emailType || 'intro';

        if (type === 'demo-period') {
            subject = `📅 Heads up: ${userName}'s period is approaching`;
            textContent = `Hi ${companionName},\n\nJust a quick automated update from Lunara.\n\n${userName}'s period is predicted to start in about 3 days. They wanted you to be kept in the loop!\n\nThis is a great time to be extra supportive. 🌸\n\nWith care,\nLunara Health`;

            htmlContent = `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #FFF9F7; border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #D4537E, #E8A598); margin: 0 auto 12px; display: flex; align-items: center; justify-content: center;">
                            <span style="font-size: 24px;">📅</span>
                        </div>
                        <h1 style="font-size: 22px; color: #2D2A32; margin: 0;">Heads Up, ${companionName}!</h1>
                    </div>
                    <p style="color: #555; font-size: 15px; line-height: 1.6; text-align: center;">
                        <strong style="color: #2D2A32;">${userName}'s</strong> period is predicted to start in about <strong>3 days</strong>.
                    </p>
                    <div style="background: white; border: 1px solid #ECDDD7; border-radius: 12px; padding: 16px; margin: 24px 0; text-align: center;">
                        <p style="color: #D4537E; font-weight: 600; margin: 0 0 8px 0;">Why am I getting this?</p>
                        <p style="color: #666; font-size: 13px; margin: 0;">${userName} added you as a companion on Lunara and chose to share period arrival alerts with you so you can be extra supportive! 🌸</p>
                    </div>
                    <div style="text-align: center; margin-top: 28px; padding-top: 20px; border-top: 1px solid #ECDDD7;">
                        <p style="font-size: 12px; color: #aaa;">Sent automatically by Lunara Health</p>
                    </div>
                </div>
            `;
        } else {
            // Default Intro Email
            subject = `💛 ${userName} added you as a companion on Lunara`;
            textContent = `Hi ${companionName},\n\n${userName} has added you as a companion on Lunara, their health tracking app.\n\nThey've chosen to share the following updates with you:\n\n${notifList}\n\nThis means you'll receive occasional updates to help you better understand and support them.\n\nWith care,\nLunara Health 🌸`;

            htmlContent = `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #FFF9F7; border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #D4537E, #E8A598); margin: 0 auto 12px; display: flex; align-items: center; justify-content: center;">
                            <span style="font-size: 24px;">💛</span>
                        </div>
                        <h1 style="font-size: 22px; color: #2D2A32; margin: 0;">Hi ${companionName}!</h1>
                    </div>
                    <p style="color: #555; font-size: 15px; line-height: 1.6;">
                        <strong style="color: #2D2A32;">${userName}</strong> has added you as a companion on <strong style="color: #D4537E;">Lunara</strong>, their health tracking app.
                    </p>
                    <p style="color: #555; font-size: 14px; margin-top: 16px;">They've chosen to share these updates with you:</p>
                    <ul style="list-style: none; padding: 16px; background: white; border-radius: 12px; border: 1px solid #ECDDD7; margin: 12px 0;">
                        ${htmlList}
                    </ul>
                    <p style="color: #888; font-size: 13px; line-height: 1.5; margin-top: 20px;">
                        This means you'll receive occasional updates to help you better understand and support them. 🌸
                    </p>
                    <div style="text-align: center; margin-top: 28px; padding-top: 20px; border-top: 1px solid #ECDDD7;">
                        <p style="font-size: 12px; color: #aaa;">Sent with care from Lunara Health</p>
                    </div>
                </div>
            `;
        }

        // Send the email
        await transporter.sendMail({
            from: `"Lunara Health" <${gmailUser}>`,
            to: companionEmail,
            subject,
            text: textContent,
            html: htmlContent,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Email API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 500 }
        );
    }
}
