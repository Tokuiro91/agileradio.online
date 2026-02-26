"use client"

import { useCallback, useEffect, useState } from "react"
import { generateArtists } from "@/lib/artists-data"
import type { Artist } from "@/lib/artists-data"

const STORAGE_KEY = "agile_artists"

export function useArtists() {
  const [artists, setArtistsState] = useState<Artist[]>([])
  const [ready, setReady] = useState(false)

  const readFromStorage = useCallback((): Artist[] => {
    if (typeof window === "undefined") return generateArtists()
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return parsed as Artist[]
      }
    } catch {
      // ignore parse errors
    }
    return generateArtists()
  }, [])

  const writeToStorage = useCallback((next: Artist[]) => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignore quota / serialization errors
    }
  }, [])

  // Публичный setter: обновляет state и сразу сохраняет в localStorage
  const setArtistsPersisted: React.Dispatch<React.SetStateAction<Artist[]>> =
    useCallback((action) => {
      setArtistsState((prev) => {
        const next =
          typeof action === "function"
            ? (action as (prevState: Artist[]) => Artist[])(prev)
            : action
        writeToStorage(next)
        return next
      })
    }, [writeToStorage])

  // Первичная загрузка
  useEffect(() => {
    const initial = readFromStorage()
    setArtistsState(initial)
    setReady(true)
  }, [readFromStorage])

  // Синхронизация между вкладками + при фокусе окна
  useEffect(() => {
    if (typeof window === "undefined") return

    const sync = () => {
      const next = readFromStorage()
      setArtistsState(next)
      setReady(true)
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      sync()
    }

    window.addEventListener("storage", onStorage)
    window.addEventListener("focus", sync)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") sync()
    })

    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("focus", sync)
    }
  }, [readFromStorage])

  return {
    artists,
    setArtists: setArtistsPersisted,
    ready,
  }
}

