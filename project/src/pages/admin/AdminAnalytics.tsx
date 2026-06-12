import { useEffect, useState } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AdminPageHeader, AdminStatCard } from './AdminLayout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

interface ChartData {
  labels: string[];
  revenue: number[];
  orders: number[];
}

export function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
    topProducts: [] as { title: string; sales: number; revenue: number }[],
    recentOrders: [] as { date: string; count: number }[],
    revenueByCategory: [] as { category: string; revenue: number }[],
  });
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    revenue: [],
    orders: [],
  });

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const days = period === '30d' ? 30 : period === '7d' ? 7 : 1;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get orders in period
      const { data: orders } = await supabase
        .from('orders')
        .select('*, items:order_items(*, product:products(*))')
        .eq('payment_status', 'paid')
        .gte('created_at', startDate.toISOString());

      // Calculate stats
      const totalRevenue = orders?.reduce((sum, o) => sum + o.total, 0) || 0;
      const totalOrders = orders?.length || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Get customers in period
      const { count: totalCustomers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer')
        .gte('created_at', startDate.toISOString());

      // Top products by sales
      const productSales: Record<string, { title: string; sales: number; revenue: number }> = {};
      orders?.forEach((order) => {
        order.items?.forEach((item: { sku: string; title: string; quantity: number; price: number }) => {
          if (!productSales[item.sku]) {
            productSales[item.sku] = {
              title: item.title,
              sales: 0,
              revenue: 0,
            };
          }
          productSales[item.sku].sales += item.quantity;
          productSales[item.sku].revenue += item.price * item.quantity;
        });
      });

      const topProducts = Object.entries(productSales)
        .map(([_, data]) => data)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Chart data - daily breakdown
      const dailyData: Record<string, { revenue: number; orders: number }> = {};
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split('T')[0];
        dailyData[key] = { revenue: 0, orders: 0 };
      }

      orders?.forEach((order) => {
        const key = order.created_at.split('T')[0];
        if (dailyData[key]) {
          dailyData[key].revenue += order.total;
          dailyData[key].orders += 1;
        }
      });

      const sortedDays = Object.keys(dailyData).sort();
      const labels = sortedDays.map((d) =>
        new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      );
      const revenue = sortedDays.map((d) => dailyData[d].revenue);
      const ordersCount = sortedDays.map((d) => dailyData[d].orders);

      setChartData({ labels, revenue, orders: ordersCount });
      setStats({
        totalRevenue,
        totalOrders,
        totalCustomers: totalCustomers || 0,
        avgOrderValue,
        topProducts,
        recentOrders: sortedDays.map((d) => ({
          date: d,
          count: dailyData[d].orders,
        })),
        revenueByCategory: [],
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
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

  const maxRevenue = Math.max(...chartData.revenue, 1);
  const maxOrders = Math.max(...chartData.orders, 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <AdminPageHeader
          title="Analytics"
          description="Track your store performance"
        />
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="1d">Today</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AdminStatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          change="+12%"
          changeType="positive"
        />
        <AdminStatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          change="+8%"
          changeType="positive"
        />
        <AdminStatCard
          title="New Customers"
          value={stats.totalCustomers}
          icon={Users}
          change="+5"
          changeType="positive"
        />
        <AdminStatCard
          title="Avg Order Value"
          value={formatCurrency(stats.avgOrderValue)}
          icon={TrendingUp}
          changeType="neutral"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-ink-200 shadow-sm p-6">
          <h3 className="font-semibold text-ink-900 mb-4">Revenue</h3>
          <div className="h-48 flex items-end gap-2">
            {chartData.labels.map((label, i) => (
              <div
                key={label}
                className="flex-1 flex flex-col items-center justify-end"
              >
                <div
                  className="w-full bg-brand/20 hover:bg-brand/30 rounded-t transition-all cursor-pointer relative group"
                  style={{ height: `${(chartData.revenue[i] / maxRevenue) * 100}%` }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-ink-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatCurrency(chartData.revenue[i])}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-xs text-ink-500 overflow-x-auto">
            {chartData.labels.map((label, i) => (
              <span key={i} className="flex-shrink-0">
                {i % Math.ceil(chartData.labels.length / 5) === 0 ? label : ''}
              </span>
            ))}
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-xl border border-ink-200 shadow-sm p-6">
          <h3 className="font-semibold text-ink-900 mb-4">Orders</h3>
          <div className="h-48 flex items-end gap-2">
            {chartData.labels.map((label, i) => (
              <div key={label} className="flex-1 flex flex-col items-center justify-end">
                <div
                  className="w-full bg-ink-200 hover:bg-ink-300 rounded-t transition-all cursor-pointer relative group"
                  style={{ height: `${(chartData.orders[i] / maxOrders) * 100}%` }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-ink-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {chartData.orders[i]} orders
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl border border-ink-200 shadow-sm p-6">
        <h3 className="font-semibold text-ink-900 mb-4">Top Products</h3>
        {stats.topProducts.length > 0 ? (
          <div className="space-y-3">
            {stats.topProducts.map((product, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-6 h-6 rounded-full bg-brand/10 text-brand text-sm font-medium flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-ink-900">{product.title}</p>
                  <p className="text-sm text-ink-500">{product.sales} sold</p>
                </div>
                <span className="font-semibold text-ink-900">
                  {formatCurrency(product.revenue)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-ink-500 text-center py-4">
            No sales data available for this period
          </p>
        )}
      </div>
    </div>
  );
}
