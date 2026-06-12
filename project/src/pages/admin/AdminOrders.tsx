import { useEffect, useState } from 'react';
import { Search, Eye, Package, Truck, CircleCheck as CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Order } from '../../lib/supabase';
import { AdminPageHeader } from './AdminLayout';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [search, statusFilter, paymentFilter, fulfillmentFilter]);

  async function loadOrders() {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select('*, user:profiles(*), items:order_items(*, product:products(*), supplier:suppliers(*))')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`order_number.ilike.%${search}%,shipping_name.ilike.%${search}%`);
      }
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (paymentFilter !== 'all') {
        query = query.eq('payment_status', paymentFilter);
      }
      if (fulfillmentFilter !== 'all') {
        query = query.eq('fulfillment_status', fulfillmentFilter);
      }

      const { data } = await query;
      setOrders((data as Order[]) || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string, status: Order['status']) {
    setUpdating(true);
    try {
      await supabase.from('orders').update({ status }).eq('id', orderId);
      await loadOrders();
      if (selectedOrder) {
        const updated = orders.find((o) => o.id === orderId);
        if (updated) setSelectedOrder({ ...updated, status });
      }
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setUpdating(false);
    }
  }

  async function updatePaymentStatus(orderId: string, status: Order['payment_status']) {
    setUpdating(true);
    try {
      await supabase.from('orders').update({ payment_status: status }).eq('id', orderId);
      await loadOrders();
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, payment_status: status });
      }
    } catch (error) {
      console.error('Error updating payment:', error);
    } finally {
      setUpdating(false);
    }
  }

  async function updateFulfillmentStatus(orderId: string, fulfillmentStatus: Order['fulfillment_status']) {
    setUpdating(true);
    try {
      await supabase.from('orders').update({ fulfillment_status: fulfillmentStatus }).eq('id', orderId);
      await loadOrders();
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, fulfillment_status: fulfillmentStatus });
      }
    } catch (error) {
      console.error('Error updating fulfillment:', error);
    } finally {
      setUpdating(false);
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-ink-100 text-ink-800';
  }

  function getPaymentColor(status: string) {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-ink-100 text-ink-800';
  }

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        description="Manage and track customer orders"
        actions={
          <Button
            variant="outline"
            onClick={() => loadOrders()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-ink-200 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:border-brand"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          <Select value={fulfillmentFilter} onValueChange={setFulfillmentFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Fulfillment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unfulfilled">Unfulfilled</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="fulfilled">Fulfilled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-ink-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-ink-50 border-b border-ink-200">
                <th className="text-left px-4 py-3 text-sm font-medium text-ink-600">
                  Order
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-ink-600">
                  Customer
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-ink-600">
                  Items
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-ink-600">
                  Total
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-ink-600">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-ink-600">
                  Payment
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-ink-600">
                  Date
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-ink-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-ink-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-ink-50 cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink-900">
                        {order.order_number}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-ink-900">{order.shipping_name}</p>
                      <p className="text-xs text-ink-500">
                        {order.user?.email || 'Guest'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-600">
                      {order.items?.length || 0} items
                    </td>
                    <td className="px-4 py-3 font-medium text-ink-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentColor(
                          order.payment_status
                        )}`}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                        className="p-2 hover:bg-ink-100 rounded-lg"
                      >
                        <Eye className="w-4 h-4 text-ink-600" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Order {selectedOrder.order_number}
                </DialogTitle>
                <DialogDescription>
                  Placed on {formatDate(selectedOrder.created_at)}
                </DialogDescription>
              </DialogHeader>

              {/* Status Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-b">
                <div>
                  <p className="text-sm text-ink-500 mb-1">Order Status</p>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value: Order['status']) =>
                      updateOrderStatus(selectedOrder.id, value)
                    }
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-sm text-ink-500 mb-1">Payment Status</p>
                  <Select
                    value={selectedOrder.payment_status}
                    onValueChange={(value: Order['payment_status']) =>
                      updatePaymentStatus(selectedOrder.id, value)
                    }
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-sm text-ink-500 mb-1">Fulfillment Status</p>
                  <Select
                    value={selectedOrder.fulfillment_status}
                    onValueChange={(value: Order['fulfillment_status']) =>
                      updateFulfillmentStatus(selectedOrder.id, value)
                    }
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unfulfilled">Unfulfilled</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="fulfilled">Fulfilled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Order Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                {/* Shipping Address */}
                <div>
                  <h4 className="font-semibold text-ink-900 mb-2">
                    Shipping Address
                  </h4>
                  <div className="text-sm text-ink-600 space-y-1">
                    <p>{selectedOrder.shipping_name}</p>
                    {selectedOrder.shipping_phone && (
                      <p>{selectedOrder.shipping_phone}</p>
                    )}
                    <p>{selectedOrder.shipping_address_line1}</p>
                    {selectedOrder.shipping_address_line2 && (
                      <p>{selectedOrder.shipping_address_line2}</p>
                    )}
                    <p>
                      {selectedOrder.shipping_city},{' '}
                      {selectedOrder.shipping_state}{' '}
                      {selectedOrder.shipping_postal_code}
                    </p>
                    <p>{selectedOrder.shipping_country}</p>
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h4 className="font-semibold text-ink-900 mb-2">
                    Order Summary
                  </h4>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-ink-600">Subtotal</span>
                      <span className="font-medium">
                        {formatCurrency(selectedOrder.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-600">Discount</span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(selectedOrder.discount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-600">Shipping</span>
                      <span className="font-medium">
                        {formatCurrency(selectedOrder.shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-600">Tax</span>
                      <span className="font-medium">
                        {formatCurrency(selectedOrder.tax)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="pt-4 border-t">
                <h4 className="font-semibold text-ink-900 mb-4">Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 bg-ink-50 rounded-lg"
                    >
                      <Package className="w-10 h-10 text-ink-400" />
                      <div className="flex-1">
                        <p className="font-medium text-ink-900">{item.title}</p>
                        <p className="text-sm text-ink-500">
                          SKU: {item.sku} | Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-ink-900">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        {item.supplier && (
                          <p className="text-xs text-ink-500 flex items-center justify-end gap-1">
                            <Truck className="w-3 h-3" />
                            {item.supplier.name}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking */}
              {selectedOrder.tracking_numbers &&
                selectedOrder.tracking_numbers.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold text-ink-900 mb-2">
                      Tracking Numbers
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedOrder.tracking_numbers.map((tracking, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {tracking}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
