import { NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import { auth } from "@/lib/auth"

// ── Rate limiter ──────────────────────────────────────────────────────────────
// Sliding 1-second window, max 5 reactions per user
const rateLimiter = new Map<string, number[]>()

function isRateLimited(userId: string): boolean {
    const now = Date.now()
    const window = 1000 // 1 second
    const maxPerWindow = 5

    const times = (rateLimiter.get(userId) ?? []).filter(t => now - t < window)
    if (times.length >= maxPerWindow) return true

    times.push(now)
    rateLimiter.set(userId, times)
    return false
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getStickerPacks() {
    const filePath = path.join(process.cwd(), "data", "sticker-packs.json")
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as Array<{
        id: string
        tier: "free" | "plus"
        stickers: Array<{ id: string; type: string; value?: string; url?: string }>
    }>
}

function broadcast(payload: object) {
    const wss = (global as any).__wss
    if (!wss) return
    const msg = JSON.stringify(payload)
    wss.clients.forEach((client: any) => {
        if (client.readyState === 1 /* OPEN */) {
            client.send(msg)
        }
    })
}

// ── POST /api/reactions/send ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const username = session.user.name ?? "listener"
    const isPlus = (session.user as any).isPlusMember === true

    if (isRateLimited(userId)) {
        return NextResponse.json({ error: "Rate limited — max 5 reactions/sec" }, { status: 429 })
    }

    const body = await req.json()
    const { stickerId, packId } = body

    if (!stickerId || !packId) {
        return NextResponse.json({ error: "Missing stickerId or packId" }, { status: 400 })
    }

    // Validate the sticker exists and user has access
    const packs = getStickerPacks()
    const pack = packs.find(p => p.id === packId)
    if (!pack) return NextResponse.json({ error: "Pack not found" }, { status: 404 })
    if (pack.tier === "plus" && !isPlus) {
        return NextResponse.json({ error: "Plus subscription required" }, { status: 403 })
    }

    const sticker = pack.stickers.find(s => s.id === stickerId)
    if (!sticker) return NextResponse.json({ error: "Sticker not found" }, { status: 404 })

    // Build reaction payload and broadcast to all WS clients
    const reaction = {
        type: "reaction",
        id: `${userId}-${Date.now()}`,
        userId,
        username,
        packId,
        stickerId,
        stickerType: sticker.type,
        value: sticker.value,
        url: sticker.url,
        sentAt: Date.now(),
    }

    broadcast(reaction)

    return NextResponse.json({ ok: true, reaction })
}

// ── GET /api/reactions/packs — return available sticker packs ─────────────────
export async function GET(req: NextRequest) {
    const session = await auth()
    const isPlus = (session?.user as any)?.isPlusMember === true

    const packs = getStickerPacks()

    // Mark plus packs as locked if user doesn't have Plus
    const withAccess = packs.map(pack => ({
        ...pack,
        locked: pack.tier === "plus" && !isPlus,
    }))

    return NextResponse.json(withAccess)
}
