"use client";

import { useEffect } from "react";
import { markMessageReadAction } from "@/lib/admin/message-actions";

export function MarkMessageRead({ id }: { id: string }) {
  useEffect(() => {
    void markMessageReadAction(id);
  }, [id]);

  return null;
}
