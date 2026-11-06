import "server-only";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/supabase/media";
import { SIZE_ORDER, LOW_STOCK_THRESHOLD } from "@/lib/catalogue/types";
import type {
  Collection,
  Order,
  OrderEvent,
  OrderItem,
  OrderStatus,
  Product,
  ProductCollection,
  ProductColour,
  ProductVariant,
} from "@/lib/supabase/types";

function sizeRank(size: string) {
  const index = SIZE_ORDER.indexOf(size as (typeof SIZE_ORDER)[number]);
  return index === -1 ? SIZE_ORDER.length : index;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function searchTerm(value: string | undefined) {
  if (!value) return "";
  return value
    .replace(/[%_,()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export const ORDER_STATUS_VALUES: OrderStatus[] = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
];

export const PENDING_STATUSES: OrderStatus[] = ["pending", "confirmed", "packed"];

export type DashboardData = {
  ordersToday: number;
  pendingOrders: number;
  revenue30: number;
  orders30: number;
  lowStockCount: number;
  outOfStockCount: number;
  activeProducts: number;
  activeCollections: number;
  recentOrders: Order[];
  lowStock: {
    variantId: string;
    productName: string;
    colourName: string;
    size: string;
    stock: number;
    sku: string;
  }[];
};

function startOfSastDay() {
  const key = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return new Date(`${key}T00:00:00+02:00`).toISOString();
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    recentResult,
    todayResult,
    revenueResult,
    pendingResult,
    lowStockResult,
    outOfStockResult,
    productsResult,
    collectionsResult,
    productNamesResult,
    colourNamesResult,
  ] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(8),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfSastDay())
      .neq("status", "cancelled"),
    supabase
      .from("orders")
      .select("total_cents")
      .gte("created_at", since)
      .neq("status", "cancelled"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", PENDING_STATUSES),
    supabase
      .from("product_variants")
      .select("*")
      .eq("is_active", true)
      .gt("stock_quantity", 0)
      .lte("stock_quantity", LOW_STOCK_THRESHOLD)
      .order("stock_quantity", { ascending: true }),
    supabase
      .from("product_variants")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("stock_quantity", 0),
    supabase.from("products").select("id,name").eq("is_active", true),
    supabase.from("collections").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("products").select("id,name"),
    supabase.from("product_colours").select("id,name"),
  ]);

  const failed = [
    recentResult,
    todayResult,
    revenueResult,
    pendingResult,
    lowStockResult,
    outOfStockResult,
    productsResult,
    collectionsResult,
    productNamesResult,
    colourNamesResult,
  ].find((result) => result.error);

  if (failed?.error) throw new Error(`Dashboard query failed: ${failed.error.message}`);

  const productNames = new Map((productNamesResult.data ?? []).map((row) => [row.id, row.name]));
  const colourNames = new Map((colourNamesResult.data ?? []).map((row) => [row.id, row.name]));
  const products = productsResult.data ?? [];
  const productIds = new Set(products.map((product) => product.id));

  const lowStockVariants = (lowStockResult.data ?? []).filter((variant) =>
    productIds.has(variant.product_id),
  );

  return {
    ordersToday: todayResult.count ?? 0,
    pendingOrders: pendingResult.count ?? 0,
    revenue30: sum((revenueResult.data ?? []).map((order) => order.total_cents)),
    orders30: revenueResult.data?.length ?? 0,
    lowStockCount: lowStockVariants.length,
    outOfStockCount: outOfStockResult.count ?? 0,
    activeProducts: products.length,
    activeCollections: collectionsResult.count ?? 0,
    recentOrders: recentResult.data ?? [],
    lowStock: lowStockVariants.slice(0, 8).map((variant) => ({
      variantId: variant.id,
      productName: productNames.get(variant.product_id) ?? "Product",
      colourName: colourNames.get(variant.colour_id) ?? "Colour",
      size: variant.size,
      stock: variant.stock_quantity,
      sku: variant.sku,
    })),
  };
}

export type OrderFilters = {
  status?: OrderStatus | "all";
  query?: string;
  page?: number;
};

export const ORDERS_PER_PAGE = 20;

export type OrderListResult = {
  orders: Order[];
  count: number;
  page: number;
  pageCount: number;
  statusCounts: Record<OrderStatus, number>;
};

export async function getOrders(filters: OrderFilters): Promise<OrderListResult> {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  const from = (page - 1) * ORDERS_PER_PAGE;
  const term = searchTerm(filters.query);

  let query = supabase
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (term) {
    query = query.or(
      [
        `order_number.ilike.%${term}%`,
        `customer_first_name.ilike.%${term}%`,
        `customer_last_name.ilike.%${term}%`,
        `customer_email.ilike.%${term}%`,
        `customer_phone.ilike.%${term}%`,
        `city.ilike.%${term}%`,
      ].join(","),
    );
  }

  const [listResult, statusResult] = await Promise.all([
    query.range(from, from + ORDERS_PER_PAGE - 1),
    supabase.from("orders").select("status"),
  ]);

  if (listResult.error) throw new Error(`Orders query failed: ${listResult.error.message}`);
  if (statusResult.error) throw new Error(`Order status query failed: ${statusResult.error.message}`);

  const statusCounts = Object.fromEntries(
    ORDER_STATUS_VALUES.map((status) => [status, 0]),
  ) as Record<OrderStatus, number>;

  for (const row of statusResult.data ?? []) {
    statusCounts[row.status] += 1;
  }

  const count = listResult.count ?? 0;

  return {
    orders: listResult.data ?? [],
    count,
    page,
    pageCount: Math.max(1, Math.ceil(count / ORDERS_PER_PAGE)),
    statusCounts,
  };
}

export type AdminOrderDetail = {
  order: Order;
  items: OrderItem[];
  events: OrderEvent[];
};

export const uuidSchema = z.uuid();

export async function getOrderDetail(id: string): Promise<AdminOrderDetail | null> {
  if (!uuidSchema.safeParse(id).success) return null;

  const supabase = await createClient();
  const [orderResult, itemsResult, eventsResult] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    supabase.from("order_items").select("*").eq("order_id", id).order("created_at"),
    supabase.from("order_events").select("*").eq("order_id", id).order("created_at"),
  ]);

  if (orderResult.error) throw new Error(`Order query failed: ${orderResult.error.message}`);
  if (!orderResult.data) return null;
  if (itemsResult.error) throw new Error(`Order items query failed: ${itemsResult.error.message}`);
  if (eventsResult.error) throw new Error(`Order events query failed: ${eventsResult.error.message}`);

  return {
    order: orderResult.data,
    items: itemsResult.data ?? [],
    events: eventsResult.data ?? [],
  };
}

export type AdminProductSummary = Product & {
  colourCount: number;
  variantCount: number;
  totalStock: number;
  lowStockCount: number;
  image: string | null;
  collectionNames: string[];
};

async function getCatalogueRows() {
  const supabase = await createClient();
  const [productsResult, coloursResult, variantsResult, linksResult, collectionsResult] =
    await Promise.all([
      supabase.from("products").select("*").order("sort_order", { ascending: true }),
      supabase.from("product_colours").select("*").order("sort_order", { ascending: true }),
      supabase.from("product_variants").select("*"),
      supabase.from("product_collections").select("*"),
      supabase.from("collections").select("*").order("sort_order", { ascending: true }),
    ]);

  const failed = [
    productsResult,
    coloursResult,
    variantsResult,
    linksResult,
    collectionsResult,
  ].find((result) => result.error);

  if (failed?.error) throw new Error(`Catalogue query failed: ${failed.error.message}`);

  return {
    products: productsResult.data ?? [],
    colours: coloursResult.data ?? [],
    variants: variantsResult.data ?? [],
    links: linksResult.data ?? [],
    collections: collectionsResult.data ?? [],
  };
}

export async function getAdminProducts(): Promise<AdminProductSummary[]> {
  const { products, colours, variants, links, collections } = await getCatalogueRows();
  const collectionById = new Map(collections.map((collection) => [collection.id, collection]));

  return products.map((product) => {
    const productColours = colours.filter((colour) => colour.product_id === product.id);
    const colourIds = new Set(productColours.map((colour) => colour.id));
    const productVariants = variants.filter((variant) => colourIds.has(variant.colour_id));
    const firstColour = productColours.find((colour) => colour.front_image_path);

    return {
      ...product,
      colourCount: productColours.length,
      variantCount: productVariants.length,
      totalStock: sum(productVariants.map((variant) => variant.stock_quantity)),
      lowStockCount: productVariants.filter(
        (variant) => variant.stock_quantity > 0 && variant.stock_quantity <= LOW_STOCK_THRESHOLD,
      ).length,
      image: mediaUrl(firstColour?.front_image_path ?? null),
      collectionNames: links
        .filter((link) => link.product_id === product.id)
        .map((link) => collectionById.get(link.collection_id)?.name)
        .filter((name): name is string => Boolean(name)),
    };
  });
}

export type AdminColour = ProductColour & {
  variants: ProductVariant[];
  frontImage: string | null;
  backImage: string | null;
  gallery: string[];
};

export type AdminProductDetail = {
  product: Product;
  collections: Collection[];
  selectedCollectionIds: string[];
  colours: AdminColour[];
};

export async function getAdminProduct(id: string): Promise<AdminProductDetail | null> {
  if (!uuidSchema.safeParse(id).success) return null;

  const supabase = await createClient();
  const [productResult, collectionsResult, linksResult, coloursResult, variantsResult] =
    await Promise.all([
      supabase.from("products").select("*").eq("id", id).maybeSingle(),
      supabase.from("collections").select("*").order("sort_order", { ascending: true }),
      supabase.from("product_collections").select("*").eq("product_id", id),
      supabase.from("product_colours").select("*").eq("product_id", id).order("sort_order"),
      supabase.from("product_variants").select("*").eq("product_id", id),
    ]);

  if (productResult.error) throw new Error(productResult.error.message);
  if (!productResult.data) return null;

  const failed = [collectionsResult, linksResult, coloursResult, variantsResult].find(
    (result) => result.error,
  );
  if (failed?.error) throw new Error(failed.error.message);

  const variants = variantsResult.data ?? [];

  return {
    product: productResult.data,
    collections: collectionsResult.data ?? [],
    selectedCollectionIds: (linksResult.data ?? []).map((link) => link.collection_id),
    colours: (coloursResult.data ?? []).map((colour) => ({
      ...colour,
      variants: variants
        .filter((variant) => variant.colour_id === colour.id)
        .sort((a, b) => sizeRank(a.size) - sizeRank(b.size)),
      frontImage: mediaUrl(colour.front_image_path),
      backImage: mediaUrl(colour.back_image_path),
      gallery: colour.gallery_paths
        .map((path) => mediaUrl(path))
        .filter((url): url is string => Boolean(url)),
    })),
  };
}

export async function getAdminCollections() {
  const supabase = await createClient();
  const [collectionsResult, linksResult] = await Promise.all([
    supabase.from("collections").select("*").order("sort_order", { ascending: true }),
    supabase.from("product_collections").select("*"),
  ]);

  if (collectionsResult.error) throw new Error(collectionsResult.error.message);
  if (linksResult.error) throw new Error(linksResult.error.message);

  const counts = new Map<string, number>();
  for (const link of linksResult.data ?? []) {
    counts.set(link.collection_id, (counts.get(link.collection_id) ?? 0) + 1);
  }

  return (collectionsResult.data ?? []).map((collection) => ({
    ...collection,
    productCount: counts.get(collection.id) ?? 0,
    image: mediaUrl(collection.image_path),
  }));
}

export async function getAdminCollection(id: string) {
  if (!uuidSchema.safeParse(id).success) return null;

  const supabase = await createClient();
  const [collectionResult, linksResult] = await Promise.all([
    supabase.from("collections").select("*").eq("id", id).maybeSingle(),
    supabase.from("product_collections").select("product_id", { count: "exact" }).eq("collection_id", id),
  ]);

  if (collectionResult.error) throw new Error(collectionResult.error.message);
  if (!collectionResult.data) return null;

  return {
    collection: collectionResult.data,
    productCount: linksResult.count ?? 0,
  };
}

export type InventoryRow = {
  variant: ProductVariant;
  productName: string;
  productSlug: string;
  colourName: string;
  colourHex: string;
  image: string | null;
};

export type InventoryResult = {
  rows: InventoryRow[];
  total: number;
  low: number;
  out: number;
  stock: number;
};

export async function getInventory(filters: {
  query?: string;
  level?: "all" | "low" | "out";
}): Promise<InventoryResult> {
  const supabase = await createClient();
  const [variantsResult, productsResult, coloursResult] = await Promise.all([
    supabase.from("product_variants").select("*").eq("is_active", true),
    supabase.from("products").select("id,name,slug"),
    supabase.from("product_colours").select("*"),
  ]);

  const failed = [variantsResult, productsResult, coloursResult].find((result) => result.error);
  if (failed?.error) throw new Error(`Inventory query failed: ${failed.error.message}`);

  const products = new Map((productsResult.data ?? []).map((product) => [product.id, product]));
  const colours = new Map((coloursResult.data ?? []).map((colour) => [colour.id, colour]));
  const term = searchTerm(filters.query).toLowerCase();

  let rows: InventoryRow[] = (variantsResult.data ?? [])
    .map((variant) => {
      const product = products.get(variant.product_id);
      const colour = colours.get(variant.colour_id);
      if (!product || !colour) return null;
      return {
        variant,
        productName: product.name,
        productSlug: product.slug,
        colourName: colour.name,
        colourHex: colour.hex,
        image: mediaUrl(colour.front_image_path),
      } satisfies InventoryRow;
    })
    .filter((row): row is InventoryRow => Boolean(row));

  const total = rows.length;
  const low = rows.filter(
    (row) => row.variant.stock_quantity > 0 && row.variant.stock_quantity <= LOW_STOCK_THRESHOLD,
  ).length;
  const out = rows.filter((row) => row.variant.stock_quantity === 0).length;
  const stock = sum(rows.map((row) => row.variant.stock_quantity));

  if (filters.level === "low") {
    rows = rows.filter(
      (row) => row.variant.stock_quantity > 0 && row.variant.stock_quantity <= LOW_STOCK_THRESHOLD,
    );
  } else if (filters.level === "out") {
    rows = rows.filter((row) => row.variant.stock_quantity === 0);
  }

  if (term) {
    rows = rows.filter((row) =>
      [row.productName, row.colourName, row.variant.sku, row.variant.size]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }

  rows.sort(
    (a, b) =>
      a.productName.localeCompare(b.productName) ||
      a.colourName.localeCompare(b.colourName) ||
      sizeRank(a.variant.size) - sizeRank(b.variant.size),
  );

  return { rows, total, low, out, stock };
}

export type { ProductCollection };
