import { useState } from 'react';
import { Save, Store, Globe, CreditCard, Bell } from 'lucide-react';
import { AdminPageHeader } from './AdminLayout';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

interface Settings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  currency: string;
  timezone: string;
  taxRate: number;
  freeShippingThreshold: number;
  flatShippingRate: number;
}

export function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    storeName: 'Abundant Merchandise',
    storeEmail: 'support@abundantmerch.com',
    storePhone: '(555) 123-4567',
    storeAddress: '123 Commerce St, Suite 100, Los Angeles, CA 90001',
    currency: 'USD',
    timezone: 'America/Los_Angeles',
    taxRate: 8,
    freeShippingThreshold: 49,
    flatShippingRate: 5.99,
  });

  const handleSave = async () => {
    setLoading(true);
    // In a real app, this would save to the database
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description="Configure your store settings"
        actions={
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-brand hover:bg-brand-600"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </Button>
        }
      />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-white border border-ink-200 rounded-lg p-1">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Shipping
          </TabsTrigger>
          <TabsTrigger value="tax" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Tax
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-ink-900 mb-4">Store Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) =>
                      setSettings({ ...settings, storeName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.storeEmail}
                    onChange={(e) =>
                      setSettings({ ...settings, storeEmail: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={settings.storePhone}
                    onChange={(e) =>
                      setSettings({ ...settings, storePhone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) =>
                      setSettings({ ...settings, currency: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:border-brand"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (&euro;)</option>
                    <option value="GBP">GBP (&pound;)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-ink-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={settings.storeAddress}
                    onChange={(e) =>
                      setSettings({ ...settings, storeAddress: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) =>
                      setSettings({ ...settings, timezone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:border-brand"
                  >
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="Europe/London">London (GMT)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="shipping">
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-ink-900 mb-4">Shipping Rates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">
                    Free Shipping Threshold ($)
                  </label>
                  <input
                    type="number"
                    value={settings.freeShippingThreshold}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        freeShippingThreshold: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:border-brand"
                  />
                  <p className="text-xs text-ink-500 mt-1">
                    Orders above this amount get free shipping
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">
                    Flat Shipping Rate ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.flatShippingRate}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        flatShippingRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:border-brand"
                  />
                  <p className="text-xs text-ink-500 mt-1">
                    Standard shipping rate for orders below threshold
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <h4 className="font-medium text-ink-900 mb-3">Delivery Estimates</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 bg-ink-50 rounded-lg">
                  <span className="text-ink-600">Standard Shipping</span>
                  <span className="font-medium text-ink-900">5-7 business days</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-ink-50 rounded-lg">
                  <span className="text-ink-600">Express Shipping</span>
                  <span className="font-medium text-ink-900">2-3 business days</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-ink-50 rounded-lg">
                  <span className="text-ink-600">Warehouse Items</span>
                  <span className="font-medium text-ink-900">2-3 business days</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tax">
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-ink-900 mb-4">Tax Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">
                    Default Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.taxRate}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        taxRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:border-brand"
                  />
                  <p className="text-xs text-ink-500 mt-1">
                    Applied to orders where tax is calculated
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <h4 className="font-medium text-ink-900 mb-3">Tax Notes</h4>
              <div className="text-sm text-ink-600 space-y-2">
                <p>- Tax is calculated based on the shipping address</p>
                <p>- Digital products may be exempt from tax in some regions</p>
                <p>- Tax rates are automatically updated based on destination</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-ink-900 mb-4">Email Notifications</h3>
              <div className="space-y-3">
                {[
                  { id: 'order_confirm', label: 'Order Confirmation', desc: 'Send when an order is placed' },
                  { id: 'order_shipped', label: 'Order Shipped', desc: 'Send when an order is shipped' },
                  { id: 'order_delivered', label: 'Order Delivered', desc: 'Send when an order is delivered' },
                  { id: 'order_cancelled', label: 'Order Cancelled', desc: 'Send when an order is cancelled' },
                  { id: 'low_stock', label: 'Low Stock Alert', desc: 'Send when product stock is low' },
                  { id: 'new_customer', label: 'New Customer', desc: 'Send when a new customer registers' },
                ].map((notif) => (
                  <label
                    key={notif.id}
                    className="flex items-start gap-3 p-3 bg-ink-50 rounded-lg cursor-pointer hover:bg-ink-100"
                  >
                    <input
                      type="checkbox"
                      defaultChecked
                      className="mt-1 rounded border-ink-300"
                    />
                    <div>
                      <p className="font-medium text-ink-900">{notif.label}</p>
                      <p className="text-sm text-ink-500">{notif.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
