import { createClient } from "@/lib/supabase/client"

export interface MaintenanceCategory {
  id: string
  name: string
  description: string | null
  color: string
  is_active: boolean
}

// Get maintenance categories
export async function getMaintenanceCategories(onlyActive = true): Promise<MaintenanceCategory[]> {
  try {
    const supabase = createClient()

    let query = supabase.from("maintenance_categories").select("*").order("name")

    if (onlyActive) {
      query = query.eq("is_active", true)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching maintenance categories:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getMaintenanceCategories:", error)
    return []
  }
}

// Get a single maintenance category by ID
export async function getMaintenanceCategoryById(id: string): Promise<MaintenanceCategory | null> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.from("maintenance_categories").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching maintenance category:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getMaintenanceCategoryById:", error)
    return null
  }
}
