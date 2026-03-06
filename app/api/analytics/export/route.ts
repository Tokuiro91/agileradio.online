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
        if (sessions.length === 0) {
            return new NextResponse("No data", { status: 404 })
        }

        const headers = [
            "Session ID",
            "Started At",
            "Started At (ISO)",
            "Source",
            "Referrer",
            "Country",
            "City",
            "Duration (ms)",
            "User Agent"
        ]

        const rows = sessions.map(s => {
            const startedIso = new Date(s.startedAt).toISOString()
            return [
                s.id,
                s.startedAt,
                startedIso,
                s.source,
                `"${(s.referrer || "").replace(/"/g, '""')}"`, // escape quotes
                s.country || "",
                `"${(s.city || "").replace(/"/g, '""')}"`,
                s.totalDurationMs,
                `"${(s.userAgent || "").replace(/"/g, '""')}"`
            ].join(",")
        })

        const csvContent = [headers.join(","), ...rows].join("\n")

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="analytics_export_${Date.now()}.csv"`
            }
        })
    } catch (err) {
        console.error("Export error:", err)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
