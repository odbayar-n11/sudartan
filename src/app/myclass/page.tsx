"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Manrope } from "next/font/google";
import "./dashboard.css";

const manrope = Manrope({ subsets: ["latin", "cyrillic"], weight: ["500", "600", "700", "800"] });

/* ---------- Data (replace with your API) ---------- */
const mainNav = [
  { label: "Нүүр", icon: "🏠", href: "/dashboard" },
  { label: "Хичээлүүд", icon: "🎓", href: "/lessons" },
  { label: "Төлөвлөгөө", icon: "📅", href: "/plan" },
  { label: "Статистик", icon: "📊", href: "/stats" },
  { label: "Хадгалсан", icon: "🔖", href: "/saved" },
];

const topicNav = [
  { label: "Эртний үг", icon: "📜", href: "/topics/ancient" },
  { label: "Зөв бичих дүрэм", icon: "✍️", href: "/topics/grammar" },
  { label: "Журамласан үг", icon: "🗣️", href: "/topics/words" },
  { label: "Хэлц үг", icon: "💬", href: "/topics/idioms", badge: "Шинэ" },
  { label: "Монгол бичиг", icon: "🖋️", href: "/topics/script" },
  { label: "Найзаа урих", icon: "👥", href: "/invite" },
];

const stats = [
  { label: "Нийт хэрэглэгч", value: "5,423", change: "16% энэ сард", trend: "up" },
  { label: "Гишүүд", value: "1,893", change: "1% энэ сард", trend: "down" },
  { label: "Одоо идэвхтэй", value: "189", change: "4% өнөөдөр", trend: "up" },
];

const customers = [
  { id: 1, name: "Jane Cooper", company: "Microsoft", phone: "(225) 555-0118", email: "jane@microsoft.com", country: "United States", status: "Active" },
  { id: 2, name: "Floyd Miles", company: "Yahoo", phone: "(205) 555-0100", email: "floyd@yahoo.com", country: "Kiribati", status: "Inactive" },
  { id: 3, name: "Ronald Richards", company: "Adobe", phone: "(302) 555-0107", email: "ronald@adobe.com", country: "Israel", status: "Inactive" },
  { id: 4, name: "Marvin McKinney", company: "Tesla", phone: "(252) 555-0126", email: "marvin@tesla.com", country: "Iran", status: "Active" },
  { id: 5, name: "Jerome Bell", company: "Google", phone: "(629) 555-0129", email: "jerome@google.com", country: "Réunion", status: "Active" },
  { id: 6, name: "Kathryn Murphy", company: "Microsoft", phone: "(406) 555-0120", email: "kathryn@microsoft.com", country: "Curaçao", status: "Active" },
  { id: 7, name: "Jacob Jones", company: "Yahoo", phone: "(208) 555-0112", email: "jacob@yahoo.com", country: "Brazil", status: "Active" },
  { id: 8, name: "Kristin Watson", company: "Facebook", phone: "(704) 555-0127", email: "kristin@facebook.com", country: "Åland Islands", status: "Inactive" },
];

/* ---------- Sidebar ---------- */
function NavLink({ item }) {
  const pathname = usePathname();
  const active = pathname === item.href;
  return (
    <Link href={item.href} className={active ? "nav-link on" : "nav-link"} aria-current={active ? "page" : undefined}>
      <span className="ic" aria-hidden>{item.icon}</span>
      {item.label}
      {item.badge && <span className="pill">{item.badge}</span>}
    </Link>
  );
}

function Sidebar({ userName }) {
  return (
    <aside className="sidebar">
         <div className="logo"><img src="/logo.png" alt="" width="40" height="40" />Судартан</div>
      <nav aria-label="Үндсэн цэс">
        {mainNav.map((i) => <NavLink key={i.href} item={i} />)}
        <div className="grp">Сэдвүүд</div>
        {topicNav.map((i) => <NavLink key={i.href} item={i} />)}
      </nav>
      <div className="grow" />
      <div className="upg">Pro болох <b>40% хямдрал</b></div>
      <div className="me"><i aria-hidden />{userName}</div>
    </aside>
  );
}

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

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = customers.filter((c) =>
      [c.name, c.company, c.email, c.country].some((v) => v.toLowerCase().includes(q))
    );
    return [...filtered].sort((a, b) => (order === "newest" ? a.id - b.id : b.id - a.id));
  }, [query, order]);

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

      <div className="tbl">
        <table>
          <thead>
            <tr><th>Нэр</th><th>Компани</th><th>Утас</th><th>Имэйл</th><th>Улс</th><th>Төлөв</th></tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td><td>{c.company}</td><td>{c.phone}</td><td>{c.email}</td><td>{c.country}</td>
                <td><span className={c.status === "Active" ? "st a" : "st i"}>{c.status}</span></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6}>Илэрц олдсонгүй. Өөр түлхүүр үгээр хайгаарай.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="pg">
        <span>256K бичлэгээс 1–{rows.length} харуулж байна</span>
        <div>
          <button aria-label="Өмнөх">‹</button>
          <button className="on">1</button>
          <button>2</button><button>3</button><button>4</button><button>40</button>
          <button aria-label="Дараах">›</button>
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
    <div className={`app ${manrope.className}`}>
      <Sidebar userName={userName} />
      <main>
        <div className="promo">Онцгой хямдрал 40% <button>Авах</button></div>
        <div className="wrap">
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
        </div>
      </main>
    </div>
  );
}
