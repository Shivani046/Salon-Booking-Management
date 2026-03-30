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
    // Fetch raw appointments (amount may come back as string)
    const rawAppointments = await prisma.appointments.findMany({
      orderBy: { appDate: "desc" },
      select: { appDate: true, amount: true },
    });

    // Normalize amount into numbers
    const appointments: Appointment[] = rawAppointments.map(a => ({
      appDate: a.appDate,
      amount: a.amount ? Number(a.amount) : null,
    }));

    const today = new Date();

    // Filter today's appointments
    const todays = appointments.filter(a =>
      isSameDay(new Date(a.appDate), today)
    );
    const todaysAppointments = todays.length;

    // Calculate today's revenue
    const todaysRevenue = todays.reduce(
      (sum, a) => sum + (a.amount ?? 0),
      0
    );

    // Format revenue as currency (Indian Rupees here)
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

