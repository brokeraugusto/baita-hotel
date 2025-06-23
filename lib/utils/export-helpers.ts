export interface ExportOptions {
  filename?: string
  format: "csv" | "excel" | "pdf"
  data: any[]
  columns: { key: string; label: string; width?: number }[]
  title?: string
  subtitle?: string
}

export function exportToCSV(options: ExportOptions): void {
  const { data, columns, filename = "export.csv" } = options

  const headers = columns.map((col) => col.label).join(",")
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key]
        // Escape commas and quotes in CSV
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      })
      .join(","),
  )

  const csvContent = [headers, ...rows].join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

  downloadBlob(blob, filename)
}

export function exportToExcel(options: ExportOptions): void {
  // This would require a library like xlsx
  console.log("Excel export would be implemented with xlsx library")

  // For now, export as CSV
  exportToCSV({ ...options, filename: options.filename?.replace(".xlsx", ".csv") || "export.csv" })
}

export function exportToPDF(options: ExportOptions): void {
  // This would require a library like jsPDF
  console.log("PDF export would be implemented with jsPDF library")

  // For now, show a message
  alert("PDF export functionality would be implemented with jsPDF library")
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export function generateReportData(
  type: "reservations" | "guests" | "maintenance" | "financial",
  data: any[],
  period: { start: Date; end: Date },
) {
  const filteredData = data.filter((item) => {
    const itemDate = new Date(item.createdAt || item.date || item.checkInDate)
    return itemDate >= period.start && itemDate <= period.end
  })

  const summary = {
    totalRecords: filteredData.length,
    period: {
      start: period.start.toLocaleDateString("pt-BR"),
      end: period.end.toLocaleDateString("pt-BR"),
    },
    generatedAt: new Date().toLocaleString("pt-BR"),
  }

  return {
    data: filteredData,
    summary,
    type,
  }
}
