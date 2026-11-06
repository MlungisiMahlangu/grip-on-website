"use server";

import { z } from "@/lib/zod-config";
import { createPublicClient } from "@/lib/supabase/server";
import { contactMessageSchema } from "@/lib/contact/schema";
import { sendContactEmail } from "@/lib/email/contact-email";
import { checkRateLimit, requestKey, retryMessage } from "@/lib/rate-limit";

export type ContactFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
};

function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

export async function sendContactMessageAction(
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  if (String(formData.get("website") ?? "").trim()) {
    return { success: "Message sent. We reply within one working day." };
  }

  const limited = checkRateLimit(await requestKey("contact"), 5, 10 * 60_000);
  if (!limited.ok) {
    return { error: retryMessage(limited.retryAfterSeconds) };
  }

  const parsed = contactMessageSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
    subscribe: formData.get("subscribe") === "on",
  });

  if (!parsed.success) {
    return { error: "Check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }

  const input = parsed.data;
  const supabase = createPublicClient();

  const { error } = await supabase.rpc("submit_contact_message", {
    p_name: input.name,
    p_email: input.email,
    p_phone: input.phone,
    p_subject: input.subject,
    p_message: input.message,
  });

  if (error) {
    console.error(`[contact] submit failed: ${error.message}`);
    return {
      error: "Your message did not send. Try again, or email us directly and we will pick it up.",
    };
  }

  if (input.subscribe) {
    const { error: subscribeError } = await supabase.rpc("subscribe_email", {
      p_email: input.email,
      p_source: "contact",
    });
    if (subscribeError) console.error(`[contact] subscribe failed: ${subscribeError.message}`);
  }

  await sendContactEmail(input);

  return {
    success: "Message sent. We reply within one working day. Check the inbox you gave us.",
  };
}
