"use client";
import { unzipSync, zipSync, strFromU8, strToU8 } from "fflate";
import type { SOSheet } from "../types";

// ---------------------------------------------------------------------------
// Byte-preserving XLSX editor.
//
// XLSX.write() re-serializes the whole workbook and drops styled-but-empty
// cells, drawings, and custom column widths — breaking "identical to template".
// Instead we edit the XLSX ZIP in place: every file is kept byte-for-byte
// except the specific cells we actually change, so the downloaded workbook is
// structurally identical to the uploaded template.
// ---------------------------------------------------------------------------

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function decodeXml(s: string): string {
  return s
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&");
}

/** Map sheet name → worksheet XML path (e.g. "xl/worksheets/sheet2.xml"). */
function buildSheetMap(files: Record<string, Uint8Array>): Record<string, string> {
  const wb = strFromU8(files["xl/workbook.xml"]);
  const rels = strFromU8(files["xl/_rels/workbook.xml.rels"]);

  const nameMap: Record<string, string> = {};
  const relRe = /<sheet\b[^>]*name="([^"]*)"[^>]*r:id="(rId\d+)"/g;
  let m: RegExpExecArray | null;
  while ((m = relRe.exec(wb))) nameMap[m[2]] = decodeXml(m[1]);

  const relMap: Record<string, string> = {};
  const relRe2 = /<Relationship\b[^>]*Id="(rId\d+)"[^>]*\/worksheet"[^>]*Target="([^"]+)"/g;
  while ((m = relRe2.exec(rels))) relMap[m[1]] = m[2];

  const map: Record<string, string> = {};
  for (const [rid, name] of Object.entries(nameMap)) {
    const target = relMap[rid];
    if (target) map[name] = target.startsWith("/") ? target.slice(1) : `xl/${target}`;
  }
  return map;
}

/** Parse sharedStrings.xml into an array of decoded strings. */
function parseSharedStrings(files: Record<string, Uint8Array>): string[] {
  const path = "xl/sharedStrings.xml";
  if (!files[path]) return [];
  const xml = strFromU8(files[path]);
  const out: string[] = [];
  const siRe = /<si>([\s\S]*?)<\/si>/g;
  let m: RegExpExecArray | null;
  while ((m = siRe.exec(xml))) {
    const tRe = /<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g;
    let txt = "";
    let tm: RegExpExecArray | null;
    while ((tm = tRe.exec(m[1]))) txt += tm[1];
    out.push(decodeXml(txt));
  }
  return out;
}

/**
 * Rewrite a single cell in a sheet XML string.
 * Returns [newXml, sharedStringsXml] where sharedStringsXml may be appended to.
 */
function setCell(
  xml: string,
  addr: string,
  value:
    | { kind: "num"; v: number }
    | { kind: "date"; v: number }
    | { kind: "str"; v: string; si: number },
  sstXml: string
): { xml: string; sstXml: string } {
  const cellRe = new RegExp(`<c r="${addr}"[^>]*>[\\s\\S]*?</c>|<c r="${addr}"[^>]*/>`);
  const existing = xml.match(cellRe);
  const sAttr = existing ? (existing[0].match(/ s="[^"]*"/) || [""])[0] : "";

  let cell: string;
  if (value.kind === "num" || value.kind === "date") {
    cell = `<c r="${addr}"${sAttr}><v>${value.v}</v></c>`;
  } else {
    cell = `<c r="${addr}"${sAttr} t="s"><v>${value.si}</v></c>`;
  }

  if (existing) {
    xml = xml.replace(cellRe, cell);
  } else {
    // No cell yet — inject before the closing sheetData tag (respect order).
    xml = xml.replace(/<\/sheetData>/, `${cell}</sheetData>`);
  }
  return { xml, sstXml };
}

function serialForDate(d: Date): number {
  const y = d.getFullYear();
  const m = d.getMonth();
  const day = d.getDate();
  return Math.floor((Date.UTC(y, m, day) - Date.UTC(1899, 11, 30)) / 86400000);
}

export function generateSOExcel(
  originalBuffer: ArrayBuffer,
  sheets: SOSheet[],
  tanggal: Date,
  officerNames: Record<string, string>
): Blob {
  const files = unzipSync(new Uint8Array(originalBuffer));
  const sheetMap = buildSheetMap(files);
  const sharedStringsPath = "xl/sharedStrings.xml";
  let sstXml = files[sharedStringsPath] ? strFromU8(files[sharedStringsPath]) : "";
  const strings = parseSharedStrings(files);
  const stringIndex = new Map<string, number>();
  strings.forEach((s, i) => {
    if (!stringIndex.has(s)) stringIndex.set(s, i);
  });

  const getOrAddString = (text: string): number => {
    const existing = stringIndex.get(text);
    if (existing !== undefined) return existing;
    const idx = strings.length;
    strings.push(text);
    stringIndex.set(text, idx);
    // xml:space="preserve" only needed for leading/trailing whitespace
    const space = text !== text.trim() ? ' xml:space="preserve"' : "";
    const si = `<si><t${space}>${escapeXml(text)}</t></si>`;
    sstXml = sstXml.replace(/<\/sst>/, `${si}</sst>`);
    return idx;
  };

  const serial = serialForDate(tanggal);

  for (const sheet of sheets) {
    const path = sheetMap[sheet.sheetName];
    if (!path || !files[path]) continue;
    let xml = strFromU8(files[path]);

    if (sheet.area === "gas") {
      // Gas sheet: update date (C2)
      if (sheet.gasItems) {
        for (const gi of sheet.gasItems) {
          const row = gi.rowIndex;
          const setS = (addr: string, text: string) => {
            const si = getOrAddString(text);
            const r = setCell(xml, addr, { kind: "str", v: text, si }, sstXml);
            xml = r.xml;
            sstXml = r.sstXml;
          };
          const setN = (addr: string, num: number) => {
            const r = setCell(xml, addr, { kind: "num", v: num }, sstXml);
            xml = r.xml;
            sstXml = r.sstXml;
          };
          setS(`C${row}`, gi.statusQty);
          setS(`D${row}`, gi.tanggalIsiPakai);
          if (gi.kwhSisa !== null && gi.kwhSisa !== "") {
            setN(`E${row}`, typeof gi.kwhSisa === "number" ? gi.kwhSisa : parseFloat(String(gi.kwhSisa)) || 0);
          }
          setS(`F${row}`, gi.keterangan);
        }
      }
      const r2 = setCell(xml, "C2", { kind: "date", v: serial }, sstXml);
      xml = r2.xml;
      sstXml = r2.sstXml;
    } else {
      // SO sheet: step1 (C), step2 (D), date (C2), petugas (K2)
      for (const item of sheet.items) {
        const row = item.rowIndex;
        const r1 = setCell(xml, `C${row}`, { kind: "num", v: item.step1 }, sstXml);
        xml = r1.xml;
        sstXml = r1.sstXml;
        const r2 = setCell(xml, `D${row}`, { kind: "num", v: item.step2 }, sstXml);
        xml = r2.xml;
        sstXml = r2.sstXml;
      }
      const rDate = setCell(xml, "C2", { kind: "date", v: serial }, sstXml);
      xml = rDate.xml;
      sstXml = rDate.sstXml;

      const petugas = officerNames[sheet.sheetName] ?? sheet.namaPetugas ?? "";
      const si = getOrAddString(petugas);
      const rPet = setCell(xml, "K2", { kind: "str", v: petugas, si }, sstXml);
      xml = rPet.xml;
      sstXml = rPet.sstXml;
    }

    files[path] = strToU8(xml);
  }

  // Force Excel to recalculate formulas on open (total/status reference C/D cells
  // we just changed; the template's cached <v> values would otherwise stay stale).
  const wbPath = "xl/workbook.xml";
  if (files[wbPath]) {
    let wbXml = strFromU8(files[wbPath]);
    wbXml = wbXml.replace(/<calcPr\b([^>]*)\/>/, (_m, attrs: string) => {
      if (/fullCalcOnLoad="1"/.test(attrs)) return `<calcPr${attrs}/>`;
      return `<calcPr${attrs} fullCalcOnLoad="1"/>`;
    });
    if (wbXml !== strFromU8(files[wbPath])) files[wbPath] = strToU8(wbXml);
  }

  // Update sharedStrings counts if any strings were appended.
  if (sstXml) {
    const countRe = /<sst\b([^>]*)>/;
    const header = sstXml.match(countRe);
    if (header) {
      const count = (sstXml.match(/<si>/g) || []).length;
      const attrs = (header[1] || "").replace(/count="\d+"/, `count="${count}"`);
      if (!/count=/.test(attrs)) {
        sstXml = sstXml.replace(countRe, `<sst${attrs} count="${count}">`);
      } else {
        sstXml = sstXml.replace(countRe, `<sst${attrs}>`);
      }
    }
    files[sharedStringsPath] = strToU8(sstXml);
  }

  const out = zipSync(files, { level: 0 });
  return new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}