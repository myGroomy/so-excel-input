"use client";
import type { GasItem } from "../../types";

interface Props {
  items: GasItem[];
  onItemChange: (rowIndex: number, field: keyof GasItem, value: string | number) => void;
}

const STATUS_OPTIONS = ["Ada", "Sedikit", "Hampir Habis", "Habis", "Diisi", ""];

export default function GasTable({ items, onItemChange }: Props) {
  return (
    <div style={{ padding: "0 12px 8px" }}>
      {items.map((item) => (
        <div
          key={item.rowIndex}
          className="fade-in"
          style={{
            marginBottom: "10px",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          {/* Item name */}
          <div style={{
            padding: "10px 14px 8px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            borderBottom: "1px solid var(--border)",
          }}>
            <span style={{
              width: "24px",
              height: "24px",
              borderRadius: "6px",
              background: "var(--bg-card2)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--text-muted)",
              flexShrink: 0,
            }}>
              {item.no}
            </span>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
              {item.item}
            </p>
          </div>

          {/* Fields */}
          <div style={{ padding: "10px 14px 12px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Status */}
            <div>
              <label style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>
                Status / Qty
              </label>
              <select
                value={item.statusQty}
                onChange={(e) => onItemChange(item.rowIndex, "statusQty", e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-input)",
                  border: "1.5px solid var(--border)",
                  color: item.statusQty ? "var(--text-primary)" : "var(--text-muted)",
                  fontSize: "14px",
                  fontWeight: 500,
                  appearance: "none",
                  WebkitAppearance: "none",
                }}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt || "— Pilih status"}</option>
                ))}
                {!STATUS_OPTIONS.includes(item.statusQty) && item.statusQty && (
                  <option value={item.statusQty}>{item.statusQty}</option>
                )}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {/* Tanggal */}
              <div>
                <label style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>
                  Tanggal Isi/Pakai
                </label>
                <input
                  type="text"
                  value={item.tanggalIsiPakai}
                  placeholder="cth: 16 Agustus"
                  onChange={(e) => onItemChange(item.rowIndex, "tanggalIsiPakai", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-input)",
                    border: "1.5px solid var(--border)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>

              {/* KWH */}
              <div>
                <label style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>
                  KWH / Sisa
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={item.kwhSisa ?? ""}
                  placeholder="—"
                  onChange={(e) => onItemChange(item.rowIndex, "kwhSisa", parseFloat(e.target.value) || 0)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-input)",
                    border: "1.5px solid var(--border)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            </div>

            {/* Keterangan */}
            <div>
              <label style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "5px" }}>
                Keterangan
              </label>
              <input
                type="text"
                value={item.keterangan}
                placeholder="Catatan tambahan..."
                onChange={(e) => onItemChange(item.rowIndex, "keterangan", e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-input)",
                  border: "1.5px solid var(--border)",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
