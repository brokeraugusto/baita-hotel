"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/lib/services/auth-service"
import { simpleAuth, type SimpleUser } from "@/lib/auth/simple-auth"

interface DashboardStats {
  totalHotels: number
  activeHotels: number
  totalUsers: number
  monthlyRevenue: number
}

export default function MasterDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalHotels: 0,
    activeHotels: 0,
    totalUsers: 0,
    monthlyRevenue: 0,
  })
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false)
  const [isCreatingClient, setIsCreatingClient] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const [user, setUser] = useState<SimpleUser | null>(null)
  const router = useRouter()

  const [clientForm, setClientForm] = useState({
    email: "",
    password: "",
    fullName: "",
    hotelName: "",
    planSlug: "starter",
  })

  useEffect(() => {
    loadDashboardData()
    const currentUser = simpleAuth.getCurrentUser()
    setUser(currentUser)
  }, [])

  const loadDashboardData = async () => {
    // For now, use mock data - implement real API calls later
    setStats({
      totalHotels: 12,
      activeHotels: 10,
      totalUsers: 45,
      monthlyRevenue: 15420.5,
    })
  }

  const handleCreateClient = async () => {
    if (!clientForm.email || !clientForm.password || !clientForm.fullName || !clientForm.hotelName) {
      toast({
        title: "Erro de validação",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      })
      return
    }

    setIsCreatingClient(true)

    try {
      const result = await authService.createClientUser(
        clientForm.email,
        clientForm.password,
        clientForm.fullName,
        clientForm.hotelName,
        clientForm.planSlug,
      )

      if (result.success) {
        toast({
          title: "Cliente criado com sucesso!",
          description: `Hotel ${clientForm.hotelName} foi configurado`,
        })
        setIsCreateClientOpen(false)
        setClientForm({
          email: "",
          password: "",
          fullName: "",
          hotelName: "",
          planSlug: "starter",
        })
        loadDashboardData()
      } else {
        toast({
          title: "Erro ao criar cliente",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Falha ao criar cliente",
        variant: "destructive",
      })
    } finally {
      setIsCreatingClient(false)
    }
  }

  const handleSignOut = async () => {
    await simpleAuth.signOut()
    router.replace("/login")
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard Master Admin</h1>
          <Button onClick={handleSignOut} variant="outline">
            Sair
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo!</CardTitle>
            <CardDescription>Você está logado como Master Administrator</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Nome:</strong> {user?.full_name}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Função:</strong> {user?.user_role}
              </p>
              <p>
                <strong>Status:</strong> {user?.is_active ? "Ativo" : "Inativo"}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Gerencie os hotéis cadastrados na plataforma</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Planos</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Configure os planos de assinatura</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Relatórios</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Visualize relatórios da plataforma</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
