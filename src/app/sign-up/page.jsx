'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
 
export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
 
  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
 
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
 
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Success! Check your email for the confirmation link.')
    }
    setLoading(false)
  }
 
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleSignUp} className="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-lg space-y-4">
        <h2 className="text-2xl font-bold text-center">Create an Account</h2>
        {message && <p className="text-sm text-center text-yellow-400">{message}</p>}
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
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded font-semibold transition duration-200"
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
        <p className="text-sm text-center text-gray-400">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-blue-400 hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  )
}
 