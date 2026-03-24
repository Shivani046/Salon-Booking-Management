import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const emailId = String(body?.emailId ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "").trim();

    if (!emailId || !password) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await prisma.customer.findUnique({
      where: { emailId },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (user.password !== password) {
      return Response.json({ error: "Invalid password" }, { status: 401 });
    }

    return Response.json(user);
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}