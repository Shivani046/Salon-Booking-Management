import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch bills (optionally filtered by logged-in user)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const custId = searchParams.get("custId");

  const where: any = {};
  if (custId && !isNaN(Number(custId))) {
    where.customerId = Number(custId);
  }

  // Customize these fields/relations to match your actual Bill model
  const bills = await prisma.bill.findMany({
    where,
    orderBy: { billId: "desc" }, // or your ID key
    take: 50,
    select: {
      billId: true, // or id, or invoiceId
      customerId: true,
      service: { select: { type: true } },
      date: true, // or billDate
      method: true, // Cash/UPI/Card
      amount: true,
      status: true,
    }
  });

  // Optionally, map fields for frontend formatting (if you want)
  const formatted = bills.map(b => ({
    id: b.billId?.toString() ?? "",
    service: b.service?.type ?? "",
    date: typeof b.date === "string" ? b.date.slice(0,10) : b.date?.toISOString()?.slice(0,10) ?? "",
    method: b.method,
    amount: typeof b.amount === "number" ? `${b.amount}/-` : `${b.amount || ""}`,
    status: b.status,
  }));

  return NextResponse.json(formatted);
}

// Optionally: POST/PUT for new bills/refunds (not required for just viewing)