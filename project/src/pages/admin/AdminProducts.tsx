import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MoveVertical as MoreVertical, CreditCard as Edit, Trash2, Eye, Package, Truck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Product, Category, Supplier } from '../../lib/supabase';
import { AdminPageHeader } from './AdminLayout';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [_suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  useEffect(() => {
    loadProducts();
    loadFilters();
  }, []);

  async function loadFilters() {
    const { data: cats } = await supabase.from('categories').select('*');
    const { data: sups } = await supabase.from('suppliers').select('*');
    setCategories(cats || []);
    setSuppliers(sups || []);
  }

  async function loadProducts() {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*, category:categories(*), supplier:suppliers(*)')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`title.ilike.%${search}%,sku.ilike.%${search}%`);
      }
      if (categoryFilter !== 'all') {
        query = query.eq('category_id', categoryFilter);
      }
      if (fulfillmentFilter !== 'all') {
        query = query.eq('fulfillment_type', fulfillmentFilter);
      }
      if (stockFilter === 'low') {
        query = query.lt('stock_qty', 5);
      } else if (stockFilter === 'out') {
        query = query.eq('stock_qty', 0);
      }

      const { data } = await query;
      setProducts((data as Product[]) || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, [search, categoryFilter, fulfillmentFilter, stockFilter]);

  async function toggleProductActive(product: Product) {
    await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id);
    loadProducts();
  }

  async function deleteProduct(product: Product) {
    if (confirm('Are you sure you want to delete this product?')) {
      await supabase.from('products').delete().eq('id', product.id);
      loadProducts();
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description="Manage your product catalog"
        actions={
          <Link to="/admin/products/new">
            <Button className="bg-brand hover:bg-brand-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-ink-200 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:border-brand"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={fulfillmentFilter} onValueChange={setFulfillmentFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Fulfillment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="warehouse">Warehouse</SelectItem>
              <SelectItem value="dropship">Dropship</SelectItem>
            </SelectContent>
          </Select>
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Stock Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-ink-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-ink-50 border-b border-ink-200">
                <th className="text-left px-4 py-3 text-sm font-medium text-ink-600">
                  Product
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-ink-600">
                  SKU
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-ink-600">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-ink-600">
                  Price
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-ink-600">
                  Stock
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-ink-600">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-ink-600">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-ink-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-ink-500">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-ink-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-ink-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.images[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-ink-900 truncate max-w-xs">
                            {product.title}
                          </p>
                          <p className="text-xs text-ink-500">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-600">
                      {product.sku}
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-600">
                      {product.category?.name || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="font-medium text-ink-900">
                          {formatCurrency(product.sale_price || product.price)}
                        </p>
                        {product.sale_price && (
                          <p className="text-xs text-ink-400 line-through">
                            {formatCurrency(product.price)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          product.stock_qty === 0
                            ? 'bg-red-100 text-red-700'
                            : product.stock_qty < 5
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {product.stock_qty}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-ink-100 text-ink-700">
                        {product.fulfillment_type === 'warehouse' ? (
                          <>
                            <Package className="w-3 h-3" />
                            Warehouse
                          </>
                        ) : (
                          <>
                            <Truck className="w-3 h-3" />
                            Dropship
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleProductActive(product)}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          product.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-ink-100 rounded-lg">
                            <MoreVertical className="w-4 h-4 text-ink-600" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link
                              to={`/product/${product.id}`}
                              className="flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              to={`/admin/products/${product.id}/edit`}
                              className="flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteProduct(product)}
                            className="flex items-center gap-2 text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
