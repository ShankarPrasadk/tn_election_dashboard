import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CONSENT_KEY = 'tn-election-cookie-consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50 shadow-2xl">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 text-sm text-slate-300">
          <p>
            We use cookies to enhance your experience, serve personalized ads through Google AdSense,
            and analyze site traffic. By clicking "Accept All", you consent to our use of cookies.{' '}
            <Link to="/privacy" className="text-amber-400 hover:text-amber-300 underline">
              Privacy Policy
            </Link>
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg transition-colors"
          >
            Essential Only
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm font-medium text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
