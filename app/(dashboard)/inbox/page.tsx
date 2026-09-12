"use client";

import { useEffect, useState } from "react";
import { Mail, RefreshCw, MailOpen } from "lucide-react";

type EmailItem = {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string | null;
  snippet: string;
};

function shortFrom(from: string) {
  // "ชื่อคน <email@domain.com>" -> เอาแค่ชื่อ ถ้าไม่มีชื่อก็ใช้ email เต็ม
  const match = from.match(/^"?([^"<]+)"?\s*<.*>$/);
  return match ? match[1].trim() : from;
}

export default function InboxPage() {
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/gmail");
    if (res.ok) {
      const data = await res.json();
      setEmails(data.emails);
      setUnreadCount(data.unreadCount);
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "โหลดอีเมลไม่สำเร็จ");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold">
          Inbox {unreadCount > 0 && `(${unreadCount})`}
        </h1>
        <button
          onClick={load}
          className="text-muted hover:text-text transition"
          title="รีเฟรช"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      <p className="text-muted text-sm mb-6">
        อีเมลที่ยังไม่ได้อ่านล่าสุดจาก Gmail
      </p>

      {loading ? (
        <p className="text-muted text-sm">กำลังโหลด...</p>
      ) : error ? (
        <div className="bg-panel border border-border rounded-xl2 p-6 text-sm text-red-400">
          {error}
          <p className="text-muted mt-2 text-xs">
            ลองออกจากระบบแล้วล็อกอินใหม่ เพื่อขอสิทธิ์ Gmail อีกครั้ง
          </p>
        </div>
      ) : emails.length === 0 ? (
        <div className="bg-panel border border-border rounded-xl2 p-6 text-sm text-muted flex items-center gap-2">
          <MailOpen size={16} />
          อ่านหมดแล้ว ไม่มีอีเมลค้าง 🎉
        </div>
      ) : (
        <ul className="space-y-2">
          {emails.map((email) => (
            <li
              key={email.id}
              className="bg-panel border border-border rounded-lg px-4 py-3"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="font-medium truncate flex items-center gap-2">
                  <Mail size={14} className="text-accent2 shrink-0" />
                  {shortFrom(email.from)}
                </p>
                {email.date && (
                  <p className="text-xs text-muted shrink-0">
                    {new Date(email.date).toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                )}
              </div>
              <p className="text-sm truncate">{email.subject}</p>
              <p className="text-xs text-muted truncate mt-0.5">
                {email.snippet}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
