"use client";
import { useRef, useState, useCallback } from "react";

interface Props {
  onFile: (buffer: ArrayBuffer, fileName: string) => void;
  loading: boolean;
}

export default function UploadZone({ onFile, loading }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      alert("Hanya file Excel (.xlsx / .xls) yang didukung.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        onFile(e.target.result, file.name);
      }
    };
    reader.readAsArrayBuffer(file);
  }, [onFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div style={{ padding: "0 16px 32px" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: "32px", paddingTop: "8px" }}>
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>📋</div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: "8px" }}>
          Stok Opname Input
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: "320px", margin: "0 auto" }}>
          Upload file Excel SO sebelumnya. UI akan otomatis mendeteksi semua item dan stok lama.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? "var(--accent)" : "var(--border)"}`,
          borderRadius: "var(--radius-lg)",
          padding: "40px 24px",
          textAlign: "center",
          cursor: loading ? "not-allowed" : "pointer",
          background: dragging ? "rgba(74,124,247,0.06)" : "var(--bg-card)",
          transition: "all 0.2s ease",
          transform: dragging ? "scale(1.01)" : "scale(1)",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleChange}
          style={{ display: "none" }}
        />

        {loading ? (
          <div style={{ color: "var(--text-secondary)" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px", animation: "pulse-badge 1s infinite" }}>⏳</div>
            <p style={{ fontSize: "15px", fontWeight: 500 }}>Memproses file...</p>
          </div>
        ) : (
          <>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>📂</div>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
              Tap untuk pilih file Excel
            </p>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              atau drag & drop di sini
            </p>
            <div style={{
              display: "inline-block",
              marginTop: "20px",
              padding: "10px 24px",
              borderRadius: "var(--radius-sm)",
              background: "var(--accent)",
              color: "white",
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.2px",
            }}>
              Pilih File .xlsx
            </div>
          </>
        )}
      </div>

      {/* Steps guide */}
      <div style={{ marginTop: "32px" }}>
        <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
          Cara Pakai
        </p>
        {[
          { icon: "1️⃣", text: "Upload file Excel SO sebelumnya sebagai template" },
          { icon: "2️⃣", text: "Isi angka Step 1 (Utuh) & Step 2 (Terbuka) per item" },
          { icon: "3️⃣", text: "Status stok otomatis terhitung (🔴 🟠 🟢)" },
          { icon: "4️⃣", text: "Download Excel baru — identik template, formula tetap jalan" },
        ].map(({ icon, text }, i) => (
          <div key={i} style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            marginBottom: "10px",
            padding: "10px 12px",
            borderRadius: "var(--radius-sm)",
            background: "var(--bg-card)",
          }}>
            <span style={{ fontSize: "18px", flexShrink: 0 }}>{icon}</span>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
