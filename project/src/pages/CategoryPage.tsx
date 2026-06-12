import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { getCategoryBySlug, getProductsByCategory, Category, Product } from '../lib/supabase';
import { ProductGrid } from '../components/product/ProductGrid';

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);

    const fetchData = async () => {
      try {
        if (!slug) {
          setError(true);
          return;
        }

        const [categoryData, productsData] = await Promise.all([
          getCategoryBySlug(slug),
          getProductsByCategory(slug)
        ]);

        setCategory(categoryData);
        setProducts(productsData.data);

        if (categoryData) {
          document.title = `${categoryData.name} | Abundant Merchandise`;
        }
      } catch (err) {
        console.error('Error fetching category:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="h-48 md:h-64 rounded-xl bg-ink-100 animate-pulse mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-ink-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Category not found</h1>
        <Link to="/shop" className="text-brand hover:underline">
          Browse all products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Breadcrumbs
        items={[
          { label: 'Shop', path: '/shop' },
          { label: category.name },
        ]}
      />

      <div className="relative h-48 md:h-64 rounded-xl overflow-hidden mb-8">
        {category.image_url ? (
          <img
            src={category.image_url}
            alt={category.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand/20 to-brand/5" />
        )}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-white/80">{category.description}</p>
            )}
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-ink-500 mb-4">No products in this category yet.</p>
          <Link to="/shop" className="text-brand hover:underline">
            Browse all products
          </Link>
        </div>
      ) : (
        <ProductGrid
          products={products}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        />
      )}
    </div>
  );
}
