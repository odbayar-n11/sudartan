"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Map as MapIcon,
  Target,
  Sparkles,
  Loader2,
  Clock,
  ArrowRight,
  Check,
  CircleAlert,
  RefreshCw,
  ListChecks,
  ScrollText,
  PenLine,
  MessageSquareQuote,
  Brush,
  Feather,
  ClipboardCheck,
} from "lucide-react";
import AppShell from "../components/AppShell";
import { supabase } from "../../../lib/supabase";
import "./plan.css";

// Where each task type sends the user. Change the hrefs if your routes differ.
const TYPES = {
  ancient: { label: "Эртний үг", href: "/ancient", Icon: ScrollText },
  grammar: { label: "Дүрэм", href: "/grammar", Icon: PenLine },
  idioms: { label: "Хэлц үг", href: "/idioms", Icon: MessageSquareQuote },
  script: { label: "Монгол бичиг", href: "/script", Icon: Brush },
  literary: { label: "Уран дүрслэл", href: "/uran-durslel", Icon: Feather },
  quiz: { label: "Шалгалт", href: "/quiz", Icon: ClipboardCheck },
};

const RING_R = 44;
const RING_C = 2 * Math.PI * RING_R;

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : null;
}

export default function PlanPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null); // { score, maxScore, plan, planScore, createdAt }
  const [done, setDone] = useState({}); // { "0-1": true }
  const [scoreInput, setScoreInput] = useState("");
  const [drawn, setDrawn] = useState(false);

  const storageKey = data?.createdAt ? `plan-done:${data.createdAt}` : null;

  const load = useCallback(async () => {
    const headers = await authHeaders();
    if (!headers) {
      setError("Нэвтэрч орно уу.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/plan", { headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Алдаа гарлаа.");
      setData(json);
      setScoreInput(String(json.score ?? 0));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Start the ring animation once the page has loaded
  useEffect(() => {
    if (loading) return;
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, [loading]);

  // Restore the ticked tasks of this plan
  useEffect(() => {
    if (!storageKey) return;
    try {
      setDone(JSON.parse(localStorage.getItem(storageKey) || "{}"));
    } catch {
      setDone({});
    }
  }, [storageKey]);

  function toggle(key) {
    setDone((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        if (storageKey) localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  async function generate() {
    setError("");

    const n = Number(scoreInput);
    const max = data?.maxScore || 800;
    if (scoreInput === "" || !Number.isInteger(n) || n < 0 || n > max) {
      setError(`Оноо 0-${max} хооронд бүхэл тоо байх ёстой.`);
      return;
    }

    setGenerating(true);
    try {
      const headers = await authHeaders();
      if (!headers) throw new Error("Нэвтэрч орно уу.");

      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ score: n }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Алдаа гарлаа.");

      setDone({});
      setData(json);
      setScoreInput(String(json.score));
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  const plan = data?.plan;
  const maxScore = data?.maxScore || 800;
  // the ring follows what the user types
  const typed = Number(scoreInput);
  const score =
    scoreInput !== "" && Number.isFinite(typed)
      ? Math.min(Math.max(typed, 0), maxScore)
      : 0;
  const ratio = Math.min(Math.max(score / maxScore, 0), 1);

  const totalTasks = plan
    ? plan.weeks.reduce((n, w) => n + w.tasks.length, 0)
    : 0;
  const doneTasks = plan
    ? plan.weeks.reduce(
        (n, w, wi) => n + w.tasks.filter((_, ti) => done[`${wi}-${ti}`]).length,
        0
      )
    : 0;
  const percent = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const weekDone = plan
    ? plan.weeks.map((w, wi) =>
        w.tasks.length > 0 && w.tasks.every((_, ti) => done[`${wi}-${ti}`])
      )
    : [];
  const currentWeek = weekDone.findIndex((d) => !d);

  const outdated =
    plan && data?.planScore !== null && data?.planScore !== score;

  return (
    <AppShell>
      <div className="pl">
        <header className="pl-top">
          <h1>
            <span className="pl-hico">
              <MapIcon size={24} aria-hidden />
            </span>
            Миний төлөвлөгөө
          </h1>
          <p>Оноондоо тохирсон 4 долоо хоногийн сургалтын зам.</p>
        </header>

        {loading ? (
          <div className="pl-skeleton" aria-busy="true" />
        ) : (
          <>
            <section className="pl-hero">
              <div className="pl-ring" aria-label={`Оноо ${score} / ${maxScore}`}>
                <svg viewBox="0 0 100 100" aria-hidden>
                  <circle className="pl-ring-bg" cx="50" cy="50" r={RING_R} />
                  <circle
                    className="pl-ring-fg"
                    cx="50"
                    cy="50"
                    r={RING_R}
                    strokeDasharray={RING_C}
                    strokeDashoffset={RING_C * (1 - (drawn ? ratio : 0))}
                  />
                </svg>
                <div className="pl-ring-text">
                  <strong>{score}</strong>
                  <span>/ {maxScore}</span>
                </div>
              </div>

              <div className="pl-hero-main">
                <h2>{plan?.level ? `Түвшин: ${plan.level}` : "Таны оноо"}</h2>
                <p>
                  {plan?.summary ||
                    "Оноондоо тохирсон төлөвлөгөөг AI-аар үүсгээрэй."}
                </p>

                <label className="pl-score">
                  <span className="pl-score-label">
                    <Target size={16} aria-hidden />
                    Оноогоо оруулна уу
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={maxScore}
                    step={1}
                    value={scoreInput}
                    onChange={(e) => setScoreInput(e.target.value)}
                    disabled={generating}
                  />
                  <em>/ {maxScore}</em>
                </label>

                {plan && (
                  <div className="pl-progress">
                    <div className="pl-bar" aria-hidden>
                      <span style={{ width: `${drawn ? percent : 0}%` }} />
                    </div>
                    <small>
                      {doneTasks}/{totalTasks} даалгавар
                    </small>
                  </div>
                )}

                {outdated && (
                  <p className="pl-warn">
                    <RefreshCw size={16} aria-hidden />
                    <span>
                      Таны оноо өөрчлөгдсөн ({data.planScore} → {score}). Шинэ
                      төлөвлөгөө үүсгэж болно.
                    </span>
                  </p>
                )}
              </div>

              <button
                type="button"
                className="pl-btn"
                onClick={generate}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="pl-spin" size={18} aria-hidden />
                    AI бэлдэж байна...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} aria-hidden />
                    {plan ? "Шинэ төлөвлөгөө үүсгэх" : "Төлөвлөгөө үүсгэх"}
                  </>
                )}
              </button>
            </section>

            {error && (
              <div className="pl-error" role="alert">
                <CircleAlert size={18} aria-hidden />
                {error}
              </div>
            )}

            {generating && (
              <p className="pl-wait">
                <Loader2 className="pl-spin" size={16} aria-hidden />
                Төлөвлөгөө бэлдэж байна. Энэ нь 10-20 секунд үргэлжилж болно.
              </p>
            )}

            {plan ? (
              <ol className="pl-road">
                {plan.weeks.map((w, wi) => {
                  const state =
                    weekDone[wi] ? "done" : wi === currentWeek ? "current" : "todo";
                  const count = w.tasks.filter((_, ti) => done[`${wi}-${ti}`]).length;

                  return (
                    <li
                      key={wi}
                      className={`pl-week ${state}`}
                      style={{ "--i": Math.min(wi, 6) }}
                    >
                      <span className="pl-node" aria-hidden>
                        {state === "done" ? (
                          <Check size={20} strokeWidth={3} />
                        ) : (
                          wi + 1
                        )}
                      </span>

                      <div className="pl-card">
                        <div className="pl-week-head">
                          <h3>{w.title}</h3>
                          <span className="pl-count">
                            <ListChecks size={15} aria-hidden />
                            {count}/{w.tasks.length}
                          </span>
                        </div>
                        <p className="pl-goal">{w.goal}</p>

                        <ul className="pl-tasks">
                          {w.tasks.map((t, ti) => {
                            const key = `${wi}-${ti}`;
                            const meta = TYPES[t.type];
                            const TypeIcon = meta?.Icon || Sparkles;
                            return (
                              <li key={key} className={done[key] ? "done" : ""}>
                                <label className="pl-check">
                                  <input
                                    type="checkbox"
                                    checked={!!done[key]}
                                    onChange={() => toggle(key)}
                                  />
                                  <span className="pl-box" aria-hidden />
                                  <span className="pl-task">{t.title}</span>
                                </label>
                                <span className={`pl-chip ${t.type}`}>
                                  <TypeIcon size={14} aria-hidden />
                                  {meta?.label || t.type}
                                </span>
                                <span className="pl-min">
                                  <Clock size={14} aria-hidden />
                                  {t.minutes} мин
                                </span>
                                {meta && (
                                  <Link href={meta.href} className="pl-go">
                                    Эхлэх
                                    <ArrowRight size={14} aria-hidden />
                                  </Link>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              !error && (
                <div className="pl-empty">
                  <span className="pl-empty-ico">
                    <Sparkles size={28} aria-hidden />
                  </span>
                  <strong>Төлөвлөгөө хараахан үүсээгүй байна</strong>
                  <p>
                    Дээрх товчийг дарвал таны оноонд тааруулсан долоо хоног
                    бүрийн даалгавар гарна.
                  </p>
                </div>
              )
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}