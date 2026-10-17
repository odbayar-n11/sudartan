'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { saveMistake } from '@/lib/saveMistake'
import AppShell from '../myclass/components/AppShell'
import DuoQuiz from '../myclass/components/DuoQuiz'

const TABLE = 'mongolian_idioms'
const IDIOM_COL = 'idiom'
const MEANING_COL = 'meaning'
const TOPIC = 'idioms'

const ROUND_SIZE = 10

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

// Show the meaning, pick the right idiom out of 4
function buildRound(rows) {
  return shuffle(rows)
    .slice(0, ROUND_SIZE)
    .map((r) => {
      const wrong = [
        ...new Set(
          shuffle(rows.filter((x) => x[IDIOM_COL] !== r[IDIOM_COL])).map(
            (x) => x[IDIOM_COL]
          )
        ),
      ].slice(0, 3)
      return {
        id: r.id,
        prompt: r[MEANING_COL],
        answer: r[IDIOM_COL],
        options: shuffle([r[IDIOM_COL], ...wrong]),
      }
    })
}

export default function IdiomsGame() {
  const [rows, setRows] = useState([])
  const [questions, setQuestions] = useState([])
  const [round, setRound] = useState(0) // changing this key resets <DuoQuiz>
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from(TABLE).select('*')

      if (error) {
        setError(error.message)
      } else if (!data || data.length < 4) {
        setError(
          'Өгөгдөл олдсонгүй (эсвэл 4-өөс цөөн мөр байна). Supabase дээр mongolian_idioms хүснэгтэд SELECT (унших) policy нэмсэн эсэхээ шалгана уу.'
        )
      } else if (!(IDIOM_COL in data[0]) || !(MEANING_COL in data[0])) {
        setError(
          `Баганын нэр таарахгүй байна. Таны хүснэгтийн баганууд: ${Object.keys(data[0]).join(', ')}. Файлын дээд талын IDIOM_COL болон MEANING_COL-г засна уу.`
        )
      } else {
        setRows(data)
        setQuestions(buildRound(data))
      }
      setLoading(false)
    }
    load()
  }, [])

  const restart = () => {
    setQuestions(buildRound(rows))
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
    })
  }

  return (
    <AppShell userName="y/n">
      <style>{css}</style>

      <Link href="/myclass/lessons" className="back-btn">
        ← Хичээлүүд рүү буцах
      </Link>

      <div className="top">
        <div>
          <h1>Хэлц үг</h1>
          <p className="lead">Тайлбарт тохирох хэлц үгийг сонго</p>
        </div>
      </div>

      {error && (
        <div className="panel" style={{ color: '#ef4444', fontWeight: 700 }}>
          {error}
        </div>
      )}

      {loading && (
        <div className="panel" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--mute)', fontWeight: '700' }}>
            Дасгалуудыг ачаалж байна...
          </p>
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
              <Link href="/myclass/lessons" className="back-btn" style={{ marginBottom: 0 }}>
                Хичээлүүд рүү буцах
              </Link>
            </>
          }
        />
      )}
    </AppShell>
  )
}