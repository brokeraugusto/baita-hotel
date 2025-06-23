import { unifiedAuthService } from "@/lib/auth/unified-auth-service"

export interface Client {
  id: string
  email: string
  full_name: string
  phone?: string
  is_active: boolean
  created_at: string
  updated_at: string
  hotel?: {
    id: string
    name: string
    status: string
    city?: string
    state?: string
    country: string
  }
  subscription?: {
    id: string
    status: string
    current_price: number
    trial_ends_at?: string
    plan?: {
      id: string
      name: string
      price_monthly: number
    }
  }
}

export interface CreateClientData {
  email: string
  password: string
  fullName: string
  hotelName: string
  planSlug?: string
}

class ClientsService {
  async getAllClients(): Promise<{ success: boolean; data?: Client[]; error?: string }> {
    return await unifiedAuthService.getAllClients()
  }

  async createClient(data: CreateClientData): Promise<{ success: boolean; error?: string }> {
    return await unifiedAuthService.createClient(
      data.email,
      data.password,
      data.fullName,
      data.hotelName,
      data.planSlug || "starter",
    )
  }

  async suspendClient(clientId: string): Promise<{ success: boolean; error?: string }> {
    return await unifiedAuthService.suspendClient(clientId)
  }

  async activateClient(clientId: string): Promise<{ success: boolean; error?: string }> {
    return await unifiedAuthService.activateClient(clientId)
  }

  generateTemporaryPassword(): string {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"
    let password = ""
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }
}

export const clientsService = new ClientsService()
