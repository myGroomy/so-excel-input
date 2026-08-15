"use client";
import { computeStatus, computeTotal } from "../../types";
import type { SOSheet } from "../../types";

interface Props {
  sheets: SOSheet[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

const AREA_ICONS: Record<string, string> = {
  meja_biru: "🍗",
  freezer: "❄️",
  meja_laci: "📦",
  gas: "⚡",
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

        let kritisCount = 0;
        if (sheet.area !== "gas") {
          for (const item of sheet.items) {
            const total = computeTotal(item.step1, item.step2);
            const status = computeStatus(total, item.threshold);
            if (status === "kritis") kritisCount++;
          }
        }

        return (
          <button
            key={sheet.sheetName}
            onClick={() => onSelect(i)}
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "var(--radius-sm)",
              background: isActive ? "var(--accent)" : "var(--bg-card)",
              color: isActive ? "white" : "var(--text-secondary)",
              border: isActive ? "none" : "1px solid var(--border)",
              fontSize: "13px",
              fontWeight: isActive ? 600 : 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
              position: "relative",
              whiteSpace: "nowrap",
            }}
          >
            <span>{AREA_ICONS[sheet.area] ?? "📋"}</span>
            <span>{sheet.label}</span>
            {kritisCount > 0 && (
              <span style={{
                padding: "2px 6px",
                borderRadius: "10px",
                background: isActive ? "rgba(255,255,255,0.25)" : "var(--kritis)",
                color: isActive ? "white" : "white",
                fontSize: "10px",
                fontWeight: 700,
                minWidth: "18px",
                textAlign: "center",
              }}>
                {kritisCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
