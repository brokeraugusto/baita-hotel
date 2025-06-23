import type { Database } from "../supabase/database.types"

export type Room = Database["public"]["Tables"]["rooms"]["Row"]
export type Reservation = Database["public"]["Tables"]["reservations"]["Row"]
export type Guest = Database["public"]["Tables"]["guests"]["Row"]

// Status colors for the reservation map
export const statusColors = {
  available: { bg: "bg-white", text: "text-black", border: "border border-gray-200" },
  preReserved: { bg: "bg-yellow-100", text: "text-black", border: "border border-yellow-300" },
  reserved: { bg: "bg-blue-500", text: "text-white", border: "" },
  occupied: { bg: "bg-red-500", text: "text-white", border: "" },
  checkedIn: { bg: "bg-red-500", text: "text-white", border: "" },
  cleaning: { bg: "bg-gray-300", text: "text-black", border: "" },
  completed: { bg: "bg-teal-500", text: "text-white", border: "" },
  finished: { bg: "bg-teal-500", text: "text-white", border: "" },
  blocked: { bg: "bg-gray-800", text: "text-white", border: "" },
  waiting: { bg: "bg-pink-500", text: "text-white", border: "" },
} as const

export type ReservationStatus = keyof typeof statusColors

// Map database status to UI status
export const mapReservationStatus = (status: string): ReservationStatus => {
  switch (status) {
    case "confirmed":
      return "reserved"
    case "cancelled":
      return "blocked"
    case "completed":
      return "finished"
    case "checked_in":
      return "checkedIn"
    case "checked_out":
      return "finished"
    case "no_show":
      return "blocked"
    case "pending":
      return "preReserved"
    default:
      return "reserved"
  }
}

// Mock data for room categories (will be replaced with real data)
export const roomCategories = [
  {
    name: "Standard",
    rooms: [
      { id: "room-101", number: "101", capacity: 2, price: 250 },
      { id: "room-102", number: "102", capacity: 2, price: 250 },
      { id: "room-103", number: "103", capacity: 2, price: 250 },
    ],
  },
  {
    name: "Deluxe",
    rooms: [
      { id: "room-201", number: "201", capacity: 4, price: 450 },
      { id: "room-202", number: "202", capacity: 4, price: 450 },
    ],
  },
  {
    name: "Suite",
    rooms: [{ id: "room-301", number: "301", capacity: 2, price: 550 }],
  },
]

// Function to fetch rooms from Supabase
export async function fetchRooms(hotelId: string): Promise<Room[]> {
  try {
    // In a real implementation, this would fetch from Supabase
    // For now, we'll return mock data
    return roomCategories.flatMap((category) =>
      category.rooms.map((room) => ({
        id: room.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hotel_id: hotelId,
        room_number: room.number,
        room_type: category.name,
        capacity: room.capacity,
        price_per_night: room.price,
        description: `${category.name} room ${room.number}`,
        status: "available",
        amenities: null,
        image_url: null,
      })),
    )
  } catch (error) {
    console.error("Error fetching rooms:", error)
    return []
  }
}

// Function to fetch reservations from Supabase
export async function fetchReservations(hotelId: string): Promise<Reservation[]> {
  try {
    // In a real implementation, this would fetch from Supabase
    // For now, we'll return mock data
    return [
      {
        id: "1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hotel_id: hotelId,
        room_id: "room-101",
        guest_id: "guest-1",
        check_in_date: new Date(2025, 5, 19).toISOString(),
        check_out_date: new Date(2025, 5, 22).toISOString(),
        status: "confirmed",
        total_price: 750,
        payment_status: "paid",
        special_requests: null,
        booking_source: "direct",
      },
      {
        id: "2",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hotel_id: hotelId,
        room_id: "room-102",
        guest_id: "guest-2",
        check_in_date: new Date(2025, 5, 19).toISOString(),
        check_out_date: new Date(2025, 5, 22).toISOString(),
        status: "confirmed",
        total_price: 750,
        payment_status: "pending",
        special_requests: null,
        booking_source: "direct",
      },
      {
        id: "3",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hotel_id: hotelId,
        room_id: "room-201",
        guest_id: "guest-3",
        check_in_date: new Date(2025, 5, 15).toISOString(),
        check_out_date: new Date(2025, 5, 22).toISOString(),
        status: "confirmed",
        total_price: 3150,
        payment_status: "paid",
        special_requests: null,
        booking_source: "booking",
      },
      {
        id: "4",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hotel_id: hotelId,
        room_id: "room-202",
        guest_id: "guest-4",
        check_in_date: new Date(2025, 5, 11).toISOString(),
        check_out_date: new Date(2025, 5, 13).toISOString(),
        status: "confirmed",
        total_price: 900,
        payment_status: "paid",
        special_requests: null,
        booking_source: "direct",
      },
      {
        id: "5",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hotel_id: hotelId,
        room_id: "room-301",
        guest_id: "guest-5",
        check_in_date: new Date(2025, 5, 11).toISOString(),
        check_out_date: new Date(2025, 5, 12).toISOString(),
        status: "confirmed",
        total_price: 450,
        payment_status: "pending",
        special_requests: null,
        booking_source: "direct",
      },
      {
        id: "6",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hotel_id: hotelId,
        room_id: "room-103",
        guest_id: "guest-6",
        check_in_date: new Date(2025, 5, 13).toISOString(),
        check_out_date: new Date(2025, 5, 15).toISOString(),
        status: "confirmed",
        total_price: 900,
        payment_status: "paid",
        special_requests: null,
        booking_source: "direct",
      },
      {
        id: "7",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hotel_id: hotelId,
        room_id: "room-201",
        guest_id: "guest-7",
        check_in_date: new Date(2025, 5, 19).toISOString(),
        check_out_date: new Date(2025, 5, 21).toISOString(),
        status: "confirmed",
        total_price: 900,
        payment_status: "paid",
        special_requests: null,
        booking_source: "direct",
      },
      {
        id: "8",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hotel_id: hotelId,
        room_id: "room-301",
        guest_id: "guest-8",
        check_in_date: new Date(2025, 5, 8).toISOString(),
        check_out_date: new Date(2025, 5, 11).toISOString(),
        status: "confirmed",
        total_price: 1650,
        payment_status: "paid",
        special_requests: null,
        booking_source: "direct",
      },
      {
        id: "9",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hotel_id: hotelId,
        room_id: "room-101",
        guest_id: "guest-9",
        check_in_date: new Date(2025, 5, 13).toISOString(),
        check_out_date: new Date(2025, 5, 15).toISOString(),
        status: "confirmed",
        total_price: 1100,
        payment_status: "paid",
        special_requests: null,
        booking_source: "direct",
      },
      {
        id: "10",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hotel_id: hotelId,
        room_id: "room-102",
        guest_id: "guest-10",
        check_in_date: new Date(2025, 5, 19).toISOString(),
        check_out_date: new Date(2025, 5, 22).toISOString(),
        status: "confirmed",
        total_price: 1650,
        payment_status: "paid",
        special_requests: null,
        booking_source: "direct",
      },
      {
        id: "11",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hotel_id: hotelId,
        room_id: "room-103",
        guest_id: "guest-11",
        check_in_date: new Date(2025, 5, 13).toISOString(),
        check_out_date: new Date(2025, 5, 14).toISOString(),
        status: "confirmed",
        total_price: 250,
        payment_status: "paid",
        special_requests: null,
        booking_source: "direct",
      },
      {
        id: "12",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hotel_id: hotelId,
        room_id: "room-202",
        guest_id: "guest-12",
        check_in_date: new Date(2025, 5, 13).toISOString(),
        check_out_date: new Date(2025, 5, 14).toISOString(),
        status: "confirmed",
        total_price: 250,
        payment_status: "paid",
        special_requests: null,
        booking_source: "direct",
      },
    ]
  } catch (error) {
    console.error("Error fetching reservations:", error)
    return []
  }
}

// Function to fetch guests from Supabase
export async function fetchGuests(hotelId: string): Promise<Guest[]> {
  try {
    // In a real implementation, this would fetch from Supabase
    // For now, we'll return mock data
    return [
      {
        id: "guest-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hotel_id: hotelId,
        full_name: "Aline Knorst",
        email: "aline@example.com",
        phone: "123456789",
        document_type: "CPF",
        document_number: "123.456.789-00",
        nationality: "Brasileira",
        address: "Rua A, 123",
        notes: null,
        vip_status: false,
      },
      {
        id: "guest-2",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hotel_id: hotelId,
        full_name: "Odinir Bento Garcia",
        email: "odinir@example.com",
        phone: "987654321",
        document_type: "CPF",
        document_number: "987.654.321-00",
        nationality: "Brasileiro",
        address: "Rua B, 456",
        notes: null,
        vip_status: false,
      },
      {
        id: "guest-3",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hotel_id: hotelId,
        full_name: "Auré Pompei",
        email: "aure@example.com",
        phone: "123789456",
        document_type: "CPF",
        document_number: "123.789.456-00",
        nationality: "Brasileira",
        address: "Rua C, 789",
        notes: null,
        vip_status: true,
      },
      {
        id: "guest-4",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hotel_id: hotelId,
        full_name: "Marcos Silva",
        email: "marcos@example.com",
        phone: "456123789",
        document_type: "CPF",
        document_number: "456.123.789-00",
        nationality: "Brasileiro",
        address: "Rua D, 012",
        notes: null,
        vip_status: false,
      },
      {
        id: "guest-5",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hotel_id: hotelId,
        full_name: "Maria Santos",
        email: "maria@example.com",
        phone: "789456123",
        document_type: "CPF",
        document_number: "789.456.123-00",
        nationality: "Brasileira",
        address: "Rua E, 345",
        notes: null,
        vip_status: false,
      },
      {
        id: "guest-6",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hotel_id: hotelId,
        full_name: "Lisandra Costa",
        email: "lisandra@example.com",
        phone: "321654987",
        document_type: "CPF",
        document_number: "321.654.987-00",
        nationality: "Brasileira",
        address: "Rua F, 678",
        notes: null,
        vip_status: false,
      },
      {
        id: "guest-7",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hotel_id: hotelId,
        full_name: "Cleide Padilha",
        email: "cleide@example.com",
        phone: "654987321",
        document_type: "CPF",
        document_number: "654.987.321-00",
        nationality: "Brasileira",
        address: "Rua G, 901",
        notes: null,
        vip_status: false,
      },
      {
        id: "guest-8",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hotel_id: hotelId,
        full_name: "Everton Leite",
        email: "everton@example.com",
        phone: "987321654",
        document_type: "CPF",
        document_number: "987.321.654-00",
        nationality: "Brasileiro",
        address: "Rua H, 234",
        notes: null,
        vip_status: false,
      },
      {
        id: "guest-9",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hotel_id: hotelId,
        full_name: "Gabriela Pereira",
        email: "gabriela@example.com",
        phone: "321987654",
        document_type: "CPF",
        document_number: "321.987.654-00",
        nationality: "Brasileira",
        address: "Rua I, 567",
        notes: null,
        vip_status: false,
      },
      {
        id: "guest-10",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hotel_id: hotelId,
        full_name: "Patricia Pozza Tartaro",
        email: "patricia@example.com",
        phone: "654321987",
        document_type: "CPF",
        document_number: "654.321.987-00",
        nationality: "Brasileira",
        address: "Rua J, 890",
        notes: null,
        vip_status: true,
      },
      {
        id: "guest-11",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hotel_id: hotelId,
        full_name: "Daniel Souza",
        email: "daniel@example.com",
        phone: "123456780",
        document_type: "CPF",
        document_number: "123.456.780-00",
        nationality: "Brasileiro",
        address: "Rua K, 123",
        notes: null,
        vip_status: false,
      },
      {
        id: "guest-12",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hotel_id: hotelId,
        full_name: "Daniela Oliveira",
        email: "daniela@example.com",
        phone: "987654320",
        document_type: "CPF",
        document_number: "987.654.320-00",
        nationality: "Brasileira",
        address: "Rua L, 456",
        notes: null,
        vip_status: false,
      },
    ]
  } catch (error) {
    console.error("Error fetching guests:", error)
    return []
  }
}

// Function to update a reservation
export async function updateReservation(reservation: Partial<Reservation>): Promise<Reservation | null> {
  try {
    // In a real implementation, this would update in Supabase
    console.log("Updating reservation:", reservation)
    // Return the updated reservation (mock)
    return {
      id: reservation.id || "",
      created_at: reservation.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      hotel_id: reservation.hotel_id || "",
      room_id: reservation.room_id || "",
      guest_id: reservation.guest_id || "",
      check_in_date: reservation.check_in_date || "",
      check_out_date: reservation.check_out_date || "",
      status: reservation.status || "confirmed",
      total_price: reservation.total_price || 0,
      payment_status: reservation.payment_status || "pending",
      special_requests: reservation.special_requests || null,
      booking_source: reservation.booking_source || null,
    }
  } catch (error) {
    console.error("Error updating reservation:", error)
    return null
  }
}
