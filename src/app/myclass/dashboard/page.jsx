"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import { supabase } from "../../../lib/supabase";
import "./dashboard.css";

/* ---------- Links (change here if your routes differ) ---------- */
const PLAN_HREF = "/myclass/plan";
const MISTAKES_HREF = "/myclass/stats";
const SAVED_HREF = "/myclass/saved";

const SECTIONS = [
  { href: "/ancient", icon: "📜", title: "Эртний үг", text: "Эртний монгол үгсийн сан" },
  { href: "/grammar", icon: "📖", title: "Дүрэм", text: "Хэлзүйн дүрэм, дасгал" },
  { href: "/idioms", icon: "💬", title: "Хэлц үг", text: "Хэлц, зүйр цэцэн үг" },
  { href: "/script", icon: "✍️", title: "Монгол бичиг", text: "Монгол бичгийн үгс" },
  { href: "/uran-durslel", icon: "🎨", title: "Уран дүрслэл", text: "Хэрэгсэл ба жишээ" },
  { href: "/quiz", icon: "🏆", title: "Шалгалт", text: "Мэдлэгээ сориорой" },
];

const RING_R = 44;
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

// null means "could not read" (table or column missing), a number is the count
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

// The same entry for the whole day, a different one tomorrow
async function dailyPick(table) {
  const { data, error } = await supabase.from(table).select("*").limit(200);
  if (error || !data?.length) return null;
  const day = Math.floor(Date.now() / 86400000);
  return data[day % data.length];
}

/* ---------- Showing a database row without knowing its columns ---------- */
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

/* ---------- Plan progress ---------- */
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

/* ---------- Small pieces ---------- */
function Skeleton({ lines = 3 }) {
  return (
    <div aria-busy="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="hm-skel" style={{ width: `${90 - i * 18}%` }} />
      ))}
    </div>
  );
}

function DailyCard({ title, row, ready, href, linkText }) {
  const d = row ? describe(row) : null;
  return (
    <section className="panel hm-card">
      <h3>{title}</h3>
      {!ready ? (
        <Skeleton lines={2} />
      ) : d && d.title ? (
        <>
          <p className="hm-word">{d.title}</p>
          {d.meaning && <p className="hm-muted">{d.meaning}</p>}
          <Link href={href} className="hm-link">
            {linkText}
          </Link>
        </>
      ) : (
        <p className="hm-muted">Өнөөдрийн санал олдсонгүй.</p>
      )}
    </section>
  );
}

/* ---------- Page ---------- */
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

  // Ticked tasks are kept by the plan page in this browser
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
      <div className="top">
        <div>
          <h1>
            Өдрийн мэнд,<small>{userName} 👋</small>
          </h1>
          <p className="lead">Өнөөдөр юу сурахаа сонгоцгооё</p>
        </div>
        <div className="chips">
          <div className="chip">🏆 {score}</div>
        </div>
      </div>

      {/* Plan + score */}
      <div className="hm-hero">
        <section className="panel hm-card">
          {!ready ? (
            <Skeleton lines={4} />
          ) : plan && summary ? (
            <>
              <h3>
                {summary.allDone
                  ? "Төлөвлөгөөгөө дуусгалаа 🎉"
                  : `${summary.week + 1}-р долоо хоног: ${plan.weeks[summary.week].title}`}
              </h3>
              <p className="hm-muted">
                {summary.allDone
                  ? "Оноогоо шинэчлээд шинэ төлөвлөгөө аваарай."
                  : plan.weeks[summary.week].goal}
              </p>

              <div className="hm-bar" aria-hidden>
                <span style={{ width: `${summary.percent}%` }} />
              </div>
              <div className="hm-row">
                <span>
                  {summary.finished}/{summary.total} даалгавар
                </span>
                <span>{summary.percent}%</span>
              </div>

              {summary.nextTask && (
                <p className="hm-next">
                  Дараагийн даалгавар: <strong>{summary.nextTask.title}</strong> (
                  {summary.nextTask.minutes} мин)
                </p>
              )}

              <button
                type="button"
                className="btn"
                onClick={() => router.push(PLAN_HREF)}
              >
                {summary.allDone ? "Шинэ төлөвлөгөө" : "Үргэлжлүүлэх"}
              </button>
            </>
          ) : (
            <>
              <h3>Төлөвлөгөө хараахан алга</h3>
              <p className="hm-muted">
                Оноогоо оруулаад өөрт тохирсон 4 долоо хоногийн төлөвлөгөө
                аваарай.
              </p>
              <button
                type="button"
                className="btn hm-gap"
                onClick={() => router.push(PLAN_HREF)}
              >
                Төлөвлөгөө үүсгэх
              </button>
            </>
          )}
        </section>

        <section className="panel hm-card hm-score">
          <div className="hm-ring" aria-label={`Оноо ${score} / ${maxScore}`}>
            <svg viewBox="0 0 100 100" aria-hidden>
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
            <div className="hm-ring-text">
              <strong>{score}</strong>
              <span>/ {maxScore}</span>
            </div>
          </div>
          <h3>Таны оноо</h3>
          <Link href={PLAN_HREF} className="hm-link">
            Оноогоо шинэчлэх
          </Link>
        </section>
      </div>



      {/* Word and idiom of the day */}
      <h2 className="sec">
        <span className="ib" aria-hidden>✨</span>Өдрийн санал
      </h2>
      <div className="hm-two">
        <DailyCard
          title="Өдрийн үг"
          row={word}
          ready={ready}
          href="/ancient"
          linkText="Бүх үгийг үзэх"
        />
        <DailyCard
          title="Өдрийн хэлц"
          row={idiom}
          ready={ready}
          href="/idioms"
          linkText="Бүх хэлцийг үзэх"
        />
      </div>

      {/* Review */}
      <h2 className="sec">
        <span className="ib" aria-hidden>🔁</span>Давтлага
      </h2>
      <div className="hm-two">
        <section className="panel hm-card">
          <h3>Алдсан зүйлс</h3>
          {!ready ? (
            <Skeleton lines={2} />
          ) : mistakes === null ? (
            <p className="hm-muted">Мэдээлэл ачаалж чадсангүй.</p>
          ) : mistakes === 0 ? (
            <p className="hm-muted">Одоогоор алдаа байхгүй. Гайхалтай!</p>
          ) : (
            <>
              <p className="hm-num">{mistakes}</p>
              <p className="hm-muted">давтах зүйл байна</p>
              <button
                type="button"
                className="btn hm-gap"
                onClick={() => router.push(MISTAKES_HREF)}
              >
                Давтах
              </button>
            </>
          )}
        </section>

        <section className="panel hm-card">
          <h3>Саяхан хадгалсан</h3>
          {!ready ? (
            <Skeleton lines={3} />
          ) : !saved || saved.length === 0 ? (
            <p className="hm-muted">Хадгалсан зүйл хараахан алга.</p>
          ) : (
            <>
              <ul className="hm-list">
                {saved.map((row, i) => (
                  <li key={row.id ?? i}>
                    {describe(row).title || "Хадгалсан зүйл"}
                  </li>
                ))}
              </ul>
              <Link href={SAVED_HREF} className="hm-link">
                Бүгдийг харах
              </Link>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}