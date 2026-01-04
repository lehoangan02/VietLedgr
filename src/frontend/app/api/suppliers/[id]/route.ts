import { NextResponse, NextRequest } from "next/server";
const FASTAPI_URL = process.env.FASTAPI_URL;
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const payload = await req.json();
  const { id } = await ctx.params;

  const res = await fetch(`${FASTAPI_URL}/api/suppliers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const res = await fetch(`${FASTAPI_URL}/api/suppliers/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  const body = await res.text();

  return new NextResponse(
    body || JSON.stringify({ detail: "deleted successfully" }),
    {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    },
  );
}
