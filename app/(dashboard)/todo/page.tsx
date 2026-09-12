"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import type { Todo } from "@/types";

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/todos");
    if (res.ok) setTodos(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setText("");
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: value }),
    });
    if (res.ok) {
      const created = await res.json();
      setTodos((prev) => [created, ...prev]);
    }
  }

  async function toggleTodo(todo: Todo) {
    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t))
    );
    await fetch(`/api/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !todo.done }),
    });
  }

  async function deleteTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-1">To-Do ประจำวัน</h1>
      <p className="text-muted text-sm mb-6">
        เก็บลง Firestore แบบเรียลไทม์ผ่าน API Route
      </p>

      <form onSubmit={addTodo} className="flex gap-2 mb-6">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="เพิ่มสิ่งที่ต้องทำ..."
          className="flex-1 bg-panel border border-border rounded-lg px-4 py-2.5 outline-none focus:border-accent2"
        />
        <button
          type="submit"
          className="bg-accent2 text-black rounded-lg px-4 py-2.5 flex items-center gap-1 font-medium"
        >
          <Plus size={16} />
          เพิ่ม
        </button>
      </form>

      {loading ? (
        <p className="text-muted text-sm">กำลังโหลด...</p>
      ) : todos.length === 0 ? (
        <p className="text-muted text-sm">ยังไม่มีรายการ — เพิ่มอันแรกเลย!</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 bg-panel border border-border rounded-lg px-4 py-3"
            >
              <button
                onClick={() => toggleTodo(todo)}
                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                  todo.done
                    ? "bg-accent border-accent text-black"
                    : "border-border"
                }`}
              >
                {todo.done && <Check size={12} />}
              </button>
              <span
                className={`flex-1 text-sm ${
                  todo.done ? "line-through text-muted" : ""
                }`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
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
