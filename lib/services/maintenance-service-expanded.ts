import { createClient } from "@/lib/supabase/client"

export interface MaintenanceTemplate {
  id: string
  name: string
  description: string | null
  category_id: string | null
  maintenance_type: "corrective" | "preventive" | "emergency" | "inspection"
  recurrence_type: "none" | "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
  estimated_duration: number | null
  estimated_cost: number | null
  checklist: string[] | null
  instructions: string | null
  required_tools: string[] | null
  safety_notes: string | null
  is_active: boolean
}

export interface MaintenanceInspection {
  id: string
  maintenance_order_id: string
  inspector_id: string | null
  inspection_date: string
  checklist_results: Record<string, boolean> | null
  findings: string | null
  recommendations: string | null
  passed: boolean | null
  next_inspection_date: string | null
  photos: string[] | null
}

export interface MaintenanceMaterial {
  id: string
  name: string
  description: string | null
  category: string | null
  unit_price: number | null
  stock_quantity: number
  minimum_stock: number
  supplier_info: Record<string, any> | null
  is_active: boolean
}

export interface MaintenanceOrderMaterial {
  id: string
  maintenance_order_id: string
  material_id: string
  quantity_used: number
  unit_cost: number | null
  total_cost: number | null
  notes: string | null
}

export interface EmergencyMaintenanceOrder {
  hotel_id: string
  title: string
  description: string
  room_id?: string | null
  emergency_level: "low" | "medium" | "high" | "critical"
  assigned_technician_id?: string | null
  estimated_cost?: number | null
  notes?: string | null
}

export interface PreventiveMaintenanceOrder {
  hotel_id: string
  template_id?: string | null
  title: string
  description: string
  room_id?: string | null
  category_id?: string | null
  recurrence_type: "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
  scheduled_date: string
  assigned_technician_id?: string | null
  estimated_cost?: number | null
  estimated_duration?: number | null
  notes?: string | null
}

export interface InspectionOrder {
  hotel_id: string
  template_id?: string | null
  title: string
  description: string
  room_id?: string | null
  category_id?: string | null
  scheduled_date: string
  inspector_id?: string | null
  checklist: string[] | null
  notes?: string | null
}

// Get maintenance templates
export async function getMaintenanceTemplates(
  maintenanceType?: string,
  onlyActive = true,
): Promise<MaintenanceTemplate[]> {
  try {
    const supabase = createClient()

    let query = supabase.from("maintenance_templates").select("*").order("name")

    if (onlyActive) {
      query = query.eq("is_active", true)
    }

    if (maintenanceType) {
      query = query.eq("maintenance_type", maintenanceType)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching maintenance templates:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getMaintenanceTemplates:", error)
    return []
  }
}

// Create emergency maintenance order
export async function createEmergencyMaintenanceOrder(order: EmergencyMaintenanceOrder): Promise<string | null> {
  try {
    const supabase = createClient()

    const newOrder = {
      ...order,
      maintenance_type: "emergency" as const,
      is_emergency: true,
      priority: order.emergency_level === "critical" ? "urgent" : "high",
      status: "pending" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("maintenance_orders").insert([newOrder]).select().single()

    if (error) {
      console.error("Error creating emergency maintenance order:", error)
      return null
    }

    return data.id
  } catch (error) {
    console.error("Error in createEmergencyMaintenanceOrder:", error)
    return null
  }
}

// Create preventive maintenance order
export async function createPreventiveMaintenanceOrder(order: PreventiveMaintenanceOrder): Promise<string | null> {
  try {
    const supabase = createClient()

    // Calculate next occurrence based on recurrence type
    const scheduledDate = new Date(order.scheduled_date)
    let nextOccurrence: Date | null = null

    switch (order.recurrence_type) {
      case "daily":
        nextOccurrence = new Date(scheduledDate.getTime() + 24 * 60 * 60 * 1000)
        break
      case "weekly":
        nextOccurrence = new Date(scheduledDate.getTime() + 7 * 24 * 60 * 60 * 1000)
        break
      case "monthly":
        nextOccurrence = new Date(scheduledDate)
        nextOccurrence.setMonth(nextOccurrence.getMonth() + 1)
        break
      case "quarterly":
        nextOccurrence = new Date(scheduledDate)
        nextOccurrence.setMonth(nextOccurrence.getMonth() + 3)
        break
      case "yearly":
        nextOccurrence = new Date(scheduledDate)
        nextOccurrence.setFullYear(nextOccurrence.getFullYear() + 1)
        break
    }

    const newOrder = {
      ...order,
      maintenance_type: "preventive" as const,
      is_emergency: false,
      priority: "medium" as const,
      status: "pending" as const,
      scheduled_date: order.scheduled_date,
      next_occurrence: nextOccurrence?.toISOString() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("maintenance_orders").insert([newOrder]).select().single()

    if (error) {
      console.error("Error creating preventive maintenance order:", error)
      return null
    }

    return data.id
  } catch (error) {
    console.error("Error in createPreventiveMaintenanceOrder:", error)
    return null
  }
}

// Create inspection order
export async function createInspectionOrder(order: InspectionOrder): Promise<string | null> {
  try {
    const supabase = createClient()

    const newOrder = {
      hotel_id: order.hotel_id,
      title: order.title,
      description: order.description,
      room_id: order.room_id || null,
      category_id: order.category_id || null,
      maintenance_type: "inspection" as const,
      is_emergency: false,
      priority: "low" as const,
      status: "pending" as const,
      assigned_technician_id: order.inspector_id || null,
      scheduled_date: order.scheduled_date,
      inspection_checklist: order.checklist || null,
      notes: order.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("maintenance_orders").insert([newOrder]).select().single()

    if (error) {
      console.error("Error creating inspection order:", error)
      return null
    }

    return data.id
  } catch (error) {
    console.error("Error in createInspectionOrder:", error)
    return null
  }
}

// Get maintenance materials
export async function getMaintenanceMaterials(category?: string, onlyActive = true): Promise<MaintenanceMaterial[]> {
  try {
    const supabase = createClient()

    let query = supabase.from("maintenance_materials").select("*").order("name")

    if (onlyActive) {
      query = query.eq("is_active", true)
    }

    if (category) {
      query = query.eq("category", category)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching maintenance materials:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getMaintenanceMaterials:", error)
    return []
  }
}

// Add materials to maintenance order
export async function addMaterialsToOrder(
  orderId: string,
  materials: { material_id: string; quantity_used: number; unit_cost?: number; notes?: string }[],
): Promise<boolean> {
  try {
    const supabase = createClient()

    const materialsToInsert = materials.map((material) => ({
      maintenance_order_id: orderId,
      material_id: material.material_id,
      quantity_used: material.quantity_used,
      unit_cost: material.unit_cost || null,
      total_cost: material.unit_cost ? material.unit_cost * material.quantity_used : null,
      notes: material.notes || null,
      created_at: new Date().toISOString(),
    }))

    const { error } = await supabase.from("maintenance_order_materials").insert(materialsToInsert)

    if (error) {
      console.error("Error adding materials to order:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in addMaterialsToOrder:", error)
    return false
  }
}

// Complete inspection with results
export async function completeInspection(
  orderId: string,
  inspectionData: {
    inspector_id: string
    checklist_results: Record<string, boolean>
    findings: string
    recommendations: string
    passed: boolean
    photos?: string[]
    next_inspection_date?: string
  },
): Promise<boolean> {
  try {
    const supabase = createClient()

    // Create inspection record
    const inspection = {
      maintenance_order_id: orderId,
      inspector_id: inspectionData.inspector_id,
      inspection_date: new Date().toISOString(),
      checklist_results: inspectionData.checklist_results,
      findings: inspectionData.findings,
      recommendations: inspectionData.recommendations,
      passed: inspectionData.passed,
      next_inspection_date: inspectionData.next_inspection_date || null,
      photos: inspectionData.photos || null,
    }

    const { error: inspectionError } = await supabase.from("maintenance_inspections").insert([inspection])

    if (inspectionError) {
      console.error("Error creating inspection record:", inspectionError)
      return false
    }

    // Update maintenance order
    const { error: orderError } = await supabase
      .from("maintenance_orders")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        completion_notes: inspectionData.findings,
        quality_rating: inspectionData.passed ? 5 : 2,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (orderError) {
      console.error("Error updating maintenance order:", orderError)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in completeInspection:", error)
    return false
  }
}

// Get pending preventive maintenance
export async function getPendingPreventiveMaintenance(hotelId: string): Promise<any[]> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("maintenance_orders")
      .select("*")
      .eq("hotel_id", hotelId)
      .eq("maintenance_type", "preventive")
      .in("status", ["pending", "in-progress"])
      .lte("next_occurrence", new Date().toISOString())
      .order("next_occurrence")

    if (error) {
      console.error("Error fetching pending preventive maintenance:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getPendingPreventiveMaintenance:", error)
    return []
  }
}

// Get emergency maintenance statistics
export async function getEmergencyMaintenanceStats(hotelId: string): Promise<{
  totalEmergencies: number
  criticalEmergencies: number
  averageResponseTime: string
  emergenciesThisMonth: number
}> {
  try {
    const supabase = createClient()

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: totalEmergencies } = await supabase
      .from("maintenance_orders")
      .select("*", { count: "exact", head: true })
      .eq("hotel_id", hotelId)
      .eq("is_emergency", true)

    const { count: criticalEmergencies } = await supabase
      .from("maintenance_orders")
      .select("*", { count: "exact", head: true })
      .eq("hotel_id", hotelId)
      .eq("is_emergency", true)
      .eq("emergency_level", "critical")

    const { count: emergenciesThisMonth } = await supabase
      .from("maintenance_orders")
      .select("*", { count: "exact", head: true })
      .eq("hotel_id", hotelId)
      .eq("is_emergency", true)
      .gte("created_at", startOfMonth.toISOString())

    return {
      totalEmergencies: totalEmergencies || 0,
      criticalEmergencies: criticalEmergencies || 0,
      averageResponseTime: "45min", // Calcular baseado em dados reais
      emergenciesThisMonth: emergenciesThisMonth || 0,
    }
  } catch (error) {
    console.error("Error in getEmergencyMaintenanceStats:", error)
    return {
      totalEmergencies: 0,
      criticalEmergencies: 0,
      averageResponseTime: "N/A",
      emergenciesThisMonth: 0,
    }
  }
}
