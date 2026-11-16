const ACCESSORIES = {
  pencil: <path d="M44 55l1-4 7-7 3 3-7 7z" fill="#fff" />,
  book: <path d="M43.5 45.5H49v10h-5.500zM51 45.5h5.500v10H51z" fill="#fff" />,
  quill: <path d="M56 44c-8 1-11 6-12 12 5-1 9-4 12-12z" fill="#fff" />,
  bubble: <path d="M44 45h12a2 2 0 012 2v5a2 2 0 01-2 2h-6l-4 3v-3h-2a2 2 0 01-2-2v-5a2 2 0 012-2z" fill="#fff" />,
  mail: (
    <>
      <rect x="43" y="45" width="14" height="10" rx="1.5" fill="#fff" />
      <path d="M43.5 46l6.5 5 6.500-5" stroke="#38bdf8" strokeWidth="1.4" fill="none" />
    </>
  ),
  phone: (
    <>
      <rect x="44" y="43.500" width="12" height="13" rx="2" fill="#fff" />
      <circle cx="50" cy="53.500" r="1" fill="#38bdf8" />
    </>
  ),
  pin: (
    <>
      <path d="M50 56s-5-4.500-5-8.500a5 5 0 0110 0c0 4-5 8.500-5 8.500z" fill="#fff" />
      <circle cx="50" cy="47.500" r="1.800" fill="#38bdf8" />
    </>
  ),
};

export default function SheepHead({ acc, className = "" }) {
  const wool = [[20, 24, 11], [32, 18, 13], [44, 24, 11], [26, 32, 10], [38, 32, 10]];
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <g fill="#1e293b">
        <ellipse cx="15" cy="38" rx="9" ry="4.500" transform="rotate(-20 15 38)" />
        <ellipse cx="49" cy="38" rx="9" ry="4.500" transform="rotate(20 49 38)" />
      </g>
      <g fill="#bae6fd">
        {wool.map(([x, y, r]) => <circle key={`o${x}${y}`} cx={x} cy={y} r={r + 1.500} />)}
      </g>
      <ellipse cx="32" cy="40" rx="14" ry="16" fill="#1e293b" />
      <g fill="#FDFCFC">
        {wool.map(([x, y, r]) => <circle key={`i${x}${y}`} cx={x} cy={y} r={r} />)}
        <circle cx="26" cy="39" r="3" />
        <circle cx="38" cy="39" r="3" />
      </g>
      <g fill="#1e293b">
        <circle cx="26.700" cy="39.400" r="1.500" />
        <circle cx="38.700" cy="39.400" r="1.500" />
      </g>
      <ellipse cx="32" cy="48.500" rx="4.500" ry="3" fill="#f43f5e" />
      {acc && (
        <>
          <circle cx="50" cy="50" r="12" fill="#38bdf8" />
          {ACCESSORIES[acc]}
        </>
      )}
    </svg>
  );
}
