import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../stores';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function CartDrawer() {
  const {
    items,
    drawerOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
    promoCode,
    applyPromoCode,
    removePromoCode,
    getSubtotal,
    getDiscount,
    getShipping,
    getTax,
    getTotal,
  } = useCartStore();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState(false);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(false);
    const success = applyPromoCode(promoInput);
    if (success) {
      setPromoInput('');
    } else {
      setPromoError(true);
    }
  };

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shipping = getShipping();
  const tax = getTax();
  const total = getTotal();

  if (!drawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={closeDrawer} />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl overflow-hidden flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-ink-100">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Cart ({items.length})
          </h2>
          <button
            onClick={closeDrawer}
            className="p-2 hover:bg-ink-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <ShoppingBag className="w-16 h-16 text-ink-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-ink-500 mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Button onClick={closeDrawer} asChild>
              <Link to="/shop">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${JSON.stringify(item.variants)}`}
                  className="flex gap-4 p-3 bg-ink-50 rounded-lg"
                >
                  <Link
                    to={`/product/${item.product.id}`}
                    onClick={closeDrawer}
                    className="flex-shrink-0"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.product.id}`}
                      onClick={closeDrawer}
                      className="font-medium text-sm line-clamp-2 hover:text-brand"
                    >
                      {item.product.title}
                    </Link>
                    {item.variants && Object.keys(item.variants).length > 0 && (
                      <p className="text-xs text-ink-500 mt-0.5">
                        {Object.entries(item.variants)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' • ')}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          item.product.fulfillment_type === 'warehouse'
                            ? 'bg-ink-900 text-white'
                            : 'bg-ink-200 text-ink-700'
                        }`}
                      >
                        {item.product.fulfillment_type === 'warehouse' ? 'WAREHOUSE' : 'DROPSHIP'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="p-1 hover:bg-ink-200 rounded transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.product.stock_qty}
                          className="p-1 hover:bg-ink-200 rounded transition-colors disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          $
                          {(
                            (item.product.sale_price || item.product.price) *
                            item.quantity
                          ).toFixed(2)}
                        </p>
                        {item.product.sale_price && (
                          <p className="text-xs text-ink-400 line-through">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo code */}
            <div className="p-4 border-t border-ink-100">
              {promoCode ? (
                <div className="flex items-center justify-between bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm">
                  <span>Code applied: {promoCode}</span>
                  <button
                    onClick={removePromoCode}
                    className="text-green-600 hover:text-green-800"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <Input
                    placeholder="Promo code"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className={promoError ? 'border-red-500' : ''}
                  />
                  <Button type="submit" variant="outline">
                    Apply
                  </Button>
                </form>
              )}
              {promoError && (
                <p className="text-xs text-red-500 mt-1">Invalid promo code</p>
              )}
            </div>

            {/* Summary */}
            <div className="p-4 border-t border-ink-100 space-y-2 bg-ink-50">
              <div className="flex justify-between text-sm">
                <span className="text-ink-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-ink-600">
                  Shipping
                  {shipping === 0 && subtotal >= 49 && (
                    <span className="text-green-600 ml-1">(Free)</span>
                  )}
                </span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-600">Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-ink-200">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-ink-100 space-y-2">
              <Button className="w-full" asChild>
                <Link to="/checkout" onClick={closeDrawer}>
                  Checkout
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/cart" onClick={closeDrawer}>
                  View Cart
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
