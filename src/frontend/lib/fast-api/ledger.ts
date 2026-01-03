// ============================================================================
// TYPES
// ============================================================================

export interface LedgerEntry {
  entry_id: string;
  store_id: string;
  account_type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  transaction_id: string | null;
  expense_id: string | null;
  entry_date: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
  created_at: string;
}

export interface LedgerEntryListResponse {
  items: LedgerEntry[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Fetch paginated ledger entries for a store
 */
export async function fetchLedgerEntries(
  store_id: string,
  page: number = 1,
  page_size: number = 50,
  start_date?: string,
  end_date?: string
): Promise<LedgerEntryListResponse> {
  const params = new URLSearchParams({
    store_id,
    page: page.toString(),
    page_size: page_size.toString(),
  });

  if (start_date) params.append("start_date", start_date);
  if (end_date) params.append("end_date", end_date);

  const res = await fetch(`/api/ledger/entries?${params}`, {
    method: "GET",
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("AUTH_REQUIRED");
    }
    if (res.status === 403) {
      throw new Error("Permission Denied: User not linked to Store");
    }
    const detail = data?.detail || `Failed to fetch ledger entries: ${res.status}`;
    throw new Error(detail);
  }

  // Handle both array and paginated response formats
  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      page: 1,
      page_size: data.length,
      total_pages: 1,
    };
  }

  return data as LedgerEntryListResponse;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use fetchLedgerEntries instead
 */
export async function getLedgerEntries(params: string): Promise<LedgerEntry[] | null> {
  const ledgerRes = await fetch(`/api/ledger/entries?${params}`, {
    method: "GET",
    cache: "no-store",
  });

  const data = await ledgerRes.json().catch(() => null as unknown);

  if (!ledgerRes.ok) {
    if (ledgerRes.status === 403) {
      throw new Error("Permission Denied: User not linked to Store");
    }
    const detail = (data as { detail?: string } | null)?.detail;
    throw new Error(detail || "Failed to fetch ledger");
  }

  const items = (data as { items?: LedgerEntry[] } | null)?.items;
  return items ?? [];
}