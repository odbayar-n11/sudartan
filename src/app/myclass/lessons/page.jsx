import Link from "next/link";
import AppShell from "../components/AppShell";
import { topics } from "../data/nav";

export default function LessonsPage() {
  // TODO: replace with the logged-in user's name from your auth
  const userName = "y/n";

  return (
    <AppShell userName={userName}>
      <h1>
        Хичээлүүд
        <small>Сэдвээ сонгоод суралцаж эхлээрэй</small>
      </h1>

      <div className="cards">
        {topics.map((t) => (
          <Link key={`${t.href}-${t.label}`} href={t.href} className="tcard">
            <span className="tcard-ic" aria-hidden="true">
              {t.icon}
            </span>
            {t.badge && <span className="pill tcard-badge">{t.badge}</span>}
            <span className="tcard-title">{t.label}</span>
            <p>{t.desc}</p>
            <span className="tcard-foot">
              {t.lessons} хичээл <b aria-hidden="true">→</b>
            </span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}