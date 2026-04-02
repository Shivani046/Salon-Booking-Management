import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const emailId = String(body?.emailId ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "").trim();

    // Validate input
    if (!emailId || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    // Find customer by email
    const user = await prisma.customer.findUnique({
      where: { emailId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Compare password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Success — alias Prisma's `id` to `custId` in JSON
    return NextResponse.json({
      message: "Login successful",
      custId: user.id,       // ✅ use `id`, alias to custId
      name: user.name,
      emailId: user.emailId,
      phoneNo: user.phoneNo,
      role: user.role,
    });

  } catch (err) {
    console.error("CUSTOMER LOGIN ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

