"use client";

import { fontVariables } from "./_home/fonts";
import { useMobileMenu, useRedirectIfLoggedIn, useScrollReveal } from "./_home/hooks";
import "./_home/animations.css";
import Header from "./_home/components/Header";
import Hero from "./_home/components/Hero";
import About from "./_home/components/About";
import Offer from "./_home/components/Offer";
import Faq from "./_home/components/Faq";
import Founders from "./_home/components/Founders";
import Contact from "./_home/components/Contact";
import Footer from "./_home/components/Footer";

export default function Home() {
  const checkingAuth = useRedirectIfLoggedIn();
  const [menuOpen, setMenuOpen] = useMobileMenu();
  useScrollReveal(!checkingAuth);

  // Smooth-scrolls to a section and closes the mobile menu.
  const scrollTo = (e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Prevent flicker before redirecting logged-in users
  if (checkingAuth) return null;

  return (
    <main
      className={`${fontVariables} min-h-screen bg-[#FDFCFC] text-[#0f172a] overflow-x-hidden`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
          -webkit-text-size-adjust: 100%;
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

      <Hero>
        <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} onNavClick={scrollTo} />
      </Hero>
      <About />
      <Offer />
      <Faq />
      <Founders />
      <Contact />
      <Footer onNavClick={scrollTo} />
    </main>
  );
}
