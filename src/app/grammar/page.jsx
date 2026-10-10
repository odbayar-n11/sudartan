'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AppShell from '../myclass/components/AppShell'

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
.qz-bar{height:8px;border-radius:999px;background:rgba(128,128,128,.25);overflow:hidden;margin:12px 0 20px}
.qz-bar>div{height:100%;background:#0284c7;transition:width .3s}
.qz-meta{display:flex;justify-content:space-between;font-weight:800;font-size:14px}
.qz-label{opacity:.7;font-size:14px;margin:0 0 4px}
.qz-prompt{font-size:18px;font-weight:800;line-height:1.5;margin:0 0 20px}
.qz-opts{display:grid;gap:10px}
.qz-opt{width:100%;text-align:left;padding:14px 18px;border-radius:16px;border:2px solid rgba(128,128,128,.3);background:transparent;color:inherit;font-size:15px;line-height:1.4;font-weight:800;cursor:pointer;transition:all .2s}
.qz-opt:hover:not(:disabled){background:rgba(128,128,128,.12)}
.qz-opt:disabled{cursor:default}
.qz-opt.ok{background:rgba(34,197,94,.18);border-color:#22c55e}
.qz-opt.no{background:rgba(239,68,68,.18);border-color:#ef4444}
.qz-opt.dim{opacity:.5}
.qz-fb{margin-top:16px;padding:14px 16px;border-radius:16px;background:rgba(239,68,68,.12);border:2px solid rgba(239,68,68,.35);line-height:1.6;font-weight:600;font-size:14px}
.qz-fb b{font-weight:800}
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
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)

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
        .eq('topic', TOPIC)
      setSavedIds(new Set((saved || []).map((s) => s.item_id)))
    }
    loadUser()
  }, [])

  const q = questions[idx]
  const finished = mode === 'quiz' && questions.length > 0 && idx >= questions.length
  const ready = !loading && !error

  const startQuiz = () => {
    setQuestions(buildRound(rows))
    setIdx(0)
    setSelected(null)
    setScore(0)
    setMode('quiz')
  }

  const saveMistake = async (option) => {
    if (!userId) return
    const { error } = await supabase.from('mistakes').upsert(
      {
        user_id: userId,
        topic: TOPIC,
        question_id: String(q.id),
        question: q.prompt,
        user_answer: option,
        correct_answer: q.answer,
        explanation: `Энэ тайлбар «${q.answer}» ${q.section} дүрэмд хамаарна. Та «${option}»-г сонгосон нь өөр дүрэм юм.`,
      },
      { onConflict: 'user_id,topic,question_id' }
    )
    if (error) console.error('saveMistake:', error.message)
  }

  const choose = (option) => {
    if (selected !== null) return
    setSelected(option)
    if (option === q.answer) {
      setScore((s) => s + 1)
    } else {
      saveMistake(option)
    }
  }

  const next = () => {
    setSelected(null)
    setIdx((i) => i + 1)
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
    isSaved ? nextSet.delete(itemId) : nextSet.add(itemId)
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

          <p className="qz-label">Тайлбар:</p>
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

          {selected !== null && selected !== q.answer && (
            <div className="qz-fb">
              <b>Санал:</b> Зөв хариулт нь <b>«{q.answer}»</b> {q.section}. Та
              «{selected}»-г сонгосон нь өөр дүрэм. Энэ алдаа <b>Алдсан</b> хэсэгт
              хадгалагдлаа.
            </div>
          )}

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
              : 'Дүрмүүдийг дахин уншаад оролдоорой.'}
          </p>
          <div className="qz-actions">
            <button onClick={startQuiz} className="btn">
              Дахин тоглох
            </button>
            {score < questions.length && (
              <Link href="/myclass/stats" className="back-btn" style={{ marginBottom: 0 }}>
                Алдсанаа харах
              </Link>
            )}
            <button
              onClick={() => setMode('study')}
              className="back-btn"
              style={{ marginBottom: 0 }}
            >
              Дүрэм үзэх
            </button>
          </div>
        </div>
      )}
    </AppShell>
  )
}