import Link from "next/link";
import { FolderKanban, ListTodo, Wrench, Gauge } from "lucide-react";

const CARDS = [
  {
    href: "/projects",
    icon: FolderKanban,
    title: "Project Hub",
    desc: "ลิงก์โปรเจกต์และความคืบหน้างาน",
  },
  {
    href: "/todo",
    icon: ListTodo,
    title: "To-Do List",
    desc: "สิ่งที่ต้องทำ",
  },
  {
    href: "/tools/converter",
    icon: Wrench,
    title: "Quick Converter",
    desc: "แปลงทุกอย่างบนโลก",
  },
  {
    href: "/tools/token-monitor",
    icon: Gauge,
    title: "AI Token Monitor",
    desc: "เช็กโควตา Token ของ AI",
  },
];

export default function OverviewPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Overview</h1>
      <p className="text-muted text-sm mb-6">
        ภาพรวมของ Personal Command Center
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.href}
              href={c.href}
              className="bg-panel border border-border rounded-xl2 p-5 hover:border-accent2 transition"
            >
              <Icon className="mb-3 text-accent2" size={22} />
              <p className="font-medium mb-1">{c.title}</p>
              <p className="text-sm text-muted">{c.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
