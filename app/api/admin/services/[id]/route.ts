import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/* ✅ UPDATE SERVICE */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const updated = await prisma.service.update({
      where: { serviceId: Number(params.id) },
      data: {
        type: body.type,
        category: body.category,
        price: Number(body.price),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("UPDATE SERVICE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}

/* ✅ DELETE SERVICE */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.service.delete({
      where: { serviceId: Number(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE SERVICE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}