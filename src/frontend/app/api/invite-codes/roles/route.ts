import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL!;

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json(
      { detail: "Not authenticated" },
      { status: 401 },
    );
  }

  const res = await fetch(`${FASTAPI_URL}/api/invite-codes/roles`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => null as unknown);

  if (!res.ok) {
    return NextResponse.json(
      { detail: (data as { detail?: string } | null)?.detail ?? "Failed to fetch invite roles" },
      { status: res.status },
    );
  }

  return NextResponse.json(data, { status: 200 });
}
