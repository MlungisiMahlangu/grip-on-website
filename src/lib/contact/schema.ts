import { z } from "zod";

const phonePattern = /^(\+27|27|0)[6-8][0-9]{8}$/;

function digitsOnly(value: string) {
  return value.replace(/[^0-9+]/g, "");
}

export const contactMessageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .max(80, "Keep your name under 80 characters."),
  email: z.email("Enter a valid email address.").trim().max(160),
  phone: z
    .string()
    .trim()
    .max(20)
    .refine((value) => value === "" || phonePattern.test(digitsOnly(value)), {
      message: "Use a valid South African mobile number, or leave it blank.",
    }),
  subject: z
    .string()
    .trim()
    .min(1, "Add a subject.")
    .max(120, "Keep the subject under 120 characters."),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more — at least 10 characters.")
    .max(4000, "Keep your message under 4,000 characters."),
  subscribe: z.boolean(),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
