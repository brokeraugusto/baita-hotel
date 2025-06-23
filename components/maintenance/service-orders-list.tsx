"use client"

import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { MaintenanceDetailsDialog } from "./maintenance-details-dialog"
import { type MaintenanceOrder, MAINTENANCE_PRIORITIES, MAINTENANCE_STATUSES } from "@/lib/services/maintenance-service"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface Room {
  id: string
  room_number: string
  room_type: string
}

interface ServiceOrdersListProps {
  hotelId: string
  rooms: Room[]
  orders: MaintenanceOrder[]
  isLoading: boolean
  onDelete: (id: string) => void
  onRefreshNeeded: () => void
}

export function ServiceOrdersList({
  hotelId,
  rooms,
  orders,
  isLoading,
  onDelete,
  onRefreshNeeded,
}: ServiceOrdersListProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  const handleViewDetails = (orderId: string) => {
    setSelectedOrderId(orderId)
    setIsDetailsDialogOpen(true)
  }

  const getRoomInfo = (roomId: string | null) => {
    if (!roomId) return "N/A"
    const room = rooms.find((r) => r.id === roomId)
    return room ? `${room.room_number}` : "N/A"
  }

  const columns: ColumnDef<MaintenanceOrder>[] = [
    {
      accessorKey: "title",
      header: "Título",
      cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
    },
    {
      accessorKey: "room_id",
      header: "Local",
      cell: ({ row }) => getRoomInfo(row.getValue("room_id")),
    },
    {
      accessorKey: "priority",
      header: "Prioridade",
      cell: ({ row }) => {
        const priority = row.getValue("priority") as keyof typeof MAINTENANCE_PRIORITIES
        const { label, color } = MAINTENANCE_PRIORITIES[priority] || { label: "Desconhecida", color: "secondary" }
        return <Badge variant={color as any}>{label}</Badge>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as keyof typeof MAINTENANCE_STATUSES
        const { label, color } = MAINTENANCE_STATUSES[status] || { label: "Desconhecido", color: "secondary" }
        return <Badge variant={color as any}>{label}</Badge>
      },
    },
    {
      accessorKey: "created_at",
      header: "Criada em",
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string
        return date ? new Date(date).toLocaleDateString("pt-BR") : "N/A"
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleViewDetails(order.id)}>
              Ver Detalhes
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(order.id)}>
              Excluir
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  Carregando ordens de serviço...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhuma ordem de serviço encontrada.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <MaintenanceDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        orderId={selectedOrderId}
        rooms={rooms}
        onUpdate={onRefreshNeeded}
      />
    </>
  )
}
