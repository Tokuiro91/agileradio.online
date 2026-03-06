"use client"

import { useEffect, useRef, useCallback } from "react"
import { useReactions, type Reaction } from "@/hooks/use-reactions"

// ── Individual floating reaction bubble ───────────────────────────────────────

function FloatingReaction({ reaction, onDone }: { reaction: Reaction; onDone: () => void }) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        // Random horizontal start position (20%–80% of viewport)
        const x = 20 + Math.random() * 60
        el.style.left = `${x}%`

        // Random horizontal drift during float (-40px to +40px)
        const drift = -40 + Math.random() * 80
        el.style.setProperty("--drift", `${drift}px`)

        // Animate: float upward over 3s, fade in quickly then fade out near top
        el.animate(
            [
                { transform: "translateY(-20vh) translateX(0) scale(0.6)", opacity: 0 },
                { transform: "translateY(-35vh) translateX(calc(var(--drift) * 0.2)) scale(1.2)", opacity: 1, offset: 0.08 },
                { transform: "translateY(-80vh) translateX(calc(var(--drift) * 0.7)) scale(1)", opacity: 0.9, offset: 0.7 },
                { transform: "translateY(-110vh) translateX(var(--drift)) scale(0.8)", opacity: 0 },
            ],
            {
                duration: 3000 + Math.random() * 1000,
                easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                fill: "forwards",
            }
        ).onfinish = onDone

        return () => { }
    }, [onDone])

    const size = reaction.stickerType === "emoji" ? "text-3xl" : "w-10 h-10"

    return (
        <div
            ref={ref}
            className="absolute bottom-20 pointer-events-none select-none"
            style={{
                willChange: "transform, opacity",
                zIndex: 9998,
                // --drift is set programmatically above
            }}
        >
            {reaction.stickerType === "emoji" && (
                <span className={`${size} drop-shadow-lg`} role="img" aria-label={reaction.value}>
                    {reaction.value}
                </span>
            )}
            {reaction.stickerType === "image" && reaction.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={reaction.url} alt="reaction" className="w-10 h-10 object-contain" />
            )}
            {/* Username label */}
            <div className="text-center text-[9px] font-mono text-white/40 mt-0.5 truncate max-w-[60px]">
                {reaction.username}
            </div>
        </div>
    )
}

// ── Reactions overlay — renders all floating reactions ────────────────────────

export function ReactionsOverlay() {
    const { reactions, removeReaction } = useReactions()

    // Keep max 30 simultaneous animations for performance
    const visible = reactions.slice(-30)

    return (
        <div
            className="fixed inset-0 overflow-hidden pointer-events-none"
            style={{ zIndex: 9998 }}
            aria-hidden="true"
        >
            {visible.map((r) => (
                <FloatingReaction
                    key={r.id}
                    reaction={r}
                    onDone={() => removeReaction(r.id)}
                />
            ))}
        </div>
    )
}
