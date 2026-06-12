import { useEffect, useState } from 'react';
import { Package, Search, CircleCheck as CheckCircle, Circle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

interface TrackingStep {
  status: string;
  date: string;
  location: string;
  completed: boolean;
}

export function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [trackingResult, setTrackingResult] = useState<TrackingStep[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Track My Order | Abundant Merchandise';
  }, []);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!orderNumber.trim() || !email.trim()) {
      setError('Please enter both order number and email');
      return;
    }

    // Mock tracking result
    setTrackingResult([
      {
        status: 'Order Placed',
        date: 'Feb 10, 2024 - 9:30 AM',
        location: 'Online',
        completed: true,
      },
      {
        status: 'Processing',
        date: 'Feb 10, 2024 - 2:15 PM',
        location: 'Reno, NV Warehouse',
        completed: true,
      },
      {
        status: 'Shipped',
        date: 'Feb 11, 2024 - 10:00 AM',
        location: 'Reno, NV',
        completed: true,
      },
      {
        status: 'In Transit',
        date: 'Feb 12, 2024 - 6:30 AM',
        location: 'Salt Lake City, UT',
        completed: true,
      },
      {
        status: 'Out for Delivery',
        date: 'Feb 13, 2024 - 8:00 AM',
        location: 'Your City, ST',
        completed: false,
      },
      {
        status: 'Delivered',
        date: 'Est. Feb 13, 2024',
        location: 'Your Address',
        completed: false,
      },
    ]);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-brand" />
        </div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">
          Track My Order
        </h1>
        <p className="text-ink-600">
          Enter your order details to see the latest status of your shipment.
        </p>
      </div>

      <form onSubmit={handleTrack} className="max-w-md mx-auto mb-8">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="orderNumber">Order Number</Label>
            <Input
              id="orderNumber"
              placeholder="AM-XXXXXXXX"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full">
            <Search className="w-4 h-4 mr-2" />
            Track Order
          </Button>
        </div>
      </form>

      {trackingResult && (
        <div className="border border-ink-200 rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-6 text-center">Order Status</h2>

          <div className="relative">
            {trackingResult.map((step, index) => {
              const isLast = index === trackingResult.length - 1;
              return (
                <div key={step.status} className="flex gap-4 pb-8 last:pb-0 relative">
                  {/* Line */}
                  {!isLast && (
                    <div
                      className={`absolute left-[18px] top-10 w-0.5 h-[calc(100%-32px)] ${
                        step.completed ? 'bg-brand' : 'bg-ink-200'
                      }`}
                    />
                  )}

                  {/* Icon */}
                  <div className="relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.completed
                          ? 'bg-brand text-white'
                          : 'bg-ink-100 text-ink-400'
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <p
                      className={`font-semibold ${
                        step.completed ? 'text-ink-900' : 'text-ink-400'
                      }`}
                    >
                      {step.status}
                    </p>
                    <p className="text-sm text-ink-500">{step.date}</p>
                    <p className="text-xs text-ink-400">{step.location}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
