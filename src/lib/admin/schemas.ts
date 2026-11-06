import { z } from "@/lib/zod-config";

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
};

export const PRODUCT_TYPES = ["tee", "hoodie", "tank", "bottoms", "accessory"] as const;

export const PRODUCT_TYPE_LABELS: Record<(typeof PRODUCT_TYPES)[number], string> = {
  tee: "Tee",
  hoodie: "Hoodie",
  tank: "Tank",
  bottoms: "Bottoms",
  accessory: "Accessory",
};

export const GARMENT_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "ONE_SIZE"] as const;

export const sizeOptionsForType = (type: string) =>
  type === "accessory" ? (["ONE_SIZE"] as const) : (["XS", "S", "M", "L", "XL", "XXL"] as const);

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export const slugSchema = z
  .string()
  .trim()
  .min(1, "Enter a URL slug.")
  .max(80, "Keep the slug under 80 characters.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens.");

const randsSchema = z
  .string()
  .trim()
  .min(1, "Enter a price in rands.")
  .regex(/^\d{1,7}(?:\.\d{1,2})?$/, "Enter rands like 349 or 349.00.")
  .transform((value) => Math.round(Number(value) * 100));

const optionalRandsSchema = z
  .string()
  .trim()
  .transform((value) => value)
  .refine((value) => value === "" || /^\d{1,7}(?:\.\d{1,2})?$/.test(value), {
    message: "Enter rands like 449 or 449.00, or leave it blank.",
  })
  .transform((value) => (value === "" ? null : Math.round(Number(value) * 100)));

export const productInputSchema = z.object({
  name: z.string().trim().min(1, "Enter a product name.").max(80, "Keep the name under 80 characters."),
  slug: z
    .string()
    .trim()
    .max(80)
    .transform((value) => value || "")
    .refine((value) => value === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), {
      message: "Use lowercase letters, numbers and single hyphens.",
    }),
  tagline: z.string().trim().max(140, "Keep the tagline under 140 characters."),
  description: z.string().trim().max(4000, "Keep the description under 4,000 characters."),
  details: z.string().trim().max(4000, "Keep the details under 4,000 characters."),
  priceCents: randsSchema,
  compareAtPriceCents: optionalRandsSchema,
  productType: z.enum(PRODUCT_TYPES),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  collectionIds: z.array(z.uuid()).max(50),
});

export function parseDetails(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 30);
}

const storagePathSchema = z
  .string()
  .trim()
  .max(300)
  .refine((value) => value === "" || /^(?!https?:)[A-Za-z0-9][A-Za-z0-9/_\-. ]*$/.test(value), {
    message: "Upload the image again.",
  });

export const colourInputSchema = z.object({
  productId: z.uuid(),
  name: z.string().trim().min(1, "Enter a colour name.").max(50),
  slug: slugSchema,
  hex: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Use a six-digit hex colour like #0A0A0A."),
  frontImagePath: storagePathSchema,
  backImagePath: storagePathSchema,
  galleryPaths: z.array(storagePathSchema).max(12),
  sortOrder: z.coerce.number().int().min(0).max(9999),
});

export const collectionInputSchema = z.object({
  name: z.string().trim().min(1, "Enter a collection name.").max(60),
  slug: z
    .string()
    .trim()
    .max(80)
    .transform((value) => value || "")
    .refine((value) => value === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), {
      message: "Use lowercase letters, numbers and single hyphens.",
    }),
  description: z.string().trim().max(600, "Keep the description under 600 characters."),
  imagePath: storagePathSchema,
  sortOrder: z.coerce.number().int().min(0).max(9999),
  isActive: z.boolean(),
});

export const stockSchema = z.object({
  variantId: z.uuid(),
  stock: z.coerce
    .number()
    .int("Stock must be a whole number.")
    .min(0, "Stock cannot be negative.")
    .max(100000, "That stock count is too high."),
});

export const DISCOUNT_KINDS = ["percent", "fixed"] as const;

export const DISCOUNT_KIND_LABELS: Record<(typeof DISCOUNT_KINDS)[number], string> = {
  percent: "Percentage",
  fixed: "Fixed amount",
};

export function randsToCents(value: string) {
  const trimmed = value.trim();
  if (!/^\d{1,7}(?:\.\d{1,2})?$/.test(trimmed)) return null;
  return Math.round(Number(trimmed) * 100);
}

export const discountInputSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Use at least 3 characters.")
    .max(30, "Keep the code under 30 characters.")
    .transform((value) => value.toUpperCase())
    .refine((value) => /^[A-Z0-9][A-Z0-9_-]{2,29}$/.test(value), {
      message: "Use letters, numbers, hyphens and underscores only.",
    }),
  description: z.string().trim().max(200, "Keep the description under 200 characters."),
  kind: z.enum(DISCOUNT_KINDS, "Choose percentage or fixed amount."),
  value: z.string().trim().min(1, "Enter a discount value."),
  minSubtotalCents: optionalRandsSchema,
  startsAt: z.string().trim().max(30),
  endsAt: z.string().trim().max(30),
  maxRedemptions: z.string().trim().max(6),
  isActive: z.boolean(),
});

export const settingsInputSchema = z.object({
  announcementText: z
    .string()
    .trim()
    .min(1, "Add an announcement.")
    .max(140, "Keep the announcement under 140 characters."),
  announcementEnabled: z.boolean(),
  deliveryInfoText: z
    .string()
    .trim()
    .min(1, "Add delivery information.")
    .max(300, "Keep delivery information under 300 characters."),
  freeDeliveryArea: z
    .string()
    .trim()
    .min(1, "Enter the area with free delivery.")
    .max(60, "Keep the area under 60 characters."),
  contactEmail: z.email("Enter a valid contact email.").trim().max(160),
  contactPhone: z
    .string()
    .trim()
    .regex(/^0[0-9]{9}$/, "Enter a 10-digit number starting with 0."),
  instagramUrl: z
    .string()
    .trim()
    .max(300, "Keep the link under 300 characters.")
    .refine((value) => value === "" || /^https?:\/\/\S+$/i.test(value), {
      message: "Enter a full https:// link or leave it blank.",
    }),
  maintenanceMode: z.boolean(),
  businessAddress: z.string().trim().max(300, "Keep the address under 300 characters."),
  businessRegistration: z
    .string()
    .trim()
    .max(120, "Keep the registration number under 120 characters."),
  whatsappNumber: z
    .string()
    .trim()
    .max(20)
    .refine((value) => value === "" || /^\+27[0-9]{9}$/.test(value), {
      message: "Use +27 followed by 9 digits, or leave it blank.",
    }),
});

export const inviteAdminSchema = z.object({
  email: z.email("Enter a valid email address.").trim().max(160),
  fullName: z.string().trim().max(80, "Keep the name under 80 characters."),
});

export const roleSchema = z.enum(["customer", "admin"]);

export const messageStatusSchema = z.enum(["new", "read", "archived"]);
