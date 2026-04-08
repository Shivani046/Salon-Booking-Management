import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch appointments (optionally filtered by logged-in user)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const custId = searchParams.get("custId"); // frontend sends custId

  const where: any = {};
  if (custId) {
    where.customerId = Number(custId); // In DB/model it's customerId!
  }
  if (q) {
    where.OR = [
      { service: { is: { type: { contains: q, mode: "insensitive" as const } } } },
      { staff: { is: { name: { contains: q, mode: "insensitive" as const } } } },
      { status: { contains: q, mode: "insensitive" as const } },
    ];
  }

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: { appId: "desc" },
    take: 50,
    select: {
      appId: true,
      customerId: true,
      service: {
        select: {
          serviceId: true,
          type: true,
          category: true,
          price: true,
        },
      },
      staff: {
        select: {
          staffId: true,
          name: true,
        },
      },
      appDate: true,
      appTime: true,
      status: true,
      amount: true,
    },
  });

  return NextResponse.json(appointments);
}

// POST: Create a new appointment with full coercion & error reporting
export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("POST Body:", data);

    // Coerce values to correct types
    const customerId = Number(data.custId);
    const serviceId = Number(data.serviceId);
    const staffId = Number(data.staffId);
    const appDate = String(data.appDate);
    const appTime = String(data.appTime);
    const amount = Number(data.amount);
    const status = String(data.status);

    console.log("Coerced values:", { customerId, serviceId, staffId, appDate, appTime, amount, status });

    // Detailed validation
    if (!customerId || isNaN(customerId)) {
      return NextResponse.json({ error: "Missing or invalid custId/customerId" }, { status: 400 });
    }
    if (!serviceId || isNaN(serviceId)) {
      return NextResponse.json({ error: "Missing or invalid serviceId" }, { status: 400 });
    }
    if (!staffId || isNaN(staffId)) {
      return NextResponse.json({ error: "Missing or invalid staffId" }, { status: 400 });
    }
    if (!appDate || isNaN(new Date(appDate).getTime())) {
      return NextResponse.json({ error: "Missing or invalid appDate" }, { status: 400 });
    }
    if (!appTime || !/^\d{2}:\d{2}$/.test(appTime)) {
      return NextResponse.json({ error: "Missing or invalid appTime (must be hh:mm)" }, { status: 400 });
    }
    if (isNaN(amount)) {
      return NextResponse.json({ error: "Missing or invalid amount" }, { status: 400 });
    }
    if (!status || typeof status !== "string") {
      return NextResponse.json({ error: "Missing or invalid status" }, { status: 400 });
    }

    // Foreign key existence checks
    const [customer, service, staff] = await Promise.all([
      prisma.customer.findUnique({ where: { custId: customerId } }),
      prisma.service.findUnique({ where: { serviceId } }),
      prisma.staff.findUnique({ where: { staffId } }),
    ]);
    if (!customer) return NextResponse.json({ error: `No customer found with custId=${customerId}` }, { status: 400 });
    if (!service) return NextResponse.json({ error: `No service found with serviceId=${serviceId}` }, { status: 400 });
    if (!staff) return NextResponse.json({ error: `No staff found with staffId=${staffId}` }, { status: 400 });

    // All valid - create appointment
    const appointment = await prisma.appointment.create({
      data: {
        customerId, // DB expects customerId, not custId!
        serviceId,
        staffId,
        appDate: new Date(appDate),
        appTime,
        amount,
        status,
      },
    });

    console.log("Appointment created:", appointment);

    return NextResponse.json({ success: true, appointment }, { status: 201 });
  } catch (e: any) {
    console.error("Unexpected server error:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}