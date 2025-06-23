export interface Guest {
  id: string
  name: string
  email: string
  phone: string
  document: string
  address: string
  city: string
  state: string
  country: string
  birthdate: string
  nationality: string
  gender: string
  status: "active" | "inactive"
  tags: string[]
  lastStay: string
  totalStays: number
  totalSpent: number
  notes?: string
  vip: boolean
}

interface GuestCreateData {
  name: string
  email: string
  phone: string
  document: string
  address: string
  city: string
  state: string
  country: string
  birthdate: string
  nationality: string
  gender: string
  tags: string[]
  notes?: string
  vip: boolean
}

// Mock data for initial development
const initialGuests: Guest[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@email.com",
    phone: "(11) 99999-8888",
    document: "123.456.789-00",
    address: "Rua das Flores, 123",
    city: "São Paulo",
    state: "SP",
    country: "Brasil",
    birthdate: "1985-05-15",
    nationality: "Brasileira",
    gender: "Masculino",
    status: "active",
    tags: ["business", "vip"],
    lastStay: "2024-05-20",
    totalStays: 8,
    totalSpent: 12450,
    notes: "Prefere quartos silenciosos. Alérgico a penas.",
    vip: true,
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    phone: "(21) 98765-4321",
    document: "987.654.321-00",
    address: "Av. Atlântica, 500",
    city: "Rio de Janeiro",
    state: "RJ",
    country: "Brasil",
    birthdate: "1990-10-22",
    nationality: "Brasileira",
    gender: "Feminino",
    status: "active",
    tags: ["leisure", "family"],
    lastStay: "2024-06-01",
    totalStays: 3,
    totalSpent: 5200,
    vip: false,
  },
  {
    id: "3",
    name: "Carlos Oliveira",
    email: "carlos.oliveira@email.com",
    phone: "(31) 97777-6666",
    document: "456.789.123-00",
    address: "Rua da Paz, 45",
    city: "Belo Horizonte",
    state: "MG",
    country: "Brasil",
    birthdate: "1978-03-10",
    nationality: "Brasileira",
    gender: "Masculino",
    status: "inactive",
    tags: ["business"],
    lastStay: "2023-11-15",
    totalStays: 5,
    totalSpent: 8750,
    notes: "Sempre solicita late check-out.",
    vip: false,
  },
  {
    id: "4",
    name: "Ana Costa",
    email: "ana.costa@email.com",
    phone: "(41) 96666-5555",
    document: "321.654.987-00",
    address: "Rua das Araucárias, 200",
    city: "Curitiba",
    state: "PR",
    country: "Brasil",
    birthdate: "1992-07-30",
    nationality: "Brasileira",
    gender: "Feminino",
    status: "active",
    tags: ["leisure", "vip", "repeat"],
    lastStay: "2024-05-28",
    totalStays: 12,
    totalSpent: 18900,
    notes: "Cliente fidelizada. Prefere quartos com vista.",
    vip: true,
  },
  {
    id: "5",
    name: "Roberto Almeida",
    email: "roberto.almeida@email.com",
    phone: "(51) 95555-4444",
    document: "789.123.456-00",
    address: "Av. Independência, 1000",
    city: "Porto Alegre",
    state: "RS",
    country: "Brasil",
    birthdate: "1980-12-05",
    nationality: "Brasileira",
    gender: "Masculino",
    status: "active",
    tags: ["business", "repeat"],
    lastStay: "2024-04-10",
    totalStays: 7,
    totalSpent: 9800,
    vip: false,
  },
]

// In-memory storage for development
const guestsData = [...initialGuests]

export const guestsService = {
  // Get all guests
  getGuests: async (): Promise<Guest[]> => {
    try {
      // In a real implementation, this would fetch from Supabase
      // const { data, error } = await supabaseClient.from('guests').select('*')
      // if (error) throw error
      // return data

      // For development, return mock data with a delay to simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      return guestsData
    } catch (error) {
      console.error("Error fetching guests:", error)
      throw new Error("Failed to fetch guests")
    }
  },

  // Get a single guest by ID
  getGuestById: async (id: string): Promise<Guest | null> => {
    try {
      // In a real implementation, this would fetch from Supabase
      // const { data, error } = await supabaseClient.from('guests').select('*').eq('id', id).single()
      // if (error) throw error
      // return data

      // For development, return mock data
      await new Promise((resolve) => setTimeout(resolve, 300))
      const guest = guestsData.find((g) => g.id === id)
      return guest || null
    } catch (error) {
      console.error(`Error fetching guest with ID ${id}:`, error)
      throw new Error("Failed to fetch guest")
    }
  },

  // Create a new guest
  createGuest: async (guestData: GuestCreateData): Promise<Guest> => {
    try {
      // In a real implementation, this would insert into Supabase
      // const { data, error } = await supabaseClient.from('guests').insert([guestData]).select().single()
      // if (error) throw error
      // return data

      // For development, add to mock data
      await new Promise((resolve) => setTimeout(resolve, 800))

      const newGuest: Guest = {
        id: Date.now().toString(),
        name: guestData.name,
        email: guestData.email,
        phone: guestData.phone,
        document: guestData.document,
        address: guestData.address,
        city: guestData.city,
        state: guestData.state,
        country: guestData.country,
        birthdate: guestData.birthdate,
        nationality: guestData.nationality,
        gender: guestData.gender,
        status: "active",
        tags: guestData.tags,
        lastStay: new Date().toISOString().split("T")[0],
        totalStays: 1,
        totalSpent: 0,
        notes: guestData.notes,
        vip: guestData.vip,
      }

      guestsData.push(newGuest)
      return newGuest
    } catch (error) {
      console.error("Error creating guest:", error)
      throw new Error("Failed to create guest")
    }
  },

  // Update an existing guest
  updateGuest: async (id: string, guestData: GuestCreateData): Promise<Guest> => {
    try {
      // In a real implementation, this would update in Supabase
      // const { data, error } = await supabaseClient.from('guests').update(guestData).eq('id', id).select().single()
      // if (error) throw error
      // return data

      // For development, update mock data
      await new Promise((resolve) => setTimeout(resolve, 800))

      const guestIndex = guestsData.findIndex((g) => g.id === id)
      if (guestIndex === -1) {
        throw new Error("Guest not found")
      }

      const updatedGuest: Guest = {
        ...guestsData[guestIndex],
        name: guestData.name,
        email: guestData.email,
        phone: guestData.phone,
        document: guestData.document,
        address: guestData.address,
        city: guestData.city,
        state: guestData.state,
        country: guestData.country,
        birthdate: guestData.birthdate,
        nationality: guestData.nationality,
        gender: guestData.gender,
        tags: guestData.tags,
        notes: guestData.notes,
        vip: guestData.vip,
      }

      guestsData[guestIndex] = updatedGuest
      return updatedGuest
    } catch (error) {
      console.error(`Error updating guest with ID ${id}:`, error)
      throw new Error("Failed to update guest")
    }
  },

  // Delete a guest
  deleteGuest: async (id: string): Promise<void> => {
    try {
      // In a real implementation, this would delete from Supabase
      // const { error } = await supabaseClient.from('guests').delete().eq('id', id)
      // if (error) throw error

      // For development, remove from mock data
      await new Promise((resolve) => setTimeout(resolve, 600))

      const guestIndex = guestsData.findIndex((g) => g.id === id)
      if (guestIndex === -1) {
        throw new Error("Guest not found")
      }

      guestsData.splice(guestIndex, 1)
    } catch (error) {
      console.error(`Error deleting guest with ID ${id}:`, error)
      throw new Error("Failed to delete guest")
    }
  },

  // Toggle guest VIP status
  toggleVipStatus: async (id: string, isVip: boolean): Promise<Guest> => {
    try {
      // In a real implementation, this would update in Supabase
      // const { data, error } = await supabaseClient.from('guests').update({ vip: isVip }).eq('id', id).select().single()
      // if (error) throw error
      // return data

      // For development, update mock data
      await new Promise((resolve) => setTimeout(resolve, 300))

      const guestIndex = guestsData.findIndex((g) => g.id === id)
      if (guestIndex === -1) {
        throw new Error("Guest not found")
      }

      guestsData[guestIndex].vip = isVip
      return guestsData[guestIndex]
    } catch (error) {
      console.error(`Error updating VIP status for guest with ID ${id}:`, error)
      throw new Error("Failed to update VIP status")
    }
  },

  // Toggle guest active status
  toggleActiveStatus: async (id: string, isActive: boolean): Promise<Guest> => {
    try {
      // In a real implementation, this would update in Supabase
      // const { data, error } = await supabaseClient.from('guests').update({ status: isActive ? 'active' : 'inactive' }).eq('id', id).select().single()
      // if (error) throw error
      // return data

      // For development, update mock data
      await new Promise((resolve) => setTimeout(resolve, 300))

      const guestIndex = guestsData.findIndex((g) => g.id === id)
      if (guestIndex === -1) {
        throw new Error("Guest not found")
      }

      guestsData[guestIndex].status = isActive ? "active" : "inactive"
      return guestsData[guestIndex]
    } catch (error) {
      console.error(`Error updating active status for guest with ID ${id}:`, error)
      throw new Error("Failed to update active status")
    }
  },
}
