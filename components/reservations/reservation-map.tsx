"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { format, addDays, startOfDay, endOfDay, addWeeks, subWeeks } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { ReservationEditModal } from "./reservation-edit-modal"
import {
  fetchRooms,
  fetchReservations,
  fetchGuests,
  type Room,
  type Reservation,
  type Guest,
  type ReservationStatus,
  statusColors,
  mapReservationStatus,
  roomCategories as mockRoomCategories,
} from "@/lib/services/reservation-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface RoomCategory {
  name: string
  rooms: Room[]
}

interface CellInfo {
  status: ReservationStatus
  guestName?: string
  isStart?: boolean
  isEnd?: boolean
  reservation?: Reservation
  guest?: Guest
  capacity?: number
  price?: number
}

export function ReservationMap() {
  const [startDate, setStartDate] = useState<Date>(new Date(2025, 5, 5)) // June 5, 2025
  const [endDate, setEndDate] = useState<Date>(new Date(2025, 5, 19)) // June 19, 2025
  const [rooms, setRooms] = useState<Room[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [roomCategories, setRoomCategories] = useState<RoomCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // In a real app, you would get the hotel ID from context or auth
        const hotelId = "hotel-1"

        const [roomsData, reservationsData, guestsData] = await Promise.all([
          fetchRooms(hotelId),
          fetchReservations(hotelId),
          fetchGuests(hotelId),
        ])

        setRooms(roomsData)
        setReservations(reservationsData)
        setGuests(guestsData)

        // Group rooms by category
        const categories: Record<string, Room[]> = {}
        roomsData.forEach((room) => {
          if (!categories[room.room_type]) {
            categories[room.room_type] = []
          }
          categories[room.room_type].push(room)
        })

        const formattedCategories = Object.entries(categories).map(([name, rooms]) => ({
          name,
          rooms,
        }))

        setRoomCategories(formattedCategories.length > 0 ? formattedCategories : mockRoomCategories)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as informações de reservas e acomodações.",
          variant: "destructive",
        })
        // Fallback to mock data
        setRoomCategories(mockRoomCategories)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [toast])

  useEffect(() => {
    const handleWheelScroll = (e: WheelEvent) => {
      const mapContainer = document.querySelector(".reservation-map-container")
      if (mapContainer && mapContainer.contains(e.target as Node)) {
        e.preventDefault()
        mapContainer.scrollLeft += e.deltaY
      }
    }

    document.addEventListener("wheel", handleWheelScroll, { passive: false })
    return () => document.removeEventListener("wheel", handleWheelScroll)
  }, [])

  // Generate array of dates for the header
  const generateDates = () => {
    const dates = []
    let currentDate = startDate
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate))
      currentDate = addDays(currentDate, 1)
    }
    return dates
  }

  const dates = generateDates()

  // Navigate to previous/next week
  const navigatePrevious = () => {
    setStartDate(subWeeks(startDate, 1))
    setEndDate(subWeeks(endDate, 1))
  }

  const navigateNext = () => {
    setStartDate(addWeeks(startDate, 1))
    setEndDate(addWeeks(endDate, 1))
  }

  // Format date range for display
  const formatDateRange = () => {
    return `${format(startDate, "dd/MM/yy")} a ${format(endDate, "dd/MM/yy")}`
  }

  // Check if a room is reserved on a specific date
  const getReservationForDateAndRoom = (date: Date, roomId: string) => {
    const dayStart = startOfDay(date)
    const dayEnd = endOfDay(date)

    return reservations.find(
      (reservation) =>
        reservation.room_id === roomId &&
        dayStart >= startOfDay(new Date(reservation.check_in_date)) &&
        dayEnd <= endOfDay(new Date(reservation.check_out_date)),
    )
  }

  // Get cell status (available, reserved, etc.)
  const getCellStatus = (date: Date, roomId: string): CellInfo => {
    const reservation = getReservationForDateAndRoom(date, roomId)
    if (reservation) {
      const guest = guests.find((g) => g.id === reservation.guest_id)
      return {
        status: mapReservationStatus(reservation.status),
        guestName: guest?.full_name || "Hóspede",
        isStart: format(date, "yyyy-MM-dd") === format(new Date(reservation.check_in_date), "yyyy-MM-dd"),
        isEnd: format(date, "yyyy-MM-dd") === format(new Date(reservation.check_out_date), "yyyy-MM-dd"),
        reservation,
        guest,
      }
    }

    // Default available status with room capacity
    const room =
      rooms.find((room) => room.id === roomId) ||
      roomCategories.flatMap((category) => category.rooms).find((room) => room.id === roomId)

    return {
      status: "available",
      capacity: room?.capacity || 0,
      price: room?.price_per_night || 0,
    }
  }

  // Handle reservation click
  const handleReservationClick = (reservation: Reservation) => {
    const guest = guests.find((g) => g.id === reservation.guest_id) || null
    const room =
      rooms.find((r) => r.id === reservation.room_id) ||
      roomCategories.flatMap((c) => c.rooms).find((r) => r.id === reservation.room_id) ||
      null

    setSelectedReservation(reservation)
    setSelectedGuest(guest)
    setSelectedRoom(room)
    setIsModalOpen(true)
  }

  // Handle reservation update
  const handleReservationUpdate = (updatedReservation: Reservation) => {
    setReservations((prev) => prev.map((res) => (res.id === updatedReservation.id ? updatedReservation : res)))
    setIsModalOpen(false)
  }

  // Safe function to get status style
  const getStatusStyle = (status: ReservationStatus) => {
    return statusColors[status] || statusColors.available
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-bold tracking-tight">Mapa de Reservas</CardTitle>
            <CardDescription>Visualize e gerencie todas as reservas do hotel</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2 bg-muted/50 p-1 rounded-md">
              <Button variant="ghost" size="icon" onClick={navigatePrevious} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium text-sm px-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {formatDateRange()}
              </span>
              <Button variant="ghost" size="icon" onClick={navigateNext} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="border rounded-md bg-white">
            <div className="overflow-auto reservation-map-container">
              {/* Header with dates */}
              <div className={`grid grid-cols-[180px_repeat(15,minmax(60px,1fr))] border-b sticky top-0 bg-white z-10`}>
                <div className={`p-2 font-medium border-r`}>UHs / Mês</div>
                {dates.map((date, index) => {
                  const dayName = format(date, "EEE", { locale: ptBR }).toUpperCase()
                  const dayNumber = format(date, "dd")
                  const monthShort = format(date, "MMM", { locale: ptBR }).toUpperCase()

                  return (
                    <div
                      key={index}
                      className={`text-center border-r p-2 ${["DOM", "SÁB"].includes(dayName) ? "bg-orange-100 border-r-orange-300" : ""}`}
                    >
                      <div
                        className={`text-xs font-medium ${["DOM", "SÁB"].includes(dayName) ? "text-orange-800 font-bold" : ""}`}
                      >
                        {dayName}
                      </div>
                      <div className={`text-xs font-bold`}>{dayNumber}</div>
                      <div className={`text-xs`}>{monthShort}</div>
                    </div>
                  )
                })}
              </div>

              {/* Room categories and cells */}
              {roomCategories.map((category) => (
                <div key={category.name}>
                  {/* Category header */}
                  <div
                    className={`grid grid-cols-[180px_repeat(15,minmax(60px,1fr))] border-b bg-muted/50 sticky z-10`}
                    style={{ top: "41px" }}
                  >
                    <div className={`p-3 font-medium border-r flex items-center justify-between`}>
                      {category.name}
                      <ChevronRight className="h-4 w-4" />
                    </div>
                    {dates.map((date, dateIndex) => {
                      const dayName = format(date, "EEE", { locale: ptBR }).toUpperCase()
                      return (
                        <div
                          key={dateIndex}
                          className={`text-center border-r p-2 ${["DOM", "SÁB"].includes(dayName) ? "bg-orange-50" : ""}`}
                        ></div>
                      )
                    })}
                  </div>

                  {/* Rooms in this category */}
                  {category.rooms.map((room) => (
                    <div
                      key={room.id}
                      className={`grid grid-cols-[180px_repeat(15,minmax(60px,1fr))] border-b hover:bg-muted/20`}
                    >
                      <div className={`p-3 border-r font-medium`}>{room.room_number || room.id}</div>
                      {dates.map((date, dateIndex) => {
                        const cellInfo = getCellStatus(date, room.id)
                        const dayName = format(date, "EEE", { locale: ptBR }).toUpperCase()
                        const isWeekend = ["DOM", "SÁB"].includes(dayName)

                        // For available cells
                        if (cellInfo.status === "available") {
                          return (
                            <div
                              key={dateIndex}
                              className={`text-center border-r p-2 ${isWeekend ? "bg-orange-50/70" : ""} ${getStatusStyle(cellInfo.status).border}`}
                            >
                              <div className={`text-xs font-medium`}>{cellInfo.capacity}</div>
                              <div className={`text-xs`}>R$ {cellInfo.price}</div>
                            </div>
                          )
                        }

                        // For reservation cells
                        const statusStyle = getStatusStyle(cellInfo.status)

                        // Determine if this is the first cell of a reservation (to show the guest name)
                        const showName =
                          cellInfo.isStart ||
                          (dateIndex > 0 && !getReservationForDateAndRoom(dates[dateIndex - 1], room.id))

                        return (
                          <div
                            key={dateIndex}
                            className={`text-center border-r p-0 ${statusStyle.bg} ${statusStyle.text} relative cursor-pointer hover:opacity-90 transition-opacity`}
                            onClick={() => cellInfo.reservation && handleReservationClick(cellInfo.reservation)}
                            title={`${cellInfo.guestName} - ${format(new Date(cellInfo.reservation?.check_in_date || ""), "dd/MM")} a ${format(new Date(cellInfo.reservation?.check_out_date || ""), "dd/MM")}`}
                          >
                            {showName && (
                              <div
                                className={`absolute inset-0 flex items-center justify-center text-xs font-medium truncate px-1`}
                              >
                                {cellInfo.guestName}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 bg-white p-3 rounded-md border">
          <div className="flex items-center">
            <div className={`w-4 h-4 mr-2 ${statusColors.preReserved.bg} border border-yellow-300`}></div>
            <span className="text-sm">pré-reservado</span>
          </div>
          <div className="flex items-center">
            <div className={`w-4 h-4 mr-2 ${statusColors.reserved.bg}`}></div>
            <span className="text-sm">reservado</span>
          </div>
          <div className="flex items-center">
            <div className={`w-4 h-4 mr-2 ${statusColors.checkedIn.bg}`}></div>
            <span className="text-sm">hospedado</span>
          </div>
          <div className="flex items-center">
            <div className={`w-4 h-4 mr-2 ${statusColors.cleaning.bg}`}></div>
            <span className="text-sm">em limpeza</span>
          </div>
          <div className="flex items-center">
            <div className={`w-4 h-4 mr-2 ${statusColors.finished.bg}`}></div>
            <span className="text-sm">finalizado</span>
          </div>
          <div className="flex items-center">
            <div className={`w-4 h-4 mr-2 ${statusColors.blocked.bg}`}></div>
            <span className="text-sm">bloqueado</span>
          </div>
          <div className="flex items-center">
            <div className={`w-4 h-4 mr-2 ${statusColors.waiting.bg}`}></div>
            <span className="text-sm">em espera</span>
          </div>
        </div>

        {/* Reservation Edit Modal */}
        {selectedReservation && (
          <ReservationEditModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            reservation={selectedReservation}
            guest={selectedGuest}
            room={selectedRoom}
            onUpdate={handleReservationUpdate}
          />
        )}
      </CardContent>
    </Card>
  )
}
