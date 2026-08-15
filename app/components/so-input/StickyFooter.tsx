"use client";
import { computeStatus, computeTotal } from "../../types";
import type { SOSheet } from "../../types";

interface Props {
  sheets: SOSheet[];
  onGenerate: () => void;
  generating: boolean;
  filterKritis: boolean;
  onToggleFilter: () => void;
}

export default function StickyFooter({ sheets, onGenerate, generating, filterKritis, onToggleFilter }: Props) {
  let totalKritis = 0;
  let totalHampir = 0;
  let totalAman = 0;

  for (const sheet of sheets) {
    if (sheet.area === "gas") continue;
    for (const item of sheet.items) {
      const total = computeTotal(item.step1, item.step2);
      const status = computeStatus(total, item.threshold);
      if (status === "kritis") totalKritis++;
      else if (status === "hampir_habis") totalHampir++;
      else if (status === "aman") totalAman++;
    }
  }

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: "var(--bg-card)",
      borderTop: "1px solid var(--border)",
      padding: "12px 16px",
      paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
    }}>
      {/* Status counts */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "10px", justifyContent: "center" }}>
        {[
          { count: totalKritis, label: "Kritis", bg: "var(--kritis-bg)", color: "var(--kritis)", border: "#3d1515" },
          { count: totalHampir, label: "Hampir Habis", bg: "var(--hampir-bg)", color: "var(--hampir)", border: "#3d2209" },
          { count: totalAman, label: "Aman", bg: "var(--aman-bg)", color: "var(--aman)", border: "#0d3a08" },
        ].map(({ count, label, bg, color, border }) => (
          <div key={label} style={{
            flex: 1,
            padding: "8px",
            borderRadius: "var(--radius-sm)",
            background: bg,
            border: `1px solid ${border}`,
            textAlign: "center",
          }}>
            <div style={{ fontSize: "18px", fontWeight: 700, color }}>{count}</div>
            <div style={{ fontSize: "10px", color, opacity: 0.8, fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={onToggleFilter}
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-sm)",
            background: filterKritis ? "rgba(255,77,79,0.15)" : "var(--bg-card2)",
            border: filterKritis ? "1.5px solid #3d1515" : "1.5px solid var(--border)",
            color: filterKritis ? "var(--kritis)" : "var(--text-secondary)",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
            whiteSpace: "nowrap",
          }}
        >
          {filterKritis ? "🔴 Kritis" : "☰ Semua"}
        </button>
        <button
          onClick={onGenerate}
          disabled={generating}
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "var(--radius-sm)",
            background: generating ? "var(--bg-card2)" : "var(--accent)",
            color: generating ? "var(--text-muted)" : "white",
            border: "none",
            fontSize: "14px",
            fontWeight: 700,
            cursor: generating ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            letterSpacing: "0.2px",
          }}
          onMouseOver={(e) => { if (!generating) (e.target as HTMLButtonElement).style.background = "var(--accent-hover)"; }}
          onMouseOut={(e) => { if (!generating) (e.target as HTMLButtonElement).style.background = "var(--accent)"; }}
        >
          {generating ? "⏳ Generating..." : "📥 Download Excel"}
        </button>
      </div>
    </div>
  );
}
