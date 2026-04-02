import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  const services = await prisma.service.findMany({
    where: q
      ? {
          OR: [
            { type: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { category: "asc" },
    take: 50,
    select: {
      serviceId: true,   // ✅ use serviceId, not id
      type: true,
      category: true,
      price: true,
    },
  });

  const result = services.map(s => ({
    serviceId: s.serviceId,
    type: s.type,
    category: s.category,
    price: s.price,
  }));

  return NextResponse.json(result);
}

