"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { MAX_ITEM_QUANTITY } from "@/lib/catalogue/types";

export type CartItem = {
  key: string;
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  colourName: string;
  colourSlug: string;
  size: string;
  priceCents: number;
  imageUrl: string | null;
  quantity: number;
};

type NewCartItem = Omit<CartItem, "key" | "quantity"> & { quantity?: number };

type CartState = {
  items: CartItem[];
  addItem: (item: NewCartItem) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const quantity = Math.max(1, Math.min(MAX_ITEM_QUANTITY, item.quantity ?? 1));
          const existing = state.items.find((entry) => entry.variantId === item.variantId);

          if (existing) {
            return {
              items: state.items.map((entry) =>
                entry.variantId === item.variantId
                  ? {
                      ...entry,
                      ...item,
                      quantity: Math.min(MAX_ITEM_QUANTITY, entry.quantity + quantity),
                    }
                  : entry,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...item,
                key: item.variantId,
                quantity,
              },
            ],
          };
        }),
      setQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items.map((entry) =>
            entry.key === key
              ? {
                  ...entry,
                  quantity: Math.max(1, Math.min(MAX_ITEM_QUANTITY, quantity)),
                }
              : entry,
          ),
        })),
      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((entry) => entry.key !== key) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "grip-on-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
