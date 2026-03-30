import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all services
export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { category: "asc" },
      select: {
        serviceId: true,
        type: true,
        category: true,
        price: true,
      },
    });

    return NextResponse.json(services);
  } catch (err) {
    console.error("GET SERVICES ERROR:", err);
    return NextResponse.json([], { status: 500 });
  }
}
