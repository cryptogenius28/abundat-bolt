import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Truck,
  BarChart3,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Store,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../contexts';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Dropshipping', href: '/admin/dropshipping', icon: Truck },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (!isAdmin) {
        navigate('/');
      }
    }
  }, [isAuthenticated, isAdmin, isLoading]);

  async function handleSignOut() {
    await logout();
    navigate('/');
  }

  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    );
  }

  const currentPage = navigation.find(
    (item) =>
      (item.exact && location.pathname === item.href) ||
      (!item.exact && location.pathname.startsWith(item.href))
  );

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
      >
        <div
          className="fixed inset-0 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <Link to="/admin" className="flex items-center gap-2">
              <Store className="w-6 h-6 text-brand" />
              <span className="font-heading font-bold text-lg">Admin</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="p-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  (item.exact && location.pathname === item.href) ||
                  (!item.exact && location.pathname.startsWith(item.href))
                    ? 'bg-brand text-white'
                    : 'text-ink-600 hover:bg-ink-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-white lg:border-r lg:border-ink-200 lg:block">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <Link to="/admin" className="flex items-center gap-2">
              <Store className="w-8 h-8 text-brand" />
              <div>
                <span className="font-heading font-bold text-lg block">
                  Abundant
                </span>
                <span className="text-xs text-ink-500">Admin Dashboard</span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  (item.exact && location.pathname === item.href) ||
                  (!item.exact && location.pathname.startsWith(item.href))
                    ? 'bg-brand text-white'
                    : 'text-ink-600 hover:bg-ink-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                <span className="text-brand font-semibold">
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-900 truncate">
                  {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Admin'}
                </p>
                <p className="text-xs text-ink-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-ink-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-40 bg-white border-b border-ink-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-ink-600 hover:bg-ink-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex items-center gap-2 text-sm text-ink-500">
                <Link to="/admin" className="hover:text-brand">
                  Admin
                </Link>
                {currentPage && (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-ink-900 font-medium">
                      {currentPage.name}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 text-ink-500 hover:bg-ink-100 rounded-lg relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <Link
                to="/"
                className="text-sm text-ink-600 hover:text-brand flex items-center gap-1"
              >
                View Store
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AdminStatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-white rounded-xl p-6 border border-ink-200 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-ink-500">{title}</p>
          <p className="text-2xl font-bold text-ink-900 mt-1">{value}</p>
          {change && (
            <p
              className={`text-xs mt-2 ${
                changeType === 'positive'
                  ? 'text-green-600'
                  : changeType === 'negative'
                  ? 'text-red-600'
                  : 'text-ink-500'
              }`}
            >
              {change}
            </p>
          )}
        </div>
        <div className="p-3 bg-brand/10 rounded-lg">
          <Icon className="w-6 h-6 text-brand" />
        </div>
      </div>
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-ink-900">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-ink-500 mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
