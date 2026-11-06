import { publicEnv } from "@/lib/env";

export const MEDIA_BUCKET = "product-images";

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  const { NEXT_PUBLIC_SUPABASE_URL } = publicEnv();
  const encoded = path
    .replace(/^\/+/, "")
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  return `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${encoded}`;
}
