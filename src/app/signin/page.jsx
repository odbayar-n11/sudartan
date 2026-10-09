'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Nunito } from 'next/font/google'

const display = Nunito({
  subsets: ['cyrillic', 'latin'],
  weight: ['700', '800', '900'],
  variable: '--font-display',
})

const body = Nunito({
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '600', '700'],
  variable: '--font-body',
})

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
      router.push('/myclass')
    }

    setLoading(false)
  }

  return (
    <div
      className={`${display.variable} ${body.variable} min-h-screen flex items-center justify-center bg-[#FDFCFC] px-4`}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <img
            src="/images/logo.png"
            alt="Sudartan"
            className="w-10 h-10 object-contain"
          />
          <span
            className="font-extrabold text-2xl text-[#0284c7] tracking-wide"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            СУДАРТАН
          </span>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSignIn}
          className="bg-white rounded-[30px] border border-[#bae6fd] shadow-xl p-8 sm:p-10 space-y-5"
        >
          <div className="text-center mb-2">
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-[#0f172a]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Нэвтрэх
            </h2>
            <p className="text-[#64748b] text-sm mt-2">
              Өөрийн бүртгэлээрээ нэвтэрч үргэлжлүүлнэ үү
            </p>
          </div>

          {errorMsg && (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 text-center">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-[#0c4a6e] mb-1.5">
              И-мэйл
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl border border-[#bae6fd] bg-[#f0f9ff] text-[#0f172a] placeholder:text-[#94a3b8] outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#bae6fd] transition-all duration-200"
              placeholder="tanii@imeil.mn"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#0c4a6e] mb-1.5">
              Нууц үг
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl border border-[#bae6fd] bg-[#f0f9ff] text-[#0f172a] placeholder:text-[#94a3b8] outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#bae6fd] transition-all duration-200"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#0284c7] hover:bg-[#0369a1] disabled:bg-[#7dd3fc] text-white font-extrabold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 mt-2"
          >
            {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
          </button>

          <p className="text-sm text-center text-[#64748b] pt-2">
            Бүртгэлгүй юу?{' '}
            <Link
              href="/signup"
              className="font-bold text-[#0284c7] hover:text-[#0369a1] transition-colors"
            >
              Бүртгүүлэх
            </Link>
          </p>
        </form>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm font-semibold text-[#64748b] hover:text-[#0284c7] transition-colors"
          >
            ← Нүүр хуудас руу буцах
          </Link>
        </div>
      </div>
    </div>
  )
}