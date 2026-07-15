import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ChatAssistant from "@/components/chat-assistant"
import { AppProvider } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

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
    <html lang="en" className="light" style={{ colorScheme: "light" }}>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AppProvider>
            {children}
            <ChatAssistant />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}