"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Manrope } from "next/font/google";
import { mainNav } from "../data/nav";
import { supabase } from "../../../lib/supabase";
import "../dashboard/dashboard.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700", "800"],
});

function NavLink({ item }) {
  const pathname = usePathname();
  const active =
    pathname === item.href ||
    (item.also && item.also.some((p) => pathname.startsWith(p)));

  return (
    <Link
      href={item.href || "/"}
      className={active ? "nav-link on" : "nav-link"}
      aria-current={active ? "page" : undefined}
    >
      <span className="ic" aria-hidden>{item.icon}</span>
      {item.label}
    </Link>
  );
}

export default function AppShell({ userName = "", children }) {
  const router = useRouter();

  // user menu
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const menuRef = useRef(null);

  // logout confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const confirmBtnRef = useRef(null);

  // Load the logged-in user's email and username
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data?.user;
      setEmail(u?.email || "");
      if (!u) return;
      const { data: p } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", u.id)
        .single();
      setName(p?.username || u.email.split("@")[0]);
    });
  }, []);

  // Close the user menu on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function openConfirm() {
    setMenuOpen(false);
    setError("");
    setConfirmOpen(true);
  }

  function closeConfirm() {
    if (loading) return;
    setConfirmOpen(false);
    setError("");
  }

  // Focus the confirm button when the dialog opens, close on Escape
  useEffect(() => {
    if (!confirmOpen) return;
    confirmBtnRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") closeConfirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmOpen, loading]);

  async function handleConfirmLogout(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: outErr } = await supabase.auth.signOut();
      if (outErr) throw outErr;

      setConfirmOpen(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Алдаа гарлаа. Дахин оролдоно уу");
      setLoading(false);
    }
  }

  return (
    <div className={`app ${manrope.className}`}>
      <aside className="sidebar">
        {/* Plain div instead of a link, so clicking it does nothing */}
        <div className="logo">
          <img src="/images/logo.png" alt="" width="40" height="40" />
          Судартан
        </div>

        <nav aria-label="Үндсэн цэс">
          {mainNav.map((i, index) => (
            <NavLink key={i.href || index} item={i} />
          ))}
        </nav>

        <div className="grow" />

        {/* User block + popup menu */}
        <div className="me-wrap" ref={menuRef}>
          {menuOpen && (
            <div className="user-menu" role="menu">
              {email && <div className="um-email">{email}</div>}

              <Link
                href="/myclass/profile"
                className="um-item"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                <span className="ic" aria-hidden>✏️</span>
                Профайл засах
              </Link>

              <div className="um-sep" />

              <button
                type="button"
                className="um-item danger"
                role="menuitem"
                onClick={openConfirm}
              >
                <span className="ic" aria-hidden>🚪</span>
                Гарах
              </button>
            </div>
          )}

          <button
            type="button"
            className="me-btn"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <i aria-hidden />
            <span className="me-name">{name || userName}</span>
            <span className="chev" aria-hidden>⌃</span>
          </button>
        </div>
      </aside>

      <main>
        <div className="wrap">{children}</div>
      </main>

      {confirmOpen && (
        <div className="modal-overlay" onClick={closeConfirm}>
          <form
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleConfirmLogout}
          >
            <div className="modal-ic" aria-hidden>🚪</div>
            <h2 id="logout-title">Гарахдаа итгэлтэй байна уу?</h2>
            <p>Та системээс гарах гэж байна.</p>

            {error && <div className="modal-err" role="alert">{error}</div>}

            <div className="modal-actions">
              <button
                type="button"
                className="modal-cancel"
                onClick={closeConfirm}
                disabled={loading}
              >
                Цуцлах
              </button>
              <button
                ref={confirmBtnRef}
                type="submit"
                className="modal-ok"
                disabled={loading}
              >
                {loading ? "Гарж байна..." : "Гарах"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}