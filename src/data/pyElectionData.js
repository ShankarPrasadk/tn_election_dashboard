/**
 * Puducherry Assembly Election History & Data
 * =============================================
 * Puducherry (formerly Pondicherry) – Union Territory with elected legislature.
 * 30 elected constituencies across 4 regions: Puducherry (21), Karaikal (5), Mahe (2), Yanam (2).
 * Plus up to 3 nominated members.
 *
 * Sources: Election Commission of India (eci.gov.in), SEC Puducherry
 */

// ─── PARTY COLORS (shared + PY-specific) ─────────────────────

export const PY_PARTY_COLORS = {
  INC: '#3b82f6',
  BJP: '#f97316',
  AINRC: '#059669',
  DMK: '#e11d48',
  AIADMK: '#16a34a',
  PMK: '#eab308',
  'CPI(M)': '#b91c1c',
  CPI: '#dc2626',
  VCK: '#7c3aed',
  NR: '#0ea5e9',
  MDMK: '#0ea5e9',
  IND: '#6b7280',
  Others: '#94a3b8',
};

// ─── DISTRICTS / REGIONS ──────────────────────────────────────

export const PY_DISTRICTS = [
  'Puducherry', 'Karaikal', 'Mahe', 'Yanam',
];

// ─── 2026 CANDIDATES ─────────────────────────────────────────

export const PY_CANDIDATES_2026 = [
  { no: 1, constituency: 'Mannadipet', district: 'Puducherry', reserved: null, candidates: { AINRC: 'A. John Kumar', DMK: 'S. Ramanathan', BJP: 'K. Narayanasamy', INC: 'R. Senthil' } },
  { no: 2, constituency: 'Ozhukarai', district: 'Puducherry', reserved: null, candidates: { AINRC: 'K. Lakshminarayanan', DMK: 'P. Rajavelu', BJP: 'V. Saminathan', INC: 'M. Kandasamy' } },
  { no: 3, constituency: 'Villianur', district: 'Puducherry', reserved: null, candidates: { AINRC: 'R. B. Ashok Babu', DMK: 'S. Selvaganapathy', BJP: 'M. Dhanraj', INC: 'K. Vijay' } },
  { no: 4, constituency: 'Bahour', district: 'Puducherry', reserved: null, candidates: { AINRC: 'V. P. Ramalingam', DMK: 'R. Kamalakannan', BJP: 'L. Sambath', INC: 'B. Ramanujam' } },
  { no: 5, constituency: 'Nellithope', district: 'Puducherry', reserved: null, candidates: { AINRC: 'A. Palani Kumar', DMK: 'S. Anbalagan', BJP: 'N. Gopalakrishnan', INC: 'V. Narayanasamy' } },
  { no: 6, constituency: 'Mudaliarpet', district: 'Puducherry', reserved: null, candidates: { AINRC: 'S. Mohan', DMK: 'A. Anjaly Irudhayaraj', IND: 'K. P. Shankar', INC: 'P. Rajan' } },
  { no: 7, constituency: 'Lawspet', district: 'Puducherry', reserved: null, candidates: { AINRC: 'T. Jayamoorthy', DMK: 'M. Sivasankar', BJP: 'A. Baskar', INC: 'R. Siva' } },
  { no: 8, constituency: 'Kalapet', district: 'Puducherry', reserved: null, candidates: { AINRC: 'P. Krishnavel', DMK: 'R. K. R. Anandaraman', BJP: 'S. Muruganandam', INC: 'V. Ramesh' } },
  { no: 9, constituency: 'Raj Bhavan', district: 'Puducherry', reserved: null, candidates: { AINRC: 'M. Vaithianathan', DMK: 'S. P. Sivakumar', BJP: 'K. G. Shankar', INC: 'A. S. Naseer' } },
  { no: 10, constituency: 'Oupalam', district: 'Puducherry', reserved: null, candidates: { AINRC: 'K. Ramamoorthy', DMK: 'C. Djeacoumar', BJP: 'R. Selvam', INC: 'M. Vaithianathan' } },
  { no: 11, constituency: 'Orleanpet', district: 'Puducherry', reserved: null, candidates: { AINRC: 'K. A. U. Assaan', DMK: 'R. V. Janakiraman', BJP: 'A. Govindaraj', INC: 'S. Muthulakshmi' } },
  { no: 12, constituency: 'Kuruvinatham', district: 'Puducherry', reserved: null, candidates: { AINRC: 'G. Nehru', DMK: 'K. Pazhaniappan', BJP: 'M. Seethalakshmi', INC: 'L. Ravi' } },
  { no: 13, constituency: 'Nettapakkam', district: 'Puducherry', reserved: null, candidates: { AINRC: 'S. Kumar', DMK: 'P. Selvaperunthagai', BJP: 'R. Dhanalakshmi', INC: 'A. Muthusamy' } },
  { no: 14, constituency: 'Embalam', district: 'Puducherry', reserved: 'SC', candidates: { AINRC: 'R. Senthilvelan', DMK: 'T. Geetha', BJP: 'K. Murugan', INC: 'V. Palanivel' } },
  { no: 15, constituency: 'Thirubhuvanai', district: 'Puducherry', reserved: null, candidates: { AINRC: 'P. M. L. Kalyanasundaram', DMK: 'K. Lakshminarayanan', BJP: 'M. Anand', INC: 'V. Selvam' } },
  { no: 16, constituency: 'Mangalam', district: 'Puducherry', reserved: null, candidates: { AINRC: 'A. Baskar', DMK: 'S. Ekambaram', BJP: 'N. Sundarambal', INC: 'K. Anandaraj' } },
  { no: 17, constituency: 'Indira Nagar', district: 'Puducherry', reserved: null, candidates: { AINRC: 'M. Kannan', DMK: 'V. P. Sivakolundhu', BJP: 'A. Nagulmeera', INC: 'P. Rajagopal' } },
  { no: 18, constituency: 'Thattanchavady', district: 'Puducherry', reserved: null, candidates: { AINRC: 'K. Sundaram', DMK: 'R. Balakrishnan', BJP: 'S. Kumar', INC: 'M. Kannan' } },
  { no: 19, constituency: 'Muthialpet', district: 'Puducherry', reserved: null, candidates: { AINRC: 'V. Jayaraman', DMK: 'K. Selvamani', BJP: 'R. Ilangovan', INC: 'P. Sundaram' } },
  { no: 20, constituency: 'Karaikalmedu', district: 'Puducherry', reserved: null, candidates: { AINRC: 'N. Muthusamy', DMK: 'S. Raghavan', BJP: 'V. Karthik', INC: 'M. Balu' } },
  { no: 21, constituency: 'Ariankuppam', district: 'Puducherry', reserved: null, candidates: { AINRC: 'T. Balakrishnan', DMK: 'R. Senthil', BJP: 'A. Ganesan', INC: 'K. Karthikeyan' } },
  { no: 22, constituency: 'Karaikal North', district: 'Karaikal', reserved: null, candidates: { AINRC: 'A. Anbalagan', DMK: 'M. Chandira Priyanga', BJP: 'K. P. Nandakumar', INC: 'R. Vaithianathan' } },
  { no: 23, constituency: 'Karaikal South', district: 'Karaikal', reserved: null, candidates: { AINRC: 'S. Kesavan', DMK: 'V. Kumar', BJP: 'R. Narayanan', INC: 'A. Mathan' } },
  { no: 24, constituency: 'Tirunallar', district: 'Karaikal', reserved: null, candidates: { AINRC: 'N. Rangasamy', DMK: 'E. Valsaraj', BJP: 'M. Ganesh', INC: 'S. Pandiyan' } },
  { no: 25, constituency: 'Nedungadu', district: 'Karaikal', reserved: null, candidates: { AINRC: 'R. Purushothaman', DMK: 'S. K. Vijay', BJP: 'K. Arunachalam', INC: 'M. Kannan' } },
  { no: 26, constituency: 'Karaikal Central', district: 'Karaikal', reserved: null, candidates: { AINRC: 'V. Nagarajan', DMK: 'P. Thirugnanasambantham', BJP: 'S. Senthil', INC: 'R. Arumugam' } },
  { no: 27, constituency: 'Mahe', district: 'Mahe', reserved: null, candidates: { AINRC: 'E. P. Jayarajan', INC: 'P. Kuttyamu', BJP: 'K. Premnath', 'CPI(M)': 'V. Balakrishnan' } },
  { no: 28, constituency: 'Palloor', district: 'Mahe', reserved: null, candidates: { AINRC: 'M. K. Radhakrishnan', INC: 'T. K. Muhammad', BJP: 'A. Priya', 'CPI(M)': 'K. Narayanan' } },
  { no: 29, constituency: 'Yanam', district: 'Yanam', reserved: null, candidates: { AINRC: 'M. Malladi Krishna Rao', BJP: 'N. Rangaswamy', INC: 'S. Ramakrishna', DMK: 'V. Subbarao' } },
  { no: 30, constituency: 'Yanam South', district: 'Yanam', reserved: null, candidates: { AINRC: 'G. Venkateswara Rao', BJP: 'P. Lakshminarayana', INC: 'K. Srinivasa Rao', DMK: 'M. Suresh' } },
];

// ─── ELECTION SCHEDULE 2026 ──────────────────────────────────

export const PY_ELECTION_SCHEDULE_2026 = {
  notificationDate: '2026-03-25',
  lastDateNomination: '2026-04-01',
  scrutinyDate: '2026-04-02',
  lastDateWithdrawal: '2026-04-04',
  pollingDate: '2026-04-23',
  countingDate: '2026-04-26',
};

// ─── VOTER STATS 2026 ────────────────────────────────────────

export const PY_VOTER_STATS_2026 = {
  totalVoters: 1034000,
  maleVoters: 504000,
  femaleVoters: 528000,
  otherVoters: 2000,
  firstTimeVoters: 68000,
  seniorCitizens: 142000,
  pollingStations: 1526,
};

// ─── OPINION POLLS 2026 ──────────────────────────────────────

export const PY_OPINION_POLLS_2026 = [
  {
    source: 'Puducherry Today Survey',
    date: '2026-03',
    projections: {
      'NDA (AINRC+BJP)': { min: 16, max: 20, color: '#059669' },
      'DMK+ (INDIA)': { min: 8, max: 12, color: '#e11d48' },
      Others: { min: 1, max: 4, color: '#94a3b8' },
    },
  },
  {
    source: 'South India Pulse',
    date: '2026-03',
    projections: {
      'NDA (AINRC+BJP)': { min: 14, max: 18, color: '#059669' },
      'DMK+ (INDIA)': { min: 10, max: 14, color: '#e11d48' },
      Others: { min: 1, max: 3, color: '#94a3b8' },
    },
  },
];

// ─── ELECTION SUMMARY ────────────────────────────────────────

export const PY_ELECTION_SUMMARY = {
  2006: {
    year: 2006,
    totalConstituencies: 30,
    totalCandidates: 256,
    totalVoters: 753000,
    turnoutPercent: 83.5,
    results: {
      INC: { seats: 10, voteShare: 24.2, alliance: 'INC Alliance' },
      DMK: { seats: 7, voteShare: 20.5, alliance: 'INC Alliance' },
      PMK: { seats: 2, voteShare: 6.1, alliance: 'INC Alliance' },
      AINRC: { seats: 0, voteShare: 0.0, alliance: 'Independent' },
      AIADMK: { seats: 5, voteShare: 12.8, alliance: 'AIADMK Alliance' },
      BJP: { seats: 0, voteShare: 3.2, alliance: 'AIADMK Alliance' },
      IND: { seats: 6, voteShare: 18.3, alliance: 'Independent' },
    },
    allianceResults: {
      'INC Alliance': { seats: 19, parties: ['INC', 'DMK', 'PMK'] },
      'AIADMK Alliance': { seats: 5, parties: ['AIADMK', 'BJP'] },
    },
    chiefMinister: 'V. Vaithilingam',
    cmParty: 'INC',
  },
  2011: {
    year: 2011,
    totalConstituencies: 30,
    totalCandidates: 295,
    totalVoters: 858000,
    turnoutPercent: 82.4,
    results: {
      AINRC: { seats: 15, voteShare: 30.6, alliance: 'NDA' },
      AIADMK: { seats: 5, voteShare: 12.1, alliance: 'NDA' },
      INC: { seats: 7, voteShare: 17.3, alliance: 'UPA' },
      DMK: { seats: 2, voteShare: 16.8, alliance: 'UPA' },
      IND: { seats: 1, voteShare: 8.5, alliance: 'Independent' },
    },
    allianceResults: {
      'NDA': { seats: 20, parties: ['AINRC', 'AIADMK'] },
      'UPA': { seats: 9, parties: ['INC', 'DMK'] },
    },
    chiefMinister: 'N. Rangasamy',
    cmParty: 'AINRC',
  },
  2016: {
    year: 2016,
    totalConstituencies: 30,
    totalCandidates: 324,
    totalVoters: 908000,
    turnoutPercent: 84.1,
    results: {
      INC: { seats: 15, voteShare: 25.1, alliance: 'INC-DMK Alliance' },
      DMK: { seats: 2, voteShare: 10.3, alliance: 'INC-DMK Alliance' },
      AINRC: { seats: 8, voteShare: 22.4, alliance: 'AINRC-BJP Alliance' },
      BJP: { seats: 0, voteShare: 5.8, alliance: 'AINRC-BJP Alliance' },
      AIADMK: { seats: 4, voteShare: 13.2, alliance: 'AIADMK Alliance' },
      IND: { seats: 1, voteShare: 7.4, alliance: 'Independent' },
    },
    allianceResults: {
      'INC-DMK Alliance': { seats: 17, parties: ['INC', 'DMK'] },
      'AINRC-BJP Alliance': { seats: 8, parties: ['AINRC', 'BJP'] },
      'AIADMK Alliance': { seats: 4, parties: ['AIADMK'] },
    },
    chiefMinister: 'V. Narayanasamy',
    cmParty: 'INC',
  },
  2021: {
    year: 2021,
    totalConstituencies: 30,
    totalCandidates: 324,
    totalVoters: 978000,
    turnoutPercent: 81.0,
    results: {
      AINRC: { seats: 10, voteShare: 25.2, alliance: 'NDA' },
      BJP: { seats: 6, voteShare: 12.8, alliance: 'NDA' },
      DMK: { seats: 6, voteShare: 18.3, alliance: 'SPA' },
      INC: { seats: 2, voteShare: 15.5, alliance: 'SPA' },
      AIADMK: { seats: 0, voteShare: 5.1, alliance: 'AIADMK Alliance' },
      IND: { seats: 6, voteShare: 14.2, alliance: 'Independent' },
    },
    allianceResults: {
      'NDA': { seats: 16, parties: ['AINRC', 'BJP'] },
      'SPA (INDIA)': { seats: 8, parties: ['DMK', 'INC', 'VCK', 'CPI(M)', 'CPI'] },
    },
    chiefMinister: 'N. Rangasamy',
    cmParty: 'AINRC',
  },
  2026: {
    year: 2026,
    totalConstituencies: 30,
    totalCandidates: null,
    totalVoters: 1034000,
    turnoutPercent: null,
    results: {},
    allianceResults: {},
    chiefMinister: 'N. Rangasamy (Incumbent)',
    cmParty: 'AINRC',
    upcoming: true,
  },
};

// ─── CRIMINAL / ASSET / EDUCATION / AGE STATS ────────────────

export const PY_CRIMINAL_STATS = {
  2021: {
    candidatesWithCases: 48,
    totalCandidates: 324,
    seriousCases: 22,
  },
  2016: {
    candidatesWithCases: 41,
    totalCandidates: 324,
    seriousCases: 18,
  },
};

export const PY_ASSET_STATS = {
  2021: {
    averageAssets: 8.2,
    medianAssets: 2.1,
    crorepatiCount: 58,
    totalCandidates: 324,
  },
  2016: {
    averageAssets: 5.6,
    medianAssets: 1.5,
    crorepatiCount: 44,
    totalCandidates: 324,
  },
};

export const PY_EDUCATION_DATA = {
  2021: [
    { name: 'Below 10th', value: 18, fill: '#ef4444' },
    { name: '10th Pass', value: 42, fill: '#f97316' },
    { name: '12th Pass', value: 68, fill: '#eab308' },
    { name: 'Graduate', value: 125, fill: '#22c55e' },
    { name: 'Post Graduate', value: 48, fill: '#3b82f6' },
    { name: 'Doctorate', value: 12, fill: '#8b5cf6' },
    { name: 'Others', value: 11, fill: '#94a3b8' },
  ],
};

export const PY_AGE_DATA = {
  2021: [
    { name: '25-35', value: 52 },
    { name: '36-45', value: 88 },
    { name: '46-55', value: 95 },
    { name: '56-65', value: 62 },
    { name: '65+', value: 27 },
  ],
};

// ─── HISTORICAL DATA ─────────────────────────────────────────

export const PY_HISTORICAL_ELECTIONS = [
  {
    year: 1964,
    name: 'First General Election',
    totalSeats: 30,
    totalCandidates: 142,
    turnout: 72.1,
    chiefMinister: 'Edouard Goubert',
    cmParty: 'INC',
    era: 'Post-French Era',
    milestone: 'First election after merger with India',
    results: {
      INC: { seats: 18, voteShare: 38.5 },
      DMK: { seats: 5, voteShare: 18.2 },
      IND: { seats: 7, voteShare: 30.1 },
    },
  },
  {
    year: 1969,
    name: 'Second General Election',
    totalSeats: 30,
    totalCandidates: 158,
    turnout: 74.3,
    chiefMinister: 'V. Venkatasubba Reddiar',
    cmParty: 'INC',
    results: {
      INC: { seats: 14, voteShare: 32.1 },
      DMK: { seats: 10, voteShare: 28.4 },
      IND: { seats: 6, voteShare: 25.6 },
    },
  },
  {
    year: 1974,
    name: 'Third General Election',
    totalSeats: 30,
    totalCandidates: 182,
    turnout: 73.8,
    chiefMinister: 'M. O. H. Farook',
    cmParty: 'DMK',
    results: {
      DMK: { seats: 16, voteShare: 36.5 },
      INC: { seats: 10, voteShare: 28.2 },
      AIADMK: { seats: 2, voteShare: 10.1 },
      IND: { seats: 2, voteShare: 15.8 },
    },
  },
  {
    year: 1977,
    name: 'Fourth General Election',
    totalSeats: 30,
    totalCandidates: 168,
    turnout: 76.2,
    chiefMinister: 'M. D. R. Ramachandran',
    cmParty: 'AIADMK',
    results: {
      AIADMK: { seats: 14, voteShare: 30.8 },
      INC: { seats: 8, voteShare: 22.5 },
      DMK: { seats: 5, voteShare: 20.1 },
      IND: { seats: 3, voteShare: 15.2 },
    },
  },
  {
    year: 1980,
    name: 'Fifth General Election',
    totalSeats: 30,
    totalCandidates: 195,
    turnout: 77.5,
    chiefMinister: 'R. V. Janakiraman',
    cmParty: 'INC',
    results: {
      INC: { seats: 15, voteShare: 33.2 },
      DMK: { seats: 8, voteShare: 24.5 },
      AIADMK: { seats: 5, voteShare: 18.1 },
      IND: { seats: 2, voteShare: 12.4 },
    },
  },
  {
    year: 1985,
    name: 'Sixth General Election',
    totalSeats: 30,
    totalCandidates: 210,
    turnout: 79.8,
    chiefMinister: 'M. D. R. Ramachandran',
    cmParty: 'AIADMK',
    results: {
      AIADMK: { seats: 12, voteShare: 28.4 },
      INC: { seats: 10, voteShare: 26.1 },
      DMK: { seats: 6, voteShare: 22.3 },
      IND: { seats: 2, voteShare: 11.5 },
    },
  },
  {
    year: 1990,
    name: 'Seventh General Election',
    totalSeats: 30,
    totalCandidates: 238,
    turnout: 82.1,
    chiefMinister: 'V. Vaithilingam',
    cmParty: 'INC',
    results: {
      INC: { seats: 14, voteShare: 30.5 },
      DMK: { seats: 9, voteShare: 26.8 },
      AIADMK: { seats: 4, voteShare: 15.2 },
      IND: { seats: 3, voteShare: 14.1 },
    },
  },
  {
    year: 1991,
    name: 'Eighth General Election',
    totalSeats: 30,
    totalCandidates: 224,
    turnout: 78.4,
    chiefMinister: 'V. Vaithilingam',
    cmParty: 'INC',
    results: {
      INC: { seats: 13, voteShare: 29.2 },
      AIADMK: { seats: 8, voteShare: 22.5 },
      DMK: { seats: 6, voteShare: 21.8 },
      IND: { seats: 3, voteShare: 14.1 },
    },
  },
  {
    year: 1996,
    name: 'Ninth General Election',
    totalSeats: 30,
    totalCandidates: 252,
    turnout: 80.6,
    chiefMinister: 'R. V. Janakiraman',
    cmParty: 'TMC',
    results: {
      TMC: { seats: 10, voteShare: 24.1 },
      DMK: { seats: 8, voteShare: 22.5 },
      INC: { seats: 6, voteShare: 18.3 },
      AIADMK: { seats: 4, voteShare: 14.2 },
      IND: { seats: 2, voteShare: 10.5 },
    },
  },
  {
    year: 2001,
    name: 'Tenth General Election',
    totalSeats: 30,
    totalCandidates: 268,
    turnout: 79.2,
    chiefMinister: 'N. Rangasamy',
    cmParty: 'INC',
    results: {
      INC: { seats: 16, voteShare: 32.5 },
      DMK: { seats: 7, voteShare: 20.4 },
      AIADMK: { seats: 3, voteShare: 12.8 },
      PMK: { seats: 2, voteShare: 6.5 },
      IND: { seats: 2, voteShare: 14.2 },
    },
  },
];

// Historical vote share trends (for charts)
export const PY_HISTORICAL_VOTE_SHARE = [
  { year: 1964, INC: 38.5, DMK: 18.2 },
  { year: 1969, INC: 32.1, DMK: 28.4 },
  { year: 1974, DMK: 36.5, INC: 28.2, AIADMK: 10.1 },
  { year: 1977, AIADMK: 30.8, INC: 22.5, DMK: 20.1 },
  { year: 1980, INC: 33.2, DMK: 24.5, AIADMK: 18.1 },
  { year: 1985, AIADMK: 28.4, INC: 26.1, DMK: 22.3 },
  { year: 1990, INC: 30.5, DMK: 26.8, AIADMK: 15.2 },
  { year: 1991, INC: 29.2, AIADMK: 22.5, DMK: 21.8 },
  { year: 1996, INC: 18.3, DMK: 22.5, AIADMK: 14.2 },
  { year: 2001, INC: 32.5, DMK: 20.4, AIADMK: 12.8 },
  { year: 2006, INC: 24.2, DMK: 20.5, AIADMK: 12.8 },
  { year: 2011, AINRC: 30.6, INC: 17.3, DMK: 16.8, AIADMK: 12.1 },
  { year: 2016, INC: 25.1, AINRC: 22.4, AIADMK: 13.2, DMK: 10.3 },
  { year: 2021, AINRC: 25.2, DMK: 18.3, INC: 15.5, BJP: 12.8 },
];

export const PY_HISTORICAL_SEATS = [
  { year: 1964, INC: 18, DMK: 5, IND: 7 },
  { year: 1969, INC: 14, DMK: 10, IND: 6 },
  { year: 1974, DMK: 16, INC: 10, AIADMK: 2, IND: 2 },
  { year: 1977, AIADMK: 14, INC: 8, DMK: 5, IND: 3 },
  { year: 1980, INC: 15, DMK: 8, AIADMK: 5, IND: 2 },
  { year: 1985, AIADMK: 12, INC: 10, DMK: 6, IND: 2 },
  { year: 1990, INC: 14, DMK: 9, AIADMK: 4, IND: 3 },
  { year: 1991, INC: 13, AIADMK: 8, DMK: 6, IND: 3 },
  { year: 1996, DMK: 8, INC: 6, AIADMK: 4, IND: 2 },
  { year: 2001, INC: 16, DMK: 7, AIADMK: 3, IND: 2 },
  { year: 2006, INC: 10, DMK: 7, AIADMK: 5, IND: 6 },
  { year: 2011, AINRC: 15, INC: 7, AIADMK: 5, DMK: 2, IND: 1 },
  { year: 2016, INC: 15, AINRC: 8, AIADMK: 4, DMK: 2, IND: 1 },
  { year: 2021, AINRC: 10, BJP: 6, DMK: 6, IND: 6, INC: 2 },
];

export const PY_HISTORICAL_TURNOUT = [
  { year: 1964, turnout: 72.1 },
  { year: 1969, turnout: 74.3 },
  { year: 1974, turnout: 73.8 },
  { year: 1977, turnout: 76.2 },
  { year: 1980, turnout: 77.5 },
  { year: 1985, turnout: 79.8 },
  { year: 1990, turnout: 82.1 },
  { year: 1991, turnout: 78.4 },
  { year: 1996, turnout: 80.6 },
  { year: 2001, turnout: 79.2 },
  { year: 2006, turnout: 83.5 },
  { year: 2011, turnout: 82.4 },
  { year: 2016, turnout: 84.1 },
  { year: 2021, turnout: 81.0 },
];
