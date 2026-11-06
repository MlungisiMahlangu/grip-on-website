import { z } from "@/lib/zod-config";
import {
  EMAIL_PATTERN,
  MOBILE_PATTERN,
  cleanTrimmed,
  emailSchema,
  mobileSchema,
  nameSchema,
  normaliseContact,
  normaliseOrderNumber,
  postalCodeSchema,
} from "@/lib/validation";

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

const addressLineSchema = z
  .string()
  .transform(cleanTrimmed)
  .pipe(
    z
      .string()
      .min(5, "Enter your street address.")
      .max(120, "Keep your address under 120 characters."),
  );

const localitySchema = z
  .string()
  .transform(cleanTrimmed)
  .pipe(
    z
      .string()
      .min(2, "Enter at least 2 characters.")
      .max(80, "Keep this under 80 characters."),
  );

const optionalLineSchema = z
  .string()
  .transform(cleanTrimmed)
  .pipe(z.string().max(120, "Keep this under 120 characters."))
  .optional();

const optionalNotesSchema = z
  .string()
  .transform(cleanTrimmed)
  .pipe(z.string().max(300, "Keep notes under 300 characters."))
  .optional();

export const checkoutDetailsSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: mobileSchema,
  addressLine1: addressLineSchema,
  addressLine2: optionalLineSchema,
  suburb: localitySchema,
  city: localitySchema,
  province: z.enum(PROVINCES, "Select your province."),
  postalCode: postalCodeSchema,
  deliveryArea: z.enum(["johannesburg", "outside"], "Choose your delivery area."),
  deliveryNotes: optionalNotesSchema,
  paymentMethod: z.literal("cod"),
});

export type CheckoutDetails = z.infer<typeof checkoutDetailsSchema>;

export const checkoutSchema = checkoutDetailsSchema.extend({
  termsAccepted: z
    .boolean()
    .refine((value) => value, "Please accept the terms to place your order."),
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
  customer: checkoutDetailsSchema,
  items: z
    .array(checkoutItemSchema)
    .min(1, "Your bag is empty.")
    .max(25, "Too many items in one order."),
  subscribe: z.boolean().optional(),
  idempotencyKey: z.uuid("That order could not be verified. Refresh and try again."),
});

export type CheckoutPayload = z.infer<typeof checkoutPayloadSchema>;

const orderNumberSchema = z
  .string()
  .transform(normaliseOrderNumber)
  .refine((value) => /^GO-[0-9]{4}-[0-9]{4}$/.test(value), {
    message: "Enter the order number from your email, like GO-2026-0001.",
  });

const contactSchema = z
  .string()
  .transform(cleanTrimmed)
  .transform(normaliseContact)
  .refine(
    (value) =>
      value.includes("@") ? EMAIL_PATTERN.test(value) : MOBILE_PATTERN.test(value),
    { message: "Enter the email or 10-digit mobile number used at checkout." },
  );

export const trackOrderSchema = z.object({
  orderNumber: orderNumberSchema,
  contact: contactSchema,
});

export type TrackOrderInput = z.infer<typeof trackOrderSchema>;
