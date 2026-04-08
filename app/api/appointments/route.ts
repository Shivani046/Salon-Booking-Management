import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: List appointments (by logged-in user or with filtering)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const custId = searchParams.get("custId"); // frontend sends custId

  const where: any = {};
  if (custId) {
    where.customerId = Number(custId); // Schema expects 'customerId'
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

// POST: Create a new appointment, with full validation and explicit errors
export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("POST /api/appointments - received body:", data);

    // Accept input from frontend: custId; backend needs customerId
    const {
      custId,
      serviceId,
      staffId,
      appDate,
      appTime,
      amount,
      status,
    } = data;

    // Validate all fields for presence & type
    if (!custId || typeof custId !== "number" || isNaN(Number(custId))) {
      return NextResponse.json({ error: "Missing or invalid custId" }, { status: 400 });
    }
    if (!serviceId || typeof serviceId !== "number" || isNaN(Number(serviceId))) {
      return NextResponse.json({ error: "Missing or invalid serviceId" }, { status: 400 });
    }
    if (!staffId || typeof staffId !== "number" || isNaN(Number(staffId))) {
      return NextResponse.json({ error: "Missing or invalid staffId" }, { status: 400 });
    }
    if (!appDate || typeof appDate !== "string") {
      return NextResponse.json({ error: "Missing or invalid appDate" }, { status: 400 });
    }
    if (!appTime || typeof appTime !== "string" || !/^\d{2}:\d{2}$/.test(appTime)) {
      return NextResponse.json({ error: "Missing or invalid appTime" }, { status: 400 });
    }
    if (typeof amount !== "number" || isNaN(amount)) {
      return NextResponse.json({ error: "Missing or invalid amount" }, { status: 400 });
    }
    if (!status || typeof status !== "string") {
      return NextResponse.json({ error: "Missing or invalid status" }, { status: 400 });
    }

    // Final field data
    const customerId = Number(custId);
    const dateObj = new Date(appDate);
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json({ error: "Invalid appDate format" }, { status: 400 });
    }

    // Foreign key checks: IDs must really exist!
    const [customer, service, staff] = await Promise.all([
      prisma.customer.findUnique({ where: { custId: customerId } }),
      prisma.service.findUnique({ where: { serviceId } }),
      prisma.staff.findUnique({ where: { staffId } }),
    ]);
    if (!customer) {
      console.error(`Customer not found for custId=${customerId}.`);
      return NextResponse.json({ error: "Customer not found" }, { status: 400 });
    }
    if (!service) {
      console.error(`Service not found for serviceId=${serviceId}.`);
      return NextResponse.json({ error: "Service not found" }, { status: 400 });
    }
    if (!staff) {
      console.error(`Staff not found for staffId=${staffId}.`);
      return NextResponse.json({ error: "Staff not found" }, { status: 400 });
    }

    // Create appointment using proper foreign key name
    const appointment = await prisma.appointment.create({
      data: {
        customerId, // corresponds to Appointment.customerId (FK)
        serviceId,
        staffId,
        appDate: dateObj,
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