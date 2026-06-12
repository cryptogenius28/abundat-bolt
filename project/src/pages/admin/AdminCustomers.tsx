import { useEffect, useState } from 'react';
import { Search, Mail, MoveVertical as MoreVertical, Eye, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Profile, Order } from '../../lib/supabase';
import { AdminPageHeader } from './AdminLayout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

export function AdminCustomers() {
  const [customers, setCustomers] = useState<(Profile & { orderCount?: number; totalSpent?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Profile | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadCustomers();
  }, [search]);

  async function loadCustomers() {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
      }

      const { data: profiles } = await query;

      // Get order stats for each customer
      const customersWithStats = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: orders } = await supabase
            .from('orders')
            .select('total')
            .eq('user_id', profile.id)
            .eq('payment_status', 'paid');

          return {
            ...profile,
            orderCount: orders?.length || 0,
            totalSpent: orders?.reduce((sum, o) => sum + o.total, 0) || 0,
          };
        })
      );

      setCustomers(customersWithStats);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  }

  async function viewCustomerDetails(customer: Profile) {
    setSelectedCustomer(customer);
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', customer.id)
      .order('created_at', { ascending: false })
      .limit(10);
    setCustomerOrders(orders || []);
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
    });
  }

  return (
    <div>
      <AdminPageHeader
        title="Customers"
        description="View and manage customer accounts"
      />

      {/* Search */}
      <div className="bg-white rounded-xl border border-ink-200 shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:border-brand"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-ink-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-ink-50 border-b border-ink-200">
                <th className="text-left px-4 py-3 text-sm font-medium text-ink-600">
                  Customer
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-ink-600">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-ink-600">
                  Orders
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-ink-600">
                  Total Spent
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-ink-600">
                  Joined
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-ink-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-ink-500">
                    No customers found
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-ink-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                          <span className="text-brand font-semibold">
                            {(customer.full_name || customer.email)?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-ink-900">
                            {customer.full_name || 'Unnamed'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-600">
                      {customer.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-900">
                      {customer.orderCount}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-ink-900">
                      {formatCurrency(customer.totalSpent || 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-500">
                      {formatDate(customer.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-ink-100 rounded-lg">
                            <MoreVertical className="w-4 h-4 text-ink-600" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => viewCustomerDetails(customer)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Send Email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="max-w-2xl">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {selectedCustomer.full_name || 'Customer Details'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-ink-500">Email</p>
                    <p className="font-medium">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-ink-500">Joined</p>
                    <p className="font-medium">{formatDate(selectedCustomer.created_at)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-ink-900 mb-3">Recent Orders</h4>
                  {customerOrders.length > 0 ? (
                    <div className="space-y-2">
                      {customerOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-3 bg-ink-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{order.order_number}</p>
                            <p className="text-sm text-ink-500">
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(order.total)}</p>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                order.status === 'delivered'
                                  ? 'bg-green-100 text-green-700'
                                  : order.status === 'cancelled'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-ink-500">No orders yet</p>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
