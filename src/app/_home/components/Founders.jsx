import { FOUNDERS, AVATAR_BG } from "../data";
import { H2, SECTION_OFFSET } from "../styles";
import Clouds, { CLOUD_H } from "./Clouds";
import SheepHead from "./SheepHead";

export default function Founders() {
  return (
    <section id="founders" className={`relative bg-[#e0f2fe] ${SECTION_OFFSET}`}>
      <Clouds className="absolute top-0 inset-x-0 -mt-px" fill="#FDFCFC" flip/>
      <div className="relative max-w-7xl mx-auto px-5 sm:px-6" style={{ paddingTop: `calc(${CLOUD_H} + 2rem)`, paddingBottom: `calc(${CLOUD_H} + 2rem)` }}>
        <div data-reveal="up" className="max-w-lg mb-8 sm:mb-12 mx-auto text-center">
          <h2 className={`${H2} text-[#0c4a6e]`}>Үүсгэн байгуулагчид</h2>
        </div>

        <div data-reveal="stagger" className="flex flex-wrap justify-center gap-x-4 gap-y-8 sm:gap-8">
          {FOUNDERS.map((founder, i) => (
            <div
              key={founder.name}
              className="flex flex-col items-center text-center w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-1.5rem)] lg:w-[calc(20%-1.6rem)]"
            >
              <span
                className="w-36 h-36 sm:w-44 sm:h-44 lg:w-52 lg:h-52 rounded-full border-4 border-white shadow-xl overflow-hidden flex items-center justify-center mb-3 sm:mb-4 transform sm:hover:scale-105 transition-transform duration-300"
                style={{ background: AVATAR_BG[i % AVATAR_BG.length] }}
                role="img"
                aria-label={founder.name}
              >
                {founder.photo ? (
                  <img
                    src={founder.photo}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ objectPosition: founder.photoPos || "50% 20%" }}
                  />
                ) : (
                  <SheepHead className="w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44"/>
                )}
              </span>
              <p className="font-extrabold text-[#0c4a6e] text-base sm:text-lg font-[family-name:var(--font-display)]">
                {founder.name}
              </p>
            </div>
          ))}
        </div>
      </div>
      <Clouds className="absolute bottom-0 inset-x-0 -mb-px" fill="#FDFCFC"/>
    </section>
  );
}
