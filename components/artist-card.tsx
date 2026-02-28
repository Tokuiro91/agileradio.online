"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Clock } from "lucide-react"
import type { Artist } from "@/lib/artists-data"

interface ArtistCardProps {
  artist: Artist
  status?: "played" | "playing" | "upcoming"
  progress?: number
}

export function ArtistCard({ artist, status, progress: externalProgress = 0 }: ArtistCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [now, setNow] = useState(new Date())

  // Обновляем время каждую секунду
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Безопасное создание дат
  const start = useMemo(() => new Date(artist.startTime), [artist.startTime])
  const end = useMemo(() => new Date(artist.endTime), [artist.endTime])

  const isValidStart = !isNaN(start.getTime())
  const isValidEnd = !isNaN(end.getTime())

  // Статус может приходить сверху (RadioPlayer), а может вычисляться локально как резерв
  const localIsPlaying =
    isValidStart && isValidEnd && now >= start && now <= end

  const localIsPlayed = isValidEnd && now > end
  const localIsUpcoming = isValidStart && now < start

  const effectiveStatus: "played" | "playing" | "upcoming" =
    status ??
    (localIsPlaying ? "playing" : localIsPlayed ? "played" : "upcoming")

  const totalDuration =
    isValidStart && isValidEnd ? end.getTime() - start.getTime() : 0

  const elapsed = isValidStart ? now.getTime() - start.getTime() : 0

  const localProgress =
    localIsPlaying && totalDuration > 0
      ? Math.min(Math.max(elapsed / totalDuration, 0), 1)
      : 0

  const progress =
    typeof externalProgress === "number" && status
      ? Math.min(Math.max(externalProgress, 0), 1)
      : localProgress

  const formatLocal = (date: Date) => {
    if (!date || isNaN(date.getTime())) return "--:--"
    return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false })
  }

  const formatElapsed = (ms: number) => {
    if (ms <= 0) return "00:00:00"

    const totalSec = Math.floor(ms / 1000)
    const h = String(Math.floor(totalSec / 3600)).padStart(2, "0")
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0")
    const s = String(totalSec % 60).padStart(2, "0")
    return `${h}:${m}:${s}`
  }

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="relative flex-shrink-0 cursor-pointer transition-all duration-500 ease-out group font-sans"
      style={{
        width: expanded ? "330px" : "300px",
        height: expanded ? "462px" : "420px",
      }}
    >
      <div className="relative w-full h-full overflow-hidden rounded-sm">

        {/* IMAGE */}
        <div className="absolute inset-0">
          <Image
            src={artist.image}
            alt={artist.name}
            fill
            className={`object-cover transition-all duration-700 ${effectiveStatus === "played" ? "grayscale brightness-50" : ""
              } ${effectiveStatus === "upcoming" ? "brightness-90" : ""} ${expanded ? "brightness-50" : ""
              }`}
            sizes="330px"
          />

          {effectiveStatus === "playing" && (
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

          {expanded && (
            <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
          )}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent" />

        {/* Progress line */}
        {effectiveStatus === "playing" && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#2a2a2a]">
            <div
              className="h-full bg-[#dc2626]"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}

        {/* TIMER BADGE */}
        <div
          className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-mono backdrop-blur-sm ${effectiveStatus === "playing"
            ? "bg-[#dc2626]/90 text-white"
            : effectiveStatus === "played"
              ? "bg-[#1a1a1a]/80 text-[#737373]"
              : "bg-[#1a1a1a]/80 text-[#a3a3a3]"
            }`}
        >
          <Clock className="w-3 h-3" />
          {effectiveStatus === "playing"
            ? formatElapsed(elapsed)
            : `${formatLocal(start)} — ${formatLocal(end)}`}
        </div>

        {/* LIVE BADGE */}
        {effectiveStatus === "playing" && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-sm bg-[#dc2626]/90 text-white text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </div>
        )}

        {/* INFO */}
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

          <div
            className="overflow-hidden transition-all duration-500"
            style={{
              maxHeight: expanded ? "140px" : "0px",
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