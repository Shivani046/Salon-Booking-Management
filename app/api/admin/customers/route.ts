import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  const customers = await prisma.customer.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { phoneNo: { contains: q, mode: "insensitive" } },
            { emailId: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { id: "desc" },
    take: 50,
    select: { id: true, name: true, phoneNo: true, emailId: true }, // ✅ use id
  });

  // Alias id → custId in the response
  const result = customers.map(c => ({
    custId: c.id,
    name: c.name,
    phoneNo: c.phoneNo,
    emailId: c.emailId,
  }));

  return NextResponse.json(result);
}
