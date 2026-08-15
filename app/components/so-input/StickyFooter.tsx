"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, AlertTriangle, ShieldCheck, Download, Loader2, ListFilter } from "lucide-react";
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

  const counts = [
    { count: totalKritis, label: "Kritis", bg: "var(--kritis-bg)", color: "var(--kritis)", border: "var(--kritis-border)", Icon: Flame },
    { count: totalHampir, label: "Hampir", bg: "var(--hampir-bg)", color: "var(--hampir)", border: "var(--hampir-border)", Icon: AlertTriangle },
    { count: totalAman, label: "Aman", bg: "var(--aman-bg)", color: "var(--aman)", border: "var(--aman-border)", Icon: ShieldCheck },
  ];

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: "var(--bg-elevated)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      borderTop: "1px solid var(--border)",
      padding: "12px 16px",
      paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
    }}>
      {/* Status counts */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
        {counts.map(({ count, label, bg, color, border, Icon }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            style={{
              flex: 1,
              padding: "7px 8px",
              borderRadius: "var(--radius-md)",
              background: bg,
              border: `1px solid ${border}`,
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <Icon size={14} strokeWidth={2.4} />
              <AnimatePresence mode="wait">
                <motion.span
                  key={count}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 8, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ fontSize: "18px", fontWeight: 800, color, fontVariantNumeric: "tabular-nums", lineHeight: 1.2 }}
                >
                  {count}
                </motion.span>
              </AnimatePresence>
            </div>
            <div style={{ fontSize: "10px", color, opacity: 0.85, fontWeight: 600, marginTop: 1 }}>{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "8px" }}>
        <motion.button
          onClick={onToggleFilter}
          whileTap={{ scale: 0.96 }}
          aria-pressed={filterKritis}
          aria-label={filterKritis ? "Tampilkan semua item" : "Tampilkan hanya item kritis"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            background: filterKritis ? "var(--kritis-bg)" : "var(--bg-card2)",
            border: filterKritis ? "1.5px solid var(--kritis-border)" : "1.5px solid var(--border)",
            color: filterKritis ? "var(--kritis)" : "var(--text-secondary)",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}
        >
          {filterKritis ? <Flame size={16} strokeWidth={2.4} /> : <ListFilter size={16} strokeWidth={2} />}
          {filterKritis ? "Kritis" : "Semua"}
        </motion.button>

        <motion.button
          onClick={onGenerate}
          disabled={generating}
          whileTap={generating ? undefined : { scale: 0.98 }}
          whileHover={generating ? undefined : { scale: 1.01 }}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "13px 12px",
            borderRadius: "var(--radius-md)",
            background: generating ? "var(--bg-card2)" : "var(--accent)",
            color: generating ? "var(--text-muted)" : "var(--on-accent)",
            border: "none",
            fontSize: "14px",
            fontWeight: 800,
            cursor: generating ? "not-allowed" : "pointer",
            transition: "background 0.2s",
            letterSpacing: "0.2px",
            boxShadow: generating ? "none" : "var(--glow-accent)",
          }}
          onMouseOver={(e) => { if (!generating) (e.currentTarget as HTMLButtonElement).style.background = "var(--accent-hover)"; }}
          onMouseOut={(e) => { if (!generating) (e.currentTarget as HTMLButtonElement).style.background = "var(--accent)"; }}
        >
          <AnimatePresence mode="wait">
            {generating ? (
              <motion.span
                key="gen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ display: "inline-flex" }}>
                  <Loader2 size={16} strokeWidth={2.4} />
                </motion.span>
                Generating...
              </motion.span>
            ) : (
              <motion.span
                key="dl"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <Download size={16} strokeWidth={2.4} />
                Download Excel
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}