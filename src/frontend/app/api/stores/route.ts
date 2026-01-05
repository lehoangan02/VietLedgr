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
