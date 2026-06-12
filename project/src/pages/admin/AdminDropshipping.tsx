import { useEffect, useState } from 'react';
import {
  Truck,
  Plus,
  RefreshCw,
  Settings,
  Link,
  Unlink,
  Clock,
  Package,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Supplier, Product, Order, OrderItem } from '../../lib/supabase';
import {
  createDropshippingIntegration,
} from '../../lib/dropshipping';
import { AdminPageHeader, AdminStatCard } from './AdminLayout';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

export function AdminDropshipping() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dropshipOrders, setDropshipOrders] = useState<(Order & { items: OrderItem[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form state for supplier
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    platform: 'cj_dropshipping' as Supplier['platform'],
    api_key: '',
    api_secret: '',
    api_url: '',
    is_active: true,
    sync_enabled: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const { data: suppliersData } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });
      setSuppliers(suppliersData || []);

      const { data: productsData } = await supabase
        .from('products')
        .select('*, supplier:suppliers(*)')
        .eq('fulfillment_type', 'dropship');
      setProducts((productsData as Product[]) || []);

      // Get orders with dropship items
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*, items:order_items(*, supplier:suppliers(*))')
        .not('supplier_order_ids', 'eq', '[]')
        .order('created_at', { ascending: false })
        .limit(20);
      setDropshipOrders((ordersData as (Order & { items: OrderItem[] })[]) || []);
    } catch (error) {
      console.error('Error loading dropshipping data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function syncProducts(supplier: Supplier) {
    setSyncing(supplier.id);
    try {
      const integration = createDropshippingIntegration(supplier);
      if (!integration) {
        alert('Could not create integration');
        return;
      }

      const results = await integration.importProducts(50);
      alert(`Imported ${results.filter((r) => r.success).length} products`);

      // Update last sync time
      await supabase
        .from('suppliers')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', supplier.id);

      loadData();
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to sync products');
    } finally {
      setSyncing(null);
    }
  }

  async function syncInventory(supplier: Supplier) {
    setSyncing(supplier.id);
    try {
      const integration = createDropshippingIntegration(supplier);
      if (!integration) {
        alert('Could not create integration');
        return;
      }

      const result = await integration.syncInventory();
      alert(result ? 'Inventory synced successfully' : 'Failed to sync inventory');
      loadData();
    } catch (error) {
      console.error('Inventory sync error:', error);
      alert('Failed to sync inventory');
    } finally {
      setSyncing(null);
    }
  }

  async function saveSupplier() {
    try {
      if (editingSupplier) {
        await supabase
          .from('suppliers')
          .update(supplierForm)
          .eq('id', editingSupplier.id);
      } else {
        await supabase.from('suppliers').insert([supplierForm]);
      }
      setShowSupplierDialog(false);
      setEditingSupplier(null);
      setSupplierForm({
        name: '',
        platform: 'cj_dropshipping',
        api_key: '',
        api_secret: '',
        api_url: '',
        is_active: true,
        sync_enabled: true,
      });
      loadData();
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert('Failed to save supplier');
    }
  }

  async function toggleSupplierActive(supplier: Supplier) {
    await supabase
      .from('suppliers')
      .update({ is_active: !supplier.is_active })
      .eq('id', supplier.id);
    loadData();
  }

  function openEditSupplier(supplier: Supplier) {
    setEditingSupplier(supplier);
    setSupplierForm({
      name: supplier.name,
      platform: supplier.platform,
      api_key: supplier.api_key || '',
      api_secret: supplier.api_secret || '',
      api_url: supplier.api_url || '',
      is_active: supplier.is_active,
      sync_enabled: supplier.sync_enabled,
    });
    setShowSupplierDialog(true);
  }

  function getPlatformLabel(platform: string) {
    const labels: Record<string, string> = {
      cj_dropshipping: 'CJ Dropshipping',
      spocket: 'Spocket',
      aliexpress: 'AliExpress',
      manual: 'Manual',
      other: 'Other',
    };
    return labels[platform] || platform;
  }

  function formatLastSync(date: string | null) {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const activeSuppliers = suppliers.filter((s) => s.is_active);
  const totalDropshipProducts = products.length;
  const pendingOrdersCount = dropshipOrders.filter(
    (o) => o.fulfillment_status === 'unfulfilled' || o.fulfillment_status === 'partial'
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Dropshipping"
        description="Manage suppliers and sync products"
        actions={
          <Button
            onClick={() => {
              setEditingSupplier(null);
              setSupplierForm({
                name: '',
                platform: 'cj_dropshipping',
                api_key: '',
                api_secret: '',
                api_url: '',
                is_active: true,
                sync_enabled: true,
              });
              setShowSupplierDialog(true);
            }}
            className="bg-brand hover:bg-brand-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Supplier
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AdminStatCard
          title="Active Suppliers"
          value={activeSuppliers.length}
          icon={Link}
        />
        <AdminStatCard
          title="Dropship Products"
          value={totalDropshipProducts}
          icon={Package}
        />
        <AdminStatCard
          title="Pending Fulfillments"
          value={pendingOrdersCount}
          icon={Clock}
          changeType={pendingOrdersCount > 0 ? 'negative' : 'neutral'}
        />
        <AdminStatCard
          title="Total Suppliers"
          value={suppliers.length}
          icon={Truck}
        />
      </div>

      <Tabs defaultValue="suppliers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((supplier) => (
              <Card
                key={supplier.id}
                className={!supplier.is_active ? 'opacity-60' : ''}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    <p className="text-sm text-ink-500 mt-1">
                      {getPlatformLabel(supplier.platform)}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      supplier.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {supplier.is_active ? 'Active' : 'Inactive'}
                  </span>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-ink-600">
                    <div className="flex items-center justify-between">
                      <span>Last sync:</span>
                      <span>{formatLastSync(supplier.last_sync_at)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span>Auto sync:</span>
                      <span>{supplier.sync_enabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditSupplier(supplier)}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Settings
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleSupplierActive(supplier)}
                    >
                      {supplier.is_active ? (
                        <Unlink className="w-4 h-4 mr-1" />
                      ) : (
                        <Link className="w-4 h-4 mr-1" />
                      )}
                      {supplier.is_active ? 'Disable' : 'Enable'}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-brand hover:bg-brand-600"
                      onClick={() => syncProducts(supplier)}
                      disabled={!!syncing}
                    >
                      {syncing === supplier.id ? (
                        <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Package className="w-4 h-4 mr-1" />
                      )}
                      Sync Products
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => syncInventory(supplier)}
                      disabled={!!syncing}
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${
                          syncing === supplier.id ? 'animate-spin' : ''
                        }`}
                      />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {suppliers.length === 0 && (
              <div className="col-span-full text-center py-12 text-ink-500">
                <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No suppliers configured yet</p>
                <p className="text-sm mt-1">
                  Add a supplier to start dropshipping
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="bg-white rounded-xl border border-ink-200 overflow-hidden">
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
                      Supplier
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-ink-600">
                      Price
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-ink-600">
                      Stock
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-ink-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-ink-100 rounded-lg overflow-hidden">
                            {product.images[0] && (
                              <img
                                src={product.images[0]}
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <p className="font-medium text-ink-900 truncate max-w-xs">
                            {product.title}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-600">
                        {product.sku}
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-600">
                        {product.supplier?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-ink-900">
                        ${(product.sale_price || product.price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
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
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-ink-500">
                        No dropship products yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <div className="bg-white rounded-xl border border-ink-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-ink-50 border-b border-ink-200">
                    <th className="text-left px-4 py-3 text-sm font-medium text-ink-600">
                      Order
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-ink-600">
                      Items
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-ink-600">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-ink-600">
                      Supplier Orders
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-ink-600">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {dropshipOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-ink-50">
                      <td className="px-4 py-3 font-medium text-ink-900">
                        {order.order_number}
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-600">
                        {order.items
                          ?.filter((i) => i.supplier_id)
                          .map((i) => i.title)
                          .join(', ')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            order.fulfillment_status === 'fulfilled'
                              ? 'bg-green-100 text-green-700'
                              : order.fulfillment_status === 'partial'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {order.fulfillment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-600">
                        {order.supplier_order_ids?.length > 0
                          ? order.supplier_order_ids.join(', ')
                          : 'Pending'}
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {dropshipOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-ink-500">
                        No dropship orders yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Supplier Dialog */}
      <Dialog open={showSupplierDialog} onOpenChange={setShowSupplierDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
            </DialogTitle>
            <DialogDescription>
              Configure your dropshipping supplier credentials
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Supplier Name
              </label>
              <input
                type="text"
                value={supplierForm.name}
                onChange={(e) =>
                  setSupplierForm({ ...supplierForm, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:border-brand"
                placeholder="e.g., CJ Dropshipping US"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Platform
              </label>
              <Select
                value={supplierForm.platform}
                onValueChange={(value: Supplier['platform']) =>
                  setSupplierForm({ ...supplierForm, platform: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cj_dropshipping">CJ Dropshipping</SelectItem>
                  <SelectItem value="spocket">Spocket</SelectItem>
                  <SelectItem value="aliexpress">AliExpress</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                API Key / Email
              </label>
              <input
                type="text"
                value={supplierForm.api_key}
                onChange={(e) =>
                  setSupplierForm({ ...supplierForm, api_key: e.target.value })
                }
                className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:border-brand"
                placeholder="Your API key or login email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                API Secret / Password
              </label>
              <input
                type="password"
                value={supplierForm.api_secret}
                onChange={(e) =>
                  setSupplierForm({ ...supplierForm, api_secret: e.target.value })
                }
                className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:border-brand"
                placeholder="Your API secret or password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                API URL (optional)
              </label>
              <input
                type="text"
                value={supplierForm.api_url}
                onChange={(e) =>
                  setSupplierForm({ ...supplierForm, api_url: e.target.value })
                }
                className="w-full px-3 py-2 border border-ink-200 rounded-lg focus:outline-none focus:border-brand"
                placeholder="Custom API endpoint URL"
              />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={supplierForm.is_active}
                  onChange={(e) =>
                    setSupplierForm({ ...supplierForm, is_active: e.target.checked })
                  }
                  className="rounded border-ink-300"
                />
                <span className="text-sm text-ink-700">Active</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={supplierForm.sync_enabled}
                  onChange={(e) =>
                    setSupplierForm({
                      ...supplierForm,
                      sync_enabled: e.target.checked,
                    })
                  }
                  className="rounded border-ink-300"
                />
                <span className="text-sm text-ink-700">Auto Sync</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowSupplierDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveSupplier}
              className="bg-brand hover:bg-brand-600"
            >
              {editingSupplier ? 'Update' : 'Add'} Supplier
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
