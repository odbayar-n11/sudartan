'use client'

import Link from 'next/link'
import { ArrowUpRight, Clock } from 'lucide-react'
import AppShell from './AppShell'

// Shared card grid for the Хичээл and Дасгал pages: tall, bold colour-block cards.
// items: [{ title, desc, count, href, photo, color }]; unit is the word after the count.

// Fallback colours if an item has none
const PALETTE = ['#f6d36b', '#f26a4b', '#f7a8d0', '#9ad8b4', '#8ec5f5', '#c9b6f2']

// White text on dark card colours, near-black text on light ones
function textOn(hex) {
  const n = parseInt(hex.slice(1), 16)
  const lin = (c) => {
    c /= 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const L = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return L < 0.3 ? '#ffffff' : '#141414'
}

const css = `
.ls-title {
  display: flex !important;
  align-items: center;
  flex-wrap: wrap;
  column-gap: 14px;
  font-size: 34px !important;
  font-weight: 900 !important;
  line-height: 1.2 !important;
  margin-bottom: 24px !important;
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

.tp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(280px,100%),1fr));gap:20px}

.tp-card{
  position:relative;display:flex;flex-direction:column;
  overflow:hidden;
  padding:22px 22px 20px;border-radius:24px;
  background:var(--bg);color:var(--fg);text-decoration:none;
  box-shadow:0 10px 26px rgba(15,23,42,.08),inset 0 0 0 1px rgba(15,23,42,.05);
  animation:ls-rise .6s cubic-bezier(.2,.7,.2,1) backwards;animation-delay:calc(var(--i,0)*90ms + .15s);
  transition:transform .3s cubic-bezier(.2,.7,.2,1),box-shadow .3s ease
}
a.tp-card:hover{transform:translateY(-6px) rotate(-.4deg);box-shadow:0 22px 44px color-mix(in srgb,var(--bg) 55%,transparent)}
a.tp-card:active{transform:translateY(-2px) scale(.99)}
a.tp-card:focus-visible{outline:3px solid #0284c7;outline-offset:4px}
.tp-card.off{cursor:not-allowed;opacity:.6}

.tp-top{display:flex;align-items:center;justify-content:space-between;font-size:13px;font-weight:800}
.tp-brand{display:inline-flex;align-items:center;gap:7px}
.tp-brand img{width:22px;height:22px;object-fit:contain}
.tp-num{font-variant-numeric:tabular-nums;opacity:.7}

/* picture runs edge to edge and fades into the card colour at top and bottom */
.tp-art{height:clamp(150px,22vh,200px);margin:12px -22px 14px;background-size:cover;background-position:50% 4%;-webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 22%,#000 72%,transparent 100%);mask-image:linear-gradient(to bottom,transparent 0,#000 22%,#000 72%,transparent 100%)}

.tp-name{margin:0;font-size:clamp(26px,2.4vw,32px);font-weight:900;line-height:1.08;letter-spacing:-.02em}
.tp-rule{height:0;border:0;border-top:1.5px solid currentColor;opacity:.55;margin:16px 0}
.tp-desc{margin:0;font-size:14px;line-height:1.5;font-weight:600;opacity:.82;min-height:calc(1.5em * 2);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}

.tp-foot{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-top:auto}
.tp-count{display:flex;flex-direction:column;line-height:1}
.tp-count b{font-size:clamp(34px,3.2vw,44px);font-weight:900;letter-spacing:-.03em}
.tp-count span{margin-top:6px;font-size:13px;font-weight:700;opacity:.8}
.tp-soon{display:inline-flex;align-items:center;gap:6px;font-weight:800;font-size:14px}
.tp-arrow{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;border:1.5px solid currentColor;transition:background .25s,color .25s,transform .3s cubic-bezier(.3,1.6,.5,1)}
a.tp-card:hover .tp-arrow{background:var(--fg);color:var(--bg);border-color:var(--fg);transform:rotate(45deg)}

@keyframes ls-rise{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
@keyframes ls-pop{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:scale(1)}}

@media (max-width:700px){
  .tp-art{height:170px}
}
@media (prefers-reduced-motion:reduce){
  .tp-card,.ls-title-ic,.ls-sub{animation:none!important}
  .tp-card,.tp-arrow{transition:none!important}
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

      <div className="tp-grid">
        {items.map((l, idx) => {
          const inner = (
            <>
              <div className="tp-top">
                <span className="tp-brand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logo.png" alt="" aria-hidden />
                  Судартан
                </span>
                <span className="tp-num">{String(idx + 1).padStart(2, '0')}</span>
              </div>

              <div
                className="tp-art"
                style={l.photo ? { backgroundImage: `url(${l.photo})` } : undefined}
                aria-hidden
              />

              <h3 className="tp-name">{l.title}</h3>
              <hr className="tp-rule" />
              <p className="tp-desc">{l.desc}</p>
              <hr className="tp-rule" />

              <div className="tp-foot">
                {l.href ? (
                  <span className="tp-count">
                    <b>{l.count}</b>
                    <span>{unit}</span>
                  </span>
                ) : (
                  <span className="tp-soon">
                    <Clock size={15} aria-hidden />
                    Тун удахгүй
                  </span>
                )}
                {l.href && (
                  <span className="tp-arrow">
                    <ArrowUpRight size={20} aria-hidden />
                  </span>
                )}
              </div>
            </>
          )
          const bg = l.color || PALETTE[idx % PALETTE.length]
          const style = { '--i': idx, '--bg': bg, '--fg': textOn(bg) }
          return l.href ? (
            <Link key={l.title} href={l.href} className="tp-card" style={style}>
              {inner}
            </Link>
          ) : (
            <div key={l.title} className="tp-card off" style={style} aria-disabled="true">
              {inner}
            </div>
          )
        })}
      </div>
    </AppShell>
  )
}
