import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductGrid } from '../product/ProductGrid';
import { getFeaturedProducts, Product } from '../../lib/supabase';

export function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFeaturedProducts(8)
      .then(setFeaturedProducts)
      .catch((err) => setError(err.message || 'Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="section-padding bg-ink-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand mb-2">
                Curated Picks
              </p>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-ink-900">
                Hand-picked for you
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-ink-200 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section-padding bg-ink-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-8">
            <p className="text-red-500 mb-2">Error loading products: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-brand underline"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="section-padding bg-ink-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand mb-2">
              Curated Picks
            </p>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-ink-900">
              Hand-picked for you
            </h2>
          </div>
          <Link
            to="/shop?featured=true"
            className="text-sm font-semibold text-brand hover:underline flex items-center gap-1 hidden sm:flex"
          >
            View all featured <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <ProductGrid
          products={featuredProducts}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        />

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/shop?featured=true"
            className="text-sm font-semibold text-brand hover:underline"
          >
            View all featured →
          </Link>
        </div>
      </div>
    </section>
  );
}
