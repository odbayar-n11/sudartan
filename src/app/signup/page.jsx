'use client'

import { useState, useEffect } from 'react'
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

// Must match "Email OTP Length" in Supabase (Authentication -> Providers -> Email)
const CODE_LENGTH = 8

export default function SignUp() {
  const router = useRouter()

  const [step, setStep] = useState('form') // 'form' | 'code'
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(true)
  const [cooldown, setCooldown] = useState(0)

  // countdown for the "resend code" button
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const cleanEmail = email.trim().toLowerCase()

  const showError = (text) => {
    setIsError(true)
    setMessage(text)
  }
  const showInfo = (text) => {
    setIsError(false)
    setMessage(text)
  }

  // Step 1: create the account, Supabase emails the code
  const handleSignUp = async (e) => {
    e.preventDefault()
    setMessage('')

    const name = username.trim()
    if (name.length < 3 || name.length > 20) {
      showError('Хэрэглэгчийн нэр 3-20 тэмдэгттэй байх ёстой')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { username: name }, // the trigger copies this into the profiles table
      },
    })

    if (error) {
      if (error.message.toLowerCase().includes('database error')) {
        showError('Энэ хэрэглэгчийн нэр бүртгэлтэй байна')
      } else {
        showError(error.message)
      }
    } else if (data.user?.identities?.length === 0) {
      // Supabase returns an empty identities list for an already registered email
      showError('Энэ и-мэйл бүртгэлтэй байна. Нэвтэрнэ үү.')
    } else {
      setCode('')
      setStep('code')
      setCooldown(60)
      showInfo('Баталгаажуулах код илгээгдлээ.')
    }

    setLoading(false)
  }

  // Step 2: check the code
  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: code.trim(),
      type: 'signup',
    })

    if (error) {
      showError('Код буруу эсвэл хугацаа дууссан байна.')
      setLoading(false)
    } else {
      router.push('/myclass')
    }
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    setMessage('')

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: cleanEmail,
    })

    if (error) {
      showError(error.message)
    } else {
      showInfo('Код дахин илгээгдлээ.')
      setCooldown(60)
    }
  }

  const inputClass =
    'w-full px-4 py-3 rounded-2xl border border-[#bae6fd] bg-[#f0f9ff] text-[#0f172a] placeholder:text-[#94a3b8] outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#bae6fd] transition-all duration-200'

  const primaryBtn =
    'w-full py-3.5 bg-[#0284c7] hover:bg-[#0369a1] disabled:bg-[#7dd3fc] text-white font-extrabold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 mt-2'

  const cardClass =
    'bg-white rounded-[30px] border border-[#bae6fd] shadow-xl p-8 sm:p-10 space-y-5'

  const messageBox = message && (
    <div
      className={
        isError
          ? 'rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 text-center'
          : 'rounded-2xl bg-[#e0f2fe] border border-[#bae6fd] px-4 py-3 text-sm text-[#0369a1] text-center'
      }
    >
      {message}
    </div>
  )

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

        {step === 'form' ? (
          /* ---------- Step 1: signup form ---------- */
          <form onSubmit={handleSignUp} className={cardClass}>
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

            {messageBox}

            <div>
              <label className="block text-sm font-bold text-[#0c4a6e] mb-1.5">
                Хэрэглэгчийн нэр
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={20}
                className={inputClass}
                placeholder="Нэрээ оруулна уу"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0c4a6e] mb-1.5">
                И-мэйл
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
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
                minLength={6}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading} className={primaryBtn}>
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
        ) : (
          /* ---------- Step 2: verification code ---------- */
          <form onSubmit={handleVerify} className={cardClass}>
            <div className="text-center mb-2">
              <h2
                className="text-2xl sm:text-3xl font-extrabold text-[#0f172a]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                И-мэйлээ баталгаажуулах
              </h2>
              <p className="text-[#64748b] text-sm mt-2">
                <span className="font-bold text-[#0c4a6e]">{cleanEmail}</span>{' '}
                хаяг руу илгээсэн {CODE_LENGTH} оронтой кодыг оруулна уу
              </p>
            </div>

            {messageBox}

            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={CODE_LENGTH}
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH))
              }
              required
              className={`${inputClass} text-center text-xl font-extrabold tracking-[0.3em]`}
              placeholder={'0'.repeat(CODE_LENGTH)}
            />

            <button
              type="submit"
              disabled={loading || code.length !== CODE_LENGTH}
              className={primaryBtn}
            >
              {loading ? 'Шалгаж байна...' : 'Баталгаажуулах'}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0}
              className="w-full text-sm font-bold text-[#0284c7] hover:text-[#0369a1] disabled:text-[#94a3b8] transition-colors"
            >
              {cooldown > 0
                ? `Код дахин илгээх (${cooldown}с)`
                : 'Код дахин илгээх'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('form')
                setCode('')
                setMessage('')
              }}
              className="w-full text-sm font-semibold text-[#64748b] hover:text-[#0284c7] transition-colors"
            >
              ← Буцах
            </button>
          </form>
        )}

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