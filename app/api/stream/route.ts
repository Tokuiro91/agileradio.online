import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

/**
 * Stream proxy — pipes external HTTP audio streams over HTTPS
 * to work around browser mixed-content blocking.
 * Usage: /api/stream?src=http://...
 */
export async function GET(req: NextRequest) {
    const src = req.nextUrl.searchParams.get("src")
    if (!src) {
        return NextResponse.json({ error: "Missing src param" }, { status: 400 })
    }

    // Only proxy HTTP (not HTTPS — those are fine directly)
    if (!src.startsWith("http://")) {
        return NextResponse.json({ error: "Only HTTP sources need proxying" }, { status: 400 })
    }

    try {
        const upstream = await fetch(src, {
            headers: {
                // Forward range requests if present (for seek support)
                ...(req.headers.get("range") ? { range: req.headers.get("range")! } : {}),
                "User-Agent": "Mozilla/5.0 BODEN-STADT-Radio-Proxy/1.0",
                "Icy-MetaData": "0",
            },
            // @ts-ignore — disable Next.js cache for streams
            cache: "no-store",
        })

        if (!upstream.ok && upstream.status !== 206) {
            return new NextResponse(`Upstream error: ${upstream.status}`, { status: upstream.status })
        }

        const contentType = upstream.headers.get("content-type") ?? "audio/mpeg"
        const status = upstream.status

        const headers = new Headers({
            "Content-Type": contentType,
            "Cache-Control": "no-cache, no-store",
            "Access-Control-Allow-Origin": "*",
            "X-Content-Type-Options": "nosniff",
        })

        // Forward content-length if present
        const cl = upstream.headers.get("content-length")
        if (cl) headers.set("content-length", cl)

        // Forward content-range for partial content
        const cr = upstream.headers.get("content-range")
        if (cr) headers.set("content-range", cr)

        return new NextResponse(upstream.body, { status, headers })
    } catch (err) {
        console.error("[stream proxy] error:", err)
        return NextResponse.json({ error: "Proxy error" }, { status: 500 })
    }
}
