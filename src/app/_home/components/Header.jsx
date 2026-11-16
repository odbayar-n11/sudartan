import Link from "next/link";
import { NAV_ORDER } from "../data";

export default function Header({ menuOpen, setMenuOpen, onNavClick }) {
  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 w-full bg-white/20 backdrop-blur-md transition-all duration-300 pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <nav className="relative flex flex-col lg:flex-row items-center justify-between lg:gap-8 py-3 lg:py-4 text-sm">
            <div className="flex items-center justify-between w-full lg:w-auto">
              <a
                href="#home"
                onClick={(e) => onNavClick(e, "#home")}
                className="flex items-center gap-2.5 shrink-0 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-md border border-white/60"
              >
                <img src="/images/logo.png" className="w-8 h-8 object-contain" alt="Sudartan Logo" />
                <span className="font-extrabold text-[#0284c7] font-[family-name:var(--font-display)] tracking-wide leading-none">
                  СУДАРТАН
                </span>
              </a>

              <button
                aria-label="Цэс"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                className="lg:hidden w-11 h-11 flex items-center justify-center text-2xl text-[#0284c7] bg-white/80 rounded-full shadow-md"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? "✕" : "☰"}
              </button>
            </div>

            {/* DESKTOP NAV — only on large screens, where it has room to sit between logo and buttons */}
            <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-6 xl:gap-8 bg-white/85 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/80 shadow-md whitespace-nowrap">
              {NAV_ORDER.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => onNavClick(e, link.href)}
                  className={`relative pb-0.5 transition-colors duration-300 ease-out ${
                    link.active
                      ? "text-[#0284c7] font-bold"
                      : "text-[#334155] font-semibold hover:text-[#0284c7]"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* AUTH BUTTONS (desktop) */}
            <div className="hidden lg:flex items-center gap-3 xl:gap-4 min-h-[44px]">
              <Link className="inline-flex items-center justify-center px-5 xl:px-6 py-2.5 rounded-full bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold transition-colors duration-300 shrink-0 shadow-lg" href="/signup">
                Бүртгүүлэх
              </Link>

              <Link className="inline-flex items-center justify-center px-5 xl:px-6 py-2.5 rounded-full bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold transition-colors duration-300 shrink-0 shadow-lg" href="/signin">
                Нэвтрэх
              </Link>
            </div>

            {/* MOBILE MENU */}
            {menuOpen && (
              <div
                id="mobile-menu"
                className="w-full lg:hidden rounded-[30px] bg-[#0284c7] p-4 mt-3 flex flex-col gap-1 border border-[#7dd3fc]/40 shadow-lg max-h-[calc(100svh-6rem)] overflow-y-auto"
              >
                {NAV_ORDER.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => onNavClick(e, link.href)}
                    className={`px-4 py-3 rounded-2xl text-base transition-colors duration-300 ${
                      link.active
                        ? "text-white font-bold bg-[#0369a1]"
                        : "text-[#e0f2fe] font-semibold hover:bg-[#0369a1]"
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link
                    onClick={() => setMenuOpen(false)}
                    className="py-3 rounded-full bg-white/15 border border-white/50 text-white font-extrabold text-center"
                    href="/signup"
                  >
                    Бүртгүүлэх
                  </Link>
                  <Link
                    onClick={() => setMenuOpen(false)}
                    className="py-3 rounded-full bg-white text-[#0284c7] font-extrabold text-center"
                    href="/signin"
                  >
                    Нэвтрэх
                  </Link>
                </div>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Tap-outside backdrop for the mobile menu */}
      {menuOpen && (
        <button
          aria-label="Цэс хаах"
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}
