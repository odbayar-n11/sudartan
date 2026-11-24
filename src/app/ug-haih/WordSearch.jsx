'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Loader2, RotateCcw, Timer, PartyPopper, ArrowLeft, ArrowRight } from 'lucide-react'
import { fetchWordRows } from '@/lib/fetchWordRows'
import { seededRandom } from '@/lib/seeded'
import { useStoredJSON, saveStoredJSON } from '@/lib/useStoredJSON'
import AppShell from '../myclass/components/AppShell'
import LevelCards, { pixelFont } from '../myclass/components/LevelCards'

// "Үг хайх": find the hidden Mongolian words in a grid of letters, across 30 fixed levels.
// Words come from the word_corrections table; each found word shows its meaning.

const MN_WORD = /^[абвгдеёжзийклмноөпрстуүфхцчшщъыьэюя]+$/
const LEVELS = 30
const DONE_KEY = 'ughaih:v1:done'
// Difficulty grows with the level: bigger grid, more words
const levelSize = (n) => (n <= 10 ? 8 : 10)
const levelCount = (n) => (n <= 10 ? 5 : n <= 20 ? 7 : 9)
const levelName = (n) => (n <= 10 ? 'Хялбар' : n <= 20 ? 'Дунд' : 'Хэцүү')
const MIN_LEN = 3
const MAX_LEN = 8
const DIRS = [
  [0, 1], // across
  [1, 0], // down
  [1, 1], // diagonal down
  [-1, 1], // diagonal up
]
const COLORS = ['#7dd3fc', '#5eead4', '#fde68a', '#f9a8d4', '#fdba74', '#86efac', '#c4b5fd', '#fca5a5']

const letters = (s) => Array.from(s)

// Load every row and keep clean words of a usable length
async function loadWords() {
  const rows = await fetchWordRows()
  const seen = new Set()
  const out = []
  for (const r of rows) {
    const w = (r.correct_version || '').trim().toLowerCase()
    const n = letters(w).length
    if (!MN_WORD.test(w) || n < MIN_LEN || n > MAX_LEN || seen.has(w)) continue
    seen.add(w)
    out.push({ w, m: (r.meaning || '').trim() })
  }
  // stable order, so a level's seeded puzzle stays the same
  return out.sort((a, b) => a.w.localeCompare(b.w))
}

// Build a level's puzzle from a seeded random generator, so it is the same on every visit.
// Places up to `count` words, then fills the gaps with letters common in the word list.
function buildPuzzle(pool, level) {
  const rand = seededRandom(level * 104729 + 17)
  const randInt = (n) => Math.floor(rand() * n)
  const size = levelSize(level)
  const count = levelCount(level)
  const order = [...pool]
  for (let i = order.length - 1; i > 0; i--) {
    const j = randInt(i + 1)
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  const grid = Array.from({ length: size }, () => Array(size).fill(''))
  const placed = []
  for (const item of order) {
    if (placed.length >= count) break
    const L = letters(item.w)
    const n = L.length
    if (n > size) continue
    for (let attempt = 0; attempt < 150; attempt++) {
      const [dr, dc] = DIRS[randInt(DIRS.length)]
      const r0 = dr === 1 ? randInt(size - n + 1) : dr === -1 ? n - 1 + randInt(size - n + 1) : randInt(size)
      const c0 = dc === 1 ? randInt(size - n + 1) : randInt(size)
      const cells = L.map((_, i) => [r0 + dr * i, c0 + dc * i])
      if (cells.every(([r, c], i) => grid[r][c] === '' || grid[r][c] === L[i])) {
        cells.forEach(([r, c], i) => (grid[r][c] = L[i]))
        placed.push({ ...item, cells })
        break
      }
    }
  }
  const sample = letters(pool.slice(0, 400).map((x) => x.w).join(''))
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) if (!grid[r][c]) grid[r][c] = sample[randInt(sample.length)]
  return { grid, words: placed, size }
}

// Cells on the straight line from a to b, or null if a→b isn't across, down or diagonal
function lineCells(a, b) {
  const dr = Math.sign(b[0] - a[0])
  const dc = Math.sign(b[1] - a[1])
  const lr = Math.abs(b[0] - a[0])
  const lc = Math.abs(b[1] - a[1])
  if (!(lr === 0 || lc === 0 || lr === lc)) return null
  const n = Math.max(lr, lc) + 1
  return Array.from({ length: n }, (_, i) => [a[0] + dr * i, a[1] + dc * i])
}

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

const css = `
/* tighter panel padding on this page so the game fits one screen */
.app .wrap:has(.wh){padding-top:clamp(14px,2.4vh,28px);padding-bottom:12px}
.wh{--cell:clamp(28px,min(calc(82vw / var(--n)),calc(61vh / var(--n))),54px)}
.wh-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px}
.wh-back{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:999px;border:2px solid #e2e8f0;color:#334155;font-weight:800;font-size:13px;text-decoration:none}
.wh-back:hover{border-color:#0284c7;color:#0284c7}
.wh-list-head{margin-bottom:18px}
.wh-list-head h1{margin:0;font-size:clamp(20px,3vw,28px);font-weight:400;color:#0c4a6e;text-shadow:3px 3px 0 #bae6fd}
.wh-list-head p{margin:6px 0 0;color:#64748b;font-weight:600}
.wh-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:clamp(10px,2vh,18px)}
.wh-head h1{margin:0;font-size:clamp(26px,3.6vw,34px);font-weight:900;color:#0c4a6e}
.wh-head p{margin:4px 0 0;color:#64748b;font-weight:600;font-size:14px}
.wh-acts{display:flex;gap:8px;align-items:center}
.wh-chip{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:999px;background:#e0f2fe;color:#0369a1;font-weight:800;font-size:14px;font-variant-numeric:tabular-nums}
.wh-btn{text-decoration:none;display:inline-flex;align-items:center;gap:7px;padding:9px 16px;border-radius:999px;border:0;background:#0284c7;color:#fff;font:inherit;font-size:14px;font-weight:800;cursor:pointer}
.wh-btn:hover{background:#0369a1}
.wh-body{display:grid;grid-template-columns:auto minmax(0,1fr);gap:clamp(16px,3vw,32px);align-items:start}
.wh-board{position:relative;width:calc(var(--cell) * var(--n) + 24px);padding:12px;border-radius:22px;background:#fff;border:2px solid #e2e8f0;box-shadow:0 12px 28px rgba(2,132,199,.1);box-sizing:border-box;touch-action:none;user-select:none;-webkit-user-select:none}
.wh-svg{position:absolute;left:12px;top:12px;width:calc(var(--cell) * var(--n));height:calc(var(--cell) * var(--n));pointer-events:none}
.wh-grid{position:relative;display:grid;grid-template-columns:repeat(var(--n),var(--cell));grid-auto-rows:var(--cell)}
.wh-c{display:grid;place-items:center;font-size:calc(var(--cell) * .5);font-weight:900;color:#0f172a;text-transform:uppercase;cursor:pointer;line-height:1}
.wh-side{display:flex;flex-direction:column;gap:12px;min-width:0}
.wh-list{display:flex;flex-wrap:wrap;gap:8px}
.wh-w{padding:7px 12px;border-radius:12px;background:#f1f5f9;font-weight:800;font-size:15px;text-transform:uppercase;letter-spacing:.03em;color:#334155;transition:background .3s,color .3s}
.wh-w.found{background:var(--c);color:#0f172a;text-decoration:line-through;text-decoration-thickness:2px}
.wh-mean{padding:12px 14px;border-radius:16px;background:#f0f9ff;border:1.5px solid #bae6fd;font-size:14px;line-height:1.45;color:#334155;animation:wh-in .3s ease}
.wh-mean b{text-transform:uppercase;color:#0c4a6e}
.wh-win{padding:16px;border-radius:20px;background:#fff;border:2px solid #86efac;box-shadow:0 12px 28px rgba(34,197,94,.15);text-align:center;animation:wh-in .35s ease}
.wh-win h2{display:flex;align-items:center;justify-content:center;gap:8px;margin:0 0 4px;font-size:20px;font-weight:900;color:#15803d}
.wh-win p{margin:0 0 12px;color:#475569;font-weight:600}
.wh-state{display:flex;align-items:center;gap:10px;margin-top:40px;color:#64748b;font-weight:700}
.wh-spin{animation:wh-spin 1s linear infinite}
@keyframes wh-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes wh-spin{to{transform:rotate(360deg)}}
@media (max-width:900px){
  .wh-body{grid-template-columns:1fr;justify-items:center}
  .wh-side{width:100%;max-width:calc(var(--cell) * var(--n) + 24px)}
  .wh-list{justify-content:center}
  .wh-w{font-size:13px;padding:5px 10px}
}
@media (max-height:760px){.wh-head p{display:none}}
@media (prefers-reduced-motion:reduce){.wh *{animation:none!important;transition:none!important}}
`

// levelParam comes from ?level= in the address (read by page.jsx on the server)
export default function WordSearch({ levelParam }) {
  const raw = Number(levelParam)
  const level = Number.isInteger(raw) && raw >= 1 && raw <= LEVELS ? raw : null
  const [pool, setPool] = useState(null)
  const [error, setError] = useState('')
  const done = useStoredJSON(DONE_KEY)

  useEffect(() => {
    let alive = true
    loadWords()
      .then((list) => alive && setPool(list))
      .catch((e) => alive && setError(e.message || 'Үг ачаалж чадсангүй.'))
    return () => {
      alive = false
    }
  }, [])

  return (
    <AppShell userName="y/n">
      <style>{css}</style>
      {level ? (
        pool ? (
          <Level key={level} level={level} pool={pool} />
        ) : (
          <div className="wh-state" style={error ? { color: '#ef4444' } : undefined}>
            {error || (
              <>
                <Loader2 className="wh-spin" size={20} aria-hidden /> Үг ачаалж байна...
              </>
            )}
          </div>
        )
      ) : (
        <div>
          <div className="wh-list-head">
            <h1 className={pixelFont.className}>Үг хайх</h1>
            <p>Түвшингээ сонгоод нуугдсан үгсийг хөндлөн, босоо, ташуу чиглэлд хайж олоорой</p>
          </div>
          <LevelCards
            count={LEVELS}
            hrefFor={(n) => `/ug-haih?level=${n}`}
            info={(n) => ({
              badge: `${levelCount(n)} ҮГ`,
              sub: `${levelName(n)} ${levelSize(n)}×${levelSize(n)}`,
              tier: n <= 10 ? 'easy' : n <= 20 ? 'medium' : 'hard',
            })}
            done={done}
            stars={(secs, n) => (secs <= levelCount(n) * 12 ? 3 : secs <= levelCount(n) * 25 ? 2 : 1)}
            icon="search"
          />
        </div>
      )}
    </AppShell>
  )
}

function Level({ level, pool }) {
  const [puzzle] = useState(() => buildPuzzle(pool, level))
  const [found, setFound] = useState([]) // [{ w, cells, color }]
  const [sel, setSel] = useState(null) // { start, end }
  const [lastFound, setLastFound] = useState(null)
  const [seconds, setSeconds] = useState(0)
  const boardRef = useRef(null)
  const N = puzzle.size

  const won = found.length > 0 && found.length === puzzle.words.length

  // Timer runs until every word is found
  useEffect(() => {
    if (won) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [won])

  const restart = () => {
    setFound([])
    setSel(null)
    setLastFound(null)
    setSeconds(0)
  }

  const cellFromPoint = (x, y) => {
    const el = document.elementFromPoint(x, y)
    if (!el || !el.dataset || el.dataset.r === undefined) return null
    return [Number(el.dataset.r), Number(el.dataset.c)]
  }

  const onDown = (e) => {
    if (won) return
    const cell = cellFromPoint(e.clientX, e.clientY)
    if (!cell) return
    boardRef.current?.setPointerCapture?.(e.pointerId)
    setSel({ start: cell, end: cell })
  }

  const onMove = (e) => {
    if (!sel) return
    const cell = cellFromPoint(e.clientX, e.clientY)
    if (!cell || (cell[0] === sel.end[0] && cell[1] === sel.end[1])) return
    if (lineCells(sel.start, cell)) setSel((s) => (s ? { ...s, end: cell } : s))
  }

  const onUp = () => {
    if (!sel) return
    const cells = lineCells(sel.start, sel.end)
    setSel(null)
    if (!cells || cells.length < 2) return
    const text = cells.map(([r, c]) => puzzle.grid[r][c]).join('')
    const back = letters(text).reverse().join('')
    const hit = puzzle.words.find((w) => (w.w === text || w.w === back) && !found.some((f) => f.w === w.w))
    if (!hit) return
    const next = [...found, { w: hit.w, cells, color: COLORS[found.length % COLORS.length] }]
    setFound(next)
    setLastFound(hit)
    if (next.length === puzzle.words.length) {
      const all = (() => {
        try {
          return JSON.parse(localStorage.getItem(DONE_KEY) || '{}')
        } catch {
          return {}
        }
      })()
      const best = all[level] === undefined ? seconds : Math.min(all[level], seconds)
      saveStoredJSON(DONE_KEY, { ...all, [level]: best })
    }
  }

  const selCells = useMemo(() => (sel ? lineCells(sel.start, sel.end) : null), [sel])

  const seg = (cells) => {
    const [a, b] = [cells[0], cells[cells.length - 1]]
    return { x1: a[1] + 0.5, y1: a[0] + 0.5, x2: b[1] + 0.5, y2: b[0] + 0.5 }
  }

  return (
    <div className="wh" style={{ '--n': N }}>
      <div className="wh-top">
        <Link href="/ug-haih" className="wh-back">
          <ArrowLeft size={15} aria-hidden /> Түвшингүүд
        </Link>
      </div>
      <div className="wh-head">
        <div>
          <h1>Түвшин {level}</h1>
          <p>
            {levelName(level)} · {puzzle.words.length} үгийг хөндлөн, босоо, ташуу чиглэлд хайж олоорой
          </p>
        </div>
        <div className="wh-acts">
          <span className="wh-chip" aria-label="Хугацаа">
            <Timer size={16} aria-hidden /> {fmt(seconds)}
          </span>
          <span className="wh-chip">
            {found.length}/{puzzle.words.length}
          </span>
          <button type="button" className="wh-btn" onClick={restart}>
            <RotateCcw size={15} aria-hidden /> Дахин эхлэх
          </button>
        </div>
      </div>

      <div className="wh-body">
        <div
          ref={boardRef}
          className="wh-board"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={() => setSel(null)}
        >
          <svg className="wh-svg" viewBox={`0 0 ${N} ${N}`} aria-hidden>
            {found.map((f) => (
              <line key={f.w} {...seg(f.cells)} stroke={f.color} strokeWidth="0.8" strokeLinecap="round" opacity="0.75" />
            ))}
            {selCells && <line {...seg(selCells)} stroke="#38bdf8" strokeWidth="0.8" strokeLinecap="round" opacity="0.45" />}
          </svg>
          <div className="wh-grid" role="grid" aria-label="Үсгийн хүснэгт">
            {puzzle.grid.map((row, r) =>
              row.map((ch, c) => (
                <div key={`${r}-${c}`} className="wh-c" data-r={r} data-c={c} role="gridcell">
                  {ch}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="wh-side">
          <div className="wh-list" aria-label="Олох үгс">
            {puzzle.words.map((w) => {
              const f = found.find((x) => x.w === w.w)
              return (
                <span key={w.w} className={`wh-w ${f ? 'found' : ''}`} style={f ? { '--c': f.color } : undefined}>
                  {w.w}
                </span>
              )
            })}
          </div>

          {won ? (
            <div className="wh-win" role="status">
              <h2>
                <PartyPopper size={22} aria-hidden /> Бүгдийг оллоо!
              </h2>
              <p>Хугацаа: {fmt(seconds)}</p>
              {level < LEVELS ? (
                <Link href={`/ug-haih?level=${level + 1}`} className="wh-btn">
                  Дараагийн түвшин <ArrowRight size={15} aria-hidden />
                </Link>
              ) : (
                <Link href="/ug-haih" className="wh-btn">
                  Бүх түвшин
                </Link>
              )}
            </div>
          ) : (
            lastFound && (
              <div key={lastFound.w} className="wh-mean" role="status">
                <b>{lastFound.w}</b>
                {lastFound.m ? ` — ${lastFound.m}` : ''}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
