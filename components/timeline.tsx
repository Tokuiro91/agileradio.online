"use client"

import { useCallback, useMemo } from "react"
import { DAY_LABELS } from "@/lib/artists-data"

interface TimelineProps {
  totalArtists: number
  currentPlayingIndex: number
  visibleIndex: number
  onSeek: (index: number) => void
}

export function Timeline({ totalArtists, currentPlayingIndex, visibleIndex, onSeek }: TimelineProps) {
  const artistsPerDay = 10
  
  const days = useMemo(() => {
    const result: { label: string; startIndex: number; count: number }[] = []
    for (let d = 0; d < 3; d++) {
      result.push({
        label: DAY_LABELS[d],
        startIndex: d * artistsPerDay,
        count: artistsPerDay,
      })
    }
    return result
  }, [])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const ratio = x / rect.width
      const index = Math.min(Math.floor(ratio * totalArtists), totalArtists - 1)
      onSeek(index)
    },
    [totalArtists, onSeek]
  )

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-[#2a2a2a]">
      {/* Timeline bars */}
      <div
        className="relative w-full h-8 cursor-pointer group"
        onClick={handleClick}
        role="slider"
        aria-label="Навигация по артистам"
        aria-valuemin={0}
        aria-valuemax={totalArtists - 1}
        aria-valuenow={visibleIndex}
        tabIndex={0}
      >
        <div className="absolute inset-0 flex">
          {Array.from({ length: totalArtists }).map((_, i) => {
            const isPlayed = i < currentPlayingIndex
            const isPlaying = i === currentPlayingIndex
            const isVisible = i === visibleIndex
            
            return (
              <div
                key={i}
                className="relative flex-1 flex items-end px-px"
                style={{ height: "100%" }}
              >
                <div
                  className={`w-full transition-all duration-300 rounded-t-sm ${
                    isPlaying
                      ? "bg-[#dc2626] h-full"
                      : isPlayed
                      ? "bg-[#737373] h-3/5"
                      : "bg-[#2a2a2a] h-2/5"
                  } ${isVisible ? "ring-1 ring-[#e5e5e5]" : ""}`}
                  style={{
                    minHeight: "4px",
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Day labels */}
      <div className="relative flex h-6">
        {days.map((day, i) => (
          <div
            key={i}
            className="flex-1 flex items-center border-r border-[#2a2a2a] last:border-r-0"
          >
            <button
              onClick={() => onSeek(day.startIndex)}
              className="px-3 text-[10px] font-mono uppercase tracking-widest text-[#737373] hover:text-[#dc2626] transition-colors"
            >
              {day.label}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
