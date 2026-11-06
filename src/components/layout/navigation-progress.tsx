"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const hideTimer = useRef<number | null>(null);
  const activeRef = useRef(false);

  useEffect(() => {
    const start = () => {
      if (activeRef.current) return;
      activeRef.current = true;
      setActive(true);
      setProgress(12);
      window.setTimeout(() => {
        if (activeRef.current) setProgress(72);
      }, 180);
    };

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      const next = new URL(anchor.href, window.location.href);
      if (next.origin !== window.location.origin) return;
      if (next.pathname === window.location.pathname && next.search === window.location.search) return;

      start();
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  useEffect(() => {
    if (!activeRef.current) return;

    activeRef.current = false;
    setProgress(100);
    hideTimer.current = window.setTimeout(() => {
      setActive(false);
      setProgress(0);
    }, 240);

    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 bg-transparent"
    >
      <div
        className="h-full bg-accent shadow-[0_0_10px_var(--accent)] transition-[width,opacity] duration-200 ease-out"
        style={{ width: `${progress}%`, opacity: active ? 1 : 0 }}
      />
    </div>
  );
}
