"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, Volume2, VolumeX, Clock } from "lucide-react"
import { zeroPrime } from "@/app/fonts"

interface HeaderProps {
  volume?: number
}

const STREAM_URLS: Record<96 | 192, string> = {
  192: "https://stream.techno.fm/radio1-192k.mp3",
  96: "https://stream.techno.fm/radio1-96k.mp3",
}

export function Header({ volume = 75 }: HeaderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentVolume, setCurrentVolume] = useState(volume)
  const [isMuted, setIsMuted] = useState(false)
  const [showVolume, setShowVolume] = useState(false)

  const [time, setTime] = useState("")
  const [timeZoneOffset, setTimeZoneOffset] = useState("")

  const [bitrate, setBitrate] = useState<96 | 192>(192)
  const [showBitrateMenu, setShowBitrateMenu] = useState(false)

  /* ===== TIME ===== */
  useEffect(() => {
    const update = () => {
      const now = new Date()

      const hh = String(now.getHours()).padStart(2, "0")
      const mm = String(now.getMinutes()).padStart(2, "0")
      const ss = String(now.getSeconds()).padStart(2, "0")
      setTime(`${hh}:${mm}:${ss}`)

      const offsetMinutes = now.getTimezoneOffset()
      const offsetHours = -offsetMinutes / 60
      const sign = offsetHours >= 0 ? "+" : "-"
      setTimeZoneOffset(`UTC${sign}${Math.abs(offsetHours)}`)
    }

    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  /* ===== VOLUME ===== */
  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = isMuted ? 0 : currentVolume / 100
  }, [currentVolume, isMuted])

  /* ===== PLAY / PAUSE ===== */
  const togglePlay = async () => {
    if (!audioRef.current) return

    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch {
      setIsPlaying(false)
    }
  }

  const handleBitrateChange = async (value: 96 | 192) => {
    if (!audioRef.current || value === bitrate) {
      setShowBitrateMenu(false)
      return
    }

    const wasPlaying = isPlaying
    setBitrate(value)
    setShowBitrateMenu(false)

    try {
      audioRef.current.pause()
      audioRef.current.load()
      if (wasPlaying) {
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch {
      setIsPlaying(false)
    }
  }

  const toggleMute = () => setIsMuted((m) => !m)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 px-4 md:px-8 flex items-center justify-between bg-[#0a0a0a]/90 backdrop-blur border-b border-[#2a2a2a]">
      <audio ref={audioRef} src={STREAM_URLS[bitrate]} preload="none" />

      {/* LEFT */}
      <div className="flex items-center gap-4">
        <h1
          className={`${zeroPrime.className} text-xl md:text-2xl tracking-wider text-[#e5e5e5]`}
        >
          A<span className="text-red-600">G</span>ILE
        </h1>

        <div className="hidden md:flex items-center gap-2 text-xs text-[#737373] font-mono">
          <Clock className="w-3 h-3" />
          <span>{time} ({timeZoneOffset})</span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {/* PLAY */}
        <button
          onClick={togglePlay}
          className="w-9 h-9 flex items-center justify-center bg-[#dc2626] text-white rounded-sm hover:bg-[#ef4444] transition"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        {/* VOLUME */}
        <div className="relative">
          <button
            onClick={() => setShowVolume((v) => !v)}
            className="w-9 h-9 flex items-center justify-center bg-[#1f1f1f] text-[#e5e5e5] rounded-sm hover:bg-[#2a2a2a]"
          >
            {isMuted || currentVolume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          {showVolume && (
            <div className="absolute right-0 top-full mt-2 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-sm w-[180px]">
              <div className="flex items-center gap-3">
                <button onClick={toggleMute} className="text-[#737373] hover:text-[#e5e5e5]">
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <input
                  type="range"
                  min={0}
                  max={100}
                  value={currentVolume}
                  onChange={(e) => {
                    setCurrentVolume(Number(e.target.value))
                    setIsMuted(false)
                  }}
                  className="flex-1 h-1 bg-[#2a2a2a] rounded-full accent-[#dc2626]"
                />

                <span className="w-8 text-right text-xs font-mono text-[#737373]">
                  {isMuted ? 0 : currentVolume}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* QUALITY */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setShowBitrateMenu((v) => !v)}
            className="text-xs uppercase tracking-wider text-[#737373] hover:text-[#e5e5e5]"
          >
            {bitrate} kbps
          </button>

          {showBitrateMenu && (
            <div className="absolute right-0 top-full mt-2 w-32 bg-[#1a1a1a] border border-[#2a2a2a] rounded-sm">
              {[192, 96].map((v) => (
                <button
                  key={v}
                  onClick={() => handleBitrateChange(v as 96 | 192)}
                  className={`w-full px-3 py-1.5 text-left hover:bg-[#2a2a2a] ${
                    bitrate === v ? "text-[#e5e5e5]" : "text-[#a3a3a3]"
                  }`}
                >
                  {v} kbps
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}