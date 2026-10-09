'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const TIME_PER_QUESTION = 10;
const ADVANCE_DELAY = 1300;
const SET_SIZE = 15;

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 text-slate-800 font-serif">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-slate-300" />
        <div className="absolute inset-0 rounded-full border-2 border-slate-700 border-t-transparent animate-spin" />
      </div>
      <p className="text-slate-600 text-sm font-medium tracking-wide">Ачаалж байна…</p>
    </div>
  );
}

function QuizInner() {
  const searchParams = useSearchParams();
  const setParam = parseInt(searchParams.get('set') || '1', 10);

  const [questions, setQuestions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [stage, setStage] = useState('intro'); // 'intro' | 'quiz' | 'finished'
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const advanceTimeout = useRef(null);

  // Fetch words for this specific set from Supabase
  useEffect(() => {
    const fetchSetData = async () => {
      setLoadingData(true);
      
      // Calculate pagination range for 15 items per set
      const fromIndex = (setParam - 1) * SET_SIZE;
      const toIndex = fromIndex + SET_SIZE - 1;

      const { data, error } = await supabase
        .from('word_corrections')
        .select('id, wrong_version, correct_version, meaning')
        .range(fromIndex, toIndex)
        .order('id', { ascending: true });

      if (error) {
        console.error('Supabase query error:', error);
      } else if (data) {
        // Transform database rows into quiz questions
        const formattedQuestions = data.map((item) => {
          // Randomize option order (А vs Б)
          const isCorrectFirst = Math.random() < 0.5;
          const options = isCorrectFirst
            ? [
                { id: 'А', text: item.correct_version },
                { id: 'Б', text: item.wrong_version },
              ]
            : [
                { id: 'А', text: item.wrong_version },
                { id: 'Б', text: item.correct_version },
              ];

          return {
            id: item.id,
            prompt: item.meaning || 'Зөв бичигдсэн үгийг сонгоно уу.',
            options,
            correctIndex: isCorrectFirst ? 0 : 1,
          };
        });

        setQuestions(formattedQuestions);
      }
      setLoadingData(false);
    };

    fetchSetData();
  }, [setParam]);

  const currentQuestion = questions[currentIdx];
  const isAnswered = selectedOption !== null || timeLeft === 0;

  // Countdown timer for current question
  useEffect(() => {
    if (stage !== 'quiz' || isAnswered) return undefined;
    if (timeLeft === 0) return undefined;

    const tick = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(tick);
  }, [stage, timeLeft, isAnswered]);

  // Auto-advance after selecting an option or timing out
  useEffect(() => {
    if (stage !== 'quiz' || !isAnswered) return undefined;

    advanceTimeout.current = setTimeout(() => {
      goToNext();
    }, ADVANCE_DELAY);

    return () => clearTimeout(advanceTimeout.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnswered, stage]);

  const goToNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
      setTimeLeft(TIME_PER_QUESTION);
    } else {
      setStage('finished');
    }
  };

  const handleSkip = () => {
    if (isAnswered) return;
    setTimeLeft(0);
  };

  const handleSelect = (index) => {
    if (isAnswered) return;
    setSelectedOption(index);
    if (index === currentQuestion.correctIndex) {
      setScore((s) => s + 100);
    }
  };

  if (loadingData) return <LoadingScreen />;

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center font-serif">
        <h2 className="text-xl font-bold mb-4">Дасгалын мэдээлэл олдсонгүй!</h2>
        <Link
          href="/quiz-sets"
          className="px-6 py-2 bg-slate-700 text-white rounded-xl text-sm"
        >
          Буцах
        </Link>
      </div>
    );
  }

  // ---------- INTRO STAGE ----------
  if (stage === 'intro') {
    return (
      <div className="min-h-screen bg-white text-slate-900 font-serif flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="max-w-xl w-full bg-slate-50 border border-slate-300 p-8 md:p-12 rounded-3xl shadow-xl text-center flex flex-col items-center z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
            Дасгал #{setParam}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4 text-slate-800">
            Дараах үгсээс зөв бичигдсэн үгийг сонгоорой!
          </h1>
          <p className="text-slate-600 text-sm md:text-base max-w-md mb-8 leading-relaxed">
            Асуулт бүрт 10 секунд өгөгдөнө. Нийт {questions.length} асуулт.
          </p>

          <button
            onClick={() => setStage('quiz')}
            className="w-full sm:w-auto px-10 py-4 bg-slate-700 hover:bg-slate-800 active:scale-[0.98] text-white font-semibold rounded-2xl shadow-md transition-all duration-200 cursor-pointer"
          >
            Эхлэх
          </button>

          <Link
            href="/quiz-sets"
            className="mt-6 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← Буцах
          </Link>
        </div>
      </div>
    );
  }

  // ---------- FINISHED STAGE ----------
  if (stage === 'finished') {
    const maxScore = questions.length * 100;
    const percentage = Math.round((score / maxScore) * 100);

    return (
      <div className="min-h-screen bg-white text-slate-900 font-serif flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="max-w-md w-full bg-slate-50 border border-slate-300 p-8 md:p-10 rounded-3xl shadow-xl text-center flex flex-col items-center z-10">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Дасгал дууслаа!</h2>

          <div className="w-full bg-white border border-slate-300 rounded-2xl p-6 mb-8 flex flex-col items-center justify-center shadow-sm">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
              Нийт оноо
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-800">{score}</span>
              <span className="text-slate-500 text-sm font-semibold">/ {maxScore}</span>
            </div>
            <span className="mt-3 text-xs font-medium px-3 py-1 rounded-full bg-slate-200 text-slate-700 border border-slate-300">
              Гүйцэтгэл: {percentage}%
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <Link href="/" className="w-full">
              <button className="w-full py-3.5 border border-slate-300 hover:bg-slate-200/50 active:scale-[0.98] rounded-xl font-semibold transition-all cursor-pointer text-sm text-slate-700">
                Нүүр хуудас
              </button>
            </Link>
            <Link href="/quiz-sets" className="w-full">
              <button className="w-full py-3.5 bg-slate-700 hover:bg-slate-800 active:scale-[0.98] text-white rounded-xl font-semibold shadow-md transition-all cursor-pointer text-sm">
                Бусад дасгалууд
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------- QUIZ GAME STAGE ----------
  const timerRatio = timeLeft / TIME_PER_QUESTION;
  const timerColorClass =
    timerRatio > 0.6
      ? 'bg-emerald-600'
      : timerRatio > 0.3
      ? 'bg-amber-600'
      : 'bg-rose-600';

  return (
    <div className="min-h-screen bg-white text-slate-900 font-serif flex flex-col justify-between relative overflow-hidden">
      {/* Header */}
      <header className="px-6 pt-6 max-w-2xl w-full mx-auto relative z-10">
        <div className="flex items-center justify-between gap-4 mb-4">
          <Link
            href="/quiz-sets"
            className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-400 transition-all shadow-sm"
            aria-label="Close"
          >
            ✕
          </Link>

          <span className="text-xs font-medium tracking-wider text-slate-600 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-300">
            {currentIdx + 1} / {questions.length}
          </span>

          <button
            onClick={handleSkip}
            disabled={isAnswered}
            className="h-9 px-4 text-xs font-semibold rounded-xl bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
          >
            Алгасах
          </button>
        </div>

        {/* Timer Line */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className={`h-full ${timerColorClass} transition-all duration-1000 ease-linear`}
            style={{ width: `${timerRatio * 100}%` }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-6 max-w-2xl w-full mx-auto relative z-10">
        <div className="w-full bg-slate-50 border border-slate-300 p-6 md:p-10 rounded-3xl shadow-xl transition-all">
          {currentQuestion?.prompt && (
            <div className="mb-8 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                Утга:
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 leading-snug">
                {currentQuestion.prompt.replace(/^Утга:\s*/, '')}
              </h1>
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQuestion?.options.map((opt, i) => {
              const isSelected = selectedOption === i;
              const isCorrectOpt = i === currentQuestion.correctIndex;

              let style =
                'bg-white border-slate-300 hover:border-slate-500 hover:bg-slate-100/50 text-slate-800';
              let badgeStyle = 'bg-slate-200 text-slate-700 border-slate-300';

              if (isAnswered) {
                if (isCorrectOpt) {
                  style =
                    'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm';
                  badgeStyle = 'bg-emerald-600 text-white border-emerald-600 font-bold';
                } else if (isSelected) {
                  style = 'bg-rose-50 border-rose-500 text-rose-900 shadow-sm';
                  badgeStyle = 'bg-rose-600 text-white border-rose-600 font-bold';
                } else {
                  style = 'bg-slate-100 border-slate-200 text-slate-400 opacity-50';
                  badgeStyle = 'bg-slate-200 text-slate-400 border-slate-200';
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(i)}
                  disabled={isAnswered}
                  className={`p-5 rounded-2xl border text-left flex items-center gap-4 min-h-[76px] transition-all duration-200 transform active:scale-[0.99] cursor-pointer ${style}`}
                >
                  <span
                    className={`w-9 h-9 shrink-0 rounded-xl border flex items-center justify-center text-xs font-semibold transition-all ${badgeStyle}`}
                  >
                    {opt.id}
                  </span>
                  <span className="text-base font-medium leading-snug">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          <div className="min-h-[28px] mt-6 flex items-center justify-center">
            {isAnswered && (
              <p
                className={`text-center text-xs font-semibold tracking-wide transition-all ${
                  selectedOption === null
                    ? 'text-amber-700'
                    : selectedOption === currentQuestion.correctIndex
                    ? 'text-emerald-700'
                    : 'text-rose-700'
                }`}
              >
                {selectedOption === null
                  ? `⏱ Хариулт хоосон! Зөв хариулт: ${currentQuestion.options[currentQuestion.correctIndex].text}`
                  : selectedOption === currentQuestion.correctIndex
                  ? '✓ Зөв хариуллаа!'
                  : `✕ Зөв хариулт: ${currentQuestion.options[currentQuestion.correctIndex].text}`}
              </p>
            )}
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-500 font-medium">
        Зөв бичих дүрэм
      </footer>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <QuizInner />
    </Suspense>
  );
}