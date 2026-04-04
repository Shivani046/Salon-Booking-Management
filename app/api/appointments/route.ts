import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const custId = searchParams.get("custId");

  const where: any = {};
  if (custId) {
    where.customerId = Number(custId);
  }
  if (q) {
    where.OR = [
      { service: { is: { type: { contains: q, mode: "insensitive" as const } } } },
      { staff: { is: { name: { contains: q, mode: "insensitive" as const } } } },
      { status: { contains: q, mode: "insensitive" as const } },
    ];
  }

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: { appId: "desc" },
    take: 50,
    select: {
      appId: true,
      customerId: true,
      service: {
        select: {
          serviceId: true,
          type: true,
          category: true,
          price: true,
        },
      },
      staff: {
        select: {
          staffId: true,
          name: true,
        },
      },
      appDate: true,
      appTime: true,
      status: true,
      amount: true,
    },
  });

  return NextResponse.json(appointments);
}