import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // <-- Make sure this import is correct for your project

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  // The only change: no `is:` in the filter!
  const appointments = await prisma.appointment.findMany({
    where: q
      ? {
          OR: [
            { service: { type: { contains: q, mode: "insensitive" } } },
            { staff: { name: { contains: q, mode: "insensitive" } } },
            { status: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
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