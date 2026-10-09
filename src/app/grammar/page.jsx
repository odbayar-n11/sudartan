'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const TABLE = 'mongolian_grammar'
const TYPE_COL = 'grammar_type'
const DESC_COL = 'description'

const ROUND_SIZE = 10

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// "Нэр (§32.1)" -> "Нэр"
const cleanTitle = (t) => t.replace(/\s*\(§[^)]*\)\s*$/, '')

// "Нэр (§32.1)" -> "§32.1"
const sectionOf = (t) => {
  const m = t.match(/\(§([^)]*)\)\s*$/)
  return m ? `§${m[1]}` : ''
}

// Sort key from the section number, e.g. §28.1-гажилт -> 28.1
const sortKey = (t) => {
  const m = t.match(/§(\d+)(?:\.(\d+))?/)
  if (!m) return 9999
  return Number(m[1]) + (m[2] ? Number(m[2]) / 100 : 0)
}

// Show the rule description, pick the right rule name out of 4
function buildRound(rows) {
  return shuffle(rows)
    .slice(0, ROUND_SIZE)
    .map((r) => {
      const answer = cleanTitle(r[TYPE_COL])
      const wrong = [
        ...new Set(
          shuffle(rows)
            .map((x) => cleanTitle(x[TYPE_COL]))
            .filter((t) => t !== answer)
        ),
      ].slice(0, 3)
      return {
        prompt: r[DESC_COL],
        answer,
        options: shuffle([answer, ...wrong]),
      }
    })
}

export default function GrammarPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [mode, setMode] = useState('study') // 'study' | 'quiz'
  const [query, setQuery] = useState('')

  const [questions, setQuestions] = useState([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from(TABLE).select('*')

      if (error) {
        setError(error.message)
      } else if (!data || data.length < 4) {
        setError(
          'Өгөгдөл олдсонгүй. Supabase дээр mongolian_grammar хүснэгтэд SELECT (унших) policy байгаа эсэхээ шалгана уу.'
        )
      } else {
        const sorted = [...data].sort(
          (a, b) =>
            sortKey(a[TYPE_COL]) - sortKey(b[TYPE_COL]) || a.id - b.id
        )
        setRows(sorted)
      }
      setLoading(false)
    }
    load()
  }, [])

  const q = questions[idx]
  const finished = mode === 'quiz' && questions.length > 0 && idx >= questions.length

  const startQuiz = () => {
    setQuestions(buildRound(rows))
    setIdx(0)
    setSelected(null)
    setScore(0)
    setMode('quiz')
  }

  const choose = (option) => {
    if (selected !== null) return
    setSelected(option)
    if (option === q.answer) setScore((s) => s + 1)
  }

  const next = () => {
    setSelected(null)
    setIdx((i) => i + 1)
  }

  const filtered = rows.filter((r) => {
    const s = query.trim().toLowerCase()
    if (!s) return true
    return (
      r[TYPE_COL].toLowerCase().includes(s) ||
      r[DESC_COL].toLowerCase().includes(s)
    )
  })

  return (
    <div className="min-h-screen bg-[#162231] text-white flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <Link
          href="/myclass/lessons"
          className="text-sm font-semibold text-[#7dd3fc] hover:text-white transition-colors"
        >
          ← Хичээлүүд рүү буцах
        </Link>

        <h1 className="text-3xl font-extrabold mt-4">Монгол хэлний дүрэм</h1>
        <p className="text-[#94a3b8] mt-1 mb-6">
          {mode === 'study'
            ? 'Дүрмүүдийг уншаад шалгалт өгөөрэй'
            : 'Тайлбарт тохирох дүрмийг сонго'}
        </p>

        {loading && <p className="text-[#94a3b8]">Уншиж байна...</p>}

        {error && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('study')}
              className={`px-5 py-2 rounded-full font-extrabold text-sm transition-colors ${
                mode === 'study'
                  ? 'bg-[#0284c7]'
                  : 'bg-[#223349] hover:bg-[#2a3f58]'
              }`}
            >
              Дүрэм үзэх
            </button>
            <button
              onClick={startQuiz}
              className={`px-5 py-2 rounded-full font-extrabold text-sm transition-colors ${
                mode === 'quiz'
                  ? 'bg-[#0284c7]'
                  : 'bg-[#223349] hover:bg-[#2a3f58]'
              }`}
            >
              Шалгалт
            </button>
          </div>
        )}

        {/* ---------- Study ---------- */}
        {!loading && !error && mode === 'study' && (
          <>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Дүрэм хайх"
              aria-label="Дүрэм хайх"
              className="w-full mb-4 px-5 py-3 rounded-2xl bg-[#1b2a3d] border border-white/5 placeholder-[#94a3b8] outline-none focus:border-[#0284c7]"
            />
            <p className="text-sm text-[#94a3b8] mb-3">
              {filtered.length} / {rows.length} дүрэм
            </p>

            <div className="grid gap-4">
              {filtered.map((r) => (
                <div
                  key={r.id}
                  className="rounded-[30px] bg-[#1b2a3d] border border-white/5 p-6"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-lg font-extrabold leading-snug">
                      {cleanTitle(r[TYPE_COL])}
                    </p>
                    {sectionOf(r[TYPE_COL]) && (
                      <span className="shrink-0 px-3 py-1 rounded-full bg-[#223349] text-sm font-bold text-[#7dd3fc]">
                        {sectionOf(r[TYPE_COL])}
                      </span>
                    )}
                  </div>
                  <p className="text-[#cbd5e1] leading-relaxed">
                    {r[DESC_COL]}
                  </p>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="text-[#94a3b8]">
                  Дүрэм олдсонгүй. Өөр түлхүүр үгээр хайгаарай.
                </p>
              )}
            </div>
          </>
        )}

        {/* ---------- Quiz ---------- */}
        {!loading && !error && mode === 'quiz' && q && !finished && (
          <div className="rounded-[30px] bg-[#1b2a3d] border border-white/5 p-6 sm:p-8">
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

            <p className="text-[#94a3b8] text-sm mb-1">Тайлбар:</p>
            <p className="text-lg font-bold mb-6 leading-snug">{q.prompt}</p>

            <div className="grid gap-3">
              {q.options.map((opt, i) => {
                const isCorrect = opt === q.answer
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
                    className={`w-full text-left px-5 py-4 rounded-2xl border-2 text-sm font-bold leading-snug transition-all duration-200 ${style}`}
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
                    selected === q.answer ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {selected === q.answer ? 'Зөв!' : 'Буруу.'}
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

        {/* ---------- Result ---------- */}
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
                : 'Дүрмүүдийг дахин уншаад оролдоорой.'}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={startQuiz}
                className="px-8 py-3 rounded-full bg-[#0284c7] hover:bg-[#0369a1] font-extrabold transition-colors"
              >
                Дахин тоглох
              </button>
              <button
                onClick={() => setMode('study')}
                className="px-8 py-3 rounded-full bg-[#223349] hover:bg-[#2a3f58] font-extrabold transition-colors"
              >
                Дүрэм үзэх
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}