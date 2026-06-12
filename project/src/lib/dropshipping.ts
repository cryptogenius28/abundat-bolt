/**
 * Dropshipping Integration Module
 * Supports CJ Dropshipping, Spocket, and AliExpress
 */

import type { Supplier, Order, OrderItem } from './supabase';

export type DropshippingPlatform = 'cj_dropshipping' | 'spocket' | 'aliexpress';

export interface DropshipOrderResult {
  success: boolean;
  supplierOrderId?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  error?: string;
}

export interface DropshipProductImport {
  success: boolean;
  productId?: string;
  error?: string;
}

export interface SupplierProduct {
  id: string;
  sku: string;
  title: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  variants: { name: string; options: string[] }[];
  stockQty: number;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  shippingInfo?: {
    method: string;
    cost: number;
    estimatedDays: string;
  };
}

/**
 * Base Dropshipping Integration Class
 * Extend this class for each platform
 */
export abstract class DropshippingIntegration {
  protected supplier: Supplier;

  constructor(supplier: Supplier) {
    this.supplier = supplier;
  }

  abstract testConnection(): Promise<boolean>;
  abstract importProducts(limit?: number): Promise<DropshipProductImport[]>;
  abstract syncInventory(): Promise<boolean>;
  abstract syncOrderStatus(orderId: string): Promise<{ status: string; tracking?: string }>;
  abstract placeOrder(order: Order, items: OrderItem[]): Promise<DropshipOrderResult>;
  abstract getProduct(productId: string): Promise<SupplierProduct | null>;
  abstract searchProducts(query: string): Promise<SupplierProduct[]>;
}

/**
 * CJ Dropshipping Integration
 */
export class CJDropshipping extends DropshippingIntegration {
  private baseUrl = this.supplier.api_url || 'https://developers.cjdropshipping.com/api2.0/v1';
  private apiKey = this.supplier.api_key || '';
  private apiSecret = this.supplier.api_secret || '';

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/authentication/getAccessToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: this.apiKey,
          password: this.apiSecret,
        }),
      });
      const data = await response.json();
      return data.code === 200;
    } catch {
      return false;
    }
  }

  async importProducts(limit = 50): Promise<DropshipProductImport[]> {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(`${this.baseUrl}/product/list?pageNum=1&pageSize=${limit}`, {
        headers: {
          'CJ-Access-Token': token,
        },
      });
      const data = await response.json();

      if (data.code !== 200) return [];

      return data.data.list.map((product: Record<string, unknown>) => ({
        success: true,
        productId: product.productSku as string,
      }));
    } catch {
      return [];
    }
  }

  async syncInventory(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(`${this.baseUrl}/product/inventory/batch`, {
        method: 'POST',
        headers: {
          'CJ-Access-Token': token,
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async syncOrderStatus(orderId: string): Promise<{ status: string; tracking?: string }> {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(`${this.baseUrl}/order/queryOrder?orderId=${orderId}`, {
        headers: {
          'CJ-Access-Token': token,
        },
      });
      const data = await response.json();

      if (data.code !== 200) {
        return { status: 'unknown' };
      }

      const order = data.data;
      return {
        status: this.mapCJStatus(order.orderStatus),
        tracking: order.trackingNumber,
      };
    } catch {
      return { status: 'unknown' };
    }
  }

  async placeOrder(order: Order, items: OrderItem[]): Promise<DropshipOrderResult> {
    try {
      const token = await this.getAccessToken();

      const orderData = {
        orderNo: order.order_number,
        shippingAddress: {
          name: order.shipping_name,
          phone: order.shipping_phone || '',
          country: order.shipping_country,
          province: order.shipping_state,
          city: order.shipping_city,
          address: order.shipping_address_line1,
          address2: order.shipping_address_line2 || '',
          zipCode: order.shipping_postal_code,
        },
        products: items.map((item) => ({
          sku: item.sku,
          quantity: item.quantity,
          variant: item.variants,
        })),
      };

      const response = await fetch(`${this.baseUrl}/order/createOrder`, {
        method: 'POST',
        headers: {
          'CJ-Access-Token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.code !== 200) {
        return {
          success: false,
          error: data.message || 'Failed to place order with CJ',
        };
      }

      return {
        success: true,
        supplierOrderId: data.data.orderId,
        estimatedDelivery: data.data.estimatedDelivery || '7-15 days',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getProduct(productId: string): Promise<SupplierProduct | null> {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(`${this.baseUrl}/product/query?productId=${productId}`, {
        headers: {
          'CJ-Access-Token': token,
        },
      });
      const data = await response.json();

      if (data.code !== 200) return null;

      return this.mapCJProduct(data.data);
    } catch {
      return null;
    }
  }

  async searchProducts(query: string): Promise<SupplierProduct[]> {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(
        `${this.baseUrl}/product/list?keyword=${encodeURIComponent(query)}`,
        {
          headers: {
            'CJ-Access-Token': token,
          },
        }
      );
      const data = await response.json();

      if (data.code !== 200) return [];

      return data.data.list.map((p: Record<string, unknown>) => this.mapCJProduct(p));
    } catch {
      return [];
    }
  }

  private async getAccessToken(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/authentication/getAccessToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: this.apiKey,
        password: this.apiSecret,
      }),
    });
    const data = await response.json();
    return data.data.accessToken;
  }

  private mapCJStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': 'pending',
      'PROCESSING': 'processing',
      'SHIPPED': 'shipped',
      'DELIVERED': 'delivered',
      'CANCELLED': 'cancelled',
    };
    return statusMap[status] || status.toLowerCase();
  }

  private mapCJProduct(product: Record<string, unknown>): SupplierProduct {
    return {
      id: product.productId as string,
      sku: product.productSku as string,
      title: product.productName as string,
      description: product.productDesc as string,
      price: product.sellPrice as number,
      salePrice: product.discountPrice as number | undefined,
      images: (product.productImage as string[]) || [],
      variants: (product.productVariant as { name: string; options: string[] }[]) || [],
      stockQty: (product.inventory as number) || 0,
      weight: product.weight as number,
      dimensions: product.productSize as { length: number; width: number; height: number },
      shippingInfo: {
        method: 'Standard Shipping',
        cost: 0,
        estimatedDays: '7-15',
      },
    };
  }
}

/**
 * Spocket Integration
 */
export class SpocketIntegration extends DropshippingIntegration {
  private baseUrl = this.supplier.api_url || 'https://api.spocket.co/v1';
  private apiKey = this.supplier.api_key || '';

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async importProducts(limit = 50): Promise<DropshipProductImport[]> {
    try {
      const response = await fetch(`${this.baseUrl}/products?page=1&per_page=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      const data = await response.json();

      return data.products.map((product: Record<string, unknown>) => ({
        success: true,
        productId: product.id as string,
      }));
    } catch {
      return [];
    }
  }

  async syncInventory(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/inventory/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async syncOrderStatus(orderId: string): Promise<{ status: string; tracking?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      const data = await response.json();

      return {
        status: data.order?.status || 'unknown',
        tracking: data.order?.tracking_number,
      };
    } catch {
      return { status: 'unknown' };
    }
  }

  async placeOrder(order: Order, items: OrderItem[]): Promise<DropshipOrderResult> {
    try {
      const orderData = {
        order: {
          number: order.order_number,
          shipping_address: {
            name: order.shipping_name,
            phone: order.shipping_phone,
            country: order.shipping_country,
            state: order.shipping_state,
            city: order.shipping_city,
            address1: order.shipping_address_line1,
            address2: order.shipping_address_line2,
            zip: order.shipping_postal_code,
          },
          items: items.map((item) => ({
            product_id: item.product_id,
            variant_id: item.supplier_sku || undefined,
            quantity: item.quantity,
          })),
        },
      };

      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to place order with Spocket',
        };
      }

      return {
        success: true,
        supplierOrderId: data.order.id,
        estimatedDelivery: data.order.estimated_delivery || '7-14 days',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getProduct(productId: string): Promise<SupplierProduct | null> {
    try {
      const response = await fetch(`${this.baseUrl}/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      const data = await response.json();

      if (!data.product) return null;

      return {
        id: data.product.id,
        sku: data.product.sku,
        title: data.product.title,
        description: data.product.description,
        price: data.product.price,
        salePrice: data.product.compare_at_price,
        images: data.product.images || [],
        variants: data.product.variants || [],
        stockQty: data.product.inventory?.quantity || 0,
        weight: data.product.weight,
        shippingInfo: {
          method: data.product.shipping_method || 'Standard',
          cost: data.product.shipping_cost || 0,
          estimatedDays: '5-14',
        },
      };
    } catch {
      return null;
    }
  }

  async searchProducts(query: string): Promise<SupplierProduct[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/products/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );
      const data = await response.json();

      return (data.products || []).map((p: { id: string; sku: string; title: string; description: string; price: number; images?: string[]; variants?: { name: string; options: string[] }[]; inventory?: { quantity: number } }) => ({
        id: p.id,
        sku: p.sku,
        title: p.title,
        description: p.description,
        price: p.price,
        images: p.images || [],
        variants: p.variants || [],
        stockQty: p.inventory?.quantity || 0,
      }));
    } catch {
      return [];
    }
  }
}

/**
 * AliExpress Integration (via AliExpress API)
 */
export class AliExpressIntegration extends DropshippingIntegration {
  protected readonly _baseUrl = this.supplier.api_url || 'https://api-sg.aliexpress.com/seller';
  private apiKey = this.supplier.api_key || '';
  private apiSecret = this.supplier.api_secret || '';

  async testConnection(): Promise<boolean> {
    try {
      // AliExpress requires OAuth, so we just validate credentials exist
      return !!(this.apiKey && this.apiSecret);
    } catch {
      return false;
    }
  }

  async importProducts(limit = 50): Promise<DropshipProductImport[]> {
    // AliExpress API integration would go here
    // For now, return empty array - requires OAuth flow
    console.log(`Importing ${limit} products from AliExpress`);
    return [];
  }

  async syncInventory(): Promise<boolean> {
    console.log('Syncing inventory from AliExpress');
    return false;
  }

  async syncOrderStatus(orderId: string): Promise<{ status: string; tracking?: string }> {
    console.log(`Syncing order status for ${orderId}`);
    return { status: 'unknown' };
  }

  async placeOrder(_order: Order, _items: OrderItem[]): Promise<DropshipOrderResult> {
    // AliExpress requires manual ordering through their platform
    // Return a result indicating manual processing needed
    return {
      success: false,
      error: 'AliExpress orders require manual processing through the AliExpress dashboard',
    };
  }

  async getProduct(productId: string): Promise<SupplierProduct | null> {
    console.log(`Getting product ${productId} from AliExpress`);
    return null;
  }

  async searchProducts(query: string): Promise<SupplierProduct[]> {
    console.log(`Searching AliExpress for: ${query}`);
    return [];
  }
}

/**
 * Factory function to create the appropriate integration
 */
export function createDropshippingIntegration(supplier: Supplier): DropshippingIntegration | null {
  switch (supplier.platform) {
    case 'cj_dropshipping':
      return new CJDropshipping(supplier);
    case 'spocket':
      return new SpocketIntegration(supplier);
    case 'aliexpress':
      return new AliExpressIntegration(supplier);
    default:
      console.warn(`Unknown dropshipping platform: ${supplier.platform}`);
      return null;
  }
}

/**
 * Helper to place an order with all relevant suppliers
 */
export async function placeOrderWithSuppliers(
  order: Order,
  items: OrderItem[],
  suppliers: Supplier[]
): Promise<Record<string, DropshipOrderResult>> {
  const results: Record<string, DropshipOrderResult> = {};

  // Group items by supplier
  const itemsBySupplier = new Map<string, OrderItem[]>();
  for (const item of items) {
    const supplierId = item.supplier_id || 'warehouse';
    if (!itemsBySupplier.has(supplierId)) {
      itemsBySupplier.set(supplierId, []);
    }
    itemsBySupplier.get(supplierId)!.push(item);
  }

  // Place orders with each supplier
  for (const [supplierId, supplierItems] of itemsBySupplier) {
    if (supplierId === 'warehouse') {
      // Warehouse items are fulfilled internally
      results[supplierId] = {
        success: true,
        supplierOrderId: 'internal',
        estimatedDelivery: '2-3 days',
      };
      continue;
    }

    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) {
      results[supplierId] = {
        success: false,
        error: 'Supplier not found',
      };
      continue;
    }

    const integration = createDropshippingIntegration(supplier);
    if (!integration) {
      results[supplierId] = {
        success: false,
        error: 'Could not create integration for supplier',
      };
      continue;
    }

    results[supplierId] = await integration.placeOrder(order, supplierItems);
  }

  return results;
}

/**
 * Sync order status with all suppliers
 */
export async function syncOrderStatusWithSuppliers(
  _order: Order,
  items: OrderItem[],
  suppliers: Supplier[]
): Promise<void> {
  for (const item of items) {
    if (!item.supplier_id || !item.supplier_order_id) continue;

    const supplier = suppliers.find((s) => s.id === item.supplier_id);
    if (!supplier) continue;

    const integration = createDropshippingIntegration(supplier);
    if (!integration) continue;

    const result = await integration.syncOrderStatus(item.supplier_order_id);

    // Update item with new tracking if available
    if (result.tracking && result.tracking !== item.tracking_number) {
      // Would update database here
      console.log(`New tracking for item ${item.id}: ${result.tracking}`);
    }
  }
}
