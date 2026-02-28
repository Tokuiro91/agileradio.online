"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Header } from "@/components/header"
import { ArtistCard } from "@/components/artist-card"
import { Timeline } from "@/components/timeline"
import { useArtists } from "@/lib/use-artists"
import { useAudioEngine } from "@/hooks/use-audio-engine"

/** Returns index of currently-playing artist (by real clock), or -1 */
function findCurrentArtistIndex(artists: { startTime: string; endTime: string }[]): number {
  const now = Date.now()
  return artists.findIndex((a) => {
    const s = new Date(a.startTime).getTime()
    const e = new Date(a.endTime).getTime()
    return now >= s && now < e
  })
}

/** Progress [0..1] for a given artist based on real time */
function calcProgress(artist: { startTime: string; endTime: string }): number {
  const now = Date.now()
  const s = new Date(artist.startTime).getTime()
  const e = new Date(artist.endTime).getTime()
  if (now < s || e <= s) return 0
  if (now >= e) return 1
  return (now - s) / (e - s)
}

/** Local calendar date string — so grouping respects the user's timezone */
function localDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

export function RadioPlayer() {
  const { artists, ready } = useArtists()
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(-1)
  const [progress, setProgress] = useState(0)
  const [visibleIndex, setVisibleIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const CARD_WIDTH = 316

  // ── Sort artists by startTime ──────────────────────────────────────────────
  const sortedArtists = useMemo(
    () => [...artists].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [artists]
  )
  const TOTAL_CARDS = sortedArtists.length || 1

  // ── Audio engine — shared play/pause, volume, scheduled audio ─────────────
  const {
    isPlaying,
    volume,
    isMuted,
    togglePlay,
    setVolume,
    setIsMuted,
  } = useAudioEngine(sortedArtists)

  // ── Real-time tracking: currentPlayingIndex + progress every second ────────
  useEffect(() => {
    if (!ready || !sortedArtists.length) return
    const tick = () => {
      const idx = findCurrentArtistIndex(sortedArtists)
      setCurrentPlayingIndex(idx)
      setProgress(idx >= 0 ? calcProgress(sortedArtists[idx]) : 0)
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [sortedArtists, ready])

  // ── Infinite scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ready) return
    const el = scrollRef.current
    if (!el) return
    const handleScroll = () => {
      const scrollLeft = el.scrollLeft
      const maxScroll = el.scrollWidth - el.clientWidth
      const idx = Math.round(scrollLeft / CARD_WIDTH) % TOTAL_CARDS
      setVisibleIndex(Math.max(0, Math.min(idx, TOTAL_CARDS - 1)))
      if (scrollLeft <= 0) {
        el.scrollLeft = CARD_WIDTH * TOTAL_CARDS
      } else if (scrollLeft >= maxScroll - 10) {
        el.scrollLeft = CARD_WIDTH * TOTAL_CARDS
      }
    }
    el.addEventListener("scroll", handleScroll, { passive: true })
    return () => el.removeEventListener("scroll", handleScroll)
  }, [TOTAL_CARDS, ready])

  // ── Drag scroll (LMB hold + drag) ─────────────────────────────────────────
  useEffect(() => {
    if (!ready) return
    const el = scrollRef.current
    if (!el) return
    let isDragging = false
    let startX = 0
    let scrollStart = 0

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true
      startX = e.clientX
      scrollStart = el.scrollLeft
      el.style.cursor = "grabbing"
      el.style.userSelect = "none"
    }
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const dx = e.clientX - startX
      el.scrollLeft = scrollStart - dx
    }
    const onMouseUp = () => {
      isDragging = false
      el.style.cursor = ""
      el.style.userSelect = ""
    }

    el.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    return () => {
      el.removeEventListener("mousedown", onMouseDown)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [ready])

  // ── Wheel scroll (vertical → horizontal) ──────────────────────────────────
  useEffect(() => {
    if (!ready) return
    const el = scrollRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return // already horizontal
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [ready])

  // Initial scroll to playing (or first) artist
  useEffect(() => {
    if (!ready) return
    const el = scrollRef.current
    if (!el) return
    const targetIdx = currentPlayingIndex >= 0 ? currentPlayingIndex : 0
    const targetScroll =
      CARD_WIDTH * (TOTAL_CARDS + targetIdx) - el.clientWidth / 2 + CARD_WIDTH / 2
    el.scrollLeft = targetScroll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [TOTAL_CARDS, ready])

  const scrollToArtist = useCallback(
    (index: number) => {
      const el = scrollRef.current
      if (!el) return
      const targetScroll =
        CARD_WIDTH * (TOTAL_CARDS + index) - el.clientWidth / 2 + CARD_WIDTH / 2
      el.scrollTo({ left: targetScroll, behavior: "smooth" })
    },
    [TOTAL_CARDS]
  )

  const getStatus = useCallback(
    (index: number): "played" | "playing" | "upcoming" => {
      const realIndex = index % TOTAL_CARDS
      if (currentPlayingIndex >= 0) {
        if (realIndex < currentPlayingIndex) return "played"
        if (realIndex === currentPlayingIndex) return "playing"
        return "upcoming"
      }
      const artist = sortedArtists[realIndex]
      if (!artist) return "upcoming"
      const now = Date.now()
      const end = new Date(artist.endTime).getTime()
      const start = new Date(artist.startTime).getTime()
      if (now > end) return "played"
      if (now >= start) return "playing"
      return "upcoming"
    },
    [currentPlayingIndex, TOTAL_CARDS, sortedArtists]
  )

  // 3× copies for infinite scroll
  const tripleArtists = useMemo(() => {
    if (!sortedArtists.length) return []
    return [...sortedArtists, ...sortedArtists, ...sortedArtists]
  }, [sortedArtists])

  if (!ready || !sortedArtists.length) return null

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Header receives audio engine controls */}
      <Header
        volume={volume}
        isMuted={isMuted}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onVolumeChange={setVolume}
        onMuteToggle={() => setIsMuted(!isMuted)}
      />

      {/* Background ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#dc2626]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#dc2626]/5 rounded-full blur-[100px]" />
      </div>

      {/* Horizontal scroll area */}
      <div
        ref={scrollRef}
        className="absolute inset-0 pt-16 pb-16 flex items-center overflow-x-auto overflow-y-hidden scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex items-center gap-4 px-8" style={{ minWidth: "max-content" }}>
          {tripleArtists.map((artist, i) => {
            const realIndex = i % TOTAL_CARDS

            // Date separator (local timezone):
            // Show when local calendar date changes vs the previous card.
            const prevDate =
              i === 0
                ? null
                : localDate(sortedArtists[(i - 1) % TOTAL_CARDS].startTime)
            const thisDate = localDate(sortedArtists[realIndex].startTime)
            const isFirstOfDay = prevDate !== thisDate

            // Sawtooth wave
            const sawtoothPeriod = 6
            const t = (realIndex % sawtoothPeriod) / sawtoothPeriod
            const waveOffset = (1 - t) * 150 - 75

            return (
              <div
                key={`${artist.id}-${i}`}
                ref={(el) => { cardRefs.current[i] = el }}
                className="flex-shrink-0 transition-transform duration-500"
                style={{ transform: `translateY(${waveOffset}px)` }}
              >
                {isFirstOfDay && (
                  <div className="flex items-center gap-2 mb-3 pl-1">
                    <div className="w-2 h-2 rotate-45 bg-[#dc2626]" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#dc2626]">
                      {new Date(artist.startTime).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "long",
                      }).toUpperCase()}
                    </span>
                    <div className="flex-1 h-px bg-[#2a2a2a]" />
                  </div>
                )}

                <ArtistCard
                  artist={artist}
                  status={getStatus(i)}
                  progress={realIndex === currentPlayingIndex ? progress : 0}
                />
              </div>
            )
          })}
        </div>
      </div>

      <Timeline
        totalArtists={TOTAL_CARDS}
        currentPlayingIndex={currentPlayingIndex}
        visibleIndex={visibleIndex}
        onSeek={scrollToArtist}
        artists={sortedArtists}
      />

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
