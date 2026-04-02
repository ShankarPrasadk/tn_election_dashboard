import { createContext, useContext, useState, useCallback } from 'react';

const TRANSLATIONS = {
  en: {
    // Nav
    'nav.dashboard': 'Dashboard',
    'nav.trends': 'Trends (1952–2026)',
    'nav.candidates': 'Candidates',
    'nav.news': 'Live News',
    'nav.development': 'Development',
    'nav.criminal': 'Criminal Records',
    'nav.constituency': 'My Constituency',
    'nav.map': 'Map',
    'nav.compare': 'Compare',
    'nav.ask': 'Ask',
    'nav.forecast': 'Forecast',
    'nav.results': 'Live Results',
    'nav.mla': 'MLA Tracker',
    'nav.finance': 'Campaign Finance',
    // Common
    'common.seats': 'Seats',
    'common.voteShare': 'Vote Share',
    'common.party': 'Party',
    'common.constituency': 'Constituency',
    'common.district': 'District',
    'common.candidate': 'Candidate',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.all': 'All',
    'common.export': 'Export',
    'common.share': 'Share',
    'common.source': 'Source',
    'common.loading': 'Loading...',
    'common.noResults': 'No results found',
    'common.majority': 'Majority',
    'common.winner': 'Winner',
    'common.leading': 'Leading',
    'common.trailing': 'Trailing',
    'common.margin': 'Margin',
    'common.total': 'Total',
    // Dashboard
    'dashboard.title': 'TN Election Dashboard',
    'dashboard.subtitle': 'Tamil Nadu Assembly Election 2026',
    'dashboard.countdown': 'Countdown to Election',
    'dashboard.days': 'Days',
    'dashboard.hours': 'Hours',
    'dashboard.minutes': 'Minutes',
    'dashboard.seconds': 'Seconds',
    'dashboard.totalCandidates': 'Total Candidates',
    'dashboard.totalConstituencies': 'Total Constituencies',
    'dashboard.totalVoters': 'Total Voters',
    'dashboard.criminalCases': 'With Criminal Cases',
    // Forecast
    'forecast.title': '2026 Election Forecast',
    'forecast.projectedWinner': 'Projected Winner',
    'forecast.winProbability': 'Win Probability',
    'forecast.seatProjection': 'Seat Projection',
    'forecast.methodology': 'Methodology & Disclaimer',
    // Constituency
    'constituency.findYour': 'Find Your Constituency',
    'constituency.setHome': 'Set as My Constituency',
    'constituency.yourConstituency': 'Your Constituency',
    // Results
    'results.title': 'Live Results',
    'results.counting': 'Counting in Progress',
    'results.declared': 'Results Declared',
    'results.pending': 'Counting Pending',
    'results.round': 'Round',
    // About pages
    'about.dataSources': 'Data Sources',
    'about.disclaimer': 'Disclaimer',
    'about.contact': 'Contact Us',
  },
  ta: {
    // Nav
    'nav.dashboard': 'டாஷ்போர்டு',
    'nav.trends': 'போக்குகள் (1952–2026)',
    'nav.candidates': 'வேட்பாளர்கள்',
    'nav.news': 'நேரடி செய்திகள்',
    'nav.development': 'வளர்ச்சி',
    'nav.criminal': 'குற்ற வழக்குகள்',
    'nav.constituency': 'என் தொகுதி',
    'nav.map': 'வரைபடம்',
    'nav.compare': 'ஒப்பீடு',
    'nav.ask': 'கேளுங்கள்',
    'nav.forecast': 'கணிப்பு',
    'nav.results': 'நேரடி முடிவுகள்',
    'nav.mla': 'சட்டமன்ற உறுப்பினர்',
    'nav.finance': 'தேர்தல் நிதி',
    // Common
    'common.seats': 'இடங்கள்',
    'common.voteShare': 'வாக்கு சதவீதம்',
    'common.party': 'கட்சி',
    'common.constituency': 'தொகுதி',
    'common.district': 'மாவட்டம்',
    'common.candidate': 'வேட்பாளர்',
    'common.search': 'தேடுங்கள்',
    'common.filter': 'வடிகட்டு',
    'common.all': 'அனைத்தும்',
    'common.export': 'ஏற்றுமதி',
    'common.share': 'பகிர்',
    'common.source': 'ஆதாரம்',
    'common.loading': 'ஏற்றுகிறது...',
    'common.noResults': 'முடிவுகள் இல்லை',
    'common.majority': 'பெரும்பான்மை',
    'common.winner': 'வெற்றியாளர்',
    'common.leading': 'முன்னிலை',
    'common.trailing': 'பின்தங்கி',
    'common.margin': 'வித்தியாசம்',
    'common.total': 'மொத்தம்',
    // Dashboard
    'dashboard.title': 'தமிழ்நாடு தேர்தல் டாஷ்போர்டு',
    'dashboard.subtitle': 'தமிழ்நாடு சட்டமன்றத் தேர்தல் 2026',
    'dashboard.countdown': 'தேர்தலுக்கு நேர எண்ணிக்கை',
    'dashboard.days': 'நாட்கள்',
    'dashboard.hours': 'மணி',
    'dashboard.minutes': 'நிமிடங்கள்',
    'dashboard.seconds': 'வினாடிகள்',
    'dashboard.totalCandidates': 'மொத்த வேட்பாளர்கள்',
    'dashboard.totalConstituencies': 'மொத்த தொகுதிகள்',
    'dashboard.totalVoters': 'மொத்த வாக்காளர்கள்',
    'dashboard.criminalCases': 'குற்ற வழக்குகள் உள்ளவர்கள்',
    // Forecast
    'forecast.title': '2026 தேர்தல் கணிப்பு',
    'forecast.projectedWinner': 'கணிக்கப்பட்ட வெற்றியாளர்',
    'forecast.winProbability': 'வெற்றி நிகழ்தகவு',
    'forecast.seatProjection': 'இட கணிப்பு',
    'forecast.methodology': 'முறையியல் & மறுப்பு',
    // Constituency
    'constituency.findYour': 'உங்கள் தொகுதியைக் கண்டறியுங்கள்',
    'constituency.setHome': 'என் தொகுதியாக அமை',
    'constituency.yourConstituency': 'உங்கள் தொகுதி',
    // Results
    'results.title': 'நேரடி முடிவுகள்',
    'results.counting': 'எண்ணிக்கை நடந்து கொண்டிருக்கிறது',
    'results.declared': 'முடிவுகள் அறிவிக்கப்பட்டன',
    'results.pending': 'எண்ணிக்கை நிலுவையில்',
    'results.round': 'சுற்று',
    // About pages
    'about.dataSources': 'தரவு ஆதாரங்கள்',
    'about.disclaimer': 'மறுப்பு',
    'about.contact': 'தொடர்பு கொள்ளுங்கள்',
  },
};

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    try { return localStorage.getItem('tn-election-locale') || 'en'; } catch { return 'en'; }
  });

  const switchLocale = useCallback((newLocale) => {
    setLocale(newLocale);
    try { localStorage.setItem('tn-election-locale', newLocale); } catch {}
  }, []);

  const t = useCallback((key) => {
    return TRANSLATIONS[locale]?.[key] || TRANSLATIONS.en[key] || key;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, switchLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export function LanguageToggle() {
  const { locale, switchLocale } = useI18n();

  return (
    <button
      onClick={() => switchLocale(locale === 'en' ? 'ta' : 'en')}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors border border-slate-600/30"
      title={locale === 'en' ? 'தமிழில் காண' : 'View in English'}
    >
      <span className="text-sm">{locale === 'en' ? 'த' : 'A'}</span>
      <span>{locale === 'en' ? 'தமிழ்' : 'English'}</span>
    </button>
  );
}
