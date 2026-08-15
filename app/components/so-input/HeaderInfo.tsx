"use client";
import { FileSpreadsheet, RefreshCcw, CalendarDays, UserRound } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface Props {
  fileName: string;
  tanggal: string;
  onTanggalChange: (v: string) => void;
  namaPetugas: string;
  onNamaPetugasChange: (v: string) => void;
  onReset: () => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "var(--radius-sm)",
  background: "var(--bg-input)",
  border: "1.5px solid var(--border)",
  color: "var(--text-primary)",
  fontSize: "14px",
  fontWeight: 600,
  transition: "border-color 0.15s, box-shadow 0.15s",
};

export default function HeaderInfo({
  fileName, tanggal, onTanggalChange, namaPetugas, onNamaPetugasChange, onReset
}: Props) {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "var(--border-focus)";
    e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-soft)";
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "var(--border)";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div style={{
      padding: "12px 16px",
      borderBottom: "1px solid var(--border)",
      background: "var(--bg-elevated)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
    }}>
      {/* Top row: file name + actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", gap: 8 }}>
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

      {/* Date & officer */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <div>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px", display: "flex", alignItems: "center", gap: 4, marginBottom: "5px" }}>
            <CalendarDays size={13} strokeWidth={2} /> Tanggal
          </label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => onTanggalChange(e.target.value)}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
        <div>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px", display: "flex", alignItems: "center", gap: 4, marginBottom: "5px" }}>
            <UserRound size={13} strokeWidth={2} /> Petugas
          </label>
          <input
            type="text"
            value={namaPetugas}
            placeholder="Nama kamu..."
            onChange={(e) => onNamaPetugasChange(e.target.value)}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      </div>
    </div>
  );
}