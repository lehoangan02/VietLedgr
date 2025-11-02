'use client'
import React, { useState } from 'react'
import { Facebook, Github, Eye, EyeOff } from 'lucide-react'
import { GoogleIcon } from '@/app/components/GoogleIcon'
import { useRouter } from 'next/navigation'

<<<<<<<< HEAD:src/frontend/app/login/login.tsx
type Props = { onSuccess?: () => void }

export default function Login({ onSuccess }: Props) {
========
export default function LoginForm() {
>>>>>>>> 50d17311e41d1cb25132ef22ba8fa6de7b3443c1:src/frontend/app/components/LoginForm.tsx
   const [username, setUsername] = useState('')
   const [password, setPassword] = useState('')
   const [remember, setRemember] = useState(true)
   const [showPassword, setShowPassword] = useState(false)
   const [error, setError] = useState('')
   const router = useRouter()

   async function onSubmit(e: React.FormEvent) {
<<<<<<<< HEAD:src/frontend/app/login/login.tsx
      e.preventDefault(); // Prevent default form submission
      const formBody = new URLSearchParams();
      formBody.append('username', username);
      formBody.append('password', password);
      console.log("Login")
      onSuccess?.()

      try {
         // 1. Call your NEXT.JS API route, NOT your FastAPI backend
         const response = await fetch('http://localhost:8000/api/auth/login', {
========
    e.preventDefault()
    const formBody = new URLSearchParams()
    formBody.append('username', username)
    formBody.append('password', password)   
    console.log("Login")

    try {
        const response = await fetch('http://localhost:8000/api/auth/login', { 
>>>>>>>> 50d17311e41d1cb25132ef22ba8fa6de7b3443c1:src/frontend/app/components/LoginForm.tsx
            method: 'POST',
            headers: {
               'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formBody.toString(),
<<<<<<<< HEAD:src/frontend/app/login/login.tsx
         });

         const data = await response.json();

         if (!response.ok) {
            // Handle login errors from your backend (e.g., "Invalid credentials")
            console.error(data.detail);
         } else {
            // LOGIN SUCCESS!
            console.log("Access Token:", data.access_token);
            alert("Successfully Login !")
            // Save the token, redirect the user, etc.
         }

      } catch (error) {
         console.error("An error occurred in the frontend:", error);
      }
========
        })

        const data = await response.json()

        if (!response.ok) {
            console.error(data.detail)
        } else {
            console.log("Access Token:", data.access_token)
            alert("Successfully Login !")
        }
    } catch (error) {
        console.error("An error occurred in the frontend:", error)
    }      
>>>>>>>> 50d17311e41d1cb25132ef22ba8fa6de7b3443c1:src/frontend/app/components/LoginForm.tsx
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
                     type="username"
                     required
                     value={username}
                     onChange={e => setUsername(e.target.value)}
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
        <CloseTabButton />
      </div>
      
   )
}
function CloseTabButton() {
   const handleClose = () => {
   window.close();
   };
   return (
    <button
        onClick={handleClose}
        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
    >
    Close Tab
    </button>
   );
}