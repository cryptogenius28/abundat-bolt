import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './contexts';
import { Layout } from './components/layout';
import {
  HomePage,
  ShopPage,
  CategoryPage,
  ProductDetailPage,
  CartPage,
  WishlistPage,
  CheckoutPage,
  OrderConfirmationPage,
  LoginPage,
  RegisterPage,
  AccountLayout,
  AccountDashboard,
  OrdersPage,
  AddressesPage,
  ProfilePage,
  AboutPage,
  ContactPage,
  FAQPage,
  ShippingPage,
  TrackOrderPage,
  BlogPage,
  BlogPostPage,
  CareersPage,
  PrivacyPage,
  NotFoundPage,
  AdminLayout,
  AdminDashboard,
  AdminProducts,
  AdminProductForm,
  AdminOrders,
  AdminCustomers,
  AdminDropshipping,
  AdminAnalytics,
  AdminSettings,
} from './pages';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="category/:slug" element={<CategoryPage />} />
            <Route path="product/:id" element={<ProductDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="order-confirmation" element={<OrderConfirmationPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            {/* Account routes */}
            <Route path="account" element={<AccountLayout />}>
              <Route index element={<AccountDashboard />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="addresses" element={<AddressesPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Static pages */}
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="faq" element={<FAQPage />} />
            <Route path="shipping" element={<ShippingPage />} />
            <Route path="track" element={<TrackOrderPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/:slug" element={<BlogPostPage />} />
            <Route path="careers" element={<CareersPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="search" element={<ShopPage />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:id/edit" element={<AdminProductForm />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="dropshipping" element={<AdminDropshipping />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
