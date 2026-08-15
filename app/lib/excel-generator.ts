"use client";
import * as XLSX from "xlsx";
import type { SOSheet } from "../types";

export function generateSOExcel(
  originalBuffer: ArrayBuffer,
  sheets: SOSheet[],
  tanggal: Date,
  officerNames: Record<string, string>
): Blob {
  // Load the original workbook preserving everything
  const wb = XLSX.read(originalBuffer, {
    type: "array",
    cellFormula: true,
    cellStyles: true,
    cellDates: true,
  });

  for (const sheet of sheets) {
    const ws = wb.Sheets[sheet.sheetName];
    if (!ws) continue;

    if (sheet.area === "gas") {
      // Update Gas sheet cells
      if (sheet.gasItems) {
        for (const gi of sheet.gasItems) {
          const row = gi.rowIndex;
          setCellValue(ws, `C${row}`, gi.statusQty);
          setCellValue(ws, `D${row}`, gi.tanggalIsiPakai);
          if (gi.kwhSisa !== null && gi.kwhSisa !== "") {
            setCellValue(ws, `E${row}`, gi.kwhSisa);
          }
          setCellValue(ws, `F${row}`, gi.keterangan);
        }
      }
      // Update date
      setCellValue(ws, "C2", tanggal);
    } else {
      // Update SO sheet
      for (const item of sheet.items) {
        const row = item.rowIndex;
        setCellValue(ws, `C${row}`, item.step1);
        setCellValue(ws, `D${row}`, item.step2);
      }
      // Update date (C2) and petugas (K2)
      setCellValue(ws, "C2", tanggal);
      const petugas = officerNames[sheet.sheetName] ?? sheet.namaPetugas;
      setCellValue(ws, "K2", petugas);
    }
  }

  // Write to buffer
  const out = XLSX.write(wb, { type: "array", bookType: "xlsx", cellStyles: true });
  return new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

function setCellValue(ws: XLSX.WorkSheet, addr: string, value: unknown) {
  const cell = ws[addr];
  if (cell) {
    // Preserve existing cell type/format, just update value
    if (value instanceof Date) {
      cell.v = value;
      cell.t = "d";
    } else if (typeof value === "number") {
      cell.v = value;
      cell.t = "n";
    } else {
      cell.v = String(value ?? "");
      cell.t = "s";
    }
    // Remove formula to prevent it from overriding our value
    // (only for input cells, not formula cells)
    if (cell.f && !cell.f.includes("IF") && !cell.f.includes("SUM")) {
      delete cell.f;
    }
  } else {
    // Cell doesn't exist yet, create it
    const newCell: XLSX.CellObject = {
      v: value instanceof Date ? value : typeof value === "number" ? value : String(value ?? ""),
      t: value instanceof Date ? "d" : typeof value === "number" ? "n" : "s",
    };
    ws[addr] = newCell;
    // Update sheet range
    const range = XLSX.utils.decode_range(ws["!ref"] ?? "A1:A1");
    const cellRef = XLSX.utils.decode_cell(addr);
    if (cellRef.r < range.s.r) range.s.r = cellRef.r;
    if (cellRef.c < range.s.c) range.s.c = cellRef.c;
    if (cellRef.r > range.e.r) range.e.r = cellRef.r;
    if (cellRef.c > range.e.c) range.e.c = cellRef.c;
    ws["!ref"] = XLSX.utils.encode_range(range);
  }
}
