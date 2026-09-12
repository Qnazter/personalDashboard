"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Wrench,
  Gauge,
  CalendarDays,
  Mail,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard, group: "Home" },
  { href: "/projects", label: "Project Hub", icon: FolderKanban, group: "Home" },
  { href: "/todo", label: "To-Do", icon: ListTodo, group: "Home" },
  { href: "/tools/converter", label: "Converter", icon: Wrench, group: "Dev & AI" },
  { href: "/tools/token-monitor", label: "Token Monitor", icon: Gauge, group: "Dev & AI" },
  { href: "/schedule", label: "Schedule", icon: CalendarDays, group: "Life & Comm" },
  { href: "/inbox", label: "Inbox", icon: Mail, group: "Life & Comm" },
];

const GROUPS = ["Home", "Dev & AI", "Life & Comm"];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-border bg-panel">
      <div className="px-5 py-5 border-b border-border">
        <p className="text-sm text-muted">Command Center</p>
        <p className="font-semibold">แดชบอร์ดส่วนตัว</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {GROUPS.map((group) => (
          <div key={group}>
            <p className="text-xs uppercase tracking-wide text-muted px-3 mb-2">
              {group}
            </p>
            <div className="space-y-1">
              {NAV.filter((item) => item.group === group).map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                      active
                        ? "bg-panel2 text-accent border border-border"
                        : "text-muted hover:text-text hover:bg-panel2"
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
