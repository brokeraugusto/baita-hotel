"use client"
import { ReservationMap } from "@/components/reservations/reservation-map"

interface Reservation {
  id: string
  roomId: string
  guestName: string
  checkIn: string
  checkOut: string
  guests: number
  status: "confirmed" | "pending" | "checked_in" | "checked_out" | "cancelled"
  paymentStatus: "paid" | "pending" | "partial"
}

interface Room {
  id: string
  name: string
  category: string
  floor: number
  capacity: number
  status: "available" | "occupied" | "maintenance" | "cleaning"
}

const mockRooms: Room[] = [
  // Térreo
  { id: "001", name: "Recepção", category: "Área Comum", floor: 0, capacity: 0, status: "available" },
  { id: "002", name: "Restaurante", category: "Área Comum", floor: 0, capacity: 0, status: "available" },
  { id: "003", name: "Sala de Eventos", category: "Área Comum", floor: 0, capacity: 0, status: "available" },

  // 1º Andar
  { id: "101", name: "Suíte 101", category: "Suíte Luxo", floor: 1, capacity: 4, status: "occupied" },
  { id: "102", name: "Suíte 102", category: "Suíte Luxo", floor: 1, capacity: 4, status: "occupied" },
  { id: "103", name: "Quarto 103", category: "Standard", floor: 1, capacity: 2, status: "available" },
  { id: "104", name: "Quarto 104", category: "Standard", floor: 1, capacity: 2, status: "cleaning" },
  { id: "105", name: "Quarto 105", category: "Standard", floor: 1, capacity: 2, status: "available" },

  // 2º Andar
  { id: "201", name: "Quarto 201", category: "Vista Mar", floor: 2, capacity: 3, status: "occupied" },
  { id: "202", name: "Quarto 202", category: "Vista Mar", floor: 2, capacity: 3, status: "available" },
  { id: "203", name: "Quarto 203", category: "Vista Mar", floor: 2, capacity: 3, status: "maintenance" },
  { id: "204", name: "Quarto 204", category: "Vista Mar", floor: 2, capacity: 3, status: "available" },
  { id: "205", name: "Quarto 205", category: "Vista Mar", floor: 2, capacity: 3, status: "occupied" },

  // 3º Andar - Chalés
  { id: "301", name: "Chalé 01", category: "Chalé Standard", floor: 3, capacity: 6, status: "occupied" },
  { id: "302", name: "Chalé 02", category: "Chalé Standard", floor: 3, capacity: 6, status: "available" },
  { id: "303", name: "Chalé 03", category: "Chalé Premium", floor: 3, capacity: 8, status: "available" },
  { id: "304", name: "Chalé 04", category: "Chalé Premium", floor: 3, capacity: 8, status: "cleaning" },
]

const mockReservations: Reservation[] = [
  {
    id: "1",
    roomId: "101",
    guestName: "Maria Silva",
    checkIn: "2024-01-15",
    checkOut: "2024-01-18",
    guests: 2,
    status: "checked_in",
    paymentStatus: "paid",
  },
  {
    id: "2",
    roomId: "102",
    guestName: "João Santos",
    checkIn: "2024-01-16",
    checkOut: "2024-01-19",
    guests: 3,
    status: "confirmed",
    paymentStatus: "paid",
  },
  {
    id: "3",
    roomId: "201",
    guestName: "Ana Costa",
    checkIn: "2024-01-14",
    checkOut: "2024-01-20",
    guests: 2,
    status: "checked_in",
    paymentStatus: "paid",
  },
  {
    id: "4",
    roomId: "205",
    guestName: "Carlos Lima",
    checkIn: "2024-01-17",
    checkOut: "2024-01-21",
    guests: 4,
    status: "confirmed",
    paymentStatus: "pending",
  },
  {
    id: "5",
    roomId: "301",
    guestName: "Família Oliveira",
    checkIn: "2024-01-15",
    checkOut: "2024-01-22",
    guests: 5,
    status: "checked_in",
    paymentStatus: "paid",
  },
]

const statusColors = {
  available: "bg-green-100 text-green-800 border-green-200",
  occupied: "bg-blue-100 text-blue-800 border-blue-200",
  maintenance: "bg-red-100 text-red-800 border-red-200",
  cleaning: "bg-yellow-100 text-yellow-800 border-yellow-200",
}

const categoryColors = {
  "Suíte Luxo": "bg-purple-50 border-purple-200",
  "Vista Mar": "bg-blue-50 border-blue-200",
  Standard: "bg-gray-50 border-gray-200",
  "Chalé Standard": "bg-green-50 border-green-200",
  "Chalé Premium": "bg-emerald-50 border-emerald-200",
  "Área Comum": "bg-slate-50 border-slate-200",
}

export default function ReservationMapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mapa de Reservas</h1>
        <p className="text-muted-foreground">Visualize todas as reservas e disponibilidades em um único lugar</p>
      </div>

      <ReservationMap />
    </div>
  )
}
