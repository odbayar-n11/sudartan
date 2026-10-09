"use client";

import { useState, useEffect } from "react";
import { Nunito, Irish_Grover } from "next/font/google";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { supabase } from "@/lib/supabase";

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

const irishGrover = Irish_Grover({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-irish",
});

const NAV_LINKS = [
  { href: "#contact", label: "Холбоо барих" },
  { href: "#offer", label: "Үйлчилгээ" },
  { href: "#faq", label: "Асуулт & хариулт" },
  { href: "#about", label: "Бидний тухай" },
  { href: "#home", label: "Нүүр", active: true },
];

const NAV_ORDER = [...NAV_LINKS].reverse();

const STATS = [
  { value: "...", label: "Суралцагч" },
  { value: "...", label: "Хичээл" },
  { value: "...", label: "Туршлага" },
  { value: "...", label: "Сэтгэл ханамж" },
];

const OFFERS = [
  {
    title: "Үгийн сан",
    desc: "Кирилл монгол хэлэнд түгээмэл алдаатай бичигддэг журамласан 700 үгийг зөв бичиж сурах дасгал ажлууд",
    icon: "pencil",
  },
  {
    title: "Зөв бичих дүрэм",
    desc: "Гээгдэх гээгдэхгүй эгшгийн дүрэм, эгшигт болон заримдаг гийгүүлэгчийн дүрэм, зөөлний тэмдгийн дүрэм гэх мэт зөв бичгийн дүрмийн дасгалууд",
    icon: "book",
  },
  {
    title: "Монгол бичиг",
    desc: "Хэл бичгийн элсэлтийн шалгалтанд орж ирдэг богино эхүүдийг кирилл бичигт хөрвүүлэх дасгалууд",
    icon: "quill",
  },
  {
    title: "Хэлц үгс",
    desc: "Одоогийн нийгэмд цөөн хэрэглэгдэх өвөрмөц далд утгатай хэлц үгсийг танин мэдэх",
    icon: "bubble",
  },
];

const FAQS = [
  {
    q: "Төлбөртэй юу?",
    a: "Үгүй.",
  },
  {
    q: "Үр дүнтэй юу?",
    a: "Тийм ээ, өдөр бүр тогтмол дасгал хийсэн суралцагчид 4–6 долоо хоногийн дараа зөв бичих дүрэмдээ мэдэгдэхүйц ахиц гаргадаг.",
  },
  {
    q: "Гар утсанд ашиглах боломжтой юу?",
    a: "Тийм ээ, вэбсайт бүх төхөөрөмж дээр ажиллана",
  },
  {
    q: "Эх сурвалж баталгаатай юу?",
    a: "Тийм ээ, бид 2017 оны журамласан толь болон монгол хэлний мэргэжлийн багш нараас зөвлөгөө аван ажилладаг.",
  },
];

const FOUNDERS = [
  { name: "Н. Одбаяр" },
  { name: "Л. Өсөх-Ирээдүй" },
  { name: "У. Ундрам" },
  { name: "С. Мичид" },
  { name: "С. Төгөлдөр" },
];

const AVATAR_BG = ["#38BDF8", "#0284C7", "#0ea5e9", "#7dd3fc", "#0369a1"];

const BODY = [
  [40, 58, 24], [62, 40, 27], [90, 36, 28], [115, 46, 25],
  [50, 76, 22], [78, 74, 26], [104, 72, 24],
];

const ACCESSORIES = {
  pencil: <path d="M44 55l1-4 7-7 3 3-7 7z" fill="#fff" />,
  book: <path d="M43.5 45.5H49v10h-5.500zM51 45.5h5.500v10H51z" fill="#fff" />,
  quill: <path d="M56 44c-8 1-11 6-12 12 5-1 9-4 12-12z" fill="#fff" />,
  bubble: <path d="M44 45h12a2 2 0 012 2v5a2 2 0 01-2 2h-6l-4 3v-3h-2a2 2 0 01-2-2v-5a2 2 0 012-2z" fill="#fff" />,
  mail: (
    <>
      <rect x="43" y="45" width="14" height="10" rx="1.5" fill="#fff" />
      <path d="M43.5 46l6.5 5 6.500-5" stroke="#38bdf8" strokeWidth="1.4" fill="none" />
    </>
  ),
  phone: (
    <>
      <rect x="44" y="43.500" width="12" height="13" rx="2" fill="#fff" />
      <circle cx="50" cy="53.500" r="1" fill="#38bdf8" />
    </>
  ),
  pin: (
    <>
      <path d="M50 56s-5-4.500-5-8.500a5 5 0 0110 0c0 4-5 8.500-5 8.500z" fill="#fff" />
      <circle cx="50" cy="47.500" r="1.800" fill="#38bdf8" />
    </>
  ),
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
      {acc && (
        <>
          <circle cx="50" cy="50" r="12" fill="#38bdf8" />
          {ACCESSORIES[acc]}
        </>
      )}
    </svg>
  );
}

const FRONT = [
  [30, 140, 46], [120, 128, 62], [235, 142, 48], [330, 118, 72], [450, 140, 52],
  [545, 126, 66], [660, 144, 46], [760, 112, 76], [880, 138, 54], [975, 124, 68],
  [1090, 144, 48], [1180, 114, 74], [1295, 138, 52], [1390, 126, 64],
];
const BACK = [
  [0, 120, 56, 0], [90, 100, 70, 1], [200, 118, 58, 0], [300, 90, 78, 1],
  [420, 112, 60, 0], [520, 94, 72, 1], [640, 118, 56, 0], [740, 86, 80, 1],
  [850, 112, 60, 0], [960, 96, 72, 1], [1070, 118, 56, 0], [1170, 88, 78, 1],
  [1280, 110, 60, 0], [1380, 94, 70, 1],
];

const CLOUD_H = "max(100vw, 1000px) * 0.1389";

function Clouds({ fill, back, accent, flip = false, className = "", children }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none overflow-x-clip ${flip ? "rotate-180" : ""} ${className}`}
    >
      {children}
      <svg
        viewBox="0 0 1440 200"
        className="relative block h-auto max-w-none w-[max(100%,1000px)] left-1/2 -translate-x-1/2"
        style={{ filter: "drop-shadow(0 -3px 6px white blur(1.2px)" }}
      >
        {back && (
          <g opacity="0.75">
            {BACK.map(([x, y, r, a]) => (
              <circle key={x} cx={x} cy={y} r={r} fill={a && accent ? accent : back} />
            ))}
            <rect x="0" y="130" width="1440" height="70" fill={back} />
          </g>
        )}
        <g fill={fill} opacity="1">
          {FRONT.map(([x, y, r]) => <circle key={x} cx={x} cy={y} r={r} />)}
          <rect x="0" y="150" width="1440" height="50" />
        </g>
      </svg>
    </div>
  );
}

const H2 = "text-3xl sm:text-5xl font-extrabold tracking-tight font-[family-name:var(--font-display)]";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const router = useRouter();

  // ── Auth state ──
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
  };

  const smoothScroll = (e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goToOptions = () => {
    router.push("/options");
  };

  return (
    <main
      className={`${display.variable} ${body.variable} ${irishGrover.variable} min-h-screen bg-[#FDFCFC] text-[#0f172a] overflow-x-hidden`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        @keyframes sheep-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .sheep-float { animation: sheep-float 5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          .sheep-float { animation: none; }
        }
      `}</style>

      {/* HERO SECTION */}
      <section
        id="home"
        className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#f4f1ea] pt-28 sm:pt-32"
      >
        {/* Full-screen Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero.jpg"
            alt="Hero Background"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* FIXED HEADER */}
        <header className="fixed top-0 inset-x-0 z-50 w-full bg-white/20 backdrop-blur-md transition-all duration-300">
          <div className="max-w-7xl mx-auto px-6 sm:px-12">
            <nav className="relative flex flex-col sm:flex-row items-center justify-between gap-6 lg:gap-8 py-4 text-sm">
              <div className="flex items-center justify-between w-full sm:w-auto">
                <div className="flex items-center gap-2.5 shrink-0 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-md border border-white/60">
                  <img src="/images/logo.png" className="w-8 h-8 object-contain" alt="Sudartan Logo" />
                  <span className="font-extrabold text-[#0284c7] font-[family-name:var(--font-display)] tracking-wide leading-none">
                    СУДАРТАН
                  </span>
                </div>

                <button
                  aria-label="Цэс"
                  className="sm:hidden text-2xl text-[#0284c7] p-2 bg-white/80 rounded-full shadow-md"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  {menuOpen ? "✕" : "☰"}
                </button>
              </div>

              <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 items-center gap-6 lg:gap-8 bg-white/85 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/80 shadow-md">
                {NAV_ORDER.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => smoothScroll(e, link.href)}
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
              <div className="hidden sm:flex items-center gap-4 min-h-[44px]">
                {!authLoading && (
                  user ? (
                    <>
                      <Link className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold transition-colors duration-300 shrink-0 shadow-lg" href="/myclass/dashboard">
                        Миний анги
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-white/90 hover:bg-white text-[#0284c7] font-extrabold transition-colors duration-300 shrink-0 shadow-lg"
                      >
                        Гарах
                      </button>
                    </>
                  ) : (
                    <>
                      <Link className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold transition-colors duration-300 shrink-0 shadow-lg" href="/signup">
                        Бүртгүүлэх
                      </Link>

                      <Link className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold transition-colors duration-300 shrink-0 shadow-lg" href="/signin">
                        Нэвтрэх
                      </Link>
                    </>
                  )
                )}
              </div>

              {/* MOBILE MENU */}
              {menuOpen && (
                <div className="w-full sm:hidden rounded-[30px] bg-[#0284c7] p-4 flex flex-col gap-1 border border-[#7dd3fc]/40 shadow-lg mt-2">
                  {NAV_ORDER.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={(e) => smoothScroll(e, link.href)}
                      className={`px-3 py-2.5 rounded-2xl transition-colors duration-300 ${
                        link.active
                          ? "text-white font-bold bg-[#0369a1]"
                          : "text-[#e0f2fe] font-semibold hover:bg-[#0369a1]"
                      }`}
                    >
                      {link.label}
                    </a>
                  ))}
                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="mt-2 w-full py-2.5 rounded-full bg-white text-[#0284c7] font-extrabold"
                    >
                      Гарах
                    </button>
                  ) : (
                    <Link className="mt-2 w-full py-2.5 rounded-full bg-white text-[#0284c7] font-extrabold text-center block" href="/signin">
                      Нэвтрэх
                    </Link>
                  )}
                </div>
              )}
            </nav>
          </div>
        </header>

        {/* HERO CENTER CONTENT */}
        <div
          className="relative z-20 flex-1 flex flex-col items-center justify-end text-center px-4 pb-12"
          style={{ paddingBottom: `calc(${CLOUD_H} + 0.5rem)` }}
        >
          <div className="relative w-full max-w-7xl mx-auto">
            <div className="w-[60%] max-w-xl flex flex-col items-start text-left">
              <img
                src="/images/texttt.png"
                alt=""
                className="w-full h-auto mb-4"
              />
              <p className="text-xl sm:text-2xl font-extrabold text-[#0a5600] leading-relaxed drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]">
                Хэл бичгийн элсэлтийн шалгалтад бэлдэх цогц дасгалыг агуулсан Монголын анхны сайт.
              </p>

              <div className="pt-6 flex items-center gap-5">
                <button
                  className="px-7 py-3 bg-[#0284c7] hover:bg-[#00a5600] text-white font-extrabold rounded-full shadow-2xl hover:scale-105 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0284c7] mt-4"
                  onClick={goToOptions}
                >
                  Туршилтын дасгал
                </button>
              </div>
            </div>
          </div>
        </div>

        <Clouds accent="#7dd3fc" back="#bae6fd" className="absolute bottom-0 inset-x-0 z-10 -mb-px translate-y-16" fill="#FDFCFC"/>
      </section>

      {/* ABOUT */}
      <section id="about" className="bg-[#FDFCFC]">
        <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-14 items-center">
          <div className="space-y-5">
            <h2 className={`${H2} text-[#0f172a]`}>Бидний тухай</h2>
            <p className="text-[#475569] leading-relaxed max-w-lg">
              Судартан нь монгол хэлний зөв бичих дүрэм, үгийн сан, үндэсний монгол бичгийг нэг дороос сурах боломжийг олгодог платформ юм. Бид монгол хэлний багш нартай хамтран хэл бичгийн элсэлтийн шалгалтад бэлдэх цогц талбарыг үүсгэлээ.
            </p>
            <p className="text-[#475569] leading-relaxed max-w-lg">
              Цаг ирэх тусам хэл бичгийн шалгалтын оноо буурч, жил бүр 5000-10000 сурагч хэл бичгийн элсэлтийн шалгалтдаа 400-аас доош оноо авч их сургуульд элсэн орох боломжоо алдаж байна. Эдгээр болон бусад хүүхдүүдэд хэл бичгийн элсэлтийн шалгалтандаа бэлдэж сайжрахад нь тусалж, цаашлаад монголын соёлын амин сүнс нь болсон эх хэлийнхээ ач холбогдолыг танин мэдүүлэх нь бидний зорилго билээ.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={`rounded-[30px] bg-[#e0f2fe] p-6 border border-[#bae6fd] ${i % 2 ? "translate-y-4" : ""}`}
              >
                <p className="text-4xl font-black text-[#0284c7] font-[family-name:var(--font-display)]">
                  {stat.value}
                </p>
                <p className="text-[#0369a1] mt-1 text-sm font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFFER */}
      <section id="offer" className="relative bg-[#e0f2fe] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,#38bdf8_0%,transparent_55%)] opacity-70" />
        <Clouds className="absolute top-0 inset-x-0 -mt-px" fill="#FDFCFC" flip/>
        <div className="relative max-w-7xl mx-auto px-6" style={{ paddingTop: `calc(${CLOUD_H} + 3rem)`, paddingBottom: `calc(${CLOUD_H} + 3rem)` }}>
          <div className="max-w-lg mb-12">
            <h2 className={`${H2} text-white`}>Бидний үйлчилгээ</h2>
            <p className="text-[#ffffff] mt-3 leading-relaxed">
              Дөрвөн үндсэн чиглэлээр эх хэлнийхээ мэдлэгийг системтэйгээр дээшлүүлээрэй.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {OFFERS.map((offer) => (
              <div
                key={offer.title}
                className="rounded-[30px] bg-[#ffffff] backdrop-blur-md border border-white/20 p-6 hover:border-white/60 transition-colors duration-300"
              >
                <span className="w-16 h-16 rounded-full bg-[#01993e] flex items-center justify-center mb-5 shadow-inner">
                  <SheepHead acc="{offer.icon}" className="w-12 h-12"/>
                </span>
                <h3 className="font-extrabold text-[#0a5600] text-xl mb-2 font-[family-name:var(--font-display)]">
                  {offer.title}
                </h3>
                <p className="text-[#000000] text-sm leading-relaxed">
                  {offer.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
        <Clouds back="#bae6fd" className="absolute bottom-0 inset-x-0 -mb-px" fill="#FDFCFC"/>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-[#FDFCFC]">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <h2 className={`${H2} text-[#0f172a] mb-12`}>Асуулт & хариулт</h2>

          <div className="space-y-3">
            {FAQS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={item.q}
                  className={`rounded-[28px] px-6 transition-colors duration-300 ${
                    isOpen ? "bg-[#e0f2fe]" : "bg-[#f0f9ff]"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    className="w-full flex items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="font-bold text-[#0c4a6e]">{item.q}</span>
                    <span
                      className={`shrink-0 w-8 h-8 rounded-full bg-[#42db00] flex items-center justify-center font-bold text-white transition-transform duration-300 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <p className="text-[#0369a1] leading-relaxed pb-5 pr-10">
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOUNDERS */}
      <section id="founders" className="relative bg-[#e0f2fe]">
        <Clouds className="absolute top-0 inset-x-0 -mt-px" fill="#FDFCFC" flip/>
        <div className="max-w-7xl mx-auto px-6" style={{ paddingTop: `calc(${CLOUD_H} + 3rem)`, paddingBottom: `calc(${CLOUD_H} + 3rem)` }}>
          <div className="max-w-lg mb-12 mx-auto text-center">
            <h2 className={`${H2} text-[#0c4a6e]`}>Үүсгэн байгуулагчид</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
            {FOUNDERS.map((founder, i) => (
              <div key={founder.name} className="flex flex-col items-center text-center">
                <span
                  className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-4 border-white shadow-xl flex items-center justify-center mb-4 transform hover:scale-105 transition-transform duration-300"
                  style={{ background: AVATAR_BG[i % AVATAR_BG.length] }}
                  role="img"
                  aria-label={founder.name}
                >
                  <SheepHead className="w-28 h-28 sm:w-36 sm:h-36"/>
                </span>
                <p className="font-extrabold text-[#0c4a6e] text-lg font-[family-name:var(--font-display)]">
                  {founder.name}
                </p>
              </div>
            ))}
          </div>
        </div>
        <Clouds className="absolute bottom-0 inset-x-0 -mb-px" fill="#FDFCFC"/>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-[#FDFCFC]">
        <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-14">
          <div className="space-y-6">
            <h2 className={`${H2} text-[#0f172a]`}>Холбоо барих</h2>
            <p className="text-[#475569] leading-relaxed max-w-md">
              Асуулт, санал хүсэлт байвал бидэнтэй чөлөөтэй холбогдоорой. Ажлын өдрүүдэд бид 24 цагийн дотор хариу өгөхийг зорьдог.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-full bg-[#e0f2fe] flex items-center justify-center">
                  <SheepHead acc="mail" className="w-9 h-9"/>
                </span>
                <span className="text-[#0f172a] font-semibold">info@sudartan.mn</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-full bg-[#e0f2fe] flex items-center justify-center">
                  <SheepHead acc="phone" className="w-9 h-9"/>
                </span>
                <span className="text-[#0f172a] font-semibold">+976 7000 1234</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-full bg-[#e0f2fe] flex items-center justify-center">
                  <SheepHead acc="pin" className="w-9 h-9"/>
                </span>
                <span className="text-[#0f172a] font-semibold">
                  Сүхбаатар дүүрэг, Улаанбаатар хот
                </span>
              </div>
            </div>
          </div>

          <form className="space-y-4 bg-[#0284c7] rounded-[30px] p-7 sm:p-9 shadow-xl">
            <div>
              <label className="block text-sm font-bold text-[#e0f2fe] mb-1.5">Нэр</label>
              <input
                type="text"
                placeholder="Таны нэр"
                className="w-full px-4 py-3 rounded-2xl border border-[#38bdf8] bg-[#0369a1] text-white placeholder:text-[#bae6fd] outline-none focus:border-white transition-colors duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#e0f2fe] mb-1.5">И-мэйл</label>
              <input
                type="email"
                placeholder="tanii@imeil.mn"
                className="w-full px-4 py-3 rounded-2xl border border-[#38bdf8] bg-[#0369a1] text-white placeholder:text-[#bae6fd] outline-none focus:border-white transition-colors duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#e0f2fe] mb-1.5">Зурвас</label>
              <textarea
                rows={4}
                placeholder="Бидэнд юу хэлэхийг хүсэж байна вэ?"
                className="w-full px-4 py-3 rounded-2xl border border-[#38bdf8] bg-[#0369a1] text-white placeholder:text-[#bae6fd] outline-none focus:border-white transition-colors duration-300 resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-white hover:bg-[#e0f2fe] text-[#0284c7] font-extrabold rounded-full transition-colors duration-300 shadow-md"
            >
              Илгээх
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative bg-[#0284c7] pb-8" style={{ paddingTop: `calc(${CLOUD_H} + 2rem)` }}>
        <Clouds className="absolute top-0 inset-x-0 -mt-px" fill="#FDFCFC" flip/>
        <div className="relative max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[#bae6fd] text-sm font-semibold">
          <p>© {new Date().getFullYear()} Судартан. Бүх эрх хуулиар хамгаалагдсан.</p>
          <div className="flex gap-6">
            <a href="#about" onClick={(e) => smoothScroll(e, "#about")} className="hover:text-white transition-colors duration-300">
              Бидний тухай
            </a>
            <a href="#contact" onClick={(e) => smoothScroll(e, "#contact")} className="hover:text-white transition-colors duration-300">
              Холбоо барих
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}