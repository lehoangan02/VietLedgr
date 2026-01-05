import { fastapi } from "@/lib/server/fastapi";
import { NextResponse } from "next/server";

export async function GET() {
  const { res, body } = await fastapi("api/batches/", {
    method: "GET",
  });

  return NextResponse.json(body ?? { detail: "Failed to fetch batches" }, {
    status: res.status,
  });
}
