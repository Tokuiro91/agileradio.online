"use client"

import { useEffect, useRef, useState } from "react"

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .:-"

function randomChar() {
    return CHARSET[Math.floor(Math.random() * CHARSET.length)]
}

interface SolariCharProps {
    target: string
    /** delay before this char starts animating (ms) */
    delay: number
    className?: string
}

function SolariChar({ target, delay, className }: SolariCharProps) {
    const [display, setDisplay] = useState(target)
    const targetRef = useRef(target)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const rafRef = useRef<number | null>(null)

    useEffect(() => {
        // Respect prefers-reduced-motion
        if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setDisplay(target)
            return
        }

        targetRef.current = target

        const DURATION = 100 // ms per character cycle
        const FLIPS = 6      // how many random chars to show before settling

        let flipCount = 0
        let startTime: number | null = null

        const animate = (ts: number) => {
            if (!startTime) startTime = ts
            const elapsed = ts - startTime

            if (elapsed < delay) {
                rafRef.current = requestAnimationFrame(animate)
                return
            }

            const step = Math.floor((elapsed - delay) / (DURATION / FLIPS))

            if (flipCount < FLIPS) {
                setDisplay(randomChar())
                flipCount = step
                rafRef.current = requestAnimationFrame(animate)
            } else {
                setDisplay(targetRef.current)
            }
        }

        rafRef.current = requestAnimationFrame(animate)

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [target, delay])

    return (
        <span
            className={className}
            style={{ display: "inline-block", minWidth: target === " " ? "0.35em" : undefined }}
        >
            {display === " " ? "\u00a0" : display}
        </span>
    )
}

interface SolariTextProps {
    text: string
    /** ms stagger between each character's animation start */
    stagger?: number
    className?: string
    charClassName?: string
}

/**
 * Renders text with a split-flap (Solari board / airport departure board) animation.
 * Each character cycles through random uppercase chars before landing on the real one.
 * Triggers automatically whenever `text` changes.
 */
export function SolariText({
    text = "",
    stagger = 30,
    className,
    charClassName,
}: SolariTextProps) {
    const safeText = text || ""
    const upper = safeText.toUpperCase()

    return (
        <span className={className} aria-label={safeText}>
            {upper.split("").map((char, i) => (
                <SolariChar
                    key={i}
                    target={char}
                    delay={i * stagger}
                    className={charClassName}
                />
            ))}
        </span>
    )
}
