import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import CandidatesPage from './pages/CandidatesPage';
import CandidateProfilePage from './pages/CandidateProfilePage';
import ComparisonPage from './pages/ComparisonPage';
import CriminalPage from './pages/CriminalPage';
import DevelopmentPage from './pages/DevelopmentPage';
import TrendsPage from './pages/TrendsPage';
import AskPage from './pages/AskPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/candidates" element={<CandidatesPage />} />
            <Route path="/candidate/:id" element={<CandidateProfilePage />} />
            <Route path="/comparison" element={<ComparisonPage />} />
            <Route path="/criminal" element={<CriminalPage />} />
            <Route path="/development" element={<DevelopmentPage />} />
            <Route path="/trends" element={<TrendsPage />} />
            <Route path="/ask" element={<AskPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
