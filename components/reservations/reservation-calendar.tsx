"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Mock data para demonstração
const rooms = [
  { id: "101", name: "Suíte 101", category: "Suíte Luxo" },
  { id: "102", name: "Suíte 102", category: "Suíte Luxo" },
  { id: "201", name: "Quarto 201", category: "Vista Mar" },
  { id: "202", name: "Quarto 202", category: "Vista Mar" },
  { id: "203", name: "Quarto 203", category: "Vista Mar" },
  { id: "301", name: "Chalé 01", category: "Chalé Standard" },
  { id: "302", name: "Chalé 02", category: "Chalé Standard" },
  { id: "303", name: "Chalé 03", category: "Chalé Standard" },
]

const reservations = [
  {
    id: "1",
    roomId: "101",
    guest: "Maria Silva",
    startDate: "2024-01-15",
    endDate: "2024-01-18",
    status: "confirmed",
  },
  {
    id: "2",
    roomId: "201",
    guest: "João Santos",
    startDate: "2024-01-16",
    endDate: "2024-01-19",
    status: "pending",
  },
  {
    id: "3",
    roomId: "303",
    guest: "Ana Costa",
    startDate: "2024-01-17",
    endDate: "2024-01-20",
    status: "confirmed",
  },
]

const statusColors = {
  confirmed: "bg-green-500",
  pending: "bg-yellow-500",
  checkedin: "bg-blue-500",
  checkedout: "bg-gray-500",
  blocked: "bg-red-500",
}

export function ReservationCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Gerar dias do mês atual
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const days = getDaysInMonth(currentDate)

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const getReservationForRoomAndDate = (roomId: string, date: string) => {
    return reservations.find(
      (reservation) => reservation.roomId === roomId && date >= reservation.startDate && date <= reservation.endDate,
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Calendário de Ocupação</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium min-w-[200px] text-center">
              {currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </span>
            <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header com os dias */}
            <div className="grid grid-cols-[200px_1fr] gap-2 mb-4">
              <div className="font-medium">Acomodação</div>
              <div className="grid grid-cols-7 gap-1">
                {days.slice(0, 7).map((day) => (
                  <div key={day.toISOString()} className="text-center text-sm font-medium p-2">
                    {day.getDate()}
                  </div>
                ))}
              </div>
            </div>

            {/* Linhas das acomodações */}
            {rooms.map((room) => (
              <div key={room.id} className="grid grid-cols-[200px_1fr] gap-2 mb-2">
                <div className="p-2 border rounded">
                  <div className="font-medium">{room.name}</div>
                  <div className="text-sm text-muted-foreground">{room.category}</div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {days.slice(0, 7).map((day) => {
                    const dateStr = formatDate(day)
                    const reservation = getReservationForRoomAndDate(room.id, dateStr)

                    return (
                      <div
                        key={dateStr}
                        className={`
                          h-12 border rounded p-1 text-xs cursor-pointer hover:bg-muted/50
                          ${reservation ? statusColors[reservation.status as keyof typeof statusColors] + " text-white" : "bg-background"}
                        `}
                        title={reservation ? `${reservation.guest} - ${reservation.status}` : "Disponível"}
                      >
                        {reservation && <div className="truncate">{reservation.guest}</div>}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legenda */}
        <div className="flex items-center space-x-4 mt-4 pt-4 border-t">
          <span className="text-sm font-medium">Legenda:</span>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm">Confirmada</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-sm">Pendente</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm">Check-in</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span className="text-sm">Check-out</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
