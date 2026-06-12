import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, DollarSign, Users, TrendingUp, TriangleAlert as AlertTriangle, Truck, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Order, Product } from '../../lib/supabase';
import { AdminStatCard, AdminPageHeader } from './AdminLayout';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  lowStockProducts: number;
  dropshipOrders: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    lowStockProducts: 0,
    dropshipOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      // Get order stats
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { data: revenueData } = await supabase
        .from('orders')
        .select('total')
        .eq('payment_status', 'paid');

      const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total, 0) || 0;

      const { count: totalCustomers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');

      const { count: lowStockProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .lt('stock_qty', 5);

      const { count: dropshipOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .contains('supplier_order_ids', ['*']);

      // Get recent orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*, user:profiles(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get low stock products
      const { data: lowStock } = await supabase
        .from('products')
        .select('*')
        .lt('stock_qty', 5)
        .limit(5);

      setStats({
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        totalRevenue,
        totalCustomers: totalCustomers || 0,
        lowStockProducts: lowStockProducts || 0,
        dropshipOrders: dropshipOrders || 0,
      });
      setRecentOrders((orders as Order[]) || []);
      setLowStockProducts((lowStock as Product[]) || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Welcome back! Here's what's happening with your store."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <AdminStatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          change={`${stats.pendingOrders} pending`}
          changeType="neutral"
        />
        <AdminStatCard
          title="Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          change="+12% from last month"
          changeType="positive"
        />
        <AdminStatCard
          title="Customers"
          value={stats.totalCustomers}
          icon={Users}
          change="+5 this week"
          changeType="positive"
        />
        <AdminStatCard
          title="Low Stock"
          value={stats.lowStockProducts}
          icon={AlertTriangle}
          change={stats.lowStockProducts > 0 ? 'Needs attention' : 'All good'}
          changeType={stats.lowStockProducts > 0 ? 'negative' : 'positive'}
        />
        <AdminStatCard
          title="Dropship Orders"
          value={stats.dropshipOrders}
          icon={Truck}
          change="Pending fulfillment"
          changeType="neutral"
        />
        <AdminStatCard
          title="Growth"
          value="+18%"
          icon={TrendingUp}
          change="Month over month"
          changeType="positive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-ink-200 shadow-sm">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-ink-900">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-sm text-brand hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 hover:bg-ink-50"
              >
                <div>
                  <p className="font-medium text-ink-900">{order.order_number}</p>
                  <p className="text-sm text-ink-500">
                    {order.user?.email || order.shipping_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-ink-900">
                    {formatCurrency(order.total)}
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p className="p-4 text-center text-ink-500">No orders yet</p>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl border border-ink-200 shadow-sm">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-ink-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Low Stock Alert
            </h2>
            <Link
              to="/admin/products?filter=low_stock"
              className="text-sm text-brand hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 hover:bg-ink-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-ink-100 rounded-lg overflow-hidden">
                    {product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-ink-900">{product.title}</p>
                    <p className="text-sm text-ink-500">{product.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-medium ${
                      product.stock_qty === 0 ? 'text-red-600' : 'text-yellow-600'
                    }`}
                  >
                    {product.stock_qty} left
                  </p>
                </div>
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <p className="p-4 text-center text-ink-500">
                All products are well stocked
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-xl border border-ink-200 shadow-sm p-4">
        <h2 className="font-semibold text-ink-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            <Package className="w-4 h-4" />
            Add Product
          </Link>
          <Link
            to="/admin/orders?status=pending"
            className="flex items-center gap-2 px-4 py-2 bg-ink-100 text-ink-700 rounded-lg hover:bg-ink-200 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Process Orders
          </Link>
          <Link
            to="/admin/dropshipping"
            className="flex items-center gap-2 px-4 py-2 bg-ink-100 text-ink-700 rounded-lg hover:bg-ink-200 transition-colors"
          >
            <Truck className="w-4 h-4" />
            Sync Dropshipping
          </Link>
          <Link
            to="/admin/analytics"
            className="flex items-center gap-2 px-4 py-2 bg-ink-100 text-ink-700 rounded-lg hover:bg-ink-200 transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            View Analytics
          </Link>
        </div>
      </div>
    </div>
  );
}
