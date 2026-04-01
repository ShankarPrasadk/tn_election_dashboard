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
            TN Election Dashboard is a free, publicly accessible, <strong className="text-white">community-driven</strong> platform
            that aggregates and presents publicly available information and analytics about Tamil Nadu
            state elections from 1952 to 2026. The Service acts as an <strong className="text-white">intermediary</strong> that
            compiles, organizes, and displays data from official public sources. The Service includes:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Election results and historical trends analysis</li>
            <li>Candidate profiles based on official affidavit data</li>
            <li>Criminal records declared by candidates in their own affidavits</li>
            <li>Asset and liability information from candidate affidavits</li>
            <li>Constituency-level analysis and comparison tools</li>
            <li>Development indicators for Tamil Nadu districts</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">3. Nature of Data & Public Records Disclaimer</h2>
          <p>
            <strong className="text-amber-400">All candidate data displayed on this platform originates from
            publicly available official government records and self-declared affidavits.</strong> This
            includes data from the Election Commission of India (ECI), Tamil Nadu State Election
            Commission (TNSEC), ECI Affidavit Portal (affidavit.eci.gov.in), and the Association for Democratic
            Reforms (ADR) / myneta.info.
          </p>
          <p className="mt-2">
            <strong className="text-white">Criminal record data</strong> is sourced entirely from candidates' own
            self-declarations in their election affidavits filed under Section 33A of the Representation
            of the People Act, 1951. This platform does not independently investigate, verify, or make
            any allegations against any candidate. We merely present data that candidates themselves have
            declared to the Election Commission.
          </p>
          <p className="mt-2">
            <strong className="text-white">Asset and liability data</strong> is sourced from candidates' self-declared
            affidavits filed with the Election Commission as mandated under Supreme Court orders (Union of
            India v. Association for Democratic Reforms, 2002).
          </p>
          <p className="mt-2">
            This platform exercises its <strong className="text-white">right to access, compile, and publish public
            records</strong> under Article 19(1)(a) of the Constitution of India (freedom of speech and
            expression) and the Right to Information Act, 2005. The Supreme Court of India has repeatedly
            affirmed voters' right to know about candidates' backgrounds (PUCL v. Union of India, 2003).
          </p>
          <p className="mt-2">
            This website is <strong className="text-white">not affiliated with</strong> any political party,
            government body, or election commission. It is an independent informational platform designed
            solely to promote electoral transparency and informed voting.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">4. Intermediary Status & Safe Harbor</h2>
          <p>
            This platform operates as an <strong className="text-white">intermediary</strong> within the meaning of
            Section 2(1)(w) of the Information Technology Act, 2000. We do not generate, create, or modify
            the underlying candidate data — we aggregate, compile, and present publicly available information
            from official government sources.
          </p>
          <p className="mt-2">
            In accordance with <strong className="text-white">Section 79 of the IT Act, 2000</strong> and the
            Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021,
            this platform shall not be liable for any third-party information, data, or content hosted or
            displayed, provided it acts in due diligence and upon receiving actual knowledge of any unlawful
            content, expeditiously removes or disables access to such content.
          </p>
          <p className="mt-2">
            If you believe any data displayed on this platform is inaccurate, outdated, or infringes upon
            your rights, please contact us using the information on our{' '}
            <Link to="/about" className="text-amber-400 hover:text-amber-300">About page</Link>.
            We will review and address legitimate concerns in accordance with applicable law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">5. Grievance Redressal & Takedown Procedure</h2>
          <p>
            In compliance with the Information Technology (Intermediary Guidelines and Digital Media Ethics
            Code) Rules, 2021, we maintain a grievance redressal mechanism:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>If any candidate or affected party believes data displayed about them is factually incorrect, they may contact us with supporting evidence (e.g., court orders, official ECI corrections)</li>
            <li>We will acknowledge the complaint within 24 hours and resolve it within 15 days</li>
            <li>If the concern relates to data accuracy, we will cross-verify with the original official source and update or remove the data accordingly</li>
            <li>Takedown requests must be accompanied by verifiable identity proof and specific identification of the disputed content</li>
          </ul>
          <p className="mt-2">
            Contact: <a href="mailto:tnelectiondashboard@proton.me" className="text-amber-400 hover:text-amber-300">tnelectiondashboard@proton.me</a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">6. Data Accuracy Disclaimer</h2>
          <p>
            <strong className="text-amber-400">Important:</strong> While we strive for accuracy, we
            do not guarantee that all information is complete, accurate, or up-to-date. Data may contain
            errors due to OCR processing, source data inconsistencies, or updates by the original sources
            after our last data sync.
          </p>
          <p className="mt-2">
            <strong className="text-white">This platform does not independently verify, investigate, or endorse
            any data.</strong> All information is presented "as-reported" from official public sources.
            Users should verify critical information from official government sources before making any
            decisions. In case of any discrepancy, data published by ECI/TNSEC should be treated as
            authoritative.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">7. Intellectual Property</h2>
          <p>
            The website design, code, visualizations, and analysis methodology are the intellectual
            property of TN Election Dashboard. The underlying election data is sourced from public
            government records and is in the public domain.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">8. Acceptable Use</h2>
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
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">9. Advertisements</h2>
          <p>
            This website displays advertisements through Google AdSense. These ads are served by
            third-party ad networks and may use cookies to personalize content. We do not control
            the content of these advertisements and are not responsible for the products or services
            advertised.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">10. Limitation of Liability</h2>
          <p>
            <strong className="text-white">TO THE MAXIMUM EXTENT PERMITTED BY LAW</strong>, TN Election Dashboard,
            its operators, contributors, and affiliates shall not be liable for any direct, indirect,
            incidental, special, consequential, or punitive damages arising from:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Your use of, or inability to use, this Service</li>
            <li>Any errors, inaccuracies, or omissions in the data presented</li>
            <li>Any decisions made based on the data displayed on this platform</li>
            <li>Any loss of reputation, business, or other damages claimed by any person whose public data is displayed</li>
            <li>Temporary unavailability or interruption of the Service</li>
          </ul>
          <p className="mt-2">
            The Service is provided <strong className="text-white">"AS IS" and "AS AVAILABLE"</strong> without
            warranties of any kind, either express or implied, including but not limited to implied warranties
            of merchantability, fitness for a particular purpose, accuracy, and non-infringement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">11. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless TN Election Dashboard and its operators from and
            against any claims, damages, losses, liabilities, costs, and expenses (including legal fees) arising
            from your use of the Service, your violation of these Terms, or your violation of any rights of a
            third party.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">12. Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites (ECI, TNSEC, myneta.info, etc.).
            These links are provided for convenience and reference only. We do not endorse or
            assume responsibility for the content of third-party websites.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">13. Modifications</h2>
          <p>
            We reserve the right to modify these Terms of Service at any time. Changes will be
            effective immediately upon posting to this page. Your continued use of the Service
            constitutes acceptance of the modified terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">14. Severability</h2>
          <p>
            If any provision of these Terms is found to be unenforceable or invalid, that provision
            shall be limited or eliminated to the minimum extent necessary so that these Terms shall
            otherwise remain in full force and effect.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">15. Governing Law & Jurisdiction</h2>
          <p>
            These Terms of Service shall be governed by and construed in accordance with the
            laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in
            Tamil Nadu, India. Before initiating any legal proceedings, parties agree to attempt
            resolution through mutual discussion and mediation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">16. Contact</h2>
          <p>
            For questions about these Terms of Service or to report data inaccuracies, please email{' '}
            <a href="mailto:tnelectiondashboard@proton.me" className="text-amber-400 hover:text-amber-300">tnelectiondashboard@proton.me</a>.
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
