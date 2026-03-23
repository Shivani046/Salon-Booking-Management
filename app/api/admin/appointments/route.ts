import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const appointments = await prisma.appointment.findMany({
    orderBy: [{ appDate: "desc" }, { appTime: "asc" }],
    include: { customer: { select: { custId: true, name: true, phoneNo: true } } },
  });

  return NextResponse.json(appointments);
}

export async function POST(req: Request) {
  const body = await req.json();

  const created = await prisma.appointment.create({
    data: {
      custId: Number(body.custId),
      service: String(body.service),
      staff: body.staff ? String(body.staff) : null,
      appDate: new Date(String(body.appDate)), // expects YYYY-MM-DD
      appTime: String(body.appTime),
      amount: body.amount ? String(body.amount) : null,
      status: String(body.status ?? "scheduled"),
    },
    include: { customer: { select: { custId: true, name: true, phoneNo: true } } },
  });

  return NextResponse.json(created, { status: 201 });
}