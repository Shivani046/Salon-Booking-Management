import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: List appointments (supports customer filtering and optional query search)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const custId = searchParams.get("custId"); // frontend sends custId

  const where: any = {};
  if (custId) {
    where.customerId = Number(custId); // Prisma expects customerId
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

// POST: Create a new appointment
export async function POST(req: Request) {
  try {
    const data = await req.json();

    // frontend sends custId, DB expects customerId!
    const {
      custId,
      serviceId,
      staffId,
      appDate,
      appTime,
      amount,
      status,
    } = data;

    // Validate required fields
    if (
      !custId ||
      !serviceId ||
      !staffId ||
      !appDate ||
      !appTime ||
      typeof amount !== "number" ||
      !status
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate date
    const dateObj = new Date(appDate);
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json({ error: "Invalid appDate" }, { status: 400 });
    }

    // Validate foreign keys exist
    const [customer, service, staff] = await Promise.all([
      prisma.customer.findUnique({ where: { custId: Number(custId) } }),
      prisma.service.findUnique({ where: { serviceId } }),
      prisma.staff.findUnique({ where: { staffId } }),
    ]);
    if (!customer) return NextResponse.json({ error: "Invalid custId" }, { status: 400 });
    if (!service)  return NextResponse.json({ error: "Invalid serviceId" }, { status: 400 });
    if (!staff)    return NextResponse.json({ error: "Invalid staffId" }, { status: 400 });

    // Create appointment (DB field is customerId)
    const appointment = await prisma.appointment.create({
      data: {
        customerId: Number(custId), // Correct DB field!
        serviceId,
        staffId,
        appDate: dateObj,
        appTime,
        amount,
        status,
      },
    });

    return NextResponse.json({ success: true, appointment }, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}