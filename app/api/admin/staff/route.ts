import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      include: {
        StaffServices: true, // 👈 THIS replaces staffServices
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("STAFF ERROR:", error);
    return NextResponse.json(
      { error: "Failed to load staff" },
      { status: 500 }
    );
  }
}