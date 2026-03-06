"use client"

import { SolariText } from "@/components/solari-text"

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 pt-32 pb-20 max-w-2xl mx-auto space-y-12">
            <header className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-[#99CCCC] font-mono">
                    <SolariText text="KØDE RADIO" />
                </h1>
                <p className="text-xl md:text-2xl text-[#a3a3a3] font-mono leading-tight uppercase">
                    Independent broadcasting from the edge of culture.
                </p>
            </header>

            <div className="space-y-8 text-[#737373] leading-relaxed font-sans border-l border-[#2a2a2a] pl-8">
                <section className="space-y-4">
                    <h2 className="text-white font-mono uppercase text-sm tracking-widest">The Mission</h2>
                    <p>
                        KØDE is more than just a radio station. It is a digital playground for sonic explorers,
                        a platform for voices that refuse to be quieted, and a bridge between global
                        electronic communities.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-white font-mono uppercase text-sm tracking-widest">Sound & Vision</h2>
                    <p>
                        We curate soundscapes that span from deep ambient textures to the relentless
                        energy of the underground dancefloor. Our vision is to provide an uninterrupted,
                        high-fidelity experience for those who listen with intention.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-white font-mono uppercase text-sm tracking-widest">Global Connection</h2>
                    <p>
                        Broadcasting from Tbilisi to the world, we embrace the diversity of sound
                        and the unity of rhythm. Every set is a story, every beat is a heartbeat.
                    </p>
                </section>
            </div>

            <footer className="pt-12 border-t border-[#2a2a2a]">
                <p className="text-[10px] uppercase font-mono tracking-[0.3em] text-[#444]">
                    EST. 2024 — TBILISI / WORLDWIDE
                </p>
            </footer>
        </div>
    )
}
