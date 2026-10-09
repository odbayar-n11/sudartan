"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Nunito } from "next/font/google";

const display = Nunito({
  subsets: ["cyrillic", "latin"],
  weight: ["800", "900"],
  variable: "--font-display",
});

const body = Nunito({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-body",
});

/* ───────────── Sheep Head Motif ───────────── */

const ACCESSORIES = {
  pencil: <path d="M44 55l1-4 7-7 3 3-7 7z" fill="#fff" />,
  bubble: <path d="M44 45h12a2 2 0 012 2v5a2 2 0 01-2 2h-6l-4 3v-3h-2a2 2 0 01-2-2v-5a2 2 0 012-2z" fill="#fff" />,
  book: <path d="M43.5 45.5H49v10h-5.500zM51 45.5h5.500v10H51z" fill="#fff" />,
  quill: <path d="M56 44c-8 1-11 6-12 12 5-1 9-4 12-12z" fill="#fff" />,
};

function SheepHead({ acc, className = "" }) {
  const wool = [[20, 24, 11], [32, 18, 13], [44, 24, 11], [26, 32, 10], [38, 32, 10]];
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <g fill="#1e293b">
        <ellipse cx="15" cy="38" rx="9" ry="4.500" transform="rotate(-20 15 38)" />
        <ellipse cx="49" cy="38" rx="9" ry="4.500" transform="rotate(20 49 38)" />
      </g>
      <g fill="#bae6fd">
        {wool.map(([x, y, r]) => <circle key={`o${x}${y}`} cx={x} cy={y} r={r + 1.500} />)}
      </g>
      <ellipse cx="32" cy="40" rx="14" ry="16" fill="#1e293b" />
      <g fill="#FDFCFC">
        {wool.map(([x, y, r]) => <circle key={`i${x}${y}`} cx={x} cy={y} r={r} />)}
        <circle cx="26" cy="39" r="3" />
        <circle cx="38" cy="39" r="3" />
      </g>
      <g fill="#1e293b">
        <circle cx="26.700" cy="39.400" r="1.500" />
        <circle cx="38.700" cy="39.400" r="1.500" />
      </g>
      <ellipse cx="32" cy="48.500" rx="4.500" ry="3" fill="#f43f5e" />
      {acc && ACCESSORIES[acc] && (
        <>
          <circle cx="50" cy="50" r="12" fill="#38bdf8" />
          {ACCESSORIES[acc]}
        </>
      )}
    </svg>
  );
}

/* ───────────── Cloud SVG Divider ───────────── */

const FRONT = [
  [30, 140, 46], [120, 128, 62], [235, 142, 48], [330, 118, 72], [450, 140, 52],
  [545, 126, 66], [660, 144, 46], [760, 112, 76], [880, 138, 54], [975, 124, 68],
  [1090, 144, 48], [1180, 114, 74], [1295, 138, 52], [1390, 126, 64],
];

function Clouds({ fill = "#FDFCFC", flip = false, className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none overflow-x-clip ${flip ? "rotate-180" : ""} ${className}`}
    >
      <svg
        viewBox="0 0 1440 200"
        className="relative block h-auto max-w-none w-[max(100%,1000px)] left-1/2 -translate-x-1/2"
      >
        <g fill={fill}>
          {FRONT.map(([x, y, r]) => <circle key={x} cx={x} cy={y} r={r} />)}
          <rect x="0" y="150" width="1440" height="50" />
        </g>
      </svg>
    </div>
  );
}

/* ───────────── Main Options Component ───────────── */

export default function HomePage() {
  const router = useRouter();

  const goToVocab = () => {
    router.push('/test');
  };

  const goToIdiom = () => {
    router.push('/test-idiom');
  };

  return (
    <main
      className={`${display.variable} ${body.variable} min-h-screen bg-[#e0f2fe] text-[#0f172a] flex flex-col justify-between overflow-x-hidden relative`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* Background radial gradient accent */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#38bdf8_0%,transparent_65%)] opacity-60 pointer-events-none" />

      {/* Navigation / Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-12 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-md border border-white/60 hover:scale-105 transition-transform duration-300">
          <img src="/images/logo.png" className="w-8 h-8 object-contain" alt="Sudartan Logo" />
          <span className="font-extrabold text-[#0284c7] font-[family-name:var(--font-display)] tracking-wide leading-none">
            СУДАРТАН
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-white/80 hover:bg-white text-[#0284c7] font-extrabold text-sm shadow-md transition-all duration-300 border border-white/60"
        >
          ← Нүүр хуудас
        </Link>
      </header>

      {/* Center Options Area */}
      <section className="relative z-20 w-full max-w-4xl mx-auto px-6 py-12 my-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0c4a6e] font-[family-name:var(--font-display)] tracking-tight drop-shadow-sm mb-4">
            Та сурахыг хүсэж буй сэдвээ сонгоно уу!
          </h1>
          <p className="text-[#0369a1] font-semibold text-lg max-w-lg mx-auto">
            Эх хэлний мэдлэгээ шалгаж, өөрийгөө хөгжүүлэх дасгалаа эхлүүлээрэй.
          </p>
        </div>

        {/* Option Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Card 1: Үгийн сан */}
          <div
            onClick={goToVocab}
            className="group relative bg-white/90 backdrop-blur-md border border-white/80 rounded-[32px] p-8 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Watermark Background Graphic */}
           

            <div>
              <div className="w-16 h-16 rounded-2xl bg-[#01993e] flex items-center justify-center mb-6 shadow-md group-hover:rotate-6 transition-transform duration-300">
                <SheepHead acc="pencil" className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#0a5600] font-[family-name:var(--font-display)] mb-3">
                Үгийн сан
              </h2>
              <p className="text-[#334155] text-sm leading-relaxed font-semibold">
                Алдаатай бичигддэг журамласан үгсийг зөв бичиж сурах ба тэдгээрийг тогтоох дасгал ажил.
              </p>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-[#0284c7] font-extrabold text-base group-hover:translate-x-1 transition-transform duration-300">
                Эхлэх →
              </span>
              <span className="w-10 h-10 rounded-full bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center font-bold group-hover:bg-[#0284c7] group-hover:text-white transition-colors duration-300">
                ➔
              </span>
            </div>
          </div>

          {/* Card 2: Хэлц үг */}
          <div
            onClick={goToIdiom}
            className="group relative bg-white/90 backdrop-blur-md border border-white/80 rounded-[32px] p-8 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Watermark Background Graphic */}
            
            <div>
              <div className="w-16 h-16 rounded-2xl bg-[#01993e] flex items-center justify-center mb-6 shadow-md group-hover:rotate-6 transition-transform duration-300">
                <SheepHead acc="bubble" className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#0a5600] font-[family-name:var(--font-display)] mb-3">
                Хэлц үг
              </h2>
              <p className="text-[#334155] text-sm leading-relaxed font-semibold">
                Өвөрмөц болон далд утгатай монгол хэлц үгсийн зөв утгыг олж танин мэдэх дасгал.
              </p>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-[#0284c7] font-extrabold text-base group-hover:translate-x-1 transition-transform duration-300">
                Эхлэх →
              </span>
              <span className="w-10 h-10 rounded-full bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center font-bold group-hover:bg-[#0284c7] group-hover:text-white transition-colors duration-300">
                ➔
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Cloud Decorative Footer */}
      <div className="relative z-10 w-full mt-auto pt-16">
        <Clouds fill="#FDFCFC" className="w-full" />
        <footer className="bg-[#FDFCFC] py-6 text-center text-xs text-[#0369a1] font-bold">
          © {new Date().getFullYear()} Судартан. Бүх эрх хуулиар хамгаалагдсан.
        </footer>
      </div>
    </main>
  );
}