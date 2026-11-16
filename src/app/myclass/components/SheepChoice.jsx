"use client";

// Two-option question shown as two lambs (pictures in public/images/sheep/),
// each holding one answer on a sign above its head.

const SHEEP = ["/images/sheep/sheep-1.jpg", "/images/sheep/sheep-2.jpg"];

const css = `
.sc{display:grid;grid-template-columns:1fr 1fr;gap:clamp(12px,3vw,28px)}
.sc-btn{position:relative;display:flex;flex-direction:column;align-items:center;padding:0;border:3px solid transparent;border-radius:28px;background:#a9c3a2;cursor:pointer;overflow:hidden;font:inherit;color:inherit;transition:transform .15s ease,box-shadow .2s ease,border-color .2s ease,opacity .2s}
.sc-btn:hover:not(:disabled){transform:translateY(-4px);box-shadow:0 14px 30px rgba(60,90,55,.25)}
.sc-btn:active:not(:disabled){transform:translateY(0) scale(.98)}
.sc-btn:focus-visible{outline:3px solid #0284c7;outline-offset:3px}
.sc-btn:disabled{cursor:default}
.sc-img{display:block;width:100%;margin-top:auto;aspect-ratio:672/556;object-fit:cover;object-position:50% 100%;transform-origin:50% 100%;pointer-events:none;user-select:none}
.sc-sign{position:relative;z-index:1;margin:18px 14px 6px;max-width:calc(100% - 28px);padding:12px 20px;border-radius:18px;background:#fff;box-shadow:0 6px 0 rgba(0,0,0,.08);font-size:clamp(18px,2.6vw,26px);font-weight:900;color:#1f2937;word-break:break-word;text-align:center;line-height:1.2;white-space:nowrap}
.sc-sign::after{content:"";position:absolute;left:50%;bottom:-9px;width:18px;height:18px;background:inherit;transform:translateX(-50%) rotate(45deg);border-radius:4px}
.sc-key{position:absolute;bottom:12px;left:12px;z-index:1;width:28px;height:28px;border-radius:9px;display:grid;place-items:center;background:rgba(255,255,255,.8);font-size:13px;font-weight:900;color:#4b5f47}
.sc-btn:hover:not(:disabled) .sc-img{animation:sc-bob .9s ease-in-out infinite}
.sc-btn.ok{border-color:#22c55e;box-shadow:0 0 0 4px rgba(34,197,94,.25)}
.sc-btn.ok .sc-sign{background:#22c55e;color:#fff}
.sc-btn.ok .sc-img{animation:sc-hop .6s ease}
.sc-btn.no{border-color:#ef4444;box-shadow:0 0 0 4px rgba(239,68,68,.22);animation:sc-shake .45s ease}
.sc-btn.no .sc-sign{background:#ef4444;color:#fff}
.sc-btn.dim{opacity:.45}
@keyframes sc-bob{0%,100%{transform:rotate(0)}25%{transform:rotate(-2deg)}75%{transform:rotate(2deg)}}
@keyframes sc-hop{0%,100%{transform:translateY(0)}40%{transform:translateY(-14px)}70%{transform:translateY(0)}85%{transform:translateY(-5px)}}
@keyframes sc-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
@media (max-width:420px){.sc-sign{padding:9px 12px;margin-top:12px;white-space:normal}}
@media (prefers-reduced-motion:reduce){.sc-btn,.sc-img{animation:none!important;transition:none!important}}
`;

export default function SheepChoice({ options, answer, picked, answered, onChoose }) {
  return (
    <div className="sc">
      <style>{css}</style>
      {options.slice(0, 2).map((opt, i) => {
        let cls = "sc-btn";
        if (answered) {
          if (opt === answer) cls += " ok";
          else if (opt === picked) cls += " no";
          else cls += " dim";
        }
        return (
          <button key={i} type="button" className={cls} onClick={() => onChoose(opt)} disabled={answered}>
            <span className="sc-sign">{opt}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="sc-img" src={SHEEP[i % SHEEP.length]} alt="" />
            <span className="sc-key">{i + 1}</span>
          </button>
        );
      })}
    </div>
  );
}
