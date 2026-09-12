import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireSession } from "@/lib/apiGuard";

const COLLECTION = "todos";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { unauthorized } = await requireSession();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const update: Record<string, unknown> = {};
  if (typeof body.text === "string") update.text = body.text.trim();
  if (typeof body.done === "boolean") update.done = body.done;

  await getAdminDb().collection(COLLECTION).doc(params.id).update(update);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { unauthorized } = await requireSession();
  if (unauthorized) return unauthorized;

  await getAdminDb().collection(COLLECTION).doc(params.id).delete();
  return NextResponse.json({ ok: true });
}
