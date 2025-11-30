import '@/app/globals.css'
import React from 'react'

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-linear-to-b from-white to-orange-50">
      <main className="min-h-screen flex items-center justify-center">
        {children}
      </main>
    </div>
  )
}