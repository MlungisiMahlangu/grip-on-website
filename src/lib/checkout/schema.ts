import { z } from "zod";

export const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
] as const;

export type Province = (typeof PROVINCES)[number];

const phonePattern = /^(\+27|27|0)[6-8][0-9]{8}$/;

export function digitsOnly(value: string) {
  return value.replace(/[^0-9+]/g, "");
}

export const checkoutSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Enter your first name.")
    .max(60, "That name is too long."),
  lastName: z
    .string()
    .trim()
    .min(1, "Enter your last name.")
    .max(60, "That name is too long."),
  email: z.email("Enter a valid email address.").trim().max(160),
  phone: z
    .string()
    .trim()
    .min(1, "Enter your mobile number.")
    .refine((value) => phonePattern.test(digitsOnly(value)), {
      message: "Use a valid South African mobile number.",
    }),
  addressLine1: z
    .string()
    .trim()
    .min(1, "Enter your street address.")
    .max(160, "That address is too long."),
  addressLine2: z.string().trim().max(160, "That address is too long.").optional(),
  suburb: z
    .string()
    .trim()
    .min(1, "Enter your suburb.")
    .max(100, "That suburb is too long."),
  city: z
    .string()
    .trim()
    .min(1, "Enter your city or town.")
    .max(100, "That city is too long."),
  province: z.enum(PROVINCES, "Select your province."),
  postalCode: z
    .string()
    .trim()
    .regex(/^[0-9]{4}$/, "Enter a 4-digit postal code."),
  deliveryNotes: z.string().trim().max(500, "Keep notes under 500 characters.").optional(),
  paymentMethod: z.literal("cod"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const checkoutItemSchema = z.object({
  variantId: z.uuid("That item is invalid."),
  quantity: z
    .number()
    .int()
    .min(1, "Choose at least one of each item.")
    .max(10, "Choose 10 or fewer per item."),
});

export const checkoutPayloadSchema = z.object({
  customer: checkoutSchema,
  items: z
    .array(checkoutItemSchema)
    .min(1, "Your bag is empty.")
    .max(25, "Too many items in one order."),
  discountCode: z
    .string()
    .trim()
    .max(30, "That code is too long.")
    .transform((value) => value.toUpperCase())
    .optional(),
  subscribe: z.boolean().optional(),
});

export type CheckoutPayload = z.infer<typeof checkoutPayloadSchema>;

export const trackOrderSchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .min(1, "Enter your order number.")
    .max(30, "That order number is too long."),
  contact: z.string().trim().min(1, "Enter the email or phone used at checkout.").max(160),
});
