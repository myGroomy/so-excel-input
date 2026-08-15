"use client";
import { motion } from "framer-motion";
import { Flame, CalendarClock, Gauge, StickyNote, ChevronDown } from "lucide-react";
import type { GasItem } from "../../types";

interface Props {
  items: GasItem[];
  onItemChange: (rowIndex: number, field: keyof GasItem, value: string | number) => void;
}

const STATUS_OPTIONS = ["Ada", "Sedikit", "Hampir Habis", "Habis", "Diisi", ""];

const fieldLabel: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 700,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.6px",
  display: "flex",
  alignItems: "center",
  gap: 5,
  marginBottom: "5px",
};

const inputBase: React.CSSProperties = {
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

export default function GasTable({ items, onItemChange }: Props) {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "var(--border-focus)";
    e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-soft)";
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "var(--border)";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <motion.div
      style={{ padding: "0 12px 8px" }}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
    >
      {items.map((item) => (
        <motion.div
          key={item.rowIndex}
          variants={{
            hidden: { opacity: 0, y: 12 },
            show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } },
          }}
          style={{
            marginBottom: "10px",
            borderRadius: "var(--radius-lg)",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            overflow: "hidden",
            boxShadow: "var(--shadow-sm)",
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
              width: 28,
              height: 28,
              borderRadius: "8px",
              background: "var(--accent-soft)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: 800,
              color: "var(--accent)",
              flexShrink: 0,
              fontVariantNumeric: "tabular-nums",
            }}>
              {item.no}
            </span>
            <Flame size={16} strokeWidth={2} style={{ color: "var(--hampir)", flexShrink: 0 }} />
            <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
              {item.item}
            </p>
          </div>

          {/* Fields */}
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Status */}
            <div>
              <label style={fieldLabel}>
                <Flame size={12} strokeWidth={2.2} /> Status / Qty
              </label>
              <div style={{ position: "relative" }}>
                <select
                  value={item.statusQty}
                  onChange={(e) => onItemChange(item.rowIndex, "statusQty", e.target.value)}
                  style={{
                    ...inputBase,
                    appearance: "none",
                    WebkitAppearance: "none",
                    color: item.statusQty ? "var(--text-primary)" : "var(--text-muted)",
                  }}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt || "— Pilih status"}</option>
                  ))}
                  {!STATUS_OPTIONS.includes(item.statusQty) && item.statusQty && (
                    <option value={item.statusQty}>{item.statusQty}</option>
                  )}
                </select>
                <ChevronDown
                  size={15}
                  strokeWidth={2}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {/* Tanggal */}
              <div>
                <label style={fieldLabel}>
                  <CalendarClock size={12} strokeWidth={2.2} /> Tgl Isi/Pakai
                </label>
                <input
                  type="text"
                  value={item.tanggalIsiPakai}
                  placeholder="cth: 16 Agustus"
                  onChange={(e) => onItemChange(item.rowIndex, "tanggalIsiPakai", e.target.value)}
                  style={inputBase}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              {/* KWH */}
              <div>
                <label style={fieldLabel}>
                  <Gauge size={12} strokeWidth={2.2} /> KWH / Sisa
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={item.kwhSisa ?? ""}
                  placeholder="—"
                  onChange={(e) => onItemChange(item.rowIndex, "kwhSisa", parseFloat(e.target.value) || 0)}
                  style={inputBase}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
            </div>

            {/* Keterangan */}
            <div>
              <label style={fieldLabel}>
                <StickyNote size={12} strokeWidth={2.2} /> Keterangan
              </label>
              <input
                type="text"
                value={item.keterangan}
                placeholder="Catatan tambahan..."
                onChange={(e) => onItemChange(item.rowIndex, "keterangan", e.target.value)}
                style={inputBase}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}