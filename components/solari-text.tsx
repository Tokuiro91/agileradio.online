"use client"

import { useEffect, useRef, useState, useMemo } from "react"

// Characters used on the board (uppercase + digits + symbols)
const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .:-"

function randomChar() {
    return CHARSET[Math.floor(Math.random() * CHARSET.length)]
}

// ─────────────────────────────────────────────────────────────────────────────
// Single character cell — GPU-accelerated rotateX split-flap
// ─────────────────────────────────────────────────────────────────────────────

interface SolariCharProps {
    target: string
    /** absolute delay (ms) before this character starts its sequence */
    delay: number
    /** total duration for this character's flip sequence (ms, 80-260) */
    duration: number
    className?: string
}

function SolariChar({ target, delay, duration, className }: SolariCharProps) {
    const [display, setDisplay] = useState(target)
    const [flipping, setFlipping] = useState(false)
    const targetRef = useRef(target)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        // Prefers-reduced-motion: skip animation
        if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setDisplay(target)
            return
        }

        targetRef.current = target

        // Clear previous timers
        if (timerRef.current) clearTimeout(timerRef.current)

        timerRef.current = setTimeout(() => {
            // How many flips to show before landing on the target
            const FLIPS = Math.floor(duration / 50) // ~50ms per flip frame
            let count = 0

            const flip = () => {
                if (count < FLIPS) {
                    setFlipping(true)
                    setTimeout(() => {
                        setDisplay(count < FLIPS - 1 ? randomChar() : targetRef.current)
                        setFlipping(false)
                    }, 25) // half of 50ms — card "mid-flip"
                    count++
                    setTimeout(flip, 50)
                } else {
                    setDisplay(targetRef.current)
                    setFlipping(false)
                }
            }

            flip()
        }, delay)

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [target, delay, duration])

    return (
        <span
            className={className}
            style={{
                display: "inline-block",
                minWidth: target === " " ? "0.35em" : undefined,
                willChange: flipping ? "transform" : "auto",
                transform: flipping ? "rotateX(-25deg) scaleY(0.85)" : "rotateX(0deg) scaleY(1)",
                transformOrigin: "50% 60%",
                transition: flipping
                    ? "transform 25ms ease-in"
                    : "transform 25ms ease-out",
                backfaceVisibility: "hidden",
            } as React.CSSProperties}
        >
            {display === " " ? "\u00a0" : display}
        </span>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// SolariText — orchestrates the per-character stagger
// ─────────────────────────────────────────────────────────────────────────────

interface SolariTextProps {
    text?: string
    /** Base stagger between letters will be randomized: stagger ± 50% */
    stagger?: number
    className?: string
    charClassName?: string
}

export function SolariText({
    text = "",
    stagger = 30,
    className,
    charClassName,
}: SolariTextProps) {
    const safeText = text || ""
    const upper = safeText.toUpperCase()

    // Precompute random timing per character (stable across renders of same text)
    const timings = useMemo(() => {
        let accumulatedDelay = 0
        return Array.from({ length: upper.length }, (_, i) => {
            // Stagger delay: 40-60ms between letters
            const currentStagger = 40 + Math.random() * 20
            accumulatedDelay += currentStagger

            // Per-character flip duration: 100–140ms
            const duration = 100 + Math.floor(Math.random() * 40)
            return { delay: Math.max(0, accumulatedDelay), duration }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [upper, stagger])

    return (
        <span
            className={className}
            aria-label={safeText}
            style={{ display: "inline-flex", gap: 0 }}
        >
            {upper.split("").map((char, i) => (
                <SolariChar
                    key={i}
                    target={char}
                    delay={timings[i].delay}
                    duration={timings[i].duration}
                    className={charClassName}
                />
            ))}
        </span>
    )
}
