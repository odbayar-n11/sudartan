'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Heart, Flame, Zap, Volume2, VolumeX } from 'lucide-react'

const MAX_HEARTS = 5
const CONFETTI_COLORS = ['#0284c7', '#22c55e', '#facc15', '#f97316', '#ec4899', '#a855f7']

const norm = (s) => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ')

function shuffleArr(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const css = `
.dq{position:relative;overflow:hidden}
.dq-top{display:flex;align-items:center;gap:14px;margin-bottom:22px}
.dq-track{flex:1;height:16px;border-radius:999px;background:rgba(128,128,128,.25);overflow:hidden;position:relative}
.dq-fill{height:100%;border-radius:999px;background:linear-gradient(180deg,#38bdf8,#0284c7);transition:width .5s cubic-bezier(.34,1.56,.64,1);position:relative}
.dq-fill::after{content:'';position:absolute;left:8px;right:8px;top:3px;height:4px;border-radius:999px;background:rgba(255,255,255,.35)}
.dq-hearts{display:flex;align-items:center;gap:6px;font-weight:900;color:#ef4444}
.dq-hearts-row{display:flex;gap:3px}
.dq-heart{transition:all .3s;color:#ef4444;fill:#ef4444}
.dq-heart.lost{color:rgba(128,128,128,.5);fill:transparent}
.dq-heart.breaking{animation:dq-break .6s ease}
.dq-sound{border:0;background:transparent;color:inherit;opacity:.6;cursor:pointer;display:grid;place-items:center;padding:4px}
.dq-sound:hover{opacity:1}
.dq-stats{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px}
.dq-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;font-weight:900;font-size:14px;background:rgba(128,128,128,.14)}
.dq-chip.fire{background:rgba(249,115,22,.18);color:#f97316}
.dq-chip.fire.hot svg{animation:dq-flame .8s ease-in-out infinite}
.dq-chip.xp{background:rgba(250,204,21,.2);color:#ca8a04}
.dq-chip .bump{display:inline-block;animation:dq-bump .4s ease}
.dq-tag{display:inline-block;margin:0 0 10px;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:900;background:rgba(2,132,199,.16);color:#0284c7}
.dq-label{opacity:.7;font-size:14px;font-weight:700;margin:0 0 6px}
.dq-card{animation:dq-in .35s ease both}
.dq-prompt{font-weight:800;line-height:1.5;margin:0 0 22px;white-space:pre-wrap;word-break:break-word}
.dq-opts{display:grid;gap:12px}
.dq-opt{position:relative;display:flex;align-items:center;gap:14px;width:100%;text-align:left;padding:14px 16px;border-radius:16px;border:2px solid rgba(128,128,128,.3);border-bottom-width:5px;background:transparent;color:inherit;font-size:16px;line-height:1.4;font-weight:800;cursor:pointer;transition:transform .12s,background .15s,border-color .15s}
.dq-opt:hover:not(:disabled){background:rgba(2,132,199,.1);border-color:#0284c7}
.dq-opt:active:not(:disabled){transform:translateY(3px);border-bottom-width:2px;margin-bottom:3px}
.dq-opt:disabled{cursor:default}
.dq-opt:focus-visible{outline:3px solid #0284c7;outline-offset:2px}
.dq-key{flex-shrink:0;width:28px;height:28px;border-radius:8px;border:2px solid rgba(128,128,128,.35);display:grid;place-items:center;font-size:13px;font-weight:900;opacity:.8}
.dq-opt.ok{background:rgba(34,197,94,.18);border-color:#22c55e;color:#16a34a;animation:dq-pop .45s ease}
.dq-opt.ok .dq-key{border-color:#22c55e;background:#22c55e;color:#fff}
.dq-opt.no{background:rgba(239,68,68,.16);border-color:#ef4444;color:#dc2626;animation:dq-shake .45s ease}
.dq-opt.no .dq-key{border-color:#ef4444;background:#ef4444;color:#fff}
.dq-opt.dim{opacity:.45}
.dq-input{width:100%;box-sizing:border-box;padding:16px 18px;border-radius:16px;border:2px solid rgba(128,128,128,.3);border-bottom-width:5px;background:transparent;color:inherit;font-size:20px;font-weight:800;outline:none;transition:border-color .15s,background .15s}
.dq-input:focus{border-color:#0284c7}
.dq-input.ok{border-color:#22c55e;background:rgba(34,197,94,.14);animation:dq-pop .45s ease}
.dq-input.no{border-color:#ef4444;background:rgba(239,68,68,.12);animation:dq-shake .45s ease}
.dq-typeact{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:14px}
.dq-skip{border:0;background:transparent;color:inherit;opacity:.65;font-weight:800;font-size:14px;cursor:pointer;padding:8px}
.dq-skip:hover{opacity:1}
.dq-check{padding:12px 26px;border-radius:16px;border:0;border-bottom:5px solid #0369a1;background:#0284c7;color:#fff;font-size:15px;font-weight:900;cursor:pointer}
.dq-check:active:not(:disabled){transform:translateY(3px);border-bottom-width:2px}
.dq-check:disabled{background:rgba(128,128,128,.3);border-color:rgba(128,128,128,.4);cursor:not-allowed}
.dq-match{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.dq-col{display:grid;gap:12px;align-content:start}
.dq-m{padding:14px 12px;border-radius:16px;border:2px solid rgba(128,128,128,.3);border-bottom-width:5px;background:transparent;color:inherit;font-size:15px;line-height:1.35;font-weight:800;cursor:pointer;text-align:center;word-break:break-word;transition:transform .12s,background .15s,border-color .15s,opacity .3s}
.dq-m:hover:not(:disabled){background:rgba(2,132,199,.1);border-color:#0284c7}
.dq-m.sel{border-color:#0284c7;background:rgba(2,132,199,.2);color:#0284c7;transform:translateY(-2px)}
.dq-m.bad{border-color:#ef4444;background:rgba(239,68,68,.18);color:#dc2626;animation:dq-shake .45s ease}
.dq-m.done{border-color:#22c55e;background:rgba(34,197,94,.16);color:#16a34a;opacity:.45;cursor:default;animation:dq-pop .4s ease}
.dq-sheet{margin:22px -22px -22px;padding:18px 22px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;animation:dq-slide .35s cubic-bezier(.34,1.56,.64,1) both}
.dq-sheet.good{background:rgba(34,197,94,.16);border-top:2px solid rgba(34,197,94,.5)}
.dq-sheet.bad{background:rgba(239,68,68,.14);border-top:2px solid rgba(239,68,68,.45)}
.dq-sheet-title{font-size:20px;font-weight:900;margin:0 0 4px}
.dq-sheet.good .dq-sheet-title{color:#16a34a}
.dq-sheet.bad .dq-sheet-title{color:#dc2626}
.dq-sheet-txt{margin:0;font-size:14px;font-weight:600;line-height:1.55;max-width:520px}
.dq-go{padding:13px 28px;border-radius:16px;border:0;border-bottom:5px solid;font-size:15px;font-weight:900;color:#fff;cursor:pointer;transition:transform .1s}
.dq-go:active{transform:translateY(3px);border-bottom-width:2px}
.dq-go:focus-visible{outline:3px solid #0284c7;outline-offset:2px}
.dq-sheet.good .dq-go{background:#22c55e;border-color:#15803d}
.dq-sheet.bad .dq-go{background:#ef4444;border-color:#b91c1c}
.dq-end{text-align:center;padding:24px 8px 8px;position:relative}
.dq-emoji{font-size:72px;line-height:1;animation:dq-trophy .8s cubic-bezier(.34,1.56,.64,1) both}
.dq-end h2{font-size:26px;font-weight:900;margin:12px 0 4px}
.dq-end p{opacity:.75;margin:0 0 20px}
.dq-res{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-bottom:24px}
.dq-res>div{min-width:104px;padding:12px 14px;border-radius:16px;border:2px solid;font-weight:900}
.dq-res small{display:block;font-size:11px;opacity:.85;margin-bottom:2px}
.dq-res span{font-size:24px}
.dq-res .a{border-color:#facc15;color:#ca8a04;background:rgba(250,204,21,.12)}
.dq-res .b{border-color:#22c55e;color:#16a34a;background:rgba(34,197,94,.12)}
.dq-res .c{border-color:#0284c7;color:#0284c7;background:rgba(2,132,199,.12)}
.dq-actions{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.dq-confetti{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.dq-confetti i{position:absolute;top:-16px;width:9px;height:14px;border-radius:2px;animation:dq-fall linear forwards}
@keyframes dq-in{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:none}}
@keyframes dq-pop{0%{transform:scale(1)}40%{transform:scale(1.04)}100%{transform:scale(1)}}
@keyframes dq-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
@keyframes dq-slide{from{transform:translateY(100%);opacity:0}to{transform:none;opacity:1}}
@keyframes dq-bump{0%{transform:scale(1)}50%{transform:scale(1.5)}100%{transform:scale(1)}}
@keyframes dq-flame{0%,100%{transform:scale(1) rotate(-4deg)}50%{transform:scale(1.25) rotate(4deg)}}
@keyframes dq-break{0%{transform:scale(1)}30%{transform:scale(1.5)}60%{transform:scale(.7) rotate(-15deg)}100%{transform:scale(1)}}
@keyframes dq-trophy{from{transform:scale(0) rotate(-30deg)}to{transform:none}}
@keyframes dq-fall{to{transform:translateY(110vh) rotate(720deg);opacity:.9}}
@media (max-width:520px){.dq-match{gap:8px}.dq-m{font-size:14px;padding:12px 8px}}
@media (prefers-reduced-motion:reduce){.dq *{animation:none!important;transition:none!important}}
`

/* ---------- Match pairs board ---------- */
function MatchBoard({ pairs, onWrong, onDone, beep }) {
  const left = useMemo(() => shuffleArr(pairs.map((p, i) => ({ id: i, text: p.left }))), [pairs])
  const right = useMemo(() => shuffleArr(pairs.map((p, i) => ({ id: i, text: p.right }))), [pairs])
  const [selL, setSelL] = useState(null)
  const [selR, setSelR] = useState(null)
  const [done, setDone] = useState(() => new Set())
  const [bad, setBad] = useState(null)
  const errors = useRef(0)

  const evaluate = (l, r) => {
    if (l === r) {
      const nd = new Set(done)
      nd.add(l)
      setDone(nd)
      setSelL(null)
      setSelR(null)
      beep([660, 880], 0.08)
      if (nd.size === pairs.length) setTimeout(() => onDone(errors.current), 550)
    } else {
      errors.current += 1
      setBad({ l, r })
      onWrong(pairs[l], right.find((x) => x.id === r).text)
      setTimeout(() => {
        setBad(null)
        setSelL(null)
        setSelR(null)
      }, 550)
    }
  }

  const pickL = (id) => {
    if (done.has(id) || bad) return
    setSelL(id)
    if (selR !== null) evaluate(id, selR)
  }
  const pickR = (id) => {
    if (done.has(id) || bad) return
    setSelR(id)
    if (selL !== null) evaluate(selL, id)
  }

  const cls = (side, id) => {
    let c = 'dq-m'
    if (done.has(id)) return c + ' done'
    if (bad && bad[side] === id) return c + ' bad'
    if ((side === 'l' ? selL : selR) === id) c += ' sel'
    return c
  }

  return (
    <div className="dq-match">
      <div className="dq-col">
        {left.map((x) => (
          <button key={x.id} type="button" className={cls('l', x.id)} onClick={() => pickL(x.id)}>
            {x.text}
          </button>
        ))}
      </div>
      <div className="dq-col">
        {right.map((x) => (
          <button key={x.id} type="button" className={cls('r', x.id)} onClick={() => pickR(x.id)}>
            {x.text}
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * questions: array of
 *   { type:'choice', id, prompt, answer, options[], explanation?, showOnCorrect? }
 *   { type:'type',   id, prompt, answer, accept?: string[], explanation? }
 *   { type:'match',  id, prompt, pairs:[{left,right}], explanation? }
 * label:      small text above the prompt (choice / type)
 * onAnswer:   (question, chosen, isCorrect) => void   (for saveMistake; match calls it once per wrong pair)
 * onRestart:  () => void
 * onFinish:   ({status:'won'|'lost', correct, total, xp}) => void
 * actions:    extra buttons for the result screens
 */
export default function DuoQuiz({
  questions,
  label = '',
  promptSize = 20,
  onAnswer,
  onRestart,
  onFinish,
  actions = null,
}) {
  const [idx, setIdx] = useState(0)
  const [result, setResult] = useState(null) // { ok, given, errors }
  const [text, setText] = useState('')
  const [hearts, setHearts] = useState(MAX_HEARTS)
  const [streak, setStreak] = useState(0)
  const [xp, setXp] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [status, setStatus] = useState('playing') // playing | won | lost
  const [muted, setMuted] = useState(false)
  const [bump, setBump] = useState(0)
  const [broke, setBroke] = useState(-1)
  const audioRef = useRef(null)

  const q = questions[idx]
  const type = q?.type || 'choice'
  const answered = result !== null
  const isRight = !!result?.ok

  const beep = useCallback(
    (freqs, dur = 0.12) => {
      if (muted) return
      try {
        if (!audioRef.current) {
          audioRef.current = new (window.AudioContext || window.webkitAudioContext)()
        }
        const ctx = audioRef.current
        freqs.forEach((f, i) => {
          const o = ctx.createOscillator()
          const g = ctx.createGain()
          const t = ctx.currentTime + i * dur
          o.type = 'sine'
          o.frequency.value = f
          g.gain.setValueAtTime(0.15, t)
          g.gain.exponentialRampToValueAtTime(0.001, t + dur)
          o.connect(g)
          g.connect(ctx.destination)
          o.start(t)
          o.stop(t + dur)
        })
      } catch {}
    },
    [muted]
  )

  const loseHeart = useCallback(() => {
    setBroke(hearts - 1)
    setHearts((h) => Math.max(0, h - 1))
    setStreak(0)
    beep([220, 165], 0.18)
  }, [hearts, beep])

  const submit = useCallback(
    (given, ok, errors = 0) => {
      if (result || status !== 'playing' || !q) return
      setResult({ ok, given, errors })
      if (ok) {
        const ns = streak + 1
        setStreak(ns)
        setXp((x) => x + 10 + Math.min(ns - 1, 4) * 2)
        setCorrect((c) => c + 1)
        setBump((b) => b + 1)
        beep([523, 659, 784])
      } else if (type === 'match') {
        setXp((x) => x + 5)
        setBump((b) => b + 1)
        beep([392, 523])
      } else {
        loseHeart()
      }
      if (type !== 'match') onAnswer?.(q, given, ok)
    },
    [result, status, q, streak, type, beep, loseHeart, onAnswer]
  )

  const choose = (opt) => submit(opt, opt === q.answer)

  const matchesText = (value) =>
    norm(value) === norm(q.answer) || (q.accept || []).some((a) => norm(a) === norm(value))

  const checkText = () => {
    if (!text.trim()) return
    submit(text, matchesText(text))
  }

  const wrongPair = (pair, given) => {
    loseHeart()
    onAnswer?.(
      { id: `${q.id}-${pair.left}`, prompt: pair.left, answer: pair.right, explanation: q.explanation },
      given,
      false
    )
  }

  const next = useCallback(() => {
    if (!answered) return
    if (!isRight && hearts <= 0) {
      setStatus('lost')
      beep([300, 220, 160], 0.2)
    } else if (idx + 1 >= questions.length) {
      setStatus('won')
      beep([523, 659, 784, 1047], 0.14)
    } else {
      setIdx((i) => i + 1)
      setResult(null)
      setText('')
    }
  }, [answered, isRight, hearts, idx, questions.length, beep])

  // Out of hearts in the middle of a matching board
  useEffect(() => {
    if (hearts <= 0 && status === 'playing' && type === 'match' && !result) {
      const t = setTimeout(() => {
        setStatus('lost')
        beep([300, 220, 160], 0.2)
      }, 700)
      return () => clearTimeout(t)
    }
  }, [hearts, status, type, result, beep])

  useEffect(() => {
    if (status !== 'playing') onFinish?.({ status, correct, total: questions.length, xp })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // Keyboard: 1-4 to choose (choice questions), Enter to continue
  useEffect(() => {
    const onKey = (e) => {
      if (status !== 'playing' || !q) return
      if (e.key === 'Enter') {
        if (answered) {
          e.preventDefault()
          next()
        }
        return
      }
      if (type !== 'choice' || answered) return
      const n = Number(e.key)
      if (n >= 1 && n <= q.options.length) choose(q.options[n - 1])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const confetti = useMemo(
    () =>
      Array.from({ length: 44 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        dur: 2 + Math.random() * 1.8,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      })),
    []
  )

  if (!q && status === 'playing') return null

  const progress =
    status === 'won'
      ? 100
      : questions.length
      ? ((idx + (answered ? 1 : 0)) / questions.length) * 100
      : 0
  const accuracy = questions.length ? Math.round((correct / questions.length) * 100) : 0

  const sheetTitle = isRight
    ? type === 'match'
      ? 'Бүгдийг зөв холболоо!'
      : streak >= 3
      ? `Гайхалтай! ${streak} дараалан зөв`
      : ['Зөв!', 'Яг зөв!', 'Сайн байна!'][idx % 3]
    : type === 'match'
    ? `Холбож дууслаа · ${result?.errors ?? 0} алдаа`
    : 'Буруу'

  const showAnswerLine = answered && !isRight && type !== 'match'
  const showExplain = answered && q?.explanation && (showAnswerLine || (isRight && q.showOnCorrect))

  const typeTag = type === 'type' ? '✍️ Бичиж хариул' : type === 'match' ? '🔗 Хосыг холбо' : ''

  return (
    <div className="panel dq">
      <style>{css}</style>

      {status === 'playing' && (
        <>
          <div className="dq-top">
            <div className="dq-track" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
              <div className="dq-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="dq-hearts" aria-label={`${hearts} зүрх үлдсэн`}>
              <div className="dq-hearts-row">
                {Array.from({ length: MAX_HEARTS }, (_, i) => (
                  <Heart
                    key={i}
                    size={20}
                    className={`dq-heart ${i >= hearts ? 'lost' : ''} ${broke === i ? 'breaking' : ''}`}
                  />
                ))}
              </div>
            </div>
            <button
              type="button"
              className="dq-sound"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? 'Дууг асаах' : 'Дууг хаах'}
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>

          <div className="dq-stats">
            <span className="dq-chip">
              {Math.min(idx + 1, questions.length)} / {questions.length}
            </span>
            <span className={`dq-chip fire ${streak >= 3 ? 'hot' : ''}`}>
              <Flame size={15} /> <span key={streak} className={streak > 0 ? 'bump' : ''}>{streak}</span>
            </span>
            <span className="dq-chip xp">
              <Zap size={15} /> <span key={bump} className="bump">{xp} XP</span>
            </span>
          </div>

          <div key={idx} className="dq-card">
            {typeTag && <span className="dq-tag">{typeTag}</span>}
            {type !== 'match' && label && <p className="dq-label">{label}</p>}
            <p className="dq-prompt" style={{ fontSize: type === 'match' ? 18 : promptSize }}>
              {q.prompt}
            </p>

            {type === 'choice' && (
              <div className="dq-opts">
                {q.options.map((opt, i) => {
                  const isCorrect = opt === q.answer
                  const isPicked = result?.given === opt
                  let cls = 'dq-opt'
                  if (answered) {
                    if (isCorrect) cls += ' ok'
                    else if (isPicked) cls += ' no'
                    else cls += ' dim'
                  }
                  return (
                    <button
                      key={`${idx}-${i}`}
                      type="button"
                      className={cls}
                      onClick={() => choose(opt)}
                      disabled={answered}
                    >
                      <span className="dq-key">{i + 1}</span>
                      <span>{opt}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {type === 'type' && (
              <div>
                <input
                  className={`dq-input ${answered ? (isRight ? 'ok' : 'no') : ''}`}
                  value={answered ? result.given : text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !answered) {
                      e.preventDefault()
                      checkText()
                    }
                  }}
                  disabled={answered}
                  placeholder="Энд бичнэ үү..."
                  autoFocus
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  aria-label="Хариулт"
                />
                {!answered && (
                  <div className="dq-typeact">
                    <button type="button" className="dq-skip" onClick={() => submit('', false)}>
                      Мэдэхгүй
                    </button>
                    <button type="button" className="dq-check" onClick={checkText} disabled={!text.trim()}>
                      Шалгах
                    </button>
                  </div>
                )}
              </div>
            )}

            {type === 'match' && (
              <MatchBoard
                pairs={q.pairs}
                onWrong={wrongPair}
                onDone={(errors) => submit(null, errors === 0, errors)}
                beep={beep}
              />
            )}
          </div>

          {answered && (
            <div className={`dq-sheet ${isRight ? 'good' : 'bad'}`} role="status">
              <div>
                <p className="dq-sheet-title">{sheetTitle}</p>
                {showAnswerLine && (
                  <p className="dq-sheet-txt">
                    Зөв хариулт: <b>{q.answer}</b>
                  </p>
                )}
                {showExplain && <p className="dq-sheet-txt">{q.explanation}</p>}
              </div>
              <button type="button" className="dq-go" onClick={next} autoFocus>
                {!isRight && hearts <= 0
                  ? 'Үргэлжлүүлэх'
                  : idx + 1 === questions.length
                  ? 'Дуусгах'
                  : 'Үргэлжлүүлэх'}
              </button>
            </div>
          )}
        </>
      )}

      {status === 'won' && (
        <div className="dq-end">
          <div className="dq-confetti" aria-hidden="true">
            {confetti.map((c, i) => (
              <i
                key={i}
                style={{
                  left: `${c.left}%`,
                  background: c.color,
                  animationDelay: `${c.delay}s`,
                  animationDuration: `${c.dur}s`,
                }}
              />
            ))}
          </div>
          <div className="dq-emoji">{correct === questions.length ? '🏆' : '🎉'}</div>
          <h2>{correct === questions.length ? 'Төгс! Бүгдийг зөв хариуллаа' : 'Дасгал дууслаа!'}</h2>
          <p>
            {correct === questions.length
              ? 'Та үнэхээр мундаг байна.'
              : accuracy >= 50
              ? 'Сайн байна! Алдсанаа давтаад дахин оролдоорой.'
              : 'Дахин нэг оролдоод үзээрэй, чадна.'}
          </p>
          <div className="dq-res">
            <div className="a"><small>Нийт XP</small><span>{xp}</span></div>
            <div className="b"><small>Зөв</small><span>{correct} / {questions.length}</span></div>
            <div className="c"><small>Нарийвчлал</small><span>{accuracy}%</span></div>
          </div>
          <div className="dq-actions">
            <button type="button" className="btn" onClick={onRestart}>Дахин тоглох</button>
            {actions}
          </div>
        </div>
      )}

      {status === 'lost' && (
        <div className="dq-end">
          <div className="dq-emoji">💔</div>
          <h2>Зүрх дууслаа</h2>
          <p>Та {correct} асуултад зөв хариуллаа. Дахин эхлээд оролдоорой.</p>
          <div className="dq-res">
            <div className="a"><small>Нийт XP</small><span>{xp}</span></div>
            <div className="b"><small>Зөв</small><span>{correct} / {questions.length}</span></div>
          </div>
          <div className="dq-actions">
            <button type="button" className="btn" onClick={onRestart}>Дахин эхлэх</button>
            {actions}
          </div>
        </div>
      )}
    </div>
  )
}