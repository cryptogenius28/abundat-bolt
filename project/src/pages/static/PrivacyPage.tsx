import { useEffect } from 'react';

export function PrivacyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy | Abundant Merchandise';
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">
          Privacy Policy
        </h1>
        <p className="text-ink-600">Last updated: February 2024</p>
      </div>

      <div className="prose prose-ink max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
          <p className="text-ink-600 mb-4">
            We collect information you provide directly to us, such as when you create an account,
            make a purchase, subscribe to our newsletter, or contact us for support. This includes:
          </p>
          <ul className="list-disc pl-6 text-ink-600 space-y-2">
            <li>Name, email address, and contact information</li>
            <li>Billing and shipping addresses</li>
            <li>Payment information (processed securely through our payment providers)</li>
            <li>Order history and preferences</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p className="text-ink-600 mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-6 text-ink-600 space-y-2">
            <li>Process and fulfill your orders</li>
            <li>Send you order confirmations and shipping updates</li>
            <li>Respond to your inquiries and provide customer support</li>
            <li>Send marketing communications (with your consent)</li>
            <li>Improve our website and services</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. Information Sharing</h2>
          <p className="text-ink-600 mb-4">
            We do not sell, trade, or rent your personal information to third parties.
            We may share your information with:
          </p>
          <ul className="list-disc pl-6 text-ink-600 space-y-2">
            <li>Service providers who assist in our operations (payment processors, shipping carriers)</li>
            <li>Law enforcement when required by law</li>
            <li>Business partners with your consent</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. Data Security</h2>
          <p className="text-ink-600 mb-4">
            We implement industry-standard security measures to protect your personal information.
            This includes encryption, secure servers, and regular security audits. However, no
            method of transmission over the Internet is 100% secure.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. Cookies</h2>
          <p className="text-ink-600 mb-4">
            We use cookies and similar technologies to enhance your experience, analyze site traffic,
            and personalize content. You can control cookie settings through your browser preferences.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">6. Your Rights</h2>
          <p className="text-ink-600 mb-4">
            You have the right to access, correct, or delete your personal information.
            To exercise these rights, please contact us at{' '}
            <a href="mailto:privacy@abundantmerchandise.com" className="text-brand hover:underline">
              privacy@abundantmerchandise.com
            </a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">7. Contact Us</h2>
          <p className="text-ink-600">
            If you have questions about this Privacy Policy, please contact us at:
            <br />
            <br />
            Abundant Merchandise
            <br />
            123 Commerce Street
            <br />
            Reno, NV 89501
            <br />
            Email: <a href="mailto:privacy@abundantmerchandise.com" className="text-brand hover:underline">privacy@abundantmerchandise.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
