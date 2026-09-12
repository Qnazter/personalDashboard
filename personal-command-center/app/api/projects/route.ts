import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireSession } from "@/lib/apiGuard";

const COLLECTION = "projects";

export async function GET() {
  const { unauthorized } = await requireSession();
  if (unauthorized) return unauthorized;

  const snap = await getAdminDb()
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .get();

  const projects = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const { unauthorized } = await requireSession();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const name = (body?.name ?? "").toString().trim();
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const doc = {
    name,
    url: (body?.url ?? "").toString().trim(),
    status: body?.status ?? "planning",
    notes: (body?.notes ?? "").toString().trim(),
    createdAt: Date.now(),
  };
  const ref = await getAdminDb().collection(COLLECTION).add(doc);

  return NextResponse.json({ id: ref.id, ...doc }, { status: 201 });
}
