"use client";
import { MapPin } from "lucide-react";

interface Props {
  lat: number;
  lng: number;
}

export function OrderMap({ lat, lng }: Props) {
  const bbox = `${lng - 0.015},${lat - 0.015},${lng + 0.015},${lat + 0.015}`;
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="space-y-2">
      <iframe
        src={osmUrl}
        width="100%"
        height="256"
        style={{ border: 0, borderRadius: "0.5rem" }}
        allowFullScreen
        loading="lazy"
        title="موقع العميل"
      />
      <a
        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs text-primary hover:underline"
      >
        <MapPin className="h-3.5 w-3.5" /> عرض على OpenStreetMap
      </a>
    </div>
  );
}
