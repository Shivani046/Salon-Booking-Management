import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const serviceId = searchParams.get("serviceId");

  // Build filter
  let where: any = {};

  if (q) {
    where.name = { contains: q, mode: "insensitive" };
  }
  // If serviceId is present, filter by services.staffService
  if (serviceId) {
    where.services = {
      some: { serviceId: Number(serviceId) },
    };
  }

  const staff = await prisma.staff.findMany({
    where: Object.keys(where).length ? where : undefined,
    orderBy: { staffId: "desc" },
    take: 50,
    select: {
      staffId: true,
      name: true,
    },
  });

  return NextResponse.json(staff);
}


