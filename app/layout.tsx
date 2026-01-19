import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../src/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Survey App - Create & Analyze Surveys',
  description: 'A simple yet powerful survey creation and analysis tool',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}