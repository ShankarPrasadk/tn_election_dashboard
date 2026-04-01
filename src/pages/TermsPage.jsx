import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
      <p className="text-sm text-slate-400 mb-8">Last updated: April 2, 2026</p>

      <div className="prose prose-invert prose-slate max-w-none space-y-6 text-slate-300 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing and using the TN Election Dashboard website ("the Service"), you agree to
            be bound by these Terms of Service. If you do not agree to these terms, please do not
            use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">2. Description of Service</h2>
          <p>
            TN Election Dashboard is a free, publicly accessible platform that provides information
            and analytics about Tamil Nadu state elections from 1952 to 2026. The Service includes:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Election results and historical trends analysis</li>
            <li>Candidate profiles based on official affidavit data</li>
            <li>Criminal records declared by candidates in their affidavits</li>
            <li>Asset and liability information from candidate affidavits</li>
            <li>Constituency-level analysis and comparison tools</li>
            <li>Development indicators for Tamil Nadu districts</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">3. Data Accuracy and Disclaimer</h2>
          <p>
            The data presented on this platform is sourced from publicly available government records
            and databases including the Election Commission of India (ECI), Tamil Nadu State Election
            Commission (TNSEC), and the Association for Democratic Reforms (ADR) / myneta.info.
          </p>
          <p className="mt-2">
            <strong className="text-amber-400">Important:</strong> While we strive for accuracy, we
            do not guarantee that all information is complete, accurate, or up-to-date. Election data
            may be subject to corrections and updates by the original sources. Users should verify
            critical information from official government sources before making decisions.
          </p>
          <p className="mt-2">
            This website is <strong className="text-white">not affiliated with</strong> any
            political party, government body, or election commission. It is an independent informational
            platform designed to promote electoral transparency.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">4. Intellectual Property</h2>
          <p>
            The website design, code, visualizations, and analysis methodology are the intellectual
            property of TN Election Dashboard. The underlying election data is sourced from public
            government records.
          </p>
          <p className="mt-2">
            You may not reproduce, distribute, modify, or create derivative works from the content
            on this website without prior written consent, except for personal, non-commercial use
            such as sharing individual data points with proper attribution.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">5. Acceptable Use</h2>
          <p>You agree NOT to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Scrape, crawl, or extract data from this website using automated tools</li>
            <li>Use the data for AI/ML model training without authorization</li>
            <li>Attempt to interfere with the website's functionality or infrastructure</li>
            <li>Misrepresent data from this website or take it out of context</li>
            <li>Use the platform for any unlawful purpose</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">6. Advertisements</h2>
          <p>
            This website displays advertisements through Google AdSense. These ads are served by
            third-party ad networks and may use cookies to personalize content. We do not control
            the content of these advertisements and are not responsible for the products or services
            advertised.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">7. Limitation of Liability</h2>
          <p>
            TN Election Dashboard is provided "as is" without warranties of any kind, either express
            or implied. We shall not be liable for any direct, indirect, incidental, or consequential
            damages arising from your use of or inability to use this Service.
          </p>
          <p className="mt-2">
            We are not responsible for any decisions made based on the data presented on this platform.
            Users are encouraged to cross-verify information with official sources.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">8. Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites (ECI, TNSEC, myneta.info, etc.).
            These links are provided for convenience and reference only. We do not endorse or
            assume responsibility for the content of third-party websites.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">9. Modifications</h2>
          <p>
            We reserve the right to modify these Terms of Service at any time. Changes will be
            effective immediately upon posting to this page. Your continued use of the Service
            constitutes acceptance of the modified terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">10. Governing Law</h2>
          <p>
            These Terms of Service shall be governed by and construed in accordance with the
            laws of India. Any disputes shall be subject to the jurisdiction of the courts in
            Tamil Nadu, India.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">11. Contact</h2>
          <p>
            For questions about these Terms of Service, please visit our{' '}
            <Link to="/about" className="text-amber-400 hover:text-amber-300">About page</Link>.
          </p>
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
