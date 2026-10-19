'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Layers,
  Mic,
  Play,
  Loader2,
  TriangleAlert,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AppShell from '../myclass/components/AppShell';

// Helper function to divide words into sets of 15
const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

const css = `
.sx{--tone:#0e9488;--tone-bg:rgba(14,148,136,.16)}
.sx{width:100%;min-width:0;box-sizing:border-box;align-self:stretch;text-align:left}
.sx .top,.sx .lead{text-align:left;justify-content:flex-start}
.sx .st-state{text-align:center}

.st-back{display:inline-flex;align-items:center;gap:8px;margin-bottom:18px;padding:8px 16px;border-radius:999px;border:2px solid rgba(128,128,128,.3);background:transparent;color:inherit;font-weight:800;font-size:14px;text-decoration:none;cursor:pointer;animation:st-rise .5s backwards;transition:background .2s,border-color .2s,transform .15s}
.st-back:hover{background:rgba(128,128,128,.12);border-color:var(--tone)}
.st-arl{transition:transform .2s}
.st-back:hover .st-arl{transform:translateX(-4px)}
.st-back:active{transform:scale(.96)}
.st-back:focus-visible,.an-start:focus-visible{outline:3px solid var(--tone);outline-offset:3px}

.st-h1{display:flex;align-items:center;gap:12px}
.st-hico{display:grid;place-items:center;width:42px;height:42px;border-radius:14px;background:var(--tone-bg);color:var(--tone);animation:st-pop .6s cubic-bezier(.3,1.6,.5,1) backwards}

.st-sec-h{display:flex;align-items:center;gap:10px;margin:8px 0 18px;font-size:20px;font-weight:800;animation:st-rise .5s backwards}
.st-sec-h svg{color:var(--tone)}

.an-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(260px,100%),1fr));gap:20px}
.an-card{position:relative;overflow:hidden;display:flex;flex-direction:column;min-width:0;min-height:240px;padding:24px;border-radius:28px;border:1px solid rgba(128,128,128,.22);background:rgba(128,128,128,.1);animation:st-rise .6s cubic-bezier(.2,.7,.2,1) backwards;animation-delay:calc(var(--i,0)*70ms + .1s);transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}
.an-card:hover{transform:translateY(-6px);border-color:var(--tone);box-shadow:0 16px 36px color-mix(in srgb,var(--tone) 28%,transparent)}
.an-ghost{position:absolute;right:-18px;bottom:-22px;color:var(--tone);opacity:.08;pointer-events:none;transition:transform .5s cubic-bezier(.2,.7,.2,1),opacity .3s}
.an-card:hover .an-ghost{transform:rotate(-10deg) scale(1.15);opacity:.14}
.an-badge{position:absolute;top:16px;right:18px;display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:999px;background:var(--tone-bg);color:var(--tone);font-size:12px;font-weight:800}
.an-ic{position:relative;width:56px;height:56px;border-radius:18px;display:grid;place-items:center;background:var(--tone-bg);color:var(--tone);margin-bottom:18px;transition:transform .3s cubic-bezier(.3,1.6,.5,1),background .25s,color .25s}
.an-card:hover .an-ic{transform:rotate(-8deg) scale(1.1);background:var(--tone);color:#fff}
.an-name{position:relative;font-size:20px;font-weight:800;margin:0 0 8px}
.an-words{position:relative;margin:0 0 16px;font-size:16px;line-height:1.55;opacity:.75;overflow-wrap:anywhere}

.an-start{position:relative;margin-top:auto;display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;box-sizing:border-box;padding:11px 18px;border:0;border-radius:999px;background:var(--tone);color:#fff;font:inherit;font-size:15px;font-weight:800;text-decoration:none;cursor:pointer;box-shadow:0 6px 16px color-mix(in srgb,var(--tone) 35%,transparent);transition:transform .2s ease,box-shadow .2s ease}
.an-start:hover{transform:translateY(-2px);box-shadow:0 10px 22px color-mix(in srgb,var(--tone) 42%,transparent)}
.an-start:active{transform:scale(.97)}
.an-start .an-ar{transition:transform .2s}
.an-start:hover .an-ar{transform:translateX(4px)}

.st-state{display:flex;align-items:center;justify-content:center;gap:10px;text-align:center;animation:st-rise .5s backwards}
.st-spin{animation:st-spin 1s linear infinite}

@keyframes st-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes st-pop{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:scale(1)}}
@keyframes st-spin{to{transform:rotate(360deg)}}

@media (max-width:600px){.an-card{padding:20px}.st-h1{font-size:28px}}

@media (prefers-reduced-motion:reduce){
  .sx *,.sx *::before{animation:none!important;transition:none!important}
}
`;

export default function QuizSetsPage() {
  const [quizSets, setQuizSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWords = async () => {
      const { data, error } = await supabase
        .from('word_corrections')
        .select('id, wrong_version, correct_version, meaning')
        .order('id', { ascending: true });

      if (error) {
        console.error('Error fetching words:', error);
        setError(error.message);
      } else if (data) {
        const sets = chunkArray(data, 15);
        setQuizSets(sets);
      }
      setLoading(false);
    };

    fetchWords();
  }, []);

  return (
    <AppShell userName="y/n">
      <style>{css}</style>

      <div className="sx">
        <Link href="/myclass/lessons" className="st-back">
          <ArrowLeft className="st-arl" size={16} aria-hidden />
          Хичээлүүд рүү буцах
        </Link>

        {/* Header Banner */}
        <div className="top">
          <div>
            <h1 className="st-h1">
              <span className="st-hico">
                <Mic size={24} aria-hidden />
              </span>
              Дасгалын багцууд
            </h1>
            <p className="lead">Өөрийн түвшинд тохирсон дасгалыг сонгон хийгээрэй</p>
          </div>
        </div>

        <h2 className="st-sec-h">
          <FileText size={22} aria-hidden />
          Боломжит дасгалууд
        </h2>

        {error && (
          <div className="panel st-state" style={{ color: '#ef4444', fontWeight: 700 }}>
            <TriangleAlert size={20} aria-hidden />
            {error}
          </div>
        )}

        {loading ? (
          <div className="panel st-state" style={{ padding: '40px' }}>
            <Loader2 className="st-spin" size={20} aria-hidden />
            <span style={{ color: 'var(--mute)', fontWeight: 700 }}>
              Дасгалуудыг ачаалж байна...
            </span>
          </div>
        ) : (
          <div className="an-grid">
            {quizSets.map((set, index) => {
              const setNumber = index + 1;
              return (
                <div key={index} className="an-card" style={{ '--i': Math.min(index, 8) }}>
                  <FileText
                    className="an-ghost"
                    size={150}
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <span className="an-badge">
                    <Layers size={12} aria-hidden />
                    {set.length} асуулт
                  </span>

                  <div className="an-ic">
                    <FileText size={26} aria-hidden />
                  </div>
                  <h3 className="an-name">Дасгал #{setNumber}</h3>
                  <p className="an-words">
                    {set
                      .slice(0, 3)
                      .map((w) => w.correct_version)
                      .filter(Boolean)
                      .join(', ')}
                    {set.length > 3 ? '...' : ''}
                  </p>

                  <Link href={`/quiz?set=${setNumber}`} className="an-start">
                    <Play size={16} aria-hidden />
                    Эхлэх
                    <ArrowRight className="an-ar" size={16} aria-hidden />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}