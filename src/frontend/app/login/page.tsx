'use client'
import React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Login from '@/app/login/login'
import Register from '@/app/login/register'

export default function Page() {
  const params = useSearchParams()
  const mode = params?.get('mode') || 'login'
  const router = useRouter()

  // passed into Login so it can navigate on successful sign in
  function handleLoginSuccess() {
    router.push('/products')
  }

  return (
    <div className="w-full max-w-md">
      {mode === 'register' ? <Register /> : <Login onSuccess={handleLoginSuccess} />}
    </div>
  )
}