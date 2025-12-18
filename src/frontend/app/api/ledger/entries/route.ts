import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';


const FASTAPI_URL = process.env.FASTAPI_URL!;

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { detail: "Not authenticated" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);

  const res = await fetch(
    `${FASTAPI_URL}/api/ledger/entries?${searchParams.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  );

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json(
      { detail: data?.detail ?? "Failed to fetch ledger entries" },
      { status: res.status },
    );
  }
  return NextResponse.json(data, { status: 200 });
}