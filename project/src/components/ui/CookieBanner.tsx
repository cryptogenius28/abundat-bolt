import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from './button';

const COOKIE_KEY = 'am_cookie_consent';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem(COOKIE_KEY);
  });

  const handleAccept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:max-w-md bg-ink-900 text-white rounded-lg shadow-xl p-4 z-40">
      <div className="flex gap-3 pr-6">
        <p className="text-sm flex-1">
          We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.{' '}
          <Link to="/privacy" className="underline hover:text-brand">
            Learn more
          </Link>
        </p>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <Button size="sm" onClick={handleAccept} className="bg-brand hover:bg-brand-600">
          Accept all
        </Button>
        <Button size="sm" variant="outline" onClick={handleClose} className="text-white border-white/30 hover:bg-white/10">
          Close
        </Button>
      </div>
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
