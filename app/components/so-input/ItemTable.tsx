"use client";
import { useCallback, memo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Flame, ShieldCheck, Minus, ChevronDown, Package, History } from "lucide-react";
import { computeStatus, computeTotal } from "../../types";
import type { SOItem } from "../../types";

interface Props {
  items: SOItem[];
  onItemChange: (rowIndex: number, field: "step1" | "step2", value: number) => void;
  filterKritis: boolean;
}

const STATUS_CONFIG = {
  kritis: {
    label: "KRITIS",
    bg: "var(--kritis-bg)",
    color: "var(--kritis)",
    border: "var(--kritis-border)",
    Icon: Flame,
  },
  hampir_habis: {
    label: "HAMPIR HABIS",
    bg: "var(--hampir-bg)",
    color: "var(--hampir)",
    border: "var(--hampir-border)",
    Icon: AlertTriangle,
  },
  aman: {
    label: "AMAN",
    bg: "var(--aman-bg)",
    color: "var(--aman)",
    border: "var(--aman-border)",
    Icon: ShieldCheck,
  },
  no_threshold: {
    label: "No Min",
    bg: "var(--muted-tag)",
    color: "var(--muted-tag-color)",
    border: "var(--muted-tag-border)",
    Icon: Minus,
  },
};

const inputBase: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "var(--radius-sm)",
  background: "var(--bg-input)",
  border: "1.5px solid var(--border)",
  color: "var(--text-primary)",
  fontSize: "14px",
  fontWeight: 700,
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

const boxBase: React.CSSProperties = {
  borderRadius: "var(--radius-sm)",
  border: "1.5px solid var(--border)",
  padding: "10px 12px",
  textAlign: "center",
  fontSize: "14px",
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums",
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
};

function displayTotal(item: SOItem): number {
  if (item.step1 > 0 || item.step2 > 0) {
    return computeTotal(item.step1, item.step2);
  }
  return computeTotal(item.oldStep1, item.oldStep2);
}

export default memo(function ItemTable({ items, onItemChange, filterKritis }: Props) {
  const handleInput = useCallback(
    (rowIndex: number, field: "step1" | "step2", raw: string) => {
      const val = parseFloat(raw) || 0;
      onItemChange(rowIndex, field, val);
    },
    [onItemChange]
  );

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "var(--border-focus)";
    e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-soft)";
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "var(--border)";
    e.currentTarget.style.boxShadow = "none";
  };

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
              const status = computeStatus(displayTotal(it), it.threshold);
              return status === "kritis" || status === "hampir_habis";
            })
          : catItems;

        if (filterKritis && visible.length === 0) return null;

        return (
          <div key={category} style={{ marginBottom: "8px" }}>
            {/* Category header */}
            <div style={{
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: 800,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              background: "var(--bg)",
              position: "sticky",
              top: "108px",
              zIndex: 5,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              <ChevronDown size={14} strokeWidth={2.5} />
              {category}
              <span style={{ color: "var(--text-muted)", opacity: 0.7, fontWeight: 600 }}>({visible.length})</span>
            </div>

            <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.03 }}>
              {visible.map((item) => {
                const total = displayTotal(item);
                const status = computeStatus(total, item.threshold);
                const cfg = STATUS_CONFIG[status];
                const Icon = cfg.Icon;

                return (
                  <motion.div
                    key={item.rowIndex}
                    variants={itemVariants}
                    whileTap={{ scale: 0.995 }}
                    style={{
                        margin: "4px 12px",
                        borderRadius: "var(--radius-lg)",
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        overflow: "hidden",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      {/* Item header row */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px 8px",
                        gap: "8px",
                      }}>
                        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{
                            flexShrink: 0,
                            width: 28,
                            height: 28,
                            borderRadius: "8px",
                            background: "var(--bg-card2)",
                            border: "1px solid var(--border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "var(--text-secondary)",
                            fontVariantNumeric: "tabular-nums",
                          }}>
                            {item.no}
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <p style={{
                              fontSize: "14px",
                              fontWeight: 700,
                              color: "var(--text-primary)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}>
                              {item.namaBarang}
                            </p>
                            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                                <Package size={11} strokeWidth={2} /> {item.satuan}
                              </span>
                              {item.threshold > 0 && (
                                <span>Min: {item.threshold}</span>
                              )}
                              {item.konversiKet && item.konversiKet !== "—" && (
                                <span>{item.konversiKet}</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Status badge */}
                        <motion.div
                          key={status}
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 24 }}
                          style={{
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "4px 10px",
                            borderRadius: "var(--radius-full)",
                            fontSize: "11px",
                            fontWeight: 800,
                            letterSpacing: "0.3px",
                            background: cfg.bg,
                            color: cfg.color,
                            border: `1px solid ${cfg.border}`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <Icon size={12} strokeWidth={2.4} />
                          {cfg.label}
                        </motion.div>
                      </div>

                      {/* Stok lama (read-only) */}
                      <div style={{
                        margin: "0 14px 10px",
                        padding: "8px 12px",
                        borderRadius: "var(--radius-sm)",
                        background: "var(--bg-card2)",
                        border: "1px dashed var(--border)",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "8px",
                        alignItems: "center",
                      }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-start" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px", display: "flex", alignItems: "center", gap: 4 }}>
                            <History size={11} strokeWidth={2.2} /> Stok Lama S1
                          </span>
                          <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>
                            {item.oldStep1}
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-start" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                            Stok Lama S2
                          </span>
                          <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>
                            {item.oldStep2}
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-end" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                            Total Lama
                          </span>
                          <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>
                            {computeTotal(item.oldStep1, item.oldStep2)}
                          </span>
                        </div>
                      </div>

                      {/* Input row */}
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 80px",
                        gap: "8px",
                        padding: "0 14px 12px",
                        alignItems: "center",
                      }}>
                        <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
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
                            style={inputBase}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                          />
                        </label>

                        <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
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
                            style={inputBase}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                          />
                        </label>

                        {/* Total */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                            Total
                          </span>
                          <motion.div
                            key={total}
                            initial={{ scale: 1.15, color: cfg.color }}
                            animate={{ scale: 1, transition: { type: "spring", stiffness: 400, damping: 20 } }}
                            style={{
                              ...boxBase,
                              background: cfg.bg,
                              borderColor: cfg.border,
                              color: cfg.color,
                              height: 40,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {total}
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
})