"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, AlertTriangle, Wrench, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CleaningActionButtonsProps {
  selectedRooms: string[]
  onAction: (action: string) => void
  onClearSelection: () => void
}

export function CleaningActionButtons({ selectedRooms, onAction, onClearSelection }: CleaningActionButtonsProps) {
  if (selectedRooms.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => onAction("mark-clean")}>
        <CheckCircle className="h-4 w-4" />
        <span>Marcar como Limpo</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => onAction("start-cleaning")}
      >
        <Clock className="h-4 w-4" />
        <span>Iniciar Limpeza</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Mais Ações
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações em Lote</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onAction("mark-dirty")}>
            <AlertTriangle className="h-4 w-4 mr-2" />
            Marcar como Sujo
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAction("mark-maintenance")}>
            <Wrench className="h-4 w-4 mr-2" />
            Enviar para Manutenção
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAction("create-tasks")}>
            <Clock className="h-4 w-4 mr-2" />
            Criar Tarefas
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={onClearSelection}>
        <X className="h-4 w-4" />
        <span>Limpar Seleção</span>
      </Button>
    </div>
  )
}
