import "server-only";

import { Resend } from "resend";
import { SITE } from "@/lib/site";
import { BUSINESS, phoneFromLocal } from "@/lib/business";
import type { ContactMessageInput } from "@/lib/contact/schema";

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] ?? character,
  );
}

export async function sendContactEmail(input: ContactMessageInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const owner = process.env.OWNER_EMAIL;
  if (!apiKey || !owner) {
    console.info("[email] contact notification skipped; RESEND_API_KEY or OWNER_EMAIL missing.");
    return;
  }

  const phone = phoneFromLocal(BUSINESS.phone.local);

  const body = `
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#0a0a0a;">
      <strong>${escapeHtml(input.name)}</strong> sent a message through the contact form.
    </p>    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#5e5e57;">Subject</p>
    <p style="margin:0 0 16px;font-size:16px;color:#0a0a0a;">${escapeHtml(input.subject)}</p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#0a0a0a;white-space:pre-wrap;">${escapeHtml(input.message)}</p>
    <p style="margin:0;font-size:13px;line-height:1.6;color:#5e5e57;">
      ${escapeHtml(input.email)}${input.phone ? ` · ${escapeHtml(input.phone)}` : ""}<br />
      ${input.subscribe ? "Also opted in to email updates." : "Did not opt in to updates."}
    </p>`;

  const html = `<!doctype html>
<html lang="en-ZA">
  <body style="margin:0;padding:0;background:#f4f3ef;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3ef;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:6px;overflow:hidden;">
            <tr>
              <td style="background:#0a0a0a;padding:20px 28px;">
                <span style="font-size:20px;font-weight:700;letter-spacing:0.14em;text-transform:lowercase;color:#f5f5f2;">grip on</span>
                <span style="display:inline-block;width:6px;height:6px;margin-left:4px;background:#ff6a00;border-radius:50%;"></span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <h1 style="margin:0 0 16px;font-size:24px;line-height:1;letter-spacing:0.02em;text-transform:uppercase;color:#0a0a0a;">New contact message</h1>
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;background:#f4f3ef;font-size:11px;line-height:1.6;color:#5e5e57;">
                Reply directly to this email to answer ${escapeHtml(input.name)}.<br />
                ${SITE.name} · ${SITE.location} · ${phone.display}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Grip On <onboarding@resend.dev>",
      to: owner,
      replyTo: input.email,
      subject: `Contact: ${input.subject}`,
      html,
    });
    if (error) console.error(`[email] contact message: ${error.message}`);
  } catch (error) {
    console.error("[email] contact message failed", error);
  }
}
