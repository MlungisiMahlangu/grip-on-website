"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { Search } from "lucide-react";

const SearchDialog = dynamic(
  () => import("@/components/search/search-dialog").then((module) => module.SearchDialog),
  { ssr: false },
);

export function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        aria-haspopup="dialog"
        className="flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-card)] text-bone transition-colors hover:text-accent"
      >
        <Search className="h-[18px] w-[18px]" strokeWidth={1.7} />
      </button>

      {open ? <SearchDialog onClose={close} /> : null}
    </>
  );
}
