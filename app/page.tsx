"use client"

import dynamic from "next/dynamic"
import { useState, useCallback } from "react"
import { SplashScreen } from "@/components/splash-screen"
import { ReactionsOverlay } from "@/components/reactions-overlay"
import { ReactionPicker } from "@/components/reaction-picker"

const RadioPlayer = dynamic(() => import("@/components/radio-player").then(m => m.RadioPlayer), { ssr: false })
const MobileRadio = dynamic(() => import("@/components/mobile-radio").then(m => m.MobileRadio), { ssr: false })

export default function Page() {
  const [splashDone, setSplashDone] = useState(false)
  const onSplashDone = useCallback(() => setSplashDone(true), [])

  return (
    <>
      {!splashDone && <SplashScreen onDone={onSplashDone} duration={3000} />}

      {/* Animated floating emoji reactions (visible to everyone) */}
      <ReactionsOverlay />

      {/* Reaction picker button (only for logged-in users) */}
      <ReactionPicker />

      <div className="hidden md:block">
        <RadioPlayer />
      </div>
      <div className="block md:hidden">
        <MobileRadio />
      </div>
    </>
  )
}
