import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch all payment/bill records for a specific user (Billing History)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const custId = searchParams.get("custId");

    const where: any = {};
    if (custId && !isNaN(Number(custId))) {
      where.customerId = Number(custId);
    }

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { id: "desc" },
      take: 50,
      select: {
        id: true,
        appointment: {
          select: {
            service: { select: { type: true } },
            appDate: true,
          }
        },
        method: true,
        amount: true,
      }
    });

    // DATE FORMATTING: safe, no 'slice', works for string and Date types.
    const formatted = payments.map((p: any) => {
      let appDateString = "";
      const rawAppDate = p.appointment?.appDate;
      if (rawAppDate) {
        const d = new Date(rawAppDate);
        if (!isNaN(d.getTime())) {
          appDateString = d.toISOString().split("T")[0]; // "2024-05-02"
        }
      }
      return {
        id: `INV-${String(p.id).padStart(4, "0")}`,
        service: p.appointment?.service?.type ?? "(no service)",
        date: appDateString,
        method: p.method,
        amount: `${p.amount}/-`,
        status: "Paid",
      };
    });

    return NextResponse.json(formatted);
  } catch (e: any) {
    console.error("PAYMENT GET error:", e);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}

// POST: Log a payment/bill for an appointment
export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Validate required fields
    if (!data.appointmentId || !data.customerId || !data.amount || !data.method) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const payment = await prisma.payment.create({
      data: {
        appointmentId: Number(data.appointmentId),
        customerId: Number(data.customerId),
        amount: Number(data.amount),
        method: data.method,
      }
    });

    return NextResponse.json({ success: true, payment });

  } catch (e: any) {
    console.error("PAYMENT POST error:", e);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}