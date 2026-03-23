import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const staff = await prisma.staff.findMany({
    orderBy: { name: "asc" },
    include: {
      services: { select: { serviceId: true, type: true, category: true } },
    },
  });

  return NextResponse.json(staff);
}