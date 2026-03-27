import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const { emailId, password } = await req.json(); // ✅ FIXED

  const user = await prisma.customer.findUnique({
    where: { emailId }, // ✅ FIXED
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 400 });
  }

  const isValid = await bcrypt.compare(password, user.password);
console.log("ENTERED:", password);
console.log("HASH:", user.password);
console.log("RESULT:", isValid);

  if (!isValid) {
    return NextResponse.json({ error: "Wrong password" }, { status: 400 });
  }


  return NextResponse.json({
    message: "Login success",
    user,
  });
}