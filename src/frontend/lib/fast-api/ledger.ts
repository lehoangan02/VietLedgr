interface LedgerEntry {
   entry_id: string;
   account_type: string;
   description: string;
   debit_amount: string | number;
   credit_amount: string | number;
   entry_date: string;
}

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