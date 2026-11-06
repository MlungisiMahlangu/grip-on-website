"use client";

import { create } from "zustand";

type UIState = {
  cartOpen: boolean;
  menuOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  cartOpen: false,
  menuOpen: false,
  openCart: () => set({ cartOpen: true, menuOpen: false }),
  closeCart: () => set({ cartOpen: false }),
  openMenu: () => set({ menuOpen: true, cartOpen: false }),
  closeMenu: () => set({ menuOpen: false }),
  toggleMenu: () => set((state) => ({ menuOpen: !state.menuOpen, cartOpen: false })),
}));
