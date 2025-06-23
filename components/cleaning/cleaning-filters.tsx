"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, X } from "lucide-react"

interface CleaningFiltersProps {
  onFiltersChange?: (filters: any) => void
}

export function CleaningFilters({ onFiltersChange }: CleaningFiltersProps) {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    floor: "all",
    dateRange: { from: undefined, to: undefined },
    showOnlyVIP: false,
    showOnlyUrgent: false,
  })

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)

    if (typeof onFiltersChange === "function") {
      onFiltersChange(newFilters)
    }
  }

  const handleReset = () => {
    const resetFilters = {
      search: "",
      status: "all",
      floor: "all",
      dateRange: { from: undefined, to: undefined },
      showOnlyVIP: false,
      showOnlyUrgent: false,
    }
    setFilters(resetFilters)

    if (typeof onFiltersChange === "function") {
      onFiltersChange(resetFilters)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-lg font-medium flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filtros
        </h3>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <X className="h-4 w-4 mr-2" />
          Limpar Filtros
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="search">Busca</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Buscar por número ou nome..."
              className="pl-8"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="clean">Limpo</SelectItem>
              <SelectItem value="dirty">Sujo</SelectItem>
              <SelectItem value="in-progress">Em Limpeza</SelectItem>
              <SelectItem value="maintenance">Manutenção</SelectItem>
              <SelectItem value="inspection">Inspeção</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="floor">Andar</Label>
          <Select value={filters.floor} onValueChange={(value) => handleFilterChange("floor", value)}>
            <SelectTrigger id="floor">
              <SelectValue placeholder="Todos os andares" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os andares</SelectItem>
              <SelectItem value="1">1º Andar</SelectItem>
              <SelectItem value="2">2º Andar</SelectItem>
              <SelectItem value="3">3º Andar</SelectItem>
              <SelectItem value="4">4º Andar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Período</Label>
          <DateRangePicker value={filters.dateRange} onChange={(value) => handleFilterChange("dateRange", value)} />
        </div>
      </div>

      <div className="flex items-center space-x-4 pt-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="vip"
            checked={filters.showOnlyVIP}
            onCheckedChange={(checked) => handleFilterChange("showOnlyVIP", checked)}
          />
          <Label htmlFor="vip" className="text-sm font-normal">
            Apenas quartos VIP
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="urgent"
            checked={filters.showOnlyUrgent}
            onCheckedChange={(checked) => handleFilterChange("showOnlyUrgent", checked)}
          />
          <Label htmlFor="urgent" className="text-sm font-normal">
            Apenas urgentes
          </Label>
        </div>
      </div>
    </div>
  )
}
