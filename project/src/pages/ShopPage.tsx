import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Grid2x2 as Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductGrid } from '../components/product/ProductGrid';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { getProducts, getCategories, searchProducts, Category, Product } from '../lib/supabase';

const PRODUCTS_PER_PAGE = 12;

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const sortBy = searchParams.get('sort') || 'featured';
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const priceRange = [
    parseInt(searchParams.get('minPrice') || '0'),
    parseInt(searchParams.get('maxPrice') || '1000'),
  ];
  const onSaleFilter = searchParams.get('on_sale') === 'true';
  const inStockFilter = searchParams.get('in_stock') === 'true';
  const fulfillmentFilter = searchParams.get('fulfillment') || '';

  // Load categories
  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  // Load products
  useEffect(() => {
    setLoading(true);

    const fetchData = async () => {
      try {
        let result: Product[];

        if (searchQuery) {
          const response = await searchProducts(searchQuery, { limit: 100 });
          result = response.data;
        } else {
          const response = await getProducts({ active: true, limit: 100 });
          result = response.data;
        }

        // Apply client-side filters
        if (selectedCategory) {
          result = result.filter((p) => p.category?.slug === selectedCategory);
        }

        result = result.filter((p) => {
          const price = p.sale_price || p.price;
          return price >= priceRange[0] && price <= priceRange[1];
        });

        if (onSaleFilter) {
          result = result.filter((p) => p.sale_price);
        }

        if (inStockFilter) {
          result = result.filter((p) => p.stock_qty > 0);
        }

        if (fulfillmentFilter) {
          result = result.filter((p) => p.fulfillment_type === fulfillmentFilter);
        }

        // Sort
        switch (sortBy) {
          case 'price-low':
            result.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
            break;
          case 'price-high':
            result.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
            break;
          case 'newest':
            result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            break;
          case 'rating':
            result.sort((a, b) => b.rating - a.rating);
            break;
          case 'featured':
          default:
            result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
            break;
        }

        setProducts(result);
        setTotalCount(result.length);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery, selectedCategory, priceRange, onSaleFilter, inStockFilter, fulfillmentFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);
  const paginatedProducts = products.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  // Update URL params
  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchParams({});
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Breadcrumbs items={[{ label: 'Shop' }]} />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="font-semibold text-ink-900 mb-3">Category</h3>
              <div className="space-y-2">
                <button
                  onClick={() => updateFilter('category', '')}
                  className={`text-sm ${
                    !selectedCategory ? 'text-brand font-semibold' : 'text-ink-600'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateFilter('category', cat.slug)}
                    className={`block text-sm ${
                      selectedCategory === cat.slug
                        ? 'text-brand font-semibold'
                        : 'text-ink-600 hover:text-ink-900'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-ink-900 mb-3">Price Range</h3>
              <div className="px-2">
                <Slider
                  value={priceRange}
                  min={0}
                  max={1000}
                  step={10}
                  onValueChange={(value) => {
                    updateFilter('minPrice', value[0].toString());
                    updateFilter('maxPrice', value[1].toString());
                  }}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-ink-500">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="on-sale"
                  checked={onSaleFilter}
                  onCheckedChange={(checked) =>
                    updateFilter('on_sale', checked ? 'true' : null)
                  }
                />
                <Label htmlFor="on-sale" className="text-sm text-ink-600">
                  On Sale
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="in-stock"
                  checked={inStockFilter}
                  onCheckedChange={(checked) =>
                    updateFilter('in_stock', checked ? 'true' : null)
                  }
                />
                <Label htmlFor="in-stock" className="text-sm text-ink-600">
                  In Stock
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="warehouse"
                  checked={fulfillmentFilter === 'warehouse'}
                  onCheckedChange={(checked) =>
                    updateFilter('fulfillment', checked ? 'warehouse' : null)
                  }
                />
                <Label htmlFor="warehouse" className="text-sm text-ink-600">
                  Warehouse Items
                </Label>
              </div>
            </div>

            {(selectedCategory || onSaleFilter || inStockFilter || fulfillmentFilter) && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-2xl font-heading font-bold text-ink-900">
                {searchQuery ? `Results for "${searchQuery}"` : 'Shop All Products'}
              </h1>
              <p className="text-sm text-ink-500 mt-1">
                {totalCount} products found
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile filter */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <p className="font-semibold text-ink-900">Category</p>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => updateFilter('category', cat.slug)}
                          className={`block text-sm ${
                            selectedCategory === cat.slug
                              ? 'text-brand font-semibold'
                              : 'text-ink-600'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="m-on-sale"
                          checked={onSaleFilter}
                          onCheckedChange={(checked) =>
                            updateFilter('on_sale', checked ? 'true' : null)
                          }
                        />
                        <Label htmlFor="m-on-sale" className="text-sm">
                          On Sale
                        </Label>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(value) => updateFilter('sort', value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>

              {/* View mode */}
              <div className="hidden sm:flex items-center border rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-ink-100' : ''}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-ink-100' : ''}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-ink-100 animate-pulse" />
              ))}
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-ink-500 mb-4">No products found matching your criteria.</p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <ProductGrid
              products={paginatedProducts}
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6'
                  : 'space-y-4'
              }
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page: number;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? 'bg-brand hover:bg-brand-600' : ''}
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
