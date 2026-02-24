"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import Image from "next/image"
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
import { generateArtists, DAY_LABELS } from "@/lib/artists-data"

const STREAM_URL = "https://stream.techno.fm/radio1-320k.mp3"

export function MobileRadio() {
  const artists = useMemo(() => generateArtists(), [])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [isPlaying, setIsPlaying] = useState(false) // важно: false
  const [volume, setVolume] = useState(75)
  const [showVolume, setShowVolume] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [prevVolume, setPrevVolume] = useState(75)

  const [currentPlayingIndex] = useState(5)
  const [progress, setProgress] = useState(0.35)
  const [viewIndex, setViewIndex] = useState(5)
  const [expanded, setExpanded] = useState(false)
  const [currentTime, setCurrentTime] = useState("")

  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchDelta, setTouchDelta] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)

  const listenerCount = 192
  const TOTAL = artists.length

  /* ===================== AUDIO ===================== */

  // Play / Pause
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false)
      })
    } else {
      audio.pause()
    }
  }, [isPlaying])

  // Volume
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = Math.min(Math.max(volume / 100, 0), 1)
  }, [volume])

  /* ===================== CLOCK ===================== */

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setCurrentTime(
        `${String(now.getHours()).padStart(2, "0")}:${String(
          now.getMinutes()
        ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
      )
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  /* ===================== FAKE PROGRESS ===================== */

  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setProgress((p) => (p >= 1 ? 0 : p + 0.0005))
    }, 100)
    return () => clearInterval(interval)
  }, [isPlaying])

  /* ===================== HELPERS ===================== */

  const getStatus = useCallback(
    (i: number): "played" | "playing" | "upcoming" => {
      if (i < currentPlayingIndex) return "played"
      if (i === currentPlayingIndex) return "playing"
      return "upcoming"
    },
    [currentPlayingIndex]
  )

  const navigate = (dir: -1 | 1) => {
    setViewIndex((i) => ((i + dir) % TOTAL + TOTAL) % TOTAL)
    setExpanded(false)
  }

  const handleMuteToggle = () => {
    if (isMuted) {
      setVolume(prevVolume)
      setIsMuted(false)
    } else {
      setPrevVolume(volume)
      setVolume(0)
      setIsMuted(true)
    }
  }

  const artist = artists[viewIndex]
  const status = getStatus(viewIndex)

  const timeDisplay = useMemo(() => {
    if (status === "playing") {
      const parts = artist.duration.split(":").map(Number)
      const totalSec = parts[0] * 3600 + parts[1] * 60 + parts[2]
      const elapsed = Math.floor(totalSec * progress)
      const m = String(Math.floor(elapsed / 60)).padStart(2, "0")
      const s = String(elapsed % 60).padStart(2, "0")
      return `${m}:${s}`
    }
    return artist.duration
  }, [artist.duration, status, progress])

  /* ===================== JSX ===================== */

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] overflow-hidden select-none">
      {/* REAL AUDIO */}
      <audio
        ref={audioRef}
        src={STREAM_URL}
        preload="none"
        crossOrigin="anonymous"
      />

      {/* HEADER */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
        <h1 className="text-xl font-bold tracking-wider text-[#e5e5e5]">
          A<span className="text-red-600">G</span>ILE
        </h1>
        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1f1f1f]">
          <Info className="w-3.5 h-3.5 text-[#a3a3a3]" />
        </button>
      </header>

      {/* TIME */}
      <div className="flex justify-between px-4 py-3">
        <div>
          <p className="text-[9px] text-[#737373] uppercase">Текущее время</p>
          <p className="text-2xl font-mono text-[#e5e5e5]">{currentTime}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-[#737373] uppercase">Начало</p>
          <p className="text-2xl font-mono text-[#e5e5e5]">{timeDisplay}</p>
        </div>
      </div>

      {/* PLAY BUTTON */}
      <div className="mt-auto px-4 py-6 flex justify-center">
        <button
          onClick={() => setIsPlaying((p) => !p)}
          className="w-14 h-14 rounded-full bg-[#dc2626] flex items-center justify-center"
        >
          {isPlaying ? <Pause /> : <Play className="ml-1" />}
        </button>
      </div>
    </div>
  )
}
