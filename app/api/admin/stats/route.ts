import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { isSameDay } from "date-fns";

type Appointment = {
  appDate: Date;
  amount: number | null;
};

export async function GET() {
  try {
    const rawAppointments = await prisma.appointment.findMany({
      orderBy: { appDate: "desc" },
      select: { appDate: true, amount: true },
    });

    const appointments: Appointment[] = rawAppointments.map(a => ({
      appDate: a.appDate,
      amount: a.amount ? Number(a.amount) : null,
    }));

    const today = new Date();

    const todays = appointments.filter(a =>
      isSameDay(new Date(a.appDate), today)
    );
    const todaysAppointments = todays.length;

    const todaysRevenue = todays.reduce(
      (sum, a) => sum + (a.amount ?? 0),
      0
    );

    const formattedRevenue = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(todaysRevenue);

    return NextResponse.json({
      todaysAppointments,
      todaysRevenue: formattedRevenue,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}




