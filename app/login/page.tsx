"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-text">
      <div className="bg-panel border border-border rounded-xl2 p-10 w-full max-w-sm text-center shadow-xl">
        <h1 className="text-2xl font-semibold mb-2">Personal Command Center</h1>
        <p className="text-muted mb-8 text-sm">
          Sign in to access your personalized dashboard
        </p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full bg-accent2 hover:opacity-90 transition text-black font-medium py-2.5 rounded-lg"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
