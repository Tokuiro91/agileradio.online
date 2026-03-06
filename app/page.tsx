"use client"

import dynamic from "next/dynamic"
import { useState, useCallback } from "react"
import { SplashScreen } from "@/components/splash-screen"

const RadioPlayer = dynamic(() => import("@/components/radio-player").then(m => m.RadioPlayer), {
  ssr: false
})

const MobileRadio = dynamic(() => import("@/components/mobile-radio").then(m => m.MobileRadio), {
  ssr: false
})

export default function Page() {
  const [splashDone, setSplashDone] = useState(false)
  const onSplashDone = useCallback(() => setSplashDone(true), [])

  return (
    <>
      {!splashDone && <SplashScreen onDone={onSplashDone} duration={3000} />}
      <div className="hidden md:block">
        <RadioPlayer />
      </div>
      <div className="block md:hidden">
        <MobileRadio />
      </div>
    </>
  )
}
