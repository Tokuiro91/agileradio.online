"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react"
import { zeroPrime } from "@/app/fonts"
import type { Artist } from "@/lib/artists-data"
import { useArtists } from "@/lib/use-artists"
import { useAudioEngine } from "@/hooks/use-audio-engine"

function findCurrentArtistIndex(artists: { startTime: string; endTime: string }[]): number {
  const now = Date.now()
  return artists.findIndex((a) => {
    const s = new Date(a.startTime).getTime()
    const e = new Date(a.endTime).getTime()
    return now >= s && now < e
  })
}

function calcProgress(artist: { startTime: string; endTime: string }): number {
  const now = Date.now()
  const s = new Date(artist.startTime).getTime()
  const e = new Date(artist.endTime).getTime()
  if (now < s || e <= s) return 0
  if (now >= e) return 1
  return (now - s) / (e - s)
}

export function MobileRadio() {
  const { artists, ready } = useArtists()
  const [showVolume, setShowVolume] = useState(false)
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(-1)
  const [progress, setProgress] = useState(0)
  const [viewIndex, setViewIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [currentTime, setCurrentTime] = useState("")
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchDelta, setTouchDelta] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const listenerCount = 192

  // Sort by startTime
  const sortedArtists = useMemo(
    () => [...artists].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [artists]
  )
  const TOTAL = sortedArtists.length || 1

  // Audio engine
  const { isPlaying, volume, isMuted, togglePlay, setVolume, setIsMuted } =
    useAudioEngine(sortedArtists)

  // Clock
  useEffect(() => {
    const update = () => {
      const now = new Date()
      setCurrentTime(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
      )
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  // Real-time artist tracking
  useEffect(() => {
    if (!ready || !sortedArtists.length) return
    const tick = () => {
      const idx = findCurrentArtistIndex(sortedArtists)
      setCurrentPlayingIndex(idx)
      if (idx >= 0) setProgress(calcProgress(sortedArtists[idx]))
      else setProgress(0)
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [sortedArtists, ready])

  const getStatus = useCallback(
    (i: number): "played" | "playing" | "upcoming" => {
      if (currentPlayingIndex >= 0) {
        if (i < currentPlayingIndex) return "played"
        if (i === currentPlayingIndex) return "playing"
        return "upcoming"
      }
      const a = sortedArtists[i]
      if (!a) return "upcoming"
      const now = Date.now()
      const e = new Date(a.endTime).getTime()
      const s = new Date(a.startTime).getTime()
      if (now > e) return "played"
      if (now >= s) return "playing"
      return "upcoming"
    },
    [currentPlayingIndex, sortedArtists]
  )

  const navigate = (dir: -1 | 1) => {
    setViewIndex((i) => ((i + dir) % TOTAL + TOTAL) % TOTAL)
    setExpanded(false)
  }

  // Swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
    setIsSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return
    setTouchDelta(e.touches[0].clientX - touchStart)
  }

  const handleTouchEnd = () => {
    if (Math.abs(touchDelta) > 60) {
      navigate(touchDelta < 0 ? 1 : -1)
    }
    setTouchStart(null)
    setTouchDelta(0)
    setIsSwiping(false)
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
  }

  if (!ready || !sortedArtists.length) {
    return null
  }

  const artist = sortedArtists[viewIndex]
  const status = getStatus(viewIndex)
  const prevArtist = sortedArtists[((viewIndex - 1) % TOTAL + TOTAL) % TOTAL]
  const nextArtist = sortedArtists[(viewIndex + 1) % TOTAL]

  const getTimeDisplay = (a: Artist, s: "played" | "playing" | "upcoming") => {
    if (s === "playing") {
      const parts = a.duration.split(":").map(Number)
      const totalSec = parts[0] * 3600 + parts[1] * 60 + parts[2]
      const elapsed = Math.floor(totalSec * progress)
      const h = String(Math.floor(elapsed / 3600)).padStart(2, "0")
      const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0")
      const sSec = String(elapsed % 60).padStart(2, "0")
      return `${h}:${m}:${sSec}`
    }
    return a.duration
  }

  const timeDisplay = getTimeDisplay(artist, status)

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] overflow-hidden select-none">
      {/* Mobile Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border-b border-[#2a2a2a] z-20">
        <h1
          className={`${zeroPrime.className} text-xl font-bold tracking-wider text-[#e5e5e5]`}
        >
          A<span className="text-red-600">G</span>ILE
        </h1>
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1f1f1f] text-[#a3a3a3] text-[10px] uppercase tracking-[0.15em]"
          >
            <Info className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Time displays */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a0a]">
        <div>
          <p className="text-[9px] uppercase tracking-[0.15em] text-[#737373] mb-0.5">
            Текущее время
          </p>
          <p className="text-2xl font-mono font-bold text-[#e5e5e5] tracking-tight">
            {currentTime}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] uppercase tracking-[0.15em] text-[#737373] mb-0.5">
            Начало
          </p>
          <p className="text-2xl font-mono font-bold text-[#e5e5e5] tracking-tight">
            {timeDisplay}
          </p>
        </div>
      </div>

      {/* Main card area with swipe */}
      <div
        className="flex-1 relative flex items-center justify-center px-4 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Previous card peek (left) */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-48 overflow-hidden opacity-40 z-0"
          style={{
            transform: `translateX(${isSwiping ? touchDelta * 0.3 : 0}px) translateY(-50%)`,
          }}
        >
          <Image
            src={prevArtist.image}
            alt=""
            fill
            className={`object-cover ${getStatus(((viewIndex - 1) % TOTAL + TOTAL) % TOTAL) === "played" ? "grayscale" : ""}`}
            sizes="48px"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] to-transparent" />
        </div>

        {/* Next card peek (right) */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-48 overflow-hidden opacity-40 z-0"
          style={{
            transform: `translateX(${isSwiping ? touchDelta * 0.3 : 0}px) translateY(-50%)`,
          }}
        >
          <Image
            src={nextArtist.image}
            alt=""
            fill
            className={`object-cover ${getStatus((viewIndex + 1) % TOTAL) === "played" ? "grayscale" : ""}`}
            sizes="48px"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#0a0a0a] to-transparent" />
        </div>

        {/* Main card */}
        <div
          className="relative w-full max-w-[300px] z-10 transition-transform duration-200"
          style={{
            transform: isSwiping ? `translateX(${touchDelta}px)` : "translateX(0)",
          }}
        >
          {/* Red border frame */}
          <div className="p-1 bg-[#dc2626] rounded-sm">
            <div
              className="relative w-full overflow-hidden rounded-sm cursor-pointer"
              style={{
                aspectRatio: expanded ? "3/4.5" : "3/4",
                transition: "aspect-ratio 0.5s ease",
              }}
              onClick={() => setExpanded(!expanded)}
            >
              {/* Artist image */}
              <Image
                src={artist.image}
                alt={artist.name}
                fill
                className={`object-cover transition-all duration-500 ${status === "played" ? "grayscale brightness-50" : ""
                  }`}
                sizes="300px"
                priority
              />

              {/* Grayscale sweep for playing */}
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
                    sizes="300px"
                    aria-hidden="true"
                  />
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />

              {/* Playing progress bar */}
              {status === "playing" && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#2a2a2a]">
                  <div
                    className="h-full bg-[#dc2626] transition-all duration-1000 linear"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              )}

              {/* LIVE badge */}
              {status === "playing" && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#dc2626] text-[#ffffff] text-[10px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffffff] animate-pulse" />
                  LIVE
                </div>
              )}

              {/* Artist info */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-[9px] uppercase tracking-[0.15em] text-[#737373] mb-0.5">
                  {artist.location}
                </p>
                <h2 className="text-xl font-bold text-[#e5e5e5] leading-tight">
                  {artist.name}
                </h2>
                <p className="text-xs text-[#a3a3a3] tracking-wide mt-0.5">
                  {artist.show}
                </p>

                {/* Expanded description */}
                <div
                  className="overflow-hidden transition-all duration-500"
                  style={{
                    maxHeight: expanded ? "100px" : "0px",
                    opacity: expanded ? 1 : 0,
                    marginTop: expanded ? "10px" : "0px",
                  }}
                >
                  <div className="border-t border-[#ffffff]/20 pt-2">
                    <p className="text-[11px] text-[#a3a3a3] leading-relaxed">
                      {artist.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Day label */}
          <div className="mt-2 flex items-center gap-1.5 justify-center">
            <div className="w-1.5 h-1.5 rotate-45 bg-[#dc2626]" />
            <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#737373]">
              {new Date(artist.startTime).toLocaleDateString(undefined, {
                day: "numeric",
                month: "long",
              }).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Navigation arrows (for non-touch) */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-[#1a1a1a]/80 text-[#e5e5e5] z-20 active:bg-[#dc2626] transition-colors"
          aria-label="Предыдущий"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate(1)}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-[#1a1a1a]/80 text-[#e5e5e5] z-20 active:bg-[#dc2626] transition-colors"
          aria-label="Следующий"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom control bar */}
      <div className="bg-[#0a0a0a] border-t border-[#2a2a2a] px-3 py-2 z-20">
        {/* Mini timeline */}
        <div className="flex items-end gap-px h-4 mb-2">
          {sortedArtists.map((_, i) => {
            const isPlayed = currentPlayingIndex >= 0 && i < currentPlayingIndex
            const isCurrentPlaying = i === currentPlayingIndex
            const isViewing = i === viewIndex
            return (
              <button
                key={i}
                onClick={() => {
                  setViewIndex(i)
                  setExpanded(false)
                }}
                className={`flex-1 rounded-t-sm transition-all duration-200 ${isCurrentPlaying
                  ? "bg-[#dc2626] h-full"
                  : isPlayed
                    ? "bg-[#737373] h-3/5"
                    : "bg-[#2a2a2a] h-2/5"
                  } ${isViewing ? "ring-1 ring-[#e5e5e5]" : ""}`}
                style={{ minHeight: "3px" }}
                aria-label={`Артист ${i + 1}`}
              />
            )
          })}
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[10px] text-[#737373] font-mono">
              <Users className="w-3 h-3" />
              {listenerCount}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[#737373] font-mono">
              <Clock className="w-3 h-3" />
              {viewIndex + 1}/{TOTAL}
            </div>
          </div>

          {/* Play button */}
          <button
            onClick={togglePlay}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-[#dc2626] text-[#ffffff] active:scale-95 transition-transform shadow-lg shadow-[#dc2626]/20"
            aria-label={isPlaying ? "Пауза" : "Воспроизведение"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>

          {/* Volume */}
          <div className="relative">
            <button
              onClick={() => setShowVolume(!showVolume)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1f1f1f] text-[#e5e5e5] active:bg-[#2a2a2a] transition-colors"
              aria-label="Громкость"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            {showVolume && (
              <div className="absolute bottom-full right-0 mb-2 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-sm shadow-lg w-[200px]">
                <div className="flex items-center gap-2">
                  <button onClick={handleMuteToggle} className="text-[#737373] active:text-[#e5e5e5]">
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-3.5 h-3.5" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setVolume(val)
                      if (val > 0) setIsMuted(false)
                    }}
                    className="flex-1 h-1 appearance-none bg-[#2a2a2a] rounded-full accent-[#dc2626] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#dc2626]"
                  />
                  <span className="text-[10px] font-mono text-[#737373] w-6 text-right">
                    {isMuted ? 0 : volume}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
