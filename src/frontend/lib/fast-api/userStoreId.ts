export async function getStoreCurrentUser(): Promise<string | null> {
  const res = await fetch("/api/user/me/store", { method: "GET" });
  const data = (await res.json()) as { status: number; store_id?: string };

  if (data.status !== 200 || !data.store_id) return null;

  return data.store_id;
}