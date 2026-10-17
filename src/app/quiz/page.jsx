'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { saveMistake } from '@/lib/saveMistake'
import AppShell from '../myclass/components/AppShell'
import DuoQuiz from '../myclass/components/DuoQuiz'

const TOPIC = 'words'
const SET_SIZE = 15 // must match chunkArray size on the sets page

const css = `
.back-btn{display:inline-flex;align-items:center;gap:6px;margin-bottom:16px;padding:8px 16px;border-radius:999px;border:2px solid rgba(128,128,128,.3);background:transparent;color:inherit;font-weight:800;font-size:14px;text-decoration:none;cursor:pointer}
.back-btn:hover{background:rgba(128,128,128,.12)}
`

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// For every word in the set: show the meaning, pick the correct spelling.
// Wrong options: the common misspelling + correct spellings of other words.
function buildQuestions(setRows, allRows) {
  return shuffle(setRows).map((r) => {
    const others = shuffle(
      allRows.filter((x) => x.id !== r.id && x.correct_version !== r.correct_version)
    )
    const distractors = [
      ...new Set([r.wrong_version, ...others.map((x) => x.correct_version)]),
    ]
      .filter((t) => t && t !== r.correct_version)
      .slice(0, 3)

    return {
      id: r.id,
      prompt: r.meaning || 'Зөв бичгийг сонго',
      answer: r.correct_version,
      explanation: `«${r.wrong_version}» гэж бичих нь буруу.`,
      options: shuffle([r.correct_version, ...distractors]),
    }
  })
}

function QuizInner() {
  const router = useRouter()
  const params = useSearchParams()
  const setNumber = Number(params.get('set') || 1)

  const [allRows, setAllRows] = useState([])
  const [questions, setQuestions] = useState([])
  const [round, setRound] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('word_corrections')
        .select('id, wrong_version, correct_version, meaning')
        .order('id', { ascending: true })

      if (error) {
        setError(error.message)
      } else if (!data || data.length < 4) {
        setError('Өгөгдөл олдсонгүй (эсвэл 4-өөс цөөн үг байна).')
      } else {
        const start = (setNumber - 1) * SET_SIZE
        const setRows = data.slice(start, start + SET_SIZE)
        if (!Number.isInteger(setNumber) || setNumber < 1 || setRows.length === 0) {
          setError(`Дасгал #${params.get('set')} олдсонгүй.`)
        } else {
          setAllRows(data)
          setQuestions(buildQuestions(setRows, data))
        }
      }
      setLoading(false)
    }
    load()
  }, [setNumber, params])

  const restart = () => {
    const start = (setNumber - 1) * SET_SIZE
    setQuestions(buildQuestions(allRows.slice(start, start + SET_SIZE), allRows))
    setRound((r) => r + 1)
  }

  const handleAnswer = (q, option, ok) => {
    if (ok) return
    saveMistake({
      topic: TOPIC,
      questionId: q.id,
      question: q.prompt,
      userAnswer: option,
      correctAnswer: q.answer,
      explanation: q.explanation,
    })
  }

  return (
    <AppShell userName="y/n">
      <style>{css}</style>

      <button type="button" className="back-btn" onClick={() => router.back()}>
        ← Дасгалын багцууд руу буцах
      </button>

      <div className="top">
        <div>
          <h1>Дасгал #{setNumber}</h1>
          <p className="lead">Утгад тохирох зөв бичгийг сонго</p>
        </div>
      </div>

      {error && (
        <div className="panel" style={{ color: '#ef4444', fontWeight: 700 }}>
          {error}
        </div>
      )}

      {loading && (
        <div className="panel" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--mute)', fontWeight: 700 }}>Дасгалыг ачаалж байна...</p>
        </div>
      )}

      {!loading && !error && questions.length > 0 && (
        <DuoQuiz
          key={round}
          questions={questions}
          label="Утга:"
          promptSize={20}
          onAnswer={handleAnswer}
          onRestart={restart}
          actions={
            <>
              <Link href="/myclass/mistakes" className="back-btn" style={{ marginBottom: 0 }}>
                Алдсанаа харах
              </Link>
              <button
                type="button"
                className="back-btn"
                style={{ marginBottom: 0 }}
                onClick={() => router.back()}
              >
                Бусад дасгал
              </button>
            </>
          }
        />
      )}
    </AppShell>
  )
}

export default function QuizPage() {
  return (
    <Suspense fallback={null}>
      <QuizInner />
    </Suspense>
  )
}