import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body?.name ?? "").trim();
    const phoneNo = String(body?.phoneNo ?? "").trim();
    const emailId = String(body?.emailId ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "").trim();

    if (!name || !phoneNo || !emailId || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        name,
        phoneNo,
        emailId,
        password: hashedPassword,
        role: "user",
      },
    });

    // Success response
    return NextResponse.json({
      message: "Signup successful",
      custId: customer.custId,   // ✅ use custId, not id
      name: customer.name,
      phoneNo: customer.phoneNo,
      emailId: customer.emailId,
      role: customer.role,
    });

  } catch (err) {
    console.error("CUSTOMER SIGNUP ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

