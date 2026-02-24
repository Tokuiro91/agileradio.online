"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { generateArtists } from "@/lib/artists-data"
import { Header } from "@/components/header"
import { ArtistCard } from "@/components/artist-card"
import { Timeline } from "@/components/timeline"


export function RadioPlayer() {
  const artists = useMemo(() => generateArtists(), [])
  const [isPlaying, setIsPlaying] = useState(true)
  const [volume, setVolume] = useState(75)
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(5)
  const [progress, setProgress] = useState(0.35)
  const [visibleIndex, setVisibleIndex] = useState(5)
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const listenerCount = 192
  const CARD_WIDTH = 316
  const TOTAL_CARDS = artists.length

  // Progress simulation
  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          setCurrentPlayingIndex((idx) => (idx + 1) % TOTAL_CARDS)
          return 0
        }
        return prev + 0.0005
      })
    }, 100)
    return () => clearInterval(interval)
  }, [isPlaying, TOTAL_CARDS])

  // Infinite scroll: when we reach the end, jump back, and vice-versa
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handleScroll = () => {
      const scrollLeft = el.scrollLeft
      const maxScroll = el.scrollWidth - el.clientWidth
      // Calculate visible index
      const idx = Math.round(scrollLeft / CARD_WIDTH) % TOTAL_CARDS
      setVisibleIndex(Math.max(0, Math.min(idx, TOTAL_CARDS - 1)))
      // Infinite scroll: wrap around
      if (scrollLeft <= 0) {
        el.scrollLeft = CARD_WIDTH * TOTAL_CARDS
      } else if (scrollLeft >= maxScroll - 10) {
        el.scrollLeft = CARD_WIDTH * TOTAL_CARDS
      }
    }
    el.addEventListener("scroll", handleScroll, { passive: true })
    return () => el.removeEventListener("scroll", handleScroll)
  }, [TOTAL_CARDS])

  // Initial scroll to playing artist
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    // Set initial position to the "second copy" so infinite scroll works in both directions
    const targetScroll = CARD_WIDTH * (TOTAL_CARDS + currentPlayingIndex) - el.clientWidth / 2 + CARD_WIDTH / 2
    el.scrollLeft = targetScroll
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const scrollToArtist = useCallback(
    (index: number) => {
      const el = scrollRef.current
      if (!el) return
      const targetScroll = CARD_WIDTH * (TOTAL_CARDS + index) - el.clientWidth / 2 + CARD_WIDTH / 2
      el.scrollTo({ left: targetScroll, behavior: "smooth" })
    },
    [TOTAL_CARDS]
  )

  const getStatus = useCallback(
    (index: number): "played" | "playing" | "upcoming" => {
      const realIndex = index % TOTAL_CARDS
      if (realIndex < currentPlayingIndex) return "played"
      if (realIndex === currentPlayingIndex) return "playing"
      return "upcoming"
    },
    [currentPlayingIndex, TOTAL_CARDS]
  )

  // Generate 3x copies for infinite scroll
  const tripleArtists = useMemo(() => {
    return [...artists, ...artists, ...artists]
  }, [artists])

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0a]">
      <Header
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        volume={volume}
        onVolumeChange={setVolume}
        listenerCount={listenerCount}
      />

      {/* Background ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#dc2626]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#dc2626]/5 rounded-full blur-[100px]" />
      </div>

      {/* Main horizontal scroll area */}
      <div
        ref={scrollRef}
        className="absolute inset-0 pt-16 pb-16 flex items-center overflow-x-auto overflow-y-hidden scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="flex items-center gap-4 px-8" style={{ minWidth: "max-content" }}>
          {tripleArtists.map((artist, i) => {
            const realIndex = i % TOTAL_CARDS
            // Sawtooth wave pattern: cards gradually go up then sharply drop
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
                {/* Day separator */}
                {realIndex % 10 === 0 && (
                  <div className="flex items-center gap-2 mb-3 pl-1">
                    <div className="w-2 h-2 rotate-45 bg-[#dc2626]" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#dc2626]">
                      {["1 МАРТА", "2 МАРТА", "3 МАРТА"][artist.dayIndex]}
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
      />

      {/* Hide scrollbar */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
