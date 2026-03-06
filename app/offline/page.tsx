import path from "path"
import fs from "fs"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "BØDEN STADT — Offline",
}

interface Artist {
    id: string
    name: string
    show: string
    startTime: string
    endTime: string
    type?: string
}

function getUpcomingArtists(): Artist[] {
    try {
        const filePath = path.join(process.cwd(), "data", "artists.json")
        const artists: Artist[] = JSON.parse(fs.readFileSync(filePath, "utf-8"))
        const now = Date.now()
        return artists
            .filter(a => a.type !== "ad" && new Date(a.startTime).getTime() > now)
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .slice(0, 10)
    } catch {
        return []
    }
}

export default function OfflinePage() {
    const upcoming = getUpcomingArtists()

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-6">
            {/* Logo */}
            <h1 className="font-tektur font-bold text-4xl tracking-widest mb-2 text-[#99CCCC]">
                BØDEN STADT
            </h1>
            <p className="font-mono text-[#737373] text-xs uppercase tracking-[0.3em] mb-12">
                You're offline
            </p>

            {/* Offline status */}
            <div className="w-full max-w-sm border border-[#2a2a2a] rounded-2xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-2 rounded-full bg-[#737373]" />
                    <span className="font-mono text-[#737373] text-xs uppercase tracking-widest">
                        No connection
                    </span>
                </div>
                <p className="text-[#e5e5e5] text-sm font-mono">
                    Connect to the internet to listen live and send reactions.
                </p>
            </div>

            {/* Upcoming schedule */}
            {upcoming.length > 0 && (
                <div className="w-full max-w-sm">
                    <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#737373] mb-4">
                        Upcoming sets
                    </h2>
                    <div className="space-y-2">
                        {upcoming.map(artist => {
                            const start = new Date(artist.startTime)
                            const timeStr = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`
                            return (
                                <div
                                    key={artist.id}
                                    className="flex items-center justify-between border border-[#1a1a1a] rounded-xl px-4 py-3"
                                >
                                    <div>
                                        <div className="font-mono font-bold text-sm tracking-wider">{artist.name}</div>
                                        <div className="font-mono text-[10px] text-[#737373] uppercase tracking-wider">
                                            {artist.show}
                                        </div>
                                    </div>
                                    <div className="font-mono text-[#99CCCC] text-sm">{timeStr}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
