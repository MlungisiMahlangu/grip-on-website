"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTop() {
  const pathname = usePathname();
  const popped = useRef(false);

  useEffect(() => {
    const handlePop = () => {
      popped.current = true;
      window.setTimeout(() => {
        popped.current = false;
      }, 300);
    };

    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  useEffect(() => {
    if (popped.current) return;
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
