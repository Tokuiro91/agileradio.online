"use client"

import { useEffect, useState } from "react"

// iOS detection: Safari on iOS without standalone mode
function isIosSafari() {
    if (typeof navigator === "undefined") return false
    const ua = navigator.userAgent
    const isIos = /iPhone|iPad|iPod/.test(ua)
    const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua)
    const isStandalone = (navigator as any).standalone === true
    return isIos && isSafari && !isStandalone
}

const DISMISSED_KEY = "boden-ios-install-dismissed"

export function IosInstallPrompt() {
    const [show, setShow] = useState(false)

    useEffect(() => {
        if (!isIosSafari()) return
        if (localStorage.getItem(DISMISSED_KEY)) return
        // Delay so it doesn't interrupt the splash screen
        const t = setTimeout(() => setShow(true), 5000)
        return () => clearTimeout(t)
    }, [])

    const dismiss = () => {
        localStorage.setItem(DISMISSED_KEY, "1")
        setShow(false)
    }

    if (!show) return null

    return (
        <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-sm
        bg-[#141414] border border-[#2a2a2a] rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-4 duration-300"
        >
            {/* Close */}
            <button
                onClick={dismiss}
                className="absolute top-3 right-3 text-[#737373] hover:text-white text-lg leading-none"
                aria-label="Dismiss"
            >
                ×
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/favicon.png" alt="BØDEN" className="w-10 h-10 rounded-xl" />
                <div>
                    <div className="font-tektur font-bold text-sm tracking-wider">Install BØDEN</div>
                    <div className="font-mono text-[10px] text-[#737373] uppercase tracking-wider">
                        Add to Home Screen
                    </div>
                </div>
            </div>

            {/* Steps */}
            <ol className="space-y-3 text-sm font-mono text-[#e5e5e5]">
                <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#99CCCC]/20 text-[#99CCCC] text-[11px] flex items-center justify-center font-bold">1</span>
                    <span>
                        Tap the{" "}
                        <span className="inline-flex items-center gap-1 text-[#99CCCC]">
                            Share
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                                <polyline points="16 6 12 2 8 6" />
                                <line x1="12" y1="2" x2="12" y2="15" />
                            </svg>
                        </span>{" "}
                        button in the bottom toolbar
                    </span>
                </li>
                <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#99CCCC]/20 text-[#99CCCC] text-[11px] flex items-center justify-center font-bold">2</span>
                    <span>Scroll down and tap <span className="text-[#99CCCC]">"Add to Home Screen"</span></span>
                </li>
                <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#99CCCC]/20 text-[#99CCCC] text-[11px] flex items-center justify-center font-bold">3</span>
                    <span>Tap <span className="text-[#99CCCC]">"Add"</span> to confirm</span>
                </li>
            </ol>
        </div>
    )
}
