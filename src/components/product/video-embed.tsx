"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductVideo } from "@/lib/types";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PlayIcon } from "../ui/icons";

export function embedUrl(video: ProductVideo, autoplay: boolean): string {
  if (video.provider === "vimeo") {
    const params = new URLSearchParams({ autoplay: autoplay ? "1" : "0", dnt: "1", title: "0", byline: "0", portrait: "0" });
    if (video.hash) params.set("h", video.hash);
    return `https://player.vimeo.com/video/${video.id}?${params.toString()}`;
  }
  if (video.provider === "youtube") {
    return `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1`;
  }
  return video.id;
}

/**
 * Lightweight video: shows a poster and only loads the third-party player
 * when the visitor presses play (keeps product pages fast).
 */
export function VideoEmbed({ video, className, sizes = "(min-width: 1024px) 60vw, 100vw" }: { video: ProductVideo; className?: string; sizes?: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    if (video.provider === "file") {
      return <video src={video.id} poster={video.thumbnail} controls autoPlay playsInline className={cn("h-full w-full bg-black object-contain", className)} />;
    }
    return (
      <iframe
        src={embedUrl(video, true)}
        title={video.title}
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        className={cn("h-full w-full border-0 bg-black", className)}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play video: ${video.title}`}
      className={cn("group relative block h-full w-full overflow-hidden bg-neutral-900 text-left", className)}
    >
      {video.thumbnail && (
        <Image
          src={video.thumbnail}
          alt=""
          fill
          sizes={sizes}
          className="object-cover opacity-90 transition-[transform,opacity] duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
        />
      )}
      <span className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
      <span className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-neutral-900 shadow-2xl transition-transform duration-300 group-hover:scale-110">
        <PlayIcon size={26} className="ml-1" fill="currentColor" strokeWidth={0} />
      </span>
      <span className="absolute inset-x-5 bottom-4 text-white">
        <span className="block text-sm font-semibold leading-snug sm:text-[15px]">{video.title}</span>
        {!!video.duration && <span className="mt-0.5 block text-xs tabular-nums text-white/75">{formatDuration(video.duration)}</span>}
      </span>
    </button>
  );
}
