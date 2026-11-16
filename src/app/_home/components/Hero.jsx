"use client";

import { useRouter } from "next/navigation";
import Clouds, { CLOUD_H } from "./Clouds";

// `children` is the fixed header, kept inside the hero section like before.
export default function Hero({ children }) {
  const router = useRouter();

  return (
    <section
      id="home"
      className="relative min-h-[100svh] flex flex-col justify-between overflow-hidden bg-[#f4f1ea] pt-24 lg:pt-32"
    >
      {/* Full-screen Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero.jpg"
          alt=""
          className="w-full h-full object-cover object-center"
        />
        {/* Soft light wash on phones so the text stays readable over the photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/30 to-transparent lg:hidden" />
      </div>

        {children}

      {/* HERO CENTER CONTENT */}
      <div
        className="relative z-20 flex-1 flex flex-col items-center justify-end px-5 sm:px-8"
        style={{ paddingBottom: `calc(${CLOUD_H} + 1.5rem)` }}
      >
        <div className="relative w-full max-w-7xl mx-auto">
          <div className="w-full sm:w-[75%] lg:w-[60%] max-w-xl flex flex-col items-center sm:items-start text-center sm:text-left mx-auto sm:mx-0">
            <img
              src="/images/texttt.png"
              alt=""
              className="w-full max-w-sm sm:max-w-none h-auto mb-4"
            />
            <p className="text-lg sm:text-2xl font-extrabold text-[#0a5600] leading-snug sm:leading-relaxed drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]">
              Хэл бичгийн элсэлтийн шалгалтад бэлдэх цогц дасгалыг агуулсан Монголын анхны сайт.
            </p>

            <div className="pt-6 w-full sm:w-auto flex items-center gap-5">
              <button
                className="w-full sm:w-auto px-7 py-3.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-base font-extrabold rounded-full shadow-2xl sm:hover:scale-105 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0284c7]"
                onClick={() => router.push("/options")}
              >
                Туршилтын дасгал
              </button>
            </div>
          </div>
        </div>
      </div>

      <Clouds accent="#7dd3fc" back="#bae6fd" className="absolute bottom-0 inset-x-0 z-10 -mb-px translate-y-8 sm:translate-y-16" fill="#FDFCFC"/>
    </section>
  );
}
