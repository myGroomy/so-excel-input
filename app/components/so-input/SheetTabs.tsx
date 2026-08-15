"use client";
import { motion } from "framer-motion";
import { Drumstick, Snowflake, Package, Flame, LayoutGrid } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { computeStatus, computeTotal } from "../../types";
import type { SOSheet } from "../../types";

interface Props {
  sheets: SOSheet[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

const AREA_ICONS: Record<string, LucideIcon> = {
  meja_biru: Drumstick,
  freezer: Snowflake,
  meja_laci: Package,
  gas: Flame,
};

export default function SheetTabs({ sheets, activeIndex, onSelect }: Props) {
  return (
    <div style={{
      display: "flex",
      gap: "4px",
      padding: "10px 12px 0",
      overflowX: "auto",
      scrollbarWidth: "none",
      WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
    }}>
      <style>{`::-webkit-scrollbar { display: none; }`}</style>
      {sheets.map((sheet, i) => {
        const isActive = i === activeIndex;
        const Icon = AREA_ICONS[sheet.area] ?? LayoutGrid;

        let kritisCount = 0;
        if (sheet.area !== "gas") {
          for (const item of sheet.items) {
            const total = computeTotal(item.step1, item.step2);
            const status = computeStatus(total, item.threshold);
            if (status === "kritis") kritisCount++;
          }
        }

        return (
          <motion.button
            key={sheet.sheetName}
            onClick={() => onSelect(i)}
            whileTap={{ scale: 0.96 }}
            style={{
              position: "relative",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 14px",
              borderRadius: "var(--radius-md)",
              background: isActive ? "var(--accent-strong)" : "var(--bg-card)",
              color: isActive ? "var(--on-accent)" : "var(--text-secondary)",
              border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
              fontSize: "14px",
              fontWeight: isActive ? 700 : 500,
              cursor: "pointer",
              transition: "color 0.2s ease, background 0.2s ease, border-color 0.2s ease",
              whiteSpace: "nowrap",
              boxShadow: isActive ? "var(--glow-accent)" : "var(--shadow-sm)",
            }}
          >
            <Icon size={15} strokeWidth={isActive ? 2.4 : 2} style={{ position: "relative", zIndex: 1 }} />
            <span style={{ position: "relative", zIndex: 1 }}>{sheet.label}</span>
            {kritisCount > 0 && (
              <motion.span
                key={kritisCount}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
                style={{
                  position: "relative",
                  zIndex: 1,
                  padding: "1px 6px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--kritis)",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 800,
                  minWidth: "17px",
                  textAlign: "center",
                }}
              >
                {kritisCount}
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}