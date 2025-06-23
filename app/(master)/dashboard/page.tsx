"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Building2, DollarSign, TrendingUp, Search, Plus, MoreHorizontal, Eye, Edit, Trash2, Ban } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { HotelsService } from "@/lib/services/hotels"
import { useToast } from "@/hooks/use-toast"

export default function MasterDashboard() {
  const [hotels, setHotels] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    pending_setup: 0,
    cancelled: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedHotels, setSelectedHotels] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [hotelsData, statsData] = await Promise.all([HotelsService.getAll(), HotelsService.getStats()])
      setHotels(hotelsData)
      setStats(statsData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dashboard",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSuspendHotels = async () => {
    if (selectedHotels.length === 0) return

    try {
      await HotelsService.suspend(selectedHotels)
      toast({
        title: "Sucesso",
        description: `${selectedHotels.length} hotel(s) suspenso(s) com sucesso`,
      })
      setSelectedHotels([])
      loadData()
    } catch (error) {
      console.error("Error suspending hotels:", error)
      toast({
        title: "Erro",
        description: "Erro ao suspender hotéis",
        variant: "destructive",
      })
    }
  }

  const filteredHotels = hotels.filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.owner?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      suspended: "destructive",
      pending_setup: "secondary",
      cancelled: "outline",
    } as const

    const labels = {
      active: "Ativo",
      suspended: "Suspenso",
      pending_setup: "Configuração",
      cancelled: "Cancelado",
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Master</h1>
          <p className="text-muted-foreground">Gerencie todos os hotéis e clientes da plataforma</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Hotéis</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">+{stats.pending_setup} aguardando configuração</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hotéis Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">{((stats.active / stats.total) * 100).toFixed(1)}% do total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspensos</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suspended}</div>
            <p className="text-xs text-muted-foreground">Requer atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 45.231</div>
            <p className="text-xs text-muted-foreground">+20.1% em relação ao mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Hotels Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Hotéis Cadastrados</CardTitle>
              <CardDescription>Gerencie todos os hotéis da plataforma</CardDescription>
            </div>
            <div className="flex gap-2">
              {selectedHotels.length > 0 && (
                <Button variant="destructive" onClick={handleSuspendHotels}>
                  <Ban className="mr-2 h-4 w-4" />
                  Suspender ({selectedHotels.length})
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar hotéis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedHotels.length === filteredHotels.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedHotels(filteredHotels.map((h) => h.id))
                      } else {
                        setSelectedHotels([])
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Hotel</TableHead>
                <TableHead>Proprietário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHotels.map((hotel) => (
                <TableRow key={hotel.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedHotels.includes(hotel.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedHotels([...selectedHotels, hotel.id])
                        } else {
                          setSelectedHotels(selectedHotels.filter((id) => id !== hotel.id))
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{hotel.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {hotel.city}, {hotel.state}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{hotel.owner?.full_name}</div>
                      <div className="text-sm text-muted-foreground">{hotel.owner?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(hotel.status)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{hotel.subscription?.plan?.name || "Sem plano"}</div>
                      <div className="text-sm text-muted-foreground">
                        R$ {hotel.subscription?.plan?.price_monthly || 0}/mês
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(hotel.created_at).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Ban className="mr-2 h-4 w-4" />
                          Suspender
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
