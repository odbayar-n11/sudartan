'use client'

import Link from 'next/link'
import {
  Pencil,
  Mic,
  MessageCircle,
  PenTool,
  ScrollText,
  BookOpen,
  ArrowRight,
} from 'lucide-react'
import AppShell from '../components/AppShell'

/*
  Ө Г Ө Г Д Л И Й Г   Э Н Д   З А С А А Рай
  href:  карт дээр дарахад орох зам. null бол "Тун удахгүй" болно.
  count: картан дээр харагдах хичээлийн тоо.
  isNew: true бол "Шинэ" тэмдэг гарна.
*/
const LESSONS = [
  {
    title: 'Зөв бичих дүрэм',
    desc: 'Зөв бичгийн дүрэм, түгээмэл алдаанууд',
    count: 24,
    icon: Pencil,
    href: '/grammar?mode=quiz', // шууд Duolingo quiz эхэлнэ
  },
  {
    title: 'Журамласан үг',
    desc: 'Журамласан үгсийг зөв хэрэглэх нь',
    count: 18,
    icon: Mic,
    href: '/vg', // "Дасгалын багцууд" хуудас → /quiz?set=N
  },
  {
    title: 'Хэлц үг',
    desc: 'Өдөр тутмын яриан дахь хэлц, зүйр цэцэн үг',
    count: 15,
    icon: MessageCircle,
    href: '/idioms',
    isNew: true,
  },
  {
    title: 'Монгол бичиг',
    desc: 'Уламжлалт босоо бичгийг эхнээс нь сурах',
    count: 20,
    icon: PenTool,
    href: '/script?mode=quiz',
  },
  {
    title: 'Эртний үг',
    desc: 'Эртний монгол үгс, тэдгээрийн утга ба хэрэглээ',
    count: 4,
    icon: ScrollText,
    href: '/ancient',
  },
  {
    title: 'Уран дүрслэл',
    desc: 'Адилтгал, зүйрлэл, хүншүүлэл…',
    count: 10,
    icon: BookOpen,
    href: '/uran-durslel?mode=quiz',
  },
]

const css = `
.ls-title{font-size:34px;font-weight:900;line-height:1.2;margin:0 0 24px}
.ls-title span{color:#0284c7}
.ls-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px}
.ls-card{position:relative;display:flex;flex-direction:column;min-height:210px;padding:24px;border-radius:28px;border:1px solid rgba(128,128,128,.22);background:rgba(128,128,128,.1);color:inherit;text-decoration:none;transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}
a.ls-card:hover{transform:translateY(-6px);border-color:#0284c7;box-shadow:0 14px 34px rgba(2,132,199,.25)}
a.ls-card:active{transform:translateY(-2px) scale(.99)}
a.ls-card:focus-visible{outline:3px solid #0284c7;outline-offset:3px}
.ls-card.off{opacity:.55;cursor:not-allowed}
.ls-ic{width:56px;height:56px;border-radius:16px;display:grid;place-items:center;background:rgba(128,128,128,.18);margin-bottom:22px;transition:transform .25s}
a.ls-card:hover .ls-ic{transform:rotate(-8deg) scale(1.08);background:rgba(2,132,199,.22);color:#0284c7}
.ls-name{font-size:18px;font-weight:800;margin:0 0 8px}
.ls-desc{margin:0 0 auto;padding-bottom:18px;font-size:14px;line-height:1.5;opacity:.7}
.ls-foot{display:flex;align-items:center;justify-content:space-between;font-weight:800;font-size:14px;color:#0284c7}
.ls-foot svg{transition:transform .2s}
a.ls-card:hover .ls-foot svg{transform:translateX(6px)}
.ls-soon{color:inherit;opacity:.7}
.ls-badge{position:absolute;top:16px;right:20px;padding:3px 12px;border-radius:999px;background:#0284c7;color:#fff;font-size:12px;font-weight:800}
@media (prefers-reduced-motion:reduce){.ls-card,.ls-ic,.ls-foot svg{transition:none!important}}
`

export default function LessonsPage() {
  return (
    <AppShell userName="y/n">
      <style>{css}</style>

      <h1 className="ls-title">
        Хичээлүүд <span>Сэдвээ сонгоод суралцаж эхлээрэй</span>
      </h1>

      <div className="ls-grid">
        {LESSONS.map((l) => {
          const Icon = l.icon
          const inner = (
            <>
              {l.isNew && <span className="ls-badge">Шинэ</span>}
              <div className="ls-ic">
                <Icon size={26} />
              </div>
              <h3 className="ls-name">{l.title}</h3>
              <p className="ls-desc">{l.desc}</p>
              <div className="ls-foot">
                <span className={l.href ? '' : 'ls-soon'}>
                  {l.href ? `${l.count} хичээл` : 'Тун удахгүй'}
                </span>
                {l.href && <ArrowRight size={18} />}
              </div>
            </>
          )
          return l.href ? (
            <Link key={l.title} href={l.href} className="ls-card">
              {inner}
            </Link>
          ) : (
            <div key={l.title} className="ls-card off" aria-disabled="true">
              {inner}
            </div>
          )
        })}
      </div>
    </AppShell>
  )
}