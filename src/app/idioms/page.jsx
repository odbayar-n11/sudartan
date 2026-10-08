"use client";

import { useState, useEffect, useRef } from "react";
import { Nunito } from "next/font/google";
import { supabase } from '@/lib/supabase'

const nunito = Nunito({ subsets: ["latin", "cyrillic"], weight: ["600", "800", "900"] });

const SIZES = [10, 12, 15];

/* ---------- helpers ---------- */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// words that appear in many meanings and say nothing
const STOP = new Set(["болох", "байх", "хийх", "нь", "юм"]);

// key stems of a meaning, used to avoid "almost the same" wrong answers
function stems(text) {
  return text
    .toLowerCase()
    .split(/[^а-яөүёa-z]+/i)
    .filter((w) => w.length >= 3 && !STOP.has(w))
    .map((w) => w.slice(0, Math.min(4, w.length)));
}

function tooSimilar(a, b) {
  const sa = stems(a);
  const sb = new Set(stems(b));
  return sa.some((s) => sb.has(s));
}

// split the game into rounds; inside one round no two meanings look alike
function buildRounds(items, total, per) {
  const pool = shuffle(items);
  const rounds = [];
  let taken = 0;
  while (taken < total && pool.length) {
    const round = [];
    let i = 0;
    while (i < pool.length && round.length < per && taken + round.length < total) {
      const it = pool[i];
      if (round.every((r) => r.meaning !== it.meaning && !tooSimilar(r.meaning, it.meaning))) {
        round.push(it);
        pool.splice(i, 1);
      } else i++;
    }
    if (!round.length) break;
    rounds.push(round);
    taken += round.length;
  }
  return rounds;
}

/* ---------- Styles (inline, no CSS file) ---------- */
const CSS = `
.kid{position:relative;min-height:100vh;overflow:hidden;background:linear-gradient(#6ec3f4 0%,#a8def9 55%,#d9f2ff 100%);color:#12304a;display:flex;justify-content:center;padding:22px 14px 170px}
.kid *{box-sizing:border-box}
.kid button{font:inherit;cursor:pointer}
.kid :focus-visible{outline:4px solid #ffd23f;outline-offset:3px}
.sun{position:absolute;top:26px;right:6%;width:84px;height:84px;border-radius:50%;background:#ffd23f;box-shadow:0 0 0 14px rgba(255,210,63,.3),0 0 0 30px rgba(255,210,63,.15);animation:pulse 4s ease-in-out infinite}
.cloud{position:absolute;left:0;width:140px;height:44px;background:#fff;border-radius:44px;opacity:.95;animation:drift linear infinite}
.cloud::before,.cloud::after{content:"";position:absolute;background:#fff;border-radius:50%}
.cloud::before{width:64px;height:64px;top:-30px;left:22px}
.cloud::after{width:84px;height:84px;top:-42px;right:18px}
.hill{position:absolute;bottom:-90px;left:-10%;width:120%;height:230px;background:#7ed957;border-radius:50% 50% 0 0}
.hill.b{bottom:-140px;left:-35%;width:95%;height:240px;background:#5cc23f}
.flower{position:absolute;bottom:28px;font-size:26px}
.stage{position:relative;z-index:2;width:100%;max-width:860px}
.mascot{display:flex;align-items:flex-end;gap:12px;margin-bottom:-16px;position:relative;z-index:3;padding-left:6px}
.sheep{width:104px;height:auto;flex:none;transform-origin:50% 90%;filter:drop-shadow(0 6px 0 rgba(0,0,0,.08))}
.sheep.emoji{font-size:80px;line-height:1;width:auto}
.sheep.idle{animation:float 3s ease-in-out infinite}
.sheep.happy{animation:hop .7s ease}
.sheep.sad{animation:wobble .6s ease}
.bubble{position:relative;background:#fff;border-radius:22px;padding:12px 16px;font-weight:800;box-shadow:0 5px 0 rgba(10,132,208,.18);margin-bottom:34px;max-width:400px;line-height:1.35}
.bubble::before{content:"";position:absolute;left:-10px;bottom:16px;border:10px solid transparent;border-right-color:#fff;border-left:0}
.panel{background:#fff;border-radius:32px;padding:26px;box-shadow:0 10px 0 rgba(10,132,208,.22),0 24px 40px rgba(10,100,160,.18);position:relative}
.kid h1{margin:0 0 8px;font-size:32px;font-weight:900;color:#0a6fb0;line-height:1.15}
.kid p.sub{margin:0 0 22px;font-weight:600;line-height:1.5;color:#3d5a73}
.sizes{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 24px}
.size{border:0;background:#e3f4fd;color:#0a6fb0;border-radius:999px;padding:12px 22px;font-weight:900;box-shadow:0 4px 0 #b9defa}
.size.on{background:#0a84d0;color:#fff;box-shadow:0 4px 0 #06629c}
.btn{background:#0a84d0;color:#fff;border:0;border-radius:999px;padding:15px 34px;font-weight:900;font-size:19px;box-shadow:0 6px 0 #06629c;transition:transform .1s}
.btn:active{transform:translateY(5px);box-shadow:0 1px 0 #06629c}
.btn.ghost{background:#e3f4fd;color:#0a6fb0;box-shadow:0 6px 0 #b9defa}
.hud{display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-weight:900}
.hud .count{margin-right:auto;color:#3d5a73}
.chip{background:#fff3c4;border-radius:999px;padding:6px 14px;font-weight:900}
.track{position:relative;height:16px;background:#e3f4fd;border-radius:999px;margin:20px 0 22px}
.fill{height:100%;background:linear-gradient(90deg,#4cc3ff,#0a84d0);border-radius:999px;transition:width .4s}
.walker{position:absolute;top:-16px;transform:translateX(-50%);font-size:26px;transition:left .4s}
.tray-title{font-weight:900;color:#3d5a73;margin-bottom:8px}
.tray{display:flex;gap:12px;flex-wrap:wrap;min-height:76px;background:#f2faff;border:3px dashed #9fd3f2;border-radius:22px;padding:14px;margin-bottom:22px;align-items:center}
.tray .empty{font-weight:800;color:#3d5a73}
.card{touch-action:none;user-select:none;-webkit-user-select:none;border:0;background:#fff;color:#12304a;font-weight:900;font-size:18px;border-radius:16px;padding:12px 18px;box-shadow:0 5px 0 #b9defa,0 8px 14px rgba(10,100,160,.15);cursor:grab;position:relative;z-index:1}
.card.sel{outline:4px solid #ffd23f;outline-offset:2px;background:#fffbe6}
.card.drag{cursor:grabbing;z-index:50;box-shadow:0 12px 0 #b9defa,0 20px 28px rgba(10,100,160,.3);transition:none}
.bags{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:16px}
.bag{position:relative;border:0;text-align:center;padding:30px 12px 14px;border-radius:24px 24px 30px 30px;background:linear-gradient(#d9a066,#b9773d);color:#3b2410;box-shadow:0 7px 0 #8a5628;min-height:150px;display:flex;flex-direction:column;gap:10px;align-items:center;justify-content:space-between;transition:transform .15s}
.bag::before{content:"🎒";position:absolute;top:-18px;left:50%;transform:translateX(-50%);font-size:34px}
.bag .label{background:#fff4dc;border-radius:14px;padding:8px 10px;font-weight:800;line-height:1.3;width:100%;font-size:15px}
.bag .slot{min-height:44px;width:100%;border-radius:14px;border:3px dashed rgba(59,36,16,.4);display:grid;place-items:center;font-weight:900;padding:4px 8px}
.bag.hover{transform:scale(1.05);box-shadow:0 7px 0 #8a5628,0 0 0 5px #ffd23f}
.bag.ok{background:linear-gradient(#8fe0a7,#4fb36f);box-shadow:0 7px 0 #2f8a4c;animation:pop .4s}
.bag.ok .slot{border:3px solid #fff;background:#fff}
.bag.bad{animation:shake .45s}
.hint{font-weight:700;color:#3d5a73;margin:16px 0 0;text-align:center}
.foot{display:flex;justify-content:flex-end;margin-top:20px;min-height:56px}
.score{font-size:64px;font-weight:900;color:#0a84d0;margin:0;line-height:1}
.stars{font-size:44px;margin:4px 0 10px;animation:pop .6s}
.review{margin:10px 0 22px;display:grid;gap:10px}
.review div{background:#f2faff;border-radius:16px;padding:12px 16px}
.review b{display:block;font-size:18px}
.review span{color:#3d5a73;font-weight:600}
.row{display:flex;gap:12px;flex-wrap:wrap}
.conf{position:absolute;top:-40px;font-size:26px;animation:fall 3.5s linear infinite;z-index:1;pointer-events:none}
@keyframes drift{from{transform:translateX(-60vw)}to{transform:translateX(120vw)}}
@keyframes float{50%{transform:translateY(-8px)}}
@keyframes pulse{50%{transform:scale(1.06)}}
@keyframes hop{30%{transform:translateY(-26px) rotate(-6deg)}60%{transform:translateY(0) rotate(5deg)}80%{transform:translateY(-8px)}}
@keyframes wobble{20%{transform:rotate(-8deg)}40%{transform:rotate(8deg)}60%{transform:rotate(-5deg)}80%{transform:rotate(4deg)}}
@keyframes pop{40%{transform:scale(1.06)}}
@keyframes shake{25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
@keyframes fall{to{transform:translateY(110vh) rotate(360deg)}}
@media (max-width:520px){.sheep{width:80px}.kid h1{font-size:26px}.panel{padding:18px}.btn{width:100%}.bags{grid-template-columns:1fr 1fr;gap:20px 12px}.bag .label{font-size:13px}}
@media (prefers-reduced-motion:reduce){.kid *{animation:none!important;transition:none!important}}
`;

const CLOUDS = [
  { top: "6%", dur: 60, delay: -10, scale: 1 },
  { top: "18%", dur: 85, delay: -50, scale: 0.7 },
  { top: "32%", dur: 70, delay: -30, scale: 1.2 },
  { top: "48%", dur: 95, delay: -70, scale: 0.8 },
];
const CHEERS = ["Гайхалтай! 🎉", "Яг зөв! ⭐", "Чи мундаг ангууч байна! 🏹", "Сайн байна! 👏", "Супер! 🌟"];
const CONFETTI = ["🎉", "⭐", "🎈", "✨", "🌟", "🎊"];

/* ---------- Page ---------- */
export default function IdiomsGame() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [phase, setPhase] = useState("start"); // start | play | end
  const [size, setSize] = useState(10);
  const [rounds, setRounds] = useState([]);
  const [rIdx, setRIdx] = useState(0);
  const [cards, setCards] = useState([]);   // idioms to drag (current round)
  const [bags, setBags] = useState([]);     // meanings = bags (current round)
  const [placed, setPlaced] = useState({}); // cardId -> true
  const [wrong, setWrong] = useState({});   // cardId -> true (had a mistake)
  const [selected, setSelected] = useState(null);
  const [drag, setDrag] = useState(null);   // { id, dx, dy }
  const [hover, setHover] = useState(null);
  const [fb, setFb] = useState(null);       // { bag, kind }
  const [score, setScore] = useState(0);    // first-try catches
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [missed, setMissed] = useState([]);
  const [logoOk, setLogoOk] = useState(true);

  const dragRef = useRef(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    async function fetchIdioms() {
      const { data, error } = await supabase.from("mongolian_idioms").select("*");

      if (error) {
        console.error("Error fetching idioms:", error);
        setError("Хэлц үгсийг ачаалж чадсангүй.");
      } else {
        const clean = (data ?? []).filter((d) => d.idiom && d.meaning);
        setItems(clean);
        setSize(Math.min(10, clean.length));
      }
      setLoading(false);
    }

    fetchIdioms();
  }, []);

  const sizes = items.length >= 10 ? SIZES.filter((n) => n <= items.length) : [items.length];

  function loadRound(round) {
    setCards(shuffle(round));
    setBags(shuffle(round));
    setPlaced({});
    setSelected(null);
    setDrag(null);
    setHover(null);
  }

  function startGame() {
    const per = size === 12 ? 4 : 5;
    const r = buildRounds(items, size, per);
    setRounds(r);
    setRIdx(0);
    loadRound(r[0]);
    setWrong({});
    setScore(0);
    setStreak(0);
    setBest(0);
    setMissed([]);
    setPhase("play");
  }

  function nextRound() {
    if (rIdx + 1 >= rounds.length) {
      setPhase("end");
    } else {
      setRIdx(rIdx + 1);
      loadRound(rounds[rIdx + 1]);
      setFb(null);
    }
  }

  // put idiom card `cardId` into the bag of meaning `bagId`
  function drop(cardId, bagId) {
    const card = cards.find((c) => String(c.id) === String(cardId));
    if (!card || placed[card.id]) return;
    if (placed[bagId]) return; // bag already full
    if (String(card.id) === String(bagId)) {
      setPlaced({ ...placed, [card.id]: true });
      if (!wrong[card.id]) setScore(score + 1);
      const n = streak + 1;
      setStreak(n);
      setBest(Math.max(best, n));
      setFb({ bag: String(bagId), kind: "ok", n: score + streak });
    } else {
      setStreak(0);
      if (!wrong[card.id]) {
        setWrong({ ...wrong, [card.id]: true });
        setMissed([...missed, card]);
      }
      setFb({ bag: String(bagId), kind: "bad", n: score + streak });
      setTimeout(() => setFb(null), 700);
    }
    setSelected(null);
  }

  /* ----- pointer dragging (works with mouse and touch) ----- */
  function bagAt(x, y) {
    const el = document
      .elementsFromPoint(x, y)
      .map((e) => e.closest && e.closest("[data-bag]"))
      .find(Boolean);
    return el ? el.dataset.bag : null;
  }

  function onCardDown(e, card) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { id: card.id, sx: e.clientX, sy: e.clientY, moved: false };
  }

  function onCardMove(e) {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < 6) return;
    d.moved = true;
    setDrag({ id: d.id, dx, dy });
    setHover(bagAt(e.clientX, e.clientY));
  }

  function onCardUp(e) {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;
    if (d.moved) {
      suppressClick.current = true;
      setTimeout(() => (suppressClick.current = false), 80);
      const bag = bagAt(e.clientX, e.clientY);
      setDrag(null);
      setHover(null);
      if (bag !== null) drop(d.id, bag);
    }
  }

  function onCardCancel() {
    dragRef.current = null;
    setDrag(null);
    setHover(null);
  }

  // tap / keyboard alternative: pick a card, then pick a bag
  function onCardClick(card) {
    if (suppressClick.current) return;
    setSelected(selected === card.id ? null : card.id);
  }

  function onBagClick(bag) {
    if (selected !== null) drop(selected, bag.id);
  }

  /* ----- derived ----- */
  const ready = !loading && !error && items.length >= 4;
  const total = rounds.reduce((a, r) => a + r.length, 0);
  const placedCount = Object.keys(placed).length;
  const doneBefore = rounds.slice(0, rIdx).reduce((a, r) => a + r.length, 0);
  const progress = total ? ((doneBefore + placedCount) / total) * 100 : 0;
  const roundDone = cards.length > 0 && placedCount === cards.length;
  const pct = total ? score / total : 0;
  const lastRound = rIdx + 1 >= rounds.length;

  let mood = "idle";
  let say = "Түр хүлээгээрэй…";
  if (error) say = "Ой, алдаа гарлаа 😢";
  else if (!loading && items.length < 4) say = "Надад дор хаяж 4 хэлц үг хэрэгтэй!";
  else if (ready && phase === "start") say = "Сайн уу! Хамт ан хийцгээе 🏹 Хэлц үгийг зөв уутанд хийнэ!";
  else if (ready && phase === "end") say = pct >= 0.9 ? "Мундаг! Чи шилдэг ангууч! 🏆" : pct >= 0.6 ? "Сайхан ан хийлээ! 🎈" : "Дахин оролдвол илүү сайн болно! 💪";
  else if (phase === "play") {
    if (fb && fb.kind === "ok") { mood = "happy"; say = roundDone ? "Бүгдийг барьлаа! 🎊" : CHEERS[(fb.n || 0) % CHEERS.length]; }
    else if (fb && fb.kind === "bad") { mood = "sad"; say = "Энэ уут биш байна. Дахин оролдоорой! 🌱"; }
    else if (roundDone) { mood = "happy"; say = "Бүгдийг барьлаа! 🎊"; }
    else say = selected !== null ? "Одоо зөв уутаа сонго! 👆" : "Хэлц үгийг утга нь бичигдсэн уутанд чирж хийгээрэй! 🎒";
  }

  /* ----- panel content ----- */
  let panel;

  if (loading) {
    panel = <p className="sub">Ачаалж байна…</p>;
  } else if (error) {
    panel = <p className="sub">{error}</p>;
  } else if (items.length < 4) {
    panel = (
      <>
        <h1>Хэлц үгийн ан</h1>
        <p className="sub">Тоглоомд хамгийн багадаа 4 хэлц үг хэрэгтэй. Одоо {items.length} байна.</p>
      </>
    );
  } else if (phase === "start") {
    panel = (
      <>
        <h1>🏹 Хэлц үгийн ан</h1>
        <p className="sub">
          Хэлц үгсийг чирж, утга нь бичигдсэн зөв уутанд хийнэ. Нийт {items.length} хэлц үгээс санамсаргүй сонгож, хэдэн тойрогт хуваан тоглоно.
        </p>
        <div className="sizes" role="group" aria-label="Хэлц үгийн тоо">
          {sizes.map((n) => (
            <button key={n} className={n === size ? "size on" : "size"} onClick={() => setSize(n)}>
              {n} хэлц үг
            </button>
          ))}
        </div>
        <button className="btn" onClick={startGame}>Ан хийх ▶</button>
      </>
    );
  } else if (phase === "end") {
    const stars = pct >= 0.9 ? "⭐⭐⭐" : pct >= 0.6 ? "⭐⭐" : "⭐";
    panel = (
      <>
        <h1>Ан дууслаа!</h1>
        <div className="stars" aria-hidden>{stars}</div>
        <p className="score">{score} / {total}</p>
        <p className="sub" style={{ marginTop: 10 }}>Алдалгүй хийсэн: {score} · Хамгийн урт зөв дараалал: {best} 🔥</p>
        {missed.length > 0 && (
          <>
            <b>Дахин давтах хэлц үгс:</b>
            <div className="review">
              {missed.map((m) => (
                <div key={m.id}><b>{m.idiom}</b><span>{m.meaning}</span></div>
              ))}
            </div>
          </>
        )}
        <div className="row">
          <button className="btn" onClick={startGame}>Дахин тоглох 🔄</button>
          <button className="btn ghost" onClick={() => setPhase("start")}>Эхлэл рүү</button>
        </div>
      </>
    );
  } else {
    const tray = cards.filter((c) => !placed[c.id]);
    panel = (
      <>
        <div className="hud">
          <span className="count">Тойрог {rIdx + 1} / {rounds.length}</span>
          <span className="chip">⭐ {score}</span>
          <span className="chip">🔥 {streak}</span>
        </div>
        <div className="track" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={doneBefore + placedCount}>
          <div className="fill" style={{ width: `${progress}%` }} />
          <span className="walker" style={{ left: `${Math.min(Math.max(progress, 4), 96)}%` }} aria-hidden>🐑</span>
        </div>

        <div className="tray-title">🏹 Барьсан хэлц үгс</div>
        <div className="tray">
          {tray.length === 0 && <span className="empty">Бүгдийг уутанд хийлээ! 🎉</span>}
          {tray.map((c) => {
            const isDrag = drag && drag.id === c.id;
            return (
              <button
                key={c.id}
                className={`card${selected === c.id ? " sel" : ""}${isDrag ? " drag" : ""}`}
                style={isDrag ? { transform: `translate(${drag.dx}px, ${drag.dy}px) rotate(-3deg)` } : undefined}
                onPointerDown={(e) => onCardDown(e, c)}
                onPointerMove={onCardMove}
                onPointerUp={onCardUp}
                onPointerCancel={onCardCancel}
                onClick={() => onCardClick(c)}
                aria-pressed={selected === c.id}
              >
                {c.idiom}
              </button>
            );
          })}
        </div>

        <div className="bags">
          {bags.map((b) => {
            const full = !!placed[b.id];
            let cls = "bag";
            if (full) cls += " ok";
            if (hover === String(b.id) && !full) cls += " hover";
            if (fb && fb.kind === "bad" && fb.bag === String(b.id)) cls += " bad";
            return (
              <button
                key={b.id}
                data-bag={b.id}
                className={cls}
                onClick={() => onBagClick(b)}
                disabled={full}
                aria-label={`Уут: ${b.meaning}`}
              >
                <span className="label">{b.meaning}</span>
                <span className="slot">{full ? `✓ ${b.idiom}` : ""}</span>
              </button>
            );
          })}
        </div>

        <p className="hint">Чирж хийх боломжгүй бол хэлц үг дээр дараад, дараа нь уут дээр дарна уу.</p>

        <div className="foot" aria-live="polite">
          {roundDone && (
            <button className="btn" onClick={nextRound}>{lastRound ? "Дүн харах 🏁" : "Дараагийн тойрог ➜"}</button>
          )}
        </div>
      </>
    );
  }

  return (
    <div className={`kid ${nunito.className}`}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* sky */}
      <div className="sun" aria-hidden />
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="cloud"
          aria-hidden
          style={{ top: c.top, scale: c.scale, animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }}
        />
      ))}

      {/* grass */}
      <div className="hill b" aria-hidden />
      <div className="hill" aria-hidden />
      <span className="flower" style={{ left: "12%" }} aria-hidden>🌼</span>
      <span className="flower" style={{ left: "46%", bottom: 18 }} aria-hidden>🌷</span>
      <span className="flower" style={{ left: "82%" }} aria-hidden>🌸</span>

      {/* confetti on a good result */}
      {phase === "end" && pct >= 0.6 &&
        Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="conf"
            aria-hidden
            style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 6) * 0.45}s`, animationDuration: `${3 + (i % 4) * 0.5}s` }}
          >
            {CONFETTI[i % CONFETTI.length]}
          </span>
        ))}

      <div className="stage">
        <div className="mascot">
          {logoOk ? (
            <img
              key={`${phase}-${rIdx}-${fb ? fb.kind + fb.bag : "x"}-${roundDone ? 1 : 0}`}
              className={`sheep ${mood}`}
              src="/logo.png"
              alt="Судартан хонь"
              onError={() => setLogoOk(false)}
            />
          ) : (
            <span className={`sheep emoji ${mood}`} role="img" aria-label="Хонь">🐑</span>
          )}
          <div className="bubble" aria-live="polite">{say}</div>
        </div>
        <div className="panel">{panel}</div>
      </div>
    </div>
  );
}
