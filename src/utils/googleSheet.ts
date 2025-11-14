// src/utils/googleSheet.ts
// ===================================================
// UNIVERSAL GOOGLE SHEET CONNECTOR (CSV mode)
// No API key, no auth — works with "Anyone with link"
// ===================================================

export type RecoveryRow = {
  Date: string;
  Athlete: string;
  Role: string;
  SleepHours: number;
  DeepSleep: number;
  REMSleep: number;
  LightSleep: number;
  RecoveryPercent: number;
  HR: number;
  HRV: number;
  AvgHR: number;
  SleepScore: number;
  Note: string;
  DeviceSync: string;
  TeamCode: string;
};

// 🟦 Template columns (English only, international format)
export const RECOVERY_COLUMNS = [
  "Date",
  "Athlete",
  "Role",
  "SleepHours",
  "DeepSleep",
  "REMSleep",
  "LightSleep",
  "RecoveryPercent",
  "HR",
  "HRV",
  "AvgHR",
  "SleepScore",
  "Note",
  "DeviceSync",
  "TeamCode"
];

// ===================================================
// Convert Google Sheet URL → CSV export URL
// ===================================================
export function toCsvUrl(sheetUrl: string): string {
  if (!sheetUrl.includes("docs.google.com")) return "";
  return sheetUrl.replace(/\/edit.*$/, "") + "/export?format=csv";
}

// ===================================================
// LOAD Google Sheet as CSV → parsed objects
// ===================================================
export async function loadSheet(sheetUrl: string): Promise<RecoveryRow[]> {
  const csvUrl = toCsvUrl(sheetUrl);
  if (!csvUrl) throw new Error("Invalid Google Sheet URL");

  const res = await fetch(csvUrl);
  if (!res.ok) throw new Error("Cannot fetch sheet. Make sure it is public.");

  const text = await res.text();
  if (!text.trim()) return [];

  const rows = csvToObjects(text);
  return rows as RecoveryRow[];
}

// ===================================================
// CSV → object array
// ===================================================
export function csvToObjects(csv: string): any[] {
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const obj: any = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] || "";
    });
    return obj;
  });
}

// ===================================================
// CREATE TEMPLATE (returns CSV string)
// We cannot write to Sheet without API,
// but we CAN generate CSV so user pastes it.
// ===================================================
export function generateTemplateCsv(): string {
  return RECOVERY_COLUMNS.join(",") + "\n";
}

// ===================================================
// ADD NEW ROW TO CSV (local mode)
// Used by Range/Snapshot logic
// ===================================================
export function appendRow(
  existing: RecoveryRow[],
  row: RecoveryRow
): RecoveryRow[] {
  return [...existing, row];
}
