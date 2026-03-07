import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { generateOtp } from "@/lib/otp-store"
import { getAdminEmails } from "@/lib/auth"

export async function POST(request: Request) {
    try {
        const { email } = await request.json() as { email?: string }
        if (!email || !email.includes("@")) {
            return NextResponse.json({ error: "Введите корректный email" }, { status: 400 })
        }

        const normalizedEmail = email.toLowerCase().trim()

        // Check if email is in admin allowlist
        const admins = getAdminEmails().map((e) => e.toLowerCase().trim())
        if (!admins.includes(normalizedEmail)) {
            // Return success anyway to avoid email enumeration
            return NextResponse.json({ ok: true })
        }

        // Generate and store OTP
        const code = generateOtp(normalizedEmail)

        // Send email via Gmail SMTP
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        })

        await transporter.sendMail({
            from: `"BØDEN Admin" <${process.env.GMAIL_USER}>`,
            to: normalizedEmail,
            subject: `Код входа: ${code}`,
            text: `Ваш код для входа в панель администратора BØDEN: ${code}\n\nКод действителен 10 минут.\n\nЕсли вы не запрашивали код — проигнорируйте это письмо.`,
            html: `
        <div style="font-family:monospace;background:#0a0a0a;color:#e5e5e5;padding:40px;max-width:400px;margin:0 auto;border-radius:8px;">
          <p style="color:#737373;font-size:12px;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:8px;">BØDEN / ADMIN</p>
          <h1 style="font-size:48px;letter-spacing:0.1em;color:#ffffff;margin:0 0 8px 0;">${code}</h1>
          <p style="color:#9ca3af;font-size:13px;margin:0 0 24px 0;">Код действителен <strong>10 минут</strong></p>
          <p style="color:#4b5563;font-size:11px;">Если вы не запрашивали код — проигнорируйте это письмо.</p>
        </div>
      `,
        })

        return NextResponse.json({ ok: true })
    } catch (err) {
        console.error("send-otp error:", err)
        return NextResponse.json({ error: "Ошибка отправки письма" }, { status: 500 })
    }
}
