export function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_FASTAPI_URL || process.env.FASTAPI_URL;
  if (!base) {
    console.warn("[API] Base URL missing. Set NEXT_PUBLIC_FASTAPI_URL.");
    return "http://127.0.0.1:8000";
  }
  return base;
}

export function getAccessTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )access_token=([^;]+)/);
  const token = match ? decodeURIComponent(match[1]) : null;
  if (!token) {
    console.debug("[Auth] No access_token cookie found");
  }
  return token;
}

export function authHeaders(): HeadersInit {
  const token = getAccessTokenFromCookie();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}
