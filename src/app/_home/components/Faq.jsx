"use client";

import { useState } from "react";
import { FAQS } from "../data";
import { H2, SECTION_OFFSET } from "../styles";
import Words from "./Words";

export default function Faq() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <section id="faq" className={`bg-[#FDFCFC] ${SECTION_OFFSET}`}>
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
        <h2 data-reveal="words" className={`${H2} text-[#0f172a] mb-8 sm:mb-12`}>
          <Words text="Асуулт & хариулт" />
        </h2>

        <div data-reveal="stagger" className="space-y-3">
          {FAQS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={item.q}
                className={`rounded-[24px] sm:rounded-[28px] px-5 sm:px-6 transition-colors duration-300 ${
                  isOpen ? "bg-[#e0f2fe]" : "bg-[#f0f9ff]"
                }`}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 py-4 sm:py-5 text-left min-h-[56px]"
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
                  <p className="faq-answer text-[#0369a1] leading-relaxed pb-5 pr-2 sm:pr-10">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
