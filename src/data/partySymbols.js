// Party election symbols — per ECI/TNSEC statutory orders
// SVG rendering handled by PartySymbolIcon component

export const PARTY_SYMBOLS = {
  DMK:      { label: 'Rising Sun' },
  AIADMK:   { label: 'Two Leaves' },
  BJP:      { label: 'Lotus' },
  INC:      { label: 'Hand' },
  PMK:      { label: 'Mango' },
  NTK:      { label: 'Farmer' },
  TVK:      { label: 'Whistle' },
  VCK:      { label: 'Pot' },
  CPI:      { label: 'Ears of Corn & Sickle' },
  'CPI(M)': { label: 'Hammer, Sickle & Star' },
  DMDK:     { label: 'Murasu (Drum)' },
  MDMK:     { label: 'Rising Sun' },
  AMMK:     { label: 'Pressure Cooker' },
  IUML:     { label: 'Ladder' },
  MNM:      { label: 'Battery Torch' },
  TMC:      { label: 'Bicycle' },
  PT:       { label: 'Elephant' },
  'PMK(R)': { label: 'Mango' },
  IND:      { label: 'Independent' },
  Others:   { label: 'Party' },
};

export function getPartySymbol(party) {
  return PARTY_SYMBOLS[party] || PARTY_SYMBOLS.Others;
}
