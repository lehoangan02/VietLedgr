import React from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <main className="min-h-screen flex">
        {children}
      </main>
    </div>
  )
}
