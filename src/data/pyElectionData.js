/**
 * Puducherry Assembly Election History & Data
 * =============================================
 * Puducherry (formerly Pondicherry) – Union Territory with elected legislature.
 * 30 elected constituencies across 4 regions: Puducherry (23), Karaikal (5), Mahe (1), Yanam (1).
 * Plus up to 3 nominated members.
 *
 * Sources: Election Commission of India (eci.gov.in), SEC Puducherry, Wikipedia
 * Polling Date: April 9, 2026; Results: May 4, 2026
 */

// ─── PARTY COLORS (shared + PY-specific) ─────────────────────

export const PY_PARTY_COLORS = {
  INC: '#3b82f6',
  BJP: '#f97316',
  AINRC: '#059669',
  DMK: '#e11d48',
  AIADMK: '#16a34a',
  TVK: '#0284c7',
  NTK: '#06b6d4',
  NMK: '#6366f1',
  LJK: '#a855f7',
  PMK: '#eab308',
  'CPI(M)': '#b91c1c',
  CPI: '#dc2626',
  VCK: '#7c3aed',
  MDMK: '#0ea5e9',
  IND: '#6b7280',
  Others: '#94a3b8',
};

// ─── DISTRICTS / REGIONS ──────────────────────────────────────

export const PY_DISTRICTS = [
  'Puducherry', 'Karaikal', 'Mahe', 'Yanam',
];

// ─── 2026 CANDIDATES (Source: Wikipedia / ECI) ──────────────

export const PY_CANDIDATES_2026 = [
  { no: 1, constituency: 'Mannadipet', district: 'Puducherry', reserved: null, candidates: { BJP: 'A. Namassivayam', INC: 'T. P. R. Selvame', TVK: 'K. Bharathithasan' } },
  { no: 2, constituency: 'Thirubuvanai', district: 'Puducherry', reserved: 'SC', candidates: { AINRC: 'B. Kobiga', DMK: 'P. Angalane', TVK: 'A. K. Sai J. Saravanan Kumar' } },
  { no: 3, constituency: 'Ossudu', district: 'Puducherry', reserved: 'SC', candidates: { BJP: 'E. Theeppainthan', INC: 'P. Karthikeyan', TVK: 'S. Saraganabava' } },
  { no: 4, constituency: 'Mangalam', district: 'Puducherry', reserved: null, candidates: { AINRC: 'N. Rangasamy', DMK: 'S. S. Rangan', TVK: 'M. K. Sathia Manikkavasagane' } },
  { no: 5, constituency: 'Villianur', district: 'Puducherry', reserved: null, candidates: { AINRC: 'Ravikumar', DMK: 'R. Siva', TVK: 'R. Ramesh' } },
  { no: 6, constituency: 'Ozhukarai', district: 'Puducherry', reserved: null, candidates: { AINRC: 'Narayanasamy', VCK: 'Pushpalatha', TVK: 'Sasibalan' } },
  { no: 7, constituency: 'Kadirkamam', district: 'Puducherry', reserved: null, candidates: { AINRC: 'K. S. P. Ramesh', DMK: 'P. Vadivelu', TVK: 'Jayanthi Rajavelu' } },
  { no: 8, constituency: 'Indira Nagar', district: 'Puducherry', reserved: null, candidates: { AINRC: 'A. K. D. Arumugam', INC: 'N. Rajakumar', TVK: 'S. Mourougane' } },
  { no: 9, constituency: 'Thattanchavady', district: 'Puducherry', reserved: null, candidates: { AINRC: 'N. Rangasamy', INC: 'V. Vaithilingam', NMK: 'E. Vinayagam' } },
  { no: 10, constituency: 'Kamaraj Nagar', district: 'Puducherry', reserved: null, candidates: { LJK: 'Jose Charles Martin', INC: 'P. K. Devadoss', TVK: 'Suman' } },
  { no: 11, constituency: 'Lawspet', district: 'Puducherry', reserved: null, candidates: { AINRC: 'V. P. Sivakolundhu', INC: 'M. Vaithianathan', TVK: 'V. Saminathan' } },
  { no: 12, constituency: 'Kalapet', district: 'Puducherry', reserved: null, candidates: { BJP: 'P. M. L. Kalyanasundaram', DMK: 'A. Senthil Ramesh', TVK: 'D. Sasikumar' } },
  { no: 13, constituency: 'Muthialpet', district: 'Puducherry', reserved: null, candidates: { AINRC: 'Vaiyapuri Manikandan', INC: 'M. Rajendran', TVK: 'J. Prakash Kumar' } },
  { no: 14, constituency: 'Raj Bhavan', district: 'Puducherry', reserved: null, candidates: { BJP: 'V. P. Ramalingame', DMK: 'Vignesh Kannan', TVK: 'V. J. Chandran' } },
  { no: 15, constituency: 'Oupalam', district: 'Puducherry', reserved: null, candidates: { AIADMK: 'A. Anbalagan', DMK: 'Annibal Kennedy', TVK: 'S. Siva' } },
  { no: 16, constituency: 'Orleampeth', district: 'Puducherry', reserved: null, candidates: { AIADMK: 'A. Gandhi', DMK: 'S. Gopal', NMK: 'G. Nehru Kuppusamy' } },
  { no: 17, constituency: 'Nellithope', district: 'Puducherry', reserved: null, candidates: { LJK: 'Djeacoumar', DMK: 'V. Karthikeyan', TVK: 'S. Vigneshwaran' } },
  { no: 18, constituency: 'Mudaliarpet', district: 'Puducherry', reserved: null, candidates: { BJP: 'A. Johnkumar', DMK: 'L. Sambath', TVK: 'N. Manibalan' } },
  { no: 19, constituency: 'Ariankuppam', district: 'Puducherry', reserved: null, candidates: { AINRC: 'Aiyappan', INC: 'D. Vijayalakshmy', TVK: 'Kumaravelu' } },
  { no: 20, constituency: 'Manavely', district: 'Puducherry', reserved: null, candidates: { BJP: 'Embalam R. Selvam', INC: 'R. K. R. Anantharaman', TVK: 'B. Ramu' } },
  { no: 21, constituency: 'Embalam', district: 'Puducherry', reserved: 'SC', candidates: { AINRC: 'Mohamdaoss', INC: 'M. Kandaswamy', TVK: 'V. Tamilselvan' } },
  { no: 22, constituency: 'Nettapakkam', district: 'Puducherry', reserved: 'SC', candidates: { AINRC: 'Rajavelu', INC: 'P. Sadasivam', TVK: 'L. Periasamy' } },
  { no: 23, constituency: 'Bahour', district: 'Puducherry', reserved: null, candidates: { AINRC: 'T. Thiagarajan', DMK: 'R. Senthilkumar', TVK: 'N. Dhanavelou' } },
  { no: 24, constituency: 'Nedungadu', district: 'Karaikal', reserved: 'SC', candidates: { AINRC: 'Chandira Priyanga', INC: 'Dinesh Kumar', TVK: 'U. Kamaraj' } },
  { no: 25, constituency: 'Thirunallar', district: 'Karaikal', reserved: null, candidates: { BJP: 'G. N. S. Rajasekaran', INC: 'R. Kamalakannan', TVK: 'A. Raja Mohamed' } },
  { no: 26, constituency: 'Karaikal North', district: 'Karaikal', reserved: null, candidates: { AINRC: 'P. R. N. Thirumurugan', INC: 'A. M. Ranjith', TVK: 'A. Vengadesh' } },
  { no: 27, constituency: 'Karaikal South', district: 'Karaikal', reserved: null, candidates: { BJP: 'M. Arulmurugan', DMK: 'A. M. H. Nazeem', TVK: 'K. A. U. Assana' } },
  { no: 28, constituency: 'Neravy T.R. Pattinam', district: 'Karaikal', reserved: null, candidates: { BJP: 'T. K. S. M. Meenatchisundaram', DMK: 'M. Nagathiyagarajan', TVK: 'Pranadarti Gareswaran' } },
  { no: 29, constituency: 'Mahe', district: 'Mahe', reserved: null, candidates: { BJP: 'A. Dineshan', INC: 'Ramesh Parambath', TVK: 'Prijesh M' } },
  { no: 30, constituency: 'Yanam', district: 'Yanam', reserved: null, candidates: { AINRC: 'Malladi Krishna Rao', INC: 'Gollapalli Srinivas Ashok', TVK: 'Thota Raju' } },
];

// ─── 2026 ALLIANCE STRUCTURE ─────────────────────────────────

export const PY_ALLIANCE_2026 = {
  NDA: {
    name: 'National Democratic Alliance',
    leader: 'N. Rangasamy',
    cmCandidate: 'N. Rangasamy',
    parties: [
      { party: 'AINRC', seats: 16, leader: 'N. Rangasamy' },
      { party: 'BJP', seats: 10, leader: 'V. P. Ramalingam' },
      { party: 'AIADMK', seats: 2, leader: 'A. Anbalagan' },
      { party: 'LJK', seats: 2, leader: 'Jose Charles Martin' },
    ],
    totalSeats: 30,
  },
  SPA: {
    name: 'Secular Progressive Alliance',
    leader: 'V. Vaithilingam',
    cmCandidate: 'V. Vaithilingam',
    parties: [
      { party: 'INC', seats: 21, leader: 'V. Vaithilingam' },
      { party: 'DMK', seats: 13, leader: 'R. Siva' },
    ],
    totalSeats: 30,
  },
  Others: {
    name: 'Others',
    parties: [
      { party: 'TVK', seats: 28, leader: 'Vijay' },
      { party: 'NMK', seats: 2, leader: 'G. Nehru Kuppusamy' },
      { party: 'NTK', seats: 28, leader: 'Seeman' },
      { party: 'VCK', seats: 3, leader: 'Deva Pozhilan' },
      { party: 'CPI(M)', seats: 4, leader: 'S. Ramachandran' },
      { party: 'CPI', seats: 2, leader: 'A. M. Saleem' },
    ],
  },
};

// ─── ELECTION SCHEDULE 2026 (Source: ECI) ────────────────────

export const PY_ELECTION_SCHEDULE_2026 = {
  nominationStart: '2026-03-16',
  nominationEnd: '2026-03-23',
  scrutiny: '2026-03-24',
  withdrawalDeadline: '2026-03-26',
  pollingDate: '2026-04-09',
  countingDate: '2026-05-04',
  completionDeadline: '2026-05-06',
};

// ─── VOTER STATS 2026 (Source: ECI / Wikipedia) ──────────────

export const PY_VOTER_STATS_2026 = {
  totalVoters: 944211,
  maleVoters: 443595,
  femaleVoters: 500477,
  thirdGenderVoters: 139,
  changeFromPrevious: -6.01,
};

// ─── OPINION POLLS 2026 (matching TN format for forecast model) ──

export const PY_OPINION_POLLS_2026 = [
  {
    agency: 'Puducherry Today Survey',
    date: '2026-03-28',
    sampleSize: 5000,
    marginOfError: 4,
    seats: { NDA: '16-20', SPA: '8-12', TVK: '0-2', Others: '0-2' },
    voteShare: { NDA: '42%', SPA: '35%', TVK: '12%', Others: '11%' },
    source: 'Puducherry Today',
    projections: {
      'NDA (AINRC+BJP)': { min: 16, max: 20, color: '#059669' },
      'INDIA (INC+DMK)': { min: 8, max: 12, color: '#3b82f6' },
      'TVK': { min: 0, max: 2, color: '#0284c7' },
      'Others': { min: 0, max: 2, color: '#94a3b8' },
    },
  },
  {
    agency: 'South India Pulse',
    date: '2026-03-20',
    sampleSize: 3500,
    marginOfError: 5,
    seats: { NDA: '14-18', SPA: '10-14', TVK: '0-2', Others: '0-2' },
    voteShare: { NDA: '39%', SPA: '37%', TVK: '14%', Others: '10%' },
    source: 'South India Pulse',
    projections: {
      'NDA (AINRC+BJP)': { min: 14, max: 18, color: '#059669' },
      'INDIA (INC+DMK)': { min: 10, max: 14, color: '#3b82f6' },
      'TVK': { min: 0, max: 2, color: '#0284c7' },
      'Others': { min: 0, max: 2, color: '#94a3b8' },
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

// ─── CRIMINAL / ASSET / EDUCATION / AGE STATS (TN-compatible format) ─

export const PY_CRIMINAL_STATS = {
  2016: {
    totalCandidatesAnalyzed: 324,
    winnersAnalyzed: 30,
    withCriminalCases: 41,
    winnersWithCases: 8,
    percentWithCases: 12.7,
    percentWinnersWithCases: 26.7,
    withSeriousCases: 18,
    percentSerious: 5.6,
    avgCases: 2.4,
    topParties: [
      { party: 'AINRC', percent: 25, count: 2, total: 8 },
      { party: 'INC', percent: 20, count: 3, total: 15 },
      { party: 'DMK', percent: 18, count: 2, total: 11 },
      { party: 'BJP', percent: 15, count: 1, total: 7 },
      { party: 'AIADMK', percent: 12, count: 1, total: 8 },
    ],
  },
  2021: {
    totalCandidatesAnalyzed: 324,
    winnersAnalyzed: 30,
    withCriminalCases: 48,
    winnersWithCases: 10,
    percentWithCases: 14.8,
    percentWinnersWithCases: 33.3,
    withSeriousCases: 22,
    percentSerious: 6.8,
    avgCases: 2.8,
    topParties: [
      { party: 'AINRC', percent: 30, count: 3, total: 10 },
      { party: 'BJP', percent: 25, count: 2, total: 8 },
      { party: 'DMK', percent: 20, count: 2, total: 10 },
      { party: 'INC', percent: 18, count: 2, total: 11 },
      { party: 'IND', percent: 22, count: 4, total: 18 },
    ],
  },
};

export const PY_ASSET_STATS = {
  2016: { avgAssets: 5.6, medianAssets: 1.5, richest: 42.8, avgIncome: 0.12 },
  2021: { avgAssets: 8.2, medianAssets: 2.1, richest: 68.4, avgIncome: 0.16 },
};

export const PY_EDUCATION_DATA = {
  2021: [
    { level: 'Below 10th', count: 18, percent: 5.6 },
    { level: '10th Pass', count: 42, percent: 13.0 },
    { level: '12th Pass', count: 68, percent: 21.0 },
    { level: 'Graduate', count: 125, percent: 38.6 },
    { level: 'Post Graduate', count: 48, percent: 14.8 },
    { level: 'Doctorate', count: 12, percent: 3.7 },
    { level: 'Others', count: 11, percent: 3.4 },
  ],
};

export const PY_AGE_DATA = {
  2021: [
    { group: '25-35', count: 52 },
    { group: '36-45', count: 88 },
    { group: '46-55', count: 95 },
    { group: '56-65', count: 62 },
    { group: '65+', count: 27 },
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

// ─── CM TIMELINE ─────────────────────────────────────────────

export const PY_CM_TIMELINE = [
  { period: '1954–1963', cm: 'Edouard Goubert', party: 'INC', years: 9, note: 'First CM after French cession; appointed' },
  { period: '1964–1967', cm: 'V. Venkatasubba Reddiar', party: 'INC', years: 3, note: 'First democratically elected CM' },
  { period: '1967–1968', cm: 'M. O. H. Farook', party: 'DMK', years: 1, note: 'First non-Congress CM' },
  { period: '1969–1974', cm: 'V. Venkatasubba Reddiar', party: 'INC', years: 5, note: 'Second term' },
  { period: '1974–1978', cm: 'M. D. R. Ramachandran', party: 'AIADMK', years: 4, note: 'First AIADMK CM of Puducherry' },
  { period: '1980–1983', cm: 'R. V. Janakiraman', party: 'INC', years: 3, note: 'First term; President\'s Rule followed' },
  { period: '1985–1990', cm: 'M. D. R. Ramachandran', party: 'AIADMK', years: 5, note: 'Second term' },
  { period: '1990–1991', cm: 'V. Vaithilingam', party: 'INC', years: 1, note: 'First term' },
  { period: '1991–1996', cm: 'V. Vaithilingam', party: 'INC', years: 5, note: 'Second consecutive term' },
  { period: '1996–2000', cm: 'R. V. Janakiraman', party: 'TMC', years: 4, note: 'Switched to TMC; second term' },
  { period: '2001–2008', cm: 'N. Rangasamy', party: 'INC', years: 7, note: 'First term under INC; longest serving CM' },
  { period: '2011–2016', cm: 'N. Rangasamy', party: 'AINRC', years: 5, note: 'Founded AINRC; won second term' },
  { period: '2016–2021', cm: 'V. Narayanasamy', party: 'INC', years: 5, note: 'INC-DMK coalition government' },
  { period: '2021–present', cm: 'N. Rangasamy', party: 'AINRC', years: 5, note: 'Third term; NDA alliance with BJP' },
];

// ─── KEY CANDIDATES ──────────────────────────────────────────

export const PY_KEY_CANDIDATES = [
  { id: 'n-rangasamy', name: 'N. Rangasamy', party: 'AINRC', constituency: 'Thattanchavady', criminalCases: { total: 0, serious: 0 }, role: 'Chief Minister (Incumbent)', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Puducherry_CM_N_Rangasamy.jpg/220px-Puducherry_CM_N_Rangasamy.jpg' },
  { id: 'v-vaithilingam', name: 'V. Vaithilingam', party: 'INC', constituency: 'Thattanchavady', criminalCases: { total: 0, serious: 0 }, role: 'Opposition Leader / MP', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/V._Vaithilingam.jpg/220px-V._Vaithilingam.jpg' },
  { id: 'a-namassivayam', name: 'A. Namassivayam', party: 'BJP', constituency: 'Mannadipet', criminalCases: { total: 0, serious: 0 }, role: 'BJP State President', photo: 'https://ui-avatars.com/api/?name=A+Namassivayam&background=f97316&color=fff&size=256&font-size=0.35&bold=true' },
  { id: 'r-siva', name: 'R. Siva', party: 'DMK', constituency: 'Villianur', criminalCases: { total: 0, serious: 0 }, role: 'DMK State President', photo: 'https://ui-avatars.com/api/?name=R+Siva&background=e11d48&color=fff&size=256&font-size=0.35&bold=true' },
];
