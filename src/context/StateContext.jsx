import { createContext, useContext, useState, useCallback } from 'react';

const STATE_CONFIG = {
  TN: {
    code: 'TN',
    name: 'Tamil Nadu',
    shortName: 'TN',
    totalSeats: 234,
    majorityMark: 118,
    totalDistricts: 38,
    emblem: '/tnsec-emblem.png',
    electionCommissionURL: 'https://tnsec.tn.gov.in',
    electionCommissionName: 'TNSEC',
    pollingDate: '2026-04-23',
    pollingDateLabel: 'April 23, 2026',
    countingDate: '2026-05-13',
    countingDateLabel: 'May 13, 2026',
    yearRange: '1952–2026',
    type: 'State',
    accentColor: 'amber',
  },
  PY: {
    code: 'PY',
    name: 'Puducherry',
    shortName: 'Pondy',
    totalSeats: 30,
    majorityMark: 16,
    totalDistricts: 4,
    emblem: '/py-emblem.svg',
    electionCommissionURL: 'https://secpuducherry.gov.in',
    electionCommissionName: 'SEC Puducherry',
    pollingDate: '2026-04-09',
    pollingDateLabel: 'April 9, 2026',
    countingDate: '2026-05-04',
    countingDateLabel: 'May 4, 2026',
    yearRange: '1964–2026',
    type: 'Union Territory',
    accentColor: 'cyan',
  },
};

const StateContext = createContext();

export function StateProvider({ children }) {
  const [stateCode, setStateCode] = useState(() => {
    try {
      return localStorage.getItem('election-state') || 'TN';
    } catch {
      return 'TN';
    }
  });

  const switchState = useCallback((code) => {
    setStateCode(code);
    try { localStorage.setItem('election-state', code); } catch {}
  }, []);

  const config = STATE_CONFIG[stateCode] || STATE_CONFIG.TN;

  return (
    <StateContext.Provider value={{ stateCode, config, switchState, states: STATE_CONFIG }}>
      {children}
    </StateContext.Provider>
  );
}

export function useElectionState() {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error('useElectionState must be used within StateProvider');
  return ctx;
}

export { STATE_CONFIG };
