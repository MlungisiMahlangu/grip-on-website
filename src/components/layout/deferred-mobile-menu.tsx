"use client";

import dynamic from "next/dynamic";
import { useUIStore } from "@/store/ui";

const MobileMenu = dynamic(
  () => import("@/components/layout/mobile-menu").then((module) => module.MobileMenu),
  { ssr: false },
);

export function DeferredMobileMenu() {
  const menuOpen = useUIStore((state) => state.menuOpen);
  return menuOpen ? <MobileMenu /> : null;
}
