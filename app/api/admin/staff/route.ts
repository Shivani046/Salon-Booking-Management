import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      orderBy: { name: "asc" },
      include: {
        services: {
          select: {
            serviceId: true,
            type: true,
            category: true,
          },
        },
      },
    });

    return NextResponse.json(staff);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Failed to fetch staff" },
      { status: 500 }
    );
  }
}