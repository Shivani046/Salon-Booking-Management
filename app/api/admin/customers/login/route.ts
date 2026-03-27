import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const emailId = String(body?.emailId ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "").trim();

    if (!emailId || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const user = await prisma.customer.findUnique({
      where: { emailId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 🔐 simple password check (no bcrypt here)
    const actual = crypto.createHash('sha256').update(password).digest();
    const expected = crypto.createHash('sha256').update(user.password).digest();
    if (!crypto.timingSafeEqual(actual, expected)) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // ✅ IMPORTANT: send custId
    return NextResponse.json({
      message: "Login successful",
      custId: user.custId,
      name: user.name,
      emailId: user.emailId,
      phoneNo: user.phoneNo,
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}