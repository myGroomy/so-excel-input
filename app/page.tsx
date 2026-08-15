"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { parseSOWorkbook } from "./lib/excel-parser";
import { generateSOExcel } from "./lib/excel-generator";
import type { SOWorkbook, SOSheet, GasItem } from "./types";
import UploadZone from "./components/so-input/UploadZone";
import HeaderInfo from "./components/so-input/HeaderInfo";
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
        sheet.items = sheet.items.map((item) =>
          item.rowIndex === rowIndex ? { ...item, [field]: value } : item
        );
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
    setWorkbook(null);
    setSheets([]);
    setFileName("");
    setActiveTab(0);
  }, []);

  const activeSheet = sheets[activeTab];

  // Count total items across all sheets
  const totalItems = sheets.reduce((acc, s) => acc + (s.area !== "gas" ? s.items.length : (s.gasItems?.length ?? 0)), 0);

  return (
    <main style={{
      maxWidth: "520px",
      margin: "0 auto",
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      paddingTop: "env(safe-area-inset-top)",
    }}>
      <AnimatePresence mode="wait">
        {!workbook ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ padding: "20px 0 0" }}
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
            <div style={{ position: "sticky", top: 0, zIndex: 50 }}>
              <HeaderInfo
                fileName={fileName}
                tanggal={tanggal}
                onTanggalChange={setTanggal}
                namaPetugas={namaPetugas}
                onNamaPetugasChange={setNamaPetugas}
                onReset={handleReset}
              />

              {/* Filter bar + tab */}
              <div style={{
                padding: "8px 16px 0",
                background: "var(--bg-elevated)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px", flex: 1 }}>
                  <FileSpreadsheet size={13} strokeWidth={2} style={{ color: "var(--text-muted)" }} />
                  <motion.span
                    key={totalItems}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}
                  >
                    {totalItems} item terdeteksi
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

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: "auto", paddingBottom: "190px" }}>
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