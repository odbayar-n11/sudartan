'use client'

import { useEffect, useState } from 'react'
import {
  PartyPopper,
  Lightbulb,
  CircleAlert,
  CalendarDays,
  Trash2,
  CircleX,
  CircleCheck,
  Loader2,
  LogIn,
  TriangleAlert,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import AppShell from '../components/AppShell'

const css = `
.m-top h1{display:flex;align-items:center;gap:12px}
.m-hico{display:grid;place-items:center;width:42px;height:42px;border-radius:14px;background:rgba(239,68,68,.15);color:#ef4444;animation:m-pop .6s cubic-bezier(.3,1.6,.5,1) backwards}
.m-count{display:inline-flex;align-items:center;gap:6px;margin-left:4px;padding:3px 12px;border-radius:999px;background:rgba(239,68,68,.15);color:#ef4444;font-size:14px;font-weight:800;font-variant-numeric:tabular-nums;animation:m-pop .5s .15s cubic-bezier(.3,1.6,.5,1) backwards}

.m-list{display:grid;gap:16px;margin-top:20px}

.m-card{position:relative;overflow:hidden;padding-left:26px;animation:m-rise .55s cubic-bezier(.2,.7,.2,1) backwards;animation-delay:calc(var(--i,0)*70ms);transition:transform .25s ease,box-shadow .25s ease,opacity .3s ease}
.m-card::before{content:"";position:absolute;left:0;top:0;bottom:0;width:6px;background:linear-gradient(180deg,#ef4444,#f59e0b);transform-origin:top;animation:m-grow .6s cubic-bezier(.2,.7,.2,1) backwards;animation-delay:calc(var(--i,0)*70ms + .15s)}
.m-card:hover{transform:translateY(-4px);box-shadow:0 14px 30px rgba(0,0,0,.12)}
.m-card.is-leaving{opacity:0;transform:translateX(48px) scale(.96);pointer-events:none}

.m-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px}
.m-date{display:inline-flex;align-items:center;gap:6px;opacity:.65;font-size:13px;font-weight:700}
.m-q{font-weight:800;font-size:17px;line-height:1.6;margin:0 0 16px}

.m-ans{display:grid;gap:10px;margin-bottom:14px}
.m-row{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:16px;font-weight:700;font-size:15px;transition:transform .2s ease}
.m-row:hover{transform:translateX(4px)}
.m-row small{display:block;font-size:12px;opacity:.7;margin-bottom:2px;font-weight:700}
.m-ico{flex-shrink:0;display:grid;place-items:center;width:32px;height:32px;border-radius:50%}
.m-bad{background:rgba(239,68,68,.12);border:2px solid rgba(239,68,68,.3)}
.m-bad .m-ico{background:rgba(239,68,68,.2);color:#ef4444}
.m-good{background:rgba(34,197,94,.12);border:2px solid rgba(34,197,94,.3)}
.m-good .m-ico{background:rgba(34,197,94,.2);color:#16a34a}
.m-bad .m-ico svg{animation:m-shake .5s .35s backwards}
.m-good .m-ico svg{animation:m-pop .5s .5s cubic-bezier(.3,1.6,.5,1) backwards}

.m-fb{margin:0;padding:13px 15px;border-radius:16px;background:rgba(2,132,199,.12);line-height:1.6;font-size:14px;font-weight:600;display:flex;gap:12px;align-items:flex-start}
.m-fb svg{flex-shrink:0;margin-top:2px;color:#0284c7;animation:m-twinkle 1s .6s backwards}

.m-del{display:inline-flex;align-items:center;gap:6px;border:2px solid rgba(128,128,128,.3);background:transparent;color:inherit;border-radius:999px;padding:5px 14px;font-weight:800;font-size:13px;cursor:pointer;transition:background .2s,border-color .2s,color .2s,transform .15s}
.m-del:hover{background:rgba(239,68,68,.15);border-color:#ef4444;color:#ef4444}
.m-del:hover svg{animation:m-shake .45s}
.m-del:active{transform:scale(.95)}
.m-del:focus-visible{outline:3px solid #ef4444;outline-offset:2px}

.m-state{display:flex;align-items:center;justify-content:center;gap:10px;text-align:center;animation:m-rise .5s backwards}
.m-empty{flex-direction:column;gap:14px;padding:48px 24px!important}
.m-empty-ico{display:grid;place-items:center;width:64px;height:64px;border-radius:50%;background:rgba(34,197,94,.15);color:#16a34a;animation:m-pop .7s cubic-bezier(.3,1.6,.5,1) backwards}
.m-spin{animation:m-spin 1s linear infinite}

@keyframes m-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes m-grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes m-pop{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:scale(1)}}
@keyframes m-shake{0%,100%{transform:rotate(0)}25%{transform:rotate(-14deg)}50%{transform:rotate(12deg)}75%{transform:rotate(-8deg)}}
@keyframes m-twinkle{0%{opacity:0;transform:scale(.4) rotate(-20deg)}60%{opacity:1;transform:scale(1.25) rotate(8deg)}100%{transform:none}}
@keyframes m-spin{to{transform:rotate(360deg)}}

@media (prefers-reduced-motion:reduce){
  .m-hico,.m-count,.m-card,.m-card::before,.m-state,.m-empty-ico,.m-bad .m-ico svg,.m-good .m-ico svg,.m-fb svg{animation:none}
  .m-card,.m-row,.m-del{transition:none}
}
`

export default function MistakesPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loggedIn, setLoggedIn] = useState(true)
  const [leaving, setLeaving] = useState(null)

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth?.user) {
        setLoggedIn(false)
        setLoading(false)
        return
      }
      const { data, error } = await supabase
        .from('mistakes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) setError(error.message)
      else setItems(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const remove = async (id) => {
    const item = items.find((i) => i.id === id)
    if (!item) return

    // play the exit animation first, then remove
    setLeaving(id)
    await new Promise((r) => setTimeout(r, 300))
    setItems((cur) => cur.filter((i) => i.id !== id))
    setLeaving(null)

    const { error } = await supabase.from('mistakes').delete().eq('id', id)
    if (error) {
      setItems((cur) =>
        [...cur, item].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        )
      )
    }
  }

  return (
    <AppShell userName="">
      <style>{css}</style>

      <div className="top m-top">
        <div>
          <h1>
            <span className="m-hico">
              <CircleAlert size={24} aria-hidden />
            </span>
            Алдсан
            {items.length > 0 && <span className="m-count">{items.length}</span>}
          </h1>
          <p className="lead">
            {items.length > 0
              ? `${items.length} алдаа байна. Дахин уншаад давтаарай.`
              : 'Таны буруу хариулсан асуултууд энд харагдана'}
          </p>
        </div>
      </div>

      {loading && (
        <div className="panel m-state">
          <Loader2 className="m-spin" size={20} aria-hidden />
          Ачаалж байна...
        </div>
      )}
      {error && (
        <div className="panel m-state" style={{ color: '#ef4444', fontWeight: 700 }}>
          <TriangleAlert size={20} aria-hidden />
          {error}
        </div>
      )}
      {!loading && !loggedIn && (
        <div className="panel m-state">
          <LogIn size={20} aria-hidden />
          Алдсанаа харахын тулд нэвтэрнэ үү.
        </div>
      )}
      {!loading && loggedIn && !error && items.length === 0 && (
        <div className="panel m-state m-empty">
          <span className="m-empty-ico">
            <PartyPopper size={30} aria-hidden />
          </span>
          Одоогоор алдаа алга. Дасгал хийж үзээрэй!
        </div>
      )}

      <div className="m-list">
        {items.map((m, idx) => (
          <div
            key={m.id}
            className={`panel m-card${leaving === m.id ? ' is-leaving' : ''}`}
            style={{ '--i': Math.min(idx, 8) }}
          >
            <div className="m-head">
              <span className="m-date">
                <CalendarDays size={15} aria-hidden />
                {new Date(m.created_at).toLocaleDateString('mn-MN')}
              </span>
              <button className="m-del" onClick={() => remove(m.id)}>
                <Trash2 size={14} aria-hidden />
                Устгах
              </button>
            </div>

            <p className="m-q">{m.question}</p>

            <div className="m-ans">
              <div className="m-row m-bad">
                <span className="m-ico">
                  <CircleX size={20} aria-hidden />
                </span>
                <div>
                  <small>Таны хариулт</small>
                  {m.user_answer}
                </div>
              </div>
              <div className="m-row m-good">
                <span className="m-ico">
                  <CircleCheck size={20} aria-hidden />
                </span>
                <div>
                  <small>Зөв хариулт</small>
                  {m.correct_answer}
                </div>
              </div>
            </div>

            {m.explanation && (
              <p className="m-fb">
                <Lightbulb size={18} aria-hidden />
                <span>{m.explanation}</span>
              </p>
            )}
          </div>
        ))}
      </div>
    </AppShell>
  )
}