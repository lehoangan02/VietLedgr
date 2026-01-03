import { getApiBaseUrl, authHeaders } from "./common";

export type ProductListItem = {
  product_id: string;
  store_id: string;
  name: string;
  sku: string;
  category_id?: string | null;
  description?: string | null;
};

export type BatchItem = {
  batch_id: string;
  product_id: string;
  warehouse_id: string;
  stock: number;
  cost: string; // Decimal as string
  sale_price: string; // Decimal as string
  import_date: string;
  expire_date?: string | null;
  supplier_name?: string | null;
};

export async function fetchProducts(skip = 0, limit = 100): Promise<ProductListItem[]> {
  const base = getApiBaseUrl();
  const url = `${base}/api/products/?skip=${skip}&limit=${limit}`;
  console.debug("[Fetch] Products", { url });
  const res = await fetch(url, { headers: authHeaders(), cache: "no-store" });
  if (!res.ok) {
    console.error("[Fetch] Products failed", res.status, await safeText(res));
    throw new Error(`Failed to fetch products: ${res.status}`);
  }
  const data = await res.json();
  console.debug("[Fetch] Products count", Array.isArray(data) ? data.length : data.items?.length ?? 0);
  // Router returns a list directly
  return Array.isArray(data) ? data : data.items ?? [];
}

export async function fetchBatches(skip = 0, limit = 1000): Promise<BatchItem[]> {
  const base = getApiBaseUrl();
  const url = `${base}/api/batches/?skip=${skip}&limit=${limit}`;
  console.debug("[Fetch] Batches", { url });
  const res = await fetch(url, { headers: authHeaders(), cache: "no-store" });
  if (!res.ok) {
    console.error("[Fetch] Batches failed", res.status, await safeText(res));
    throw new Error(`Failed to fetch batches: ${res.status}`);
  }
  const data = await res.json();
  const items = data?.items ?? [];
  console.debug("[Fetch] Batches count", items.length);
  return items;
}

export async function fetchProductBySku(sku: string): Promise<ProductListItem | null> {
  const base = getApiBaseUrl();
  const url = `${base}/api/products/sku/${encodeURIComponent(sku)}`;
  console.debug("[Fetch] Product by SKU", { url, sku });
  const res = await fetch(url, { headers: authHeaders(), cache: "no-store" });
  if (!res.ok) {
    console.warn("[Fetch] Product by SKU not found", sku, res.status);
    return null;
  }
  const data = await res.json();
  return data as ProductListItem;
}

function safeText(res: Response): Promise<string> {
  return res.text().catch(() => "<no-body>");
}
