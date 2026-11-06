import Image from "next/image";
import { cn } from "@/lib/utils";

export function LifterMark({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/logo-lifter.svg"
      alt=""
      aria-hidden="true"
      width={120}
      height={120}
      className={cn("w-auto", className)}
      priority={priority}
      unoptimized
    />
  );
}
