import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function amountToNumber(amount: string | null) {
  if (!amount) return 0;
  // converts "1300/-" or "₹1300" to 1300
  const n = Number(String(amount).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export async function GET() {
  try {
    const today = new Date();

    const appointments = await prisma.appointment.findMany({
      where: { status: { not: "cancelled" } },
      select: { appDate: true, amount: true, status: true },
    });

    const todays = appointments.filter((a) => isSameDay(new Date(a.appDate), today));
    const todaysAppointments = todays.length;

    const todaysRevenue = todays.reduce((sum, a) => sum + amountToNumber(a.amount), 0);

    const activeStaff = await prisma.staff.count();

    return NextResponse.json({ todaysAppointments, todaysRevenue, activeStaff });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to compute stats" }, { status: 500 });
  }
}