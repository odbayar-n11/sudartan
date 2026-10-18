"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Hand,
  Trophy,
  Sparkles,
  Repeat,
  PartyPopper,
  BookOpen,
  MessageSquareQuote,
  CircleAlert,
  Bookmark,
  ArrowRight,
} from "lucide-react";
import AppShell from "../components/AppShell";
import { supabase } from "../../../lib/supabase";
import "./dashboard.css";
import "./dashboard-ui.css";

/* ---------- Links ---------- */
const PLAN_HREF = "/myclass/plan";
const MISTAKES_HREF = "/myclass/mistakes";
const SAVED_HREF = "/myclass/saved";

const RING_R = 52;
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

/* ---------- Animation helpers ---------- */
function useCountUp(target, active, duration = 1000) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active || typeof target !== "number") return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setValue(target);
      return;
    }

    let raf;
    let start = null;
    const tick = (t) => {
      if (start === null) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);

  return value;
}

/* ---------- UI pieces ---------- */
function Skeleton({ lines = 2 }) {
  return (
    <div aria-busy="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="db-skel"
          style={{ width: `${88 - i * 18}%` }}
        />
      ))}
    </div>
  );
}

function CardHead({ Icon, title }) {
  return (
    <div className="db-card-head">
      <span className="db-icon">
        <Icon size={18} aria-hidden />
      </span>
      <h3>{title}</h3>
    </div>
  );
}

function DailyCard({ tone, Icon, title, row, ready, href, linkText, index }) {
  const d = row ? describe(row) : null;
  return (
    <section className={`db-card db-in db-tone-${tone}`} style={{ "--i": index }}>
      <CardHead Icon={Icon} title={title} />
      {!ready ? (
        <Skeleton lines={3} />
      ) : d && d.title ? (
        <>
          <p className="db-word">{d.title}</p>
          {d.meaning && <p className="db-muted db-meaning">{d.meaning}</p>}
          <Link href={href} className="db-link">
            {linkText} <ArrowRight size={16} aria-hidden />
          </Link>
        </>
      ) : (
        <p className="db-muted">Өнөөдрийн санал олдсонгүй.</p>
      )}
    </section>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const [userName, setUserName] = useState("");
  const [ready, setReady] = useState(false);
  const [drawn, setDrawn] = useState(false);
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

  // Start the ring / progress bar animation once data has arrived
  useEffect(() => {
    if (!ready) return;
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, [ready]);

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

  const scoreShown = useCountUp(score, ready);
  const mistakesShown = useCountUp(mistakes ?? 0, ready);

  return (
    <AppShell userName={userName}>
      <div className="db-root">
        {/* Header */}
        <header className="db-top db-in" style={{ "--i": 0 }}>
          <div>
            <h1>
              Өдрийн мэнд,{" "}
              <span className="db-name">
                {userName} <Hand className="db-wave" size={20} aria-hidden />
              </span>
            </h1>
            <p className="db-lead">Өнөөдөр юу сурахаа сонгоцгооё</p>
          </div>
          <div className="db-chip">
            <Trophy size={18} aria-hidden /> {scoreShown}
          </div>
        </header>

        {/* Hero */}
        <div className="db-hero">
          <section className="db-card db-plan db-in" style={{ "--i": 1 }}>
            {!ready ? (
              <Skeleton lines={4} />
            ) : plan && summary ? (
              <>
                <h2>
                  {summary.allDone ? (
                    <>
                      Төлөвлөгөөгөө дуусгалаа <PartyPopper size={22} aria-hidden />
                    </>
                  ) : (
                    `${summary.week + 1}-р долоо хоног: ${plan.weeks[summary.week].title}`
                  )}
                </h2>
                <p className="db-plan-goal">
                  {summary.allDone
                    ? "Оноогоо шинэчлээд шинэ төлөвлөгөө аваарай."
                    : plan.weeks[summary.week].goal}
                </p>

                <div className="db-plan-foot">
                  <div
                    className="db-bar"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={summary.percent}
                  >
                    <span style={{ width: `${drawn ? summary.percent : 0}%` }} />
                  </div>
                  <div className="db-row">
                    <span>
                      {summary.finished}/{summary.total} даалгавар
                    </span>
                    <span>{summary.percent}%</span>
                  </div>
                  <button
                    type="button"
                    className="db-btn db-btn--light"
                    onClick={() => router.push(PLAN_HREF)}
                  >
                    {summary.allDone ? "Шинэ төлөвлөгөө" : "Үргэлжлүүлэх"}
                    <ArrowRight size={18} aria-hidden />
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>Төлөвлөгөө хараахан алга</h2>
                <p className="db-plan-goal">
                  Оноогоо оруулаад өөрт тохирсон төлөвлөгөө аваарай.
                </p>
                <div className="db-plan-foot">
                  <button
                    type="button"
                    className="db-btn db-btn--light"
                    onClick={() => router.push(PLAN_HREF)}
                  >
                    Төлөвлөгөө үүсгэх
                    <ArrowRight size={18} aria-hidden />
                  </button>
                </div>
              </>
            )}
          </section>

          <section className="db-card db-score db-in" style={{ "--i": 2 }}>
            <div className="db-ring" role="img" aria-label={`Оноо ${score} / ${maxScore}`}>
              <svg viewBox="0 0 120 120" aria-hidden>
                <circle className="db-ring-bg" cx="60" cy="60" r={RING_R} />
                <circle
                  className="db-ring-fg"
                  cx="60"
                  cy="60"
                  r={RING_R}
                  strokeDasharray={RING_C}
                  strokeDashoffset={RING_C * (1 - (drawn ? ratio : 0))}
                />
              </svg>
              <div className="db-ring-text">
                <strong>{scoreShown}</strong>
                <span>/ {maxScore}</span>
              </div>
            </div>
            <Link href={PLAN_HREF} className="db-link">
              Оноо шинэчлэх <ArrowRight size={16} aria-hidden />
            </Link>
          </section>
        </div>

        {/* Daily picks & review */}
        <div className="db-grid">
          <DailyCard
            tone="blue"
            Icon={BookOpen}
            title="Өдрийн үг"
            row={word}
            ready={ready}
            href="/ancient"
            linkText="Үзэх"
            index={3}
          />
          <DailyCard
            tone="teal"
            Icon={MessageSquareQuote}
            title="Өдрийн хэлц"
            row={idiom}
            ready={ready}
            href="/idioms"
            linkText="Үзэх"
            index={4}
          />

          <section className="db-card db-in db-tone-amber" style={{ "--i": 5 }}>
            <CardHead Icon={CircleAlert} title="Алдсан зүйлс" />
            {!ready ? (
              <Skeleton lines={2} />
            ) : mistakes === 0 ? (
              <p className="db-muted db-empty">
                <Sparkles size={18} aria-hidden /> Алдах зүйл алга!
              </p>
            ) : (
              <>
                <p className="db-big">{mistakesShown}</p>
                <button
                  type="button"
                  className="db-btn"
                  onClick={() => router.push(MISTAKES_HREF)}
                >
                  <Repeat size={16} aria-hidden /> Давтах
                </button>
              </>
            )}
          </section>

          <section className="db-card db-in db-tone-violet" style={{ "--i": 6 }}>
            <CardHead Icon={Bookmark} title="Хадгалсан" />
            {!ready ? (
              <Skeleton lines={2} />
            ) : !saved || saved.length === 0 ? (
              <p className="db-muted">Хадгалсан алга.</p>
            ) : (
              <>
                <p className="db-word">{describe(saved[0]).title}</p>
                <Link href={SAVED_HREF} className="db-link">
                  Бүгдийг харах <ArrowRight size={16} aria-hidden />
                </Link>
              </>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}