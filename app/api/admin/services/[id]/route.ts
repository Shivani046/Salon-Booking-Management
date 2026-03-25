import { NextRequest } from "next/server";

// UPDATE STAFF
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  // TODO: replace with DB update
  console.log("Update staff:", params.id, body);

  return Response.json({ success: true });
}

// DELETE STAFF
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // TODO: replace with DB delete
  console.log("Delete staff:", params.id);

  return Response.json({ success: true });
}