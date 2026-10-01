"use client";

import { useCallback, useEffect, useState, type PointerEvent } from "react";
import Image from "next/image";
import type { ProductImage as ProductImageType, ProductVideo } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Dialog } from "../ui/dialog";
import { ChevronLeftIcon, ChevronRightIcon, ExpandIcon, PlayIcon, XIcon } from "../ui/icons";
import { ProductImage } from "../ui/product-image";
import { VideoEmbed } from "./video-embed";

type Media = { kind: "image"; image: ProductImageType } | { kind: "video"; video: ProductVideo };

export function ProductGallery({ images, videos, title }: { images: ProductImageType[]; videos: ProductVideo[]; title: string }) {
  const media: Media[] = [
    ...images.map((image) => ({ kind: "image" as const, image })),
    ...videos.slice(0, 4).map((video) => ({ kind: "video" as const, video })),
  ];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const current = media[active] ?? null;
  const imageIndexes = media.map((m, i) => (m.kind === "image" ? i : -1)).filter((i) => i >= 0);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--zoom-x", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    e.currentTarget.style.setProperty("--zoom-y", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  };

  return (
    <div className="lg:sticky lg:top-[calc(var(--header-height)+24px)] lg:self-start">
      <div className="relative aspect-square overflow-hidden rounded-3xl border bg-image">
        {!current && <ProductImage src={null} alt={title} sizes="50vw" well={false} className="h-full w-full" />}
        {current?.kind === "image" && (
          <div
            className="zoom-stage absolute inset-0 cursor-zoom-in"
            data-zoom={zoom ? "on" : "off"}
            onPointerEnter={(e) => e.pointerType === "mouse" && setZoom(true)}
            onPointerLeave={() => setZoom(false)}
            onPointerMove={onMove}
            onClick={() => setLightbox(true)}
          >
            <Image
              src={current.image.src}
              alt={current.image.alt || title}
              fill
              sizes="(min-width: 1280px) 640px, (min-width: 1024px) 50vw, 100vw"
              loading="eager"
              fetchPriority="high"
              className="object-contain p-[9%] mix-blend-multiply"
            />
          </div>
        )}
        {current?.kind === "video" && (
          <div className="absolute inset-0 grid place-items-center bg-neutral-950">
            <div className="aspect-video w-full">
              <VideoEmbed key={current.video.id} video={current.video} />
            </div>
          </div>
        )}
        {current?.kind === "image" && (
          <button
            type="button"
            onClick={() => setLightbox(true)}
            aria-label="View full screen"
            className="absolute bottom-4 right-4 grid size-10 place-items-center rounded-xl border bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
          >
            <ExpandIcon size={17} />
          </button>
        )}
      </div>

      {media.length > 1 && (
        <div className="scrollbar-none mt-3 flex gap-2.5 overflow-x-auto pb-1" role="tablist" aria-label="Product media">
          {media.map((m, i) => (
            <button
              key={m.kind === "image" ? `img-${i}` : `vid-${m.video.id}`}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={m.kind === "image" ? `Image ${i + 1}` : `Video: ${m.video.title}`}
              onClick={() => setActive(i)}
              className={cn(
                "relative size-[76px] shrink-0 overflow-hidden rounded-2xl border bg-image transition-all",
                i === active ? "border-foreground ring-1 ring-foreground" : "hover:border-foreground/30",
              )}
            >
              {m.kind === "image" ? (
                <Image src={m.image.src} alt="" fill sizes="76px" className="object-contain p-2 mix-blend-multiply" />
              ) : (
                <>
                  {m.video.thumbnail && <Image src={m.video.thumbnail} alt="" fill sizes="76px" className="object-cover" />}
                  <span className="absolute inset-0 grid place-items-center bg-black/35 text-white">
                    <PlayIcon size={18} fill="currentColor" strokeWidth={0} />
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      )}

      <Lightbox
        open={lightbox}
        onClose={() => setLightbox(false)}
        images={imageIndexes.map((i) => (media[i] as { kind: "image"; image: ProductImageType }).image)}
        start={Math.max(0, imageIndexes.indexOf(active))}
        title={title}
      />
    </div>
  );
}

function Lightbox({
  open,
  onClose,
  images,
  start,
  title,
}: {
  open: boolean;
  onClose: () => void;
  images: ProductImageType[];
  start: number;
  title: string;
}) {
  const [index, setIndex] = useState(start);
  useEffect(() => {
    if (open) setIndex(start);
  }, [open, start]);

  const step = useCallback((dir: number) => setIndex((i) => (images.length ? (i + dir + images.length) % images.length : 0)), [images.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  const image = images[index];
  return (
    <Dialog open={open} onClose={onClose} label={`${title} images`} width="min(92vw, 72rem)">
      <div className="relative overflow-hidden rounded-3xl bg-image shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-xl bg-background/90 text-foreground shadow-sm backdrop-blur hover:bg-background"
        >
          <XIcon size={18} />
        </button>
        <div className="relative h-[min(82vh,56rem)] w-full">
          {image && <Image src={image.src} alt={image.alt || title} fill sizes="92vw" className="object-contain p-[5%] mix-blend-multiply" />}
        </div>
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-background/90 shadow-lg hover:bg-background"
            >
              <ChevronLeftIcon size={20} />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next image"
              className="absolute right-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-background/90 shadow-lg hover:bg-background"
            >
              <ChevronRightIcon size={20} />
            </button>
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/90 px-3 py-1 text-xs font-medium tabular-nums text-foreground shadow-sm">
              {index + 1} / {images.length}
            </p>
          </>
        )}
      </div>
    </Dialog>
  );
}
