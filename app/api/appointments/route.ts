import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all appointments
export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { appDate: "desc" },
      take: 50,
      select: {
        id: true,           // ✅ use id, not appId
        customerId: true,   // ✅ use customerId, not custId
        service: true,
        staff: true,
        appDate: true,
        appTime: true,
        status: true,
        amount: true,
      },
    });

    // Alias fields for frontend
    const result = appointments.map(a => ({
      appId: a.id,
      custId: a.customerId,
      service: a.service,
      staff: a.staff,
      appDate: a.appDate,
      appTime: a.appTime,
      status: a.status,
      amount: a.amount,
    }));

    return NextResponse.json(result);

  } catch (err) {
    console.error("GET APPOINTMENTS ERROR:", err);
    return NextResponse.json([], { status: 500 });
  }
}


