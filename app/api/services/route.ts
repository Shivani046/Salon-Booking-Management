import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all appointments
export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { appDate: "desc" },
      include: {
        customer: true,
      },
    });

    return NextResponse.json(appointments);
  } catch (err) {
    console.error("GET APPOINTMENTS ERROR:", err);
    return NextResponse.json([], { status: 500 });
  }
}