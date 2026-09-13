"use client";

import { ChangeEvent, useState } from "react";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { jsPDF } from "jspdf";
import { Download, FileImage, QrCode, ScanLine, Wand2 } from "lucide-react";

type Mode =
  | "json"
  | "base64-encode"
  | "base64-decode"
  | "qr-maker"
  | "qr-reader"
  | "image-pdf"
  | "pdf-image";
const MODE_LABEL: Record<Mode, string> = {
  json: "JSON",
  "base64-encode": "Base64 Encode",
  "base64-decode": "Base64 Decode",
  "qr-maker": "QR Maker",
  "qr-reader": "QR Reader",
  "image-pdf": "PNG / JPG → PDF",
  "pdf-image": "PDF → PNG",
};

function download(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
}

export default function ConverterPage() {
  const [mode, setMode] = useState<Mode>("json");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [qrImage, setQrImage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  function choose(m: Mode) {
    setMode(m);
    setError("");
    setOutput("");
    setQrImage("");
    setFile(null);
  }
  function runText() {
    setError("");
    try {
      if (mode === "json")
        setOutput(JSON.stringify(JSON.parse(input), null, 2));
      if (mode === "base64-encode")
        setOutput(btoa(unescape(encodeURIComponent(input))));
      if (mode === "base64-decode")
        setOutput(decodeURIComponent(escape(atob(input))));
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    }
  }
  async function makeQr() {
    if (!input.trim()) return;
    setError("");
    try {
      setQrImage(
        await QRCode.toDataURL(input, {
          width: 720,
          margin: 2,
          color: { dark: "#101827", light: "#ffffff" },
        }),
      );
    } catch {
      setError("สร้าง QR ไม่สำเร็จ");
    }
  }
  function onFile(e: ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
    setOutput("");
    setError("");
  }
  async function readQr() {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("ไม่สามารถอ่านภาพได้");
      ctx.drawImage(img, 0, 0);
      const code = jsQR(
        ctx.getImageData(0, 0, canvas.width, canvas.height).data,
        canvas.width,
        canvas.height,
      );
      URL.revokeObjectURL(url);
      if (!code) throw new Error("ไม่พบ QR code ในภาพนี้");
      setOutput(code.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "อ่าน QR ไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }
  async function imageToPdf() {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      await img.decode();
      const pdf = new jsPDF({
        orientation:
          img.naturalWidth > img.naturalHeight ? "landscape" : "portrait",
        unit: "px",
        format: [img.naturalWidth, img.naturalHeight],
      });
      pdf.addImage(img, "PNG", 0, 0, img.naturalWidth, img.naturalHeight);
      pdf.save(`${file.name.replace(/\.[^.]+$/, "")}.pdf`);
      URL.revokeObjectURL(url);
    } catch {
      setError("สร้าง PDF ไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }
  async function pdfToImage() {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
      const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() })
        .promise;
      for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
        const page = await doc.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error();
        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        download(
          canvas.toDataURL("image/png"),
          `${file.name.replace(/\.pdf$/i, "")}-page-${pageNumber}.png`,
        );
      }
      setOutput(`ดาวน์โหลด PNG ครบ ${doc.numPages} หน้าแล้ว`);
    } catch (e) {
      setError("แปลง PDF ไม่สำเร็จ — กรุณาลองไฟล์ PDF อื่น");
    } finally {
      setBusy(false);
    }
  }
  const isText = mode === "json" || mode.startsWith("base64");
  return (
    <div className="max-w-5xl">
      <p className="text-accent2 text-xs font-semibold tracking-[0.18em] uppercase mb-2">
        Utilities
      </p>
      <h1 className="text-2xl font-semibold mb-1">Quick Converter</h1>
      <p className="text-muted text-sm mb-6">
        แปลงข้อมูลและไฟล์ได้จากเบราว์เซอร์ของคุณ
      </p>
      <div className="flex flex-wrap gap-2 mb-5">
        {(Object.keys(MODE_LABEL) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => choose(m)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${mode === m ? "border-accent2 bg-accent2/10 text-accent2" : "border-border text-muted hover:text-text"}`}
          >
            {MODE_LABEL[m]}
          </button>
        ))}
      </div>
      {isText && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section>
            <p className="text-xs text-muted mb-1">Input</p>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={14}
              className="input w-full font-mono text-sm"
              placeholder={
                mode === "json" ? '{"hello":"world"}' : "วางข้อความที่นี่..."
              }
            />
          </section>
          <section>
            <div className="flex justify-between mb-1">
              <p className="text-xs text-muted">Output</p>
              {output && (
                <button
                  onClick={() => navigator.clipboard.writeText(output)}
                  className="text-xs text-accent2"
                >
                  คัดลอก
                </button>
              )}
            </div>
            <textarea
              value={output}
              readOnly
              rows={14}
              className="input w-full font-mono text-sm"
            />
          </section>
          <button
            onClick={runText}
            className="bg-accent2 text-slate-950 rounded-lg px-5 py-2.5 font-semibold w-fit"
          >
            convert
          </button>
        </div>
      )}
      {mode === "qr-maker" && (
        <section className="bg-panel border border-border rounded-xl2 p-5 max-w-2xl">
          <label className="text-sm font-medium">
            ข้อความหรือลิงก์สำหรับ QR
          </label>
          <div className="flex gap-2 mt-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="input flex-1"
              placeholder="https://..."
            />
            <button
              onClick={makeQr}
              className="bg-accent2 text-slate-950 rounded-lg px-4 font-semibold"
            >
              <QrCode size={18} />
            </button>
          </div>
          {qrImage && (
            <div className="mt-5 flex flex-col items-center">
              <img
                src={qrImage}
                alt="Generated QR code"
                className="w-64 rounded-xl bg-white p-3"
              />
              <button
                onClick={() => download(qrImage, "qrcode.png")}
                className="mt-3 text-sm text-accent2 flex gap-2"
              >
                <Download size={16} /> ดาวน์โหลด PNG
              </button>
            </div>
          )}
        </section>
      )}
      {(mode === "qr-reader" ||
        mode === "image-pdf" ||
        mode === "pdf-image") && (
        <section className="bg-panel border border-border rounded-xl2 p-5 max-w-2xl">
          <div className="flex gap-3">
            <div className="text-accent2">
              {mode === "qr-reader" ? <ScanLine /> : <FileImage />}
            </div>
            <div>
              <p className="font-medium">
                {mode === "qr-reader"
                  ? "อัปโหลดภาพที่มี QR code"
                  : mode === "image-pdf"
                    ? "แปลงรูปภาพเป็นไฟล์ PDF"
                    : "แปลงทุกหน้าของ PDF เป็น PNG"}
              </p>
              <p className="text-muted text-sm mt-1">
                {mode === "qr-reader"
                  ? "รองรับ PNG, JPG และ WebP"
                  : mode === "image-pdf"
                    ? "รองรับ PNG, JPG และ WebP"
                    : "ระบบจะดาวน์โหลดภาพของทุกหน้าเมื่อแปลงเสร็จ"}
              </p>
            </div>
          </div>
          <input
            type="file"
            accept={
              mode === "pdf-image"
                ? "application/pdf"
                : "image/png,image/jpeg,image/webp"
            }
            onChange={onFile}
            className="block w-full text-sm text-muted mt-5 file:mr-3 file:rounded-lg file:border-0 file:bg-panel2 file:px-3 file:py-2 file:text-text"
          />
          {file && (
            <p className="text-xs text-muted mt-2">เลือก: {file.name}</p>
          )}
          <button
            disabled={!file || busy}
            onClick={
              mode === "qr-reader"
                ? readQr
                : mode === "image-pdf"
                  ? imageToPdf
                  : pdfToImage
            }
            className="mt-5 bg-accent2 disabled:opacity-50 text-slate-950 rounded-lg px-4 py-2.5 font-semibold flex gap-2 items-center"
          >
            {busy ? (
              "กำลังประมวลผล..."
            ) : (
              <>
                <Wand2 size={16} />
                {mode === "qr-reader" ? "อ่าน QR" : "เริ่มแปลง"}
              </>
            )}
          </button>
          {output && (
            <div className="mt-4 input break-all text-sm">{output}</div>
          )}
        </section>
      )}
      {error && <p className="text-rose-400 text-sm mt-3">{error}</p>}
    </div>
  );
}
