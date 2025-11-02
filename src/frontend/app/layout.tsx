import './globals.css'
import React from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className="min-h-screen bg-linear-to-b">
        <main className="min-h-screen flex items-center justify-center p-6">
          {children}
        </main>
      </body>
    </html>
  )
}