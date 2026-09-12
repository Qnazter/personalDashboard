import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireSession } from "@/lib/apiGuard";

const COLLECTION = "projects";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { unauthorized } = await requireSession();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const update: Record<string, unknown> = {};
  for (const key of ["name", "url", "status", "notes"] as const) {
    if (typeof body[key] === "string") update[key] = body[key];
  }

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
