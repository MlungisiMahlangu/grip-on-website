import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Wordmark({
  className,
  priority = false,
  onClick,
}: {
  className?: string;
  priority?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link href="/" onClick={onClick} className="inline-flex min-h-11 shrink-0 items-center">
      <Image
        src="/brand/wordmark.svg"
        alt="Grip On"
        width={375}
        height={96}
        className={cn("w-auto", className)}
        priority={priority}
        unoptimized
      />
    </Link>
  );
}
