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
    photo: '/images/exercises/vg.jpg',
    color: '#2e3093',
  },
  {
    title: 'Хэлц үг',
    desc: 'Өдөр тутмын яриан дахь хэлц, зүйр цэцэн үг',
    count: 15,
    icon: MessageCircle,
    tone: 'pink',
    href: '/idioms',
    photo: '/images/exercises/idioms.jpg',
    color: '#63ba50',
  },
  {
    title: 'Эртний үг',
    desc: 'Эртний монгол үгс, тэдгээрийн утга ба хэрэглээ',
    count: 4,
    icon: ScrollText,
    tone: 'amber',
    href: '/ancient',
    photo: '/images/exercises/ancient.jpg',
    color: '#f8f1e4',
  },
]

export default function ExercisesPage() {
  return <TopicPage title="Дасгал" icon={PencilRuler} items={EXERCISES} unit="дасгал" />
}
