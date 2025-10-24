'use client'
import React, { useState } from 'react'
import { Facebook, Github, Eye, EyeOff } from 'lucide-react'
import { GoogleIcon } from '@/app/components/GoogleIcon'
import { useRouter } from 'next/navigation'

export default function Register() {
   const [name, setName] = useState('')
   const [email, setEmail] = useState('')
   const [password, setPassword] = useState('')
   const [confirmPassword, setConfirmPassword] = useState('')
   const [agree, setAgree] = useState(true)
   const [showPassword, setShowPassword] = useState(false)
   const [showConfirm, setShowConfirm] = useState(false)
   const router = useRouter()

   function onSubmit(e: React.FormEvent) {
      e.preventDefault()
      console.log({ name, email, password, confirmPassword, agree })
      alert('Sign up submitted (stub)')
   }


   return (
      <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
         <h2 className="text-2xl font-semibold mb-2">Register</h2>
         <p className="text-sm text-gray-500 mb-6">Create New VietLedgr Account</p>

         <form onSubmit={onSubmit} className="space-y-4">
            <div>
               <label className="block text-sm font-medium mb-1">Name <span className="text-red-500">*</span></label>
               <div className="relative">
                  <input
                     value={name}
                     onChange={e => setName(e.target.value)}
                     required
                     className="w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></div>
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium mb-1">Email Address <span className="text-red-500">*</span></label>
               <div className="relative">
                  <input
                     type="email"
                     value={email}
                     onChange={e => setEmail(e.target.value)}
                     required
                     className="w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></div>
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium mb-1">Password <span className="text-red-500">*</span></label>
               <div className="relative">
                  <input
                     type={showPassword ? 'text' : 'password'}
                     value={password}
                     onChange={e => setPassword(e.target.value)}
                     required
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

            <div>
               <label className="block text-sm font-medium mb-1">Confirm Password <span className="text-red-500">*</span></label>
               <div className="relative">
                  <input
                     type={showConfirm ? 'text' : 'password'}
                     value={confirmPassword}
                     onChange={e => setConfirmPassword(e.target.value)}
                     required
                     className="w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  <button
                     type="button"
                     onClick={() => setShowConfirm(s => !s)}
                     aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 p-1"
                  >
                     {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
               </div>
            </div>

            <div className="flex items-start gap-3">
               <label className="flex items-center text-sm">
                  <input
                     type="checkbox"
                     checked={agree}
                     onChange={e => setAgree(e.target.checked)}
                     className="mr-2"
                  />
                  <span className="text-sm">
                     I agree to the <a className="text-orange-500 hover:underline" href="#">Terms & Privacy</a>
                  </span>
               </label>
            </div>

            <button
               type="submit"
               className="w-full bg-orange-400 text-white py-2 rounded-md disabled:opacity-60"
               disabled={!agree}>
               Sign Up
            </button>
         </form>

         <p className="text-sm text-gray-500 mt-4">
            New on our platform?{' '}
            <button
               type="button"
               onClick={() => router.push('/?mode=login')}
               className="text-orange-500 hover:underline">
               Sign In Instead
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
      </div>
   )
}