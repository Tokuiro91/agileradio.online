import { RadioPlayer } from "@/components/radio-player"
import { MobileRadio } from "@/components/mobile-radio"

export default function Page() {
  return (
    <>
      {/* Desktop: horizontal scroll layout */}
      <div className="hidden md:block">
        <RadioPlayer />
      </div>
      {/* Mobile: single card swipe layout */}
      <div className="block md:hidden">
        <MobileRadio />
      </div>
    </>
  )
}
