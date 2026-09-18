"use client";


import { useState } from "react";
import { PT_Serif, PT_Sans } from "next/font/google";


const display = PT_Serif({
subsets: ["cyrillic", "latin"],
weight: ["400", "700"],
variable: "--font-display",
});
const body = PT_Sans({
subsets: ["cyrillic", "latin"],
weight: ["400", "700"],
variable: "--font-body",
});


// Order matches the reference: Contact, Service, Portfolio, About, Home —
// with Home styled as the active/current page.
const NAV_LINKS = [
  { href: "#contact", label: "Холбоо барих" },
  { href: "#offer", label: "Үйлчилгээ" },
  { href: "#faq", label: "Асуулт & хариулт" },
  { href: "#about", label: "Бидний тухай" },
  { href: "#home", label: "Нүүр", active: true },
];


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
icon: "✎",
  },
  {
title: "Зөв бичих дүрэм",
desc: "Гээгдэх гээгдэхгүй эгшгийн дүрэм, эгшигт болон заримдаг гийгүүлэгчийн дүрэм, зөөлний тэмдгийн дүрэм гэх мэт зөв бичгийн дүрмийн дасгалууд",
icon: "📖",
  },
  {
title: "Монгол бичиг",
desc: "Хэл бичгийн элсэлтийн шалгалтанд орж ирдэг богино эхүүдийг кирилл бичигт хөрвүүлэх дасгалууд",
icon: "🖋",
  },
  {
title: "Хэлц үгс",
desc: "Одоогийн нийгэмд цөөн хэрэглэгдэх өвөрмөц далд утгатай хэлц үгсийг танин мэдэх",
icon: "💬",
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


function NavLink({ href, label, active, onClick }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`relative pb-1 transition-colors duration-300 ease-out after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:bg-[#2A4F73] after:transition-all after:duration-300 after:ease-out ${
        active
          ? "text-[#16283F] font-bold after:w-full"
          : "text-[#2A4F73]/80 font-semibold hover:text-[#16283F] after:w-0 hover:after:w-full"
      }`}
    >
      {label}
    </a>
  );
}


export default function Home() {
const [menuOpen, setMenuOpen] = useState(false);
const [openFaq, setOpenFaq] = useState(0);


const smoothScroll = (e, href) => {
    e.preventDefault();
setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };


return (
<main
className={`${display.variable} ${body.variable} min-h-screen bg-[#F5F8FB] text-[#212B36] overflow-x-hidden`}
style={{ fontFamily: "var(--font-body)" }}
>
<style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>


{/* HERO — framed card matching the reference composition */}
<section id="home" className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-16">
<div className="relative rounded-[2.25rem] sm:rounded-[3rem] bg-gradient-to-br from-[#4E7FB0] to-[#1F3B5C] p-1.5 sm:p-2.5 overflow-hidden shadow-xl shadow-[#16283F]/20">
{/* faint texture circles on the outer frame, echoing the reference background */}
<svg
className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
preserveAspectRatio="xMidYMid slice"
>
<circle cx="92%" cy="12%" r="120" fill="none" stroke="white" strokeWidth="1.5" />
<circle cx="97%" cy="55%" r="80" fill="none" stroke="white" strokeWidth="1.5" />
<circle cx="88%" cy="90%" r="150" fill="none" stroke="white" strokeWidth="1.5" />
</svg>


<div className="relative bg-white rounded-[1.9rem] sm:rounded-[2.6rem] overflow-hidden">
{/* decorative bulges so the card edge waves like the reference */}
<div className="hidden sm:block absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white z-10" />
<div className="hidden sm:block absolute -bottom-14 -right-14 w-56 h-56 rounded-full bg-gradient-to-br from-[#4E7FB0] to-[#1F3B5C]" />


{/* NAV */}
<nav className="relative z-20 flex items-center justify-between gap-6 lg:gap-8 px-6 sm:px-12 py-6 text-sm">
<span className="font-bold text-xl text-[#16283F] font-[family-name:var(--font-display)] tracking-wide shrink-0">
                СУДАРТАН
</span>
<div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 items-center gap-6 lg:gap-8">
{NAV_LINKS.map((link) => (
<NavLink
key={link.href}
{...link}
onClick={(e) => smoothScroll(e, link.href)}
/>
                ))}
</div>
<button className="hidden sm:inline-flex px-6 py-2.5 rounded-full bg-[#1F3B5C] hover:bg-[#16283F] text-white font-semibold transition-colors duration-300 shrink-0">
                Нэвтрэх
</button>
<button
aria-label="Цэс"
className="sm:hidden text-2xl text-[#16283F] p-1"
onClick={() => setMenuOpen(!menuOpen)}
>
{menuOpen ? "✕" : "☰"}
</button>
</nav>


{menuOpen && (
<div className="sm:hidden relative z-20 px-6 pb-4 flex flex-col gap-1">
{NAV_LINKS.map((link) => (
<a
key={link.href}
href={link.href}
onClick={(e) => smoothScroll(e, link.href)}
className={`py-2.5 rounded-lg transition-colors duration-300 ${
link.active
                        ? "text-[#16283F] font-bold"
                        : "text-[#2A4F73]/80 font-semibold hover:text-[#16283F] hover:bg-[#F1F6FA]"
}`}
>
{link.label}
</a>
                ))}
<button className="mt-2 w-full py-2.5 rounded-full bg-[#1F3B5C] text-white font-semibold">
                  Нэвтрэх
</button>
</div>
            )}


{/* ILLUSTRATION + COPY */}
<div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center px-6 sm:px-12 pb-12 pt-2">
<div className="flex justify-center lg:justify-start">
{/* eslint-disable-next-line @next/next/no-img-element */}
<img
src="/Thesis-rafiki.svg"
alt="Судалгаа, дипломын ажил бичиж буй оюутны зурган дүрслэл"
className="w-full max-w-md"
/>
</div>


{/* TEXT PANEL */}
<div className="space-y-5 text-center lg:text-left">
<p className="text-3xl sm:text-4xl font-light text-[#3B6EA5] font-[family-name:var(--font-display)]">
                  Хэлний дархлаагаа
</p>
<h1 className="text-4xl sm:text-5xl font-bold uppercase text-[#16283F] -mt-3 font-[family-name:var(--font-display)]">
                  бэхжүүлцгээе.
</h1>
<p className="text-[#51606F] leading-relaxed max-w-md mx-auto lg:mx-0">
                  Хэл бичгийн элсэлтийн шалгалтад бэлдэх цогц дасгалыг агуулсан Монголын анхны сайт.
</p>
<div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
<button className="px-8 py-3.5 bg-[#1F3B5C] hover:bg-[#16283F] text-white font-semibold rounded-full transition-colors duration-300">
                    Эхлэх
</button>
</div>
</div>
</div>
</div>
</div>
</section>


{/* ABOUT */}
<section id="about" className="bg-white border-y border-[#DCE7F2]">
<div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-14 items-center">
<div className="space-y-5">
<h2 className="text-3xl sm:text-4xl font-bold text-[#16283F] font-[family-name:var(--font-display)]">
              Бидний тухай
</h2>
<p className="text-[#51606F] leading-relaxed max-w-lg">
              Судартан нь монгол хэлний зөв бичих дүрэм, үгийн сан, үндэсний монгол бичгийг нэг дороос сурах боломжийг олгодог платформ юм. Бид
              монгол хэлний багш нартай хамтран хэл бичгийн элсэлтийн шалгалтад бэлдэх цогц талбарыг үүсгэлээ. 
</p>
<p className="text-[#51606F] leading-relaxed max-w-lg">
              Цаг ирэх тусам хэл бичгийн шалгалтын оноо буурч, жил бүр 5000-10000 сурагч хэл бичгийн элсэлтийн шалгалтдаа 
              400-аас доош оноо авч их сургуульд элсэн орох боломжоо алдаж байна. Эдгээр болон бусад хүүхдүүдэд хэл бичгийн 
              элсэлтийн шалгалтандаа бэлдэж сайжрахад нь тусалж, цаашлаад монголын соёлын амин сүнс нь болсон эх хэлийнхээ ач 
              холбогдолыг танин мэдүүлэх нь бидний зорилго билээ.
</p>
</div>


<div className="grid grid-cols-2 gap-5">
{STATS.map((stat) => (
<div
key={stat.label}
className="rounded-2xl border border-[#DCE7F2] bg-[#F5F8FB] p-6"
>
<p className="text-3xl font-bold text-[#16283F] font-[family-name:var(--font-display)]">
{stat.value}
</p>
<p className="text-[#6B7B8C] mt-1 text-sm">{stat.label}</p>
</div>
            ))}
</div>
</div>
</section>


{/* OFFER */}
<section id="offer" className="max-w-7xl mx-auto px-6 py-20">
<div className="max-w-lg mb-12">
<h2 className="text-3xl sm:text-4xl font-bold text-[#16283F] font-[family-name:var(--font-display)]">
            Бидний үйлчилгээ
</h2>
<p className="text-[#51606F] mt-3 leading-relaxed">
            Дөрвөн үндсэн чиглэлээр эх хэлнийхээ мэдлэгийг системтэйгээр
            дээшлүүлээрэй.
</p>
</div>


<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
{OFFERS.map((offer) => (
<div
key={offer.title}
className="rounded-2xl border border-[#DCE7F2] p-6 hover:border-[#4E7FB0] transition-colors duration-300"
>
<span className="w-11 h-11 rounded-xl bg-[#1F3B5C] text-[#DCE7F2] flex items-center justify-center text-lg mb-5">
{offer.icon}
</span>
<h3 className="font-bold text-[#16283F] text-lg mb-2 font-[family-name:var(--font-display)]">
{offer.title}
</h3>
<p className="text-[#57697A] text-sm leading-relaxed">
{offer.desc}
</p>
</div>
          ))}
</div>
</section>


{/* FAQ */}
<section id="faq" className="bg-white border-y border-[#DCE7F2]">
<div className="max-w-3xl mx-auto px-6 py-20">
<h2 className="text-3xl sm:text-4xl font-bold text-[#16283F] font-[family-name:var(--font-display)] mb-12">
            Асуулт & хариулт
</h2>


<div className="divide-y divide-[#DCE7F2] border-t border-b border-[#DCE7F2]">
{FAQS.map((item, idx) => {
const isOpen = openFaq === idx;
return (
<div key={item.q}>
<button
onClick={() => setOpenFaq(isOpen ? -1 : idx)}
className="w-full flex items-center justify-between gap-4 py-5 text-left"
>
<span className="font-semibold text-[#16283F]">
{item.q}
</span>
<span
className={`shrink-0 w-7 h-7 rounded-full border border-[#C7D9EA] flex items-center justify-center text-[#1F3B5C] transition-transform duration-300 ${
isOpen ? "rotate-45" : ""
}`}
>
                      +
</span>
</button>
{isOpen && (
<p className="text-[#57697A] leading-relaxed pb-5 pr-10">
{item.a}
</p>
                  )}
</div>
              );
            })}
</div>
</div>
</section>


{/* ҮҮСГЭН БАЙГУУЛАГЧИД */}
<section id="founders" className="max-w-7xl mx-auto px-6 py-20">
<div className="max-w-lg mb-12 mx-auto text-center">
<h2 className="text-3xl sm:text-4xl font-bold text-[#16283F] font-[family-name:var(--font-display)]">
            Үүсгэн байгуулагчид
</h2>
</div>


<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
{FOUNDERS.map((founder) => (
  <div key={founder.name} className="flex flex-col items-center text-center">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={undefined}   // ← replace with real image path later, e.g. "/founders/odbayar.jpg"
      alt={founder.name}
      className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-[#DCE7F2] bg-[#F5F8FB] mb-4"
    />
    <p className="font-semibold text-[#16283F] font-[family-name:var(--font-display)]">
      {founder.name}
    </p>
  </div>
))}
</div>
</section>


{/* CONTACT */}
<section id="contact" className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-14">
<div className="space-y-6">
<h2 className="text-3xl sm:text-4xl font-bold text-[#16283F] font-[family-name:var(--font-display)]">
            Холбоо барих
</h2>
<p className="text-[#51606F] leading-relaxed max-w-md">
            Асуулт, санал хүсэлт байвал бидэнтэй чөлөөтэй холбогдоорой.
            Ажлын өдрүүдэд бид 24 цагийн дотор хариу өгөхийг зорьдог.
</p>


<div className="space-y-4 pt-2">
<div className="flex items-center gap-3">
<span className="w-10 h-10 rounded-full bg-[#F1F6FA] flex items-center justify-center">
                ✉️
</span>
<span className="text-[#212B36]">info@sudartan.mn</span>
</div>
<div className="flex items-center gap-3">
<span className="w-10 h-10 rounded-full bg-[#F1F6FA] flex items-center justify-center">
                📞
</span>
<span className="text-[#212B36]">+976 7000 1234</span>
</div>
<div className="flex items-center gap-3">
<span className="w-10 h-10 rounded-full bg-[#F1F6FA] flex items-center justify-center">
                📍
</span>
<span className="text-[#212B36]">
                Сүхбаатар дүүрэг, Улаанбаатар хот
</span>
</div>
</div>
</div>


<form className="space-y-4 bg-white border border-[#DCE7F2] rounded-2xl p-7">
<div>
<label className="block text-sm font-semibold text-[#16283F] mb-1.5">
              Нэр
</label>
<input
type="text"
placeholder="Таны нэр"
className="w-full px-4 py-3 rounded-xl border border-[#DCE7F2] bg-[#F5F8FB] outline-none focus:border-[#3B6EA5] transition-colors duration-300"
/>
</div>
<div>
<label className="block text-sm font-semibold text-[#16283F] mb-1.5">
              И-мэйл
</label>
<input
type="email"
placeholder="tanii@imeil.mn"
className="w-full px-4 py-3 rounded-xl border border-[#DCE7F2] bg-[#F5F8FB] outline-none focus:border-[#3B6EA5] transition-colors duration-300"
/>
</div>
<div>
<label className="block text-sm font-semibold text-[#16283F] mb-1.5">
              Зурвас
</label>
<textarea
rows={4}
placeholder="Бидэнд юу хэлэхийг хүсэж байна вэ?"
className="w-full px-4 py-3 rounded-xl border border-[#DCE7F2] bg-[#F5F8FB] outline-none focus:border-[#3B6EA5] transition-colors duration-300 resize-none"
/>
</div>
<button
type="submit"
className="w-full py-3.5 bg-[#1F3B5C] hover:bg-[#16283F] text-white font-semibold rounded-xl transition-colors duration-300"
>
            Илгээх
</button>
</form>
</section>


{/* FOOTER */}
<footer className="border-t border-[#DCE7F2] bg-white py-8">
<div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[#6B7B8C] text-sm font-medium">
<p>© {new Date().getFullYear()} Судартан. Бүх эрх хуулиар хамгаалагдсан.</p>
<div className="flex gap-6">
<a href="#about" onClick={(e) => smoothScroll(e, "#about")} className="hover:text-[#1F3B5C] transition-colors duration-300">
              Бидний тухай
</a>
<a href="#contact" onClick={(e) => smoothScroll(e, "#contact")} className="hover:text-[#1F3B5C] transition-colors duration-300">
              Холбоо барих
</a>
</div>
</div>
</footer>
</main>
  );
}