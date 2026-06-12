import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { User, Package, MapPin, Settings } from 'lucide-react';
import { useAuth } from '../../contexts';

const navItems = [
  { path: '/account', label: 'Dashboard', icon: User },
  { path: '/account/orders', label: 'My Orders', icon: Package },
  { path: '/account/addresses', label: 'Addresses', icon: MapPin },
  { path: '/account/profile', label: 'Profile', icon: Settings },
];

export function AccountLayout() {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'My Account | Abundant Merchandise';
  }, []);
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white border border-ink-200 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-brand" />
              </div>
              <div>
                <p className="font-semibold text-ink-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-ink-500">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-ink-200 rounded-xl overflow-hidden">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    isActive
                      ? 'bg-brand/10 text-brand font-semibold'
                      : 'text-ink-600 hover:bg-ink-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
