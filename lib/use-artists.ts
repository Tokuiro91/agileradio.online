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
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as Artist[]
      }
    } catch {
      // ignore
    }
    return generateArtists()
  }, [])

  const writeToStorage = useCallback((next: Artist[]) => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignore
    }
  }, [])

  const persistToServer = useCallback(async (next: Artist[]) => {
    try {
      await fetch("/api/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      })
    } catch {
      // non-critical — data is still in localStorage
    }
  }, [])

  // Public setter: update state + localStorage + server
  const setArtistsPersisted: React.Dispatch<React.SetStateAction<Artist[]>> =
    useCallback(
      (action) => {
        setArtistsState((prev) => {
          const next =
            typeof action === "function"
              ? (action as (prevState: Artist[]) => Artist[])(prev)
              : action
          writeToStorage(next)
          persistToServer(next)
          return next
        })
      },
      [writeToStorage, persistToServer]
    )

  // Initial load: server first, then localStorage fallback
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch("/api/artists")
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0 && !cancelled) {
            setArtistsState(data)
            writeToStorage(data)
            setReady(true)
            return
          }
        }
      } catch {
        // fall through to localStorage
      }
      if (!cancelled) {
        const initial = readFromStorage()
        setArtistsState(initial)
        setReady(true)
      }
    }
    load()
    return () => { cancelled = true }
  }, [readFromStorage, writeToStorage])

  // Sync across tabs + on focus
  useEffect(() => {
    if (typeof window === "undefined") return

    const sync = async () => {
      try {
        const res = await fetch("/api/artists")
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            setArtistsState(data)
            writeToStorage(data)
            setReady(true)
            return
          }
        }
      } catch {
        // ignore
      }
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

    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("focus", sync)
    }
  }, [readFromStorage, writeToStorage])

  return {
    artists,
    setArtists: setArtistsPersisted,
    ready,
  }
}
