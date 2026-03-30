import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all appointments
export async function GET() {
  try {
    const appointments = await prisma.appointments.findMany({
      orderBy: { appDate: "desc" },
      select: {
        appId: true,
        custId: true,
        service: true,
        staff: true,
        appDate: true,
        appTime: true,
        status: true,
        amount: true,
      },
    });

    return NextResponse.json(appointments);
  } catch (err) {
    console.error("GET APPOINTMENTS ERROR:", err);
    return NextResponse.json([], { status: 500 });
  }
}

