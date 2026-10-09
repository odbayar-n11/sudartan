'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AppShell from '../myclass/components/AppShell'

const TABLE = 'mongolian_script_words'

// Leave these empty to auto-detect (first two columns after id).
// If the wrong columns are picked, type the real column names here,
// e.g. const A_COL = 'script' and const B_COL = 'meaning'
const A_COL = ''
const B_COL = ''

const SKIP = new Set(['id', 'created_at', 'updated_at'])
const ROUND_SIZE = 10

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
.qz-bar{height:8px;border-radius:999px;background:rgba(128,128,128,.25);overflow:hidden;margin:12px 0 20px}
.qz-bar>div{height:100%;background:#0284c7;transition:width .3s}
.qz-meta{display:flex;justify-content:space-between;font-weight:800;font-size:14px}
.qz-label{opacity:.7;font-size:14px;margin:0 0 4px}
.qz-prompt{font-size:24px;font-weight:800;line-height:1.4;margin:0 0 20px;word-break:break-word}
.qz-opts{display:grid;gap:10px}
.qz-opt{width:100%;text-align:left;padding:14px 18px;border-radius:16px;border:2px solid rgba(128,128,128,.3);background:transparent;color:inherit;font-size:16px;line-height:1.4;font-weight:800;cursor:pointer;transition:all .2s}
.qz-opt:hover:not(:disabled){background:rgba(128,128,128,.12)}
.qz-opt:disabled{cursor:default}
.qz-opt.ok{background:rgba(34,197,94,.18);border-color:#22c55e}
.qz-opt.no{background:rgba(239,68,68,.18);border-color:#ef4444}
.qz-opt.dim{opacity:.5}
.qz-foot{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:20px}
.qz-ok{color:#22c55e;font-weight:800}
.qz-no{color:#ef4444;font-weight:800}
.qz-score{font-size:56px;font-weight:900;margin:8px 0}
.qz-actions{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
`

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Show one column, pick the matching value of the other column out of 4
function buildRound(rows, promptCol, answerCol) {
  return shuffle(rows)
    .slice(0, ROUND_SIZE)
    .map((r) => {
      const wrong = [
        ...new Set(
          shuffle(rows)
            .map((x) => String(x[answerCol]))
            .filter((v) => v !== String(r[answerCol]))
        ),
      ].slice(0, 3)
      return {
        prompt: String(r[promptCol]),
        answer: String(r[answerCol]),
        options: shuffle([String(r[answerCol]), ...wrong]),
      }
    })
}

export default function ScriptPage() {
  const [rows, setRows] = useState([])
  const [cols, setCols] = useState({ a: '', b: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [mode, setMode] = useState('study') // 'study' | 'quiz'
  const [flip, setFlip] = useState(false) // quiz direction
  const [query, setQuery] = useState('')

  const [questions, setQuestions] = useState([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)

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
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const promptCol = flip ? cols.b : cols.a

  const q = questions[idx]
  const finished = mode === 'quiz' && questions.length > 0 && idx >= questions.length
  const ready = !loading && !error

  const startQuiz = (flipValue = flip) => {
    const p = flipValue ? cols.b : cols.a
    const a = flipValue ? cols.a : cols.b
    setQuestions(buildRound(rows, p, a))
    setIdx(0)
    setSelected(null)
    setScore(0)
    setMode('quiz')
  }

  const toggleFlip = () => {
    const nf = !flip
    setFlip(nf)
    startQuiz(nf)
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
              : 'Зөв хариултыг сонго'}
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

      {/* ---------- Quiz ---------- */}
      {ready && mode === 'quiz' && q && !finished && (
        <div className="panel">
          <div className="qz-meta">
            <span>
              {idx + 1} / {questions.length}
            </span>
            <span>Оноо: {score}</span>
          </div>
          <div className="qz-bar">
            <div style={{ width: `${(idx / questions.length) * 100}%` }} />
          </div>

          <p className="qz-label">{promptCol}:</p>
          <p className="qz-prompt">{q.prompt}</p>

          <div className="qz-opts">
            {q.options.map((opt, i) => {
              const isCorrect = opt === q.answer
              const isPicked = selected === opt
              let cls = 'qz-opt'
              if (selected !== null) {
                if (isCorrect) cls += ' ok'
                else if (isPicked) cls += ' no'
                else cls += ' dim'
              }
              return (
                <button
                  key={i}
                  onClick={() => choose(opt)}
                  disabled={selected !== null}
                  className={cls}
                >
                  {opt}
                </button>
              )
            })}
          </div>

          {selected !== null && (
            <div className="qz-foot">
              <span className={selected === q.answer ? 'qz-ok' : 'qz-no'}>
                {selected === q.answer ? 'Зөв!' : 'Буруу.'}
              </span>
              <button onClick={next} className="btn">
                {idx + 1 === questions.length ? 'Дуусгах' : 'Дараагийн →'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------- Result ---------- */}
      {finished && (
        <div className="panel" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--mute)', fontWeight: 700 }}>Таны дүн</p>
          <p className="qz-score">
            {score} / {questions.length}
          </p>
          <p style={{ color: 'var(--mute)', marginBottom: 20 }}>
            {score === questions.length
              ? 'Төгс! Бүгдийг зөв хариуллаа.'
              : score >= questions.length / 2
              ? 'Сайн байна! Дахин оролдоод үзээрэй.'
              : 'Дахин дасгал хийж үзээрэй.'}
          </p>
          <div className="qz-actions">
            <button onClick={() => startQuiz()} className="btn">
              Дахин тоглох
            </button>
            <button
              onClick={() => setMode('study')}
              className="back-btn"
              style={{ marginBottom: 0 }}
            >
              Үгс үзэх
            </button>
          </div>
        </div>
      )}
    </AppShell>
  )
}