import { getApiBaseUrl, authHeaders } from "./common";

// ============================================================================
// TYPES
// ============================================================================

export type CheckoutItem = {
  batch_id: string;
  quantity: number;
  price_at_sale: string; // decimal string
};

export interface TransactionItem {
  item_id: string;
  batch_id: string;
  quantity: number;
  price_at_sale: number;
  cost_at_sale?: number;
  created_at?: string;
  product_name?: string;
  batch_number?: string;
  tax?: number;
  discount?: number;
}

export interface Transaction {
  transaction_id: string;
  store_id: string;
  user_id: string;
  device_id?: string | null;
  total_amount: number;
  total_tax?: number;
  created_at: string;
  items: TransactionItem[];
}

export interface TransactionListResponse {
  items: Transaction[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface TransactionSummary {
  total_transactions: number;
  total_amount: number;
  total_tax: number;
  total_items: number;
  average_transaction: number;
  date_range_start: string;
  date_range_end: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Create a new transaction (checkout)
 */
export async function postTransaction(store_id: string, items: CheckoutItem[], device_id?: string) {
  const base = getApiBaseUrl();
  const url = `${base}/api/transactions/`;
  const body = JSON.stringify({ store_id, device_id, items });
  console.debug("[Checkout] POST /transactions", { url, body });
  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body,
  });
  const text = await res.text().catch(() => "");
  if (!res.ok) {
    console.error("[Checkout] Failed", res.status, text);
    throw new Error(`Checkout failed: ${res.status}`);
  }
  console.debug("[Checkout] Success", text);
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Fetch paginated list of transactions for a store
 */
export async function fetchTransactions(
  store_id: string,
  page: number = 1,
  page_size: number = 50
): Promise<TransactionListResponse> {
  const params = new URLSearchParams({
    store_id,
    page: page.toString(),
    page_size: page_size.toString(),
  });

  const res = await fetch(`/api/transactions?${params}`, {
    method: "GET",
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("AUTH_REQUIRED");
    }
    const detail = data?.detail || `Failed to fetch transactions: ${res.status}`;
    throw new Error(detail);
  }

  return data as TransactionListResponse;
}

/**
 * Fetch transaction summary/report for a store within a date range.
 * Returns default zero values if the API call fails (non-auth errors).
 */
export async function fetchTransactionSummary(
  store_id: string,
  start_date: string,
  end_date: string
): Promise<TransactionSummary> {
  const params = new URLSearchParams({
    store_id,
    start_date,
    end_date,
  });

  try {
    const res = await fetch(`/api/transactions/summary/report?${params}`, {
      method: "GET",
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("AUTH_REQUIRED");
      }
      const detail = data?.detail || `Failed to fetch summary: ${res.status}`;
      throw new Error(detail);
    }

    return data as TransactionSummary;
  } catch (err: any) {
    // Re-throw auth errors
    if (err.message === "AUTH_REQUIRED") {
      throw err;
    }
    // Log and return default for other errors
    console.error("[fetchTransactionSummary] Error:", err.message);
    throw err;
  }
}
