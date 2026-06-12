import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, User, ShoppingBag, Menu, ChevronDown } from 'lucide-react';
import { useCartStore, useWishlistStore } from '../../stores';
import { useAuth } from '../../contexts';
import { getCategories, searchProducts } from '../../lib/supabase';
import { Category } from '../../lib/supabase';
import { MegaMenu } from './MegaMenu';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ title: string; type: 'product' | 'category'; url: string }[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { getItemCount, openDrawer } = useCartStore();
  const { getItemCount: getWishlistCount } = useWishlistStore();
  const { user, isAuthenticated, logout } = useAuth();

  const itemCount = getItemCount();
  const wishlistCount = getWishlistCount();

  // Load categories from Supabase
  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setShowAccount(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const { data: products } = await searchProducts(searchQuery, { limit: 5 });
          const matchedCategories = categories.filter((c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase())
          ).slice(0, 2);

          const results = [
            ...matchedCategories.map((c) => ({
              title: c.name,
              type: 'category' as const,
              url: `/category/${c.slug}`,
            })),
            ...products.map((p) => ({
              title: p.title,
              type: 'product' as const,
              url: `/product/${p.id}`,
            })),
          ];
          setSearchResults(results);
          setShowSearch(true);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
        setShowSearch(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, categories]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setShowAccount(false);
  };

  return (
    <>
      {/* Header */}
      <header
        className={`sticky top-0 z-50 bg-white transition-shadow ${
          isScrolled ? 'shadow-md' : ''
        }`}
      >
        {/* Main header */}
        <div className="border-b border-ink-200">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 hover:bg-ink-100 rounded-md"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                >
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-heading font-bold text-ink-900 leading-none">
                  Abundant
                </div>
                <div className="text-xs font-heading font-semibold text-brand uppercase tracking-wider leading-none mt-0.5">
                  MERCHANDISE
                </div>
              </div>
            </Link>

            {/* Search bar */}
            <div ref={searchRef} className="flex-1 max-w-2xl relative hidden md:block">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                  <input
                    type="text"
                    placeholder="Search for products, brands, and more..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-ink-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                  />
                </div>
              </form>

              {/* Search dropdown */}
              {showSearch && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-ink-200 rounded-lg shadow-lg overflow-hidden">
                  {searchResults.map((result, index) => (
                    <Link
                      key={index}
                      to={result.url}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-ink-50 transition-colors"
                      onClick={() => {
                        setShowSearch(false);
                        setSearchQuery('');
                      }}
                    >
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          result.type === 'category'
                            ? 'bg-brand/10 text-brand'
                            : 'bg-ink-100 text-ink-600'
                        }`}
                      >
                        {result.type === 'category' ? 'Category' : 'Product'}
                      </span>
                      <span className="text-sm text-ink-900">{result.title}</span>
                    </Link>
                  ))}
                  <Link
                    to={`/shop?search=${encodeURIComponent(searchQuery)}`}
                    className="block px-4 py-2.5 text-sm text-brand font-semibold hover:bg-ink-50 border-t border-ink-100"
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery('');
                    }}
                  >
                    View all results →
                  </Link>
                </div>
              )}
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Mobile search button */}
              <button className="lg:hidden p-2 hover:bg-ink-100 rounded-md">
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="p-2 hover:bg-ink-100 rounded-md relative"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand text-white text-xs rounded-full flex items-center justify-center font-semibold">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account dropdown */}
              <div ref={accountRef} className="relative hidden md:block">
                <button
                  onClick={() => setShowAccount(!showAccount)}
                  className="flex items-center gap-1 p-2 hover:bg-ink-100 rounded-md"
                >
                  <User className="w-5 h-5" />
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showAccount ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showAccount && (
                  <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-ink-200 rounded-lg shadow-lg overflow-hidden">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-3 border-b border-ink-100">
                          <p className="font-medium text-ink-900">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-sm text-ink-500">{user?.email}</p>
                        </div>
                        <Link
                          to="/account"
                          className="block px-4 py-2.5 text-sm hover:bg-ink-50"
                          onClick={() => setShowAccount(false)}
                        >
                          My Account
                        </Link>
                        <Link
                          to="/account/orders"
                          className="block px-4 py-2.5 text-sm hover:bg-ink-50"
                          onClick={() => setShowAccount(false)}
                        >
                          My Orders
                        </Link>
                        <Link
                          to="/account/addresses"
                          className="block px-4 py-2.5 text-sm hover:bg-ink-50"
                          onClick={() => setShowAccount(false)}
                        >
                          My Addresses
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-ink-50 border-t border-ink-100"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="block px-4 py-2.5 text-sm hover:bg-ink-50"
                          onClick={() => setShowAccount(false)}
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/register"
                          className="block px-4 py-2.5 text-sm hover:bg-ink-50"
                          onClick={() => setShowAccount(false)}
                        >
                          Create Account
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={openDrawer}
                className="p-2 hover:bg-ink-100 rounded-md relative"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand text-white text-xs rounded-full flex items-center justify-center font-semibold">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation bar */}
        <nav className="hidden lg:block border-b border-ink-100">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-6">
            {/* All Departments button */}
            <div
              className="relative"
              onMouseEnter={() => setShowMegaMenu(true)}
              onMouseLeave={() => setShowMegaMenu(false)}
            >
              <button className="flex items-center gap-2 h-12 px-4 -ml-4 hover:bg-ink-50 font-medium text-sm">
                <Menu className="w-5 h-5" />
                <span>All Departments</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showMegaMenu ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showMegaMenu && <MegaMenu onClose={() => setShowMegaMenu(false)} />}
            </div>

            {/* Category links */}
            <div className="flex items-center gap-1">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="relative group h-12 px-3 flex items-center text-sm font-medium text-ink-700 hover:text-brand transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85%] bg-white overflow-y-auto">
            <div className="p-4 border-b border-ink-100">
              <div className="flex items-center justify-between">
                <Link
                  to="/"
                  className="flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                    >
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-heading font-bold text-ink-900 leading-none">
                      Abundant
                    </div>
                    <div className="text-xs font-heading font-semibold text-brand uppercase tracking-wider leading-none mt-0.5">
                      MERCHANDISE
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-ink-100 rounded-md"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4">
              {/* Auth section */}
              <div className="mb-6">
                {isAuthenticated ? (
                  <div className="space-y-1">
                    <p className="font-medium text-ink-900 mb-2">
                      Hi, {user?.firstName}!
                    </p>
                    <Link
                      to="/account"
                      className="block py-2 text-ink-700 hover:text-brand"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Account
                    </Link>
                    <Link
                      to="/account/orders"
                      className="block py-2 text-ink-700 hover:text-brand"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="block py-2 text-red-600 hover:text-red-700"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="block w-full bg-brand text-white text-center py-3 rounded-lg font-semibold hover:bg-brand-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full border border-ink-200 text-center py-3 rounded-lg font-semibold hover:border-brand hover:text-brand"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>

              {/* Categories */}
              <div className="border-t border-ink-100 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-3">
                  Shop by Category
                </p>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/category/${category.slug}`}
                      className="flex items-center gap-3 py-3 text-ink-700 hover:text-brand"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="font-medium">{category.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Help links */}
              <div className="border-t border-ink-100 pt-4 mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-3">
                  Help & Info
                </p>
                <div className="space-y-1">
                  <Link
                    to="/contact"
                    className="block py-2 text-ink-700 hover:text-brand"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact Us
                  </Link>
                  <Link
                    to="/faq"
                    className="block py-2 text-ink-700 hover:text-brand"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    FAQs
                  </Link>
                  <Link
                    to="/shipping"
                    className="block py-2 text-ink-700 hover:text-brand"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Shipping & Returns
                  </Link>
                  <Link
                    to="/track"
                    className="block py-2 text-ink-700 hover:text-brand"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Track My Order
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
