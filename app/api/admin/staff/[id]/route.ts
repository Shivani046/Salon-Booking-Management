import { NextRequest } from "next/server";

// UPDATE STAFF
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json();

  return Response.json({ success: true });
}

// DELETE STAFF
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  return Response.json({ success: true });
}