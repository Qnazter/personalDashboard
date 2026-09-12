"use client";

import { useEffect, useState } from "react";
import { CalendarDays, MapPin, ExternalLink, RefreshCw } from "lucide-react";

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  location: string | null;
  htmlLink: string;
};

function formatEventTime(event: CalendarEvent) {
  if (event.allDay) return "ทั้งวัน";
  const start = new Date(event.start);
  const end = new Date(event.end);
  const opts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };
  return `${start.toLocaleTimeString("th-TH", opts)} - ${end.toLocaleTimeString(
    "th-TH",
    opts,
  )}`;
}

function formatEventDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("th-TH", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function SchedulePage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/calendar");
    if (res.ok) {
      setEvents(await res.json());
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "โหลดตารางนัดหมายไม่สำเร็จ");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // จัดกลุ่ม event ตามวันที่ เพื่อแสดงเป็นหัวข้อวันคั่นระหว่างกลุ่ม
  const grouped = events.reduce<Record<string, CalendarEvent[]>>((acc, ev) => {
    const key = formatEventDate(ev.start);
    acc[key] = acc[key] ?? [];
    acc[key].push(ev);
    return acc;
  }, {});

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold">Schedule</h1>
        <button
          onClick={load}
          className="text-muted hover:text-text transition"
          title="รีเฟรช"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      <p className="text-muted text-sm mb-6">
        Import จาก Google Calendar: DII / Work
      </p>

      {loading ? (
        <p className="text-muted text-sm">กำลังโหลด...</p>
      ) : error ? (
        <div className="bg-panel border border-border rounded-xl2 p-6 text-sm text-red-400">
          {error}
          <p className="text-muted mt-2 text-xs">
            ลองออกจากระบบแล้วล็อกอินใหม่ เพื่อขอสิทธิ์ Calendar อีกครั้ง
          </p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-panel border border-border rounded-xl2 p-6 text-sm text-muted flex items-center gap-2">
          <CalendarDays size={16} />
          ไม่มีนัดหมายใน
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dayEvents]) => (
            <div key={date}>
              <p className="text-xs uppercase tracking-wide text-muted mb-2">
                {date}
              </p>
              <ul className="space-y-2">
                {dayEvents.map((event) => (
                  <li
                    key={event.id}
                    className="bg-panel border border-border rounded-lg px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted mt-0.5">
                          {formatEventTime(event)}
                        </p>
                        {event.location && (
                          <p className="text-xs text-muted mt-1 flex items-center gap-1">
                            <MapPin size={12} />
                            {event.location}
                          </p>
                        )}
                      </div>
                      <a
                        href={event.htmlLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted hover:text-accent2 shrink-0"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
