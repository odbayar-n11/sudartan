'use client';

import { useState } from 'react';
import Link from 'next/link';
import LessonScreen from '../myclass/components/LessonScreen';
import DuoQuiz from '../myclass/components/DuoQuiz';

// Trial Журамласан үг exercise (from the homepage "Туршилтын дасгал" button).
// Same full-screen, two-sheep format as the real lesson; no login needed, nothing is saved.

// meaning → [correct spelling, wrong spelling]
const WORDS = [
  { id: 1, meaning: 'Төрөлхөөс өгөгдсөн чадвар', correct: 'Авьяас', wrong: 'Авъяас' },
  { id: 2, meaning: '7 дахь', correct: 'Долоодугаар', wrong: 'Долдугаар' },
  { id: 3, meaning: 'Их хэмжээний, том', correct: 'Аварга', wrong: 'Аврага' },
  { id: 4, meaning: 'Олон давхарга бүхий хүнсний ногоо', correct: 'Байцай', wrong: 'Байцаа' },
  { id: 5, meaning: '8 хөлт далайн амьтан', correct: 'Наймалж', wrong: 'Наймаалж' },
  { id: 6, meaning: 'Хальт хөндөн ярих', correct: 'Дурдах', wrong: 'Дурьдах' },
  { id: 7, meaning: 'Өнгөрснийг дурсан санах бодол', correct: 'Дуртгал', wrong: 'Дурдатгал' },
  { id: 8, meaning: 'Зөвлөгөө', correct: 'Зааварчилгаа', wrong: 'Зааварчлагаа' },
  { id: 9, meaning: 'Уртлаг дугуй хэлбэр дүрс', correct: 'Зууван', wrong: 'Зуйван' },
  { id: 10, meaning: 'Буддын шашны уншлагын ном', correct: 'Маани', wrong: 'Маань' },
];

const css = `
.tr-btn{display:inline-flex;align-items:center;gap:6px;padding:10px 18px;border-radius:999px;border:2px solid rgba(128,128,128,.3);background:transparent;color:inherit;font-weight:800;font-size:14px;text-decoration:none}
.tr-btn:hover{background:rgba(128,128,128,.12)}
.tr-btn.primary{background:#0284c7;border-color:#0284c7;color:#fff}
.tr-btn.primary:hover{background:#0369a1}
`;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// First load uses a fixed order that still varies per word (server and browser must render
// the same thing); "play again" reshuffles for real.
const fixedOrder = (w) => (w.meaning.length % 2 ? [w.correct, w.wrong] : [w.wrong, w.correct]);

function buildQuestions(random = false) {
  return WORDS.map((w) => ({
    id: w.id,
    type: 'sheep',
    prompt: w.meaning,
    answer: w.correct,
    explanation: `«${w.wrong}» гэж бичих нь буруу.`,
    options: random ? shuffle([w.correct, w.wrong]) : fixedOrder(w),
  }));
}

export default function TrialVocabPage() {
  const [questions, setQuestions] = useState(() => buildQuestions());
  const [round, setRound] = useState(0);

  const restart = () => {
    setQuestions(buildQuestions(true));
    setRound((r) => r + 1);
  };

  return (
    <LessonScreen exitHref="/">
      <style>{css}</style>
      <DuoQuiz
        key={round}
        questions={questions}
        label="Энэ утгатай үгийн аль нь зөв бичигдсэн бэ?"
        promptSize={20}
        onRestart={restart}
        actions={
          <>
            <Link href="/signup" className="tr-btn primary">
              Бүртгүүлэх
            </Link>
            <Link href="/" className="tr-btn">
              ← Буцах
            </Link>
          </>
        }
      />
    </LessonScreen>
  );
}
