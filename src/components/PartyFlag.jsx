/**
 * Party flag SVG representations.
 * Updated April 2026 to match actual party flags.
 */

/* ── DMK Flag: Black top, Red bottom ── */
function DMKFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="12" fill="#000000" />
      <rect x="0" y="12" width="36" height="12" fill="#dc2626" />
    </svg>
  );
}

/* ── AIADMK Flag: Black top, White middle, Red bottom ── */
function AIADMKFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="8" fill="#000000" />
      <rect x="0" y="8" width="36" height="8" fill="#ffffff" />
      <rect x="0" y="16" width="36" height="8" fill="#dc2626" />
    </svg>
  );
}

/* ── BJP Flag: Saffron/orange with green vertical stripe on left, white lotus ── */
function BJPFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="6" fill="#16a34a" height="24" />
      <rect x="6" y="0" width="30" height="24" fill="#f97316" />
      {/* Lotus */}
      <g transform="translate(21, 12)">
        <path d="M0 -4 Q2 -1 1 2 Q0 3 -1 2 Q-2 -1 0 -4Z" fill="#fff" opacity="0.9" />
        <path d="M-3 -2 Q-2 0 -1 2 Q0 3 1 2 Q0 0 -1 -1Z" fill="#fff" opacity="0.7" />
        <path d="M3 -2 Q2 0 1 2 Q0 3 -1 2 Q0 0 1 -1Z" fill="#fff" opacity="0.7" />
        <path d="M-4.5 0 Q-3 1 -1 2 Q0 3 1 2 Q-1 1 -2 0Z" fill="#fff" opacity="0.5" />
        <path d="M4.5 0 Q3 1 1 2 Q0 3 -1 2 Q1 1 2 0Z" fill="#fff" opacity="0.5" />
      </g>
    </svg>
  );
}

/* ── INC / Congress Flag: Tricolor (saffron, white, green) with hand ── */
function INCFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="8" fill="#f97316" />
      <rect x="0" y="8" width="36" height="8" fill="#ffffff" />
      <rect x="0" y="16" width="36" height="8" fill="#16a34a" />
      {/* Hand symbol */}
      <g transform="translate(18, 12)" fill="#1e3a5f">
        <rect x="-1.5" y="-1" width="3" height="5" rx="0.5" opacity="0.8" />
        <rect x="-1.5" y="-5" width="0.7" height="4.5" rx="0.3" opacity="0.8" />
        <rect x="-0.5" y="-6" width="0.7" height="5.5" rx="0.3" opacity="0.8" />
        <rect x="0.5" y="-5.5" width="0.7" height="5" rx="0.3" opacity="0.8" />
        <rect x="1.5" y="-4.5" width="0.7" height="4" rx="0.3" opacity="0.8" />
      </g>
    </svg>
  );
}

/* ── PMK Flag: Dark blue top, Yellow middle, Red bottom ── */
function PMKFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="8" fill="#1e3a8a" />
      <rect x="0" y="8" width="36" height="8" fill="#eab308" />
      <rect x="0" y="16" width="36" height="8" fill="#dc2626" />
    </svg>
  );
}

/* ── VCK Flag: Blue top, Red bottom, white star on blue ── */
function VCKFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="12" fill="#1e40af" />
      <rect x="0" y="12" width="36" height="12" fill="#dc2626" />
      {/* Large white star */}
      <polygon points="18,2 19.8,7.5 25.5,7.5 21,10.8 22.5,16 18,12.5 13.5,16 15,10.8 10.5,7.5 16.2,7.5" fill="#ffffff" />
    </svg>
  );
}

/* ── NTK Flag: Red with tiger/lion emblem ── */
function NTKFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="24" fill="#dc2626" />
      {/* Tiger silhouette */}
      <g transform="translate(8,2) scale(0.85)" fill="#000" opacity="0.8">
        <ellipse cx="12" cy="12" rx="8" ry="4" />
        <circle cx="20.5" cy="9" r="3.2" />
        {/* Legs */}
        <path d="M18 14.5 L22 20 L23 19 L19.5 14Z" />
        <path d="M16 15 L19 21 L20 20.5 L17.5 14.5Z" />
        <path d="M7 14 L4 20 L5.5 20 L8 14.5Z" />
        <path d="M9 14.5 L7 20.5 L8.5 20.5 L10 15Z" />
        {/* Tail */}
        <path d="M4 10 Q1 6 3 3.5 Q4 5 4.5 8" />
        {/* Ears */}
        <path d="M20.5 6 L22 3.5 L21 7Z" />
        <path d="M19 6.5 L18 3.5 L20 7Z" />
      </g>
    </svg>
  );
}

/* ── TVK Flag: Dark maroon/red with elephants and wheel emblem ── */
function TVKFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="24" fill="#7f1d1d" />
      {/* Central wheel/sun emblem */}
      <circle cx="18" cy="12" r="4" fill="#dc2626" stroke="#eab308" strokeWidth="0.8" />
      <circle cx="18" cy="12" r="2" fill="#eab308" opacity="0.8" />
      {/* Spokes */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line key={angle} x1="18" y1="12" x2={18 + 4 * Math.cos(angle * Math.PI / 180)} y2={12 + 4 * Math.sin(angle * Math.PI / 180)} stroke="#eab308" strokeWidth="0.4" />
      ))}
      {/* Left elephant */}
      <g transform="translate(5,8) scale(0.4)" fill="#d4d4d4" opacity="0.7">
        <ellipse cx="8" cy="12" rx="6" ry="8" />
        <ellipse cx="14" cy="6" rx="5" ry="6" />
        <path d="M18 8 Q20 12 18 18" stroke="#d4d4d4" strokeWidth="2" fill="none" />
        <rect x="3" y="18" width="3" height="8" rx="1" />
        <rect x="10" y="18" width="3" height="8" rx="1" />
      </g>
      {/* Right elephant (mirrored) */}
      <g transform="translate(36,8) scale(-0.4,0.4)" fill="#d4d4d4" opacity="0.7">
        <ellipse cx="8" cy="12" rx="6" ry="8" />
        <ellipse cx="14" cy="6" rx="5" ry="6" />
        <path d="M18 8 Q20 12 18 18" stroke="#d4d4d4" strokeWidth="2" fill="none" />
        <rect x="3" y="18" width="3" height="8" rx="1" />
        <rect x="10" y="18" width="3" height="8" rx="1" />
      </g>
    </svg>
  );
}

/* ── CPI Flag: Red with white "CPI" text, hammer & sickle ── */
function CPIFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="24" fill="#dc2626" />
      {/* CPI text in top-left */}
      <text x="3" y="7" fill="#ffffff" fontSize="4.5" fontWeight="bold" fontFamily="sans-serif">CPI</text>
      {/* White hammer & sickle */}
      <path d="M20 8 Q17 6 17 10 Q17 14 21 15" stroke="#ffffff" strokeWidth="1.2" fill="none" />
      <line x1="23" y1="7" x2="19" y2="15" stroke="#ffffff" strokeWidth="1" />
      <rect x="22" y="6" width="3" height="2" fill="#ffffff" rx="0.3" />
    </svg>
  );
}

/* ── CPI(M) Flag: Red with white hammer, sickle and star ── */
function CPIMFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="24" fill="#dc2626" />
      {/* White star */}
      <polygon points="18,2 19.5,6.5 24,6.5 20.5,9.5 22,14 18,11 14,14 15.5,9.5 12,6.5 16.5,6.5" fill="#ffffff" />
      {/* White hammer & sickle */}
      <path d="M15 16 Q13 14 13 17 Q13 20 16 21" stroke="#ffffff" strokeWidth="1" fill="none" />
      <line x1="20" y1="14.5" x2="17" y2="20.5" stroke="#ffffff" strokeWidth="0.8" />
      <rect x="19.5" y="13.5" width="2.5" height="1.5" fill="#ffffff" rx="0.3" />
    </svg>
  );
}

/* ── DMDK Flag: Red top, Black bottom with yellow circle & torch ── */
function DMDKFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="12" fill="#dc2626" />
      <rect x="0" y="12" width="36" height="12" fill="#000000" />
      {/* Yellow circle with torch */}
      <circle cx="18" cy="12" r="5.5" fill="#eab308" />
      {/* Torch silhouette */}
      <rect x="17" y="10" width="2" height="6" fill="#000" rx="0.3" />
      <path d="M15.5 10 L18 4 L20.5 10Z" fill="#000" opacity="0.8" />
      <path d="M16.5 8 L18 5 L19.5 8Z" fill="#dc2626" opacity="0.7" />
    </svg>
  );
}

/* ── MDMK Flag: Red-Black-Red three horizontal bands ── */
function MDMKFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="8" fill="#dc2626" />
      <rect x="0" y="8" width="36" height="8" fill="#000000" />
      <rect x="0" y="16" width="36" height="8" fill="#dc2626" />
    </svg>
  );
}

/* ── AMMK Flag: Red/Black with pressure cooker ── */
function AMMKFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="12" fill="#dc2626" />
      <rect x="0" y="12" width="36" height="12" fill="#000000" />
      {/* Pressure cooker silhouette */}
      <rect x="15" y="8" width="6" height="8" rx="1" fill="#fff" opacity="0.5" />
      <rect x="16" y="6" width="4" height="2.5" rx="0.5" fill="#fff" opacity="0.5" />
      <line x1="18" y1="5" x2="18" y2="3" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
    </svg>
  );
}

/* ── IUML Flag: Green with white crescent and star ── */
function IUMLFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="24" fill="#059669" />
      <circle cx="16" cy="12" r="5" fill="#ffffff" opacity="0.7" />
      <circle cx="17.5" cy="11" r="4.5" fill="#059669" />
      <polygon points="23,9 23.7,11 25.5,11 24,12.2 24.6,14 23,13 21.4,14 22,12.2 20.5,11 22.3,11" fill="#ffffff" opacity="0.7" />
    </svg>
  );
}

/* ── MNM Flag: White/cream background with "Makkal Needhi Maiam" text ── */
function MNMFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="24" fill="#ffffff" stroke="#e5e7eb" strokeWidth="0.5" />
      {/* Red circle with hand/fist symbol */}
      <circle cx="18" cy="10" r="6" fill="#991b1b" />
      <circle cx="18" cy="10" r="4.5" fill="#dc2626" />
      {/* White star/hand in center */}
      <polygon points="18,5.5 19,8 21.5,8 19.5,9.5 20.2,12 18,10.5 15.8,12 16.5,9.5 14.5,8 17,8" fill="#ffffff" />
      {/* MNM text */}
      <text x="18" y="20.5" fill="#991b1b" fontSize="3" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">MNM</text>
    </svg>
  );
}

/* ── TMC Flag: Indian tricolor style (Tamil Maanila Congress) ── */
function TMCFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="8" fill="#f97316" />
      <rect x="0" y="8" width="36" height="8" fill="#ffffff" />
      <rect x="0" y="16" width="36" height="8" fill="#16a34a" />
      {/* TMC text in center */}
      <text x="18" y="14" fill="#1e3a5f" fontSize="4" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">TMC</text>
    </svg>
  );
}

/* ── PT Flag: Elephant symbol (Pattali Makkal Katchi offshoot) ── */
function PTFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="24" fill="#7c3aed" />
      {/* Elephant silhouette */}
      <g transform="translate(10,4) scale(0.7)" fill="#ffffff" opacity="0.8">
        <ellipse cx="12" cy="12" rx="8" ry="7" />
        <ellipse cx="20" cy="8" rx="5" ry="5" />
        <path d="M24 10 Q26 14 24 20" stroke="#ffffff" strokeWidth="2" fill="none" />
        <rect x="6" y="17" width="3" height="7" rx="1" />
        <rect x="13" y="17" width="3" height="7" rx="1" />
      </g>
    </svg>
  );
}

/* ── Generic party flag (fallback) ── */
function GenericFlag({ size, color }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="24" fill={color || '#6b7280'} opacity="0.7" />
      <rect x="0" y="0" width="36" height="24" stroke={color || '#6b7280'} strokeWidth="1" fill="none" />
    </svg>
  );
}

const FLAG_COMPONENTS = {
  DMK: DMKFlag,
  AIADMK: AIADMKFlag,
  BJP: BJPFlag,
  INC: INCFlag,
  PMK: PMKFlag,
  VCK: VCKFlag,
  NTK: NTKFlag,
  TVK: TVKFlag,
  CPI: CPIFlag,
  'CPI(M)': CPIMFlag,
  DMDK: DMDKFlag,
  MDMK: MDMKFlag,
  AMMK: AMMKFlag,
  IUML: IUMLFlag,
  MNM: MNMFlag,
  TMC: TMCFlag,
  PT: PTFlag,
};

/**
 * Renders the party flag for a given political party.
 * @param {{ party: string, size?: number, color?: string, className?: string }} props
 */
export default function PartyFlag({ party, size = 16, color, className = '' }) {
  const Component = FLAG_COMPONENTS[party];
  if (Component) {
    return (
      <span className={`inline-flex items-center flex-shrink-0 ${className}`} title={`${party} Flag`}>
        <Component size={size} />
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center flex-shrink-0 ${className}`} title={`${party} Flag`}>
      <GenericFlag size={size} color={color} />
    </span>
  );
}
