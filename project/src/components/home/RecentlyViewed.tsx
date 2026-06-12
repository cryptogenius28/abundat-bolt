import { useRecentlyViewedStore } from '../../stores';
import { ProductRow } from '../product/ProductRow';

export function RecentlyViewed() {
  const items = useRecentlyViewedStore((state) => state.items);
  const recentProducts = items.slice(0, 8).map((item) => item.product);

  if (recentProducts.length === 0) return null;

  return (
    <section className="section-padding bg-ink-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-brand mb-2">
            Your History
          </p>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-ink-900">
            Recently Viewed
          </h2>
        </div>

        <ProductRow
          products={recentProducts}
          className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory"
        />
      </div>
    </section>
  );
}
