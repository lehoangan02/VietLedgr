import { fastapi } from "@/lib/server/fastapi";
import { NextResponse } from "next/server";

export async function GET() {
  const { res, body } = await fastapi("/api/products/", {
    method: "GET",
  });
  return NextResponse.json(body ?? { detail: "Failed to fetch products" }, {
    status: res.status,
  });
}
