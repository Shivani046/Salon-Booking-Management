import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { emailId, phone, password } = await req.json();

    // Support login by email OR phone
    const where = emailId
      ? { emailId, password }
      : { phoneNo: phone, password };

    const user = await prisma.customer.findFirst({ where });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json({
      custId: user.custId,
      name: user.name,
      role: user.role,
      emailId: user.emailId,
      phoneNo: user.phoneNo,
    });

  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
