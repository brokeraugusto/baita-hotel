import { supabase } from "@/lib/supabase"
import type { Hotel, HotelStatus } from "@/types/database"

export class HotelsService {
  static async getAll() {
    const { data, error } = await supabase
      .from("hotels")
      .select(`
      *,
      owner:user_profiles!hotels_owner_id_fkey(full_name, email),
      subscriptions!inner(
        status,
        subscription_plans!inner(name, price_monthly)
      )
    `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching hotels:", error)
      throw error
    }
    return data
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from("hotels")
      .select(`
      *,
      owner:user_profiles!hotels_owner_id_fkey(*),
      subscriptions!inner(*),
      rooms(count),
      reservations(count)
    `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching hotel:", error)
      throw error
    }
    return data
  }

  static async create(hotel: Omit<Hotel, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("hotels").insert(hotel).select().single()

    if (error) throw error
    return data
  }

  static async update(id: string, updates: Partial<Hotel>) {
    const { data, error } = await supabase.from("hotels").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  }

  static async updateStatus(id: string, status: HotelStatus) {
    return this.update(id, { status })
  }

  static async suspend(ids: string[]) {
    const { data, error } = await supabase.from("hotels").update({ status: "suspended" }).in("id", ids).select()

    if (error) throw error
    return data
  }

  static async delete(id: string) {
    const { error } = await supabase.from("hotels").delete().eq("id", id)

    if (error) throw error
  }

  static async getStats() {
    const { data: hotels, error } = await supabase.from("hotels").select("status")

    if (error) throw error

    const stats = hotels.reduce(
      (acc, hotel) => {
        acc[hotel.status] = (acc[hotel.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      total: hotels.length,
      active: stats.active || 0,
      suspended: stats.suspended || 0,
      pending_setup: stats.pending_setup || 0,
      cancelled: stats.cancelled || 0,
    }
  }
}
