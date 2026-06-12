import { Outlet } from 'react-router-dom';
import { AnnouncementBar } from './AnnouncementBar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';
import { Footer } from './Footer';
import { CartDrawer } from '../cart/CartDrawer';
import { BackToTop } from '../ui/BackToTop';
import { CookieBanner } from '../ui/CookieBanner';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
      <CartDrawer />
      <BackToTop />
      <CookieBanner />
    </div>
  );
}
