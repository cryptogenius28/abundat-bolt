import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductRow } from '../product/ProductRow';
import { getOnSaleProducts, Product } from '../../lib/supabase';

export function FlashSale() {
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ hours, minutes, seconds });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getOnSaleProducts(8)
      .then(setSaleProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || saleProducts.length === 0) {
    return null;
  }

  return (
    <section className="bg-brand/5 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand mb-1">
              Today Only
            </p>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-ink-900 flex items-center gap-2">
              <span className="text-brand">Flash Sale</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="text-ink-500">Ends in:</span>
              <div className="flex items-center gap-1 bg-ink-900 text-white px-2 py-1 rounded">
                <span className="font-mono font-bold">{countdown.hours.toString().padStart(2, '0')}</span>
                <span>:</span>
                <span className="font-mono font-bold">{countdown.minutes.toString().padStart(2, '0')}</span>
                <span>:</span>
                <span className="font-mono font-bold">{countdown.seconds.toString().padStart(2, '0')}</span>
              </div>
            </div>
            <Link
              to="/shop?on_sale=true"
              className="text-sm font-semibold text-brand hover:underline flex items-center gap-1"
            >
              View all deals <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <ProductRow
          products={saleProducts}
          className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory"
        />
      </div>
    </section>
  );
}
