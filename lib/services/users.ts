import { supabase } from "@/lib/supabase"
import type { UserProfile, UserRole } from "@/types/database"

export class UsersService {
  static async getAll() {
    const { data, error } = await supabase.from("user_profiles").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data
  }

  static async getById(id: string) {
    const { data, error } = await supabase.from("user_profiles").select("*").eq("id", id).single()

    if (error) throw error
    return data
  }

  static async create(user: Omit<UserProfile, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("user_profiles").insert(user).select().single()

    if (error) throw error
    return data
  }

  static async update(id: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase.from("user_profiles").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  }

  static async updateRole(id: string, role: UserRole) {
    return this.update(id, { user_role: role })
  }

  static async activate(ids: string[]) {
    const { data, error } = await supabase.from("user_profiles").update({ is_active: true }).in("id", ids).select()

    if (error) throw error
    return data
  }

  static async deactivate(ids: string[]) {
    const { data, error } = await supabase.from("user_profiles").update({ is_active: false }).in("id", ids).select()

    if (error) throw error
    return data
  }

  static async getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

    if (error) throw error
    return data
  }
}
