import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
      <p className="text-sm text-slate-400 mb-8">Last updated: April 2, 2026</p>

      <div className="prose prose-invert prose-slate max-w-none space-y-6 text-slate-300 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">1. Introduction</h2>
          <p>
            Welcome to TN Election Dashboard ("we", "our", "us"). We are committed to protecting
            your privacy and handling your data responsibly. This Privacy Policy explains what
            information we collect, how we use it, and your rights regarding your data when you
            visit our website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">2. Information We Collect</h2>
          <h3 className="text-lg font-medium text-slate-200 mt-4 mb-2">2.1 Automatically Collected Information</h3>
          <p>When you visit our website, we may automatically collect:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Browser type and version</li>
            <li>Device type (desktop, mobile, tablet)</li>
            <li>Pages visited and time spent on each page</li>
            <li>Referring website URLs</li>
            <li>Approximate geographic location (country/region level)</li>
            <li>IP address (anonymized where possible)</li>
          </ul>

          <h3 className="text-lg font-medium text-slate-200 mt-4 mb-2">2.2 Information You Provide</h3>
          <p>
            If you use our "Ask" feature, your questions are processed to generate responses.
            We do not store your questions or link them to your identity.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">3. How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Improve and optimize our website performance</li>
            <li>Understand how users interact with our content</li>
            <li>Display relevant advertisements through Google AdSense</li>
            <li>Analyze traffic patterns and usage trends</li>
            <li>Ensure the security and integrity of our website</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">4. Cookies and Tracking Technologies</h2>
          <p>We use cookies and similar technologies for the following purposes:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong className="text-white">Essential cookies:</strong> Required for the website to function properly</li>
            <li><strong className="text-white">Analytics cookies:</strong> Help us understand how visitors use our site (Vercel Analytics)</li>
            <li><strong className="text-white">Advertising cookies:</strong> Used by Google AdSense to serve relevant ads</li>
          </ul>
          <p className="mt-3">
            You can manage your cookie preferences through your browser settings. Disabling cookies
            may affect certain features of our website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">5. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>
              <strong className="text-white">Google AdSense:</strong> Serves advertisements on our site.
              Google may use cookies to personalize ads based on your browsing history.
              Learn more at{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300">
                Google's Privacy Policy
              </a>.
            </li>
            <li>
              <strong className="text-white">Vercel Analytics:</strong> Provides privacy-friendly website analytics
              without using cookies for tracking.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">6. Data Sources</h2>
          <p>
            All election data displayed on this website is sourced from publicly available government
            records and databases, including:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Election Commission of India (ECI) affidavit portal</li>
            <li>Tamil Nadu State Election Commission (TNSEC)</li>
            <li>Association for Democratic Reforms (ADR) / myneta.info</li>
            <li>Official election results from government sources</li>
          </ul>
          <p className="mt-2">
            Candidate information is sourced from self-declared affidavits and official election records.
            We do not collect personal data about voters.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">7. Data Retention</h2>
          <p>
            We retain automatically collected data for a reasonable period to improve our services.
            We do not store personally identifiable information beyond what is needed for website analytics.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">8. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Opt out of personalized advertising via Google's Ad Settings</li>
            <li>Disable cookies in your browser settings</li>
            <li>Request information about the data we have about you</li>
            <li>Use our site without creating an account</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">9. Children's Privacy</h2>
          <p>
            Our website is not intended for children under 13 years of age. We do not knowingly
            collect personal information from children.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted on this
            page with an updated revision date. We encourage you to review this page periodically.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please visit our{' '}
            <Link to="/about" className="text-amber-400 hover:text-amber-300">About page</Link>{' '}
            for contact information.
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
