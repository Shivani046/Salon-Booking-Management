import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/* ✅ UPDATE STAFF */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name } = await req.json();

    const updated = await prisma.staff.update({
      where: { staffId: Number(params.id) },
      data: { name },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("UPDATE STAFF ERROR:", err);
    return NextResponse.json(
      { error: "Failed to update staff" },
      { status: 500 }
    );
  }
}

/* ✅ DELETE STAFF */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.staff.delete({
      where: { staffId: Number(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE STAFF ERROR:", err);
    return NextResponse.json(
      { error: "Failed to delete staff" },
      { status: 500 }
    );
  }
}