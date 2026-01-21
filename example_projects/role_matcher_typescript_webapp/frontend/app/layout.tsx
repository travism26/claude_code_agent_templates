import type { Metadata } from 'next'
import { QueryProvider } from '@/lib/providers/QueryProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Task Prioritizer',
  description: 'Smart task management with AI-powered prioritization',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
