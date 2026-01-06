import { NextResponse } from "next/server";
import { fastapi } from "@/lib/server/fastapi";

export async function GET() {
  const { res, body } = await fastapi("/api/warehouses/", { method: "GET" });

  return NextResponse.json(body ?? { detail: "Failed to fetch warehouses" }, {
    status: res.status,
  });
}
