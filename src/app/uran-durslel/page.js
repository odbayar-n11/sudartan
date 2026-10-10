'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AppShell from '../myclass/components/AppShell'

const DEVICES_TABLE = 'mongolian_literary_devices'
const EXAMPLES_TABLE = 'mongolian_literary_examples'

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
.devs{display:grid;gap:14px}
.dev-name{font-size:20px;font-weight:800;margin:0 0 6px}
.dev-def{margin:0 0 12px;line-height:1.65;opacity:.9}
.dev-mark{margin:0 0 12px;font-size:14px;font-weight:700;color:#0284c7}
.dev-ex-title{font-size:13px;font-weight:800;opacity:.7;margin:0 0 6px}
.dev-ex{margin:0 0 8px;padding:10px 14px;border-left:3px solid #0284c7;background:rgba(128,128,128,.1);border-radius:0 12px 12px 0;line-height:1.55}
.dev-note{display:block;margin-top:4px;font-size:13px;opacity:.7}
.qz-bar{height:8px;border-radius:999px;background:rgba(128,128,128,.25);overflow:hidden;margin:12px 0 20px}
.qz-bar>div{height:100%;background:#0284c7;transition:width .3s}
.qz-meta{display:flex;justify-content:space-between;font-weight:800;font-size:14px}
.qz-label{opacity:.7;font-size:14px;margin:0 0 4px}
.qz-prompt{font-size:18px;font-weight:800;line-height:1.55;margin:0 0 20px}
.qz-opts{display:grid;gap:10px}
.qz-opt{width:100%;text-align:left;padding:14px 18px;border-radius:16px;border:2px solid rgba(128,128,128,.3);background:transparent;color:inherit;font-size:16px;line-height:1.4;font-weight:800;cursor:pointer;transition:all .2s}
.qz-opt:hover:not(:disabled){background:rgba(128,128,128,.12)}
.qz-opt:disabled{cursor:default}
.qz-opt.ok{background:rgba(34,197,94,.18);border-color:#22c55e}
.qz-opt.no{background:rgba(239,68,68,.18);border-color:#ef4444}
.qz-opt.dim{opacity:.5}
.qz-explain{margin-top:16px;padding:12px 16px;border-radius:14px;background:rgba(128,128,128,.12);font-size:14px;line-height:1.6}
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

// Show an example, pick which literary device it is out of 4
function buildRound(examples, devices) {
  const names = devices.map((d) => d.name)
  return shuffle(examples)
    .slice(0, ROUND_SIZE)
    .map((e) => {
      const wrong = shuffle(names.filter((n) => n !== e.device_name)).slice(0, 3)
      const dev = devices.find((d) => d.name === e.device_name)
      return {
        prompt: e.example,
        note: e.note,
        answer: e.device_name,
        definition: dev ? dev.definition : '',
        options: shuffle([e.device_name, ...wrong]),
      }
    })
}

export default function UranZohiolPage() {
  const [devices, setDevices] = useState([])
  const [examples, setExamples] = useState([])
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
      const [dRes, eRes] = await Promise.all([
        supabase.from(DEVICES_TABLE).select('*').order('id', { ascending: true }),
        supabase.from(EXAMPLES_TABLE).select('*').order('id', { ascending: true }),
      ])

      if (dRes.error || eRes.error) {
        setError((dRes.error || eRes.error).message)
      } else if (!dRes.data || dRes.data.length < 4 || !eRes.data || eRes.data.length < 1) {
        setError(
          'Өгөгдөл олдсонгүй. Supabase дээр mongolian_literary_devices болон mongolian_literary_examples хүснэгтэд SELECT (унших) policy байгаа эсэхээ шалгана уу.'
        )
      } else {
        setDevices(dRes.data)
        setExamples(eRes.data)
      }
      setLoading(false)
    }
    load()
  }, [])

  const ready = !loading && !error
  const q = questions[idx]
  const finished = mode === 'quiz' && questions.length > 0 && idx >= questions.length

  const startQuiz = () => {
    setQuestions(buildRound(examples, devices))
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

  const filtered = devices.filter((d) => {
    const s = query.trim().toLowerCase()
    if (!s) return true
    return (
      d.name.toLowerCase().includes(s) ||
      d.definition.toLowerCase().includes(s)
    )
  })

  const examplesOf = (name) => examples.filter((e) => e.device_name === name)

  return (
    <AppShell userName="y/n">
      <style>{css}</style>

      <Link href="/myclass/lessons" className="back-btn">
        ← Хичээлүүд рүү буцах
      </Link>

      <div className="top">
        <div>
          <h1>Уран зохиол</h1>
          <p className="lead">
            {mode === 'study'
              ? 'Уран хэрэглүүрүүдийг уншаад шалгалт өгөөрэй'
              : 'Жишээ нь ямар уран хэрэглүүр болохыг сонго'}
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
            Хэрэглүүр үзэх
          </button>
          <button
            onClick={startQuiz}
            className={`tab ${mode === 'quiz' ? 'on' : ''}`}
          >
            Шалгалт
          </button>
        </div>
      )}

      {/* ---------- Study ---------- */}
      {ready && mode === 'study' && (
        <>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Хэрэглүүр хайх"
            aria-label="Хэрэглүүр хайх"
            className="search"
          />
          <p className="count">
            {filtered.length} / {devices.length} хэрэглүүр
          </p>

          <div className="devs">
            {filtered.map((d) => {
              const exs = examplesOf(d.name)
              return (
                <div key={d.id} className="panel">
                  <p className="dev-name">{d.name}</p>
                  <p className="dev-def">{d.definition}</p>
                  {d.markers && (
                    <p className="dev-mark">Хэлбэрийн үгс: {d.markers}</p>
                  )}
                  {exs.length > 0 && (
                    <>
                      <p className="dev-ex-title">Жишээ</p>
                      {exs.map((e) => (
                        <p key={e.id} className="dev-ex">
                          {e.example}
                          {e.note && <span className="dev-note">{e.note}</span>}
                        </p>
                      ))}
                    </>
                  )}
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div className="panel" style={{ textAlign: 'center' }}>
                Хэрэглүүр олдсонгүй. Өөр түлхүүр үгээр хайгаарай.
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

          <p className="qz-label">Жишээ:</p>
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
            <>
              <div className="qz-explain">
                <b>{q.answer}:</b> {q.definition}
                {q.note && (
                  <>
                    <br />
                    {q.note}
                  </>
                )}
              </div>
              <div className="qz-foot">
                <span className={selected === q.answer ? 'qz-ok' : 'qz-no'}>
                  {selected === q.answer ? 'Зөв!' : 'Буруу.'}
                </span>
                <button onClick={next} className="btn">
                  {idx + 1 === questions.length ? 'Дуусгах' : 'Дараагийн →'}
                </button>
              </div>
            </>
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
              : 'Хэрэглүүрүүдийг дахин уншаад оролдоорой.'}
          </p>
          <div className="qz-actions">
            <button onClick={startQuiz} className="btn">
              Дахин тоглох
            </button>
            <button
              onClick={() => setMode('study')}
              className="back-btn"
              style={{ marginBottom: 0 }}
            >
              Хэрэглүүр үзэх
            </button>
          </div>
        </div>
      )}
    </AppShell>
  )
}