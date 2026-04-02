import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Sidebar from './components/Sidebar';
import NewsTicker from './components/NewsTicker';
import CookieConsent from './components/CookieConsent';
import { I18nProvider } from './i18n';
import { StateProvider } from './context/StateContext';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CandidatesPage = lazy(() => import('./pages/CandidatesPage'));
const CandidateProfilePage = lazy(() => import('./pages/CandidateProfilePage'));
const ComparisonPage = lazy(() => import('./pages/ComparisonPage'));
const CriminalPage = lazy(() => import('./pages/CriminalPage'));
const DevelopmentPage = lazy(() => import('./pages/DevelopmentPage'));
const TrendsPage = lazy(() => import('./pages/TrendsPage'));
const AskPage = lazy(() => import('./pages/AskPage'));
const ConstituencyPage = lazy(() => import('./pages/ConstituencyPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ForecastPage = lazy(() => import('./pages/ForecastPage'));
const LiveResultsPage = lazy(() => import('./pages/LiveResultsPage'));
const MLATrackerPage = lazy(() => import('./pages/MLATrackerPage'));
const CampaignFinancePage = lazy(() => import('./pages/CampaignFinancePage'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="relative">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-amber-400/30 border-t-amber-400" />
        <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-amber-400" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StateProvider>
    <I18nProvider>
    <BrowserRouter>
      <ScrollToTop />
      <NewsTicker />
      <div className="flex min-h-screen">
        <Sidebar />
        <main id="main-content" className="flex-1 p-4 lg:p-6 overflow-auto" role="main">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/candidates" element={<CandidatesPage />} />
              <Route path="/candidate/:id" element={<CandidateProfilePage />} />
              <Route path="/comparison" element={<ComparisonPage />} />
              <Route path="/criminal" element={<CriminalPage />} />
              <Route path="/development" element={<DevelopmentPage />} />
              <Route path="/trends" element={<TrendsPage />} />
              <Route path="/constituency" element={<ConstituencyPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/ask" element={<AskPage />} />
              <Route path="/forecast" element={<ForecastPage />} />
              <Route path="/results" element={<LiveResultsPage />} />
              <Route path="/mla-tracker" element={<MLATrackerPage />} />
              <Route path="/finance" element={<CampaignFinancePage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <CookieConsent />
      <Analytics />
    </BrowserRouter>
    </I18nProvider>
    </StateProvider>
  );
}
