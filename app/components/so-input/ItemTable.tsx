"use client";
import { useCallback } from "react";
import { computeStatus, computeTotal } from "../../types";
import type { SOItem } from "../../types";

interface Props {
  items: SOItem[];
  onItemChange: (rowIndex: number, field: "step1" | "step2", value: number) => void;
  filterKritis: boolean;
}

const STATUS_CONFIG = {
  kritis: { label: "🔴 KRITIS", bg: "var(--kritis-bg)", color: "var(--kritis)", border: "#3d1515" },
  hampir_habis: { label: "🟠 HAMPIR HABIS", bg: "var(--hampir-bg)", color: "var(--hampir)", border: "#3d2209" },
  aman: { label: "🟢 AMAN", bg: "var(--aman-bg)", color: "var(--aman)", border: "#0d3a08" },
  no_threshold: { label: "— No Min", bg: "var(--bg-card2)", color: "var(--text-muted)", border: "var(--border)" },
};

export default function ItemTable({ items, onItemChange, filterKritis }: Props) {
  const handleInput = useCallback(
    (rowIndex: number, field: "step1" | "step2", raw: string) => {
      const val = parseFloat(raw) || 0;
      onItemChange(rowIndex, field, val);
    },
    [onItemChange]
  );

  // Group by category
  const grouped: Record<string, SOItem[]> = {};
  for (const item of items) {
    const cat = item.category || "Umum";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  return (
    <div style={{ paddingBottom: "8px" }}>
      {Object.entries(grouped).map(([category, catItems]) => {
        const visible = filterKritis
          ? catItems.filter((it) => {
              const total = computeTotal(it.step1, it.step2);
              const status = computeStatus(total, it.threshold);
              return status === "kritis" || status === "hampir_habis";
            })
          : catItems;

        if (filterKritis && visible.length === 0) return null;

        return (
          <div key={category} style={{ marginBottom: "8px" }}>
            {/* Category header */}
            <div style={{
              padding: "8px 16px",
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              background: "var(--bg)",
              position: "sticky",
              top: "108px",
              zIndex: 5,
            }}>
              ▶ {category}
            </div>

            {visible.map((item) => {
              const total = computeTotal(item.step1, item.step2);
              const status = computeStatus(total, item.threshold);
              const cfg = STATUS_CONFIG[status];

              return (
                <div
                  key={item.rowIndex}
                  className="fade-in"
                  style={{
                    margin: "4px 12px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-card)",
                    border: `1px solid var(--border)`,
                    overflow: "hidden",
                  }}
                >
                  {/* Item header row */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px 6px",
                    gap: "8px",
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>
                        {item.namaBarang}
                      </p>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>
                        {item.satuan}
                        {item.threshold > 0 && <span style={{ marginLeft: "8px" }}>Min: {item.threshold}</span>}
                        {item.konversiKet && item.konversiKet !== "—" && (
                          <span style={{ marginLeft: "8px", color: "var(--text-muted)" }}>{item.konversiKet}</span>
                        )}
                      </p>
                    </div>

                    {/* Status badge */}
                    <div style={{
                      flexShrink: 0,
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: 700,
                      background: cfg.bg,
                      color: cfg.color,
                      border: `1px solid ${cfg.border}`,
                      whiteSpace: "nowrap",
                    }}>
                      {cfg.label}
                    </div>
                  </div>

                  {/* Input row */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 80px",
                    gap: "8px",
                    padding: "8px 14px 12px",
                    alignItems: "center",
                  }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Step 1 (Utuh)
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        inputMode="decimal"
                        value={item.step1 === 0 ? "" : item.step1}
                        placeholder="0"
                        onChange={(e) => handleInput(item.rowIndex, "step1", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "var(--radius-sm)",
                          background: "var(--bg-input)",
                          border: "1.5px solid var(--border)",
                          color: "var(--text-primary)",
                          fontSize: "16px",
                          fontWeight: 600,
                          outline: "none",
                          transition: "border-color 0.15s",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                      />
                    </label>

                    <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Step 2 (Terbuka)
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        inputMode="decimal"
                        value={item.step2 === 0 ? "" : item.step2}
                        placeholder="0"
                        onChange={(e) => handleInput(item.rowIndex, "step2", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "var(--radius-sm)",
                          background: "var(--bg-input)",
                          border: "1.5px solid var(--border)",
                          color: "var(--text-primary)",
                          fontSize: "16px",
                          fontWeight: 600,
                          outline: "none",
                          transition: "border-color 0.15s",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                      />
                    </label>

                    {/* Total */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Total
                      </span>
                      <div style={{
                        padding: "10px 12px",
                        borderRadius: "var(--radius-sm)",
                        background: cfg.bg,
                        border: `1.5px solid ${cfg.border}`,
                        color: cfg.color,
                        fontSize: "16px",
                        fontWeight: 700,
                        textAlign: "center",
                      }}>
                        {total}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
