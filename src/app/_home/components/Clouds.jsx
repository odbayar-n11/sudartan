const FRONT = [
  [30, 140, 46], [120, 128, 62], [235, 142, 48], [330, 118, 72], [450, 140, 52],
  [545, 126, 66], [660, 144, 46], [760, 112, 76], [880, 138, 54], [975, 124, 68],
  [1090, 144, 48], [1180, 114, 74], [1295, 138, 52], [1390, 126, 64],
];
const BACK = [
  [0, 120, 56, 0], [90, 100, 70, 1], [200, 118, 58, 0], [300, 90, 78, 1],
  [420, 112, 60, 0], [520, 94, 72, 1], [640, 118, 56, 0], [740, 86, 80, 1],
  [850, 112, 60, 0], [960, 96, 72, 1], [1070, 118, 56, 0], [1170, 88, 78, 1],
  [1280, 110, 60, 0], [1380, 94, 70, 1],
];

// Clouds are drawn at least 1000px wide, so on phones their height stays at ~139px.
// On phones we let them shrink to the screen width (min 600px) so they don't eat the screen.
export const CLOUD_H = "max(100vw, 600px) * 0.1389";

export default function Clouds({ fill, back, accent, flip = false, className = "", children }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none overflow-x-clip ${flip ? "rotate-180" : ""} ${className}`}
    >
      {children}
      <svg
        viewBox="0 0 1440 200"
        preserveAspectRatio="xMidYMax slice"
        className="relative block max-w-none w-[max(100%,600px)] left-1/2 -translate-x-1/2"
        style={{ height: `calc(${CLOUD_H})`, filter: "drop-shadow(0 -3px 6px white)" }}
      >
        {back && (
          <g opacity="0.75" className="clouds-back">
            {BACK.map(([x, y, r, a]) => (
              <circle key={x} cx={x} cy={y} r={r} fill={a && accent ? accent : back} />
            ))}
            <rect x="0" y="130" width="1440" height="70" fill={back} />
          </g>
        )}
        <g fill={fill} opacity="1">
          {FRONT.map(([x, y, r]) => <circle key={x} cx={x} cy={y} r={r} />)}
          <rect x="0" y="150" width="1440" height="50" />
        </g>
      </svg>
    </div>
  );
}
