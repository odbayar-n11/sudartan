'use client'

import Link from 'next/link'
import { ArrowRight, Layers, Sparkles, Clock } from 'lucide-react'
import AppShell from './AppShell'

// Shared card grid for the Хичээл and Дасгал pages.
// items: [{ title, desc, count, icon, tone, href, isNew }]; unit is the word after the count.

const css = `
.ls-title {
  display: flex !important;
  align-items: center;
  flex-wrap: wrap;
  column-gap: 14px;
  font-size: 34px !important;
  font-weight: 900 !important;
  line-height: 1.2 !important;
  margin-bottom: 28px !important; /* Энд дурын зайгаа өгч болно (жишээ нь: 60px, 80px) */
}
.ls-title-ic {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: rgba(2, 132, 199, 0.15);
  color: #0284c7;
  animation: ls-pop .6s cubic-bezier(.3, 1.6, .5, 1) backwards;
}
.ls-title span.ls-sub {
  display: block !important;
  flex-basis: 100%;
  color: #0284c7 !important;
  font-size: 18px !important;
  font-weight: 600 !important;
  margin-top: 10px !important;
  animation: ls-rise .6s .1s cubic-bezier(.2, .7, .2, 1) backwards;
}

.ls-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px}

/* sheep peeking over the top edge of each card, paws on the edge */
.ls-wrap{position:relative;display:flex;flex-direction:column;padding-top:58px}
.ls-wrap>.ls-card{flex:1}
.ls-peek{position:absolute;top:0;right:30px;z-index:2;width:96px;height:auto;pointer-events:none;user-select:none;animation:ls-peek .6s cubic-bezier(.3,1.4,.5,1) backwards;animation-delay:calc(var(--i,0)*80ms + .45s);transition:transform .25s ease}
.ls-wrap:has(a.ls-card:hover) .ls-peek{transform:translateY(-10px)}
.ls-wrap:has(a.ls-card:active) .ls-peek{transform:translateY(-4px)}
@keyframes ls-peek{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}

.ls-card{
  --tone:#0284c7;--tone-bg:rgba(2,132,199,.18);
  position:relative;overflow:hidden;display:flex;flex-direction:column;min-height:220px;padding:24px;border-radius:28px;
  border:1px solid rgba(128,128,128,.22);background:rgba(128,128,128,.1);color:inherit;text-decoration:none;
  animation:ls-rise .6s cubic-bezier(.2,.7,.2,1) backwards;animation-delay:calc(var(--i,0)*80ms + .15s);
  transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease
}
.ls-blue{--tone:#0284c7;--tone-bg:rgba(2,132,199,.18)}
.ls-teal{--tone:#0e9488;--tone-bg:rgba(14,148,136,.18)}
.ls-pink{--tone:#d6336c;--tone-bg:rgba(214,51,108,.16)}
.ls-green{--tone:#16a34a;--tone-bg:rgba(22,163,74,.18)}
.ls-amber{--tone:#d9730d;--tone-bg:rgba(217,115,13,.18)}
.ls-violet{--tone:#7c4dcc;--tone-bg:rgba(124,77,204,.18)}

/* big faint icon in the corner */
.ls-ghost{position:absolute;right:-18px;bottom:-22px;color:var(--tone);opacity:.08;pointer-events:none;transition:transform .5s cubic-bezier(.2,.7,.2,1),opacity .3s}
a.ls-card:hover .ls-ghost{transform:rotate(-10deg) scale(1.15);opacity:.14}

a.ls-card:hover{transform:translateY(-6px);border-color:var(--tone);box-shadow:0 16px 36px color-mix(in srgb,var(--tone) 28%,transparent)}
a.ls-card:active{transform:translateY(-2px) scale(.99)}
a.ls-card:focus-visible{outline:3px solid var(--tone);outline-offset:3px}
.ls-card.off{opacity:.55;cursor:not-allowed}

.ls-ic{position:relative;width:56px;height:56px;border-radius:18px;display:grid;place-items:center;background:var(--tone-bg);color:var(--tone);margin-bottom:20px;transition:transform .3s cubic-bezier(.3,1.6,.5,1),background .25s,color .25s}
a.ls-card:hover .ls-ic{transform:rotate(-8deg) scale(1.1);background:var(--tone);color:#fff}
.ls-name{position:relative;font-size:18px;font-weight:800;margin:0 0 8px}
.ls-desc{position:relative;margin:0 0 auto;padding-bottom:18px;font-size:14px;line-height:1.5;opacity:.7}

.ls-foot{position:relative;display:flex;align-items:center;justify-content:space-between;font-weight:800;font-size:14px}
.ls-count{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:999px;background:var(--tone-bg);color:var(--tone)}
.ls-soon{display:inline-flex;align-items:center;gap:6px;opacity:.7}
.ls-go{display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:var(--tone-bg);color:var(--tone);transition:background .25s,color .25s}
.ls-go svg{transition:transform .2s}
a.ls-card:hover .ls-go{background:var(--tone);color:#fff}
a.ls-card:hover .ls-go svg{transform:translateX(3px)}

.ls-badge{position:absolute;top:16px;right:18px;display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:999px;background:var(--tone);color:#fff;font-size:12px;font-weight:800;animation:ls-pop .6s .8s cubic-bezier(.3,1.6,.5,1) backwards}
a.ls-card:hover .ls-badge svg{animation:ls-twinkle .6s ease}

@keyframes ls-rise{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
@keyframes ls-pop{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:scale(1)}}
@keyframes ls-twinkle{0%{transform:scale(1) rotate(0)}50%{transform:scale(1.4) rotate(20deg)}100%{transform:scale(1) rotate(0)}}

@media (prefers-reduced-motion:reduce){
  .ls-card,.ls-title-ic,.ls-sub,.ls-badge,.ls-badge svg,.ls-peek{animation:none!important}
  .ls-card,.ls-ic,.ls-go,.ls-go svg,.ls-ghost,.ls-peek{transition:none!important}
}
`

export default function TopicPage({ title, icon: TitleIcon, items, unit }) {
  return (
    <AppShell userName="y/n">
      <style>{css}</style>

      <h1 className="ls-title">
        <span className="ls-title-ic">
          <TitleIcon size={28} aria-hidden />
        </span>
        {title}
        <span className="ls-sub">Сэдвээ сонгоод суралцаж эхлээрэй</span>
      </h1>

      <div className="ls-grid">
        {items.map((l, idx) => {
          const Icon = l.icon
          const inner = (
            <>
              <Icon className="ls-ghost" size={150} strokeWidth={1.5} aria-hidden />
              {l.isNew && (
                <span className="ls-badge">
                  <Sparkles size={12} aria-hidden />
                  Шинэ
                </span>
              )}
              <div className="ls-ic">
                <Icon size={26} aria-hidden />
              </div>
              <h3 className="ls-name">{l.title}</h3>
              <p className="ls-desc">{l.desc}</p>
              <div className="ls-foot">
                {l.href ? (
                  <span className="ls-count">
                    <Layers size={15} aria-hidden />
                    {l.count} {unit}
                  </span>
                ) : (
                  <span className="ls-soon">
                    <Clock size={15} aria-hidden />
                    Тун удахгүй
                  </span>
                )}
                {l.href && (
                  <span className="ls-go">
                    <ArrowRight size={18} aria-hidden />
                  </span>
                )}
              </div>
            </>
          )
          const cls = `ls-card ls-${l.tone}`
          const style = { '--i': idx }
          return (
            <div key={l.title} className="ls-wrap" style={style}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="ls-peek" src="/images/sheep/peek.png" alt="" aria-hidden />
              {l.href ? (
                <Link href={l.href} className={cls}>
                  {inner}
                </Link>
              ) : (
                <div className={`${cls} off`} aria-disabled="true">
                  {inner}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </AppShell>
  )
}
