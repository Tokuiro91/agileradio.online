import { NextResponse } from "next/server"

// Avoid caching to ensure we get the real current server time
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
    return NextResponse.json({ time: Date.now() })
}
