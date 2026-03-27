import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { appId: string } }
): Promise<NextResponse> {
  const id = Number(params.appId);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid appId" }, { status: 400 });
  }

  const body = await req.json();

  const data: any = {};
  if (body?.service != null) data.service = String(body.service).trim();
  if (body?.staff !== undefined) data.staff = body.staff ? String(body.staff).trim() : null;
  if (body?.appDate != null) data.appDate = new Date(String(body.appDate));
  if (body?.appTime != null) data.appTime = String(body.appTime).trim();
  if (body?.amount !== undefined) data.amount = body.amount ? String(body.amount).trim() : null;
  if (body?.status != null) data.status = String(body.status).trim();

  try {
    const updated = await prisma.appointment.update({
      where: { appId: id },
      data,
      include: { customer: { select: { custId: true, name: true, phoneNo: true } } },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { appId: string } }
): Promise<NextResponse> {
  const id = Number(params.appId);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid appId" }, { status: 400 });
  }

  try {
    await prisma.appointment.delete({ where: { appId: id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete appointment" }, { status: 500 });
  }
}

