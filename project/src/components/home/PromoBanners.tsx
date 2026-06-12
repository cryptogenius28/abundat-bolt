import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

export function PromoBanners() {
  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Left banner - workspace picks */}
          <div className="md:col-span-2 relative h-64 md:h-72 rounded-xl overflow-hidden bg-ink-900">
            <img
              src="https://images.unsplash.com/photo-1518455027356-5a4c5c5b2b1d?w=1200&q=80"
              alt="Workspace"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-900/90 to-transparent" />
            <div className="absolute inset-0 flex items-center p-8">
              <div className="max-w-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-brand mb-2">
                  New Arrivals
                </p>
                <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4">
                  Fresh Workspace Picks
                </h3>
                <Button asChild>
                  <Link to="/category/electronics">Shop Now</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Right banner - account signup */}
          <div className="relative h-64 md:h-72 rounded-xl overflow-hidden bg-brand">
            <div className="absolute inset-0 bg-gradient-to-br from-brand to-brand-700" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-white/80 mb-1">
                Member Benefits
              </p>
              <h3 className="text-2xl font-heading font-bold text-white mb-2">
                Save 10%
              </h3>
              <p className="text-sm text-white/80 mb-4">
                Create an account for exclusive deals
              </p>
              <Button asChild variant="outline" className="bg-white text-brand border-white hover:bg-white/90">
                <Link to="/register">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
