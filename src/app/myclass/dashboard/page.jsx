"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import { supabase } from "../../../lib/supabase";
import "./dashboard.css";

/* ---------- Links ---------- */
const PLAN_HREF = "/myclass/plan";
const MISTAKES_HREF = "/myclass/stats";
const SAVED_HREF = "/myclass/saved";

const RING_R = 40;
const RING_C = 2 * Math.PI * RING_R;

/* ---------- Data helpers ---------- */
async function fetchPlan(token) {
  try {
    const res = await fetch("/api/plan", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function countRows(table, userId) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  return error ? null : count ?? 0;
}

async function recentSaved(userId) {
  let res = await supabase
    .from("saved_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(3);
  if (res.error) {
    res = await supabase
      .from("saved_items")
      .select("*")
      .eq("user_id", userId)
      .limit(3);
  }
  return res.error ? null : res.data;
}

async function dailyPick(table) {
  const { data, error } = await supabase.from(table).select("*").limit(200);
  if (error || !data?.length) return null;
  const day = Math.floor(Date.now() / 86400000);
  return data[day % data.length];
}

const SKIP = new Set(["id", "created_at", "updated_at", "user_id"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/i;

function pickText(row, keys) {
  for (const k of keys) {
    const v = row?.[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function otherTexts(row) {
  return Object.entries(row || {})
    .filter(
      ([k, v]) =>
        !SKIP.has(k) && typeof v === "string" && v.trim() && !UUID.test(v)
    )
    .map(([, v]) => v.trim());
}

function describe(row) {
  const title =
    pickText(row, ["word", "term", "idiom", "phrase", "title", "name", "text"]) ||
    otherTexts(row)[0] ||
    "";
  const meaning =
    pickText(row, ["meaning", "definition", "description", "translation", "explanation"]) ||
    otherTexts(row).find((t) => t !== title) ||
    "";
  return { title, meaning };
}

function summarizePlan(plan, done) {
  let total = 0;
  let finished = 0;
  let current = -1;

  plan.weeks.forEach((w, wi) => {
    const wDone = w.tasks.filter((_, ti) => done[`${wi}-${ti}`]).length;
    total += w.tasks.length;
    finished += wDone;
    if (current === -1 && wDone < w.tasks.length) current = wi;
  });

  const allDone = current === -1;
  const week = allDone ? plan.weeks.length - 1 : current;
  const nextIndex = allDone
    ? -1
    : plan.weeks[week].tasks.findIndex((_, ti) => !done[`${week}-${ti}`]);

  return {
    total,
    finished,
    percent: total ? Math.round((finished / total) * 100) : 0,
    week,
    allDone,
    nextTask: nextIndex >= 0 ? plan.weeks[week].tasks[nextIndex] : null,
  };
}

function Skeleton({ lines = 2 }) {
  return (
    <div aria-busy="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="hm-skel" style={{ width: `${85 - i * 15}%`, height: '12px', marginBottom: '8px' }} />
      ))}
    </div>
  );
}

function DailyCard({ title, row, ready, href, linkText }) {
  const d = row ? describe(row) : null;
  return (
    <section className="panel hm-card" style={{ padding: '12px 16px' }}>
      <h3 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>{title}</h3>
      {!ready ? (
        <Skeleton lines={2} />
      ) : d && d.title ? (
        <>
          <p className="hm-word" style={{ margin: '2px 0', fontSize: '0.9rem' }}>{d.title}</p>
          {d.meaning && <p className="hm-muted" style={{ fontSize: '0.8rem', margin: '0 0 6px 0' }}>{d.meaning}</p>}
          <Link href={href} className="hm-link" style={{ fontSize: '0.8rem' }}>
            {linkText}
          </Link>
        </>
      ) : (
        <p className="hm-muted" style={{ fontSize: '0.8rem' }}>Өнөөдрийн санал олдсонгүй.</p>
      )}
    </section>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const [userName, setUserName] = useState("");
  const [ready, setReady] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [done, setDone] = useState({});
  const [mistakes, setMistakes] = useState(null);
  const [saved, setSaved] = useState(null);
  const [word, setWord] = useState(null);
  const [idiom, setIdiom] = useState(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        if (alive) setReady(true);
        return;
      }

      const { data: sess } = await supabase.auth.getSession();
      const token = sess?.session?.access_token;

      const [profile, plan, mistakeCount, savedRows, wordRow, idiomRow] =
        await Promise.all([
          supabase.from("profiles").select("username").eq("id", user.id).single(),
          token ? fetchPlan(token) : null,
          countRows("mistakes", user.id),
          recentSaved(user.id),
          dailyPick("ancient_words"),
          dailyPick("mongolian_idioms"),
        ]);

      if (!alive) return;
      setUserName(profile?.data?.username || user.email.split("@")[0]);
      setPlanData(plan);
      setMistakes(mistakeCount);
      setSaved(savedRows);
      setWord(wordRow);
      setIdiom(idiomRow);
      setReady(true);
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const storageKey = planData?.createdAt ? `plan-done:${planData.createdAt}` : null;
  useEffect(() => {
    if (!storageKey) return;
    try {
      setDone(JSON.parse(localStorage.getItem(storageKey) || "{}"));
    } catch {
      setDone({});
    }
  }, [storageKey]);

  const plan = planData?.plan || null;
  const summary = useMemo(
    () => (plan ? summarizePlan(plan, done) : null),
    [plan, done]
  );

  const score = planData?.score ?? 0;
  const maxScore = planData?.maxScore || 800;
  const ratio = Math.min(Math.max(score / maxScore, 0), 1);

  return (
    <AppShell userName={userName}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', paddingBottom: '10px' }}>
        
        {/* Top Header */}
        <div className="top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0px' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', margin: 0 }}>
              Өдрийн мэнд, <small style={{ fontSize: '1rem' }}>{userName} 👋</small>
            </h1>
            <p className="lead" style={{ fontSize: '0.85rem', margin: '2px 0 0 0' }}>Өнөөдөр юу сурахаа сонгоцгооё</p>
          </div>
          <div className="chips">
            <div className="chip" style={{ padding: '4px 10px', fontSize: '0.85rem' }}>🏆 {score}</div>
          </div>
        </div>

        {/* Hero Grid */}
        <div className="hm-hero" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', alignItems: 'stretch' }}>
          <section className="panel hm-card" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {!ready ? (
              <Skeleton lines={3} />
            ) : plan && summary ? (
              <>
                <h3 style={{ fontSize: '0.95rem', margin: '0 0 4px 0' }}>
                  {summary.allDone
                    ? "Төлөвлөгөөгөө дуусгалаа 🎉"
                    : `${summary.week + 1}-р долоо хоног: ${plan.weeks[summary.week].title}`}
                </h3>
                <p className="hm-muted" style={{ fontSize: '0.8rem', margin: '0 0 8px 0' }}>
                  {summary.allDone
                    ? "Оноогоо шинэчлээд шинэ төлөвлөгөө аваарай."
                    : plan.weeks[summary.week].goal}
                </p>

                <div className="hm-bar" aria-hidden style={{ height: '6px', marginBottom: '4px' }}>
                  <span style={{ width: `${summary.percent}%` }} />
                </div>
                <div className="hm-row" style={{ fontSize: '0.75rem', marginBottom: '6px' }}>
                  <span>{summary.finished}/{summary.total} даалгавар</span>
                  <span>{summary.percent}%</span>
                </div>

                <button
                  type="button"
                  className="btn"
                  style={{ padding: '6px 12px', fontSize: '0.8rem', alignSelf: 'flex-start' }}
                  onClick={() => router.push(PLAN_HREF)}
                >
                  {summary.allDone ? "Шинэ төлөвлөгөө" : "Үргэлжлүүлэх"}
                </button>
              </>
            ) : (
              <>
                <h3 style={{ fontSize: '0.95rem', margin: '0 0 4px 0' }}>Төлөвлөгөө хараахан алга</h3>
                <p className="hm-muted" style={{ fontSize: '0.8rem', margin: '0 0 8px 0' }}>
                  Оноогоо оруулаад өөрт тохирсон төлөвлөгөө аваарай.
                </p>
                <button
                  type="button"
                  className="btn hm-gap"
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  onClick={() => router.push(PLAN_HREF)}
                >
                  Төлөвлөгөө үүсгэх
                </button>
              </>
            )}
          </section>

          <section className="panel hm-card hm-score" style={{ padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="hm-ring" aria-label={`Оноо ${score} / ${maxScore}`} style={{ width: '70px', height: '70px', position: 'relative' }}>
              <svg viewBox="0 0 100 100" aria-hidden style={{ width: '100%', height: '100%' }}>
                <circle className="hm-ring-bg" cx="50" cy="50" r={RING_R} />
                <circle
                  className="hm-ring-fg"
                  cx="50"
                  cy="50"
                  r={RING_R}
                  strokeDasharray={RING_C}
                  strokeDashoffset={RING_C * (1 - ratio)}
                />
              </svg>
              <div className="hm-ring-text" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                <strong style={{ fontSize: '0.9rem' }}>{score}</strong>
              </div>
            </div>
            <Link href={PLAN_HREF} className="hm-link" style={{ fontSize: '0.75rem', marginTop: '6px' }}>
              Оноо шинэчлэх
            </Link>
          </section>
        </div>

        {/* Daily Picks & Review Grid (2x2 compact) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          <DailyCard
            title="Өдрийн үг"
            row={word}
            ready={ready}
            href="/ancient"
            linkText="Үзэх"
          />
          <DailyCard
            title="Өдрийн хэлц"
            row={idiom}
            ready={ready}
            href="/idioms"
            linkText="Үзэх"
          />

          <section className="panel hm-card" style={{ padding: '12px 16px' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>Алдсан зүйлс</h3>
            {!ready ? (
              <Skeleton lines={1} />
            ) : mistakes === 0 ? (
              <p className="hm-muted" style={{ fontSize: '0.8rem' }}>Алдах зүйл алга!</p>
            ) : (
              <>
                <p className="hm-num" style={{ fontSize: '1.1rem', margin: '0' }}>{mistakes ?? 0}</p>
                <button
                  type="button"
                  className="btn"
                  style={{ padding: '4px 8px', fontSize: '0.75rem', marginTop: '4px' }}
                  onClick={() => router.push(MISTAKES_HREF)}
                >
                  Давтах
                </button>
              </>
            )}
          </section>

          <section className="panel hm-card" style={{ padding: '12px 16px' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>Хадгалсан</h3>
            {!ready ? (
              <Skeleton lines={1} />
            ) : !saved || saved.length === 0 ? (
              <p className="hm-muted" style={{ fontSize: '0.8rem' }}>Хадгалсан алга.</p>
            ) : (
              <>
                <p className="hm-word" style={{ fontSize: '0.85rem', margin: '2px 0' }}>
                  {describe(saved[0]).title}
                </p>
                <Link href={SAVED_HREF} className="hm-link" style={{ fontSize: '0.75rem' }}>
                  Бүгдийг харах
                </Link>
              </>
            )}
          </section>
        </div>

      </div>
    </AppShell>
  );
}