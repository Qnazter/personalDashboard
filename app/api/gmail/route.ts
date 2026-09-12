import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const GMAIL_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";

function getHeader(headers: { name: string; value: string }[], name: string) {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())
    ?.value;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.error === "RefreshAccessTokenError" || !session.accessToken) {
    return NextResponse.json(
      { error: "Google session expired, please sign in again" },
      { status: 401 }
    );
  }

  const authHeader = { Authorization: `Bearer ${session.accessToken}` };

  // ขั้น 1: หา id ของอีเมลที่ยังไม่ได้อ่าน ใน Inbox (สูงสุด 15 ฉบับล่าสุด)
  const listRes = await fetch(
    `${GMAIL_BASE}/messages?q=${encodeURIComponent(
      "is:unread in:inbox"
    )}&maxResults=15`,
    { headers: authHeader, cache: "no-store" }
  );

  if (!listRes.ok) {
    const body = await listRes.text();
    return NextResponse.json(
      { error: "Failed to list Gmail messages", detail: body },
      { status: listRes.status }
    );
  }

  const listData = await listRes.json();
  const ids: string[] = (listData.messages ?? []).map((m: any) => m.id);

  // ขั้น 2: ดึงรายละเอียด (แค่หัวข้อ, ผู้ส่ง, วันที่, สั้นๆ) ของแต่ละฉบับ
  const emails = await Promise.all(
    ids.map(async (id) => {
      const res = await fetch(
        `${GMAIL_BASE}/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
        { headers: authHeader, cache: "no-store" }
      );
      if (!res.ok) return null;
      const data = await res.json();
      const headers = data.payload?.headers ?? [];
      return {
        id: data.id,
        threadId: data.threadId,
        subject: getHeader(headers, "Subject") ?? "(ไม่มีหัวข้อ)",
        from: getHeader(headers, "From") ?? "ไม่ทราบผู้ส่ง",
        date: getHeader(headers, "Date") ?? null,
        snippet: data.snippet ?? "",
      };
    })
  );

  return NextResponse.json({
    unreadCount: listData.resultSizeEstimate ?? emails.filter(Boolean).length,
    emails: emails.filter(Boolean),
  });
}
