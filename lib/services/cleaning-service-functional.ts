import { createClient } from "@/lib/supabase/client"

export interface Room {
  id: string
  hotel_id: string
  room_number: string
  room_type: string
  floor_number: number
  status: string
  capacity: number
  price_per_night?: number
  description?: string
  created_at: string
  updated_at: string
}

export interface CleaningPersonnel {
  id: string
  hotel_id: string
  name: string
  email?: string
  phone?: string
  is_active: boolean
  specialties?: string[]
  hourly_rate?: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface CleaningTask {
  id: string
  hotel_id: string
  room_id?: string
  title: string
  description?: string
  task_type: string
  status: string
  priority: string
  assigned_personnel_id?: string
  scheduled_for?: string
  started_at?: string
  completed_at?: string
  estimated_duration?: number
  actual_duration?: number
  notes?: string
  checklist_items?: Record<string, any>
  checklist_progress?: Record<string, any>
  location?: string
  created_at: string
  updated_at: string
  room?: Room
  assigned_personnel?: CleaningPersonnel
}

// Constante para o hotel ID (em produção, isso viria do contexto de autenticação)
const HOTEL_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"

// ==================== ROOMS ====================
export async function getRooms(hotelId: string = HOTEL_ID) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("hotel_id", hotelId)
      .order("room_number", { ascending: true })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error: any) {
    return { data: [], error: error.message }
  }
}

export async function updateRoomStatus(roomId: string, status: string) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("rooms")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", roomId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

// ==================== CLEANING PERSONNEL ====================
export async function getCleaningPersonnel(hotelId: string = HOTEL_ID) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("cleaning_personnel")
      .select("*")
      .eq("hotel_id", hotelId)
      .eq("is_active", true)
      .order("name", { ascending: true })

    if (error) throw error
    return { data: data || [], error: null }
  } catch (error: any) {
    return { data: [], error: error.message }
  }
}

export async function createCleaningPersonnel(personnelData: Partial<CleaningPersonnel>) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("cleaning_personnel").insert(personnelData).select().single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

// ==================== CLEANING TASKS ====================
export async function getCleaningTasks(hotelId: string = HOTEL_ID, filters?: any) {
  try {
    const supabase = createClient()
    let query = supabase
      .from("cleaning_tasks")
      .select(`
        *,
        room:rooms(id, room_number, room_type, floor_number),
        assigned_personnel:cleaning_personnel(id, name, email, phone)
      `)
      .eq("hotel_id", hotelId)
      .order("created_at", { ascending: false })

    if (filters?.status) {
      query = query.eq("status", filters.status)
    }

    const { data, error } = await query
    if (error) throw error
    return { data: data || [], error: null }
  } catch (error: any) {
    return { data: [], error: error.message }
  }
}

export async function createCleaningTask(taskData: Partial<CleaningTask>) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("cleaning_tasks").insert(taskData).select().single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export async function updateCleaningTask(taskId: string, updates: Partial<CleaningTask>) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("cleaning_tasks")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", taskId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export async function startCleaningTask(taskId: string) {
  return updateCleaningTask(taskId, {
    status: "in-progress",
    started_at: new Date().toISOString(),
  })
}

export async function completeCleaningTask(taskId: string, notes?: string) {
  return updateCleaningTask(taskId, {
    status: "completed",
    completed_at: new Date().toISOString(),
    notes,
  })
}

export async function assignTaskToPersonnel(taskId: string, personnelId: string) {
  return updateCleaningTask(taskId, {
    assigned_personnel_id: personnelId,
  })
}

// ==================== DASHBOARD ====================
export async function getCleaningDashboardData(hotelId: string = HOTEL_ID) {
  try {
    const supabase = createClient()

    // Buscar estatísticas dos quartos
    const { data: rooms, error: roomsError } = await supabase.from("rooms").select("status").eq("hotel_id", hotelId)

    if (roomsError) throw roomsError

    // Buscar estatísticas das tarefas
    const { data: tasks, error: tasksError } = await supabase
      .from("cleaning_tasks")
      .select("status, priority")
      .eq("hotel_id", hotelId)

    if (tasksError) throw tasksError

    // Buscar pessoal ativo
    const { data: personnel, error: personnelError } = await supabase
      .from("cleaning_personnel")
      .select("is_active")
      .eq("hotel_id", hotelId)

    if (personnelError) throw personnelError

    // Processar estatísticas
    const roomsByStatus = rooms?.reduce((acc: any, room) => {
      acc[room.status] = (acc[room.status] || 0) + 1
      return acc
    }, {})

    const tasksByStatus = tasks?.reduce((acc: any, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    }, {})

    const activePersonnel = personnel?.filter((p) => p.is_active).length || 0

    return {
      data: {
        rooms: {
          total: rooms?.length || 0,
          byStatus: roomsByStatus || {},
        },
        tasks: {
          total: tasks?.length || 0,
          byStatus: tasksByStatus || {},
        },
        personnel: {
          active: activePersonnel,
          total: personnel?.length || 0,
        },
      },
      error: null,
    }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}
