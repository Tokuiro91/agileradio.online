"use client"

import { useEffect, useState } from "react"

export default function Page() {
  const [artists, setArtists] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/artists")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setArtists(data)
        else setError("Data is not an array")
      })
      .catch(err => setError(err.message))
  }, [])

  return (
    <div className="p-8 bg-[#0a0a0a] min-h-screen text-white font-mono">
      <h1 className="text-2xl mb-4 text-[#99CCCC]">DEBUG VIEW</h1>
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      <div className="space-y-4">
        {artists.map((a, i) => (
          <div key={a.id || i} className="p-4 border border-[#2a2a2a]">
            <p>ID: {a.id}</p>
            <p>Name: {a.name}</p>
            <p>Start: {a.startTime}</p>
            <p>Type: {a.type || "artist"}</p>
          </div>
        ))}
      </div>
      {artists.length === 0 && !error && <p>Loading artists...</p>}
    </div>
  )
}
