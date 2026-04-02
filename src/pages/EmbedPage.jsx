import { useState } from 'react';
import { Code, Copy, Check } from 'lucide-react';

const EMBED_OPTIONS = [
  { id: 'dashboard', label: 'Dashboard Overview', path: '/', width: 800, height: 600 },
  { id: 'forecast', label: 'Election Forecast', path: '/forecast', width: 700, height: 500 },
  { id: 'criminal', label: 'Criminal Records', path: '/criminal', width: 700, height: 500 },
  { id: 'trends', label: 'Historical Trends', path: '/trends', width: 800, height: 600 },
  { id: 'results', label: 'Live Results', path: '/results', width: 700, height: 500 },
];

const BASE_URL = 'https://tn-election-dashboard.vercel.app';

export default function EmbedPage() {
  const [selected, setSelected] = useState('forecast');
  const [copied, setCopied] = useState(false);

  const opt = EMBED_OPTIONS.find((o) => o.id === selected);
  const embedCode = `<iframe src="${BASE_URL}${opt.path}?embed=1" width="${opt.width}" height="${opt.height}" frameborder="0" style="border:1px solid #334155;border-radius:12px;overflow:hidden;" title="TN Election Dashboard — ${opt.label}" loading="lazy"></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Code className="text-amber-400" /> Embed Widget
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Embed TN Election Dashboard on your website, blog, or news platform
        </p>
      </div>

      {/* Widget Selector */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-white mb-3">Choose a widget</h3>
        <div className="flex flex-wrap gap-2">
          {EMBED_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                selected === opt.id ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-700/30 text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-white mb-3">Preview</h3>
        <div className="bg-slate-900 rounded-lg p-4 flex justify-center overflow-auto">
          <iframe
            src={`${BASE_URL}${opt.path}`}
            width={Math.min(opt.width, 700)}
            height={350}
            style={{ border: '1px solid #334155', borderRadius: 12 }}
            title={`Preview: ${opt.label}`}
            loading="lazy"
          />
        </div>
      </div>

      {/* Embed Code */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Embed Code</h3>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
          >
            {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy Code</>}
          </button>
        </div>
        <pre className="bg-slate-900 rounded-lg p-4 text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap break-all font-mono">
          {embedCode}
        </pre>
      </div>

      {/* Usage Note */}
      <div className="bg-slate-800/30 rounded-xl p-4 text-xs text-slate-400 space-y-1">
        <p><strong className="text-white">Free to use:</strong> You may embed these widgets on any website with attribution.</p>
        <p><strong className="text-white">Attribution:</strong> Please include a visible link back to tn-election-dashboard.vercel.app</p>
        <p><strong className="text-white">Responsive:</strong> Adjust width/height attributes to fit your layout.</p>
      </div>
    </div>
  );
}
