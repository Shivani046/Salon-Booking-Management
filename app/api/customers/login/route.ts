import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const emailId = String(body?.emailId ?? "").trim();
  const password = String(body?.password ?? "");

  if (!emailId || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({ where: { emailId } });
  if (!customer) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, customer.password);
  if (!ok) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  return NextResponse.json({
    custId: customer.custId,
    name: customer.name,
    phoneNo: customer.phoneNo,
    emailId: customer.emailId,
  });
}