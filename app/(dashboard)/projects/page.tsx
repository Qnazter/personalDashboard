"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import type { Project, ProjectStatus } from "@/types";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  planning: "วางแผน",
  "in-progress": "กำลังทำ",
  blocked: "ติดปัญหา",
  done: "เสร็จแล้ว",
};

const STATUS_COLOR: Record<ProjectStatus, string> = {
  planning: "bg-gray-500/20 text-gray-300",
  "in-progress": "bg-blue-500/20 text-blue-300",
  blocked: "bg-red-500/20 text-red-300",
  done: "bg-green-500/20 text-green-300",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/projects");
    if (res.ok) setProjects(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addProject(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, url, status: "planning" }),
    });
    if (res.ok) {
      const created = await res.json();
      setProjects((prev) => [created, ...prev]);
      setName("");
      setUrl("");
    }
  }

  async function updateStatus(project: Project, status: ProjectStatus) {
    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, status } : p))
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
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold mb-1">Project Hub</h1>
      <p className="text-muted text-sm mb-6">
        รวมลิงก์โปรเจกต์และกระดานติดตามความคืบหน้างาน
      </p>

      <form
        onSubmit={addProject}
        className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 mb-6"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ชื่อโปรเจกต์"
          className="bg-panel border border-border rounded-lg px-4 py-2.5 outline-none focus:border-accent2"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="ลิงก์ (ไม่บังคับ)"
          className="bg-panel border border-border rounded-lg px-4 py-2.5 outline-none focus:border-accent2"
        />
        <button
          type="submit"
          className="bg-accent2 text-black rounded-lg px-4 py-2.5 flex items-center gap-1 font-medium justify-center"
        >
          <Plus size={16} />
          เพิ่ม
        </button>
      </form>

      {loading ? (
        <p className="text-muted text-sm">กำลังโหลด...</p>
      ) : projects.length === 0 ? (
        <p className="text-muted text-sm">ยังไม่มีโปรเจกต์ในระบบ</p>
      ) : (
        <ul className="space-y-2">
          {projects.map((project) => (
            <li
              key={project.id}
              className="bg-panel border border-border rounded-lg px-4 py-3 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{project.name}</p>
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
              </div>
              <select
                value={project.status}
                onChange={(e) =>
                  updateStatus(project, e.target.value as ProjectStatus)
                }
                className={`text-xs rounded-full px-3 py-1 border-0 outline-none ${
                  STATUS_COLOR[project.status]
                }`}
              >
                {Object.entries(STATUS_LABEL).map(([value, label]) => (
                  <option key={value} value={value} className="bg-panel text-text">
                    {label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => deleteProject(project.id)}
                className="text-muted hover:text-red-400 transition"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
