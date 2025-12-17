'use client'
import React, { useState } from 'react'
import { Facebook, Github, Eye, EyeOff } from 'lucide-react'
import { GoogleIcon } from '@/components/GoogleIcon'
import { useRouter } from 'next/navigation'
import { postLogin } from '@/lib/fast-api/auth'

export default function LoginForm() {
   const [username, setUsername] = useState('')
   const [password, setPassword] = useState('')
   const [remember, setRemember] = useState(true)
   const [showPassword, setShowPassword] = useState(false)
   const [error, setError] = useState<string | null>(null)
   const router = useRouter()

   async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault()
      setError(null)

      const formData = new FormData(e.currentTarget);

      try {
         await postLogin(formData);
         setError(null);
         router.refresh();
         
      } catch (err) {
         const message = err instanceof Error ? err.message : String(err);
         setError(message || "Login failed");
      }
   }

   return (
      <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
         <h2 className="text-2xl font-semibold mb-2">Sign In</h2>
         <p className="text-sm text-gray-500 mb-6">Access the VietLedgr app using your email and passcode.</p>

         <form onSubmit={onSubmit} className="space-y-4">
            <div>
               <label className="block text-sm font-medium mb-1">Username <span className="text-red-500">*</span></label>
               <div className="relative">
                  <input
                     name="username"
                     type="text"
                     required
                     value={username}
                     onChange={e => setUsername(e.target.value)}
                     className="w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium mb-1">Password <span className="text-red-500">*</span></label>
               <div className="relative">
                  <input
                     name="password"
                     type={showPassword ? 'text' : 'password'}
                     required
                     value={password}
                     onChange={e => setPassword(e.target.value)}
                     className="w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  <button
                     type="button"
                     onClick={() => setShowPassword(s => !s)}
                     aria-label={showPassword ? 'Hide password' : 'Show password'}
                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 p-1"
                  >
                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
               </div>
            </div>

            <div className="flex items-center justify-between">
               <label className="flex items-center text-sm">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="mr-2" />
                  Remember Me
               </label>
               <a className="text-sm text-orange-500 hover:underline" href="#">Forgot Password?</a>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <button type="submit" className="w-full bg-orange-400 text-white py-2 rounded-md">Sign In</button>
         </form>

         <p className="text-sm text-gray-500 mt-4">New on our platform? {' '}
            <button
               type="button"
               onClick={() => router.push('/?mode=register')}
               className="text-orange-500 hover:underline">
               Create an account
            </button>
         </p>

         <div className="text-center my-4 text-gray-300">— OR —</div>

         <div className="flex gap-3">
            <button
               type="button"
               aria-label="Continue with Facebook"
               className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-md"
            >
               <Facebook size={18} />
               <span className="sr-only">Facebook</span>
            </button>

            <button
               type="button"
               aria-label="Continue with Google"
               className="flex-1 flex items-center justify-center gap-2 bg-white border rounded-md"
            >
               <GoogleIcon />
               <span className="sr-only">Google</span>
            </button>

            <button
               type="button"
               aria-label="Continue with GitHub"
               className="flex-1 flex items-center justify-center gap-2 bg-slate-800 text-white rounded-md"
            >
               <Github size={18} />
               <span className="sr-only">GitHub</span>
            </button>
         </div>

         <div className="mt-4">
            <CloseTabButton />
         </div>
      </div>
   )
}

function CloseTabButton() {
   const handleClose = () => {
      try { window.close() } catch { /* ignore */ }
   }
   return (
      <button
         onClick={handleClose}
         className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
      >
         Close Tab
      </button>
   )
}