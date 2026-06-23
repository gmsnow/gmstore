const CJ_BASE = "https://developers.cjdropshipping.com/api2.0/v1";
const TOKEN_REFRESH_BUFFER_MS = 24 * 60 * 60 * 1000; // refresh 1 day early

// ── Types ──

export interface CjAuthData {
  openId: number;
  accessToken: string;
  accessTokenExpiryDate: string;
  refreshToken: string;
  refreshTokenExpiryDate: string;
}

export interface CjApiResponse<T = unknown> {
  code: number;
  result?: boolean;
  message?: string;
  data: T;
  requestId: string;
}

// Category tree
export interface CjCategoryTree {
  categoryFirstName: string;
  categoryFirstList: CjSecondLevel[];
}

export interface CjSecondLevel {
  categorySecondName: string;
  categorySecondList: CjThirdLevel[];
}

export interface CjThirdLevel {
  categoryId: string;
  categoryName: string;
}

// Product list V2
export interface CjProductListV2Params {
  keyWord?: string;
  page?: number;
  size?: number;
  categoryId?: string;
  lv2categoryList?: string[];
  lv3categoryList?: string[];
  countryCode?: string;
  startSellPrice?: number;
  endSellPrice?: number;
  addMarkStatus?: number;
  productType?: number;
  verifiedWarehouse?: number;
  sort?: "desc" | "asc";
  orderBy?: number;
  features?: string[];
}

export interface CjProductListItem {
  id: string;
  nameEn: string;
  sku: string;
  bigImage: string;
  sellPrice: string;
  nowPrice: string;
  discountPrice: string;
  discountPriceRate: string;
  listedNum: number;
  categoryId: string;
  threeCategoryName: string;
  addMarkStatus: number;
  isVideo: number;
  productType: string;
  supplierName: string;
  createAt: number;
  warehouseInventoryNum: number;
  verifiedWarehouse: number;
  customization: number;
  isPersonalized: number;
  myProduct: boolean;
  deliveryCycle: string;
  description?: string;
}

export interface CjProductListV2Item {
  productList: CjProductListItem[];
  relatedCategoryList?: any[];
  keyWord?: string;
}

export interface CjProductListV2Data {
  pageSize: number;
  pageNumber: number;
  totalRecords: number;
  totalPages: number;
  content: CjProductListV2Item[];
}

export function flattenCjProducts(data: CjProductListV2Data): CjProductListItem[] {
  const items: CjProductListItem[] = [];
  for (const c of data.content || []) {
    if (c.productList) items.push(...c.productList);
  }
  return items;
}

export interface CjVariant {
  vid: string;
  pid: string;
  variantNameEn: string;
  variantSku: string;
  variantKey: string;
  variantLength: number;
  variantWidth: number;
  variantHeight: number;
  variantVolume: number;
  variantWeight: number;
  variantSellPrice: number;
  variantSugSellPrice: number;
  variantStandard: string;
  inventories: CjInventory[];
}

export interface CjInventory {
  countryCode: string;
  totalInventory: number;
  cjInventory: number;
  factoryInventory: number;
  verifiedWarehouse: number;
  stock: { stockId: string; inventory: number; factoryInventory: number }[];
}

export interface CjProductDetail {
  pid: string;
  productName: string;
  productNameEn: string;
  productSku: string;
  bigImage: string;
  productImage: string;
  productImageSet: string[];
  productWeight: string;
  productUnit: string;
  sellPrice: string;
  suggestSellPrice: string;
  categoryId: string;
  categoryName: string;
  description: string;
  entryCode: string;
  entryName: string;
  entryNameEn: string;
  materialName: string;
  materialNameSet: string;
  materialNameEn: string;
  packingWeight: number;
  variants: CjVariant[];
  createrTime: number;
  addMarkStatus: number;
  supplierName: string;
  supplierId: string;
}

// ── In-memory token cache ──

interface TokenCache {
  apiKey: string;
  accessToken: string;
  refreshToken: string;
  openId: number;
  expiresAt: number; // ms timestamp
  refreshExpiresAt: number;
}
let tokenCache: TokenCache | null = null;

// ── HTTP Client ──

async function cjFetch<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string | number | boolean | string[]> } = {}
): Promise<CjApiResponse<T>> {
  const token = tokenCache?.accessToken;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { "CJ-Access-Token": token } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  let url = `${CJ_BASE}${path}`;
  if (options.params) {
    const searchParams = new URLSearchParams();
    for (const [key, val] of Object.entries(options.params)) {
      if (Array.isArray(val)) {
        val.forEach((v) => searchParams.append(key, v));
      } else if (val !== undefined && val !== null && val !== "") {
        searchParams.set(key, String(val));
      }
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body as string | undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`CJ API ${res.status}: ${text || res.statusText}`);
  }

  const json: CjApiResponse<T> = await res.json();
  if (json.code !== 200) {
    throw new Error(`CJ API error ${json.code}: ${json.message || "Unknown"}`);
  }
  return json;
}

// ── Auth ──

export async function getAccessToken(apiKey: string): Promise<CjAuthData> {
  const json = await cjFetch<CjAuthData>("/authentication/getAccessToken", {
    method: "POST",
    body: JSON.stringify({ apiKey }),
  });
  const data = json.data;
  tokenCache = {
    apiKey,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    openId: data.openId,
    expiresAt: new Date(data.accessTokenExpiryDate).getTime(),
    refreshExpiresAt: new Date(data.refreshTokenExpiryDate).getTime(),
  };
  return data;
}

export async function refreshAccessToken(): Promise<CjAuthData> {
  if (!tokenCache?.refreshToken) throw new Error("No refresh token available");
  const json = await cjFetch<CjAuthData>("/authentication/refreshAccessToken", {
    method: "POST",
    body: JSON.stringify({ refreshToken: tokenCache.refreshToken }),
  });
  const data = json.data;
  tokenCache = {
    ...tokenCache!,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    openId: data.openId,
    expiresAt: new Date(data.accessTokenExpiryDate).getTime(),
    refreshExpiresAt: new Date(data.refreshTokenExpiryDate).getTime(),
  };
  return data;
}

export function getCachedToken() {
  return tokenCache;
}

export async function ensureValidToken(apiKey?: string): Promise<string> {
  if (tokenCache && apiKey && tokenCache.apiKey !== apiKey) tokenCache = null;

  if (tokenCache && Date.now() < tokenCache.expiresAt - TOKEN_REFRESH_BUFFER_MS) {
    return tokenCache.accessToken;
  }

  if (tokenCache && Date.now() < tokenCache.refreshExpiresAt) {
    await refreshAccessToken();
    return tokenCache!.accessToken;
  }

  if (!apiKey) throw new Error("CJ API key required");
  await getAccessToken(apiKey);
  return tokenCache!.accessToken;
}

// ── Categories ──

export async function getCjCategories(): Promise<CjCategoryTree[]> {
  const json = await cjFetch<CjCategoryTree[]>("/product/getCategory");
  return json.data;
}

// ── Products ──

export async function searchCjProducts(
  params: CjProductListV2Params
): Promise<CjProductListV2Data> {
  const json = await cjFetch<CjProductListV2Data>("/product/listV2", { params: params as any });
  return json.data;
}

export async function getCjProductDetail(pid: string, countryCode?: string): Promise<CjProductDetail> {
  const params: Record<string, string | number> = { pid };
  if (countryCode) params.countryCode = countryCode;
  const json = await cjFetch<CjProductDetail>("/product/query", { params });
  return json.data;
}

export async function getCjProductVariants(pid: string, countryCode?: string): Promise<CjVariant[]> {
  const params: Record<string, string | number> = { pid };
  if (countryCode) params.countryCode = countryCode;
  const json = await cjFetch<CjVariant[]>("/product/variant/query", { params });
  return json.data;
}

export async function addToMyProducts(productId: string): Promise<void> {
  await cjFetch("/product/addToMyProduct", {
    method: "POST",
    body: JSON.stringify({ productId }),
  });
}

export async function getMyCjProducts(params: {
  keyword?: string;
  page?: number;
  size?: number;
}): Promise<CjProductListV2Data> {
  const json = await cjFetch<CjProductListV2Data>("/product/myProduct/query", { params: params as any });
  return json.data;
}

// ── Inventory ──

export async function getCjInventoryByPid(pid: string): Promise<any> {
  const json = await cjFetch("/product/stock/getInventoryByPid", { params: { pid } });
  return json.data;
}

export async function getCjInventoryByVid(vid: string): Promise<any> {
  const json = await cjFetch("/product/stock/queryByVid", { params: { vid } });
  return json.data;
}

// ── Orders ──

export interface CjCreateOrderProduct {
  vid: string;
  quantity: number;
  storeLineItemId?: string;
}

export interface CjCreateOrderParams {
  orderNumber: string;
  shippingCountryCode: string;
  shippingCountry: string;
  shippingProvince: string;
  shippingCity: string;
  shippingCounty?: string;
  shippingPhone: string;
  shippingCustomerName: string;
  shippingAddress: string;
  shippingAddress2?: string;
  shippingZip?: string;
  email?: string;
  remark?: string;
  payType?: string;
  logisticName?: string;
  products: CjCreateOrderProduct[];
}

export interface CjCreateOrderResult {
  orderCode: string;
  cjPayUrl?: string;
}

export async function createCjOrder(params: CjCreateOrderParams): Promise<CjCreateOrderResult> {
  const json = await cjFetch<CjCreateOrderResult>("/shopping/order/createOrderV2", {
    method: "POST",
    body: JSON.stringify({ ...params, payType: params.payType || "3", orderFlow: 1 }),
  });
  return json.data;
}

export async function getCjOrderList(params: {
  page?: number;
  size?: number;
  orderCode?: string;
  startDate?: string;
  endDate?: string;
  status?: number;
}): Promise<any> {
  const json = await cjFetch<any>("/shopping/order/getOrderList", { params: params as any });
  return json.data;
}

export async function getCjOrderDetail(orderCode: string): Promise<any> {
  const json = await cjFetch<any>("/shopping/order/getOrderDetail", { params: { orderCode } });
  return json.data;
}

export async function calculateCjFreight(params: {
  vid: string;
  quantity: number;
  shippingCountryCode: string;
}): Promise<any> {
  const json = await cjFetch<any>("/logistics/freight/calculate", { params: params as any });
  return json.data;
}
