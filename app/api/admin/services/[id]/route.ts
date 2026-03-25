import { NextRequest } from "next/server";

// UPDATE SERVICE
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json();

  console.log("Update service:", id, body);

  return Response.json({ success: true });
}

// DELETE SERVICE
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  console.log("Delete service:", id);

  return Response.json({ success: true });
}