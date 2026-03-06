import { NextResponse } from "next/server"
import { AnalyticsSession, AnalyticsEvent, updateSession, appendEvent, getSessions } from "@/lib/analytics-store"

export async function POST(req: Request) {
    try {
        const data = await req.json()
        const { sessionId, type, path, referrer, userAgent, clientDurationMs } = data

        if (!sessionId || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const now = Date.now()
        const ip = req.headers.get("x-forwarded-for") || "unknown"
        const vercelCountry = req.headers.get("x-vercel-ip-country")
        const vercelCity = req.headers.get("x-vercel-ip-city")

        // Determine source
        let source: AnalyticsSession["source"] = "direct"
        if (referrer) {
            const refUrl = referrer.toLowerCase()
            if (refUrl.includes("instagram.com") || refUrl.includes("t.me") || refUrl.includes("t.co") || refUrl.includes("facebook.com")) {
                source = "social"
            } else if (refUrl.includes("google.") || refUrl.includes("yandex.") || refUrl.includes("bing.")) {
                source = "search"
            } else {
                source = "referral"
            }
        }

        // Load existing sessions to see if this is new
        const sessions = getSessions()
        let session = sessions.find((s) => s.id === sessionId)

        if (!session) {
            // New session
            session = {
                id: sessionId,
                startedAt: now,
                lastActive: now,
                ip,
                userAgent: userAgent || req.headers.get("user-agent") || "unknown",
                referrer: referrer || "",
                source,
                country: vercelCountry || undefined,
                city: vercelCity ? decodeURIComponent(vercelCity) : undefined,
                totalDurationMs: 0,
            }
        } else {
            // Update existing session
            session.lastActive = now
            if (clientDurationMs) {
                session.totalDurationMs = Math.max(session.totalDurationMs, clientDurationMs)
            } else {
                session.totalDurationMs = now - session.startedAt
            }
        }

        // Save session
        updateSession(session)

        // Store the specific event
        const event: AnalyticsEvent = {
            sessionId,
            timestamp: now,
            type,
            path,
        }
        appendEvent(event)

        return NextResponse.json({ ok: true })
    } catch (err) {
        console.error("Analytics track error:", err)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
