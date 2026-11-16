import { OFFERS } from "../data";
import { H2, SECTION_OFFSET } from "../styles";
import Clouds, { CLOUD_H } from "./Clouds";
import SheepHead from "./SheepHead";
import Words from "./Words";

export default function Offer() {
  return (
    <section id="offer" className={`relative bg-[#e0f2fe] overflow-hidden ${SECTION_OFFSET}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,#38bdf8_0%,transparent_55%)] opacity-70" />
      <Clouds className="absolute top-0 inset-x-0 -mt-px" fill="#FDFCFC" flip/>
      <div className="relative max-w-7xl mx-auto px-5 sm:px-6" style={{ paddingTop: `calc(${CLOUD_H} + 2rem)`, paddingBottom: `calc(${CLOUD_H} + 2rem)` }}>
        <div className="mb-8 sm:mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 lg:gap-10">
          <h2 data-reveal="words" className={`${H2} lg:text-6xl text-white drop-shadow-sm`}>
            <Words text="Бидний үйлчилгээ" />
          </h2>
          <p data-reveal="right" className="text-[#ffffff] leading-relaxed drop-shadow-sm max-w-md lg:max-w-sm lg:text-right">
            Дөрвөн үндсэн чиглэлээр эх хэлнийхээ мэдлэгийг системтэйгээр дээшлүүлэрэй.
          </p>
        </div>

        <div data-reveal="stagger" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {OFFERS.map((offer) => (
            <div
              key={offer.title}
              className="rounded-[24px] sm:rounded-[30px] bg-[#ffffff] backdrop-blur-md border border-white/20 p-5 sm:p-6 hover:border-white/60 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 flex sm:block gap-4 items-start"
            >
              <span className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-full bg-[#01993e] flex items-center justify-center sm:mb-5 shadow-inner">
                <SheepHead acc={offer.icon} className="w-10 h-10 sm:w-12 sm:h-12"/>
              </span>
              <div>
                <h3 className="font-extrabold text-[#0a5600] text-lg sm:text-xl mb-1 sm:mb-2 font-[family-name:var(--font-display)]">
                  {offer.title}
                </h3>
                <p className="text-[#000000] text-sm leading-relaxed">
                  {offer.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Clouds back="#bae6fd" className="absolute bottom-0 inset-x-0 -mb-px" fill="#FDFCFC"/>
    </section>
  );
}
