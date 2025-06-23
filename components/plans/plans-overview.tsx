"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, CreditCard, AlertCircle, Loader2 } from "lucide-react"
import { plansService } from "@/lib/services/plans-service"

interface PlanStats {
  totalPlans: number
  activePlans: number
  featuredPlans: number
  totalRevenue: number
  averagePrice: number
}

export function PlansOverview() {
  const [stats, setStats] = useState<PlanStats>({
    totalPlans: 0,
    activePlans: 0,
    featuredPlans: 0,
    totalRevenue: 0,
    averagePrice: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    setError(null)

    try {
      const plans = await plansService.getAll()

      const totalPlans = plans.length
      const activePlans = plans.filter((p) => p.is_active).length
      const featuredPlans = plans.filter((p) => p.is_featured).length
      const totalRevenue = plans.reduce((sum, plan) => sum + plan.price_monthly, 0)
      const averagePrice = totalPlans > 0 ? totalRevenue / totalPlans : 0

      setStats({
        totalPlans,
        activePlans,
        featuredPlans,
        totalRevenue,
        averagePrice,
      })
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
      setError("Erro ao carregar estatísticas dos planos")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carregando...</CardTitle>
              <Loader2 className="h-4 w-4 animate-spin" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Planos</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPlans}</div>
          <p className="text-xs text-muted-foreground">{stats.activePlans} ativos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Planos Ativos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.activePlans}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalPlans > 0 ? Math.round((stats.activePlans / stats.totalPlans) * 100) : 0}% do total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Planos em Destaque</CardTitle>
          <Badge variant="secondary" className="h-4 w-4 p-0">
            ★
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{stats.featuredPlans}</div>
          <p className="text-xs text-muted-foreforeground">Promovidos na página principal</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Potencial</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Média: R$ {stats.averagePrice.toFixed(2)}/mês</p>
        </CardContent>
      </Card>
    </div>
  )
}
