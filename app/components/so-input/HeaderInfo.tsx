"use client";
import { FileSpreadsheet, RefreshCcw } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface Props {
  fileName: string;
  onReset: () => void;
}

export default function HeaderInfo({ fileName, onReset }: Props) {
  return (
    <div
      style={{
        padding: "12px 16px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-elevated)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Always-visible row: logo + Stok Opname + filename + actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "12px",
              background: "var(--accent-soft)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent)",
              flexShrink: 0,
            }}
          >
            <FileSpreadsheet size={18} strokeWidth={2} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
              Stok Opname
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "160px" }}>
              {fileName}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ThemeToggle />
          <button
            onClick={onReset}
            aria-label="Ganti file"
            title="Ganti File"
            style={{
              flexShrink: 0,
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              borderRadius: "var(--radius-md)",
              background: "var(--bg-card2)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-focus)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
            }}
          >
            <RefreshCcw size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
