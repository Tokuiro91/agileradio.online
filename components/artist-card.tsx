"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Clock } from "lucide-react"
import type { Artist } from "@/lib/artists-data"

interface ArtistCardProps {
  artist: Artist
  status: "played" | "playing" | "upcoming"
  progress: number
}

export function ArtistCard({ artist, status, progress }: ArtistCardProps) {
  const [expanded, setExpanded] = useState(false)

  const timeDisplay = useMemo(() => {
    if (status === "playing") {
      const parts = artist.duration.split(":").map(Number)
      const totalSec = parts[0] * 3600 + parts[1] * 60 + parts[2]
      const elapsed = Math.floor(totalSec * progress)
      const h = String(Math.floor(elapsed / 3600)).padStart(2, "0")
      const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0")
      const s = String(elapsed % 60).padStart(2, "0")
      return `${h}:${m}:${s}`
    }
    return artist.duration
  }, [artist.duration, status, progress])

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="relative flex-shrink-0 cursor-pointer transition-all duration-500 ease-out group"
      style={{
        width: expanded ? "330px" : "300px",
        height: expanded ? "462px" : "420px",
      }}
      role="button"
      aria-expanded={expanded}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpanded(!expanded) }}
    >
      <div className="relative w-full h-full overflow-hidden rounded-sm">
        {/* Image with grayscale effects */}
        <div className="absolute inset-0">
          <Image
            src={artist.image}
            alt={artist.name}
            fill
            className={`object-cover transition-all duration-700 ${
              status === "played" ? "grayscale brightness-50" : ""
            } ${status === "upcoming" ? "brightness-90" : ""}`}
            sizes="330px"
          />
          
          {/* Horizontal grayscale sweep for currently playing — left side goes B&W */}
          {status === "playing" && (
            <div
              className="absolute inset-0"
              style={{
                clipPath: `inset(0 ${100 - progress * 100}% 0 0)`,
                transition: "clip-path 1s linear",
              }}
            >
              <Image
                src={artist.image}
                alt=""
                fill
                className="object-cover grayscale brightness-50"
                sizes="330px"
                aria-hidden="true"
              />
            </div>
          )}
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent" />

        {/* Playing indicator red line */}
        {status === "playing" && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#2a2a2a]">
            <div
              className="h-full bg-[#dc2626] transition-all duration-1000 linear"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}

        {/* Timer badge */}
        <div
          className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-mono backdrop-blur-sm ${
            status === "playing"
              ? "bg-[#dc2626]/90 text-[#ffffff]"
              : status === "played"
              ? "bg-[#1a1a1a]/80 text-[#737373]"
              : "bg-[#1a1a1a]/80 text-[#a3a3a3]"
          }`}
        >
          <Clock className="w-3 h-3" />
          {timeDisplay}
        </div>

        {/* Status badge */}
        {status === "playing" && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-sm bg-[#dc2626]/90 text-[#ffffff] text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffffff] animate-pulse" />
            LIVE
          </div>
        )}

        {/* Info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-[10px] uppercase tracking-widest text-[#737373] mb-1">
            {artist.location}
          </p>
          <h3 className="text-lg font-bold text-[#e5e5e5] leading-tight mb-0.5">
            {artist.name}
          </h3>
          <p className="text-xs text-[#a3a3a3] tracking-wide">
            {artist.show}
          </p>

          {/* Expanded description */}
          <div
            className="overflow-hidden transition-all duration-500"
            style={{
              maxHeight: expanded ? "120px" : "0px",
              opacity: expanded ? 1 : 0,
              marginTop: expanded ? "12px" : "0px",
            }}
          >
            <div className="border-t border-[#dc2626]/40 pt-3">
              <p className="text-xs text-[#a3a3a3] leading-relaxed">
                {artist.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
