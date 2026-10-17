'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { saveMistake } from '@/lib/saveMistake'
import { buildMixedRound } from '@/lib/quizBuilders'
import AppShell from '../myclass/components/AppShell'
import DuoQuiz from '../myclass/components/DuoQuiz'

const TABLE = 'mongolian_script_words'
const TOPIC = 'script'

// Leave these empty to auto-detect (first two columns after id).
// If the wrong columns are picked, type the real column names here,
// e.g. const A_COL = 'script' and const B_COL = 'meaning'
const A_COL = ''
const B_COL = ''

const SKIP = new Set(['id', 'created_at', 'updated_at'])

const css = `
.back-btn{display:inline-flex;align-items:center;gap:6px;margin-bottom:16px;padding:8px 16px;border-radius:999px;border:2px solid rgba(128,128,128,.3);background:transparent;color:inherit;font-weight:800;font-size:14px;text-decoration:none;cursor:pointer}
.back-btn:hover{background:rgba(128,128,128,.12)}
.tabs{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px}
.tab{padding:9px 20px;border-radius:999px;border:2px solid rgba(128,128,128,.3);background:transparent;color:inherit;font-weight:800;font-size:14px;cursor:pointer}
.tab:hover{background:rgba(128,128,128,.12)}
.tab.on{background:#0284c7;border-color:#0284c7;color:#fff}
.search{width:100%;box-sizing:border-box;margin-bottom:12px;padding:12px 18px;border-radius:16px;border:2px solid rgba(128,128,128,.3);background:transparent;color:inherit;font-size:16px;outline:none}
.search:focus{border-color:#0284c7}
.count{opacity:.7;font-size:14px;font-weight:700;margin:0 0 14px}
.words{display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
.word-main{font-size:24px;font-weight:800;margin:0 0 8px;word-break:break-word}
.word-sub{margin:0;line-height:1.6;opacity:.85}
`

export default function ScriptPage() {
  const [rows, setRows] = useState([])
  const [cols, setCols] = useState({ a: '', b: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [mode, setMode] = useState('study') // 'study' | 'quiz'
  const [flip, setFlip] = useState(false) // quiz direction
  const [query, setQuery] = useState('')

  const [questions, setQuestions] = useState([])
  const [round, setRound] = useState(0) // changing this key resets <DuoQuiz>

  // dir ('a' or 'b') keeps mistakes from the two directions separate
  const makeRound = (data, a, b, flipValue) => {
    const pCol = flipValue ? b : a
    const aCol = flipValue ? a : b
    const dir = flipValue ? 'b' : 'a'
    return buildMixedRound({
      rows: data,
      promptOf: (r) => r[pCol],
      answerOf: (r) => r[aCol],
      idOf: (r) => `${r.id}-${dir}`,
    })
  }

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from(TABLE).select('*').order('id')

      if (error) {
        setError(error.message)
      } else if (!data || data.length < 4) {
        setError(
          'Өгөгдөл олдсонгүй (эсвэл 4-өөс цөөн мөр байна). Supabase дээр mongolian_script_words хүснэгтэд SELECT (унших) policy байгаа эсэхээ шалгана уу.'
        )
      } else {
        const keys = Object.keys(data[0]).filter((k) => !SKIP.has(k))
        const a = A_COL || keys[0]
        const b = B_COL || keys[1]
        if (!a || !b || !(a in data[0]) || !(b in data[0])) {
          setError(
            `Баганын нэр таарахгүй байна. Таны хүснэгтийн баганууд: ${Object.keys(
              data[0]
            ).join(', ')}. Файлын дээд талын A_COL болон B_COL-г засна уу.`
          )
        } else {
          setCols({ a, b })
          setRows(data)
          // Lessons card links here with ?mode=quiz -> start right away
          if (new URLSearchParams(window.location.search).get('mode') === 'quiz') {
            setQuestions(makeRound(data, a, b, false))
            setRound((r) => r + 1)
            setMode('quiz')
          }
        }
      }
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const promptCol = flip ? cols.b : cols.a
  const ready = !loading && !error

  const startQuiz = (flipValue = flip) => {
    setQuestions(makeRound(rows, cols.a, cols.b, flipValue))
    setRound((r) => r + 1)
    setMode('quiz')
  }

  const toggleFlip = () => {
    const nf = !flip
    setFlip(nf)
    startQuiz(nf)
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

  const filtered = rows.filter((r) => {
    const s = query.trim().toLowerCase()
    if (!s) return true
    return (
      String(r[cols.a] ?? '').toLowerCase().includes(s) ||
      String(r[cols.b] ?? '').toLowerCase().includes(s)
    )
  })

  return (
    <AppShell userName="y/n">
      <style>{css}</style>

      <Link href="/myclass/lessons" className="back-btn">
        ← Хичээлүүд рүү буцах
      </Link>

      <div className="top">
        <div>
          <h1>Монгол бичиг</h1>
          <p className="lead">
            {mode === 'study'
              ? 'Үгсийг уншаад шалгалт өгөөрэй'
              : 'Сонго, бич, хосыг холбо — зөв хариултыг ол'}
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

      {ready && (
        <div className="tabs">
          <button
            onClick={() => setMode('study')}
            className={`tab ${mode === 'study' ? 'on' : ''}`}
          >
            Үгс үзэх
          </button>
          <button
            onClick={() => startQuiz()}
            className={`tab ${mode === 'quiz' ? 'on' : ''}`}
          >
            Шалгалт
          </button>
          {mode === 'quiz' && (
            <button onClick={toggleFlip} className="tab">
              Чиглэл солих
            </button>
          )}
        </div>
      )}

      {/* ---------- Study ---------- */}
      {ready && mode === 'study' && (
        <>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Хайх"
            aria-label="Хайх"
            className="search"
          />
          <p className="count">
            {filtered.length} / {rows.length}
          </p>

          <div className="words">
            {filtered.map((r) => (
              <div key={r.id} className="panel">
                <p className="word-main">{String(r[cols.a])}</p>
                <p className="word-sub">{String(r[cols.b])}</p>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="panel" style={{ textAlign: 'center' }}>
                Олдсонгүй. Өөр үгээр хайгаарай.
              </div>
            )}
          </div>
        </>
      )}

      {/* ---------- Quiz (Duolingo style, mixed question types) ---------- */}
      {ready && mode === 'quiz' && questions.length > 0 && (
        <DuoQuiz
          key={round}
          questions={questions}
          label={`${promptCol}:`}
          promptSize={24}
          onAnswer={handleAnswer}
          onRestart={() => startQuiz()}
          actions={
            <>
              <Link href="/myclass/mistakes" className="back-btn" style={{ marginBottom: 0 }}>
                Алдсанаа харах
              </Link>
              <button
                type="button"
                onClick={() => setMode('study')}
                className="back-btn"
                style={{ marginBottom: 0 }}
              >
                Үгс үзэх
              </button>
            </>
          }
        />
      )}
    </AppShell>
  )
}