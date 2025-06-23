"use client"

import { useState, useEffect, useCallback } from "react"
import { AccommodationList } from "@/components/accommodations/accommodation-list"
import { AccommodationFilters } from "@/components/accommodations/accommodation-filters"
import { Button } from "@/components/ui/button"
import { Plus, Grid3X3, List, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

type ViewMode = "grid" | "list"
type SortOption = "number" | "category" | "price" | "status" | "capacity"

interface ViewSettings {
  mode: ViewMode
  showPrices: boolean
  showStatus: boolean
  showAmenities: boolean
  compactMode: boolean
  sortBy: SortOption
  sortDirection: "asc" | "desc"
}

const defaultSettings: ViewSettings = {
  mode: "grid",
  showPrices: true,
  showStatus: true,
  showAmenities: true,
  compactMode: false,
  sortBy: "number",
  sortDirection: "asc",
}

export default function ClientAccommodationsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRooms, setSelectedRooms] = useState<string[]>([])
  const [settings, setSettings] = useState<ViewSettings>(defaultSettings)

  // Simular carregamento de dados
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const updateSettings = useCallback((newSettings: Partial<ViewSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }, [])

  const handleCreateRoom = useCallback(() => {
    window.location.href = "/client/acomodacoes/nova"
  }, [])

  const handleBulkEdit = useCallback(() => {
    if (selectedRooms.length === 0) {
      toast({
        title: "Nenhuma acomodação selecionada",
        description: "Selecione pelo menos uma acomodação para editar.",
        variant: "destructive",
      })
      return
    }
    toast({
      title: "Edição em lote",
      description: `${selectedRooms.length} acomodações serão editadas.`,
    })
  }, [selectedRooms.length, toast])

  const handleBulkDelete = useCallback(() => {
    if (selectedRooms.length === 0) {
      toast({
        title: "Nenhuma acomodação selecionada",
        description: "Selecione pelo menos uma acomodação para excluir.",
        variant: "destructive",
      })
      return
    }
    toast({
      title: "Exclusão confirmada",
      description: `${selectedRooms.length} acomodações foram excluídas.`,
    })
  }, [selectedRooms.length, toast])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Acomodações</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Gerencie os quartos e acomodações do seu hotel</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium">
              🏨 Cliente
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Nova Acomodação - Botão principal */}
            <Button onClick={handleCreateRoom} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Nova Acomodação
            </Button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant={settings.mode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => updateSettings({ mode: "grid" })}
                className="h-8"
                aria-label="Visualização em grid"
              >
                <Grid3X3 className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">Grid</span>
              </Button>
              <Button
                variant={settings.mode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => updateSettings({ mode: "list" })}
                className="h-8"
                aria-label="Visualização em lista"
              >
                <List className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">Lista</span>
              </Button>
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="flex items-center gap-2">
            {/* Menu de Ações - Mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="sm:hidden">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleBulkEdit} disabled={selectedRooms.length === 0}>
                  Editar Selecionados
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleBulkDelete}
                  disabled={selectedRooms.length === 0}
                  className="text-red-600 focus:text-red-600"
                >
                  Excluir Selecionados
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Ações em Lote - Desktop */}
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleBulkEdit} disabled={selectedRooms.length === 0}>
                Editar Selecionados
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={selectedRooms.length === 0}>
                Excluir Selecionados
              </Button>
            </div>
          </div>
        </div>

        {/* Selection Info */}
        {selectedRooms.length > 0 && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">{selectedRooms.length} acomodação(ões) selecionada(s)</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-6">
        <AccommodationFilters />

        {isLoading ? (
          <LoadingState viewMode={settings.mode} />
        ) : (
          <AccommodationList
            selectedRooms={selectedRooms}
            onSelectionChange={setSelectedRooms}
            viewMode={settings.mode}
            showPrices={settings.showPrices}
            showStatus={settings.showStatus}
            showAmenities={settings.showAmenities}
            compactMode={settings.compactMode}
            sortBy={settings.sortBy}
            sortDirection={settings.sortDirection}
          />
        )}
      </div>
    </div>
  )
}

// Componente de estado de carregamento
function LoadingState({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-white rounded-lg border">
          <Skeleton className="h-6 w-48" />
        </div>

        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="p-4">
            <div className="flex items-center space-x-4 mb-4">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>

            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-4 py-4 border-t">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-24" />
                <div className="flex space-x-2 ml-auto">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white rounded-lg border">
        <Skeleton className="h-6 w-48" />
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg border overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex space-x-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-4" />
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
