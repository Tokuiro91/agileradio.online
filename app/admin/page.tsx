"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import type { Artist } from "@/lib/artists-data"
import { useArtists } from "@/lib/use-artists"

function formatDuration(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0")
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0")
  const s = String(totalSec % 60).padStart(2, "0")
  return `${h}:${m}:${s}`
}

const defaultForm = {
  name: "",
  location: "",
  show: "",
  image: "",
  audioUrl: "",
  start: "",
  end: "",
  description: "",
}

export default function AdminPage() {
  const MAX_ARTISTS = 500
  const { artists, setArtists, ready } = useArtists()
  const [editingId, setEditingId] = useState<number | null>(null)

  const [isAuthed, setIsAuthed] = useState(false)
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [formError, setFormError] = useState("")

  // Upload states
  const [imageUploading, setImageUploading] = useState(false)
  const [audioUploading, setAudioUploading] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = window.localStorage.getItem("agile_admin_authed")
    if (saved === "true") setIsAuthed(true)
  }, [])

  const [form, setForm] = useState({ ...defaultForm })

  // ── Image upload ─────────────────────────────────────────────────────────
  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload/image", { method: "POST", body: fd })
      const data = await res.json()
      if (data.url) setForm((f) => ({ ...f, image: data.url }))
    } catch {
      // ignore
    } finally {
      setImageUploading(false)
    }
  }

  // ── Audio upload ─────────────────────────────────────────────────────────
  const handleAudioFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAudioUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload/audio", { method: "POST", body: fd })
      const data = await res.json()
      if (data.url) setForm((f) => ({ ...f, audioUrl: data.url }))
    } catch {
      // ignore
    } finally {
      setAudioUploading(false)
    }
  }

  // ── Edit ─────────────────────────────────────────────────────────────────
  const handleEdit = (artist: Artist) => {
    setEditingId(artist.id)
    setForm({
      name: artist.name,
      location: artist.location,
      show: artist.show,
      image: artist.image,
      audioUrl: artist.audioUrl ?? "",
      start: artist.startTime.slice(0, 16),
      end: artist.endTime.slice(0, 16),
      description: artist.description,
    })
  }

  const resetForm = () => {
    setEditingId(null)
    setForm({ ...defaultForm })
    if (imageInputRef.current) imageInputRef.current.value = ""
    if (audioInputRef.current) audioInputRef.current.value = ""
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const isEditing = editingId !== null
    if (!isEditing && artists.length >= MAX_ARTISTS) {
      setFormError(`Максимум (${MAX_ARTISTS}) артистов достигнуто.`)
      return
    }
    setFormError("")
    const startDate = form.start ? new Date(form.start) : new Date()
    const endDate = form.end
      ? new Date(form.end)
      : new Date(startDate.getTime() + 60 * 60 * 1000)
    const durationMs = endDate.getTime() - startDate.getTime()

    const newArtist: Artist = {
      id:
        editingId ??
        (artists.length ? Math.max(...artists.map((a) => a.id)) + 1 : 0),
      name: form.name || "Без имени",
      location: form.location || "Город",
      show: form.show || "Новый сет",
      image: form.image || "/artists/artist-1.jpg",
      audioUrl: form.audioUrl || undefined,
      duration: formatDuration(durationMs),
      description: form.description || "Описание будет добавлено позже.",
      dayIndex: 0,
      orderInDay: 0,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
    }

    if (isEditing) {
      setArtists((prev) => prev.map((a) => (a.id === editingId ? newArtist : a)))
    } else {
      setArtists((prev) => [...prev, newArtist])
    }
    resetForm()
  }

  const handleDelete = (id: number) => {
    setArtists((prev) => prev.filter((a) => a.id !== id))
    if (editingId === id) resetForm()
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (login === "Lirano" && password === "Lirano@") {
      setIsAuthed(true)
      setError("")
      if (typeof window !== "undefined")
        window.localStorage.setItem("agile_admin_authed", "true")
    } else {
      setError("Неверный логин или пароль")
    }
  }

  // ── Login screen ─────────────────────────────────────────────────────────
  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-[#0a0a0a] border border-[#2a2a2a] rounded-sm p-6">
          <h1 className="text-lg font-semibold mb-1 tracking-wide">
            AGILE RADIO <span className="text-[#737373]">/ ADMIN</span>
          </h1>
          <p className="text-xs text-[#737373] mb-4">Вход в панель управления</p>
          <form onSubmit={handleLogin} className="space-y-3 text-sm">
            <div>
              <label className="block mb-1 text-xs text-[#9ca3af]">Логин</label>
              <input
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full bg-[#050505] border border-[#2a2a2a] rounded-sm px-2 py-1.5 text-xs outline-none focus:border-[#dc2626]"
                placeholder="Lirano"
              />
            </div>
            <div>
              <label className="block mb-1 text-xs text-[#9ca3af]">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#050505] border border-[#2a2a2a] rounded-sm px-2 py-1.5 text-xs outline-none focus:border-[#dc2626]"
                placeholder="Lirano@"
              />
            </div>
            {error && <p className="text-xs text-[#f97373]">{error}</p>}
            <button
              type="submit"
              className="w-full mt-2 px-3 py-1.5 text-xs uppercase tracking-widest bg-[#dc2626] text-white rounded-sm hover:bg-[#ef4444] transition"
            >
              Войти
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 text-[#9ca3af] text-sm">
        Загрузка данных артистов...
      </div>
    )
  }

  const sortedArtists = [...artists].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e5e5]">
      <header className="border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-wide">
          AGILE RADIO <span className="text-[#737373]">/ ADMIN</span>
        </h1>
        <p className="text-xs text-[#737373]">
          Данные сохраняются на сервер (data/artists.json)
        </p>
      </header>

      <main className="px-6 py-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* ── Form ───────────────────────────────────────────────────── */}
        <section className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Карточка артиста</h2>
            <p className="text-[11px] text-[#6b7280]">
              Всего: <span className="text-[#e5e5e5]">{artists.length}</span> /{" "}
              {MAX_ARTISTS}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            {/* Name */}
            <div>
              <label className="block mb-1 text-xs text-[#9ca3af]">Имя артиста</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full bg-[#050505] border border-[#2a2a2a] rounded-sm px-2 py-1.5 text-xs outline-none focus:border-[#dc2626]"
                placeholder="Например, NICK WARREN"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block mb-1 text-xs text-[#9ca3af]">Локация</label>
              <input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="w-full bg-[#050505] border border-[#2a2a2a] rounded-sm px-2 py-1.5 text-xs outline-none focus:border-[#dc2626]"
                placeholder="Город, страна"
              />
            </div>

            {/* Show */}
            <div>
              <label className="block mb-1 text-xs text-[#9ca3af]">Название шоу</label>
              <input
                value={form.show}
                onChange={(e) => setForm((f) => ({ ...f, show: e.target.value }))}
                className="w-full bg-[#050505] border border-[#2a2a2a] rounded-sm px-2 py-1.5 text-xs outline-none focus:border-[#dc2626]"
                placeholder="Например, SUNSET SESSION"
              />
            </div>

            {/* ── Photo ──────────────────────────────────────────── */}
            <div>
              <label className="block mb-1 text-xs text-[#9ca3af]">
                Фото артиста
              </label>

              {/* Preview */}
              {form.image && (
                <div className="relative w-full h-28 mb-2 rounded-sm overflow-hidden border border-[#2a2a2a]">
                  <Image
                    src={form.image}
                    alt="preview"
                    fill
                    className="object-cover"
                    sizes="400px"
                    unoptimized
                  />
                </div>
              )}

              {/* Upload button */}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={imageUploading}
                className="w-full px-3 py-1.5 text-xs border border-[#2a2a2a] rounded-sm text-[#9ca3af] hover:border-[#dc2626] hover:text-[#e5e5e5] transition disabled:opacity-40 text-left"
              >
                {imageUploading
                  ? "Загрузка..."
                  : form.image
                    ? "Заменить фото"
                    : "📁  Выбрать фото..."}
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFile}
              />

              {/* URL fallback */}
              <input
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                className="mt-1.5 w-full bg-[#050505] border border-[#2a2a2a] rounded-sm px-2 py-1.5 text-xs outline-none focus:border-[#dc2626] text-[#6b7280]"
                placeholder="или вставьте URL вручную"
              />
            </div>

            {/* ── Audio ──────────────────────────────────────────── */}
            <div>
              <label className="block mb-1 text-xs text-[#9ca3af]">
                Аудио (воспроизводится в эфире)
              </label>

              {form.audioUrl && (
                <audio
                  src={form.audioUrl}
                  controls
                  className="w-full h-8 mb-2 opacity-80"
                />
              )}

              {/* File upload */}
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                disabled={audioUploading}
                className="w-full px-3 py-1.5 text-xs border border-[#2a2a2a] rounded-sm text-[#9ca3af] hover:border-[#dc2626] hover:text-[#e5e5e5] transition disabled:opacity-40 text-left"
              >
                {audioUploading
                  ? "Загрузка..."
                  : form.audioUrl && !form.audioUrl.startsWith("http")
                    ? "Заменить аудио файл"
                    : "🎵  Выбрать аудио файл..."}
              </button>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleAudioFile}
              />

              {/* URL input — for external streams / links */}
              <div className="mt-2">
                <p className="text-[10px] text-[#6b7280] mb-1">или вставьте ссылку на трансляцию / файл:</p>
                <input
                  type="url"
                  value={form.audioUrl?.startsWith("http") ? form.audioUrl : ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, audioUrl: e.target.value }))
                  }
                  className="w-full bg-[#050505] border border-[#2a2a2a] rounded-sm px-2 py-1.5 text-xs outline-none focus:border-[#dc2626] text-[#9ca3af] font-mono"
                  placeholder="https://stream.example.com/live.mp3"
                />
              </div>

              {form.audioUrl && (
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-[10px] text-[#6b7280] font-mono truncate max-w-[85%]">
                    {form.audioUrl}
                  </p>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, audioUrl: "" }))}
                    className="text-[10px] text-[#dc2626] hover:text-[#ef4444] ml-2 shrink-0"
                  >
                    ✕ очистить
                  </button>
                </div>
              )}
            </div>

            {/* ── Times ──────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-xs text-[#9ca3af]">
                  Начало (datetime-local)
                </label>
                <input
                  type="datetime-local"
                  value={form.start}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, start: e.target.value }))
                  }
                  className="w-full bg-[#050505] border border-[#2a2a2a] rounded-sm px-2 py-1.5 text-xs outline-none focus:border-[#dc2626]"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs text-[#9ca3af]">
                  Конец (datetime-local)
                </label>
                <input
                  type="datetime-local"
                  value={form.end}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, end: e.target.value }))
                  }
                  className="w-full bg-[#050505] border border-[#2a2a2a] rounded-sm px-2 py-1.5 text-xs outline-none focus:border-[#dc2626]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block mb-1 text-xs text-[#9ca3af]">Описание</label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="w-full bg-[#050505] border border-[#2a2a2a] rounded-sm px-2 py-1.5 text-xs outline-none focus:border-[#dc2626] min-h-[80px] resize-vertical"
                placeholder="Краткая информация об артисте и сете..."
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={editingId === null && artists.length >= MAX_ARTISTS}
                  className="px-3 py-1.5 text-xs uppercase tracking-widest rounded-sm transition disabled:opacity-40 disabled:cursor-not-allowed bg-[#dc2626] text-white hover:bg-[#ef4444]"
                >
                  {editingId !== null ? "Сохранить" : "Добавить"}
                </button>
                {editingId !== null && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3 py-1.5 text-xs uppercase tracking-widest border border-[#4b5563] text-[#9ca3af] rounded-sm hover:border-[#9ca3af]"
                  >
                    Отмена
                  </button>
                )}
              </div>
              {formError && (
                <p className="text-[11px] text-[#f97373]">{formError}</p>
              )}
            </div>
          </form>
        </section>

        {/* ── Artist list ───────────────────────────────────────────── */}
        <section className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-sm p-4">
          <h2 className="text-sm font-semibold mb-3">
            Сетка артистов (отсортировано по времени)
          </h2>
          <div className="max-h-[70vh] overflow-auto pr-1 space-y-2 text-xs">
            {sortedArtists.map((artist) => (
              <div
                key={artist.id}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-sm border ${editingId === artist.id
                  ? "border-[#dc2626] bg-[#111827]"
                  : "border-[#1f2937]"
                  } hover:border-[#dc2626] text-left`}
              >
                <button
                  type="button"
                  onClick={() => handleEdit(artist)}
                  className="flex-1 flex items-center justify-between gap-2 pr-2"
                >
                  <div className="flex items-center gap-2">
                    {artist.image && (
                      <div className="relative w-8 h-8 rounded-sm overflow-hidden flex-shrink-0">
                        <Image
                          src={artist.image}
                          alt={artist.name}
                          fill
                          className="object-cover"
                          sizes="32px"
                          unoptimized
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.15em] text-[#6b7280]">
                        {artist.location}
                      </p>
                      <p className="text-xs text-[#e5e5e5] font-medium">
                        {artist.name}
                      </p>
                      <p className="text-[11px] text-[#9ca3af]">{artist.show}</p>
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-[#9ca3af] font-mono flex-shrink-0">
                    <p>
                      {artist.startTime.slice(11, 16)} —{" "}
                      {artist.endTime.slice(11, 16)} UTC
                    </p>
                    <p className="text-[#6b7280]">{artist.duration}</p>
                    {artist.audioUrl && (
                      <p className="text-[#dc2626]">🎵 аудио</p>
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(artist.id)}
                  className="ml-2 px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-[#f97373] border border-[#4b5563] rounded-sm hover:border-[#f97373]"
                >
                  удалить
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
