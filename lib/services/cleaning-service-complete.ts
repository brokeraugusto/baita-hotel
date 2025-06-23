import { createClient } from "@/lib/supabase/client"
import type { CleaningPersonnel, CleaningTaskInsert, CleaningPersonnelInsert } from "@/types"

// ==================== CLEANING TASKS CRUD ====================

export async function createCleaningTask(taskData: CleaningTaskInsert) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("cleaning_tasks")
      .insert({
        ...taskData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating cleaning task:", error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error: any) {
    console.error("Error in createCleaningTask:", error)
    return { data: null, error: error.message }
  }
}

export async function getCleaningTasks(
  hotelId: string,
  filters?: {
    status?: string
    roomId?: string
    personnelId?: string
    dateFrom?: string
    dateTo?: string
    priority?: string
  },
) {
  try {
    const supabase = createClient()

    let query = supabase
      .from("cleaning_tasks")
      .select(`
        *,
        room:rooms(number, type),
        assigned_personnel:cleaning_personnel(name, email)
      `)
      .eq("hotel_id", hotelId)
      .order("created_at", { ascending: false })

    // Aplicar filtros
    if (filters?.status) {
      query = query.eq("status", filters.status)
    }
    if (filters?.roomId) {
      query = query.eq("room_id", filters.roomId)
    }
    if (filters?.personnelId) {
      query = query.eq("assigned_personnel_id", filters.personnelId)
    }
    if (filters?.priority) {
      query = query.eq("priority", filters.priority)
    }
    if (filters?.dateFrom) {
      query = query.gte("scheduled_for", filters.dateFrom)
    }
    if (filters?.dateTo) {
      query = query.lte("scheduled_for", filters.dateTo)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching cleaning tasks:", error)
      return { data: [], error: error.message }
    }

    return { data: data || [], error: null }
  } catch (error: any) {
    console.error("Error in getCleaningTasks:", error)
    return { data: [], error: error.message }
  }
}

const supabase = createClient()

export const getCleaningTaskById = async (taskId: string) => {
  try {
    const { data, error } = await supabase
      .from("cleaning_tasks")
      .select(`
        *,
        room:rooms(room_number, room_type),
        assigned_personnel:user_profiles(full_name)
      `)
      .eq("id", taskId)
      .single()

    if (error) {
      console.error("Error fetching cleaning task:", error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return { data: null, error: error.message }
  }
}

export const updateCleaningTask = async (taskId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from("cleaning_tasks")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .select()
      .single()

    if (error) {
      console.error("Error updating cleaning task:", error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return { data: null, error: error.message }
  }
}

export async function deleteCleaningTask(taskId: string) {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("cleaning_tasks").delete().eq("id", taskId)

    if (error) {
      console.error("Error deleting cleaning task:", error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error: any) {
    console.error("Error in deleteCleaningTask:", error)
    return { success: false, error: error.message }
  }
}

// ==================== CLEANING PERSONNEL CRUD ====================

export async function createCleaningPersonnel(personnelData: CleaningPersonnelInsert) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("cleaning_personnel")
      .insert({
        ...personnelData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating cleaning personnel:", error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error: any) {
    console.error("Error in createCleaningPersonnel:", error)
    return { data: null, error: error.message }
  }
}

export const getCleaningPersonnel = async (hotelId: string) => {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("id, full_name as name, is_active")
      .eq("user_role", "hotel_staff")
      .eq("is_active", true)

    if (error) {
      console.error("Error fetching personnel:", error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return { data: null, error: error.message }
  }
}

export async function updateCleaningPersonnel(personnelId: string, updates: Partial<CleaningPersonnel>) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("cleaning_personnel")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", personnelId)
      .select()
      .single()

    if (error) {
      console.error("Error updating cleaning personnel:", error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error: any) {
    console.error("Error in updateCleaningPersonnel:", error)
    return { data: null, error: error.message }
  }
}

//The function below was a duplicate and has been removed.
/*export const deleteCleaningTask = async (taskId: string) => {
  try {
    const { error } = await supabase
      .from('cleaning_tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      console.error('Error deleting cleaning task:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return { error: error.message }
  }
}*/

// ==================== ROOMS CRUD ====================

export async function getRooms(hotelId: string) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("hotel_id", hotelId)
      .order("number", { ascending: true })

    if (error) {
      console.error("Error fetching rooms:", error)
      return { data: [], error: error.message }
    }

    return { data: data || [], error: null }
  } catch (error: any) {
    console.error("Error in getRooms:", error)
    return { data: [], error: error.message }
  }
}

export async function updateRoomStatus(roomId: string, status: string, hotelId: string) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("rooms")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", roomId)
      .eq("hotel_id", hotelId)
      .select()
      .single()

    if (error) {
      console.error("Error updating room status:", error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error: any) {
    console.error("Error in updateRoomStatus:", error)
    return { data: null, error: error.message }
  }
}

// ==================== DASHBOARD & ANALYTICS ====================

export async function getCleaningDashboardData(hotelId: string) {
  try {
    const supabase = createClient()

    // Buscar estatísticas das tarefas
    const { data: taskStats, error: taskStatsError } = await supabase
      .from("cleaning_tasks")
      .select("status, priority")
      .eq("hotel_id", hotelId)

    if (taskStatsError) {
      console.error("Error fetching task stats:", taskStatsError)
      return { data: null, error: taskStatsError.message }
    }

    // Buscar status dos quartos
    const { data: roomStats, error: roomStatsError } = await supabase
      .from("rooms")
      .select("status")
      .eq("hotel_id", hotelId)

    if (roomStatsError) {
      console.error("Error fetching room stats:", roomStatsError)
      return { data: null, error: roomStatsError.message }
    }

    // Buscar pessoal ativo
    const { data: personnelStats, error: personnelStatsError } = await supabase
      .from("cleaning_personnel")
      .select("is_active")
      .eq("hotel_id", hotelId)

    if (personnelStatsError) {
      console.error("Error fetching personnel stats:", personnelStatsError)
      return { data: null, error: personnelStatsError.message }
    }

    // Processar estatísticas
    const tasksByStatus = taskStats?.reduce(
      (acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const tasksByPriority = taskStats?.reduce(
      (acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const roomsByStatus = roomStats?.reduce(
      (acc, room) => {
        acc[room.status] = (acc[room.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const activePersonnel = personnelStats?.filter((p) => p.is_active).length || 0
    const totalPersonnel = personnelStats?.length || 0

    return {
      data: {
        tasks: {
          total: taskStats?.length || 0,
          byStatus: tasksByStatus || {},
          byPriority: tasksByPriority || {},
        },
        rooms: {
          total: roomStats?.length || 0,
          byStatus: roomsByStatus || {},
        },
        personnel: {
          active: activePersonnel,
          total: totalPersonnel,
        },
      },
      error: null,
    }
  } catch (error: any) {
    console.error("Error in getCleaningDashboardData:", error)
    return { data: null, error: error.message }
  }
}
