import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  // Build dynamic where clause in a type-safe/lint-friendly way
  const where = q
    ? {
        OR: [
          { service: { type: { contains: q, mode: "insensitive" } } },
          { staff: { name: { contains: q, mode: "insensitive" } } },
          { status: { contains: q, mode: "insensitive" } },
        ],
      }
    : undefined;

  const appointments = await prisma.appointment.findMany({
    where, // direct pass of where object (or undefined)
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