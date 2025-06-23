import { createClient } from "@/lib/supabase/client"

export interface BackupConfig {
  hotel_id: string
  backup_frequency: "daily" | "weekly" | "monthly"
  backup_time: string // HH:MM format
  include_files: boolean
  retention_days: number
  auto_backup: boolean
}

export interface BackupRecord {
  id: string
  hotel_id: string
  backup_type: "manual" | "automatic"
  status: "pending" | "in_progress" | "completed" | "failed"
  file_size: number
  created_at: string
  completed_at?: string
  error_message?: string
  download_url?: string
}

class BackupService {
  private supabase = createClient()

  async createBackup(hotelId: string, type: "manual" | "automatic" = "manual"): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from("backup_records")
        .insert({
          hotel_id: hotelId,
          backup_type: type,
          status: "pending",
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      // Start backup process
      this.processBackup(data.id, hotelId)

      return data.id
    } catch (error) {
      console.error("Error creating backup:", error)
      throw error
    }
  }

  async getBackupHistory(hotelId: string, limit = 50): Promise<BackupRecord[]> {
    try {
      const { data, error } = await this.supabase
        .from("backup_records")
        .select("*")
        .eq("hotel_id", hotelId)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error getting backup history:", error)
      return []
    }
  }

  async getBackupConfig(hotelId: string): Promise<BackupConfig | null> {
    try {
      const { data, error } = await this.supabase.from("backup_configs").select("*").eq("hotel_id", hotelId).single()

      if (error && error.code !== "PGRST116") throw error
      return data
    } catch (error) {
      console.error("Error getting backup config:", error)
      return null
    }
  }

  async updateBackupConfig(config: BackupConfig): Promise<void> {
    try {
      const { error } = await this.supabase.from("backup_configs").upsert({
        ...config,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error
    } catch (error) {
      console.error("Error updating backup config:", error)
      throw error
    }
  }

  async restoreFromBackup(backupId: string, hotelId: string): Promise<void> {
    try {
      // In a real implementation, this would restore data from backup
      console.log("Restoring from backup:", { backupId, hotelId })

      // Create restore record
      const { error } = await this.supabase.from("restore_records").insert({
        backup_id: backupId,
        hotel_id: hotelId,
        status: "in_progress",
        created_at: new Date().toISOString(),
      })

      if (error) throw error
    } catch (error) {
      console.error("Error restoring from backup:", error)
      throw error
    }
  }

  async deleteBackup(backupId: string): Promise<void> {
    try {
      const { error } = await this.supabase.from("backup_records").delete().eq("id", backupId)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting backup:", error)
      throw error
    }
  }

  private async processBackup(backupId: string, hotelId: string): Promise<void> {
    try {
      // Update status to in_progress
      await this.supabase.from("backup_records").update({ status: "in_progress" }).eq("id", backupId)

      // Simulate backup process
      const backupData = await this.collectBackupData(hotelId)
      const fileSize = JSON.stringify(backupData).length

      // In a real implementation, this would upload to cloud storage
      const downloadUrl = `https://backups.example.com/${backupId}.json`

      // Update backup record
      await this.supabase
        .from("backup_records")
        .update({
          status: "completed",
          file_size: fileSize,
          completed_at: new Date().toISOString(),
          download_url: downloadUrl,
        })
        .eq("id", backupId)
    } catch (error) {
      console.error("Error processing backup:", error)

      // Update backup record with error
      await this.supabase
        .from("backup_records")
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error",
        })
        .eq("id", backupId)
    }
  }

  private async collectBackupData(hotelId: string): Promise<any> {
    const backupData: any = {
      hotel_id: hotelId,
      timestamp: new Date().toISOString(),
      data: {},
    }

    try {
      // Collect all relevant data
      const tables = [
        "rooms",
        "reservations",
        "guests",
        "maintenance_orders",
        "cleaning_tasks",
        "room_categories",
        "pricing_rules",
        "hotel_settings",
      ]

      for (const table of tables) {
        const { data, error } = await this.supabase.from(table).select("*").eq("hotel_id", hotelId)

        if (error) {
          console.warn(`Error backing up table ${table}:`, error)
          continue
        }

        backupData.data[table] = data
      }

      return backupData
    } catch (error) {
      console.error("Error collecting backup data:", error)
      throw error
    }
  }

  async scheduleAutomaticBackups(hotelId: string): Promise<void> {
    const config = await this.getBackupConfig(hotelId)

    if (!config?.auto_backup) return

    // In a real implementation, this would integrate with a job scheduler
    console.log("Scheduling automatic backups for hotel:", hotelId, config)
  }

  async cleanupOldBackups(hotelId: string): Promise<void> {
    try {
      const config = await this.getBackupConfig(hotelId)
      if (!config) return

      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - config.retention_days)

      const { error } = await this.supabase
        .from("backup_records")
        .delete()
        .eq("hotel_id", hotelId)
        .lt("created_at", cutoffDate.toISOString())

      if (error) throw error
    } catch (error) {
      console.error("Error cleaning up old backups:", error)
    }
  }
}

export const backupService = new BackupService()
