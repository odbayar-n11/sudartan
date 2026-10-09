'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
// Updated import path for AppShell located in app/myclass/components
import AppShell from '../myclass/components/AppShell';

// Helper function to divide words into sets of 15
const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

export default function QuizSetsPage() {
  const [quizSets, setQuizSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWords = async () => {
      const { data, error } = await supabase
        .from('word_corrections')
        .select('id, wrong_version, correct_version, meaning')
        .order('id', { ascending: true });

      if (error) {
        console.error('Error fetching words:', error);
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
      {/* Header Banner */}
      <div className="top">
        <div>
          <h1>Дасгалын багцууд</h1>
          <p className="lead">Өөрийн түвшинд тохирсон дасгалыг сонгон хийгээрэй</p>
        </div>
        <div className="chips">
          <div className="chip">🔥 0</div>
          <div className="chip">💎 20</div>
        </div>
      </div>

      <h2 className="sec">
        <span className="ib" aria-hidden="true">📖</span> Боломжит дасгалууд
      </h2>

      {loading ? (
        <div className="panel" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--mute)', fontWeight: '700' }}>
            Дасгалуудыг ачаалж байна...
          </p>
        </div>
      ) : (
        <div className="cards">
          {quizSets.map((set, index) => {
            const setNumber = index + 1;
            return (
              <div key={index} className="tcard">
                <span className="st a tcard-badge">15 Асуулт</span>
                <div className="tcard-ic">📝</div>
                <h3>Дасгал #{setNumber}</h3>
                <p>
                  Нийт {set.length} асуулттай зөв бичих дүрмийн дасгал багц.
                </p>
                <div className="tcard-foot">
                  <Link
                    href={`/quiz?set=${setNumber}`}
                    className="btn"
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      textDecoration: 'none',
                      marginTop: '10px',
                    }}
                  >
                    Эхлэх →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}