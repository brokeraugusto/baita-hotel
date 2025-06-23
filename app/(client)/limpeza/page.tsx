"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, ClipboardList, BarChart3, Settings, RefreshCw } from "lucide-react"
import { CleaningOverview } from "@/components/cleaning/cleaning-overview"
import { RoomStatusGrid } from "@/components/cleaning/room-status-grid"
import { CleaningTasks } from "@/components/cleaning/cleaning-tasks"
import { CleaningPersonnelList } from "@/components/cleaning/cleaning-personnel-list"
import { CreateTaskDialog } from "@/components/cleaning/create-task-dialog"
import { CleaningPersonnelDialog } from "@/components/cleaning/cleaning-personnel-dialog"

const HOTEL_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"

export default function LimpezaPage() {
  const [selectedRooms, setSelectedRooms] = useState<string[]>([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const [createPersonnelOpen, setCreatePersonnelOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleTaskCreated = () => {
    setCreateTaskOpen(false)
    handleRefresh()
  }

  const handlePersonnelCreated = () => {
    setCreatePersonnelOpen(false)
    handleRefresh()
  }

  const handleTaskUpdate = () => {
    handleRefresh()
  }

  const handleBulkAction = (action: string) => {
    if (selectedRooms.length === 0) return

    console.log(`Executando ação em lote: ${action} para quartos:`, selectedRooms)
    // Implementar ações em lote aqui
    setSelectedRooms([])
    handleRefresh()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-full sm:max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Módulo de Limpeza</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Gerencie a limpeza e manutenção dos quartos</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
            <Button onClick={() => setCreateTaskOpen(true)} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Tarefa
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreatePersonnelOpen(true)}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Funcionário
            </Button>
          </div>
        </div>

        {/* Ações em Lote */}
        {selectedRooms.length > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {selectedRooms.length} {selectedRooms.length === 1 ? "quarto selecionado" : "quartos selecionados"}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => handleBulkAction("clean")}>
                    Marcar como Limpo
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction("dirty")}>
                    Marcar como Sujo
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction("maintenance")}>
                    Enviar para Manutenção
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedRooms([])}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 min-w-fit">
              <TabsTrigger value="overview" className="flex items-center gap-2 text-xs sm:text-sm">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Visão Geral</span>
                <span className="sm:hidden">Visão</span>
              </TabsTrigger>
              <TabsTrigger value="rooms" className="flex items-center gap-2 text-xs sm:text-sm">
                <Settings className="h-4 w-4" />
                <span>Quartos</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2 text-xs sm:text-sm">
                <ClipboardList className="h-4 w-4" />
                <span>Tarefas</span>
              </TabsTrigger>
              <TabsTrigger value="personnel" className="flex items-center gap-2 text-xs sm:text-sm">
                <Users className="h-4 w-4" />
                <span>Equipe</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <CleaningOverview hotelId={HOTEL_ID} refreshTrigger={refreshTrigger} />
          </TabsContent>

          <TabsContent value="rooms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Status dos Quartos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RoomStatusGrid
                  selectedRooms={selectedRooms}
                  onSelectionChange={setSelectedRooms}
                  refreshTrigger={refreshTrigger}
                  hotelId={HOTEL_ID}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <CleaningTasks hotelId={HOTEL_ID} refreshTrigger={refreshTrigger} onTaskUpdate={handleTaskUpdate} />
          </TabsContent>

          <TabsContent value="personnel" className="space-y-6">
            <CleaningPersonnelList hotelId={HOTEL_ID} refreshTrigger={refreshTrigger} onStaffUpdate={handleRefresh} />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <CreateTaskDialog
          open={createTaskOpen}
          onOpenChange={setCreateTaskOpen}
          onTaskCreated={handleTaskCreated}
          hotelId={HOTEL_ID}
        />

        <CleaningPersonnelDialog
          open={createPersonnelOpen}
          onOpenChange={setCreatePersonnelOpen}
          onPersonnelCreated={handlePersonnelCreated}
          hotelId={HOTEL_ID}
        />
      </div>
    </div>
  )
}
