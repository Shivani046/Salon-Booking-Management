import { NextRequest } from "next/server";

// UPDATE STAFF
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json();

  console.log("Update staff:", id, body);

  return Response.json({ success: true });
}

// DELETE STAFF
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  console.log("Delete staff:", id);

  return Response.json({ success: true });
}