import { cookies } from "next/headers";

const FASTAPI_URL = process.env.FASTAPI_URL;
if (!FASTAPI_URL) throw new Error("Missing FASTAPI_URL env var!");

type ProxyInit = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

export async function fastapi(path: string, init: ProxyInit = {}) {
  const url = `${FASTAPI_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text();

  return { res, body };
}
