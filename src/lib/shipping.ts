const WAREHOUSE_LAT = 15.3694;
const WAREHOUSE_LNG = 44.1910;
const COST_PER_KM = 50;
const BASE_SHIPPING_COST = 200;
const MAX_SHIPPING_COST = 1500;
const FREE_SHIPPING_THRESHOLD = 3000;

function toRad(deg: number) {
  return deg * (Math.PI / 180);
}

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getWarehouseCoords() {
  return { lat: WAREHOUSE_LAT, lng: WAREHOUSE_LNG };
}

export function calculateShippingCost(params: {
  subtotal: number;
  lat?: number;
  lng?: number;
  storeLat?: number;
  storeLng?: number;
}): number {
  const { subtotal, lat, lng, storeLat, storeLng } = params;

  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  if (lat == null || lng == null) return BASE_SHIPPING_COST;

  const fromLat = storeLat ?? WAREHOUSE_LAT;
  const fromLng = storeLng ?? WAREHOUSE_LNG;

  const distance = haversineDistance(fromLat, fromLng, lat, lng);
  const cost = Math.round(BASE_SHIPPING_COST + distance * COST_PER_KM);

  return Math.min(cost, MAX_SHIPPING_COST);
}

export { FREE_SHIPPING_THRESHOLD };
