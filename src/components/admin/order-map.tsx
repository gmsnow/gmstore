"use client";

interface Props {
  lat: number;
  lng: number;
}

export function OrderMap({ lat, lng }: Props) {
  return (
    <iframe
      src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
      width="100%"
      height="256"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="موقع العميل"
    />
  );
}
