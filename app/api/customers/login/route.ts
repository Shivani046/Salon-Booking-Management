import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { emailId, phone, password } = await req.json();

    // 1. Find user by email OR phone (DO NOT include password in the query!)
    const user = await prisma.customer.findFirst({
      where: emailId
        ? { emailId }
        : { phoneNo: phone },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 2. Compare hashed password using bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    // 3. Success: return user info
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
