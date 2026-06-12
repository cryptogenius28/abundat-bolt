import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../stores';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
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
    document.title = 'Shopping Cart | Abundant Merchandise';
  }, []);

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

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center max-w-md mx-auto">
          <ShoppingBag className="w-16 h-16 text-ink-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-ink-500 mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Button asChild>
            <Link to="/shop">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-heading font-bold mb-6">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.product.id}-${JSON.stringify(item.variants)}`}
              className="flex gap-4 p-4 bg-white border border-ink-200 rounded-xl"
            >
              <Link to={`/product/${item.product.id}`}>
                <img
                  src={item.product.images[0]}
                  alt={item.product.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <div>
                    <Link
                      to={`/product/${item.product.id}`}
                      className="font-medium text-ink-900 hover:text-brand"
                    >
                      {item.product.title}
                    </Link>
                    <p className="text-sm text-ink-500">{item.product.brand}</p>
                    {item.variants && Object.keys(item.variants).length > 0 && (
                      <p className="text-xs text-ink-400 mt-1">
                        {Object.entries(item.variants)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' | ')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-ink-400 hover:text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 border rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-2 hover:bg-ink-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.product.id, parseInt(e.target.value) || 1)
                      }
                      className="w-12 text-center border-x py-2 focus:outline-none"
                      min={1}
                      max={item.product.stock_qty}
                    />
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-2 hover:bg-ink-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-semibold">
                    ${((item.product.sale_price || item.product.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-ink-50 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-lg">Order Summary</h2>

            {/* Promo code */}
            {promoCode ? (
              <div className="flex items-center justify-between bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm">
                <span>Promo: {promoCode}</span>
                <button onClick={removePromoCode} className="hover:underline">
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
                <Button type="submit" variant="outline" size="sm">
                  Apply
                </Button>
              </form>
            )}
            {promoError && <p className="text-xs text-red-500">Invalid promo code</p>}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-ink-600">Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-600">Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Button className="w-full" asChild>
              <Link to="/checkout">Proceed to Checkout</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
