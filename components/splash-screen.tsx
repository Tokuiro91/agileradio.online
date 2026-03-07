"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

interface SplashScreenProps {
    onDone: () => void
    duration?: number
}

export function SplashScreen({ onDone, duration = 3000 }: SplashScreenProps) {
    const [progress, setProgress] = useState(0)
    const [fading, setFading] = useState(false)

    useEffect(() => {
        const startTime = Date.now()
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime
            const pct = Math.min(elapsed / duration, 1)
            setProgress(pct)
            if (pct >= 1) {
                clearInterval(interval)
                setFading(true)
                setTimeout(onDone, 500)
            }
        }, 16)
        return () => clearInterval(interval)
    }, [duration, onDone])

    // SVG circle params
    const R = 36
    const CIRCUMFERENCE = 2 * Math.PI * R

    return (
        <div
            className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col items-center justify-center transition-opacity duration-500"
            style={{ opacity: fading ? 0 : 1 }}
        >
            {/* Spinner circle + favicon in center */}
            <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
                {/* Spinning progress ring */}
                <svg
                    width={96}
                    height={96}
                    viewBox="0 0 96 96"
                    className="absolute inset-0"
                    style={{ transform: "rotate(-90deg)" }}
                >
                    {/* Track */}
                    <circle
                        cx={48}
                        cy={48}
                        r={R}
                        fill="none"
                        stroke="#1a1a1a"
                        strokeWidth={3}
                    />
                    {/* Progress */}
                    <circle
                        cx={48}
                        cy={48}
                        r={R}
                        fill="none"
                        stroke="#99CCCC"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeDasharray={CIRCUMFERENCE}
                        strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
                        style={{ transition: "stroke-dashoffset 16ms linear" }}
                    />
                </svg>

                {/* Favicon in center */}
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                        src="/favicon.png"
                        alt="BØDEN"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            </div>

            {/* Label */}
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-[#737373] animate-pulse">
                Loading...
            </p>
        </div>
    )
}
