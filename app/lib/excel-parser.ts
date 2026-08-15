"use client";
import * as XLSX from "xlsx";
import type { SOWorkbook, SOSheet, SOItem, GasItem } from "../types";

const SHEET_MAP: Record<string, { area: SOSheet["area"]; label: string }> = {
  "Meja Biru + Chiller": { area: "meja_biru", label: "Meja Biru + Chiller" },
  "Freezer & Alat": { area: "freezer", label: "Freezer & Alat" },
  "Meja Laci (2)": { area: "meja_laci", label: "Meja Laci" },
  "Gas & Utilitas": { area: "gas", label: "Gas & Utilitas" },
};

function safeNum(val: unknown): number {
  if (val === null || val === undefined || val === "") return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function safeStr(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val).trim();
}

function parseDate(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  // SheetJS may give us a serial number
  if (typeof val === "number") {
    return XLSX.SSF.parse_date_code ? null : new Date();
  }
  const d = new Date(val as string);
  return isNaN(d.getTime()) ? null : d;
}

function parseSOSheet(ws: XLSX.WorkSheet, sheetName: string): SOSheet {
  const { area, label } = SHEET_MAP[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    defval: null,
    raw: true,
  }) as unknown[][];

  // Row 2 (index 1) has: [TANGGAL/HARI, null, date, null, HARI, null, dayname, null, NAMA PETUGAS, null, name]
  const tanggal = parseDate(rows[1]?.[2]);
  const namaPetugas = safeStr(rows[1]?.[10]);

  const items: SOItem[] = [];
  let currentCategory = "";

  // Data starts at row 5 (index 4) for SO sheets (after header rows 1-4)
  for (let i = 4; i < rows.length; i++) {
    const row = rows[i] as unknown[];
    const col0 = row[0]; // No or formula
    const col1 = row[1]; // Nama Barang
    const col2 = row[2]; // Step 1
    const col3 = row[3]; // Step 2
    const col4 = row[4]; // Satuan
    const col6 = row[6]; // Konversi Qty
    const col7 = row[7]; // Konversi Ket
    const col8 = row[8]; // Threshold

    // Category header row (e.g. ▶  MEJA BIRU DEPAN)
    if (typeof col1 === "string" && col1.startsWith("▶")) {
      currentCategory = col1.replace("▶", "").trim();
      continue;
    }

    // Skip if no item name
    if (!col1 || typeof col1 !== "string" || col1 === "NAMA BARANG") continue;

    // Skip rows that look like header
    if (col1 === "NAMA BARANG") continue;

    const step1Raw = col2;
    const step2Raw = col3;

    // Handle formula strings like =240 or =2329 - extract the number
    let step1 = 0;
    let step2 = 0;
    if (typeof step1Raw === "string" && step1Raw.startsWith("=")) {
      const match = step1Raw.match(/=(\d+(\.\d+)?)/);
      step1 = match ? parseFloat(match[1]) : 0;
    } else {
      step1 = safeNum(step1Raw);
    }
    if (typeof step2Raw === "string" && step2Raw.startsWith("=")) {
      const match = step2Raw.match(/=(\d+(\.\d+)?)/);
      step2 = match ? parseFloat(match[1]) : 0;
    } else {
      step2 = safeNum(step2Raw);
    }

    let threshold = 0;
    if (typeof col8 === "string" && col8.includes("Master Threshold")) {
      threshold = 0; // will remain 0 since we can't resolve cross-sheet refs statically
    } else if (typeof col8 === "string" && col8.startsWith("=")) {
      const match = col8.match(/=(\d+)/);
      threshold = match ? parseFloat(match[1]) : 0;
    } else {
      threshold = safeNum(col8);
    }

    items.push({
      rowIndex: i + 1, // 1-based
      no: typeof col0 === "number" ? col0 : i - 3,
      namaBarang: col1,
      step1: 0,
      step2: 0,
      oldStep1: step1,
      oldStep2: step2,
      satuan: safeStr(col4).replace(/-\+/g, "").trim(),
      konversiQty: col6 !== null ? safeNum(col6) : null,
      konversiKet: safeStr(col7) || null,
      threshold,
      category: currentCategory,
    });
  }

  return { sheetName, area, label, tanggal, namaPetugas, items };
}

function parseGasSheet(ws: XLSX.WorkSheet, sheetName: string): SOSheet {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    defval: null,
    raw: true,
  }) as unknown[][];

  const tanggal = parseDate(rows[1]?.[2]);

  const gasItems: GasItem[] = [];
  // Data starts at row 4 (index 3)
  for (let i = 3; i < rows.length; i++) {
    const row = rows[i] as unknown[];
    if (!row[1]) continue;
    gasItems.push({
      rowIndex: i + 1,
      no: safeStr(row[0]),
      item: safeStr(row[1]),
      statusQty: safeStr(row[2]),
      tanggalIsiPakai: safeStr(row[3]),
      kwhSisa: row[4] !== null ? safeNum(row[4]) : null,
      keterangan: safeStr(row[5]),
    });
  }

  return {
    sheetName,
    area: "gas",
    label: "Gas & Utilitas",
    tanggal,
    namaPetugas: "",
    items: [],
    gasItems,
  };
}

export async function parseSOWorkbook(buffer: ArrayBuffer): Promise<SOWorkbook> {
  const wb = XLSX.read(buffer, { type: "array", cellFormula: true, cellDates: true });

  const sheets: SOSheet[] = [];

  for (const [sheetName, meta] of Object.entries(SHEET_MAP)) {
    if (!wb.SheetNames.includes(sheetName)) continue;
    const ws = wb.Sheets[sheetName];
    if (meta.area === "gas") {
      sheets.push(parseGasSheet(ws, sheetName));
    } else {
      sheets.push(parseSOSheet(ws, sheetName));
    }
  }

  // Get global date from first SO sheet
  const tanggal = sheets.find((s) => s.area !== "gas")?.tanggal ?? null;

  return { originalBuffer: buffer, tanggal, sheets };
}
