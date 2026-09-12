import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireSession } from "@/lib/apiGuard";

const COLLECTION = "todos";

export async function GET() {
  const { unauthorized } = await requireSession();
  if (unauthorized) return unauthorized;

  const snap = await getAdminDb()
    .collection(COLLECTION)
    .orderBy("createdAt", "desc")
    .get();

  const todos = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(todos);
}

export async function POST(req: NextRequest) {
  const { unauthorized } = await requireSession();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const text = (body?.text ?? "").toString().trim();
  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const doc = {
    text,
    done: false,
    createdAt: Date.now(),
  };
  const ref = await getAdminDb().collection(COLLECTION).add(doc);

  return NextResponse.json({ id: ref.id, ...doc }, { status: 201 });
}
