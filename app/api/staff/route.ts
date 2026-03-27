import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceId = Number(searchParams.get("serviceId"));

    if (!serviceId) return NextResponse.json([]);

    const staff = await prisma.$queryRawUnsafe(`
      SELECT s."staffId", s.name
      FROM "staff" s
      INNER JOIN "_StaffServices" ss
      ON s."staffId" = ss."staffId"
      WHERE ss."serviceId" = ${serviceId}
    `);

    return NextResponse.json(staff);
  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json([]);
  }
}