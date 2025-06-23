"use client"

import { useState } from "react"
import { Download, FileText, FileSpreadsheet, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface ExportDataProps {
  data: any[]
  filename: string
  type: "reservations" | "guests" | "financial" | "reports"
}

export function ExportData({ data, filename, type }: ExportDataProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const exportToPDF = async () => {
    setIsExporting(true)

    // Simular exportação
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast({
      title: "Exportação Concluída",
      description: `${filename}.pdf foi baixado com sucesso`,
    })

    setIsExporting(false)
  }

  const exportToExcel = async () => {
    setIsExporting(true)

    // Simular exportação
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Exportação Concluída",
      description: `${filename}.xlsx foi baixado com sucesso`,
    })

    setIsExporting(false)
  }

  const exportToCSV = async () => {
    setIsExporting(true)

    // Simular exportação
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Exportação Concluída",
      description: `${filename}.csv foi baixado com sucesso`,
    })

    setIsExporting(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Exportando..." : "Exportar"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Formato de Exportação</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="mr-2 h-4 w-4" />
          PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV}>
          <Calendar className="mr-2 h-4 w-4" />
          CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
