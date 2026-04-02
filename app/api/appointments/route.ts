import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  const appointments = await prisma.appointment.findMany({
    where: q
      ? {
          OR: [
            { service: { contains: q, mode: "insensitive" } },
            { staff: { contains: q, mode: "insensitive" } },
            { status: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { appId: "desc" },   // ✅ use appId now
    take: 50,
    select: {
      appId: true,        // ✅ primary key
      customerId: true,   // ✅ mapped to custId in schema
      service: true,
      staff: true,
      appDate: true,
      appTime: true,
      status: true,
      amount: true,
    },
  });

  const result = appointments.map(a => ({
    appId: a.appId,
    customerId: a.customerId,
    service: a.service,
    staff: a.staff,
    appDate: a.appDate,
    appTime: a.appTime,
    status: a.status,
    amount: a.amount,
  }));

  return NextResponse.json(result);
}



