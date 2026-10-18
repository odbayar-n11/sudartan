'use client'

import { useEffect, useState } from 'react'
import {
  Bookmark,
  BookmarkCheck,
  BookmarkMinus,
  Loader2,
  LogIn,
  TriangleAlert,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import AppShell from '../components/AppShell'

const css = `
.s-top h1{display:flex;align-items:center;gap:12px}
.s-hico{display:grid;place-items:center;width:42px;height:42px;border-radius:14px;background:rgba(124,77,204,.15);color:#7c4dcc;animation:s-pop .6s cubic-bezier(.3,1.6,.5,1) backwards}
.s-count{display:inline-flex;align-items:center;margin-left:4px;padding:3px 12px;border-radius:999px;background:rgba(124,77,204,.15);color:#7c4dcc;font-size:14px;font-weight:800;font-variant-numeric:tabular-nums;animation:s-pop .5s .15s cubic-bezier(.3,1.6,.5,1) backwards}

.s-list{display:grid;gap:16px;margin-top:20px}

.s-card{position:relative;overflow:hidden;display:flex;gap:16px;align-items:flex-start;padding-left:26px;animation:s-rise .55s cubic-bezier(.2,.7,.2,1) backwards;animation-delay:calc(var(--i,0)*70ms);transition:transform .25s ease,box-shadow .25s ease,opacity .3s ease}
.s-card::before{content:"";position:absolute;left:0;top:0;bottom:0;width:6px;background:linear-gradient(180deg,#7c4dcc,#1677d2);transform-origin:top;animation:s-grow .6s cubic-bezier(.2,.7,.2,1) backwards;animation-delay:calc(var(--i,0)*70ms + .15s)}
.s-card:hover{transform:translateY(-4px);box-shadow:0 14px 30px rgba(0,0,0,.12)}
.s-card.is-leaving{opacity:0;transform:translateX(48px) scale(.96);pointer-events:none}

.s-ico{flex-shrink:0;display:grid;place-items:center;width:44px;height:44px;border-radius:14px;background:rgba(124,77,204,.15);color:#7c4dcc;transition:transform .3s cubic-bezier(.3,1.6,.5,1)}
.s-card:hover .s-ico{transform:scale(1.12) rotate(-8deg)}
.s-card:hover .s-ico svg{fill:currentColor}

.s-body{flex:1;min-width:0}
.s-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:8px}
.s-title{font-size:18px;font-weight:800;line-height:1.35;margin:0}
.s-desc{margin:0;line-height:1.65;opacity:.85}

.s-del{flex-shrink:0;display:inline-flex;align-items:center;gap:6px;border:2px solid rgba(128,128,128,.3);background:transparent;color:inherit;border-radius:999px;padding:5px 14px;font-weight:800;font-size:13px;cursor:pointer;transition:background .2s,border-color .2s,color .2s,transform .15s}
.s-del:hover{background:rgba(239,68,68,.15);border-color:#ef4444;color:#ef4444}
.s-del:hover svg{animation:s-shake .45s}
.s-del:active{transform:scale(.95)}
.s-del:focus-visible{outline:3px solid #ef4444;outline-offset:2px}

.s-state{display:flex;align-items:center;justify-content:center;gap:10px;text-align:center;animation:s-rise .5s backwards}
.s-empty{flex-direction:column;gap:14px;padding:48px 24px!important}
.s-empty-ico{display:grid;place-items:center;width:64px;height:64px;border-radius:50%;background:rgba(124,77,204,.15);color:#7c4dcc;animation:s-pop .7s cubic-bezier(.3,1.6,.5,1) backwards,s-float 3s 1s ease-in-out infinite}
.s-spin{animation:s-spin 1s linear infinite}

@keyframes s-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes s-grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes s-pop{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:scale(1)}}
@keyframes s-shake{0%,100%{transform:rotate(0)}25%{transform:rotate(-14deg)}50%{transform:rotate(12deg)}75%{transform:rotate(-8deg)}}
@keyframes s-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes s-spin{to{transform:rotate(360deg)}}

@media (max-width:560px){
  .s-card{flex-direction:column;gap:10px}
}

@media (prefers-reduced-motion:reduce){
  .s-hico,.s-count,.s-card,.s-card::before,.s-state,.s-empty-ico{animation:none}
  .s-card,.s-ico,.s-del{transition:none}
}
`

export default function SavedPage() {
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
        .from('saved_items')
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

    const { error } = await supabase.from('saved_items').delete().eq('id', id)
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

      <div className="top s-top">
        <div>
          <h1>
            <span className="s-hico">
              <BookmarkCheck size={24} aria-hidden />
            </span>
            Хадгалсан
            {items.length > 0 && <span className="s-count">{items.length}</span>}
          </h1>
          <p className="lead">
            {items.length > 0
              ? `${items.length} хадгалсан зүйл`
              : 'Хадгалсан дүрмүүд энд харагдана'}
          </p>
        </div>
      </div>

      {loading && (
        <div className="panel s-state">
          <Loader2 className="s-spin" size={20} aria-hidden />
          Ачаалж байна...
        </div>
      )}
      {error && (
        <div className="panel s-state" style={{ color: '#ef4444', fontWeight: 700 }}>
          <TriangleAlert size={20} aria-hidden />
          {error}
        </div>
      )}
      {!loading && !loggedIn && (
        <div className="panel s-state">
          <LogIn size={20} aria-hidden />
          Хадгалсанаа харахын тулд нэвтэрнэ үү.
        </div>
      )}
      {!loading && loggedIn && !error && items.length === 0 && (
        <div className="panel s-state s-empty">
          <span className="s-empty-ico">
            <Bookmark size={30} aria-hidden />
          </span>
          Хоосон байна. Дүрэм дээрх товчийг дарж хадгална уу.
        </div>
      )}

      <div className="s-list">
        {items.map((s, idx) => (
          <div
            key={s.id}
            className={`panel s-card${leaving === s.id ? ' is-leaving' : ''}`}
            style={{ '--i': Math.min(idx, 8) }}
          >
            <span className="s-ico">
              <Bookmark size={22} aria-hidden />
            </span>
            <div className="s-body">
              <div className="s-head">
                <p className="s-title">{s.title}</p>
                <button className="s-del" onClick={() => remove(s.id)}>
                  <BookmarkMinus size={14} aria-hidden />
                  Хасах
                </button>
              </div>
              <p className="s-desc">{s.content}</p>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  )
}