"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, FolderKanban, Gauge, ListTodo, Mail, Sparkles, Wrench } from "lucide-react";
import { Globe } from "@/components/ui/globe";

const CARDS = [
  { href: "/projects", icon: FolderKanban, title: "Project Hub", desc: "จัดการงานและติดตามสถานะ", color: "text-sky-300", bg: "from-sky-400/15" },
  { href: "/todo", icon: ListTodo, title: "To-Do List", desc: "เคลียร์สิ่งที่ต้องทำวันนี้", color: "text-emerald-300", bg: "from-emerald-400/15" },
  { href: "/schedule", icon: CalendarDays, title: "Schedule", desc: "ดูแผนล่วงหน้าได้ทันที", color: "text-violet-300", bg: "from-violet-400/15" },
  { href: "/inbox", icon: Mail, title: "Inbox", desc: "ตามอีเมลสำคัญให้ทัน", color: "text-amber-300", bg: "from-amber-400/15" },
];

export default function OverviewPage() {
  const [time, setTime] = useState("");
  useEffect(() => { const tick = () => setTime(new Intl.DateTimeFormat("th-TH", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date())); tick(); const timer = window.setInterval(tick, 60_000); return () => window.clearInterval(timer); }, []);
  return <div className="max-w-6xl pb-8">
    <section className="relative isolate overflow-hidden rounded-[1.5rem] border border-border bg-panel min-h-[310px] mb-6 px-6 py-7 md:px-9 md:py-9">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.16),transparent_32%),radial-gradient(circle_at_85%_15%,rgba(16,185,129,0.1),transparent_28%)]" />
      <Globe className="-right-[32%] -top-[28%] opacity-80 md:-right-[12%]" />
      <div className="relative z-10 max-w-xl"><div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 text-xs text-sky-200"><Sparkles size={13}/> Personal command center</div><h1 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">พร้อมจัดวันของคุณ<br/><span className="text-sky-300">ให้ไหลลื่นขึ้น</span></h1><p className="mt-3 text-sm text-muted">{time || "กำลังเตรียมวันนี้ให้คุณ..."}</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/todo" className="rounded-lg bg-accent2 px-4 py-2.5 text-sm font-semibold text-slate-950">เริ่มจาก To-Do</Link><Link href="/projects" className="rounded-lg border border-border bg-panel/70 px-4 py-2.5 text-sm font-semibold text-text">ดูโปรเจกต์</Link></div></div>
      <div className="absolute bottom-5 right-5 z-10 hidden text-right md:block"><p className="text-xs text-muted">Connected points</p><p className="text-sm font-medium">Bangkok · Tokyo · London</p></div>
    </section>
    <div className="flex items-center justify-between mb-4"><div><h2 className="text-lg font-semibold">พื้นที่ทำงานของคุณ</h2><p className="text-sm text-muted">เลือกจุดเริ่มต้นสำหรับตอนนี้</p></div><Link href="/tools/converter" className="hidden sm:flex gap-2 text-sm text-accent2 hover:text-sky-200">เครื่องมือทั้งหมด <ArrowUpRight size={16}/></Link></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">{CARDS.map((card) => { const Icon = card.icon; return <Link key={card.href} href={card.href} className={`group relative overflow-hidden rounded-xl2 border border-border bg-gradient-to-br ${card.bg} to-panel p-5 transition duration-200 hover:-translate-y-0.5 hover:border-slate-500`}><Icon className={`${card.color} mb-7`} size={22}/><ArrowUpRight className="absolute right-4 top-4 text-muted transition group-hover:text-text group-hover:translate-x-0.5 group-hover:-translate-y-0.5" size={17}/><p className="font-semibold">{card.title}</p><p className="mt-1 text-sm text-muted">{card.desc}</p></Link>; })}</div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-6"><Link href="/tools/converter" className="lg:col-span-2 rounded-xl2 border border-border bg-panel p-5 flex items-center gap-4 hover:border-slate-500 transition"><div className="rounded-xl bg-violet-400/10 p-3 text-violet-300"><Wrench size={21}/></div><div className="flex-1"><p className="font-medium">Quick Converter</p><p className="text-sm text-muted mt-1">QR code, แปลงไฟล์ และ formatter ในที่เดียว</p></div><ArrowUpRight className="text-muted" size={18}/></Link><Link href="/tools/token-monitor" className="rounded-xl2 border border-border bg-panel p-5 flex items-center gap-4 hover:border-slate-500 transition"><Gauge className="text-amber-300" size={23}/><div><p className="font-medium">Token Monitor</p><p className="text-sm text-muted mt-1">เช็กโควตา AI</p></div></Link></div>
  </div>;
}
