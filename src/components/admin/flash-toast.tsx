"use client";

import { useEffect } from "react";
import { toast } from "@/lib/toast";

export function FlashToast({ message }: { message: string }) {
  useEffect(() => {
    toast.success(message);
  }, [message]);

  return null;
}
