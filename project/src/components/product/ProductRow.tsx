import { useState } from 'react';
import { ProductCard } from './ProductCard';
import { QuickViewModal } from './QuickViewModal';
import type { Product } from '../../lib/supabase';

interface ProductRowProps {
  products: Product[];
  className?: string;
}

export function ProductRow({ products, className }: ProductRowProps) {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  return (
    <>
      <div className={className}>
        {products.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-64 snap-start">
            <ProductCard
              product={product}
              onQuickView={setQuickViewProduct}
            />
          </div>
        ))}
      </div>
      <QuickViewModal
        product={quickViewProduct}
        isOpen={quickViewProduct !== null}
        onClose={() => setQuickViewProduct(null)}
      />
    </>
  );
}
