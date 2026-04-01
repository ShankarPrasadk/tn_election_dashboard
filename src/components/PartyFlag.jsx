/**
 * Party flag SVG representations.
 * Based on the official party flags of major Tamil Nadu political parties.
 * Flags use actual party colors and design elements.
 */

/* ── DMK Flag: Black top, Red bottom ── */
function DMKFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="12" fill="#000000" />
      <rect x="0" y="12" width="36" height="12" fill="#e11d48" />
    </svg>
  );
}

/* ── AIADMK Flag: Red top, Black bottom, Two Leaves in green ── */
function AIADMKFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="12" fill="#e11d48" />
      <rect x="0" y="12" width="36" height="12" fill="#000000" />
      {/* Two Leaves emblem in green */}
      <path d="M18 8 Q13 4 13.5 1.5 Q16.5 4 18 8Z" fill="#16a34a" />
      <path d="M18 8 Q23 4 22.5 1.5 Q19.5 4 18 8Z" fill="#16a34a" />
      <line x1="18" y1="8" x2="18" y2="11.5" stroke="#16a34a" strokeWidth="0.7" />
    </svg>
  );
}

/* ── BJP Flag: Saffron with green bottom stripe, Lotus ── */
function BJPFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="20" fill="#f97316" />
      <rect x="0" y="20" width="36" height="4" fill="#16a34a" />
      {/* Lotus */}
      <path d="M18 7 Q19.5 10 19 12.5 Q18 13.5 17 12.5 Q16.5 10 18 7Z" fill="#fff" opacity="0.8" />
      <path d="M15 9 Q14 11 15 13 Q16 13.5 17 12 Q16 10 15 9Z" fill="#fff" opacity="0.6" />
      <path d="M21 9 Q22 11 21 13 Q20 13.5 19 12 Q20 10 21 9Z" fill="#fff" opacity="0.6" />
    </svg>
  );
}

/* ── INC Flag: Tricolor with Hand ── */
function INCFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="8" fill="#f97316" />
      <rect x="0" y="8" width="36" height="8" fill="#ffffff" />
      <rect x="0" y="16" width="36" height="8" fill="#16a34a" />
      {/* Hand */}
      <path d="M16 15 L16 10 L17 7 L18 10 L18 6 L19 10 L19 7 L20 10 L20.5 8 L21 10 L21 15Z" fill="#3b82f6" opacity="0.7" />
    </svg>
  );
}

/* ── PMK Flag: Yellow with Mango ── */
function PMKFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="24" fill="#eab308" />
      <rect x="0" y="0" width="36" height="6" fill="#16a34a" />
      {/* Mango */}
      <path d="M18 8 Q15 11 15 16 Q15 20 18 20.5 Q21 20 21 16 Q21 11 18 8Z" fill="#16a34a" opacity="0.7" />
    </svg>
  );
}

/* ── VCK Flag: Blue ── */
function VCKFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="24" fill="#1e40af" />
      <circle cx="18" cy="12" r="6" fill="#ffffff" opacity="0.15" />
    </svg>
  );
}

/* ── NTK Flag: Red with leaping tiger ── */
function NTKFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="24" fill="#dc2626" />
      {/* Leaping tiger silhouette */}
      <g transform="translate(9,4) scale(0.75)" fill="#000" opacity="0.85">
        {/* body */}
        <ellipse cx="12" cy="12" rx="8" ry="4.5" />
        {/* head */}
        <circle cx="20" cy="9" r="3.5" />
        {/* front legs */}
        <path d="M18 15 L22 20 L23 19 L19.5 14.5Z" />
        <path d="M16 15.5 L19 21 L20 20 L17.5 15Z" />
        {/* rear legs */}
        <path d="M7 14 L4 20 L5.5 20.5 L8 15Z" />
        <path d="M9 15 L7 21 L8.5 21 L10 15.5Z" />
        {/* tail */}
        <path d="M4 10 Q1 6 3 4 Q4 5 4.5 8" fill="#000" />
        {/* ear */}
        <path d="M20 6 L22 4 L21 7Z" />
      </g>
    </svg>
  );
}

/* ── TVK Flag: Dark Red and Yellow (official party colours) ── */
function TVKFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="12" fill="#991b1b" />
      <rect x="0" y="12" width="36" height="12" fill="#eab308" />
    </svg>
  );
}

/* ── CPI Flag: Red with star ── */
function CPIFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="24" fill="#dc2626" />
      <polygon points="10,4 11.5,8 16,8 12.5,11 14,15 10,12.5 6,15 7.5,11 4,8 8.5,8" fill="#eab308" opacity="0.9" />
    </svg>
  );
}

/* ── CPI(M) Flag: Red with hammer/sickle ── */
function CPIMFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="24" fill="#b91c1c" />
      <polygon points="10,3 11.5,7 16,7 12.5,10 14,14 10,11.5 6,14 7.5,10 4,7 8.5,7" fill="#eab308" opacity="0.9" />
    </svg>
  );
}

/* ── DMDK Flag: Red-Yellow ── */
function DMDKFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="12" fill="#dc2626" />
      <rect x="0" y="12" width="36" height="12" fill="#eab308" />
    </svg>
  );
}

/* ── MDMK Flag: Red background ── */
function MDMKFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="24" fill="#dc2626" />
      <rect x="0" y="0" width="36" height="6" fill="#000000" />
    </svg>
  );
}

/* ── AMMK Flag: Purple maroon ── */
function AMMKFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="18" height="24" fill="#16a34a" />
      <rect x="18" y="0" width="18" height="24" fill="#dc2626" />
    </svg>
  );
}

/* ── IUML Flag: Green ── */
function IUMLFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="24" fill="#059669" />
      <rect x="0" y="10" width="36" height="4" fill="#ffffff" opacity="0.3" />
    </svg>
  );
}

/* ── MNM Flag: Red-White ── */
function MNMFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="12" fill="#ec4899" />
      <rect x="0" y="12" width="36" height="12" fill="#ffffff" />
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
