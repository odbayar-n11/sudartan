'use client'

import { Pencil, PenTool, BookOpen, GraduationCap } from 'lucide-react'
import TopicPage from '../components/TopicPage'

const LESSONS = [
  {
    title: 'Зөв бичих дүрэм',
    desc: 'Зөв бичгийн дүрэм, түгээмэл алдаанууд',
    count: 24,
    icon: Pencil,
    tone: 'blue',
    href: '/grammar',
    photo: '/images/lessons/grammar.jpg',
    color: '#0957c3',
  },
  {
    title: 'Монгол бичиг',
    desc: 'Уламжлалт босоо бичгийг эхнээс нь сурах',
    count: 20,
    icon: PenTool,
    tone: 'green',
    href: '/script',
    photo: '/images/lessons/script.jpg',
    color: '#668738',
  },
  {
    title: 'Уран дүрслэл',
    desc: 'Адилтгал, зүйрлэл, хүншүүлэл…',
    count: 10,
    icon: BookOpen,
    tone: 'violet',
    href: '/uran-durslel',
    photo: '/images/lessons/literary.jpg',
    color: '#daa20a',
  },
]

export default function LessonsPage() {
  return <TopicPage title="Хичээл" icon={GraduationCap} items={LESSONS} unit="хичээл" />
}
