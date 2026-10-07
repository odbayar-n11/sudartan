'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
 
export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()
 
  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
 
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
 
    if (error) {
      setErrorMsg(error.message)
    } else {
      router.push('/') // Redirect to your home page or dashboard after login
    }
    setLoading(false)
  }
 
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleSignIn} className="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-lg space-y-4">
        <h2 className="text-2xl font-bold text-center">Welcome Back</h2>
        {errorMsg && <p className="text-sm text-center text-red-400">{errorMsg}</p>}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-green-600 hover:bg-green-500 rounded font-semibold transition duration-200"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
        <p className="text-sm text-center text-gray-400">
          Don't have an account?{' '}
          <Link href="/sign-up" className="text-green-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  )
}