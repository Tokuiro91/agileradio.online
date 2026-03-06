"use client"

import { useEffect, useState } from "react"
import { RadioPlayer } from "@/components/radio-player"
import { MobileRadio } from "@/components/mobile-radio"

export default function Page() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="hidden md:block">
        <RadioPlayer />
      </div>
      <div className="block md:hidden">
        <MobileRadio />
      </div>
    </>
  )
}
