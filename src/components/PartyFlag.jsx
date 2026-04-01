/**
 * Party flag SVG representations.
 * Based on verified Wikipedia descriptions of official party flags.
 * Researched March 2026 against Wikipedia infoboxes and party flag sections.
 */

/* ── DMK Flag: Black top, Red bottom, Rising Sun symbol ──
   Wikipedia: "sun rising from between two mountains" with black and red flag.
   File: Flag_DMK.svg */
function DMKFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="12" fill="#000000" />
      <rect x="0" y="12" width="36" height="12" fill="#dc2626" />
      {/* Rising Sun between two hills */}
      <circle cx="18" cy="12" r="4" fill="#eab308" />
      <path d="M8 16 L14 10 L18 12 L22 10 L28 16Z" fill="#000" opacity="0.4" />
      {/* Sun rays */}
      <line x1="18" y1="6" x2="18" y2="4" stroke="#eab308" strokeWidth="0.6" />
      <line x1="14" y1="7" x2="13" y2="5.5" stroke="#eab308" strokeWidth="0.5" />
      <line x1="22" y1="7" x2="23" y2="5.5" stroke="#eab308" strokeWidth="0.5" />
    </svg>
  );
}

/* ── AIADMK Flag: Red top, Black bottom, Two Leaves in green ──
   Wikipedia: Colours = Green; Symbol = Two Leaves.
   Flag: Red (top), Black (bottom) horizontal bands with Two Leaves emblem.
   File: AIADMK_Flag.svg */
function AIADMKFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="12" fill="#dc2626" />
      <rect x="0" y="12" width="36" height="12" fill="#000000" />
      {/* Two Leaves emblem centered at the band junction */}
      <path d="M18 9 Q13 5 13 2 Q16 5 18 9Z" fill="#16a34a" />
      <path d="M18 9 Q23 5 23 2 Q20 5 18 9Z" fill="#16a34a" />
      <line x1="18" y1="9" x2="18" y2="13" stroke="#16a34a" strokeWidth="0.8" />
      {/* Leaf veins */}
      <line x1="15.5" y1="5" x2="17" y2="7" stroke="#0d9" strokeWidth="0.3" opacity="0.6" />
      <line x1="20.5" y1="5" x2="19" y2="7" stroke="#0d9" strokeWidth="0.3" opacity="0.6" />
    </svg>
  );
}

/* ── BJP Flag: Saffron with green VERTICAL stripe on LEFT, Lotus ──
   Wikipedia: "predominantly saffron with a stripe of green in the left"
   The green stripe is VERTICAL on the left side. */
function BJPFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      {/* Green vertical stripe on the left */}
      <rect x="0" y="0" width="6" fill="#16a34a" height="24" />
      {/* Saffron main area */}
      <rect x="6" y="0" width="30" height="24" fill="#f97316" />
      {/* White Lotus in center of saffron area */}
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

/* ── INC Flag: Tricolor (saffron, white, green) with Hand symbol ──
   Wikipedia: Colours = "Saffron, white, and green"; Symbol = Raised Hand
   "usually shown in the centre of a tricolor flag" */
function INCFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="8" fill="#f97316" />
      <rect x="0" y="8" width="36" height="8" fill="#ffffff" />
      <rect x="0" y="16" width="36" height="8" fill="#16a34a" />
      {/* Hand symbol (raised open palm) in sky blue */}
      <g transform="translate(18, 12)" fill="#2563eb">
        <rect x="-1.5" y="-1" width="3" height="5" rx="0.5" opacity="0.75" />
        <rect x="-1.5" y="-5" width="0.7" height="4.5" rx="0.3" opacity="0.75" />
        <rect x="-0.5" y="-6" width="0.7" height="5.5" rx="0.3" opacity="0.75" />
        <rect x="0.5" y="-5.5" width="0.7" height="5" rx="0.3" opacity="0.75" />
        <rect x="1.5" y="-4.5" width="0.7" height="4" rx="0.3" opacity="0.75" />
      </g>
    </svg>
  );
}

/* ── PMK Flag: Green top, Yellow bottom, Mango symbol ──
   Wikipedia: Symbol = Ripe Mango. Traditional flag is green and yellow. */
function PMKFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="12" fill="#16a34a" />
      <rect x="0" y="12" width="36" height="12" fill="#eab308" />
      {/* Mango fruit at center */}
      <path d="M18 7 Q15 10 15 15 Q15 19 18 19.5 Q21 19 21 15 Q21 10 18 7Z" fill="#f59e0b" stroke="#b45309" strokeWidth="0.5" />
      <path d="M18 7 Q17.5 5 18.5 4" stroke="#16a34a" strokeWidth="0.6" fill="none" />
      <ellipse cx="18.5" cy="4" rx="1.5" ry="0.8" fill="#16a34a" />
    </svg>
  );
}

/* ── VCK Flag: Blue and Red ──
   Wikipedia: Colours = "Blue Red"; Symbol = Clay Pot
   Flag shows blue field with red elements */
function VCKFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="24" fill="#1e40af" />
      <rect x="0" y="20" width="36" height="4" fill="#dc2626" />
      {/* Ambedkar's Ashoka chakra / wheel of law */}
      <circle cx="18" cy="10" r="5" fill="none" stroke="#ffffff" strokeWidth="0.7" opacity="0.6" />
      <circle cx="18" cy="10" r="1" fill="#ffffff" opacity="0.5" />
    </svg>
  );
}

/* ── NTK Flag: Red with black border, leaping tiger (Puli) ──
   Nam Tamilar Katchi: Red flag with tiger silhouette. */
function NTKFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      {/* Black border frame */}
      <rect x="0" y="0" width="36" height="24" fill="#000000" />
      <rect x="1.5" y="1.5" width="33" height="21" fill="#dc2626" />
      {/* Leaping tiger (Puli) silhouette */}
      <g transform="translate(8,3) scale(0.8)" fill="#000" opacity="0.85">
        <ellipse cx="12" cy="12" rx="8" ry="4" />
        <circle cx="20.5" cy="9" r="3.2" />
        <path d="M18 14.5 L22 20 L23 19 L19.5 14Z" />
        <path d="M16 15 L19 21 L20 20.5 L17.5 14.5Z" />
        <path d="M7 14 L4 20 L5.5 20 L8 14.5Z" />
        <path d="M9 14.5 L7 20.5 L8.5 20.5 L10 15Z" />
        <path d="M4 10 Q1 6 3 3.5 Q4 5 4.5 8" />
        <path d="M20.5 6 L22 3.5 L21 7Z" />
      </g>
    </svg>
  );
}

/* ── TVK Flag: Dark Red and Yellow horizontal bands ──
   Wikipedia: Colours = "Dark Red, Yellow" */
function TVKFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="12" fill="#991b1b" />
      <rect x="0" y="12" width="36" height="12" fill="#eab308" />
      {/* Subtle 'V' for Vettri */}
      <path d="M15 4 L18 10 L21 4" stroke="#eab308" strokeWidth="0.8" fill="none" opacity="0.5" />
    </svg>
  );
}

/* ── CPI Flag: Red with yellow star, hammer and sickle ──
   Wikipedia: Communist Party of India. Red flag with hammer, sickle, and star. */
function CPIFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="24" fill="#dc2626" />
      {/* Star */}
      <polygon points="10,3 11.2,6.5 15,6.5 12,9 13.2,12.5 10,10.5 6.8,12.5 8,9 5,6.5 8.8,6.5" fill="#eab308" />
      {/* Sickle */}
      <path d="M20 8 Q17 6 17 10 Q17 14 21 15" stroke="#eab308" strokeWidth="1.2" fill="none" />
      {/* Hammer */}
      <line x1="23" y1="7" x2="19" y2="15" stroke="#eab308" strokeWidth="1" />
      <rect x="22" y="6" width="3" height="2" fill="#eab308" rx="0.3" />
    </svg>
  );
}

/* ── CPI(M) Flag: Red with hammer, sickle and star ──
   Wikipedia: Communist Party of India (Marxist). Similar to CPI but darker red. */
function CPIMFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="24" fill="#b91c1c" />
      {/* Star */}
      <polygon points="18,2 19.5,6.5 24,6.5 20.5,9.5 22,14 18,11 14,14 15.5,9.5 12,6.5 16.5,6.5" fill="#eab308" />
      {/* Hammer & Sickle below star */}
      <path d="M15 16 Q13 14 13 17 Q13 20 16 21" stroke="#eab308" strokeWidth="1" fill="none" />
      <line x1="20" y1="14.5" x2="17" y2="20.5" stroke="#eab308" strokeWidth="0.8" />
      <rect x="19.5" y="13.5" width="2.5" height="1.5" fill="#eab308" rx="0.3" />
    </svg>
  );
}

/* ── DMDK Flag: Yellow (primary colour per Wikipedia) with star ──
   Wikipedia: Colours = Yellow; Symbol = Nagara (drum).
   Flag file: Flag_DMDK.png. Red top, Yellow bottom. */
function DMDKFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="8" fill="#dc2626" />
      <rect x="0" y="8" width="36" height="16" fill="#eab308" />
      {/* Star in center */}
      <polygon points="18,4 19.2,8 23,8 20,10.5 21,14 18,12 15,14 16,10.5 13,8 16.8,8" fill="#fff" opacity="0.8" />
    </svg>
  );
}

/* ── MDMK Flag: Red-Black-Red (three horizontal bands) ──
   Wikipedia: "The colour of the party flag's top and bottom panel is red and
   middle panel is black." Colours = Red. */
function MDMKFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="8" fill="#dc2626" />
      <rect x="0" y="8" width="36" height="8" fill="#000000" />
      <rect x="0" y="16" width="36" height="8" fill="#dc2626" />
    </svg>
  );
}

/* ── AMMK Flag: Red/Black (split from AIADMK, similar colors) ──
   AMMK (TTV Dhinakaran's party). Uses similar Dravidian red/black scheme
   with pressure cooker symbol. */
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

/* ── IUML Flag: Green with white crescent and star ──
   Indian Union Muslim League. Traditional green flag with Islamic symbols. */
function IUMLFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="24" fill="#059669" />
      {/* Crescent */}
      <circle cx="16" cy="12" r="5" fill="#ffffff" opacity="0.7" />
      <circle cx="17.5" cy="11" r="4.5" fill="#059669" />
      {/* Star */}
      <polygon points="23,9 23.7,11 25.5,11 24,12.2 24.6,14 23,13 21.4,14 22,12.2 20.5,11 22.3,11" fill="#ffffff" opacity="0.7" />
    </svg>
  );
}

/* ── MNM Flag: Red and White ──
   Makkal Needhi Maiam (Kamal Haasan's party).
   Party uses red/maroon and white colors with torch symbol. */
function MNMFlag({ size }) {
  return (
    <svg viewBox="0 0 36 24" width={size * 1.5} height={size} className="rounded-sm shadow-sm">
      <rect x="0" y="0" width="36" height="12" fill="#b91c1c" />
      <rect x="0" y="12" width="36" height="12" fill="#ffffff" />
      {/* Six-pointed star / torch */}
      <polygon points="18,3 19.2,7 23,7 20,9.5 21.2,13 18,11 14.8,13 16,9.5 13,7 16.8,7" fill="#fff" opacity="0.6" />
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
