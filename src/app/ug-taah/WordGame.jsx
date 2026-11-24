'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Delete, Share2, Loader2, Check, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'
import { fetchWordRows } from '@/lib/fetchWordRows'
import { seededShuffle } from '@/lib/seeded'
import { useStoredJSON, saveStoredJSON } from '@/lib/useStoredJSON'
import AppShell from '../myclass/components/AppShell'
import LevelCards, { pixelFont } from '../myclass/components/LevelCards'

// "Үг таах": guess the hidden Mongolian word in 6 tries, across 30 fixed levels.
// Words come from the word_corrections table (correct spellings), so every answer is a real word
// with a meaning that is shown after the round.

const MN_WORD = /^[абвгдеёжзийклмноөпрстуүфхцчшщъыьэюя]+$/
const ALPHABET = new Set('абвгдеёжзийклмноөпрстуүфхцчшщъыьэюя')
const MAX_TRIES = 6
const LENGTHS = [5, 6]
const STATS_KEY = 'ugtaah:v1:stats'

// Mongolian keyboard layout
const ROWS = [
  ['ф', 'ц', 'у', 'ж', 'э', 'н', 'г', 'ш', 'ү', 'з', 'к', 'ъ'],
  ['й', 'ы', 'б', 'ө', 'а', 'х', 'р', 'о', 'л', 'д', 'п', 'е'],
  ['enter', 'я', 'ч', 'ё', 'с', 'м', 'и', 'т', 'ь', 'в', 'ю', 'щ', 'back'],
]

const RANK = { absent: 1, present: 2, correct: 3 }
const EMOJI = { correct: '🟩', present: '🟨', absent: '⬜' }

const letters = (s) => Array.from(s)

// Two passes so repeated letters are coloured correctly
function score(guess, answer) {
  const g = letters(guess)
  const a = letters(answer)
  const res = Array(g.length).fill('absent')
  const left = {}
  a.forEach((ch, i) => {
    if (g[i] === ch) res[i] = 'correct'
    else left[ch] = (left[ch] || 0) + 1
  })
  g.forEach((ch, i) => {
    if (res[i] !== 'correct' && left[ch] > 0) {
      res[i] = 'present'
      left[ch]--
    }
  })
  return res
}

const readJSON = (k, fallback) => {
  try {
    const v = localStorage.getItem(k)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}
const writeJSON = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v))
  } catch {}
}

const EMPTY_STATS = { played: 0, won: 0, streak: 0, best: 0, dist: [0, 0, 0, 0, 0, 0] }

// Load every row and group clean words by length
async function loadWords() {
  const rows = await fetchWordRows()
  const byLen = {}
  const seen = new Set()
  for (const r of rows) {
    const w = (r.correct_version || '').trim().toLowerCase()
    if (!MN_WORD.test(w) || seen.has(w)) continue
    const n = letters(w).length
    if (!LENGTHS.includes(n)) continue
    seen.add(w)
    ;(byLen[n] ||= []).push({ w, m: (r.meaning || '').trim() })
  }
  for (const n of Object.keys(byLen)) byLen[n].sort((x, y) => x.w.localeCompare(y.w))
  return byLen
}

const css = `
.ut-back{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:999px;border:2px solid #e2e8f0;color:#334155;font-weight:800;font-size:13px;text-decoration:none}
.ut-back:hover{border-color:#0284c7;color:#0284c7}
.ut-lvhead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px}
.ut-lvtag{padding:6px 12px;border-radius:999px;background:#e0f2fe;color:#0369a1;font-weight:800;font-size:13px}
.ut-list-head{margin-bottom:18px}
.ut-list-head h1{margin:0;font-size:clamp(20px,3vw,28px);font-weight:400;color:#0c4a6e;text-shadow:3px 3px 0 #bae6fd}
.ut-list-head p{margin:6px 0 0;color:#64748b;font-weight:600}
/* tighter panel padding on this page so the game fits one screen */
.app .wrap:has(.ut){padding-top:clamp(14px,2.4vh,28px);padding-bottom:12px}
.ut{max-width:520px;margin:0 auto;text-align:center}
.ut-head h1{margin:0;font-size:clamp(26px,4vw,34px);font-weight:900;color:#0c4a6e}
.ut-head p{margin:6px 0 0;color:#64748b;font-weight:600;font-size:14px}
.ut-tabs{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin:clamp(8px,1.6vh,16px) 0 0}
.ut-seg{display:inline-flex;padding:4px;border-radius:999px;background:#e0f2fe}
.ut-seg button{display:inline-flex;align-items:center;gap:6px;border:0;background:transparent;padding:7px 14px;border-radius:999px;font:inherit;font-size:13px;font-weight:800;color:#0369a1;cursor:pointer}
.ut-seg button.on{background:#0284c7;color:#fff;box-shadow:0 4px 10px rgba(2,132,199,.3)}
.ut-board-wrap{position:relative;margin:clamp(12px,2.4vh,22px) auto 0;width:fit-content}
.ut-board{display:grid;gap:7px;padding:16px;border-radius:24px;background:#f0f9ff;border:2px solid #bae6fd}
.ut-row{display:grid;gap:7px}
.ut-row.shake{animation:ut-shake .45s ease}
.ut-t{width:clamp(38px,min(12vw,5.6vh),56px);aspect-ratio:1;line-height:1;overflow:hidden;display:grid;place-items:center;border-radius:12px;border:2px solid #cbd5e1;background:#fff;font-size:clamp(22px,5.5vw,28px);font-weight:900;color:#0f172a;text-transform:uppercase;user-select:none}
.ut-t.filled{border-color:#0284c7;animation:ut-pop .12s ease}
.ut-t.correct,.ut-t.present,.ut-t.absent{color:#fff;border-color:transparent}
.ut-t.correct{background:#22c55e}
.ut-t.present{background:#f59e0b}
.ut-t.absent{background:#94a3b8}
.ut-t.rev{animation:ut-flip .5s ease both;animation-delay:var(--d)}
.ut-t.rev.correct,.ut-t.rev.present,.ut-t.rev.absent{transition:background 0s calc(var(--d) + .25s),color 0s calc(var(--d) + .25s)}
.ut-toast{position:fixed;top:84px;left:50%;transform:translateX(-50%);z-index:30;padding:10px 18px;border-radius:12px;background:#0f172a;color:#fff;font-weight:800;font-size:14px;animation:ut-in .2s ease}
.ut-kb{display:grid;gap:6px;margin:clamp(10px,2vh,20px) auto 0;max-width:520px}
.ut-kr{display:flex;gap:4px;justify-content:center}
.ut-k{flex:1;min-width:0;height:clamp(40px,6vh,52px);border:0;border-radius:10px;background:#e2e8f0;color:#0f172a;font:inherit;font-size:clamp(14px,3.6vw,18px);font-weight:800;text-transform:uppercase;cursor:pointer;display:grid;place-items:center;transition:transform .08s,background .2s}
.ut-k:active{transform:scale(.94)}
.ut-k.wide{flex:1.6;font-size:12px;text-transform:none;background:#0284c7;color:#fff}
.ut-enter-ic{display:none}
.ut-k.correct{background:#22c55e;color:#fff}
.ut-k.present{background:#f59e0b;color:#fff}
.ut-k.absent{background:#94a3b8;color:#fff}
.ut-end{margin:clamp(10px,2vh,18px) auto 0;padding:14px 16px;border-radius:24px;background:#fff;border:2px solid #e2e8f0;box-shadow:0 14px 30px rgba(2,132,199,.12);animation:ut-rise .35s ease}
.ut-end h2{margin:0;font-size:20px;font-weight:900}
.ut-end .ans{margin:2px 0;font-size:24px;font-weight:900;letter-spacing:.08em;color:#0284c7;text-transform:uppercase}
.ut-end .mean{margin:0 0 8px;color:#475569;font-size:13px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ut-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:8px 0 12px}
.ut-stats div{padding:6px 4px;border-radius:14px;background:#f0f9ff}
.ut-stats b{display:block;font-size:19px;font-weight:900;color:#0c4a6e}
.ut-stats small{font-size:11px;font-weight:700;color:#64748b}
.ut-acts{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.ut-btn{text-decoration:none;display:inline-flex;align-items:center;gap:8px;padding:11px 20px;border-radius:999px;border:0;font:inherit;font-size:14px;font-weight:800;cursor:pointer;background:#0284c7;color:#fff}
.ut-btn.ghost{background:#e0f2fe;color:#0369a1}
.ut-state{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:60px;color:#64748b;font-weight:700}
.ut-spin{animation:ut-spin 1s linear infinite}
@keyframes ut-pop{50%{transform:scale(1.1)}}
@keyframes ut-flip{0%{transform:rotateX(0)}50%{transform:rotateX(90deg)}100%{transform:rotateX(0)}}
@keyframes ut-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
@keyframes ut-in{from{opacity:0;transform:translate(-50%,-6px)}to{opacity:1}}
@keyframes ut-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes ut-spin{to{transform:rotate(360deg)}}
.ut.done .ut-t{width:clamp(26px,min(10vw,4vh),48px);font-size:clamp(14px,2.4vh,22px);border-radius:9px}
@media (max-width:420px){.ut-k{height:clamp(38px,5.6vh,46px)}.ut-kr{gap:3px}.ut-board{padding:12px;gap:6px}.ut-row{gap:6px}}
@media (max-width:420px){
  .ut-tabs{gap:6px;flex-wrap:nowrap}
  .ut-seg button svg{display:none}
  .ut-seg button{padding:7px 11px}
  .ut-enter-txt{display:none}
  .ut-enter-ic{display:block}
}
@media (max-height:760px){
  .ut-head p{display:none}
  .ut.done .ut-t{width:clamp(22px,3.6vh,44px)}
  .ut.done .ut-end{margin-top:6px}
  .ut-end{padding:10px 14px}
  .ut-end h2{font-size:17px}
  .ut-end .ans{font-size:20px}
  .ut-stats{margin:6px 0 10px;gap:6px}
  .ut-stats div{padding:4px 2px}
  .ut-stats b{font-size:16px}
  .ut-stats small{font-size:10px}
  .ut-btn{padding:9px 16px}
}
@media (prefers-reduced-motion:reduce){.ut *{animation:none!important;transition:none!important}}
`

// Levels 1–15 use 5-letter words, 16–30 use 6-letter words.
// The order is a fixed (seeded) shuffle, so each level always has the same word.
const LEVELS = 30
const levelLen = (n) => (n <= 15 ? 5 : 6)
const DONE_KEY = 'ugtaah:v2:done'
const levelKey = (n) => `ugtaah:v2:level:${n}`

function levelWord(words, n) {
  const len = levelLen(n)
  const order = seededShuffle(words[len] || [], len * 7919)
  if (order.length === 0) return null
  return order[(n <= 15 ? n - 1 : n - 16) % order.length]
}

// levelParam comes from ?level= in the address (read by page.jsx on the server)
export default function WordGame({ levelParam }) {
  const raw = Number(levelParam)
  const level = Number.isInteger(raw) && raw >= 1 && raw <= LEVELS ? raw : null
  const [words, setWords] = useState(null)
  const [error, setError] = useState('')
  const done = useStoredJSON(DONE_KEY)

  useEffect(() => {
    let alive = true
    loadWords()
      .then((byLen) => alive && setWords(byLen))
      .catch((e) => alive && setError(e.message || 'Үг ачаалж чадсангүй.'))
    return () => {
      alive = false
    }
  }, [])

  return (
    <AppShell userName="y/n">
      <style>{css}</style>
      {level ? (
        words ? (
          <Level key={level} level={level} words={words} />
        ) : (
          <div className="ut">
            <div className="ut-state" style={error ? { color: '#ef4444' } : undefined}>
              {error || (
                <>
                  <Loader2 className="ut-spin" size={20} aria-hidden /> Үг ачаалж байна...
                </>
              )}
            </div>
          </div>
        )
      ) : (
        <div>
          <div className="ut-list-head">
            <h1 className={pixelFont.className}>Үг таах</h1>
            <p>Түвшингээ сонгоод нууц үгийг {MAX_TRIES} оролдлогоор тааж үзээрэй</p>
          </div>
          <LevelCards
            count={LEVELS}
            hrefFor={(n) => `/ug-taah?level=${n}`}
            info={(n) => ({ badge: `${levelLen(n)} ҮСЭГ`, sub: n <= 15 ? 'Хялбар' : 'Хэцүү', tier: n <= 15 ? 'easy' : 'hard' })}
            done={done}
            stars={(tries) => (tries <= 2 ? 3 : tries <= 4 ? 2 : 1)}
            icon="tiles"
          />
        </div>
      )}
    </AppShell>
  )
}

function Level({ level, words }) {
  const len = levelLen(level)
  const [answer] = useState(() => levelWord(words, level))
  const [guesses, setGuesses] = useState(() => readJSON(levelKey(level), []))
  const [current, setCurrent] = useState('')
  const [status, setStatus] = useState(() => {
    const saved = readJSON(levelKey(level), [])
    const a = levelWord(words, level)
    return a && saved.includes(a.w) ? 'won' : saved.length >= MAX_TRIES ? 'lost' : 'playing'
  })
  const [revealRow, setRevealRow] = useState(-1)
  const [shake, setShake] = useState(false)
  const [toast, setToast] = useState('')
  const [stats, setStats] = useState(() => readJSON(STATS_KEY, EMPTY_STATS))
  const toastTimer = useRef(null)

  const flash = useCallback((msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 1600)
  }, [])

  const recordResult = useCallback(
    (won, tries) => {
      setStats((s) => {
        const next = {
          played: s.played + 1,
          won: s.won + (won ? 1 : 0),
          streak: won ? s.streak + 1 : 0,
          best: Math.max(s.best, won ? s.streak + 1 : 0),
          dist: s.dist.map((v, i) => (won && i === tries - 1 ? v + 1 : v)),
        }
        writeJSON(STATS_KEY, next)
        return next
      })
      if (won) saveStoredJSON(DONE_KEY, { ...readJSON(DONE_KEY, {}), [level]: tries })
    },
    [level]
  )

  const submit = useCallback(() => {
    if (status !== 'playing' || !answer) return
    if (letters(current).length !== len) {
      setShake(true)
      setTimeout(() => setShake(false), 450)
      flash(`${len} үсэг оруулна уу`)
      return
    }
    const next = [...guesses, current]
    setGuesses(next)
    setCurrent('')
    setRevealRow(next.length - 1)
    writeJSON(levelKey(level), next)
    const won = current === answer.w
    if (won || next.length >= MAX_TRIES) {
      // wait for the tiles to finish flipping before showing the result
      setTimeout(() => {
        setStatus(won ? 'won' : 'lost')
        recordResult(won, next.length)
      }, len * 120 + 500)
    }
  }, [status, answer, current, len, guesses, level, flash, recordResult])

  const retry = () => {
    writeJSON(levelKey(level), [])
    setGuesses([])
    setCurrent('')
    setRevealRow(-1)
    setStatus('playing')
  }

  const press = useCallback(
    (key) => {
      if (status !== 'playing' || !answer) return
      if (key === 'enter') return submit()
      if (key === 'back') return setCurrent((c) => letters(c).slice(0, -1).join(''))
      if (ALPHABET.has(key)) setCurrent((c) => (letters(c).length < len ? c + key : c))
    },
    [status, answer, submit, len]
  )

  // Physical keyboard (works when the computer's keyboard is set to Mongolian)
  const pressRef = useRef(press)
  useEffect(() => {
    pressRef.current = press
  }, [press])
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Enter') pressRef.current('enter')
      else if (e.key === 'Backspace') pressRef.current('back')
      else pressRef.current(e.key.toLowerCase())
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Best colour seen so far for each key
  const keyState = useMemo(() => {
    const ks = {}
    if (!answer) return ks
    guesses.forEach((g, gi) => {
      if (gi === revealRow) return // keyboard updates after the row has flipped
      score(g, answer.w).forEach((st, i) => {
        const ch = letters(g)[i]
        if (!ks[ch] || RANK[st] > RANK[ks[ch]]) ks[ch] = st
      })
    })
    return ks
  }, [guesses, answer, revealRow])

  // Let the keyboard catch up once the latest row has flipped
  useEffect(() => {
    if (revealRow < 0) return
    const t = setTimeout(() => setRevealRow(-1), len * 120 + 500)
    return () => clearTimeout(t)
  }, [revealRow, len])

  const share = async () => {
    const lines = guesses.map((g) => score(g, answer.w).map((s) => EMOJI[s]).join(''))
    const head = `Судартан · Үг таах · Түвшин ${level} · ${status === 'won' ? guesses.length : 'X'}/${MAX_TRIES}`
    try {
      await navigator.clipboard.writeText(`${head}\n${lines.join('\n')}`)
      flash('Хуулагдлаа!')
    } catch {
      flash('Хуулж чадсангүй')
    }
  }

  const winRate = stats.played ? Math.round((stats.won / stats.played) * 100) : 0

  return (
    <div className={`ut ${status !== 'playing' ? 'done' : ''}`}>
      <div className="ut-lvhead">
        <Link href="/ug-taah" className="ut-back">
          <ArrowLeft size={15} aria-hidden /> Түвшингүүд
        </Link>
        <span className="ut-lvtag">{len} үсэг</span>
      </div>
      <div className="ut-head">
        <h1>Түвшин {level}</h1>
        <p>Нууц үгийг {MAX_TRIES} оролдлогоор тааж үзээрэй</p>
      </div>

      {!answer && <div className="ut-state">{len} үсэгтэй үг олдсонгүй.</div>}

      {answer && (
        <div className="ut-board-wrap">
          <div className="ut-board" role="grid" aria-label="Тоглоомын талбар">
            {Array.from({ length: MAX_TRIES }, (_, r) => {
              const g = guesses[r]
              const isCurrent = r === guesses.length && status === 'playing'
              const chars = letters(g ?? (isCurrent ? current : ''))
              const res = g ? score(g, answer.w) : null
              return (
                <div
                  key={r}
                  className={`ut-row ${isCurrent && shake ? 'shake' : ''}`}
                  style={{ gridTemplateColumns: `repeat(${len}, 1fr)` }}
                  role="row"
                >
                  {Array.from({ length: len }, (_, i) => {
                    const ch = chars[i] || ''
                    let cls = 'ut-t'
                    if (res) cls += ` ${res[i]}${r === revealRow ? ' rev' : ''}`
                    else if (ch) cls += ' filled'
                    return (
                      <div key={i} className={cls} style={{ '--d': `${i * 0.12}s` }} role="gridcell">
                        {ch}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {answer && status !== 'playing' && (
        <div className="ut-end" role="status">
          <h2>{status === 'won' ? ['Гайхалтай!', 'Мундаг!', 'Сайн байна!'][guesses.length % 3] : 'Дараагийн удаа!'}</h2>
          <div className="ans">{answer.w}</div>
          {answer.m && <p className="mean">{answer.m}</p>}
          <div className="ut-stats">
            <div><b>{stats.played}</b><small>Тоглосон</small></div>
            <div><b>{winRate}%</b><small>Ялалт</small></div>
            <div><b>{stats.streak}</b><small>Цуврал</small></div>
            <div><b>{stats.best}</b><small>Шилдэг</small></div>
          </div>
          <div className="ut-acts">
            {status === 'won' ? (
              level < LEVELS ? (
                <Link href={`/ug-taah?level=${level + 1}`} className="ut-btn">
                  Дараагийн түвшин <ArrowRight size={16} aria-hidden />
                </Link>
              ) : (
                <Link href="/ug-taah" className="ut-btn">
                  Бүх түвшин
                </Link>
              )
            ) : (
              <button className="ut-btn" onClick={retry}>
                <RotateCcw size={16} aria-hidden /> Дахин оролдох
              </button>
            )}
            <button className="ut-btn ghost" onClick={share}>
              <Share2 size={16} aria-hidden /> Хуваалцах
            </button>
          </div>
        </div>
      )}

      {answer && status === 'playing' && (
        <div className="ut-kb" aria-label="Гар">
          {ROWS.map((row, ri) => (
            <div key={ri} className="ut-kr">
              {row.map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`ut-k ${k === 'enter' || k === 'back' ? 'wide' : keyState[k] || ''}`}
                  onClick={() => press(k)}
                  aria-label={k === 'enter' ? 'Шалгах' : k === 'back' ? 'Устгах' : k}
                >
                  {k === 'enter' ? (
                    <>
                      <span className="ut-enter-txt">Шалгах</span>
                      <Check className="ut-enter-ic" size={20} aria-hidden />
                    </>
                  ) : k === 'back' ? (
                    <Delete size={20} aria-hidden />
                  ) : (
                    k
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {toast && <div className="ut-toast">{toast}</div>}
    </div>
  )
}
