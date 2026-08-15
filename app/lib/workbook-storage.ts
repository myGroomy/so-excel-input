"use client";
import type { SOWorkbook, SOSheet } from "../types";

const STORAGE_KEY = "so-excel-workbook-v1";

interface PersistedState {
  fileName: string;
  tanggal: string;
  namaPetugas: string;
  activeTab: number;
  filterKritis: boolean;
  sheets: SOSheet[];
  originalB64: string;
  savedAt: number;
}

function bufToB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

function b64ToBuf(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

export function saveWorkbookState(
  workbook: SOWorkbook,
  state: {
    fileName: string;
    tanggal: string;
    namaPetugas: string;
    activeTab: number;
    filterKritis: boolean;
    sheets: SOSheet[];
  }
): void {
  try {
    const payload: PersistedState = {
      ...state,
      originalB64: bufToB64(workbook.originalBuffer),
      savedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    // Quota exceeded or storage unavailable — degrade gracefully.
    console.error("Gagal menyimpan ke localStorage:", err);
  }
}

export interface LoadedWorkbookState extends Omit<PersistedState, "originalB64" | "savedAt"> {
  workbook: SOWorkbook;
}

export function loadWorkbookState(): LoadedWorkbookState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as PersistedState;
    if (!data.originalB64 || !Array.isArray(data.sheets)) return null;
    const workbook: SOWorkbook = {
      originalBuffer: b64ToBuf(data.originalB64),
      tanggal: data.tanggal ? new Date(data.tanggal) : null,
      sheets: data.sheets,
    };
    return {
      fileName: data.fileName,
      tanggal: data.tanggal,
      namaPetugas: data.namaPetugas,
      activeTab: data.activeTab,
      filterKritis: data.filterKritis,
      sheets: data.sheets,
      workbook,
    };
  } catch (err) {
    console.error("Gagal memuat dari localStorage:", err);
    return null;
  }
}

export function clearWorkbookState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("Gagal menghapus localStorage:", err);
  }
}