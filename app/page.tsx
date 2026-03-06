"use client"

import dynamic from "next/dynamic"

const RadioPlayer = dynamic(() => import("@/components/radio-player").then(m => m.RadioPlayer), {
  ssr: false,
  loading: () => <LoadingView />
})

const MobileRadio = dynamic(() => import("@/components/mobile-radio").then(m => m.MobileRadio), {
  ssr: false,
  loading: () => <LoadingView />
})

function LoadingView() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
      <h1 className="font-mono font-bold text-2xl tracking-wider text-[#99CCCC] animate-pulse">
        K<span className="text-[#99CCCC]">Ø</span>DE
      </h1>
      <div className="w-8 h-8 border-2 border-[#99CCCC]/20 border-t-[#99CCCC] rounded-full animate-spin" />
    </div>
  )
}

export default function Page() {
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
