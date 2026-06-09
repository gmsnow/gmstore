"use client";
import { useState } from "react";

interface Props {
  images: string[];
  videoUrl?: string | null;
  alt: string;
}

function getYouTubeEmbed(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
    /youtube\.com\/embed\/([\w-]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
  }
  return null;
}

export function ProductGallery({ images, videoUrl, alt }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const hasVideo = videoUrl && getYouTubeEmbed(videoUrl);
  const allItems = hasVideo
    ? [{ type: "video" as const, src: getYouTubeEmbed(videoUrl!)! }, ...images.map((src) => ({ type: "image" as const, src }))]
    : images.map((src) => ({ type: "image" as const, src }));

  const current = allItems[selectedIndex];

  return (
    <div className="space-y-4">
      <div className="aspect-square rounded-xl bg-muted overflow-hidden">
        {current?.type === "video" ? (
          <iframe
            src={current.src}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={alt}
          />
        ) : (
          <img
            src={current?.src}
            alt={`${alt} ${selectedIndex}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
      </div>
      {allItems.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allItems.map((item, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`relative h-20 w-20 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${i === selectedIndex ? "border-primary" : "border-border hover:border-muted-foreground"}`}
            >
              {item.type === "video" ? (
                <div className="h-full w-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                  ▶
                </div>
              ) : (
                <img src={item.src} alt="" className="h-full w-full object-cover" loading="lazy" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
