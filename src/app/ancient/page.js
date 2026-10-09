'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AppShell from '../myclass/components/AppShell'

const TABLE = 'ancient_words'
const WORD_COL = 'word'
const MEANING_COL = 'meaning'

const GROUP_SIZE = 10

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Questions from one card's words. Show the meaning, pick the word out of 4.
// Wrong options come from all words.
function buildRound(group, allRows) {
  return shuffle(group).map((r) => {
    const wrong = [
      ...new Set(
        shuffle(allRows.filter((x) => x[WORD_COL] !== r[WORD_COL])).map(
          (x) => x[WORD_COL]
        )
      ),
    ].slice(0, 3)
    return {
      word: r[WORD_COL],
      meaning: r[MEANING_COL],
      options: shuffle([r[WORD_COL], ...wrong]),
    }
  })
}

export default function AncientPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [active, setActive] = useState(null) // index of the card being played
  const [questions, setQuestions] = useState([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
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

  const start = (gi) => {
    setActive(gi)
    setQuestions(buildRound(groups[gi], rows))
    setIdx(0)
    setSelected(null)
    setScore(0)
  }

  const finished =
    active !== null && questions.length > 0 && idx >= questions.length
  const q = questions[idx]

  const choose = (option) => {
    if (selected !== null) return
    setSelected(option)
    if (option === q.word) setScore((s) => s + 1)
  }

  const next = () => {
    if (idx + 1 === questions.length) {
      setBest((b) => ({ ...b, [active]: Math.max(b[active] ?? 0, score) }))
    }
    setSelected(null)
    setIdx((i) => i + 1)
  }

  const backToCards = () => {
    setActive(null)
    setQuestions([])
    setIdx(0)
    setSelected(null)
    setScore(0)
  }

  return (
    <AppShell userName="y/n">
      <style>{`
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 16px;
          padding: 8px 16px;
          border-radius: 999px;
          border: 2px solid rgba(128,128,128,.3);
          background: transparent;
          color: inherit;
          font-weight: 800;
          font-size: 14px;
          text-decoration: none;
          cursor: pointer;
        }
        .back-btn:hover { background: rgba(128,128,128,.12); }
        .qz-bar { height: 8px; border-radius: 999px; background: rgba(128,128,128,.25); overflow: hidden; margin: 12px 0 20px; }
        .qz-bar > div { height: 100%; background: #0284c7; transition: width .3s; }
        .qz-meta { display: flex; justify-content: space-between; font-weight: 800; font-size: 14px; }
        .qz-label { opacity: .7; font-size: 14px; margin: 0 0 4px; }
        .qz-prompt { font-size: 20px; font-weight: 800; line-height: 1.4; margin: 0 0 20px; }
        .qz-opts { display: grid; gap: 10px; }
        .qz-opt {
          width: 100%; text-align: left; padding: 14px 18px; border-radius: 16px;
          border: 2px solid rgba(128,128,128,.3); background: transparent; color: inherit;
          font-size: 16px; font-weight: 800; cursor: pointer; transition: all .2s;
        }
        .qz-opt:hover:not(:disabled) { background: rgba(128,128,128,.12); }
        .qz-opt:disabled { cursor: default; }
        .qz-opt.ok { background: rgba(34,197,94,.18); border-color: #22c55e; }
        .qz-opt.no { background: rgba(239,68,68,.18); border-color: #ef4444; }
        .qz-opt.dim { opacity: .5; }
        .qz-foot { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: 20px; }
        .qz-ok { color: #22c55e; font-weight: 800; }
        .qz-no { color: #ef4444; font-weight: 800; }
        .qz-score { font-size: 56px; font-weight: 900; margin: 8px 0; }
        .qz-actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
      `}</style>

      {/* Back button */}
      {active === null ? (
        <Link href="/myclass/lessons" className="back-btn">
          ← Хичээлүүд рүү буцах
        </Link>
      ) : (
        <button onClick={backToCards} className="back-btn">
          ← Картууд руу буцах
        </button>
      )}

      {/* Header Banner */}
      <div className="top">
        <div>
          <h1>Эртний үг</h1>
          <p className="lead">
            {active === null
              ? 'Картаа сонгоод 10 үгийн дасгал хийгээрэй'
              : 'Тайлбарт тохирох үгийг сонго'}
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

      {/* ---------- Cards ---------- */}
      {!loading && !error && active === null && (
        <>
          <h2 className="sec">
            <span className="ib" aria-hidden="true">📜</span> Боломжит дасгалууд
          </h2>

          <div className="cards">
            {groups.map((g, gi) => (
              <div key={gi} className="tcard">
                <span className="st a tcard-badge">{g.length} үг</span>
                <div className="tcard-ic">📜</div>
                <h3>Карт {gi + 1}</h3>
                <p>
                  {g
                    .slice(0, 5)
                    .map((w) => w[WORD_COL])
                    .join(', ')}
                  {g.length > 5 ? '...' : ''}
                </p>
                {best[gi] !== undefined && (
                  <p style={{ fontWeight: 800 }}>
                    Шилдэг: {best[gi]} / {g.length}
                  </p>
                )}
                <div className="tcard-foot">
                  <button
                    onClick={() => start(gi)}
                    className="btn"
                    style={{ width: '100%', textAlign: 'center', marginTop: '10px' }}
                  >
                    Эхлэх →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ---------- Quiz ---------- */}
      {active !== null && q && !finished && (
        <div className="panel">
          <div className="qz-meta">
            <span>
              Карт {active + 1} · {idx + 1} / {questions.length}
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
              const isCorrect = opt === q.word
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
              <span className={selected === q.word ? 'qz-ok' : 'qz-no'}>
                {selected === q.word ? 'Зөв!' : 'Буруу.'}
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
          <p style={{ color: 'var(--mute)', fontWeight: 700 }}>
            Карт {active + 1} · Таны дүн
          </p>
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
            <button onClick={() => start(active)} className="btn">
              Дахин тоглох
            </button>
            <button onClick={backToCards} className="back-btn" style={{ marginBottom: 0 }}>
              Картууд руу буцах
            </button>
          </div>
        </div>
      )}
    </AppShell>
  )
}