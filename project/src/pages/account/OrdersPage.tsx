import { Package, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';

// Mock orders
const mockOrders = [
  {
    id: 'AM-K8R2N9',
    date: '2024-02-10',
    status: 'Delivered',
    statusColor: 'bg-green-100 text-green-700',
    total: 234.99,
    items: 3,
  },
  {
    id: 'AM-M3P7X4',
    date: '2024-02-05',
    status: 'Shipped',
    statusColor: 'bg-blue-100 text-blue-700',
    total: 89.99,
    items: 1,
  },
  {
    id: 'AM-L9W1Z8',
    date: '2024-01-28',
    status: 'Processing',
    statusColor: 'bg-yellow-100 text-yellow-700',
    total: 156.50,
    items: 2,
  },
];

export function OrdersPage() {
  if (mockOrders.length === 0) {
    return (
      <div className="bg-white border border-ink-200 rounded-xl p-8 text-center">
        <Package className="w-16 h-16 text-ink-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
        <p className="text-ink-500 mb-6">
          Start shopping to see your orders here.
        </p>
        <Button asChild>
          <Link to="/shop">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-ink-200 rounded-xl">
      <div className="p-6 border-b border-ink-100">
        <h1 className="text-xl font-semibold">My Orders</h1>
      </div>

      <div className="divide-y">
        {mockOrders.map((order) => (
          <div key={order.id} className="p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-ink-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-ink-600" />
              </div>
              <div>
                <p className="font-semibold text-ink-900">{order.id}</p>
                <p className="text-sm text-ink-500">
                  {new Date(order.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${order.statusColor}`}>
                {order.status}
              </span>
              <p className="font-semibold">${order.total.toFixed(2)}</p>
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/track?order=${order.id}`}>
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
