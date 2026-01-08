import { NextResponse, NextRequest } from "next/server";
import { fastapi } from "@/lib/server/fastapi";

export async function GET() {
  const { res, body } = await fastapi("/api/warehouses/", { method: "GET" });

  return NextResponse.json(body ?? { detail: "Failed to fetch warehouses" }, {
    status: res.status,
  });
}


export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { res, body } = await fastapi(
      "api/warehouses",
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      },
    );
    return NextResponse.json(body ?? { detail: "Failed to create warehouse" }, {
      status: res.status,
    });
  } catch (err) {
    return NextResponse.json({ detail: "Invalid request body" }, { status: 400 });
  }
}
