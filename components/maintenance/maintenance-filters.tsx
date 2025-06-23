"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X, Calendar } from "lucide-react"
import { MAINTENANCE_PRIORITIES, MAINTENANCE_STATUSES } from "@/lib/services/maintenance-service"
import { getMaintenanceCategories, getMaintenanceTechnicians } from "@/lib/services/maintenance-service"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface MaintenanceFiltersProps {
  onFilterChange: (filters: {
    searchQuery: string
    status: string
    priority: string
    categoryId?: string
    technicianId?: string
    dateRange?: { from: Date | undefined; to: Date | undefined }
  }) => void
}

export function MaintenanceFilters({ onFilterChange }: MaintenanceFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [priority, setPriority] = useState("all")
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined)
  const [technicianId, setTechnicianId] = useState<string | undefined>(undefined)
  const [date, setDate] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [isFiltersVisible, setIsFiltersVisible] = useState(false)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [technicians, setTechnicians] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const categoriesData = await getMaintenanceCategories()
        setCategories(categoriesData.map((c) => ({ id: c.id, name: c.name })))

        const techniciansData = await getMaintenanceTechnicians()
        setTechnicians(techniciansData.map((t) => ({ id: t.id, name: t.name })))
      } catch (error) {
        console.error("Error fetching filter data:", error)
      }
    }

    fetchFilterData()
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    onFilterChange({
      searchQuery: value,
      status,
      priority,
      categoryId,
      technicianId,
      dateRange: date.from ? date : undefined,
    })
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    onFilterChange({
      searchQuery,
      status: value,
      priority,
      categoryId,
      technicianId,
      dateRange: date.from ? date : undefined,
    })
  }

  const handlePriorityChange = (value: string) => {
    setPriority(value)
    onFilterChange({
      searchQuery,
      status,
      priority: value,
      categoryId,
      technicianId,
      dateRange: date.from ? date : undefined,
    })
  }

  const handleCategoryChange = (value: string) => {
    const newCategoryId = value === "all" ? undefined : value
    setCategoryId(newCategoryId)
    onFilterChange({
      searchQuery,
      status,
      priority,
      categoryId: newCategoryId,
      technicianId,
      dateRange: date.from ? date : undefined,
    })
  }

  const handleTechnicianChange = (value: string) => {
    const newTechnicianId = value === "all" ? undefined : value
    setTechnicianId(newTechnicianId)
    onFilterChange({
      searchQuery,
      status,
      priority,
      categoryId,
      technicianId: newTechnicianId,
      dateRange: date.from ? date : undefined,
    })
  }

  const handleDateChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDate(range)
    if (range.from) {
      onFilterChange({
        searchQuery,
        status,
        priority,
        categoryId,
        technicianId,
        dateRange: range,
      })
    } else {
      onFilterChange({
        searchQuery,
        status,
        priority,
        categoryId,
        technicianId,
        dateRange: undefined,
      })
    }
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setStatus("all")
    setPriority("all")
    setCategoryId(undefined)
    setTechnicianId(undefined)
    setDate({ from: undefined, to: undefined })
    onFilterChange({
      searchQuery: "",
      status: "all",
      priority: "all",
      categoryId: undefined,
      technicianId: undefined,
      dateRange: undefined,
    })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar ordem de serviço..."
              className="pl-10"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(MAINTENANCE_STATUSES).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priority} onValueChange={handlePriorityChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {Object.entries(MAINTENANCE_PRIORITIES).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsFiltersVisible(!isFiltersVisible)}>
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>

            <Button variant="outline" onClick={handleClearFilters} className="px-3" title="Limpar filtros">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isFiltersVisible && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Select value={categoryId || "all"} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={technicianId || "all"} onValueChange={handleTechnicianChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os técnicos</SelectItem>
                  {technicians.map((technician) => (
                    <SelectItem key={technician.id} value={technician.id}>
                      {technician.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {date.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                          {format(date.to, "dd/MM/yyyy", { locale: ptBR })}
                        </>
                      ) : (
                        format(date.from, "dd/MM/yyyy", { locale: ptBR })
                      )
                    ) : (
                      <span>Selecionar período</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="range"
                    selected={date}
                    onSelect={handleDateChange}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
