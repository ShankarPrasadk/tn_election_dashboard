import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const main = document.getElementById('main-content');
    if (!main) return;
    const onScroll = () => setVisible(main.scrollTop > 400);
    main.addEventListener('scroll', onScroll, { passive: true });
    return () => main.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-20 lg:bottom-6 left-4 z-30 p-3 glass rounded-full border border-amber-500/20 text-amber-400 hover:bg-amber-500/10 hover:scale-110 transition-all shadow-lg shadow-black/30"
      aria-label="Back to top"
    >
      <ArrowUp size={18} />
    </button>
  );
}
