'use client'
import React from 'react'
import { useSearchParams } from 'next/navigation'
import Login from '@/app/login'
import Register from '@/app/register'

export default function Page() {
  const params = useSearchParams()
  const mode = params?.get('mode') || 'login'

  return (
    <div className="w-full max-w-md">
      {mode === 'register' ? <Register /> : <Login />}
    </div>
  )
}