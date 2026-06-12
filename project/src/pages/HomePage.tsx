import { useEffect } from 'react';
import {
  HeroSlider,
  TrustBar,
  FlashSale,
  CategoryGrid,
  FeaturedProducts,
  PromoBanners,
  NewArrivals,
  BlogPreview,
  TopBrands,
  Testimonials,
  RecentlyViewed
} from '../components/home';

export function HomePage() {
  useEffect(() => {
    document.title = 'Abundant Merchandise | Quality Products at Great Prices';
  }, []);

  return (
    <>
      <HeroSlider />
      <TrustBar />
      <FlashSale />
      <CategoryGrid />
      <FeaturedProducts />
      <PromoBanners />
      <NewArrivals />
      <RecentlyViewed />
      <BlogPreview />
      <TopBrands />
      <Testimonials />
    </>
  );
}
