import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL!;

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const res = await fetch(
    `${FASTAPI_URL}/api/invite-codes?${searchParams.toString()}`,
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
      {
        detail:
          (data as { detail?: string } | null)?.detail ??
          "Failed to fetch invite codes",
      },
      { status: res.status },
    );
  }

  return NextResponse.json(data, { status: 200 });
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null as unknown);

  const role_id = (body as { role_id?: string })?.role_id;
  const to_email = (body as { to_email?: string })?.to_email;
  const res = await fetch(`${FASTAPI_URL}/api/invite-codes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role_id, to_email }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json(
      {
        detail:
          (data as { detail?: string } | null)?.detail ??
          "Failed to create invite code",
      },
      { status: res.status },
    );
  }

  return NextResponse.json(data, { status: 200 });
}
