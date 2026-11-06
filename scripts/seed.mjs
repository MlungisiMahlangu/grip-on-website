import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const ASSETS = path.join(ROOT, "grip-on-assets");
const BUCKET = "product-images";
const APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const ONE_SIZE = ["ONE_SIZE"];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Run: npm run db:seed",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const COLLECTIONS = [
  {
    slug: "new-arrivals",
    name: "New Arrivals",
    description: "The latest gear, fresh off the line.",
    sort_order: 1,
  },
  {
    slug: "tees",
    name: "Tees",
    description: "Everyday training tees built to move.",
    sort_order: 2,
  },
  {
    slug: "hoodies",
    name: "Hoodies",
    description: "Heavyweight layers for cold starts.",
    sort_order: 3,
  },
  {
    slug: "tanks",
    name: "Tanks",
    description: "Cut for the gym, not the mirror.",
    sort_order: 4,
  },
  {
    slug: "bottoms",
    name: "Bottoms",
    description: "Shorts that stay out of the way.",
    sort_order: 5,
  },
  {
    slug: "accessories",
    name: "Accessories",
    description: "The kit that finishes the session.",
    sort_order: 6,
  },
  {
    slug: "best-sellers",
    name: "Best Sellers",
    description: "The pieces the community keeps coming back for.",
    sort_order: 7,
  },
];

const PRODUCTS = [
  {
    slug: "classic-tee",
    name: "Classic Tee",
    tagline: "The everyday standard.",
    description:
      "A midweight cotton tee with a clean back mark, a straight cut and a collar that keeps its shape. Built for training days and everything after.",
    details: [
      "240gsm combed cotton",
      "Straight, boxy fit",
      "Ribbed collar that holds its shape",
      "Water-based print that will not crack",
    ],
    price_cents: 34900,
    product_type: "tee",
    sizes: APPAREL_SIZES,
    is_featured: true,
    sort_order: 1,
    collections: ["tees", "new-arrivals", "best-sellers"],
  },
  {
    slug: "heavyweight-hoodie",
    name: "Heavyweight Hoodie",
    tagline: "Built for cold starts.",
    description:
      "A 420gsm brushed-back fleece hoodie with a double-layer hood and ribbed cuffs. Heavy enough for winter sessions, cut loose enough to move.",
    details: [
      "420gsm brushed fleece",
      "Double-layer hood",
      "Kangaroo pocket",
      "Relaxed fit",
    ],
    price_cents: 79900,
    product_type: "hoodie",
    sizes: APPAREL_SIZES,
    is_featured: true,
    sort_order: 2,
    collections: ["hoodies", "new-arrivals", "best-sellers"],
  },
  {
    slug: "stringer-tank",
    name: "Stringer Tank",
    tagline: "Cut to move.",
    description:
      "A low-cut training tank in a breathable cotton blend. Deep armholes, a longer body and a hem that stays put overhead.",
    details: [
      "220gsm cotton blend",
      "Deep armholes",
      "Longline body",
      "Pre-shrunk",
    ],
    price_cents: 27900,
    product_type: "tank",
    sizes: APPAREL_SIZES,
    is_featured: true,
    sort_order: 3,
    collections: ["tanks", "new-arrivals"],
  },
  {
    slug: "training-shorts",
    name: "Training Shorts",
    tagline: "Seven inches. Zero distraction.",
    description:
      "Seven-inch training shorts with a stretch waistband, zip pocket and a liner that stays put through sprints and squats.",
    details: [
      "7-inch inseam",
      "Four-way stretch",
      "Zip side pocket",
      "Built-in liner",
    ],
    price_cents: 32900,
    product_type: "bottoms",
    sizes: APPAREL_SIZES,
    is_featured: true,
    sort_order: 4,
    collections: ["bottoms", "new-arrivals"],
  },
  {
    slug: "gym-cap",
    name: "Gym Cap",
    tagline: "Finish the fit.",
    description:
      "A six-panel cap with a curved brim and an embroidered mark. Adjustable at the back, structured enough to hold its shape.",
    details: [
      "Six-panel construction",
      "Embroidered mark",
      "Metal buckle adjuster",
      "One size",
    ],
    price_cents: 19900,
    product_type: "accessory",
    sizes: ONE_SIZE,
    is_featured: false,
    sort_order: 5,
    collections: ["accessories", "best-sellers"],
  },
  {
    slug: "gym-towel",
    name: "Gym Towel",
    tagline: "Small bag. Big difference.",
    description:
      "A compact cotton towel that soaks up a session and dries fast. Small enough for a gym bag, big enough to matter.",
    details: [
      "100% cotton terry",
      "60 x 100cm",
      "Hanging loop",
      "Machine washable",
    ],
    price_cents: 14900,
    product_type: "accessory",
    sizes: ONE_SIZE,
    is_featured: false,
    sort_order: 6,
    collections: ["accessories", "new-arrivals"],
  },
  {
    slug: "gym-duffel",
    name: "Gym Duffel",
    tagline: "Everything in one bag.",
    description:
      "A 35-litre duffel with a separate shoe compartment, padded strap and a wipe-clean base. Everything for a session in one bag.",
    details: [
      "35L capacity",
      "Vented shoe compartment",
      "Padded shoulder strap",
      "Wipe-clean base",
    ],
    price_cents: 44900,
    product_type: "accessory",
    sizes: ONE_SIZE,
    is_featured: false,
    sort_order: 7,
    collections: ["accessories", "new-arrivals"],
  },
  {
    slug: "shaker-bottle",
    name: "Shaker Bottle",
    tagline: "Shake. Rinse. Repeat.",
    description:
      "A 700ml shaker with a leak-proof lid, stainless mixer and a wide mouth that is easy to clean.",
    details: [
      "700ml capacity",
      "Leak-proof lid",
      "Stainless steel mixer",
      "Dishwasher safe",
    ],
    price_cents: 15900,
    product_type: "accessory",
    sizes: ONE_SIZE,
    is_featured: false,
    sort_order: 8,
    collections: ["accessories"],
  },
  {
    slug: "lifting-straps",
    name: "Lifting Straps",
    tagline: "Lock in and pull.",
    description:
      "Cotton lifting straps with a padded wrist and a chalk-friendly weave. Lock in for heavy pulls without thinking about grip.",
    details: [
      "Heavy cotton weave",
      "Padded wrist",
      "Reinforced stitching",
      "One size",
    ],
    price_cents: 17900,
    product_type: "accessory",
    sizes: ONE_SIZE,
    is_featured: false,
    sort_order: 9,
    collections: ["accessories", "best-sellers"],
  },
];

const SKU_PREFIX = {
  "classic-tee": "TEE",
  "heavyweight-hoodie": "HOOD",
  "stringer-tank": "TANK",
  "training-shorts": "SHRT",
  "gym-cap": "CAP",
  "gym-towel": "TOWL",
  "gym-duffel": "DUFF",
  "shaker-bottle": "SHKR",
  "lifting-straps": "STRP",
};

const STOCK = {
  "classic-tee": {
    base: 12,
    overrides: { "white/M": 2, "bone/S": 0, "bone/XL": 0, "navy/XXL": 0, "burgundy/*": 3, "olive/M": 1, "olive/*": 0 },
  },
  "heavyweight-hoodie": {
    base: 8,
    overrides: { "bone/*": 3, "burgundy/S": 0, "burgundy/M": 2, "navy/XXL": 0 },
  },
  "stringer-tank": {
    base: 10,
    overrides: { "bone/S": 0, "burgundy/*": 2, "olive/L": 0 },
  },
  "training-shorts": {
    base: 10,
    overrides: { "olive/M": 2, "black/XXL": 0 },
  },
  "gym-cap": { base: 14, overrides: { "olive/*": 0 } },
  "gym-towel": { base: 9, overrides: { "olive/*": 4 } },
  "gym-duffel": { base: 5, overrides: { "olive/*": 2 } },
  "shaker-bottle": { base: 20, overrides: {} },
  "lifting-straps": { base: 15, overrides: {} },
};

const COLOUR_NAMES = {
  black: "Black",
  white: "White",
  bone: "Bone",
  sand: "Sand",
  charcoal: "Charcoal",
  navy: "Navy",
  burgundy: "Burgundy",
  olive: "Olive",
};

function stockFor(productSlug, colourSlug, size) {
  const rule = STOCK[productSlug];
  const exact = rule.overrides[`${colourSlug}/${size}`];
  if (exact !== undefined) return exact;
  const colourWide = rule.overrides[`${colourSlug}/*`];
  if (colourWide !== undefined) return colourWide;
  return rule.base;
}

function skuFor(productSlug, colourSlug, size) {
  const sizeCode = size === "ONE_SIZE" ? "OS" : size;
  return `GO-${SKU_PREFIX[productSlug]}-${colourSlug.toUpperCase()}-${sizeCode}`;
}

function storagePath(manifestPath) {
  return manifestPath.replace(/^assets\//, "");
}

function maskEmail(email) {
  if (!email) return "none";
  return email.replace(/^(.{2}).*(@.*)$/, "$1***$2");
}

function must(result, context) {
  if (result.error) {
    throw new Error(`${context}: ${result.error.message}`);
  }
  return result.data;
}

async function uploadFile(bucket, manifestPath) {
  const source = path.join(ASSETS, storagePath(manifestPath));
  if (!fs.existsSync(source)) {
    throw new Error(`Missing asset: ${source}`);
  }

  const target = storagePath(manifestPath);
  const body = fs.readFileSync(source);
  const { error } = await supabase.storage.from(bucket).upload(target, body, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: true,
  });

  if (error) {
    throw new Error(`Upload failed for ${target}: ${error.message}`);
  }

  return target;
}

async function main() {
  console.log("Grip On seed — starting");

  const manifest = JSON.parse(
    fs.readFileSync(path.join(ASSETS, "manifest.json"), "utf8"),
  );

  const schemaCheck = await supabase.from("products").select("id").limit(1);
  if (schemaCheck.error) {
    throw new Error(
      "Catalogue tables were not found. Apply supabase/migrations/20261106090000_phase2_foundation.sql in the Supabase SQL Editor first.",
    );
  }

  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((bucket) => bucket.name === BUCKET)) {
    const created = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 10485760,
      allowedMimeTypes: ["image/webp", "image/jpeg", "image/png", "image/avif"],
    });
    if (created.error) {
      throw new Error(`Could not create storage bucket: ${created.error.message}`);
    }
    console.log(`Created storage bucket "${BUCKET}"`);
  }

  const uploads = new Set();
  for (const files of Object.values(manifest.products)) {
    for (const colourFiles of Object.values(files)) {
      for (const file of colourFiles) uploads.add(file);
    }
  }
  for (const item of Object.values(manifest.lifestyle)) {
    uploads.add(item.path);
  }

  console.log(`Uploading ${uploads.size} images to "${BUCKET}"`);
  let uploaded = 0;
  for (const file of uploads) {
    await uploadFile(BUCKET, file);
    uploaded += 1;
    if (uploaded % 15 === 0 || uploaded === uploads.size) {
      console.log(`  uploaded ${uploaded}/${uploads.size}`);
    }
  }

  const collectionIds = new Map();
  for (const collection of COLLECTIONS) {
    const row = must(
      await supabase
        .from("collections")
        .upsert({ ...collection, is_active: true }, { onConflict: "slug" })
        .select("id, slug")
        .single(),
      `collection ${collection.slug}`,
    );
    collectionIds.set(collection.slug, row.id);
  }
  console.log(`Collections ready (${collectionIds.size})`);

  let colourCount = 0;
  let variantCount = 0;

  for (const product of PRODUCTS) {
    const colours = manifest.products[product.slug];
    if (!colours) {
      throw new Error(`Manifest has no entry for ${product.slug}`);
    }

    const productRow = must(
      await supabase
        .from("products")
        .upsert(
          {
            slug: product.slug,
            name: product.name,
            tagline: product.tagline,
            description: product.description,
            details: product.details,
            price_cents: product.price_cents,
            product_type: product.product_type,
            is_featured: product.is_featured,
            is_active: true,
            sort_order: product.sort_order,
          },
          { onConflict: "slug" },
        )
        .select("id, slug")
        .single(),
      `product ${product.slug}`,
    );

    must(
      await supabase.from("product_collections").delete().eq("product_id", productRow.id),
      `reset collections for ${product.slug}`,
    );

    must(
      await supabase.from("product_collections").insert(
        product.collections.map((slug, index) => ({
          product_id: productRow.id,
          collection_id: collectionIds.get(slug),
          sort_order: index,
        })),
      ),
      `link collections for ${product.slug}`,
    );

    const colourSlugs = Object.keys(colours);
    for (const [colourIndex, colourSlug] of colourSlugs.entries()) {
      const files = colours[colourSlug];
      const paths = files.map(storagePath);
      const front = paths.find((file) => file.includes("-front")) ?? paths[0];
      const back =
        paths.find((file) => file.includes("-back")) ??
        paths.find((file) => file !== front) ??
        null;
      const gallery = [front, back].filter(Boolean);

      const colourRow = must(
        await supabase
          .from("product_colours")
          .upsert(
            {
              product_id: productRow.id,
              slug: colourSlug,
              name: COLOUR_NAMES[colourSlug] ?? colourSlug,
              hex: manifest.colours[colourSlug]?.garment_hex ?? "#111111",
              front_image_path: front,
              back_image_path: back,
              gallery_paths: gallery,
              is_active: true,
              sort_order: colourIndex,
            },
            { onConflict: "product_id,slug" },
          )
          .select("id")
          .single(),
        `colour ${product.slug}/${colourSlug}`,
      );
      colourCount += 1;

      for (const size of product.sizes) {
        must(
          await supabase.from("product_variants").upsert(
            {
              product_id: productRow.id,
              colour_id: colourRow.id,
              size,
              sku: skuFor(product.slug, colourSlug, size),
              stock_quantity: stockFor(product.slug, colourSlug, size),
              is_active: true,
            },
            { onConflict: "colour_id,size" },
          ),
          `variant ${product.slug}/${colourSlug}/${size}`,
        );
        variantCount += 1;
      }
    }

    console.log(`  ${product.name}: ${colourSlugs.length} colours`);
  }

  must(
    await supabase.from("settings").upsert(
      {
        id: true,
        accent_hex: "#FF6A00",
        announcement_text: "Free delivery on orders over R800",
        free_delivery_threshold_cents: 80000,
        delivery_fee_cents: 9900,
        contact_email: "hello@griponwear.co.za",
        instagram_url: "https://www.instagram.com/mlungisi_rs",
      },
      { onConflict: "id" },
    ),
    "store settings",
  );

  const { data: userData, error: userError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (userError) {
    throw new Error(`Could not list auth users: ${userError.message}`);
  }

  const users = userData.users;
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const ownerEmail = (process.env.OWNER_EMAIL || "").trim().toLowerCase();
  const preferred = adminEmail || ownerEmail;
  let admin = users.find((user) => (user.email ?? "").toLowerCase() === preferred);
  let fallback = false;

  if (!admin && !adminEmail && users.length === 1) {
    admin = users[0];
    fallback = true;
  }

  if (admin) {
    must(
      await supabase.from("profiles").upsert(
        { id: admin.id, email: admin.email, role: "admin" },
        { onConflict: "id" },
      ),
      "promote admin",
    );
    console.log(
      `Admin ready: ${maskEmail(admin.email)}${fallback ? " (only user found; set ADMIN_EMAIL to make this explicit)" : ""}`,
    );
    if (!admin.email_confirmed_at) {
      console.warn(
        "  Warning: this admin email is not confirmed. Confirm it in Supabase → Authentication → Users before signing in.",
      );
    }
  } else {
    console.warn(
      `No auth user matched OWNER_EMAIL/ADMIN_EMAIL. Users: ${users.map((user) => maskEmail(user.email)).join(", ") || "none"}. Set ADMIN_EMAIL and re-run.`,
    );
  }

  console.log("Seed complete");
  console.log(`  collections: ${collectionIds.size}`);
  console.log(`  products: ${PRODUCTS.length}`);
  console.log(`  colours: ${colourCount}`);
  console.log(`  variants: ${variantCount}`);
  console.log(`  images: ${uploads.size}`);
}

main().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
