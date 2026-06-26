import "../../styles/homepage.css";

import { useEffect } from "react";

import { useSupagenTheme } from "../../theme/use-supagen-theme";
import { Footer } from "./Footer";
import { HomepageNav } from "./HomepageNav";

export function PrivacyPage() {
  const { theme, cycleTheme } = useSupagenTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="homepage-root">
      <HomepageNav />
      <main className="legal-page">
        <div className="legal-page-inner">
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-updated">Last updated: February 18, 2026</p>

          <section className="legal-section">
            <h2>1. Introduction</h2>
            <p>
              Supagen ("we," "us," or "our") is committed to protecting your
              privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our
              platform, website, APIs, and related services (collectively, the
              "Service"). Please read this Privacy Policy carefully. By
              accessing or using the Service, you agree to the practices
              described herein.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Information We Collect</h2>
            <h3>2.1 Information You Provide</h3>
            <p>
              We may collect information that you voluntarily provide when using
              the Service, including:
            </p>
            <ul>
              <li>
                Account Information: Name, email address, company name, and
                other details you provide during registration.
              </li>
              <li>
                Payment Information: Billing address, payment method details,
                and transaction history processed through our third-party
                payment processors.
              </li>
              <li>
                Content: Prompts, templates, configurations, and other data you
                submit through the Service.
              </li>
              <li>
                Communications: Messages, feedback, and correspondence you send
                to us.
              </li>
            </ul>
            <h3>2.2 Information Collected Automatically</h3>
            <p>
              When you access the Service, we may automatically collect certain
              information, including:
            </p>
            <ul>
              <li>
                Usage Data: Information about how you interact with the Service,
                such as pages visited, features used, API calls made, and time
                spent on the platform.
              </li>
              <li>
                Device Information: Browser type, operating system, device
                identifiers, and screen resolution.
              </li>
              <li>
                Log Data: IP address, access times, referring URLs, and error
                logs.
              </li>
              <li>
                Cookies and Similar Technologies: We use cookies and similar
                tracking technologies to collect information.
              </li>
            </ul>
            <h3>2.3 Information from Third Parties</h3>
            <p>
              We may receive information about you from third-party sources,
              such as authentication providers, analytics services, or business
              partners, and combine it with other information we collect about
              you.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul>
              <li>
                Providing the Service: To operate, maintain, and improve the
                Service, including processing your requests and managing your
                Account.
              </li>
              <li>
                Personalization: To tailor the Service to your preferences and
                provide a better user experience.
              </li>
              <li>
                Communication: To send you service-related notices, updates,
                security alerts, and support messages.
              </li>
              <li>
                Analytics: To analyze usage patterns, monitor performance, and
                improve the Service.
              </li>
              <li>
                Security: To detect, prevent, and address fraud, abuse, and
                security issues.
              </li>
              <li>
                Compliance: To comply with legal obligations, enforce our Terms,
                and protect our rights.
              </li>
              <li>
                Marketing: With your consent, to send you promotional
                communications about new features, products, or services. You
                can opt out at any time.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. How We Share Your Information</h2>
            <p>
              We do not sell your personal information. We may share your
              information in the following circumstances:
            </p>
            <ul>
              <li>
                Service Providers: With trusted third-party vendors who assist
                us in operating the Service (e.g., hosting, payment processing,
                analytics, customer support). These providers are contractually
                obligated to protect your information.
              </li>
              <li>
                Business Transfers: In connection with a merger, acquisition,
                reorganization, or sale of assets, your information may be
                transferred to the successor entity.
              </li>
              <li>
                Legal Requirements: When required by law, regulation, legal
                process, or governmental request, or to protect our rights,
                privacy, safety, or property.
              </li>
              <li>
                With Your Consent: We may share your information with third
                parties when you have given us explicit consent to do so.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Data Retention</h2>
            <p>
              We retain your information for as long as your Account is active
              or as needed to provide the Service. We may also retain certain
              information as required by law, to resolve disputes, enforce our
              agreements, or for other legitimate business purposes. When your
              information is no longer needed, we will securely delete or
              anonymize it.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Data Security</h2>
            <p>
              We implement industry-standard technical, administrative, and
              organizational measures to protect your information against
              unauthorized access, alteration, disclosure, or destruction.
              However, no method of transmission over the internet or electronic
              storage is 100% secure. While we strive to protect your
              information, we cannot guarantee its absolute security.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Your Rights and Choices</h2>
            <p>
              Depending on your location, you may have the following rights
              regarding your personal information:
            </p>
            <ul>
              <li>
                Access: Request access to the personal information we hold about
                you.
              </li>
              <li>
                Correction: Request correction of inaccurate or incomplete
                information.
              </li>
              <li>
                Deletion: Request deletion of your personal information, subject
                to certain exceptions.
              </li>
              <li>
                Portability: Request a copy of your information in a structured,
                machine-readable format.
              </li>
              <li>
                Objection: Object to the processing of your information for
                certain purposes.
              </li>
              <li>
                Withdrawal of Consent: Withdraw your consent at any time where
                processing is based on consent.
              </li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at{" "}
              <a href="mailto:support@supagen.dev">support@supagen.dev</a>. We
              will respond to your request within a reasonable timeframe and in
              accordance with applicable law.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries
              other than your country of residence, where our servers and
              offices are located. These countries may have data protection laws
              that differ from those in your jurisdiction. We take appropriate
              safeguards to ensure that your information is protected in
              accordance with this Privacy Policy when transferred
              internationally.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Children's Privacy</h2>
            <p>
              The Service is not intended for individuals under the age of 18.
              We do not knowingly collect personal information from children. If
              we become aware that we have collected information from a child
              under 18, we will take steps to promptly delete such information.
              If you believe a child has provided us with personal information,
              please contact us.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Third-Party Links and Services</h2>
            <p>
              The Service may contain links to third-party websites, services,
              or integrations. We are not responsible for the privacy practices
              of these third parties. We encourage you to review the privacy
              policies of any third-party services you access through our
              Service.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of material changes by posting the updated Privacy
              Policy on our website and updating the "Last Updated" date. Your
              continued use of the Service after such changes constitutes
              acceptance of the updated Privacy Policy.
            </p>
          </section>

          <section className="legal-section">
            <h2>12. Contact Information</h2>
            <p>
              If you have any questions, concerns, or requests regarding this
              Privacy Policy, please contact us:
            </p>
            <ul>
              <li>
                Email:{" "}
                <a href="mailto:support@supagen.dev">support@supagen.dev</a>
              </li>
              <li>Website: supagen.dev</li>
            </ul>
          </section>
        </div>
      </main>
      <Footer theme={theme} onCycleTheme={cycleTheme} />
    </div>
  );
}
