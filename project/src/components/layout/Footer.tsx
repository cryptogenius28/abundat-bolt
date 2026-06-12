import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { getCategories, Category } from '../../lib/supabase';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-ink-900 text-white">
      {/* Newsletter section */}
      <div className="bg-brand">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-heading font-bold mb-1">
                Get 10% off your first order
              </h3>
              <p className="text-white/80 text-sm">
                Subscribe to our newsletter for exclusive deals and new arrivals.
              </p>
            </div>
            <div className="w-full md:w-auto">
              {subscribed ? (
                <div className="bg-white/20 rounded-lg px-6 py-3 text-sm font-medium">
                  Thanks for subscribing! Check your email for your discount code.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 md:w-80 px-4 py-3 rounded-lg text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-ink-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-ink-800 transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                >
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-heading font-bold leading-none">
                  Abundant
                </div>
                <div className="text-xs font-heading font-semibold text-brand uppercase tracking-wider leading-none mt-0.5">
                  MERCHANDISE
                </div>
              </div>
            </div>
            <p className="text-ink-400 text-sm mb-4">
              Your one-stop shop for quality products at unbeatable prices. Thousands of items across every category, all with fast shipping and easy returns.
            </p>
            <div className="space-y-2 text-sm text-ink-400">
              <a href="mailto:support@abundantmerchandise.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                support@abundantmerchandise.com
              </a>
              <a href="tel:1-800-MERCH" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
                1-800-MERCH (637-42)
              </a>
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>123 Commerce St<br />Reno, NV 89501</span>
              </p>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h4 className="font-semibold text-white mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/shop" className="text-ink-400 hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/category/${category.slug}`}
                    className="text-ink-400 hover:text-white transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Help */}
          <div>
            <h4 className="font-semibold text-white mb-4">Help</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/contact" className="text-ink-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-ink-400 hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-ink-400 hover:text-white transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link to="/track" className="text-ink-400 hover:text-white transition-colors">
                  Track My Order
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-ink-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-ink-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-ink-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-ink-400 hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
            </ul>

            {/* Social icons */}
            <div className="flex gap-3 mt-6">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-ink-800 rounded-lg flex items-center justify-center text-ink-400 hover:bg-brand hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-ink-800 rounded-lg flex items-center justify-center text-ink-400 hover:bg-brand hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.973H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-ink-800 rounded-lg flex items-center justify-center text-ink-400 hover:bg-brand hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-ink-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-ink-500 text-sm">
              © {new Date().getFullYear()} Abundant Merchandise. All rights reserved.
            </p>

            {/* Payment icons */}
            <div className="flex items-center gap-3">
              <div className="bg-white rounded px-2 py-1">
                <svg className="h-6" viewBox="0 0 50 16" fill="none">
                  <path d="M19.584 1.5H16.5L14.25 14.5H17.334L19.584 1.5Z" fill="#1434CB"/>
                  <path d="M27.75 1.5L24.5 10.25L24.084 8.084L22.916 2.584C22.75 1.834 22.166 1.5 21.5 1.5H16.334L16.25 1.75C16.25 1.75 17.5 2 18.916 2.916L21.666 14.5H25L31.5 1.5H27.75Z" fill="#1434CB"/>
                  <path d="M47.5 1.5H44.584C43.916 1.5 43.334 1.834 43.084 2.416L38.25 14.5H41.584L42.25 12.666H46.334L46.75 14.5H49.75L47.5 1.5ZM43.25 10L45.084 4.916L46.084 10H43.25Z" fill="#1434CB"/>
                  <path d="M12.834 1.5L9.75 10.75L9.25 8.416L7.584 2.584C7.416 1.834 6.834 1.5 6.166 1.5H1L0.916 1.75C0.916 1.75 2.5 2.084 4.334 3.25L7.084 14.5H10.5L16.166 1.5H12.834Z" fill="#1434CB"/>
                </svg>
              </div>
              <div className="bg-white rounded px-2 py-1">
                <svg className="h-6" viewBox="0 0 38 24" fill="none">
                  <circle cx="15" cy="12" r="7" fill="#EB001B"/>
                  <circle cx="23" cy="12" r="7" fill="#F79E1B"/>
                  <path d="M19 6.5a7 7 0 010 11 7 7 0 000-11z" fill="#FF5F00"/>
                </svg>
              </div>
              <div className="bg-white rounded px-2 py-1">
                <svg className="h-6" viewBox="0 0 38 24" fill="none">
                  <rect width="38" height="24" rx="4" fill="#006FCF"/>
                  <path d="M9 12l3-6h3l-3 6 3 6h-3l-3-6zm0 0" fill="white"/>
                  <path d="M15 6h3l6 12h-3l-6-12z" fill="white"/>
                </svg>
              </div>
              <div className="bg-white rounded px-2 py-1">
                <svg className="h-6" viewBox="0 0 38 24" fill="none">
                  <rect width="38" height="24" rx="4" fill="#003087"/>
                  <path d="M14 7h-5l-1 7h3c2 0 4-1 4-3.5S16 7 14 7z" fill="white"/>
                  <path d="M20 7h3l2 7h-3l-2-7z" fill="white"/>
                </svg>
              </div>
              <div className="bg-white rounded px-2 py-1">
                <svg className="h-6" viewBox="0 0 38 24" fill="none">
                  <rect width="38" height="24" rx="4" fill="black"/>
                  <path d="M27 12l-3-5h-3l5 10 5-10h-3l-1 5zm-12-5h7v2h-4v1h4v2h-4v1h4v2h-7v-8z" fill="white"/>
                </svg>
              </div>
              <div className="bg-white rounded px-2 py-1">
                <svg className="h-6" viewBox="0 0 38 24" fill="none">
                  <rect width="38" height="24" rx="4" fill="black"/>
                  <path d="M9 9h6v6H9V9z" fill="#F89820"/>
                  <text x="18" y="15" fill="white" fontSize="8" fontWeight="bold">G Pay</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
