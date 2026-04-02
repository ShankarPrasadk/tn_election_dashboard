import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import BottomNav from './components/BottomNav';
import BackToTop from './components/BackToTop';
import NewsTicker from './components/NewsTicker';
import CookieConsent from './components/CookieConsent';
import { ToastProvider } from './components/Toast';
import { I18nProvider } from './i18n';
import { StateProvider } from './context/StateContext';
import { ThemeProvider } from './context/ThemeContext';

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
const VoterDataPage = lazy(() => import('./pages/VoterDataPage'));
const StoriesPage = lazy(() => import('./pages/StoriesPage'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function PageLoader() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-48 bg-slate-700/50 rounded-lg" />
          <div className="h-4 w-32 bg-slate-700/30 rounded mt-2" />
        </div>
        <div className="h-9 w-24 bg-slate-700/30 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="glass rounded-xl p-4 space-y-3">
            <div className="h-4 w-20 bg-slate-700/40 rounded" />
            <div className="h-8 w-16 bg-slate-700/50 rounded" />
            <div className="h-3 w-full bg-slate-700/20 rounded" />
          </div>
        ))}
      </div>
      <div className="glass rounded-xl p-6 space-y-3">
        <div className="h-5 w-36 bg-slate-700/40 rounded" />
        <div className="h-48 bg-slate-700/20 rounded-xl" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
    <StateProvider>
    <I18nProvider>
    <ToastProvider>
    <BrowserRouter>
      <ScrollToTop />
      <NewsTicker />
      <TopNav />
      <div className="flex">
        <Sidebar />
        <main id="main-content" className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6 min-h-[calc(100vh-3.5rem)] overflow-auto" role="main">
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
              <Route path="/voters" element={<VoterDataPage />} />
              <Route path="/stories" element={<StoriesPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <BottomNav />
      <BackToTop />
      <CookieConsent />
      <Analytics />
    </BrowserRouter>
    </ToastProvider>
    </I18nProvider>
    </StateProvider>
    </ThemeProvider>
  );
}
