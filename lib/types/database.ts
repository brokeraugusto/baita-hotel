// Database Types - Clean and well-structured
export type UserRole = "master_admin" | "hotel_owner" | "hotel_staff" | "guest"
export type SubscriptionStatus = "trial" | "active" | "suspended" | "cancelled" | "expired"
export type HotelStatus = "active" | "suspended" | "pending_setup" | "cancelled"
export type RoomStatus = "available" | "occupied" | "maintenance" | "cleaning" | "out_of_order"
export type ReservationStatus = "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled" | "no_show"
export type MaintenancePriority = "low" | "medium" | "high" | "urgent"
export type MaintenanceStatus = "pending" | "in_progress" | "completed" | "cancelled"
export type CleaningTaskType = "daily" | "deep" | "checkout" | "maintenance" | "inspection"
export type CleaningStatus = "pending" | "in_progress" | "completed" | "verified" | "failed"
export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded"
export type BillingCycle = "monthly" | "yearly"

export interface UserProfile {
  id: string
  email: string
  full_name: string
  phone?: string
  avatar_url?: string
  user_role: "master_admin" | "hotel_owner" | "hotel_staff" | "guest"
  is_active: boolean
  is_email_verified: boolean
  last_login_at?: string
  timezone: string
  language: string
  preferences: Record<string, any>
  created_at: string
  updated_at: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  slug: string
  description?: string
  price_monthly: number
  price_yearly?: number
  features: string[]
  limits: Record<string, any>
  max_hotels: number
  max_rooms: number
  max_users: number
  max_integrations: number
  is_active: boolean
  is_featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Hotel {
  id: string
  owner_id: string
  name: string
  slug: string
  description?: string
  address?: string
  city?: string
  state?: string
  country: string
  postal_code?: string
  phone?: string
  email?: string
  website?: string
  tax_id?: string
  status: "active" | "suspended" | "pending_setup" | "cancelled"
  settings: Record<string, any>
  branding: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  hotel_id: string
  plan_id: string
  status: SubscriptionStatus
  billing_cycle: BillingCycle
  current_price: number
  trial_ends_at?: string
  current_period_start: string
  current_period_end?: string
  cancel_at_period_end: boolean
  cancelled_at?: string
  created_at: string
  updated_at: string
  // Relations
  plan?: SubscriptionPlan
  hotel?: Hotel
}

export interface Room {
  id: string
  hotel_id: string
  room_number: string
  room_type: string
  floor?: number
  capacity: number
  base_price: number
  description?: string
  amenities: string[]
  images: string[]
  status: RoomStatus
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Guest {
  id: string
  hotel_id: string
  full_name: string
  email?: string
  phone?: string
  document_type?: string
  document_number?: string
  nationality: string
  date_of_birth?: string
  address?: string
  city?: string
  state?: string
  country: string
  postal_code?: string
  is_vip: boolean
  preferences: Record<string, any>
  notes?: string
  created_at: string
  updated_at: string
}

export interface Reservation {
  id: string
  hotel_id: string
  room_id: string
  guest_id?: string
  reservation_number: string
  check_in_date: string
  check_out_date: string
  adults: number
  children: number
  status: ReservationStatus
  total_amount: number
  paid_amount: number
  payment_status: PaymentStatus
  booking_source?: string
  special_requests?: string
  notes?: string
  created_at: string
  updated_at: string
  // Relations
  room?: Room
  guest?: Guest
}

export interface MaintenanceOrder {
  id: string
  hotel_id: string
  room_id?: string
  title: string
  description: string
  priority: MaintenancePriority
  status: MaintenanceStatus
  assigned_to?: string
  reported_by?: string
  estimated_cost?: number
  actual_cost?: number
  estimated_duration?: number
  actual_duration?: number
  scheduled_for?: string
  started_at?: string
  completed_at?: string
  notes?: string
  attachments: string[]
  created_at: string
  updated_at: string
  // Relations
  room?: Room
  assigned_user?: UserProfile
  reporter?: UserProfile
}

export interface CleaningTask {
  id: string
  hotel_id: string
  room_id: string
  task_type: CleaningTaskType
  title: string
  description?: string
  status: CleaningStatus
  assigned_to?: string
  priority: number
  estimated_duration?: number
  actual_duration?: number
  scheduled_for: string
  started_at?: string
  completed_at?: string
  verified_at?: string
  verified_by?: string
  checklist: Array<{ item: string; completed: boolean }>
  notes?: string
  images: string[]
  created_at: string
  updated_at: string
  // Relations
  room?: Room
  assigned_user?: UserProfile
  verifier?: UserProfile
}

export interface FinancialTransaction {
  id: string
  hotel_id: string
  reservation_id?: string
  subscription_id?: string
  transaction_type: string
  category?: string
  amount: number
  currency: string
  payment_method?: string
  payment_status: PaymentStatus
  description?: string
  reference_number?: string
  processed_at?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  // Relations
  reservation?: Reservation
  subscription?: Subscription
}

export interface SubscriptionPayment {
  id: string
  subscription_id: string
  amount: number
  currency: string
  payment_method?: string
  payment_status: PaymentStatus
  payment_date?: string
  due_date: string
  period_start: string
  period_end: string
  invoice_number?: string
  payment_gateway_id?: string
  failure_reason?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  // Relations
  subscription?: Subscription
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

// System Status
export interface SystemStatus {
  system_initialized: boolean
  requires_setup: boolean
  has_master_admin: boolean
  master_admin_count: number
  subscription_plans_count: number
  database_ready: boolean
  version: string
  setup_required: boolean
}

// Auth Types
export interface AuthUser {
  id: string
  email: string
  full_name: string
  user_role: "master_admin" | "hotel_owner" | "hotel_staff" | "guest"
  hotel_id?: string
  hotel_name?: string
  is_active: boolean
}

export interface AuthResult {
  success: boolean
  error?: string
}
