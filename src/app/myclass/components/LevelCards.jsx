'use client'

import Link from 'next/link'
import { Press_Start_2P } from 'next/font/google'

// Retro pixel-art level cards for the word games.
// info(n) -> { badge, sub, tier: 'easy' | 'medium' | 'hard' }
// done: { [level]: value } for finished levels; stars(value, n) -> 0..3; icon: 'tiles' | 'search'

export const pixelFont = Press_Start_2P({
  weight: '400',
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
})

const TIER = {
  easy: { bg: '#4ade80', name: 'easy' },
  medium: { bg: '#fbbf24', name: 'medium' },
  hard: { bg: '#fb7185', name: 'hard' },
}

// Tiny pixel-art drawings: '#' = filled pixel
const STAR = ['...#...', '...#...', '#######', '.#####.', '..###..', '.##.##.', '.#...#.']
const SEARCH = ['.###.....', '#...#....', '#...#....', '#...#....', '.###.....', '....##...', '.....##..', '......##.', '.......#.']

function Pixels({ rows, size, color, className }) {
  const w = rows[0].length
  const h = rows.length
  return (
    <svg className={className} width={w * size} height={h * size} viewBox={`0 0 ${w} ${h}`} shapeRendering="crispEdges" aria-hidden>
      {rows.flatMap((row, y) =>
        [...row].map((ch, x) => (ch === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={color} /> : null))
      )}
    </svg>
  )
}

// Letter tiles (green / yellow / grey) for Үг таах
function TilesIcon() {
  const tiles = [
    [0, 0, '#16a34a'],
    [4, 0, '#eab308'],
    [8, 0, '#64748b'],
    [0, 4, '#64748b'],
    [4, 4, '#16a34a'],
    [8, 4, '#16a34a'],
  ]
  return (
    <svg width={44} height={28} viewBox="0 0 11 7" shapeRendering="crispEdges" aria-hidden>
      {tiles.map(([x, y, c]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width="3" height="3" fill="#111" />
          <rect x={x + 0.5} y={y + 0.5} width="2" height="2" fill={c} />
        </g>
      ))}
    </svg>
  )
}

const css = `
.lv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(190px,100%),1fr));gap:22px 18px;padding:4px 2px 10px}
.lv-wrap{position:relative;display:block;text-decoration:none;color:#111;filter:drop-shadow(0 6px 0 rgba(15,23,42,.35));transition:transform .08s ease-out,filter .08s ease-out}
.lv-wrap:hover{transform:translateY(-5px);filter:drop-shadow(0 11px 0 rgba(15,23,42,.3))}
.lv-wrap:active{transform:translateY(3px);filter:drop-shadow(0 2px 0 rgba(15,23,42,.4))}
.lv-wrap:focus-visible{outline:4px dashed #0284c7;outline-offset:6px}
.lv-frame,.lv-card,.lv-btn,.lv-chip{clip-path:polygon(0 var(--c),var(--c) var(--c),var(--c) 0,calc(100% - var(--c)) 0,calc(100% - var(--c)) var(--c),100% var(--c),100% calc(100% - var(--c)),calc(100% - var(--c)) calc(100% - var(--c)),calc(100% - var(--c)) 100%,var(--c) 100%,var(--c) calc(100% - var(--c)),0 calc(100% - var(--c)))}
.lv-frame{--c:8px;padding:4px;background:#111}
.lv-card{--c:6px;display:flex;flex-direction:column;gap:10px;min-height:196px;padding:14px 14px 12px;background:var(--bg);box-shadow:inset 0 5px 0 rgba(255,255,255,.45),inset 0 -6px 0 rgba(0,0,0,.18);background-image:linear-gradient(rgba(0,0,0,.05) 2px,transparent 2px),linear-gradient(90deg,rgba(0,0,0,.05) 2px,transparent 2px);background-size:12px 12px;box-sizing:border-box}
.lv-top{display:flex;align-items:center;justify-content:space-between;gap:6px}
.lv-lv{font-size:10px;letter-spacing:.1em;opacity:.75}
.lv-chip{--c:3px;padding:5px 7px 4px;background:#111;color:#fff;font-size:8px;line-height:1.2;white-space:nowrap}
.lv-num{font-size:34px;line-height:1;letter-spacing:-.02em;text-shadow:3px 3px 0 rgba(0,0,0,.18)}
.lv-mid{display:flex;align-items:center;gap:10px;min-height:28px}
.lv-sub{font-size:8px;line-height:1.6;opacity:.85}
.lv-stars{display:flex;gap:6px}
.lv-stars svg:not(.lv-star-off){filter:drop-shadow(2px 0 0 #111) drop-shadow(-2px 0 0 #111) drop-shadow(0 2px 0 #111) drop-shadow(0 -2px 0 #111)}
.lv-star-off{opacity:.25}
.lv-btn{--c:4px;margin-top:auto;display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 8px 9px;background:#111;color:#fff;font-size:10px;letter-spacing:.08em;box-shadow:inset 0 -3px 0 rgba(255,255,255,.12)}
.lv-wrap:hover .lv-btn{background:#1e293b}
.lv-wrap.done .lv-btn{background:#fff;color:#111}
@media (max-width:520px){
  .lv-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 12px}
  .lv-card{min-height:178px;padding:12px 10px 10px;gap:8px}
  .lv-num{font-size:28px}
  .lv-chip{font-size:7px;padding:4px 5px 3px}
  .lv-sub{font-size:7px}
  .lv-btn{font-size:9px}
}
@media (prefers-reduced-motion:reduce){.lv-wrap{transition:none}}
`

export default function LevelCards({ count = 30, hrefFor, info, done = {}, stars, icon = 'tiles' }) {
  return (
    <div className={`lv-grid ${pixelFont.className}`}>
      <style>{css}</style>
      {Array.from({ length: count }, (_, i) => {
        const n = i + 1
        const { badge, sub, tier = 'easy' } = info(n)
        const finished = done[n] !== undefined
        const got = finished && stars ? stars(done[n], n) : 0
        return (
          <Link
            key={n}
            href={hrefFor(n)}
            className={`lv-wrap ${finished ? 'done' : ''}`}
            aria-label={`Түвшин ${n}${finished ? `, ${got} од` : ''}`}
          >
            <div className="lv-frame">
              <div className="lv-card" style={{ '--bg': TIER[tier].bg }}>
                <div className="lv-top">
                  <span className="lv-lv">LV</span>
                  <span className="lv-chip">{badge}</span>
                </div>
                <div className="lv-num">{String(n).padStart(2, '0')}</div>
                <div className="lv-mid">
                  {icon === 'search' ? <Pixels rows={SEARCH} size={3} color="#111" /> : <TilesIcon />}
                  <span className="lv-sub">{sub}</span>
                </div>
                <div className="lv-stars">
                  {[0, 1, 2].map((s) => (
                    <Pixels key={s} rows={STAR} size={3} color={s < got ? '#facc15' : '#111'} className={s < got ? '' : 'lv-star-off'} />
                  ))}
                </div>
                <div className="lv-btn">
                  {finished ? 'Дууссан' : 'Эхлэх'}
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
