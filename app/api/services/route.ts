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
      serviceId: true,
      type: true,
      category: true,
      price: true,
    },
  });

  return NextResponse.json(services);
}

