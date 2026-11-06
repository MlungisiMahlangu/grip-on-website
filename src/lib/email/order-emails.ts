import "server-only";

import { Resend } from "resend";
import { SITE } from "@/lib/site";
import { formatPriceCents } from "@/lib/utils";
import type { TrackedOrder } from "@/lib/orders/types";
import type { OrderStatus } from "@/lib/supabase/types";
import type { CheckoutInput } from "@/lib/checkout/schema";

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

function sizeLabel(size: string) {
  return size === "ONE_SIZE" ? "One size" : size;
}

function itemsTable(order: TrackedOrder) {
  return order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e7e6e1;font-size:14px;color:#0a0a0a;">
            ${escapeHtml(item.product_name)}
            <span style="display:block;margin-top:2px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#5e5e57;">
              ${escapeHtml(item.colour_name)} · ${sizeLabel(item.size)} · Qty ${item.quantity}
            </span>
          </td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid #e7e6e1;font-size:14px;color:#0a0a0a;white-space:nowrap;">
            ${formatPriceCents(item.line_total_cents)}
          </td>
        </tr>`,
    )
    .join("");
}

function shell(title: string, body: string) {
  return `<!doctype html>
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
                <h1 style="margin:0 0 16px;font-size:26px;line-height:1;letter-spacing:0.02em;text-transform:uppercase;color:#0a0a0a;">${title}</h1>
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;background:#f4f3ef;font-size:11px;line-height:1.6;color:#5e5e57;">
                Grip On · ${SITE.location}<br />
                Questions? Reply to this email or write to ${SITE.email}.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function customerEmail(order: TrackedOrder) {
  const body = `
    <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#0a0a0a;">
      Thanks ${escapeHtml(order.customer_first_name)}. We have your order and we are getting it ready.
    </p>
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#5e5e57;">Order</p>
    <p style="margin:0 0 22px;font-size:18px;font-weight:700;color:#0a0a0a;">${escapeHtml(order.order_number)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${itemsTable(order)}
      <tr>
        <td style="padding:10px 0 0;font-size:13px;color:#5e5e57;">Subtotal</td>
        <td align="right" style="padding:10px 0 0;font-size:13px;color:#0a0a0a;">${formatPriceCents(order.subtotal_cents)}</td>
      </tr>
      ${
        order.discount_cents > 0
          ? `<tr>
        <td style="padding:4px 0 0;font-size:13px;color:#5e5e57;">Discount${order.discount_code ? ` · ${escapeHtml(order.discount_code)}` : ""}</td>
        <td align="right" style="padding:4px 0 0;font-size:13px;color:#0a0a0a;">−${formatPriceCents(order.discount_cents)}</td>
      </tr>`
          : ""
      }
      <tr>
        <td style="padding:4px 0 0;font-size:13px;color:#5e5e57;">Delivery</td>
        <td align="right" style="padding:4px 0 0;font-size:13px;color:#0a0a0a;">${order.delivery_fee_cents === 0 ? "Free" : formatPriceCents(order.delivery_fee_cents)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0 0;font-size:15px;font-weight:700;color:#0a0a0a;">Total</td>
        <td align="right" style="padding:10px 0 0;font-size:15px;font-weight:700;color:#0a0a0a;">${formatPriceCents(order.total_cents)}</td>
      </tr>
    </table>
    <p style="margin:22px 0 0;padding:14px 16px;background:#fff4ec;border-left:3px solid #ff6a00;font-size:13px;line-height:1.6;color:#0a0a0a;">
      <strong>Cash on delivery.</strong> Have ${formatPriceCents(order.total_cents)} ready for the courier.
      We deliver to ${escapeHtml(order.city)}, ${escapeHtml(order.province)}.
    </p>
    <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#5e5e57;">
      You can follow your order at
      <a href="${SITE.url}/track-order" style="color:#0a0a0a;">${SITE.url}/track-order</a>
      with this order number and your email or phone.
    </p>`;

  return shell("Order confirmed.", body);
}

function ownerEmail(order: TrackedOrder, customer: CheckoutInput) {
  const address = [
    customer.addressLine1,
    customer.addressLine2,
    customer.suburb,
    customer.city,
    customer.province,
    customer.postalCode,
  ]
    .filter(Boolean)
    .map((line) => escapeHtml(line as string))
    .join("<br />");

  const body = `
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#0a0a0a;">
      New cash-on-delivery order <strong>${escapeHtml(order.order_number)}</strong> for
      <strong>${formatPriceCents(order.total_cents)}</strong>.
    </p>
    ${
      order.discount_cents > 0
        ? `<p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#5e5e57;">Discount applied: <strong>${escapeHtml(order.discount_code ?? "code")}</strong> (−${formatPriceCents(order.discount_cents)}).</p>`
        : ""
    }
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${itemsTable(order)}
    </table>
    <p style="margin:20px 0 4px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#5e5e57;">Deliver to</p>
    <p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#0a0a0a;">
      ${escapeHtml(order.customer_first_name)} ${escapeHtml(customer.lastName)}<br />
      ${escapeHtml(customer.phone)} · ${escapeHtml(customer.email)}<br />
      ${address}
    </p>
    ${
      customer.deliveryNotes
        ? `<p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#5e5e57;"><strong>Notes:</strong> ${escapeHtml(customer.deliveryNotes)}</p>`
        : ""
    }
    <p style="margin:0;font-size:13px;line-height:1.6;color:#5e5e57;">
      Open the admin dashboard to move this order through packing and delivery.
    </p>`;

  return shell(`New order ${order.order_number}`, body);
}

export async function sendOrderEmails(order: TrackedOrder, customer: CheckoutInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[email] RESEND_API_KEY not set; skipping emails for ${order.order_number}.`);
    return;
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL || "Grip On <onboarding@resend.dev>";
  const owner = process.env.OWNER_EMAIL;

  const messages = [
    {
      to: customer.email,
      subject: `Order ${order.order_number} confirmed — Grip On`,
      html: customerEmail(order),
    },
  ];

  if (owner) {
    messages.push({
      to: owner,
      subject: `New order ${order.order_number} · ${formatPriceCents(order.total_cents)}`,
      html: ownerEmail(order, customer),
    });
  }

  for (const message of messages) {
    try {
      const { error } = await resend.emails.send({ from, ...message });
      if (error) console.error(`[email] ${message.subject}: ${error.message}`);
    } catch (error) {
      console.error(`[email] ${message.subject} failed`, error);
    }
  }
}

const STATUS_EMAIL_COPY: Partial<Record<OrderStatus, { subject: string; intro: string }>> = {
  confirmed: {
    subject: "confirmed",
    intro: "Your order is confirmed and we are packing it now.",
  },
  packed: {
    subject: "packed",
    intro: "Your order is packed and waiting for the courier.",
  },
  shipped: {
    subject: "on the way",
    intro: "Your order has left us and is on the way.",
  },
  delivered: {
    subject: "delivered",
    intro: "Your order has been delivered. Thanks for training with us.",
  },
  cancelled: {
    subject: "cancelled",
    intro: "Your order has been cancelled. Nothing further is owed on it.",
  },
};

export async function sendOrderStatusEmail(
  order: TrackedOrder,
  customerEmail: string,
  status: OrderStatus,
  note: string | null,
) {
  const copy = STATUS_EMAIL_COPY[status];
  if (!copy) return;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[email] RESEND_API_KEY not set; skipping ${status} email for ${order.order_number}.`);
    return;
  }

  const body = `
    <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#0a0a0a;">
      ${copy.intro}
    </p>
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#5e5e57;">Order</p>
    <p style="margin:0 0 18px;font-size:18px;font-weight:700;color:#0a0a0a;">${escapeHtml(order.order_number)}</p>
    ${
      note
        ? `<p style="margin:0 0 18px;padding:14px 16px;background:#f4f3ef;border-left:3px solid #ff6a00;font-size:13px;line-height:1.6;color:#0a0a0a;">${escapeHtml(note)}</p>`
        : ""
    }
    <p style="margin:0;font-size:13px;line-height:1.6;color:#5e5e57;">
      Total ${formatPriceCents(order.total_cents)} · Delivering to ${escapeHtml(order.city)}, ${escapeHtml(order.province)}.<br />
      Follow it any time at
      <a href="${SITE.url}/track-order" style="color:#0a0a0a;">${SITE.url}/track-order</a>.
    </p>`;

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Grip On <onboarding@resend.dev>",
      to: customerEmail,
      subject: `Order ${order.order_number} ${copy.subject} — Grip On`,
      html: shell(`Order ${copy.subject}.`, body),
    });
    if (error) console.error(`[email] status ${status}: ${error.message}`);
  } catch (error) {
    console.error(`[email] status ${status} failed`, error);
  }
}
