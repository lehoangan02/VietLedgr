import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL!;

interface StoreResponse {
  store_id: string;
}

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ status: 403 });
  }

  const res = await fetch(`${FASTAPI_URL}/api/user/me/store`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ status: 404 });
  }

  const data = (await res.json()) as StoreResponse;

  return NextResponse.json({ status: 200, store_id: data.store_id });
}