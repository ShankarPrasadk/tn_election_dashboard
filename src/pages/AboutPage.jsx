import { Link } from 'react-router-dom';
import { Mail, Globe, Shield, Database, BarChart3 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-white mb-2">About TN Election Dashboard</h1>
      <p className="text-sm text-slate-400 mb-8">
        India's most comprehensive Tamil Nadu election analytics platform
      </p>

      <div className="space-y-5 text-slate-300 text-sm leading-relaxed">
        {/* Mission */}
        <section className="glass rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
            <BarChart3 className="text-amber-400" size={20} />
            Our Mission
          </h2>
          <p>
            TN Election Dashboard is dedicated to promoting electoral transparency and informed
            voting in Tamil Nadu. We believe every voter deserves easy access to comprehensive,
            accurate data about their candidates and representatives.
          </p>
          <p className="mt-3">
            Our platform aggregates publicly available election data spanning from 1952 to 2026,
            presenting it through intuitive visualizations and analytics that make complex
            electoral data accessible to everyone.
          </p>
        </section>

        {/* What We Offer */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">What We Offer</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: 'Historical Trends', desc: 'Election results and party performance from 1952 to present, including seat counts, vote shares, and alliance dynamics.' },
              { title: 'Candidate Profiles', desc: 'Detailed profiles including criminal records, assets, education, and profession — all from official affidavit data.' },
              { title: 'Criminal Record Analysis', desc: 'Transparency data showing candidates with declared criminal cases, helping voters make informed choices.' },
              { title: 'Constituency Insights', desc: 'Deep-dive into each of 234 constituencies with candidate comparisons, historical winners, and demographic data.' },
              { title: 'Development Indicators', desc: 'District-level development data including HDI, literacy rates, healthcare access, and infrastructure metrics.' },
              { title: 'Live News', desc: 'Curated election news from verified sources to keep voters updated on the latest developments.' },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                <h3 className="font-medium text-amber-400 mb-1">{title}</h3>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Data Sources */}
        <section className="glass rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
            <Database className="text-amber-400" size={20} />
            Data Sources
          </h2>
          <p className="mb-3">
            All data on this platform is sourced from official and publicly available records:
          </p>
          <ul className="space-y-2">
            {[
              { name: 'Election Commission of India (ECI)', url: 'https://www.eci.gov.in', desc: 'Official election results and candidate affidavits' },
              { name: 'Tamil Nadu State Election Commission', url: 'https://tnsec.tn.gov.in', desc: 'State-level election data and notifications' },
              { name: 'ADR / myneta.info', url: 'https://myneta.info', desc: 'Candidate affidavit analysis and criminal records' },
              { name: 'ECI Affidavit Portal', url: 'https://affidavit.eci.gov.in', desc: 'Self-declared candidate affidavits for 2026' },
            ].map(({ name, url, desc }) => (
              <li key={name} className="flex items-start gap-2">
                <Globe size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 font-medium">
                    {name}
                  </a>
                  <span className="text-slate-500"> — {desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Independence */}
        <section className="bg-amber-500/5 rounded-xl p-6 border border-amber-500/20">
          <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
            <Shield className="text-amber-400" size={20} />
            Independence & Neutrality
          </h2>
          <p>
            TN Election Dashboard is an <strong className="text-white">independent, non-partisan</strong> platform.
            We are <strong className="text-white">not affiliated</strong> with any political party, government body,
            or election commission.
          </p>
          <p className="mt-3">
            Our goal is to present factual data without bias, enabling voters to make their own
            informed decisions. We do not endorse any candidate or party.
          </p>
        </section>

        {/* Contact */}
        <section className="glass rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
            <Mail className="text-amber-400" size={20} />
            Contact Us
          </h2>
          <p className="mb-4">
            Have questions, feedback, or data corrections? We'd love to hear from you.
          </p>
          <div className="space-y-3">
            <a
              href="mailto:tnelectiondashboard@proton.me"
              className="flex items-center gap-3 text-amber-400 hover:text-amber-300 transition-colors"
            >
              <Mail size={16} />
              tnelectiondashboard@proton.me
            </a>
          </div>
        </section>

        {/* Legal Links */}
        <section className="text-center space-y-2 pt-4">
          <div className="flex justify-center gap-6 text-sm">
            <Link to="/privacy" className="text-amber-400 hover:text-amber-300">Privacy Policy</Link>
            <Link to="/terms" className="text-amber-400 hover:text-amber-300">Terms of Service</Link>
          </div>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-slate-700/50 text-center">
        <Link to="/" className="text-amber-400 hover:text-amber-300 text-sm">
          &larr; Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
