import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Heart,
  Minus,
  Plus,
  Package,
  Truck,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { getProductById, getRelatedProducts, Product } from '../lib/supabase';
import { useCartStore, useWishlistStore, useRecentlyViewedStore } from '../stores';
import { ProductGrid } from '../components/product/ProductGrid';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [currentImage, setCurrentImage] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { addItem, openDrawer } = useCartStore();
  const { isWishlisted, toggleItem } = useWishlistStore();
  const { addProduct } = useRecentlyViewedStore();

  useEffect(() => {
    setLoading(true);
    setError(false);

    const fetchProduct = async () => {
      try {
        if (!id) {
          setError(true);
          return;
        }

        const productData = await getProductById(id);
        setProduct(productData);

        if (productData) {
          document.title = `${productData.title} | Abundant Merchandise`;

          // Initialize variants with first option
          if (productData.variants && productData.variants.length > 0) {
            const initial: Record<string, string> = {};
            productData.variants.forEach((v) => {
              if (v.options.length > 0) {
                initial[v.name] = v.options[0];
              }
            });
            setSelectedVariants(initial);
          }

          // Track viewed product
          addProduct(productData);

          // Fetch related products
          const related = await getRelatedProducts(productData.id, 4);
          setRelatedProducts(related);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, addProduct]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="aspect-square bg-ink-100 rounded-xl animate-pulse" />
          <div className="space-y-6">
            <div className="h-8 bg-ink-100 rounded animate-pulse" />
            <div className="h-4 bg-ink-100 rounded animate-pulse w-1/2" />
            <div className="h-6 bg-ink-100 rounded animate-pulse w-1/3" />
            <div className="h-24 bg-ink-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link to="/shop" className="text-brand hover:underline">
          Browse all products
        </Link>
      </div>
    );
  }

  const isWished = isWishlisted(product.id);
  const discount = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem(product, quantity, selectedVariants);
    openDrawer();
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Breadcrumbs
        items={[
          { label: product.category?.name || 'Category', path: `/category/${product.category?.slug || ''}` },
          { label: product.title },
        ]}
      />

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-ink-50 rounded-xl overflow-hidden">
            <img
              src={product.images[currentImage]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                -{discount}%
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto py-2">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    currentImage === index ? 'border-brand' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt={product.title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase text-brand mb-2">
              {product.brand}
            </p>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-ink-900 mb-2">
              {product.title}
            </h1>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(product.rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-ink-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-ink-500">
                {product.rating} ({product.review_count} reviews)
              </span>
              <span className="text-ink-300">|</span>
              <span className="text-ink-500">SKU: {product.sku}</span>
            </div>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-bold text-ink-900">
              ${(product.sale_price || product.price).toFixed(2)}
            </span>
            {product.sale_price && (
              <>
                <span className="text-xl text-ink-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-green-600 font-semibold">
                  Save ${(product.price - product.sale_price).toFixed(2)}
                </span>
              </>
            )}
          </div>

          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
              product.fulfillment_type === 'warehouse'
                ? 'bg-ink-900 text-white'
                : 'bg-ink-100 text-ink-700'
            }`}
          >
            {product.fulfillment_type === 'warehouse' ? (
              <Package className="w-4 h-4" />
            ) : (
              <Truck className="w-4 h-4" />
            )}
            <span>
              {product.fulfillment_type === 'warehouse'
                ? 'Ships from our warehouse — arrives in 2-3 days'
                : 'Dropshipped — arrives in 3-7 business days'}
            </span>
          </div>

          <p
            className={`text-sm font-medium ${
              product.stock_qty > 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {product.stock_qty > 0
              ? `In stock — ${product.stock_qty} available`
              : 'Out of stock'}
          </p>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4">
              {product.variants.map((variant) => (
                <div key={variant.name}>
                  <p className="text-sm font-medium text-ink-700 mb-2">
                    {variant.name}: <span className="text-ink-900">{selectedVariants[variant.name]}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map((option) => (
                      <button
                        key={option}
                        onClick={() =>
                          setSelectedVariants((prev) => ({
                            ...prev,
                            [variant.name]: option,
                          }))
                        }
                        className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                          selectedVariants[variant.name] === option
                            ? 'border-brand bg-brand/10 text-brand'
                            : 'border-ink-200 hover:border-brand text-ink-700'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="text-sm font-medium text-ink-700 mb-2">Quantity</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-ink-200 hover:border-brand transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.min(product.stock_qty, Math.max(1, parseInt(e.target.value) || 1))
                  )
                }
                className="w-20 h-10 text-center border border-ink-200 rounded-lg focus:outline-none focus:border-brand"
                max={product.stock_qty}
                min={1}
              />
              <button
                onClick={() => setQuantity(Math.min(product.stock_qty, quantity + 1))}
                disabled={quantity >= product.stock_qty}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-ink-200 hover:border-brand transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock_qty === 0}
              className="flex-1 bg-brand hover:bg-brand-600"
            >
              Add to Cart
            </Button>
            <Button
              variant="outline"
              onClick={() => toggleItem(product)}
              className={isWished ? 'border-red-500 text-red-500' : ''}
            >
              <Heart className={`w-5 h-5 ${isWished ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Trust features */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-ink-100">
            <div className="text-center">
              <RotateCcw className="w-6 h-6 text-brand mx-auto mb-1" />
              <p className="text-xs text-ink-600">30-Day Returns</p>
            </div>
            <div className="text-center">
              <ShieldCheck className="w-6 h-6 text-brand mx-auto mb-1" />
              <p className="text-xs text-ink-600">Secure Checkout</p>
            </div>
            <div className="text-center">
              <Truck className="w-6 h-6 text-brand mx-auto mb-1" />
              <p className="text-xs text-ink-600">Free Shipping $49+</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.review_count})</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6 prose max-w-none text-ink-700">
            <p>{product.description}</p>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-4">
              {/* Rating breakdown */}
              <div className="bg-ink-50 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl font-bold">{product.rating}</span>
                  <div>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(product.rating)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-ink-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-ink-500">{product.review_count} reviews</p>
                  </div>
                </div>
              </div>
              {/* Sample reviews */}
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm font-medium">Great product!</span>
                  </div>
                  <p className="text-sm text-ink-600 mb-2">
                    Exactly what I was looking for. Good quality and fast shipping.
                  </p>
                  <p className="text-xs text-ink-400">Verified Buyer - 2 weeks ago</p>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4].map((i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                      <Star className="w-4 h-4 text-ink-300" />
                    </div>
                    <span className="text-sm font-medium">Good value</span>
                  </div>
                  <p className="text-sm text-ink-600 mb-2">
                    Works as expected. Would recommend.
                  </p>
                  <p className="text-xs text-ink-400">Verified Buyer - 1 month ago</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-heading font-bold mb-6">You May Also Like</h2>
          <ProductGrid
            products={relatedProducts}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          />
        </div>
      )}
    </div>
  );
}
