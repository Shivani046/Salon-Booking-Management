import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const name = String(body?.name ?? "").trim();
  const phoneNo = String(body?.phoneNo ?? "").trim();
  const emailId = String(body?.emailId ?? "").trim();
  const password = String(body?.password ?? "");

  if (!name || !phoneNo || !emailId || !password) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  try {
    const customer = await prisma.customer.create({
      data: { name, phoneNo, emailId, password: hashed },
    });

    return NextResponse.json({
      custId: customer.custId,
      name: customer.name,
      phoneNo: customer.phoneNo,
      emailId: customer.emailId,
    });
  } catch {
    return NextResponse.json({ error: "Phone or email already exists." }, { status: 409 });
  }
}