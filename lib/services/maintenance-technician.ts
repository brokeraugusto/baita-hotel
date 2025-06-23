import { createClient } from "@/lib/supabase/client"

export interface MaintenanceTechnician {
  id: string
  name: string
  email: string | null
  phone: string | null
  specialties: string[] | null
  hourly_rate: number | null
  is_active: boolean
}

// Get maintenance technicians
export async function getMaintenanceTechnicians(onlyActive = true): Promise<MaintenanceTechnician[]> {
  try {
    const supabase = createClient()

    let query = supabase.from("maintenance_technicians").select("*").order("name")

    if (onlyActive) {
      query = query.eq("is_active", true)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching maintenance technicians:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getMaintenanceTechnicians:", error)
    return []
  }
}

// Get a single maintenance technician by ID
export async function getMaintenanceTechnicianById(id: string): Promise<MaintenanceTechnician | null> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.from("maintenance_technicians").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching maintenance technician:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getMaintenanceTechnicianById:", error)
    return null
  }
}
