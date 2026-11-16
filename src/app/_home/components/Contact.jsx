import { H2, SECTION_OFFSET } from "../styles";
import SheepHead from "./SheepHead";

export default function Contact() {
  return (
    <section id="contact" className={`bg-[#FDFCFC] ${SECTION_OFFSET}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20 grid lg:grid-cols-2 gap-10 lg:gap-14">
        <div data-reveal="left" className="space-y-6">
          <h2 className={`${H2} text-[#0f172a]`}>Холбоо барих</h2>
          <p className="text-[#475569] leading-relaxed max-w-md">
            Асуулт, санал хүсэлт байвал бидэнтэй чөлөөтэй холбогдоорой. Ажлын өдрүүдэд бид 24 цагийн дотор хариу өгөхийг зорьдог.
          </p>

          <div className="space-y-4 pt-2">
            <a href="mailto:info@sudartan.mn" className="flex items-center gap-3">
              <span className="w-12 h-12 shrink-0 rounded-full bg-[#e0f2fe] flex items-center justify-center">
                <SheepHead acc="mail" className="w-9 h-9"/>
              </span>
              <span className="text-[#0f172a] font-semibold break-all">info@sudartan.mn</span>
            </a>
            <a href="tel:+97670001234" className="flex items-center gap-3">
              <span className="w-12 h-12 shrink-0 rounded-full bg-[#e0f2fe] flex items-center justify-center">
                <SheepHead acc="phone" className="w-9 h-9"/>
              </span>
              <span className="text-[#0f172a] font-semibold">+976 7000 1234</span>
            </a>
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 shrink-0 rounded-full bg-[#e0f2fe] flex items-center justify-center">
                <SheepHead acc="pin" className="w-9 h-9"/>
              </span>
              <span className="text-[#0f172a] font-semibold">
                Сүхбаатар дүүрэг, Улаанбаатар хот
              </span>
            </div>
          </div>
        </div>

        {/* text-base on inputs stops iPhones from zooming in when a field is tapped */}
        <form data-reveal="right" className="space-y-4 bg-[#0284c7] rounded-[24px] sm:rounded-[30px] p-5 sm:p-9 shadow-xl">
          <div>
            <label htmlFor="contact-name" className="block text-sm font-bold text-[#e0f2fe] mb-1.5">Нэр</label>
            <input
              id="contact-name"
              type="text"
              autoComplete="name"
              placeholder="Таны нэр"
              className="w-full px-4 py-3 text-base rounded-2xl border border-[#38bdf8] bg-[#0369a1] text-white placeholder:text-[#bae6fd] outline-none focus:border-white transition-colors duration-300"
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="block text-sm font-bold text-[#e0f2fe] mb-1.5">И-мэйл</label>
            <input
              id="contact-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="tanii@imeil.mn"
              className="w-full px-4 py-3 text-base rounded-2xl border border-[#38bdf8] bg-[#0369a1] text-white placeholder:text-[#bae6fd] outline-none focus:border-white transition-colors duration-300"
            />
          </div>
          <div>
            <label htmlFor="contact-message" className="block text-sm font-bold text-[#e0f2fe] mb-1.5">Зурвас</label>
            <textarea
              id="contact-message"
              rows={4}
              placeholder="Бидэнд юу хэлэхийг хүсэж байна вэ?"
              className="w-full px-4 py-3 text-base rounded-2xl border border-[#38bdf8] bg-[#0369a1] text-white placeholder:text-[#bae6fd] outline-none focus:border-white transition-colors duration-300 resize-none"
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
  );
}
