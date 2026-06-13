import { Link, useLocation } from 'react-router-dom';
import { Hop as Home, LayoutGrid, Search, Heart, ShoppingBag } from 'lucide-react';
import { useCartStore, useWishlistStore } from '../../stores';

export function MobileBottomNav() {
  const location = useLocation();
  const { getItemCount } = useCartStore();
  const { getItemCount: getWishlistCount } = useWishlistStore();

  const itemCount = getItemCount();
  const wishlistCount = getWishlistCount();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/shop', icon: LayoutGrid, label: 'Shop' },
    { path: '/search', icon: Search, label: 'Search' },
    {
      path: '/wishlist',
      icon: Heart,
      label: 'Wishlist',
      badge: wishlistCount,
    },
    {
      path: '/cart',
      icon: ShoppingBag,
      label: 'Cart',
      badge: itemCount,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-ink-200 z-40 lg:hidden pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center relative px-3 py-2 ${
                isActive ? 'text-brand' : 'text-ink-500'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
