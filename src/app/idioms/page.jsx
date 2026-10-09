'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AppShell from '../myclass/components/AppShell'

const TABLE = 'mongolian_idioms'
const IDIOM_COL = 'idiom'
const MEANING_COL = 'meaning'

const ROUND_SIZE = 10

const css = `
.back-btn{display:inline-flex;align-items:center;gap:6px;margin-bottom:16px;padding:8px 16px;border-radius:999px;border:2px solid rgba(128,128,128,.3);background:transparent;color:inherit;font-weight:800;font-size:14px;text-decoration:none;cursor:pointer}
.back-btn:hover{background:rgba(128,128,128,.12)}
.qz-bar{height:8px;border-radius:999px;background:rgba(128,128,128,.25);overflow:hidden;margin:12px 0 20px}
.qz-bar>div{height:100%;background:#0284c7;transition:width .3s}
.qz-meta{display:flex;justify-content:space-between;font-weight:800;font-size:14px}
.qz-label{opacity:.7;font-size:14px;margin:0 0 4px}
.qz-prompt{font-size:20px;font-weight:800;line-height:1.4;margin:0 0 20px}
.qz-opts{display:grid;gap:10px}
.qz-opt{width:100%;text-align:left;padding:14px 18px;border-radius:16px;border:2px solid rgba(128,128,128,.3);background:transparent;color:inherit;font-size:16px;font-weight:800;cursor:pointer;transition:all .2s}
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
        idiom: r[IDIOM_COL],
        meaning: r[MEANING_COL],
        options: shuffle([r[IDIOM_COL], ...wrong]),
      }
    })
}

export default function IdiomsGame() {
  const [rows, setRows] = useState([])
  const [questions, setQuestions] = useState([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
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

  const finished = questions.length > 0 && idx >= questions.length
  const q = questions[idx]

  const choose = (option) => {
    if (selected !== null) return
    setSelected(option)
    if (option === q.idiom) setScore((s) => s + 1)
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

      {/* ---------- Quiz ---------- */}
      {!loading && !error && q && !finished && (
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

          <p className="qz-label">Утга:</p>
          <p className="qz-prompt">{q.meaning}</p>

          <div className="qz-opts">
            {q.options.map((opt, i) => {
              const isCorrect = opt === q.idiom
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
              <span className={selected === q.idiom ? 'qz-ok' : 'qz-no'}>
                {selected === q.idiom ? 'Зөв!' : 'Буруу.'}
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
            <button onClick={restart} className="btn">
              Дахин тоглох
            </button>
            <Link href="/myclass/lessons" className="back-btn" style={{ marginBottom: 0 }}>
              Хичээлүүд рүү буцах
            </Link>
          </div>
        </div>
      )}
    </AppShell>
  )
}