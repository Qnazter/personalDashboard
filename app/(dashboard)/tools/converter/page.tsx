"use client";

import { useState } from "react";

type Mode = "json" | "base64-encode" | "base64-decode";

const MODE_LABEL: Record<Mode, string> = {
  json: "JSON Formatter",
  "base64-encode": "Base64 Encode",
  "base64-decode": "Base64 Decode",
};

export default function ConverterPage() {
  const [mode, setMode] = useState<Mode>("json");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  function run() {
    setError("");
    try {
      if (mode === "json") {
        const parsed = JSON.parse(input);
        setOutput(JSON.stringify(parsed, null, 2));
      } else if (mode === "base64-encode") {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else if (mode === "base64-decode") {
        setOutput(decodeURIComponent(escape(atob(input))));
      }
    } catch (e) {
      setOutput("");
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    }
  }

  function copyOutput() {
    if (output) navigator.clipboard.writeText(output);
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-semibold mb-1">Quick Converter / Formatter</h1>
      <p className="text-muted text-sm mb-6">
        ประมวลผลทั้งหมดในเบราว์เซอร์ ไม่ส่งข้อมูลออกไปไหน
      </p>

      <div className="flex gap-2 mb-4">
        {(Object.keys(MODE_LABEL) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`text-sm px-3 py-1.5 rounded-lg border ${
              mode === m
                ? "border-accent2 text-accent2 bg-panel2"
                : "border-border text-muted hover:text-text"
            }`}
          >
            {MODE_LABEL[m]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted mb-1">Input</p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={14}
            className="w-full bg-panel border border-border rounded-lg p-3 font-mono text-sm outline-none focus:border-accent2"
            placeholder={
              mode === "json" ? '{"hello":"world"}' : "วางข้อความที่นี่..."
            }
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted">Output</p>
            {output && (
              <button
                onClick={copyOutput}
                className="text-xs text-accent2 hover:underline"
              >
                คัดลอก
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            rows={14}
            className="w-full bg-panel2 border border-border rounded-lg p-3 font-mono text-sm outline-none"
          />
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
      </div>

      <button
        onClick={run}
        className="mt-4 bg-accent2 text-black rounded-lg px-5 py-2.5 font-medium"
      >
        แปลง / จัดฟอร์แมต
      </button>
    </div>
  );
}
