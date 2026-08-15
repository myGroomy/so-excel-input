// Types for Stock Opname Excel Input App

export interface SOItem {
  rowIndex: number;
  no: number | string;
  namaBarang: string;
  step1: number;
  step2: number;
  step1Touched: boolean;
  step2Touched: boolean;
  oldStep1: number;
  oldStep2: number;
  satuan: string;
  konversiQty: number | null;
  konversiKet: string | null;
  threshold: number;
  category: string;
  total?: number;
  status?: "kritis" | "hampir_habis" | "aman" | "no_threshold";
}

export interface GasItem {
  rowIndex: number;
  no: string;
  item: string;
  statusQty: string;
  tanggalIsiPakai: string;
  kwhSisa: number | string | null;
  keterangan: string;
}

export interface SOSheet {
  sheetName: string;
  area: "meja_biru" | "freezer" | "meja_laci" | "gas";
  label: string;
  tanggal: Date | null;
  namaPetugas: string;
  items: SOItem[];
  gasItems?: GasItem[];
}

export interface SOWorkbook {
  originalBuffer: ArrayBuffer;
  tanggal: Date | null;
  sheets: SOSheet[];
}

export type StatusType = "kritis" | "hampir_habis" | "aman" | "no_threshold";

export function computeStatus(total: number, threshold: number): StatusType {
  if (threshold === 0) return "no_threshold";
  if (total <= threshold) return "kritis";
  if (total <= threshold * 2) return "hampir_habis";
  return "aman";
}

export function computeTotal(step1: number, step2: number): number {
  return (step1 || 0) + (step2 || 0);
}
