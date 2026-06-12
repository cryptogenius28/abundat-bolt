import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, Star, Package, Truck, Heart } from 'lucide-react';
import { useCartStore, useWishlistStore } from '../../stores';
import type { Product } from '../../lib/supabase';
import { Button } from '../ui/button';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [currentImage, setCurrentImage] = useState(0);

  const { addItem, openDrawer } = useCartStore();
  const { isWishlisted, toggleItem } = useWishlistStore();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedVariants({});
      setCurrentImage(0);
    }
  }, [product]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const isWished = isWishlisted(product.id);
  const discount = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem(product, quantity, selectedVariants);
    onClose();
    openDrawer();
  };

  const handleVariantSelect = (name: string, value: string) => {
    setSelectedVariants((prev) => ({ ...prev, [name]: value }));
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md hover:bg-ink-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Image section */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-ink-50 rounded-lg overflow-hidden">
              <img
                src={product.images[currentImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  -{discount}% OFF
                </span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImage === index
                        ? 'border-brand'
                        : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info section */}
          <div className="space-y-4">
            {/* Brand */}
            <p className="text-xs font-bold uppercase text-brand">
              {product.brand}
            </p>

            {/* Title */}
            <h2 className="text-xl font-heading font-bold text-ink-900">
              {product.title}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(product.rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-ink-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-ink-500">
                {product.rating} ({product.review_count} reviews)
              </span>
              <span className="text-sm text-ink-400">|</span>
              <span className="text-sm text-ink-500">SKU: {product.sku}</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-ink-900">
                ${(product.sale_price || product.price).toFixed(2)}
              </span>
              {product.sale_price && (
                <>
                  <span className="text-lg text-ink-400 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    Save ${(product.price - product.sale_price).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            {/* Fulfillment */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                product.fulfillment_type === 'warehouse'
                  ? 'bg-ink-900 text-white'
                  : 'bg-ink-100 text-ink-700'
              }`}
            >
              {product.fulfillment_type === 'warehouse' ? (
                <Package className="w-4 h-4" />
              ) : (
                <Truck className="w-4 h-4" />
              )}
              <span>
                {product.fulfillment_type === 'warehouse'
                  ? 'Ships from our warehouse — arrives in 2-3 days'
                  : 'Dropshipped — arrives in 3-7 business days'}
              </span>
            </div>

            {/* Stock status */}
            <p
              className={`text-sm font-medium ${
                product.stock_qty > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {product.stock_qty > 0
                ? `\u25CF In stock — ${product.stock_qty} available`
                : '\u25CB Out of stock'}
            </p>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                {product.variants.map((variant) => (
                  <div key={variant.name}>
                    <p className="text-sm font-medium text-ink-700 mb-2">
                      {variant.name}: {selectedVariants[variant.name] || 'Select'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {variant.options.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleVariantSelect(variant.name, option)}
                          className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                            selectedVariants[variant.name] === option
                              ? 'border-brand bg-brand/10 text-brand'
                              : 'border-ink-200 hover:border-brand text-ink-700'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm font-medium text-ink-700 mb-2">Quantity</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-ink-200 hover:border-brand transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.min(
                        product.stock_qty,
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    )
                  }
                  className="w-20 h-10 text-center border border-ink-200 rounded-lg focus:outline-none focus:border-brand"
                  max={product.stock_qty}
                  min={1}
                />
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock_qty, quantity + 1))
                  }
                  disabled={quantity >= product.stock_qty}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-ink-200 hover:border-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock_qty === 0}
                className="flex-1 bg-brand hover:bg-brand-600"
              >
                Add to Cart
              </Button>
              <Button
                variant="outline"
                onClick={() => toggleItem(product)}
                className={`flex-shrink-0 ${
                  isWished ? 'border-red-500 text-red-500' : ''
                }`}
              >
                <Heart className={`w-5 h-5 ${isWished ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* View full details */}
            <Link
              to={`/product/${product.id}`}
              onClick={onClose}
              className="block text-center text-sm text-brand hover:underline font-medium pt-2"
            >
              View Full Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
