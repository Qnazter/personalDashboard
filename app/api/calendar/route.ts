import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ดึงเฉพาะ Calendar ID เดียวตามที่ตั้งไว้ใน .env (แนะนำให้แยก Calendar
// สำหรับงาน/เรียนออกจาก Calendar ส่วนตัว ตามที่คุยกันไว้)
// ถ้าไม่ตั้งค่า จะใช้ "primary" (calendar หลักของบัญชี)
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "primary";

export async function GET(req: Request) {
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

  const now = new Date();
  const requestedDays = Number(new URL(req.url).searchParams.get("days"));
  const days = [7, 15, 30, 60, 90].includes(requestedDays) ? requestedDays : 7;
  const inDays = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    timeMin: now.toISOString(),
    timeMax: inDays.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "100",
  });

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
    CALENDAR_ID
  )}/events?${params.toString()}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    // ไม่ cache เพราะเป็นข้อมูลตารางนัดหมายที่ต้องสดใหม่เสมอ
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    return NextResponse.json(
      { error: "Failed to fetch calendar events", detail: body },
      { status: res.status }
    );
  }

  const data = await res.json();
  const events = (data.items ?? []).map((item: any) => ({
    id: item.id,
    title: item.summary ?? "(ไม่มีชื่อหัวข้อ)",
    start: item.start?.dateTime ?? item.start?.date,
    end: item.end?.dateTime ?? item.end?.date,
    allDay: !item.start?.dateTime,
    location: item.location ?? null,
    htmlLink: item.htmlLink,
  }));

  return NextResponse.json(events);
}
