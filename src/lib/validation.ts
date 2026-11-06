import { z } from "@/lib/zod-config";

export const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}' -]*$/u;
export const MOBILE_PATTERN = /^0[0-9]{9}$/;
export const POSTAL_PATTERN = /^[0-9]{4}$/;
export const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function stripControlCharacters(value: string) {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function normaliseMobile(value: string) {
  let digits = digitsOnly(value);
  if (digits.startsWith("0027")) digits = digits.slice(2);
  if (digits.startsWith("27") && digits.length === 11) digits = `0${digits.slice(2)}`;
  return digits;
}

export function normaliseOrderNumber(value: string) {
  return value.trim().toUpperCase();
}

export function normaliseContact(value: string) {
  const trimmed = value.trim();
  return trimmed.includes("@") ? trimmed.toLowerCase() : normaliseMobile(trimmed);
}

export const nameSchema = z
  .string()
  .transform((value) => stripControlCharacters(value).trim())
  .pipe(
    z
      .string()
      .min(2, "Enter at least 2 characters.")
      .max(60, "Keep this under 60 characters.")
      .refine((value) => NAME_PATTERN.test(value), {
        message: "Use letters, spaces, hyphens or apostrophes only.",
      }),
  );

export const emailSchema = z
  .string()
  .transform((value) => stripControlCharacters(value).trim().toLowerCase())
  .pipe(
    z
      .string()
      .max(254, "Keep your email under 254 characters.")
      .pipe(z.email("Enter a valid email address.")),
  );

export const mobileSchema = z
  .string()
  .transform(normaliseMobile)
  .refine((value) => MOBILE_PATTERN.test(value), {
    message: "Enter a 10-digit mobile number starting with 0.",
  });

export const postalCodeSchema = z
  .string()
  .transform((value) => digitsOnly(value))
  .refine((value) => POSTAL_PATTERN.test(value), {
    message: "Enter a 4-digit postal code.",
  });

export function cleanTrimmed(value: string) {
  return stripControlCharacters(value).trim();
}
