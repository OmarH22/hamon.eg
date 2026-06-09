// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HAMON — Confidence Is Presence.',
  description: 'HAMON is a luxury confidence-driven fashion brand. Designed To Elevate. Join the exclusive waitlist for early access to our debut collection.',
  keywords: 'HAMON, luxury sneakers, confidence, premium fashion, designer footwear, quiet luxury, Cairo',
  openGraph: {
    title: 'HAMON — Confidence Is Presence.',
    description: 'Designed To Elevate. Join the exclusive HAMON waitlist.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HAMON — Confidence Is Presence.',
    description: 'Designed To Elevate. Join the exclusive HAMON waitlist.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
