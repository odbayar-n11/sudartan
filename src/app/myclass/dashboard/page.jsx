"use client";

import { useMemo, useState } from "react";
import AppShell from "../components/AppShell";

/* ---------- Data (replace with your API) ---------- */
const stats = [
  { label: "Нийт хэрэглэгч", value: "5,423", change: "16% энэ сард", trend: "up" },
  { label: "Гишүүд", value: "1,893", change: "1% энэ сард", trend: "down" },
  { label: "Одоо идэвхтэй", value: "189", change: "4% өнөөдөр", trend: "up" },
];

/* ---------- Stats ---------- */
function Stats() {
  return (
    <div className="stats">
      {stats.map((s) => (
        <div className="stat" key={s.label}>
          <p>{s.label}</p>
          <strong>{s.value}</strong>
          <span className={s.trend === "up" ? "up" : "dn"}>{s.trend === "up" ? "↑" : "↓"} {s.change}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Customers table ---------- */
function CustomersTable() {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState("newest");

  return (
    <div className="panel">
      <div className="ph">
        <div><h2>Бүх хэрэглэгч</h2><span>Идэвхтэй гишүүд</span></div>
        <div className="tools">
          <input type="search" placeholder="Хайх" aria-label="Хайх" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select aria-label="Эрэмбэлэх" value={order} onChange={(e) => setOrder(e.target.value)}>
            <option value="newest">Шинэ эхэндээ</option>
            <option value="oldest">Хуучин эхэндээ</option>
          </select>
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export default function DashboardPage() {
  // TODO: replace with the logged-in user's name from your auth
  const userName = "y/n";

  return (
    <AppShell userName={userName}>
      <div className="top">
        <div>
          <h1>Өдрийн мэнд,<small>{userName} 👋</small></h1>
          <p className="lead">Эхлээд суралцах төлөвлөгөө гаргацгаая</p>
          <button className="btn">Төлөвлөгөө үүсгэх</button>
        </div>
        <div className="chips"><div className="chip">🔥 0</div><div className="chip">💎 20</div></div>
      </div>

      <h2 className="sec"><span className="ib" aria-hidden>📊</span>Статистик</h2>
      <Stats />

      <h2 className="sec"><span className="ib" aria-hidden>👥</span>Хэрэглэгчид</h2>
      <CustomersTable />
    </AppShell>
  );
}