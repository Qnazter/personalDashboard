"use client";

import { useEffect, useState } from "react";
import { Mail, RefreshCw, MailOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type EmailItem = {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string | null;
  snippet: string;
};
type MailFilter = "unread" | "starred" | "all" | "spam";
const FILTERS: { value: MailFilter; label: string }[] = [
  { value: "unread", label: "Unread" },
  { value: "starred", label: "Starred" },
  { value: "all", label: "All Emails" },
  { value: "spam", label: "Spam" },
];

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
  const [filter, setFilter] = useState<MailFilter>("unread");

  async function load() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/gmail?filter=${filter}`);
    if (res.ok) {
      const data = await res.json();
      setEmails(data.emails);
      setUnreadCount(data.unreadCount);
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Loading emails failed");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [filter]);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold">
          Inbox {unreadCount > 0 && `(${unreadCount})`}
        </h1>
        <button
          onClick={load}
          className="text-muted hover:text-text transition"
          title="refresh"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      <p className="text-muted text-sm mb-4">View your latest emails</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${filter === item.value ? "border-accent2 bg-accent2/10 text-accent2" : "border-border text-muted hover:text-text"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="max-w-sm space-y-2 pt-3">
          <p className="text-muted text-sm">Loading emails...</p>
          <Progress />
        </div>
      ) : error ? (
        <div className="bg-panel border border-border rounded-xl2 p-6 text-sm text-red-400">
          {error}
          <p className="text-muted mt-2 text-xs">
            Try signing out and back in to request Gmail permissions again
          </p>
        </div>
      ) : emails.length === 0 ? (
        <div className="bg-panel border border-border rounded-xl2 p-6 text-sm text-muted flex items-center gap-2">
          <MailOpen size={16} />
          no emails found for the selected filter
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
