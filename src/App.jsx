import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Sidebar from './components/Sidebar';

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

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
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
              <Route path="/ask" element={<AskPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <Analytics />
    </BrowserRouter>
  );
}
