import { STATS } from "../data";
import { H2, SECTION_OFFSET } from "../styles";

export default function About() {
  return (
    <section id="about" className={`bg-[#FDFCFC] ${SECTION_OFFSET}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div data-reveal="left" className="space-y-5">
          <h2 className={`${H2} text-[#0f172a]`}>Бидний тухай</h2>
          <p className="text-[#475569] leading-relaxed max-w-lg">
            Судартан нь монгол хэлний зөв бичих дүрэм, үгийн сан, үндэсний монгол бичгийг нэг дороос сурах боломжийг олгодог платформ юм. Бид монгол хэлний багш нартай хамтран хэл бичгийн элсэлтийн шалгалтад бэлдэх цогц талбарыг үүсгэлээ.
          </p>
          <p className="text-[#475569] leading-relaxed max-w-lg">
            Цаг ирэх тусам хэл бичгийн шалгалтын оноо буурч, жил бүр 5000-10000 сурагч хэл бичгийн элсэлтийн шалгалтдаа 400-аас доош оноо авч их сургуульд элсэн орох боломжоо алдаж байна. Эдгээр болон бусад хүүхдүүдэд хэл бичгийн элсэлтийн шалгалтандаа бэлдэж сайжрахад нь тусалж, цаашлаад монголын соёлын амин сүнс нь болсон эх хэлийнхээ ач холбогдолыг танин мэдүүлэх нь бидний зорилго билээ.
          </p>
        </div>

        <div data-reveal="stagger" className="grid grid-cols-2 gap-3 sm:gap-5">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[24px] sm:rounded-[30px] bg-[#e0f2fe] p-4 sm:p-6 border border-[#bae6fd]"
            >
              <p className="text-3xl sm:text-4xl font-black text-[#0284c7] font-[family-name:var(--font-display)]">
                {stat.value}
              </p>
              <p className="text-[#0369a1] mt-1 text-sm font-semibold">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
