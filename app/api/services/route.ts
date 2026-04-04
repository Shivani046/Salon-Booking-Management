import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Util: normalize a string for comparison
function normalize(str: string) {
  return str.trim().replace(/\s+/g, " ").toLowerCase();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = (searchParams.get("q") ?? "").trim();
  const type = (searchParams.get("type") ?? "").trim(); // Optionally, match by exact/normalized type

  let where: any = undefined;

  if (type) {
    // Get all services, normalize and pick match
    const services = await prisma.service.findMany({
      select: {
        serviceId: true,
        type: true,
        category: true,
        price: true,
      },
      take: 100, // Arbitrary: assume this covers your services
    });
    const normType = normalize(type);
    const match = services.find(
      (s) => normalize(s.type) === normType
    );
    return NextResponse.json(match ? [match] : []);
  }

  if (q) {
    where = {
      OR: [
        { type: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
      ],
    };
  }

  const services = await prisma.service.findMany({
    where,
    orderBy: { category: "asc" },
    take: 50,
    select: {
      serviceId: true,
      type: true,
      category: true,
      price: true,
    },
  });

  return NextResponse.json(services);
}

