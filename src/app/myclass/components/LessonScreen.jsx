"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { Manrope } from "next/font/google";
import "../dashboard/dashboard.css";

// Full-screen lesson layout (no sidebar), used while a DuoQuiz exercise is being played.
// Top: ✕ to leave + the quiz's progress bar and hearts. Middle: question and big answer
// cards. Bottom: the right/wrong panel pinned to the bottom edge of the screen.

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700", "800"],
});

const css = `
.app.lx{display:block;min-height:100dvh;background:#fff}
.lx-main{position:relative;max-width:720px;margin:0 auto;padding:28px 20px 170px;box-sizing:border-box}
.lx-close{position:absolute;left:14px;top:22px;z-index:2;display:grid;place-items:center;width:44px;height:44px;border:0;border-radius:14px;background:transparent;color:#94a3b8;cursor:pointer;text-decoration:none;transition:background .15s,color .15s}
.lx-close:hover{background:#f1f5f9;color:#334155}
.lx-close:focus-visible{outline:3px solid #0284c7;outline-offset:2px}

/* Quiz fills the screen instead of sitting in a panel */
.app.lx .dq.panel{background:transparent;border:0;box-shadow:none;padding:0;overflow:visible;border-radius:0}
.lx .dq-top{padding-left:44px;min-height:44px;margin-bottom:18px}
.lx .dq-track{height:18px}
.lx .dq-stats{margin-bottom:36px}
.lx .dq-label{font-size:15px;font-weight:800;color:#0284c7;opacity:1;text-transform:none;margin-bottom:10px}
.lx .dq-prompt{font-size:clamp(22px,3.2vw,30px)!important;font-weight:900;line-height:1.35;margin-bottom:32px;color:#0f172a}
.lx .dq-opts{gap:14px}
.lx .dq-opt{padding:18px 20px;border-radius:18px;font-size:18px}
.lx .dq-m{padding:18px 12px;font-size:17px}
.lx .dq-input{font-size:22px;padding:18px 20px}

/* Feedback panel pinned to the bottom, full width */
.lx .dq-sheet{position:fixed;left:0;right:0;bottom:0;z-index:20;margin:0;padding:24px max(20px,calc((100vw - 720px)/2 + 20px));padding-bottom:max(24px,env(safe-area-inset-bottom));border-top-width:2px}
.lx .dq-sheet.good{background:#dcfce7}
.lx .dq-sheet.bad{background:#fee2e2}
.lx .dq-sheet-title{font-size:22px}
.lx .dq-go{min-width:170px;padding:15px 28px;font-size:16px}

.lx .dq-end{padding-top:56px}

@media (max-width:520px){
  .lx-main{padding:18px 14px 190px}
  .lx-close{top:14px;left:8px}
  .lx .dq-go{width:100%}
}
`;

export default function LessonScreen({ exitHref, onExit, children }) {
  return (
    <div className={`app lx ${manrope.className}`}>
      <style>{css}</style>
      <div className="lx-main">
        {onExit ? (
          <button type="button" className="lx-close" onClick={onExit} aria-label="Дасгалаас гарах">
            <X size={26} strokeWidth={2.5} />
          </button>
        ) : (
          <Link href={exitHref} className="lx-close" aria-label="Дасгалаас гарах">
            <X size={26} strokeWidth={2.5} />
          </Link>
        )}
        {children}
      </div>
    </div>
  );
}
