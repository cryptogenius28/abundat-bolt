import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, Package, Truck, ShoppingBag, Star } from 'lucide-react';
import { useCartStore, useWishlistStore } from '../../stores';
import type { Product } from '../../lib/supabase';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const { addItem, openDrawer } = useCartStore();
  const { isWishlisted, toggleItem } = useWishlistStore();
  const isWished = isWishlisted(product.id);

  const discount = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    openDrawer();
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
  };

  const handleImageLoad = (index: number) => {
    if (index === 1 && isHovered) {
      setImageIndex(1);
    }
  };

  return (
    <div
      className="group relative bg-white border border-ink-200 rounded-xl overflow-hidden product-card-hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setImageIndex(0);
      }}
    >
      {/* Image area */}
      <Link
        to={`/product/${product.id}`}
        className="block relative aspect-square overflow-hidden"
      >
        {/* Primary image */}
        <img
          src={product.images[0]}
          alt={product.title}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            imageIndex === 0 ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
        />
        {/* Secondary image on hover */}
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt={product.title}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              imageIndex === 1 ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => handleImageLoad(1)}
          />
        )}

        {/* Sale badge */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discount}%
          </span>
        )}

        {/* Fulfillment badge */}
        <span
          className={`absolute top-3 right-12 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${
            product.fulfillment_type === 'warehouse'
              ? 'bg-ink-900 text-white'
              : 'bg-ink-200 text-ink-700'
          }`}
        >
          {product.fulfillment_type === 'warehouse' ? (
            <Package className="w-3 h-3" />
          ) : (
            <Truck className="w-3 h-3" />
          )}
          {product.fulfillment_type === 'warehouse' ? 'WAREHOUSE' : 'DROPSHIP'}
        </span>

        {/* Out of stock overlay */}
        {product.stock_qty === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-ink-900 font-semibold text-sm px-4 py-2 rounded-lg">
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isWished
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-ink-600 hover:bg-white hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`} />
        </button>

        {/* Quick view button */}
        {isHovered && product.stock_qty > 0 && (
          <button
            onClick={handleQuickView}
            className="absolute bottom-3 left-3 bg-white text-ink-900 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-brand hover:text-white transition-colors shadow-md"
          >
            <Eye className="w-4 h-4" />
            Quick View
          </button>
        )}

        {/* Add to cart button */}
        {isHovered && product.stock_qty > 0 && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 bg-brand text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 hover:bg-brand-600 transition-colors shadow-md"
          >
            <ShoppingBag className="w-4 h-4" />
            Add to Cart
          </button>
        )}
      </Link>

      {/* Info area */}
      <div className="p-4">
        {/* Brand */}
        <p className="text-xs font-bold uppercase text-brand mb-1">
          {product.brand}
        </p>

        {/* Title */}
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-ink-900 line-clamp-2 hover:text-brand transition-colors mb-2">
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= Math.round(product.rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-ink-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-ink-500 ml-1">
            ({product.review_count})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-ink-900">
            ${(product.sale_price || product.price).toFixed(2)}
          </span>
          {product.sale_price && (
            <span className="text-sm text-ink-400 line-through">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
