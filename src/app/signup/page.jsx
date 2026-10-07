'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
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
      setMessage('Амжилттай! Баталгаажуулах холбоосыг и-мэйлээсээ шалгана уу.')
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
          <span className="font-extrabold text-2xl text-[#0284c7] tracking-wide"
            style={{ fontFamily: 'var(--font-display)' }}>
            СУДАРТАН
          </span>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSignUp}
          className="bg-white rounded-[30px] border border-[#bae6fd] shadow-xl p-8 sm:p-10 space-y-5"
        >
          <div className="text-center mb-2">
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-[#0f172a]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Бүртгэл үүсгэх
            </h2>
            <p className="text-[#64748b] text-sm mt-2">
              Судартанд тавтай морилно уу.
            </p>
          </div>

          {message && (
            <div className="rounded-2xl bg-[#e0f2fe] border border-[#bae6fd] px-4 py-3 text-sm text-[#0369a1] text-center">
              {message}
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
            {loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
          </button>

          <p className="text-sm text-center text-[#64748b] pt-2">
            Аль хэдийн бүртгэлтэй юу?{' '}
            <Link
              href="/signin"
              className="font-bold text-[#0284c7] hover:text-[#0369a1] transition-colors"
            >
              Нэвтрэх
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