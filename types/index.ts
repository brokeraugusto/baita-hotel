import type React from "react"
import type { Database } from "@/lib/supabase/database.types"

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T]

export interface ServiceOrder {
  id: string
  description: string
  status: string
  priority?: string
  createdAt: string
  updatedAt?: string
  roomId?: string
  technicianId?: string
  categoryId?: string
  estimatedCost?: number
  actualCost?: number
  scheduledDate?: string
  completedDate?: string
  notes?: string
  location?: string // Added for maintenance orders
}

export interface MaintenanceCategory {
  id: string
  name: string
  description?: string
  color?: string
}

export interface MaintenanceTechnician {
  id: string
  name: string
  email?: string
  phone?: string
  specialties?: string[]
  isActive: boolean
}

export interface Room {
  id: string
  number: string
  type: string
  status: string
  floor?: number
  capacity?: number
}

// New/Updated Types for Cleaning Module
export type CleaningPersonnel = Database["public"]["Tables"]["cleaning_personnel"]["Row"] & {
  specialties?: string[] | null
}
export type CleaningTask = Database["public"]["Tables"]["cleaning_tasks"]["Row"]

export type CleaningPersonnelInsert = Database["public"]["Tables"]["cleaning_personnel"]["Insert"]
export type CleaningPersonnelUpdate = Database["public"]["Tables"]["cleaning_personnel"]["Update"]

export type CleaningTaskInsert = Database["public"]["Tables"]["cleaning_tasks"]["Insert"]
export type CleaningTaskUpdate = Database["public"]["Tables"]["cleaning_tasks"]["Update"]

// Utility types for common data structures
export type Hotel = Database["public"]["Tables"]["hotels"]["Row"]

// Maintenance Module Types (from previous context, ensuring consistency)
export type MaintenanceOrder = Database["public"]["Tables"]["maintenance_orders"]["Row"]

export type MaintenanceOrderInsert = Database["public"]["Tables"]["maintenance_orders"]["Insert"]
export type MaintenanceOrderUpdate = Database["public"]["Tables"]["maintenance_orders"]["Update"]

// Add color property to MaintenanceCategory for UI consistency
export type MaintenanceCategoryWithColor = Database["public"]["Tables"]["maintenance_categories"]["Row"] & {
  color?: string // Adicionado para consistência com o frontend
}

// Add specialties property to MaintenanceTechnician for UI consistency
export type MaintenanceTechnicianWithSpecialties = MaintenanceTechnician & {
  specialties?: string[]
}

// General types for common UI patterns
export type SelectOption = {
  value: string
  label: string
  icon?: React.ElementType
}

export type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

export type FilterOption = {
  value: string
  label: string
}

export type SortOption = {
  value: string
  label: string
}

// Interface for Room Status in Cleaning Module
export interface RoomStatus {
  id: string
  number: string
  status: string // e.g., 'clean', 'dirty', 'cleaning', 'inspected', 'maintenance'
  lastCleaned?: string // e.g., "10:30", "Ontem"
  assignee?: string // Name of the assigned personnel
}

export type MaintenanceCategoryInsert = Database["public"]["Tables"]["maintenance_categories"]["Insert"]

export type MaintenanceTechnicianInsert = Database["public"]["Tables"]["maintenance_technicians"]["Insert"]

export type MaintenanceTemplate = Database["public"]["Tables"]["maintenance_templates"]["Row"]
export type MaintenanceTemplateInsert = Database["public"]["Tables"]["maintenance_templates"]["Insert"]
export type MaintenanceTemplateUpdate = Database["public"]["Tables"]["maintenance_templates"]["Update"]

// Tipos para Quartos (existentes, mas garantindo que estão aqui)
export type RoomInsert = Database["public"]["Tables"]["rooms"]["Insert"]
export type RoomUpdate = Database["public"]["Tables"]["rooms"]["Update"]

// Tipos para Hotéis (existentes)
export type HotelInsert = Database["public"]["Tables"]["hotels"]["Insert"]
export type HotelUpdate = Database["public"]["Tables"]["hotels"]["Update"]

// Tipos para Perfil (existentes)
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"]
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"]

// Tipos para Reservas (existentes)
export type Reservation = Database["public"]["Tables"]["reservations"]["Row"]
export type ReservationInsert = Database["public"]["Tables"]["reservations"]["Insert"]
export type ReservationUpdate = Database["public"]["Tables"]["reservations"]["Update"]

// Tipos para Hóspedes (existentes)
export type Guest = Database["public"]["Tables"]["guests"]["Row"]
export type GuestInsert = Database["public"]["Tables"]["guests"]["Insert"]
export type GuestUpdate = Database["public"]["Tables"]["guests"]["Update"]

// Tipos para Planos (existentes)
export type Plan = Database["public"]["Tables"]["plans"]["Row"]
export type PlanInsert = Database["public"]["Tables"]["plans"]["Insert"]
export type PlanUpdate = Database["public"]["Tables"]["plans"]["Update"]

// Tipos para Transações Financeiras (existentes)
export type FinancialTransaction = Database["public"]["Tables"]["financial_transactions"]["Row"]
export type FinancialTransactionInsert = Database["public"]["Tables"]["financial_transactions"]["Insert"]
export type FinancialTransactionUpdate = Database["public"]["Tables"]["financial_transactions"]["Update"]

// Tipos para Despesas (existentes)
export type Expense = Database["public"]["Tables"]["expenses"]["Row"]
export type ExpenseInsert = Database["public"]["Tables"]["expenses"]["Insert"]
export type ExpenseUpdate = Database["public"]["Tables"]["expenses"]["Update"]

// Tipos para Categorias de Acomodação (existentes)
export type AccommodationCategory = Database["public"]["Tables"]["accommodation_categories"]["Row"]
export type AccommodationCategoryInsert = Database["public"]["Tables"]["accommodation_categories"]["Insert"]
export type AccommodationCategoryUpdate = Database["public"]["Tables"]["accommodation_categories"]["Update"]

// Tipos para Comodidades (existentes)
export type Amenity = Database["public"]["Tables"]["amenities"]["Row"]
export type AmenityInsert = Database["public"]["Tables"]["amenities"]["Insert"]
export type AmenityUpdate = Database["public"]["Tables"]["amenities"]["Update"]

// Tipos para Períodos Tarifários (existentes)
export type PricingPeriod = Database["public"]["Tables"]["pricing_periods"]["Row"]
export type PricingPeriodInsert = Database["public"]["Tables"]["pricing_periods"]["Insert"]
export type PricingPeriodUpdate = Database["public"]["Tables"]["pricing_periods"]["Update"]

// Tipos para Regras de Preço (existentes)
export type PricingRule = Database["public"]["Tables"]["pricing_rules"]["Row"]
export type PricingRuleInsert = Database["public"]["Tables"]["pricing_rules"]["Insert"]
export type PricingRuleUpdate = Database["public"]["Tables"]["pricing_rules"]["Update"]
