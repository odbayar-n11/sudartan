'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  ClipboardCheck,
  CircleAlert,
  Feather,
  Search,
  SearchX,
  Bookmark,
  Loader2,
  TriangleAlert,
  ListChecks,
  Lightbulb,
  Tag,
  Info,
} from 'lucide-react'
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
.sx{--tone:#7c4dcc;--tone-bg:rgba(124,77,204,.15)}
.sx{width:100%;min-width:0;box-sizing:border-box;align-self:stretch;text-align:left}
.sx .top,.sx .lead{text-align:left;justify-content:flex-start}
.st-card{min-width:0}
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

.st-list{display:grid;gap:16px}
.st-card{position:relative;overflow:hidden;padding-left:26px;animation:st-rise .55s cubic-bezier(.2,.7,.2,1) backwards;animation-delay:calc(var(--i,0)*60ms);transition:transform .25s ease,box-shadow .25s ease}
.st-card::before{content:"";position:absolute;left:0;top:0;bottom:0;width:6px;background:linear-gradient(180deg,var(--tone),color-mix(in srgb,var(--tone) 40%,#fff));transform-origin:top;animation:st-grow .6s cubic-bezier(.2,.7,.2,1) backwards;animation-delay:calc(var(--i,0)*60ms + .15s)}
.st-card:hover{transform:translateY(-4px);box-shadow:0 14px 30px color-mix(in srgb,var(--tone) 22%,transparent)}

.st-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:12px}
.st-title{font-size:clamp(20px,2.2vw,24px);font-weight:800;line-height:1.3;margin:0;overflow-wrap:anywhere}
.st-desc{margin:0;max-width:75ch;font-size:clamp(16.5px,1.7vw,18px);font-weight:500;line-height:1.75}

.ux-mark{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:16px}
.ux-mark-l{display:inline-flex;align-items:center;gap:6px;margin-right:2px;font-size:14px;font-weight:800;color:var(--tone)}
.st-chip{padding:6px 14px;border-radius:999px;background:#fff;color:#14263a;border:1px solid color-mix(in srgb,var(--tone) 30%,transparent);font-size:16px;font-weight:700;line-height:1.4;overflow-wrap:anywhere}

.st-ex{margin-top:16px;padding:14px 16px;border-radius:16px;background:var(--tone-bg);border:1px solid color-mix(in srgb,var(--tone) 25%,transparent)}
.st-ex-h{display:flex;align-items:center;gap:8px;margin-bottom:10px;font-size:14px;font-weight:800;color:var(--tone)}
.ux-items{display:grid;gap:8px}
.ux-item{padding:12px 14px;border-radius:12px;background:#fff;color:#14263a;border-left:4px solid var(--tone);font-size:clamp(16px,1.6vw,17.5px);font-weight:600;line-height:1.6;overflow-wrap:anywhere}
.ux-note{display:flex;align-items:flex-start;gap:6px;margin-top:6px;font-size:14px;font-weight:500;line-height:1.5;opacity:.7}
.ux-note svg{flex-shrink:0;margin-top:2px}

.st-save{flex-shrink:0;width:38px;height:38px;border-radius:50%;border:2px solid rgba(128,128,128,.3);background:transparent;color:inherit;cursor:pointer;display:grid;place-items:center;opacity:.75;transition:background .2s,border-color .2s,color .2s,transform .15s,opacity .2s}
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

@media (max-width:600px){.st-card{padding:14px 14px 14px 22px}.st-h1{font-size:28px}}

@media (prefers-reduced-motion:reduce){
  .sx *,.sx *::before{animation:none!important;transition:none!important}
}
`

// Safe version that handles null, undefined, or non-string inputs
const splitMarkers = (m) => {
  if (!m || typeof m !== 'string') return []
  return m
    .split(/\s*[,;]\s*/)
    .map((x) => x.trim())
    .filter(Boolean)
}

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
        // A link with ?mode=quiz starts right away
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

      <div className="sx">
        <Link href="/myclass/lessons" className="st-back">
          <ArrowLeft className="st-arl" size={16} aria-hidden />
          Хичээлүүд рүү буцах
        </Link>

        <div className="top">
          <div>
            <h1 className="st-h1">
              <span className="st-hico">
                <Feather size={24} aria-hidden />
              </span>
              Уран зохиол
            </h1>
            <p className="lead">
              {mode === 'study'
                ? 'Уран хэрэглүүрүүдийг уншаад шалгалт өгөөрэй'
                : 'Жишээ нь ямар уран хэрэглүүр болохыг ол'}
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
              onClick={() => setMode('study')}
              className={`st-tab ${mode === 'study' ? 'on' : ''}`}
            >
              <BookOpen size={16} aria-hidden />
              Хэрэглүүр үзэх
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
            <div className="st-search">
              <Search size={18} aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Хэрэглүүр хайх"
                aria-label="Хэрэглүүр хайх"
              />
            </div>
            <p className="st-count">
              <ListChecks size={14} aria-hidden />
              {filtered.length} / {devices.length} хэрэглүүр
            </p>

            <div className="st-list">
              {filtered.map((d, idx) => {
                const exs = examplesOf(d.name)
                const markers = splitMarkers(d.markers)
                const isSaved = savedIds.has(`${TOPIC}-${d.id}`)
                return (
                  <div
                    key={d.id}
                    className="panel st-card"
                    style={{ '--i': Math.min(idx, 8) }}
                  >
                    <div className="st-head">
                      <p className="st-title">{d.name}</p>
                      <button
                        type="button"
                        className={`st-save ${isSaved ? 'on' : ''}`}
                        onClick={() => toggleSave(d)}
                        aria-label={isSaved ? 'Хадгалснаас хасах' : 'Хадгалах'}
                        aria-pressed={isSaved}
                        title={isSaved ? 'Хадгалснаас хасах' : 'Хадгалах'}
                      >
                        <Bookmark size={18} aria-hidden />
                      </button>
                    </div>

                    <p className="st-desc">{d.definition}</p>

                    {markers.length > 0 && (
                      <div className="ux-mark">
                        <span className="ux-mark-l">
                          <Tag size={15} aria-hidden />
                          Хэлбэрийн үгс:
                        </span>
                        {markers.map((m, i) => (
                          <span key={i} className="st-chip">
                            {m}
                          </span>
                        ))}
                      </div>
                    )}

                    {exs.length > 0 && (
                      <div className="st-ex">
                        <div className="st-ex-h">
                          <Lightbulb size={16} aria-hidden />
                          Жишээ
                        </div>
                        <div className="ux-items">
                          {exs.map((e) => (
                            <div key={e.id} className="ux-item">
                              {e.example}
                              {e.note && (
                                <span className="ux-note">
                                  <Info size={14} aria-hidden />
                                  {e.note}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              {filtered.length === 0 && (
                <div className="panel st-state">
                  <SearchX size={20} aria-hidden />
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
                <Link href="/myclass/mistakes" className="st-btn">
                  <CircleAlert size={16} aria-hidden />
                  Алдсанаа харах
                </Link>
                <button
                  type="button"
                  onClick={() => setMode('study')}
                  className="st-btn"
                >
                  <BookOpen size={16} aria-hidden />
                  Хэрэглүүр үзэх
                </button>
              </>
            }
          />
        )}
      </div>
    </AppShell>
  )
}