import { createClient } from "@/lib/supabase/client"
import { eventBus } from "@/lib/core/event-bus"

export interface RoomStatusUpdate {
  roomId: string
  status: string
  hotelId: string
  updatedBy?: string
  notes?: string
}

export async function updateRoomStatus(
  roomId: string,
  status: string,
  hotelId: string,
  updatedBy?: string,
  notes?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    // Atualizar status do quarto
    const { error: roomError } = await supabase
      .from("rooms")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", roomId)
      .eq("hotel_id", hotelId)

    if (roomError) {
      console.error("Error updating room status:", roomError)
      return { success: false, error: roomError.message }
    }

    // Criar log de mudança de status
    const { error: logError } = await supabase.from("room_status_logs").insert({
      room_id: roomId,
      hotel_id: hotelId,
      previous_status: null, // TODO: buscar status anterior
      new_status: status,
      changed_by: updatedBy,
      notes,
      created_at: new Date().toISOString(),
    })

    if (logError) {
      console.warn("Error creating status log:", logError)
      // Não falha a operação se o log não for criado
    }

    // Emitir evento para outros módulos
    eventBus.emit("room_status_changed", {
      roomId,
      status,
      hotelId,
      updatedBy,
      notes,
      timestamp: new Date().toISOString(),
    })

    // Verificar se precisa atualizar reservas
    if (status === "maintenance" || status === "out_of_order") {
      await handleRoomUnavailable(roomId, hotelId)
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error in updateRoomStatus:", error)
    return { success: false, error: error.message }
  }
}

async function handleRoomUnavailable(roomId: string, hotelId: string) {
  try {
    const supabase = createClient()

    // Buscar reservas futuras para este quarto
    const { data: reservations, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("room_id", roomId)
      .eq("hotel_id", hotelId)
      .gte("check_in_date", new Date().toISOString())
      .in("status", ["confirmed", "pending"])

    if (error) {
      console.error("Error fetching reservations:", error)
      return
    }

    if (reservations && reservations.length > 0) {
      // Emitir evento para o módulo de reservas
      eventBus.emit("room_unavailable_with_reservations", {
        roomId,
        hotelId,
        affectedReservations: reservations,
        reason: "room_maintenance",
      })
    }
  } catch (error) {
    console.error("Error handling room unavailable:", error)
  }
}

export async function getRoomStatus(roomId: string, hotelId: string) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("rooms")
      .select("status, updated_at")
      .eq("id", roomId)
      .eq("hotel_id", hotelId)
      .single()

    if (error) {
      console.error("Error getting room status:", error)
      return { status: null, error: error.message }
    }

    return { status: data.status, updatedAt: data.updated_at }
  } catch (error: any) {
    console.error("Error in getRoomStatus:", error)
    return { status: null, error: error.message }
  }
}

export async function getRoomStatusHistory(roomId: string, hotelId: string, limit = 10) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("room_status_logs")
      .select("*")
      .eq("room_id", roomId)
      .eq("hotel_id", hotelId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error getting room status history:", error)
      return { data: [], error: error.message }
    }

    return { data, error: null }
  } catch (error: any) {
    console.error("Error in getRoomStatusHistory:", error)
    return { data: [], error: error.message }
  }
}
