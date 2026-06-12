import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../lib/supabase';

export interface CartItem {
  product: Product;
  quantity: number;
  variants?: Record<string, string>;
  addedAt: string;
}

interface CartState {
  items: CartItem[];
  promoCode: string | null;
  promoDiscount: number;
  drawerOpen: boolean;

  // Actions
  addItem: (product: Product, quantity: number, variants?: Record<string, string>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;

  // Computed
  getItemCount: () => number;
  getSubtotal: () => number;
  getDiscount: () => number;
  getShipping: () => number;
  getTax: () => number;
  getTotal: () => number;
}

// Promo codes
const PROMO_CODES: Record<string, { type: 'percent' | 'fixed'; value: number; minOrder?: number }> = {
  WELCOME10: { type: 'percent', value: 10 },
  FREESHIP: { type: 'fixed', value: 0 }, // Special case for free shipping
  SAVE20: { type: 'fixed', value: 20, minOrder: 100 },
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,
      promoDiscount: 0,
      drawerOpen: false,

      addItem: (product, quantity, variants) => {
        const { items } = get();
        const existingIndex = items.findIndex(
          (item) =>
            item.product.id === product.id &&
            JSON.stringify(item.variants) === JSON.stringify(variants)
        );

        if (existingIndex > -1) {
          const newItems = [...items];
          newItems[existingIndex].quantity += quantity;
          set({ items: newItems });
        } else {
          set({
            items: [
              ...items,
              {
                product,
                quantity,
                variants,
                addedAt: new Date().toISOString(),
              },
            ],
          });
        }
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [], promoCode: null, promoDiscount: 0 }),

      applyPromoCode: (code) => {
        const promo = PROMO_CODES[code.toUpperCase()];
        if (!promo) return false;

        const subtotal = get().getSubtotal();
        if (promo.minOrder && subtotal < promo.minOrder) return false;

        let discount = 0;
        if (promo.type === 'percent') {
          discount = subtotal * (promo.value / 100);
        } else {
          discount = promo.value;
        }

        set({ promoCode: code.toUpperCase(), promoDiscount: discount });
        return true;
      },

      removePromoCode: () => set({ promoCode: null, promoDiscount: 0 }),

      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.sale_price || item.product.price;
          return total + price * item.quantity;
        }, 0);
      },

      getDiscount: () => {
        return get().promoDiscount;
      },

      getShipping: () => {
        const subtotal = get().getSubtotal();
        const promoCode = get().promoCode;

        // Free shipping if promo is FREESHIP or subtotal >= 49
        if (promoCode === 'FREESHIP' || subtotal >= 49) {
          return 0;
        }
        return 5.99;
      },

      getTax: () => {
        const subtotal = get().getSubtotal();
        return subtotal * 0.08; // 8% tax
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscount();
        const shipping = get().getShipping();
        const tax = get().getTax();
        return Math.max(0, subtotal - discount + shipping + tax);
      },
    }),
    {
      name: 'abundant-merch-cart',
      partialize: (state) => ({
        items: state.items,
        promoCode: state.promoCode,
        promoDiscount: state.promoDiscount,
      }),
    }
  )
);
