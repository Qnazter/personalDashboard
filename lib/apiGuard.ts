import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// เรียกใช้ต้นทุก API Route ที่ต้องการให้เข้าถึงได้เฉพาะเจ้าของแดชบอร์ด
export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      session: null,
      unauthorized: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session, unauthorized: null };
}
