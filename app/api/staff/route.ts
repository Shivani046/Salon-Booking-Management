import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  const staff = await prisma.staff.findMany({
    where: q
      ? {
          name: { contains: q, mode: "insensitive" },
        }
      : undefined,
    orderBy: { staffId: "desc" },   // ✅ use staffId
    take: 50,
    select: {
      staffId: true,   // ✅ use staffId, not id
      name: true,
    },
  });

  const result = staff.map(s => ({
    staffId: s.staffId,
    name: s.name,
  }));

  return NextResponse.json(result);
}


