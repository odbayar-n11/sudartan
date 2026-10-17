'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { saveMistake } from '@/lib/saveMistake'
import { buildMixedRound } from '@/lib/quizBuilders'
import AppShell from '../myclass/components/AppShell'
import DuoQuiz from '../myclass/components/DuoQuiz'

const TABLE = 'ancient_words'
const WORD_COL = 'word'
const MEANING_COL = 'meaning'
const TOPIC = 'ancient'

const GROUP_SIZE = 10

const css = `
.back-btn{display:inline-flex;align-items:center;gap:6px;margin-bottom:16px;padding:8px 16px;border-radius:999px;border:2px solid rgba(128,128,128,.3);background:transparent;color:inherit;font-weight:800;font-size:14px;text-decoration:none;cursor:pointer}
.back-btn:hover{background:rgba(128,128,128,.12)}
`

export default function AncientPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [active, setActive] = useState(null) // index of the card being played
  const [questions, setQuestions] = useState([])
  const [round, setRound] = useState(0) // changing this key resets <DuoQuiz>
  const [best, setBest] = useState({}) // best score per card this visit

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .order('id', { ascending: true })

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

  // 1 matching board + choice + typing questions from this card's words
  const start = (gi) => {
    const group = groups[gi]
    setActive(gi)
    setQuestions(
      buildMixedRound({
        rows: group,
        pool: rows,
        promptOf: (r) => r[MEANING_COL],
        answerOf: (r) => r[WORD_COL],
        idOf: (r) => r.id,
        total: group.length,
        explainOf: (r) => `«${r[WORD_COL]}» — ${r[MEANING_COL]}`,
      })
    )
    setRound((r) => r + 1)
  }

  const backToCards = () => {
    setActive(null)
    setQuestions([])
  }

  const handleAnswer = (q, option, ok) => {
    if (ok) return
    saveMistake({
      topic: TOPIC,
      questionId: q.id,
      question: q.prompt,
      userAnswer: option || '(хариулаагүй)',
      correctAnswer: q.answer,
    })
  }

  const handleFinish = ({ correct }) => {
    setBest((b) => ({ ...b, [active]: Math.max(b[active] ?? 0, correct) }))
  }

  return (
    <AppShell userName="y/n">
      <style>{css}</style>

      {/* Back button */}
      {active === null ? (
        <Link href="/myclass/lessons" className="back-btn">
          ← Хичээлүүд рүү буцах
        </Link>
      ) : (
        <button onClick={backToCards} className="back-btn">
          ← Картууд руу буцах
        </button>
      )}

      {/* Header Banner */}
      <div className="top">
        <div>
          <h1>Эртний үг</h1>
          <p className="lead">
            {active === null
              ? 'Картаа сонгоод 10 үгийн дасгал хийгээрэй'
              : `Карт ${active + 1} · Сонго, бич, хосыг холбо`}
          </p>
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

      {/* ---------- Cards ---------- */}
      {!loading && !error && active === null && (
        <>
          <h2 className="sec">
            <span className="ib" aria-hidden="true">📜</span> Боломжит дасгалууд
          </h2>

          <div className="cards">
            {groups.map((g, gi) => (
              <div key={gi} className="tcard">
                <span className="st a tcard-badge">{g.length} үг</span>
                <div className="tcard-ic">📜</div>
                <h3>Карт {gi + 1}</h3>
                <p>
                  {g
                    .slice(0, 5)
                    .map((w) => w[WORD_COL])
                    .join(', ')}
                  {g.length > 5 ? '...' : ''}
                </p>
                {best[gi] !== undefined && (
                  <p style={{ fontWeight: 800 }}>
                    Шилдэг: {best[gi]} / {g.length}
                  </p>
                )}
                <div className="tcard-foot">
                  <button
                    onClick={() => start(gi)}
                    className="btn"
                    style={{ width: '100%', textAlign: 'center', marginTop: '10px' }}
                  >
                    Эхлэх →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ---------- Quiz (Duolingo style, mixed question types) ---------- */}
      {active !== null && questions.length > 0 && (
        <DuoQuiz
          key={round}
          questions={questions}
          label="Утга:"
          promptSize={20}
          onAnswer={handleAnswer}
          onFinish={handleFinish}
          onRestart={() => start(active)}
          actions={
            <>
              <Link href="/myclass/mistakes" className="back-btn" style={{ marginBottom: 0 }}>
                Алдсанаа харах
              </Link>
              <button onClick={backToCards} className="back-btn" style={{ marginBottom: 0 }}>
                Картууд руу буцах
              </button>
            </>
          }
        />
      )}
    </AppShell>
  )
}