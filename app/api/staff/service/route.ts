import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Assign a service to a staff member
export async function POST(req: Request) {
  try {
    const { staffId, serviceId } = await req.json();
    if (!staffId || !serviceId) return NextResponse.json({ error: "Missing staffId or serviceId" }, { status: 400 });

    await prisma.staffService.create({
      data: {
        staffId: Number(staffId),
        serviceId: Number(serviceId),
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Error assigning service" }, { status: 500 });
  }
}

// Remove an assigned service from a staff member
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const staffId = Number(searchParams.get("staffId"));
  const serviceId = Number(searchParams.get("serviceId"));

  if (!staffId || !serviceId) return NextResponse.json({ error: "Missing staffId or serviceId" }, { status: 400 });

  await prisma.staffService.delete({
    where: {
      staffId_serviceId: {
        staffId,
        serviceId,
      },
    },
  });

  return NextResponse.json({ success: true });
}