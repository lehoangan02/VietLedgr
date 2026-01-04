import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const skip = url.searchParams.get("skip") ?? "0";
  const limit = url.searchParams.get("limit") ?? "100";

  try {
    const res = await fetch(
      `${FASTAPI_URL}/api/suppliers?skip=${encodeURIComponent(skip)}&limit=${encodeURIComponent(limit)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );
    if (!res.ok) {
      return NextResponse.json({ status: 400 });
    }
    const body = await res.text();

    return new NextResponse(body, {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log(error);
  }
}

export async function POST(req: NextRequest) {
  const payload = await req.json();

  const res = await fetch(`${FASTAPI_URL}/api/suppliers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
