import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../lib/supabase';

interface RecentlyViewedState {
  items: { product: Product; viewedAt: string }[];

  // Actions
  addProduct: (product: Product) => void;
  clearAll: () => void;

  // Computed
  getRecentItems: (limit?: number) => Product[];
}

const MAX_RECENT_ITEMS = 8;

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],

      addProduct: (product) => {
        set((state) => {
          // Remove existing instance if present
          const filtered = state.items.filter(
            (item) => item.product.id !== product.id
          );

          // Add to beginning
          const newItems = [
            { product, viewedAt: new Date().toISOString() },
            ...filtered,
          ].slice(0, MAX_RECENT_ITEMS);

          return { items: newItems };
        });
      },

      clearAll: () => set({ items: [] }),

      getRecentItems: (limit = 8) => {
        return get()
          .items.slice(0, limit)
          .map((item) => item.product);
      },
    }),
    {
      name: 'abundant-merch-recently-viewed',
    }
  )
);
