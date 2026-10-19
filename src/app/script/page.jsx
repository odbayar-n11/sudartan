'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowLeftRight,
  BookOpen,
  ClipboardCheck,
  CircleAlert,
  PenTool,
  Search,
  SearchX,
  Loader2,
  TriangleAlert,
  ListChecks,
} from 'lucide-react'
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
.sx{--tone:#16a34a;--tone-bg:rgba(22,163,74,.16)}

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
.st-back:focus-visible,.st-btn:focus-visible,.st-tab:focus-visible{outline:3px solid var(--tone);outline-offset:3px}

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

.st-words{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(min(240px,100%),1fr))}
.st-card{position:relative;overflow:hidden;padding-left:26px;animation:st-rise .55s cubic-bezier(.2,.7,.2,1) backwards;animation-delay:calc(var(--i,0)*40ms);transition:transform .25s ease,box-shadow .25s ease}
.st-card::before{content:"";position:absolute;left:0;top:0;bottom:0;width:6px;background:linear-gradient(180deg,var(--tone),color-mix(in srgb,var(--tone) 40%,#fff));transform-origin:top;animation:st-grow .6s cubic-bezier(.2,.7,.2,1) backwards;animation-delay:calc(var(--i,0)*40ms + .15s)}
.st-card:hover{transform:translateY(-4px);box-shadow:0 14px 30px color-mix(in srgb,var(--tone) 22%,transparent)}
.st-main{font-size:24px;font-weight:800;margin:0 0 8px;word-break:break-word}
.st-sub{margin:0;font-size:17px;line-height:1.6;opacity:.85;overflow-wrap:anywhere}

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
          // A link with ?mode=quiz starts right away
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

      <div className="sx">
        <Link href="/myclass/lessons" className="st-back">
          <ArrowLeft className="st-arl" size={16} aria-hidden />
          Хичээлүүд рүү буцах
        </Link>

        <div className="top">
          <div>
            <h1 className="st-h1">
              <span className="st-hico">
                <PenTool size={24} aria-hidden />
              </span>
              Монгол бичиг
            </h1>
            <p className="lead">
              {mode === 'study'
                ? 'Үгсийг уншаад шалгалт өгөөрэй'
                : 'Сонго, бич, хосыг холбо — зөв хариултыг ол'}
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
              Үгс үзэх
            </button>
            <button
              onClick={() => startQuiz()}
              className={`st-tab ${mode === 'quiz' ? 'on' : ''}`}
            >
              <ClipboardCheck size={16} aria-hidden />
              Шалгалт
            </button>
            {mode === 'quiz' && (
              <button onClick={toggleFlip} className="st-tab">
                <ArrowLeftRight size={16} aria-hidden />
                Чиглэл солих
              </button>
            )}
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
                placeholder="Хайх"
                aria-label="Хайх"
              />
            </div>
            <p className="st-count">
              <ListChecks size={14} aria-hidden />
              {filtered.length} / {rows.length}
            </p>

            <div className="st-words">
              {filtered.map((r, idx) => (
                <div
                  key={r.id}
                  className="panel st-card"
                  style={{ '--i': Math.min(idx, 12) }}
                >
                  <p className="st-main">{String(r[cols.a])}</p>
                  <p className="st-sub">{String(r[cols.b])}</p>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="panel st-state" style={{ gridColumn: '1 / -1' }}>
                  <SearchX size={20} aria-hidden />
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
                  Үгс үзэх
                </button>
              </>
            }
          />
        )}
      </div>
    </AppShell>
  )
}