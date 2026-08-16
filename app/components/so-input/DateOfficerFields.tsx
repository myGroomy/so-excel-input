"use client";
import { CalendarDays, UserRound } from "lucide-react";

interface Props {
  tanggal: string;
  onTanggalChange: (v: string) => void;
  namaPetugas: string;
  onNamaPetugasChange: (v: string) => void;
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

export default function DateOfficerFields({
  tanggal, onTanggalChange, namaPetugas, onNamaPetugasChange
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
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", padding: "12px 16px 0" }}>
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
  );
}
