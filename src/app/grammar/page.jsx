'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  ClipboardCheck,
  CircleAlert,
  PenLine,
  Search,
  SearchX,
  Bookmark,
  Loader2,
  TriangleAlert,
  ListChecks,
  Lightbulb,
  ArrowRight,
  Layers,
} from 'lucide-react'
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
.sx{--tone:#0284c7;--tone-bg:rgba(2,132,199,.15)}

.sx{width:100%;min-width:0;box-sizing:border-box;align-self:stretch;text-align:left}
.sx .top,.sx .lead{text-align:left;justify-content:flex-start}
.st-card,.an-card{min-width:0}
.sx .panel,.sx .panel p,.sx .panel div{text-align:left}
.sx .st-state{text-align:center}

.st-back,.st-btn{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:999px;border:2px solid rgba(128,128,128,.3);background:transparent;color:inherit;font-weight:800;font-size:14px;text-decoration:none;cursor:pointer;transition:background .2s,border-color .2s,transform .15s}
.st-back{margin-bottom:18px;animation:st-rise .5s backwards}
.st-back:hover,.st-btn:hover{background:rgba(128,128,128,.12);border-color:var(--tone)}
.st-arl{transition:transform .2s}
.st-back:hover .st-arl{transform:translateX(-4px)}
.st-back:active,.st-btn:active{transform:scale(.96)}
.st-back:focus-visible,.st-btn:focus-visible,.st-tab:focus-visible,.st-save:focus-visible{outline:3px solid var(--tone);outline-offset:3px}

.st-h1{display:flex;align-items:center;gap:12px}
.st-hico{display:grid;place-items:center;width:42px;height:42px;border-radius:14px;background:var(--tone-bg);color:var(--tone);animation:st-pop .6s cubic-bezier(.3,1.6,.5,1) backwards}

.st-tabs{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;animation:st-rise .5s backwards}
.st-tab{display:inline-flex;align-items:center;gap:8px;padding:9px 20px;border-radius:999px;border:2px solid rgba(128,128,128,.3);background:transparent;color:inherit;font-weight:800;font-size:14px;cursor:pointer;transition:background .2s,border-color .2s,color .2s,transform .15s,box-shadow .2s}
.st-tab:hover{background:rgba(128,128,128,.12);transform:translateY(-2px)}
.st-tab:hover svg{animation:st-wiggle .5s}
.st-tab:active{transform:scale(.96)}
.st-tab.on{background:var(--tone);border-color:var(--tone);color:#fff;box-shadow:0 6px 16px color-mix(in srgb,var(--tone) 35%,transparent)}

.st-search{position:relative;margin-bottom:12px;animation:st-rise .5s .05s backwards}
.st-search svg{position:absolute;left:16px;top:50%;transform:translateY(-50%);opacity:.55;pointer-events:none;transition:color .2s,opacity .2s}
.st-search input{width:100%;box-sizing:border-box;padding:13px 18px 13px 46px;border-radius:16px;border:2px solid rgba(128,128,128,.3);background:transparent;color:inherit;font-size:16px;outline:none;transition:border-color .2s,box-shadow .2s}
.st-search input:focus{border-color:var(--tone);box-shadow:0 0 0 4px color-mix(in srgb,var(--tone) 18%,transparent)}
.st-search:focus-within svg{color:var(--tone);opacity:1}

.st-count{display:inline-flex;align-items:center;gap:6px;margin:0 0 16px;padding:4px 12px;border-radius:999px;background:var(--tone-bg);color:var(--tone);font-size:13px;font-weight:800;font-variant-numeric:tabular-nums}

.st-cats{display:grid;gap:20px;grid-template-columns:repeat(auto-fill,minmax(min(280px,100%),1fr))}
.st-cat{position:relative;overflow:hidden;display:flex;flex-direction:column;min-height:220px;padding:24px;border-radius:28px;border:1px solid rgba(128,128,128,.22);background:rgba(128,128,128,.1);color:inherit;font:inherit;text-align:left;cursor:pointer;animation:st-rise .6s cubic-bezier(.2,.7,.2,1) backwards;animation-delay:calc(var(--i,0)*60ms);transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}
.st-cat:hover{transform:translateY(-6px);border-color:var(--tone);box-shadow:0 16px 36px color-mix(in srgb,var(--tone) 28%,transparent)}
.st-cat:active{transform:translateY(-2px) scale(.99)}
.st-cat:focus-visible{outline:3px solid var(--tone);outline-offset:3px}
.st-ghost{position:absolute;right:14px;bottom:-14px;font-size:120px;font-weight:900;line-height:1;color:var(--tone);opacity:.08;pointer-events:none;transition:transform .5s cubic-bezier(.2,.7,.2,1),opacity .3s}
.st-cat:hover .st-ghost{transform:rotate(-8deg) scale(1.12);opacity:.14}
.st-catnum{position:relative;width:56px;height:56px;border-radius:18px;display:grid;place-items:center;background:var(--tone-bg);color:var(--tone);font-weight:900;font-size:20px;margin-bottom:18px;transition:transform .3s cubic-bezier(.3,1.6,.5,1),background .25s,color .25s}
.st-cat:hover .st-catnum{transform:rotate(-8deg) scale(1.1);background:var(--tone);color:#fff}
.st-cat h3{position:relative;margin:0 0 8px;font-size:20px;font-weight:800;line-height:1.3;overflow-wrap:anywhere}
.st-cat-sub{position:relative;margin:0 0 16px;font-size:15px;line-height:1.5;opacity:.7;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.st-cat-foot{position:relative;margin-top:auto;display:flex;align-items:center;justify-content:space-between}
.st-pill{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:999px;background:var(--tone-bg);color:var(--tone);font-size:14px;font-weight:800}
.st-go{display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:var(--tone-bg);color:var(--tone);transition:background .25s,color .25s}
.st-go svg{transition:transform .2s}
.st-cat:hover .st-go{background:var(--tone);color:#fff}
.st-cat:hover .st-go svg{transform:translateX(3px)}

.st-cathead{display:flex;align-items:center;gap:16px;margin:18px 0 22px;animation:st-rise .5s backwards}
.st-cathead .st-catnum{margin:0;flex-shrink:0}
.st-cathead>div{display:flex;flex-direction:column;align-items:flex-start;gap:8px;min-width:0;text-align:left}
.st-cathead h2{margin:0;font-size:clamp(22px,2.4vw,28px);font-weight:800;line-height:1.25;text-align:left;overflow-wrap:anywhere}
.st-cathead .st-pill{margin:0}

.st-group{margin-bottom:30px}
.st-ghead{display:flex;align-items:center;gap:12px;margin:0 0 14px;animation:st-rise .5s backwards}
.st-gnum{padding:6px 14px;border-radius:12px;background:var(--tone);color:#fff;font-weight:800;font-size:15px}
.st-gline{flex:1;height:2px;border-radius:2px;background:linear-gradient(90deg,var(--tone-bg),transparent)}
.st-gcount{font-size:14px;font-weight:800;opacity:.65;white-space:nowrap}
.st-rules{display:grid;gap:16px}
.st-card{position:relative;overflow:hidden;padding-left:26px;animation:st-rise .55s cubic-bezier(.2,.7,.2,1) backwards;animation-delay:calc(var(--i,0)*50ms);transition:transform .25s ease,box-shadow .25s ease}
.st-card::before{content:"";position:absolute;left:0;top:0;bottom:0;width:6px;background:linear-gradient(180deg,var(--tone),color-mix(in srgb,var(--tone) 40%,#fff));transform-origin:top;animation:st-grow .6s cubic-bezier(.2,.7,.2,1) backwards;animation-delay:calc(var(--i,0)*50ms + .15s)}
.st-card:hover{transform:translateY(-4px);box-shadow:0 14px 30px color-mix(in srgb,var(--tone) 22%,transparent)}

.st-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:12px}
.st-title{font-size:clamp(19px,2vw,22px);font-weight:800;line-height:1.35;margin:0;overflow-wrap:anywhere}
.st-right{display:flex;align-items:center;gap:8px;flex-shrink:0}
.st-sec{padding:4px 12px;border-radius:999px;background:var(--tone-bg);color:var(--tone);font-weight:800;font-size:14px;white-space:nowrap}
.st-desc{margin:0;max-width:75ch;font-size:clamp(16.5px,1.7vw,18px);font-weight:500;line-height:1.75}
.st-ex{margin-top:16px;padding:14px 16px;border-radius:16px;background:var(--tone-bg);border:1px solid color-mix(in srgb,var(--tone) 25%,transparent)}
.st-ex-h{display:flex;align-items:center;gap:8px;margin-bottom:10px;font-size:14px;font-weight:800;color:var(--tone)}
.st-ex-chips{display:flex;flex-wrap:wrap;gap:8px}
.st-chip{padding:6px 14px;border-radius:999px;background:#fff;color:#14263a;border:1px solid color-mix(in srgb,var(--tone) 30%,transparent);font-size:16px;font-weight:700;line-height:1.4;overflow-wrap:anywhere}
.st-ex-text{margin:0;font-size:clamp(16px,1.6vw,17.5px);font-weight:600;line-height:1.7;overflow-wrap:anywhere}

.st-save{width:38px;height:38px;border-radius:50%;border:2px solid rgba(128,128,128,.3);background:transparent;color:inherit;cursor:pointer;display:grid;place-items:center;opacity:.75;transition:background .2s,border-color .2s,color .2s,transform .15s,opacity .2s}
.st-save:hover{background:rgba(128,128,128,.12);opacity:1;transform:scale(1.08)}
.st-save:active{transform:scale(.92)}
.st-save.on{opacity:1;border-color:var(--tone);background:var(--tone-bg);color:var(--tone)}
.st-save.on svg{fill:currentColor;animation:st-pop .4s cubic-bezier(.3,1.6,.5,1)}

.st-state{display:flex;align-items:center;justify-content:center;gap:10px;text-align:center;animation:st-rise .5s backwards}
.st-spin{animation:st-spin 1s linear infinite}

@keyframes st-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes st-grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes st-pop{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:scale(1)}}
@keyframes st-wiggle{25%{transform:rotate(-14deg)}50%{transform:rotate(12deg)}75%{transform:rotate(-6deg)}}
@keyframes st-spin{to{transform:rotate(360deg)}}

@media (max-width:600px){.st-card{padding:14px 14px 14px 22px}.st-h1{font-size:28px}.an-card{padding:20px}}

@media (prefers-reduced-motion:reduce){
  .sx *,.sx *::before{animation:none!important;transition:none!important}
}
`

// Split "... Жишээлбэл: ..." into the rule text and its example
function splitExample(text = '') {
  const m = text.match(/Жишээ(?:лбэл)?\s*:/i)
  if (!m) return { def: text, example: '' }
  return {
    def: text.slice(0, m.index).trim(),
    example: text.slice(m.index + m[0].length).trim(),
  }
}

// "олон-олноос, авар-авраад." -> ['олон-олноос', 'авар-авраад']
// Returns null when the example is a sentence (then it is shown as plain text)
function exampleChips(text = '') {
  const parts = text
    .replace(/[.。]\s*$/, '')
    .split(/\s*[,;]\s*/)
    .map((p) => p.trim())
    .filter(Boolean)
  if (
    parts.length >= 2 &&
    parts.every((p) => p.length <= 28 && p.split(/\s+/).length <= 2)
  )
    return parts
  return null
}

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

// "Нэр (§32.1)" -> "32.1"
const sectionOf = (t) => {
  const m = t.match(/\(§([^)]*)\)\s*$/)
  return m ? m[1] : ''
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
        explanation: `«${answer}» дүрэмд хамаарна.`,
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
  const [category, setCategory] = useState(null) // key of the opened category

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
        // A link with ?mode=quiz starts the Duolingo quiz right away
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

  // go back to the top when a category is opened / closed
  useEffect(() => {
    document.getElementById('st-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [category])

  const showStudy = () => {
    setCategory(null)
    setMode('study')
  }

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
      explanation: `Энэ тайлбар «${q.answer}» дүрэмд хамаарна. Та «${option}»-г сонгосон нь өөр дүрэм юм.`,
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
          title: cleanTitle(r[TYPE_COL]),
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

  // Big categories by main section number, numbered 1, 2, 3 ...
  const categories = []
  const ruleNo = {} // rule id -> "1.1", "1.2" ...
  rows.forEach((r) => {
    const k = sortKey(r[TYPE_COL])
    const key = k === 9999 ? 'other' : String(Math.floor(k))
    let c = categories.find((x) => x.key === key)
    if (!c) {
      c = { key, items: [] }
      categories.push(c)
    }
    c.items.push(r)
  })
  categories.forEach((c, ci) => {
    c.no = ci + 1
    c.items.forEach((r, i) => {
      ruleNo[r.id] = `${ci + 1}.${i + 1}`
    })
    const root =
      c.items.find((i) => !sectionOf(i[TYPE_COL]).includes('.')) || c.items[0]
    c.title = c.key === 'other' ? 'Бусад дүрэм' : cleanTitle(root[TYPE_COL])
    c.sub = c.items
      .filter((i) => i !== root)
      .slice(0, 3)
      .map((i) => cleanTitle(i[TYPE_COL]))
      .join(' · ')
  })
  const activeCat = categories.find((c) => c.key === category) || null
  const searching = query.trim() !== ''

  const renderRule = (r, idx) => {
    const isSaved = savedIds.has(`${TOPIC}-${r.id}`)
    const { def, example } = splitExample(r[DESC_COL])
    const chips = example ? exampleChips(example) : null
    return (
      <div key={r.id} className="panel st-card" style={{ '--i': Math.min(idx, 8) }}>
        <div className="st-head">
          <p className="st-title">{cleanTitle(r[TYPE_COL])}</p>
          <div className="st-right">
            <span className="st-sec">{ruleNo[r.id]}</span>
            <button
              type="button"
              className={`st-save ${isSaved ? 'on' : ''}`}
              onClick={() => toggleSave(r)}
              aria-label={isSaved ? 'Хадгалснаас хасах' : 'Хадгалах'}
              aria-pressed={isSaved}
              title={isSaved ? 'Хадгалснаас хасах' : 'Хадгалах'}
            >
              <Bookmark size={18} aria-hidden />
            </button>
          </div>
        </div>

        <p className="st-desc">{def}</p>

        {example && (
          <div className="st-ex">
            <div className="st-ex-h">
              <Lightbulb size={16} aria-hidden />
              Жишээ
            </div>
            {chips ? (
              <div className="st-ex-chips">
                {chips.map((c, i) => (
                  <span key={i} className="st-chip">
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <p className="st-ex-text">{example}</p>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <AppShell userName="">
      <style>{css}</style>

      <div className="sx" id="st-top" style={{ scrollMarginTop: 12 }}>
        <Link href="/myclass/lessons" className="st-back">
          <ArrowLeft className="st-arl" size={16} aria-hidden />
          Хичээлүүд рүү буцах
        </Link>

        <div className="top">
          <div>
            <h1 className="st-h1">
              <span className="st-hico">
                <PenLine size={24} aria-hidden />
              </span>
              Зөв бичих дүрэм
            </h1>
            <p className="lead">
              {mode === 'study'
                ? 'Ангиллаа сонгоод дүрмүүдийг уншаарай'
                : 'Тайлбарт тохирох дүрмийг сонго'}
            </p>
          </div>
        </div>

        {error && (
          <div className="panel st-state" style={{ color: '#ef4444', fontWeight: 700 }}>
            <TriangleAlert size={20} aria-hidden />
            {error}
          </div>
        )}

        {loading && (
          <div className="panel st-state" style={{ padding: '40px' }}>
            <Loader2 className="st-spin" size={20} aria-hidden />
            <span style={{ color: 'var(--mute)', fontWeight: 700 }}>
              Дасгалуудыг ачаалж байна...
            </span>
          </div>
        )}

        {ready && (
          <div className="st-tabs">
            <button
              onClick={showStudy}
              className={`st-tab ${mode === 'study' ? 'on' : ''}`}
            >
              <BookOpen size={16} aria-hidden />
              Дүрэм үзэх
            </button>
            <button
              onClick={startQuiz}
              className={`st-tab ${mode === 'quiz' ? 'on' : ''}`}
            >
              <ClipboardCheck size={16} aria-hidden />
              Шалгалт
            </button>
          </div>
        )}

        {/* ---------- Study ---------- */}
        {ready && mode === 'study' && (
          <>
            {/* search is shown on the category list */}
            {!activeCat && (
              <>
                <div className="st-search">
                  <Search size={18} aria-hidden />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Дүрэм хайх"
                    aria-label="Дүрэм хайх"
                  />
                </div>
                <p className="st-count">
                  <ListChecks size={14} aria-hidden />
                  {searching
                    ? `${filtered.length} / ${rows.length} дүрэм`
                    : `${categories.length} ангилал · ${rows.length} дүрэм`}
                </p>
              </>
            )}

            {/* 1) search results (flat list) */}
            {!activeCat && searching && (
              <div className="st-rules">
                {filtered.map((r, idx) => renderRule(r, idx))}
                {filtered.length === 0 && (
                  <div className="panel st-state">
                    <SearchX size={20} aria-hidden />
                    Дүрэм олдсонгүй. Өөр түлхүүр үгээр хайгаарай.
                  </div>
                )}
              </div>
            )}

            {/* 2) category cards */}
            {!activeCat && !searching && (
              <div className="st-cats">
                {categories.map((c, idx) => (
                  <button
                    key={c.key}
                    type="button"
                    className="st-cat"
                    style={{ '--i': Math.min(idx, 10) }}
                    onClick={() => setCategory(c.key)}
                  >
                    <span className="st-ghost" aria-hidden>
                      {c.no}
                    </span>
                    <span className="st-catnum">
                      {c.no}
                    </span>
                    <h3>{c.title}</h3>
                    {c.sub && <p className="st-cat-sub">{c.sub}</p>}
                    <span className="st-cat-foot">
                      <span className="st-pill">
                        <Layers size={14} aria-hidden />
                        {c.items.length} дүрэм
                      </span>
                      <span className="st-go">
                        <ArrowRight size={18} aria-hidden />
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* 3) rules inside the opened category */}
            {activeCat && (
              <>
                <button type="button" className="st-btn" onClick={() => setCategory(null)}>
                  <ArrowLeft size={16} aria-hidden />
                  Бүх ангилал
                </button>

                <div className="st-cathead">
                  <span className="st-catnum">
                    {activeCat.no}
                  </span>
                  <div>
                    <h2>{activeCat.title}</h2>
                    <span className="st-pill">{activeCat.items.length} дүрэм</span>
                  </div>
                </div>

                <div className="st-rules">
                  {activeCat.items.map((r, idx) => renderRule(r, idx))}
                </div>
              </>
            )}
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
                <Link href="/myclass/mistakes" className="st-btn">
                  <CircleAlert size={16} aria-hidden />
                  Алдсанаа харах
                </Link>
                <button
                  type="button"
                  onClick={showStudy}
                  className="st-btn"
                >
                  <BookOpen size={16} aria-hidden />
                  Дүрэм үзэх
                </button>
              </>
            }
          />
        )}
      </div>
    </AppShell>
  )
}