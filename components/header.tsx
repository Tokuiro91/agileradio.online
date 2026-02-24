"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, Volume2, VolumeX, Users, Clock } from "lucide-react"

interface HeaderProps {
  volume: number
  listenerCount: number
}

export function Header({ volume, listenerCount }: HeaderProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showVolume, setShowVolume] = useState(false)
  const [currentTime, setCurrentTime] = useState("")
  const [timeZone, setTimeZone] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const [prevVolume, setPrevVolume] = useState(volume)
  const [currentVolume, setCurrentVolume] = useState(volume)

  const audioRef = useRef<HTMLAudioElement>(null)
  const radioUrl = "https://stream.techno.fm/radio1-320k.mp3"

  // Обновление времени каждую секунду
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const h = String(now.getHours()).padStart(2, "0")
      const m = String(now.getMinutes()).padStart(2, "0")
      const s = String(now.getSeconds()).padStart(2, "0")
      setCurrentTime(`${h}:${m}:${s}`)
      setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleTogglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleMuteToggle = () => {
    if (!audioRef.current) return
    if (isMuted) {
      audioRef.current.volume = prevVolume / 100
      setCurrentVolume(prevVolume)
      setIsMuted(false)
    } else {
      setPrevVolume(currentVolume)
      audioRef.current.volume = 0
      setCurrentVolume(0)
      setIsMuted(true)
    }
  }

  const handleVolumeChange = (val: number) => {
    if (!audioRef.current) return
    audioRef.current.volume = val / 100
    setCurrentVolume(val)
    if (val > 0) setIsMuted(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 h-14 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#2a2a2a]">
      <audio ref={audioRef} src={radioUrl} preload="none" />

      {/* Логотип AGILE */}
      <div className="flex items-center gap-4">
       <h1 style={{ fontFamily: 'Zero Prime Expanded' }} className="text-xl md:text-2xl tracking-wider logo-agile">
  A<span className="text-red-600">G</span>ILE
</h1>



        {/* Время для десктопа */}
        <div className="hidden md:flex items-center gap-2 text-xs text-[#737373] font-mono">
          <Clock className="w-3 h-3" />
          <span>{currentTime} ({timeZone})</span>
        </div>
      </div>

      {/* Время для мобильного */}
      <div className="flex items-center gap-2 md:gap-4 text-xs text-[#737373] font-mono">
        <span className="hidden sm:block">{currentTime}</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Play/Pause */}
        <button
          onClick={handleTogglePlay}
          className="flex items-center justify-center w-9 h-9 rounded-sm bg-[#dc2626] text-[#ffffff] hover:bg-[#ef4444] transition-colors"
          aria-label={isPlaying ? "Пауза" : "Воспроизведение"}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        {/* Громкость */}
        <div className="relative">
          <button
            onClick={() => setShowVolume(!showVolume)}
            className="flex items-center justify-center w-9 h-9 rounded-sm bg-[#1f1f1f] text-[#e5e5e5] hover:bg-[#2a2a2a] transition-colors"
            aria-label="Громкость"
          >
            {isMuted || currentVolume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {showVolume && (
            <div className="absolute top-full right-0 mt-2 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-sm shadow-lg min-w-[180px]">
              <div className="flex items-center gap-3">
                <button onClick={handleMuteToggle} className="text-[#737373] hover:text-[#e5e5e5] transition-colors">
                  {isMuted || currentVolume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={currentVolume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="flex-1 h-1 appearance-none bg-[#2a2a2a] rounded-full accent-[#dc2626] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#dc2626]"
                />
                <span className="text-xs font-mono text-[#737373] w-8 text-right">{currentVolume}</span>
              </div>
            </div>
          )}
        </div>

        {/* Количество слушателей */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#737373]">
          <Users className="w-3.5 h-3.5" />
          <span className="font-mono">{listenerCount}</span>
        </div>

        <button className="hidden md:block text-xs text-[#737373] hover:text-[#e5e5e5] transition-colors uppercase tracking-wider">
          О проекте
        </button>
      </div>
    </header>
  )
}
