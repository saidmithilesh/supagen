import "../../styles/homepage.css";

import { useEffect } from "react";

import { useSupagenTheme } from "../../theme/use-supagen-theme";
import { Footer } from "./Footer";
import { HomepageNav } from "./HomepageNav";

export function TermsPage() {
  const { theme, cycleTheme } = useSupagenTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="homepage-root">
      <HomepageNav />
      <main className="legal-page">
        <div className="legal-page-inner">
          <h1 className="legal-title">Terms &amp; Conditions</h1>
          <p className="legal-updated">Last updated: February 18, 2026</p>

          <section className="legal-section">
            <h2>1. Introduction</h2>
            <p>
              Welcome to Supagen. These Terms and Conditions ("Terms") govern
              your access to and use of the Supagen platform, website, APIs, and
              related services (collectively, the "Service"). By accessing or
              using the Service, you agree to be bound by these Terms. If you do
              not agree, you may not use the Service.
            </p>
            <p>
              Supagen reserves the right to modify these Terms at any time. We
              will notify you of material changes by posting the updated Terms
              on our website and updating the "Last Updated" date above. Your
              continued use of the Service after such changes constitutes
              acceptance of the revised Terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Definitions</h2>
            <ul>
              <li>
                "Account" means the account you create to access and use the
                Service.
              </li>
              <li>
                "Content" means any data, text, prompts, templates,
                configurations, or other materials you submit, upload, or
                transmit through the Service.
              </li>
              <li>
                "User" or "You" means any individual or entity that accesses or
                uses the Service.
              </li>
              <li>
                "We," "Us," or "Our" refers to Supagen and its affiliates.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Eligibility</h2>
            <p>
              You must be at least 18 years of age or the age of majority in
              your jurisdiction, whichever is greater, to use the Service. By
              using the Service, you represent and warrant that you meet this
              eligibility requirement. If you are using the Service on behalf of
              an organization, you represent that you have authority to bind
              that organization to these Terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Account Registration</h2>
            <p>
              To access certain features of the Service, you must create an
              Account. You agree to:
            </p>
            <ul>
              <li>
                Provide accurate, current, and complete information during
                registration.
              </li>
              <li>Maintain and promptly update your Account information.</li>
              <li>Keep your login credentials confidential and secure.</li>
              <li>
                Notify us immediately of any unauthorized access to or use of
                your Account.
              </li>
            </ul>
            <p>
              You are responsible for all activity that occurs under your
              Account, whether or not authorized by you.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Use of the Service</h2>
            <h3>5.1 Permitted Use</h3>
            <p>
              Subject to these Terms, we grant you a limited, non-exclusive,
              non-transferable, revocable license to access and use the Service
              for your internal business or personal purposes in accordance with
              any applicable plan or subscription.
            </p>
            <h3>5.2 Prohibited Use</h3>
            <p>You agree not to:</p>
            <ul>
              <li>
                Use the Service for any unlawful purpose or in violation of any
                applicable laws or regulations.
              </li>
              <li>
                Reverse engineer, decompile, disassemble, or otherwise attempt
                to derive the source code of the Service.
              </li>
              <li>
                Interfere with, disrupt, or overburden the Service or its
                infrastructure.
              </li>
              <li>
                Access or attempt to access another user's Account without
                authorization.
              </li>
              <li>
                Use the Service to transmit malware, spam, or any harmful or
                malicious content.
              </li>
              <li>
                Sublicense, resell, or redistribute the Service without our
                prior written consent.
              </li>
              <li>
                Circumvent or attempt to circumvent any access controls, rate
                limits, or usage restrictions.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. Intellectual Property</h2>
            <h3>6.1 Our Intellectual Property</h3>
            <p>
              The Service, including all software, design, text, graphics,
              logos, icons, and other materials, is owned by or licensed to
              Supagen and is protected by copyright, trademark, patent, and
              other intellectual property laws. Nothing in these Terms grants
              you any right, title, or interest in the Service except as
              expressly set forth herein.
            </p>
            <h3>6.2 Your Content</h3>
            <p>
              You retain ownership of the Content you submit through the
              Service. By submitting Content, you grant Supagen a worldwide,
              non-exclusive, royalty-free license to use, store, process, and
              display your Content solely as necessary to provide and improve
              the Service.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Data Privacy</h2>
            <p>
              Your use of the Service is also governed by our{" "}
              <a href="/privacy">Privacy Policy</a>, which is incorporated into
              these Terms by reference. Please review our Privacy Policy to
              understand how we collect, use, and protect your information.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Fees and Payment</h2>
            <p>
              Certain features of the Service may require payment of fees. If
              you subscribe to a paid plan:
            </p>
            <ul>
              <li>
                Fees are billed in advance on a recurring basis (monthly or
                annually) as specified in your plan.
              </li>
              <li>
                All fees are non-refundable unless otherwise stated or required
                by applicable law.
              </li>
              <li>
                You authorize us to charge your designated payment method for
                all applicable fees.
              </li>
              <li>
                We reserve the right to change our pricing at any time upon
                reasonable notice. Price changes will take effect at the
                beginning of your next billing cycle.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>9. Termination</h2>
            <h3>9.1 Termination by You</h3>
            <p>
              You may terminate your Account at any time by contacting us at{" "}
              <a href="mailto:support@supagen.dev">support@supagen.dev</a> or
              through the Account settings in the Service. Termination does not
              entitle you to a refund of any prepaid fees.
            </p>
            <h3>9.2 Termination by Us</h3>
            <p>
              We may suspend or terminate your access to the Service at any
              time, with or without cause, and with or without notice, including
              if we believe you have violated these Terms. Upon termination,
              your right to use the Service ceases immediately.
            </p>
            <h3>9.3 Effect of Termination</h3>
            <p>
              Upon termination, we may delete your Account and Content. We are
              not liable to you or any third party for any termination of your
              access to the Service. Sections that by their nature should
              survive termination will survive, including but not limited to
              intellectual property, disclaimers, indemnification, and
              limitations of liability.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Disclaimers</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
              WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR
              OTHERWISE. TO THE FULLEST EXTENT PERMITTED BY LAW, SUPAGEN
              DISCLAIMS ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
              NON-INFRINGEMENT, AND QUIET ENJOYMENT.
            </p>
            <p>
              We do not warrant that the Service will be uninterrupted,
              error-free, secure, or free of viruses or other harmful
              components. You use the Service at your own risk.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT
              SHALL SUPAGEN, ITS DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, OR
              AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO
              LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR IN
              CONNECTION WITH YOUR USE OF OR INABILITY TO USE THE SERVICE,
              REGARDLESS OF THE THEORY OF LIABILITY.
            </p>
            <p>
              OUR TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR
              RELATING TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNT
              YOU PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE EVENT
              GIVING RISE TO THE CLAIM, OR ONE HUNDRED DOLLARS ($100), WHICHEVER
              IS GREATER.
            </p>
          </section>

          <section className="legal-section">
            <h2>12. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Supagen and its
              officers, directors, employees, agents, and affiliates from and
              against any and all claims, damages, losses, liabilities, costs,
              and expenses (including reasonable attorneys' fees) arising out of
              or in connection with:
            </p>
            <ul>
              <li>Your use of the Service.</li>
              <li>Your violation of these Terms.</li>
              <li>Your violation of any rights of a third party.</li>
              <li>Your Content submitted through the Service.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>13. Governing Law &amp; Dispute Resolution</h2>
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of India, without regard to its conflict of law
              provisions. Any disputes arising out of or relating to these Terms
              or the Service shall be resolved exclusively in the courts located
              in Bengaluru, Karnataka, India, and you consent to the personal
              jurisdiction of such courts.
            </p>
          </section>

          <section className="legal-section">
            <h2>14. Third-Party Services</h2>
            <p>
              The Service may integrate with or contain links to third-party
              websites, services, or APIs. We are not responsible for the
              content, privacy practices, or terms of any third-party services.
              Your use of third-party services is at your own risk and subject
              to their respective terms and conditions.
            </p>
          </section>

          <section className="legal-section">
            <h2>15. Force Majeure</h2>
            <p>
              Supagen shall not be liable for any failure or delay in performing
              its obligations under these Terms where such failure or delay
              results from circumstances beyond its reasonable control,
              including but not limited to natural disasters, acts of
              government, internet or telecommunications failures, power
              outages, or labor disputes.
            </p>
          </section>

          <section className="legal-section">
            <h2>16. Severability</h2>
            <p>
              If any provision of these Terms is found to be invalid, illegal,
              or unenforceable, the remaining provisions shall continue in full
              force and effect. The invalid provision shall be modified to the
              minimum extent necessary to make it valid and enforceable while
              preserving its original intent.
            </p>
          </section>

          <section className="legal-section">
            <h2>17. Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy and any additional
              agreements you may enter into with Supagen, constitute the entire
              agreement between you and Supagen regarding the Service and
              supersede all prior agreements, understandings, and
              communications, whether written or oral.
            </p>
          </section>

          <section className="legal-section">
            <h2>18. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us:
            </p>
            <ul>
              <li>
                Email:{" "}
                <a href="mailto:support@supagen.dev">support@supagen.dev</a>
              </li>
              <li>Website: supagen.dev</li>
              <li>Location: Bengaluru, Karnataka, India</li>
            </ul>
          </section>
        </div>
      </main>
      <Footer theme={theme} onCycleTheme={cycleTheme} />
    </div>
  );
}
