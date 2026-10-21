import type React from "react"
import type { Metadata } from "next"
import { Archivo, Hanken_Grotesk, Martian_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ChatAssistant from "@/components/chat-assistant"
import { AppProvider } from "@/components/providers"

// TitanOCR's type system: Archivo (with its width axis) for display, Hanken Grotesk for
// body copy, Martian Mono for measurements and labels.
const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-display", display: "swap" })
const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-body", display: "swap" })
const gauge = Martian_Mono({ subsets: ["latin"], axes: ["wdth"], variable: "--font-gauge", display: "swap" })

export const metadata: Metadata = {
  title: "Arav Saxena - AI Researcher & Full-Stack Developer",
  description:
    "Portfolio of Arav Saxena, AI Researcher and Full-Stack Developer specializing in AI applications, LLMs, and modern web technologies.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body className={`${display.variable} ${body.variable} ${gauge.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
          <AppProvider>
            {children}
            <ChatAssistant />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}