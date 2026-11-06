import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  Mail,
  MailOpen,
  MessageCircle,
  Phone,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { getAdminMessage } from "@/lib/admin/operations-queries";
import { deleteMessageAction, updateMessageStatusAction } from "@/lib/admin/message-actions";
import { formatOrderDate } from "@/lib/orders/format";
import { phoneFromLocal } from "@/lib/business";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/ui/confirm-dialog";
import { MarkMessageRead } from "@/components/admin/mark-message-read";
import { AdminPageHeader, AdminPanel } from "@/components/admin/ui";
import type { ContactMessageStatus } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Message" };

const STATUS_LABELS: Record<ContactMessageStatus, string> = {
  new: "New",
  read: "Read",
  archived: "Archived",
};

const STATUS_TONES: Record<ContactMessageStatus, string> = {
  new: "border-accent/40 bg-accent/10 text-accent",
  read: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  archived: "border-line-strong bg-bone/5 text-bone-dim",
};

export default async function AdminMessagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const message = await getAdminMessage(id);
  if (!message) notFound();
  const contact = message.phone ? phoneFromLocal(message.phone) : null;
  const status = message.status === "new" ? "read" : message.status;

  return (
    <>
      {message.status === "new" ? <MarkMessageRead id={message.id} /> : null}
      <Link
        href="/admin/messages"
        className="mb-5 inline-flex min-h-11 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-dim transition-colors hover:text-bone"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All messages
      </Link>

      <AdminPageHeader
        eyebrow={`Received ${formatOrderDate(message.created_at, true)}`}
        title={`${message.subject}.`}
        description={`${message.name} · ${message.email}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.14em]",
                STATUS_TONES[status],
              )}
            >
              {STATUS_LABELS[status]}
            </span>
            <a href={`mailto:${message.email}?subject=Re: ${message.subject}`} className={buttonClasses("primary")}>
              <Mail className="h-4 w-4" aria-hidden="true" />
              Reply
            </a>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-12">
        <AdminPanel title="Message" className="xl:col-span-8">
          <div className="px-4 py-5 sm:px-5">
            <p className="whitespace-pre-line text-sm leading-relaxed text-bone">{message.message}</p>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-line px-4 py-4 sm:px-5">
            {status !== "read" ? (
              <form action={updateMessageStatusAction}>
                <input type="hidden" name="id" value={message.id} />
                <input type="hidden" name="status" value="read" />
                <button type="submit" className={buttonClasses("secondary")}>
                  <MailOpen className="h-4 w-4" aria-hidden="true" />
                  Mark read
                </button>
              </form>
            ) : null}
            {message.status !== "archived" ? (
              <form action={updateMessageStatusAction}>
                <input type="hidden" name="id" value={message.id} />
                <input type="hidden" name="status" value="archived" />
                <button type="submit" className={buttonClasses("secondary")}>
                  <Archive className="h-4 w-4" aria-hidden="true" />
                  Archive
                </button>
              </form>
            ) : (
              <form action={updateMessageStatusAction}>
                <input type="hidden" name="id" value={message.id} />
                <input type="hidden" name="status" value="new" />
                <button type="submit" className={buttonClasses("secondary")}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Move to inbox
                </button>
              </form>
            )}
            <form action={deleteMessageAction}>
              <input type="hidden" name="id" value={message.id} />
              <ConfirmSubmit
                title="Delete this message?"
                description="The message will be removed permanently. Archive it instead if you only want it out of the inbox."
                confirmLabel="Delete message"
                className={buttonClasses("secondary", "border-red-400/40 text-red-300")}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete
              </ConfirmSubmit>
            </form>
          </div>
        </AdminPanel>

        <div className="space-y-6 xl:col-span-4">
          <AdminPanel title="Contact">
            <div className="space-y-2 px-4 py-5 text-sm sm:px-5">
              <p className="text-bone">{message.name}</p>
              <a
                href={`mailto:${message.email}`}
                className="flex min-h-11 items-center gap-2 break-all text-bone-dim transition-colors hover:text-bone"
              >
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                {message.email}
              </a>
              {contact ? (
                <div className="space-y-2">
                  <a
                    href={contact.tel}
                    className="flex min-h-11 items-center gap-2 text-bone-dim transition-colors hover:text-bone"
                  >
                    <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {contact.display}
                  </a>
                  <div className="flex flex-wrap gap-2">
                    <a href={contact.tel} className={buttonClasses("secondary", "flex-1")}>
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      Call
                    </a>
                    <a
                      href={contact.whatsapp(
                        `Hi ${message.name}, thanks for contacting Grip On. How can we help?`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonClasses("primary", "flex-1")}
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      WhatsApp
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-bone-dim">No phone number given.</p>
              )}
            </div>
          </AdminPanel>

          <AdminPanel title="Notes">
            <p className="px-4 py-5 text-xs leading-relaxed text-bone-dim sm:px-5">
              Replies are sent from your own inbox, so the full thread stays with you. Archiving
              only hides the message from the inbox.
            </p>
          </AdminPanel>
        </div>
      </div>
    </>
  );
}
