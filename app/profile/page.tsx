"use client"

import { useSession } from "next-auth/react"
import { useArtists } from "@/lib/use-artists"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import Image from "next/image"

export default function ProfilePage() {
    const { data: session, status } = useSession()
    const { artists } = useArtists()
    const router = useRouter()

    const [profile, setProfile] = useState({
        name: "",
        avatar: "",
        notifications: true,
    })
    const [favorites, setFavorites] = useState<number[]>([])

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        }
    }, [status, router])

    if (status === "loading") return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#99CCCC] font-mono animate-pulse">LOADING...</div>
    if (!session) return null

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 pt-24 pb-20 max-w-2xl mx-auto">
            <div className="space-y-8">
                <header className="flex items-center justify-between border-b border-[#2a2a2a] pb-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="w-20 h-20 border-2 border-[#99CCCC]">
                            <AvatarImage src={profile.avatar} />
                            <AvatarFallback className="bg-[#1a1a1a] text-[#99CCCC] text-2xl font-bold">
                                {session.user?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{session.user?.name || "Listener"}</h1>
                            <p className="text-[#737373] text-sm uppercase font-mono">{session.user?.role}</p>
                        </div>
                    </div>
                    <Button variant="outline" className="border-[#2a2a2a] hover:bg-[#1a1a1a]">EDIT PROFILE</Button>
                </header>

                {/* NOTIFICATIONS */}
                <section className="bg-[#111] border border-[#2a2a2a] p-6 rounded-sm">
                    <h2 className="text-[#99CCCC] font-mono text-sm uppercase tracking-widest mb-4">Settings</h2>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Email Notifications</Label>
                            <p className="text-xs text-[#737373]">Get notified when your favorite artists are live.</p>
                        </div>
                        <Switch
                            checked={profile.notifications}
                            onCheckedChange={v => setProfile({ ...profile, notifications: v })}
                            className="data-[state=checked]:bg-[#99CCCC]"
                        />
                    </div>
                </section>

                {/* FAVORITE ARTISTS */}
                <section>
                    <h2 className="text-[#99CCCC] font-mono text-sm uppercase tracking-widest mb-4">My Favorites</h2>
                    {favorites.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-[#2a2a2a] rounded-sm">
                            <p className="text-[#737373] text-sm">You haven't added any favorites yet.</p>
                            <Button variant="link" className="text-[#99CCCC] mt-2 text-xs" onClick={() => router.push("/register")}>ADD ARTISTS</Button>
                        </div>
                    ) : (
                        <ScrollArea className="h-96">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {artists.filter(a => favorites.includes(a.id)).map(artist => (
                                    <div key={artist.id} className="relative aspect-square rounded-sm overflow-hidden group">
                                        <Image src={artist.image} alt={artist.name} fill className="object-cover transition-transform group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/40 p-3 flex flex-col justify-end">
                                            <span className="font-bold text-sm">{artist.name}</span>
                                            <span className="text-[10px] text-white/60">{artist.show}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </section>

                <Button
                    variant="destructive"
                    className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-500/20"
                    onClick={() => { }} // Sign out logic
                >
                    LOGOUT
                </Button>
            </div>
        </div>
    )
}
