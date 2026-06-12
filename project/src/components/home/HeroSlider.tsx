import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1445205170120-bae5a61245e5?w=1600&q=80',
    title: 'Abundant deals. Every day, every aisle.',
    subtitle: 'Discover thousands of products at unbeatable prices',
    ctaText: 'Shop the Sale',
    ctaLink: '/shop?on_sale=true',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7197d5684?w=1600&q=80',
    title: 'Upgrade your space',
    subtitle: 'Furniture and decor for every room',
    ctaText: 'Shop Home',
    ctaLink: '/category/home-garden',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1441984994997-b8f850a7c59e?w=1600&q=80',
    title: 'Style for every season',
    subtitle: 'Fashion and accessories for less',
    ctaText: 'Shop Fashion',
    ctaLink: '/category/fashion',
  },
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative h-[300px] md:h-[500px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 w-full">
              <div className="max-w-xl">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-4">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-xl text-white/80 mb-6">
                  {slide.subtitle}
                </p>
                <Button size="lg" asChild>
                  <Link to={slide.ctaLink}>{slide.ctaText}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
