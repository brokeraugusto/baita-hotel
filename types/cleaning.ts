export interface CleaningTask {
  id: string
  hotel_id: string
  room_id?: string
  location?: string
  title: string
  description?: string
  task_type: string
  status: "pending" | "in-progress" | "completed" | "cancelled" | "paused"
  priority: "low" | "medium" | "high" | "urgent"
  assigned_personnel_id?: string
  scheduled_for?: string
  completed_at?: string
  estimated_duration?: number
  actual_duration?: number
  checklist_progress?: Record<string, boolean>
  notes?: string
  created_at: string
  updated_at: string
}

export interface CleaningTaskInsert {
  hotel_id: string
  room_id?: string
  location?: string
  title: string
  description?: string
  task_type: string
  status?: "pending" | "in-progress" | "completed" | "cancelled" | "paused"
  priority?: "low" | "medium" | "high" | "urgent"
  assigned_personnel_id?: string
  scheduled_for?: string
  estimated_duration?: number
  notes?: string
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

export interface CleaningPersonnelInsert {
  hotel_id: string
  name: string
  email?: string
  phone?: string
  is_active?: boolean
  specialties?: string[]
  hourly_rate?: number
  notes?: string
}

export interface Room {
  id: string
  hotel_id: string
  number: string
  type: string
  floor?: number
  status: "clean" | "dirty" | "in-progress" | "maintenance" | "inspection" | "out-of-order"
  capacity?: number
  created_at: string
  updated_at: string
}
