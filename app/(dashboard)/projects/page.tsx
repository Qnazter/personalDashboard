"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarRange,
  ExternalLink,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type { Project, ProjectStatus } from "@/types";
import { Progress } from "@/components/ui/progress";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  planning: "วางแผน",
  "in-progress": "กำลังทำ",
  blocked: "ติดปัญหา",
  done: "เสร็จแล้ว",
};
const STATUS_COLOR: Record<ProjectStatus, string> = {
  planning: "bg-slate-400/15 text-slate-300",
  "in-progress": "bg-sky-400/15 text-sky-300",
  blocked: "bg-rose-400/15 text-rose-300",
  done: "bg-emerald-400/15 text-emerald-300",
};
const EMPTY = {
  name: "",
  url: "",
  notes: "",
  startDate: "",
  targetDate: "",
  status: "planning" as ProjectStatus,
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState<Project | null>(null);
  const [filter, setFilter] = useState<"all" | ProjectStatus>("all");
  const [loading, setLoading] = useState(true);
  const visible = useMemo(
    () =>
      filter === "all" ? projects : projects.filter((p) => p.status === filter),
    [projects, filter],
  );
  async function load() {
    setLoading(true);
    const res = await fetch("/api/projects");
    if (res.ok) setProjects(await res.json());
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);
  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const res = await fetch(
      editing ? `/api/projects/${editing.id}` : "/api/projects",
      {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      },
    );
    if (res.ok) {
      if (editing)
        setProjects((prev) =>
          prev.map((p) => (p.id === editing.id ? { ...p, ...form } : p)),
        );
      else {
        const created = await res.json();
        setProjects((prev) => [{ ...created }, ...prev]);
      }
      setForm(EMPTY);
      setEditing(null);
    }
  }
  function edit(project: Project) {
    setEditing(project);
    setForm({
      name: project.name,
      url: project.url ?? "",
      notes: project.notes ?? "",
      startDate: project.startDate ?? "",
      targetDate: project.targetDate ?? "",
      status: project.status,
    });
  }
  async function updateStatus(project: Project, status: ProjectStatus) {
    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, status } : p)),
    );
    await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }
  async function deleteProject(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
  }
  return (
    <div className="max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-accent2 text-xs font-semibold tracking-[0.18em] uppercase mb-2">
            Workspace
          </p>
          <h1 className="text-2xl font-semibold">Project Hub</h1>
          <p className="text-muted text-sm mt-1">
            เก็บบริบท กำหนดช่วงเวลา และเห็นงานที่ต้องให้ความสนใจ
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setForm(EMPTY);
          }}
          className="bg-accent2 text-slate-950 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 font-semibold"
        >
          <Plus size={17} /> เพิ่มโปรเจกต์
        </button>
      </div>
      <form
        onSubmit={save}
        className="bg-panel border border-border rounded-xl2 p-4 md:p-5 mb-6 shadow-sm"
      >
        <div className="flex justify-between items-center mb-4">
          <p className="font-medium">
            {editing ? "แก้ไขรายละเอียดโปรเจกต์" : "โปรเจกต์ใหม่"}
          </p>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm(EMPTY);
              }}
              className="text-muted hover:text-text"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="ชื่อโปรเจกต์ *"
            className="input"
          />
          <input
            value={form.url}
            onChange={(e) => set("url", e.target.value)}
            placeholder="ลิงก์ที่เกี่ยวข้อง (ถ้ามี)"
            className="input"
          />
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="รายละเอียด / สิ่งที่ต้องทำต่อ"
            rows={3}
            className="input md:col-span-2 resize-y"
          />
          <label className="text-xs text-muted">
            เริ่มโดยประมาณ
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
              className="input mt-1 w-full text-text"
            />
          </label>
          <label className="text-xs text-muted">
            เป้าหมายเสร็จ
            <input
              type="date"
              value={form.targetDate}
              onChange={(e) => set("targetDate", e.target.value)}
              className="input mt-1 w-full text-text"
            />
          </label>
        </div>
        <div className="flex flex-wrap justify-between items-center gap-3 mt-4">
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            className="input w-auto py-2 text-sm"
          >
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button className="bg-accent2 text-slate-950 rounded-lg px-4 py-2 font-semibold text-sm">
            {editing ? "บันทึกการแก้ไข" : "สร้างโปรเจกต์"}
          </button>
        </div>
      </form>
      <div className="flex flex-wrap gap-2 mb-4">
        {(["all", "planning", "in-progress", "blocked", "done"] as const).map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-full px-3 py-1.5 text-xs border transition ${filter === status ? "border-accent2 bg-accent2/10 text-accent2" : "border-border text-muted hover:text-text"}`}
            >
              {status === "all"
                ? `ทั้งหมด (${projects.length})`
                : `${STATUS_LABEL[status]} (${projects.filter((p) => p.status === status).length})`}
            </button>
          ),
        )}
      </div>
      {loading ? (
        <div className="max-w-sm space-y-2 pt-3"><p className="text-muted text-sm">กำลังโหลดโปรเจกต์...</p><Progress /></div>
      ) : visible.length === 0 ? (
        <div className="bg-panel border border-dashed border-border rounded-xl2 p-8 text-center text-muted text-sm">
          ไม่มีโปรเจกต์ในหมวดนี้
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {visible.map((project) => (
            <article
              key={project.id}
              className="bg-panel border border-border rounded-xl2 p-4 hover:border-slate-500 transition"
            >
              <div className="flex gap-3 justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold truncate">{project.name}</h2>
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted hover:text-accent2"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-muted mt-2 min-h-[2.5rem]">
                    {project.notes || "ยังไม่มีรายละเอียด"}
                  </p>
                </div>
                <button
                  onClick={() => edit(project)}
                  title="แก้ไข"
                  className="text-muted hover:text-accent2 shrink-0"
                >
                  <Pencil size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted mt-4">
                <CalendarRange size={14} />
                {project.startDate || project.targetDate ? (
                  <span>
                    {project.startDate || "ไม่ระบุ"}{" "}
                    <span className="mx-1">→</span>{" "}
                    {project.targetDate || "ไม่ระบุ"}
                  </span>
                ) : (
                  <span>ยังไม่กำหนดช่วงเวลา</span>
                )}
              </div>
              <div className="border-t border-border mt-3 pt-3 flex justify-between items-center">
                <select
                  value={project.status}
                  onChange={(e) =>
                    updateStatus(project, e.target.value as ProjectStatus)
                  }
                  className={`text-xs rounded-full px-3 py-1.5 outline-none ${STATUS_COLOR[project.status]}`}
                >
                  {Object.entries(STATUS_LABEL).map(([value, label]) => (
                    <option
                      key={value}
                      value={value}
                      className="bg-panel text-text"
                    >
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => deleteProject(project.id)}
                  className="text-muted hover:text-rose-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
