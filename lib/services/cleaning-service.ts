import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export interface CleaningTask {
  id: string
  hotel_id: string
  room_id?: string
  title: string
  description?: string
  task_type: "daily" | "deep" | "checkout" | "maintenance" | "inspection"
  status: "pending" | "in_progress" | "completed" | "verified" | "failed"
  assigned_to?: string
  priority: number
  estimated_duration?: number
  actual_duration?: number
  scheduled_for: string
  started_at?: string
  completed_at?: string
  verified_at?: string
  verified_by?: string
  checklist: any[]
  notes?: string
  images: string[]
  created_at: string
  updated_at: string
}

export const getCleaningTasks = async (hotelId: string) => {
  try {
    const { data, error } = await supabase
      .from("cleaning_tasks")
      .select(`
        *,
        room:rooms(room_number, room_type),
        assigned_personnel:user_profiles(full_name)
      `)
      .eq("hotel_id", hotelId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching cleaning tasks:", error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return { data: null, error: error.message }
  }
}

export const getCleaningDashboardData = async (hotelId: string) => {
  try {
    // Get rooms data
    const { data: rooms, error: roomsError } = await supabase.from("rooms").select("id, status").eq("hotel_id", hotelId)

    if (roomsError) {
      console.error("Error fetching rooms:", roomsError)
      return { data: null, error: roomsError.message }
    }

    // Get tasks data
    const { data: tasks, error: tasksError } = await supabase
      .from("cleaning_tasks")
      .select("id, status")
      .eq("hotel_id", hotelId)

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError)
      return { data: null, error: tasksError.message }
    }

    // Get personnel data
    const { data: personnel, error: personnelError } = await supabase
      .from("user_profiles")
      .select("id, is_active")
      .eq("user_role", "hotel_staff")

    if (personnelError) {
      console.error("Error fetching personnel:", personnelError)
      return { data: null, error: personnelError.message }
    }

    // Process the data
    const roomsByStatus =
      rooms?.reduce((acc: any, room) => {
        acc[room.status] = (acc[room.status] || 0) + 1
        return acc
      }, {}) || {}

    const tasksByStatus =
      tasks?.reduce((acc: any, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1
        return acc
      }, {}) || {}

    const dashboardData = {
      rooms: {
        total: rooms?.length || 0,
        byStatus: roomsByStatus,
      },
      tasks: {
        total: tasks?.length || 0,
        byStatus: tasksByStatus,
      },
      personnel: {
        total: personnel?.length || 0,
        active: personnel?.filter((p) => p.is_active).length || 0,
      },
    }

    return { data: dashboardData, error: null }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return { data: null, error: error.message }
  }
}

export const startCleaningTask = async (taskId: string) => {
  try {
    const { data, error } = await supabase
      .from("cleaning_tasks")
      .update({
        status: "in_progress",
        started_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .select()
      .single()

    if (error) {
      console.error("Error starting task:", error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return { data: null, error: error.message }
  }
}

export const completeCleaningTask = async (taskId: string, notes?: string) => {
  try {
    const { data, error } = await supabase
      .from("cleaning_tasks")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        notes: notes || null,
      })
      .eq("id", taskId)
      .select()
      .single()

    if (error) {
      console.error("Error completing task:", error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return { data: null, error: error.message }
  }
}

export const createCleaningTask = async (task: Omit<CleaningTask, "id" | "created_at" | "updated_at">) => {
  try {
    const { data, error } = await supabase.from("cleaning_tasks").insert(task).select().single()

    if (error) {
      console.error("Error creating task:", error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return { data: null, error: error.message }
  }
}
