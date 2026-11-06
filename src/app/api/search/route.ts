import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/supabase/media";
import { checkRateLimit, requestKey } from "@/lib/rate-limit";

const RESULT_LIMIT = 8;
const QUERY_LIMIT = 80;

function cleanQuery(value: string) {
  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, QUERY_LIMIT);
}

export async function GET(request: Request) {
  const limited = checkRateLimit(await requestKey("search", request.headers), 240, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many searches. Try again shortly." },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(limited.retryAfterSeconds),
        },
      },
    );
  }

  const query = cleanQuery(new URL(request.url).searchParams.get("q") ?? "");

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const supabase = createPublicClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id,slug,name,tagline,price_cents,product_type")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Search is unavailable." }, { status: 500 });
  }

  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = (products ?? [])
    .filter((product) => {
      const text = [
        product.name,
        product.tagline ?? "",
        product.product_type,
        product.slug.replace(/-/g, " "),
      ]
        .join(" ")
        .toLowerCase();

      return tokens.every((token) => text.includes(token));
    })
    .slice(0, RESULT_LIMIT);

  const images = new Map<string, string | null>();

  if (matches.length > 0) {
    const { data: colours } = await supabase
      .from("product_colours")
      .select("product_id,front_image_path,sort_order")
      .in(
        "product_id",
        matches.map((product) => product.id),
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    for (const colour of colours ?? []) {
      if (!images.has(colour.product_id)) {
        images.set(colour.product_id, mediaUrl(colour.front_image_path));
      }
    }
  }

  return NextResponse.json(
    {
      results: matches.map((product) => ({
        slug: product.slug,
        name: product.name,
        type: product.product_type,
        priceCents: product.price_cents,
        image: images.get(product.id) ?? null,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
