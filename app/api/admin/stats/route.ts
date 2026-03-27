import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { isSameDay } from "date-fns";

// Define a type for appointments
type Appointment = {
  appDate: Date;
  amount: number | null;
};


export async function GET(): Promise<NextResponse> {
  try {
    const appointments: Appointment[] = await prisma.appointment.findMany({
      orderBy: { appDate: "desc" },
      select: { appDate: true, amount: true },
    });

    const today = new Date();

    const todays = appointments.filter((a: Appointment) =>
      isSameDay(new Date(a.appDate), today)
    );
    const todaysAppointments = todays.length;

    const todaysRevenue = todays.reduce(
      (sum: number, a: Appointment) => sum + amountToNumber(a.amount),
      0
    );

    return NextResponse.json({ todaysAppointments, todaysRevenue });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

function amountToNumber(amount: number | null): number {
  return amount ?? 0;
}

