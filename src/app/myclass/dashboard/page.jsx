"use client";
import AppShell from "../components/AppShell";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

/* ---------- Data (replace with your API) ---------- */
const customers = [
  { id: 1, name: "Бат-Эрдэнэ", email: "bat@example.com", joined: "2026-09-28", status: "Идэвхтэй" },
  { id: 2, name: "Сарнай", email: "sarnai@example.com", joined: "2026-09-15", status: "Идэвхтэй" },
  { id: 3, name: "Тэмүүлэн", email: "temuulen@example.com", joined: "2026-08-30", status: "Идэвхгүй" },
  { id: 4, name: "Оюунаа", email: "oyunaa@example.com", joined: "2026-08-12", status: "Идэвхтэй" },
];

/* ---------- Customers table ---------- */
function CustomersTable() {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState("newest");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
    return [...filtered].sort((a, b) =>
      order === "newest"
        ? b.joined.localeCompare(a.joined)
        : a.joined.localeCompare(b.joined)
    );
  }, [query, order]);

  return (
    <div className="panel">
      <div className="ph">
        <div>
          <h2>Бүх хэрэглэгч</h2>
          <span>Идэвхтэй гишүүд</span>
        </div>
        <div className="tools">
          <input
            type="search"
            placeholder="Хайх"
            aria-label="Хайх"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            aria-label="Эрэмбэлэх"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
          >
            <option value="newest">Шинэ эхэндээ</option>
            <option value="oldest">Хуучин эхэндээ</option>
          </select>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Нэр</th>
            <th>И-мэйл</th>
            <th>Бүртгүүлсэн</th>
            <th>Төлөв</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4}>Илэрц олдсонгүй</td>
            </tr>
          ) : (
            rows.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.joined}</td>
                <td>{c.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Page ---------- */
export default function DashboardPage() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      setUserName(profile?.username || user.email.split("@")[0]);
    }
    loadProfile();
  }, []);

  return (
    <AppShell userName={userName}>
      <div className="top">
        <div>
          <h1>
            Өдрийн мэнд,<small>{userName} 👋</small>
          </h1>
          <p className="lead">Эхлээд суралцах төлөвлөгөө гаргацгаая</p>
          <button className="btn">Төлөвлөгөө үүсгэх</button>
        </div>
        <div className="chips">
          <div className="chip">🔥 0</div>
          <div className="chip">💎0</div>
        </div>
      </div>

      <h2 className="sec">
        <span className="ib" aria-hidden>👥</span>Хэрэглэгчид
      </h2>
      <CustomersTable />
    </AppShell>
  );
}