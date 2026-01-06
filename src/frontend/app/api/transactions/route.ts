import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL;
if (!FASTAPI_URL) throw new Error("Missing FASTAPI_URL env var!");

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  if (!accessToken)
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });

  const { searchParams } = new URL(request.url);

  const res = await fetch(
    `${FASTAPI_URL}/api/transactions?${searchParams.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  const text = await res.text();
  const data = (() => {
    try {
      return JSON.parse(text);
    } catch {
      return { detail: text };
    }
  })();

  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  if (!accessToken)
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });

  const body = await request.text();

  const res = await fetch(`${FASTAPI_URL}/api/transactions/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body,
    cache: "no-store",
  });

  const text = await res.text();
  const data = (() => {
    try {
      return JSON.parse(text);
    } catch {
      return { detail: text };
    }
  })();

  return NextResponse.json(data, { status: res.status });
}
