import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { appDate: "desc" },
      include: {
        customer: true, // only relation you have
      },
    });

    return NextResponse.json(appointments);
  } catch (err) {
    console.error(err);
    return NextResponse.json([], { status: 500 });
  }
}