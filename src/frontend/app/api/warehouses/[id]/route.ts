import { fastapi } from "@/lib/server/fastapi";
import { NextRequest, NextResponse } from "next/server";


export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
   const { id } = await context.params;
   try {
      const data = await request.json();
      const { res, body } = await fastapi(
         `api/warehouses/${id}`,
         {
            method: "PUT",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
         },
      );
      return NextResponse.json(body ?? { detail: "Failed to update warehouse" }, {
         status: res.status,
      });
   } catch (err) {
      return NextResponse.json({ detail: "Invalid request body" }, { status: 400 });
   }
}


export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
   const { id } = await context.params;
   const { res, body } = await fastapi(
      `api/warehouses/${id}`,
      {
         method: "DELETE",
      },
   );
   return NextResponse.json(body ?? { detail: "Failed to delete warehouse" }, {
      status: res.status,
   });
}
