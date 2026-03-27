import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await prisma.customer.findUnique({
      where: { emailId: "admin@gmail.com" },
    });

    if (!user) {
      return NextResponse.json({
        error: "User not found. Please signup first.",
      });
    }

    await prisma.customer.update({
      where: { emailId: "admin@gmail.com" },
      data: { role: "admin" },
    });

    return NextResponse.json({ message: "Admin set!" });

  } catch (err) {
    console.error("ERROR:", err);
    return NextResponse.json(
      { error: "Failed", details: String(err) },
      { status: 500 }
    );
  }
}