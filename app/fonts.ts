// app/fonts.ts
import localFont from "next/font/local"

export const zeroPrime = localFont({
  src: [
    {
      path: "/fonts/ZeroPrimeExpanded-ALILE-logo.otf",
      weight: "400",
      style: "normal",
    },
  ],
  display: "swap",
})