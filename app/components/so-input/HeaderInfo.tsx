"use client";

interface Props {
  fileName: string;
  tanggal: string;
  onTanggalChange: (v: string) => void;
  namaPetugas: string;
  onNamaPetugasChange: (v: string) => void;
  onReset: () => void;
}

export default function HeaderInfo({
  fileName, tanggal, onTanggalChange, namaPetugas, onNamaPetugasChange, onReset
}: Props) {
  return (
    <div style={{
      padding: "12px 16px",
      borderBottom: "1px solid var(--border)",
      background: "var(--bg-card)",
    }}>
      {/* Top row: file name + reset */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
          <span style={{ fontSize: "18px" }}>📋</span>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
              Stok Opname
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "180px" }}>
              {fileName}
            </p>
          </div>
        </div>
        <button
          onClick={onReset}
          style={{
            flexShrink: 0,
            padding: "6px 12px",
            borderRadius: "6px",
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
            fontSize: "12px",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseOver={(e) => { (e.target as HTMLButtonElement).style.borderColor = "var(--accent)"; (e.target as HTMLButtonElement).style.color = "var(--accent)"; }}
          onMouseOut={(e) => { (e.target as HTMLButtonElement).style.borderColor = "var(--border)"; (e.target as HTMLButtonElement).style.color = "var(--text-secondary)"; }}
        >
          ↩ Ganti File
        </button>
      </div>

      {/* Date & officer */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <div>
          <label style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "4px" }}>
            Tanggal
          </label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => onTanggalChange(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: "var(--radius-sm)",
              background: "var(--bg-input)",
              border: "1.5px solid var(--border)",
              color: "var(--text-primary)",
              fontSize: "13px",
              fontWeight: 500,
              colorScheme: "dark",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>
        <div>
          <label style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "4px" }}>
            Nama Petugas
          </label>
          <input
            type="text"
            value={namaPetugas}
            placeholder="Nama kamu..."
            onChange={(e) => onNamaPetugasChange(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: "var(--radius-sm)",
              background: "var(--bg-input)",
              border: "1.5px solid var(--border)",
              color: "var(--text-primary)",
              fontSize: "13px",
              fontWeight: 500,
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>
      </div>
    </div>
  );
}
