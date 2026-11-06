"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET, mediaUrl } from "@/lib/supabase/media";
import { toast } from "@/lib/toast";
import { buttonClasses } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

const ACCEPTED = ["image/webp", "image/jpeg", "image/png", "image/avif"];
const MAX_BYTES = 10 * 1024 * 1024;

async function uploadImage(file: File, folder: string) {
  if (!ACCEPTED.includes(file.type)) {
    throw new Error("Use a WebP, JPEG, PNG or AVIF image.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Keep each image under 10 MB.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "webp";
  const path = `${folder.replace(/^\/+|\/+$/g, "")}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { cacheControl: "31536000", contentType: file.type, upsert: false });

  if (error) throw new Error(error.message);
  return data.path;
}

function UploadButton({
  id,
  label,
  busy,
  multiple,
  onFiles,
}: {
  id: string;
  label: string;
  busy: boolean;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
}) {
  return (
    <>
      <input
        id={id}
        type="file"
        accept={ACCEPTED.join(",")}
        multiple={multiple}
        className="sr-only"
        disabled={busy}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (files.length) onFiles(files);
        }}
      />
      <label
        htmlFor={id}
        className={cn(
          buttonClasses("secondary", "cursor-pointer"),
          busy && "pointer-events-none opacity-60",
        )}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Upload className="h-4 w-4" aria-hidden="true" />
        )}
        {busy ? "Uploading…" : label}
      </label>
    </>
  );
}

export function SingleImageField({
  label,
  name,
  folder,
  defaultValue,
  hint,
  onDirty,
}: {
  label: string;
  name: string;
  folder: string;
  defaultValue?: string | null;
  hint?: string;
  onDirty?: () => void;
}) {
  const id = useId();
  const [value, setValue] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const preview = mediaUrl(value || null);

  const handleFiles = async (files: File[]) => {
    setError("");
    setBusy(true);
    try {
      const path = await uploadImage(files[0], folder);
      setValue(path);
      onDirty?.();
      toast.success("Image uploaded.");
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Upload failed.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="eyebrow text-bone-dim">{label}</p>
      <input type="hidden" name={name} value={value} />

      <div className="flex items-start gap-3">
        <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-[var(--radius-card)] border border-line bg-ink-raised">
          {preview ? (
            <Image src={preview} alt="" fill sizes="96px" className="object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-bone-dim">
              <ImagePlus className="h-6 w-6" aria-hidden="true" />
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
          <UploadButton
            id={`${id}-single`}
            label={value ? "Replace" : "Upload image"}
            busy={busy}
            onFiles={handleFiles}
          />
          {value ? (
            <button
              type="button"
              onClick={() => setConfirmRemove(true)}
              className="flex min-h-11 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-bone-dim transition-colors hover:text-red-300"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Remove
            </button>
          ) : null}
          {hint ? <p className="text-[11px] leading-relaxed text-bone-dim">{hint}</p> : null}
          {error ? (
            <p role="alert" className="text-xs text-red-400">
              {error}
            </p>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        onConfirm={() => {
          setConfirmRemove(false);
          setValue("");
          onDirty?.();
          toast.success("Image removed.");
        }}
        title="Remove this image?"
        description="The image is taken off this form. Save the form to apply the change. The file stays in storage."
        confirmLabel="Remove image"
      />
    </div>
  );
}

export function GalleryField({
  label,
  name,
  folder,
  defaultValue = [],
  max = 8,
  hint,
  onDirty,
}: {
  label: string;
  name: string;
  folder: string;
  defaultValue?: string[];
  max?: number;
  hint?: string;
  onDirty?: () => void;
}) {
  const id = useId();
  const [value, setValue] = useState<string[]>(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [removePath, setRemovePath] = useState<string | null>(null);

  const handleFiles = async (files: File[]) => {
    setError("");
    const room = Math.max(0, max - value.length);
    if (room === 0) {
      setError(`You can add up to ${max} gallery images.`);
      return;
    }

    setBusy(true);
    try {
      const uploaded: string[] = [];
      for (const file of files.slice(0, room)) {
        uploaded.push(await uploadImage(file, folder));
      }
      setValue((current) => [...current, ...uploaded]);
      onDirty?.();
      toast.success(uploaded.length === 1 ? "Image uploaded." : `${uploaded.length} images uploaded.`);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Upload failed.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow text-bone-dim">{label}</p>
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-bone-dim">
          {value.length}/{max}
        </span>
      </div>
      <input type="hidden" name={name} value={JSON.stringify(value)} />

      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {value.map((path) => {
            const preview = mediaUrl(path);
            return (
              <li key={path} className="relative">
                <div className="relative h-20 w-16 overflow-hidden rounded-[var(--radius-card)] border border-line bg-ink-raised">
                  {preview ? (
                    <Image src={preview} alt="" fill sizes="64px" className="object-cover" />
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setRemovePath(path)}
                  className="absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-line bg-ink text-bone-dim transition-colors hover:border-red-400/50 hover:text-red-300"
                  aria-label="Remove gallery image"
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {value.length < max ? (
        <div>
          <UploadButton
            id={`${id}-gallery`}
            label="Add gallery images"
            busy={busy}
            multiple
            onFiles={handleFiles}
          />
        </div>
      ) : null}

      {hint ? <p className="text-[11px] leading-relaxed text-bone-dim">{hint}</p> : null}
      {error ? (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      ) : null}

      <ConfirmDialog
        open={removePath !== null}
        onClose={() => setRemovePath(null)}
        onConfirm={() => {
          setValue((current) => current.filter((item) => item !== removePath));
          setRemovePath(null);
          onDirty?.();
          toast.success("Image removed from the gallery.");
        }}
        title="Remove this gallery image?"
        description="The image is taken off this form. Save the colourway to apply the change. The file stays in storage."
        confirmLabel="Remove image"
      />
    </div>
  );
}
