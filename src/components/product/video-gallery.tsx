"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductVideo } from "@/lib/types";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PlayIcon } from "../ui/icons";
import { VideoEmbed } from "./video-embed";

export function VideoGallery({ videos }: { videos: ProductVideo[] }) {
  const [active, setActive] = useState(0);
  const current = videos[active] ?? videos[0];
  if (!current) return null;
  const multiple = videos.length > 1;

  return (
    <div className={cn("grid gap-5", multiple && "lg:grid-cols-[minmax(0,1fr)_320px]")}>
      <div className="aspect-video overflow-hidden rounded-3xl border bg-neutral-950">
        <VideoEmbed key={current.id} video={current} />
      </div>
      {multiple && (
        <ul className="space-y-2" aria-label="More videos">
          {videos.map((video, i) => (
            <li key={video.id}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-current={i === active ? "true" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border p-2 text-left transition-colors",
                  i === active ? "border-foreground/30 bg-muted" : "hover:bg-muted",
                )}
              >
                <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-xl bg-neutral-900">
                  {video.thumbnail && <Image src={video.thumbnail} alt="" fill sizes="112px" className="object-cover" />}
                  <span className="absolute inset-0 grid place-items-center bg-black/30 text-white">
                    <PlayIcon size={16} fill="currentColor" strokeWidth={0} />
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="line-clamp-2 text-[13px] font-medium leading-snug text-foreground">{video.title}</span>
                  {!!video.duration && <span className="mt-0.5 block text-xs tabular-nums text-muted-foreground">{formatDuration(video.duration)}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
