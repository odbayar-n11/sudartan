"use client";

import { useEffect, useMemo, useState } from "react";
import { Manrope } from "next/font/google";
// import "../../dashboard/dashboard.css";
import "./ancient.css";
import { supabase } from "../../../lib/supabase";

const manrope = Manrope({ subsets: ["latin", "cyrillic"], weight: ["500", "600", "700", "800"] });

/* ---------- Page ---------- */
export default function AncientPage() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Бүгд");
  const [open, setOpen] = useState(() => new Set()); // ids of revealed cards

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("ancient_words")
        .select("id, word, rom, cat, meaning, modern")
        .order("id");
      if (error) setError("Үгсийг ачаалж чадсангүй. Дахин оролдоно уу.");
      else setWords(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const cats = useMemo(() => ["Бүгд", ...new Set(words.map((w) => w.cat))], [words]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return words.filter(
      (w) =>
        (cat === "Бүгд" || w.cat === cat) &&
        ((w.word ?? "").toLowerCase().includes(q) || (w.rom ?? "").toLowerCase().includes(q) || (w.meaning ?? "").toLowerCase().includes(q))
    );
  }, [words, query, cat]);

  function toggle(id) {
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className={`app ${manrope.className}`}>
      <main>
        <div className="wrap">
          <div className="a-head">
            <div>
              <h1>Эртний үг</h1>
              <p>Картан дээр дарж утгыг нь харна уу.</p>
            </div>
            <div className="a-count">{open.size} / {words.length} үзсэн</div>
          </div>

          <div className="a-bar">
            <input type="search" placeholder="Үг хайх" aria-label="Үг хайх" value={query} onChange={(e) => setQuery(e.target.value)} />
            <div className="cats" role="group" aria-label="Ангилал">
              {cats.map((c) => (
                <button key={c} className={c === cat ? "on" : ""} onClick={() => setCat(c)}>{c}</button>
              ))}
            </div>
          </div>

          <div className="words">
            {list.map((w) => {
              const shown = open.has(w.id);
              return (
                <button key={w.id} className="wcard" onClick={() => toggle(w.id)} aria-pressed={shown}>
                  <span className="tag">{w.cat}</span>
                  <h3>{w.word}</h3>
                  <span className="rom">{w.rom}</span>
                  {shown ? (
                    <span className="mean">{w.meaning}<em>{w.modern}</em></span>
                  ) : (
                    <span className="hint">Утгыг харах</span>
                  )}
                </button>
              );
            })}
          </div>
          {loading && <div className="empty">Ачаалж байна…</div>}
          {error && <div className="empty">{error}</div>}
          {!loading && !error && list.length === 0 && <div className="empty">Үг олдсонгүй. Өөр түлхүүр үгээр хайгаарай.</div>}
        </div>
      </main>
    </div>
  );
}
