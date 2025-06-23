// Simulação de banco de dados local para demonstração
export interface User {
  id: string
  email: string
  password: string
  name: string
  type: "client" | "master_admin"
  hotel_name?: string
  phone?: string
  address?: string
  rooms_count?: number
  plan?: string
  status: "active" | "suspended" | "pending"
  created_at: string
  updated_at: string
}

// Base de dados inicial com usuário master admin
const INITIAL_USERS: User[] = [
  {
    id: "master-001",
    email: "admin@baitahotel.com",
    password: "masteradmin123",
    name: "Master Administrator",
    type: "master_admin",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "client-001",
    email: "hotel@exemplo.com",
    password: "cliente123",
    name: "João Silva",
    type: "client",
    hotel_name: "Hotel Exemplo",
    phone: "(11) 99999-9999",
    address: "Rua das Flores, 123 - São Paulo, SP",
    rooms_count: 50,
    plan: "professional",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

class DatabaseService {
  private users: User[] = []

  constructor() {
    this.loadUsers()
  }

  private loadUsers() {
    const savedUsers = localStorage.getItem("baitahotel_users_db")
    if (savedUsers) {
      try {
        this.users = JSON.parse(savedUsers)
      } catch (error) {
        console.error("Erro ao carregar usuários:", error)
        this.users = [...INITIAL_USERS]
        this.saveUsers()
      }
    } else {
      this.users = [...INITIAL_USERS]
      this.saveUsers()
    }
  }

  private saveUsers() {
    localStorage.setItem("baitahotel_users_db", JSON.stringify(this.users))
  }

  // Buscar usuário por email e senha
  findUserByCredentials(email: string, password: string, type?: "client" | "master_admin"): User | null {
    return (
      this.users.find((user) => {
        const emailMatch = user.email === email
        const passwordMatch = user.password === password
        const typeMatch = !type || user.type === type
        const isActive = user.status === "active"
        return emailMatch && passwordMatch && typeMatch && isActive
      }) || null
    )
  }

  // Buscar usuário por email
  findUserByEmail(email: string): User | null {
    return this.users.find((user) => user.email === email) || null
  }

  // Buscar usuário por ID
  findUserById(id: string): User | null {
    return this.users.find((user) => user.id === id) || null
  }

  // Criar novo usuário
  createUser(userData: Omit<User, "id" | "created_at" | "updated_at">): User {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    this.users.push(newUser)
    this.saveUsers()
    return newUser
  }

  // Atualizar usuário
  updateUser(id: string, updates: Partial<User>): User | null {
    const userIndex = this.users.findIndex((user) => user.id === id)
    if (userIndex === -1) return null

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    }

    this.saveUsers()
    return this.users[userIndex]
  }

  // Deletar usuário
  deleteUser(id: string): boolean {
    const userIndex = this.users.findIndex((user) => user.id === id)
    if (userIndex === -1) return false

    this.users.splice(userIndex, 1)
    this.saveUsers()
    return true
  }

  // Listar todos os usuários (apenas para master admin)
  getAllUsers(): User[] {
    return this.users
  }

  // Listar apenas clientes
  getClients(): User[] {
    return this.users.filter((user) => user.type === "client")
  }

  // Estatísticas
  getStats() {
    const totalUsers = this.users.length
    const activeClients = this.users.filter((user) => user.type === "client" && user.status === "active").length
    const suspendedClients = this.users.filter((user) => user.type === "client" && user.status === "suspended").length
    const pendingClients = this.users.filter((user) => user.type === "client" && user.status === "pending").length

    return {
      totalUsers,
      activeClients,
      suspendedClients,
      pendingClients,
    }
  }
}

// Instância singleton do banco de dados
export const database = new DatabaseService()
