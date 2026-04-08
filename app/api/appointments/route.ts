import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch appointments (optionally filtered by logged-in user)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const custId = searchParams.get("custId");

  const where: any = {};
  if (custId && !isNaN(Number(custId))) {
    where.customerId = Number(custId);
  }
  if (q) {
    where.OR = [
      { service: { is: { type: { contains: q, mode: "insensitive" as const }}}},
      { staff: { is: { name: { contains: q, mode: "insensitive" as const }}}},
      { status: { contains: q, mode: "insensitive" as const }},
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
        }
      },
      staff: {
        select: {
          staffId: true,
          name: true,
        }
      },
      appDate: true,
      appTime: true,
      status: true,
      amount: true,
    }
  });

  return NextResponse.json(appointments);
}

// POST: Create a new appointment with strict validation, clear responses & full logging
export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("POST /api/appointments body:", data);

    // --- Force number for customerId from custId ---
    const custIdRaw = data.custId ?? "";
    const customerId = custIdRaw !== "" && custIdRaw !== null && !isNaN(Number(custIdRaw)) ? Number(custIdRaw) : NaN;
    const serviceId = Number(data.serviceId);
    const staffId = Number(data.staffId);
    const appDate = String(data.appDate);
    const appTime = String(data.appTime);
    const amount = Number(data.amount);
    const status = String(data.status);

    // Log coerced values for troubleshooting
    console.log("Coerced values:", { customerId, serviceId, staffId, appDate, appTime, amount, status });

    // Validation with explicit errors
    if (!customerId || isNaN(customerId)) return err("Missing or invalid customerId (custId).");
    if (!serviceId || isNaN(serviceId)) return err("Missing or invalid serviceId.");
    if (!staffId || isNaN(staffId)) return err("Missing or invalid staffId.");
    if (!appDate || isNaN(new Date(appDate).getTime())) return err("Missing or invalid appDate.");
    if (!appTime || !/^\d{2}:\d{2}$/.test(appTime)) return err("Missing or invalid appTime (required: HH:MM).");
    if (isNaN(amount)) return err("Missing or invalid amount.");
    if (!status || typeof status !== "string") return err("Missing or invalid status.");

    // Lookup all the relevant foreign keys in one trip
    const [customer, service, staff] = await Promise.all([
      prisma.customer.findUnique({ where: { custId: customerId } }),
      prisma.service.findUnique({ where: { serviceId } }),
      prisma.staff.findUnique({ where: { staffId } }),
    ]);

    if (!customer) return err(`No customer found with custId=${customerId}.`);
    if (!service)  return err(`No service found with serviceId=${serviceId}.`);
    if (!staff)    return err(`No staff found with staffId=${staffId}.`);

    // Create the appointment!
    const appointment = await prisma.appointment.create({
      data: {
        customerId,
        serviceId,
        staffId,
        appDate: new Date(appDate),
        appTime,
        amount,
        status,
      }
    });

    console.log("Appointment successfully created:", appointment);

    return NextResponse.json({ success: true, appointment }, { status: 201 });

    // Helper: error response with logging
    function err(message: string) {
      console.error("[APPT CREATE ERROR]", message);
      return NextResponse.json({ error: message }, { status: 400 });
    }

  } catch (e: any) {
    console.error("API SERVER ERROR:", e);
    return NextResponse.json(
      { error: e?.message || "Unknown server error" },
      { status: 500 }
    );
  }
}