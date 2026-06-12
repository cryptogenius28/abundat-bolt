import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductGrid } from '../product/ProductGrid';
import { getNewArrivals, Product } from '../../lib/supabase';

export function NewArrivals() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNewArrivals(8)
      .then(setNewArrivals)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand mb-2">
                Fresh Drops
              </p>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-ink-900">
                Just Dropped
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-ink-100 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (newArrivals.length === 0) {
    return null;
  }

  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand mb-2">
              Fresh Drops
            </p>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-ink-900">
              Just Dropped
            </h2>
          </div>
          <Link
            to="/shop?sort=newest"
            className="text-sm font-semibold text-brand hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <ProductGrid
          products={newArrivals}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        />
      </div>
    </section>
  );
}
