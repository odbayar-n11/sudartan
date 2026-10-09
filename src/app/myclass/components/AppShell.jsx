"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Manrope } from "next/font/google";
import { mainNav } from "../data/nav";
import "../dashboard/dashboard.css";

const manrope = Manrope({ subsets: ["latin", "cyrillic"], weight: ["500", "600", "700", "800"] });

function NavLink({ item }) {
  const pathname = usePathname();
  const active = pathname === item.href || (item.also && item.also.some((p) => pathname.startsWith(p)));
  return (
    <Link href={item.href} className={active ? "nav-link on" : "nav-link"} aria-current={active ? "page" : undefined}>
      <span className="ic" aria-hidden>{item.icon}</span>
      {item.label}
    </Link>
  );
}

export default function AppShell({ userName = "y/n", children }) {
  return (
    <div className={`app ${manrope.className}`}>
      <aside className="sidebar">
        <Link href="http://localhost:3000/" className="logo" aria-label="Судартан — нүүр хуудас">
  <img src="/images/logo.png" alt="" width="40" height="40" />
  Судартан
</Link>
        <nav aria-label="Үндсэн цэс">
          {mainNav.map((i) => <NavLink key={i.href} item={i} />)}
        </nav>
        <div className="grow" />
        <div className="me"><i aria-hidden />{userName}</div>
      </aside>
      <main>
        <div className="wrap">{children}</div>
      </main>
    </div>
  );
}