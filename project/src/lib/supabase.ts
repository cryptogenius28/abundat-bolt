import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL: Missing Supabase environment variables!');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Database types
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'customer' | 'admin' | 'staff';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  platform: 'cj_dropshipping' | 'spocket' | 'aliexpress' | 'manual' | 'other';
  api_key: string | null;
  api_secret: string | null;
  api_url: string | null;
  is_active: boolean;
  sync_enabled: boolean;
  last_sync_at: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  description: string | null;
  brand: string | null;
  price: number;
  sale_price: number | null;
  cost_price: number | null;
  category_id: string | null;
  supplier_id: string | null;
  supplier_product_id: string | null;
  supplier_sku: string | null;
  images: string[];
  variants: ProductVariant[];
  tags: string[];
  stock_qty: number;
  low_stock_threshold: number;
  weight: number | null;
  dimensions: { length: number; width: number; height: number } | null;
  fulfillment_type: 'warehouse' | 'dropship';
  is_featured: boolean;
  is_active: boolean;
  rating: number;
  review_count: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  category?: Category;
  supplier?: Supplier;
}

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface Address {
  id: string;
  user_id: string;
  label: string | null;
  full_name: string;
  phone: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  fulfillment_status: 'unfulfilled' | 'partial' | 'fulfilled';
  shipping_name: string;
  shipping_phone: string | null;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  promo_code: string | null;
  supplier_order_ids: string[];
  tracking_numbers: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
  user?: Profile;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  supplier_id: string | null;
  sku: string;
  title: string;
  price: number;
  quantity: number;
  variants: Record<string, string>;
  fulfillment_status: string;
  tracking_number: string | null;
  supplier_order_id: string | null;
  supplier_order_status: string | null;
  supplier_sku?: string | null;
  created_at: string;
  product?: Product;
  supplier?: Supplier;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string | null;
  rating: number;
  title: string | null;
  content: string | null;
  images: string[];
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  product?: Product;
  user?: Profile;
}

// Auth helpers
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function isAdmin(userId: string) {
  const profile = await getProfile(userId);
  return profile?.role === 'admin' || profile?.role === 'staff';
}

// Product helpers
export async function getProducts(options?: {
  category?: string;
  featured?: boolean;
  active?: boolean;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('products')
    .select('*, category:categories(*), supplier:suppliers(*)', { count: 'exact' });

  if (options?.category) {
    query = query.eq('category_id', options.category);
  }
  if (options?.featured !== undefined) {
    query = query.eq('is_featured', options.featured);
  }
  if (options?.active !== undefined) {
    query = query.eq('is_active', options.active);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data as Product[], count };
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*), supplier:suppliers(*)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Product;
}

export async function getProductBySku(sku: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*), supplier:suppliers(*)')
    .eq('sku', sku)
    .single();

  if (error) throw error;
  return data as Product;
}

// Order helpers
export async function getOrders(options?: {
  status?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('orders')
    .select('*, user:profiles(*), items:order_items(*, product:products(*), supplier:suppliers(*))', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }
  if (options?.userId) {
    query = query.eq('user_id', options.userId);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data as Order[], count };
}

export async function getOrderById(id: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, user:profiles(*), items:order_items(*, product:products(*), supplier:suppliers(*))')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Order;
}

export async function updateOrderStatus(id: string, status: Order['status']) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}

// Category helpers
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data as Category[];
}

// Supplier helpers
export async function getSuppliers() {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Supplier[];
}

export async function getActiveSuppliers() {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data as Supplier[];
}

// Additional product helpers for storefront
export async function getProductsByCategory(categorySlug: string, options?: {
  limit?: number;
  offset?: number;
}) {
  // First get the category ID from slug
  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (catError || !category) {
    return { data: [], count: 0 };
  }

  let query = supabase
    .from('products')
    .select('*, category:categories(*)', { count: 'exact' })
    .eq('category_id', category.id)
    .eq('is_active', true);

  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data as Product[], count };
}

export async function getFeaturedProducts(limit = 8) {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_featured', true)
    .eq('is_active', true)
    .limit(limit);

  if (error) throw error;
  return data as Product[];
}

export async function getOnSaleProducts(limit = 8) {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .not('sale_price', 'is', null)
    .eq('is_active', true)
    .limit(limit);

  if (error) throw error;
  return data as Product[];
}

export async function getNewArrivals(limit = 8) {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Product[];
}

export async function searchProducts(query: string, options?: {
  category?: string;
  limit?: number;
}) {
  let queryBuilder = supabase
    .from('products')
    .select('*, category:categories(*)', { count: 'exact' })
    .eq('is_active', true);

  // Use text search on title and description
  queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%,tags.cs.{${query}}`);

  if (options?.category) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', options.category)
      .single();
    if (cat) {
      queryBuilder = queryBuilder.eq('category_id', cat.id);
    }
  }

  if (options?.limit) {
    queryBuilder = queryBuilder.limit(options.limit);
  }

  const { data, error, count } = await queryBuilder;
  if (error) throw error;
  return { data: data as Product[], count };
}

export async function getRelatedProducts(productId: string, limit = 4) {
  // Get the current product's category
  const { data: product, error: prodError } = await supabase
    .from('products')
    .select('category_id')
    .eq('id', productId)
    .single();

  if (prodError || !product) {
    return [];
  }

  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('category_id', product.category_id)
    .eq('is_active', true)
    .neq('id', productId)
    .limit(limit);

  if (error) throw error;
  return data as Product[];
}

export async function getCategoryBySlug(slug: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data as Category;
}

export async function getCategoriesWithProductCount() {
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (catError) throw catError;

  // Get product counts for each category
  const { data: productCounts, error: countError } = await supabase
    .from('products')
    .select('category_id')
    .eq('is_active', true);

  if (countError) throw countError;

  // Count products per category
  const countMap = new Map<string, number>();
  productCounts?.forEach(p => {
    if (p.category_id) {
      countMap.set(p.category_id, (countMap.get(p.category_id) || 0) + 1);
    }
  });

  return categories.map(cat => ({
    ...cat,
    product_count: countMap.get(cat.id) || 0
  }));
}
