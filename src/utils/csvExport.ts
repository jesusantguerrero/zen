const escape = (value: unknown): string => {
  if (value === null || value === undefined) return ""
  const str = String(value)
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

export const toCsv = (rows: Record<string, unknown>[], columns?: string[]): string => {
  if (!rows.length) return ""
  const cols = columns || Object.keys(rows[0])
  const header = cols.map(escape).join(",")
  const body = rows.map((row) => cols.map((col) => escape(row[col])).join(","))
  return [header, ...body].join("\n")
}

export const downloadCsv = (filename: string, csv: string) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
