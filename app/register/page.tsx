"use client"

import { useState } from "react"
import { createListenerAction } from "@/app/actions/register"
import { useRouter } from "next/navigation"
import { SolariText } from "@/components/solari-text"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Link from "next/link"

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const res = await createListenerAction({
                ...formData,
                favoriteArtists: [],
            })
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Registration successful!")
                router.push("/login")
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
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="text-[#737373] hover:text-white transition-colors" aria-label="Back to radio">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <h1 className="text-3xl font-bold text-[#99CCCC] font-mono tracking-tighter">
                        <div className="font-tektur"><SolariText text="JOIN BØDEN" /></div>
                    </h1>
                </div>

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
                        onClick={handleSubmit}
                        disabled={!formData.email || !formData.password || loading}
                    >
                        {loading ? "CREATING..." : "JOIN NOW"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
