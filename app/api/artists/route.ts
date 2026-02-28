import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { generateArtists } from "@/lib/artists-data"

const DATA_FILE = path.join(process.cwd(), "data", "artists.json")

function ensureDataDir() {
    const dir = path.dirname(DATA_FILE)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
}

function readArtists() {
    ensureDataDir()
    if (!fs.existsSync(DATA_FILE)) {
        return generateArtists()
    }
    try {
        const raw = fs.readFileSync(DATA_FILE, "utf-8")
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
    } catch {
        // fall through to default
    }
    return generateArtists()
}

export async function GET() {
    const artists = readArtists()
    return NextResponse.json(artists)
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        if (!Array.isArray(body)) {
            return NextResponse.json({ error: "Expected array" }, { status: 400 })
        }
        ensureDataDir()
        fs.writeFileSync(DATA_FILE, JSON.stringify(body, null, 2), "utf-8")
        return NextResponse.json({ ok: true })
    } catch (err) {
        console.error("POST /api/artists error:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}
