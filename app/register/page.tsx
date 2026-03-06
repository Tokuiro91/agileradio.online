"use client"

import { useState } from "react"
import { useArtists } from "@/lib/use-artists"
import { createListenerAction } from "@/app/actions/register"
import { useRouter } from "next/navigation"
import { SolariText } from "@/components/solari-text"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import Image from "next/image"

export default function RegisterPage() {
    const { artists, ready } = useArtists()
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
    })
    const [selectedArtists, setSelectedArtists] = useState<number[]>([])
    const [loading, setLoading] = useState(false)

    const handleNext = () => setStep(2)

    const toggleArtist = (id: number) => {
        setSelectedArtists(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        )
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const res = await createListenerAction({
                ...formData,
                favoriteArtists: selectedArtists,
            })
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Registration successful!")
                router.push("/admin/login") // We'll update this to a general login later
            }
        } catch (err) {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 pt-20">
            <div className="w-full max-w-md bg-[#111] border border-[#2a2a2a] rounded-sm p-8 shadow-2xl">
                <h1 className="text-3xl font-bold mb-8 text-[#99CCCC] font-mono tracking-tighter">
                    {step === 1 ? <SolariText text="JOIN BØDEN STADT" /> : <SolariText text="FAVORITES" />}
                </h1>

                {step === 1 ? (
                    <div className="space-y-4">
                        <div>
                            <Label className="text-[#737373] uppercase text-[10px] tracking-widest">Email</Label>
                            <Input
                                type="email"
                                className="bg-[#1a1a1a] border-[#2a2a2a] mt-1"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label className="text-[#737373] uppercase text-[10px] tracking-widest">Nickname</Label>
                            <Input
                                className="bg-[#1a1a1a] border-[#2a2a2a] mt-1"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label className="text-[#737373] uppercase text-[10px] tracking-widest">Password</Label>
                            <Input
                                type="password"
                                className="bg-[#1a1a1a] border-[#2a2a2a] mt-1"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <Button
                            className="w-full bg-[#99CCCC] hover:bg-[#88bbbb] text-black font-bold mt-4"
                            onClick={handleNext}
                            disabled={!formData.email || !formData.password}
                        >
                            NEXT
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-xs text-[#737373] mb-4">Choose your favorite artists to stay updated.</p>
                        <ScrollArea className="h-64 border border-[#2a2a2a] p-4 rounded-sm">
                            <div className="grid grid-cols-2 gap-3">
                                {artists.map(artist => (
                                    <div
                                        key={artist.id}
                                        onClick={() => toggleArtist(artist.id)}
                                        className={`relative aspect-square cursor-pointer border rounded-sm overflow-hidden transition-all ${selectedArtists.includes(artist.id) ? "border-[#99CCCC] scale-95" : "border-transparent opacity-60"
                                            }`}
                                    >
                                        <Image src={artist.image} alt={artist.name} fill className="object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                                            <span className="text-[10px] font-bold leading-tight">{artist.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <Button
                            className="w-full bg-[#99CCCC] hover:bg-[#88bbbb] text-black font-bold mt-4"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? "CREATING..." : "JOIN NOW"}
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full text-[#737373] hover:text-white"
                            onClick={() => setStep(1)}
                        >
                            BACK
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
