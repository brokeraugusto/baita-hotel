"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, Filter } from "lucide-react"

export function ClientsFilters() {
  const [filters, setFilters] = useState({
    search: "",
    plan: "all", // Updated default value
    status: "all", // Updated default value
    revenue: "all", // Updated default value
  })

  const [showFilters, setShowFilters] = useState(false)

  const handleClearFilters = () => {
    setFilters({
      search: "",
      plan: "all", // Updated default value
      status: "all", // Updated default value
      revenue: "all", // Updated default value
    })
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou hotel..."
                className="pl-8"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-muted" : ""}
            >
              <Filter className="h-4 w-4" />
            </Button>
            {(filters.search !== "" ||
              filters.plan !== "all" ||
              filters.status !== "all" ||
              filters.revenue !== "all") && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpar Filtros
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Select value={filters.plan} onValueChange={(value) => setFilters({ ...filters, plan: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os planos</SelectItem>
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="professional">Profissional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="suspended">Suspenso</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filters.revenue} onValueChange={(value) => setFilters({ ...filters, revenue: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por receita" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as receitas</SelectItem>
                    <SelectItem value="low">Até R$ 5.000</SelectItem>
                    <SelectItem value="medium">R$ 5.000 - R$ 20.000</SelectItem>
                    <SelectItem value="high">Acima de R$ 20.000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
