'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const TABLE = 'ancient_words'
const WORD_COL = 'word'
const MEANING_COL = 'meaning'

const GROUP_SIZE = 10

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// 10 questions from one card's words. Show the meaning, pick the word out of 4.
// Wrong options come from all 40 words.
function buildRound(group, allRows) {
  return shuffle(group).map((r) => {
    const wrong = [
      ...new Set(
        shuffle(allRows.filter((x) => x[WORD_COL] !== r[WORD_COL])).map(
          (x) => x[WORD_COL]
        )
      ),
    ].slice(0, 3)
    return {
      word: r[WORD_COL],
      meaning: r[MEANING_COL],
      options: shuffle([r[WORD_COL], ...wrong]),
    }
  })
}

export default function AncientPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [active, setActive] = useState(null) // index of the card being played
  const [questions, setQuestions] = useState([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState({}) // best score per card this visit

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .order('id')

      if (error) {
        setError(error.message)
      } else if (!data || data.length < 4) {
        setError(
          'Өгөгдөл олдсонгүй. Supabase дээр ancient_words хүснэгтэд SELECT (унших) policy нэмсэн эсэхээ шалгана уу.'
        )
      } else {
        setRows(data)
      }
      setLoading(false)
    }
    load()
  }, [])

  // Split into cards of 10 words
  const groups = []
  for (let i = 0; i < rows.length; i += GROUP_SIZE) {
    groups.push(rows.slice(i, i + GROUP_SIZE))
  }

  const start = (gi) => {
    setActive(gi)
    setQuestions(buildRound(groups[gi], rows))
    setIdx(0)
    setSelected(null)
    setScore(0)
  }

  const finished = active !== null && questions.length > 0 && idx >= questions.length
  const q = questions[idx]

  const choose = (option) => {
    if (selected !== null) return
    setSelected(option)
    if (option === q.word) setScore((s) => s + 1)
  }

  const next = () => {
    const last = idx + 1 === questions.length
    if (last) {
      setBest((b) => ({ ...b, [active]: Math.max(b[active] ?? 0, score) }))
    }
    setSelected(null)
    setIdx((i) => i + 1)
  }

  const backToCards = () => {
    setActive(null)
    setQuestions([])
    setIdx(0)
    setSelected(null)
    setScore(0)
  }

  return (
    <div className="min-h-screen bg-[#162231] text-white flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-3xl">
        {active === null ? (
          <Link
            href="/myclass/lessons"
            className="text-sm font-semibold text-[#7dd3fc] hover:text-white transition-colors"
          >
            ← Хичээлүүд рүү буцах
          </Link>
        ) : (
          <button
            onClick={backToCards}
            className="text-sm font-semibold text-[#7dd3fc] hover:text-white transition-colors"
          >
            ← Картууд руу буцах
          </button>
        )}

        <h1 className="text-3xl font-extrabold mt-4">Эртний үг</h1>
        <p className="text-[#94a3b8] mt-1 mb-8">
          {active === null
            ? 'Картаа сонгоод 10 үгийн шалгалт өг'
            : 'Тайлбарт тохирох үгийг сонго'}
        </p>

        {loading && <p className="text-[#94a3b8]">Уншиж байна...</p>}

        {error && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* ---------- 4 cards ---------- */}
        {!loading && !error && active === null && (
          <div className="grid gap-4 sm:grid-cols-2">
            {groups.map((g, gi) => (
              <div
                key={gi}
                className="rounded-[30px] bg-[#1b2a3d] border border-white/5 p-6 flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xl font-extrabold">Карт {gi + 1}</p>
                  {best[gi] !== undefined && (
                    <span className="text-sm font-bold text-[#38bdf8]">
                      Шилдэг: {best[gi]} / {g.length}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {g.map((w) => (
                    <span
                      key={w.id}
                      className="px-3 py-1 rounded-full bg-[#223349] text-sm font-semibold"
                    >
                      {w[WORD_COL]}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => start(gi)}
                  className="mt-auto px-6 py-2.5 rounded-full bg-[#0284c7] hover:bg-[#0369a1] font-extrabold transition-colors"
                >
                  Эхлэх
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ---------- Quiz ---------- */}
        {active !== null && q && !finished && (
          <div className="max-w-xl rounded-[30px] bg-[#1b2a3d] border border-white/5 p-6 sm:p-8">
            <div className="flex items-center justify-between text-sm font-bold text-[#7dd3fc] mb-3">
              <span>
                Карт {active + 1} · {idx + 1} / {questions.length}
              </span>
              <span>Оноо: {score}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 mb-6 overflow-hidden">
              <div
                className="h-full bg-[#0284c7] transition-all duration-300"
                style={{ width: `${(idx / questions.length) * 100}%` }}
              />
            </div>

            <p className="text-[#94a3b8] text-sm mb-1">Утга:</p>
            <p className="text-xl font-bold mb-6 leading-snug">{q.meaning}</p>

            <div className="grid gap-3">
              {q.options.map((opt, i) => {
                const isCorrect = opt === q.word
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
                    className={`w-full text-left px-5 py-4 rounded-2xl border-2 text-base font-bold transition-all duration-200 ${style}`}
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
                    selected === q.word ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {selected === q.word ? 'Зөв!' : 'Буруу.'}
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
          <div className="max-w-xl rounded-[30px] bg-[#1b2a3d] border border-white/5 p-8 text-center">
            <p className="text-[#94a3b8] font-semibold">
              Карт {active + 1} · Таны дүн
            </p>
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
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => start(active)}
                className="px-8 py-3 rounded-full bg-[#0284c7] hover:bg-[#0369a1] font-extrabold transition-colors"
              >
                Дахин тоглох
              </button>
              <button
                onClick={backToCards}
                className="px-8 py-3 rounded-full bg-[#223349] hover:bg-[#2a3f58] font-extrabold transition-colors"
              >
                Картууд руу буцах
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}