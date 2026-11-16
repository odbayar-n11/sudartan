import Clouds, { CLOUD_H } from "./Clouds";

export default function Footer({ onNavClick }) {
  return (
    <footer
      className="relative bg-[#0284c7]"
      style={{ paddingTop: `calc(${CLOUD_H} + 1.5rem)`, paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
    >
      <Clouds className="absolute top-0 inset-x-0 -mt-px" fill="#FDFCFC" flip/>
      <div data-reveal="up" className="relative max-w-7xl mx-auto px-5 sm:px-6 flex flex-col-reverse sm:flex-row justify-between items-center gap-4 text-center sm:text-left text-[#bae6fd] text-sm font-semibold">
        <p>© {new Date().getFullYear()} Судартан. Бүх эрх хуулиар хамгаалагдсан.</p>
        <div className="flex gap-6">
          <a href="#about" onClick={(e) => onNavClick(e, "#about")} className="py-2 hover:text-white transition-colors duration-300">
            Бидний тухай
          </a>
          <a href="#contact" onClick={(e) => onNavClick(e, "#contact")} className="py-2 hover:text-white transition-colors duration-300">
            Холбоо барих
          </a>
        </div>
      </div>
    </footer>
  );
}
