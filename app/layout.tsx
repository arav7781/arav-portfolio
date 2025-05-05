import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Arav.dev',
  description: 'Created with Love by Arav Saxena',
  generator: 'Arav Saxena',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
