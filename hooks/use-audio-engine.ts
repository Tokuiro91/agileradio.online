"use client"

/**
 * useAudioEngine — единый движок воспроизведения для расписания радио.
 *
 * Логика:
 *  - isPlaying: мастер-переключатель (кнопка Play)
 *  - Каждую секунду ищем артиста, у которого now ∈ [startTime, endTime] и есть audioUrl
 *  - Если URL внешний (http...) — автоподгрузка за 10 мин до начала:
 *      T-10min → audio.load() (буферизация без воспроизведения)
 *      T=0     → audio.play()
 *      T=end   → audio.pause()
 *      T+10min → audio.src = "" (снятие подгрузки)
 *  - Если загруженный файл — seek к нужной позиции при позднем входе
 *  - При смене артиста — Fade-out (1 сек)
 */

import { useCallback, useEffect, useRef, useState } from "react"
import type { Artist } from "@/lib/artists-data"

const FADE_DURATION_MS = 1000
const FADE_STEPS = 20
const PRELOAD_BEFORE_MS = 10 * 60 * 1000  // 10 min before start
const RELEASE_AFTER_MS = 10 * 60 * 1000  // 10 min after end

function isExternalUrl(url: string) {
    return url.startsWith("http://") || url.startsWith("https://")
}

/** Artist whose slot is currently active (now ∈ [start, end]) */
function findActiveArtist(artists: Artist[]): Artist | null {
    const now = Date.now()
    return artists.find((a) => {
        if (!a.audioUrl) return false
        const s = new Date(a.startTime).getTime()
        const e = new Date(a.endTime).getTime()
        return now >= s && now < e
    }) ?? null
}

/** Artist that should be preloaded (T-10min before start, not yet playing) */
function findPreloadArtist(artists: Artist[]): Artist | null {
    const now = Date.now()
    return artists.find((a) => {
        if (!a.audioUrl || !isExternalUrl(a.audioUrl)) return false
        const s = new Date(a.startTime).getTime()
        const e = new Date(a.endTime).getTime()
        // Window: [start - 10min, start)
        return now >= s - PRELOAD_BEFORE_MS && now < s && now < e
    }) ?? null
}

/** Should we release the stream? (more than 10 min after end) */
function shouldReleaseArtist(artist: Artist | null): boolean {
    if (!artist) return false
    const now = Date.now()
    const e = new Date(artist.endTime).getTime()
    return now >= e + RELEASE_AFTER_MS
}

/** Elapsed seconds from startTime to now (for seeking into uploaded files) */
function calcSeekPosition(artist: Artist): number {
    const now = Date.now()
    const s = new Date(artist.startTime).getTime()
    return Math.max(0, (now - s) / 1000)
}

export function useAudioEngine(artists: Artist[]) {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const preloadUrlRef = useRef<string>("")
    const currentUrlRef = useRef<string>("")
    const lastReleasedRef = useRef<string>("")   // url released after set
    const isPlayingRef = useRef(false)
    const volumeRef = useRef(75)
    const isMutedRef = useRef(false)
    const artistsRef = useRef(artists)
    const fadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const tickRunningRef = useRef(false)

    const [isPlaying, setIsPlayingState] = useState(false)
    const [volume, setVolumeState] = useState(75)
    const [isMuted, setIsMutedState] = useState(false)
    const [activeArtist, setActiveArtist] = useState<Artist | null>(null)

    useEffect(() => { artistsRef.current = artists }, [artists])
    useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])
    useEffect(() => { volumeRef.current = volume }, [volume])
    useEffect(() => { isMutedRef.current = isMuted }, [isMuted])

    // Init audio element once (client-side only)
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio()
            audioRef.current.preload = "auto"
        }
        return () => { audioRef.current?.pause() }
    }, [])

    // Apply volume/mute
    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return
        audio.volume = isMuted ? 0 : volume / 100
    }, [volume, isMuted])

    // ── Fade-out helper ─────────────────────────────────────────────────────────
    const fadeOut = useCallback((): Promise<void> => {
        return new Promise((resolve) => {
            const audio = audioRef.current
            if (!audio || audio.paused) { resolve(); return }
            const startVol = audio.volume
            let step = 0
            if (fadeTimerRef.current) clearInterval(fadeTimerRef.current)
            fadeTimerRef.current = setInterval(() => {
                step++
                audio.volume = Math.max(0, startVol * (1 - step / FADE_STEPS))
                if (step >= FADE_STEPS) {
                    clearInterval(fadeTimerRef.current!)
                    audio.pause()
                    audio.volume = isMutedRef.current ? 0 : volumeRef.current / 100
                    resolve()
                }
            }, FADE_DURATION_MS / FADE_STEPS)
        })
    }, [])

    // ── Start track (with seek for files, direct play for streams) ──────────────
    const startTrack = useCallback(async (artist: Artist) => {
        const audio = audioRef.current
        if (!audio) return
        const url = artist.audioUrl!
        const external = isExternalUrl(url)

        // If we just preloaded this URL into the element, don't reload
        const alreadyLoaded = preloadUrlRef.current === url || currentUrlRef.current === url
        if (!alreadyLoaded || audio.src !== url) {
            audio.src = url
        }
        currentUrlRef.current = url
        preloadUrlRef.current = url
        audio.volume = isMutedRef.current ? 0 : volumeRef.current / 100

        if (external) {
            // Stream: play from current position (live)
            try { await audio.play() } catch { /* autoplay blocked, retry on next tick */ }
        } else {
            // Uploaded file: seek to correct position
            await new Promise<void>((resolve) => {
                const onCanPlay = () => { audio.removeEventListener("canplay", onCanPlay); audio.removeEventListener("error", onErr); resolve() }
                const onErr = () => { audio.removeEventListener("canplay", onCanPlay); audio.removeEventListener("error", onErr); resolve() }
                audio.addEventListener("canplay", onCanPlay, { once: true })
                audio.addEventListener("error", onErr, { once: true })
                if (audio.src !== url) { audio.src = url }
                audio.load()
            })
            const seekSec = calcSeekPosition(artist)
            if (seekSec > 0 && Number.isFinite(audio.duration) && seekSec < audio.duration) {
                audio.currentTime = seekSec
            }
            try { await audio.play() } catch { /* autoplay blocked */ }
        }
    }, [])

    // ── Preload a stream without playing ────────────────────────────────────────
    const preloadTrack = useCallback((url: string) => {
        const audio = audioRef.current
        if (!audio || preloadUrlRef.current === url) return
        preloadUrlRef.current = url
        audio.src = url
        audio.load()  // buffers without playing
    }, [])

    // ── Release preloaded stream ─────────────────────────────────────────────────
    const releasePreload = useCallback(() => {
        const audio = audioRef.current
        if (!audio) return
        audio.src = ""
        audio.load()
        preloadUrlRef.current = ""
    }, [])

    // ── Core scheduler — runs every second ─────────────────────────────────────
    useEffect(() => {
        const tick = async () => {
            if (tickRunningRef.current) return
            tickRunningRef.current = true
            try {
                const audio = audioRef.current
                if (!audio) return

                const playing = isPlayingRef.current
                const active = findActiveArtist(artistsRef.current)
                const preload = findPreloadArtist(artistsRef.current)
                setActiveArtist(active)

                // ── Release expired streams ──────────────────────────────────────
                if (!active && currentUrlRef.current) {
                    // Find the most recently played artist (to check if 10 min passed)
                    const prevArtist = artistsRef.current.find(
                        (a) => a.audioUrl === currentUrlRef.current
                    )
                    if (prevArtist && shouldReleaseArtist(prevArtist)) {
                        if (!audio.paused) await fadeOut()
                        if (isExternalUrl(currentUrlRef.current)) releasePreload()
                        currentUrlRef.current = ""
                        lastReleasedRef.current = prevArtist.audioUrl!
                    }
                }

                // ── Handle preloading (external streams only) ────────────────────
                if (preload?.audioUrl && preload.audioUrl !== currentUrlRef.current) {
                    preloadTrack(preload.audioUrl)
                }

                // ── Master stop ──────────────────────────────────────────────────
                if (!playing) {
                    if (!audio.paused) {
                        await fadeOut()
                        // Don't clear currentUrlRef — we still track the active slot
                    }
                    return
                }

                // ── No active slot — silence ─────────────────────────────────────
                if (!active) {
                    if (!audio.paused) {
                        await fadeOut()
                    }
                    return
                }

                const url = active.audioUrl!

                if (currentUrlRef.current === url && !audio.paused) {
                    return // Already playing the right track
                }

                // Track changed → fade out old, then start new
                if (!audio.paused && currentUrlRef.current !== url) {
                    await fadeOut()
                }

                await startTrack(active)
            } finally {
                tickRunningRef.current = false
            }
        }

        tick()
        const interval = setInterval(tick, 1000)
        return () => clearInterval(interval)
    }, [fadeOut, startTrack, preloadTrack, releasePreload])

    // ── Toggle play ─────────────────────────────────────────────────────────────
    const togglePlay = useCallback(async () => {
        const newPlaying = !isPlayingRef.current
        setIsPlayingState(newPlaying)
        isPlayingRef.current = newPlaying

        if (!newPlaying) {
            await fadeOut()
            return
        }

        const active = findActiveArtist(artistsRef.current)
        if (active?.audioUrl) {
            await startTrack(active)
        }
    }, [fadeOut, startTrack])

    const setVolume = useCallback((v: number) => {
        setVolumeState(v)
        if (audioRef.current && !isMutedRef.current) {
            audioRef.current.volume = v / 100
        }
    }, [])

    const setIsMuted = useCallback((m: boolean) => {
        setIsMutedState(m)
        if (audioRef.current) {
            audioRef.current.volume = m ? 0 : volumeRef.current / 100
        }
    }, [])

    return { isPlaying, volume, isMuted, activeArtist, togglePlay, setVolume, setIsMuted }
}
