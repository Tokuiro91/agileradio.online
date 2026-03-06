import type { Metadata, Viewport } from "next"
import { Space_Grotesk, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AnalyticsProvider } from "@/components/analytics-provider"
import { NextAuthProvider } from "@/components/providers/session-provider"
import "./globals.css"


/* Google fonts */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

/* Metadata */
export const metadata: Metadata = {
  title: "KØDE Online",
  description: "Live online radio with curated DJ sets and electronic music",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
}

/* Viewport */
export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body
        className={`
          ${spaceGrotesk.variable}
          ${jetbrainsMono.variable}
          font-sans
          antialiased
        `}
      >
        <NextAuthProvider>
          {children}
          <Analytics />
          <AnalyticsProvider />
        </NextAuthProvider>
      </body>

    </html>
  )
}