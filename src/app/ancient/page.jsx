'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ScrollText,
  Layers,
  Trophy,
  Play,
  ArrowRight,
  CircleAlert,
  Loader2,
  TriangleAlert,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { saveMistake } from '@/lib/saveMistake'
import { buildMixedRound } from '@/lib/quizBuilders'
import AppShell from '../myclass/components/AppShell'
import DuoQuiz from '../myclass/components/DuoQuiz'

const TABLE = 'ancient_words'
const WORD_COL = 'word'
const MEANING_COL = 'meaning'
const TOPIC = 'ancient'

const GROUP_SIZE = 10

const css = `
.st{--tone:#d9730d;--tone-bg:rgba(217,115,13,.16)}

.st{width:100%;min-width:0;box-sizing:border-box;align-self:stretch;text-align:left}
.st .top,.st .lead{text-align:left;justify-content:flex-start}
.st-card,.an-card{min-width:0}

.st-back,.st-btn{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:999px;border:2px solid rgba(128,128,128,.3);background:transparent;color:inherit;font-weight:800;font-size:14px;text-decoration:none;cursor:pointer;transition:background .2s,border-color .2s,transform .15s}
.st-back{margin-bottom:18px;animation:st-rise .5s backwards}
.st-back:hover,.st-btn:hover{background:rgba(128,128,128,.12);border-color:var(--tone)}
.st-arl{transition:transform .2s}
.st-back:hover .st-arl{transform:translateX(-4px)}
.st-back:active,.st-btn:active{transform:scale(.96)}
.st-back:focus-visible,.st-btn:focus-visible,.an-start:focus-visible{outline:3px solid var(--tone);outline-offset:3px}

.st-h1{display:flex;align-items:center;gap:12px}
.st-hico{display:grid;place-items:center;width:42px;height:42px;border-radius:14px;background:var(--tone-bg);color:var(--tone);animation:st-pop .6s cubic-bezier(.3,1.6,.5,1) backwards}

.st-sec-h{display:flex;align-items:center;gap:10px;margin:8px 0 18px;font-size:20px;font-weight:800;animation:st-rise .5s backwards}
.st-sec-h svg{color:var(--tone)}

/* ---------- Cards ---------- */
.an-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(260px,100%),1fr));gap:20px}
.an-card{position:relative;overflow:hidden;display:flex;flex-direction:column;min-height:240px;padding:24px;border-radius:28px;border:1px solid rgba(128,128,128,.22);background:rgba(128,128,128,.1);animation:st-rise .6s cubic-bezier(.2,.7,.2,1) backwards;animation-delay:calc(var(--i,0)*70ms + .1s);transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}
.an-card:hover{transform:translateY(-6px);border-color:var(--tone);box-shadow:0 16px 36px color-mix(in srgb,var(--tone) 28%,transparent)}
.an-ghost{position:absolute;right:-18px;bottom:-22px;color:var(--tone);opacity:.08;pointer-events:none;transition:transform .5s cubic-bezier(.2,.7,.2,1),opacity .3s}
.an-card:hover .an-ghost{transform:rotate(-10deg) scale(1.15);opacity:.14}
.an-badge{position:absolute;top:16px;right:18px;display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:999px;background:var(--tone-bg);color:var(--tone);font-size:12px;font-weight:800}
.an-ic{position:relative;width:56px;height:56px;border-radius:18px;display:grid;place-items:center;background:var(--tone-bg);color:var(--tone);margin-bottom:18px;transition:transform .3s cubic-bezier(.3,1.6,.5,1),background .25s,color .25s}
.an-card:hover .an-ic{transform:rotate(-8deg) scale(1.1);background:var(--tone);color:#fff}
.an-name{position:relative;font-size:20px;font-weight:800;margin:0 0 8px}
.an-words{position:relative;margin:0 0 14px;font-size:16px;line-height:1.55;opacity:.75;overflow-wrap:anywhere}

.an-best{position:relative;margin:0 0 14px}
.an-best-top{display:flex;align-items:center;gap:6px;margin-bottom:6px;font-size:13px;font-weight:800;color:var(--tone);font-variant-numeric:tabular-nums}
.an-bar{height:8px;border-radius:999px;background:rgba(128,128,128,.2);overflow:hidden}
.an-bar span{display:block;height:100%;border-radius:999px;background:var(--tone);transition:width .8s cubic-bezier(.2,.7,.2,1)}

.an-start{position:relative;margin-top:auto;display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:11px 18px;border:0;border-radius:999px;background:var(--tone);color:#fff;font:inherit;font-size:15px;font-weight:800;cursor:pointer;box-shadow:0 6px 16px color-mix(in srgb,var(--tone) 35%,transparent);transition:transform .2s ease,box-shadow .2s ease}
.an-start:hover{transform:translateY(-2px);box-shadow:0 10px 22px color-mix(in srgb,var(--tone) 42%,transparent)}
.an-start:active{transform:scale(.97)}
.an-start .an-ar{transition:transform .2s}
.an-start:hover .an-ar{transform:translateX(4px)}

.st-state{display:flex;align-items:center;justify-content:center;gap:10px;text-align:center;animation:st-rise .5s backwards}
.st-spin{animation:st-spin 1s linear infinite}

@keyframes st-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes st-pop{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:scale(1)}}
@keyframes st-spin{to{transform:rotate(360deg)}}

@media (max-width:600px){.st-card{padding:14px 14px 14px 22px}.st-h1{font-size:28px}.an-card{padding:20px}}

@media (prefers-reduced-motion:reduce){
  .st *,.st *::before{animation:none!important;transition:none!important}
}
`

export default function AncientPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [active, setActive] = useState(null) // index of the card being played
  const [questions, setQuestions] = useState([])
  const [round, setRound] = useState(0) // changing this key resets <DuoQuiz>
  const [best, setBest] = useState({}) // best score per card this visit

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .order('id', { ascending: true })

      if (error) {
        setError(error.message)
      } else if (!data || data.length < 4) {
        setError(
          'Өгөгдөл олдсонгүй. Supabase дээр ancient_words хүснэгтэд SELECT (унших) policy нэмсэн эсэхээ шалгана уу.'
        )
      } else {
        setRows(data)
      }
      setLoading(false)
    }
    load()
  }, [])

  // Split into cards of 10 words
  const groups = []
  for (let i = 0; i < rows.length; i += GROUP_SIZE) {
    groups.push(rows.slice(i, i + GROUP_SIZE))
  }

  // 1 matching board + choice + typing questions from this card's words
  const start = (gi) => {
    const group = groups[gi]
    setActive(gi)
    setQuestions(
      buildMixedRound({
        rows: group,
        pool: rows,
        promptOf: (r) => r[MEANING_COL],
        answerOf: (r) => r[WORD_COL],
        idOf: (r) => r.id,
        total: group.length,
        explainOf: (r) => `«${r[WORD_COL]}» — ${r[MEANING_COL]}`,
      })
    )
    setRound((r) => r + 1)
  }

  const backToCards = () => {
    setActive(null)
    setQuestions([])
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

  const handleFinish = ({ correct }) => {
    setBest((b) => ({ ...b, [active]: Math.max(b[active] ?? 0, correct) }))
  }

  return (
    <AppShell userName="y/n">
      <style>{css}</style>

      <div className="st">
        {/* Back button */}
        {active === null ? (
          <Link href="/myclass/lessons" className="st-back">
            <ArrowLeft className="st-arl" size={16} aria-hidden />
            Хичээлүүд рүү буцах
          </Link>
        ) : (
          <button onClick={backToCards} className="st-back">
            <ArrowLeft className="st-arl" size={16} aria-hidden />
            Картууд руу буцах
          </button>
        )}

        {/* Header Banner */}
        <div className="top">
          <div>
            <h1 className="st-h1">
              <span className="st-hico">
                <ScrollText size={24} aria-hidden />
              </span>
              Эртний үг
            </h1>
            <p className="lead">
              {active === null
                ? 'Картаа сонгоод 10 үгийн дасгал хийгээрэй'
                : `Карт ${active + 1} · Сонго, бич, хосыг холбо`}
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

        {/* ---------- Cards ---------- */}
        {!loading && !error && active === null && (
          <>
            <h2 className="st-sec-h">
              <ScrollText size={22} aria-hidden />
              Боломжит дасгалууд
            </h2>

            <div className="an-grid">
              {groups.map((g, gi) => (
                <div key={gi} className="an-card" style={{ '--i': Math.min(gi, 8) }}>
                  <ScrollText
                    className="an-ghost"
                    size={150}
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <span className="an-badge">
                    <Layers size={12} aria-hidden />
                    {g.length} үг
                  </span>

                  <div className="an-ic">
                    <ScrollText size={26} aria-hidden />
                  </div>
                  <h3 className="an-name">Карт {gi + 1}</h3>
                  <p className="an-words">
                    {g
                      .slice(0, 5)
                      .map((w) => w[WORD_COL])
                      .join(', ')}
                    {g.length > 5 ? '...' : ''}
                  </p>

                  {best[gi] !== undefined && (
                    <div className="an-best">
                      <div className="an-best-top">
                        <Trophy size={14} aria-hidden />
                        Шилдэг: {best[gi]} / {g.length}
                      </div>
                      <div className="an-bar" aria-hidden>
                        <span style={{ width: `${(best[gi] / g.length) * 100}%` }} />
                      </div>
                    </div>
                  )}

                  <button onClick={() => start(gi)} className="an-start">
                    <Play size={16} aria-hidden />
                    Эхлэх
                    <ArrowRight className="an-ar" size={16} aria-hidden />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ---------- Quiz (Duolingo style, mixed question types) ---------- */}
        {active !== null && questions.length > 0 && (
          <DuoQuiz
            key={round}
            questions={questions}
            label="Утга:"
            promptSize={20}
            onAnswer={handleAnswer}
            onFinish={handleFinish}
            onRestart={() => start(active)}
            actions={
              <>
                <Link href="/myclass/mistakes" className="st-btn">
                  <CircleAlert size={16} aria-hidden />
                  Алдсанаа харах
                </Link>
                <button onClick={backToCards} className="st-btn">
                  <ArrowLeft size={16} aria-hidden />
                  Картууд руу буцах
                </button>
              </>
            }
          />
        )}
      </div>
    </AppShell>
  )
} 