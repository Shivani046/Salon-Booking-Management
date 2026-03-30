import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET staff by serviceId
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceId = searchParams.get("serviceId");

    if (!serviceId) {
      return NextResponse.json([], { status: 400 });
    }

    const staff = await prisma.staff.findMany({
      where: {
        StaffServices: {
          some: { serviceId: Number(serviceId) },
        },
      },
      select: {
        staffId: true,
        name: true,
      },
    });

    return NextResponse.json(staff);
  } catch (err) {
    console.error("GET STAFF ERROR:", err);
    return NextResponse.json([], { status: 500 });
  }
}
