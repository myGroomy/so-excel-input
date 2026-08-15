"use client";
import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  FileSpreadsheet,
  UploadCloud,
  Loader2,
  CheckCircle2,
  MousePointerClick,
  Download,
  FolderOpen,
} from "lucide-react";

interface Props {
  onFile: (buffer: ArrayBuffer, fileName: string) => void;
  loading: boolean;
}

const steps = [
  { icon: FolderOpen, title: "Upload template", text: "Pilih file Excel SO sebelumnya sebagai template" },
  { icon: CheckCircle2, title: "Isi stok baru", text: "Masukkan angka Step 1 (Utuh) & Step 2 (Terbuka) per item" },
  { icon: ClipboardList, title: "Status terhitung", text: "Status stok (Kritis / Hampir Habis / Aman) dihitung otomatis" },
  { icon: Download, title: "Download Excel", text: "File baru identik template, rumus & format tetap jalan" },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

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
    <motion.div
      style={{ padding: "0 16px 32px" }}
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Hero */}
      <motion.div
        variants={fadeUp}
        style={{ textAlign: "center", marginBottom: "32px", paddingTop: "24px" }}
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
          style={{
            width: 64,
            height: 64,
            margin: "0 auto 16px",
            borderRadius: "20px",
            background: "var(--accent-soft)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--accent)",
            boxShadow: "var(--glow-accent)",
          }}
        >
          <ClipboardList size={30} strokeWidth={2} />
        </motion.div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.6px", marginBottom: "8px" }}>
          Stok Opname Input
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: "320px", margin: "0 auto" }}>
          Upload file Excel SO sebelumnya. Semua item & stok lama terdeteksi otomatis.
        </p>
      </motion.div>

      {/* Drop zone */}
      <motion.div
        variants={fadeUp}
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        whileHover={loading ? undefined : { scale: 1.015 }}
        whileTap={loading ? undefined : { scale: 0.985 }}
        style={{
          border: `2px dashed ${dragging ? "var(--accent)" : "var(--border)"}`,
          borderRadius: "var(--radius-xl)",
          padding: "40px 24px",
          textAlign: "center",
          cursor: loading ? "not-allowed" : "pointer",
          background: dragging ? "var(--accent-soft)" : "var(--bg-card)",
          boxShadow: "var(--shadow-md)",
          transition: "border-color 0.2s ease, background 0.2s ease",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleChange}
          style={{ display: "none" }}
        />

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{ color: "var(--text-secondary)" }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                style={{ display: "inline-flex", marginBottom: "12px" }}
              >
                <Loader2 size={32} strokeWidth={2} />
              </motion.div>
              <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--accent)" }}>Memproses file...</p>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                style={{ display: "inline-flex", marginBottom: "12px", color: "var(--accent)" }}
              >
                <UploadCloud size={36} strokeWidth={1.8} />
              </motion.div>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                Tap untuk pilih file Excel
              </p>
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                atau drag & drop di sini
              </p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: "20px",
                  padding: "12px 26px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--accent)",
                  color: "var(--on-accent)",
                  fontSize: "14px",
                  fontWeight: 700,
                  letterSpacing: "0.2px",
                  boxShadow: "var(--glow-accent)",
                }}
              >
                <FileSpreadsheet size={17} strokeWidth={2} />
                Pilih File .xlsx
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Steps guide */}
      <div style={{ marginTop: "32px" }}>
        <motion.p
          variants={fadeUp}
          style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "14px" }}
        >
          Cara Pakai
        </motion.p>
        {steps.map(({ icon: Icon, title, text }, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            whileHover={{ x: 4 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "10px",
              padding: "12px 14px",
              borderRadius: "var(--radius-md)",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "12px",
                background: "var(--bg-card2)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent)",
                flexShrink: 0,
              }}
            >
              <Icon size={17} strokeWidth={2} />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{title}</p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5 }}>{text}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer hint */}
      <motion.p
        variants={fadeUp}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}
      >
        <MousePointerClick size={13} strokeWidth={2} />
        Aplikasi berjalan penuh di perangkat ini, data tidak diunggah ke server
      </motion.p>
    </motion.div>
  );
}