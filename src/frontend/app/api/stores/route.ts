// Note: This file only handles /api/stores (list, create). To support update (PUT) and delete (DELETE),
// you need a separate file: /api/stores/[id]/route.ts for RESTful resource routes in Next.js App Router.
import { fastapi } from "@/lib/server/fastapi";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mine = searchParams.get("mine") ?? "false";

  const { res, body } = await fastapi(
    `api/stores?mines=${encodeURIComponent(mine)}`,
    {
      method: "GET",
    },
  );

  return NextResponse.json(body ?? { detail: "Failed to fetch stores" }, {
    status: res.status,
  });
}


export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { res, body } = await fastapi(
      "api/stores",
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      },
    );
    return NextResponse.json(body ?? { detail: "Failed to create store" }, {
      status: res.status,
    });
  } catch (err) {
    return NextResponse.json({ detail: "Invalid request body" }, { status: 400 });
  }
}
