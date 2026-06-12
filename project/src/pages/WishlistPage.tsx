import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlistStore, useCartStore } from '../stores';
import { ProductGrid } from '../components/product/ProductGrid';
import { Button } from '../components/ui/button';

export function WishlistPage() {
  const { items, clearAll } = useWishlistStore();
  const { addItem, openDrawer } = useCartStore();

  useEffect(() => {
    document.title = 'Wishlist | Abundant Merchandise';
  }, []);

  const moveAllToCart = () => {
    items.forEach((item) => {
      addItem(item.product, 1);
    });
    clearAll();
    openDrawer();
  };

  const products = items.map((item) => item.product);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center max-w-md mx-auto">
          <Heart className="w-16 h-16 text-ink-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your wishlist is empty</h1>
          <p className="text-ink-500 mb-6">
            Start adding items you love to your wishlist.
          </p>
          <Button asChild>
            <Link to="/shop">Explore Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">My Wishlist</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={moveAllToCart}>
            <ShoppingBag className="w-4 h-4 mr-2" />
            Add All to Cart
          </Button>
          <Button variant="ghost" onClick={clearAll}>
            Clear All
          </Button>
        </div>
      </div>

      <ProductGrid
        products={products}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
      />
    </div>
  );
}
