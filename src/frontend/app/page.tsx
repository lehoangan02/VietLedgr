'use client'
import { useSearchParams } from 'next/navigation'
import Login from '@/components/LoginForm'
import Register from '@/components/RegisterForm'

export default function Page() {
  const params = useSearchParams()
  const mode = params?.get('mode') || 'login'

  return (
    <div className='min-h-screen flex items-center justify-center w-full'>
      {mode === 'register' ? <Register /> : <Login />}
    </div>
  )
}