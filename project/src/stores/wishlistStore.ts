import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../lib/supabase';

interface WishlistItem {
  product: Product;
  addedAt: string;
}

interface WishlistState {
  items: WishlistItem[];

  // Actions
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  clearAll: () => void;

  // Computed
  isWishlisted: (productId: string) => boolean;
  getItemCount: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const { items } = get();
        if (!items.find((item) => item.product.id === product.id)) {
          set({
            items: [
              ...items,
              { product, addedAt: new Date().toISOString() },
            ],
          });
        }
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      toggleItem: (product) => {
        const { items } = get();
        const exists = items.find((item) => item.product.id === product.id);

        if (exists) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      },

      isWishlisted: (productId) => {
        return get().items.some((item) => item.product.id === productId);
      },

      getItemCount: () => get().items.length,
      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'abundant-merch-wishlist',
    }
  )
);
