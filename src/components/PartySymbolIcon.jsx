/**
 * Party election symbol SVG representations.
 * Based on the official election symbols registered with the
 * Election Commission of India (ECI) and notified by the
 * Tamil Nadu State Election Commission (TNSEC) via
 * S.O.No.12/2025/TNSEC/ME1 dated 21.07.2025.
 *
 * Note: TNSEC/ECI do not host individual symbol image files;
 * official symbols are published only in statutory order PDFs.
 * These SVGs are faithful vector representations of the
 * notified symbols for display purposes.
 */

/* ── Rising Sun (DMK / MDMK) ── */
function RisingSun({ color, size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      {/* horizon line */}
      <line x1="3" y1="16" x2="21" y2="16" stroke={color} strokeWidth="1.5" />
      {/* sun semicircle */}
      <path d="M7 16 A5 5 0 0 1 17 16" fill={color} />
      {/* rays */}
      <line x1="12" y1="4" x2="12" y2="8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="6" y1="6" x2="8" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="18" y1="6" x2="16" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3.5" y1="10" x2="6.5" y2="11.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20.5" y1="10" x2="17.5" y2="11.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── Two Leaves (AIADMK) ── */
function TwoLeaves({ color, size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      {/* stem */}
      <line x1="12" y1="20" x2="12" y2="10" stroke={color} strokeWidth="1.5" />
      {/* left leaf */}
      <path d="M12 10 Q5 6 6 2 Q10 5 12 10Z" fill={color} />
      {/* right leaf */}
      <path d="M12 10 Q19 6 18 2 Q14 5 12 10Z" fill={color} />
      {/* leaf veins */}
      <path d="M12 10 Q8.5 6.5 7.5 3.5" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" fill="none" />
      <path d="M12 10 Q15.5 6.5 16.5 3.5" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" fill="none" />
    </svg>
  );
}

/* ── Lotus (BJP) ── */
function Lotus({ color, size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      {/* center petal */}
      <path d="M12 4 Q14.5 8 14 12 Q12 14 10 12 Q9.5 8 12 4Z" fill={color} />
      {/* left petal */}
      <path d="M8 7 Q6 10 7.5 13 Q9 14 10 12 Q9.5 9 8 7Z" fill={color} opacity="0.8" />
      {/* right petal */}
      <path d="M16 7 Q18 10 16.5 13 Q15 14 14 12 Q14.5 9 16 7Z" fill={color} opacity="0.8" />
      {/* far left petal */}
      <path d="M5 10 Q4 13 6 15 Q8 15 9 13 Q7 11 5 10Z" fill={color} opacity="0.6" />
      {/* far right petal */}
      <path d="M19 10 Q20 13 18 15 Q16 15 15 13 Q17 11 19 10Z" fill={color} opacity="0.6" />
      {/* base */}
      <path d="M7 16 Q12 20 17 16" stroke={color} strokeWidth="1.2" fill="none" />
      <path d="M9 17 Q12 19.5 15 17" stroke={color} strokeWidth="1" fill="none" />
    </svg>
  );
}

/* ── Hand / Palm (INC) ── */
function Hand({ color, size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      <path
        d="M8 21 L8 12 L6 12 L6 9 L7 4 Q7.5 3 8.5 4 L9 7 L9 3 Q9.5 2 10.5 3 L11 7 L11 2.5 Q11.5 1.5 12.5 2.5 L13 7 L13 3 Q13.5 2 14.5 3 L15 7 L15.5 5 Q16 4 17 5 L17 12 L18 12 L18 14 L16 21Z"
        fill={color}
        stroke={color}
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Mango (PMK) ── */
function Mango({ color, size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      {/* stem */}
      <path d="M13 4 Q14 3 15 4" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* leaf */}
      <path d="M15 4 Q18 3 16 6" fill={color} opacity="0.6" />
      {/* mango body */}
      <path d="M12 5 Q7 8 7 14 Q7 20 12 21 Q17 20 17 14 Q17 8 12 5Z" fill={color} />
    </svg>
  );
}

/* ── Farmer (NTK - Naam Tamilar Katchi, ECI symbol since May 2025) ── */
function Farmer({ color, size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      {/* head */}
      <circle cx="12" cy="4.5" r="2.5" fill={color} />
      {/* hat brim */}
      <path d="M8 4.5 Q12 2 16 4.5" stroke={color} strokeWidth="1.2" fill="none" />
      {/* body */}
      <path d="M12 7 L12 15" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {/* arms holding tool */}
      <path d="M8 10 L12 12 L16 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* legs */}
      <line x1="12" y1="15" x2="9" y2="22" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="12" y1="15" x2="15" y2="22" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      {/* plough/tool */}
      <path d="M7 10 L5 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17 10 L19 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── Whistle (TVK - Tamilaga Vettri Kazhagam, ECI symbol) ── */
function Whistle({ color, size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      {/* whistle body */}
      <path d="M3 10 L14 10 Q18 10 19 13 L19 14 Q18 17 14 17 L10 17 L8 14 L3 14Z" fill={color} />
      {/* mouthpiece */}
      <rect x="1" y="10.5" width="4" height="3" rx="1" fill={color} />
      {/* sound hole */}
      <circle cx="16" cy="13.5" r="1.5" fill="rgba(0,0,0,0.25)" />
      {/* ring */}
      <circle cx="19.5" cy="13.5" r="2" stroke={color} strokeWidth="1.5" fill="none" />
      {/* lanyard */}
      <path d="M21 12 Q23 8 21 6 Q19 5 18 7" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* sound waves */}
      <path d="M16 7 Q17 6 16 5" stroke={color} strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <path d="M18 6 Q19 5 18 4" stroke={color} strokeWidth="0.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/* ── Battery Torch (TVK - Tamilaga Vettri Kazhagam / MNM) ── */
function BatteryTorch({ color, size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      {/* torch body */}
      <rect x="5" y="9" width="12" height="6" rx="1.5" fill={color} />
      {/* torch head */}
      <path d="M17 8 L20 6 L20 18 L17 16Z" fill={color} />
      {/* light rays */}
      <line x1="21" y1="12" x2="23" y2="12" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="21" y1="9" x2="22.5" y2="7.5" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <line x1="21" y1="15" x2="22.5" y2="16.5" stroke={color} strokeWidth="1" strokeLinecap="round" />
      {/* battery lines */}
      <line x1="9" y1="10" x2="9" y2="14" stroke="rgba(0,0,0,0.3)" strokeWidth="0.8" />
      <line x1="12" y1="10" x2="12" y2="14" stroke="rgba(0,0,0,0.3)" strokeWidth="0.8" />
      {/* button */}
      <rect x="7" y="7.5" width="3" height="1.5" rx="0.5" fill={color} />
    </svg>
  );
}

/* ── Pot / Kuduvai (VCK) ── */
function Pot({ color, size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      {/* pot body */}
      <path d="M6 10 Q5 16 8 19 L16 19 Q19 16 18 10Z" fill={color} />
      {/* pot rim */}
      <ellipse cx="12" cy="10" rx="7" ry="2" fill={color} />
      {/* pot neck */}
      <path d="M9 8 L9 10 M15 8 L15 10" stroke={color} strokeWidth="1" />
      <ellipse cx="12" cy="8" rx="4" ry="1.5" fill={color} opacity="0.8" />
      {/* base */}
      <ellipse cx="12" cy="19.5" rx="3" ry="0.8" fill={color} opacity="0.7" />
    </svg>
  );
}

/* ── Ears of Corn & Sickle (CPI) ── */
function CornSickle({ color, size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      {/* sickle */}
      <path d="M6 8 Q4 14 8 18 Q12 20 16 16" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* sickle handle */}
      <line x1="16" y1="16" x2="19" y2="19" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {/* corn stalk left */}
      <line x1="10" y1="18" x2="8" y2="4" stroke={color} strokeWidth="1" />
      {/* corn kernels left */}
      <ellipse cx="7.5" cy="5" rx="1" ry="2" fill={color} opacity="0.8" transform="rotate(-10 7.5 5)" />
      {/* corn stalk right */}
      <line x1="13" y1="16" x2="14" y2="4" stroke={color} strokeWidth="1" />
      {/* corn kernels right */}
      <ellipse cx="14.5" cy="5" rx="1" ry="2" fill={color} opacity="0.8" transform="rotate(5 14.5 5)" />
    </svg>
  );
}

/* ── Hammer, Sickle & Star (CPI-M) ── */
function HammerSickle({ color, size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      {/* star */}
      <polygon
        points="12,2 13.5,7 18,7 14.5,10 16,15 12,12 8,15 9.5,10 6,7 10.5,7"
        fill={color}
        transform="scale(0.5) translate(12,0)"
      />
      {/* sickle */}
      <path d="M5 8 Q3 14 8 18" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* sickle blade curve */}
      <path d="M5 8 Q8 6 10 8 Q8 10 5 8Z" fill={color} />
      {/* hammer handle */}
      <line x1="14" y1="10" x2="19" y2="20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      {/* hammer head */}
      <rect x="11" y="8" width="6" height="3" rx="0.5" fill={color} transform="rotate(-15 14 9.5)" />
    </svg>
  );
}

/* ── Drum / Murasu (DMDK) ── */
function Drum({ color, size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      {/* drum body */}
      <path d="M7 7 L7 17 Q7 19 12 19 Q17 19 17 17 L17 7" fill={color} opacity="0.7" />
      {/* drum top */}
      <ellipse cx="12" cy="7" rx="5" ry="2.5" fill={color} />
      {/* drum bottom */}
      <ellipse cx="12" cy="17" rx="5" ry="2" fill={color} opacity="0.5" />
      {/* drum straps */}
      <line x1="8" y1="8" x2="8.5" y2="17" stroke="rgba(0,0,0,0.2)" strokeWidth="0.8" />
      <line x1="12" y1="9.5" x2="12" y2="17" stroke="rgba(0,0,0,0.2)" strokeWidth="0.8" />
      <line x1="16" y1="8" x2="15.5" y2="17" stroke="rgba(0,0,0,0.2)" strokeWidth="0.8" />
      {/* drumstick */}
      <line x1="3" y1="5" x2="9" y2="9" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="3" cy="5" r="1" fill={color} />
    </svg>
  );
}

/* ── Pressure Cooker (AMMK) ── */
function PressureCooker({ color, size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      {/* cooker body */}
      <path d="M6 10 L6 18 Q6 20 12 20 Q18 20 18 18 L18 10Z" fill={color} opacity="0.8" />
      {/* lid */}
      <path d="M5 10 Q5 8 12 8 Q19 8 19 10Z" fill={color} />
      {/* handle top */}
      <path d="M9 8 Q9 5 12 5 Q15 5 15 8" stroke={color} strokeWidth="1.5" fill="none" />
      {/* weight/whistle */}
      <circle cx="12" cy="4" r="1.5" fill={color} />
      {/* steam */}
      <line x1="12" y1="2.5" x2="12" y2="1" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <line x1="10" y1="2" x2="10" y2="1" stroke={color} strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
      {/* handle sides */}
      <line x1="4" y1="14" x2="6" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="18" y1="14" x2="20" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── Ladder (IUML) ── */
function Ladder({ color, size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      {/* left rail */}
      <line x1="8" y1="2" x2="8" y2="22" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      {/* right rail */}
      <line x1="16" y1="2" x2="16" y2="22" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      {/* rungs */}
      <line x1="8" y1="5" x2="16" y2="5" stroke={color} strokeWidth="1.5" />
      <line x1="8" y1="9" x2="16" y2="9" stroke={color} strokeWidth="1.5" />
      <line x1="8" y1="13" x2="16" y2="13" stroke={color} strokeWidth="1.5" />
      <line x1="8" y1="17" x2="16" y2="17" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

/* ── Elephant (PT - Puthiya Tamilagam) ── */
function Elephant({ color, size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      {/* body */}
      <ellipse cx="12" cy="14" rx="6" ry="5" fill={color} />
      {/* head */}
      <circle cx="7" cy="9" r="4" fill={color} />
      {/* trunk */}
      <path d="M4 11 Q2 14 3 17 Q3.5 18 4 17" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* ear */}
      <path d="M5 7 Q3 5 4 8" fill={color} opacity="0.6" />
      {/* eye */}
      <circle cx="6" cy="8" r="0.8" fill="rgba(0,0,0,0.4)" />
      {/* legs */}
      <line x1="8" y1="18" x2="8" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="11" y1="18" x2="11" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="18" x2="14" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="17" y1="18" x2="17" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {/* tail */}
      <path d="M18 12 Q20 10 19 8" stroke={color} strokeWidth="1" fill="none" />
      {/* tusk */}
      <line x1="5" y1="11" x2="4" y2="13" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

/* ── Bicycle (TMC) ── */
function Bicycle({ color, size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      {/* back wheel */}
      <circle cx="7" cy="16" r="4" stroke={color} strokeWidth="1.5" />
      {/* front wheel */}
      <circle cx="17" cy="16" r="4" stroke={color} strokeWidth="1.5" />
      {/* frame */}
      <path d="M7 16 L12 10 L17 16 M12 10 L7 16" stroke={color} strokeWidth="1.5" />
      {/* handlebars */}
      <path d="M12 10 L16 8 L18 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* seat */}
      <line x1="10" y1="9" x2="13" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── Generic ballot box (fallback) ── */
function BallotBox({ color, size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      <rect x="5" y="8" width="14" height="12" rx="1.5" stroke={color} strokeWidth="1.5" />
      <line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth="1.5" />
      <rect x="10" y="6" width="4" height="4" rx="0.5" fill={color} />
    </svg>
  );
}

/* ── Component map ── */
const SYMBOL_COMPONENTS = {
  DMK: RisingSun,
  MDMK: RisingSun,
  AIADMK: TwoLeaves,
  BJP: Lotus,
  INC: Hand,
  PMK: Mango,
  'PMK(R)': Mango,
  NTK: Farmer,
  TVK: Whistle,
  MNM: BatteryTorch,
  VCK: Pot,
  CPI: CornSickle,
  'CPI(M)': HammerSickle,
  DMDK: Drum,
  AMMK: PressureCooker,
  IUML: Ladder,
  PT: Elephant,
  TMC: Bicycle,
};

/**
 * Renders the official ECI-registered election symbol for a given party.
 * @param {{ party: string, size?: number, color?: string, className?: string }} props
 */
export default function PartySymbolIcon({ party, size = 16, color = 'currentColor', className = '' }) {
  const Component = SYMBOL_COMPONENTS[party] || BallotBox;
  return (
    <span className={`inline-flex items-center justify-center flex-shrink-0 ${className}`} title={party}>
      <Component color={color} size={size} />
    </span>
  );
}
