'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  const goToVocab = () => {
    router.push('/test');
  };

  return (
    <div className="relative min-h-screen bg-[#ffffff] text-[#1F3A56] flex flex-col justify-between px-6 py-8 md:px-12 md:py-10 selection:bg-[#B08650]/20 selection:text-[#1F3A56]">
      {/* Top Header / Branding Bar */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between">
        <a href="#" className="group inline-flex items-center gap-2 transition-transform duration-200 active:scale-95">
          {/* Subtle decorative gold emblem indicator */}
          <span className="h-2 w-2 rounded-full bg-[#B08650] group-hover:scale-125 transition-transform duration-300" />
          <span className="font-serif text-2xl font-bold tracking-tight text-[#1F3A56] group-hover:text-[#B08650] transition-colors duration-300">
            Судартан
          </span>
        </a>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-3xl mx-auto my-auto py-12">
        <div className="text-center mb-14">
          <h1 className="font-serif text-2xl md:text-3xl tracking-tight leading-relaxed">
            Та өөрийн сурахыг хүсч буй сэдвээ сонгоно уу!
          </h1>
          <div className="w-12 h-0.5 bg-[#B08650]/40 mx-auto mt-4 rounded-full" />
        </div>

        {/* Quiz Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <a href="#" onClick={goToVocab}>
            <div className="group relative h-full bg-white/70 backdrop-blur-sm border border-[#1F3A56]/15 rounded-2xl px-8 py-10 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:border-[#B08650] hover:bg-white hover:shadow-xl hover:shadow-[#1F3A56]/5 cursor-pointer min-h-[220px]">
              {/* Watermark letters — typography as visual motif */}
              <span
                aria-hidden="true"
                className="font-serif absolute -right-3 -top-6 text-[7rem] leading-none text-[#1F3A56]/[0.05] select-none group-hover:text-[#B08650]/[0.1] transition-colors duration-300"
              >
                Үг
              </span>

              <div className="relative z-10">
                <h2 className="font-serif text-2xl font-bold mb-3 group-hover:text-[#1F3A56] transition-colors">
                  Үгийн сан
                </h2>
                <p className="text-sm text-[#5B6B7C] leading-relaxed max-w-[24ch]">
                  Алдаатай бичигддэг үгсийг засч ойлгох дасгал.
                </p>
              </div>

              <div className="relative z-10 mt-8 flex items-center gap-3">
                <span className="h-px w-8 bg-[#B08650] transition-all duration-300 group-hover:w-14" />
                <span className="text-sm font-semibold text-[#1F3A56] group-hover:text-[#B08650] transition-colors">
                  Эхлэх
                </span>
              </div>
            </div>
          </a>

          <a href="#quiz-idiom">
            <div className="group relative h-full bg-white/70 backdrop-blur-sm border border-[#1F3A56]/15 rounded-2xl px-8 py-10 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:border-[#B08650] hover:bg-white hover:shadow-xl hover:shadow-[#1F3A56]/5 cursor-pointer min-h-[220px]">
              {/* Watermark letters — typography as visual motif */}
              <span
                aria-hidden="true"
                className="font-serif absolute -right-3 -top-6 text-[7rem] leading-none text-[#1F3A56]/[0.05] select-none group-hover:text-[#B08650]/[0.1] transition-colors duration-300"
              >
                Хэ
              </span>

              <div className="relative z-10">
                <h2 className="font-serif text-2xl font-bold mb-3 group-hover:text-[#1F3A56] transition-colors">
                  Хэлц үг
                </h2>
                <p className="text-sm text-[#5B6B7C] leading-relaxed max-w-[24ch]">
                  Хэлц үгсийн зөв утгыг олж сурах дасгал.
                </p>
              </div>

              <div className="relative z-10 mt-8 flex items-center gap-3">
                <span className="h-px w-8 bg-[#B08650] transition-all duration-300 group-hover:w-14" />
                <span className="text-sm font-semibold text-[#1F3A56] group-hover:text-[#B08650] transition-colors">
                  Эхлэх
                </span>
              </div>
            </div>
          </a>
        </div>
      </main>

      {/* Decorative Minimal Footer */}

    </div>
  );
}