'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { saveMistake } from '@/lib/saveMistake'
import { shuffle } from '@/lib/quizBuilders'
import AppShell from '../myclass/components/AppShell'
import DuoQuiz from '../myclass/components/DuoQuiz'

const DEVICES_TABLE = 'mongolian_literary_devices'
const EXAMPLES_TABLE = 'mongolian_literary_examples'
const TOPIC = 'literary'

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
.dev-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:6px}
.dev-name{font-size:20px;font-weight:800;margin:0}
.dev-def{margin:0 0 12px;line-height:1.65;opacity:.9}
.dev-mark{margin:0 0 12px;font-size:14px;font-weight:700;color:#0284c7}
.dev-ex-title{font-size:13px;font-weight:800;opacity:.7;margin:0 0 6px}
.dev-ex{margin:0 0 8px;padding:10px 14px;border-left:3px solid #0284c7;background:rgba(128,128,128,.1);border-radius:0 12px 12px 0;line-height:1.55}
.dev-note{display:block;margin-top:4px;font-size:13px;opacity:.7}
.save-btn{flex-shrink:0;width:36px;height:36px;border-radius:50%;border:2px solid rgba(128,128,128,.3);background:transparent;font-size:16px;cursor:pointer;display:grid;place-items:center;filter:grayscale(1);opacity:.7}
.save-btn:hover{background:rgba(128,128,128,.12);opacity:1}
.save-btn.on{filter:none;opacity:1;border-color:#0284c7;background:rgba(2,132,199,.15)}
`

// 1 matching board (example <-> device), then "which device?" and "true or false?" questions
function buildRound(examples, devices) {
  const names = devices.map((d) => d.name)
  const defOf = (n) => devices.find((d) => d.name === n)?.definition || ''
  const explainOf = (e) =>
    `${e.device_name}: ${defOf(e.device_name)}${e.note ? ` — ${e.note}` : ''}`

  const pool = shuffle(examples)

  // up to 4 examples that belong to different devices
  const seen = new Set()
  const matchRows = []
  for (const e of pool) {
    if (!seen.has(e.device_name)) {
      seen.add(e.device_name)
      matchRows.push(e)
    }
    if (matchRows.length === 4) break
  }

  const qs = []
  if (matchRows.length >= 3) {
    qs.push({
      id: `match-${matchRows[0].id}`,
      type: 'match',
      prompt: 'Жишээг уран хэрэглүүртэй нь холбо',
      pairs: matchRows.map((e) => ({ left: e.example, right: e.device_name })),
    })
  }

  const rest = pool.filter((e) => !matchRows.includes(e))
  const need = ROUND_SIZE - qs.length
  const singles = (rest.length >= need ? rest : pool).slice(0, need)

  singles.forEach((e, i) => {
    const explanation = explainOf(e)

    if (i % 3 === 2) {
      // true / false
      const isTrue = Math.random() < 0.5
      const other = shuffle(names.filter((n) => n !== e.device_name))[0]
      const shown = isTrue ? e.device_name : other
      qs.push({
        id: `${e.id}-tf`,
        type: 'choice',
        prompt: `${e.example}\n\nЭнэ нь «${shown}» мөн үү?`,
        answer: isTrue ? 'Тийм' : 'Үгүй',
        options: ['Тийм', 'Үгүй'],
        explanation,
        showOnCorrect: true,
      })
      return
    }

    const wrong = shuffle(names.filter((n) => n !== e.device_name)).slice(0, 3)
    qs.push({
      id: e.id,
      type: 'choice',
      prompt: e.example,
      answer: e.device_name,
      options: shuffle([e.device_name, ...wrong]),
      explanation,
      showOnCorrect: true,
    })
  })

  return qs
}

export default function UranZohiolPage() {
  const [devices, setDevices] = useState([])
  const [examples, setExamples] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [mode, setMode] = useState('study') // 'study' | 'quiz'
  const [query, setQuery] = useState('')

  const [questions, setQuestions] = useState([])
  const [round, setRound] = useState(0) // changing this key resets <DuoQuiz>

  const [userId, setUserId] = useState(null)
  const [savedIds, setSavedIds] = useState(new Set())

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
        // Lessons card links here with ?mode=quiz -> start right away
        if (new URLSearchParams(window.location.search).get('mode') === 'quiz') {
          setQuestions(buildRound(eRes.data, dRes.data))
          setRound((r) => r + 1)
          setMode('quiz')
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  // Load the user and which devices they already saved
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (!user) return
      setUserId(user.id)

      const { data: saved } = await supabase
        .from('saved_items')
        .select('item_id')
        .eq('user_id', user.id)
        .eq('topic', TOPIC)
      setSavedIds(new Set((saved || []).map((s) => s.item_id)))
    }
    loadUser()
  }, [])

  const ready = !loading && !error

  const startQuiz = () => {
    setQuestions(buildRound(examples, devices))
    setRound((r) => r + 1)
    setMode('quiz')
  }

  const handleAnswer = (q, option, ok) => {
    if (ok) return
    saveMistake({
      topic: TOPIC,
      questionId: q.id,
      question: q.prompt,
      userAnswer: option,
      correctAnswer: q.answer,
      explanation: q.explanation || null,
    })
  }

  const examplesOf = (name) => examples.filter((e) => e.device_name === name)

  const toggleSave = async (d) => {
    if (!userId) {
      alert('Хадгалахын тулд нэвтэрнэ үү')
      return
    }
    const itemId = `${TOPIC}-${d.id}`
    const isSaved = savedIds.has(itemId)

    // update the UI right away
    const nextSet = new Set(savedIds)
    if (isSaved) nextSet.delete(itemId)
    else nextSet.add(itemId)
    setSavedIds(nextSet)

    // definition + examples are stored as the saved content
    const exText = examplesOf(d.name)
      .map((e) => `• ${e.example}`)
      .join('\n')
    const content = exText ? `${d.definition}\n\nЖишээ:\n${exText}` : d.definition

    const { error } = isSaved
      ? await supabase
          .from('saved_items')
          .delete()
          .eq('user_id', userId)
          .eq('item_id', itemId)
      : await supabase.from('saved_items').insert({
          user_id: userId,
          topic: TOPIC,
          item_id: itemId,
          title: d.name,
          content,
        })

    if (error) {
      console.error('toggleSave:', error.message)
      setSavedIds(savedIds) // undo on failure
    }
  }

  const filtered = devices.filter((d) => {
    const s = query.trim().toLowerCase()
    if (!s) return true
    return (
      d.name.toLowerCase().includes(s) ||
      d.definition.toLowerCase().includes(s)
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
          <h1>Уран зохиол</h1>
          <p className="lead">
            {mode === 'study'
              ? 'Уран хэрэглүүрүүдийг уншаад шалгалт өгөөрэй'
              : 'Жишээ нь ямар уран хэрэглүүр болохыг ол'}
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
              const isSaved = savedIds.has(`${TOPIC}-${d.id}`)
              return (
                <div key={d.id} className="panel">
                  <div className="dev-head">
                    <p className="dev-name">{d.name}</p>
                    <button
                      type="button"
                      className={`save-btn ${isSaved ? 'on' : ''}`}
                      onClick={() => toggleSave(d)}
                      aria-label={isSaved ? 'Хадгалснаас хасах' : 'Хадгалах'}
                      aria-pressed={isSaved}
                      title={isSaved ? 'Хадгалснаас хасах' : 'Хадгалах'}
                    >
                      🔖
                    </button>
                  </div>
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

      {/* ---------- Quiz (Duolingo style, mixed question types) ---------- */}
      {ready && mode === 'quiz' && questions.length > 0 && (
        <DuoQuiz
          key={round}
          questions={questions}
          label="Жишээ:"
          promptSize={18}
          onAnswer={handleAnswer}
          onRestart={startQuiz}
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
                Хэрэглүүр үзэх
              </button>
            </>
          }
        />
      )}
    </AppShell>
  )
}