"use client";

import { useEffect, useState } from "react";
import type { ProductType } from "@/lib/supabase/types";

export type SearchResult = {
  slug: string;
  name: string;
  type: ProductType;
  priceCents: number;
  image: string | null;
};

export type SearchStatus = "idle" | "loading" | "done" | "error";

const DEBOUNCE_MS = 280;

type SearchState = {
  query: string;
  results: SearchResult[];
  error: boolean;
};

export function useProductSearch(query: string) {
  const [state, setState] = useState<SearchState | null>(null);
  const trimmed = query.trim();

  useEffect(() => {
    if (!trimmed) return;

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) throw new Error("Search failed");

        const data: { results?: SearchResult[] } = await response.json();
        if (controller.signal.aborted) return;
        setState({ query: trimmed, results: data.results ?? [], error: false });
      } catch {
        if (controller.signal.aborted) return;
        setState({ query: trimmed, results: [], error: true });
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  if (!trimmed) return { status: "idle" as const, results: [] as SearchResult[] };

  if (!state || state.query !== trimmed) {
    return { status: "loading" as const, results: [] as SearchResult[] };
  }

  return {
    status: (state.error ? "error" : "done") as SearchStatus,
    results: state.results,
  };
}
