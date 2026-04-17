import { db, firebaseState } from "@/plugins/useFirebase";

export type ExportFormat = "json" | "csv";

const fetchCollection = async (collection: string) => {
  if (!firebaseState.user) return [];
  const snap = await db
    .collection(collection)
    .where("user_uid", "==", firebaseState.user.uid)
    .get();
  const rows: any[] = [];
  snap.forEach((doc) => rows.push({ uid: doc.id, ...doc.data() }));
  return rows;
};

const normalize = (value: any): any => {
  if (value == null) return "";
  if (value.toDate && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(normalize);
  if (typeof value === "object") {
    const out: Record<string, any> = {};
    for (const key of Object.keys(value)) out[key] = normalize(value[key]);
    return out;
  }
  return value;
};

const toCsv = (rows: any[]): string => {
  if (!rows.length) return "";
  const headers = Array.from(
    rows.reduce((set: Set<string>, row) => {
      Object.keys(row).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );
  const escape = (val: any): string => {
    if (val == null) return "";
    const str =
      typeof val === "object" ? JSON.stringify(val) : String(val);
    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  return lines.join("\n");
};

const triggerDownload = (content: string, filename: string, mime: string) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export function useDataExport() {
  const exportCollection = async (
    collection: "tasks" | "tracks",
    format: ExportFormat
  ) => {
    const rows = (await fetchCollection(collection)).map(normalize);
    const stamp = new Date().toISOString().split("T")[0];
    const filename = `zen-${collection}-${stamp}.${format}`;
    if (format === "json") {
      triggerDownload(
        JSON.stringify(rows, null, 2),
        filename,
        "application/json"
      );
    } else {
      triggerDownload(toCsv(rows), filename, "text/csv");
    }
    return rows.length;
  };

  return { exportCollection };
}
