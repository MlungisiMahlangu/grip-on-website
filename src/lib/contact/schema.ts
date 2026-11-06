import { z } from "@/lib/zod-config";
import {
  cleanTrimmed,
  emailSchema,
  mobileSchema,
  nameSchema,
} from "@/lib/validation";

export const contactMessageSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: mobileSchema,
  subject: z
    .string()
    .transform(cleanTrimmed)
    .pipe(
      z
        .string()
        .min(3, "Add a subject with at least 3 characters.")
        .max(100, "Keep the subject under 100 characters."),
    ),
  message: z
    .string()
    .transform(cleanTrimmed)
    .pipe(
      z
        .string()
        .min(10, "Tell us a little more. Add at least 10 characters.")
        .max(1000, "Keep your message under 1,000 characters."),
    ),
  subscribe: z.boolean(),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
