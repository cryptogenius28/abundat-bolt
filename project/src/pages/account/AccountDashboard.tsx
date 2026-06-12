import { Link } from 'react-router-dom';
import { Package, MapPin, Settings } from 'lucide-react';
import { useAuth } from '../../contexts';

const dashboardLinks = [
  { path: '/account/orders', label: 'My Orders', icon: Package, description: 'Track your orders' },
  { path: '/account/addresses', label: 'Addresses', icon: MapPin, description: 'Manage shipping addresses' },
  { path: '/account/profile', label: 'Profile', icon: Settings, description: 'Update your info' },
];

export function AccountDashboard() {
  const { user } = useAuth();

  return (
    <div className="bg-white border border-ink-200 rounded-xl p-6">
      <h1 className="text-2xl font-heading font-bold mb-6">
        Welcome back, {user?.firstName || 'there'}!
      </h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashboardLinks.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-4 p-4 border border-ink-200 rounded-xl hover:border-brand hover:shadow-sm transition-all group"
          >
            <div className="w-12 h-12 bg-ink-100 rounded-lg flex items-center justify-center group-hover:bg-brand/10">
              <item.icon className="w-6 h-6 text-ink-600 group-hover:text-brand" />
            </div>
            <div>
              <p className="font-semibold text-ink-900">{item.label}</p>
              <p className="text-sm text-ink-500">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
