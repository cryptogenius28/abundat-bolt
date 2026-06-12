import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleCheck as CheckCircle, Package } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useCartStore } from '../stores';

export function OrderConfirmationPage() {
  const { clearCart } = useCartStore();
  const [orderNumber] = useState(() => `AM-${Math.random().toString(36).substr(2, 8).toUpperCase()}`);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    document.title = 'Order Confirmed | Abundant Merchandise';
    clearCart();

    // Stop confetti after 3 seconds
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#E8621A', '#22c55e', '#3b82f6', '#eab308', '#ec4899'][
                  Math.floor(Math.random() * 5)
                ],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-heading font-bold text-ink-900 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-ink-600">
          Thank you for your purchase. We have sent a confirmation email.
        </p>
      </div>

      <div className="bg-ink-50 rounded-xl p-6 mb-8 text-left">
        <div className="flex items-center gap-3 mb-4">
          <Package className="w-5 h-5 text-brand" />
          <div>
            <p className="text-sm text-ink-500">Order Number</p>
            <p className="font-bold text-lg text-ink-900">{orderNumber}</p>
          </div>
        </div>
        <div className="border-t pt-4 mt-4">
          <p className="text-sm text-ink-500 mb-2">Estimated Delivery</p>
          <p className="font-semibold text-ink-900">
            {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild>
          <Link to="/shop">Continue Shopping</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/account/orders">View Orders</Link>
        </Button>
      </div>
    </div>
  );
}
