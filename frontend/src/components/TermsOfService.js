import React from 'react';
import './LegalPages.css';

const TermsOfService = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last Updated: February 4, 2026</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using VlogClip AI ("the Service"), you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use our Service.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            VlogClip AI is an AI-powered video clip generation platform that helps content creators extract 
            highlight moments from YouTube videos for social media distribution. The Service includes:
          </p>
          <ul>
            <li>AI-powered video analysis and highlight detection</li>
            <li>Automatic clip generation optimized for social media platforms</li>
            <li>Caption and hashtag suggestions for multiple platforms</li>
            <li>Video processing and download capabilities</li>
          </ul>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <p>
            To use certain features of the Service, you must create an account. You are responsible for:
          </p>
          <ul>
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized use</li>
          </ul>
        </section>

        <section>
          <h2>4. Subscription Plans and Payments</h2>
          <p>
            VlogClip AI offers the following subscription plans:
          </p>
          <ul>
            <li><strong>Free Tier:</strong> Limited to 1 video per month and 3 clips per day</li>
            <li><strong>Creator Pro:</strong> Unlimited videos and clips with premium features</li>
            <li><strong>Business:</strong> All Pro features plus team collaboration and API access</li>
          </ul>
          <p>
            Paid subscriptions are billed monthly or annually. You may cancel at any time, and your 
            subscription will remain active until the end of the current billing period.
          </p>
        </section>

        <section>
          <h2>5. Acceptable Use</h2>
          <p>You agree not to use the Service to:</p>
          <ul>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on intellectual property rights of others</li>
            <li>Process content that you do not have rights to use</li>
            <li>Generate harmful, abusive, or inappropriate content</li>
            <li>Attempt to bypass usage limits or security measures</li>
            <li>Resell or redistribute the Service without authorization</li>
          </ul>
        </section>

        <section>
          <h2>6. Content and Intellectual Property</h2>
          <p>
            <strong>Your Content:</strong> You retain ownership of any content you upload or process through 
            our Service. By using the Service, you grant us a limited license to process your content solely 
            for providing the Service.
          </p>
          <p>
            <strong>YouTube Content:</strong> You are responsible for ensuring you have the right to process 
            any YouTube videos through our Service. We do not claim ownership of YouTube content and recommend 
            only processing videos you own or have explicit permission to use.
          </p>
          <p>
            <strong>Generated Clips:</strong> Clips generated through our Service are yours to use in accordance 
            with applicable copyright laws and YouTube's Terms of Service.
          </p>
        </section>

        <section>
          <h2>7. Limitation of Liability</h2>
          <p>
            VlogClip AI is provided "as is" without warranties of any kind. We are not liable for:
          </p>
          <ul>
            <li>Any indirect, incidental, or consequential damages</li>
            <li>Loss of data or business interruption</li>
            <li>Copyright claims arising from your use of processed content</li>
            <li>Service interruptions or technical issues</li>
          </ul>
          <p>
            Our total liability shall not exceed the amount paid by you for the Service in the 12 months 
            preceding the claim.
          </p>
        </section>

        <section>
          <h2>8. Termination</h2>
          <p>
            We may terminate or suspend your account at any time for violation of these Terms. Upon termination:
          </p>
          <ul>
            <li>Your right to use the Service will immediately cease</li>
            <li>We may delete your account data after 30 days</li>
            <li>Provisions that by nature should survive will remain in effect</li>
          </ul>
        </section>

        <section>
          <h2>9. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. We will notify you of significant changes by email 
            or through the Service. Continued use after changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2>10. Contact Information</h2>
          <p>
            For questions about these Terms, please contact us at:
          </p>
          <p>
            <strong>Email:</strong> vlogclipai@gmail.com<br />
            <strong>Website:</strong> https://vlogclipai.com
          </p>
        </section>

        <div className="back-link">
          <a href="/">← Back to Home</a>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
