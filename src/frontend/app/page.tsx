'use client'
import React from 'react'
import { useSearchParams } from 'next/navigation'
import Login from '@/app/components/LoginForm'
import Register from '@/app/components/RegisterForm'

export default function Page() {
  const params = useSearchParams()
  const mode = params?.get('mode') || 'login'

  return (
    <div className='min-h-screen flex items-center justify-center w-full'>
      {mode === 'register' ? <Register /> : <Login />}
    </div>
  )
}