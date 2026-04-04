import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ==== GET STAFF LIST ====
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = (searchParams.get("q") ?? "").trim();
  const serviceId = searchParams.get("serviceId");
  const withServices = searchParams.get("withServices") === "true";

  let where: any = {};
  if (q) {
    where.name = { contains: q, mode: "insensitive" };
  }
  if (serviceId) {
    where.services = {
      some: { serviceId: Number(serviceId) },
    };
  }

  const staff = await prisma.staff.findMany({
    where: Object.keys(where).length ? where : undefined,
    orderBy: { staffId: "desc" },
    take: 50,
    select: {
      staffId: true,
      name: true,
      ...(withServices
        ? {
            services: {
              select: {
                serviceId: true,
                service: { select: { type: true } },
              },
            },
          }
        : {}),
    },
  });

  // Flatten join table if withServices=true
  const processed =
    withServices && staff.length
      ? staff.map((s) => ({
          ...s,
          services: s.services.map(
            (ss: any) => ({
              serviceId: ss.serviceId,
              type: ss.service.type,
            }),
          ),
        }))
      : staff;

  return NextResponse.json(processed);
}

// ==== CREATE STAFF ====
export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });
    const staff = await prisma.staff.create({ data: { name } });
    return NextResponse.json(staff, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Error creating staff" }, { status: 500 });
  }
}

// ==== UPDATE STAFF ====
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const staffId = Number(searchParams.get("id"));
    const { name } = await req.json();
    if (!staffId || !name)
      return NextResponse.json({ error: "Missing staffId or name" }, { status: 400 });

    const staff = await prisma.staff.update({
      where: { staffId },
      data: { name },
    });
    return NextResponse.json(staff);
  } catch (e) {
    return NextResponse.json({ error: "Error updating staff" }, { status: 500 });
  }
}

// ==== DELETE STAFF ====
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const staffId = Number(searchParams.get("id"));
    if (!staffId)
      return NextResponse.json({ error: "Missing staffId" }, { status: 400 });

    await prisma.staff.delete({ where: { staffId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Error deleting staff" }, { status: 500 });
  }
}