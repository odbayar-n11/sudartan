'use client'

import { Mic, MessageCircle, ScrollText, PencilRuler } from 'lucide-react'
import TopicPage from '../components/TopicPage'

const EXERCISES = [
  {
    title: 'Журамласан үг',
    desc: 'Журамласан үгсийг зөв хэрэглэх нь',
    count: 18,
    icon: Mic,
    tone: 'teal',
    href: '/vg',
  },
  {
    title: 'Хэлц үг',
    desc: 'Өдөр тутмын яриан дахь хэлц, зүйр цэцэн үг',
    count: 15,
    icon: MessageCircle,
    tone: 'pink',
    href: '/idioms',
  },
  {
    title: 'Эртний үг',
    desc: 'Эртний монгол үгс, тэдгээрийн утга ба хэрэглээ',
    count: 4,
    icon: ScrollText,
    tone: 'amber',
    href: '/ancient',
  },
]

export default function ExercisesPage() {
  return <TopicPage title="Дасгал" icon={PencilRuler} items={EXERCISES} unit="дасгал" />
}
