import Image from "next/image";
import { cn } from "@/lib/utils";
import { CubeIcon } from "./icons";

/**
 * Product photo on a soft well. `mix-blend-multiply` melts the white photo
 * background into the well color so every image sits seamlessly on the card.
 * The wrapper is `relative`; to position it absolutely, wrap it in a positioned element.
 */
export function ProductImage({
  src,
  alt,
  sizes,
  className,
  imageClassName,
  eager = false,
  well = true,
}: {
  src: string | null;
  alt: string;
  sizes: string;
  className?: string;
  imageClassName?: string;
  eager?: boolean;
  /** Draw the soft background well (disable when the parent provides one). */
  well?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden", well && "bg-image", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          className={cn("object-contain mix-blend-multiply", imageClassName)}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-muted-foreground/60">
          <CubeIcon size={32} />
        </div>
      )}
    </div>
  );
}
