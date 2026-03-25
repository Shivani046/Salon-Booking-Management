export async function PUT(req: Request, { params }: any) {
  const body = await req.json();

  const updated = await prisma.service.update({
    where: { serviceId: Number(params.id) },
    data: body,
  });

  return Response.json(updated);
}

export async function DELETE(req: Request, { params }: any) {
  await prisma.service.delete({
    where: { serviceId: Number(params.id) },
  });

  return Response.json({ success: true });
}