"use client";
import { useState, useCallback, useRef, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { parseSOWorkbook } from "./lib/excel-parser";
import { generateSOExcel } from "./lib/excel-generator";
import { saveWorkbookState, loadWorkbookState, clearWorkbookState } from "./lib/workbook-storage";
import type { SOWorkbook, SOSheet, GasItem } from "./types";
import UploadZone from "./components/so-input/UploadZone";
import HeaderInfo from "./components/so-input/HeaderInfo";
import DateOfficerFields from "./components/so-input/DateOfficerFields";
import SheetTabs from "./components/so-input/SheetTabs";
import ItemTable from "./components/so-input/ItemTable";
import GasTable from "./components/so-input/GasTable";
import StickyFooter from "./components/so-input/StickyFooter";

function formatDateISO(d: Date | null): string {
  if (!d) {
    const now = new Date();
    return now.toISOString().split("T")[0];
  }
  return d.toISOString().split("T")[0];
}

function generateFileName(tanggal: string, namaPetugas: string): string {
  const d = tanggal || new Date().toISOString().split("T")[0];
  const name = namaPetugas ? `_${namaPetugas.replace(/\s+/g, "_")}` : "";
  return `SO_${d}${name}.xlsx`;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [workbook, setWorkbook] = useState<SOWorkbook | null>(null);
  const [fileName, setFileName] = useState("");
  const [sheets, setSheets] = useState<SOSheet[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [tanggal, setTanggal] = useState("");
  const [namaPetugas, setNamaPetugas] = useState("");
  const [filterKritis, setFilterKritis] = useState(false);
  const [generating, setGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const collapseRef = useRef<HTMLDivElement>(null);
  const collapseHeight = useRef(0);
  const lastScrollY = useRef(0);
  const scrollTicking = useRef(false);
  const [hydrated, setHydrated] = useState(false);

  // Restore previously saved work in progress on mount.
  useEffect(() => {
    const id = setTimeout(() => {
      const saved = loadWorkbookState();
      if (saved) {
        setWorkbook(saved.workbook);
        setFileName(saved.fileName);
        setSheets(saved.sheets);
        setTanggal(saved.tanggal);
        setNamaPetugas(saved.namaPetugas);
        setActiveTab(saved.activeTab);
        setFilterKritis(saved.filterKritis);
      }
      setHydrated(true);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  // Auto-save whenever the work-in-progress changes.
  useEffect(() => {
    if (!hydrated || !workbook) return;
    const timer = setTimeout(() => {
      saveWorkbookState(workbook, {
        fileName,
        tanggal,
        namaPetugas,
        activeTab,
        filterKritis,
        sheets,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [hydrated, workbook, sheets, fileName, tanggal, namaPetugas, activeTab, filterKritis]);

  const handleScroll = useCallback(() => {
    if (scrollTicking.current) return;
    scrollTicking.current = true;
    requestAnimationFrame(() => {
      scrollTicking.current = false;
      const el = scrollRef.current;
      if (!el) return;
      const current = el.scrollTop;
      // Hide the collapsible header section (date/officer + filter + tabs) when
      // scrolling down; keep the logo row always visible and show the section
      // again when scrolling up.
      if (collapseRef.current) {
        if (current > lastScrollY.current && current > 24) {
          if (collapseRef.current.style.height !== "0px") {
            collapseRef.current.style.height = "0px";
          }
        } else if (current < lastScrollY.current || current <= 24) {
          if (collapseRef.current.style.height !== collapseHeight.current + "px") {
            collapseRef.current.style.height = collapseHeight.current + "px";
          }
        }
      }
      lastScrollY.current = current;
    });
  }, []);

  // Measure the real collapsible-section height so collapse/expand is
  // pixel-accurate. Only re-measure when the section is expanded, otherwise a
  // collapsed height of 0px would overwrite the stored height and the section
  // would never be able to expand again.
  useLayoutEffect(() => {
    const el = collapseRef.current;
    if (!el) return;
    const collapsed = el.style.height === "0px";
    if (!collapsed) {
      collapseHeight.current = el.offsetHeight;
    }
    el.style.height = collapseHeight.current + "px";
  }, [workbook, hydrated, activeTab]);

  const handleFile = useCallback(async (buffer: ArrayBuffer, name: string) => {
    setLoading(true);
    try {
      const wb = await parseSOWorkbook(buffer);
      setWorkbook(wb);
      setFileName(name);
      setSheets(wb.sheets);
      setTanggal(formatDateISO(wb.tanggal));
      // Get petugas from first non-gas sheet
      const firstSO = wb.sheets.find((s) => s.area !== "gas");
      setNamaPetugas(firstSO?.namaPetugas ?? "");
      setActiveTab(0);
    } catch (err) {
      console.error(err);
      alert("Gagal membaca file Excel. Pastikan file adalah template SO yang benar.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleItemChange = useCallback(
    (sheetIndex: number, rowIndex: number, field: "step1" | "step2", value: number) => {
      setSheets((prev) => {
        const next = [...prev];
        const sheet = { ...next[sheetIndex] };
        sheet.items = sheet.items.map((item) => {
          if (item.rowIndex !== rowIndex) return item;
          return field === "step1"
            ? { ...item, step1: value, step1Touched: true }
            : { ...item, step2: value, step2Touched: true };
        });
        next[sheetIndex] = sheet;
        return next;
      });
    },
    []
  );

  const handleGasItemChange = useCallback(
    (sheetIndex: number, rowIndex: number, field: keyof GasItem, value: string | number) => {
      setSheets((prev) => {
        const next = [...prev];
        const sheet = { ...next[sheetIndex] };
        sheet.gasItems = (sheet.gasItems ?? []).map((item) =>
          item.rowIndex === rowIndex ? { ...item, [field]: value } : item
        );
        next[sheetIndex] = sheet;
        return next;
      });
    },
    []
  );

  const handleGenerate = useCallback(async () => {
    if (!workbook) return;
    setGenerating(true);
    try {
      const d = new Date(tanggal);
      const officerNames: Record<string, string> = {};
      for (const sheet of sheets) {
        if (sheet.area !== "gas") officerNames[sheet.sheetName] = namaPetugas;
      }

      const blob = generateSOExcel(workbook.originalBuffer, sheets, d, officerNames);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = generateFileName(tanggal, namaPetugas);
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Gagal generate Excel. Coba lagi.");
    } finally {
      setGenerating(false);
    }
  }, [workbook, sheets, tanggal, namaPetugas]);

  const handleReset = useCallback(() => {
    clearWorkbookState();
    setWorkbook(null);
    setSheets([]);
    setFileName("");
    setActiveTab(0);
  }, []);

  const activeSheet = sheets[activeTab];

  // Count items across all sheets. Template is fixed, so the count is
  // deterministic: SO items (Step 1 & 2) plus gas items, shown separately.
  const soItems = sheets.reduce((acc, s) => acc + (s.area !== "gas" ? s.items.length : 0), 0);
  const gasItemsCount = sheets.reduce((acc, s) => acc + (s.area === "gas" ? (s.gasItems?.length ?? 0) : 0), 0);
  const totalItems = soItems + gasItemsCount;

  return (
    <main style={{
      maxWidth: "520px",
      margin: "0 auto",
      height: "100dvh",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      paddingTop: "env(safe-area-inset-top)",
    }}>
      <AnimatePresence mode="wait">
        {!hydrated ? (
          <motion.div
            key="restoring"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "60dvh",
              fontSize: "14px",
              color: "var(--text-muted)",
            }}
          >
            Memulihkan data…
          </motion.div>
        ) : !workbook ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ padding: "20px 0 0", overflowY: "auto", flex: 1 }}
          >
            <UploadZone onFile={handleFile} loading={loading} />
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
            style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: "0" }}
          >
            {/* Sticky top */}
            <div
              ref={headerRef}
              style={{
                position: "sticky",
                top: 0,
                zIndex: 50,
                background: "var(--bg-elevated)",
              }}
            >
              <HeaderInfo
                fileName={fileName}
                onReset={handleReset}
              />

              {/* Collapsible section: date/officer + filter + tabs (hides on scroll down) */}
              <div
                ref={collapseRef}
                style={{
                  overflow: "hidden",
                  willChange: "height",
                  transition: "height 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
                  background: "var(--bg-elevated)",
                }}
              >
                <DateOfficerFields
                  tanggal={tanggal}
                  onTanggalChange={setTanggal}
                  namaPetugas={namaPetugas}
                  onNamaPetugasChange={setNamaPetugas}
                />

                {/* Filter bar + tab */}
                <div style={{
                  padding: "8px 16px 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", flex: 1, flexWrap: "wrap" }}>
                    <FileSpreadsheet size={13} strokeWidth={2} style={{ color: "var(--text-muted)" }} />
                    <motion.span
                      key={totalItems}
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}
                    >
                      {soItems} stok + {gasItemsCount} gas
                    </motion.span>
                    {filterKritis && (
                      <motion.span
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "var(--kritis)",
                          background: "var(--kritis-bg)",
                          border: "1px solid var(--kritis-border)",
                          padding: "2px 8px",
                          borderRadius: "var(--radius-full)",
                        }}
                      >
                        <CheckCircle2 size={11} strokeWidth={2.5} />
                        Filter aktif
                      </motion.span>
                    )}
                  </div>
                </div>

                <SheetTabs sheets={sheets} activeIndex={activeTab} onSelect={setActiveTab} />

                <div style={{ height: "8px" }} />
              </div>
            </div>

            {/* Scrollable content */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              style={{ flex: 1, overflowY: "auto", paddingBottom: "190px" }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  {activeSheet ? (
                    activeSheet.area === "gas" ? (
                      <GasTable
                        items={activeSheet.gasItems ?? []}
                        onItemChange={(rowIndex, field, value) =>
                          handleGasItemChange(activeTab, rowIndex, field, value)
                        }
                      />
                    ) : (
                      <ItemTable
                        items={activeSheet.items}
                        onItemChange={(rowIndex, field, value) =>
                          handleItemChange(activeTab, rowIndex, field, value)
                        }
                        filterKritis={filterKritis}
                      />
                    )
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Sticky footer */}
            <StickyFooter
              sheets={sheets}
              onGenerate={handleGenerate}
              generating={generating}
              filterKritis={filterKritis}
              onToggleFilter={() => setFilterKritis((v) => !v)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}