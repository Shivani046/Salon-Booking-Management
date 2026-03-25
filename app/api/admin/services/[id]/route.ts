import { NextRequest } from "next/server";

// UPDATE SERVICE
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json();

  return Response.json({ success: true });
}

// DELETE SERVICE
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  return Response.json({ success: true });
}