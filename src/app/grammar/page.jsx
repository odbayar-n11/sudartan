'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { saveMistake } from '@/lib/saveMistake'
import AppShell from '../myclass/components/AppShell'
import DuoQuiz from '../myclass/components/DuoQuiz'

const TABLE = 'mongolian_grammar'
const TYPE_COL = 'grammar_type'
const DESC_COL = 'description'
const TOPIC = 'grammar'

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
.rules{display:grid;gap:14px}
.rule-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:8px}
.rule-title{font-size:18px;font-weight:800;line-height:1.35;margin:0}
.rule-right{display:flex;align-items:center;gap:8px;flex-shrink:0}
.rule-sec{padding:3px 12px;border-radius:999px;background:rgba(2,132,199,.18);color:#0284c7;font-weight:800;font-size:13px}
.rule-desc{margin:0;line-height:1.65;opacity:.85}
.save-btn{width:36px;height:36px;border-radius:50%;border:2px solid rgba(128,128,128,.3);background:transparent;font-size:16px;cursor:pointer;display:grid;place-items:center;filter:grayscale(1);opacity:.7}
.save-btn:hover{background:rgba(128,128,128,.12);opacity:1}
.save-btn.on{filter:none;opacity:1;border-color:#0284c7;background:rgba(2,132,199,.15)}
`

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
        id: r.id,
        prompt: r[DESC_COL],
        answer,
        section: sectionOf(r[TYPE_COL]),
        explanation: sectionOf(r[TYPE_COL]) ? `${sectionOf(r[TYPE_COL])} дүрэмд хамаарна.` : '',
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
  const [round, setRound] = useState(0) // changing this key resets <DuoQuiz>

  const [userId, setUserId] = useState(null)
  const [savedIds, setSavedIds] = useState(new Set())

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
          (a, b) => sortKey(a[TYPE_COL]) - sortKey(b[TYPE_COL]) || a.id - b.id
        )
        setRows(sorted)
        // Lessons card links here with ?mode=quiz -> start the Duolingo quiz right away
        if (new URLSearchParams(window.location.search).get('mode') === 'quiz') {
          setQuestions(buildRound(sorted))
          setRound((r) => r + 1)
          setMode('quiz')
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  // Load the user and which rules they already saved
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
    setQuestions(buildRound(rows))
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
      explanation: `Энэ тайлбар «${q.answer}» ${q.section} дүрэмд хамаарна. Та «${option}»-г сонгосон нь өөр дүрэм юм.`,
    })
  }

  const toggleSave = async (r) => {
    if (!userId) {
      alert('Хадгалахын тулд нэвтэрнэ үү')
      return
    }
    const itemId = `${TOPIC}-${r.id}`
    const isSaved = savedIds.has(itemId)

    // update the UI right away
    const nextSet = new Set(savedIds)
    if (isSaved) nextSet.delete(itemId)
    else nextSet.add(itemId)
    setSavedIds(nextSet)

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
          title: `${cleanTitle(r[TYPE_COL])} ${sectionOf(r[TYPE_COL])}`.trim(),
          content: r[DESC_COL],
        })

    if (error) {
      console.error('toggleSave:', error.message)
      setSavedIds(savedIds) // undo on failure
    }
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
    <AppShell userName="">
      <style>{css}</style>

      <Link href="/myclass/lessons" className="back-btn">
        ← Хичээлүүд рүү буцах
      </Link>

      <div className="top">
        <div>
          <h1>Зөв бичих дүрэм</h1>
          <p className="lead">
            {mode === 'study'
              ? 'Дүрмүүдийг уншаад шалгалт өгөөрэй'
              : 'Тайлбарт тохирох дүрмийг сонго'}
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
            Дүрэм үзэх
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
            placeholder="Дүрэм хайх"
            aria-label="Дүрэм хайх"
            className="search"
          />
          <p className="count">
            {filtered.length} / {rows.length} дүрэм
          </p>

          <div className="rules">
            {filtered.map((r) => {
              const isSaved = savedIds.has(`${TOPIC}-${r.id}`)
              return (
                <div key={r.id} className="panel">
                  <div className="rule-head">
                    <p className="rule-title">{cleanTitle(r[TYPE_COL])}</p>
                    <div className="rule-right">
                      {sectionOf(r[TYPE_COL]) && (
                        <span className="rule-sec">{sectionOf(r[TYPE_COL])}</span>
                      )}
                      <button
                        type="button"
                        className={`save-btn ${isSaved ? 'on' : ''}`}
                        onClick={() => toggleSave(r)}
                        aria-label={isSaved ? 'Хадгалснаас хасах' : 'Хадгалах'}
                        aria-pressed={isSaved}
                        title={isSaved ? 'Хадгалснаас хасах' : 'Хадгалах'}
                      >
                        🔖
                      </button>
                    </div>
                  </div>
                  <p className="rule-desc">{r[DESC_COL]}</p>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div className="panel" style={{ textAlign: 'center' }}>
                Дүрэм олдсонгүй. Өөр түлхүүр үгээр хайгаарай.
              </div>
            )}
          </div>
        </>
      )}

      {/* ---------- Quiz (Duolingo style) ---------- */}
      {ready && mode === 'quiz' && questions.length > 0 && (
        <DuoQuiz
          key={round}
          questions={questions}
          label="Тайлбар:"
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
                Дүрэм үзэх
              </button>
            </>
          }
        />
      )}
    </AppShell>
  )
}