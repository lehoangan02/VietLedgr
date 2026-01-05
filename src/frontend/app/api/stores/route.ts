import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  try {
    const res = await fetch(`${FASTAPI_URL}/api/stores?mine=false`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json({ detail: data?.detail || "Failed to fetch stores" }, { status: res.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ detail: "Internal Server Error" }, { status: 500 });
  }
}
