import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body?.name ?? "").trim();
    const phoneNo = String(body?.phoneNo ?? "").trim();
    const emailId = String(body?.emailId ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "").trim();

    if (!name || !phoneNo || !emailId || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // check duplicates
    const existing = await prisma.customer.findFirst({
      where: { OR: [{ phoneNo }, { emailId }] },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // create user
    const user = await prisma.customer.create({
      data: {
        name,
        phoneNo,
        emailId,
        password,
      },
    });

    return NextResponse.json({ success: true, user });

  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}