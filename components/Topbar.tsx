"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function Topbar() {
  const { data: session } = useSession();

  return (
    <header className="h-16 border-b border-border bg-panel/60 backdrop-blur sticky top-0 z-10 flex items-center justify-between px-4 md:px-6">
      <div>
        <p className="text-sm text-muted">Welcome</p>
        <p className="font-medium">{session?.user?.name ?? "..."}</p>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center gap-2 text-sm text-muted hover:text-text border border-border rounded-lg px-3 py-1.5 transition"
      >
        <LogOut size={14} />
        Sign Out
      </button>
    </header>
  );
}
