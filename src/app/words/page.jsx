'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const ROUND_SIZE = 10

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildRound(rows) {
  return shuffle(rows.filter((r) => r.wrong_version !== r.correct_version))
    .slice(0, ROUND_SIZE)
    .map((r) => ({
      ...r,
      options: shuffle([r.correct_version, r.wrong_version]),
    }))
}

export default function WordsGame() {
  const [rows, setRows] = useState([])
  const [questions, setQuestions] = useState([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('word_corrections')
        .select('id, wrong_version, correct_version, meaning')

      if (error) {
        setError(error.message)
      } else if (!data || data.length === 0) {
        setError(
          'Өгөгдөл олдсонгүй. Supabase дээр word_corrections хүснэгтэд SELECT (унших) policy нэмсэн эсэхээ шалгана уу.'
        )
      } else {
        setRows(data)
        setQuestions(buildRound(data))
      }
      setLoading(false)
    }
    load()
  }, [])

  const finished = questions.length > 0 && idx >= questions.length
  const q = questions[idx]

  const choose = (option) => {
    if (selected !== null) return
    setSelected(option)
    if (option === q.correct_version) setScore((s) => s + 1)
  }

  const next = () => {
    setSelected(null)
    setIdx((i) => i + 1)
  }

  const restart = () => {
    setQuestions(buildRound(rows))
    setIdx(0)
    setSelected(null)
    setScore(0)
  }

  return (
    <div className="min-h-screen bg-[#162231] text-white flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-xl">
        <Link
          href="/myclass/lessons"
          className="text-sm font-semibold text-[#7dd3fc] hover:text-white transition-colors"
        >
          ← Хичээлүүд рүү буцах
        </Link>

        <h1 className="text-3xl font-extrabold mt-4">Зөв бичих дүрэм</h1>
        <p className="text-[#94a3b8] mt-1 mb-8">Аль нь зөв бичигдсэн бэ?</p>

        {loading && <p className="text-[#94a3b8]">Уншиж байна...</p>}

        {error && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && q && !finished && (
          <div className="rounded-[30px] bg-[#1b2a3d] border border-white/5 p-6 sm:p-8">
            {/* Progress */}
            <div className="flex items-center justify-between text-sm font-bold text-[#7dd3fc] mb-3">
              <span>
                {idx + 1} / {questions.length}
              </span>
              <span>Оноо: {score}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 mb-6 overflow-hidden">
              <div
                className="h-full bg-[#0284c7] transition-all duration-300"
                style={{ width: `${(idx / questions.length) * 100}%` }}
              />
            </div>

            {q.meaning && (
              <p className="text-[#94a3b8] text-sm mb-5">
                Утга: <span className="text-white">{q.meaning}</span>
              </p>
            )}

            <div className="grid gap-3">
              {q.options.map((opt, i) => {
                const isCorrect = opt === q.correct_version
                const isPicked = selected === opt
                let style = 'bg-[#223349] hover:bg-[#2a3f58] border-transparent'
                if (selected !== null) {
                  if (isCorrect) style = 'bg-green-500/20 border-green-500'
                  else if (isPicked) style = 'bg-red-500/20 border-red-500'
                  else style = 'bg-[#223349] opacity-50 border-transparent'
                }
                return (
                  <button
                    key={i}
                    onClick={() => choose(opt)}
                    disabled={selected !== null}
                    className={`w-full text-left px-5 py-4 rounded-2xl border-2 text-lg font-bold transition-all duration-200 ${style}`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>

            {selected !== null && (
              <div className="mt-6 flex items-center justify-between gap-4">
                <p
                  className={`font-bold ${
                    selected === q.correct_version ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {selected === q.correct_version
                    ? 'Зөв!'
                    : `Буруу. Зөв нь: ${q.correct_version}`}
                </p>
                <button
                  onClick={next}
                  className="px-6 py-2.5 rounded-full bg-[#0284c7] hover:bg-[#0369a1] font-extrabold transition-colors"
                >
                  {idx + 1 === questions.length ? 'Дуусгах' : 'Дараагийн'}
                </button>
              </div>
            )}
          </div>
        )}

        {finished && (
          <div className="rounded-[30px] bg-[#1b2a3d] border border-white/5 p-8 text-center">
            <p className="text-[#94a3b8] font-semibold">Таны дүн</p>
            <p className="text-6xl font-black text-[#38bdf8] my-3">
              {score} / {questions.length}
            </p>
            <p className="text-[#94a3b8] mb-6">
              {score === questions.length
                ? 'Төгс! Бүгдийг зөв хариуллаа.'
                : score >= questions.length / 2
                ? 'Сайн байна! Дахин оролдоод үзээрэй.'
                : 'Дахин дасгал хийж үзээрэй.'}
            </p>
            <button
              onClick={restart}
              className="px-8 py-3 rounded-full bg-[#0284c7] hover:bg-[#0369a1] font-extrabold transition-colors"
            >
              Дахин тоглох
            </button>
          </div>
        )}
      </div>
    </div>
  )
}