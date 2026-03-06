import { NextResponse } from "next/server"
import { getSessions } from "@/lib/analytics-store"
import { auth } from "@/lib/auth"

export async function GET() {
    const serverSession = await auth()
    if (!serverSession?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const sessions = getSessions()

        const totalVisitors = sessions.length
        let totalDurationMs = 0

        const sourcesMap: Record<string, number> = {
            direct: 0,
            search: 0,
            social: 0,
            referral: 0,
            other: 0,
        }

        const geoMap: Record<string, number> = {}
        const hoursMap: Record<number, number> = Array(24).fill(0)

        // Group by Date for timeline (e.g. YYYY-MM-DD)
        const timelineMap: Record<string, number> = {}

        for (const s of sessions) {
            totalDurationMs += s.totalDurationMs || 0

            sourcesMap[s.source] = (sourcesMap[s.source] || 0) + 1

            const geoKey = s.country || "Unknown"
            geoMap[geoKey] = (geoMap[geoKey] || 0) + 1

            const dateObj = new Date(s.startedAt)
            const dayStr = dateObj.toISOString().split("T")[0]
            timelineMap[dayStr] = (timelineMap[dayStr] || 0) + 1

            const hour = dateObj.getHours()
            hoursMap[hour] = (hoursMap[hour] || 0) + 1
        }

        const avgDurationS = totalVisitors > 0 ? Math.round(totalDurationMs / totalVisitors / 1000) : 0

        // Format for recharts
        const sourcesData = Object.entries(sourcesMap).map(([name, value]) => ({ name, value }))
        const geoData = Object.entries(geoMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10)

        const timelineData = Object.entries(timelineMap)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, visitors]) => ({ date, visitors }))

        const heatmapData = Object.entries(hoursMap).map(([hour, count]) => ({
            hour: parseInt(hour, 10),
            count,
        }))

        return NextResponse.json({
            totalVisitors,
            avgDurationS,
            sourcesData,
            geoData,
            timelineData,
            heatmapData,
            rawSessions: sessions.map(s => ({
                id: s.id,
                startedAt: s.startedAt,
                duration: s.totalDurationMs,
                source: s.source,
                country: s.country
            })).slice(-50).reverse() // send last 50 for a recent table
        })
    } catch (err) {
        console.error("Failed to load stats:", err)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
