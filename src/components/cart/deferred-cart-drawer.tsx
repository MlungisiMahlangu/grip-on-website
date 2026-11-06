"use client";

import dynamic from "next/dynamic";
import { useUIStore } from "@/store/ui";

const CartDrawer = dynamic(
  () => import("@/components/cart/cart-drawer").then((module) => module.CartDrawer),
  { ssr: false },
);

export function DeferredCartDrawer() {
  const cartOpen = useUIStore((state) => state.cartOpen);
  return cartOpen ? <CartDrawer /> : null;
}
